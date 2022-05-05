// www.qross.io
//-----------------------------------------------------------------------
// root.popup.js
// popup in window

// 页面上正在打开的 Popup 对象
document.popup = null;

class HTMLPopupElement extends HTMLElement { 
    #initialized = false;

    initialize() {
        if (!this.#initialized) {
            this.hidden = true;
            this.style.visibility = 'hidden';
            this.style.overflow = (this.querySelector('div.popup-scroll') == null ? 'auto' : 'hidden');
            this.#initialized = true;
    
            if (this.openButton == null) {
                this.openButton = $('#' + this.id + '_OpenButton');
            }
            if (this.closeButton == null) {
                this.closeButton = $('#' + this.id + '_CloseButton');
            }
            if (this.confirmButton == null) {
                this.confirmButton = $('#' + this.id + '_ConfirmButton');
            }
            if (this.cancelButton == null) {
                    this.cancelButton = $('#' + this.id + '_CancelButton');
                }
            
            if (this.openingAnimation == '') {
                this.openingAnimation = this.animation;
            }
            if (this.closingAnimation == '') {
                this.closingAnimation = 'direction: reverse; ' + this.openingAnimation;
            }
       
            let popup = this;
            this.openButton?.on('click', ev => popup.open(ev));
            this.closeButton?.on('click', ev => popup.close(ev));
            this.confirmButton?.on('click', ev => popup.confirm(ev));
            this.cancelButton?.on('click', ev => popup.cancel(ev));
    
            HTMLElement.interactEvents(this);
    
            PopupMask.initialize();
        }
    }
}

window.customElements.define('pop-up', HTMLPopupElement);

$root.appendClass(`
    pop-up { display: block; border: 1px solid #808080; padding: 1px; background-color: #FFFFFF; box-shadow: 2px 4px 6px #999999; position: absolute; z-index: 1001 }
`);

$enhance(HTMLPopupElement.prototype)
    .declare({
        type: 'window|sidebar|menu',

        offsetX: 0,
        offsetY: 0,
        modal: true,
        noScrolling: false,

        animation: 'timing-function: ease; duration: 0.8s; from: random(x(0).y(-150),x(0).y(150),x(-150).y(0),x(150).y(0)) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;',
        openingAnimation: '',
        closingAnimation: '',
        openingFromPosition: 'x(0).y(0)',
        openingToPosition: 'x(0).y(0)',
        openingFromOpacity: '100%',
        openingToOpacity: '100%',
        openingFromScale: '100%',
        openingToScale: '100%',
        openingDuration: '0.8s', //1s, 800ms
        closingFromPosition: 'x(0).y(0)',
        closingToPosition: 'x(0).y(0)',
        closingFromOpacity: '100%', //0-100
        closingToOpacity: '100%', //0-100
        closingFromScale: '100%', //0-100,  100%.50%
        closingToScale: '100%', //0-100
        closingDuration: '0.8s', //1s, 800ms

        maskColor: '#999999',
        maskOpacity: 0.4
    })
    .extend('onshow', 'onhide', 'onopen', 'onclose', 'onconfirm', 'oncancel', 'onconfirm+')
    .define({
        positionX: {
            get() {
                let x = (this.getAttribute('position-x') || this.getAttribute('positionX') || 'center').trim().toLowerCase();
                if (/^(center|left|right|event)$/.test(x)) {
                    return x;                    
                }
                else if (/^-?\d+/.test(x)) {
                    return $parseFloat(x, 0);
                }
                else {
                    return 'center';
                }
            },
            set(x) {
                this.setAttribute('position-x', x);
            }
        },
        positionY: {
            get() {
                let y = (this.getAttribute('position-y') || this.getAttribute('positionY') || 'middle').trim().toLowerCase();
                if (/^(middle|top|bottom|event)$/.test(y)) {
                    return y;
                }
                else if (/^-?\d+/.test(y)) {
                    return $parseFloat(y, 0);
                }
                else {
                    return 'middle';
                }
            },
            set(y) {
                this.setAttribute('position-y', y);
            }
        }
    })
    .describe({        
        openButton: '$',
        closeButton: '$',
        confirmButton: '$',
        cancelButton: '$',
        hidings: '$$',
        reference: '$'
    });

