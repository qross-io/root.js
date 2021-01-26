
FocusView = function(element) {

	this.element = element;
	this.name = this.element.id;
	if (this.name == '') {
		this.name = 'FocusView_' + document.components.size;
	}

	this.elements = element.getAttribute('elements') || '';
	if (this.elements == '') {
		if (this.element.nodeName == 'TABLE') {
			this.elements = 'TR';
		}
		else {
			this.elements = this.element.children;
		}		
	}
	if (typeof (this.elements) == 'string' && this.elements != '') {
		this.elements = element.querySelectorAll(this.elements);
	}
	if (this.elements == null || this.elements == '') {
		throw new Error('Must specify "elements" property to bind FocusView.');
	}

	this.bindings = [];
	for (let e of this.elements) {
		this.bindings.push(e);
	}

	this.exclusions = (element.getAttribute('exclusions') || '').split(',');
	for (let i = 0; i < this.exclusions.length; i++) {
		let e = this.exclusions[i].trim().toLowerCase();
		if (e == 'odd') {
			for (let j = 0; j < this.bindings.length; j++) {
				if (j % 2 == 1) {
					this.bindings[j] = null;
				}
			}
		}
		else  if (e == 'even') {
			for (let j = 0; j < this.bindings.length; j++) {
				if (j % 2 == 0) {
					this.bindings[j] = null;
				}
			}
		}
		else {			
			e = e.replace(/n/g, this.bindings.length - 1);
			this.bindings[eval(e)] = null;
		}
	}
	
	this.defaultClass = element.getAttribute('default-class') || element.getAttribute('defaultClass') || '';
	this.focusClass = element.getAttribute('focus-class') || element.getAttribute('focusClass') || '';

	this.nodeName = 'FOCUSVIEW';
	this.tagName = 'FOCUSVIEW';
	if (this.name != '') {
		document.components.set(this.name, this);
	}	
}

$focus = function(name) {
	let focus = $t(name);
    if (focus != null && focus.tagName == 'FOCUSVIEW') {
        return focus;
    }
    else {
        return null;
    }
}

//FocusView.prototype.hoverElement = null;
FocusView.prototype.focusElement = null;
FocusView.prototype.onchange = null;

FocusView.prototype.on = function(eventName, func) {
	Event.bind(this.name, eventName, func);
	return this;
}

//用某个元素的属性当值, 当使用子元素的样式切换时会用到
String.prototype.$css = function(element) {
    let css = this.toString();
    if (css.startsWith('[') && css.endsWith(']')) {
        css = css.$trim('[', ']');
        css = element[css] || element.getAttribute(css);
    }
    return css;
}

FocusView.prototype.change = function(element) {

	if (typeof(element) == 'string') {
		element = $s(element);
	}

	if (element != null && this.focusElement != element) {
		if (this.focusElement != null) {
			this.focusElement.className = this.defaultClass.$css(this.focusElement);
		}
		element.className = this.focusClass.$css(element);
		this.focusElement = element;

		$listen(this.name).execute('onchange', element);
	}
}

FocusView.prototype.bind = function() {

	let focusView = this;

	this.bindings.filter(element => element != null).forEach(element => {

		if ($parseBoolean(element.getAttribute('focused'), false)) {
			element.className = focusView.focusClass.$css(element);
		}

		if (element.className == '') {
			element.className = focusView.defaultClass.$css(element);
		}
		else if (element.className == focusView.focusClass.$css(element)) {
			focusView.focusElement = element;
		}

		element.onclick = function(ev) {
			if (ev.button == 0) {
				focusView.change(element);
			}
		}	    
	});
}

FocusView.initialize = function(selector) {
   let focusView = $s(selector);
   new FocusView(focusView).on('change', focusView.getAttribute('onchange')).bind();
}

FocusView.initializeAll = function () {
	for (let focusView of document.querySelectorAll('[focusview]')) {
		new FocusView(focusView).on('change', focusView.getAttribute('onchange')).bind();
	}	
};

$finish(function() {
	FocusView.initializeAll();	
});