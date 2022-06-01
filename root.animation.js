//-----------------------------------------------------------------------
// Animation 动画支持
//-----------------------------------------------------------------------

/*
Animation(settings).apply(element).on('start', func).on('stop', func).play();


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

    this.onstart = null; //function(element) {};
    this.onstop = null; //function(element) {};
}

Animation.Entity.prototype.on = function(eventName, func) {
    // if (eventName == 'start') {
    //     this.element.onanimationstart = func;
    // }
    // else if (eventName == 'stop') {
    //     this.element.onanimationend = func;
    // }

    this[eventName.toLowerCase().prefix('on')] = func;
    
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
            this.element.id = 'animation_object_' + String.shuffle(11);
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
        Event.fire(this, 'onstart', this.element);
        
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
                        $s('#__AnimationStyleSheet_' + a.element.id).remove();
                    }
                    Event.fire(a, 'onstop', a.element);              
                    window.clearTimeout(Animation.timer[a.element.id]);
                    delete Animation.timer[a.element.id];
                }, Animation.parseTimeOut(this.settings.duration, this.settings.delay));
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

//未来考虑使用 Element.animate 方法代替
HTMLElement.prototype.play = function(settings) {
    Animation(settings).apply(this).play();
    return this;
}

HTMLElement.prototype.resetAnimation = function() {
    this.classList.remove('Animation_' + this.id);
}

HTMLElement.prototype.move = function(distanceX = 100, distanceY = 0, duration = 0.6) {
    Animation(`timing-function: ease; duration: ${duration}s; from-position: x(0).y(0); to-position: x(${distanceX}).y(${distanceY}); fill-mode: forwards;`).apply(this).play();
    return this;
}

//opacity 0 ~ 1
HTMLElement.prototype.fadeIn = function(opacity = 0, duration = 0.6) {
    
    if (this.hidden) {
        this.hidden = false;
    }

    Animation('timing-function: ease; duration: ' + duration + 's; from-opacity: ' + ($parseFloat(opacity, 0) * 100) + '%; to-opacity: 100%; fill-mode: forwards;')
        .apply(this)
        .resetOnStop()
        .on('stop', function(element) {
            element.style.opacity = 1;
        })
        .play();

    return this;
}

//opacity 0 ~ 1
HTMLElement.prototype.fadeOut = function(opacity = 0, duration = 0.6) {
    opacity = $parseFloat(opacity, 0) * 100;

    if (this.visible) {
        Animation('timing-function: ease; duration: ' + duration + 's; from-opacity: 100%; to-opacity: ' + opacity + '%; fill-mode: forwards;')
        .apply(this)
        .resetOnStop()
        .on('stop', function(element) {            
            element.style.opacity = opacity / 100;
            if (opacity == 0 && element.style.position == 'absolute') {
                element.hidden = true;
            }
        }).play();
    }

    return this;
}

HTMLElement.prototype.slideIn = function(distanceX = '-w', distanceY = 0, duration = 0.6) {
   
    if (typeof(distanceX) == 'string') {
        distanceX = distanceX.replace('w', this.offsetWidth).toInt();
    }

    if (distanceX > 0) {
        distanceX = distanceX.max(120).min(500);
    }
    else if (distanceX < 0) {
        distanceX = distanceX.min(-120).max(-500);
    }

    if (typeof(distanceY) == 'string') {
        distanceY = distanceY.replace('h', this.offsetHeight).toInt();
    }

    if (distanceY > 0) {
        distanceY = distanceY.max(100).min(400);
    }
    else if (distanceY < 0) {
        distanceY = distanceY.min(-100).max(-400);
    }
    
    duration = duration.max(Math.abs(distanceX) / 400).max(Math.abs(distanceY) / 400).round(1);

    this.hidden = false;
    Animation('timing-function: ease; duration: ' + duration + 's; from: x(' + distanceX + ').y(' + distanceY + ') 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;').apply(this).play();

    return this;
}

HTMLElement.prototype.slideOut = function(distanceX = 'w', distanceY = 0, duration = 0.6, hidden = false) {

    if (typeof(distanceX) == 'string') {
        distanceX = distanceX.replace('w', this.offsetWidth).toInt();
    }

    if (distanceX > 0) {
        distanceX = distanceX.max(120).min(500);
    }
    else if (distanceX < 0) {
        distanceX = distanceX.min(-120).max(-500);
    }

    if (typeof(distanceY) == 'string') {
        distanceY = distanceY.replace('h', this.offsetHeight).toInt();
    }

    if (distanceY > 0) {
        distanceY = distanceY.max(100).min(400);
    }
    else if (distanceY < 0) {
        distanceY = distanceY.min(-100).max(-400);
    }

    duration = duration.max(Math.abs(distanceX) / 400).max(Math.abs(distanceY) / 400).round(1);

    Animation('timing-function: ease; duration: ' + duration + 's; from: x(0).y(0) 100% 100%; to: x(' + distanceX + ').y(' + distanceY + ') 100% 0%; fill-mode: forwards;').apply(this).play();

    this.onanimationend = function() {
        if (hidden) {
            this.hidden = true;
        }
        this.onanimationend = null;
    }

    return this;
}

Message = {
    red: function(message) {
        return new Message.Entity(message, 'red');
    },
    green: function(message) {
        return new Message.Entity(message, 'green');
    },
    blue: function(message) {
        return new Message.Entity(message, 'blue');
    },
    yellow: function(message) {
        return new Message.Entity(message, 'yellow');
    },
    orange: function(message) {
        return new Message.Entity(message, 'orange');
    }
}

Message.Entity = function(message, color) {
    this.message = message;
    this.color = color;
}

Message.Entity.prototype.show = function(seconds = 0) {
    if (this.message != '') {
        let box = $s('#__MessageBox');
        if (box.hidden) {
            box.show();
        }

        let element = $create('DIV', { className: 'message-piece message-' + this.color, innerHTML: this.message }, { }, { sign: 'PIECE' });
        box.insertAdjacentElement('afterBegin', element);

        element.slideIn(-100);
        if (seconds > 0) {
            Message.hide(element, seconds);
        }
    }
}

Message.Entity.prototype.hideLast = function() {
    let last = $s('#__MessageBox').lastElementChild;
    if (last != null) {
        Message.play(last);
    }    
    return this;
}

Message.hide = function(target, seconds = 0) {
    if (target.hasAttribute('sign')) {
        if (target.timer == undefined) {
            if (seconds > 0) {
                target.timer = window.setTimeout(function() {
                    Message.play(target);
                }, seconds * 1000);
            }
            else {
                Message.play(target);
            }
        }
        else {
            window.clearTimeout(target.timer);
            Message.play(target);
        }
    }
    else if (target.children.length == 0) {
        target.hidden = true;
    }
}

Message.play = function(target) {
    let to = 'x(0).y(60)';
    if (target.nextElementSibling != null) {
        to = 'x(120).y(0)';
    }
    Animation('timing-function: ease; duration: 0.8s; from: x(0).y(0) 100% 100%; to: ' + to + ' 100% 0%; fill-mode: forwards;')
        .apply(target)
        .on('stop', function() {      
            if (target.parentNode.children.length == 1) {
                target.parentNode.hidden = true;
            }
            target.remove();            
        }).play();
}

document.on('ready', function() {
    document.body.appendChild($create('DIV', { id: '__MessageBox' }, { position: 'fixed', top: '60px', width: '500px', left: '0px', right: '0px', margin: '0px auto' }));
    $s('#__MessageBox').on('click', function(ev) {
        Message.hide(ev.target);
    });

    $root.appendClass(`
        .message-piece { text-align: center; padding: 12px 16px; border-radius: 3px; font-size: 0.875rem; box-shadow: 1px 2px 3px #CCCCCC; }
        .message-red { background-color: #FFDDDD; color: #CC0000; margin: 2px auto; border: 1px solid #FF9999; }
        .message-green { background-color: #DDFFDD; color: #009900; margin: 2px auto; border: 1px solid #33CC33; }
        .message-blue { background-color: #DDDDFF; color: #0000CC; margin: 2px auto; border: 1px solid #9999FF; }
        .message-yellow { background-color: #FFFFCC; color: #CC9900; margin: 2px auto; border: 1px solid #FFCC33; }
        .message-orange { background-color: #FFCC99; color: #FF6633; margin: 2px auto; border: 1px solid #FF9966; }
    `);
});