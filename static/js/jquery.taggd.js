/*!
 * jQuery Taggd
 * A helpful plugin that helps you adding 'tags' on images.
 *
 * License: MIT
 */

(function($) {
	'use strict';

	var defaults = {
		edit: false,

		align: {
			x: 'center',
			y: 'center'
		},

		handlers: {},

		offset: {
			left: 0,
			top: 0
		},

		strings: {
			save: '&#x2713;',
			delete: '&#x00D7;'
		}
	};

	var methods = {
		show: function() {
			var $this = $(this),
				$label = $this.next();

			$this.addClass('active');
			$label.addClass('show').find('input').focus();
		},

		hide: function() {
			var $this = $(this);

			$this.removeClass('active');
			$this.next().removeClass('show');
		},

		toggle: function() {
			var $hover = $(this).next();

			if($hover.hasClass('show')) {
				methods.hide.call(this);
			} else {
				methods.show.call(this);
			}
		}
	};


	/****************************************************************
	 * TAGGD
	 ****************************************************************/

	var Taggd = function(element, options, data) {
		var _this = this;

		if(options.edit) {
			options.handlers = {
				click: function() {
					_this.hide();
					methods.show.call(this);
				}
			};
		}

		this.element = $(element);
		this.options = $.extend(true, {}, defaults, options);
		this.data = data;
		this.initialized = false;

		if(!this.element.height() || !this.element.width()) {
			this.element.on('load', _this.initialize.bind(this));
		} else this.initialize();
	};


	/****************************************************************
	 * INITIALISATION
	 ****************************************************************/

	Taggd.prototype.initialize = function() {
		var _this = this;

		this.initialized = true;

		this.initWrapper();
		this.addDOM();

		if(this.options.edit) {
			this.element.on('click', function(e) {

				var poffset = $(this).parent().offset(),
					x = (e.pageX - poffset.left) / _this.element.width(),
					y = (e.pageY - poffset.top) / _this.element.height();

				_this.addData({
					x: x,
					y: y,
					text: ''
				});

				_this.show(_this.data.length - 1);
			});
		}

		$(window).resize(function() {
			_this.updateDOM();
		});
	};

	Taggd.prototype.initWrapper = function() {
		var wrapper = $('<div class="taggd-wrapper" />');
		this.element.wrap(wrapper);

		this.wrapper = this.element.parent('.taggd-wrapper');
	};

	Taggd.prototype.alterDOM = function() {
		var _this = this;

		this.wrapper.find('.taggd-item-hover').each(function() {
			var $e = $(this),

				$input = $('<input type="text" size="16" />')
					.val($e.text()),
				$button_ok = $('<button />')
					.html(_this.options.strings.save),
				$button_delete = $('<button />')
					.html(_this.options.strings.delete);

			$button_ok.on('click', function() {
				_this.hide();
			});

			$button_delete.on('click', function() {
				var x = $e.attr('data-x'),
					y = $e.attr('data-y');

				_this.data = $.grep(_this.data, function(v) {
					return v.x != x || v.y != y;
				});

				_this.addDOM();
				_this.element.triggerHandler('change');
			});

			$input.on('change', function() {
				var x = $e.attr('data-x'),
					y = $e.attr('data-y'),
					item = $.grep(_this.data, function(v) {
						return v.x == x && v.y == y;
					}).pop();

				if(item) item.text = $input.val();

				_this.addDOM();
				_this.element.triggerHandler('change');
			});

			$e.empty().append($input, $button_ok, $button_delete);
		});

		_this.updateDOM();
	};

	/****************************************************************
	 * DATA MANAGEMENT
	 ****************************************************************/

	Taggd.prototype.addData = function(data) {
		if($.isArray(data)) {
			this.data = $.merge(this.data, data);
		} else {
			this.data.push(data);
		}

		if(this.initialized) {
			this.addDOM();
			this.element.triggerHandler('change');
		}
	};

	Taggd.prototype.removeData = function(data) {
		this.data = this.data.filter(function (elem) {
                      return elem.x != data.x || elem.y != data.y;
        			});
	};

	Taggd.prototype.updateData = function(oldData, newData) {
		var dataArr = this.data;

		for(var i=0; i<dataArr.length; i++){
			if(dataArr[i].x == oldData.x && dataArr[i].y == oldData.y){
				dataArr[i] = newData;
			}
		}
		this.data = dataArr;
	};

	Taggd.prototype.setData = function(data) {
		this.data = data;

		if(this.initialized) {
			this.addDOM();
		}
	};

	Taggd.prototype.clear = function() {
		if(!this.initialized) return;
		this.wrapper.find('.taggd-item, .taggd-item-hover').remove();
		this.data = [];
	};


	/****************************************************************
	 * EVENTS
	 ****************************************************************/

	Taggd.prototype.on = function(event, handler) {
		if(
			typeof event !== 'string' ||
			typeof handler !== 'function'
		) return;

		this.element.on(event, handler);
	};


	/****************************************************************
	 * TAGS MANAGEMENT
	 ****************************************************************/

	Taggd.prototype.iterateTags = function(a, yep) {
		var func;

		if($.isNumeric(a)) {
			func = function(i, e) { return a === i; };
		} else if(typeof a === 'string') {
			func = function(i, e) { return $(e).is(a); }
		} else if($.isArray(a)) {
			func = function(i, e) {
				var $e = $(e);
				var result = false;

				$.each(a, function(ai, ae) {
					if(
						i === ai ||
						e === ae ||
						$e.is(ae)
					) {
						result = true;
						return false;
					}
				});

				return result;
			}
		} else if(typeof a === 'object') {
			func = function(i, e) {
				var $e = $(e);
				return $e.is(a);
			};
		} else if($.isFunction(a)) {
			func = a;
		} else if(!a) {
			func = function() { return true; }
		} else return this;

		this.wrapper.find('.taggd-item').each(function(i, e) {
			if(typeof yep === 'function' && func.call(this, i, e)) {
				yep.call(this, i, e);
			}
		});

		return this;
	};

	Taggd.prototype.show = function(a) {
		return this.iterateTags(a, methods.show);
	};

	Taggd.prototype.hide = function(a) {
		return this.iterateTags(a, methods.hide);
	};

	Taggd.prototype.toggle = function(a) {
		return this.iterateTags(a, methods.toggle);
	};

	/****************************************************************
	 * CLEANING UP
	 ****************************************************************/

	Taggd.prototype.dispose = function() {
		this.clear();
		this.element.unwrap(this.wrapper);
	};


	/****************************************************************
	 * SEMI-PRIVATE
	 ****************************************************************/
	Taggd.prototype.addDOM = function() {
		var _this = this;

		this.element.css({ height: 'auto', width: 'auto' });

		var height = this.element.height();
		var width = this.element.width();

		// draw initial point
		if(this.data.length == 1){
			var init_pt = this.data[0];
			var $item = $('<span />');

			$item.css('position', 'absolute');
			$item.attr({'data-x': init_pt.x, 'data-y': init_pt.y});
			$item.addClass('taggd-item');
			// append on the image
			_this.wrapper.append($item);

		}

		// extend into a rectangle
		else if(this.data.length == 2){
			var $item = $('.taggd-item');
			var rect_width=0, rect_height=0;
			var left_top = {x:1, y:1};
			var right_bottom = {x:0, y:0};

			$.each(this.data, function(i, v) {

				if(v.x > 1 && v.x % 1 === 0 && v.y > 1 && v.y % 1 === 0) {
					v.x = v.x / width;
					v.y = v.y / height;
				}

				/* find left-top pt & right-bottom pt */
				if(v.x <= left_top.x){	left_top.x = v.x;	}
				if(v.y <= left_top.y){	left_top.y = v.y;	}
				if(v.x >= right_bottom.x){ right_bottom.x = v.x; }
				if(v.y >= right_bottom.y){ right_bottom.y = v.y; }
				/* find left-top pt & right-bottom pt */

			});

			rect_width = (right_bottom.x - left_top.x)*width;
			rect_height = (right_bottom.y - left_top.y)*height;

			$item.attr({'data-x': (left_top.x + right_bottom.x)/2, 'data-y': (left_top.y + right_bottom.y)/2});
			$item.css('width', rect_width + "px");
			$item.css('height', rect_height + "px");

			$item.attr({'data-left-top-x': left_top.x, 'data-left-top-y': left_top.y,
						'data-right-bottom-x': right_bottom.x, 'data-right-bottom-y': right_bottom.y});

		}

		this.element.removeAttr('style');

		if(this.options.edit) {
			this.alterDOM();
		}

		this.updateDOM();
	};

	Taggd.prototype.updateDOM = function() {
		var _this = this;

		// this.wrapper.removeAttr('style').css({
		// 	height: this.element.height(),
		// 	width: this.element.width()
		// });

		var mg_img_width = $("#mg_img_width").val();
		var mg_img_height = $("#mg_img_height").val();

		this.wrapper.find('span').each(function(i, e) {
			var $el = $(e);

			var left = $el.attr('data-x') * mg_img_width;
			var top = $el.attr('data-y') * mg_img_height;

			if($el.hasClass('taggd-item')) {
				$el.css({
					left: left - $el.outerWidth(true) / 2,
					top: top - $el.outerHeight(true) / 2
				});
			} else if($el.hasClass('taggd-item-hover')) {
				if(_this.options.align.x === 'center') {
					left -= $el.outerWidth(true) / 2;
				} else if(_this.options.align.x === 'right') {
					left -= $el.outerWidth(true);
				}

				if(_this.options.align.y === 'center') {
					top -= $el.outerHeight(true) / 2;
				} else if(_this.options.align.y === 'bottom') {
					top -= $el.outerHeight(true);
				}

				$el.attr('data-align', $el.outerWidth(true));

				$el.css({
					left: left + _this.options.offset.left,
					top: top + _this.options.offset.top
				});
			}
		});
	};


	/****************************************************************
	 * JQUERY LINK
	 ****************************************************************/

	$.fn.taggd = function(options, data) {
		return new Taggd(this, options, data);
	};
})(jQuery);
