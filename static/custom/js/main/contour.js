var is_painting = false;
var contour_dict = {};
var tmp_contour = [];
var colors = {"cancer": "#f44141"};

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function getOriginPoint(key) {
    var element_id = "#" + key;
    var element = $(element_id).get(0);
    var viewport = cornerstone.getEnabledElement(element).viewport;
    return (new Point(viewport.translation.x * getImageZoom(key), viewport.translation.y * getImageZoom(key)));
}

function getOverlayCoord(key, point) {
    var element_id = "#" + key;
    var annotation_dom = element_id + " > .annotation";
    var rect = $(annotation_dom).get(0).getBoundingClientRect();
    var event_x = point.x - rect.left - rect.width / 2;
    var event_y = point.y - rect.top - rect.height / 2;
    var origin_point = getOriginPoint(key);
    var overlay_x = ((event_x - origin_point.x) / getImageZoom(key)) | 0;
    var overlay_y = ((event_y - origin_point.y) / getImageZoom(key)) | 0;
    return (new Point(overlay_x, overlay_y));
}

function addCurrentPoint(point) {
    var overlay_x = point.x;
    var overlay_y = point.y;
    tmp_contour.push(new Point(overlay_x, overlay_y));
}

function startPainting(key, point) {
    is_painting = true;
    tmp_contour = [];
    addCurrentPoint(getOverlayCoord(key, point));

}

function endPainting(key, point) {
    if (is_painting != true) {
        return;
    }

    addCurrentPoint(getOverlayCoord(key, point));
    addCurrentPoint(tmp_contour[0]);

    if (isContour(tmp_contour) && tmp_contour.length > 30 && areaInsidePolygon(tmp_contour) > 500) {
        if (!contour_dict.hasOwnProperty(cursor_mode)) {
            contour_dict[cursor_mode] = {};
        }

        if (!contour_dict[cursor_mode].hasOwnProperty(key)) {
            contour_dict[cursor_mode][key] = {};
        }

        contour_dict[cursor_mode][key][new Date().getTime()] = tmp_contour;
    }

    tmp_contour = [];
    is_painting = false;
    overlayRedraw(key);

}

function paintLine(key, point) {
    addCurrentPoint(getOverlayCoord(key, point));
    overlayRedraw(key);
}

function getImageZoom(key) {
    var element_id = "#" + key;
    var element = $(element_id).get(0);
    var viewport = cornerstone.getEnabledElement(element).viewport;
    return viewport.scale;
}

function drawLine(ctx, src_point, dst_point) {
    ctx.lineTo(dst_point.x, dst_point.y);
    ctx.lineWidth = 4;
    ctx.stroke();
}

function overlayClear() {
    for (mg_key_idx in mgKeys) {
        var key = mgKeys[mg_key_idx];
        var element_id = "#" + key;
        var annotation_dom = element_id + " > .annotation";
        var ctx = $(annotation_dom).getContext("2d");
    }
}

function overlayRedraw(key, selected_contour_id) {

    var element_id = "#" + key;
    var annotation_dom = element_id + " > .annotation";

    var canvas = $(annotation_dom).get(0);
    canvas.width = $(annotation_dom).width();
    canvas.height = $(annotation_dom).height();
    var ctx = canvas.getContext("2d");

    var element_id = "#" + key;
    var element = $(element_id).get(0);
    var viewport = cornerstone.getEnabledElement(element).viewport;

    for (var cancer in contour_dict) {
        if (contour_dict[cancer].hasOwnProperty(key)) {
            for (var contour_id in contour_dict[cancer][key]) {
                if (viewport != undefined) {
                    var zoomed_origin_x = ($(element_id).width() / 2 + viewport.translation.x * getImageZoom(key));
                    var zoomed_origin_y = ($(element_id).height() / 2 + viewport.translation.y * getImageZoom(key));
                    ctx.transform(getImageZoom(key), 0, 0, getImageZoom(key), zoomed_origin_x, zoomed_origin_y);
                }

                if (contour_id == selected_contour_id) {
                    ctx.strokeStyle = "#FFFF33";
                }
                else {
                    ctx.strokeStyle = colors[cancer];
                }

                var contour = contour_dict[cancer][key][contour_id];
                for (var j = 0; j < contour.length - 1; j++) {
                    ctx.beginPath();
                    ctx.moveTo(contour[j].x, contour[j].y);
                    drawLine(ctx, contour[j], contour[j + 1]);
                    ctx.closePath();
                }
                ctx.resetTransform();
            }
        }
    }

    //draw current contour
    if (tmp_contour.length > 2) {
        var zoomed_origin_x = ($(element_id).width() / 2 + viewport.translation.x * getImageZoom(key));
        var zoomed_origin_y = ($(element_id).height() / 2 + viewport.translation.y * getImageZoom(key));
        ctx.transform(getImageZoom(key), 0, 0, getImageZoom(key), zoomed_origin_x, zoomed_origin_y);

        for (var j = 0; j < tmp_contour.length - 1; j++) {
            ctx.strokeStyle = colors[cursor_mode];
            ctx.beginPath();
            ctx.moveTo(tmp_contour[j].x, tmp_contour[j].y);
            drawLine(ctx, tmp_contour[j], tmp_contour[j + 1]);
            ctx.closePath();
        }
    }
}

function isContour(points) {
    for (var i = 1; i < points.length - 1; i++) {
        for (var j = 0; j <= i; j++) {
            if (ifIntersect([points[i], points[i + 1]], [points[j], points[j + 1]])) {
                return false;
            }
        }
    }

    return true;
}

function areaInsidePolygon(contour) {
    var sum = 0;

    for (var i = 0; i < contour.length - 1; i++) {
        sum += contour[i].x * contour[i + 1].y - contour[i + 1].x * contour[i + 1].y;
    }

    sum = Math.abs(sum);

    return sum;
}


function ifIntersect(line1, line2) {
    line1StartX = line1[0].x;
    line1StartY = line1[0].y;
    line1EndX = line1[1].x;
    line1EndY = line1[1].y;

    line2StartX = line2[0].x;
    line2StartY = line2[0].y;
    line2EndX = line2[1].x;
    line2EndY = line2[1].y;
    var denominator,
        a,
        b,
        numerator1,
        numerator2,
        result = {
            x      : null,
            y      : null,
            onLine1: false,
            onLine2: false
        };
    denominator =
        ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return false;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return (result.onLine1 && result.onLine2);
};

/**************************************************************/
/*********************** Contour Draw *************************/
/**************************************************************/
