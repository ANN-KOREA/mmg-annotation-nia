function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


$("#logout_btn").click(function () {
    logout();
});


function initProgressBar() {
    $("#rcc_label").text("0%");
    $("#lcc_label").text("0%");
    $("#rmlo_label").text("0%");
    $("#lmlo_label").text("0%");
    $("#rcc_bar").removeClass("level-track-progress");
    $("#lcc_bar").removeClass("level-track-progress");
    $("#rmlo_bar").removeClass("level-track-progress");
    $("#lmlo_bar").removeClass("level-track-progress");
    $("#rcc_bar").css("width", "0%");
    $("#lcc_bar").css("width", "0%");
    $("#rmlo_bar").css("width", "0%");
    $("#lmlo_bar").css("width", "0%");
}

function updateProgressBar(viewName, percentage) {
    viewName = viewName.toLowerCase();
    percentage = percentage.toString();
    $("#" + viewName + "_label").text(percentage + "%");
    $("#" + viewName + "_bar").addClass("level-track-progress");
    $("#" + viewName + "_bar").css("width", percentage + "%");
}

function toggleSpinner(onoff) {
    if (onoff == "on") {
        $("#loading_indicator_wrapper").modal("show");
        initProgressBar();
        $(".loading_progress_bar").show();
    }
    else {
        $("#loading_indicator_wrapper").modal("hide");
        $(".loading_progress_bar").hide();
    }
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        // xhr.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );

        if (Cookies.get('dct_access_token') != null) {
            xhr.setRequestHeader("access_token", Cookies.get('dct_access_token'));
        }
    },
    complete  : function (xhr, status) {
        if (xhr.status == 200) {
            var access_token = xhr.getResponseHeader("Authorization");

            if (access_token != null) {
                Cookies.set('dct_access_token', access_token, {expires: 7});
            }
        }
        else if (xhr.status == 400 || xhr.status == 403) {
            swal({
                title            : '',
                text             : "Your session has been expired. Please re-login.",
                type             : 'warning',
                showCancelButton : false,
                confirmButtonText: "OK"
            }, function () {
                location.href = "/auth/login-page/";
            });
        }
        else if (xhr.status == 500) {
            swal("Error", "Internal Server Error", "error");
            var access_token = xhr.getResponseHeader("Authorization");

            if (access_token != null) {
                Cookies.set('dct_access_token', access_token, {expires: 7});
            }
        }
        else {
            swal("Error", "An error has occurred. Please contact the administrator.", "error");

            var access_token = xhr.getResponseHeader("Authorization");

            if (access_token != null) {
                Cookies.set('dct_access_token', access_token, {expires: 7});
            }
        }
    }
});

function logout() {

    var url = "/auth/logout/";

    $.ajax({
        type    : 'post',
        url     : url,
        dataType: 'json',
        timeout : 10000,
        success : function (data) {
            Cookies.remove("dct_access_token");
            location.href = "/auth/login-page/";
        },
        error   : function (x, e) {
            Cookies.remove("dct_access_token");
            location.href = "/auth/login-page/";
        }
    });
}
