function prevOrNext(direction) {

    var url = "/prev-or-next/";
    var current_case_info = {"case_id": case_info.case_id, "seq": case_info.seq};
    var query = {};

    if (direction == "prev") {
        query.less_than = current_case_info.seq;
    }
    else if (direction == "next") {
        query.greater_than = current_case_info.seq;
    }
    else {
        return false;
    }

        $('.yn-btn').each(function (i, obj) {
        if ($(obj).hasClass("active")) {
            current_case_info[$(obj).attr("id")] = 1;
        }
        else {
            current_case_info[$(obj).attr("id")] = 0;
        }
    });

    current_case_info.contour_list = contour_dict;
    var param = {"case_info": current_case_info, "query": query};

    cancelAllPendingPromises(direction === 'next');

    $.ajax({
        type       : 'post',
        url        : url,
        data       : JSON.stringify(param),
        contentType: "application/json; charset=utf-8",
        dataType   : 'json',
        timeout    : 10000,
        async      : true,
        success    : function (data) {
            if (data.case_info != null) {
                location.reload();
            }
            else {
                if (direction == "prev") {
                    swal("", "첫번째 케이스입니다.", "warning");
                } else {
                    swal("", "감사합니다. 모두 완료되었습니다.", "warning");
                }
            }
        }
    });

}