HTMLPopupElement.prototype.show = function(quick, ev) {
    //如果有其他的popup显示，就隐藏	
    if(document.popup != null) {
        document.popup.hide(true);
    }

    //是否快速显示
    if (!quick) {
        quick = (window.Animation == null || Animation.Entity == null || this.animation == '');
    }

    //隐藏影响popup显示的元素
    this.hidings.forEach(e => e.hide());

    //禁用滚动
    if (this.noScrolling) {
        document.body.style.overflow = 'hidden';
    }    

    //显示Mask
    if(this.modal) {
        PopupMask.show(this.maskColor, this.maskOpacity);
    }

    //显示
    this.hidden = false;
    this.locate(ev);
    this.style.visibility = 'visible';		
    if(!quick) {
        if (window.Animation != null && Animation.Entity != null) {
            Animation(this.$getOpeningAnimation(ev))
                .apply(this)
                .play(ev);
        }
    }

    document.popup = this;
}


HTMLPopupElement.prototype.hide = function(quick, ev) {

    if(this.visible) {
        //是否快速隐藏
        if (quick == null) {
            quick = (window.Animation == null || Animation.Entity == null || this.animation == '');
        }
        
        if(!quick && window.Animation != null && Animation.Entity != null) {
            //动画
            Animation(this.$getClosingAnimation(ev))
                .apply(this)
                .on('stop', function (popup) {
                    popup.style.visibility = 'hidden';
                    popup.hidden = true;
                    //启用滚动
                    if (popup.noScrolling) {
                        document.body.style.overflow = 'auto';
                    }                        
                }).play(ev);
        }
        else {		
            //立即隐藏
            this.hidden = true;
            this.style.visibility = 'hidden';
                            
            //启用滚动
            if (this.noScrolling) {
                document.body.style.overflow = 'auto';                
            }
        }
        
        //如果有Mask，隐藏
        if(this.modal) {
            PopupMask.hide(this.maskOpacity);
        }
        
        //显示popup打开时隐藏的元素
        this.hidings.forEach(e => e.show());

        document.popup = null;
    }
}

HTMLPopupElement.prototype.open = function(ev) {

    this.initialize();

    if(document.popup == null || document.popup.id != this.id) {
        if(this.dispatchCustomEvent('onopen', { 'event': ev })) {
            this.show(false, ev);			
            this.dispatchCustomEvent('onshow', { 'event': ev });
        }
    }
    return this;
}

HTMLPopupElement.prototype.close = function(ev) {

    if(document.popup == null || document.popup.id == this.id) {
        if(this.dispatchCustomEvent('onclose', { 'event': ev })) {
            this.hide(false, ev);
            this.dispatchCustomEvent('onhide', { 'event': ev });
        }
    }
    return this;
}

HTMLPopupElement.prototype.confirm = function(ev) {
    if(document.popup == null || document.popup.id == this.id) {
        if(this.dispatchCustomEvent('onconfirm', { 'event': ev })) {
            this.hide(this, false, ev);
            this.dispatchCustomEvent('onhide', { 'event': ev });
        }
    }
    return this;
}

HTMLPopupElement.prototype.cancel = function(ev) {
    if(document.popup == null || document.popup.id == this.id) {
        if(this.dispatchCustomEvent('oncancel', { 'event': ev })) {
            this.hide(false, ev);
            this.dispatchCustomEvent('onhide', { 'event': ev });
        }
    }
    return this;
}

HTMLPopupElement.prototype.locate = function(ev) {
	/// <summary>为popup定位</summary>
	/// <param name="ev" type="EventArgs"></param>
    
    //自动调整边栏的宽高
    if (this.type == 'sidebar') {
        if (this.positionX == 'center') {
            //上中下边栏全宽
            this.width = window.innerWidth;            
        }
        else {            
            //左右边栏全高, `4`是浏览器中的一个间隔
            this.height = window.innerHeight - 4;            

            if (this.$('div.popup-scroll') != null) {
                let fixed = 0;
                for (let element of this.children) {
                    if (element.className != 'popup-scroll') {                
                        fixed += element.offsetHeight;
                    }
                }
                let height = window.innerHeight - fixed;
                if (height < 400) {
                    height = 400;
                }
                this.$('div.popup-scroll').height = height;
            }            
        }        
    }

    let x = this.getPositionX(this.positionX, ev) + this.offsetX;
    let y = this.getPositionY(this.positionY, ev) + this.offsetY;

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    this.left = x;
    this.top = y;

    this.dispatchCustomEvent('onlocate', { 'x': x, 'y': y });
}

