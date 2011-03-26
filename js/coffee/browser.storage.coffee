class @browserStorage
	_namespace: ''
	enabled: true
	#if false then it doesnt expire
	_lifetime: false
	_adapter: false
	constructor: (namespace, lifetime = 3600) ->
		@_namespace	= namespace + '.'
		@_lifetime	= lifetime
		
	getAdapter: ->
		if @_adapter is false
			if localStorage
				@_adapter = new BrowserStorageLocalStorageAdapter()
			else
				#fallback to cookies
				@_adapter = new BrowserStorageCookieAdapter()
		
		return @_adapter
		
	set: (key, value) ->
		return false if @enabled is not true
		
		toStore = 
			expires: if @_lifetime then @_lifetime * 1000 + new Date().getTime() else false
			value: value
	
		@getAdapter().set @_namespace + key, toStore
		
	get: (key) ->
		return false if @enabled is not true
		
		item = @getAdapter().get @_namespace + key
		if item and (item.expires is false or item.expires > new Date().getTime())
			return item.value
		else
			@remove key
			
	remove: (key) ->
		@getAdapter().remove @_namespace + key
	
		
class BrowserStorageLocalStorageAdapter
	set: (key, toStore) ->
		toSaveString = JSON.stringify toStore
		localStorage.setItem key, toSaveString
		
	get: (key) ->
		item = localStorage.getItem key
		try
			item = JSON.parse item
		catch error
			console.log 'erorr in converting json string to object in LocalStorage adapter object' if console and console.log
			
	remove: (key) ->
		localStorage.removeItem key
		
class BrowserStorageCookieAdapter
	set: (key, toStore) ->
		toSaveString = JSON.stringify toStore
		@_setCookie key, toSaveString
		
	get: (key) ->
		item = @_getCookie key
		try
			item = JSON.parse item
		catch error
			console.log 'erorr in converting json string to object in COOKIE adapter object' if console and console.log
	
	remove: (key) ->
		@_setCookie key, '', 'Mon, 01-Jan-1986 00:00:00 GMT'
	
	_setCookie: (name, value, expires, path, domain, secure) ->
		value = '' if not value
		cookie = name + "=" + escape(value) + (if expires then "; expires=" + expires else "" ) + (if path then "; path=" + path else "") + (if domain then "; domain=" + domain else "") + (if secure then "; secure" else "")
		document.cookie = cookie
		undefined
	
	_getCookie: (name) ->
		cookie = " " + document.cookie;
		search = " " + name + "=";
		setStr = null;
		offset = 0;
		end = 0;
		if cookie.length > 0
			offset = cookie.indexOf(search)
			if offset isnt -1
				offset += search.length;
				end = cookie.indexOf ";", offset
				if end is -1
					end = cookie.length;
				setStr = unescape(cookie.substring(offset, end))
				
		return setStr
