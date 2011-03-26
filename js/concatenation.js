(function() {
  var BrowserStorageCookieAdapter, BrowserStorageLocalStorageAdapter;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.browserStorage = (function() {
    browserStorage.prototype._namespace = '';
    browserStorage.prototype.enabled = true;
    browserStorage.prototype._lifetime = false;
    browserStorage.prototype._adapter = false;
    function browserStorage(namespace, lifetime) {
      if (lifetime == null) {
        lifetime = 3600;
      }
      this._namespace = namespace + '.';
      this._lifetime = lifetime;
    }
    browserStorage.prototype.getAdapter = function() {
      if (this._adapter === false) {
        if (localStorage) {
          this._adapter = new BrowserStorageLocalStorageAdapter();
        } else {
          this._adapter = new BrowserStorageCookieAdapter();
        }
      }
      return this._adapter;
    };
    browserStorage.prototype.set = function(key, value) {
      var toStore;
      if (this.enabled === !true) {
        return false;
      }
      toStore = {
        expires: this._lifetime ? this._lifetime * 1000 + new Date().getTime() : false,
        value: value
      };
      return this.getAdapter().set(this._namespace + key, toStore);
    };
    browserStorage.prototype.get = function(key) {
      var item;
      if (this.enabled === !true) {
        return false;
      }
      item = this.getAdapter().get(this._namespace + key);
      if (item && (item.expires === false || item.expires > new Date().getTime())) {
        return item.value;
      } else {
        return this.remove(key);
      }
    };
    browserStorage.prototype.remove = function(key) {
      return this.getAdapter().remove(this._namespace + key);
    };
    return browserStorage;
  })();
  BrowserStorageLocalStorageAdapter = (function() {
    function BrowserStorageLocalStorageAdapter() {}
    BrowserStorageLocalStorageAdapter.prototype.set = function(key, toStore) {
      var toSaveString;
      toSaveString = JSON.stringify(toStore);
      return localStorage.setItem(key, toSaveString);
    };
    BrowserStorageLocalStorageAdapter.prototype.get = function(key) {
      var item;
      item = localStorage.getItem(key);
      try {
        return item = JSON.parse(item);
      } catch (error) {
        if (console && console.log) {
          return console.log('erorr in converting json string to object in LocalStorage adapter object');
        }
      }
    };
    BrowserStorageLocalStorageAdapter.prototype.remove = function(key) {
      return localStorage.removeItem(key);
    };
    return BrowserStorageLocalStorageAdapter;
  })();
  BrowserStorageCookieAdapter = (function() {
    function BrowserStorageCookieAdapter() {}
    BrowserStorageCookieAdapter.prototype.set = function(key, toStore) {
      var toSaveString;
      toSaveString = JSON.stringify(toStore);
      return this._setCookie(key, toSaveString);
    };
    BrowserStorageCookieAdapter.prototype.get = function(key) {
      var item;
      item = this._getCookie(key);
      try {
        return item = JSON.parse(item);
      } catch (error) {
        if (console && console.log) {
          return console.log('erorr in converting json string to object in COOKIE adapter object');
        }
      }
    };
    BrowserStorageCookieAdapter.prototype.remove = function(key) {
      return this._setCookie(key, '', 'Mon, 01-Jan-1986 00:00:00 GMT');
    };
    BrowserStorageCookieAdapter.prototype._setCookie = function(name, value, expires, path, domain, secure) {
      var cookie;
      if (!value) {
        value = '';
      }
      cookie = name + "=" + escape(value) + (expires ? "; expires=" + expires : "") + (path ? "; path=" + path : "") + (domain ? "; domain=" + domain : "") + (secure ? "; secure" : "");
      document.cookie = cookie;
      return void 0;
    };
    BrowserStorageCookieAdapter.prototype._getCookie = function(name) {
      var cookie, end, offset, search, setStr;
      cookie = " " + document.cookie;
      search = " " + name + "=";
      setStr = null;
      offset = 0;
      end = 0;
      if (cookie.length > 0) {
        offset = cookie.indexOf(search);
        if (offset !== -1) {
          offset += search.length;
          end = cookie.indexOf(";", offset);
          if (end === -1) {
            end = cookie.length;
          }
          setStr = unescape(cookie.substring(offset, end));
        }
      }
      return setStr;
    };
    return BrowserStorageCookieAdapter;
  })();
  String.prototype.trim = function() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  };
  String.prototype.addSlashes = function() {
    return this.replace(/[\\\/"']/g, '\\$&').replace(/\u0000/g, '\\0');
  };
  this.Dropdown = (function() {
    Dropdown.prototype.container = false;
    Dropdown.prototype.itemsContainer = false;
    Dropdown.prototype.inputValue = '';
    Dropdown.prototype.keys = {
      down: 40,
      up: 38,
      right: 39,
      left: 37,
      enter: 13
    };
    Dropdown.prototype.options = false;
    Dropdown.prototype.cache = false;
    function Dropdown(options) {
      var enterOccured, timer;
      this.container = false;
      this.itemsContainer = false;
      this.options = {
        timeout: 200,
        cacheName: 'dropdown',
        containerClass: '',
        offset: {
          x: 0,
          y: 0
        },
        requestType: 'get',
        beforeRequest: function(data) {
          return data;
        },
        parseResponse: function(data) {
          return data;
        },
        parseItem: function(item) {
          return item.replace('&amp;', '&');
        },
        parseHover: function(item) {
          return false;
        },
        valueOnHover: true,
        onActivate: function(item) {},
        afterCreate: function() {},
        attachTo: false
      };
      this.options = $.extend(this.options, options);
      this.cache = new browserStorage(this.options.cacheName, 25);
      if (!this.options.attachTo) {
        this.options.attachTo = this.options.element;
      }
      timer = false;
      if (this.options.label) {
        this.options.element.focus(__bind(function() {
          return this.options.label.hide();
        }, this));
        this.options.element.blur(__bind(function() {
          if (this.options.element.val().trim() === '') {
            return this.options.label.show();
          }
        }, this));
      }
      enterOccured = false;
      this.options.element.keydown(__bind(function(event) {
        enterOccured = false;
        switch (event.keyCode) {
          case this.keys.enter:
            event.preventDefault();
            event.stopPropagation();
            this.itemsContainer.find('li.active').trigger('click');
            this.hide();
            enterOccured = true;
            return false;
        }
      }, this));
      this.options.element.keyup(__bind(function(event) {
        if (enterOccured) {
          return;
        }
        switch (event.keyCode) {
          case this.keys.down:
            if (this.container) {
              this.selectNext();
            }
            return;
          case this.keys.up:
            if (this.container) {
              this.selectPrevious();
            }
            return;
          case this.keys.left:
          case this.keys.right:
            return;
        }
        if (this.options.element.val().trim() === '') {
          this.getContainer().hide();
          clearTimeout(timer);
          return;
        }
        clearTimeout(timer);
        return timer = setTimeout(__bind(function() {
          var container;
          this.inputValue = this.options.element.val();
          container = this.getContainer();
          return this.getData(this.options.element.val(), __bind(function(items) {
            var itemId, value;
            this.itemsContainer.css({
              top: 0
            });
            this.itemsContainer.html('');
            for (itemId in items) {
              value = items[itemId];
              this.appendItem(this.itemsContainer, itemId, value);
            }
            return this.options.afterCreate.call(this);
          }, this));
        }, this), this.options.timeout);
      }, this));
    }
    Dropdown.prototype.appendItem = function(container, itemId, value) {
      var itemDom, parsedItem;
      parsedItem = this.options.parseItem.call(this, value);
      itemDom = $('<li />', {
        "class": 'dropdown-item',
        html: $('<a />').html(parsedItem),
        mouseenter: __bind(function() {
          return this.selectItem(itemDom, value);
        }, this),
        mouseleave: __bind(function() {
          return this.deselectItem(itemDom);
        }, this),
        click: __bind(function() {
          return this.activateItem(itemDom, itemId, value);
        }, this)
      });
      return container.append(itemDom);
    };
    Dropdown.prototype.addHtml = function(html) {
      var itemDom;
      itemDom = $('<li />', {
        html: html
      });
      return this.getContainer().find('ul').append(itemDom);
    };
    Dropdown.prototype.appendCustom = function(text, onActivate) {
      var itemDom;
      itemDom = $('<li />', {
        "class": 'dropdown-item',
        html: $('<a />').html(text),
        mouseenter: __bind(function() {
          return this.selectItem(itemDom);
        }, this),
        mouseleave: __bind(function() {
          return this.deselectItem(itemDom);
        }, this),
        click: __bind(function() {
          return onActivate.call();
        }, this)
      });
      return this.getContainer().find('ul').append(itemDom);
    };
    Dropdown.prototype.selectNext = function() {
      var activeItem;
      activeItem = this.container.find('li.dropdown-item.active');
      if (activeItem.length && activeItem.next().length) {
        return this.selectItem(activeItem.next());
      } else {
        return this.selectItem(this.container.find('li.dropdown-item:first'));
      }
    };
    Dropdown.prototype.hasNext = function() {
      var activeItem;
      activeItem = this.container.find('li.dropdown-item.active');
      if (activeItem.length && activeItem.next().length) {
        return true;
      } else {
        return false;
      }
    };
    Dropdown.prototype.selectPrevious = function() {
      var activeItem;
      activeItem = this.container.find('li.dropdown-item.active');
      if (activeItem.length && activeItem.prev().length) {
        return this.selectItem(activeItem.prev());
      } else {
        return this.selectItem(this.container.find('li.dropdown-item:last'));
      }
    };
    Dropdown.prototype.activateItem = function(item, itemId, value) {
      var selectedName, setValue;
      if (this.options.valueOnHover) {
        setValue = this.options.parseHover(rawItem);
        if (!setValue) {
          setValue = item.find('a').html().replace('&amp;', '&');
        }
        selectedName = setValue;
        this.options.element.val(selectedName);
        this.inputValue = selectedName;
      }
      return this.options.onActivate.call(this, item, itemId, value);
    };
    Dropdown.prototype.selectItem = function(item, rawItem) {
      var animate, containerHeight, containerOffset, itemOffset, items, scrollDownAt, setValue;
      if (!item.length) {
        return;
      }
      items = this.container.find('.active');
      items.removeClass('active');
      item.addClass('active');
      item.find('a').addClass('active');
      if (this.options.valueOnHover) {
        setValue = this.options.parseHover(rawItem);
        if (!setValue) {
          setValue = (item.find('a').html() || '').replace('&amp;', '&');
        }
        this.options.element.val(setValue);
      }
      containerOffset = this.container.offset();
      containerHeight = this.container.height();
      itemOffset = item.offset();
      scrollDownAt = containerHeight / 4.6;
      if (itemOffset.top > containerOffset.top + containerHeight - scrollDownAt) {
        animate = itemOffset.top - (containerOffset.top + containerHeight) + scrollDownAt;
        if (!this.hasNext()) {
          animate = animate - item.height();
        }
        return this.itemsContainer.animate({
          top: '-=' + animate
        }, 'fast');
      } else if (itemOffset.top < containerOffset.top) {
        animate = containerOffset.top - itemOffset.top;
        return this.itemsContainer.animate({
          top: '+=' + animate
        }, 'fast');
      }
    };
    Dropdown.prototype.deselectItem = function(item) {
      item.removeClass('active');
      return item.find('a').removeClass('active');
    };
    Dropdown.prototype.getData = function(term, callback) {
      var cachedResponse, data, parsedCache;
      if (!this.cache.get(term)) {
        data = this.options.beforeRequest.call(this, {
          startsWith: term
        });
        return $.ajax({
          url: this.options.url,
          type: this.options.requestType,
          data: data,
          dataType: 'json',
          success: __bind(function(response) {
            var parsed;
            this.cache.set(term, response);
            parsed = this.options.parseResponse(response);
            return callback.call(this, parsed);
          }, this)
        });
      } else {
        cachedResponse = this.cache.get(term);
        parsedCache = this.options.parseResponse(cachedResponse);
        return callback.call(this, parsedCache);
      }
    };
    Dropdown.prototype.getContainer = function() {
      var body, container;
      if (!this.container) {
        container = $('<div />', {
          "class": 'dropdown-wrapper ' + this.options.containerClass,
          mouseout: __bind(function() {
            if (this.options.valueOnHover) {
              return this.options.element.val(this.inputValue);
            }
          }, this)
        });
        this.itemsContainer = $('<ul />');
        container.append(this.itemsContainer);
        container.append('<h5 id="fader" />');
        this.container = container;
        body = $('body');
        body.append(this.container);
        body.click(__bind(function() {
          return this.hide();
        }, this));
      }
      this.show();
      return this.container;
    };
    Dropdown.prototype.show = function() {
      var containerHeight, containerTop, height, offset, width;
      width = this.options.attachTo.innerWidth();
      height = this.options.attachTo.outerHeight();
      offset = this.options.attachTo.offset();
      containerTop = offset.top + height + this.options.offset.y;
      containerHeight = this.options.height || ($('body').height() - containerTop);
      this.container.css({
        left: offset.left,
        top: containerTop,
        width: width,
        position: 'absolute',
        border: '1px solid'
      });
      return this.container.show();
    };
    Dropdown.prototype.hide = function() {
      return this.container.hide();
    };
    return Dropdown;
  })();
  (function($) {
    return $.fn.extend({
      dropdown: function(options) {
        var defaultOptions, parser, totalItems;
        totalItems = 0;
        defaultOptions = {
          element: this,
          valueOnHover: false,
          attachTo: this.parent(),
          parseResponse: function(data) {
            return data.items;
          },
          afterCreate: function() {
            this.addHtml(totalItems + ' result' + (totalItems > 1 || totalItems === 0 ? 's' : ''));
            return totalItems = 0;
          }
        };
        options = $.extend(defaultOptions, options);
        parser = options.parseItem;
        options.parseItem = function(item) {
          totalItems++;
          return parser.call(this, item);
        };
        return new Dropdown(options);
      }
    });
  })(jQuery);
}).call(this);
