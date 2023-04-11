// www.qross.io
//-----------------------------------------------------------------------
// root.popup.js
// popup in window

// 页面上正在打开的 Popup 对象
document.popup = null;

class HTMLPopupElement extends HTMLElement { 

    #initialize = false;

    #openButton = this.getAttribute('open-button')?.$();    
    #closeButton = this.getAttribute('close-button')?.$();
    #confirmButton = this.getAttribute('confirm-button')?.$();
    #cancelButton = this.getAttribute('cancel-button')?.$();

    #hidings = $$(this.getAttribute('hidings'));
    #reference = $(this.getAttribute('reference'));

    get type() {
        return this.getAttribute('type');
    }

    set type(type)  {
        this.setAttribute('type', Enum('window|sidebar|menu').validate(type));
    }

    get positionX() {
        let x = this.getAttribute('position-x', 'center').trim().toLowerCase();
        if (/^(center|left|right|event)$/.test(x)) {
            return x;                    
        }
        else if (/^-?\d+/.test(x)) {
            return $parseFloat(x, 0);
        }
        else {
            return 'center';
        }
    }

    set positionX(x) {
        this.setAttribute('position-x', x);
    }

    get positionY() {
        let y = this.getAttribute('position-y', 'middle').trim().toLowerCase();
        if (/^(middle|top|bottom|event)$/.test(y)) {
            return y;
        }
        else if (/^-?\d+/.test(y)) {
            return $parseFloat(y, 0);
        }
        else {
            return 'middle';
        }
    }
        
    set positionY(y) {
        this.setAttribute('position-y', y);
    }

    get offsetX() {
        return $parseInt(this.getAttribute('offset-x'), 0);
    }

    set offsetX(offset) {
        this.setAttribute('offset-x', offset);
    }

    get offsetY() {
        return $parseInt(this.getAttribute('offset-y'), 0);
    }

    set offsetY(offset) {
        this.setAttribute('offset-y', offset);
    }

    get modeal() {
        return $parseBoolean(this.getAttribute('modal'), true);
    }

    set modal(modal) {
        this.setAttribute('modal', modeal);
    }

    get noScrolling() {
        return $parseBoolean(this.getAttribute('no-scrolling'), false);
    }

    set noScrolling(scrolling) {
        this.setAttribute('no-scrolling', scrolling);
    }

    get theme() {
        return this.getAttribute('theme', '');
    }

    set theme(theme) {
        this.setAttribute('theme', theme);
    }

    get minWidth() {
        return $parseInt(this.getAttribute('min-width'), 0);
    }

    set minWidth(width) {
        this.setAttribute('min-width', width);
    }

    get buttonMinWidth() {
        return $parseInt(this.getAttribute('button-min-width'), 0);
    }

    set buttonMinWidth(width) {
        this.setAttribute('button-min-width', width);
    }

    get titleBarText() {
        return this.getAttribute('title-bar-text', '');
    }

    set titleBarText(text) {
        this.setAttribute('title-bar-text', text);
        this.$('span[sign=title]').innerHTML = text;
    }

    get titleBarIcon() {
        return this.getAttribute('title-bar-icon');
    }

    set titleBarIcon(icon) {
        this.setAttribute('title-bar-icon', icon);
        this.$('div[sign=title]')?.setIcon(icon);
    }

    get confirmButtonText() {
        return this.getAttribute('confirm-button-text', 'OK');        
    }

    set confirmButtonText(text) {
        this.setAttribute('confirm-button-text', text);
        this.confirmButton?.setHTML(text);
    }

    get confirmButtonClass() {
        return this.getAttribute('confirm-button-class', 'normal-button gray-button');
    }

    set confirmButtonClass(className) {
        this.setAttribute('confirm-button-class', className);
        this.confirmButton?.setClass(className);
    }

    get confirmButtonIcon() {
        return this.getAttribute('confirm-button-icon', '');
    }

    set confirmButtonIcon(icon) {
        this.setAttribute('confirm-button-icon', icon);
        this.confirmButton?.setIcon(icon);
    }

