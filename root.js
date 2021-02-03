//-----------------------------------------------------------------------
// root.js
// root框架基础类
//-----------------------------------------------------------------------

$x = function (...o) {
    let root = new $root();
    for (let b of o) {
        if (typeof (b) == 'string') {
            for (let e of document.querySelectorAll(b)) {
                root.push(e);
            }
        }
        else if (b instanceof NodeList || b instanceof HTMLCollection) {
            for (let e of b) {
                root.push(e);
            }
        }
        else if (b != null && typeof (b) == 'object') { //instanceof HTMLElement || b instanceof HTMLDocument || b instanceof Window
            root.push(b);
        }
    }
    return root;
}

$root = function () {
    this.objects = [];
}

$root.prototype.select = function(...o) {
    let array = Array.from(this.objects);
    this.objects.length = 0;
    array.forEach(parent => {
        for (let b of o) {
            if (typeof (b) == 'string') {
                for (let e of parent.querySelectorAll(b)) {
                    this.objects.push(e);
                }
            }            
        }
    });
    return this;
}

$root.prototype.push = function (o) {
    this.objects.push(o);
    return this;
}

$root.prototype.nonEmpty = function () {
    return this.objects.length > 0;
}

$root.prototype.isEmpty = function () {
    return this.objects.length == 0;
}

$root.prototype.size = function () {
    return this.objects.length;
}

// = single
$root.prototype.head = function () {
    if (this.objects.length > 0) {
        this.objects.splice(1);
    }
    return this;
}

$root.prototype.tail = function () {
    if (this.objects.length > 0) {
        this.objects.splice(0, this.objects.length - 1);        
    }
    return this;
}

$root.prototype.parent = function () { 
    for (let i = 0; i < this.objects.length; i++) {
        this.objects[i] = this.objects[i].parentNode;
    }
    return this;
}

$root.prototype.prev = function () {
    for (let i = 0; i < this.objects.length; i++) {
        this.objects[i] = this.objects[i].previousElementSibling;
    }
    return this;
}

$root.prototype.next = function () {
    for (let i = 0; i < this.objects.length; i++) {
        this.objects[i] = this.objects[i].nextElementSibling;
    }
    return this;
}

$root.prototype.before = function () {
    for (let i = 0; i < this.objects.length; i++) {
        this.objects[i] = this.objects[i].previousSibling;
    }
    return this;
}

$root.prototype.after = function () {
    for (let i = 0; i < this.objects.length; i++) {
        this.objects[i] = this.objects[i].nextSibling;
    }
    return this;
}

$root.prototype.children = function () {
    let array = Array.from(this.objects);
    this.objects.length = 0;
    array.forEach(parent => {
        for (let i = 0; i < parent.children.length; i++) {
            this.objects.push(parent.children[i]);
        }
    });
    return this;
}

$root.prototype.first = function () {
    let array = Array.from(this.objects);
    this.objects.length = 0;
    array.forEach(parent => {
        if (parent.firstElementChild != null) {
            this.objects.push(parent.firstElementChild);
        }        
    });
    return this;
}

$root.prototype.last = function () {
    let array = Array.from(this.objects);
    this.objects.length = 0;
    array.forEach(parent => {
        if (parent.lastElementChild != null) {
            this.objects.push(parent.lastElementChild);
        }        
    });
    return this;
}

//指定某一个子元素
$root.prototype.nth = function (index) {
    let array = Array.from(this.objects);
    this.objects.length = 0;
    array.forEach(parent => {
        if (index < parent.children.length) {
            this.objects.push(parent.children[index]);
        }        
    });
    return this;
}

$root.prototype.is = function (name) {
    if (this.objects.length > 0) {
        return this.objects[0].nodeName != undefined && this.objects[0].nodeName == name.toUpperCase();
    }
    else {
        return false;
    }
}

$root.prototype.show = function (display) {
    this.objects.forEach(element => {
        if (element.style != undefined) {
            if (display == null) {
                element.style.display = '';
            }
            else if (typeof(display) == 'boolean') {
                element.style.display = display ? '' : 'none';
            }
            else {
                element.style.display = display;
            }
        }
    });
    return this;
}

$root.prototype.hide = function () {
    this.objects.forEach(element => {
        if (element.style != undefined) {
            element.style.display = 'none';
        }
    });
    return this;
}

$root.prototype.toggle = function(display) {
    this.objects.forEach(element => {
        if (element.style != undefined && element.style.display == 'none') {            
            element.style.display = display == null ? '' : display;
        }
        else {
            element.style.display = 'none';
        }
    });
    return this;
}

$root.prototype.visible = function() {
    if (this.objects.length > 0) {
        return this.objects[0].style == null || this.objects[0].style.display != 'none';
    }
    else {
        return true;
    }
}

$root.prototype.hidden = function() {
    if (this.objects.length > 0) {
        return this.objects[0].style != null && this.objects[0].style.display == 'none';
    }
    else {
        return false;
    }
}

$root.prototype.enable = function(enabled = true) {
    this.objects.forEach(obj => {
            if (obj.disabled != undefined) {
                if (typeof(enabled) == 'boolean') {
                    obj.disabled = !enabled;
                }
                else {
                    obj.disable = false;
                }
            }
        });
    return this;
}

$root.prototype.disable = function() {
    this.objects.forEach(obj => {
            if (obj.disabled != undefined) {
                obj.disabled = true;
            }
        });
    return this;
}

//useCapture false 在冒泡阶段执行  true 在捕获阶段执行
$root.prototype.bind = function (eventName, func, useCapture = false, attach = true) {
    eventName = eventName.toLowerCase();
    for (let e of this.objects) {
        if (attach) {
            if (e.addEventListener != undefined) {
                if (eventName.startsWith('on')) {
                    eventName = eventName.substring(2);
                }
                e.addEventListener(eventName, func, useCapture);
            }
            else if (e.attachEvent != undefined) {
                if (!eventName.startsWith('on')) {
                    eventName = 'on' + eventName;
                }
                e.attachEvent(eventName, func);
            }
        }
        else {
            if (!eventName.startsWith('on')) {
                eventName = 'on' + eventName;
            }
            e['on' + eventName] = func;
        }
    }
    return this;
}

$root.prototype.unbind = function(eventName, func, attach = true) {
    eventName = eventName.toLowerCase();
    for (let e of this.objects) {
        if (attach) {
            if (e.addEventListener != undefined) {
                if (eventName.startsWith('on')) {
                    eventName = eventName.substring(2);
                }
                e.removeEventListener(eventName, func);
            }
            else if (e.attachEvent != undefined) {
                if (!eventName.startsWith('on')) {
                    eventName = 'on' + eventName;
                }
                e.detachEvent(eventName, func);
            }
        }
        else {
            if (!eventName.startsWith('on')) {
                eventName = 'on' + eventName;
            }
            e['on' + eventName] = null;
        }
    }
}

