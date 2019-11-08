import logging
from django.core.exceptions import PermissionDenied


logger = logging.getLogger("logger.default")


class JWTError(PermissionDenied):
    def __init__(self, error, description, status_code=401, headers=None):
        self.error = error
        self.description = description
        self.status_code = status_code
        self.headers = headers
        logger.exception(self)

    def __repr__(self):
        return 'JWTError: %s' % self.error

    def __str__(self):
        return '%s. %s' % (self.error, self.description)
