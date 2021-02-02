
/*
    <model name="" data="url or array or object or value" />

    <model name="" auto-refresh="" terminal="@:/.length == 0" interval="1000" data="">
        <set $="" attr="" if=""></set>
        <set $=""></set>
    </model>
    
    //url, [ ], { }, range
    <for var="name" in="url" in="[a, b, c]" in="{result/data}" in="0 to 9" onload="">
        <if test='' onload="">
            <treenode selectable=false icon-class='' icon='' tip='' text='' link='' target=''>
                <icon class=''></icon>
                <text class=''></text>
                <tip class=''><tip>
            </treenode>
            <for path="/">
                <if test="">
                    <div></div>
                </if>
            </for>
        <elsif test=''>
            <treenode>html</treenode>
        <else>
            ......
        </if>
    </for>

    <template name=" data="">

    </template>
*/

/*

支持的关键字属性
-html/-value/-href/...

占位符变量格式
@modelName
@[pathOrKey]
@modelName[pathOrKey]

重要信息
! model只属于document, 在head标签中定义
! template可属于自定义控件如dataTable, treeView, 在页面上定义
! 加载顺序 model, for, if, 子语句for或if, template
! template可以重新加载, model在set模式下可以重新加载
! for和if在加载完成后移除
! 全部加载完成后再加载页面上的其他控件 $finish

*/

//hide all <for> and <if>
document.querySelector('HEAD').appendChild($create('STYLE', { 'type': 'text/css', 'innerHTML': 'for,if { display: none; }' }));

document.models = new Object();
//待加载的model项, 为0时触发finish事件
document.models.$length = 0;
//页面上的所有model是否都已经加载完成
document.models.$loaded = false;

//只是为了保存onfinish事件
//所有model加载完成后执行onfinifh事件
document.components.set('$global', {
    nodeName: 'GLOBAL',
    tagName: 'GLOBAL',
    onfinish: null
});

Model = function(element) {

    this.name = element.getAttribute('name') || '';
    if (this.name == '') {
        throw new Error('Model "name" is required. It will be used to transfer data.');
    }

    //加载之前的数据  
    this.data = element.getAttribute('data') || '';

    //中间变量
    this.vars = { };

    this.autoRefresh = $parseBoolean(element.getAttribute('auto-refresh') || element.getAttribute('autoRefresh'), false);
    this.interval = $parseFloat(element.getAttribute('interval'), 2);
    this.terminal = element.getAttribute('terminal') || 'false';
    this.deferral = 0;

    this.sets = [];
    for (let set of element.querySelectorAll('set')) {
        let selector = set.getAttribute('$');
        if (selector == '') {
            throw new Error('Empty selector: ' + set);
        }
        else {
            let target = $s(selector);
            if (target != null) {
                let attr = set.getAttribute('attr') || '';
                if (attr == '') {
                    if (target.value != null) {
                        attr = 'value';
                    }
                    else {
                        attr = 'innerHTML';
                    }
                }

                let format = set.innerHTML;
                if (format == '') {
                    format = $attr(target, attr);
                }

                this.sets.push({
                    'target': target, //选择器
                    'attr': attr, //属性, 可忽略
                    'format': format, //原始数据
                    'if' : set.getAttribute('if') || 'true' //条件, 默认true
                });             
            }
        }
    }

    //model标签
    this.element = element;

    this.nodeName = 'MODEL';
    this.tagName = 'MODEL';
    document.tags.add('MODEL');
    document.components.set(this.name, this);

    if (this.autoRefresh && this.interval > 0) {
        Model.refresh(this.name, this.interval, this.terminal);        
    }
}

Model.refresh = function(name, interval, terminal) {

    let refresher = window.setInterval(
        function() {            
            let model = $model(name);
            if (eval(terminal.$p())) {
                //延期3次才终止
                if (model.deferral >= 3) {
                    window.clearInterval(refresher);
                    model.deferral = 0;
                }
                else {
                    model.deferral ++;
                }
            }
            else {
                //reset
                if (model.deferral > 0) {
                    model.deferral = 0;
                }

                model.refresh();                    
            }
            
        }, interval * 1000);
}

//第一次加载完成后触发
Model.prototype.onload = null; //function(data) { }
//每次刷新后触发
Model.prototype.onrefresh = null; //function(data) { }

Model.prototype.loaded = false;

Model.prototype.loading = false;

Model.prototype.on = function(eventName, func) {
    $listen(this.name).on(eventName, func);
    return this;
}

