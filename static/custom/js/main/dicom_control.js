var dcm_load_q = [];
var min_zoom = 0.01;

var cursor_mode = 'pan';
var invert_mode = 0;

function is_annotation_mode(cursor_mode) {
    if (cursor_mode === 'cancer') {
        return true;
    } else {
        return false;
    }
}

function loadCase(case_path) {
    toggleSpinner("on");
    dcm_load_q = mgKeys.slice();

    for (const mgKeyIdx in mgKeys) {
        const key = mgKeys[mgKeyIdx];
        loadFileFromURL(key, "wadouri:" + case_path + "/" + key.toUpperCase() + ".dcm");
    }

    adjust_canvases();
}


function enableCornerstone() {
    for (var i = 0; i < mgKeys.length; i++) {
        var key = mgKeys[i];
        var element_id = "#" + key;
        var element = $(element_id).get(0);
        cornerstone.enable(element);
    }

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    const config = {
        webWorkerPath    : '/static/js/plugins/cornerstoneWADOImageLoader/cornerstoneWADOImageLoaderWebWorker.min.js',
        taskConfiguration: {
            'decodeTask': {
                codecsPath: 'cornerstoneWADOImageLoaderCodecs.min.js'
            }
        }
    };
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

    cornerstone.events.addEventListener('cornerstoneimageloadprogress', function (event) {
        const eventData = event.detail;
        var name = eventData.url.replace(/^.*[\\\/]/, '').replace('.dcm', '');
        updateProgressBar(name, eventData.percentComplete);
    });
}


function draw_text_overlay() {
    for (mg_key_idx in mgKeys) {
        var key = mgKeys[mg_key_idx];
        draw_individual_text_overlay(key);
    }
}


function draw_individual_text_overlay(key) {
    var element_id = "#" + key;
    var element = $(element_id).get(0);
    var im_data = cornerstone.getEnabledElement(element).image.data;
    var study_description = (im_data.string("x00081030") == undefined ? "" : im_data.string("x00081030"));
    var study_date = (im_data.string("x00080020") == undefined ? "" : im_data.string("x00080020"));
    var patient_name = (im_data.string("x00100010") == undefined ? "" : im_data.string("x00100010"));
    var patient_age = (im_data.string("x00100040") == undefined ? "" : im_data.string("x00100040"));

    var topLeft = $(element_id + " > .overlay.tl");
    var topRight = $(element_id + " > .overlay.tr");
    $(topLeft).html(patient_name + "<br>" + patient_age);
    $(topRight).html(study_description + "<br>" + study_date);

    var viewport = cornerstone.getEnabledElement(element).viewport;
    var bottomLeft = $(element_id + " > .overlay.bl");
    var bottomRight = $(element_id + " > .overlay.br");
    $(bottomLeft).html("Zoom<br>" + viewport.scale.toFixed(2));
    $(bottomRight).html("WW/WL<br>" + viewport.voi.windowWidth.toFixed(0) + "/" + viewport.voi.windowCenter.toFixed(0));
}


function adjust_mg_container_height() {
    h_adjustment = 165 - 64 + $(".bg-navy").height();
    var mg_container_h = ($("body").height() - h_adjustment);
    $(".mg_container").height(mg_container_h + "px");
}


function adjust_canvases() {
    for (mg_key_idx in mgKeys) {
        var key = mgKeys[mg_key_idx];
        adjust_individual_canvas(key);
        overlayRedraw(key);
    }

}


function adjust_individual_canvas(key) {
    var element_id = "#" + key;
    var element = $(element_id).get(0);
    var canvas = cornerstone.getEnabledElement(element).canvas;
    cornerstone.resize(element, true);

    // for annotation
    var annotation_dom = element_id + " > .annotation";
    $(annotation_dom).css({"width": canvas.width, "height": canvas.height});
}

function canvas_redraw() {
    adjust_mg_container_height();
    adjust_canvases();
}

/****************************************************************************************/
/************************************ Initialization ************************************/
/****************************************************************************************/
$(window).resize(function () {
    canvas_redraw();
});


function toggleCursorMode(mode_to_change) {

    //automatically toggle to next cursor_mode
    if (mode_to_change === undefined) {
        if (cursor_mode === 'pan') {
            cursor_mode = 'cancer';
        } else if (cursor_mode == 'cancer') {
            cursor_mode = 'pan';
        }
    } else {
        cursor_mode = mode_to_change;
    }

    var cursor_mode_btn = $("#cursor-mode-btn");

    if (cursor_mode === 'cancer') {
        cursor_mode_btn.tooltip("option", "content", "Annotating Cancer");
        cursor_mode_btn.text("CAN");
        $(".mg_container").css("cursor", "crosshair");
    } else {
        cursor_mode_btn.tooltip("option", "content", "Adjusting Pan");
        cursor_mode_btn.text("PAN");
        $(".mg_container").css("cursor", "move");
    }

    for (mg_key_idx in mgKeys) {
        var key = mgKeys[mg_key_idx];
        overlayRedraw(key);
    }
}

