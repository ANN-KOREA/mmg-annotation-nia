from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine, event
from django.conf import settings
from sqlalchemy.exc import DisconnectionError


def checkout_listener(dbapi_con, con_record, con_proxy):
    try:
        try:
            dbapi_con.ping(False)
        except TypeError:
            dbapi_con.ping()
    except dbapi_con.OperationalError as exc:
        if exc.args[0] in (2006, 2013, 2014, 2045, 2055):
            raise DisconnectionError()
        else:
            raise

def connect():
  db_settings = settings.DATABASES['default']

  eng = create_engine(
		'mysql://'
	+ db_settings['USER'] + ':'
	+ db_settings['PASSWORD'] + '@'
	+ db_settings['HOST'] + ":"
	+ db_settings['PORT'] + '/'
	+ db_settings['NAME'] + '?charset=utf8',
	echo = db_settings['ECHO'], case_sensitive = db_settings['CASE_SENSITIVE'],
	pool_timeout=60, pool_size=100, pool_recycle=3600
  )

  event.listen(eng, 'checkout', checkout_listener)

  session_factory = sessionmaker(bind=eng)

  return scoped_session(session_factory)