HTMLPopupElement.prototype.$getOpeningAnimation = function(ev) {
    if (this.type == 'sidebar') {
        //sidebar的自定义动画无效
        if (this.positionX == 'center') {
            if (this.positionY == 'top') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(-' + this.height + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; ';
            }
            else if (this.position.y == 'bottom') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(' + this.height + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
            }
            else {
                return 'timing-function: ease; duration: 0.5s; from: x(0).y(0) 100% 50%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
            }
        }
        else if (this.positionX == 'left') {
            return 'timing-function: ease; duration: 0.6s; from: x(-' + this.width + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
        }
        else {
            return 'timing-function: ease; duration: 0.6s; from: x(' + this.width + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
        }
    }
    else {
        if (this.openingFromPosition == this.openingToPosition && this.openingFromOpacity == this.openingToOpacity && this.openingFromScale == this.openingToScale) {
            return this.openingAnimation;
        }
        else {
            return 'timing-function: ease; duration: ' + this.openingDuration
                         + '; from: ' + (this.openingFromPosition.includes(',') ? 'random(' + this.openingFromPosition + ')' : this.openingFromPosition)
                         + ' ' + this.openingFromScale + ' ' + this.openingFromOpacity + '; to: '
                         + (this.openingToPosition.includes(',') ? 'random(' + this.openingToPosition + ')' : this.openingToPosition)
                         + ' ' + this.openingToScale + ' ' + this.openingToOpacity + '; fill-mode: forwards;'
        }
    }    
}

HTMLPopupElement.prototype.$getClosingAnimation = function(ev) {
    if (this.type == 'sidebar') {
        //sidebar的自定义动画无效
        if (this.positionX == 'center') {
            if (this.positionY == 'top') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(-' + this.height + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
            }
            else if (this.positionY == 'bottom') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(' + this.height + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
            }
            else {
                return 'timing-function: ease; duration: 0.5s; from: x(0).y(0) 100% 50%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
            }
        }
        else if (this.positionX == 'left') {
            return 'timing-function: ease; duration: 0.6s; from: x(-' + this.width + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
        }
        else {
            return 'timing-function: ease; duration: 0.6s; from: x(' + this.width + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
        }
    }
    else {
        if (this.closingFromPosition == this.closingToPosition && this.closingFromOpacity == this.closingToOpacity && this.closingFromScale == this.closingToScale) {
            return this.closingAnimation;
        }
        else { 
            return 'timing-function: ease; duration: ' + this.closingDuration
                        + '; from: ' + (this.closingFromPosition.includes(',') ? 'random(' + this.closingFromPosition + ')' : this.closingFromPosition)
                        + ' ' + this.closingFromScale + ' ' + this.closingFromOpacity + '; to: '
                        + (this.closingToPosition.includes(',') ? 'random(' + this.closingToPosition + ')' : this.closingToPosition)
                        + ' ' + this.closingToScale + ' ' + this.closingToOpacity + '; fill-mode: forwards;'
        }
    }
}

HTMLPopupElement.prototype.getPositionX = function (x, ev) {
    /// <summary>从文本解析坐标X值</summary>
    // <value name="x" type="String">x坐标值</value>

    if (typeof (x) == 'number') {
        return x;
    }
    else if (typeof (x) == 'string') {
        if (this.type != 'menu') {
            switch(x) {
                case 'event':
                    x = Math.round($root.scrollLeft + (ev == null ? 0 : ev.clientX));
                    break;
                case 'left':
                    x = this.getOffsetLeft('left');
                    break;
                case 'center':
                    x = this.getOffsetLeft('center');
                    break;
                case 'right':
                    x = this.getOffsetLeft('right');
                    break;
            }
        }
        else {
            switch(x) {
                case 'left':
                    x = this.reference.left;
                    break;
                case 'center':
                    x =  this.reference.left + this.reference.width / 2 - this.element.width / 2;
                    break;
                case 'right':
                    x = this.reference.left + this.reference.width - this.element.width;
                    break;
            }
        }

        return $parseInt(x);
    }
    else {
        return 0;
    }
}