$root.prototype.on = function (eventName, func, useCapture = false, attach = true) {
    eventName.split(',').forEach(event => {
        this.bind(event, func, useCapture, attach);
    });
    return this;
}

$root.prototype.un = function(eventName, func, attach = true) {
    eventName.split(',').forEach(event => {
        this.unbind(event, func, useCapture, attach);
    });
    return this;
}

$root.prototype.insertFront = function (tag, properties, styles, attributes) {
    this.objects.forEach(obj => {
        if (typeof (tag) == 'string') {
            if (tag.startsWith('<') && tag.endsWith('>')) {
                obj.insertAdjacentHTML('beforeBegin', tag);
            }
            else if (obj.parentNode != null) {
                let t = $create(tag, properties, styles, attributes);
                if (t != null) {
                    obj.parentNode.insertBefore(t, obj);
                }
            }
        }
        else if (typeof (tag) == 'object' && obj.parentNode != null) {
            obj.parentNode.insertBefore(tag, obj);
        }
    });
    return this;
}

$root.prototype.insertBehind = function (tag, properties, styles, attributes) {
    this.objects.forEach(obj => {
        if (typeof (tag) == 'string') {
            if (tag.startsWith('<') && tag.endsWith('>')) {
                obj.insertAdjacentHTML('afterEnd', tag);
            }
            else if (obj.parentNode != null) {
                let t = $create(tag, properties, styles, attributes);
                if (t != null) {
                    if (obj.nextSibling != null) {
                        obj.parentNode.insertBefore(t, obj.nextSibling);
                    }
                    else {
                        obj.parentNode.appendChild(t);
                    }
                }            
            }        
        }
        else if (typeof (tag) == 'object' && obj.parentNode != null) {
            if (obj.nextSibling != null) {
                obj.parentNode.insertBefore(tag, obj.nextSibling);
            }
            else {
                obj.parentNode.appendChild(tag);
            }
        }
    });
    return this;
}

$root.prototype.insertFirst = function(tag, properties, styles, attributes) {
    this.objects.forEach(obj => {
        if (typeof (tag) == 'string') {
            if (tag.startsWith('<') && tag.endsWith('>')) {
                obj.insertAdjacentHTML('afterBegin', tag);
            }
            else {
                let t = $create(tag, properties, styles, attributes);
                if (t != null) {       
                    if (obj.hasChildNodes()) {
                        obj.insertBefore(t, obj.firstChild);
                    }
                    else {
                        obj.appendChild(t);
                    }                    
                }            
            }
        }
        else if (typeof (tag) == 'object') {
            if (obj.hasChildNodes()) {
                obj.insertBefore(tag, obj.firstChild);
            }
            else {
                obj.appendChild(tag);
            }
        }
    });
    return this;
}

$root.prototype.append = function (tag, properties, styles, attributes) {
    this.objects.forEach(obj => {
        if (typeof (tag) == 'string') {
            if (tag.startsWith('<') && tag.endsWith('>')) {
                obj.insertAdjacentHTML('beforeEnd', tag);
            }
            else {
                let t = $create(tag, properties, styles, attributes);
                if (t != null) {                    
                    obj.appendChild(t);
                }            
            }
        }
        else if (typeof (tag) == 'object') {
            obj.appendChild(tag);
        }
    });
    return this;
}