$("#reset-btn").click(function () {
    for (mg_key_idx in mgKeys) {
        var key = mgKeys[mg_key_idx];
        var element_id = "#" + key;
        var element = $(element_id).get(0);

        try {
            cornerstone.reset(element);

            overlayRedraw(key);
            draw_individual_text_overlay(key);
        }
        catch (e) {
            console.log(error);
        }
    }
    canvas_redraw();
});
/****************************************************************************************/
/************************************ Initialization ************************************/
/****************************************************************************************/

/****************************************************************************************/
/*********************************** For Development ************************************/

/****************************************************************************************/
function registerMouseEventHandler(element_id) {
    // add event handlers to pan image on mouse move
    $(element_id).mousedown(function (e) {
        var element_id = "#" + e.currentTarget.id;
        var key = e.currentTarget.id.split('_')[0];
        var dragged = false;

        if ($(element_id + " > .overlay.br").html() == "") {
            return;
        }
        var element = $(element_id).get(0);

        var lastX = e.pageX;
        var lastY = e.pageY;

        //for annotation
        if (is_annotation_mode(cursor_mode) && e.which != 3) {
            startPainting(key, new Point(lastX, lastY));
        }
        $(document).mousemove(function (e) {
            dragged = true;
            $(document).unbind('keyup');

            var deltaX = e.pageX - lastX,
                deltaY = e.pageY - lastY;
            lastX = e.pageX;
            lastY = e.pageY;

            if (deltaX == 0 && deltaY == 0) {
                return;
            }

            var viewport = cornerstone.getViewport(element);
            if (viewport == undefined) {
                return;
            }
            // window control(for mouse right click)
            if (e.which == 3) {
                viewport.voi.windowWidth += (deltaX / viewport.scale);
                viewport.voi.windowCenter += (deltaY / viewport.scale);
            }
            else {
                if (cursor_mode == "pan") {
                    viewport.translation.x += (deltaX / viewport.scale);
                    viewport.translation.y += (deltaY / viewport.scale);
                }
                //for annotation
                else if (is_annotation_mode(cursor_mode)) {
                    if (is_painting == true) {
                        paintLine(key, new Point(lastX, lastY));
                    }
                }
            }

            //for annotation - end
            cornerstone.setViewport(element, viewport);
            overlayRedraw(key);

            draw_individual_text_overlay(key);
        });

        $(document).mouseup(function (e) {
            if (dragged) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');

                //for annotation
                if (e.which == 1) {
                    if (is_annotation_mode(cursor_mode)) {
                        endPainting(key, new Point(e.pageX, e.pageY));
                    }
                }

                else if (e.which == 3) {
                    draw_text_overlay();
                }
            }

            else {
                if (cursor_mode == 'cancer' && e.which == 1) {
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                    processClickEvent(key, e);
                }
                else {
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                }
            }

            $(document).keyup(function (e) {
                if (e.keyCode == 49) {
                    toggleCursorMode('pan');
                }
                else if (e.keyCode == 50) {
                    toggleCursorMode('cancer');
                }
                else if (e.keyCode == 51) {
                    toggleCursorMode('benign');
                }
                else if (e.keyCode == 90) {
                    batchZoomIn();
                }
            });
        });
    });

    $('.mg_container').mousemove(function (e) {
        var key = $(this).attr("id");

        if (is_annotation_mode(cursor_mode) && e.which == 0) {
            $(document).unbind('mousemove');
            processHoverEvent(key, e);
        }
    });

    $(element_id).on('mousewheel DOMMouseScroll', function (e) {
        var element_id = "#" + e.currentTarget.id;
        var element = $(element_id).get(0);
        var viewport = cornerstone.getViewport(element);
        var zoom_sensitivity = 0.08;
        var max_zoom = 10;

        const {top, left, width, height} = element.getBoundingClientRect();
        const distanceX = e.pageX - (left + width / 2);
        const distanceY = e.pageY - (top + height / 2);

        // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
        // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
        if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
            if (viewport.scale == min_zoom) {
                return;
            }

            const newScale = Math.max(min_zoom, viewport.scale - zoom_sensitivity);
            const deltaX = (newScale / viewport.scale - 1) * distanceX;
            const deltaY = (newScale / viewport.scale - 1) * distanceY;

            viewport.scale = newScale;
            viewport.translation.x -= deltaX / newScale;
            viewport.translation.y -= deltaY / newScale;

            cornerstone.setViewport(element, viewport);
        } else {
            const newScale = Math.min(max_zoom, viewport.scale + zoom_sensitivity);
            const deltaX = (1 - newScale / viewport.scale) * distanceX;
            const deltaY = (1 - newScale / viewport.scale) * distanceY;

            viewport.scale = newScale;
            viewport.translation.x += deltaX / newScale;
            viewport.translation.y += deltaY / newScale;

            cornerstone.setViewport(element, viewport);
        }


        draw_text_overlay();
        //for annotation
        overlayRedraw(e.currentTarget.id.split('_')[0]);
        return false;
    });

}


