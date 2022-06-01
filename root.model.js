
//hide all <for> and <if>
$root.appendClass('model,set,for,if,elsif,else-if,elseif,else,o,template,chart { display: none; }');

$model = { };

class HTMLModelElement extends HTMLCustomElement {
    constructor(element) {
        super(element);

        if (!this.hasAttribute('name')) {
            this.setAttribute('name', this.id || 'Model_' + String.shuffle(7));
        }
        if (this.id == '') {
            this.id = this.name;
        }

        this.data = this.getAttribute('data') ?? '';

        this.autoRefresh = $parseBoolean(element.getAttribute('auto-refresh'), false, this);
        this.interval = $parseFloat(element.getAttribute('interval'), 2000);
        this.terminal = element.getAttribute('terminal') ?? 'false';
        this.deferral = 0;

        for (let set of element.querySelectorAll('set')) {
            let selector = set.getAttribute('$');
            if (selector == '') {
                throw new Error('Empty selector: ' + set);
            }
            else { 
                let attrs = new Map()
                set.getAttributeNames()
                    .filter(a => a != '$')
                    .forEach(a => {
                        attrs.set(a, set.getAttribute(a));
                    });
    
                if (set.innerHTML != '') {
                    attrs.set('innerHTML', set.innerHTML);                
                }                
    
                this.#sets.push({
                    'target': selector, //选择器
                    'attrs': attrs //原始数据
                });            
            }
        }

        this.onload = element.getAttribute('onload'); //第一次加载完成后触发 //function(data) { }
        this.onreload = element.getAttribute('onreload'); //每次刷新后触发 //function(data) { }

        Event.interact(this, this.element);

        if (this.autoRefresh) {
            this.refresh();
        }
    }

    data = null;

    get name() {
        return this.getAttribute('name');
    }

    autoRefresh = false;
    interval = 0;
    terminal = 'false';
    #deferral = 0;
    
    #sets = [];

    onload = null;
    onreload = null;

    followers = new Set(); //当 model reload 时，这里面的对象也同时 reload

    #loaded = false;
    #loading = false;
    #timer = null;

    #refresh = function() {
        let model = this;
        this.#timer = window.setInterval(
            function() {            
                if (model.terminal.toBoolean(true, model)) {
                    //延期3次才终止
                    if (model.#deferral >= 3) {
                        window.clearInterval(model.#timer);
                        model.#deferral = 0;
                    }
                    else {
                        model.#deferral ++;
                    }
                }
                else {
                    //reset
                    if (model.#deferral > 0) {
                        model.#deferral = 0;
                    }
    
                    model.reload();                    
                }
                
            }, model.interval);
    }

    load(data) {

        if (data != null) {
            this.data = data;
        }
    
        this.#loading = true;
        
        $TAKE(this.data, this.element, this, function(data) {
            //save data
            $model[this.name] = data;
    
            this.#set(data);
    
            this.#loaded = true;
            this.#loading = false;
    
            //onload
            this.dispatch('onload', {'data': data});
    
            if (HTMLModelElement._modelCount > 0) {
                //first load        
                HTMLModelElement._modelCount --;
                if (HTMLModelElement._modelCount == 0) {
                    HTMLModelElement.initializeNext('ALL MODEL LOADED');
                }
            }
    
            if (this.autoRefresh) {
                this.refresh();
            }
        });
    }

    reload() {
        if (this.loaded && !this.loading) {
            this.loading = true;
            $TAKE(this.data, this.element, this, function(data) {
                $model[this.name] = data;
                this.followers.forEach(follower => $s(follower)?.reload?.());
                $model(this.name).#set(data);

                this.dispatch('onreload', { 'data': data });
                this.loading = false;
            });      
        }
    }

    #set(data) {
        if (this.#sets.length > 0) {
    
            // @data 或 {data} 表示"当前"数据, 即 data
    
            for (let set of this.#sets) {            
                for (let [attr, content] of set.attrs) {
                    if (content != null) {
                        $s(set.target).set(attr, content.placeData({"data": data}))
                            ?? console.error('Incorrect selector ' + set.target + ' or element does not exists.');                        
                    }
                }            
            }                
        }            
    }
}

//待加载的model项, 为0时触发finish事件
HTMLModelElement._modelCount = 0;
//页面上的所有model和相关标签是否都已经加载完成
HTMLModelElement._haveLoadedAll = false;


