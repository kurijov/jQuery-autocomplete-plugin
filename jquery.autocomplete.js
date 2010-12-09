/**
 * @author kurijov@gmail.com
 * autocomplete
 */

(function($) {
	$.autocomplete = {options: {}};
	$.fn.extend({
		autocomplete: function(options) {
			options.iniciator = $(this);
			options = $.extend({
				attachToBox: false,
				preFormatData: function(data) {
					return data;
				},
				afterDraw: function() {}
			}, options);
			
			if (options.attachToBox == false)
				options.attachToBox = options.iniciator;
			
			$.autocomplete.options = options;
			var inputs = $(options.iniciator);
			
			inputs.each(function() {
				var a = new autocompleter();
				a.observe($(this));
			});
		}
	});
	
	var autocompleter = function() {
		this._input 		= false;
		this._timer 		= false;
		this._cache 		= new Array();
		this._selectedItem 	= false;
		var autocomplete 	= this;
		
		this.observe = function(input)
		{
			autocomplete._input = input;
			
			input.keydown(function(e) {
				if (e.keyCode == 13 && autocomplete._selectedItem != false) {
					e.preventDefault();
					autocomplete._selectedItem.trigger('selected:event');
				}
			});
			
			input.keyup(function(e) {
				switch (e.keyCode) {
					case 13:
						return;
						break;
						
					case 40://down
						e.preventDefault();
						autocomplete.selectNextItem();
						return;
						break;
						
					case 38://up
						e.preventDefault();
						autocomplete.selectPreviousItem();
						return;
						break;
				}
				
				if (input.val() == '') {
					autocomplete._getContainer().trigger('hide:event');
					return;
				}
				
				autocomplete.getData(input.val(), function(data, initialData) {
					autocomplete.draw(data, initialData);
				});
			});
		}
		
		this.selectNextItem = function()
		{
			var item = this._selectedItem;
			if (item == false) {
				item = this._getContainer().find('div.autocompleteItem:first');
				this._selectItem(item);
			} else {
				var nextItem = item.next();
				if (nextItem.length)
					this._selectItem(nextItem);
			}
		}
		
		this.selectPreviousItem = function()
		{
			var item = this._selectedItem;
			if (item == false) {
				item = this._getContainer().find('div.autocompleteItem:last');
				this._selectItem(item);
			} else {
				var prevItem = item.prev();
				if (prevItem.length)
					this._selectItem(prevItem);
			}
		}
		
		this._selectItem = function(item)
		{
			if (this._selectedItem !== false)
				this._selectedItem.removeClass('selected');
			
			this._selectedItem = item;
			item.addClass('selected');
		}
		
		this._deselectItem = function(item)
		{
			if (this._selectedItem !== false)
				this._selectedItem.removeClass('selected');
			
			item.removeClass('selected');
			this._selectedItem = false;
		}
		
		this.getData = function(term, callback)
		{
			if (term in autocomplete._cache) {
				var data = autocomplete._cache[term];
				callback ? callback.call(null, data) : false;
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
						var initialData 	= result;
						result 				= $.autocomplete.options.preFormatData(result);
						var parsedHtml 		= [];
						$.each(result, function() {
							var _html = $.autocomplete.options.parseItem.call(null, this);
							parsedHtml[parsedHtml.length] = {html:_html, obj: this};
						});
						
						autocomplete._cache[term] = parsedHtml;
						callback ? callback.call(null, parsedHtml, initialData) : fase;
					}
				});
			}, $.autocomplete.options.wait ? $.autocomplete.options.wait : 500);
		}
		
		this.draw = function(data, initialData)
		{
			var itemsContainer = this._getContainer();
			itemsContainer.html('');
			this._selectedItem = false;
			if (data.length == 0)
				itemsContainer.html('Nothing found...');
			
			$.each(data, function() {
				var item = this;
				autocomplete._appendItemToContainer(item);
			});
			
			$.autocomplete.options.afterDraw.call(this, initialData);
			itemsContainer.show();
		}
		
		this.appendItemToContainer = function(item)
		{
			var _html = $.autocomplete.options.parseItem.call(null, item);
			_item = {html:_html, obj: item};
			autocomplete._appendItemToContainer(_item);
		}
		
		this._appendItemToContainer = function(item)
		{
			var _div 			= $('<div class="autocompleteItem">' + item.html + '</div>');
			var itemsContainer 	= this._getContainer();
			itemsContainer.append(_div);
			_div.bind('selected:event', function(e) {
				autocomplete._selectedItem = false;
				$.autocomplete.options.selected.call(autocomplete._input, this, item.obj, e);
				itemsContainer.trigger('hide:event');
			});
			
			_div.mouseover(function() {
				autocomplete._selectItem($(this));
			});
			
			_div.mouseout(function() {
				autocomplete._deselectItem($(this));
			});
			
			_div.click(function(e) {
				e.stopPropagation();
				_div.trigger('selected:event');
			});
		}
		
		/**
		 * do we need that?
		 */
		this.addHtmlToContainer = function(html, clickCallback)
		{
			
		}
		
		this._getContainer = function()
		{
			var attachToBox 	= $.autocomplete.options.attachToBox;
			
			var width 			= attachToBox.width();
			var height 			= attachToBox.outerHeight();
			var offset			= attachToBox.offset();
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
				
				itemsContainer.hide();
				itemsContainer.html('');
			}
			
			itemsContainer.css({
				width: width,
				left: offset.left,
				top: offset.top + height
			});
			
			return itemsContainer;
		}
	};
	
}) (jQuery);