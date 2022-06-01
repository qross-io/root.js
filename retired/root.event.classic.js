//2022.5.20 事件大改，这些跟随库几个版本的经典代码已从主库移除

// id : event-name : [func]
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
    
    if (tag instanceof HTMLElement) {
        //原生标签
        tag.on(eventName, func);
    }
    else if (tag.events != null) {
        //已加载完的自定义标签
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
            tag.await = tag.await.replace(new RegExp(a + '\\b'), '').trimPlus(',');
            if (tag.await == '') {
                tag.load();
            }            
        });
    });
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

//执行某一个具体对象的事件非监听事件，再比如对象没有name，如for和if标签
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
            if (/^\s*function\(\s*\)\s*{/.test(func)) {
                final = eval('final = ' + func).call(tag, ...args);
            }
            else {
                final = eval('final = function() {' + func + '}').call(tag, ...args);
            }            
        }
        if (typeof (final) != 'boolean') { final = true; };
    }
    return final;  
}

Event.express = function(exp) {
    for (let sentence of exp.split(';')) {
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
    element.getAttributeNames().filter(name => name.startsWith('on') || name.endsWith('-on')).forEach(name => {
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
    if (watcher.includes('<-')) {
        value = watcher.takeAfter('<-').trim();
        watcher = watcher.takeBefore('<-').trim();
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