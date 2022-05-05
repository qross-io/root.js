
class Tab {
	constructor(element) {
		$initialize(this)
        .with(element)
        .declare({
			name: 'Tab_' + document.components.size,
			bindings: '',
			excludes: '', //0, -1
			defaultClass: '',
			selectedClass: '',

			successText: '',
			failureText: '',
			exceptionText: '',

			onchange: null, //function(beforeOption, ev) { },
            'onchange+': null, //server side event
            'onchange+success': null,
            'onchange+failure': null,
            'onchange+exception': null,
            'onchange+completion': null,
		})
		.elementify(element => {
			this.element = element;
			if (this.bindings == '') {
				if (this.element.nodeName == 'TABLE') {
					this.bindings = [...this.element.querySelectorAll('TR')];
				}
				else {
					this.bindings = [...this.element.children];
				}
			}
			else if (typeof (this.bindings) == 'string') {
				this.bindings = [...this.element.querySelectorAll(this.bindings)];
			}

			if (this.bindings == null || this.bindings.length == 0) {
				throw new Error('Must specify "bindings" property to bind Tab.');
			}

			if (this.excludes != '') {
				this.excludes = this.excludes.split(',').map(e => e.trim()).filter(e => e != '');
				for (let i = 0; i < this.excludes.length; i++) {
					let e = this.excludes[i];
					if (/^odd$/i.test(e)) {
						for (let j = 0; j < this.bindings.length; j++) {
							if (j % 2 == 1) {
								this.bindings[j] = null;
							}
						}
					}
					else  if (/^even$/i.test(e)) {
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

			}
		});
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
}

$tab = function(name) {
	let tab = $t(name);
    if (tab != null && tab.tagName == 'TAB') {
        return tab;
    }
    else {
        return null;
    }
}

Tab.prototype.selectedElement = null;

//用某个元素的属性当值, 当使用子元素的样式切换时会用到
String.prototype.$css = function(element) {
    let css = this.toString();
    if (css.startsWith('[') && css.endsWith(']')) {
        css = css.trimPlus('[', ']');
        css = element[css] || element.getAttribute(css);
    }
    return css;
}

Tab.prototype.change = function(element, trigger = true) {

	if (typeof(element) == 'string') {
		element = $s(element);
	}

	if (element != null && this.selectedElement != element) {
		if (this.selectedElement != null) {
			this.selectedElement.className = this.defaultClass.$css(this.selectedElement);
		}
		element.className = this.selectedClass.$css(element);
		this.selectedElement = element;

		let hide = element.getAttribute('to-hide') || element.getAttribute('tohide');
		if (hide != null) {
			$a(hide).forEach(a => a.hide());
		}
		
		let show = element.getAttribute('to-show') || element.getAttribute('to-show');
		if (show != null) {
			$a(show).forEach(a => a.show());
		}

		this.element.setAttribute('value', $value(element));
		this.element.setAttribute('text', $text(element));

		if (trigger) {
			Event.execute(this.name, 'onchange', element);
		}		
	}
}

Tab.prototype.bind = function() {

	let tab = this;

	Event.interact(this, this.element);

	this.bindings.filter(e => e != null).forEach(element => {

		if ($parseBoolean(element.getAttribute('selected'), false) || element.className == tab.selectedClass.$css(element)) {
			tab.change(element, false);
		}
		else if (element.className == '') {
			element.className = tab.defaultClass;
		}

		element.on('click', function(ev) {
			if (ev.button == 0) {
				tab.change(element);

				if (tab['onchange+'] != null) {			
					$FIRE(tab, 'onchange+',
						function(data) {
							if (tab.successText != '') {
								Callout(tab.successText.$p(element, data)).position(element, 'up').show();
							}
						},
						function(data) {
							if (tab.failureText != '') {
								Callout(tab.failureText.$p(element, data)).position(element, 'up').show();
							}
						},
						function(error) {
							if (tab.exceptionText != '') {
								Callout(tab.exceptionText.$p(element, error)).position(element, 'up').show();
							}							
						});
				}				
			}
		});
	});
}

Tab.initialize = function(selector) {
   new Tab($s(selector)).bind();
}

Tab.initializeAll = function () {
	for (let tab of document.querySelectorAll('[tab]')) {
		new Tab(tab).bind();
	}	
};

document.on('post', function() {
	Tab.initializeAll();	
});