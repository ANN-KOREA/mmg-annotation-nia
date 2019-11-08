# -*- coding: utf-8 -*-
import logging
from sqlalchemy.sql import text

from django.conf import settings

from apps.common.db.model import DBObject

LOGGER = logging.getLogger('logger.default')
EXTERNAL_CASE_PATH_PREFIX = settings.EXTERNAL_CASE_PATH_PREFIX

select_columns = \
    """
    ci.case_id, seq, case_name, task_type, case_path, discard_yn
    """


def get_case(db_session, param):
    case_info = None

    query_str = \
        """
            SELECT """ + select_columns + """
          FROM case_info ci RIGHT OUTER JOIN
                user_case_map ucm on ci.case_id = ucm.case_id
         WHERE ci.case_id =:case_id
    """
    query = text(query_str)
    result = db_session.execute(query, param).fetchone()

    if result:
        case_info = DBObject(result)
        case_info.case_path = EXTERNAL_CASE_PATH_PREFIX + case_info.case_path

    return case_info


def last_case(db_session, param):
    case_info = None

    query_str = \
        """
            SELECT """ + select_columns + """
              FROM case_info ci RIGHT OUTER JOIN
             	   user_case_map ucm on ci.case_id = ucm.case_id
             WHERE ucm.user_id=:user_id AND ci.enabled=1
    		   AND seq=(SELECT ucm_seq FROM user_info
                         WHERE user_id=:user_id)
        """

    query = text(query_str)
    result = db_session.execute(query, param).fetchone()

    if result:
        case_info = DBObject(result)
        case_info.case_path = EXTERNAL_CASE_PATH_PREFIX + case_info.case_path

    return case_info


def annotation_status(db_session, param):
    query_str = """SELECT (SELECT COUNT(*) FROM user_case_map
                            WHERE user_id=:user_id) AS tot_cnt"""

    query = text(query_str)
    result = DBObject(db_session.execute(query, param).fetchone())

    return result


def prev_case(db_session, param):
    case_info = None

    query_str = \
        """
            SELECT """ + select_columns + """
          FROM case_info ci RIGHT OUTER JOIN
         	   user_case_map ucm on ci.case_id = ucm.case_id
         WHERE ucm.user_id=:user_id
		   AND seq<:less_than
           AND ucm.enabled=1
      ORDER BY seq DESC
       LIMIT 1
    """

    query = text(query_str)
    result = db_session.execute(query, param).fetchone()

    if result:
        case_info = DBObject(result)
        case_info.case_path = EXTERNAL_CASE_PATH_PREFIX + case_info.case_path

    return case_info


def next_case(db_session, param):
    case_info = None

    query_str = \
        """
            SELECT  """ + select_columns + """
          FROM case_info ci RIGHT OUTER JOIN
         	   user_case_map ucm on ci.case_id = ucm.case_id
         WHERE ucm.user_id=:user_id
		   AND seq>:greater_than
           AND ucm.enabled=1
      ORDER BY seq
         LIMIT 1
    """

    query = text(query_str)
    result = db_session.execute(query, param).fetchone()

    if result:
        case_info = DBObject(result)
        case_info.case_path = EXTERNAL_CASE_PATH_PREFIX + case_info.case_path

    return case_info


def update_case_user_map(db_session, param):
    query_str = """UPDATE user_case_map
                      SET modified_at=NOW()"""

    if "discard_yn" in param:
        appendant = ", discard_yn=:discard_yn"
        query_str = "%s %s" % (query_str, appendant)

    appendant = " WHERE user_id=:user_id AND seq=:seq"
    query_str = "%s %s" % (query_str, appendant)

    query = text(query_str)
    result_set = db_session.execute(query, param)
    affected_rows = result_set.rowcount

    return affected_rows


def update_user_info(db_session, param):
    query_str = """UPDATE user_info
                      SET modified_at=NOW()"""

    if "ucm_seq" in param:
        appendant = ", ucm_seq=:ucm_seq"
        query_str = "%s %s" % (query_str, appendant)

    appendant = " WHERE user_id=:user_id"
    query_str = "%s %s" % (query_str, appendant)

    query = text(query_str)
    result_set = db_session.execute(query, param)
    affected_rows = result_set.rowcount

    return affected_rows
