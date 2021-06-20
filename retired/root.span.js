//逻辑在 model.js 中

$enhance(HTMLSpanElement.prototype)
    .declare({
        data: '',
        onload: '',
        onreload: ''
    });

HTMLSpanElement.prototype.loaded = false;
HTMLSpanElement.prototype.content = null;

HTMLSpanElement.prototype.$represent = function(data) {

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
    ].map(place => content.match(place) || [])
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
            content = content.replaceAll(holder, v.replace(/"/g, '&quot;'));            
        }
    });

    this.innerHTML = content.evalJsExpression();
}

HTMLSpanElement.prototype.load = function() {
    let span = this;  
    $cogo(this.data, this)
        .then(data => {            
            span.$represent(data);
            span.loaded = true;
            Event.fire(span, 'onload', data);
        });
}


HTMLSpanElement.prototype.reload = function() {
    let span = this;  
    $cogo(this.data, this)
        .then(data => {
            span.$represent(data);
            Event.fire(span, 'onreload', data);
        });
}

HTMLSpanElement.prototype.initialize = function() {

    if (this.data != '') {
        this.content = this.innerHTML;
        this.load();
    }

    Event.interact(this, this);
}

HTMLSpanElement.initializeAll = function() {
    
    for (let span of $a('span')) {
        if (span.getAttribute('root') == null) {
            span.setAttribute('root', 'SPAN');
            if (document.models != null) {
                Model.boostPropertyValue(span);
            }
            if (span.getAttribute('data') != null) {
                span.initialize();
            }
        }
    }
}