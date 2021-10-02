//-----------------------------------------------------------------------
// root.js 标签库基础类
//-----------------------------------------------------------------------

Object.defineProperties(HTMLElement.prototype, {
    'visible': {
        get() {
            return !this.hidden;
        },
        set(visible) {
            if (typeof(visible) != 'boolean') {
                visible = $parseBoolean(visible, true, this);
            }
            this.hidden = !visible;

            if (visible) {
                if (this.style.display == 'none') {
                    this.style.display = '';
                }                
            }
            
            if (this.hasAttribute('relative')) {
                $a(this.getAttribute('relative')).forEach(e => e.visible = visbile);
            }
        }
    },
    'text': {
        get() {
            return this.textContent;
        },
        set(text) {
            this.textContent = text;
        }
    },
    'html': {
        get() {
            return this.innerHTML;
        },
        set(html) {
            this.innerHTML = html;
        }
    },
    'icon': {
        get() {
            let first = object.firstElementChild;
            if (first == null) {
                return undefined;
            }
            else if (first.nodeName == 'IMG') {
                return first.src;
            }
            else if (first.nodeName == 'I') {
                return first.className.takeAfter('-');
            }
            else {
                return undefined;
            }
        },
        set(icon) {
            let content = '';
            if (icon.isImageURL()) {
                content = `<img src="${icon}" align="absmiddle" /> `;
            }
            else {
                content = `<i class="iconfont ${icon.startsWith('icon-') ? icon : ('icon-' + icon)}"></i> `;
            }
            this.insertAdjacentHTML('afterbegin', content);
        }
    },
    'parent': {
        get() {
            return this.parentElement;
        }
    },
    'previous': {
        get() {
            return this.previousElementSibling;
        }
    },
    'next': {
        get() {
            return this.nextElementSibling;
        }
    },
    'first': {
        get() {
            return this.firstElementChild;
        }
    },
    'last': {
        get() {
            return this.lastElementChild;
        }
    },
    'left': {
        get() {
            return $root.__offsetLeft(this);
        },
        set(left) {
            this.style.left = left + 'px';
        }
    },
    'right': {
        get() {
            return $root.__offsetLeft(this) + this.offsetWidth;
        },
        set(right) {
            this.style.right = right + 'px';
        }
    },
    'top': {
        get() {
            return $root.__offsetTop(this);
        },
        set(top) {
            this.style.top = top + 'px';
        }
    },
    'bottom': {
        get() {
            return $root.__offsetTop(this) + this.offsetHeight;
        },
        set(bottom) {
            this.style.bottom = bottom + 'px';
        }
    },
    'width': {
        get() {
            return this.offsetWidth;
        },
        set(width) {
            this.style.width = width + 'px';
        }
    },
    'height': {
        get() {
            return this.offsetHeight;
        },
        set(height) {
            this.style.height = height + 'px';
        }
    }
});

HTMLElement.prototype.insertAdjacent = function(location, element, properties, styles, attributes) {
    if (typeof (element) == 'string') {
        if (/^[a-z]+$/i.test(element)) {
            this.insertAdjacentElement(location, $create(element, properties, styles, attributes));
        }
        else {
            this.insertAdjacentHTML(location, element);
        }
    }
    else if (element instanceof HTMLElement) {
        this.insertAdjacentElement(location, element);
    }
    else {
        throw new Error('Unsupported argument type: element.');
    }

    return this;
}

HTMLElement.prototype.insertAfterBegin = function(element, properties, styles, attributes) {
    return this.insertAdjacent('afterBegin', element, properties, styles, attributes);
}

HTMLElement.prototype.insertAfterEnd = function(element, properties, styles, attributes) {
    return this.insertAdjacent('afterEnd', element, properties, styles, attributes);
}

HTMLElement.prototype.insertBeforeBegin = function(element, properties, styles, attributes) {
    return this.insertAdjacent('beforeBegin', element, properties, styles, attributes);
}

HTMLElement.prototype.insertBeforeEnd = function(element, properties, styles, attributes) {
    return this.insertAdjacent('beforeEnd', element, properties, styles, attributes);
}

HTMLElement.prototype.select = function(o) {
    return this.querySelector(o);
}

HTMLElement.prototype.selectAll = function(o) {
    return [...this.querySelectorAll(o)];
}

HTMLElement.prototype.get = function(attr) {
    return this[attr] ?? this[attr.toCamel()] ?? this.getAttribute(attr) ?? this.getAttribute(attr.toCamel());
}

HTMLElement.prototype.set = function(attr, value) {

    if (value == null) {
        if (attr != null) {
            value = attr;
            attr = null;
        }
    }

    if (attr == null) {
        if (this.value != null) {
            attr = 'value';
        }
        else if (this.innerHTML != null) {
            attr = 'innerHTML';
        }
    }
    
    if (attr != null) {
        let name = attr;
        if (attr == 'html') {
            name = 'innerHTML';
        }
        else if (attr.includes('-')) {
            name = attr.toCamel();
        }

        if (name == attr) {
            if (this.hasAttribute(attr + '+')) {
                value = this.getAttribute(attr + '+').placeModelData().$p(this);
            }
            if (value != null) {
                if (this[attr] != null) {
                    this[attr] = value;
                    if (attr == 'value') {
                        this.ajust?.();
                    }
                }
                else  {
                    this.setAttribute(attr, value);
                }
            }
        }
        else {            
            if (this.hasAttribute(attr + '+')) {
                value = this.getAttribute(attr + '+').placeModelData().$p(this);
            }
            else if (this.hasAttribute(name + '')) {
                value = this.getAttribute(name + '+').placeModelData().$p(this);
            }
            if (value != null) {
                if (this[name] != null) {
                    this[name] = value;    
                }
                else {
                    this.setAttribute(attr, value);
                }            
            }
        }
    }
    
    return this;
}

HTMLElement.prototype.setStyle = function (name, value) {
    this.style[name.toCamel()] = value;
    return this;
}

HTMLElement.prototype.setStyles = function(styleObject) {
    for (let name in styleObject) {
        this.style[name.toCamel()] = styleObject[name];
    }
    return this;
}

HTMLElement.prototype.setHTML = function (html) {
    this.innerHTML = html;
    return this;
}

HTMLElement.prototype.setText = function (text) {
    this.textContent = text;
    return this;
}

HTMLElement.prototype.setClass = function (className) {
    this.className = className;
    return this;
}

HTMLElement.prototype.removeClass = function(className) {
    this.classList.remove(className);
    return this;
}

HTMLElement.prototype.addClass = function(className) {
    this.classList.add(className);
    return this;
}

HTMLElement.prototype.setIcon = function(icon) {
    this.icon = icon;
    return this;
}

HTMLElement.prototype.setLeft = function(left) {
    this.left = left;
    return this;
}

HTMLElement.prototype.setRight = function(right) {
    this.right = right;
    return this;
}

HTMLElement.prototype.setTop = function(top) {
    this.top = top;
    return this;
}

HTMLElement.prototype.setBottom = function(bottom) {
    this.bottom = bottom;
    return this;
}

HTMLElement.prototype.setWidth = function(width) {
    this.width = width;
    return this;
}

HTMLElement.prototype.setHeight = function(height) {
    this.height = height;
    return this;
}

HTMLElement.prototype.do = function(exp) {    
    if (typeof(exp) == 'function') {
        exp.call(this, this);
    }
    else if (typeof(exp) == 'string') {
        eval('_ = function() { ' + exp + '}').call(this);
    }

    return this;
}

HTMLElement.prototype.upside = function(reference, offsetX = 0, offsetY = 0, align = 'center') {
    let top = reference.top - this.height + offsetY;
    let left = reference.left + offsetX;
    if (align == 'center') {
        left += reference.width / 2 - this.width / 2;
    }
    else if (align == 'right') {
        left += reference.width - this.width;
    }

    if (left + this.width > $root.documentWidth) {
        left = $root.documentWidth - this.width;
    }
    
    this.top = top;
    this.left = left;

    return top >= 0;
}

HTMLElement.prototype.downside = function(reference, offsetX = 0, offsetY = 0, align = 'center') {
    let top = reference.top + reference.height + offsetY;
    let left = reference.left + offsetX;
    if (align == 'center') {
        left += reference.width / 2 - this.width / 2;
    }
    else if (align == 'right') {
        left += reference.width - this.width;
    }

    if (left + this.width > $root.documentWidth) {
        left = $root.documentWidth - this.width;
    }

    this.top = top;
    this.left = left;

    return top + this.height <= $root.documentHeight;
}

HTMLElement.prototype.leftside = function(reference, offsetX = 0, offsetY = 0) {
    this.left = reference.left - this.width + offsetX - 12;
    this.top = reference.top + reference.height / 2 - this.height / 2 + offsetY;

    return this.left >= 0;
}

HTMLElement.prototype.rightside = function(reference, offsetX = 0, offsetY = 0) {
    this.left = reference.left + reference.width + offsetX + 12;
    this.top = reference.top + reference.height / 2 - this.height / 2 + offsetY;

    return this.left + this.width <= $root.documentWidth;
}

HTMLElement.prototype.call = function(message, pos = 'up', seconds = 0) {
    Callout(message).position(this, pos).show(seconds);
}

HTMLElement.prototype.show = function() {
    if (this.getAttribute('hidden') != 'always') {
        this.visible = true;        
    }
    return this;
}

HTMLElement.prototype.hide = function() {
    if (this.getAttribute('visible') != 'always') {
        this.visible = false;
    }
    return this;
}

//useCapture false 在冒泡阶段执行  true 在捕获阶段执行
HTMLElement.prototype.bind = function(eventName, func, useCapture = false, attach = true) {
    if (attach) {
        this.addEventListener?.(eventName.drop('on'), func, false) ?? this.attachEvent?.(eventName.prefix('on'), func);
    }
    else {
        this[eventName.prefix('on')] = func;
    }
    
    return this;
}

//native 是否强制绑定原生事件
HTMLElement.prototype.on = function (eventNames, func, native = false) {
    eventNames.split(',').forEach(eventName => {
        let extended = false;
        if (!native) {
            if (eventName.includes('-') || eventName.includes('+')) {
                extended = true;
            }

            if (!extended) {
                let id = this.id || this.name || '';            
                if (this instanceof HTMLUnknownElement || this.nodeType == 0 || (id != '' && document.components.has(id)) || Object.getOwnPropertyNames(this.constructor.prototype).filter(n => n.startsWith('on')).map(n => n.toLowerCase()).includes(eventName)) {
                    extended = true;
                }

                if (!extended) {
                    if (this.hasAttribute('coder') || this.hasAttribute('popup') || (this.hasAttribute('tab') && eventName == 'onchange')) {
                        extended = true;
                    }
                }
            }
        }

        if (extended) {
            Event.bind(this, eventName, func);
        }
        else {
            this.bind(eventName, func);
        }
    });

    return this;
}

