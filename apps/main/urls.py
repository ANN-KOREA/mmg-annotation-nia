from django.conf.urls import url
import apps.main.controller as controller

urlpatterns = [
    url(r'^$', controller.root),
    url(r'^current/$', controller.current),
    url(r'^prev-or-next/$', controller.prev_or_next),
]
