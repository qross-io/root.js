
/*
Animation(settings).apply(element).on('start', func).on('stop', func).play();
或
new Animation.Entity(settings, element).play(event);
或
$x(element).animate(settings);

settings : "duration:<time>; timing-function:<function>; iteration-count:<count>; fill-mode:forwards|backwards; direction:normal|reverse; delay:0s;  from:<position> <scale> <opcity>; to:<position> <scale> <opcity>;"
element : elementId | element;
event : {onstart, onstop}

duration: <time>
    {number}s, {number}ms

timing-function:<function>
    ease(default)|ease-in|ease-out|linear......

iteration-count:<count>
    1(default),2,3...|infinite

direction:
    normal 正常
    reverse 翻转
    alternate 交替

fill-mode:
    forwards 样式在动画结束后生效
    backwards 样式在动画开始时生效

delay:
    {number}s, {number}ms

from(0%)|x%|to(100%)-position:
    x1.y1
    x1 : {number}|left|center|right
    y1 : {number}|top|middle|bottom
    x(x1).y(y1)
    random(x1,x2,x3,...).random(y1,y2,y3,...)
    x(random(x1,x2,x3,...)).y(random(y1,y2,y3,...))
    random(x(x1),x(x2),x(x3),...).random(y(y1),y(y2),y(y3),...)
    random(x1.y1,x2.y2,x3.y3)
    event

    x,y和random函数都不能嵌套
    x = translateX
    y = translateY

    x: {number},eventX,left,center,right,x(x1),random(x1,x2,x3),x(random(x1,x2,x3)),random(x(x1),x(x2),x(x3))
    y: {number},eventY,top,middle,bottom,y(y1),random(y1,y2,y3),y(random(y1,y2,y3)),random(y(y1),y(y2),y(y3))
    
    event 屏幕上的鼠标点击事件
    element 动画元素本身, 只能使用对象内属性或变量

from(0%)|x%|to(100%)-scale:
    1-100(%)
    1-100(%).1-100(%)

    transform:scaleX()
    transform:scaleY()

from(0%)|x%|to(100%)-opacity:
    -100-100(%)
    如果小于0, display='none'应用；大于0, display=''应用
*/

/*
document.styleSheets[0] members
    cssRules [object CSSRuleList]
    insertRule function insertRule() { [native code] }
    deleteRule function deleteRule() { [native code] }
    addRule function addRule() { [native code] }
    removeRule function removeRule() { [native code] }
*/

/*
classList members
    item function item() { [native code] }
    contains function contains() { [native code] }
    add function add() { [native code] }
    remove function remove() { [native code] }
    toggle function toggle() { [native code] }
*/

/*
程序本身不需要有方法和属性被使用者调用, 所以属性和方法全部为私有, 都不以双下划线"__"开始
动画播放完成后不再回到自己原来的位置, 原有CSS3返回到原来状态
鼠标事件使用全局变量(document.onclick)  #鼠标点击事件是否受滚动条的影响（受）
将配置转化为class添加到页面的<style>中
播放动画时添加class
动画完成后移除class，根据duration。确定能不能移除
属性设置中有无百分号均可
要运动的元素必须手动设置position和overflow属性

#AnimationOnShow, AnimationOnHide For Popup
#scrollLeft和scrollTop在不同浏览器中获得的方式不一样 webkit 用 document.body.scrollTop，其他用document.documentElement.scrollTop
#元素定位,left right center, top middle bottom
#保留动画最后状态问题
#移除CSS样式问题
#onStop和onStart问题
#增加事件而不是额外样式
#多次为同一元素执行动画时元素变小的问题
研究Transform和Transition, translate函数
坐标支持表达式
*/

/*
Animation(settings).apply(element).play();
   Animation(settings) return Animation.Settings()
   .apply(element) return Animation.Entity()
   .play(event) return void
*/

Animation = function (settings) {
    /// <summary>动画声明</summary>
    /// <value name="settings" type="String">动画设置</value>
    return new Animation.Settings(settings);
}

Animation.timer = new Object();

Animation.Entity = function (settings, element) {
    /// <summary>动画实体</summary>
    /// <value name="settings" type="String|Animation.Settings">动画设置</value>
    /// <value name="element" type="String|Element">动画绑定的元素</value>

    this.settings = settings;
    this.element = (typeof(element) == 'string' ? $s(element) : element);

    this.toBeReset = false;

    this.onstart = function(element) {};
    this.onstop = function(element) {};
}