HTMLElement.prototype.execute = function (eventName, ...args) {
    return Event.execute(this, eventName, ...args);
}

Window.prototype.on = function(eventNames, func) {
    eventNames.split(',').forEach(eventName => {
        eventName = eventName.trim().toLowerCase();
        this.addEventListener?.(eventName.drop('on'), func, false) ?? this.attachEvent?.(eventName.prefix('on'), func);
    });

    return this;
}

Document.prototype.on = function(eventName, func) {
    eventName = eventName.trim().toLowerCase().drop('on');
    if (eventName == 'ready') {
        if (document.addEventListener != undefined) {
            document.addEventListener("DOMContentLoaded", func, false);
        }
        else if (document.attachEvent != undefined) {
            document.attachEvent('onreadystatechange', func);
        }
    }
    else  if (eventName == 'post') {
        if (document.models != null) {
            Event.bind('$global', 'onpost', func);
        }
        else {
            this.on('ready', func);
        }
    }
    else if (eventName == 'load') {
        if (document.models != null) {
            Event.bind('$global', 'onload', func);
        }
        else {
            window.on('load', func);
        }
    }

    return this;
}

Object.defineProperties(Array.prototype, {
    'first': {
        get() {
            return this[0];
        }
    },
    'last': {
        get() {
            return this[this.length - 1];
        }
    }
})

Array.prototype.one = function() {
    if (this.length == 1) {
        return this[0];
    }
    else {
        return this;
    }
}

Array.prototype.toSet = function() {
    return new Set(this);
}

Array.prototype.distinct = function() {
    return Array.from(new Set(this));
}

Array.prototype.union = function(array) {
    return Array.from(new Set(this.concat(array)));
}

Array.prototype.minus = function(array) {
    let b = new Set(array);
    return this.filter(a => !b.has(a));
}

Array.prototype.intersect = function(array) {
    let b = new Set(array);
    return this.filter(a => b.has(a));
}

//p = property name
Array.prototype.min = function(p) {
    if (p == null) {
        return this.reduce((a, b) => Math.min(a, b));
    }
    else {
        return this.reduce((a, b) => Math.min(a[p], b[p]));
    }
}

Array.prototype.max = function(p) {
    if (p == null) {
        return this.reduce((a, b) => Math.max(a, b));
    }
    else {
        return this.reduce((a, b) => Math.max(a[p], b[p]));
    }
}

Array.prototype.sum = function(p) {
    if (p == null) {
        return this.reduce((a, b) => a + b);
    }
    else {
        return this.reduce((a, b) => a[p] + b[p]);
    }
}

Array.prototype.avg = function(p) {
    if (p == null) {
        return this.reduce((a, b) => a + b) / this.length;
    }
    else {
        return this.reduce((a, b) => a[p] + b[p]) / this.length;
    }
}

Array.prototype.asc = function(p) {
    if (p == null) {
        return this.sort((a, b) => {
            if (typeof(a) == 'number' && typeof(b) == 'number') {
                return a - b;
            }
            else {
                let m = a.toString();
                let n = b.toString();
                if (m.length == n.length) {
                    return m.localeCompare(n);
                }
                else {
                    return m.length - n.length;
                }
            }
        });
    }
    else {
        return this.sort((a, b) => {
            if (typeof(a[p]) == 'number' && typeof(b[p]) == 'number') {
                return a[p] - b[p];
            }
            else {
                let m = a[p].toString();
                let n = b[p].toString();
                if (m.length == n.length) {
                    return m.localeCompare(n);
                }
                else {
                    return m.length - n.length;
                }
            }
        });
    }
}

Array.prototype.desc = function(p) {
    return this.asc(p).reverse();    
}

Array.prototype.repeat = function(t) {
    let array = this;
    for (let i = 0; i < t - 1; i++) {
        array = array.concat(this)
    }
    return array;
}

String.prototype.$trim = function(char = '', char2 = '') {
    if (this != null) {
        if (char == '') {
            return this.trim().replace(/^(&nbsp;|\s)+/g, '').replace(/(&nbsp;|\s)+$/g, '');
        }
        else {
            if (char2 == '') {
                char2 = char;
            }
            let str = this.trim();
            if (str.startsWith(char)) {
                str = str.substring(char.length);
            }
            if (str.endsWith(char2)) {
                str = str.substring(0, str.length - char2.length);
            }         
            return str;            
        }                
    }
    else {
        return '';
    }
}

String.prototype.$includes = function(str, delimiter = ',') {
    return (delimiter + this.toString().trim() + delimiter).includes(delimiter + str + delimiter);
}

String.prototype.$remove = function(str, delimiter = ',') {
    return (delimiter + this.toString().trim() + delimiter).replace(delimiter + str + delimiter, delimiter).$trim(delimiter);
}

String.prototype.take = function(length) {
    let me = this.toString();
    if (length <= 0) {
        return "";
    }
    else if (length < me.length) {
        return me.substr(0, length);
    }
    else {
        return me;
    }
}

String.prototype.takeRight = function(length) {
    let me = this.toString();
    if (length <= 0) {
        return '';
    }
    else if (length < me.length) {
        return me.substring(me.length - length);
    }
    else {
        return me;
    }
}

String.prototype.drop = function(lengthOrPrefix) {
    if (typeof(lengthOrPrefix) == 'number') {
        if (lengthOrPrefix < 0) {
            return this.toString();
        }
        else if (lengthOrPrefix > this.length) {
            return '';
        }
        else {
            return this.substring(lengthOrPrefix);
        }
    }
    else {
        if (this.startsWith(lengthOrPrefix)) {
            return this.substring(lengthOrPrefix.length)
        }
        else {
            return this.toString();
        }
    }
}

String.prototype.dropRight = function(lengthOrSuffix) {
    if (typeof(lengthOrSuffix) == 'number') {
        if (lengthOrSuffix < 0 || lengthOrSuffix > this.length) {
            return this.toString();
        }
        else {
            return this.substr(0, this.length - lengthOrSuffix);
        }
    }
    else {
        if (this.endsWith(lengthOrPrefix)) {
            return this.substr(0, this.length - lengthOrPrefix.length)
        }
        else {
            return this.toString();
        }
    }
}

String.prototype.takeBefore = function(value) {
    let me = this.toString();
    if (typeof (value) == 'string') {
        if (me.includes(value)) {
            return me.substring(0, me.indexOf(value));
        }
        else {
            return '';
        }
    }
    else if (value instanceof RegExp) {
        if (value.test(me)) {
            return me.substring(0, me.indexOf(value.exec(me)[0]));
        }
        else {
            return '';
        }
    }
    else {
        throw new Error('Unsupported data type in takeBefore: ' + value);
    }
}

String.prototype.takeBeforeLast = function(value) {
    let me = this.toString();
    if (typeof (value) == 'string') {
        if (me.includes(value)) {
            return me.substring(0, me.lastIndexOf(value));
        }
        else {
            return '';
        }
    }
    else if (value instanceof RegExp) {
        if (value.test(me)) {
            let ms = value.exec(me);
            return me.substring(0, me.lastIndexOf(ms[ms.length-1]));
        }
        else {
            return '';
        }
    }
    else {
        throw new Error('Unsupported data type in takeBeforeLast: ' + value);
    }
}

String.prototype.takeAfter = function(value) {
    let me = this.toString();
    if (typeof (value) == 'string') {
        if (me.includes(value)) {
            return me.substring(me.indexOf(value) + value.length);
        }
        else {
            return me;
        }
    }
    else if (value instanceof RegExp) {
        if (value.test(me)) {
            let ms = value.exec(me)[0];
            return me.substring(me.indexOf(ms) + ms.length);
        }
        else {
            return me;
        }
    }
    else {
        throw new Error('Unsupported data type in takeAfter: ' + value);
    }
}

String.prototype.takeAfterLast = function(value) {
    let me = this.toString();
    if (typeof (value) == 'string') {
        if (me.includes(value)) {
            return me.substring(me.lastIndexOf(value) + value.length);
        }
        else {
            return me;
        }
    }
    else if (value instanceof RegExp) {
        if (value.test(me)) {
            let ms = value.exec(me);
            let mx = ms[ms.length-1];
            return me.substring(me.lastIndexOf(mx) + mx.length);
        }
        else {
            return me;
        }
    }
    else {
        throw new Error('Unsupported data type in takeAfterLast: ' + value);
    }
}

String.prototype.fill = function(...element) {
    $a(...element).forEach(tag => tag.innerHTML = this.toString());
    return this;
}

String.prototype.prefix = function(str) {
    if (!this.startsWith(str)) {
        return str + this;
    }
    else {
        return this.toString();
    }
}

String.prototype.suffix = function(str) {
    if (!this.startsWith(str)) {
        return this + str;
    }
    else {
        return this.toString();
    }
}

String.prototype.toInt = function(defaultValue = 0) {
    
    let value = this.$p().replace(/,/g, '').trim();

    if (/^\d+$/.test(value)) {
        num = Number.parseInt(value);
    }
    else {
        try {
            num = Math.round(eval(value));
        }
        catch (err) {
            num = NaN;
        }
    }

    if (isNaN(num)) {
        let chars = [];
        let minus = false; //< 0
        for (let char of value) {
            if (/\d/.test(char)) {
                chars.push(char);
            }
            else if (char == '-' && !minus && chars.length == 0) {
                chars.push('-');
                minus = true;
            }
            else if (char == '.') {
                break;
            }
        }

        num = (chars.length > 0 ? Number.parseInt(chars.join('')) : defaultValue);
    }
    
    return num;
}

String.prototype.toFloat = function(defaultValue = 0) {
    
    let value = this.$p().replace(/,/g, '').trim();

    if (value.includes('.')) {
        if(value.indexOf('.') != value.lastIndexOf('.')) {
            let vs = value.split('.');
            value = vs[0] + '.' + vs.splice(1).join('');
        }
    }

    if (/^\d+$/.test(value.replace('.', ''))) {
        num = Number.parseFloat(value);
    }
    else {
        try {
            num = eval(value);
        }
        catch (err) {
            num = NaN;
        }
    }

    if (isNaN(num)) {

        let chars = [];
        let minus = false;
        let point = false;
        for (let char of value) {
            if (/\d/.test(char)) {
                chars.push(char);
            }
            else if (char == '-' && !minus && chars.length == 0) {
                chars.push(char);
                minus = true;
            }
            else if (char == '.' && !point) {
                chars.push('.');
                point = true;
            }
        }

        if (chars.length > 0) {
            num = chars.join('');
            if (num.startsWith('.')) {
                num = '0' + num;
            }     

            num = Number.parseFloat(num);
        }
        else {
            num = defaultValue;
        }
    }

    return num;
}