//first
Model.prototype.load = function(data) {

    if (data != null) {
        this.data = data;
    }

    this.loading = true;
    
    $TAKE(this.data, this.element, this, function(data) {
        
        window[this.name + '$'] = data;

        for (let every of $root.PROPERTIES) {
            for (let tag of document.querySelectorAll(every.selector)) {
                if (every.ownProperty != null || tag.getAttribute('load') == null) {
                    let before = every.attribute != null ? tag.getAttribute(every.attribute) : tag[every.property];
                    if (before.includes('@' + this.name)) {
                        //get data                  
                        let after = this.$represent(before);
                        if (before != after) {
                            //所有占位符已经被替换完成
                            if (!/([^@]|^)@[a-z_][a-z0-9_]*/i.test(after)) {
                                after = after.$p(tag);

                                if (after.includes('@@')) {
                                    after = after.replace(/@@/g, '@');
                                }

                                if (every.ownProperty != null) {
                                    tag[every.ownProperty] = after;
                                    tag.removeAttribute(every.attribute);
                                }
                                else {
                                    tag.setAttribute(every.customAttribute, after);
                                    tag.setAttribute('load', 'ed');
                                }
                            }
                            else {
                                if (every.property != null) {
                                    tag[every.property] = after;
                                }
                                else {
                                    tag.setAttribute(every.attribute, after);    
                                }                        
                            }
                        }
                    }     
                }            
            }
        }

        this.$set(data);

        this.loaded = true;
        this.loading = false;

        //onload
        Event.execute(this.name, 'onload', data);

        if (document.models.$length > 0) {
            //first load        
            document.models.$length--;
            if (document.models.$length == 0) {
                Model.initializeForOrIf('MODEL.LOAD');
            }
        }
    });
}

Model.prototype.refresh = function() {
    if (this.loaded && !this.loading) {
        this.loading = true;
        $TAKE(this.data, this.element, this, function(data) {
            window[this.name + '$'] = data;            
            $model(this.name).$set(data);            
            Model.initializeForOrIf('MODEL.REFRESH');
            Event.execute(this.name, 'onrefresh', data);
            this.loading = false;
        });      
    }    
}

// 替换特定属性的值
Model.prototype.$represent = function(content) {
    
    // @modelname!
    // @modelname.key?(defaultValue)
    // @modelname.key[0]?(defaultValue)
    // @modelname[0]
    [
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig
    ].map(place => {
        let hs = content.match(place);
        return hs != null ? hs : [];
    })
    .reduce((r1, r2) => r1.concat(r2))
    .distinct()
    .forEach(holder => {
        let d = null; //defaultValue
        let p = holder; //path
        if (p.includes('?(')) {
            d = p.takeAfter('?(').replace(/\)$/, '');
            p = p.takeBefore('?(');
        }
        p = p.replace(/^\@|\!$/g, '')
             .replace(/\[/g, '.')
             .replace(/\]/g, '');

        let ps = p.split('.');
        if (ps.length == 1) {
            p = '.';
        }
        else {
            p = p.substring(p.indexOf('.'));
        }

        let n = ps[0]; //name
        if (this.name == n) {
            let v = window[n + '$']; //Json.find(window[n + '$'], n);
            for (let i = 1; i < ps.length; i++) {
                if (v != null) {
                    v = v[ps[i]];
                }            
                else {
                    break;
                }
            }

            if (v == null) {
                if (d != null) {
                    v = d;
                }
                else {
                    v = 'null';
                }
            }

            if (v != null) {   
                if (v instanceof Array || v instanceof Object) {
                    this.vars[p] = v;
                    content = content.$replace(holder, '$model.' + this.name + p);                
                }
                else {
                    content = content.$replace(holder, v);
                }            
            }
        }
    });

    //处理数据中的双引号
    return content.replace(/"/g, '&quot;');
}

