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
                        return $parseInt(propertyValue, defaultValue);
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
                    return getFunc == null ? propertyValue : getFunc.call(this.object, propertyValue, defaultValue);
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

NativeElement.executeAopFunction = function(object, func, value) {
    if (typeof (func) == 'string') {
        return (function(func, value) { return eval(func) }).call(object, func, value)
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
                //这里有个可能的坑，每次获取都会判断值是否返回默认值，默认值理论上讲只对第一次设置有效
                let defaultValue = variables[name];
                let value = this.getAttribute(name);
                if (value == null && /[A-Z]/.test(name)) {
                    value = this.getAttribute(name.replace(/^[_$]/, '').toHyphen());
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

//绑定事件
NativeElement.prototype.defineEvents = function(...eventNames) {
    eventNames.forEach(eventName => {
        if (eventName.endsWith('+')) {
            HTMLElement.defineSeverEvent(this.object, eventName);
        }
        else {
            HTMLElement.defineCustomEvent(this.object, eventName);
        }
    });  
    return this;
}

//声明隐式变量, 非标签中声明的参数或扩展方法，下划线开头的私有变量保存值
NativeElement.prototype.describe = function(variables) {
    for (let name in variables) {
        let defaultValue = variables[name];        
        Object.defineProperty(this.object, name, {
            extension: true,
            get () {
                if (this['_' + name] === undefined) {
                    this[name] = this.getAttribute(name) ?? this.getAttribute(name.toHyphen()) ?? defaultValue;
                }
                return this['_' + name];
            },
            set (value) {
                if (defaultValue == '$') {
                    this['_' + name] = value == '$' ? null : $parseElement(value, name);
                }
                else if (defaultValue == '$$') {
                    this['_' + name] = value == '$$' ? [] : $parseElements(value, name);
                }
                else {
                    this['_' + name] = value;
                }                
            }
        });
        
    }
    return this;
}