function loadFileFromURL(img_kind, imageId) {
    cornerstone.loadImage(imageId).then(function (image) {
        var imageLaterality = image.data.string('x00200062');
        var viewPosition = image.data.string('x00185101');
        var imageType = imageLaterality + viewPosition;
        var key = imageType.toLowerCase();

        var element_id = '#' + img_kind;
        var element = $(element_id).get(0);
        cornerstone.disable(element);
        cornerstone.enable(element);
        cornerstone.displayImage(element, image);
        adjust_individual_canvas(key);

        var viewport = cornerstone.getViewport(element);

        var windowCenterStr = image.data.string("x00281050");
        var windowWidthStr = image.data.string("x00281051");
        var windowCenter = 1 * image.data.string("x00281050");
        var windowWidth = 1 * image.data.string("x00281051");

        //exception handle for NaN Dicom..
        if (isNaN(windowCenter)) {
            if (windowCenterStr == undefined) {
                windowCenter = 2048;
            } else {
                windowCenter = windowCenterStr.split("\\")[0] * 1;
            }
        }
        if (isNaN(windowWidth)) {
            if (windowWidthStr == undefined) {
                windowWidth = 4096;
            } else {
                windowWidth = windowWidthStr.split("\\")[0] * 1;
            }
        }

        viewport.voiLUT = undefined;
        viewport.voi.windowWidth = windowWidth;
        viewport.voi.windowCenter = windowCenter;
        var photometric_interpretation = image.data.string("x00280004");
        if (photometric_interpretation == "MONOCHROME1") {
            viewport.invert = !invert_mode;
        }
        else {
            viewport.invert = invert_mode;
        }

        cornerstone.setViewport(element, viewport);
        min_zoom = viewport.scale;

        draw_individual_text_overlay(key);

        var base_canvas = cornerstone.getEnabledElement(element).canvas;
        var base_canvas_height = $(base_canvas).height();
        var base_canvas_width = $(base_canvas).width();

        var annotation_dom = element_id + " > .annotation";
        $(annotation_dom).css({"width": base_canvas_width, "height": base_canvas_height});

        for (idx in dcm_load_q) {
            if (dcm_load_q[idx] == key) dcm_load_q.splice(idx, 1);
        }

        overlayRedraw(img_kind);

        if (dcm_load_q.length == 0) {
            toggleSpinner("off");
            cancelAllPendingPromises(true);
            clearCurrentCaseDCMCaches();
        }

    }, function (x, e) {
        console.log(x);
        console.error(e);

        contour_dict = {};
        tmp_contour = [];
        dcm_load_q = [];

        for (mg_key_idx in mgKeys) {
            var key = mgKeys[mg_key_idx];
            var element_id = "#" + key;
            var element = $(element_id).get(0);
            overlayRedraw(key);

            cornerstone.disable(element);
            cornerstone.enable(element);
        }

        toggleSpinner("off");

        swal("", "지원하지 않는 형식의 DICOM입니다. \n" +
            "관리자에게 알린 후 Next를 눌러 다음케이스로 진행해주세요.", "error");
    });
}


function isPointIsInsideContour(target_point, contour) {
    var inside = false;

    for (var i = 0, j = contour.length - 1; i < contour.length; j = i++) {
        if (((contour[i].y >= target_point.y) != (contour[j].y >= target_point.y)) &&
            (target_point.x <= (contour[j].x - contour[i].x) * (target_point.y - contour[i].y) / (contour[j].y - contour[i].y) + contour[i].x)) {
            inside = !inside;
        }
    }

    return inside;
}


function processHoverEvent(key, e) {
    var target_point = getOverlayCoord(key, new Point(e.pageX, e.pageY));
    var selected_contour_id;

    outer_loop:
        for (var cancer in contour_dict) {
            if (contour_dict[cancer].hasOwnProperty(key)) {
                for (var contour_id in contour_dict[cancer][key]) {
                    var contour = contour_dict[cancer][key][contour_id];

                    if (isPointIsInsideContour(target_point, contour)) {
                        selected_contour_id = contour_id;
                        break outer_loop;
                    }
                }
            }
        }
    overlayRedraw(key, selected_contour_id);
};


// manually delete contour when clicked
function processClickEvent(key, e) {
    var target_point = getOverlayCoord(key, new Point(e.pageX, e.pageY));

    outer_loop:
        for (var cancer in contour_dict) {
            if (contour_dict[cancer].hasOwnProperty(key)) {
                for (var contour_id in contour_dict[cancer][key]) {
                    var contour = contour_dict[cancer][key][contour_id];

                    if (isPointIsInsideContour(target_point, contour)) {
                        delete contour_dict[cancer][key][contour_id];
                        overlayRedraw(key);
                        break outer_loop;
                    }
                }
            }
        }
}
