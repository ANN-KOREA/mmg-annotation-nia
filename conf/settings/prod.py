# Import some utility functions
from os.path import join
# Fetch our common settings
from common import *

# #########################################################
IN_PRODUCTION = False

# ##### DEBUG CONFIGURATION ###############################
DEBUG = False


# ##### DATABASE CONFIGURATION ############################
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'HOST': 'db',
        'PORT': '3306',
        'USER': 'mmg-annotation-db',
        'PASSWORD': 'mmgannotationdb',
        'NAME': 'mmg_annotation',
        'ECHO' : True,                      # SQL Alchemy Logging option
        'CASE_SENSITIVE' : False,
    }
}


# ##### APPLICATION CONFIGURATION #########################
INSTALLED_APPS = DEFAULT_APPS

# LOGGING OPTIONS
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters':{
        'verbose': {
            'format': '%(levelname) -10s %(asctime)s %(module)s:%(lineno)s %(funcName)s %(message)s',
        }
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/home/annotation/logs/mmg-annotation-py.log',
            'maxBytes': 1024*1024*5, # 5 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
        'logger.default': {
            'handlers': ['file',],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

RESULT_JSON_DIR = "/home/annotation/result"
EXTERNAL_CASE_PATH_PREFIX = "/dcm/"