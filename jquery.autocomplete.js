/**
 * @author kurijov@gmail.com
 * autocomplete
 */

(function($) {
	$.autocomplete = {options: {}};
	$.fn.extend({
		autocomplete: function(options) {
			options.iniciator = $(this);
			options = $.extend({}, options);
			$.autocomplete.options = options;
			var inputs = $(options.iniciator);
			
			inputs.each(function() {
				var a = new autocompleter();
				a.observe($(this));
			});
		}
	});
	
	var autocompleter = function() {
		this._input = false;
		this._timer = false;
		this._cache = new Array();
		var autocomplete = this;
		
		this.observe = function(input)
		{
			autocomplete._input = input;
			input.keyup(function() {
				autocomplete.getData(input.val(), function(data) {
					autocomplete.draw(data);
				});
			});
		}
		
		this.getData = function(term, callback)
		{
			if (term in autocomplete._cache) {
				var data = autocomplete._cache[term];
				callback ? callback.call(null, data) : fase;
				return;
			}
			
			clearTimeout(autocomplete._timer);
			autocomplete._timer = setTimeout(function() {
				var container = autocomplete._getContainer();
				container.html('Loading...');
				container.show();
				$.ajax({
					type: $.autocomplete.options.requestType ? $.autocomplete.options.requestType : 'GET',
					url: $.autocomplete.options.url,
					data: $.autocomplete.options.varName + '=' + autocomplete._input.val(),
					dataType:'json',
					success: function(result){
						var parsedHtml = [];
						$.each(result, function() {
							var _html = $.autocomplete.options.parseItem.call(null, this);
							parsedHtml[parsedHtml.length] = {html:_html, obj: this};
						});
						
						autocomplete._cache[term] = parsedHtml;
						callback ? callback.call(null, parsedHtml) : fase;
					}
				});
			}, $.autocomplete.options.wait ? $.autocomplete.options.wait : 500);
		}
		
		this.draw = function(data)
		{
			var itemsContainer = this._getContainer();
			
			$.each(data, function() {
				var item = this;
				var _div = $('<div class="autocompleteItem">' + item.html + '</div>');
				itemsContainer.append(_div);
				_div.bind('selected:event', function() {
					$.autocomplete.options.selected.call(null, this, item.obj);
					itemsContainer.trigger('hide:event');
				});
				_div.click(function() {
					_div.trigger('selected:event');
				});
			});
			
			itemsContainer.show();
		}
		
		this._getContainer = function()
		{
			var width 			= this._input.outerWidth();
			var height 			= this._input.outerHeight();
			var offset			= this._input.offset();
			var itemsContainer	= $('#itemsContainer');
			if (!itemsContainer.length) {
				var itemsContainer	= $('<div id="itemsContainer" class="itemsContainer"></div>');
				itemsContainer.bind('hide:event', function() {
					itemsContainer.hide();
				});
				var body = $('body');
				body.append(itemsContainer);
				body.click(function() {
					itemsContainer.trigger('hide:event');
				});
			}
			
			itemsContainer.html('');
			
			itemsContainer.css({
				width: width,
				left: offset.left,
				top: offset.top + height,
				display: 'none'
			});
			
			return itemsContainer;
		}
	};
	
}) (jQuery);