String.prototype.toBoolean = function(defaultValue = false, object = null) {
    
    let value = this.trim().placeModelData().$p(object);

    if (/^(true|yes|disabled|selected|enabled|1|ok|on|hidden|visible|always|)$/i.test(value)) {
        value = true;
    }
    else if (/^(false|no|0|cancel|off|null|undefined)$/i.test(value)) {
        value = false;
    }
    else {
        try {
            value = value.eval(object);
            if (typeof (value) != 'boolean') {
                value = $parseBoolean(value, defaultValue, object);
            }
        }
        catch (e) {
            console.error(`Wrong expression: ${this}. Exception: ${e.message}`);
            value = defaultValue;
        }
    }

    return value;
}

String.prototype.toArray = function(delimiter = ',') {

    if (this.startsWith('[') && this.endsWith(']')) {
        return eval(this);
    }
    else {
        return this.split(delimiter);
    }
}

String.prototype.toMap = function(delimiter = '&', separator = '=') {

    let map = new Object();

    if (this.startsWith('#')) {
        //select
        let select = $s(this.toString());
        if (select.nodeName != undefined && select.nodeName == 'SELECT') {
            for (let option of select.options) {
                map[option.value] = option.text;
            }
        }
    }
    else if (this.isObjectString()) {
        map = Json.eval(this.toString());
    }
    //query string or other
    else if (this.includes(separator)) {
        this.split(delimiter).forEach(kv => {
            if (kv.includes(separator)) {
                map[kv.substring(0, kv.indexOf(separator))] = kv.substring(kv.indexOf(separator) + separator.length);
            }
            else {
                map[kv] = '';
            }
        });
    }
    else if (this.includes(delimiter)) {
        this.split(delimiter).forEach(item => {
            map[item] = item;
        });
    }
    else if (this.isArrayString()) {
        Json.eval(this.toString()).forEach(v => {
            if (typeof(v) == 'string') {
                map[v] = v;
            }
            else {
                let i = 0;
                for (let k in v) {
                    map[k] = v[k];
                    i ++;
                    if (i > 1) {
                        i = 0;
                        break;
                    }
                }
            }            
        });
    }
    else if (this.includes(',')) {
        this.split(',').forEach(v => map[v] = v);
    }
    else {
        map[this] = this;
    }
    
    return map;
}

String.prototype.toHyphen = function(char = '-') {
    return this.toString().replace(/^([A-Z]+)([A-Z])/, ($0, $1, $2) => $1.toLowerCase() + char + $2.toLowerCase())
                .replace(/^[A-Z]/, $0 => $0.toLowerCase())
                .replace(/([A-Z])([A-Z]*)([A-Z])/g, ($0, $1, $2, $3) => char + $1.toLowerCase() + $2.toLowerCase() + char + $3.toLowerCase())
                .replace(/[A-Z]/g, $0 => char + $0.toLowerCase());
}

String.prototype.toCamel = function() {
    return this.toString().replace(/[_-]([a-z])/g, ($0, $1) => $1.toUpperCase()).replace(/^([A-Z])/, ($0, $1) => $0.toLowerCase());
}

String.prototype.toPascal = function() {
    return this.toString().replace(/[_-]([a-z])/g, ($0, $1) => $1.toUpperCase()).replace(/^[a-z]/, $0 => $0.toUpperCase());
}

String.prototype.recognize = function() {
    let value = this.toString();
    if (/^true|false|yes|no$/i.test(value)) {
        return value.toBoolean();
    }
    else if (/^-?\d+$/.test(value)) {
        return value.toInt();
    }
    else if (/^-?\d+\.\d+/.test(value)) {
        return value.toFloat();
    }
    else {
        return value;
    }
}

String.prototype.$length = function (min = 0) {
    let l = 0;
    for (let i = 0; i < this.length; i++) {
        let c = this.charCodeAt(i);
        l += (c < 256 || (c >= 0xff61 && c <= 0xff9f)) ? 1 : 2;
    }
    if (min > 0 && l < min) { l = min; }
    
    return l;
}

// 从 model 中加载数据，替换特定占位符的值
// follower 要监听哪个对象, 保存在 followers 中
String.prototype.placeModelData = function(follower) {
   
    let content = this.toString();
    // @modelname!
    // @modelname.key?(defaultValue)
    // @modelname.key[0]?(defaultValue)
    // @modelname[0]
    window.PlaceHolder?.getModelHolders(content)
        .forEach(holder => {
            let ph = new PlaceHolder(holder).analyze();
            if (ph.name != '') {
                if (follower != null && follower != '') {
                    if (!follower.startsWith('#')) {
                        follower = '#' + follower;
                    }
                    document.components.get(ph.name)?.followers.add(follower);
                }
                let v = ph.place(window[ph.name + '$']);

                if (v != null) {
                    if (content == holder) {
                        content = Json.toString(v);
                    }
                    else {
                        content = content.replaceAll(holder, v);
                    }
                }            
            }
        });

    return content;
    //没有 evalJsExpression 是因为后面一般跟 .$p()
}

//t = element target
//p = <>+-\dn pointer
//a = [attr]
//d = default value
String.$parse = function(t, p, a, d = 'null') {
    let v = null;
    if (t != null) {
        if (p != null && p != '') {
            p = p.replace(/&lt;/g, '<').replace(/&gt;/g, '>').toLowerCase();
            for (let c of p) {
                switch(c) {
                    case '<':
                    case 'b': //back
                        t = t.parentNode != null ? t.parentNode : null;
                        break;
                    case '>':
                    case 'f': //forward/first
                        t = t.firstElementChild != null ? t.firstElementChild : null;
                        break;
                    case '+':
                    case 'n': //next
                        t = t.nextElementSibling != null ? t.nextElementSibling : null;
                        break;
                    case '-':
                    case 'p': //previous
                        t = t.previousElementSibling != null ? t.previousElementSibling : null;
                        break;
                    case 'l': //last
                        t = t.lastElementChild != null ? t.lastElementChild : null;
                        break;
                    default:
                        if (/^\d+$/.test(c)) {
                            c = c.toInt(0);
                            t = t.children[c] != null ? t.children[c] : null; 
                        }
                        break;
                }
            }
        }
        if (t != null) {
            // [attr] or value
            v = a != null ? $attr(t, a) : $value(t);            
        }                    
    }

    return v != null ? v : d;
}

//argument 'element' also supports object { }
//data -> ajax recall data
String.prototype.$p = function(element, data) {

    let str = this.toString();
    if (str == '') {
        return str;
    }
    
    if (typeof (element) == 'string') {
        element = document.querySelector(element);
    }

    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');

    //&(query)
    let query = /\&(amp;)?\(([a-z0-9_]+)\)?(\?\((.*?)\))?[!%]?/i;
    while (query.test(str)) {
        let match = query.exec(str);
        str = str.replace(match[0], $query.has(match[2]) ? $query.get(match[2]).encodeURIComponent(match[0].endsWith('%')) : (match[4] ?? 'null').encodeURIComponent(match[0].endsWith('%')));
    }

    //$(selector)+-><[n][attr]?(1)
    // + next
    // - prev
    // > firdt child
    // < parent
    // \d child \d
    // n last child
    let selector = /\$\((.+?)\)([+><bfnpl\d-]+)?(\[([a-z0-9_-]+?)\])?(\?\((.*?)\))?[!%]?/i;
    while (selector.test(str)) {
        let match = selector.exec(str);
        str = str.replace(match[0], String.$parse($v(match[1]), match[2], match[4], match[6]).encodeURIComponent(match[0].endsWith('%')));
    }

    //parse element
    // $:<0
    // $:[attr]
    if (element != null) {
        let holders = str.match(/\$:([+-><bfnpl\d]*)(\[([a-z0-9_-]+?)\])?(\?\((.*?)\))?[!%]?/ig);
        if (holders != null) {
            for (let holder of holders) {
                let s = holder, p, a, d;
                if (s.includes('[')) {
                    a = s.substring(s.indexOf('[') + 1, s.indexOf(']'));
                    p = s.substring(2, s.indexOf('['));
                    s = s.substring(s.indexOf(']') + 1);
                }
                if (s.includes('(')) {
                    d = s.substring(s.indexOf('('), s.indexOf(')'));
                    if (s.startsWith('$:')) {
                        p = s.substring(2, s.indexOf('('));
                    }
                    s = '';
                }
                if (s.startsWith('$:')) {
                    p = s.substring(2);
                }
                str = str.replace(holder, String.$parse(element, p, a, d).encodeURIComponent(holder.endsWith('%')));
            }
        }
    }

    //~{{complex expression}}
    //must return a value 
    let complex = /\~?\{\{([\s\S]+?)\}\}%?/;
    while (complex.test(str)) {
        let match = complex.exec(str);
        let result = eval('_ = function(data, value, text) { ' + match[1].decode() + ' }').call(element, $data(element, data), $value(element, data), $text(element, data));
        if (typeof(result) != 'string') {
            result = String(result);
        }
        if (match[0].endsWith('%')) {
            result = encodeURIComponent(result);
        }        
        str = str.replace(match[0], result);
    }

    //~{simple expression}
    let expression = /\~?\{([\s\S]+?)\}%?/;
    while (expression.test(str)) {
        let match = expression.exec(str);
        let result = eval('_ = function(data, value, text) { return ' + match[1].decode() + ' }').call(element, $data(element, data), $value(element, data), $text(element, data));
        if (typeof(result) != 'string') {
            result = String(result);
        }
        if (match[0].endsWith('%')) {
            result = encodeURIComponent(result);
        }
        str = str.replace(match[0], result);
    }

    return str;
}

String.prototype.if = function(exp) {
    let result = exp;
    if (typeof(exp) == 'string') {
        result = eval('result = function() {return ' + exp + '}').call(this);
    }
    else if (typeof(exp) == 'function') {
        result = exp.call(this, this);
    }

    return result ? this.toString() : null;
}

String.prototype.ifEmpty = function(other) {
    return this.toString().trim() == '' ? other : this.toString();
}

String.prototype.isEmpty = function() {
    return this.toString().trim() == '';
}

