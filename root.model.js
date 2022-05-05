
//hide all <for> and <if>
$root.appendClass('model,set,for,if,elsif,else,o,template,chart { display: none; }');

document.models = new Object();
//待加载的model项, 为0时触发finish事件
document.models.$length = 0;
//页面上的所有model和相关标签是否都已经加载完成
document.models.$loaded = false;

Model = function(element) {
    this.name = element.getAttribute('name') || element.id || '';
    this.id = this.name;
    if (this.name == '') {
        throw new Error('Model "id" or "name" is required. It will be used to transfer data.');
    }    

    //加载之前的数据  
    this.data = element.getAttribute('data') || '';

    this.autoRefresh = $parseBoolean(element.getAttribute('auto-refresh') || element.getAttribute('autoRefresh'), false, this);
    this.interval = $parseFloat(element.getAttribute('interval'), 2000);
    this.terminal = element.getAttribute('terminal') || 'false';
    this.deferral = 0;

    this.sets = [];
    for (let set of element.querySelectorAll('set')) {
        let selector = set.getAttribute('$');
        if (selector == '') {
            throw new Error('Empty selector: ' + set);
        }
        else { 
            let attrs = new Map()
            set.getAttributeNames()
                .filter(a => a != '$' && a != 'if')
                .forEach(a => {
                    attrs.set(a, set.getAttribute(a));
                });

            if (set.innerHTML != '') {
                attrs.set('innerHTML', set.innerHTML);                
            }                

            this.sets.push({
                'target': selector, //选择器
                'attrs': attrs //原始数据
                //'if' : set.getAttribute('if') || 'true' //条件, 默认true
            });            
        }
    }

    //model标签
    this.element = element;

    this.nodeName = 'MODEL';
    this.tagName = 'MODEL';
    this.nodeType = 0;
    document.components.set(this.name, this);

    this.onload = element.getAttribute('onload'); //第一次加载完成后触发 //function(data) { }
    this.onreload = element.getAttribute('onreload'); //每次刷新后触发 //function(data) { }
    this.followers = new Set(); //当 model reload 时，这里面的对象跟着 reload

    Event.interact(this, element);

    if (this.autoRefresh) {
        this.refresh();
    }
}

Model.prototype.loaded = false;
Model.prototype.loading = false;
Model.prototype.timer = null;

Model.prototype.on = function(eventName, func) {
    Event.bind(this, eventName, func);
    return this;
}

