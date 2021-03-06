from contextlib import contextmanager

import common.db as db

@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = db.Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