Animation.Entity.prototype.on = function(eventName, func) {
    eventName = eventName.toLowerCase();
    if (!eventName.startsWith('on')) {
        eventName = 'on' + eventName;
    }

    if (this.hasOwnProperty(eventName)) {
        this[eventName] = func;
    }

    return this;
}

Animation.Entity.prototype.resetOnStop = function(toBeReset = true) {
    this.toBeReset = toBeReset;
    return this;
}


Animation.Entity.prototype.play = function (ev) {
    /// <summary>播放动画</summary>

    //this.element = $s(this.element);

    if (this.element != null) {
        //检查head中有没有样式单<style>

        if (this.element.id == '') {
            this.element.id = 'animation_object_' + $randomPassword(11);
        }
        
        if (document.getElementById('__AnimationStyleSheet_' + this.element.id) != null) {
            document.getElementsByTagName('HEAD')[0].removeChild(document.getElementById('__AnimationStyleSheet_' + this.element.id));
        }

        let style = document.createElement('STYLE');
        style.type = 'text/css';
        style.id = '__AnimationStyleSheet_' + this.element.id;
        document.getElementsByTagName('HEAD')[0].appendChild(style);

        if (Animation.timer[this.element.id] != null) {
            window.clearTimeout(Animation.timer[this.element.id]);
            delete Animation.timer[this.element.id];
        }
        Event.fire(this, 'start', this.element);

        let prefix = '';
        // if (Animation.getBrowser().name == 'chrome' || Animation.getBrowser().name == 'safari') {
        //     prefix = '-webkit-';
        // }
        //else if (Animation.getBrowser().name == 'firefox') {
        //    prefix = '-moz-';
        //}
        let css = '';
        let t; //transform
        
        //添加以element.id命名的关键帧
        //'keyframes Animation {0%{opacity:0;} 100%{opacity:1;}}';
        css += '@' + prefix + 'keyframes AnimationKeyFrames_' + this.element.id;
        css += ' {';
        for (let f in this.settings.keyFrames) {
            css += this.settings.keyFrames[f].point;
            css += '{';
            t = '';
            if (this.settings.keyFrames[f].position != null) {
                this.settings.keyFrames[f].position = { x: this.getPositionX(this.settings.keyFrames[f].position.x, ev), y: this.getPositionY(this.settings.keyFrames[f].position.y, ev) };
                if (/^\d+$/.test(this.settings.keyFrames[f].position.x)) {
                    css += 'left:' + this.settings.keyFrames[f].position.x + 'px;';
                }
                else if (/^translateX/.test(this.settings.keyFrames[f].position.x)) {
                    t += ' ' + this.settings.keyFrames[f].position.x;
                }
                if (/^\d+$/.test(this.settings.keyFrames[f].position.y)) {
                    css += 'top:' + this.settings.keyFrames[f].position.y + 'px;';
                }
                else if (/^translateY/.test(this.settings.keyFrames[f].position.y)) {
                    t += ' ' + this.settings.keyFrames[f].position.y;
                }                
            }
            if (this.settings.keyFrames[f].scale != null) {
                if (this.settings.keyFrames[f].scale.x != 1) {
                    t += ' scaleX(' + this.settings.keyFrames[f].scale.x + ')';
                }
                if (this.settings.keyFrames[f].scale.y != 1) {
                    t += ' scaleY(' + this.settings.keyFrames[f].scale.y + ')';
                }                
            }
            if (t != '') {
                css += prefix + 'transform:' + t + ';';
            }
            if (this.settings.keyFrames[f].opacity != null) {
                css += 'opacity:' + this.settings.keyFrames[f].opacity + ';';                
            }
            css += '} ';
        }
        css += '} ';
        
        //添加以element.id命名的动画样式
        css += '.Animation_' + this.element.id;
        css += ' {';
        css += prefix + 'animation-name:AnimationKeyFrames_' + this.element.id + ';';
        if (this.settings.duration != null) {
            css += prefix + 'animation-duration:' + this.settings.duration + ';';
        }
        if (this.settings.timingFunction != null) {
            css += prefix + 'animation-timing-function:' + this.settings.timingFunction + ';';
        }
        if (this.settings.iterationCount != null) {
            css += prefix + 'animation-iteration-count:' + this.settings.iterationCount + ';';
        }
        if (this.settings.direction != null) {
            css += prefix + 'animation-direction:' + this.settings.direction + ';';
        }
        if (this.settings.fillMode != null) {
            css += prefix + 'animation-fill-mode:' + this.settings.fillMode + ';';
        }
        if (this.settings.delay != null) {
            css += prefix + 'animation-delay:' + this.settings.delay + ';';
        }
        css += '} ';

        if (this.element.classList.contains('Animation_' + this.element.id)) {
            this.element.classList.remove('Animation_' + this.element.id);
        }

        if (style.cssText != null) {
            style.cssText = css;
        }
        else {
            style.innerHTML = css;
        }

        //将样式附加到element
        this.element.classList.add('Animation_' + this.element.id)

        let a = this;
        Animation.timer[this.element.id] =
             window.setTimeout(
                 function () {
                    if (a.toBeReset) {
                        //动画结束时移除样式
                        a.element.classList.remove('Animation_' + a.element.id);
                        //移除样式表标签<style>
                        $x('#__AnimationStyleSheet_' + a.element.id).remove();
                    }   
                    Event.fire(a, 'stop', a.element);
                    window.clearTimeout(Animation.timer[a.element.id]);
                    delete Animation.timer[a.element.id];
                }, Animation.parseTimeOut(this.settings.duration, this.settings.delay));

        //播放完成时移除样式
        //e.classList.add('Animation_Finally_' + e.id);
        /*
        let e = this.element;
        window.setTimeout(function () {
            //将element上的样式移除
            e.classList.remove('Animation_' + e.id);

            //移除以element.id命名的动画样式
            //移除以element.id命名的关键帧
            //移除样式表标签<style>
            document.getElementsByTagName('HEAD')[0].removeChild(document.getElementById('__AnimationStyleSheet_' + e.id));

        }, Animation.parseDuration(this.settings.duration)); */
    }    
}