Model.prototype.refresh = function() {
    let model = this;
    this.timer = window.setInterval(
        function() {            
            if (model.terminal.toBoolean(true, model)) {
                //延期3次才终止
                if (model.deferral >= 3) {
                    window.clearInterval(model.timer);
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

                model.reload();                    
            }
            
        }, model.interval);
}

//first
Model.prototype.load = function(data) {

    if (data != null) {
        this.data = data;
    }

    this.loading = true;
    
    $TAKE(this.data, this.element, this, function(data) {
        //save data
        window[this.name + '$'] = data;

        this.$set(data);

        this.loaded = true;
        this.loading = false;

        //onload
        Event.execute(this, 'onload', data);

        if (document.models.$length > 0) {
            //first load        
            document.models.$length--;
            if (document.models.$length == 0) {
                Model.initializeNext('ALL MODEL LOADED');
            }
        }
    });
}

Model.prototype.reload = function() {
    if (this.loaded && !this.loading) {
        this.loading = true;
        $TAKE(this.data, this.element, this, function(data) {
            window[this.name + '$'] = data;
            this.followers.forEach(follower => $s(follower)?.reload?.());
            $model(this.name).$set(data);            
            //Model.initializeNext('A MODEL RELOAD');
            Event.execute(this, 'onreload', data);
            this.loading = false;
        });      
    }
}

PlaceHolder = function(holder) {
    this.holder = holder;
    this.name = null;
    this.defaultValue = null;
    this.path = null;
    this.paths = null;
}

PlaceHolder.getModelHolders = function(content) {
    return /@([a-z_]\w*)(\.\w+|\[-?\d+\]|\[\S+?\]|\|\S+?\|)*(\?\([^\(\)]*?\))?\!?/ig.findAllIn(content);
}

PlaceHolder.getOwnHolders = function(content) {
    return [/@:\//g, /@:([a-z_]\w*)?(\.\w+|\[-?\d+\]|\[\S+?\]|\|\S+?\|)*(\?\([^\(\)]*?\))?\!?/ig, /^\|\S+?\|$/g]
                .map(place => content.match(place) ?? [])
                .reduce((r1, r2) => r1.concat(r2))
                .distinct()
}

PlaceHolder.getLoopHolders = function(content) {
    return /@([a-z_]\w*)?(\.\w+|\[-?\d+\]|\[\S+?\]|\|\S+?\|)*(\?\([^\(\)]*?\))?\!?/ig.findAllIn(content);
}

PlaceHolder.prototype.analyze = function() {
    this.path = this.holder.replace(/\!$/, ''); //this is holder
    if (this.path.includes('?(')) {
        this.defaultValue = this.path.takeAfter('?(').replace(/\)$/, '');
        this.path = this.path.takeBefore('?(');
    }

    this.path = this.path.replace(/^\@|\!$/g, '')
         .replace(/\[/g, '.')
         .replace(/\]/g, '')
         .replace(/\//g, '.')
         .replace(/:/g, '.')
         .replace(/\|\./g, '.')
         .replace(/\|$/, '.')
         .replace(/\|/g, '.|')
         .replace(/\.\./g, '.')
         .replace(/\.$/, '');
            
    this.stones = this.path.split('.');
    this.name = this.stones[0];
    
    return this;
}

PlaceHolder.prototype.place = function(data) {
    if (this.name == null) {
        this.analyze();
    }

    let v = data;
    for (let i = 1; i < this.stones.length; i++) {
        if (v != null) {
            let a = this.stones[i]; //a = attribute
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
            else if (/^-\d+$/.test(a) && v instanceof Array) {
                v = v[eval(v.length + a).ifNegative(0)];
            }
            else {
                v = v[a];
            }  
        }            
        else {
            break;
        }
    }

    if (v == null && this.defaultValue != null) {
        v = this.defaultValue;
    }

    if (typeof(v) == 'string') {
        //处理数据中的双引号, Json 解析时对自动转换
        v = v.replace(/"/g, '&quot;')
    }

    return v;
}

//从 data 中加载数据
String.prototype.placeData = function(data) {
    
    let content = this.toString();

    //占位符规则与 TEMPLATE 相同
    //@:/ 表示根数据
    //@:key!
    //@:[0].key
    //@:key?(default)
    //@:key[0].name!

    PlaceHolder.getOwnHolders(content)
        .forEach(holder => {
            let v = new PlaceHolder(holder).place(data);
            if (v != null) {
                content = content.replaceAll(holder, Json.toString(v));
            }
        });

    return content;
    //没有 evalJsExpression 是因为后面一般跟 .$p() 或整个 content 是一个占位符
}

String.prototype.placeItemData = function(data) {

    let content = this.toString();

    PlaceHolder.getLoopHolders(content)
        .forEach(holder => {
            let v = new PlaceHolder(holder).place(data);
            if (v != null) {
                content = content.replaceAll(holder, v);
            }
        });

    return content.evalJsExpression(data);
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

        for (let set of this.sets) {            
            for (let [attr, content] of set.attrs) {
                if (content != null) {
                    PlaceHolder.getModelHolders(content)
                        .concat(PlaceHolder.getOwnHolders(content))
                        .forEach(holder => {
                            let ph = new PlaceHolder(holder).analyze();
                            let v = ph.place(ph.name != '' ? window[ph.name + '$'] : data);
                            if (v != null) {
                                content = content.replaceAll(holder, Json.toString(v));
                            }
                        });

                    let target = $s(set.target);
                    if (target != null) {
                        $root.__$attr(target, attr, content.evalJsExpression(data));
                    }
                    else {
                        console.error('Incorrect selector ' + set.target + ' or element does not exists.');
                    }
                }
            }            
        }                
    }            
}

Model.$ForOrIf = function(tag) {
    //选择未被加载并且不在template模板中的for或if标签
    for (let t of document.querySelectorAll(tag)) {
        if (t.getAttribute('interpreting') == null) {
            let incubating = false;
            let p = t.parentNode;
            while (!incubating) {
                if (p == null || p.nodeName == 'BODY' || p.nodeName == 'HTML') {
                    break;
                }
                else if ('TEMPLATE,TEXT,TIP,CAP,GAP,LAP,FOR,IF'.includes(p.nodeName)) {
                    incubating = true;
                    break;
                }
                else if ('TABLE,SELECT'.includes(p.nodeName)) {
                    if (p.hasAttribute('data') && !p.hasAttribute('loaded')) {
                        incubating = true;
                        break;
                    }
                }
                p = p.parentNode;
            }

            if (!incubating) {
                t.setAttribute('interpreting', '');
                return t;
            }
        }
    }

    return null;
}

//属性增强
Model.boostPropertyValue = function(element, properties = '') {
    element.getAttributeNames()
        .filter(a => a.endsWith('+') && !a.startsWith('on'))
        .forEach(name => {        
            let before = name != 'html+' ? element.getAttribute(name) : element.innerHTML;
            let after;
            if (before.includes('@')) {
                after = before.placeModelData().$p(element);
            }
            else {
                after = before.$p(element);
            }
            let origin = name.dropRight(1);
            if (origin == 'html') {
                origin = 'innerHTML';
            }

            if (element[origin] !== undefined && !properties.includes(origin)) {
                element[origin] = after;
            }
            else {
                element.setAttribute(origin, after);
            }
            //element.removeAttribute(name);        
        });
}

Model.output = function(o) {
    if (!o.hasAttribute('data')) {
        if (o.innerHTML.startsWith('@')){
            //从model加载
            o.parentNode.insertBefore(document.createTextNode(o.innerHTML.placeModelData().$p()), o);
            o.remove();
        }
        else {
            $cogo(o.innerHTML, o)
                .then(data => {                           
                    o.parentNode.insertBefore(document.createTextNode(data), o);
                    o.remove();
                });
        }        
    }
    else {
        //同 span 规则
        $cogo(o.getAttribute('data'), o)
            .then(data => {
                o.parentNode.insertBefore(document.createTextNode(o.innerHTML.placeModelData().placeData(data).$p()), o);
                o.remove();
            });
    }
}

Model.initializeNext = function(from) {

    if (!document.models.$loaded) {            
        if (!HTMLTemplateElement._loaded) {
            //model加载完成并且页面上的for和if加载已完成, -1表示还未进行standalone检查
            if (HTMLTemplateElement._length == -1) {
                Model.initializeStandaloneTemplates();
            }                
        }
        else {
            //find first for/if
            let next = Model.$ForOrIf('FOR,IF,[if]');
            if (next == null) {
                //所有加载完成
                document.models.$loaded = true;
                Event.execute('$global', 'onpost');
                Event.execute('$global', 'onload');

                //<o> 标签 = output
                for (let o of $a('o')) {
                    Model.output(o);                    
                }

                for (let span of $a('span[data],span[editable]')) {
                    if (!span.hasAttribute('root-span')) {
                        span.setAttribute('root-span', '');
                        Model.boostPropertyValue(span);
                        span.initialize();
                    }
                }
            }
            else {
                if (next.nodeName == 'FOR') {
                    new For(next).load();
                }
                else {
                    new If(next).load();
                }
            }
        }            
    }
    //model已经加载完
    //页面上的for和if已经加载完
    //开始加载templates
    //template已加载完 
    //结束加载templates
}

Model.initializeStandaloneTemplates = function() {
    let templates = document.querySelectorAll('template[data]');
    HTMLTemplateElement._length = templates.length;
    if (templates.length > 0) {
        for (let template of templates) {            
            template.initialize();
        }
    }
    else {
        HTMLTemplateElement._loaded = true;
        Model.initializeNext('NO STANDALONE TEMPLATE TO LOAD');
    }
}

Model.initializeAll = function() {
    let models = document.querySelectorAll('model');
    if (models.length > 0) {
        document.models.$length = models.length;
        for (let model of models) {
            new Model(model).load();
        }
    }
    else {
        Model.initializeNext('NO MODEL TO LOAD');
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
        this.var = this.var.split(',').map(r => r.trim());
    }
    this.in = element.getAttribute('in') || element.getAttribute('data') || '';

    this.element = element;
    this.content = element.innerHTML;
    this.container = element.getAttribute('container') || element;
    this.isFOR = element.nodeName == 'FOR'; //可以把其他元素作为 For 元素使用
    this.position = this.isFOR ? 'beforeBegin' : 'beforeEnd';
    if (typeof(this.container) == 'string') {
        this.container = $s(this.container);
        if (this.container == null) {
            throw new Error("Can't find element or wrong selector: " + element.getAttribute('container'));
        }
        this.position = 'beforeEnd';
    }

    if (!this.isFOR) {
        this.element.innerHTML = '';
    }

    this.onload = element.getAttribute('onload');

    Event.interact(this, element);
}

//所属的对象, 如 select 可以当作 for 使用
For.prototype.owner = null;
//第一次加载完成后触发
For.prototype.onload = null; //function(data) { }
For.prototype.data = null; //当次加载解析后的数据

For.prototype.load = function(data) {

    this.data = data ?? this.in;

    //in="url" in="[a, b, c]" in="{result/data}" in="0 to 9"
    if (typeof(this.data) == 'string') {
        if (/^(\d+)\s+to\s+(\d+)$/i.test(this.in)) {
            let m = /^(\d+)\s+to\s+(\d+)$/i.exec(this.data);
            let s = m[1].toInt();
            let t = m[2].toInt();
            this.data = [];
            if (s < t) {
                for (let i = s; i <= t; i++) {
                    this.data.push(i);
                }
            }
            else if (s > t) {
                for (let i = s; i >= t; i--) {
                    this.data.push(i);
                }
            }
            else {
                this.data.push(s);
            }
        }
        else if (this.data.startsWith('$template.')) {
            let name = this.data.takeAfter('.'); //templateName
            if (name.includes('.')) {
                this.data = $(name.takeBefore('.')).vars['.' + name.takeAfter('.')];
            }
            else {
                this.data = $(name).vars[''];
            }            
        }
    }

    $TAKE(this.data, this.element, this, function(data) {
        if (typeof(this.data) == 'string') {
            this.data = data;
        }

        if (data instanceof Array) {
            this.container.insertAdjacentHTML(this.position, this.$eachOf(data));
        }
        else if (typeof (data) == 'object') {
            this.container.insertAdjacentHTML(this.position, this.$eachIn(data));
        }
        else {
            throw new Error('Wrong collection data in FOR loop: ' + this.data);
        }       
        
        if (this.onload != null) {
            Event.fire(this, 'onload', data);
        }  

        if (this.isFOR) {
            this.element.remove();
        }
        else {            
            this.element.removeAttribute('interpreting');
        }

        Model.initializeNext('A FOR LOADED');
    });

    return this;
}


For.prototype.$eachOf = function(data) {
    
    let html = [];

    // @item
    // @item.key!
    // @item.key[0]
    // @item[1].key

    // @[key]
    // @[0]

    let holders = PlaceHolder.getLoopHolders(this.content);

    for (let item of data) {
        let content = this.content;
        holders.forEach(holder => {
            let ph = new PlaceHolder(holder).analyze();
            if (ph.name == '' || ph.name == (this.var || 'item')) {
                let v = ph.place(item);
                if (v != null) {
                    content = content.replaceAll(holder, Json.toString(v));
                }
            }
        });

        html.push(content.evalJsExpression(item));
    }

    return html.join('');
}

// { a:1, b:2 }  @key, @(key), @value?(defaultValue), @value[path]?(defaultValue)
// 'key' and 'value' is reserved keyword
//name = var/let
For.prototype.$eachIn = function(data) {

    let html = [];
    // 'key' and 'value' is reserved keyword
    // @key!
    // @value    
    // @value[0]
    // @value.property?(default)

    let holders = PlaceHolder.getLoopHolders(this.content);

    //$key, $value - 键和值的变量名称
    //key, value - 键和值对应的值
    let $key = 'key';
    let $value = 'value';
    if (this.var instanceof Array) {
        if (this.var.length > 0) {
            $key = this.var[0];
        }
        if (this.var.length > 1) {
            $value = this.var[1];
        }
    }
    else if (typeof(this.var) == 'string') {
        if (this.var != '') {
            $key = this.var;
        }
    }

    for (let key in data) {
        let content = this.content;
        let value = data[key];

        holders.forEach(holder => {
            let ph = new PlaceHolder(holder).analyze();
            if ($key == 'key' ? /^(key|name)$/i.test(ph.name) : ph.name == $key) {
                content = content.replace(holder, key);            
            }
            else if ($value == 'value' ? /^value$/i.test(ph.name) : ph.name == $value) {
                let v = ph.place(value);
                //null值也输出
                content = content.replaceAll(holder, Json.toString(v));
            }
        });
        
        html.push(content.evalJsExpression(value));
    }
    
    return html.join('');    
}

// <if test="boolean expression">
//      html code
// <else-if test="boolean expression">
//      html code
// <else>
//      html code
// </if>

// $if('name').on(event, func).load();

If = function(element) {

    this.if = element;
    this.isIF = element.nodeName == 'IF';

    if (this.isIF) {
        this.elsif = element.querySelectorAll('else-if,elsif,elseif');
        this.else = element.querySelector('else');
    }
    else {
        this.elsif = [];
        this.else = null;
        
        let next = this.if.nextElementSibling;
        while (next != null) {
            if (next.hasAttribute('else-if') || next.hasAttribute('elseif') || next.hasAttribute('elsif')) {
                this.elsif.push(next);
            }
            else if (next.hasAttribute('else')) {
                this.else = next;
                break;
            }
            else {
                break;
            }
            next = next.nextElementSibling;
        }
    }
    this.result = false;    

    this.onload = element.getAttribute('onload');
    this.onreturntrue = element.getAttribute('onreturntrue');
    this.onreturnfalse = element.getAttribute('onreturnfalse');

    Event.interact(this, element);
}

If.prototype.load = function() {

    let content = '';
    let test = this.if.getAttribute('test') || this.if.getAttribute('if') || 'false';

    if (this.isIF) {
        if (test.toBoolean(true, this.if)) {
            content = this.if.innerHTML.evalJsExpression();
            this.result = true;
        }
        else {
            if (this.elsif.length > 0) {
                for (let i = 0; i < this.elsif.length; i++) {
                    test = this.elsif[i].getAttribute('test') || 'false';
                    if (test.toBoolean(true, this.elsif[i])) {
                        content = this.elsif[i].innerHTML.evalJsExpression();
                        this.result = true;
                        break;
                    }
                }
            }

            if (!this.result && this.else != null) {
                content = this.else.innerHTML.evalJsExpression();
                this.result = true;
            }
        }

        let $els = /<(else|else-if|elseif|elsif)\b/i;
        if ($els.test(content)) {
            content = content.substring(0, content.indexOf($els.exec(content)[0])).trim();
        }

        this.if.insertAdjacentHTML('beforeBegin', content);
    }
    else {
        if (test.toBoolean(true, this.if)) {
            this.result = true;            
        }
        else {
            this.if.remove();                  
        }

        if (this.elsif.length > 0) {
            for (let i = 0; i < this.elsif.length; i++) {
                if (this.result) {
                    this.elsif[i].remove();
                }
                else {
                    test = this.elsif[i].getAttribute('else-if') || this.elsif[i].getAttribute('elseif') || this.elsif[i].getAttribute('elsif');
                    if (test.toBoolean(true, this.elsif[i])) {
                        this.elsif[i].removeAttribute('else-if');
                        this.elsif[i].removeAttribute('elseif');
                        this.elsif[i].removeAttribute('elsif');
                        this.result = true;
                    }
                    else {
                        this.elsif[i].remove();
                    }
                }            
            }
        }      

        if (this.else != null) {
            if (this.result) {
                this.else.remove();
            }
            else {
                this.else.removeAttribute('else');
            }
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

    if (this.isIF) {
        this.if.remove();
    }
    else {
        this.if.removeAttribute('if');
        this.if.removeAttribute('interpreting');
    }

    Model.initializeNext('AN IF LOAD');
}

//在替换完占位符之后再执行js表达式
String.prototype.evalJsExpression = function(data) {

    let content = this.toString();

    let hasForHolders = function (expression) {
        // @hello, @[hello]
        return /@[a-z_][a-z0-9_]*/i.test(expression) || /@\[[^\[\]]+?\]/i.test(expression);
    };

    //~{{complex expression}}
    //must return a value    
    /\~?\{\{([\s\S]+?)\}\}/g.findAllIn(content)
        .forEach(holder => {
            if (!hasForHolders(holder)) {
                content = content.replace(holder, eval('_ = function(data) { ' + holder.drop('~').trimPlus('{{', '}}').decode() + ' }').call(null, data));
            }
        });

    //~{simple expression}
    /\~?\{([\s\S]+?)\}/g.findAllIn(content)
        .forEach(holder => {
            if (!hasForHolders(holder)) {
                content = content.replace(holder, eval('_ = function(data) { return ' + holder.drop('~').trimPlus('{', '}').decode() + '; }').call(null, data));
            }
        });

    return content;
}

$enhance(HTMLSpanElement.prototype)
    .declare({
        data: '',
        await: '',
        copyText: '',

        onload: null,
        onreload: null
    });

HTMLSpanElement.prototype.loaded = false;
HTMLSpanElement.prototype.content = null;
HTMLSpanElement.prototype.input = null;

HTMLSpanElement.prototype.load = function() {
    $TAKE(this.data, this, this, function(data) {
        this.innerHTML = this.content.placeModelData(this.id).placeData(data).$p(this);
        if (!this.loaded) {
            this.loaded = true;
            Event.fire(this, 'onload', data);
        }
        else {
            Event.fire(span, 'onreload', data);
        }
    });
}


HTMLSpanElement.prototype.reload = function() {
    this.load();
}

HTMLSpanElement.prototype.copy = function() {
    this.insertAdjacentElement('afterEnd', $create('INPUT', { value: this.textContent }));
    this.nextElementSibling.select();
    document.execCommand('Copy');
    this.nextElementSibling.remove();
    Callout(this.copyText || ($root.lang == 'zh' ? '已复制。' : 'Copied.')).position(this, 'up').show(3);
}

HTMLSpanElement.prototype.initialize = function() {
    if (this.data != '') {
        this.content = this.innerHTML;
        if (this.await == '') {
            this.load();
        }
        else {
            Event.await(this, this.await);
        }
    }
    else if (this.innerHTML.includes('@')) {
        this.innerHTML = this.innerHTML.placeModelData().$p(this);
    }
    else {
        this.innerHTML = this.innerHTML.$p(this);
    }

    Event.interact(this, this);
}

HTMLTemplateElement._length = -1;
HTMLTemplateElement._loaded = false;

$enhance(HTMLTemplateElement.prototype)
    .declare({
        name: '',

        data: '',

        increment: '',
        lazyLoad: false,
        autoRefresh: false,
        interval: 2000,
        terminal: 'false',
        clearOnRefresh: true
    })
    .extend('onload', 'onreload', 'onlazyload', 'ondone', 'onteminate')
    .define({
        'content': {
            get() {
                if (this._content == null) {
                    this._content = this.innerHTML.trim();
                }
                return this._content;
            },
            set(content) {
                this._content = content;
            }
        },
        'var': {
            get() {
                if (this._var == null) {
                    this.var = this.getAttribute('var') ?? this.getAttribute('let') ?? '';
                }
                return this._var;
            },
            set(vs) {
                if (this._var == null) {
                    this._var = {
                        item: 'item',
                        key: 'key',
                        value: 'value'
                    };
                }

                if (vs.includes(',')) {
                    this._var.key = vs.takeBefore(',').trim();
                    this._var.value = vs.takeAfter(',').trim();                    
                }
                else if (vs != '') {
                    this._var.item = vs.trim();                    
                }
            }
        },
        'as': {
            get() {
                let as = (this.getAttribute('as') || 'object').trim().toLowerCase();
                if (as != 'object') {
                    if (/^(list|for|loop)$/.test(as)) {
                        as = 'array';
                    }
                    if (as != 'array') {
                        as = 'object';
                    }
                }
                return as;
            },
            set(as) {
                this.setAttribute('as', as);
            }
        },
        'initPage': {
            get() {
                return $parseInt(this.getAttribute('page') ?? this.getAttribute('init-page'), 0);
            },
            set(page) {
                this.setAttribute('page', page);
            }
        },
        'page': {
            get() {
                if (this._page == -1) {
                    this._page = this.initPage;
                }
                return this._page;
            },
            set(page) {
                this._page = page;
            }
        },
        'initOffset': {
            get() {
                return $parseInt(this.getAttribute('offset') ?? this.getAttribute('init-offset'), 0);
            },
            set(offset) {
                this.setAttribute('offset', offset);
            }
        },
        'offset': {
            get() {
                if (this._offset == -1) {
                    this._offset = this.initOffset;
                }
                return this._offset;
            },
            set(offset) {
                this._offset = offset;
            }
        }
    });

HTMLTemplateElement.prototype._content = null;
HTMLTemplateElement.prototype._var = null;
HTMLTemplateElement.prototype._page = -1;
HTMLTemplateElement.prototype._offset = -1;
HTMLTemplateElement.prototype._deferral = 0; //延长次数, 默认延长3次, 不可设置

HTMLTemplateElement.prototype.vars = null; //中间变量
HTMLTemplateElement.prototype.container = null; //容器元素
HTMLTemplateElement.prototype.position = 'beforeBegin';

HTMLTemplateElement.prototype.loading = false; //是否正在加载
HTMLTemplateElement.prototype.loaded = false; //是否第一次加载已完成
HTMLTemplateElement.prototype.done = false; //是否已经到底了
HTMLTemplateElement.prototype.empty = true; //加载的数据是否为空

HTMLTemplateElement.prototype.owner = null; //非独立模板的主元素，执行事件时call的对象

HTMLTemplateElement.prototype.initialize = function(container) {

    if (this.name == '') {
        if (this.id != '') {
            this.name = this.id;
        }
        else {
            this.name = 'Tempalte_' + document.components.size;
        }
    }
    if (this.id == '') {
        this.id = this.name;
    }
    
    this.vars = new Object();

    if (container == null) {
        this.container = this;
        this.position = 'beforeBegin';
        this.setIrremovable(this.parentNode.children);
    }
    else {
        this.container = container;
        this.position = 'beforeEnd';
        this.setIrremovable(container.children);
    }

    if (this.lazyLoad) {
        HTMLTemplateElement.listen(this, this.position == 'beforeBegin' ? this.parentNode : this.container);
    }
    else if (this.autoRefresh && this.interval > 0) {
        this.refresh();      
    }
    else {
        this.load();
    }

    Event.interact(this, this);
}

HTMLTemplateElement.listen = function(template, element) {
    window.on(window.ontouchmove == null ? 'scroll' : 'touchmove', function(ev) {
        if($root.scrollTop + $root.visibleHeight >= element.bottom - 100) {            
            if (!template.loading && !template.done) {
                template.load();
            }
        }
    });
}

HTMLTemplateElement.prototype.of = function(owner) {
    this.owner = owner;
    return this;
}

HTMLTemplateElement.prototype.extend = function(ahead, latter) {
    if (ahead != null) {
        this.content = ahead + this.content;
    }
    if (latter != null) {
        this.content += latter;
    }
    return this;
}

HTMLTemplateElement.prototype.setContainer = function(container) {
    this.container = container;
    return this.setPosition('beforeEnd').setIrremovable(container.children);
}

HTMLTemplateElement.prototype.setPosition = function(position) {
    this.position = position;
    return this;
}

HTMLTemplateElement.prototype.setIrremovable = function(children) {
    //for (let child of element.parentNode.children) {   //旧一点浏览器不支持 children 的 of 遍历
    for (let i = 0; i < children.length; i++) {
        children[i].setAttribute('irremovable', '');
    }
    return this;
}

HTMLTemplateElement.prototype.$represent = function(data) {

    let content = this.content;

    //@: 表示整个数据
    //@:/ 表示根数据
    //@:key!
    //@:[0].key
    //@:key?(default)
    //@:key[0].name!

    PlaceHolder.getOwnHolders(content)
        .forEach(holder => {
            let ph = new PlaceHolder(holder).analyze();
            let v = ph.place(data);
            if (v != null) {
                //array 也是对象, 但基本数据类型数字、字符串、布尔不是对象
                if (v instanceof Array || v instanceof Object) {
                    this.vars[ph.path] = v;
                    content = content.replaceAll(holder, '$template#' + this.id + ph.path);
                }
                else {
                    content = content.replaceAll(holder, v);
                }
            }
        });

    return content.evalJsExpression(data);
}

HTMLTemplateElement.prototype.$eachOf = function(data) {

    if (this.page == this.initPage) {
        this.empty = data.length == 0;
    }

    let html = [];
    // @[name]
    // @[name/0/score]
    // @[0]?(default)    
    let holders = PlaceHolder.getLoopHolders(this.content);

    for (let item of data) {
        let content = this.content;
        holders.forEach(holder => {
            let ph = new PlaceHolder(holder).analyze();    
            if ((ph.name != '' && ph.name == this.var.item) || ph.name == '') {
                let v = ph.place(item);        
                if (v != null) {
                    content = content.replaceAll(holder, Json.toString(v));
                }
            }        
        });
    
        html.push(content.evalJsExpression(item));

        if (this.increment != '') {
            this.offset = Math.max(this.offset, $parseInt(Json.find(item, this.increment), 0));
        }
    }
   
    return html.join('');
}

//each in
HTMLTemplateElement.prototype.$eachIn = function(data) {

    if (this.page == this.initPage) {
        this.empty = Object.keys(data).length == 0;
    }

    let html = [];
    // @key!
    // @value[0]
    // @value.name
    let holders = PlaceHolder.getLoopHolders(this.content);

    for (let key in data) {
        let value = data[key];
        let content = this.content;

        holders.forEach(holder => {
            let ph = new PlaceHolder(holder).analyze();
            if (ph.name.toLowerCase() == this.var.key) {
                content = content.replaceAll(holder, key);
            }
            else if (ph.name.toLowerCase() == this.var.value) {
                let v = (ph.path == ph.name ? value : ph.place(value));
                //null值也展示
                content = content.replaceAll(holder, Json.toString(v));
            }
        });
        
        html.push(content.evalJsExpression(value));
    }

    return html.join('');
}

HTMLTemplateElement.prototype.setData = function(data) {
    if (data != null) {
        this.data = data;
    }    
    return this;
}

HTMLTemplateElement.prototype.asArray = function() {
    this.as = 'array';    
    return this;
}

HTMLTemplateElement.prototype.asLoop = function() {
    return this.asArray();
}

HTMLTemplateElement.prototype.asList = function() {
    return this.asArray();
}

HTMLTemplateElement.prototype.asObject = function() {
    this.as = 'object';
    return this;
}

HTMLTemplateElement.prototype.setPage = function(page) {
    this.page = page;
    return this;
}

HTMLTemplateElement.prototype.setOffset = function(offset) {
    this.offset = offset;
    return this;
}

HTMLTemplateElement.prototype.clear = function() {
    if (this.position == 'beforeBegin') {
        let children = this.container.parentNode.children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (!children[i].hasAttribute('irremovable')) {
                children[i].remove();
            }
        }
    }
    else if (this.position == 'beforeEnd') {
        let children = this.container.children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (!children[i].hasAttribute('irremovable')) {
                children[i].remove();
            }
        }
    }

    //分页回到初始值
    this.page = this.initPage;
    if (this.increment != '') {
        this.offset = this.initOffset;
    }
    this.done = false;

    return this;
}

HTMLTemplateElement.prototype.refresh = function() {
    let template = this;
    let refresher = window.setInterval(
        function() {                        
            if (template.terminal.toBoolean(false, template)) {
                //再尝试3次, 有时会出现结束但仍有数据产生的情况
                if (template._deferral < 3) {
                    if (template._deferral == 0) {
                        Event.execute(template, 'onterminate');
                    }
                    template._deferral ++;
                }
                else {
                    //done
                    window.clearInterval(refresher);                  
                    template.done = true;
                    Event.execute(template, 'ondone');
                    template._deferral = 0;
                }
            }
            else {
                if (template._deferral > 0) {
                    template._deferral = 0;
                }

                template.reload();
            }        
        }, template.interval);
    return this;
}

HTMLTemplateElement.prototype.reload = function() {
    if (this.clearOnRefresh) {
        this.clear();
    }
    this.load();
}

HTMLTemplateElement.prototype.load = function(func) {

    if (!this.loading) {
        this.loading = true;

        $TAKE(this.data, this, this, function(data) {

            if (!this.lazyLoad && !this.autoRefresh) {
                this.done = true;
            }

            //显示内容
            if (this.as == 'array') {
                if (data instanceof Array) {
                    this.container.insertAdjacentHTML(this.position, this.$eachOf(data));

                    if (this.lazyLoad) {
                        if (data.length == 0) {
                            this.done = true;
                            Event.execute(this, 'ondone');
                        }
                    }

                    //即使不支持懒加载也会增加页码, 以保证手工加载正常
                    this.page ++;
                }
                else if (typeof(data) == 'object') {                    
                    this.container.insertAdjacentHTML(this.position, this.$eachIn(data));
                }
                else {
                    console.warn('no data to list or wrong type: ' + this.data);
                }
            }
            else {
                this.container.insertAdjacentHTML(this.position, this.$represent(data));
            }        

            if (HTMLTemplateElement._length > 0) {
                HTMLTemplateElement._length --;
                if (HTMLTemplateElement._length == 0) {
                    HTMLTemplateElement._loaded = true;
                }
            }
                     
            //当前值大于初始值为"增量加载" 
            if (this.page > this.initPage + 1) {
                Event.execute(this, 'onlazyload', data);
            }
            else if (this.loaded) {
                Event.execute(this, 'onreload', data);
            }
            else {
                this.loaded = true;
                Event.execute(this, 'onload', data);
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

            Model.initializeNext('A TEMPLATE LOADED');
            HTMLTemplateElement.reloadComponents(this);
        });
    }
}

//重载editor和其他组件
HTMLTemplateElement.reloadComponents = function(container) {
    [
        { class: '$editor', method: 'reapplyAll' },
        { class: 'HTMLAnchorElement', method: 'initializeAll' },
        { class: 'HTMLButtonElement', method: 'initializeAll' },
        { class: 'HTMLInputElement', method: 'initializeAll' },
        { class: 'Select', method: 'initializeAll' },
        { class: '$root', method: 'initialize' }
    ].forEach(component => {
        window[component.class]?.[component.method]?.(container);
    });
}

document.on('ready', function() {
    Model.initializeAll();
});