String.prototype.isCogoString = function() {
    let str = this.toString().trim();
    return /^(\/|[a-z]+(\s|#))/i.test(str) || /^(get|post|delete|put|http|https)\s*:/i.test(str) || (str.includes('/') && str.includes('?') && str.includes('='))
}

String.prototype.isObjectString = function() {
    let str = this.toString().trim();
    return str.startsWith('{') && str.endsWith('}');
}

String.prototype.isArrayString = function() {
    let str = this.toString().trim();
    return str.startsWith('[') && str.endsWith(']');
}

String.prototype.isIntegerString = function() {
    return /^-?\d+$/.test(this.toString());
}

String.prototype.isNumberString = function() {
    return /^-?(\d+\.)?\d+$/.test(this.toString());
}

String.prototype.isDateTimeString = function() {
    return /^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(this.toString());
}

String.prototype.isDateString = function() {
    return /^\d\d\d\d-\d\d-\d\d$/.test(this.toString());
}

String.prototype.isTimeString = function() {
    return /^\d\d\d\d:\d\d(:\d\d)?$/.test(this.toString());
}

String.prototype.isImageURL = function() {
    return /\.(jpg|png|gif|jpeg)$/i.test(this.toString());
}

String.prototype.encode = function() {
    return this.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

String.prototype.decode = function() {
    return this.toString()
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"');
}

String.prototype.encodeURIComponent = function(sure = true) {
    return $parseBoolean(sure, true) ? encodeURIComponent(this.toString()) : this.toString();
}

String.prototype.eval = function(obj, data) {
    if (obj == null) {
        return eval(this.toString());
    }
    else {
        return eval('_ = function(data) { return ' + this.toString() + '; }').call(obj, data);
    }    
}

String.prototype.toJson = function() {
    return new Json(this.toString());
}

Number.prototype.kilo = function() {
    let number = this.toString();
    number = number.replace(/,/g, '');

    let decimal = '';
    if (number.includes('.')) {
        decimal = number.substring(number.indexOf('.'));
        number = number.substring(0, number.indexOf('.'));
    }
    let kn = number;
    if (number.length > 3) {
        kn = number.substr(number.length - 3, 3);
        for (let i = number.length - 6; i > -3; i -= 3) {
            if (i > 0) {
                kn = number.substr(i, 3) + ',' + kn;
            }
            else {
                kn = number.substr(0, 3 + i) + ',' + kn;
            }
        }
    }
    if (decimal != '') { kn += decimal; }

    return kn; 
}

Number.prototype.percent = function(digits = 2) {
    if (digits == -1) {
        return this * 100 + '%';
    }
    else {
        return (this * 100).toFixed(digits) + '%';
    }
}

Number.prototype.round = function(n = 0) {
    if (n == 0) {
        return Math.round(this);
    }
    else {
        return Math.round(this * Math.pow(10, n)) / Math.pow(10, n);
    }
}

Number.prototype.floor = function(n = 0) {
    if (n == 0) {
        return Math.floor(this);
    }
    else {
        return Math.floor(this * Math.pow(10, n)) / Math.pow(10, n);
    }
}

Number.prototype.ifNegative = function(v) {
    return this < 0 ? v : this;
}

Number.prototype.ifZero = function(v) {
    return this == 0 ? v : this;
}

Number.prototype.ifNotZero = function(v) {
    return this != 0 ? v : this;
}

Number.prototype.ifPositive = function(v) {
    return this > 0 ? v : this;
}

$root = {};

//private method
$root.__offsetLeft = function(element) {
    if (typeof(element) == 'string') {
        element = $s(element);
    }

    let parent = element.parentNode;
    let left = element.offsetLeft;
    while (parent != null && parent.nodeName != 'BODY') {
        if (parent.nodeName == 'TABLE' || parent.nodeName == 'TD') {
            left += parent.offsetLeft;
        }
        parent = parent.parentNode;
    }
    return left;
}

//private method
$root.__offsetTop = function(element) {
    if (typeof(element) == 'string') {
        element = $s(element);
    }

    let parent = element.parentNode;
    let top = element.offsetTop;
    while (parent != null && parent.nodeName != 'BODY') {
        if (parent.nodeName == 'TABLE' || parent.nodeName == 'TD' || parent.style.position == 'fixed') {
            top += parent.offsetTop;
        }
        parent = parent.parentNode;
    }
    return top;
}

Object.defineProperties($root, {
    'scrollTop': {
        get() {
            return document.documentElement?.scrollTop ?? document.body.scrollTop;
        },
        set(top) {
            if (document.documentElement != null && document.documentElement.scrollTop != null) {
                document.documentElement.scrollTop = top;
            }
            else {
                document.body.scrollTop = top;
            }
        }
    },
    'scrollLeft': {
        get() {
            return document.documentElement?.scrollLeft ?? document.body.scrollLeft;
        },
        set(left) {
            if (document.documentElement != null && document.documentElement.scrollLeft != null) {
                document.documentElement.scrollLeft = left;
            }
            else{
                document.body.scrollLeft = left;
            }
        }
    },
    'visibleWidth': {
        get() {
            return Math.max(document.body.clientWidth, document.documentElement.clientWidth);
        }
    },
    'visibleHeight': {
        get() {
            return Math.max(document.body.clientHeight, document.documentElement.clientHeight);
        }
    },
    'documentWidth': {
        get() {
            return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
        }
    },
    'documentHeight': {
        get() {
            return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        }
    }
});

$root.home = function () {
    let scripts = document.getElementsByTagName('SCRIPT');
    let src = scripts[scripts.length - 1].src;
    if (src.includes('/')) {        
        return src.substring(0, src.lastIndexOf('/') + 1);
    }
    else {
        return '';
    }
}();

$root.images = $root.home + 'images/';

if (window['$configuration'] == null) {
    var $configuration = window.localStorage.getItem('root.configuration');
}
else if (window.localStorage.getItem('root.configuration') == null) {
    window.localStorage.setItem('root.configuration', JSON.stringify($configuration));
}
if (window['$configuration'] != null && typeof($configuration) == 'string') {
    $configuration = JSON.parse($configuration);
}

$parseString = function(value, defaultValue = '') {
    if (typeof (value) == 'string') {
        return value;
    }
    else if (value != null) {
        return String(value);
    }
    else {
        return defaultValue;
    }
}

$parseInt = function(value, defaultValue = 0) {
    if (typeof (value) == 'string') {
        return value.toInt(defaultValue);
    }
    else if (typeof (value) == 'number') {
        return Math.round(value);
    }
    else {
        return defaultValue;
    }
}

$parseFloat = function(value, defaultValue = 0) {
    if (typeof (value) == 'string') {
        return value.toFloat(defaultValue);
    }
    else if (typeof (value) == 'number') {
        return value;
    }
    else {
        return defaultValue;
    }
}

$parseBoolean = function(value, defaultValue = false, object = null) {
    if (value == null) {
        return defaultValue;
    }
    else if (typeof (value) == 'boolean') {
        return value;
    }
    else if (typeof (value) == 'string') {
        return value.toBoolean(defaultValue, object); //1.5.15
    }
    else if (typeof (value) == 'number') {
        return value > 0;
    }
    else if (value instanceof Array) {
        return value.length > 0;
    }
    else if (value.length != null) {
        return value.length > 0;
    }
    else if (value.size != null) {
        return value.size > 0;
    }
    else if (value instanceof Object) {
        let i = 0;
        for (let n in value) {
            i++;
            break;
        }
        return i > 0;
    }
    else {
        return defaultValue;
    }
}

$parseArray = function(value, defaultValue = []) {
    if (value instanceof Array) {
        return value;
    }
    else if (typeof (value) == 'string') {
        return value.toArray();
    }
    else {
        return defaultValue;
    }
}

$parseObject = function(value, defaultValue = {}) {
    if (value instanceof Object) {
        return value;
    }
    else if (typeof(value) == 'string') {
        return Json.eval(value);
    }
    else {
        return defaultValue;
    }
}

$parseEmpty = function(value, defaultValue = true) {
    if (value == null) {
        return defaultValue;
    }
    else if (typeof(value) == 'string') {
        return value == '';
    }
    else if (value instanceof Array) {
        return value.length == 0;
    }
    else if (typeof (value) == 'boolean') {
        return !value;
    }
    else if (typeof (value) == 'number') {
        return value <= 0;
    }
    else if (value instanceof Object) {
        let i = 0;
        for (let n in value) {
            i++;
            break;
        }
        return i == 0;
    }
    else {
        return defaultValue;
    }
}

$parseZero = function(value, defaultValue = 1) {
    if (value == null) {
        return defaultValue;
    }
    else if (typeof(value) == 'number') {
        return value == 0;
    }
    else if (typeof(value) == 'string') {
        return value.toInt(defaultValue) == 0;
    }
    else if (value instanceof Array) {
        return value.length == 0;
    }
    else if (typeof (value) == 'boolean') {
        return !value;
    }
    else if (value instanceof Object) {
        let i = 0;
        for (let n in value) {
            i++;
            break;
        }
        return i == 0;
    }
    else {
        return defaultValue == 0;
    }
}

$random = function(begin, end) {
    if (end == null) {
        end = begin;
        begin = 0;
    }
    return begin + Math.round(Math.random() * (end - begin));
}

$shuffle = function(digit = 7) {
    let str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let pwd = '';
    for (let i = 0; i < digit; i++) {
        pwd += str.substr($random(0, 61), 1);
    }
    return pwd;
}

$guid = function() {
    return new Date().valueOf() + '-' + $shuffle(10);
}

$data = function(t, data) {
    if (data != null) {
        if (data.data != null) {
            return data;
        }
        else {
            return data;
        }
    }
    else if (t.data != undefined) {
        return t.data;
    }
    else if (t.getAttribute('data') != null) {
        return t.getAttribute('data');
    }
    else if (t.value != null) {
        return t.value;
    }
    else if (t.text != null) {
        return t.text;
    }
    else if (t.textContent != null) {
        return t.textContent;
    }
    else if (t.innerHTML != null) {
        return t.innerHTML;
    }
    else {
        return null;
    }    
}

//single
$s = function (o) {
    if (typeof (o) == 'string') {
        if (o.includes('#')) {
            let t = o.substring(1);
            if (document.components.has(t)) {
                return document.components.get(t);
            }
            else {
                let s = document.querySelector(o);
                if (s == null && /^\w+$/.test(t)) {
                    s = document.querySelector('[name=' + t + ']');
                }
                return s;
            }
        }
        else if (o != '') {
            return document.querySelector(o);
        }
        else {
            return null;
        }
    }    
    else {
        return o;
    }
}

//all
$a = function (...o) {
    let s = new Array();
    for (let b of o) {
        if (typeof (b) == 'string') {
            if (b.includes('#')) {
                b.split(',')
                .map(x => x.trim())
                .forEach(x => {
                    if (x.startsWith('#')) {
                       let t = x.substring(1);
                       if (document.components.has(t)) {
                           s.push(document.components.get(t));
                       }
                       else {
                           s.push(...document.querySelectorAll(x));                           
                       }
                    }
                    else if (x != '') {
                        s.push(...document.querySelectorAll(x));                       
                    }
                });     
            }
            else if (b != '') {
                s.push(...document.querySelectorAll(b));
            }                   
        }        
        else if (b instanceof NodeList || b instanceof HTMLCollection) {
            s.push(...b);            
        }
        else if (b != null) { //instanceof HTMLElement || b instanceof HTMLDocument || b instanceof Window
            s.push(b);
        }        
    }

    return s;
}

//first visible
$v = function(o) {
    if (o.includes(',')) {
        let s = $a(o);
        if (s.length == 1) {
            return s[0];
        }
        else if (s.length > 1) {
            for (let b of s) {
                if (!b.hidden) {
                    return b;
                }
            }
            return s[0];
        }
        else {
            null;
        }
    }
    else {
        return $s(o);
    }
}

//native
$n = function(container, tag) {
    if (container == null) {
        return document.querySelectorAll(tag);
    }
    else if (tag == null) {
        return document.querySelectorAll(container);
    }
    else if (typeof (container) == 'string') {
        return document.querySelectorAll(container + ' ' + tag);
    }
    else {
        return container.querySelectorAll(tag);
    }
}

//tag
$t = function(o) {
    return document.components.get(o.drop('#'));
}

// private
$value = function(t, data) {
    if (t.value != undefined) {
        return t.value;
    }
    else if (t.getAttribute('value') != null) {
        return t.getAttribute('value');
    }
    else if (data != null) {
        if (data.value != null) {
            return data.value;
        }
        else if (data.text != null) {
            return data.text;
        }
        else if (data.data != null) {
            return data.data;
        }
        else {
            return data;
        }
    }
    else if (t.text != null) {
        return t.text;
    }
    else if (t.textContent != null) {
        return t.textContent;
    }
    else if (t.innerHTML != null) {
        return t.innerHTML;
    }
    else {
        return null;
    }
}

$text = function(t, data) {
    if (t.text != undefined) {
        return t.text;
    }
    else if (t.getAttribute('text') != null) {
        return t.getAttribute('text');
    }
    else if (data != null) {
        if (data.text != null) {
            return data.text;
        }
        else if (data.value != null) {
            return data.value;
        }
        else if (data.data != null) {
            return data.data;
        }
        else {
            return data;
        }
    }
    else if (t.textContent != null) {
        return t.textContent;
    }
    else if (t.innerHTML != null) {
        return t.innerHTML;
    }
    else if (t.value != null) {
        return t.value;
    }
    else {
        return null;
    }
}

// private
$attr = function(t, a, v) {
    if (typeof(t) == 'string') {
        let s = t;
        t = $s(t);
        if (t == null) {
            throw new Error('Incorrect selector: ' + s);
        }        
    }

    if (a == 'class') {
        a = 'className';
    }

    let b = null;
    if (a.includes('-')) {
        b = a.takeAfter('-').toCamel();
        a = a.takeBefore('-');
    }
    else if (a.includes(':')) {
        b = a.takeAfter(':').toCamel();
        a = a.takeBefore(':').toCamel();
    }
    if (v == null) {
        v = t[a]?.toString() ?? t.getAttribute?.(a);
        if (b != null) {
            return v[b]?.toString() ?? v.getAttribute?.(b);
        }
        else {
            return v;
        }
    }
    else {        
        if (t[a] !== undefined) {
            if (b == null) {
                if (typeof(t[a]) == 'boolean') {
                    t[a] = $parseBoolean(v, true, t);
                }
                else if (typeof(t[a]) == 'number') {
                    t[a] = $parseFloat(v);
                }
                else {
                    t[a] = v;
                }
            }
            else if (t[a][b] !== undefined) {
                if (typeof(t[a][b]) == 'boolean') {
                    t[a][b] = $parseBoolean(v, true, t);
                }
                else if (typeof(t[a]) == 'number') {
                    t[a][b] = $parseFloat(v);
                }
                else {
                    t[a][b] = v;
                }
            }
            else {
                throw new Error('Incorrect attribute name: ' + b);
            }
        }
        else {
            t.setAttribute?.(a, v);
        }
    }
}

$create = function (tag, properties, styles, attributes) {
    if (typeof (tag) == 'string') {
        tag = document.createElement(tag);
    }

    if (tag != null) {
        if (properties != null) {
            if (typeof (properties) == 'string') {
                tag.innerHTML = properties;
            }
            else if (properties instanceof Object) {
                for (let p in properties) {
                    tag[p] = properties[p];
                }
            }
        }

        if (styles != null) {
            for (let s in styles) {
                tag.style[s] = styles[s];
            }
        }

        if (attributes != null) {
            for (let a in attributes) {
                tag.setAttribute(a, attributes[a]);
            }
        }

        return tag;
    }
    else {
        return null;
    }
}

$GET = function (url, path = '/', element = null, p = true) { return new $api('GET', url, '', path, element, p); }   //SELECT
$POST = function (url, params = '', path = '/', element = null, p = true) {return new $api('POST', url, params, path, element, p); } //INSERT
$PUT = function (url, params = '', path = '/',  element = null, p = true) { return new $api('PUT', url, params, path, element, p); }  //UPDATE/INSERT
$DELETE = function (url, path = '/', element = null, p = true) { return new $api('DELETE', url, path, element, p); }  //DELETE

$TAKE = function(data, element, owner, func) {
    if (typeof(data) == 'string') {
        data = data.trim();
        if (data.isArrayString() || data.isObjectString()) {
            func.call(owner, Json.eval(data).find());
        }
        else if (data.isCogoString()) {
            $cogo(data, element, element)
                .then(result => {
                    func.call(owner, result);
                })
                .catch(error => {
                    console.error(error);
                });
        }
        else if (data.includes(",") && !data.includes("(") && !data.includes(")")) {
            func.call(owner, Json.eval('["' + data.replace(/,/g, '","') + '"]'));
        }
        else if (/^@\w/.test(data)) {
            func.call(owner, Json.eval(data.placeModelData(owner.id || owner.name || owner.owner?.id || owner.owner?.name))); //owner 对象有可能还有自己的 owner，如 FOR 和 SELECT 的关系
        }
        else if (data != '') {
            //如果是js变量
            try {
                func.call(eval(data), js);
            }
            catch (e) {
                console.err('Unreconized data property: ' + data + '. Exeption: ' + e.message);
                func.call(owner, data);
            }            
        }
        else {
            func.call(owner, data);
        }
    }
    else {
        func.call(owner, data);
    }
}

$ajax = function (method, url, params = '', path = '/', element = null, p = true) {
    return new $api(method, url, params, path, element, p);
}

$ajax.match = function(url) {
    if (window['$configuration'] != null) {
        for (let pattern in $configuration.ajax) {
            if (url.includes(pattern) || new RegExp(pattern, 'i').test(url)) {
                return $configuration.ajax[pattern];
            }
        }
    }
    return null;
}

// p - if to be $p
$api = function (method, url, params = '', path = '/', element = null, p = true) {

    this.method = method.toUpperCase();

    this.cache = false;

    this.url = p ? url.$p(element) : url;
    this.params = params;
    if (p && typeof (this.params) == 'string' && this.params != '') {
        this.params = this.params.$p(element);
    }

    this.req = new XMLHttpRequest();
    this.async = true;

    let api = this;
    this.req.onreadystatechange = function () {
        // readyState
        // 0 (未初始化) unintialized
        // 1 (正在装载) loading
        // 2 (装载完毕) loaded
        // 3 (交互中) interactive
        // 4 (完成) complete

        if (this.readyState == 4) {
            //if(req.status == 200)
            if (this.status == 0 || (this.status >= 200 && this.status < 300)) {
                //当一切都OK了, 就干点活吧
                if (api.onsuccess != null) {
                    //函数类型
                    if (typeof (api.onsuccess) == 'function') {
                        let result = this.responseText;
                        try {
                            result = new Json(this.responseText).find(path);
                        }
                        catch(e) {

                        }
                        api.onsuccess.call(this, result);
                    }
                }
            }
            else {
                if (typeof (api.onerror) == 'function') {
                    api.onerror.call(this, this.status, this.statusText);
                }
            }

            //oncomplete
            if (typeof (api.oncompelete) == 'function') {
                api.oncompelete.call(this);
            }
        }
    };
    
    this.onsend = null; //function(url, params) { };
    this.oncompelete = null; //function() { };
    this.onerror = null; //function(status, statusText) { };
    this.onsuccess = null; //function(result) { };
}

$api.prototype.$send = function () {

    let url = this.url; //encodeURI(this.url); 必须后端配合才可以
    if (!this.cache) {
        url += url.includes('?') ? '&' : '?';
        url += 'r0x' + new Date().valueOf();
    }

    //open方法第三个参数设置请求是否为异步模式.如果是true, JavaScript函数将继续执行,而不等待服务器响应

    if (typeof (this.onsend) == 'function') {
        this.onsend.call(this, url, this.params);
    }

    if (this.method == 'GET' || this.method == 'DELETE') {
        if (this.params != null) {
            url += url.includes('?') ? '&' : '?'

            if (typeof (this.params) != 'string') {
                let d = [];
                if (this.params instanceof Object) {
                    for (let n in this.params) {
                        d.push(n + '=' + encodeURIComponent(this.params[n]));
                    }
                }
                else if (this.params instanceof Map) {
                    for (let n of this.params) {
                        d.push(n[0] + '=' + encodeURIComponent(n[1]));
                    }
                }
                url += d.join('&');
            }
        }

        this.req.open(this.method, url, this.async);
        this.req.send(null);
    }
    else if (this.method == 'POST' || this.method == 'PUT') {
        this.req.open(this.method, url, this.async);
        if (this.params == null || typeof (this.params) == 'string') {
            this.req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            this.req.send(this.params);
        }
        else {
            this.req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            this.req.send(JSON.stringify(this.params));
        }        
    }
}

$api.prototype.sync = function(enabled = true) {
    this.async = !enabled;
    return this;
}

$api.prototype.send = function (func) {
    this.onsend = func;
    return this;
}

$api.prototype.complete = function (func) {
    this.oncompelete = func;
    return this;
}

$api.prototype.error = function (func) {
    this.onerror = func;
    return this;
}

$api.prototype.success = function (func) {
    this.onsuccess = func;
    this.$send();
}

//data 传递 data, value, text 三个变量的数据对象
$cogo = function(todo, element, data) {
    todo = todo.trim();
    if (todo.includes('@')) {
        todo = todo.placeModelData();
    }

    let method = 'GET';
    let path = '/';
    let setting = null;

    if (/^(get|post|delete|put)\s*:/i.test(todo)) {
        method = todo.takeBefore(':').trim().toUpperCase();
        todo = todo.takeAfter(':').trim();
    }

    if (/^[a-z]+\s+/i.test(todo)) {
        method = 'POST';
        todo = '/api/cogo/pql?statement=' + encodeURIComponent(todo.$p(element, data));        
    }
    else {
        setting = $ajax.match(todo);

        if (/#\s*\//.test(todo)) {
            let sp = /#\s*\//.exec(todo)[0];
            path = todo.substring(todo.lastIndexOf('sp') + 1).trim();
            todo = todo.takeBeforeLast(sp).trim();
        }

        if (/^https?:/i.test(todo)) {
            todo = '/api/cogo/cross?method='+ method + '&url=' + encodeURIComponent(todo.$p(element, data));
        }
        else {
            todo = todo.$p(element, data);
        }
    }

    if (todo != '') {
        return new Promise((resolve, reject) => {
                    $ajax(method, todo, null, path, element, false)
                        .error((status, statusText) => {
                            reject(statusText);
                        })
                        .success(result => {
                            if (setting == null) {
                                resolve(result);
                            }
                            else {
                                let ready  = eval('_ = function(result) { with(result) { return ' + setting.ready + '; } }').call(window, result);
                                if (ready) {
                                    resolve(Json.find(result, setting.path));
                                }
                                else {
                                    reject(Json.find(result, setting.info));
                                }
                            }
                        });
                });
    }
    else {
        return new Promise(resolve => {
            resolve(null);
        });
    }
};
//server event
$FIRE = function (element, event, succeed, fail, except, complete, actualElement) {
    let action = element[event].trim();
    if (action != '') {
        let expection = '';
        if (!/^[a-z]+\s+/i.test(action) || /^(get|post|delete|put)\s*:/i.test(action)) {
            if (action.includes('->')) {
                expection = action.takeAfter('->').trim();
                action = action.takeBefore('->').trim();
            }
        }

        $cogo(action, actualElement ?? element, element)
            .then(data => {
                let valid = true;
                if (expection != '') {
                    switch (expection) {
                        case 'empty':
                            valid = $parseEmpty(data, true);
                            break;
                        case 'non-empty':
                        case 'not-empty':
                            valid = !$parseEmpty(data, false);
                            break;
                        case 'true':
                            valid = $parseBoolean(data, true, actualElement ?? element);
                            break;
                        case 'false':
                            valid = !$parseBoolean(data, false);
                            break;
                        case 'zero':
                            valid = $parseZero(data, 1);
                            break;
                        case 'non-zero':
                        case 'not-zero':
                            valid = !$parseZero(data, 0);
                            break;
                        default:                            
                            if (expection.includes('data')) {
                                valid = $parseBoolean(expection.eval(actualElement ?? element, data), true, actualElement ?? element);
                            }
                            else {
                                valid = Json.toString(data) == expection;
                            }
                            break;
                    }   
                }
                else if ((element.successText != null && element.successText != '') || (element.failureText != null && element.failureText != '')) {
                    valid = $parseBoolean(data, true, actualElement ?? element);
                }

                if (valid) {
                    succeed.call(element, data);
                    Event.execute(element, event + 'success', data);                                  
                }
                else {
                    fail.call(element, data);
                    Event.execute(element, event + 'failure', data);                    
                }
            })
            .catch(error => {
                if (except != null) {
                    except.call(element, error);
                }                
                Event.execute(element, event + 'exception', error);                
                console.error(error);
            })
            .finally(() => {
                complete?.call(element);
                Event.execute(element, event + 'completion');
            });
    }
};

$lang = (function() {
    return (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
})();

$mobile = (function() {
    return navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone');
})();

//queryString, query()方法不区分大小写
$query = function () {
    let q = window.location.search.substring(1);
    if(q != '')	{
        q.split('&').forEach(p => {
            if (p.includes('=')) {
                $query.s[p.substring(0, p.indexOf('='))] = decodeURIComponent(p.substring(p.indexOf('=') + 1));
            }
            else {
                $query[p] = '';
            }
        });
    }
}
$query.s = { };
$query.get = function(n) {
    if ($query.s[n] != null) {
        return $query.s[n];
    }
    else {
        for (let k in $query.s) {
            if (new RegExp('^' + n + '$', 'i').test(k)) {
                return $query.s[k];
            }
        }
        return null;
    }
}
$query.has = function(n) {
    return $query.s[n] != null;
}
$query();

$cookie = function () {
	//	document.cookie = 'cookieName=cookieData
	//	[; expires=timeInGMTString]
	//	[; path=pathName]
	//	[; domain=domainName]
	//	[; secure]'
    //	document.cookie = 'name=value; expires=' + expiresTime.toGMTString() + '; path=/; domain=soufun.com';
    document.cookie.split('; ')
        .forEach(c => {
            $cookie.s[c.substring(0, c.indexOf('='))] = c.substr(c.indexOf('=') + 1);
        });    
}
$cookie.s = { };
$cookie.get = function(name) {
    return ($cookie.s[name] != undefined ? $cookie.s[name] : '');
}
$cookie.set = function(name, value, expires, path, domain) {
    let cookie = name + '=' + value;
    if (expires != null) {
        let expiresTime = new Date();
        let expiresTicks = expiresTime.getTime() + (expires * 1000);
        expiresTime.setTime(expiresTicks);
        cookie += '; expires=' + expiresTime.toGMTString();
    }
    if (path == null) {
        path = '/';
    }
    cookie += '; path=' + path;
    if (domain != null) {
        cookie += '; domain=' + domain;
    }

    document.cookie = cookie;
    $cookie.s[name] = value;
}
$cookie.has = function(n) {
    if ($cookie.s[n] == null) {
        $cookie();
    }
    return $cookie.s[n] != null;
}
$cookie();

Json = function(strOrObj) {
    if (typeof (strOrObj) == 'string') {
        strOrObj = strOrObj.replace(/&quot;/g, '"');        
        try {
            this.json = JSON.parse(strOrObj);
        }
        catch(e1) {
            try {
                this.json = eval('(' + strOrObj + ')');
            }
            catch(e2) {
                throw new Error('Error occured when try to parse json string. Exception of JSON.parse :' + e1 + ', eval: ' + e2);
            }
        }
    }
    else {
        this.json = strOrObj;
    }
}

Json.prototype.toString = function() {
    return JSON.stringify(this.json);
}

Json.toString = function(v) {
    return (typeof (v) != 'string' ? JSON.stringify(v) : v);
}

Json.find = function(jsonObject, path = '/') {
    if (path != '/' && path != '') {
        let json = jsonObject;
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        
        while (json != null && path != '') {
            let s = (path.includes("/") ? path.substring(0, path.indexOf('/')) : path).trim();
            json = (s != '' ? json[s] : null);
            path = (path.includes("/") ? path.substring(path.indexOf('/') + 1) : '');
        }

        return json;
    }
    else {
        return jsonObject;
    }    
}

Json.eval = function(json) {
    return new Json(json).find();
}

Json.prototype.find = function(path = '/') {
    return Json.find(this.json, path);
}

Enum = function() {
    return new Enum.Entity(new RegExp('^(' + Array.from(arguments).join('|') + ')$', 'i'), arguments[0].takeBefore('|'));
}

Enum.Entity = function(expression, defaultValue) {
    this.expression = expression;
    this.defaultValue = defaultValue;
}

Enum.Entity.prototype.validate = function(value, toUpper = false) {
    if (value == null || !this.expression.test(value.trim())) {
        value = this.defaultValue;
    }
    //return value.toUpperCase();
    return toUpper ? value.toUpperCase() : value.toLowerCase();
}

//all components
// name -> component
// name doesn't start with '#'
document.components = new Map();
//只是为了保存onfinish事件
//所有 model 加载完成后执行 onfinish 事件
document.components.set('$global', {
    nodeName: 'GLOBAL',
    tagName: 'GLOBAL',
    nodeType: 0,
    onpost: null,
    onload: null,
    events: new Map()
});

// id -> event-name -> [func]
Event.s = new Map(); //暂存自定义组件事件

//v1.8.113
Event.bind = function (tag, eventName, func) {
    
    //tag 标签或对象
    //tag 自定义标签 id/name
    //tag 原生标签 id/name

    eventName = eventName.trim().toLowerCase().prefix('on');

    let id;
    if (typeof(tag) == 'string') {
        if (tag.startsWith('#')) {
            id = tag.drop('#');
            if (document.components.has(id)) {
                tag = document.components.get(id);
            }
            else {
                tag = document.querySelector(tag + ',[name=' + id + ']');
                if (tag == null) {
                    throw new Error('Incorrect selector or nonexistent element: #' + id);
                }
            }
        }
        else if (tag == '$global') {
            id = tag;
            tag = document.components.get(tag);
        }
        else {
            if (document.components.has(tag)) {
                id = tag;
                tag = document.components.get(tag);
            }
            else {
                let selector = tag;
                tag = document.querySelector(tag);
                if (tag == null) {
                    throw new Error('Incorrect selector or nonexistent element: ' + selector);
                }
                else {
                    id = tag.id || tag.name || '';
                }
            }
        }
    }
    else {
        id = tag.id || tag.name || '';
    }
    
    if (tag.events != null) {
        //原生标签或已加载完的自定义标签
        if (!tag.events.has(eventName)) {
            tag.events.set(eventName, new Array());
        }
        tag.events.get(eventName).push(func);
    }
    else {
        //未加载完的自定义标签
        if (!Event.s.has(id)) {
            Event.s.set(id, new Map());
        }
        if (!Event.s.get(id).has(eventName)) {
            Event.s.get(id).set(eventName, new Array());
        }
        Event.s.get(id).get(eventName).push(func);
    }    
}

Event.await = function(tag, await) {
    await.split(',')
    .map(a => a.trim())
    .forEach(a => {
        Event.bind(a, 'onload', function() {
            tag.await = tag.await.replace(new RegExp(a + '\\b'), '').$trim(',');
            if (tag.await == '') {
                tag.load();
            }            
        });
    });
}

//native event
Event.dispatch = function(tag, eventName) {
    if (typeof (tag) == 'string') {
        tag = $s(tag);
    }
    if (tag != null) {
        let event = document.createEvent('Events');
        // event, bubbles, cancelable
        event.initEvent(eventName.replace(/^on/i, ''), true, false);
        tag.dispatchEvent(event);
    }
}

Event.execute = function (tag, eventName, ...args) {
    eventName = eventName.trim().toLowerCase().prefix('on');

    if (typeof(tag) == 'string') {
        if (document.components.has(tag)) {
            tag = document.components.get(tag);
        }
        else {
            tag = document.querySelector('#' + tag + ',[name=' + tag + ']');
        }
    }

    if (tag != null) {
        let final = Event.fire(tag, eventName, ...args);
        tag.events?.get(eventName)?.forEach(func => {
            if (!Event.trigger(tag, func, ...args) && final) {
                final = false;
            }
        });       

        return final;
    }
    else {
        console.error('Event carrier does not exists.');
        return false;
    }
}

//执行某一个具体对象的事件非bind事件，再比如对象没有name，如for和if标签
Event.fire = function(tag, eventName, ...args) {
    eventName = eventName.trim().toLowerCase().prefix('on');

    let final = true;
    if (tag[eventName] != null) {
        final = Event.trigger(tag, tag[eventName], ...args);
    }
    return final;
}

Event.trigger = function(tag, func, ...args) {
    let final = true;
    if (func != null) {
        if (typeof (func) == 'function') {
            final = func.call(tag, ...args);
        }
        else if (typeof (func) == 'string') {
            final = eval('final = function() {' + func + '}').call(tag, ...args);
        }
        if (typeof (final) != 'boolean') { final = true; };
    }
    return final;  
}

Event.express = function(exp) {
    for (let sentence of exp.split(';')) {
        let value = '';
        if (sentence.includes('->')) {
            value = sentence.takeAfter('->').trimLeft();
            sentence = sentence.takeBefore('->').trimRight();
        }
        let [method, selector] = sentence.includes(':') ? [sentence.takeBefore(':').trim(), sentence.takeAfter(':').trim()] : [sentence.trim(), ''];
        let item = '';
        if (method.includes('-')) {
            item = method.takeAfterLast('-');
            method = method.takeBeforeLast('-').toCamel();
        }

        if (selector == '') {
            if (this[method] != null) {
                if (item != '') {
                    this[method](item, value.$p(this));
                }
                else if (value != '') {
                    this[method](value.$p(this));
                }
                else {
                    this[method](...args);
                }
            }
            else if (window[method] != null) {
                if (item != '') {
                    window[method](item, value.$p(this));
                }
                else if (value != '') {
                    window[method](value.$p(this));
                }
                else {
                    window[method]();
                }
            }
            else {
                throw new Error('Method "' + method + '" is undefined.');
            }
        }
        else {
            selector.split(',')
                .map(v => v.trim())
                .forEach(r => {
                    if (r.startsWith('#')) {
                        let s = $s(r);
                        if (s != null) {
                            if (s[method] != null) {
                                if (item != '') {
                                    s[method](item, value.$p(this));
                                }
                                else if (value != '') {
                                    s[method](value.$p(this));
                                }
                                else {
                                    s[method]();
                                }
                            }
                            else {
                                throw new Error('Method "' + method + '" is undefined for "' + r + '".');
                            }
                        }
                        else {
                            throw new Error('Element "' + r + '" does not exists.');
                        }
                    }
                    else {
                        $a(r).forEach(e => {
                            if (e[method] != null) {
                                if (item != '') {
                                    e[method](item, value.$p(this));
                                }
                                else if (value != '') {
                                    e[method](value.$p(this));
                                }
                                else {
                                    e[method]();
                                }
                            }
                            else {
                                throw new Error('Method "' + method + '" is undefined for "' + r + '".');
                            }
                        });                        
                    }
                });
        }
    }
}

Event.interact = function(obj, element) {
    if (obj.events == null) {
        obj.events = new Map();
    }    
    element.getAttributeNames().forEach(name => {
        if (/^on/i.test(name) && name.endsWith('-')) {
            //on{event}-
            Event.bind(obj, name.dropRight(1), function(...args) {
                Event.express.call(this, element.getAttribute(name).$p(this, args));
            }, false);
        }
        else if (/-on$/i.test(name)) {
            //{method}-{attr}-on
            Event.watch(obj, name, element.getAttribute(name));
            element.removeAttribute(name); //防止重复监听
        }
    });

    if ((obj.id != null && obj.id != '') || (obj.name != null && obj.name != '')) {
        let id = obj.id || obj.name;
        if (Event.s.has(id)) {
            for (let [eventName, funcs] of Event.s.get(id)) {
                if (!obj.events.has(eventName)) {
                    obj.events.set(eventName, new Array());
                }
                obj.events.get(eventName).push(...funcs);
            }
            Event.s.delete(id);
        }
    }
}

Event.watch = function(obj, name, watcher) {

    let method = name.takeBeforeLast('-');
    let attr = obj.value != undefined ? 'value' : 'innerHTML';
    if (obj instanceof HTMLButtonElement) {
        attr = 'innerHTML';
    }
    if (method.includes('-')) {                
        attr = method.takeAfter('-');
        method = method.takeBefore('-');                
    }

    let value = '';
    //let watcher = element.getAttribute(name);
    if (watcher.includes('->')) {
        value = watcher.takeAfter('->').trim();
        watcher = watcher.takeBefore('->').trim();
    }
    let func = function() {
        obj[method](attr, value.$p(obj));
    };
    watcher.split(';')
        .map(w => {
            return w.includes(':') ? {
                event: w.takeBefore(':').trim(),
                selector: w.takeAfter(':').trim()
            } : {
                event: w,
                selector: obj.id == '' ? obj : ('#' + obj.id) //目的是可以通过 id 选择自定义组件
            };
        })
        .forEach(watch => {
            if (typeof(watch.selector) == 'string') {
                watch.selector
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s != '')
                    .forEach(s => {
                        $s(s).on(watch.event, func);                        
                    });
            }
            else {
                watch.selector.on(watch.event, func);
            }
        });
}

$transfer = function(source, target) {
    let excludings = new Set(['id', 'type', 'data']);
    source.getAttributeNames()
        .forEach(attr => {
            if (!excludings.has(attr)) {
                let value = source[attr] != null ? source[attr] : source.getAttribute(attr);
                if (target[attr] != null) {
                    target[attr] = value;
                }
                else if (!attr.includes('+') && !attr.includes('-')) {
                    target.setAttribute(attr, value);
                }
            }
        });
}

$initialize = function(object, child = false) {
    return new CustomElement(object, child);
}

CustomElement = function(object, child = false) {
    this.carrier = null;
    this.object = object;
    this.isElement = false;
    this.$burn = false;
    this.child = child;

    this.object['nodeName'] = object.constructor != null ? (object.constructor.name != null ? object.constructor.name.toUpperCase() : 'UNKONWN') : 'UNKONWN';
    this.object['tagName'] = this.object['nodeName'];
    this.object['nodeType'] = 0; // 0 为自定义标签
}

CustomElement.prototype.with = function(elementOrSettings) {
    this.carrier = elementOrSettings;
    if (this.carrier != null && this.carrier.nodeType == 1) {
        this.isElement = true;
    }

    return this;
}


CustomElement.prototype.burnAfterReading = function() {
    this.$burn = true;
    return this;
}

CustomElement.prototype.declare = function(variables) {
    
    for (let name in variables) {
        let property = name;
        if (/^[_\$]/.test(property)) {
            property = property.substring(1);
        }
        let $p = false; //get 时解析
        if (property.endsWith('$')) {
            $p = true;
            property = property.dropRight(1);
        }

        let value = variables[name];
        if ($p) {
            this.object[name] = this.get(property); 
            this.object[name + 'value'] = value;
        }
        else if (typeof(value) == 'string') {
            if (property == 'name') {
                this.object.id = this.get('id') || '';
                this.object[name] = this.get('name') || this.object.id || value;
                
                if (this.object.id == '' && this.object.name != '') {
                    this.object.id = this.object[name];
                }                

                if (this.isElement) {
                    if (this.carrier.id == '' && this.object.id != '') {
                        this.carrier.id = this.object.id;
                    }
                }
            }
            else if (value == 'html') {                
                if (this.isElement) {                    
                    let find = null;
                    for (let i = 0; i < this.carrier.children.length; i++) {
                        if (this.carrier.children[i].nodeName == property.toUpperCase() || this.carrier.children[i].nodeName == property.toHyphen().toUpperCase()) {
                            find = this.carrier.children[i];
                            break;
                        }
                    }
                    if (find != null) {
                        this.object[name] = find.innerHTML;
                    }
                    else {
                        find = this.carrier.getAttribute(property) || this.carrier.getAttribute(property.toHyphen());
                        if (find != null) {
                            this.object[name] = find;
                        }
                        else if (property == 'text') {
                            this.object[name] = this.carrier.innerHTML;
                        }
                        else {
                            this.object[name] = '';
                        }
                    }
                }
                else {
                    this.object[name] = $parseString(this.get(property), '');
                }
            }
            else if (value == 'css') {
                let className = this.get(property);
                if (className == null && this.isElement) {
                    let tag = property.replace(/Class$/, '');
                    tag = this.carrier.querySelector(tag) || this.carrier.querySelector(tag.toHyphen());
                    if (tag != null) {
                        className = tag.className;
                    }
                }
                this.object[name] = className;
            }
            else if (value.includes('[') && value.endsWith(']')) {
                let result = this.get(property);
                if (result == null && this.isElement) {
                    let tag = value.takeBefore('[');
                    let attr = value.takeAfter('[').dropRight(1);
                    tag = this.carrier.querySelector(tag) || this.carrier.querySelector(tag.toHyphen());
                    if (tag != null) {
                        if (tag.hasAttribute(attr)) {
                            result = tag.getAttribute(attr);
                        }
                        else if (tag.hasAttribute(attr.toHyphen())) {
                            result = tag.getAttribute(attr.toHyphen());
                        }
                    }                    
                }
                this.object[name] = result;
            }
            else if (value == '$s' || value == '$') {
                this.object[name] = $s(this.get(property));
            }
            else if (value == '$a' || value == '$$') {
                this.object[name] = $a(this.get(property));
            }
            //enum 枚举, 默认值为第1项
            else if (value.includes('|')) {
                this.object[name] = Enum(value).validate(this.get(property), false);
            }
            else {
                this.object[name] = $parseString(this.get(property), value);                
            }
        }
        else if (typeof(value) == 'number') {
            if (String(value).includes('.')) {
                this.object[name] = $parseFloat(this.get(property), value);
            }
            else {
                this.object[name] = $parseInt(this.get(property), value);
            }
        }
        else if (typeof(value) == 'boolean') {
            this.object[name] = $parseBoolean(this.get(property), value, this.object);
        }
        else if (name.startsWith('on') && typeof(value) == 'function') {
            this.object[name] = this.get(name);
        }
        else if (typeof(value) == 'function') {
            this.object[name] = value.call(this.object, this.get(property));
        }
        else if (value instanceof Array) {
            this.object[name] = $parseArray(this.get(property), value);
        }
        else if(value instanceof Enum.Entity) {
            this.object[name] = value.validate(this.get(property), true);
        }
        else if (value instanceof Object) {
            this.object[name] = Json.eval(this.get(property));
        }
        else {
            this.object[name] = this.get(property);
        }
    }

    if (!this.child) {
        this.object.on = function (eventName, func) {
            Event.bind(this, eventName, func);
            return this;
        }
        
        this.object.execute = function (eventName, ...args) {
            return Event.execute(this, eventName, ...args);
        }
        
        if (this.object.name != '') {
            document.components.set(this.object.name, this.object);
        }
    }

    return this;
}

CustomElement.prototype.get = function(attr) {
    let value = null;

    if (this.carrier != null) {
        if (this.isElement) {
            if (!this.carrier.hasAttribute(attr) && this.carrier[attr] == undefined) {
                if (/[A-Z]/.test(attr)) {
                    attr = attr.toHyphen();
                    if (!this.carrier.hasAttribute(attr) && this.carrier[attr] == undefined) {
                        attr = '';
                    }                    
                }
            }
            
            if (attr != '') {
                //优先获取显式定义的属性
                if (this.carrier.getAttribute(attr) != null) {
                    value = this.carrier.getAttribute(attr);
                }
                //class需要从原生属性className获取
                else if (this.carrier[attr] != undefined) {
                    //排除掉有问题的项
                    if (!'selectedIndex,draggable'.$includes(attr)) {
                        value = this.carrier[attr];
                    }
                }
                //burn after reading
                if (this.$burn) {
                    this.carrier.removeAttribute(attr);
                }                
            }            
        }
        else if (this.carrier[attr] != null) {
            value = this.carrier[attr];
            if (this.$burn) {          
                delete this.carrier[attr];
            }            
        }
    }

    return value;
}

CustomElement.prototype.elementify = function(func) {
    if (this.isElement) {
        func.call(this.object, this.carrier);
    }
    return this;
}

CustomElement.prototype.objectify = function(func) {
    if (this.carrier != null && !this.isElement) {
        func.call(this.object, this.carrier);
    }
    return this;
}

$enhance = function(object) {
    return new NativeElement(object);
}

NativeElement = function(object) {    
    this.object = object;
    this.object.constructor.getterX = new Map();
    this.object.constructor.setterX = new Map();
}

NativeElement.executeAopFunction = function(object, func, value) {
    if (typeof (func) == 'string') {
        return function(func, value) { return evel(func) }.call(object, func, value)
    }
    else {
        return func.call(object, value);
    }
}

//新定义扩展属性, 由元素属性保存值
NativeElement.prototype.declare = function(variables) {
    for (let name in variables) {
        Object.defineProperty(this.object, name, {
            enumerable: true,
            configurable: true,
            get() {
                let defaultValue = variables[name];
                let value = this.getAttribute(name.replace(/^[_$]/, '').toHyphen());
                if (value == null) {
                    value = this.getAttribute(name);
                }
                if (this.constructor.getterX.has(name)) {
                    value = NativeElement.executeAopFunction(this, this.constructor.getterX.get(name), value == null ? defaultValue : value);
                }

                if (typeof(defaultValue) == 'string') {
                    if (defaultValue.includes('|')) {
                        return Enum(defaultValue).validate(value);
                    }
                    else {
                        return $parseString(value, defaultValue);
                    }                    
                }
                else if (typeof(defaultValue) == 'number') {
                    if (String(defaultValue).includes('.')) {
                        return $parseFloat(value, defaultValue);
                    }
                    else {
                        return $parseInt(value, defaultValue);
                    }
                }
                else if (typeof(defaultValue) == 'boolean') {
                    return $parseBoolean(value, defaultValue, this);
                }                
                else if(defaultValue instanceof Enum.Entity) {
                    return defaultValue.validate(value);
                }
                else if (typeof(defaultValue) == 'function') {
                    return defaultValue.call(this, value);
                }
                else {
                    return value;
                }
            },
            set(value) {
                if (this.constructor.setterX.has(name)) {
                    let result = NativeElement.executeAopFunction(this, this.constructor.setterX.get(name), value);
                    if (result !== undefined) {
                        value = result;
                    }
                }
                this.setAttribute(name, value);
            }
        });
    }
    return this;
};

//扩展标签属性的 geteter  如改变要获取的值，即对要获取的值进行检查
NativeElement.prototype.getter = function(properties) {
    for (let name in properties) {
        this.object.constructor.getterX.set(name, properties[name]);
    }
    return this;
}

//扩展标签属性的 seteter 如改变要设置的值，即对要设置的值进行检查
NativeElement.prototype.setter = function(properties) {
    for (let name in properties) {
        this.object.constructor.setterX.set(name, properties[name]);
    }
    return this;
}

//不能用declare方法定义的属性，或者要覆盖原生属性，最大自由度
NativeElement.prototype.define = function(properties) {
    for (let name in properties) {
        Object.defineProperty(this.object, name, properties[name]);
    }
    return this;
};

//绑定服务器端事件
NativeElement.prototype.extend = function(...events) {
    events.forEach(event => {
        [event, event + 'success', event + 'failure', event + 'exception', event + 'completion']
            .forEach(name => {
                Object.defineProperty(this.object, name, {
                    get() {
                        return this.getAttribute(name);
                    },
                    set (value) {
                        this.setAttribute(name, value);
                    }
                });
            });
    });  
    return this;
}

//声明隐式变量, 非标签中声明的参数或扩展方法，下划线开头的私有变量保存值
NativeElement.prototype.describe = function(variables) {
    for (let name in variables) {
        this.object['_' + name] = null;
        Object.defineProperty(this.object, name, {
            extension: true,
            get () {
                if (this['_' + name] == null) {
                    this['_' + name] = this.getAttribute(name) || this.getAttribute(name.toHyphen()) || variables[name];
                }
                return this['_' + name];
            },
            set (value) {
                this['_' + name] = value;
            }
        });
        
    }
    return this;
}

Callout = function(content) {
    return new Callout.Entity(content);
}

Callout.Entity = function(content) {
    this.content = content;
    this.reference = null;
    this.location = 1;
    this.offsetX = 0;
    this.offsetY = 0;
}

Callout.Entity.prototype.offset = function(x, y) {
    this.offsetX = x;
    this.offsetY = y;
    return this;
}

Callout.Entity.prototype.position = function(element, pos = 'up') {
    this.reference = typeof(element) == 'string' ? $s(element) : element;
    switch (pos.toLowerCase()) {
        case 'left':
        case 'leftside':
            this.location = 0;
            break;
        case 'right':
        case 'rightside':
            this.location = 2;
            break;
        case 'down':
        case 'downside':
        case 'under':
        case 'bottom':
        case 'below':
            this.location = 3;
            break;
        default:
            this.location = 1;
            break;
    }

    return this;
}

Callout.Entity.prototype.up = function(element) {
    return this.position(element, 'up');
}

Callout.Entity.prototype.down = function(element) {
    return this.position(element, 'down');
}

Callout.Entity.prototype.left = function(element) {
    return this.position(element, 'left');
}

Callout.Entity.prototype.right = function(element) {
    return this.position(element, 'right');
}

Callout.Entity.prototype.locate = function() {
    let callout = $s('#__Callout');
    switch(this.location) {
        case 0:  //left
             return callout.setClass("callout callout-right").leftside(this.reference, this.offsetX - 12, this.offsetY);
        case 1: //over
            return callout.setClass("callout callout-bottom").upside(this.reference, this.offsetX, this.offsetY - 12);
        case 2: //right            
            return callout.setClass("callout callout-left").rightside(this.reference, this.offsetX + 12, this.offsetY);
        case 3: //under
            return callout.setClass("callout callout-top").downside(this.reference, this.offsetX, this.offsetY + 12);
        default:
            return true;
    }
}

Callout.Entity.$timer = null;
Callout.Entity.prototype.show = function(seconds = 0) {
    $s('#__Callout').setHTML(this.content).show().setStyle('visibility', 'hidden');
    let i = 0;
    while (!this.locate()) {
        this.location = (this.location + 1) % 4;
        i ++;
        if (i == 4) {
            break;
        }
    }

    $s('#__Callout').style.visibility = 'visible';
    if (seconds > 0) {
        if (Callout.Entity.$timer != null) {
            window.clearTimeout(Callout.Entity.$timer);
        }
        Callout.Entity.$timer = window.setTimeout(function() {
            $s('#__Callout').hide();
            window.clearTimeout(Callout.Entity.$timer);
        }, seconds * 1000);
    }
}

Callout.hide = function() {
    $s('#__Callout').hide();
}

document.on('ready', function() {
    if (document.documentElement.hasAttribute('mobile')) {
        //<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        document.head.appendChild($create('META', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=no' }));
        document.documentElement.style.fontSize = ($root.visibleWidth() / 16) + 'px';
    }    

    //fixed
    let fixed = $a('div[fixed=yes],table[fixed=yes]');
    let fix = function() {
        fixed.forEach(tag => {            
            tag.style.position = 'fixed';
            tag.style.zIndex = '100';
            tag.style.width = tag.nextElementSibling.offsetWidth + 'px';
        });
    }
    let ajust = function() {
        fixed.forEach(tag => {
            if (tag.offsetWidth != tag.nextElementSibling.offsetWidth) {
                tag.style.width = tag.nextElementSibling.offsetWidth + 'px';
            }
        });
    }
    if (fixed.length > 0) {
        window.on('load', function() {fix(); ajust();}).on('resize', ajust);
        window.setTimeout(ajust, 1000);
    }
});

//will be call in template
$root.initialize = function() {
    $a('[visible],[hidden]').forEach(e => {
        if (e.hasAttribute('hidden')) {
            e.hidden = $parseBoolean(e.getAttribute('hidden'), true, this);
        }
        else if (e.hasAttribute('visible')) {
            e.visible = $parseBoolean(e.getAttribute('visible'), true, this);
        }
    });
}

document.on('post', function() {

    $root.initialize();

    if ($s('#__Callout') == null) {
        document.body.appendChild($create('DIV', { id: '__Callout', className: 'callout', hidden: true }));
        $s('#__Callout').on('click', function() { this.style.display = 'none'; window.clearTimeout(Callout.Entity.$timer); });
    }

    if (document.body.getAttribute('self-adaption') != null) {        
        let layout = function() {
            document.body.getAttribute('self-adaption')
            .split(',')
            .map(frame => $s(frame))
            .forEach(frame => {            
                frame.height = window.innerHeight - frame.top;
            });
        }

        document.body.style.overflowY = 'hidden';
        layout();        
        window.on('resize', layout);
    }

    //iframe
    if (document.body.getAttribute('iframe') != null) {
        let flex = function() {
            parent.$s(document.body.getAttribute('iframe')).height = $root.documentHeight;
        };
        flex();
        window.setInterval(flex, 2000);
    }
});