Animation.Entity.prototype.getPositionX = function (x, ev) {
    /// <summary>从文本解析坐标X值</summary>
    // <value name="x" type="String">x坐标值</value>

    // x: {number},eventX,left,center,right,x(x1),random(x1,x2,x3),x(random(x1,x2,x3)),random(x(x1), x(x2),x(x3))
    //let e = /^\-?\d[\d+\-\*\/]+\d$/;
    //let d = /^\-?\d+$/;

    x = x.replace(/eventX/g, this.getEventX(ev));
    x = x.replace(/left/g, 0);
    x = x.replace(/center/g, this.getOffsetLeft('center'));
    x = x.replace(/right/g, this.getOffsetLeft('right'));
    //while (/translateX\(\-?\d+\)/.test(x)) {
    //    x = x.replace(/translateX\(\-?\d+\)/, this.translateX(/translateX\((\-?\d+)\)/.exec(x)[1]));
    //}
    //内部random
    let random = /random\(\-?\d+(,\d+)*\)/;
    while (random.test(x)) {
        x = x.replace(random, this.random(random.exec(x)[1]));
    }

    //全局random
    if (/^random\(translateX\([\-\d]+\)(,translateX\([\-\d]+\))*\)$/.test(x)) {
        x = x.replace(/^random\(/, '');
        x = x.replace(/\)$/, '');
        x = x.split(',');
        x = x[Math.floor(Math.random() * x.length)];
    }

    if (/^translateX\([\-\d]+\)$/.test(x)) {
        x = x.replace(/\)$/, 'px)');
    }

    return x;
}

Animation.Entity.prototype.getPositionY = function (y, ev) {
    /// <summary>从文本解析坐标Y值</summary>
    // <value name="y" type="String">y坐标值</value>

    // y: {number},eventY,top,middle,bottom,y(y1),random(y1,y2,y3),y(random(y1,y2,y3)),random(y(y1), y(y2),y(y3))

    y = y.replace(/eventY/g, this.getEventY(ev));
    y = y.replace(/top/g, 0);
    y = y.replace(/middle/g, this.getOffsetTop('middle'));
    y = y.replace(/bottom/g, this.getOffsetTop('bottom'));
    //while (/translateY\(\-?\d+\)/.test(y)) {
    //    y = y.replace(/translateY\(\-?\d+\)/, this.translateY(/translateY\((\-?\d+)\)/.exec(y)[1]));
    //}
    let random = /random\(\-?\d+(,\d+)*\)/;
    while (random.test(y)) {
        y = y.replace(random, this.random(random.exec(y)[1]));
    }    
    
    if (/^random\(translateY\([\-\d]+\)(,translateY\([\-\d]+\))*\)$/.test(y)) {
        y = y.replace(/^random\(/, '');
        y = y.replace(/\)$/, '');
        y = y.split(',');
        y = y[Math.floor(Math.random() * y.length)];
    }

    if (/^translateY\([\-\d]+\)$/.test(y)) {
        y = y.replace(/\)$/, 'px)');
    }

    return y;
}

