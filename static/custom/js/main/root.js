let case_info;
let runningPromises = [];

// disable contextmenu
$(".mg_container").on('contextmenu', function (event) {
    event.preventDefault();
});

function clearCurrentCaseDCMCaches() {
    return caches.open('dcm').then(function (cache) {
        const deletePromises = [];
        cache.keys().then(function (requests) {
            requests.map(function (request) {
                if (request.url.lastIndexOf(encodeURI(case_info.case_path)) !== -1) {
                    return deletePromises.push(cache.delete(request));
                }
            });
        });
        return Promise.all(deletePromises);
    }).then().catch();
}

function prefetchCase(caseUrl, isNextCase) {
    const prefetchPromises = [];
    for (const mgKeyIdx in mgKeys) {
        const key = mgKeys[mgKeyIdx];
        const dcmPath = caseUrl + "/" + key.toUpperCase() + ".dcm";

        let found = false;
        for (const i in runningPromises) {
            if (runningPromises[i].url === dcmPath) {
                found = true;
                break;
            }
        }

        if (!found) {
            const wrappedPromise = promiseWithContext(dcmPath, isNextCase);
            runningPromises.push(wrappedPromise);
            prefetchPromises.push(wrappedPromise.promise);
        }
    }
    return Promise.all(prefetchPromises);
}

function promiseWithContext(dcmPath, isNextCase) {
    return {
        promise    : caches.open('dcm').then(cache => cache.add(dcmPath)),
        isNextCase,
        url        : dcmPath,
        isCancelled: false,
    };
}

function removeFromRunningPromise(url) {
    let index = -1;
    for (const i in runningPromises) {
        if (runningPromises[i].url === url) {
            index = i;
            break;
        }
    }

    if (index !== -1) {
        caches.open('dcm').then(function (cache) {
            const deletePromises = [];
            cache.keys().then(function (requests) {
                requests.map(function (request) {
                    if (request.url.lastIndexOf(encodeURI(case_info.case_path)) !== -1) {
                        return deletePromises.push(cache.delete(request));
                    }
                });
            });
            return Promise.all(deletePromises);
        }).then().catch();

        runningPromises.splice(index, 1);
    }
}

function cancelAllPendingPromises(isNextCase) {
    const removeIdList = [];
    for (const i in runningPromises) {
        const wrappedPromise = runningPromises[i];
        const imageId = wrappedPromise.url;
        // remove all when prev, remove only current case when next
        if (!isNextCase || !wrappedPromise.isNextCase) {
            wrappedPromise.isCancelled = true;
            removeIdList.push(imageId);
        } else {
            wrappedPromise.isNextCase = false;
        }
    }
    removeIdList.map(removeFromRunningPromise);
}

function refreshCaseInfo(caseInfoArg) {
    case_info = caseInfoArg;

    if (case_info.prefetch_case_path != null) {
        prefetchCase(case_info.prefetch_case_path, true);
    }

    if (case_info.hasOwnProperty("contour_list")) {
        try {
            contour_dict = case_info.contour_list;
        }
        catch (e) {
            contour_dict = {};
        }
    } else {
        contour_dict = {};
    }

    loadCase(case_info.case_path);

    if (case_info.discard_yn == 1) {
        $("#discard_yn").addClass("active");
    } else {
        $("#discard_yn").removeClass("active");
    }

    $("#annotation_status").text("No. " + case_info.seq + " / Total " + case_info.tot_cnt + " Case");
}

$(document).ready(function () {
    //clearDCMCaches();
    var mg_keys = ['lcc', 'lmlo', 'rcc', 'rmlo'];
    for (mg_key_idx in mg_keys) {
        var key = mg_keys[mg_key_idx];
        var element_id = "#" + key;
        registerMouseEventHandler(element_id);
    }

    $('[data-tooltip="tooltip"]').tooltip({
        selector : "[data-tooltip=tooltip]",
        container: "body"
    });

    $(".yn-btn").click(function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
    });

    $("#prev-btn").click(function () {
        prevOrNext('prev');
    });

    $("#next-btn").click(function () {
        prevOrNext('next');
    });

    enableCornerstone();
    refreshCaseInfo(JSON.parse($("#case_info").attr("data-obj")));

});

$(document).keyup(function (e) {
    if (e.keyCode == 49) {
        toggleCursorMode('pan');
    }
    else if (e.keyCode == 50) {
        toggleCursorMode('cancer');
    }
});

$(document).on('dblclick', function (e) {
    toggleCursorMode();
});