HTMLPopupElement.prototype.getPositionY = function (y, ev) {
    /// <summary>从文本解析坐标X值</summary>
    // <value name="x" type="String">x坐标值</value>

    if (typeof (y) == 'number') {
        return y;
    }
    else if (typeof (y) == 'string') {
        if (this.type != 'menu') {
            switch(y) {
                case 'event':
                    y = Math.round($root.scrollTop + (ev?.clientY ?? 0));
                    break;
                case 'top':
                    y = this.getOffsetTop('top');
                    break;
                case 'middle':
                    y = this.getOffsetTop('middle');
                    break;
                case 'bottom':
                    y = this.getOffsetTop('bottom');
                    break;
            }
        }
        else {
            switch(y) {
                case 'top':
                    y = this.reference.top - this.element.height;
                    break;
                case 'bottom':
                    y = this.reference.top + this.reference.height;
                    break;
            }
        }
        
        return $parseInt(y);
    }
    else {
        return 0;
    }
}

HTMLPopupElement.prototype.getOffsetLeft = function (p) {
    /// <summary>获得x轴的坐标位置</summary>

    let v = $root.scrollLeft; //left
    if (p == 'center') {
        //document.documentElement.clientWidth
        v = (window.innerWidth - this.width) / 2 + $root.scrollLeft;
    }
    else if (p == 'right') {
        v = window.innerWidth - this.width + $root.scrollLeft;
    }
    return Math.round(v);
}

HTMLPopupElement.prototype.getOffsetTop = function (p) {
    /// <summary>获得y轴的坐标位置</summary>

    let v = $root.scrollTop; //top
    if (p == 'middle') {
        //document.documentElement.clientHeight
        v = (window.innerHeight - this.height) / 2 + $root.scrollTop;
    }
    else if (p == 'bottom') {
        v = window.innerHeight - this.height + $root.scrollTop;
    }
    return Math.round(v);
}

HTMLPopupElement.resize = function() {
	/// <summary>当可见窗口大小改变时</summary>	
	//重设Mask层的大小
	PopupMask.resize();
		
	if(document.popup != null) {		
        document.popup.locate();
	}
}

PopupMask = {};

PopupMask.initialize = function() {
    if ($('#__PopupMask') == null) {
        document.body.insertAdjacentHTML('beforeEnd', '<div id="__PopupMask" style="background-color:#666666; z-index:1000; position:absolute; visibility:hidden; left:0; top:0;" hidden>&nbsp;</div>');
    }
}

PopupMask.show = function(color, opacity) {
    /// <summary>显示 Mask<summary>
    PopupMask.resize();

    $('#__PopupMask')
        .show()
        .setStyle('visibility', 'visible')
        .setStyle('backgroundColor', color)
        .setStyle('opacity', opacity);

    if (window.Animation != null && Animation.Entity != null) {
        Animation('timing-function: ease; duration: 0.5s; from:x(0).y(0) 100% 20%; to:x(0).y(0) 100% ' + (opacity * 100) + '%; fill-mode: forwards;')
         .apply('#__PopupMask')
         .play();
    }
}

PopupMask.hide = function(opacity) {

    /// <summary>隐藏 Mask<summary>
    if (window.Animation != null && Animation.Entity != null) {
        Animation('timing-function: ease; duration: 0.5s; from:x(0).y(0) 100% ' + (opacity * 100) + '%; to:x(0).y(0) 100% 0%; fill-mode: forwards;')
                 .apply('#__PopupMask')
                 .on('stop', function() {
                                 $('#__PopupMask').setStyle('visibility', 'hidden').hide();
                              })
                 .play();
    }
    else {
        $('#__PopupMask')
        .setStyle('visibility', 'hidden')
        .hide()
    }
}

PopupMask.resize = function() {
    /// <summary>重新设置Mask的宽度和高度</summary>
    let sx = document.documentElement.scrollWidth;
    if (sx < document.body.scrollWidth) {
        sx = document.body.scrollWidth;
    }
    let sy = document.documentElement.scrollHeight;
    if (sy < document.body.scrollHeight) {
        sy = document.body.scrollHeight;
    }

    $('#__PopupMask')
        .setStyle('width', sx - 1 + 'px')
        .setStyle('height', sy - 1 + 'px');
}


