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
        }
    },
    'hidden': {
        get() {
            return $parseBoolean(this.getAttribute('hidden') ?? false) || this.css.display == 'none' || this.css.visibility == 'hidden' || this.css.opacity == '0';
        },
        set(hidden) {
            if (typeof(hidden) != 'boolean') {
                hidden = $parseBoolean(hidden, true, this);
            }
            if (hidden) {
                this.setAttribute('hidden', '');
                if (this.style.display == 'none' || this.css.display == 'none') {
                    //do nothing
                }
                else if (this.style.display != '') {
                    this.setAttribute('style-display', this.style.display);
                    this.style.display = 'none';
                }
                else if (this.css.display != '') {
                    this.setAttribute('inbox-display', '');
                    this.style.display = 'none';
                }

                if (this.hasAttribute('style-visibility')) {
                    this.removeAttribute('style-visibility');
                    this.style.visibility = 'hidden';
                }
                else if (this.hasAttribute('inbox-visibility')) {
                    this.removeAttribute('inbox-visibility');
                    this.style.visibility = '';
                }

                if (this.hasAttribute('style-opacity')) {
                    this.removeAttribute('style-opacity');
                    this.style.opacity = 0;
                }
                else if (this.hasAttribute('inbox-opacity')) {
                    this.removeAttribute('inbox-opacity');
                    this.style.opacity = '';
                }
            }
            else {
                this.removeAttribute('hidden');
                if (this.hasAttribute('style-display')) {
                    this.style.display = this.getAttribute('style-display');
                    this.removeAttribute('style-display');
                }
                else if (this.hasAttribute('inbox-display')) {
                    this.style.display = '';
                    this.removeAttribute('inbox-display');
                }
                else if (this.style.display == 'none' || this.css.display == 'none') {
                    this.style.display = '';
                }

                if (this.style.visibility == 'hidden') {
                    this.setAttribute('style-visibility', '');
                    this.style.visibility = 'visible';
                }
                else if (this.css.visibility == 'hidden') {
                    this.setAttribute('inbox-visibility', '');
                    this.style.visibility = 'visible';
                }

                if (this.style.opacity == '0') {
                    this.setAttribute('style-opacity', '');
                    this.style.opacity = 1;
                }
                else if (this.css.opacity == '0') {
                    this.setAttribute('inbox-opacity', '');
                    this.style.opacity = 1;
                }
            }

            if (this.hasAttribute('relative')) {
                $a(this.getAttribute('relative')).forEach(e => e.hidden = hidden);
            }
        }
    },
    'text': {
        get() {
            return  this.getAttribute('text') ?? this.$('text')?.innerHTML ?? this.textContent;
        },
        set(text) {
            let t = this.$('text');
            if (t != null) {
                t.textContent = text;
            }
            else {
                this.textContent = text;
            }            
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
            let first = this.firstElementChild;
            if (first == null) {
                return undefined;
            }
            else if (first.nodeName == 'IMG') {
                return first.src;
            }
            else if (first.nodeName == 'I') {
                return first.className.takeAfter('iconfont ');
            }
            else {
                return undefined;
            }
        },
        set(icon) {
            this.$child('img,i')?.remove();
            this.insertAdjacentHTML('afterBegin', icon.iconToHTML());            
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
    },
    'css': {
        get() {
            return window.getComputedStyle(this);
        }
    },
    'clientEvents': {
        // eventName -> eventFunc
        get() {
            if (this['#clientEvents'] == null) {
                this['#clientEvents'] = new Object();
            }
            return this['#clientEvents'];
        }
    },
    'serverEvents': {
        get() {
            if (this['#serverEvents'] == null) {
                this['#serverEvents'] = new Object();
            }
            return this['#serverEvents'];
        }
    },
    //仅用于判断是否添加了某个监听事件
    'eventListeners': {
        // eventName -> eventFunc
        get() {
            if (this['#eventListeners'] == null) {
                this['#eventListeners'] = new Map();
            }
            return this['#eventListeners'];
        }
    },
    'debug': {
        get() {
            return $parseBoolean(this.getAttribute('debug'), false);
        },
        set (debug) {
            ths.setAttribute('debug', debug);
        }
    }
});

