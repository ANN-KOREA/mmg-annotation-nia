# -*- coding: utf-8 -*-
from sqlalchemy.sql import text
import logging


logger = logging.getLogger('logger.default')


def user(db_session, param):

    query_str = """SELECT user_id, login_name, passwd, nickname,
                          access_token, expiry
                     FROM user_info
                    WHERE enabled=1"""

    if "user_id" in param:
            appendant = "  AND `user_id`=:user_id"
            query_str = "%s %s" % (query_str, appendant)

    if "login_name" in param:
            appendant = "  AND `login_name`=:login_name"
            query_str = "%s %s" % (query_str, appendant)

    if "passwd" in param:
            appendant = "  AND `passwd`=:passwd"
            query_str = "%s %s" % (query_str, appendant)

    sql = text(query_str)
    result = db_session.execute(sql, param).fetchone()

    return result


def jwt_info(db_session, param):

    query_str = """SELECT user_id, access_token, expiry
                     FROM user_info
                    WHERE user_id=:user_id
                """

    sql = text(query_str)
    result = db_session.execute(sql, param).fetchone()

    return result


def update_access_token(db_session, param):
    result = "F"

    query_str = """UPDATE user_info
                      SET access_token=:access_token,
                          expiry=:expiry,
                          modified_at = NOW()
                    WHERE user_id=:user_id
                """

    query = text(query_str)
    result = db_session.execute(query, param)
    affected_rows = result.rowcount

    if affected_rows > 0:
        result = "S"

    return result