$root.alert = function(message, confirmButton, title, ev) {
    if ($('#AlertPopup') == null) {
        let div = $create('POP-UP', { 'id': 'AlertPopup' }, {}, { 'position': 'center,middle', 'offsetY': -100, 'maskColor': '#999999', animation: 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;' });
        div.insertBeforeEnd('DIV', { id: 'AlertPopup_CloseButton', className: 'popup-close-button', innerHTML: '<i class="iconfont icon-close"></i>' });
        div.insertBeforeEnd('DIV', { className: 'popup-bar', innerHTML: '<i class="iconfont icon-warning-circle"></i> <span id="AlertPopupTitle" class="popup-title">Message</span>' });
        div.insertBeforeEnd('DIV', { id: 'AlertContent', className: 'popup-content' }, { textAlign: 'center', color: 'var(--primary)' });
        div.insertBeforeEnd('DIV', { className: 'popup-button', innerHTML: '<button id="AlertPopup_ConfirmButton" type="button" class="normal-button gray-button">  OK  </button' });
        document.body.appendChild(div);

        if ($('#AlertPopup_ConfirmButton').width < 80) {
            $('#AlertPopup_ConfirmButton').width = 80;
        }
    }

    if (title != null) {
        $('#AlertPopupTitle').html = title;
    }

    $('#AlertContent').setHTML(message?.text ?? message).setClass(message?.class ?? '.');
    $('#AlertPopup').style.display = '';
    if ($('#AlertPopup').width < 360) {
        $('#AlertPopup').width = 360;
    }

    if (confirmButton != null) {
        if (typeof(confirmButton) == 'string') {
            confirmButton = { text: confirmButton };
        }
        $('#AlertPopup_ConfirmButton').setHTML(' ' + (confirmButton.text ?? ' OK ') + ' ').setClass(confirmButton.class || '.').setIcon(confirmButton.icon || '');
    }

    return $('#AlertPopup').open(ev);
}

$root.confirm = function(message, confirmButton, cancelButton, title, ev = null) {
    if ($('#ConfirmPopup') == null) {
        let div = $create('POP-UP', { 'id': 'ConfirmPopup' }, {}, { 'position': 'center,middle', offsetY: -100, 'maskColor': '#999999', animation: 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;' });
        div.insertBeforeEnd('DIV', { id: 'ConfirmPopup_CloseButton', className: 'popup-close-button', innerHTML: '<i class="iconfont icon-close"></i>' });
        div.insertBeforeEnd('DIV', { className: 'popup-bar', innerHTML: '<i class="iconfont icon-question-circle"></i> <span id="ConfirmPopupTitle" class="popup-title">Confirm</span>' });
        div.insertBeforeEnd('DIV', { id: 'ConfirmContent', className: 'popup-content' }, { textAlign: 'center' });
        div.insertBeforeEnd('DIV', { className: 'popup-button', innerHTML: '<button id="ConfirmPopup_ConfirmButton" type="button" class="normal-button gray-button"> OK </button> &nbsp; &nbsp; <button id="ConfirmPopup_CancelButton" type="button" class="normal-button gray-button"> Cancel </button>' });
        document.body.appendChild(div);

        let w = Math.max($('#ConfirmPopup_ConfirmButton').width, $('#ConfirmPopup_CancelButton').width);
        $('#ConfirmPopup_ConfirmButton').width = w;
        $('#ConfirmPopup_CancelButton').width = w;
    }

    if (title != null) {
        $('#ConfirmPopupTitle').html = title;
    }

    $('#ConfirmContent').setHTML(message?.text ?? message).setClass(message?.class ?? '.');
    $('#ConfirmPopup').style.display = '';
    if ($('#ConfirmPopup').width < 360) {
        $('#ConfirmPopup').width = 360;
    }

    if (confirmButton != null) {
        if (typeof(confirmButton) == 'string') {
            confirmButton = { text: confirmButton };
        }
        $('#ConfirmPopup_ConfirmButton').setHTML(' ' + (confirmButton.text ?? 'OK') + ' ').setClass(confirmButton.class || '.').setIcon(confirmButton.icon || '');
    }

    if (cancelButton != null) {
        if (typeof(cancelButton) == 'string') {
            cancelButton = { text: cancelButton };
        }
        $('#ConfirmPopup_CancelButton').setHTML(' ' + (cancelButton.text ?? 'Cancel') + ' ').setClass(cancelButton.class || '.').setIcon(cancelButton.icon || '');
    }

    return $('#ConfirmPopup').open(ev);
}

$root.prompt = function(message, input, confirmButton, cancelButton, title, ev) {
    if ($('#PromptPopup') == null) {
        let div = $create('POP-UP', { 'id': 'PromptPopup' }, {}, { 'position': 'center,middle', offsetY: -100, 'maskColor': '#999999', animation: 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;' });
        div.insertBeforeEnd('DIV', { id: 'PromptPopup_CloseButton', className: 'popup-close-button', innerHTML: '<i class="iconfont icon-close"></i>' });
        div.insertBeforeEnd('DIV', { className: 'popup-bar', innerHTML: '<i class="iconfont icon-edit"></i> <span id="PromptPopupTitle" class="popup-title">Prompt</span>' });
        div.insertBeforeEnd('DIV', { id: 'PromptContent', className: 'popup-content' });
        div.insertBeforeEnd('DIV', { className: 'popup-button', innerHTML: '<button id="PromptPopup_ConfirmButton" watch="#PromptTextBox" class="normal-button gray-button"> OK </button> &nbsp; &nbsp; <button id="PromptPopup_CancelButton" type="button" class="normal-button gray-button"> Cancel </button' });
        document.body.appendChild(div);

        $('#PromptContent').insertBeforeEnd('DIV', { id: 'PromptMessage' }, {})
            .insertBeforeEnd('DIV', { id: 'PromptInput' }, { margin: '10px 0px 6px 0px' })
            .insertBeforeEnd('DIV', { id: 'PromptHint' }, { fontSize: '0.875rem' });

        let w = Math.max($('#PromptPopup_ConfirmButton').width, $('#PromptPopup_CancelButton').width);
        $('#PromptPopup_ConfirmButton').width = w;
        $('#PromptPopup_CancelButton').width = w;
    }

    if (title != null) {
        $('#PromptPopupTitle').html = title;
    }

    $('#PromptMessage').setHTML(message?.text ?? message).setClass(message?.class ?? '.');

    input ??= 'text';
    if (typeof(input) != 'object') {
        input = { 'type': input };
    }

    let textBox = $create('INPUT', { id: 'PromptTextBox', size: 50, hint: '#PromptHint' });
    for (let name in input) {
        if (textBox[name] !== undefined) {
            textBox[name] = input[name];
        }
        else {
            textBox.setAttribute(name, inputOptions[name]);
        }
    }    
    textBox.initializeInputable?.();
    $('#PromptInput').innerHTML = '';
    $('#PromptInput').appendChild(textBox);

    if (confirmButton != null) {
        if (typeof(confirmButton) == 'string') {
            confirmButton = { text: confirmButton };
        }
        $('#PromptPopup_ConfirmButton').setHTML(' ' + (confirmButton.text ?? 'OK') + ' ').setClass(confirmButton.class || '.').setIcon(confirmButton.icon || '');
    }
    $('#PromptPopup_ConfirmButton').initialize?.();
   
    if (cancelButton != null) {
        if (typeof(cancelButton) == 'string') {
            cancelButton = { text: cancelButton };
        }
        $('#PromptPopup_CancelButton').setHTML(' ' + (cancelButton.text ?? 'Cancel') + ' ').setClass(cancelButton.class || '.').setIcon(cancelButton.icon || '');
    }

    return $('#PromptPopup').on('show', function() {
        textBox.focus();
    }).open(ev);
}

$root.prompt.getInputValue = function() {
    return $('#PromptTextBox').value;
}

$root.prompt.setInputValue = function(value) {
    $('#PromptTextBox').value = value;
}

document.on('ready', function () {

    $$('pop-up').forEach(p => p.initialize());

    window.on('resize', HTMLPopupElement.resize);

    PopupMask.initialize();
    PopupMask.resize();

    window.on('message', function(ev) {
        switch(ev.data) {
            case 'CLOSE-POPUP': 
                document.popup?.close();
                break;
            default:
                break;
        }
    });
});