Object.defineProperty(window, '$else', {
    get() {
        return $root.$else;
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

HTMLElement.prototype.insertAfter = function(element, reference) {
    if (reference.nextSibling != null) {
        this.insertBefore(element, reference.nextSibling);
    }
    else {
        this.appendChild(element);
    }
}

HTMLElement.prototype.$ = function(o) {
    return this.querySelector(o);
}

HTMLElement.prototype.$$ = function(o) {
    return [...this.querySelectorAll(o)];
}

HTMLElement.prototype.$previous = function(o) {
    if (this.previousElementSibling != null) {
        let children = new Set(this.parentNode.$$children(o));
        if (children.size > 0) {
            let prev = this.previousElementSibling;
            while(prev != null && !children.has(prev)) {
                prev = prev.previousElementSibling;
            }

            return prev;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }    
}

HTMLElement.prototype.$$previousAll = function(o, toElement) {
    let all = [];
    if (this.previousElementSibling != null) {
        let children = new Set(o != null ? this.parentNode.$$children(o) : this.parentNode.children);
        if (children.size > 0) {
            let prev = this.previousElementSibling;
            while (prev != null) {
                if (toElement == null ? false : (typeof(toElement) == 'string' ? prev.tagName == toElement.toUpperCase() : prev == toElement)) {
                    break;
                }
                else if (children.has(prev)) {
                    all.unshift(prev);
                }
                prev = prev.previousElementSibling;
            }
        }
    }

    return all;
}

HTMLElement.prototype.$next = function(o) {
    if (this.nextElementSibling != null) {
        let children = new Set(this.parentNode.$$children(o));
        if (children.size > 0) {
            let next = this.nextElementSibling;
            while(next != null && !children.has(next)) {
                next = next.nextElementSibling;
            }

            return next;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }  
}

HTMLElement.prototype.$$nextAll = function(o, toElement) {
    let all = [];
    if (this.nextElementSibling != null) {
        let children = new Set(o != null ? this.parentNode.$$children(o) : this.parentNode.children);
        if (children.size > 0) {
            let next = this.nextElementSibling;
            while(next != null) {
                if (toElement == null ? false : (typeof(toElement) == 'string' ? next.nodeName == toElement.toUpperCase : next == toElement)) {
                    break;
                }
                else if (children.has(next)) {
                    all.push(next);
                }
                next = next.nextElementSibling;
            }
        }
    }

    return all;
}

HTMLElement.prototype.$$nextTo = function(o, element) {
    let all = [];
    if (this.nextElementSibling != null) {
        let children = new Set(this.parentNode.$$children(o));
        if (children.size > 0) {
            let next = this.nextElementSibling;
            while(next != null) {
                if ((typeof(element) == 'string' ? next.tagName == element.toUpperCase() : next == element)) {
                    break;
                }
                else if (children.has(next)) {
                    all.push(next);
                }
                next = next.nextElementSibling;
            }
        }
    }

    return all;
}

HTMLElement.prototype.$child = function(o) {
    for (let child of this.$$(o)) {
        if (child.parentNode == this) {
            return child;
        }
    }

    return null;
}

HTMLElement.prototype.$$children = function(o) {
    let children = [];
    let all = new Set(this.children);
    for (let child of this.$$(o)) {
        if (all.has(child)) {
            children.push(child);
        }
    }
    return children;
}

HTMLElement.getAttribute = HTMLElement.prototype.getAttribute;
HTMLElement.prototype.getAttribute = function(attr, defaultValue) {
    return HTMLElement.getAttribute.call(this, attr) ?? (attr.includes('-') ? HTMLElement.getAttribute.call(this, attr.toCamel()) : (/[A-Z]/.test(attr) ? HTMLElement.getAttribute.call(this, attr.toHyphen()) : null)) ?? defaultValue;
}

HTMLElement.prototype.get = function(attr) {
    return (attr.includes('-') ? this[attr.toCamel()] : this[attr]) ?? this.getAttribute(attr);    
}

// 用于精简事件表达式、事件监听、增强属性   set-value-on="click: #Button1"
HTMLElement.prototype.set = function(attr, value) {
    let prime = null;
    let camel = null;
    let hyphen = null;

    if (value === undefined) {
        value = attr;
        attr = this.value === undefined ? 'text' : 'value';
    }

    if (attr.includes(':')) {
        prime = attr.takeBefore(':').toCamel();
        attr = attr.takeAfter(':');
    }

    if (attr.includes('-')) {
        camel = attr.toCamel();
        hyphen = attr;
    }
    else if (/[A-Z]/.test(attr)) {
        camel = attr;
        hyphen = attr.toHyphen();
    }
    else if (attr == 'class') {
        camel = 'className';
        hyphen = 'class';
    }
    else {
        camel = attr;
        hyphen = attr;
    }
   
 
    if (value == '+') {
        // attr+ 可能是空值，如 html+, text+
        value = (this.getAttribute(hyphen + '+') || this.get(hyphen))?.$p(this);
    }

    if (prime != null) {
        this[prime][camel] = value; //style:font-size -> style.fontSize
    }
    else if (this[camel] != null) {
        this[camel] = value;    
    }
    else {
        this.setAttribute(hyphen, value);
    }

    if (attr == 'value') {
        this.ajust?.();
    }    
    
    return this;
}

HTMLElement.prototype.setIf = function(test, attr, value) {
    if (this[attr] == test) {
        this.set(attr, value);
    }
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
    this.text = text;
    return this;
}

HTMLElement.prototype.setClass = function (className) {
    if (className != '.') {
        this.className = className;
    }    
    return this;
}

HTMLElement.prototype.removeClass = function(...classes) {
    classes.flatMap(classNames => classNames.trim().split(/\s+/))
        .forEach(className => {
            if (className != '') {
                this.classList.remove(className);
            }
        });    
    return this;
}

HTMLElement.prototype.addClass = function(...classes) {
    classes.flatMap(classNames => classNames.trim().split(/\s+/))
        .forEach(className => {
            if (className != '') {
                this.classList.add(className);
            }        
        });
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

HTMLElement.prototype.if = function(exp) {
    let result = exp;
    if (typeof(exp) == 'string') {
        result = eval('result = function() {return ' + exp + '}').call(this);
    }
    else if (typeof(exp) == 'function') {
        result = exp.call(this, this);
    }

    if (result) {
        $root.$else = null;
        return this;
    }
    else {
        $root.$else = this;
        return null;
    }
}

HTMLElement.prototype.upside = function(reference, offsetX = 0, offsetY = 0, align = 'center') {
    let top = reference.top - this.height + offsetY;
    let left = reference.left + offsetX;
    if (align == 'center') {
        left += reference.offsetWidth / 2 - this.width / 2;
    }
    else if (align == 'right') {
        left += reference.offsetWidth - this.width;
    }

    if (left + this.width > $root.documentWidth) {
        left = $root.documentWidth - this.width;
    }
    
    this.top = top;
    this.left = left;

    return top >= 0;
}

HTMLElement.prototype.downside = function(reference, offsetX = 0, offsetY = 0, align = 'center') {
    let top = reference.top + reference.offsetHeight + offsetY;
    let left = reference.left + offsetX;
    if (align == 'center') {
        left += reference.offsetWidth / 2 - this.width / 2;
    }
    else if (align == 'right') {
        left += reference.offsetWidth - this.width;
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
    this.top = reference.top + reference.offsetHeight / 2 - this.height / 2 + offsetY;

    return this.left >= 0;
}

HTMLElement.prototype.rightside = function(reference, offsetX = 0, offsetY = 0) {
    this.left = reference.left + reference.offsetWidth + offsetX + 12;
    this.top = reference.top + reference.offsetHeight / 2 - this.height / 2 + offsetY;

    return this.left + this.width <= $root.documentWidth;
}

HTMLElement.prototype.callout = function(message, pos = 'up', seconds = 0) {
    Callout(message).position(this, pos).show(seconds);
}

HTMLElement.prototype.show = function(visible = true) {
    if (this.getAttribute('hidden') != 'always') {
        this.visible = visible;
    }
    return this;
}

HTMLElement.prototype.hide = function() {
    if (this.getAttribute('visible') != 'always') {
        this.visible = false;
    }
    return this;
}

HTMLElement.prototype.inElement = function(nodeName) {
    let parent = this.parentNode;
    nodeName = nodeName.toUpperCase();
    while (parent.nodeName != nodeName && parent.nodeName != 'BODY' && parent.nodeName != 'HTML') {
        parent = parent.parentNode;
    }
    return parent.nodeName == nodeName;
}

HTMLElement.customEventsMap = {}; // upperName -> lowerName
HTMLElement.customEvents = new Map(); //保存自定义客户端事件名

//useCapture false 在冒泡阶段执行（从子级到父级）  true 在捕获阶段执行（从父级到子级）
HTMLElement.prototype.on = function(eventNames, func, attach = true, useCapture = false) {
    eventNames.split(',').forEach(eventName => {
        eventName = eventName.prefix('on');
        let onLowerName = (/[A-Z]/.test(eventName) ? (HTMLElement.customEventsMap[eventName] ?? eventName.toLowerCase()) : eventName);
        let lowerName = onLowerName.drop('on');
        let funcStr = func.toString();

        if (!this.eventListeners.has(onLowerName)) {
            this.eventListeners.set(onLowerName, new Set());
        }        
        if (attach) {
            if (!this.eventListeners.get(onLowerName).has(funcStr)) {
                this.addEventListener?.(lowerName, func, useCapture) ?? this.attachEvent?.(onLowerName, func);
                this.eventListeners.get(onLowerName).add(funcStr);                
            }
        }
        else {
            this[onLowerName] = func;
            this.eventListeners.get(onLowerName).add(funcStr);
        }
    });
    
    return this;
}

//属性增强
HTMLElement.boostPropertyValue = function(element, excludings = '') {
    element.getAttributeNames()
        .filter(a => a.endsWith('+') && !a.startsWith('on'))
        .forEach(name => {
            let origin = name.dropRight('+');
            let camel = null;
            if (origin.includes('-')) {
                camel = origin.toCamel();
            }

            if (!excludings.includes(origin) && !excludings.includes(camel)) {
                element.set(origin, '+');    
            }     
        });
}

HTMLElement.hasEventListener = function(element, eventName, func) {
    eventName = eventName.toLowerCase().prefix('on');
    if (func == null) {
        return element[eventName] != null || element.eventListeners.has(eventName);
    }
    else {
        let funcStr = func.toString();
        return element[eventName] == funcStr || (element.eventListeners.has(eventName) && element.eventListeners.get(eventName).has(funcStr));
    }
}

//事件名必须以`on`开头
HTMLElement.defineCustomEvent = function(element, lowerName, upperName) {

    let elementName = element.constructor.name;
    if (!HTMLElement.customEvents.has(elementName)) {
        HTMLElement.customEvents.set(elementName, new Set());
    }
    HTMLElement.customEvents.get(elementName).add(lowerName);

    const property = {
        get() {
            return this.clientEvents[lowerName] ?? this.getAttribute(lowerName);
        },
        set (value) {
            this.clientEvents[lowerName] = value;
        }
    };

    Object.defineProperty(element, lowerName, property);    

    if (upperName != null) {
        Object.defineProperty(element, upperName, property);
        HTMLElement.customEventsMap[upperName] = lowerName;
    }
}

//事件名必须以`on`开头且以`+`结尾
HTMLElement.defineServerEvent = function(element, lowerName, upperName) {

    const property = {
        get() {
            return this.getAttribute(lowerName);
        },
        set (value) {
            this.setAttribute(lowerName, value);
        }
    };

    Object.defineProperty(element, lowerName, property);

    if (upperName != null) {
        Object.defineProperty(element, upperName, property);
    }

    
    ['success', 'failure', 'exception', 'completion']
        .forEach(status => {
            HTMLElement.defineCustomEvent(element, lowerName + status, upperName && (upperName + status));
        });
}

//与 dispatchEvent 对应
HTMLElement.prototype.dispatch = function(eventName, eventArgs) {
    eventName = eventName.prefix('on');
    let onLowerName = (/[A-Z]/.test(eventName) ? (HTMLElement.customEventsMap[eventName] ?? eventName.toLowerCase()) : eventName);

    //仅触发自定义属性事件
    let final = Event.fire(this, onLowerName, { detail: eventArgs ?? {} });
    //仅触发原生和自定义监听事件，原生属性事件也可以触发，未通过 defineCustomEvent 注册的自定义事件也可以触发
    this.dispatchEvent(new CustomEvent(onLowerName.drop('on'), {
        detail: eventArgs ?? { },
        bubbles: false, //不向父级元素冒泡
        cancelable: true, //可取消
        composed: false //不跨越 Shadow DOM
    }));

    return final;
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
        if (window.$model != null) {
            document.head.on('post', func);
        }
        else {
            this.on('ready', func);
        }
    }
    else if (eventName == 'load') {
        if (window.$model != null) {
            document.head.on('load', func);
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
    },
    'isEmpty': {
        get() {
            return this.length == 0;
        }
    },
    'nonEmpty': {
        get() {
            return this.length > 0;
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

Array.prototype.toObject = function(func) {
    let object = { };
    this.forEach(item => {
        object[item] = func.call(null, item);
    });
    return object;
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

Array.prototype.do = function(exp) {    
    if (typeof(exp) == 'function') {
        exp.call(this, this);
    }
    else if (typeof(exp) == 'string') {
        eval('_ = function() { ' + exp + '}').call(this);
    }

    return this;
}

Array.prototype.if = function(func) { 
    let result = exp;
    if (typeof(exp) == 'string') {
        result = eval('result = function() {return ' + exp + '}').call(this);
    }
    else if (typeof(exp) == 'function') {
        result = exp.call(this, this);
    }

    if (result) {
        $root.$else = null;
        return this;
    }
    else {
        $root.$else = this;
        return null;
    }
}

Object.defineProperties(String.prototype, {
    'unicodeLength': {
        get() {
            let l = 0;
            for (let i = 0; i < this.length; i++) {
                let c = this.charCodeAt(i);
                l += (c < 256 || (c >= 0xff61 && c <= 0xff9f)) ? 1 : 2;
            }
            
            return l;
        }
    }
});


String.prototype.trimPlus = function(char = '', char2 = '') {
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

String.prototype.take = function(length) {
    let me = this.toString();
    if (length <= 0) {
        return "";
    }
    else if (length < me.length) {
        return me.substring(0, length);
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
            return this.substring(0, this.length - lengthOrSuffix);
        }
    }
    else {
        if (this.endsWith(lengthOrSuffix)) {
            return this.substring(0, this.length - lengthOrSuffix.length)
        }
        else {
            return this.toString();
        }
    }
}

String.prototype.divide = function(other) {
    return other.split(this.toString());
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
        return value.findFirstIn(me)?.divide(me).first ?? '';
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
        return value.findAllIn(me).last?.divide(me).last ?? '';        
    }
    else {
        throw new Error('Unsupported data type in takeAfterLast: ' + value);
    }
}

String.prototype.fill = function(...element) {
    $a(...element).forEach(tag => tag.innerHTML = this.toString());
    return this.toString();
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
    if (!this.endsWith(str)) {
        return this + str;
    }
    else {
        return this.toString();
    }
}

String.prototype.joint = function(left, right) {
    if (left != null && right == null) {
        return left + this.toString();
    }
    else if (left != null && right != null) {
        return left + this.toString() + right;
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
    
    let value = this.trim().$p(object);

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
        let select = $(this.toString());
        if (select.nodeName != undefined && select.nodeName == 'SELECT') {
            for (let option of select.options) {
                map[option.value] = option.text;
            }
        }
    }
    else if (this.isObjectString) {
        map = JSON.eval(this.toString());
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
    else if (this.isArrayString) {
        JSON.eval(this.toString()).forEach(v => {
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

//argument 'element' also supports object { }
//data : ajax recall data
String.prototype.replaceHolder = function(element, data, follower) {

    let content = this.toString();
    if (content == '') {
        return content;
    }

    if (typeof (element) == 'string') {
        element = document.querySelector(element);
    }

    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');

    //&(query)
    /\&(amp;)?\(([a-z0-9_]+)\)?(\?\((.*?)\))?[!%]?/ig.findAllMatchIn(content)
        .forEach(match => {
            content = content.replace(match[0], $query.has(match[2]) ? $query.get(match[2]).encodeURIComponent(match[0].endsWith('%')) : (match[4] ?? 'null').encodeURIComponent(match[0].endsWith('%')));
        });

    //$(selector).property[index][attr].method()?(defaultValue)%
    /\$(\((.*?)\))((\.\w+\([^\)]*\)|\.\w+|\[-?\d+\]|\[\S+?\])*)(\?\(([^\(\)]*?)\))?([!%])?/ig.findAllMatchIn(content).forEach(match => {
        let selector = match[2].trim();
        let v = selector == '' ? element : $(selector);

        let path = match[3];
        let defaultValue = match[6];
        let encode = match[7] == '%';

        if (path != '') {
            path = path.replace(/\[/g, '.')
                .replace(/\]/g, '')
                .replace(/\.\./g, '.')
                .replace(/^\.|\.$/g, '');

            let stones = path.split('.');
            for (let i = 0; i < stones.length; i++) {
                if (v != null) {
                    let a = stones[i];
                    if (/^\d+$/.test(a)) {
                        v = v.children?.[a.toInt()] ?? v[a.toInt()];
                    }
                    else if (/^-\d+$/.test(a)) {
                        v = v.children?.[v.children.length + a.toInt()] ?? v[v.length + a.toInt()];
                    }
                    else if (a.endsWith(')')) {
                        v = v[a.takeBefore('(')](...a.takeAfter('(').dropRight(1).if(s => s != '')?.split(',').map(r => r.recognize()) ?? []);
                    }
                    else {
                        v = v[a.includes('-') ? a.toCamel() : a] ?? v.getAttribute(a);
                    }
                }
                else {
                    break;
                }
            }
        }

        if (v == null && defaultValue != null) {
            v = defaultValue;
        }

        if (v != null) {
            v = (v.value ?? v.text ?? v).encodeURIComponent(encode);
        }

        content = content.replaceAll(match[0], v);
    });

    //@data place holder
    //@data.property[index]|column|.method()?(defaultValue)!
    /@([a-z_]\w*)(\.\w+\([^\)]*\)|\.\w+|\[-?\d+\]|\[\S+?\]|\|\S+?\|)*(\?\([^\(\)]*?\))?\!?/ig.findAllIn(content)
        .forEach(holder => {
            let path = holder.replace(/\!$/, ''); //this is holder
            let defaultValue = null;
            if (path.includes('?(')) {
                defaultValue = path.takeAfter('?(').replace(/\)$/, '');
                path = path.takeBefore('?(');
            }

            path = path.replace(/^\@|\!$/g, '')
                .replace(/\[/g, '.')
                .replace(/\]/g, '')
                .replace(/\//g, '.')
                .replace(/:/g, '.')
                .replace(/\|\./g, '.')
                .replace(/\|$/, '.')
                .replace(/\|/g, '.|')
                .replace(/\.\./g, '.')
                .replace(/\.$/, '');
                    
            let stones = path.split('.');
            let n = stones[0]; //name            
            if (n == '') {
                n = 'data'; 
            }
            let v = null; //value
            if ((data == null || data[n] == null) && window.$model?.[n] != null) {
                if (follower != null && follower != '') {
                    $('#' + n)?.followers?.add(follower.prefix('#'));
                }
                v = $model[n];
            }
            else {
                v = data?.[n];
            }

            for (let i = 1; i < stones.length; i++) {
                if (v != null) {
                    let a = stones[i]; //a = attribute
                    if (a.startsWith('|')) {
                        a = a.substring(1);
                        if (v instanceof Array) {                        
                            v = v.map(t => t[a]) // t = item
                        }
                        else {
                            v = null;
                            break;
                        }
                    }
                    else if (/^-\d+$/.test(a)) {
                        v = v[eval(v.length + a)];
                    }
                    else if (a.endsWith(')')) {
                        v = v[a.takeBefore('(')](...a.takeAfter('(').dropRight(1).if(s => s != '')?.split(',').map(r => r.recognize()) ?? []);
                    }
                    else {
                        v = v[a];
                    }  
                }            
                else {
                    break;
                }
            }
        
            if (v == null && defaultValue != null) {
                v = defaultValue;
            }
        
            if (typeof(v) == 'string') {
                //处理数据中的双引号, JSON 解析时会自动转换
                v = v.replace(/"/g, '&quot;')
            }

            
            content = content.replaceAll(holder, JSON.stringifo(v));            
        });

        
    //~{{complex expression}}
    //must return a value 
    /\~?\{\{(.+?)\}\}%?/sg.findAllMatchIn(content)
        .forEach(match => {
            let result = eval('_ = function(data) { with(data) {' + match[1].decode() + '} }').call(element, $root.__bulidDataArgs(data, element));
            if (typeof(result) != 'string') {
                result = JSON.stringify(result);
            }
            if (match[0].endsWith('%')) {
                result = encodeURIComponent(result);
            }        
            content = content.replace(match[0], result);
        });

    //~{simple expression}
    /\~?\{(.+?)\}%?/sg.findAllMatchIn(content)
        .forEach(match => {
            if (match[0] != content || !content.isObjectString) {
                let result = eval('_ = function(data) { with(data) { return ' + match[1].decode() + '} }').call(element, $root.__bulidDataArgs(data, element));
                if (typeof(result) != 'string') {
                    result = JSON.stringify(result);
                }
                if (match[0].endsWith('%')) {
                    result = encodeURIComponent(result);
                }
                content = content.replace(match[0], result);    
            }            
        });

    //% - for url only
    /(?<==)(.*?)%(?=(\?:&|#|$))/sg.findAllMatchIn(content)
        .forEach(match => {
            content = content.replace(match[0], encodeURIComponent(match[1]));
        });

    return content;
}

String.prototype.$p = String.prototype.replaceHolder;
String.prototype.placeData = function(data, follower) {
    return this.replaceHolder(null, data, follower);
}
String.prototype.followModel = function(follower) {
    return this.replaceHolder(null, null, follower);
}

String.prototype.if = function(exp) {
    let result = exp;
    if (typeof(exp) == 'string') {
        result = eval('result = function() {return ' + exp + '}').call(this);
    }
    else if (typeof(exp) == 'function') {
        result = exp.call(this, this);
    }

    if (result) {
        $root.$else = null;
        return this.toString();
    }
    else {
        $root.$else = this.toString();
        return null;
    }
}

String.prototype.ifEmpty = function(other) {
    return this.toString().trim() == '' ? other : this.toString();
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

String.prototype.toObject = function() {
    return JSON.eval(this.toString());
}

String.prototype.shuffle = function(digit) {
    let p = [];
    if (digit == null) {
        let s = new Set();
        for (let i = 0; i < this.length; ) {
            let x = Math.randomNext(0, this.length - 1);
            if (!s.has(x)) {
                s.add(x);
                p.push(this[x]);
                i++;
            }
        }
    }
    else {
        for (let i = 0; i < digit; i++) {
            p.push(this[Math.randomNext(0, this.length - 1)]);
        }
    }

    return p.join('');
}

String.shuffle = function(digit = 7) {
    return "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".shuffle(digit);    
}

String.generateGUID = function() {
    return new Date().valueOf() + '-' + String.shuffle(11);
}

String.prototype.$ = function() {
    return $(this.toString());
}

String.prototype.$$ = function() {
    return $$(this.toString());
}

String.prototype.do = function(exp) {    
    if (typeof(exp) == 'function') {
        exp.call(this.toString(), this.toString());
    }
    else if (typeof(exp) == 'string') {
        eval('_ = function() { ' + exp + '}').call(this.toString());
    }

    return this.toString();
}

String.prototype.iconToHTML = function(path) {
    let icon = this.toString();
    if (icon.startsWith('icon-')) {
        return '<i class="iconfont ' + this.toString() + '"></i>';
    }
    else if (icon.isImageURL) {
        icon = icon.replaceAll('\\', '/');
        if (!icon.includes('/')) {
            icon = (path ?? $root.images).suffix('/') + icon;
        }
        return `<img src="${icon}" align="absmiddle" /> `
    }
    else {
        return icon;
    }
}

Object.defineProperties(String.prototype, {
    'isImageURL': {
        get() {
            return /\.(jpg|png|gif|jpeg)$/i.test(this.toString());
        }
    },
    'isEmpty': {
        get() {
            return this.toString().trim() == '';
        }
    },
    'isCogoString': {
        get() {
            let str = this.toString().trim();
            return /^(\/|[a-z]+(\s|#))/i.test(str) || /^(get|post|delete|put|http|https)\s*:/i.test(str) || (str.includes('/') && str.includes('?') && str.includes('='));
        }
    },
    'isObjectString': {
        get() {
            return /^\s*\{\s*("[^"]*"\s*:[^{}]+?|'[^']*'\s*:[^{}]+?|\d+\s*:[^{}]+?|)\}\s*$/s.test(this.toString());
        }
    },
    'isArrayString': {
        get() {
            return /^\s*\[.*\]\s*$/s.test(this.toString());
        }
    },
    'isIntegerString': {
        get() {
            return /^-?\d+$/.test(this.toString());
        }
    },
    'isNumberString': {
        get() {
            return /^-?(\d+\.)?\d+$/.test(this.toString());
        }
    },
    'isDateTimeString': {
        get() {
            return /^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(this.toString());
        }
    },
    'isDateString': {
        get() {
            return /^\d\d\d\d-\d\d-\d\d$/.test(this.toString());
        }
    },
    'isTimeString': {
        get() {
            return /^\d\d\d\d:\d\d(:\d\d)?$/.test(this.toString());
        }
    }
});

RegExp.prototype.findFirstIn = function(content) {
    return this.exec(content)?.[0] ?? null;
}

RegExp.prototype.findFirstMatchIn = function(content) {
    this.lastIndex = 0;
    return this.exec(content);
}

RegExp.prototype.findAllIn = function(content) {
    return content.match(this.global ? this : new RegExp(this, this.flags + 'g')) ?? []
}

RegExp.prototype.findAllMatchIn = function(content) {
    return [...content.matchAll(this.global ? this : new RegExp(this, this.flags + 'g'))];   
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
        kn = number.substring(number.length - 3);
        for (let i = number.length - 6; i > -3; i -= 3) {
            if (i > 0) {
                kn = number.substring(i, i + 3) + ',' + kn;
            }
            else {
                kn = number.substring(0, i + 3) + ',' + kn;
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

Number.prototype.ifZero = function(v) {
    return this == 0 ? v : +this;
}

Number.prototype.ifNotZero = function(v) {
    return this != 0 ? v : +this;
}

Number.prototype.ifNegative = function(v) {
    return this < 0 ? v : +this;
}

Number.prototype.ifPositive = function(v) {
    return this > 0 ? v : +this;
}

Number.prototype.min = function(other) {
    return Math.min(this, other);
}

Number.prototype.max = function(other) {
    return Math.max(this, other);
}

Number.prototype.opposite = function(condition) {
    return $parseBoolean(condition, true) ? -this : +this;    
}

$root = {};

$root.$else = null;

//private method
$root.__offsetLeft = function(element) {
    if (typeof(element) == 'string') {
        element = $(element);
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
        element = $(element);
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

$root.__bulidDataArgs = function(data, element) {

    if (element == null && data != null) {
        return data;
    }
    else if (element != null && data == null) {
        return {
            data: element.data ?? element.value ?? element.getAttribute('value') ?? element.text,
            text: element.text ?? element.value ?? element.getAttribute('value'),
            value: element.value ?? element.getAttribute('value') ?? element.text
        };
    }
    else if (element != null && data != null) {
        return Object.assign({ 
            data: element.data ?? element.value ?? element.getAttribute('value') ?? element.text,
            text: element.text ?? element.value ?? element.getAttribute('value'),
            value: element.value ?? element.getAttribute('value') ?? element.text
        }, data);
    }
    else {
        return { };
    }
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
$root.configuration = JSON.parse(window.localStorage.getItem('$root.configuration'));

$root.appendClass = function(classText) {
    if ($('head style') == null) {
        $('head').insertAfterBegin('STYLE', { 'type': 'text/css' });
    }
    $('head style').appendChild(document.createTextNode(classText));
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
        return value.toBoolean(defaultValue, object);
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
        return JSON.eval(value);
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

$parseElement = function(element, propertyName) {
    if (typeof(element) == 'string') {
        if (element != '') {
            let e = $(element);
            if (e == null) {
                console.warn('Incorrect selector "' + element + '" or element does not exists.');
            }            
            return e;
        }
        else {
            return null;
        }
         
    }
    else if (element instanceof HTMLElement || element == null) {
        return element;
    }
    else {
        console.error('Unsupported value type for property "' + propertyName + '".');
        return null;
    }
}

$parseElements = function(elements, propertyName) {
    if (typeof(elements) == 'string') {
        return $$(elements).do(a => {
            if (a.length == 0) {
                console.warn('Incorrect selector "' + element + '" or element does not exists.');
            }
        });
    }
    else if (elements instanceof Array) {
        return elements;
    }
    else if (elements instanceof HTMLElement) {
        return [elements];
    }
    else {
        console.error('Unsupported value type for property "' + propertyName + '".');
        return [];
    }
}

Math.randomNext = function(begin, end) {
    if (end == null) {
        end = begin;
        begin = 0;
    }
    return begin + Math.round(Math.random() * (end - begin));
}

//single
$s = function (o) {
    if (typeof (o) == 'string') {
        let s = document.querySelector(o.if(s => s != ''));
        return s?.instance ?? s;        
    }    
    else {        
        return o;
    }
}

//all
$a = function (...o) {
    let a = new Array();
    for (let b of o) {
        if (typeof (b) == 'string') {
            if (b != '') {
                a.push(...[...document.querySelectorAll(b)].map(e => e.instance ?? e));
            }            
        }        
        else if (b instanceof NodeList || b instanceof HTMLCollection) {
            a.push(...b);            
        }
        else if (b != null) {
            a.push(b);
        }        
    }

    return a;
}

if ($root.configuration != null) {
    if ($root.configuration.singleSelector == '$') {
        $_ = window.$;
    }
    if ($root.configuration.singleSelector != null && $root.configuration.singleSelector != '' && $root.configuration.singleSelector != '$s') {
        window[$root.configuration.singleSelector] = $s;
    }
    if ($root.configuration.multipleSelector == '$$') {
        $$_ = window.$$;
    }
    if ($root.configuration.multipleSelector != null && $root.configuration.multipleSelector != '' && $root.configuration.singleSelector != '$a') {
        window[$root.configuration.multipleSelector] = $a;
    }    
}
else {
    $_ = window.$;
    $$_ = window.$$;
    window.$ = $s;
    window.$$ = $a;
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
            if (attributes instanceof HTMLElement) {
                attributes.getAttributeNames().forEach(attr => tag.setAttribute(attr, attributes.getAttribute(attr)));
            }
            else {
                for (let a in attributes) {
                    tag.setAttribute(a, attributes[a]);
                }
            }            
        }

        return tag;
    }
    else {
        return null;
    }
}

$GET = function (url, path = '/', element = null, p = true) { return new $ajax('GET', url, '', path, element, p); }   //SELECT
$POST = function (url, params = '', path = '/', element = null, p = true) {return new $ajax('POST', url, params, path, element, p); } //INSERT
$PUT = function (url, params = '', path = '/',  element = null, p = true) { return new $ajax('PUT', url, params, path, element, p); }  //UPDATE/INSERT
$DELETE = function (url, path = '/', element = null, p = true) { return new $ajax('DELETE', url, path, element, p); }  //DELETE

//GET+
$TAKE = function(data, element, owner, func) {
    if (typeof(data) == 'string') {
        data = data.trim();
        if (data.isArrayString || data.isObjectString) {
            func.call(owner, JSON.eval(data));
        }
        else if (data.isCogoString) {
            $cogo(data, element, element)
                .then(result => {
                    func.call(owner, result);
                })
                .catch(error => {
                    console.error(error);
                });
        }
        else if (data.includes(",") && !data.includes("(") && !data.includes(")")) {
            func.call(owner, JSON.eval('["' + data.replace(/,/g, '","') + '"]'));
        }
        else if (/^@\w/.test(data)) {
            func.call(owner, JSON.eval(data.followModel(owner.id || owner.name || owner.owner?.id || owner.owner?.name))); //owner 对象有可能还有自己的 owner，如 FOR 和 SELECT 的关系
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

// p - if to be $p
$ajax = function (method, url, params = '', path = '/', element = null, p = true) {

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
                            result = JSON.find(this.responseText, path);
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

$ajax.prototype.send = function () {

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

$ajax.prototype.sync = function(enabled = true) {
    this.async = !enabled;
    return this;
}

$ajax.prototype.on = function(event, func) {
    event = event.trim().toLowerCase().prefix('on');
    if (/^on(send|complete|error|success)$/.test(event)) {
        this[event] = func;
    }
    else {
        console.error('Unsupported event name "' + event + '", it must be "onsend", "oncomplete", "onerror" or "onsuccess".');        
    }
    return this;
}

//data 传递 data, value, text 三个变量的数据对象
$cogo = function(todo, element, data) {
    todo = todo.trim();

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
        if ($root.configuration != null) {
            for (let pattern in $root.configuration.ajax) {
                if (todo.includes(pattern) || new RegExp(pattern, 'i').test(todo)) {
                    setting = $root.configuration.ajax[pattern];
                }
            }
        }

        /#\s*\//.findFirstIn(todo)
            ?.do(sp => {
                path = todo.substring(todo.lastIndexOf(sp) + 1).trim();
                todo = todo.takeBeforeLast(sp).trim();
            });        

        if (/^https?:/i.test(todo)) {
            todo = '/api/cogo/cross?method='+ method + '&url=' + encodeURIComponent(todo.$p(element, data));
        }
        else {
            todo = todo.$p(element, data);
        }
    }

    if (todo != '') {
        return new Promise((resolve, reject) => {
                    new $ajax(method, todo, null, path, element, false)
                        .on('error', (status, statusText) => {
                            reject(statusText);
                        })
                        .on('success', result => {
                            if (setting == null || typeof(result) != 'object' || Object.keys(result).length != new Set(Object.keys(result).concat(setting.fields)).size) {
                                //单值或不符合预设字段格式则直接返回
                                resolve(result);
                            }
                            else {
                                let ready  = eval('_ = function(result) { with(result) { return ' + setting.ready + '; } }').call(window, result);
                                if (ready) {
                                    resolve(JSON.find(result, setting.path));
                                }
                                else {
                                    reject(JSON.find(result, setting.info));
                                }
                            }
                        }).send();
                });
    }
    else {
        return new Promise(resolve => {
            resolve(null);
        });
    }
};

//server event
$FIRE = function (element, event, succeed, fail, except, complete, actualElement, data) {
    let action = element[event].trim();
    if (action != '') {
        let expection = '';
        if (!/^[a-z]+\s+/i.test(action) || /^(get|post|delete|put)\s*:/i.test(action)) {
            if (action.includes('->')) {
                expection = action.takeAfter('->').trim().replace(/\s+/, '-');
                action = action.takeBefore('->').trim();
            }
        }

        $cogo(action, actualElement ?? element, data ?? element)
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
                                valid = JSON.stringifo(data) == expection;
                            }
                            break;
                    }   
                }
                else if ((element.successText != null && element.successText != '') || (element.failureText != null && element.failureText != '')) {
                    valid = $parseBoolean(data, true, actualElement ?? element);
                }

                if (valid) {
                    succeed?.call(element, data);
                    element.dispatch(event + 'success', { "data": data });
                    if (element.debug) {
                        console.log(`${element.nodeName || ''} "${element.id || element.name}" ${event} event status: success. return data: ` + JSON.stringify(data));
                    }
                }
                else {
                    fail?.call(element, data);
                    element.dispatch(event + 'failure', { "data": data });
                    if (element.debug) {
                        console.warn(`${element.nodeName || ''} "${element.id || element.name}" ${event} event status: faliure. return data: ` + JSON.stringify(data));
                    }
                }
            })
            .catch(error => {
                except?.call(element, error);
                element.dispatch(event + 'exception', { "error": error });
                if (element.debug) {
                    console.error(`${element.nodeName || ''} "${element.id || element.name}" ${event} event status: error. return message: ` + error);
                }                
            })
            .finally(() => {
                complete?.call(element);
                element.dispatch(event + 'completion');
            });
    }
};

$root.lang = (function() {
    return (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
})();

$root.mobile = (function() {
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
        return $query.s[n].decode();
    }
    else {
        for (let k in $query.s) {
            if (new RegExp('^' + n + '$', 'i').test(k)) {
                return $query.s[k].decode();
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
            $cookie.s[c.substring(0, c.indexOf('='))] = c.substring(c.indexOf('=') + 1);
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

JSON.stringifo = function(v) {
    return (typeof (v) != 'string' ? JSON.stringify(v) : v);
}

JSON.eval = function(string) {
    if (typeof(string) == 'string') {
        string = string.replace(/&quot;/g, '"');
        try {
            return JSON.parse(string);
        }
        catch(e1) {
            try {
                return eval('(' + string + ')');
            }
            catch(e2) {
                throw new Error('Error occured when try to parse json string. Exception of JSON.parse :' + e1 + ', eval: ' + e2);
            }
        }
    }
    else {
        return string;
    }
}

JSON.find = function(json, path = '/') {
    if (typeof(json) == 'string') {
        json = JSON.eval(json);
    }
    if (path == '/') {
        return json;
    }
    else {
        path = path.drop('/');
        while (json != null && path != '') {
            let s = (path.includes("/") ? path.takeBefore('/') : path).trim();
            json = json[s];
            path = (path.includes("/") ? path.takeAfter('/') : '');
        }

        return json;
    }
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


Event.await = function(tag, await) {
    await.split(',')
    .forEach(a => {
        $(a).on('load', function() {
            tag.await = tag.await.replace(new RegExp(a + '\\b'), '').trimPlus(',');
            if (tag.await == '') {
                tag.load();
            }
        });
    });
}

//执行某一个具体对象的事件非监听事件，再比如对象没有name，如for和if标签
Event.fire = function(tag, onLowerName, args) {
    let final = true;
    //仅通过 defineCustomEvents 注册的自定义事件可以触发
    if (HTMLElement.customEvents.get(tag.constructor.name)?.has(onLowerName)) {
        let func = tag[onLowerName] ?? tag.instance?.[onLowerName];
        if (func != null) {
            if (typeof (func) == 'function') {
                final = func.call(tag, args);
            }
            else if (typeof (func) == 'string') {
                if (/^\s*function\(\s*\)\s*{/.test(func)) {
                    final = eval('final = ' + func).call(tag, args);
                }
                else {
                    final = eval('final = function() {' + func + '}').call(tag, args);
                }            
            }
            if (typeof (final) != 'boolean') { final = true; };
        }
    }    
    
    return final;
}

Event.express = function(exp) {
    for (let sentence of exp.trim().replace(/;$/, '').split(';')) {
        let value = '';
        if (sentence.includes('<-')) {
            value = sentence.takeAfter('<-').trimLeft();
            sentence = sentence.takeBefore('<-').trimRight();
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
                        let s = $(r);
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

Event.interact = function(element) {
    for (let name of element.getAttributeNames().filter(name => name.startsWith('on') || name.endsWith('-on'))) {
        if (/^on/i.test(name) && name.endsWith('-')) {
            //on{event}-
            element.on(name.dropRight(1), function(...args) {
                Event.express.call(this, this.getAttribute(name).$p(this, { 'data': args}));
            });
        }
        else if (/-on$/i.test(name)) {
            //{method}-{attr}-on
            Event.watch(element, name, element.getAttribute(name));
            element.removeAttribute(name); //防止重复监听
        }
    }
}

Event.watch = function(element, name, watcher) {

    let method = name.takeBeforeLast('-');
    let attr = element.value != undefined ? 'value' : 'innerHTML';
    if (element instanceof HTMLButtonElement) {
        attr = 'innerHTML';
    }
    if (method.includes('-')) {                
        attr = method.takeAfter('-');
        method = method.takeBefore('-');                
    }

    let value = '+'; //表示按照增加属性值更新
    if (watcher.includes('<-')) {
        value = watcher.takeAfter('<-').trim();
        watcher = watcher.takeBefore('<-').trim();
    }
    let func = function() {
        element[method](attr, value.$p(element));
    };
    watcher.split(';')
        .map(w => {
            return w.includes(':') ? {
                event: w.takeBefore(':').trim(),
                selector: w.takeAfter(':').trim()
            } : {
                event: w,
                selector: element.id == '' ? element : ('#' + element.id) //目的是可以通过 id 选择自定义组件
            };
        })
        .forEach(watch => {
            if (typeof(watch.selector) == 'string') {
                watch.selector
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s != '')
                    .forEach(s => {
                        $(s).on(watch.event, func);                        
                    });
            }
            else {
                watch.selector.on(watch.event, func);
            }
        });
}

$enhance = function(object) {
    return new NativeElement(object);
}

NativeElement = function(object) {    
    this.object = object;
    this.object.constructor.getterX = new Map();
    this.object.constructor.setterX = new Map();
}

NativeElement.prototype.defineProperties = function(properties) {
    for (const propertyName in properties) {

        const defaultValue = properties[propertyName];

        if (typeof(defaultValue) == 'object' && defaultValue != null) {
            Object.defineProperty(this.object, propertyName, defaultValue);
        }
        else {
            let getFunc = null, setFunc = null;

            if (typeof(defaultValue) == 'string') {
                if (defaultValue.includes('|')) {
                    getFunc = function(propertyValue, defaultValue) {
                        return Enum(defaultValue).validate(propertyValue);
                    };
                }
                else if (/\.(gif|jpg|jpeg|png)$/i.test(defaultValue)) {
                    getFunc = function(propertyValue, defaultValue) {
                        return (propertyValue ?? defaultValue).if(s = s != '' && !s.includes('/'))?.prefix(this.imagesBasePath ?? '') ?? $else;
                    }
                }
            }
            else if (typeof(defaultValue) == 'number') {
                if (String(defaultValue).includes('.')) {
                    getFunc = function(propertyValue, defaultValue) {
                            return $parseFloat(propertyValue, defaultValue);
                        };
                }
                else {
                    getFunc = function(propertyValue, defaultValue) {
                            return $parseInt(propertyValue, defaultValue);
                        };
                }
            }
            else if (typeof(defaultValue) == 'boolean') {
                getFunc = function(propertyValue, defaultValue) {
                        return $parseBoolean(propertyValue, defaultValue);
                    };
            }
            else if (typeof(defaultValue) == 'function')  {
                getFunc = function(propertyValue, defaultValue) { 
                    defaultValue.call(this, propertyValue);
                }
            }

            Object.defineProperty(this.object, propertyName, {
                enumerable: true,
                configurable: true,
                get() {
                    let propertyValue = this.getAttribute(propertyName);
                    if (this.constructor.getterX.has(propertyName)) {
                        propertyValue = NativeElement.executeAopFunction(this, this.constructor.getterX.get(propertyName), propertyValue ?? defaultValue);
                    }
                    return getFunc == null ? (propertyValue ?? defaultValue) : getFunc.call(this.object, propertyValue, defaultValue);
                },
                set(value) {
                    if (this.constructor.setterX.has(propertyName)) {
                        let result = NativeElement.executeAopFunction(this, this.constructor.setterX.get(propertyName), value);
                        if (result !== undefined) {
                            value = result;
                        }
                    }
                    setFunc?.call(this, value) ?? this.setAttribute(propertyName.toHyphen(), value);
                }
            });   
        }
    }
    return this;
}

//绑定事件，单个参数支持数组格式，第一项全小写，第二项 Camel
NativeElement.prototype.defineEvents = function(...eventNames) {
    eventNames.forEach(eventName => {
        if (eventName instanceof Array) {
            if (eventName.first.endsWith('+')) {
                HTMLElement.defineServerEvent(this.object, eventName.first, eventName.last);
            }
            else {
                HTMLElement.defineCustomEvent(this.object, eventName.first, eventName.last);
            }
        }
        else {
            if (eventName.endsWith('+')) {
                HTMLElement.defineServerEvent(this.object, eventName);
            }
            else {
                HTMLElement.defineCustomEvent(this.object, eventName);
            }
        }        
    });  
    return this;
}

NativeElement.executeAopFunction = function(object, func, value) {
    if (typeof (func) == 'string') {
        return (function(func, value) { return eval(func) }).call(object, func, value)
    }
    else {
        return func.call(object, value);
    }
}

class HTMLCustomElement {

    constructor(element) {
        this.element = element;
        this.element.instance = this;
        this.tagName = element.tagName;
        this.nodeName = element.nodeName;
    }

    get id() {
        if (this.element.id == '' && this.hasAttribute('name')) {
            this.element.id = this.getAttribute('name');
        }
        return this.element.id;
    }

    set id(id) {
        this.element.id = id;
    }

    get style() {
        return this.element.style;
    }

    get clientEvents() {
        return this.element.clientEvents;
    }

    get eventListeners() {
        return this.element.eventListeners;
    }

    on (eventName, func) {
        this.element.on(eventName, func);
        return this;
    }

    dispatch(eventName, args) {
        return this.element.dispatch(eventName, args);
    }

    getImageAttribute(attr, defaultValue) {
        let imageURL = this.getAttribute(attr, defaultValue);
        if (!imageURL.includes('/')) {
            return imageURL.prefix(this.imagesBasePath.suffix('/') ?? '');
        }
        else {
            return imageURL;
        }
    }
}

//general properties
Object.defineProperties(HTMLCustomElement.prototype, [
        'visible', 'hidden',
        'parent', 'previous', 'next', 'first', 'last',
        'left', 'right', 'top', 'bottom', 'width', 'height',
        'debug',
        'className'
    ].concat(
        (function() {
            let properties = [];
            for (const name in HTMLElement.prototype) {
                if (name.startsWith('on') && name != 'on') {
                    properties.push(name);
                }        
            }
            return properties;
        })() //native events
    ).toObject(property => {
        return {
            get() {
                return this.element[property];
            },
            set(value) {
                this.element[property] = value;
            }
        };
    }));

let properties = [];
for (const name in HTMLElement.prototype) {
    properties.push(name);
}

//general method
['get', 'set', 'setIf', 'do', 'if'].forEach(method => {
    HTMLCustomElement.prototype[method] = HTMLElement.prototype[method];
});

[
    '$', '$$', '$child', '$$children',
    'show', 'hide',
    'setStyle', 'setStyles', 'setClass',
    'setLeft', 'setRight', 'setTop', 'setBottom', 'setWidth', 'setHeight',
    'callout',
    'hasAttribute', 'getAttribute', 'setAttribute', 'removeAttribute', 'getAttributeNames', 'remove',
    'insertAdjacent', 'insertBeforeBegin', 'insertAfterBegin', 'insertBeforeEnd', 'insertAfterEnd'
].forEach(method => {
    HTMLCustomElement.prototype[method] = function(arg1, arg2, arg3, arg4) {
        return this.element[method](arg1, arg2, arg3, arg4);
    }
});

['addClass', 'removeClass'].forEach(method => {
    HTMLCustomElement.prototype[method] = function(...args) {
        return this.element[method](...args);
    }
});

class HTMLCustomAttribute {
	constructor(element) {
        //所属元素
		this.element = element;
	}

	getAttribute(attr, defaultValue) {
		return this.element.getAttribute(attr, defaultValue);
	}

	setAttribute(attr, value) {
		this.element.setAttribute(attr, value);
	}

	get clientEvents() {
        return this.element.clientEvents;
    }

    get eventListeners() {
        return this.element.eventListeners;
    }

    on(eventName, func){
        this.element.on(eventName, func);
        return this;
    }

    dispatch(eventName, args) {
        return this.element.dispatch(eventName, args);
    }
}

// customAttrName -> TagName
HTMLCustomAttribute.relativeTags = new Map();
HTMLCustomAttribute.defineEvents = function(attrName, element, customEvents) {
    if (!HTMLCustomAttribute.relativeTags.has(attrName)) {
        HTMLCustomAttribute.relativeTags.set(attrName, new Set());
    }

    if (!HTMLCustomAttribute.relativeTags.get(attrName).has(element.tagName)) {
        $enhance(element.constructor.prototype).defineEvents(...customEvents);
    }
            
    HTMLCustomAttribute.relativeTags.get(attrName).add(element.tagName);
}

//eventMap 可以是对象或数组
HTMLCustomElement.defineEvents = function(object, eventMap) {
    if (eventMap instanceof Array) {
        eventMap.forEach(eventName => {
            if (eventName.endsWith('+')) {
                HTMLElement.defineServerEvent(object, eventName);
            }
            else {
                HTMLElement.defineCustomEvent(object, eventName);
            }
        });
    }
    else {
        Object.keys(eventMap).forEach(lowerName => {
            if (lowerName.endsWith('+')) {
                HTMLElement.defineServerEvent(object, lowerName, eventMap[lowerName]);
            }
            else {
                HTMLElement.defineCustomEvent(object, lowerName, eventMap[lowerName]);
            }
        });
    }        
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
    this.reference = typeof(element) == 'string' ? $(element) : element;
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
    let callout = $('#__Callout');
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
    $('#__Callout').setHTML(this.content).show().setStyle('visibility', 'hidden');
    if ($('#__Callout').width > 360) {
        $('#__Callout').width = 360;
    }

    let i = 0;
    while (!this.locate()) {
        this.location = (this.location + 1) % 4;
        i ++;
        if (i == 4) {
            break;
        }
    }

    $('#__Callout').style.visibility = 'visible';
    if (seconds > 0) {
        if (Callout.Entity.$timer != null) {
            window.clearTimeout(Callout.Entity.$timer);
        }
        Callout.Entity.$timer = window.setTimeout(function() {
            $('#__Callout').hide();
            window.clearTimeout(Callout.Entity.$timer);
        }, seconds * 1000);
    }
}

Callout.hide = function() {
    $('#__Callout').hide();
}

document.on('ready', function() {
    if (document.documentElement.hasAttribute('mobile')) {
        //<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        document.head.appendChild($create('META', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=no' }));
        document.documentElement.style.fontSize = ($root.visibleWidth() / 16) + 'px';
    }

    //server event on <body>
    document.body.getAttributeNames()
        .map(attr => attr.toLowerCase())
        .forEach(attr => {
            if (attr == 'onready+') {
                $cogo(document.body.getAttribute('onready+'), document.body)
                    .then(data => {  
                        document.body.removeAttribute('onready+');
                    });
            }
            else if (attr == 'onpost+' || attr == 'onload+') {
                document.on(attr.substring(2, 6), function() {
                    $cogo(document.body.getAttribute(attr), document.body)
                        .then(data => {  
                        document.body.removeAttribute(attr);
                    });
                });
            }
        });

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

$root.initialize = function() {
    $a('[visible],[hidden]').forEach(e => {
        if (!e.id.startsWith('__') && e.tagName != 'SET' && !(e.inElement?.('TEMPLATE') ?? e.element.inElement?.('TEMPLATE'))) {
            if (e.hasAttribute('hidden')) {
                let hidden = e.getAttribute('hidden');
                if (hidden != '') {
                    e.hidden = hidden;
                }                 
            }
            else if (e.hasAttribute('visible')) {
                let visible = e.getAttribute('hidden');
                if (visible != '') {
                    e.visible = visible;
                }
            }
        }
    });
}

document.on('post', function() {

    $root.initialize();

    if ($('#__Callout') == null) {
        document.body.insertAfterBegin($create('DIV', { id: '__Callout', className: 'callout', hidden: true }));
        $('#__Callout').on('click', function(ev) { this.style.display = 'none'; window.clearTimeout(Callout.Entity.$timer); ev.preventDefault(); });
    }

    if (document.body.getAttribute('self-adaption') != null) {        
        let layout = function() {
            document.body.getAttribute('self-adaption')
            .split(',')
            .map(frame => $(frame))
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
            parent.$(document.body.getAttribute('iframe')).height = $root.documentHeight;
        };
        flex();
        window.setInterval(flex, 2000);
    }
});

KEYCODE = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
}