    get cancelButtonText() {
        return this.getAttribute('cancel-button-text', '');
    }

    set cancelButtonText(text) {
        this.setAttribute('cancel-button-text', text);
        this.cancelButton?.setHTML(text);
    }

    get cancelButtonClass() {
        return this.getAttribute('cancel-button-class', 'normal-button gray-button');
    }

    set cancelButtonClass(className) {
        this.setAttribute('cancel-button-class', className);
        this.cancelButton?.setClass(className);
    }

    get cancelButtonIcon() {
        return this.getAttribute('cancel-button-icon', '');
    }

    set cancelButtonIcon(icon) {
        this.setAttribute('cancel-button-icon', icon);
        this.cancelButton?.setIcon(icon);
    }

    get openButton() {
        return this.#openButton;
    }

    set openButton(button) {
        this.#openButton = $parseElement(button, 'openButton');
    }

    get closeButton() {
        return this.#closeButton;        
    }

    set closeButton(button) {
        this.#closeButton = $parseElement(button, 'closeButton');
    }

    get confirmButton() {
        return this.#confirmButton;        
    }        

    set confirmButton(button) {
        this.#confirmButton = $parseElement(button, 'confirmButton');
    }

    get cancelButton() {
        return this.#cancelButton;        
    }

    set cancelButton(button) {
        this.#cancelButton = $parseElement(button, 'cancelButton');
    }

    get successText() {
        return this.getAttribute('success-text', '');
    }

    set successText(text) {
        this.setAttribute('success-text', text);
    }

    get failureText() {
        return this.getAttribute('failure-text', '');
    }

    set failureText(text) {
        this.setAttribute('failure-text', text);
    }

    get exceptionText() {
        return this.getAttribute('exception-text', 'Exception: {error}');
    }

    set exceptionText(text) {
        this.setAttribute('exception-text', text);
    }

    get hidings() {
        return this.#hidings;
    }

    set hidings(hidings) {
        this.#hidings = $parseElements(hidings, 'hidings');
    }

    get reference() {
        return this.#reference;
    }

    set reference(reference) {
        this.#reference = $parseElement(reference, 'reference');
    }

    get maskColor() {
        return this.getAttribute('mask-color', '#999999');
    }

    set maskColor(color) {
        this.setAttribute('mask-color', color);
    }

    get maskOpacity() {
        return $parseFloat(this.getAttribute('mask-opacity'), 0.4);
    }

    set maskOpacity(opacity) {
        this.setAttribute('mask-opacity', opacity);
    }

    initialize() {
        if (!this.#initialize) {

            if (this.id == '') {
                this.id = 'Popup_' + String.shuffle(9);
            }

            if (this.theme != '') {
                this.insertAfterBegin('DIV', { className: 'popup-bar', innerHTML: `<i sign="icon" class="iconfont ${this.titleBarIcon}"></i> <span sign="title" class="popup-title">${this.titleBarText}</span>` }, {}, { 'sign': 'title' });
                this.insertAfterBegin('DIV', { id: this.id + '_CloseButton', className: 'popup-close-button', innerHTML: '<i class="iconfont icon-close"></i>' });
                this.insertBeforeEnd('DIV', { className: 'popup-button', 
                    innerHTML: `<button id="${this.id}_ConfirmButton" class="${this.confirmButtonClass}">  ${this.confirmButtonText}  </button>` + 
                        (this.cancelButtonText != '' ? ` &nbsp; &nbsp; <button id="${this.id}_CancelButton" class="${this.cancelButtonClass}">  ${this.cancelButtonText}  </button>` : '')
                 });
            }

            if (this.openButton == null) {
                this.openButton = $('#' + (this.id || 'Popup') + '_OpenButton');
            }
            if (this.closeButton == null) {
                this.closeButton = $('#' + (this.id || 'Popup') + '_CloseButton');
            }
            if (this.confirmButton == null) {
                this.confirmButton = $('#' + (this.id || 'Popup') + '_ConfirmButton');
            }
            if (this.cancelButton == null) {
                this.cancelButton = $('#' + (this.id || 'Popup') + '_CancelButton');
            }

            //button icon
            if (this.theme != '') {
                if (this.confirmButtonIcon != '') {
                    this.confirmButton.setIcon(this.confirmButtonIcon);
                }
                if (this.cancelButtonIcon != '') {
                    this.cancelButton.setIcon(this.cancelButtonIcon);
                }
            }
           
            if (this.openingAnimation == '') {
                this.openingAnimation = this.animation;
            }
            if (this.closingAnimation == '') {
                this.closingAnimation = 'direction: reverse; ' + this.openingAnimation;
            }          

            this.hidden = true;
            this.style.visibility = 'hidden';
            this.style.overflow = (this.querySelector('div.popup-scroll') == null ? 'auto' : 'hidden');

            this.#initialize = true;
        
            let popup = this;
            this.openButton?.on('click', ev => popup.open(ev));
            this.closeButton?.on('click', ev => popup.close(ev));
            this.confirmButton?.on('click', ev => popup.confirm(ev));
            this.cancelButton?.on('click', ev => popup.cancel(ev));    
                        
            Event.interact(this);
        }
    }