// set 标签的值
Model.prototype.$set = function(data) {
    if (this.sets.length > 0) {

        // @: 表示"当前"数据, 即data
        // @name 或 @:/ 表示单项根数据
        // @:key 与 @name.key 相同
        // @name[0]
        // @name.key[0]
        // @name[0].key
        let places = [
            // new Regex('@' + this.name + '(\\.[a-z_][a-z0-9_]*|\\[\\d+\\])*\\?\\([^\\(\\)]*?\\)', 'ig'),
            // new Regex('@' + this.name + '(\\.[a-z_][a-z0-9_]*|\\[\\d+\\])*\\!?', 'ig'),
            /@:([a-z_][a-z0-9_]*|\[\d+\])(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
            /@:([a-z_][a-z0-9_]*|\[\d+\])(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig,
            /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
            /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig,
            /@:\//g
        ];

        for (let set of this.sets) {
            if (eval(set.if)) {
                let content = set.format;
                if (content != null) {
                    places.map(place => {
                        let hs = content.match(place);
                        return hs != null ? hs : []; 
                    })
                    .reduce((r1, r2) => r1.concat(r2))
                    .distinct()
                    .forEach(holder => {
                        let d = null; //defaultValue
                        let p = holder; //path
                        if (p.includes('?(')) {
                            d = p.takeAfter('?(').replace(/\)$/, '');
                            p = p.takeBefore('?(');
                        }

                        p = p.replace(/^\@|\!$/g, '')
                                    .replace(/\[/g, '.')
                                    .replace(/\]/g, '')
                                    .replace(/^:/, this.name + '.')
                                    .replace(/[\/\.]$/g, '')

                        let ps = p.split('.');

                        let n = ps[0]; //name
                        let v = Json.find(window[n + '$'], n);
                        for (let i = 1; i < ps.length; i++) {
                            if (v != null) {
                                v = v[ps[i]];
                            }            
                            else {
                                break;
                            }
                        }

                        if (v == null) {
                            if (d != null) {
                                v = d;
                            }
                            else {
                                v = 'null';
                            }
                        }
                        else {
                            v = Json.toString(v);
                        }

                        if (v != null) {
                            if (v instanceof Array || v instanceof Object) {
                                if (p.startsWith(this.name + '.')) {
                                    this.vars[p.takeAfter('.')] = v;
                                }                                
                                content = content.$replace(holder, '$model.' + p);  
                            }
                            else {
                                content = content.$replace(holder, v.replace(/"/g, '&quot;'));
                            }                            
                        }
                    });

                    content = content.$eval();
                    if (set.target[set.attr] != null) {
                        set.target[set.attr] = content;
                    }
                    else {
                        set.target.setAttribute(set.attr, content);
                    }
                }
            }
        }                
    }            
}

Model.$ForOrIf = function(tag) {
    //选择未被加载并且不在template模板中的for或if标签
    for (let t of document.querySelectorAll(tag)) {
        if (t.getAttribute('loading') == null) {
            let incubating = false;
            let p = t.parentNode;
            while (!incubating) {
                if (p == null || p.nodeName == 'BODY' || p.nodeName == 'HTML') {
                    break;
                }
                else if ('TEMPLATE,TEXT,TIP,CAP,GAP,LAP,FOR,IF'.$includes(p.nodeName)) {
                    incubating = true;
                    break;
                }
                p = p.parentNode;
            }

            if (!incubating) {
                t.setAttribute('loading', '');
                return t;
            }
        }
    }

    return null;
}

Model.initializeForOrIf = function(tagName) {
    //find first for/if
    let next = Model.$ForOrIf('FOR,IF,TR[IF],OPTION[IF]');    
    if (next == null) {
        //nothing
        if (!document.models.$loaded) {            
            if (!document.templates.$loaded) {
                //model加载完成并且页面上的for和if加载已完成, -1表示还未进行standalone检查
                if (document.templates.$length == -1) {
                    Model.initializeStandaloneTemplates();
                }                
            }
            else {
                //所有加载完成
                document.models.$loaded = true;
                Event.execute('$global', 'onfinish');

                //<o> 标签 = output
                for (let o of $a('o')) {
                    $cogo(o.innerHTML, o)
                        .then(data => {                           
                            o.parentNode.insertBefore(document.createTextNode(data), o);
                            o.remove();
                        });
                }

                //<span data=""> 标签
                for (let span of $a('span[data]')) {
                    new Span(span).load();   
                }
            }            
        }
        //model已经加载完
        //页面上的for和if已经加载完
        //开始加载templates
        //template已加载完 
        //结束加载templates
    }
    else  if (next.nodeName == 'FOR') {
        //for
        new For(next).on('load', next.getAttribute('onload')).load();
    }
    else {
        //if
        new If(next).on('load', next.getAttribute('onload')).load();
    }
}

Model.initializeStandaloneTemplates = function() {
    let templates = document.querySelectorAll('template[data]');
    document.templates.$length = templates.length;
    if (templates.length > 0) {        
        for (let template of templates) {
            new Template(template)
                .on('load', template.getAttribute('onload'))
                .on('lazyload', template.getAttribute('onlazyload'))
                .on('done', template.getAttribute('ondone'))
                .append();
        }
    }
    else {
        document.templates.$loaded = true;
        Model.initializeForOrIf('MODEL.TEMPLATE.STANDALONE');
    }
}

Model.initializeAll = function() {
    let models = document.querySelectorAll('model');
    if (models.length > 0) {
        document.models.$length = models.length;
        for (let model of models) {
            new Model(model).on('load', model.getAttribute('onload')).load();
        }
    }
    else {
        Model.initializeForOrIf('INITIALIZE');
    }
}


$model = function(name) {
    let model = $t(name);
    if (model != null && model.tagName == 'MODEL') {
        return model;
    }
    else {
        return null;
    }
}


// <for var="name"
//   in="url -> path" in="[a, b, c]" in="{result/data}" in="0 to 9"
//        container='selector' position='front|behind|begin|end'>
// </for>

For = function(element) {
    this.var = element.getAttribute('var') || element.getAttribute('let') || '';
    if (this.var.includes(',')) {
        this.var = this.var.split(',');
    }
    this.in = element.getAttribute('in') || '';

    this.element = element;
    this.content = element.innerHTML;
    this.container = element.getAttribute('container') || element;
    this.position = 'beforeBegin';
    if (typeof(this.container) == 'string') {
        this.container = $s(this.container);
        if (this.container == null) {
            throw new Error("Can't find element or wrong selector: " + element.getAttribute('container'));
        }
        this.position = 'beforeEnd';
    }
}

//第一次加载完成后触发
For.prototype.onload = null; //function(data) { }

For.prototype.on = function(eventName, func) {
    eventName = eventName.toLowerCase();
    if (!eventName.startsWith('on')) {
        eventName = 'on' + eventName;
    }
    this[eventName] = func;
    return this;
}

For.prototype.load = function(data) {

    if (data != null) {
        this.in = data;
    }

    //in
    //in="url" in="[a, b, c]" in="{result/data}" in="0 to 9"

    if (typeof(this.in) == 'string') {
        if (/^(\d+)\s+to\s+(\d+)$/i.test(this.in)) {
            let m = /^(\d+)\s+to\s+(\d+)$/i.exec(this.in);
            let s = m[1].toInt();
            let t = m[2].toInt();
            this.in = [];
            if (s < t) {
                for (let i = s; i < t; i++) {
                    this.in.push(i);
                }
            }
            else if (s > t) {
                for (let i = s; i > t; i--) {
                    this.in.push(i);
                }
            }
            else {
                this.in.push(s);
            }
        }
        else if (this.in.startsWith('$template.')) {
            this.in = $template(this.in.takeAfter('.').takeBefore('.')).vars['.' + this.in.takeAfterLast('.')];
        }
        else if (this.in.startsWith('$model.')) {
            this.in = $model(this.in.takeAfter('.').takeBefore('.')).vars['.' + this.in.takeAfterLast('.')];
        }
    }

    $TAKE(this.in, this.element, this, function(data) {
        if (this.in != data || typeof(this.in) != typeof(data)) {
            this.in = data;
        } 

        let content = [];
        if (this.in instanceof Array) {
            for (let v of this.in) {
                content.push(this.$eachOf(this.var, v));
            }
        }
        else if (typeof (this.in) == 'object') {
            if (this.var instanceof Array) {
                if (this.var.length == 1) {
                    this.var.push('value');
                }                
            }
            else {
                if (this.var == '') {
                    this.var = ['key', 'value'];
                }
                else {
                    this.var = [this.var, 'value'];
                }
            }

            for (let k in this.in) {
                content.push(this.$eachIn(this.var[0], this.var[1], k, this.in[k]));
            }
        }
        else {
            throw new Error('Wrong collection data in <for>: ' + this.in);
        }

        this.container.insertAdjacentHTML(this.position, content.join('').$eval());
        
        this.element.remove();

        if (this.onload != null) {
            Event.fire(this, 'onload', data);
        }        
        
        Model.initializeForOrIf('FOR');
    });

    return this;
}


For.prototype.$eachOf = function(name, item) {
    
    let content = this.content;

    // @item
    // @item.key!
    // @item.key[0]
    // @item[1].key

    // @[key]
    // @[0]

    [
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig,
        /@\[[a-z0-9_][a-z0-9_\/\.]*\]\?\([^\(\)]*?\)/ig,
        /@\[[a-z0-9_][a-z0-9_\/\.]*\]/ig
    ].map(place => {
        let hs = content.match(place);
        return hs != null ? hs : [];        
    })
    .reduce((r1, r2) => r1.concat(r2))
    .distinct()
    .forEach(holder => {
        let d = null; //defaultValue
        let p = holder; //path
        if (p.includes('?(')) {
            d = p.takeAfter('?(').replace(/\)$/, '');
            p = p.takeBefore('?(');
        }
        let ps = p.replace(/^\@|\!$/g, '')
                  .replace(/\[/g, '.')
                  .replace(/\]/g, '')
                  .replace(/\.$/g, '')
                  .split('.');

        let n = ps[0]; //name
        if (name == '' ? n.toLowerCase() == 'item' || n == '' : name == n) {
            let v = item;
            for (let i = 1; i < ps.length; i++) {
                if (v != null) {
                    v = v[ps[i]];
                }            
                else {
                    break;
                }
            }

            if (v == null) {
                if (d != null) {
                    v = d;
                }
            }
            else {
                v = Json.toString(v);
            }

            //null值不输出
            if (v != null) {
                content = content.$replace(holder, v);
            } 
        } 
    });   

    //最后解析内容中的js表达式
    return content.$eval();
}

// { a:1, b:2 }  @key, @(key), @value?(defaultValue), @value[path]?(defaultValue)
// 'key' and 'value' is reserved keyword
//name = var/let
For.prototype.$eachIn = function($key, $value, key, value) {

    //$key, $value - 键和值的变量名称
    //key, value - 键和值对应的值

    let content = this.content;

    // 'key' and 'value' is reserved keyword
    // @key!
    // @value    
    // @value[0]
    // @value.property?(default)

    [
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig
    ].map(place => {
        let hs = content.match(place);
        return hs != null ? hs : [];
    })
    .reduce((r1, r2) => r1.concat(r2))
    .distinct()
    .forEach(holder => {
        let d = null; //defaultValue
        let p = holder; //path
        if (p.includes('?(')) {
            d = p.takeAfter('?(').replace(/\)$/, '');
            p = p.takeBefore('?(');
        }
        let ps = p.replace(/^\@|\!$/g, '')
                  .replace(/\[/g, '.')
                  .replace(/\]/g, '')
                  .replace(/\.$/g, '')
                  .split('.');

        let n = ps[0]; //name
        if ($key == 'key' ? n.toLowerCase() == 'key' || n.toLowerCase() == 'name' : n == $key) {
            content = content.replace(holder, key);            
        }
        else if ($value == 'value' ? n.toLowerCase() == 'value' : n == $value) {
            let v = value;
            for (let i = 1; i < ps.length; i++) {
                if (v != null) {
                    v = v[ps[i]];
                }            
                else {
                    break;
                }
            }

            if (v == null) {
                if (d != null) {
                    v = d;
                }                    
            }
            else {
                v = Json.toString(v);
            }
            //null值也输出
            content = content.$replace(holder, v);
        }
    });
    
    //最后解析内容中的js表达式
    return content.$eval();
}

//在替换完占位符之后执行js表达式
String.prototype.$eval = function() {

    let data = this.toString();

    let hasForHolders = function (expression) {
        // @hello, @[hello]
        return /@[a-z_][a-z0-9_]*/i.test(expression) || /@\[[^\[\]]+?\]/i.test(expression);
    }

    //~{{complex expression}}
    //must return a value 
    let complex = data.match(/\~\{\{([\s\S]+?)\}\}/g);
    if (complex != null) {
        complex.forEach(holder => {
            if (!hasForHolders(holder)) {
                let exp = holder.substring(3);
                exp = exp.substring(0, exp.length - 2);
                data = data.replace(holder, eval('_ = function() { ' + exp.decode() + ' }();'));
            }
        });
    }

    //~{simple expression}
    let simple = data.match(/\~\{([\s\S]+?)\}/g);
    if (simple != null) {
        simple.forEach(holder => {
            if (!hasForHolders(holder)) {
                let exp = holder.substring(2);
                exp = exp.substring(0, exp.length - 1);
                data = data.replace(holder, eval('_ = function() { return ' + exp.decode() + '; }();'));
            }
        });
    }

    return data.replace(/~u0040/g, '@');
}

// <if test="boolean expression">
//      html code
// <elsif test="boolean expression">
//      html code
// <else>
//      html code
// </if>

// $if('name').on(event, func).load();

If = function(element) {

    this.if = element;
    this.elsif = element.querySelectorAll('elsif');
    this.else = element.querySelector('else');
    this.result = false;

    this.isTag = element.nodeName == 'IF';
    this.onreturntrue = element.getAttribute('onreturntrue');
    this.onreturnfalse = element.getAttribute('onreturnfalse');
}

If.prototype.onload = null; //function() { }

If.prototype.on = function(eventName, func) {
    eventName = eventName.toLowerCase();
    if (!eventName.startsWith('on')) {
        eventName = 'on' + eventName;
    }
    this[eventName] = func;
    return this;
}

If.prototype.eval = function(test) {
    try {
        return eval(test);
    }
    catch(e) {
        throw new Error('Wrong test expression: ' + test);
    }
}

If.prototype.load = function() {

    let content = '';
    let test = this.if.getAttribute('test') || this.if.getAttribute('if') || 'false';

    if (this.isTag) {
        if (this.eval(test.$p(this.if))) {
            content = this.if.innerHTML.$eval();
            this.result = true;
        }
        else {
            if (this.elsif.length > 0) {
                for (let i = 0; i < this.elsif.length; i++) {
                    test = this.elsif[i].getAttribute('test') || 'false';
                    if (this.eval(test.$p(this.elsif[i]))) {
                        content = this.elsif[i].innerHTML.$eval();
                        this.result = true;
                        break;
                    }
                }
            }

            if (!this.result && this.else != null) {
                content = this.else.innerHTML.$eval();
                this.result = true;
            }
        }

        let $els = /<(else|elsif)/i;
        if ($els.test(content)) {
            content = content.substring(0, content.indexOf($els.exec(content)[0])).trim();
        }

        this.if.insertAdjacentHTML('beforeBegin', content);
    }
    else {
        if (this.eval(test.$p(this.if))) {
            this.result = true;
        }
        else {
            this.if.remove();
        }
    }
    
    if (this.onload != null) {
        Event.fire(this, 'onload');
    }

    if (this.result) {
        Event.fire(this, 'onreturntrue');
    }
    else {
        Event.fire(this, 'onreturnfalse');
    }

    if (this.isTag) {
        this.if.remove();
    }

    Model.initializeForOrIf('IF');
}

// 扩展的 Span 标签，带 data 属性
Span = function(span) {
    //this.name = span.getAttribute('name') || span.getAttribute('id') || '';
    this.data = span.getAttribute('data');
    this.content = span.innerHTML;
    this.element = span;

    this.loaded = false;
    this.onload = span.getAttribute('onload');
    this.onrelad = span.getAttribute('onreload');
    this.reloadOn  = span.getAttribute('reload-on') || span.getAttribute('reloadOn'); //click:#abc

    if (this.reloadOn != null) {
        Event.watch(this, 'reload', this.reloadOn);
    }
}

Span.prototype.$represent = function(data) {

    let content = this.content;

    //占位符规则与 TEMPLATE 相同
    //@: 表示整个数据
    //@:/ 表示根数据
    //@:key!
    //@:[0].key
    //@:key?(default)
    //@:key[0].name!

    [
        /@:([a-z_][a-z0-9_]*|\[\d+\])(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
        /@:([a-z_][a-z0-9_]*|\[\d+\])(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig,
        /@:\//g
    ].map(place => {
        let hs = content.match(place);
        return hs != null ? hs : [];        
    })
    .reduce((r1, r2) => r1.concat(r2))
    .distinct()
    .forEach(holder => {
        let d = null; //defaultValue
        let p = holder; //path
        if (p.includes('?(')) {
            d = p.takeAfter('?(').replace(/\)$/, '');
            p = p.takeBefore('?(');
        }

        p = p.replace(/^\@|\!$/g, '')
                .replace(/\[/g, '.')
                .replace(/\]/g, '')
                .replace(/\/$/, '')
                .replace(/^:/, '.');
                
        let v = data;
        if (p != '.') {
            let ps = p.split('.');        
            for (let i = 1; i < ps.length; i++) {
                if (v != null) {
                    v = v[ps[i]];
                }            
                else {
                    break;
                }
            }
        }

        if (v == null) {
            if (d != null) {
                v = d;
            }
        }

        if (v != null) {
            if (typeof(v) != 'string') {
                v = Json.toString(v);
            }
            content = content.$replace(holder, v.replace(/"/g, '&quot;'));            
        }
    });

    return content.$eval();
}

Span.prototype.load = function() {
    let span = this;  
    $cogo(this.data, this.element)
        .then(data => {            
            span.element.innerHTML = this.$represent(data);            
            span.loaded = true;
            Event.fire(span, 'onload', data);
        });
}

Span.prototype.reload = function() {
    let span = this;  
    $cogo(this.data, this.element)
        .then(data => {
            span.element.innerHTML = this.$represent(data);
            Event.fire(span, 'onreload', data);
        });
}

//new Template(element)
//template.load(data, path).asArray().append(func);

document.templates = new Object();
//页面上独立的template元素, 未检查之前初始值为-1
document.templates.$length = -1;
//独立的template是否都加载完成
document.templates.$loaded = false;

//parentName 内嵌模板的父级名称, null表示独立template
Template = function(element, container, parentName) {
    
    this.name = element.getAttribute('name') || 'Template_' + document.components.size; //必须有 name
    if (parentName != null) {
        this.name = parentName + ':' + this.name;
    }

    this.data = element.getAttribute('data') || '';
    element.removeAttribute('data');

    this.content = element.innerHTML.trim();
    this.$as = element.getAttribute('as') || 'object';
    this.var = element.getAttribute('var') || element.getAttribute('let');
    if (this.var == null) {
        this.var = {
            item: 'item',
            key: 'key',
            value: 'value'
        };
    }
    else if (this.var.includes(',')) {
        this.var = {
            item: 'item',
            key: this.var.takeBefore(',').trim(),
            value: this.var.takeAfter(',').trim()            
        };
    }
    else {
        this.var = {
            item: this.var.trim(),
            key: 'key',
            value: 'value'
        };
    }

    //pagination
    this.$page = $parseInt(element.getAttribute('page'), 0); //$page 是初始值
    this.page = this.$page; //page 是当前值
    this.increment = element.getAttribute('increment') || '';
    this.$offset = $parseInt(element.getAttribute('offset'), 0); //初始值
    this.offset = this.$offset; //当前值
    this.lazyLoad = $parseBoolean(element.getAttribute('lazy-load') || element.getAttribute('lazyLoad'), false);
        
    this.autoRefresh = $parseBoolean(element.getAttribute('auto-refresh') || element.getAttribute('autoRefresh'), false);
    this.interval = $parseFloat(element.getAttribute('interval'), 2);
    this.terminal = element.getAttribute('terminal') || 'false';
    this.deferral = 0; //延长次数, 默认延长3次, 不可设置
    this.clearOnRefresh = $parseBoolean(element.getAttribute('clear-on-refresh') || element.getAttribute('clearOnRefresh'), true);

    //中间变量
    this.vars = new Object();

    //一些配置或数据会保存在元素上
    this.ownerElement = element;
    if (container == null) {
        this.container = element;
        this.position = 'beforeBegin';
        this.setIrremovable(element.parentNode.children);        
    }
    else {
        this.container = container;
        this.position = 'beforeEnd';
        this.setIrremovable(container.children);
    }

    if (/(list|array|for|loop|collection)/i.test(this.$as)) {
        this.asArray();
    }    

    this.nodeName = 'TEMPLATE';
    this.tagName = 'TEMPLATE';
    document.tags.add('TEMPLATE');
    document.components.set(this.name, this);

    if (this.lazyLoad) {
        this.ownerElement.setAttribute('page', this.$page);
        this.ownerElement.setAttribute('offset', this.$offset);
        Template.listen(this.name, this.position == 'beforeBegin' ? element.parentNode : container); 
    }
    else if (this.autoRefresh && this.interval > 0) {
        this.resetRefresh();      
    }
}

Template.listen = function(name, element) {
    $x(window).bind(window.ontouchmove == null ? 'scroll' : 'touchmove', function(ev) {
        if($root.scrollTop() + $root.visibleHeight() >= $x(element).bottom() - 100) {            
            if (!$template(name).loading && !$template(name).done) {
                $template(name).append();
            }
        }
    });
}

Template.refresh = function(name, interval, terminal) {
    let refresher = window.setInterval(
        function() {            
            let template = $template(name);
            if (eval(terminal.$p())) {
                //再尝试3次, 有时会出现结束但仍有数据产生的情况
                if (template.deferral >= 3) {
                    //done
                    window.clearInterval(refresher);                  
                    template.done = true;
                    Event.execute(name, 'ondone');
                    template.deferral = 0;
                }
                else {
                    template.deferral ++;
                }
            }
            else {
                if (template.deferral > 0) {
                    template.deferral = 0;
                }

                if (template.clearOnRefresh) {
                    template.clear();    
                }
                template.append();
            }        
        }, interval * 1000);
}

//执行事件时call的对象
Template.prototype.owner = null;
//每次加载完成后触发
Template.prototype.onload = null; //function(data) { };
//仅每次增量加载完成后触发
Template.prototype.onlazyload = null; //function(data) { };
//所有数据加载完成之后触发
Template.prototype.ondone = null; //function() { };

//是否正在加载
Template.prototype.loading = false;
//是否已经到底了
Template.prototype.done = false;

Template.prototype.nonEmpty = function() {
    this.ownerElement.innerHTML.trim() != '';
}

Template.prototype.on = function(eventName, func) {
    $listen(this.name).on(eventName, func);
    return this;
}

Template.prototype.of = function(owner, ownerElement) {
    this.owner = owner;
    if (ownerElement != null) {
        this.ownerElement = ownerElement;
    }
    else if (owner.element != null) {
        this.ownerElement = owner.element;
    }
    return this;
}

Template.prototype.extend = function(ahead, latter) {
    if (ahead != null) {
        this.content = ahead + this.content;
    }
    if (latter != null) {
        this.content += latter;
    }
    return this;
}

Template.prototype.setContainer = function(container) {
    this.container = container;
    return this.setPosition('beforeEnd').setIrremovable(container.children);
}

Template.prototype.setPosition = function(position) {
    this.position = position;
    return this;
}

Template.prototype.setIrremovable = function(children) {
    //for (let child of element.parentNode.children) {   //旧一点浏览器不支持 children 的 of 遍历
    for (let i = 0; i < children.length; i++) {
        children[i].setAttribute('irremovable', '');
    }
    return this;
}

Template.prototype.$represent = function(data) {

    let content = this.content;

    //@: 表示整个数据
    //@:/ 表示根数据
    //@:key!
    //@:[0].key
    //@:key?(default)
    //@:key[0].name!

    [
        /@:([a-z_][a-z0-9_]*|\[\d+\])(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
        /@:([a-z_][a-z0-9_]*|\[\d+\])(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig,
        /@:\//g
    ].map(place => {
        let hs = content.match(place);
        return hs != null ? hs : [];        
    })
    .reduce((r1, r2) => r1.concat(r2))
    .distinct()
    .forEach(holder => {
        let d = null; //defaultValue
        let p = holder; //path
        if (p.includes('?(')) {
            d = p.takeAfter('?(').replace(/\)$/, '');
            p = p.takeBefore('?(');
        }

        p = p.replace(/^\@|\!$/g, '')
                .replace(/\[/g, '.')
                .replace(/\]/g, '')
                .replace(/\/$/, '')
                .replace(/^:/, '.');
                
        let v = data;
        if (p != '.') {
            let ps = p.split('.');        
            for (let i = 1; i < ps.length; i++) {
                if (v != null) {
                    v = v[ps[i]];
                }            
                else {
                    break;
                }
            }
        }

        if (v == null) {
            if (d != null) {
                v = d;
            }
        }

        if (v != null) {
            //array也是对象, 但基本数据类型数字、字符串、布尔不是对象
            if (v instanceof Array || v instanceof Object) {
                this.vars[p] = v;
                content = content.$replace(holder, '$template.' + this.name + p);
            }
            else {
                content = content.$replace(holder, v.replace(/"/g, '&quot;'));
            }
        }
    });

    return content.$eval();
}

Template.prototype.$eachOf = function(data) {
    //for object and eachOf
    let content = this.content;

    // @[name]
    // @[name/0/score]
    // @[0]?(default)    

    [
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\([^\(\)]*?\)/ig,
        /@([a-z_][a-z0-9_]*)(\.[a-z_][a-z0-9_]*|\[\d+\])*/ig,
        /@\[[a-z0-9_\/\.]+\]\?\([^\(\)]*?\)/ig,
        /@\[[a-z0-9_\/\.]+\]/ig
    ]
    .map(place => {
        let hs = content.match(place);
        return hs != null ? hs : [];        
    })
    .reduce((r1, r2) => r1.concat(r2))
    .distinct()
    .forEach(holder => {
        let d = null; //defaultValue
        let p = holder; //path
        if (p.includes('?(')) {
            d = p.takeAfter('?(').replace(/\)$/, '');
            p = p.takeBefore('?(');
        }

        p = p.replace(/^\@/g, '')
            .replace(/\[/g, '/')
            .replace(/\]/g, '')
            .replace(/\.$/, '')
            .replace(/\./g, '/');

        if (p.includes('/')) {

        }

        let n = p.includes('/') ? p.takeBefore('/') : p;
        if (n != '') {
            if (p.includes('/')) {
                p = p.takeAfter('/');
            }
            else {
                p = '';
            }
        }

        if ((n != '' && n == this.var.item) || n == '') {
            let v = p != '' ? Json.find(data, p) : data;
            if (v == null) {
                if (d != null) {
                    v = d;
                }
            }
            else {
                v = Json.toString(v);
            }
    
            if (v != null) {
                content = content.$replace(holder, v.replace(/"/g, '&quot;'));
            }
        }        
    });

    return content.$eval();
}

//each in
Template.prototype.$eachIn = function(key, value) {

    
    let content = this.content;

    // @key!
    // @value[0]
    // @value.name

    [
        /@[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*|\[\d+\])*\?\(.*?\)/ig,
        /@[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*|\[\d+\])*\!?/ig,
        /@[a-z_][a-z0-9_]*\!?/ig,
    ].forEach(place => {
        let hs = content.match(place);
        return hs != null ? hs : [];        
    })
    .reduce((r1, r2) => r1.concat(r2))
    .distinct()
    .forEach(holder => {
        let d = null; //defaultValue
        let p = holder; //path
        if (p.includes('?(')) {
            d = p.takeAfter('?(').replace(/\)$/, '');
            p = p.takeBefore('?(');
        }

        p = p.replace(/^\@/g, '')
            .replace(/\[/g, '/')
            .replace(/\]/g, '')
            .replace(/\.$/, '')
            .replace(/\./g, '/');

        let n = p.includes('/') ? p.takeBefore('/') : p;

        if (n.toLowerCase() == this.var.key) {
            content = content.$replace(holder, key);
        }
        else if (n.toLowerCase() == this.var.value) {
            let v = (p == '' ? value : Json.find(value, p));
            if (v == null) {
                if (d != null) {
                    v = d;
                }
            }
            else {
                v = Json.toString(v);
            }
            //null值也展示
            content = content.$replace(holder, v.replace(/"/g, '&quot;'));
        }
    });
    
    return content.$eval();
}

Template.prototype.load = function(data) {
    if (data != null) {
        this.data = data;
    }
    
    return this;
}

Template.prototype.asArray = function() {
    this.$as = 'array';    
    return this;
}

Template.prototype.asLoop = function() {
    return this.asArray();
}

Template.prototype.asList = function() {
    return this.asArray();
}

Template.prototype.asObject = function() {
    this.$as = 'object';
    return this;
}

Template.prototype.setPage = function(page) {
    this.page = page;
    if (this.ownerElement != null) {
        this.ownerElement.setAttribute('page', 0);
    }    
    return this;
}

Template.prototype.setOffset = function(offset) {
    this.offset = offset;
    return this;
}

Template.prototype.clear = function() {
    if (this.position == 'beforeBegin') {
        let children = this.container.parentNode.children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i].getAttribute('irremovable') == null) {
                children[i].remove();
            }
        }
    }
    else if (this.position == 'beforeEnd') {
        let children = this.container.children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i].getAttribute('irremovable') == null) {
                children[i].remove();
            }
        }
    }

    //分页回到初始值
    this.ownerElement.setAttribute('page', this.$page);
    this.page = this.$page;
    if (this.increment != '') {
        this.ownerElement.setAttribute('offset', this.$offset);
        this.offset = this.$offset;
    }
    this.done = false;

    return this;
}

Template.prototype.resetRefresh = function() {
    Template.refresh(this.name, this.interval, this.terminal);
    return this;
}

Template.prototype.append = function(func) {

    if (!this.loading) {
        this.loading = true;

        $TAKE(this.data, this.ownerElement, this, function(data) {

            if (!this.lazyLoad && !this.autoRefresh) {
                this.done = true;
            }

            //显示内容
            if (this.$as == 'array') {
                if (data instanceof Array) {
                    for (let item of data) {
                        this.container.insertAdjacentHTML(this.position, this.$eachOf(item));
                        if (this.increment != '') {
                            this.offset = Math.max(this.offset, $parseInt(Json.find(item, this.increment), 0));
                            this.ownerElement.setAttribute('offset', this.offset);
                        }
                    }

                    if (this.lazyLoad) {
                        if (data.length == 0) {
                            this.done = true;
                            Event.execute(this.name, 'ondone');
                        }
                    }

                    //即使不支持懒加载也会增加页码, 以保证手工加载正常
                    this.page++;
                    this.ownerElement.setAttribute('page', this.page);
                }
                else if (typeof(data) == 'object') {
                    for (let key in data) {
                        this.container.insertAdjacentHTML(this.position, this.$eachIn(key, data[key]));
                    }
                }
                else {
                    console.warn('no data to list or wrong type: ' + this.data);
                }
            }
            else {
                this.container.insertAdjacentHTML(this.position, this.$represent(data));
            }        

            if (document.templates.$length > 0) {
                document.templates.$length--;
                if (document.templates.$length == 0) {
                    document.templates.$loaded = true;
                }
            }

            Model.initializeForOrIf('TEMPLATE');
                      
            //当前值大于初始值为"增量加载"
            Event.execute(this.name, 'onload', data);
            if (this.page > this.$page) {
                Event.execute(this.name, 'onlazyload', data);
            }
            else {
                Event.execute(this.name, 'onload', data);
            }
            
            if (func != null) {
                if (typeof (func) == 'string') {
                    eval('_ = function() {' + func + '}').call(this.owner, data);
                }
                else if (typeof(func) == 'function') {
                    func.call(this.owner, data);
                }
            }

            this.loading = false;

            Template.reloadComponents();
        });
    }
}


//重载editor和其他组件
Template.reloadComponents = function() {
    [
        { class: 'Editor', method: 'reapplyAll' },
        { class: 'Button', method: 'initializeAll' },
        { class: '$root', method: 'initialize' }
    ].forEach(component => {
        if (window[component.class] != null) {
            window[component.class][component.method]();
        }
    });
}

$template = function(name) {
    let template = $t(name);
    if (template != null && template.tagName == 'TEMPLATE') {
        return template;
    }
    else {
        return null;
    }
}


$ready(function() {
    Model.initializeAll();
});