HTMLModelElement.$alone = function(tag) {
    //选择未被加载并且不在template模板中的for或if标签
    for (let t of document.querySelectorAll(tag)) {
        if (!t.hasAttribute('interpreting')) {
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

HTMLModelElement.output = function(o) {
    if (!o.hasAttribute('data')) {
        if (o.innerHTML.startsWith('@')){
            //从model加载
            o.parentNode.insertBefore(document.createTextNode(o.innerHTML.$p()), o);
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
                o.parentNode.insertBefore(document.createTextNode(o.innerHTML.placeData({"data": data})), o);
                o.remove();
            });
    }
}

HTMLModelElement.initializeNext = function(from) {

    if (!HTMLModelElement._haveLoadedAll) {            
        if (!HTMLTemplateElement._haveLoadedAll) {
            //model加载完成并且页面上的for和if加载已完成, -1表示还未进行standalone检查
            if (HTMLTemplateElement._standaloneCount == -1) {
                HTMLModelElement.initializeStandaloneTemplates();
            }                
        }
        else {
            //find first for/if
            let next = HTMLModelElement.$alone('FOR,IF,[if]');
            if (next == null) {
                //未加载完的模板
                HTMLTemplateElement._loading.forEach(t => t.complete());
                HTMLTemplateElement._loading.clear();

                //所有加载完成
                HTMLModelElement._haveLoadedAll = true;
                document.head.dispatch('onpost');
                document.head.dispatch('onload');

                //<o> 标签 = output
                for (let o of $a('o')) {
                    HTMLModelElement.output(o);                    
                }

                for (let span of $a('span[data],span[editable]')) {
                    if (!span.hasAttribute('root-span')) {
                        span.setAttribute('root-span', '');
                        HTMLModelElement.boostPropertyValue(span);
                        span.initialize();
                    }
                }
            }
            else {
                if (next.nodeName == 'FOR') {
                    new HTMLForElement(next).load();
                }
                else {
                    new HTMLIfElement(next).load();
                }
            }
        }            
    }
    else {
        //有可能有后加载的非独立模板有可能产生 FOR 或 IF

        let next = HTMLModelElement.$alone('FOR,IF,[if]');
        if (next == null) {
            //未加载完的模板
            HTMLTemplateElement._loading.forEach(t => t.complete());
            HTMLTemplateElement._loading.clear();
        }
        else {
            if (next.nodeName == 'FOR') {
                new HTMLForElement(next).load();
            }
            else {
                new HTMLIfElement(next).load();
            }
        }
    }
    //model已经加载完
    //页面上的for和if已经加载完
    //开始加载templates
    //template已加载完 
    //结束加载templates
}

HTMLModelElement.initializeStandaloneTemplates = function() {
    let templates = [...document.querySelectorAll('template[data]')].filter(t => t.standalone);
    HTMLTemplateElement._standaloneCount = templates.length;
    if (templates.length > 0) {
        for (let template of templates) {            
            template.initialize();
        }
    }
    else {
        HTMLTemplateElement._haveLoadedAll = true;
        HTMLModelElement.initializeNext('NO STANDALONE TEMPLATE TO LOAD');
    }
}

HTMLModelElement.initializeAll = function() {
    let models = document.querySelectorAll('model');
    if (models.length > 0) {
        HTMLModelElement._modelCount = models.length;
        for (let model of models) {
            new HTMLModelElement(model).load();
        }
    }
    else {
        HTMLModelElement.initializeNext('NO MODEL TO LOAD');
    }
}

// <for var="name"
//   in="url -> path" in="[a, b, c]" in="{data}" in="0 to 9"
//        container='selector' position='front|behind|begin|end'>
// </for>

$for = { }; //保存计算过程中的数据

class HTMLForElement extends HTMLCustomElement {
    constructor(element) {
        super(element);

        this.#content = this.element.innerHTML;
        this.#isForElement = this.element.tagName == 'FOR'; //可以把其他元素作为 For 元素使用
        this.#variables = this.getAttribute('variables')?.eval() ?? { }; //父级 FOR 或 TEMPLATE 传递的数据
        $for[this.#guid] = [];
        this.onload = this.getAttribute('onload');

        Event.interact(this, element);
    }

    #guid = 'F' + String.shuffle(31);
    #data = null; //当次加载解析后的数据
    #content = ''; //标签内容
    #isForElement = true;
    #variables = null;

    #var = null;

    get var() {
        if (this.#var == null) {
            this.var = this.getAttribute('var') ?? this.getAttribute('let') ?? '';
        }
        return this.#var;        
    }

    set var(value) {
        this.#var = { "item": "item", "key": "key", "value": "value" };
        if (value.includes(',')) {
            this.#var.key = value.takeBefore(',').trim();
            this.#var.value = value.takeAfter(',').trim();            
        }
        else {
            this.#var.item = value.trim() || "item";
        }
    }

    get let() {
        return this.var;
    }

    get in() {
        return this.getAttribute('in') ?? this.getAttribute('of') ?? this.getAttribute('data') ?? '';
    }

    get container() {
        return this.getAttribute('container')?.$() ?? this.element;
    }

    get resultPosition() {
        return this.getAttribute('result-position') ?? this.getAttribute('position') ?? (this.#isForElement ? 'beforeBegin' : 'beforeEnd');
    }

    onload = null;

    load(data) {
        //其他标签如 select 可以当作 for 使用
        if (!this.#isForElement) {
            this.element.innerHTML = '';
        }
        
        this.#data = data ?? this.in;

        //url or PQL
        //range: m to n, n to m
        //Seq: a,b,c,d,e
        //js expression:  {...} 或 {{ ... }}}
        //static array string:   { [..] }
        //static object string: {{  return { } }}

        //in="url" in="[a, b, c]" in="{ key: value}" in="0 to 9"
        if (typeof(this.#data) == 'string') {
            this.#data = this.#data.placeData(this.#variables);

            if (/^(\d+)\s+to\s+(\d+)$/i.test(this.#data)) {
                let m = /^(\d+)\s+to\s+(\d+)$/i.exec(this.#data);
                let s = m[1].toInt();
                let t = m[2].toInt();
                this.#data = [];
                if (s < t) {
                    for (let i = s; i <= t; i++) {
                        this.#data.push(i);
                    }
                }
                else if (s > t) {
                    for (let i = s; i >= t; i--) {
                        this.#data.push(i);
                    }
                }
                else {
                    this.#data.push(s);
                }
            }
        }

        $TAKE(this.#data, this.element, this, function(data) {
            if (typeof(this.#data) == 'string') {
                this.#data = data;
            }

            if (data instanceof Array) {
                this.container.insertAdjacentHTML(this.resultPosition, this.#eachOf(data));
            }
            else if (typeof (data) == 'object') {
                this.container.insertAdjacentHTML(this.resultPosition, this.#eachIn(data));
            }
            else {
                throw new Error('Wrong collection data in FOR loop: ' + this.#data);
            }       
            
            if (this.onload != null) {
                Event.fire(this, 'onload', data);
            }  

            if (this.#isForElement) {
                this.remove();
            }
            else {            
                this.removeAttribute('interpreting');
            }

            HTMLModelElement.initializeNext('A FOR LOADED.');
        });
    }

    #eachOf(data) {
        //"item" is reserved word
        let html = [];
        let i = 0;
        let hasSubCircle = this.$('for') != null;
 
        for (let item of data) {
            if (hasSubCircle) {
                $for[this.#guid][i] = {};
                Object.assign($for[this.#guid][i], this.#variables);
                $for[this.#guid][i][this.var.item] = item;
            
                html.push(HTMLForElement.evalContentIgnoreSubCycle(this, this.#content, '$for.' + this.#guid + '[' + i+ ']', $for[this.#guid][i]));
            }
            else {
                let vars = { };
                vars[this.var.item] = item;
                Object.assign(vars, this.#variables);
                html.push(this.#content.replaceHolder(this, vars))
            }

            i++;
        }
    
        return html.join('');
    }

    #eachIn(data) {
        //"key", "value" is reserved world
        let html = [];
        let i = 0;
        let hasSubCircle = this.$('for') != null;

        for (let key in data) {
            const value = data[key];

            if (hasSubCircle) {
                $for[this.#guid][i] = {};
                Object.assign($for[this.#guid][i], this.#variables);
                $for[this.#guid][i][this.var.key] = key;
                $for[this.#guid][i][this.var.value] = value;

                html.push(HTMLForElement.evalContentIgnoreSubCycle(this, this.#content, '$for.' + this.#guid + '[' + i+ ']', $for[this.#guid][i]));
            }
            else {
                let vars = { };
                vars[this.var.key] = key;
                vars[this.var.value] = value;
                Object.assign(vars, this.#variables);
                html.push(ths.#content.replaceHolder(this, vars));
            }

            i++;
        }

        return html.join('');
    }
}

HTMLForElement.evalContentIgnoreSubCycle = function(element, content, variables =  '', args = null) {
    
    //要把 <for> 标签先替换出来以防止冲突
    let tobe = [];

    /<for\b|<\/for>/ig.findAllMatchIn(content)
        .forEach(m => {
            if (m[0].toLowerCase() == '<for') {
                if (tobe.length == 0 || tobe.last.end > 0) {
                    tobe.push({ start: m.index, end: 0, close: 0 });
                }
                else {
                    tobe.last.close += 1;
                }                
            }
            else {
                if (tobe.last.close > 0) {
                    tobe.last.close -= 1;
                }
                else {
                    tobe.last.end = m.index + 6;
                }                
            }
         });
        
    tobe.reverse()
        .forEach(to => {
            if (variables != '') {
                to.code = '<for variables="' + variables + '"' + content.substring(to.start + 4, to.end);
            }
            else {
                to.code = content.substring(to.start, to.end);
            }
            content = content.substring(0, to.start) + '[for-' + to.start + ']' + content.substring(to.end);            
        });

    content = content.replaceHolder(element, args);

    tobe.forEach(to => {
        content = content.replace('[for-' + to.start + ']', to.code);
    });

    return content;
}

// <if test="boolean expression">
//      html code
// <else-if test="boolean expression">
//      html code
// <else>
//      html code
// </if>

// $if('name').on(event, func).load();

class HTMLIfElement extends HTMLCustomElement {
    constructor(element) {
        super(element);

        this.#isIfElement = element.nodeName == 'IF';
        this.#if = element;
        if (this.#isIfElement) {
            this.#elsif = element.$$('else-if,elsif,elseif');
            this.#else = element.$('else');
        }
        else {
            let next = this.#if.nextElementSibling;
            while (next != null) {
                if (next.hasAttribute('else-if') || next.hasAttribute('elseif') || next.hasAttribute('elsif')) {
                    this.#elsif.push(next);
                }
                else if (next.hasAttribute('else')) {
                    this.#else = next;
                    break;
                }
                else {
                    break;
                }
                next = next.nextElementSibling;
            }
        }

        this.onload = element.getAttribute('onload');
        this.onreturntrue = element.getAttribute('onreturntrue');
        this.onreturnfalse = element.getAttribute('onreturnfalse');
        
        Event.interact(this, this.element);
    }

    #if = null;
    #elsif = [];
    #else = null;
    #isIfElement = true;
    result = false;

    onload = null;
    onreturntrue = null;
    onreturnfalse = null;

    load() {
        let content = '';
        let test = this.#if.getAttribute('test') || this.#if.getAttribute('if') || 'false';
    
        if (this.#isIfElement) {
            if (test.toBoolean(true, this.#if)) {
                content = HTMLForElement.evalContentIgnoreSubCycle(this, this.#if.innerHTML);
                this.result = true;
            }
            else {
                if (this.#elsif.length > 0) {
                    for (let i = 0; i < this.#elsif.length; i++) {
                        test = this.#elsif[i].getAttribute('test') || 'false';
                        if (test.toBoolean(true, this.#elsif[i])) {
                            content = HTMLForElement.evalContentIgnoreSubCycle(this, this.#elsif[i].innerHTML);
                            this.result = true;
                            break;
                        }
                    }
                }
    
                if (!this.result && this.#else != null) {
                    content = HTMLForElement.evalContentIgnoreSubCycle(this, this.#else.innerHTML);
                    this.result = true;
                }
            }
    
            let _els = /<(else|else-if|elseif|elsif)\b/i;
            if (_els.test(content)) {
                content = content.substring(0, content.indexOf(_els.exec(content)[0])).trim();
            }
    
            this.#if.insertAdjacentHTML('beforeBegin', content);
        }
        else {
            if (test.toBoolean(true, this.#if)) {
                this.result = true;            
            }
            else {
                this.#if.remove();                  
            }
    
            if (this.#elsif.length > 0) {
                for (let i = 0; i < this.#elsif.length; i++) {
                    if (this.result) {
                        this.#elsif[i].remove();
                    }
                    else {
                        test = this.#elsif[i].getAttribute('else-if') || this.#elsif[i].getAttribute('elseif') || this.#elsif[i].getAttribute('elsif');
                        if (test.toBoolean(true, this.#elsif[i])) {
                            this.#elsif[i].removeAttribute('else-if');
                            this.#elsif[i].removeAttribute('elseif');
                            this.#elsif[i].removeAttribute('elsif');
                            this.result = true;
                        }
                        else {
                            this.#elsif[i].remove();
                        }
                    }            
                }
            }      
    
            if (this.#else != null) {
                if (this.result) {
                    this.#else.remove();
                }
                else {
                    this.#else.removeAttribute('else');
                }
            }
        }
        
        Event.fire(this, 'onload');    
        if (this.result) {
            Event.fire(this, 'onreturntrue');
        }
        else {
            Event.fire(this, 'onreturnfalse');
        }
    
        if (this.#isIfElement) {
            this.#if.remove();
        }
        else {
            this.#if.removeAttribute('if');
            this.#if.removeAttribute('interpreting');
        }
    
        HTMLModelElement.initializeNext('AN IF LOADED.');
    }
}

$enhance(HTMLSpanElement.prototype)
    .defineProperties({
        data: '',
        await: '',
        copyText: '',
        'messageDuration': {
            get() {
                return this.getAttribute('message-duration') ?? this.getAttribute('messageDuration') ?? this.getAttribute('message');
            },
            set(duration) {
                this.setAttribute('message-duration', duration);
            }
        }
    }).defineEvents('onload', 'onreload');

HTMLSpanElement.prototype.loaded = false;
HTMLSpanElement.prototype.content = null;
HTMLSpanElement.prototype.input = null;

HTMLSpanElement.prototype.load = function() {
    $TAKE(this.data, this, this, function(data) {
        this.innerHTML = this.content.replaceHolder(this, { 'data': data }, this.id);
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

    if (this.hidden || this.messageDuration != null) {
        window.Message?.green(this.copyText || ($root.lang == 'zh' ? '已复制。' : 'Copied.')).show(this.messageDuration.toInt(6));
    }
    else {
        Callout(this.copyText || ($root.lang == 'zh' ? '已复制。' : 'Copied.')).position(this, 'up').show(3);
    }
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
    else {
        this.innerHTML = this.innerHTML.$p(this);
    }

    Event.interact(this);
}


$template = { }; //保存解析过程中的数据
HTMLTemplateElement._loading = new Set();
HTMLTemplateElement._standaloneCount = -1;
HTMLTemplateElement._haveLoadedAll = false;

$enhance(HTMLTemplateElement.prototype)
    .defineProperties({
        name: '',

        data: '',

        increment: '',
        lazyLoad: false,
        autoRefresh: false,
        interval: 2000,
        terminal: 'false',
        clearOnRefresh: true,

        'var': {
            get() {
                if (this._var == null) {
                    this.var = this.getAttribute('var') ?? this.getAttribute('let') ?? '';
                }
                return this._var;
            },
            set(vs) {
                this._var = {
                    item: 'item',
                    key: 'key',
                    value: 'value'
                };

                if (vs.includes(',')) {
                    this._var.key = vs.takeBefore(',').trim() || 'key';
                    this._var.value = vs.takeAfter(',').trim() || 'value';
                }
                else {
                    this._var.item = vs.trim() || 'item';
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
        },
        'standalone': {
            get() {
                return !'TREEVIEW,TREENODE,TABLE,TBODY'.includes(this.parentNode.nodeName);
            }
        }
    })
    .defineEvents('onload', 'onreload', 'onlazyload', 'ondone', 'onteminate');

HTMLTemplateElement.prototype._var = null;
HTMLTemplateElement.prototype._page = -1;
HTMLTemplateElement.prototype._offset = -1;
HTMLTemplateElement.prototype._deferral = 0; //延长次数, 默认延长3次, 不可设置
HTMLTemplateElement.prototype._data = null; //当次执行的结果数据
HTMLTemplateElement.prototype._func = null; //加载完成后执行的函数

HTMLTemplateElement.prototype.vars = null; //中间变量
HTMLTemplateElement.prototype.container = null; //容器元素
HTMLTemplateElement.prototype.position = 'beforeBegin';

HTMLTemplateElement.prototype.loading = false; //是否正在加载
HTMLTemplateElement.prototype.loaded = false; //是否第一次加载已完成
HTMLTemplateElement.prototype.done = false; //是否已经到底了
HTMLTemplateElement.prototype.empty = true; //加载的数据是否为空

HTMLTemplateElement.prototype.owner = null; //非独立<TEMPLATE>的主元素，执行事件时call的对象

HTMLTemplateElement.prototype.initialize = function(container) {

    if (this.name == '') {
        if (this.id != '') {
            this.name = this.id;
        }
        else {
            this.name = 'Tempalte_' + String.shuffle(7);
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

    Event.interact(this);
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
    
    this.empty = Object.keys(data).length == 0;
    $template[this.name] = { "data": data };

    return HTMLForElement.evalContentIgnoreSubCycle(this, this.content, 'template.' + this.name, $tempate[this.name]);    
}

HTMLTemplateElement.prototype.$eachOf = function(data) {

    if (this.page == this.initPage) {
        this.empty = data.length == 0;
    }

    $template[this.name] = [];

    let html = [];
    let i = 0;
    let hasSubCircle = this.$('for') != null;
    
    for (let item of data) {
        if (hasSubCircle) {
            $template[this.name][i] = { };
            $template[this.name][i][this.var.item] = item;
        
            html.push(HTMLForElement.evalContentIgnoreSubCycle(this, this.content, '$template.' + this.name + '[' + i+ ']', $template[this.name][i]));
        }
        else {
            let vars = {};
            vars[this.var.item] = item;
            html.push(this.content.replaceHolder(this, vars))
        }

        i++;
    }

    return html.join('');
}

//each in
HTMLTemplateElement.prototype.$eachIn = function(data) {

    if (this.page == this.initPage) {
        this.empty = Object.keys(data).length == 0;
    }

    $template[this.name] = [];

    let html = [];
    let i = 0;
    let hasSubCircle = this.$('for') != null;

    for (let key in data) {

        if (hasSubCircle) {
            $tempate[this.name][i] = {};
            $tempate[this.name][i][this.var.key] = key;
            $tempate[this.name][i][this.var.value] = data[key];

            html.push(HTMLForElement.evalContentIgnoreSubCycle(this, this.content, '$template.' + this.name + '[' + i+ ']', $template[this.name][i]));
        }
        else {
            let vars = { };
            vars[this.var.key] = key;
            vars[this.var.value] = data[key];
            html.push(this.content.replaceHolder(this, vars));
        }

        i++;
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
                        template.dispatch('onterminate');
                    }
                    template._deferral ++;
                }
                else {
                    //done
                    window.clearInterval(refresher);                  
                    template.done = true;
                    template.dispatch('ondone');
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
                            this.dispatch('ondone');
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

            this._data = data;
            this._func = func;
            if (this.$('for,if,[if]') != null) {
                HTMLTemplateElement._loading.add('#' + this.name);
            }
            else {
                this.complete();
            }
            
            //standalone tempalte
            if (this.standalone) {
                if (HTMLTemplateElement._standaloneCount > 0) {
                    HTMLTemplateElement._standaloneCount --;
                    if (HTMLTemplateElement._standaloneCount == 0) {
                        HTMLTemplateElement._haveLoadedAll = true;
                    }
                }                     
            }

            HTMLModelElement.initializeNext('A TEMPLATE LOADED');            
        });
    }
}

HTMLTemplateElement.prototype.complete = function() {
    //当前值大于初始值为"增量加载" 
    if (this.page > this.initPage + 1) {
        this.dispatch('onlazyload', { "data": this._data });
    }
    else if (this.loaded) {
        this.dispatch('onreload', { "data": this._data });
    }
    else {
        this.loaded = true;
        this.dispatch('onload', { "data": this._data });
    }
    
    if (this._func != null) {
        if (typeof (this._func) == 'string') {
            eval('_ = function() {' + this._func + '}').call(this.owner, this._data);
        }
        else if (typeof(this._func) == 'function') {
            this._func.call(this.owner, this._data);
        }
    }

    this.loading = false;

    HTMLTemplateElement.reloadComponents(this);
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
    HTMLModelElement.initializeAll();
});