# -*- coding: utf-8 -*-
import logging
import jsonstruct

from django.http import HttpResponse
from django.template import loader
from django.views.decorators.http import require_http_methods

import apps.auth.service as auth_service
from apps.common.constant.etc import HttpRequest

logger = logging.getLogger("logger.default")


@require_http_methods(["GET"])
def login_page(request):
    template = loader.get_template("auth/login_page.html")
    return HttpResponse(template.render(request))


@require_http_methods(["POST"])
def login(request):
    result = "F"
    access_token = auth_service.login(request)

    if access_token:
        result = "S"

    return_data = {"result": result}

    response = HttpResponse(jsonstruct.encode(return_data), \
            content_type=HttpRequest.CONTENT_TYPE_JSON_UTF8)

    if access_token:
        response["Authorization"] = access_token

    return response


@require_http_methods(["POST"])
@auth_service.jwt_required
def logout(request):
    auth_service.logout(request)

    return HttpResponse(jsonstruct.encode({}), content_type=HttpRequest.CONTENT_TYPE_JSON_UTF8)