//Animation.Entity.prototype.translateX = function (v) {
//    /// <summary>获得相对元素的X值</summary>

//    if (typeof (v) == 'string') {
//        v = parseInt(v);
//    }
//    let x = this.element.offsetLeft;
//    return x + v;
//}

//Animation.Entity.prototype.translateY = function (v) {
//    /// <summary>获得相对元素的Y值</summary>

//    if (typeof (v) == 'string') {
//        v = parseInt(v);
//    }
//    let y = this.element.offsetTop;
//    return y + v;
//}

Animation.Entity.prototype.random = function () {
    /// <summary>获得随机值</summary>

    let l = arguments.length;
    if (l > 0) {
        let s = arguments;
        if (l == 1 && typeof (s[0]) == 'string') {
            s = s[0].split(',');
            for (let i = 0; i < s.length; i++) {
                s[i] = parseInt(s[i]);
            }
            l = s.length;
        }
        return s[Math.floor(Math.random() * l)];
    }
    else {
        return 0;
    }
}

Animation.Entity.prototype.getOffsetLeft = function (p) {
    /// <summary>获得x轴的坐标位置</summary>

    let v = 0;
    if (p == 'center') {
        v = (document.documentElement.clientWidth - this.element.offsetWidth) / 2 + Animation.getScrollLeft();
    }
    else if (p == 'right') {
        v = document.documentElement.clientWidth - this.element.offsetWidth + Animation.getScrollLeft();
    }
    v = Math.round(v);
    return v;
}

Animation.Entity.prototype.getOffsetTop = function (p) {
    /// <summary>获得y轴的坐标位置</summary>

    let v = 0;
    if (p == 'middle') {
        v = (document.documentElement.clientHeight - this.element.offsetHeight) / 2 + Animation.getScrollTop();
    }
    else if (p == 'bottom') {
        v = document.documentElement.clientHeight - this.element.offsetHeight + Animation.getScrollTop();
    }
    v = Math.round(v);
    return v;
}

Animation.Entity.prototype.getEventX = function (ev) {
    /// <summary>获得事件的x坐标</summary>
    if (ev != null) {
        return Math.round(Animation.getScrollLeft() + ev.clientX);
    }
    else {
        return 0;
    }
}

Animation.Entity.prototype.getEventY = function (ev) {
    /// <summary>获得事件的y坐标</summary>
    if (ev != null) {
        return Math.round(Animation.getScrollTop() + ev.clientY);
    }
    else {
        return 0;
    }
}

Animation.Settings = function (settings) {
    this.duration = '1s';
    this.timingFunction = 'ease';
    this.iterationCount = 1;
    this.direction = 'normal';
    this.fillMode = 'forwards';
    this.delay = '0s';

    this.keyFrames = {};

    if (settings != null) {
        this.parse(settings);
    }
}

Animation.Settings.prototype.parse = function (settings) {
    /// <summary>解析settings</summary>
    /// <value name="settings" type="String">动画设置</value>

    // settings format
    // "duration:<time>; timing-function:<function>; iteration-count:<count>; direction:<direct>; fill-mode:<mode>; from:<position> <scale> <opcity>; to:<position> <scale> <opcity>;"

    //duration:<time>
    //timing-function:<function>
    //iteration-count:<count>
    //direction:<>
    //fill-mode:<>
    //from:<position> <scale> <opcity>
    //to:<position> <scale> <opcity>
    //n%:<position> <scale> <opcity>
    //from-position:<position>
    //from-scale:<scale>
    //from-opacity:<opacity>
    //to-position:<position>
    //to-scale:<scale>
    //to-opacity:<opacity>
    //n%-position:<position>
    //n%-scale:<scale>
    //n%-opacity:<opacity>

    settings = settings.split(';');
    for (let i = 0; i < settings.length; i++) {
        if (settings[i].includes(':')) {            
            if (/^from|to|\d+%/.test(settings[i])) {
                this.iterateFrame(new Animation.KeyFrame(settings[i]));
            }
            else {
                let [name, value] = settings[i].split(':');
                name = name.trim().toLowerCase();
                this[Animation.parseName(name)] = value.trim();
            }
        }        
    }
}

Animation.Settings.prototype.apply = function (element) {
    /// <summary>绑定</summary>
    return new Animation.Entity(this, element);
}