$create = function (tag, properties, styles, attributes) {
    /// <summary>创建元素或文本节点, 返回创建的节点</summary>
    /// <param name="tagName" type="String" mayBeNull="false">元素标签名称</param>
    /// <param name="properties" type="Object|String" mayBeNull="true">属性集合, 值为字符串时表示赋值给innerHTML</param>
    /// <param name="styles" type="Object" mayBeNull="true">样式集合</param>
    /// <param name="attributes" type="Object" mayBeNull="true">自定义属性集合</param>
    if (typeof (tag) == 'string') {
        try {
            tag = document.createElement(tag);
        }
        catch (ex) {
            tag = null;
        }
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

$root.prototype.remove = function () {
    for (let i = 0; i < this.objects.length; i++) {
        if (this.objects[i].remove != undefined) {
            this.objects[i].remove();
        } 
    }
    this.objects.length = 0;
    return this;
}

$root.prototype.get = function (i = 0) {
    if (i >= 0 && i < this.objects.length) {
        return this.objects[i];
    }
    else {
        return null;
    }
}

$root.prototype.pick = function(i = 0) {
    if (i < 0) i = 0;
    if (i >= this.objects.length) i = this.object.length - 1;

    this.objects = this.objects.splice(i, 1);
    return this;
}

$root.prototype.html = function (code) {
    if (code == null) {
        if (this.objects.length == 0) {
            return null;
        }
        else if (this.objects.length == 1) {
            return this.objects[0].innerHTML;
        }
        else {
            return this.objects.map(obj => obj.innerHTML);
        }
    }
    else {
        this.objects.forEach(obj => {
            obj.innerHTML = code;
        });
        return this;
    }
}

$root.prototype.text = function (text) {
    if (code == null) {
        if (this.objects.length == 0) {
            return null;
        }
        else if (this.objects.length == 1) {
            return this.objects[0].textContent;
        }
        else {
            return this.objects.map(obj => obj.textContent);
        }
    }
    else {
        this.objects.forEach(obj => {
            obj.textContent = text;
        });
        return this;
    }
}

$root.prototype.value = function (v) {
    if (v == null) {
        if (this.objects.length == 0) {
            return null;
        }
        else if (this.objects.length == 1) {
            return this.objects[0].value;
        }
        else {
            return this.objects.map(obj => obj.value);
        }
    }
    else {
        this.objects.forEach(obj => {
            obj.value = v;
        });
        return this;
    }
}

$root.prototype.attr = function (name, value) {
    if (value == null) {
        if (this.objects.length == 0) {
            return null;
        }
        else if (this.objects.length == 1) {
            return this.objects[0][name] || this.objects[0].getAttribute(name);
        }
        else {
            return this.objects.map(obj => obj[name] || obj.getAttribute(name));
        }
    }
    else {
        this.objects.forEach(obj => {
            if (obj[name] !== undefined) {
                obj[name] = value;
            }
            else {
                obj.setAttribute(name, value);
            }            
        });
        return this;
    }
}

//private method
$root.offsetLeft = function(element) {
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

//left side to left
$root.prototype.left = function(value) {
    if (this.objects.length == 0) {
        if (value == null) {
            return null;
        }        
    }
    else if (this.objects.length == 1) {
        if (value == null) {
            return $root.offsetLeft(this.objects[0]);
        }
        else {
            this.objects[0].style.left = value + 'px';
            return this;
        }
    }
    else {
        if (value == null) {
            return this.objects.map(obj => $root.offsetLeft(obj));
        }
        else {
            this.objects.forEach(obj => obj.style.left = value + 'px');
            return this;
        }
    }
}

//right side to right
$root.prototype.right = function(value) {
    if (this.objects.length == 0) {
        return null;
    }
    else if (this.objects.length == 1) {
        if (value == null) {
            return $root.offsetLeft(this.objects[0]) + this.objects[0].offsetWidth;
        }
        else {
            this.objects.forEach(obj => obj.style.right = value + 'px');
            return this;
        }        
    }
    else {
        if (value == null) {
            return this.objects.map(obj => $root.offsetLeft(obj) + obj.offsetWidth);
        }
        else {
            this.objects.forEach(obj => obj.style.right = value + 'px');
            return this;
        }
    }
}

//private method
$root.offsetTop = function(element) {
    if (typeof(element) == 'string') {
        element = $s(element);
    }

    let parent = element.parentNode;
    let top = element.offsetTop;
    while (parent != null && parent.nodeName != 'BODY') {
        if (parent.nodeName == 'TABLE' || parent.nodeName == 'TD') {
            top += parent.offsetTop;
        }
        parent = parent.parentNode;
    }
    return top;
}

$root.prototype.top = function(value) {
    if (this.objects.length == 0) {
        if (value == null) {
            return null;
        }        
    }
    else if (this.objects.length == 1) {
        if (value == null) {
            return $root.offsetTop(this.objects[0]);
        }
        else {
            this.objects[0].style.top = value + 'px';
            return this;
        }
    }
    else {
        if (value == null) {
            return this.objects.map(obj => $root.offsetTop(obj));
        }
        else {
            this.objects.forEach(obj => obj.style.top = value + 'px');
            return this;
        }
    }
}

$root.prototype.bottom = function(value) {
    if (this.objects.length == 0) {
        return null;
    }
    else if (this.objects.length == 1) {
        if (value == null) {
            return $root.offsetTop(this.objects[0]) + this.objects[0].offsetHeight;
        }
        else {
            this.objects[0].style.bottom = value + 'px';
            return this;
        }
    }
    else {
        if (value == null) {
            return this.objects.map(obj => $root.offsetTop(obj) + obj.offsetHeight);
        }
        else {
            this.objects.forEach(obj => obj.style.bottom = value + 'px');
            return this;
        }
    }
}

$root.prototype.width = function(value) {
    if (this.objects.length == 0) {
        if (value == null) {
            return null;
        }        
    }
    else if (this.objects.length == 1) {
        if (value == null) {
            return this.objects[0].offsetWidth;
        }
        else {
            this.objects[0].style.width = value + 'px';
        }
    }
    else {
        if (value == null) {
            return this.objects.map(obj => obj.offsetWidth);
        }
        else {
            this.objects.forEach(obj => obj.style.width = value + 'px');
        }
    }
}

$root.prototype.height = function(value) {
    if (this.objects.length == 0) {
        if (value == null) {
            return null;
        }
    }
    else if (this.objects.length == 1) {
        if (value == null) {
            return this.objects[0].offsetHeight;
        }
        else {
            this.objects[0].style.height = value + 'px';
        }
    }
    else {
        if (value == null) {
            return this.objects.map(obj => obj.offsetHeight);
        }
        else {
            this.objects.forEach(obj => obj.style.height = value + 'px');
        }
    }
}

//获取或设置滚动条当前的位置
$root.scrollTop = function(value) {
    if (document.documentElement != null && document.documentElement.scrollTop != null) {
        if (value == null) {
            return document.documentElement.scrollTop;
        }
        else {
            document.documentElement.scrollTop = value;
        }
    }
    else {
        if (value == null) {
            return document.body.scrollTop;
        }
        else {
            document.body.scrollTop = value;
        }
    } 
}

//获取或设置滚动条当前的位置
$root.scrollLeft = function(value) {
    if (document.documentElement != null && document.documentElement.scrollLeft != null) {
        if (value == null) {
            return document.documentElement.scrollLeft;
        }
        else {
            document.documentElement.scrollLeft = value;
        }
    }
    else {
        if (value == null) {
            return document.body.scrollLeft;
        }
        else {
            document.body.scrollLeft = value;
        }
    } 
}

//获取当前可视范围的宽度
$root.visibleWidth = function() {    
    return Math.max(document.body.clientWidth, document.documentElement.clientWidth);
}

//获取当前可视范围的高度, 在iframe中时不准，不在iframe时也不准
$root.visibleHeight = function() {
    return Math.max(document.body.clientHeight, document.documentElement.clientHeight);
}

$root.documentWidth = function() {
    return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
}

$root.documentHeight = function() {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

$root.prototype.upside = function(reference, offsetX = 0, offsetY = 0, align = 'center') {

    let referTop = $x(reference).top();// + $root.scrollTop();
    let referLeft = $x(reference).left();// + $root.scrollLeft();
    let referWidth = $x(reference).width();

    let width = this.pick(0).width();
    let height = this.pick(0).height();

    let top = referTop - height + offsetY;
    let left = referLeft + offsetX;
    if (align == 'center') {
        left = left + referWidth / 2 - width / 2;
    }
    else if (align == 'right') {
        left = left + referWidth - width;
    }

    if (left + width > $root.documentWidth()) {
        left = $root.documentWidth() - width;
    }
    
    this.top(top);
    this.left(left);

    return top >= 0;
}

$root.prototype.downside = function(reference, offsetX = 0, offsetY = 0, align = 'center') {
    let referTop = $x(reference).top();// + $root.scrollTop();
    let referLeft = $x(reference).left();// + $root.scrollLeft();
    let referWidth = $x(reference).width();
    let referHeight = $x(reference).height();

    let width = this.pick(0).width();
    let height = this.pick(0).height();

    let top = referTop + referHeight + offsetY;
    let left = referLeft + offsetX;
    if (align == 'center') {
        left = left + referWidth / 2 - width / 2;
    }
    else if (align == 'right') {
        left = left + referWidth - width;
    }

    if (left + width > $root.documentWidth()) {
        left = $root.documentWidth() - width;
    }

    this.top(top);
    this.left(left);

    return top + height <= $root.documentHeight();
}

$root.prototype.leftside = function(reference, offsetX = 0, offsetY = 0) {
    let referLeft = $x(reference).left();// + $root.scrollLeft();
    let referTop = $x(reference).top();// + $root.scrollTop();
    //let referWidth = $x(reference).width();
    let referHeight = $x(reference).height();

    let height = this.pick(0).height();
    let width = this.pick(0).width();

    let left = referLeft - width + offsetX;
    let top = referTop + referHeight / 2 - height / 2 + offsetY;

    this.top(top);
    this.left(left);

    return left >= 0;
}

$root.prototype.rightside = function(reference, offsetX = 0, offsetY = 0) {
    let referLeft = $x(reference).left();// + $root.scrollLeft();
    let referTop = $x(reference).top();// + $root.scrollTop();
    let referWidth = $x(reference).width();
    let referHeight = $x(reference).height();

    let width = this.pick(0).width();
    let height = this.pick(0).height();

    let left = referLeft + referWidth + offsetX;
    let top = referTop + referHeight / 2 - height / 2 + offsetY;

    this.top(top);
    this.left(left);

    return left + width <= $root.documentWidth();
}

//切换属性值
$root.prototype.switch = function(attr, value1, value2) {
    this.objects.forEach(obj => {
        if (obj[attr] !== undefined) {
            if (obj[attr] == value1) {
                obj[attr] = value2;
            }
            else {
                obj[attr] = value1;
            }
        }
        else {
            if (obj.getAttribute(attr) ==  value1) {
                obj.setAttribute(attr, value2);
            }
            else {
                obj.setAttribute(attr, value1);
            }
        }        
    });
    return this;
}

$root.prototype.style = function (name, value) {
    this.objects.forEach(obj => {
            obj.style[name.toCamel()] = value;
        });
    return this;
}

$root.prototype.styles = function(styleObject) {
    this.objects.forEach(obj => {
            for (let name in styleObject) {
                obj.style[name] = styleObject[name];
            }
        });
    return this;
}

$root.prototype.css = function (name) {
    if (name == null) {
        if (this.objects.length == 0) {
            return null;
        }
        else if (this.objects.length == 1) {
            return this.objects[0].className;
        }
        else {
            return this.objects.map(obj => obj.className);
        }
    }
    else {
        this.objects.forEach(obj => {
            obj.className = name;
        });
    }
    return this;
}

$root.prototype.stash = function(attr) {
    this.objects.forEach(obj => {
        obj.setAttribute(attr + '-', obj[attr] || obj.getAttribute(attr));
    });
    return this;
}

$root.prototype.reset = function(attr) {
    this.objects.forEach(obj => {
        if (obj[attr] != null) {
            obj[attr] = obj.getAttribute(attr + '-');
        }
        else {
            obj.setAttribute(attr, obj.getAttribute(attr + '-'));
        }
        obj.removeAttribute(attr + '-');
    });

    return this;
}

$root.prototype.swap = function(css1, css2) {
    this.objects.forEach(obj => {
        if (css1.startsWith('[') && css1.endsWith(']')) {
            css1 = css1.substring(0, css1.length - 1).substring(1);
            css1 = obj.getAttribute(css1);
        }
        if (css2.startsWith('[') && css2.endsWith(']')) {
            css2 = css2.substring(0, css2.length - 1).substring(1);
            css2 = obj.getAttribute(css2);
        }
        if (obj.className.includes(css1)) {
            obj.className = obj.className.replace(css1, css2);
        }
        else if (obj.className.includes(css2)) {
            obj.className = obj.className.replace(css2, css1);
        }
    });
    return this;
}

$root.prototype.check = function(checked = true) {
    this.objects.forEach(obj => {
        if (obj.checked != undefined && obj.indeterminate != undefined) {
            if (typeof(checked) == 'boolean') {
                obj.indeterminate = false;
                if (obj.checked != checked) {
                    obj.checked = checked;
                }
            }
            else {
                obj.indeterminate = true;
            }
        }        
    });
    return this;
}

$root.prototype.incheck = function() {
    this.objects.forEach(obj => {
        if (obj.indeterminate != undefined) {
            obj.indeterminate = true;
        }        
    });
    return this;
}

$root.prototype.uncheck = function() {
    this.objects.forEach(obj => {
        if (obj.checked != undefined) {
            obj.indeterminate = false;
            obj.checked = false;
        }        
    });
    return this;
}

//toggle check
$root.prototype.tocheck = function() {
    this.objects.forEach(obj => {
        if (obj.checked != undefined) {
            obj.indeterminate = false;
            obj.checked = !obj.checked;
        }
    });
    return this;
}

$root.PROPERTIES = [
    {
        selector: '[-html]',        
        property: 'innerHTML',
        ownProperty: 'innerHTML'
    },
    {
        selector: '[-title]',
        attribute: '-title',
        ownProperty: 'title'
    },
    {
        selector: 'input[-value]',
        attribute: '-value',
        ownProperty: 'value'
    },
    {
        selector: 'a[-href]',
        attribute: '-href',
        ownProperty: 'href'
    },
    {
        selector: 'for[in]',
        attribute: 'in',
        customAttribute: 'in'
    },
    {
        selector: '[test]',
        attribute: 'test',
        customAttribute: 'test'
    },
    {
        selector: 'template[data]',
        attribute: 'data',
        customAttribute: 'data'
    }
];

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

//first
$s = function (o) {
    if (typeof (o) == 'string') {
        if (o.includes('@')) {
            let t = o.replace(/^@/, '');
            if (document.components.has(t)) {
                return document.components.get(t);
            }
            else {
                return null;
            }
        }
        else {
            return document.querySelector(o);
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
            if (b.includes('@')) {
                b.split(',')
                .forEach(selector => {
                    if (selector.startsWith('@')) {
                       let name = selector.substring(1);
                       if (document.components.has(name)) {
                           s.push(document.components.get(name));
                       }
                       else {
                           for (let e of document.querySelectorAll(selector)) {
                               s.push(e);
                           }
                       }
                    }
                    else {
                       for (let e of document.querySelectorAll(selector)) {
                           s.push(e);
                       }
                    }
                });     
            }
            else {
                for (let e of document.querySelectorAll(b)) {
                    s.push(e);
                }
            }                   
        }        
        else if (b instanceof NodeList || b instanceof HTMLCollection) {
            for (let e of b) {
                s.push(e);
            }
        }
        else if (typeof (b) == 'object' && b != null) { //instanceof HTMLElement || b instanceof HTMLDocument || b instanceof Window
            s.push(b);
        }        
    }

    return s;
}

$t = function(o) {
    return document.components.get(o.replace(/^[#@]/, ''));
}

$c = function(...o) {

    let s = new Array();

    let t = o.filter(p => typeof(p) == 'string')
                .map(p => p.split(','))
                .reduce((r1, r2) => r1.concat(r2))
                .distinct()
                .map(p => p.trim());
    
    //tag id
    t.filter(p => p.startsWith('#') || p.startsWith('@'))
        .map(p => p.replace(/^[#@]/, ''))
        .forEach(p => {
            if (document.components.has(p)) {
                s.push(document.components.get(p));
            } 
        });

    //tagName
    t.filter(p => !p.startsWith('#') && !p.startsWith('@'))
        .map(p => p.toUpperCase())
        .forEach(p => {
            if (document.tags.has(p)) {
                for (let component of document.components.values()) {
                    if (component.tagName == p) {
                        s.push(component);
                    }
                }
            }
        });

    return o.filter(p => typeof(p) == 'object').concat(s);
}

$GET = function (url, path = '/', element = null, p = true) { return new $api('GET', url, '', path, element, p); }   //SELECT
$POST = function (url, params = '', path = '/', element = null, p = true) {return new $api('POST', url, params, path, element, p); } //INSERT
$PUT = function (url, params = '', path = '/',  element = null, p = true) { return new $api('PUT', url, params, path, element, p); }  //UPDATE/INSERT
$DELETE = function (url, path = '/', element = null, p = true) { return new $api('DELETE', url, path); }  //DELETE

$TAKE = function(data, element, owner, func) {
    if (typeof(data) == 'string') {
        data = data.trim();
        if (data.startsWith('[') || data.startsWith('{')) {
            func.call(owner, Json.parse(data).find());
        }
        else if (/^(\/|[a-z]+(\s|#))/i.test(data) || /^(get|post|delete|put|http|https)\s*:/i.test(data) || data.includes('/') || (data.includes('?') && data.includes('='))) {
            $cogo(data, element)
                .then(result => {
                    func.call(owner, result);
                });            
        }
        else if (data.includes(",") && !data.includes("(") && !data.includes(")")) {
            func.call(owner, Json.parse('["' + data.replace(/,/g, '","') + '"]').find());
        }
        else if (data != '') {
            //如果是js变量
            let js = eval(data);
            if (js != null) {
                func.call(owner, js);
            }
            else {
                func.call(owner, []);
            }            
        }
        else {
            func.call(owner, []);
        }
    }
    else {
        func.call(owner, data);
    }
}

$ajax = function (method, url, params = '', path = '/', element = null, p = true) {
    return new $api(method, url, params, path, element, p);
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
    
    this.onsend = function(url, params) { };
    this.oncompelete = function() { };
    this.onerror = function(status, statusText) { };
    this.onsuccess = function(result) { };
}

$api.prototype.$send = function () {

    let url = this.url; //encodeURI(this.url); 必须后端配合才可以
    if (!this.cache) {
        url += url.includes('?') ? '&' : '?';
        url += 'r' + new Date().valueOf() + '=';
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

$api.prototype.parseDataURL = function(element, text, value = '') {
    this.url = $api.$parseDataURL(this.url, element, text, value);
    this.params = $api.$parseDataURL(this.params, element, text, value);
    return this;
}

$api.$parseDataURL = function (url, element, text = '', value = '') {

    if (value == '') {
        value = text;
    }

    url = url.replace(/\{text\}/ig, encodeURIComponent(text));
    url = url.replace(/\{value\}/ig, encodeURIComponent(value));

    url = url.$p(element);

    if (url.endsWith('=')) {
        url += encodeURIComponent(value);
    }

    return url;
}

$cogo = function(todo, element) {
    todo = todo.trim();
    let method = 'GET';

    if (/^(get|post|delete|put)\s*:/i.test(todo)) {
        method = todo.takeBefore(':').trim().toUpperCase();
        todo = todo.takeAfter(':').trim();
    }

    if (/^[a-z]+\s*/i.test(todo)) {
        return $run(todo, element);
    }
    else {
        let path = '';
        if (todo.includes('->')) {
            path = todo.takeAfter('->').trim();
            todo = todo.takeBefore('->').trim();            
        }
        return $request(method, todo, null, path, element);
    }
}

//run PQL
$run = function(pql, element) {
    return $request('POST', '/api/cogo/pql', 'statement=' + encodeURIComponent(pql.$p(element)), '/', element);
}

//cross domain
$request = function(method, url, params, path, element) {
    if (url != '') {
        if (/^https?:/i.test(url)) {
            url = '/api/cogo/cross?method='+ method + '&url=' + encodeURIComponent(url.$p(element)) + (params == null ? '' : '&data=' + encodeURIComponent(params.$p(element)));
        }
        else {
            url = url.$p(element);
        }

        return new Promise((resolve, reject) => {
                    $ajax(method, url, params, path, element, false)
                        .error((status, statusText) => {
                            reject(statusText);
                        })
                        .success(result => {
                            resolve(result);
                        });
                });
    }
    else {
        return new Promise(resolve => {
            resolve(null);
        });
    }
}

$lang = (function() {
    return (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
})();

//on document ready
$ready = function (callback) {
    //$bind('DOMContentLoaded', callback);
    //onreadystatechange
    if (document.addEventListener != undefined) {
        document.addEventListener("DOMContentLoaded", callback, false);
    }
    else if (document.attachEvent != undefined) {
        document.attachEvent('onreadystatechange', callback);
    }
}

$finish = function(func) {
    if (document.models != null) {
        Event.bind('$global', 'onfinish', func);
    }
    else {
        $ready(func);
    }
}

//queryString, query()方法不区分大小写
$query = function (n = '') {	
	if (n != '') {
	    if ($query[n] != null) {
	        return $query[n];
	    }
	    else {
	        for (let k in $query) {
                if (new RegExp('^' + n + '$', 'i').test(k)) {
                    return $query[k];
                }
            }
            return null;
	    }
	}
	else {
		let q = window.location.search.substring(1);
		if(q != '')	{
		    q.split('&').forEach(p => {
		        if (p.includes('=')) {
		            $query[p.substring(0, p.indexOf('='))] = decodeURIComponent(p.substring(p.indexOf('=') + 1));
		        }
		        else {
                    $query[p] = '';
		        }
		    });
		}				
	}
}
$query.contains = function(n) {
    return $query[n] != null;
}
$query();

String.prototype.$trim = function(char = '', char2 = '') {
    if (this != null) {
        if (char == '') {
            return this.trim().replace(/^(&nbsp;|\s)+/g, '').replace(/(&nbsp;|\s)+$/g, '');
        }
        else if (char2 != '') {
            let str = this.trim();
            if (str.startsWith(char)) {
                str = str.substring(char.length);
            }
            if (str.endsWith(char2)) {
                str = str.substring(0, str.length - char2.length);
            }         
            return str;
        }
        else {
            return this.trim().replace(new RegExp('^' + char, 'g'), '').replace(new RegExp(char + '$', 'g'), '');
        }
    }
    else {
        return '';
    }
}

//替换10000次
String.prototype.$replace = function(sub, rep) {
    let str = this.toString();
    if (rep.includes("$&")) {
        rep = rep.replace(/\$&/g, '$ &');
    }

    //return str.replace(new RegExp(sub.replace('[', '\\['), 'g'), rep); //会死循环
    let i = 0; 
    while (str.includes(sub) && i < 10000) {
        str = str.replace(sub, rep);
        i++;
    }
    return str;
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

String.prototype.drop = function(length) {
    let me = this.toString();
    if (length < 0) {
        return me;
    }
    else if (length > me.length) {
        return '';
    }
    else {
        return me.substring(length);
    }
}

String.prototype.dropRight = function(length) {
    let me = this.toString();
    if (length < 0) {
        return me;
    }
    else if (length > me.length) {
        return '';
    }
    else {
        return me.substr(0, me.length - length);
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

String.prototype.print = function() {
    console.log(this);
    return this;
}

Array.prototype.head = function() {
    if (this.length > 0) {
        return this[0];
    }
    else {
        return null;
    }
}

Array.prototype.last = function() {
    if (this.length > 0) {
        return this[this.length - 1];
    }
    else {
        return null;
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

Array.prototype.$asc = function(p) {
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

Array.prototype.$desc = function(p) {
    return this.$asc(p).reverse();    
}

Array.prototype.repeat = function(t) {
    let array = this;
    for (let i = 0; i < t - 1; i++) {
        array = array.concat(this)
    }
    return array;
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

String.prototype.toBoolean = function(defaultValue = false) {
    
    value = this.$p().trim();

    if (/^(true|yes|1|ok|on)$/i.test(value)) {
        value = true;
    }
    else if (/^(false|no|0|cancel|off)$/i.test(value)) {
        value = false;
    }
    else {
        try {
            value = eval(value);
        }
        catch (err) {
            value = defaultValue;
        }
    }

    if (typeof (value) != 'boolean') {
        if (value == 1) {
            value = true;
        }
        else if (value == 0) {
            value = false;
        }
        else {
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
        let select = $s(this);
        if (select.nodeName != undefined && select.nodeName == 'SELECT') {
            for (let option of select.options) {
                map[option.text] = option.value;
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
    else {
        map[this] = this;
    }
    
    return map;
}

String.prototype.toHyphen = function() {
    return this.toString().replace(/[A-Z]/g, $0 => '-' + $0.toLowerCase());
}

String.prototype.toCamel = function() {
    return this.toString().replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase()).replace(/^([A-Z])/, ($0, $1) => $0.toLowerCase());
}

String.prototype.toPascal = function() {
    return this.toString().replace(/(_|-)([a-z])/g, ($0, $1, $2) => $2.toUpperCase()).replace(/^[a-z]/, $0 => $0.toUpperCase());
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

// private
$value = function(t) {
    let v = null;
    if (t.value != undefined) {
        v = t.value;
    }
    else if (t.getAttribute('value') != null) {
        v = t.getAttribute('value');
    }
    else if (t.textContent != null) {
        v = t.textContent;
    }
    else if (t.innerHTML != null) {
        v = t.innerHTML;
    }
    else if (t.data != null) {
        v = t.data;
    }
    else if (t.getAttribute('data') != null) {
         v = t.getAttribute('data');
    }
    else if (t.text != null) {
        v = t.text;
    }
    return v;
}

// private
$attr = function(t, a) {
    if (t.nodeType != null && t.nodeType == 1) {
        if (t[a] == null || typeof(t[a]) != 'string') {
            return t.getAttribute(a);
        }
        else {
            return t[a];
        }
    }
    else {
        return t[a];
    }
}

//t = element target
//p = <>+-\dn pointer
//a = [attr]
//d = default value
String.$p = function(t, p, a, d = 'null') {
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
                        c = c.toInt(0);
                        t = t.children[c] != null ? t.children[c] : null; 
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
String.prototype.$p = function(element) {

    let data = this.toString();
    if (typeof (element) == 'string') {
        element = document.querySelector(element);
    }

    data = data.replace(/&lt;/g, '<');
    data = data.replace(/&gt;/g, '>');

    //&(query)
    let query = /\&(amp;)?\(([a-z0-9_]+)\)/i;
    while(query.test(data)) {
        let match = query.exec(data);
        data = data.replace(match[0], $query.contains(match[2]) ? $query(match[2]) : 'null');
    }

    //$(selector)+-><[n][attr]?(1)
    // + next
    // - prev
    // > firdt child
    // < parent
    // \d child \d
    // n last child
    let selector = /\$\((.+?)\)([+-><bfnpl\d]*)(\[([a-z0-9_-]+?)\])?(\?\((.*?)\))?!?/i;
    while(selector.test(data)) {
        let match = selector.exec(data);
        data = data.replace(match[0], String.$p($s(match[1]), match[2], match[4], match[6]));
    }

    //parse element
    // $:<0
    // $:[attr]
    if (element != null) {
        let holders = data.match(/\$:([+-><bfnpl\d]*)(\[([a-z0-9_-]+?)\])?(\?\((.*?)\))?!?/ig);
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
                data = data.replace(holder, String.$p(element, p, a, d));
            }
        }
    }

    //~{{complex expression}}
    //must return a value 
    let complex = /\~\{\{([\s\S]+?)\}\}/;
    while (complex.test(data)) {
        let match = complex.exec(data);
        data = data.replace(match[0], element == null ? eval('_ = function() { ' + match[1].decode() + ' }();') : eval('_ = function() { ' + match[1].decode() + ' }').call(element));
    }

    //~{simple expression}
    let expression = /\~\{([\s\S]+?)\}/;
    while (expression.test(data)) {
        let match = expression.exec(data);
        data = data.replace(match[0], element == null ?  eval('_ = function() { return ' + match[1].decode() + '; }();') : eval('_ = function() { return ' + match[1].decode() + ' }').call(element));
    }

    return data.replace(/~u0040/g, '@');
}

String.prototype.isEmpty = function() {
    return this.toString().trim() == '';
}

String.prototype.ifEmpty = function(other) {
    return this.toString().trim() == '' ? other : this.toString();
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

String.prototype.eval = function() {
    return eval(this.toString());
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

Number.prototype.toPercent = function(digits = 2) {
    if (digits == -1) {
        return this * 100 + '%';
    }
    else {
        return (this * 100).toFixed(digits) + '%';
    }
}

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

Json.parse = function(json) {
    return new Json(json);
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

$parseString = function(value, defaultValue = '') {
    if (typeof (value) == 'string') {
        return value;
    }
    else if (value != null) {
        return value.toString();
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

$parseBoolean = function(value, defaultValue = false) {
    if (typeof (value) == 'number') {
        return value > 0;
    }
    else if (typeof (value) == 'string') {
        return value.toBoolean(defaultValue);
    }
    else if (typeof (value) == 'boolean') {
        return value;
    }
    else if (value instanceof Array) {
        return value.length > 0;
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

Enum = function() {
    return new Enum.Entity(new RegExp('^(' + Array.from(arguments).join('|') + ')$', 'i'), arguments[0]);
}

Enum.Entity = function(expression, defaultValue) {
    this.expression = expression;
    this.defaultValue = defaultValue;
}

Enum.Entity.prototype.validate = function(value) {
    if (typeof(value) == 'string') {
        value = value.trim();
    }    
    if (value == null || !this.expression.test(value)) {
        value = this.defaultValue;
    }
    return value.toUpperCase();
}

//all components
// name -> component
// name doesn't start with '#'
document.components = new Map();
//all nodeName
document.tags = new Set();

// <clock name="watch"></clock> tagName = watch 
$listen = function(tagName) {
    return new Event.Entity(tagName);
}

Event.s = new Map();

Event.bind = function (tagName, eventName, func) {
    
    eventName = eventName.toLowerCase();    
    if (!eventName.startsWith('on')) {
        eventName = 'on' + eventName;
    }

    if (!Event.s.has(tagName)) {
        Event.s.set(tagName, new Map());
    }
    if (!Event.s.get(tagName).has(eventName)) {
        Event.s.get(tagName).set(eventName, new Array());
    }

    Event.s.get(tagName).get(eventName).push(func);
}

Event.execute = function (tagName, eventName, ...args) {

    if (!document.components.has(tagName)) {
        throw new Error('Tag ' + tagName + ' does not exists.');
    }

    let tag = document.components.get(tagName);
    if (!eventName.startsWith('on')) {
        eventName = 'on' + eventName;
    }

    let final = true;
    if (tag[eventName] != null) {
        if (typeof (tag[eventName]) == 'function') {
            final = tag[eventName].call(tag, ...args);
        }
        else if (typeof (tag[eventName]) == 'string') {
            final = eval('final = function() {' + tag[eventName] + '}').call(tag, ...args);
        }
        if (typeof (final) != 'boolean') { final = true; };
    }

    if (Event.s.has(tagName)) {
        let funcs = Event.s.get(tagName).get(eventName.toLowerCase());
        if (funcs != null) {
            for (let func of funcs) {
                let result = true;
                //key code
                if (typeof (func) == 'function') {
                    result = func.call(tag, ...args);
                }
                else if (typeof (func) == 'string') {
                    result = eval('result = function() {' + func + '}').call(tag, ...args);
                }
                if (typeof (result) != 'boolean') { result = true; };

                if (!result && final) {
                    final = false;
                }
            }            
        }
    }

    return final;
}

//执行某一个具体对象的事件非bind事件，再比如对象没有name，如for和if标签
Event.fire = function(tag, eventName, ...args) {

    if (!eventName.startsWith('on')) {
        eventName = 'on' + eventName;
    }

    let final = true;
    if (tag[eventName] != null) {
        if (typeof (tag[eventName]) == 'function') {
            final = tag[eventName].call(tag, ...args);
        }
        else if (typeof (tag[eventName]) == 'string') {
            final = eval('final = function() {' + tag[eventName] + '}').call(tag, ...args);
        }
        if (typeof (final) != 'boolean') { final = true; };
    }
    return final;
}

Event.watch = function(obj, method, watcher) {
    let func = function() {
        obj[method]();
    }
    watcher.split(';')
        .map(w => {
            return {
                event: w.takeBefore(':').trim(),
                selector: w.takeAfter(':').trim()
            };
        })
        .forEach(watch => {
            if (watch.selector.includes('@')) {
                watch.selector
                    .split(',')
                    .map(s => s.trim())
                    .forEach(s => {
                        if (s.startsWith('@')) {
                            $listen(s).on(watch.event, func);
                        }
                        else {
                            $x(s).on(watch.event, func);
                        }
                    });
            }
            else {
                $x(watch.selector).on(watch.event, func);
            }
        });
}

Event.Entity = function(name) {
    this.tagName = name.trim().replace(/^[#@]/, '');
}

Event.Entity.prototype.on = function(eventName, func) {
    eventName.split(',')
        .forEach(event => {
            Event.bind(this.tagName, event.trim(), func);
        });

    return this;
}

Event.Entity.prototype.execute = function(eventName, ...args) {
    return Event.execute(this.tagName, eventName, ...args);
}

$initialize = function(object) {
    return new $Settings(object);
}

$Settings = function(object) {
    this.carrier = null;
    this.object = object;
    this.isElement = false;
    this.$burn = false;

    this.object['nodeName'] = object.constructor != null ? (object.constructor.name != null ? object.constructor.name.toUpperCase() : 'UNKONWN') : 'UNKONWN';
    this.object['tagName'] = this.object['nodeName'];
    this.object['nodeType'] = 0; // 0 为自定义标签
    document.tags.add(this.object['tagName']);
}

$Settings.prototype.with = function(elementOrSettings) {
    this.carrier = elementOrSettings;
    if (this.carrier != null && this.carrier.nodeType != null && this.carrier.nodeType == 1) {
        this.isElement = true;
    }

    return this;
}


$Settings.prototype.burnAfterReading = function() {
    this.$burn = true;
    return this;
}

$Settings.prototype.declare = function(variables) {
    
    for (let name in variables) {
        let property = name;
        if (/^[_\$]/.test(property)) {
            property = property.substring(1);
        }

        let value = variables[name];
        if (typeof(value) == 'string') {
            if (property == 'name') {
                this.object[name] = this.get('name');
                this.object['id'] = this.get('id');
                if (this.object[name] == null || this.object[name] == '') {
                    this.object[name] = this.object['id'];
                }
                if (this.object[name] == null || this.object[name] == '') {
                    this.object[name] = value;
                    this.object['id'] = value; //说明id也为空
                }
                if ((this.object['id'] == null || this.object['id'] == '') && this.object[name] != '') {
                    this.object['id'] = this.object[name];
                }

                if (this.isElement) {
                    if (this.carrier.id == '' && this.object['id'] != '') {
                        this.carrier.id = this.object['id'];
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
                    //let find = this.carrier.querySelector(property) || this.carrier.querySelector(property.toHyphen());
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
            else if (value == '$x') {
                this.object[name] = $x(this.get(property));
            }
            else if (value == '$s') {
                this.object[name] = $s(this.get(property));
            }
            //enum 枚举, 默认值为第1项
            else if (value.includes('|')) {
                this.object[name] = Enum(...value.split('|').map(v => v.trim())).validate(this.get(property));                
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
            this.object[name] = $parseBoolean(this.get(property), value);
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
            this.object[name] = value.validate(this.get(property));
        }
        else if (value instanceof Object) {
            this.object[name] = Json.eval(this.get(property));
        }
        else {
            this.object[name] = this.get(property);
        }
    }

    this.object.constructor.prototype.on = function (eventName, func) {
        Event.bind(this.name, eventName, func);
        return this;
    }
    
    this.object.constructor.prototype.execute = function (eventName, ...args) {
        return Event.execute(this.name, eventName, ...args);
    }
    
    if (this.object['name'] != null && this.object['name'] != '') {
        document.components.set(this.object['name'], this.object);
    }    

    return this;
}

$Settings.prototype.get = function(attr) {
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
                else {
                    attr = '';
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
                // if (this.carrier[attr] != undefined) {
                //     //因为有的类型直接返回boolean值, 不符合预期. 比如 selected="yes"，返回值是false
                //     if (typeof(this.carrier[attr]) == 'boolean') {
                //         if (this.carrier.getAttribute(attr) != "") {
                //             value = this.carrier.getAttribute(attr);
                //         }
                //         else {
                //             value = this.carrier[attr];
                //         }    
                //     }
                //     //selectedIndex会有问题
                //     else if (attr != 'selectedIndex') {
                //         value = this.carrier[attr];
                //     }
                //     else {
                //         value = this.carrier.getAttribute(attr);
                //     }
                // }
                // else {
                //     value = this.carrier.getAttribute(attr);
                // }                

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

$Settings.prototype.elementify = function(func) {
    if (this.isElement) {
        func.call(this.object, this.carrier);
    }
    return this;
}

$Settings.prototype.objectify = function(func) {
    if (this.carrier != null && !this.isElement) {
        func.call(this.object, this.carrier);
    }
    return this;
}

$size = function(o) {
    if (o.length != undefined) {
        return o.length;
    }
    else if (o.size != undefined) {
        return o.size;
    }
    else if (o instanceof Object) {
        let s = 0;
        for (let a in o) {
            s++;
        }
        return s;
    }
    else {
        return null;
    }
}

$randomX = function(digit = 10) {
    return Math.round(Math.random() * Math.pow(10, digit)).toString().padStart(digit, '0');
}

$random = function(begin, end) {
    if (end == null) {
        end = begin;
        begin = 0;
    }
    return begin + Math.round(Math.random() * (end - begin));
}

$randomPassword = function(digit = 7) {
    let str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let pwd = '';
    for (let i = 0; i < digit; i++) {
        pwd += str.substr($random(0, 61), 1);
    }
    return pwd;
}

$guid = function() {
    return new Date().valueOf() + '-' + $randomPassword(10);
}

$ready(function() {
    if ($x('html').attr('mobile') != null) {
        //<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        $x('head').append('META', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=no' });
        $x('html').style('font-size', $root.visibleWidth() / 15 + 'px');
    }
});

//will be call in template
$root.initialize = function() {

    //toBeParse
    for (let bep of $a('[p]')) {
        let attr = bep.getAttribute('p');
        if (bep[attr] != null && !attr.startsWith('on')) {
            bep[attr] = bep[attr].$p(bep);
        }
        else {
            bep.setAttribute(attr, bep.getAttribute(attr).$p(bep));
        }
        bep.removeAttribute('p');
    }

    //link
    for (let link of $a('[href]')) {
        if (link.nodeName != 'A' && link.nodeName != 'LINK') {
            link.setAttribute('link', link.getAttribute('href'));
            link.removeAttribute('href');
            $x(link).bind('click', function() {
                window.location.href = this.getAttribute('link').$p(this);
                this.style.cursor = 'default';
            });
        }
    }
    
    //hide
    for (let el of $a('[hidden]')) {
        el.style.display = 'none';
        el.removeAttribute('hidden');
    }
}

$finish(function() {

    $root.initialize();

    //enter event
    for (let enter of $a('input[enter]')) {
        $x(enter).on('keypress', function(ev) {
            if (ev.keyCode == 13 && this.value != this.defaultValue) {
                window.location.href = this.getAttribute('enter').$p(this);
            }
        });
    }

    //attributes to be parse - after model load
    for (let every of $root.PROPERTIES) {
        if (every.ownProperty != null) {
            for (let tag of document.querySelectorAll(every.selector)) {
                let before = every.attribute != null ? tag.getAttribute(every.attribute) : tag[every.property];
                let after = before.$p(tag);

                if (every.property != null) {
                    tag[every.property] = after;
                }
                else {
                    tag.setAttribute(every.attribute.substring(1), after);
                }
            }
        }
    }

    if (document.body.getAttribute('self-adaption') != null) {        
        let layout = function() {
            document.body.getAttribute('self-adaption')
            .split(',')
            .map(frame => $x(frame))
            .forEach(frame => {            
                frame.height(
                    window.innerHeight - frame.top()
                );
            });
        }

        document.body.style.overflowY = 'hidden';

        layout();
        
        $x(window).bind('resize', layout);
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
        $x(window).bind('load', function() {fix(); ajust();}).bind('resize', ajust);
        window.setTimeout(ajust, 1000);
    }

    //iframe
    if (document.body.getAttribute('iframe') != null) {
        let flex = function() {
            parent.$x(document.body.getAttribute('iframe')).height($root.documentHeight());
        };
        flex();
        window.setInterval(flex, 2000);
    }
});