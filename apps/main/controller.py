# -*- coding: utf-8 -*-
import logging
import json

import jsonstruct
from django.http import HttpResponse
from django.template import loader
from django.views.decorators.http import require_http_methods

from apps.common.constant.etc import HttpRequest
import apps.main.service as main_service
import apps.auth.service as auth_service

LOGGER = logging.getLogger("logger.default")


@require_http_methods(["GET"])
@auth_service.jwt_required
def root(request):
    param = {"user_id": request.user.user_id}
    case_info = main_service.last_case(param)

    context = {"case_info": jsonstruct.encode(case_info)}
    template = loader.get_template("main/root.html")

    return HttpResponse(template.render(context, request))


@require_http_methods(["GET"])
@auth_service.jwt_required
def current(request):
    param = {"user_id": request.user.user_id}
    case_info = main_service.last_case(param)

    return HttpResponse(jsonstruct.encode(case_info), content_type=HttpRequest.CONTENT_TYPE_JSON_UTF8)


@auth_service.jwt_required
@require_http_methods(["POST"])
def prev_or_next(request):
    json_payload = json.loads(request.body)

    case_info = json_payload["case_info"]
    case_info.update({"user_id": request.user.user_id})

    query = json_payload["query"]
    query.update({"user_id": request.user.user_id})

    if "greater_than" in query:
        case_info = main_service.next_case(case_info, query)

    elif "less_than" in query:
        case_info = main_service.prev_case(case_info, query)

    context = {"case_info": case_info}

    return HttpResponse(jsonstruct.encode(context), content_type=HttpRequest.CONTENT_TYPE_JSON_UTF8)
