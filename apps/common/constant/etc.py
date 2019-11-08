class Paging:
    DEFAULT_LIST_CNT = 20
    DEFAULT_PAGES_TO_SHOW = 10


class Result:
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    NOT_AVAILABLE = "NOT AVAILABLE"


class HttpRequest:
    CONTENT_TYPE_JSON_UTF8  = "application/json;charset=UTF-8"
    CONTENT_TYPE_MULTIPART  = "multipart/form-data"
    HTTP_HEADERS_JSON = { "Content-Type" : CONTENT_TYPE_JSON_UTF8 }
    DEFAULT_HTTP_REQ_TIMEOUT = 120
