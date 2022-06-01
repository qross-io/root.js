
//2022.5.20 原自定义标签的定义方法，已由 HTMLCustomElement 代替

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
            //document.components.set(this.object.name, this.object);
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
                    if (!'selectedIndex,draggable'.includes(attr)) {
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