    locate (ev) {
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
    
        let x = this.#parsePositionX(this.positionX, ev) + this.offsetX;
        let y = this.#parsePositionY(this.positionY, ev) + this.offsetY;
    
        if (x < 0) x = 0;
        if (y < 0) y = 0;
    
        this.left = x;
        this.top = y;
    
        this.dispatch('onlocate', { 'x': x, 'y': y });
    }

    show (quick, ev) {
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

        if (this.minWidth > 0) {
            if (this.width < this.minWidth) {
                this.width = this.minWidth;
            }
        }
        
        this.confirmButton?.equalizeWidth(this.cancelButton, this.buttonMinWidth);

        this.locate(ev);
        this.style.visibility = 'visible';

        if(!quick) {
            if (window.Animation != null && Animation.Entity != null) {
                Animation(this.#getOpeningAnimation(ev))
                    .apply(this)
                    .play(ev);
            }
        }
    
        document.popup = this;
    }
    
    
    hide (quick, ev) {
    
        if(this.visible) {
            //是否快速隐藏
            if (quick == null) {
                quick = (window.Animation == null || Animation.Entity == null || this.animation == '');
            }
            
            if(!quick && window.Animation != null && Animation.Entity != null) {
                //动画
                Animation(this.#getClosingAnimation(ev))
                    .apply(this)
                    .on('stop', function (popup) {

                        if (popup.minWidth > 0) {
                            popup.style.width = '';
                        }
        
                        if (popup.confirmButton?.hasAttribute('equalize-width')) {
                            popup.confirmButton?.setStyle('width', '');
                            popup.cancelButton?.setStyle('width', '');
                        }

                        popup.style.visibility = 'hidden';
                        popup.hidden = true;
                        //启用滚动
                        if (popup.noScrolling) {
                            document.body.style.overflow = 'auto';
                        }                        
                    }).play(ev);
            }
            else {
                if (this.minWidth > 0) {
                    this.style.width = '';
                }
        
                if (this.confirmButton?.hasAttribute('equalize-width')) {
                    this.confirmButton?.setStyle('width', '');
                    this.cancelButton?.setStyle('width', '');
                }
        
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
    
    open (ev) {
    
        this.initialize();

        if(document.popup == null || document.popup.id != this.id) {
            if(this.dispatch('onopen', { 'event': ev })) {
                this.show(false, ev);			
                this.dispatch('onshow', { 'event': ev });
            }
        }
        return this;
    }
    
    close (ev) {
    
        if(document.popup == null || document.popup.id == this.id) {
            if(this.dispatch('onclose', { 'event': ev })) {
                this.hide(false, ev);
                this.dispatch('onhide', { 'event': ev });
            }
        }
        return this;
    }
    
    confirm (ev) {
        if(document.popup == null || document.popup.id == this.id) {
            if (this.dispatch('onconfirm', { 'event': ev })) {

                if (this['onconfirm+'] != null) {
                    $FIRE(this, 'onconfirm+',
                        function(data) {
                            if (this.successText != '') {
                                Callout(this.successText.$p(this, data)).up(this.confirmButton).show();
                            }                            

                            this.hide(false, ev);
                            this.dispatch('onhide', { 'event': ev });
                        }, 
                        function(data) {
                            if (this.successText != '') {
                                Callout(this.failureText.$p(this, data)).up(this.confirmButton).show();
                            }
                        },
                        function(error) {
                            Callout(this.exceptionText.$p(this, { data: error, error: error })).up(this.confirmButton).show();                           
                        }
                    );
                }
                else {
                    this.hide(false, ev);
                    this.dispatch('onhide', { 'event': ev });
                }
            }
        }
        return this;
    }
    
    cancel (ev) {
        if(document.popup == null || document.popup.id == this.id) {
            if(this.dispatch('oncancel', { 'event': ev })) {
                this.hide(false, ev);
                this.dispatch('onhide', { 'event': ev });
            }
        }
        return this;
    }

    #getOpeningAnimation(ev) {
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
    
    #getClosingAnimation(ev) {
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

    #parsePositionX(x, ev) {
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
                        x = this.#getOffsetLeft('left');
                        break;
                    case 'center':
                        x = this.#getOffsetLeft('center');
                        break;
                    case 'right':
                        x = this.#getOffsetLeft('right');
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
    
    #parsePositionY(y, ev) {
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
                        y = this.#getOffsetTop('top');
                        break;
                    case 'middle':
                        y = this.#getOffsetTop('middle');
                        break;
                    case 'bottom':
                        y = this.#getOffsetTop('bottom');
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

    
    #getOffsetLeft (p) {
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

    #getOffsetTop (p) {
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
}

window.customElements.define('pop-up', HTMLPopupElement);

$root.appendClass(`
    pop-up { display: block; border: 1px solid #808080; padding: 1px; background-color: #FFFFFF; box-shadow: 2px 4px 6px #999999; position: absolute; z-index: 1001 }
`);

$enhance(HTMLPopupElement.prototype)
    .defineProperties({
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
        closingDuration: '0.8s' //1s, 800ms
    })
    .defineEvents('onshow', 'onhide', 'onopen', 'onclose', 'onconfirm', 'oncancel', 'onconfirm+');

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
    if ($('#__AlertPopup') == null) {

        document.body.appendChild($create('POP-UP', { 
            'id': '__AlertPopup',
            'position': 'center,middle',
            'offsetY': -100,
            'maskColor': '#999999',
            'theme': 'root',
            'animation': 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;',
            'titleBarIcon': 'icon-warning-circle',
            'minWidth': 360,
            'buttonMinWidth': 80
        }));
        
        $('#__AlertPopup').insertBeforeEnd('DIV', { className: 'popup-content', innerHTML: `<span sign="message" class="${message?.class ?? ''}">${message?.text ?? message}<span>` }, { 'textAlign': 'center', 'color': 'var(--primary)' }, { 'sign': 'content' });
        $('#__AlertPopup').initialize();
    }
    else {
        $('#__AlertPopup').$('span[sign=message]').setHTML(message?.text ?? message).setClass(message?.class ?? '.');
    }

    
    $('#__AlertPopup').titleBarText = title ?? 'Message';
    $('#__AlertPopup').confirmButtonText = confirmButton?.text ?? confirmButton ?? 'OK';
    $('#__AlertPopup').confirmButtonClass = confirmButton?.class ??  'normal-button gray-button';
    $('#__AlertPopup').confirmButtonIcon = confirmButton?.icon ??  '';

    return $('#__AlertPopup').open(ev);
}

$root.confirm = function(message, confirmButton, cancelButton, title, ev = null) {
    if ($('#__ConfirmPopup') == null) {
        document.body.appendChild($create('POP-UP', { 
            'id': '__ConfirmPopup',
            'position': 'center,middle',
            'offsetY': -100,
            'maskColor': '#999999',
            'theme': 'root',
            'animation': 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;',
            'titleBarIcon': 'icon-question-circle',
            'cancelButtonText': 'Cancel',
            'minWidth': 360,
            'buttonMinWidth': 80
        }));

        $('#__ConfirmPopup').insertBeforeEnd('DIV', { className: 'popup-content', innerHTML: `<span sign="message" class="${message?.class ?? ''}">${message?.text ?? message}<span>` }, { 'textAlign': 'center', 'color': 'var(--primary)' }, { 'sign': 'content' });
        $('#__ConfirmPopup').initialize();
    }
    else {
        $('#__ConfirmPopup').$('span[sign=message]').setHTML(message?.text ?? message).setClass(message?.class ?? '.');
    }

    $('#__ConfirmPopup').titleBarText = title ?? 'Confirm';
    $('#__ConfirmPopup').confirmButtonText = confirmButton?.text ?? confirmButton ?? 'OK';
    $('#__ConfirmPopup').confirmButtonClass = confirmButton?.class ??  'normal-button gray-button';
    $('#__ConfirmPopup').confirmButtonIcon = confirmButton?.icon ??  '';
    $('#__ConfirmPopup').cancelButtonText = cancelButton?.text ?? cancelButton ?? 'Cancel';
    $('#__ConfirmPopup').cancelButtonClass = cancelButton?.class ?? 'normal-button gray-button';
    $('#__ConfirmPopup').cancelButtonIcon = cancelButton?.icon ??  '';

    return $('#__ConfirmPopup').open(ev);
}

$root.prompt = function(message, input, confirmButton, cancelButton, title, ev) {
    if ($('#__PromptPopup') == null) {
        document.body.appendChild($create('POP-UP', 
            { 
                'id': '__PromptPopup',
                'position': 'center,middle',
                'offsetY': -100,
                'maskColor': '#999999',
                'animation': 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;',
                'theme': 'root',
                'titleBarIcon': 'icon-edit',
                'cancelButtonText': 'Cancel',
                'minWidth': 360,
                'buttonMinWidth': 80
             }));

        $('#__PromptPopup').insertBeforeEnd('DIV', { className: 'popup-content',
                 innerHTML: '<div id="__PromptMessage" style="color: var(--primary); padding: 10px 0px;"></div><div id="__PromptInput" style="margin: 10px 0px 6px 0px"><input id="__PromptTextBox" size="50" hint="#__PromptHint" /></div><div id="__PromptHint" style="font-size: 0.875rem"></div>' }, 
                {  }, { 'sign': 'content' });
        $('#__PromptPopup').initialize();
    }

    $('#__PromptPopup').titleBarText = title ?? 'Prompt';
    $('#__PromptPopup').confirmButtonText = confirmButton?.text ?? confirmButton ?? 'OK';
    $('#__PromptPopup').confirmButtonClass = confirmButton?.class ??  'normal-button gray-button';
    $('#__PromptPopup').confirmButtonIcon = confirmButton?.icon ??  '';
    $('#__PromptPopup').cancelButtonText = cancelButton?.text ?? cancelButton ?? 'Cancel';
    $('#__PromptPopup').cancelButtonClass = cancelButton?.class ?? 'normal-button gray-button';
    $('#__PromptPopup').cancelButtonIcon = cancelButton?.icon ??  '';

    $('#__PromptMessage').setHTML(message?.text ?? message).setClass(message?.class ?? '.');
    
    input ??= 'text';
    if (typeof(input) != 'object') {
        input = { 'type': input };
    }

    let textBox = $('#__PromptTextBox');
    for (let name in input) {
        if (textBox[name] !== undefined) {
            textBox[name] = input[name];
        }
        else {
            textBox.setAttribute(name, input[name]);
        }
    }    
    textBox.initializeInputable?.();

    return $('#__PromptPopup').on('show', function() {
        textBox.focus();
    }).open(ev);
}

$root.prompt.getInputValue = function() {
    return $('#__PromptTextBox').value;
}

$root.prompt.setInputValue = function(value) {
    $('#__PromptTextBox').value = value;
}

document.on('ready', function () {

    $$('pop-up').forEach(popup => popup.initialize());

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