Animation.Settings.prototype.iterateFrame = function (frame) {
    /// <summary>迭代Frame</summary>

    let n = 'p' + frame.point.replace('%', '');
    if (this.keyFrames[n] != null) {
        if (frame.position != null) {
            this.keyFrames[n].position = frame.position;
        }
        if (frame.scale != null) {
            this.keyFrames[n].scale = frame.scale;
        }
        if (frame.opacity != null) {
            this.keyFrames[n].opacity = frame.opacity;
        }
    }
    else {
        this.keyFrames[n] = frame;
    }
}

Animation.KeyFrame = function (settings) {
    /// <summary>关键帧</summary>
    /// <value name="settings" type="String">配置字符串</value>

    this.point = null; //'form|n%|to';
    this.position = null; //new Animation.Position('x', 'y');
    this.scale = null; //'s%|x%.y%';
    this.opacity = null; //'f%';

    if (settings != null) {
        this.parse(settings);
    }
}

Animation.KeyFrame.prototype.parse = function (settings) {
    /// <summary>解析关键帧</summary>
    /// <value name="settings" type="String">配置字符串</value>
    settings = settings.toLowerCase();
    if (settings.indexOf(':') > 0) {
        let s = settings.split(':');
        let t = s[1].trim().split(' ');
        if (s[0].indexOf('-') > 0) {
            let r = s[0].split('-');
            this.point = Animation.parsePoint(r[0]);
            if (r[1] == 'position') {
                this.position = Animation.parsePosition(t[0]);
            }
            if (r[1] == 'scale') {
                this.scale = Animation.parseScale(t[0]);
            }
            if (r[1] == 'opacity') {
                this.opacity = Animation.parseOpacity(t[0]);
            }
        }
        else {
            this.point = Animation.parsePoint(s[0]);
            this.position = Animation.parsePosition(t[0]);
            if (t.length > 1) {
                this.scale = Animation.parseScale(t[1]);
            }
            if (t.length > 2) {
                this.opacity = Animation.parseOpacity(t[2]);
            }
        }
    }
}

Animation.getScrollLeft = function () {
    let left = document.documentElement.scrollLeft;
    if (document.body.scrollLeft > left) {
        left = document.body.scrollLeft;
    }
    return left;
}

Animation.getScrollTop = function () {
    let top = document.documentElement.scrollTop;
    if (document.body.scrollTop > top) {
        top = document.body.scrollTop;
    }
    return top;
}

Animation.parseName = function(name) {
    let r = /-([a-z])/;
    while (r.test(name)) {
        name = name.replace(r, r.exec(name)[1].toUpperCase());
    }
    return name;
}

Animation.parsePoint = function (p) {
    /// <summary>解析关键帧位置</summary>
    p = p.trim();
    if (p == 'from') {
        p = '0%';
    }
    else if (p == 'to') {
        p = '100%';
    }
    else if (/^\d%$/.test(p)) {
        p = parseInt(p);
        if (isNaN(p)) {
            p = 0;
        }
        p = p + '%';
    }

    return p;
}

Animation.parsePosition = function (p) {
    /// <summary>解析坐标</summary>

    p = p.toLowerCase();
    if (p == 'event') {
        p = 'eventX.eventY';
    }

    if (p.indexOf('.') == -1) {
        p = null;
    }
    else {
        if (/^random\([\dx\(\)\-]+\.[\dy\(\)\-]+(,[\dx\(\)\-]+\.[\dy\(\)\-]+)*\)$/.test(p)) {
            p = p.replace(/^random\(/, '');
            p = p.replace(/\)$/, '');
            p = p.split(',');
            p = p[Math.floor(Math.random() * p.length)];
        }
        p = p.split('.');
        p[0] = p[0].replace(/x/g, 'translateX');
        p[1] = p[1].replace(/y/g, 'translateY');
        p = { x: p[0], y: p[1] };
    }

    return p;
}

Animation.parseScale = function (s) {
    /// <summary>解析缩放比例</summary>
    let x = s;
    let y = s;
    if (s.includes('.')) {
        x = s.substring(0, s.indexOf('.'));
        y = s.substring(s.indexOf('.') + 1);
    }

    x = x.toInt(100);
    y = y.toInt(100);

    //min value is 1    
    return {
        x: (x > 0 ? x : 1) / 100,
        y: (y > 0 ? y : 1) / 100
    };
}

Animation.parseOpacity = function (o) {
    /// <summary>解析透明度</summary>

    o = parseInt(o);
    if (isNaN(o)) {
        o = 100;
    }
    return o / 100;
}

