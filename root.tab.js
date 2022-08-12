
class HTMLTabAttribute extends HTMLCustomAttribute {

	constructor(element) {
		super(element)
		element.tab = this;
	}

	#bindings = null;

	get bindings() {
		if (this.#bindings == null) {
			let bindings = this.getAttribute('bindings', '');
			if (bindings == '') {
				if (this.element.nodeName == 'TABLE') {
					this.#bindings = [...this.element.querySelectorAll('TR')];
				}
				else {
					this.#bindings = [...this.element.children];
				}
			}
			else if (typeof (bindings) == 'string') {
				this.#bindings = [...this.element.querySelectorAll(bindings)];
			}
	
			if (this.#bindings.length == 0) {
				throw new Error('Must specify "bindings" property to bind a TAB attribute.');
			}
		}
		return this.#bindings;
	}

	#excludings = null;

	get excludings() {
		if (this.#excludings == null) {
			this.#excludings = this.getAttribute('excludings', '')?.toLowerCase().split(',').map(e => e.trim()).filter(e => e != '') ?? [];
		}
		return this.#excludings;
	}
	
	get defaultClass() {
		return this.getAttribute('default-class', '');
	}

	set defaultClass(className) {
		this.setAttribute('default-class', className);
	}

	get selectedClass() {
		return this.getAttribute('selected-class', '');
	}

	set selectedClass(className) {
		this.setAttribute('selected-class', className);
	}

	get successText() {
		return this.getAttribute('success-text', '');
	}

	set successText(text) {
		this.setAttribute('success-text', text);
	}

	get failureText() {
		return this.getAttribute('failure-text', '');
	}

	set failureText(text) {
		this.setAttribute('failure-text', text);
	}

	get exceptionText() {
		return this.getAttribute('exception-text', 'Exception: {data}');
	}

	set exceptionText(text) {
		this.setAttribute('exception-text', text);
	}

	get value () {
		return this.element.getAttribute('value');
	}

	set value (value) {
		this.element.setAttribute('value', value);
	}

	get text () {
		return this.element.getAttribute('text');
	}

	set text (text) {
		return this.element.setAttribute('text', text);
	}

	get calloutPosition() {
		return this.getAttribute('callout') ?? this.getAttribute('callout-position');
	}

	get messageDuration() {
		return this.getAttribute('message') ?? this.getAttribute('message-duration');
	}

	status = 'success';

	set hintText(text) {
		if (text != '') {
			if (this.calloutPosition != null || this.messageDuration == null) {
				Callout(text).position(this.#selectedElement, this.calloutPosition).show();
			}
	
			if (this.messageDuration != null) {
				window.Message?.[this.status != 'success' ? 'red' : 'green'](text).show(this.messageDuration.toFloat(0));
			}
		}		
	}

	#selectedElement = null;

	get selectedElement() {
		return this.#selectedElement;
	}

	change (element, trigger = true) {

		if (typeof(element) == 'string') {
			element = $s(element);
		}
	
		if (element != null && this.selectedElement != element) {
			this.#selectedElement?.setClass(this.defaultClass.$css(this.#selectedElement));
			element.className = this.selectedClass.$css(element);
			this.#selectedElement = element;
	
			element.getAttribute('to-hide')?.$$().forEach(a => a.hide());
			element.getAttribute('to-show')?.$$().forEach(a => a.show());

			this.element.setAttribute('text', element.getAttribute('text'));
			this.element.setAttribute('value', element.getAttribute('value'));
	
			if (trigger) {
				this.dispatch('ontabchange', element);
			}		
		}
	}

	initialize() {

		for (let i = 0; i < this.excludings.length; i++) {
			let e = this.excludings[i];
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
				e = parseInt(e);
				if (e < 0) {
					e = this.bindings.length + e;
				}
				this.bindings[e] = null;
			}
		}
	
		let tab = this;
	
		Event.interact(this.element);
	
		this.bindings.filter(e => e != null).forEach(element => {
	
			if ($parseBoolean(element.getAttribute('selected'), false, this) || element.className == tab.selectedClass.$css(element)) {
				tab.change(element, false);
			}
			else if (element.className == '') {
				element.className = tab.defaultClass;
			}
	
			element.on('click', function(ev) {
				if (ev.button == 0) {
					tab.change(element);
	
					if (tab['ontabchange+'] != null) {			
						$FIRE(tab, 'ontabchange+',
							function(data) {
								tab.status = 'success';
								tab.hintText = tab.successText.$p(element, data);								
							},
							function(data) {
								tab.status = 'failure';
								tab.hintText = tab.failureText.$p(element, data);
							},
							function(error) {
								tab.status = 'exception';
								tab.hintText = tab.exceptionText.$p(element, { data: error, error: error });
							});
					}				
				}
			});
		});
	}
}

HTMLCustomElement.defineEvents(HTMLTabAttribute.prototype, {
	'ontabchange': 'onTabChanged',
	'ontabchange+': 'onTabChanged+'
})


//用某个元素的属性当值, 当使用子元素的样式切换时会用到
String.prototype.$css = function(element) {
    let css = this.toString();
    if (css.startsWith('[') && css.endsWith(']')) {
        css = css.trimPlus('[', ']');
        css = element[css] || element.getAttribute(css);
    }
    return css;
}


HTMLTabAttribute.initializeAll = function () {
	for (let tab of document.querySelectorAll('[tab]')) {
		new HTMLTabAttribute(tab).initialize();
	}	
};

document.on('post', function() {
	HTMLTabAttribute.initializeAll();	
});