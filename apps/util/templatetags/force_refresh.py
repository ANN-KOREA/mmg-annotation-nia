import os

from django import template
from django.conf import settings
import logging

register = template.Library()

@register.simple_tag
def force_refresh(path):
    '''
    Returns absolute URL to static file with versioning.
    '''
    full_path = os.path.join(settings.STATIC_ROOT, path)
    try:
        # Get file modification time.
        mtime = int(os.path.getmtime(full_path))
        return '%s%s?v=%s' % (settings.STATIC_URL, path, mtime)
    except OSError as e:
        logging.exception(e)
        # Returns normal url if this file was not found in filesystem.
        return '%s%s' % (settings.STATIC_URL, path)
