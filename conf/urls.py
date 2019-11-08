"""URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/dev/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
import urllib

from django.conf.urls import url, include
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect

urlpatterns = [
    url(r'^', include('main.urls')),
    url(r'^auth/', include('auth.urls')),
]

# Definition of Custom Auth Exception Handlers
def handle400(request):
    if "application/json" in request.META["CONTENT_TYPE"] or "application/x-www-form-urlencoded" in request.META["CONTENT_TYPE"]:
        resp_body = { 'mid': request.path_info }
        resp = JsonResponse(resp_body, status=400)
    else:
        resp = HttpResponse(status=400)
    return resp


def handle403(request):
    if "application/json" in request.META["CONTENT_TYPE"] or \
       "application/x-www-form-urlencoded" in request.META["CONTENT_TYPE"] or\
       "multipart/form-data" in request.META["CONTENT_TYPE"]:
        resp_body = { "mid": request.path_info, "msg": "Authentication Failed"}
        resp = JsonResponse(resp_body, status=403)
    else:
        url_param = urllib.urlencode({
            "redirect_after_login": request.META["REQUEST_URI"]
        })
        resp = HttpResponseRedirect("/auth/login-page/?%s" % url_param)
        resp.status = 403
    return resp


# Routing Exception Handlers
handler400 = handle400
handler403 = handle403