Animation.parseTimeOut = function (duration, delay) {
    /// <summary>将持续时间改为毫秒</summary>

    if (duration.indexOf('ms') > 0) {
        duration = duration.toInt();
    }
    else {
        duration = duration.toFloat() * 1000;
    }

    if (delay.indexOf('ms') > 0) {
        delay = parseInt(delay);
    }
    else {
        delay = parseInt(delay) * 1000;
    }

    return duration + delay;
}

Animation.getBrowser = function () {
    let userAgent = navigator.userAgent;
    let name, version;
    if (userAgent.indexOf('Chrome') > -1) {
        //-webkit-
        name = 'chrome';
        version = /Chrome\/(\d+)/.exec(userAgent)[1];
    }
    else if (userAgent.indexOf('Firefox') > -1) {
        //-moz- | <empty>
        name = 'firefox';
        version = /Firefox\/(\d+)/.exec(userAgent)[1];
    }
    else if (userAgent.indexOf('MSIE') > -1) {
        // <empty>
        name = 'ie';
        version = /MSIE (\d+)/.exec(userAgent)[1];
    }
    else if (userAgent.indexOf('Safari') > -1) {
        // -webkit-
        name = 'safari';
        version = /Version\/(\d+)/.exec(userAgent)[1];
    }
    else if (userAgent.indexOf('Opera') > -1) {
        // <empty>
        name = 'opera';
        version = /Version\/(\d+)/.exec(userAgent)[1];
    }
    else {
        name = '';
        version = 0;
    }

    return { name: name, version: parseInt(version) };
}


$root.prototype.fadeIn = function(opacity = 0) {
    this.objects.forEach(element => {
        if (element.hidden) {
            element.hidden = false;
        }
        if (element.style.display == 'none') {
            element.style.display = '';
        }
        Animation('timing-function: ease; duration: 0.6s; from-opacity: ' + (opacity) + '%; to-opacity: 100%; fill-mode: forwards;')
            .apply(element)
            .resetOnStop()
            .on('stop', function() {
                element.style.opacity = 1;
            })
            .play();
    });
}

$root.prototype.fadeOut = function(opacity = 0) {
    this.objects.forEach(element => {
        Animation('timing-function: ease; duration: 0.6s; from-opacity: 100%; to-opacity: ' + opacity + '%; fill-mode: forwards;')
        .apply(element)
        .resetOnStop()
        .on('stop', function() {            
            element.style.opacity = opacity / 100;
            if (opacity == 0 && element.style.position == 'absolute') {
                element.hidden = true;
            }
        }).play();
    });
}

$root.prototype.slideIn = function(from = 'left') {
    let start = 'x(-120).y(0)';
    if (from == 'right') {
        start = 'x(120).y(0)';
    }
    else if (from == 'up') {
        start = 'x(0).y(100)';
    }
    else if (from == 'down') {
        start = 'x(0).y(-100)';
    }
    this.objects.forEach(element => {
        element.hidden = false;
        Animation('timing-function: ease; duration: 0.6s; from: ' + start + ' 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;').apply(element).play();
    });
}

$root.prototype.slideOut = function(to) {
    let end = 'x(-120).y(0)';
    if (to == 'right') {
        end = 'x(120).y(0)';
    }
    else if (to == 'up') {
        end = 'x(0).y(-100)';
    }
    else if (to == 'down') {
        end = 'x(0).y(100)';
    }
    this.objects.forEach(element => {
        Animation('timing-function: ease; duration: 0.6s; from: x(0).y(0) 100% 100%; to: ' + end + ' 100% 0%; fill-mode: forwards;')
        .apply(element)
        .on('stop', function() {
            element.hidden = true;
        }).play();
    });  
}

/*
@keyframes sunrise {
    0%|from {
            bottom: 0;
        left: 340px;
        background: #f00;
    }
    33% {
        bottom: 340px;
        left: 340px;
        background: #ffd630;
    }
    66% {
        bottom: 340px;
        left: 40px;
        background: #ffd630;
    }
    100%|to {
        bottom: 0;
        left: 40px;
        background: #f00;
    }
}

#sun.animate {
 animation-name: sunrise;
 animation-duration: 10s|2000ms;
 animation-timing-function: ease|ease-in|ease-out|linear|;
 animation-iteration-count: 1|infinite;
 animation-direction: normal|alternate|reverse|alternate-reverse;
 animation-delay: 5s|ms; 延时，可以为负
 animation-play-state: running|paused;
 animation-fill-mode: forwards|backwards;
}
*/