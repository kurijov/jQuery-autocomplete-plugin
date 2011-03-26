String::trim = ->
	this.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
	
String::addSlashes = ->
	this.replace(/[\\\/"']/g, '\\$&').replace(/\u0000/g, '\\0')

class @Dropdown
	container: false
	itemsContainer: false
	inputValue: ''
	keys:
		down	: 40
		up		: 38
		right	: 39
		left	: 37
		enter	: 13
	options: false
		
	cache: false

	constructor: (options)->
		@container = false
		@itemsContainer = false
		@options = 
			timeout: 200
			cacheName: 'dropdown'
			containerClass: ''
			offset:
				x:0
				y:0
			requestType: 'get'
			beforeRequest: (data) ->
				data
			parseResponse: (data) ->
				data
			parseItem : (item) ->
				item.replace '&amp;', '&'
			parseHover: (item)->
				return false
			valueOnHover: yes
			onActivate: (item) ->
			afterCreate: ->
			attachTo: false
	
		@options	=	$.extend @options, options
		@cache		=	new browserStorage(@options.cacheName, 25)
		@options.attachTo = @options.element if not @options.attachTo
		timer = false
		
		if @options.label
			@options.element.focus =>
				@options.label.hide()
			@options.element.blur =>
				@options.label.show() if @options.element.val().trim() is ''
		
		enterOccured = false
		@options.element.keydown (event) =>
			enterOccured = false
			switch event.keyCode
				when @keys.enter
					event.preventDefault()
					event.stopPropagation()
					@itemsContainer.find('li.active').trigger 'click'
					@hide()
					enterOccured = true
					return false
		
		@options.element.keyup (event) =>
			return if enterOccured
			switch event.keyCode
				when @keys.down 
					@selectNext() if @container
					return
				when @keys.up 
					@selectPrevious() if @container
					return
				when @keys.left, @keys.right
					return
		
			if @options.element.val().trim() is ''
				@getContainer().hide()
				clearTimeout timer
				return
				
				
			clearTimeout timer
			timer = setTimeout ()=>
				@inputValue = @options.element.val()
				container 	= @getContainer()
				#container.html 'Loading...'
				@getData @options.element.val(), (items) =>
					@itemsContainer.css
						top: 0
					@itemsContainer.html ''
					@appendItem @itemsContainer, itemId, value for itemId, value of items
					@options.afterCreate.call @
					#@showFader()
			, @options.timeout
			
	appendItem : (container, itemId, value) ->
		parsedItem 	=	@options.parseItem.call @, value
		itemDom		=	$ '<li />', 
							class: 'dropdown-item',
							html: $('<a />').html(parsedItem),
							mouseenter: => 
								@selectItem itemDom, value
							mouseleave: => 
								@deselectItem itemDom
							click: =>
								@activateItem itemDom, itemId, value
							
		container.append itemDom
		
	addHtml: (html) ->
		itemDom		=	$ '<li />'
			html: html
		
		@getContainer().find('ul').append itemDom	
		
	appendCustom : (text, onActivate) ->
		itemDom		=	$ '<li />', 
							class: 'dropdown-item',
							html: $('<a />').html(text),
							mouseenter: => 
								@selectItem itemDom,
							mouseleave: => 
								@deselectItem itemDom
							click: =>
								onActivate.call()
								
		@getContainer().find('ul').append itemDom
		
	selectNext: ->
		activeItem	=	@container.find 'li.dropdown-item.active'
		if activeItem.length and activeItem.next().length
			@selectItem activeItem.next()
		else
			@selectItem @container.find 'li.dropdown-item:first'
			
	hasNext: ->
		activeItem	=	@container.find 'li.dropdown-item.active'
		if activeItem.length and activeItem.next().length
			true
		else
			false
	
	selectPrevious: ->
		activeItem	=	@container.find 'li.dropdown-item.active'
		if activeItem.length and activeItem.prev().length
			@selectItem activeItem.prev()
		else
			@selectItem @container.find 'li.dropdown-item:last'
		
	activateItem: (item, itemId, value) ->
		if @options.valueOnHover
			setValue = @options.parseHover rawItem
			if not setValue
				setValue = item.find('a').html().replace '&amp;', '&'
				
			selectedName = setValue
			@options.element.val selectedName
			@inputValue = selectedName
		
		@options.onActivate.call @, item, itemId, value
		
	selectItem: (item, rawItem) ->
		return if not item.length

		items = @container.find('.active')
		items.removeClass('active')
		
		item.addClass 'active'
		item.find('a').addClass 'active'
		
		if @options.valueOnHover
			setValue = @options.parseHover rawItem
			if not setValue
				setValue = (item.find('a').html() or '').replace('&amp;', '&')
	
			@options.element.val setValue
		
		containerOffset = @container.offset()
		containerHeight = @container.height()
		itemOffset		= item.offset()
		
		scrollDownAt = containerHeight / 4.6
		if itemOffset.top > containerOffset.top + containerHeight - scrollDownAt
			animate = (itemOffset.top - (containerOffset.top + containerHeight) + scrollDownAt)
			
			if not @hasNext()
				animate = animate - item.height()

			@itemsContainer.animate
					top:'-=' + animate
				, 'fast'
		else if itemOffset.top < containerOffset.top
			animate = containerOffset.top - itemOffset.top
			@itemsContainer.animate
					top: '+=' + animate
				, 'fast'
		
	deselectItem: (item) ->
		item.removeClass 'active'
		item.find('a').removeClass 'active'
		
	getData: (term, callback) ->
		if not @cache.get term
			data = @options.beforeRequest.call @, 
				startsWith: term
			$.ajax 
				url: @options.url
				type: @options.requestType
				data: data
				dataType: 'json'
				success: (response) =>
					@cache.set term, response
					parsed = @options.parseResponse response
					callback.call @, parsed
		else
			cachedResponse = @cache.get term
			parsedCache = @options.parseResponse cachedResponse
			callback.call @, parsedCache
			
	getContainer: ->
		if not @container
			container = $ '<div />', 
								class: 'dropdown-wrapper ' + @options.containerClass,
								mouseout: =>
									if @options.valueOnHover
										@options.element.val @inputValue

			@itemsContainer = $ '<ul />'
			container.append @itemsContainer
			container.append '<h5 id="fader" />'
			@container	= container
			body		= $('body')
			body.append @container
			body.click =>
				@hide()
				
		@show()
		@container
		
	show: ->
		width	=	@options.attachTo.innerWidth()
		height	=	@options.attachTo.outerHeight()
		offset	=	@options.attachTo.offset()
			
		containerTop = offset.top + height + @options.offset.y
		containerHeight = @options.height or ($('body').height() - containerTop)
		@container.css
			left: offset.left
			top: containerTop
			width: width
			#height: containerHeight
			position: 'absolute'
			border: '1px solid'
			
		@container.show()
		#@container.find('ul').css 'min-height', containerHeight
		
	hide: ->
		@container.hide()


(($) ->
	$.fn.extend
		dropdown: (options) ->
			totalItems = 0
			
			defaultOptions = 
				element: @
				valueOnHover: no
				attachTo: @parent()
				parseResponse: (data) ->
					data.items
				afterCreate: ->
					@addHtml totalItems + ' result' + (if totalItems > 1 or totalItems is 0 then 's' else '')
					totalItems = 0
					
			options = $.extend defaultOptions, options
			parser = options.parseItem
			options.parseItem = (item) ->
				totalItems++
				parser.call @, item
				
			new Dropdown options
)(jQuery)			
			
			
			
			
			
			
			
			
			
			
