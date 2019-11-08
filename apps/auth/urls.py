from django.conf.urls import url
import apps.auth.controller as controller

urlpatterns = [

    url(r'^login-page/$', controller.login_page),

    url(r'^login/$', controller.login),

    url(r'^logout/$', controller.logout),

]
