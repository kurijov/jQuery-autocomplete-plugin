$(function() {
	var highlight = function(str, highlight) 
	{
	  var regex = new RegExp(highlight, 'gi');
	  return str.replace(regex, '<span class="highlight">' + highlight + '</span>');
	}
	
	var options = {
	  url: 'json.sample.txt',
	  beforeRequest: function (data) {
	  	var input = this.options.element;
	  	data.tablename = input.attr('tablename');
	  	data.tablecode = input.attr('tablecode');
	  	data.tabledesc = input.attr('tabledesc');
	  	return data;
	  },
	  parseItem: function(item) {
		var result = '';
		switch (item.type) {
		  case 'unit':
		    result = highlight(item.address, this.options.element.val());
		    break;
		  case 'colleague':
		    var container = $('<div />');
		    var name = $('<div />', {
		      "class": 'name',
		      html: highlight(item.name, this.options.element.val()) + '<i>(Collegue)</i>'
		    });
		    var phone = $('<div />', {
		      "class": 'phone',
		      html: 'Phone:' + (highlight(item.phone, this.options.element.val()) || 'Unavailable')
		    });
		    var email = $('<div />', {
		      "class": 'email',
		      html: 'Email:' + (highlight(item.email, this.options.element.val()) || 'Unavailable')
		    });
		    container.append(name).append(phone).append(email);
		    result = container;
		    break;
		  default:
		    false;
		}
		
		return result;
	  },
	  
	  onActivate: function(item, id, rawItem) {
	  	switch (rawItem.type) {
		  case 'unit':
		    this.options.element.val(rawItem.address);
		    break;
		  case 'colleague':
		  	this.options.element.val(rawItem.name);
		    break;
		  default:
		    false;
		}
		return console.log('activated item', this, this.options.element, rawItem, id, item);
	  }
	}
	
	$('.autocomplete').dropdown(options);
	$('.anotherautocomplete').dropdown(options);
});
