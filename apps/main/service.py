import io
import os
import logging
import json
import jsonstruct
from django.conf import settings

import apps.main.dao as dao
from apps.common.db.session_manager import session_scope

###################### GLOBALS ######################
LOGGER = logging.getLogger("logger.default")
RESULT_JSON_DIR = settings.RESULT_JSON_DIR
###################### GLOBALS ######################


def get_contour_list(case_info, query):
    contour_list = {}

    # parse json
    result_json_path = os.path.join(RESULT_JSON_DIR,
                                    str(query["user_id"]),
                                    str(case_info.case_id) + ".json")

    if os.path.exists(result_json_path):
        with open(result_json_path) as json_file:
            json_payload = json.load(json_file)

            if "contour_list" in json_payload:
                if isinstance(json_payload["contour_list"], unicode):
                    contour_list = json.loads(json_payload["contour_list"])
                else:
                    contour_list = json_payload["contour_list"]

    return contour_list


def save_result_in_json(json_data):
    if json_data['seq']:
        del json_data['seq']

    # save contour as json file
    user_json_dir = os.path.join(RESULT_JSON_DIR, str(json_data["user_id"]))
    if not os.path.exists(user_json_dir):
        os.makedirs(user_json_dir)

    result_json_path = os.path.join(user_json_dir, str(json_data["case_id"]) + ".json")

    with io.open(result_json_path, 'wt', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(json_data, ensure_ascii=False))


def last_case(param):
    case_info = None

    try:
        with session_scope() as db_session:
            case_info = dao.last_case(db_session, param)

            if not case_info:
                case_info = dao.last_case(db_session, param)

            annotation_status = dao.annotation_status(db_session, param)

            if case_info:
                case_info.tot_cnt = annotation_status.tot_cnt
                prefetch_case \
                    = dao.next_case(db_session, \
                                    {"greater_than": case_info.seq, "user_id": param["user_id"]})

                if prefetch_case:
                    case_info.prefetch_case_path = prefetch_case.case_path

                # load contour from json
                if 'A' in case_info.task_type:
                    case_info.contour_list = get_contour_list(case_info, param)

    except Exception as e:
        LOGGER.exception(e)

    return case_info


def prev_case(case_info, query):

    try:
        with session_scope() as db_session:
            if "discard_yn" in case_info:
                dao.update_case_user_map(db_session, case_info)

            save_result_in_json(case_info)

            case_info = dao.prev_case(db_session, query)
            annotation_status = dao.annotation_status(db_session, query)

            if case_info:
                case_info.tot_cnt = annotation_status.tot_cnt
                dao.update_user_info(db_session, \
                                     {"user_id": query["user_id"], "ucm_seq": case_info.seq})

                prefetch_case \
                    = dao.prev_case(db_session, \
                                    {"less_than": case_info.seq, "user_id": query["user_id"]})

                if prefetch_case:
                    case_info.prefetch_case_path = prefetch_case.case_path

                # load contour from json
                if 'A' in case_info.task_type:
                    case_info.contour_list = get_contour_list(case_info, query)


    except Exception as e:
        LOGGER.exception(e)

    return case_info


def next_case(case_info, query):

    try:
        with session_scope() as db_session:
            if "discard_yn" in case_info:
                dao.update_case_user_map(db_session, case_info)

            save_result_in_json(case_info)

            case_info = dao.next_case(db_session, query)
            annotation_status = dao.annotation_status(db_session, query)

            if case_info:
                case_info.tot_cnt = annotation_status.tot_cnt
                dao.update_user_info(db_session, \
                                     {"user_id": query["user_id"], "ucm_seq": case_info.seq})

                prefetch_case \
                    = dao.next_case(db_session, \
                                    {"greater_than": case_info.seq, "user_id": query["user_id"]})

                if prefetch_case:
                    case_info.prefetch_case_path = prefetch_case.case_path

                # load contour from json
                if 'A' in case_info.task_type:
                    case_info.contour_list = get_contour_list(case_info, query)

    except Exception as e:
        LOGGER.exception(e)

    return case_info
