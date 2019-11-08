import datetime
import jwt
import Cookie
import logging
from django.http import HttpResponseServerError

import dao
from apps.common.db import session_manager
from auth.exception import JWTError
from apps.util import security as sec_util


JWT_SECRET = "coldbrew"
JWT_ALGORITHM = "HS256"
DATETIME_FORMAT_STR = "%Y-%m-%d %H:%M:%S"
TOKEN_KEY_NAME = "dct_access_token"

LOGGER = logging.getLogger("logger.default")


class User(object):
    pass


def create_or_refresh_jwt(user):

    LOGGER.info("creating(refreshing) new token: user_id - %d (%s)",
                user.user_id, user.nickname)
    secret = JWT_SECRET
    algorithm = JWT_ALGORITHM

    expiry = datetime.datetime.today() + datetime.timedelta(hours=4)
    expiry = expiry.strftime(DATETIME_FORMAT_STR)

    payload = {"user_id": user.user_id, "expiry": expiry,
               "nickname": user.nickname }

    access_token = jwt.encode(payload, secret, algorithm=algorithm)

    with session_manager.session_scope() as db_session:
        dao.update_access_token(db_session,
                            {"user_id": user.user_id,
                             "expiry": expiry,
                             "access_token": access_token})

    return access_token


def login(request):
    access_token = None

    login_name = request.POST.get("login_name")
    passwd = sec_util.encode_sha256(request.POST.get("passwd"))

    param = {"login_name": login_name, "passwd": passwd}

    searched_user = None

    with session_manager.session_scope() as db_session:
        searched_user = dao.user(db_session, param)

    if searched_user:
        if searched_user.access_token:
            access_token = searched_user.access_token

            dec_payload = decode_jwt_payload(access_token)
            expire_at = datetime.datetime.strptime(dec_payload["expiry"], "%Y-%m-%d %H:%M:%S")

            time_until_exp = expire_at - datetime.datetime.now()

            if time_until_exp < datetime.timedelta(minutes=3):
                access_token = create_or_refresh_jwt(searched_user)

        else:
            access_token = create_or_refresh_jwt(searched_user)

    return access_token


def logout(request):
    result = "F"
    # with session_manager.session_scope() as db_session:
    #     result = dao.update_access_token(db_session, {"user_id": request.user.user_id,
    #             "expiry": None, "access_token": None
    #     })
    result = "S"

    return result


def parse_request(request):
    access_token = request.META.get('HTTP_AUTHORIZATION', None)

    if not access_token:
        cookie = Cookie.SmartCookie()
        if 'HTTP_COOKIE' in request.META:
            cookie.load(request.META['HTTP_COOKIE'])

            if TOKEN_KEY_NAME in cookie:
                access_token = cookie[TOKEN_KEY_NAME].value

    if not access_token:
        raise JWTError('No token found', 'Access token is missing in the request header')

    return access_token


def decode_jwt_payload(jwt_payload):
    secret = JWT_SECRET
    algorithm = JWT_ALGORITHM

    dec_payload = None

    try:
        dec_payload = jwt.decode(jwt_payload, secret, algorithms=[algorithm])

    except Exception:
        raise JWTError("JWT Decryiption Error",
                       "Exception has been thrown while decrypting the token.")

    return dec_payload


def verify_token(jwt_payload):
    LOGGER.info("verifying token received from client: %s", jwt_payload)
    dec_payload = decode_jwt_payload(jwt_payload)

    if "user_id" not in dec_payload or \
       "nickname" not in dec_payload or \
       "expiry" not in dec_payload:

        raise JWTError("JWT Verification Error", "Token has been corrupted.")

    with session_manager.session_scope() as db_session:
        jwt_info = dao.jwt_info(db_session, {"user_id": dec_payload["user_id"]})

        if not jwt_info or jwt_info.access_token != jwt_payload:
            raise JWTError("Permission Denied", "You are not properly logged in.")


    expire_at = datetime.datetime.strptime(dec_payload["expiry"], "%Y-%m-%d %H:%M:%S")

    time_until_exp = expire_at - datetime.datetime.now()

    if time_until_exp < datetime.timedelta(0):
         raise JWTError("TOKEN EXPIRED", "JWT Token has been expired.")

    refreshed_token = None

    user = User()
    user.user_id = dec_payload["user_id"]
    user.nickname = dec_payload["nickname"]

    if time_until_exp < datetime.timedelta(minutes=3):
        refreshed_token = create_or_refresh_jwt(user)

    return user, refreshed_token


def validate(request):
    refreshed_token = None

    jwt_payload = parse_request(request)

    if jwt_payload:
        user, refreshed_token = verify_token(jwt_payload)

    return user, refreshed_token


# auth filter decorator for controller
def jwt_required(controller_function):
    def wrapper(*args, **kwargs):
        user, refreshed_token = validate(args[0])

        if user:
            args[0].user = user

            try:
                resp = controller_function(*args, **kwargs)

            except Exception as e:
                # LOGGER.error(e)
                resp = HttpResponseServerError("<h1>Server Error (500)</h1>")
                raise

            finally:
                if refreshed_token:
                    resp["Authorization"] = refreshed_token
                    resp.set_cookie(TOKEN_KEY_NAME, refreshed_token)

        return resp

    return wrapper
