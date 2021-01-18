//-----------------------------------------------------------------------
// www.qross.io
//-----------------------------------------------------------------------
// root.popup.js
// popup in window

/**********

	<Popup ID="String" Element="ElementID" Position="*" Offset="x.y" Modal="true|false" Hidings="ElementID1,ElementID2,..." OpenButton="ElementID" CloseButton="ElementID" ConfirmButton="ElementID" CancelButton="ElementID" DragBar="ElementID" MaskColor="Color" MaskOpacity="0-100" />
	

2019/4/2
增加属性

    animation=""
    opening-animation=""
    closing-animation=""

    opening-from-position="-150.0,150,0,0.150,0.-150"
    opening-to-position="0.0"
    opening-from-opacity="0"
    opening-to-opacity="100"    
    opening-from-scale="0"
    opening-to-scale="100"
    opening-duration="1s|800ms"

    closing-from-position="-150.0"
    closing-to-position="0.0"
    closing-from-opacity="0"
    closing-to-opacity="100"    
    closing-from-scale="0"
    closing-to-scale="100"
    closing-duration="1s|800ms"

2018/8/6 重写
简化结构，整合root.js, 删减了大量代码
适应ES6
修改多个属性和方法
不再使用Popup标签
PopupMask静态化

2013/1/27
删除fade, duration
visible不再是显式属性, 不需要再设置
增加animation动画属性
去掉对老版浏览器的支持
增加id属性
删减了多段代码
事件名称第2个单词首字母大写
position和offset属性标准化
**********/

/// <global type="Popup">页面上正在打开的 Popup 对象</global>
document.popup = null;

Popup = function (element) {
    
    $initialize(this)
    .with(element)
    .declare({
        name: 'Popup_' + document.components.size,
        position: function(position) {
            //event
            //left|center|right.top|middle|bottom
            //x.y
            /// <value type="String" values="|event|x.y" defaultValue="" mayBeNull="true">坐标类型, 居中/事件/坐标, 默认居中页面</value>
            if (typeof (position) == 'string') {
                position = position.toLowerCase().replace(/\s/g, '');
                if (position.includes(',')) {
                    position = {
                        x: position.takeBefore(','),
                        y: position.takeAfter(','),
                    }
                }
                else if (position.includes(".")) {
                    position = {
                        x: position.takeBefore('.'),
                        y: position.takeAfter('.'),
                    }
                }
                else {
                    switch(position) {
                        case 'left': 
                            position = { x: 'left', y: 'middle' };
                            break;
                        case 'right':
                            position = { x: 'right', y: 'middle' };
                            break;
                        case 'top':
                            position = { x: 'center', y: 'top' };
                            break;
                        case 'bottom':
                            position = { x: 'center', y: 'bottom' };
                            break;
                        case 'event':
                            position = { x: 'event', y: 'event' };
                            break;
                        default:
                            position = { x: 'center', y: 'middle' };
                            break;
                    }                    
                }                
            }
            else if (position == null || typeof(position) != 'object' || position.x == null || position.y == null) {
                position = { x: 'center', y: 'middle' };
            }
            return position;
        },
        offsetX: 0,
        offsetY: 0,

        openButton: '$x',
        closeButton: '$x',
        confirmButton: '$x',
        cancelButton: '$x',

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

        //animationStyle: '', //预设的动画样式
        display: 'window', //window/sidebar/menu
        reference: '$x', //

        modal: true,
        hidings: '$x',
        disableScrolling: true,

        onopen: null,
        onclose: null,
        onconfirm: null,
        oncancel: null,
        onlocate: null,

        maskColor: '#999999',
        maskOpacity: 3, 

        visible: false
    })
    .elementify(element => {
        this.element = element;

        //将对象初始化
        this.element.style.display = 'none';
        this.element.style.position = 'absolute';
        this.element.style.zIndex = '1001';
        this.element.style.visibility = 'hidden';
        this.element.style.overflow = (this.element.querySelector('div.popup-scroll') == null ? 'auto' : 'hidden');
    });

    if (this.openButton.isEmpty()) {
        this.openButton = $x('#' + this.name + '_OpenButton');
    }
    if (this.closeButton.isEmpty()) {
        this.closeButton = $x('#' + this.name + '_CloseButton');
    }
    if (this.confirmButton.isEmpty()) {
        this.confirmButton = $x('#' + this.name + '_ConfirmButton');
    }
    if (this.cancelButton.isEmpty()) {
            this.cancelButton = $x('#' + this.name + '_CancelButton');
        }
    
    if (this.openingAnimation == '') {
        this.openingAnimation = this.animation;
    }
    if (this.closingAnimation == '') {
        this.closingAnimation = 'direction: reverse; ' + this.openingAnimation;
    }

    let popup = this;
    this.openButton.bind('click', ev => popup.open(ev));
    this.closeButton.bind('click', ev => popup.close(ev));
    this.confirmButton.bind('click', ev => popup.confirm(ev));
    this.cancelButton.bind('click', ev => popup.cancel(ev));
            
    if (this.visible) {
        this.open();
    }
}

$popup = function(name) {
    let popup = $t(name);
    if (popup != null && popup.tagName == 'POPUP') {
        return popup;
    }
    else {
        return null;
    }
}

Popup.prototype.locate = function(ev) {
	/// <summary>为popup定位</summary>
	/// <param name="ev" type="EventArgs"></param>
    
    //自动调整边栏的宽高
    if (this.display == 'sidebar') {
        if (this.position.x == 'center') {
            //上中下边栏全宽
            let width = window.innerWidth;
            if (this.element.offsetWidth != width) {
                this.element.style.width = width + 'px';
            }
        }
        else {            
            //左右边栏全高, 4是浏览器中的一个间隔
            let height = window.innerHeight - 4;
            if (this.element.offsetHeight != height) {
                this.element.style.height = height + 'px';
            }

            if (this.element.querySelector('div.popup-scroll') != null) {
                let fixed = 0;
                for (let element of this.element.children) {
                    if (element.className != 'popup-scroll') {                
                        fixed += element.offsetHeight;
                    }
                }
                let height = window.innerHeight - fixed
                if (height < 400) {
                    height = 400;
                }
                this.element.querySelector('div.popup-scroll').style.height = height + 'px';
            }            
        }        
    }

    let x = this.getPositionX(this.position.x, ev) + this.offsetX;
    let y = this.getPositionY(this.position.y, ev) + this.offsetY;

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';

    this.execute('onlocate', x, y);
}

Popup.prototype.$getOpeningAnimation = function(ev) {
    if (this.display == 'sidebar') {
        //sidebar的自定义动画无效
        if (this.position.x == 'center') {
            if (this.position.y == 'top') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(-' + this.element.offsetHeight + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; ';
            }
            else if (this.position.y == 'bottom') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(' + this.element.offsetHeight + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
            }
            else {
                return 'timing-function: ease; duration: 0.5s; from: x(0).y(0) 100% 50%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
            }
        }
        else if (this.position.x == 'left') {
            return 'timing-function: ease; duration: 0.6s; from: x(-' + this.element.offsetWidth + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
        }
        else {
            return 'timing-function: ease; duration: 0.6s; from: x(' + this.element.offsetWidth + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards;';
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

Popup.prototype.$getClosingAnimation = function(ev) {
    if (this.display == 'sidebar') {
        //sidebar的自定义动画无效
        if (this.position.x == 'center') {
            if (this.position.y == 'top') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(-' + this.element.offsetHeight + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
            }
            else if (this.position.y == 'bottom') {
                return 'timing-function: ease; duration: 0.6s; from: x(0).y(' + this.element.offsetHeight + ') 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
            }
            else {
                return 'timing-function: ease; duration: 0.5s; from: x(0).y(0) 100% 50%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
            }
        }
        else if (this.position.x == 'left') {
            return 'timing-function: ease; duration: 0.6s; from: x(-' + this.element.offsetWidth + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
        }
        else {
            return 'timing-function: ease; duration: 0.6s; from: x(' + this.element.offsetWidth + ').y(0) 100% 10%; to: x(0).y(0) 100% 100%; fill-mode: forwards; direction: reverse;';
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

Popup.prototype.show = function(quick, ev) {
	/// <summary>显示</summary>
	/// <param name="quick" type="Boolean">是否快速显示</param>
	/// <param name="ev" type="EventArgs">事件参数</param>
	
	//如果有其他的popup显示，就隐藏	
	if(document.popup != null) {
		document.popup.hide(true);
	}
	
	//是否快速显示
	if (quick == null) {
        quick = (window.Animation == null || Animation.Entity == null || this.animation == '');
    }

	//隐藏影响popup显示的元素
    this.hidings.hide();

    //禁用滚动
    if (this.disableScrolling) {
        document.body.style.overflow = 'hidden';
    }    
	
	//显示Mask
	if(this.modal) {
		PopupMask.show(this.maskColor, this.maskOpacity);
	}
	
    //显示
	this.element.style.display = '';
	this.locate(ev);
	this.element.style.visibility = 'visible';		
	if(!quick) {
	    if (window.Animation != null && Animation.Entity != null) {
            Animation(this.$getOpeningAnimation(ev))
                .apply(this.element)
                .play(ev);
	    }
    }
	
	//保存状态
	this.visible = true;
	document.popup = this;
}

Popup.prototype.hide = function(quick, ev) {
	/// <summary>隐藏</summary>
	/// <param name="quick" type="Boolean">是否快速隐藏</param>

	if(this.visible) {
		//是否快速隐藏
	    if (quick == null) {
	        quick = (window.Animation == null || Animation.Entity == null || this.animation == '');
	    }
        
		if(!quick) {
			//动画
		    if (window.Animation != null && Animation.Entity != null) {
                let popup = this;
                Animation(this.$getClosingAnimation(ev))
                    .apply(this.element)
                    .on('stop', function () {
                        popup.element.style.visibility = 'hidden';
                        popup.element.style.display = 'none';
                        //启用滚动
                        document.body.style.overflow = 'auto';
                    }).play(ev);
		    }
		}
		else {		
			//立即隐藏
			this.element.style.display = 'none';
            this.element.style.visibility = 'hidden';
                            
            //启用滚动
            if (this.disableScrolling) {
                document.body.style.overflow = 'auto';                
            }
		}
		
		//如果有Mask，隐藏
		if(this.modal) {
			PopupMask.hide(this.maskOpacity);
		}
		
		//显示popup打开时隐藏的元素
        this.hidings.show();

		document.popup = null;
		this.visible = false;
	}
}

Popup.prototype.open = function(ev) {
	/// <summary>打开</summary>
	/// <param name="ev" type="Event">事件参数</param>

    if(document.popup == null || document.popup.id != this.id) {
		if(this.execute('onopen', ev)) {
			this.show(null, ev);			
		}
	}
};
	
Popup.prototype.close = function(ev)
{
	/// <summary>关闭</summary>
	/// <param name="ev" type="Event">事件参数</param>
	
	if(document.popup == null || document.popup.id == this.id) {
		if(this.execute('onclose', ev)) {
			this.hide(null, ev);
		}
	}
};
	
Popup.prototype.confirm = function(ev) {
	/// <summary>确认</summary>
	/// <param name="ev" type="Event">事件参数</param>
	
	if(document.popup == null || document.popup.id == this.id) {
		if(this.execute('onconfirm', ev)) {
			this.hide(null, ev);
		}
	}
};
	
Popup.prototype.cancel = function(ev)
{
	/// <summary>取消</summary>
	/// <param name="ev" type="Event">Firefox事件参数</param>
	
	if(document.popup == null || document.popup.id == this.id) {
		if(this.execute('oncancel', ev)) {
			this.hide(null, ev);
		}
	}
};

Popup.prototype.getPositionX = function (x, ev) {
    /// <summary>从文本解析坐标X值</summary>
    // <value name="x" type="String">x坐标值</value>

    if (typeof (x) == 'number') {
        return x;
    }
    else if (typeof (x) == 'string') {
        if (this.display != 'menu') {
            switch(x) {
                case 'event':
                    x = this.getEventX(ev);
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
                    x = this.reference.left();
                    break;
                case 'center':
                    x =  this.reference.left() + this.reference.width() / 2 - $x(this.element).width() / 2;
                    break;
                case 'right':
                    x = this.reference.left() + this.reference.width() - $x(this.element).width();
                    break;
            }
        }

        return $parseInt(x);
    }
    else {
        return 0;
    }
}

Popup.prototype.getPositionY = function (y, ev) {
    /// <summary>从文本解析坐标X值</summary>
    // <value name="x" type="String">x坐标值</value>

    if (typeof (y) == 'number') {
        return y;
    }
    else if (typeof (y) == 'string') {
        if (this.display != 'menu') {
            switch(y) {
                case 'event':
                    y = this.getEventY(ev);
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
                    y = this.reference.top() - $x(this.element).height();
                    break;
                case 'bottom':
                    y = this.reference.top() + this.reference.height();
                    break;
            }
        }
        
        return $parseInt(y);
    }
    else {
        return 0;
    }
}

Popup.prototype.getEventX = function (ev) {
    /// <summary>获得事件的x坐标</summary>
    return Math.round($root.scrollLeft() + (ev == null ? 0 : ev.clientX));
}

Popup.prototype.getEventY = function (ev) {
    /// <summary>获得事件的y坐标</summary>
    return Math.round($root.scrollTop() + (ev == null ? 0 : ev.clientY));
}

Popup.prototype.getOffsetLeft = function (p) {
    /// <summary>获得x轴的坐标位置</summary>

    let v = $root.scrollLeft(); //left
    if (p == 'center') {
        //document.documentElement.clientWidth
        v = (window.innerWidth - this.element.offsetWidth) / 2 + $root.scrollLeft();
    }
    else if (p == 'right') {
        v = window.innerWidth - this.element.offsetWidth + $root.scrollLeft();
    }
    return Math.round(v);
}

Popup.prototype.getOffsetTop = function (p) {
    /// <summary>获得y轴的坐标位置</summary>

    let v = $root.scrollTop(); //top
    if (p == 'middle') {
        //document.documentElement.clientHeight
        v = (window.innerHeight - this.element.offsetHeight) / 2 + $root.scrollTop();
    }
    else if (p == 'bottom') {
        v = window.innerHeight - this.element.offsetHeight + $root.scrollTop();
    }
    return Math.round(v);
}

Popup.resize = function() {
	/// <summary>当可见窗口大小改变时</summary>	
	//重设Mask层的大小
	PopupMask.resize();
		
	if(document.popup != null) {		
        document.popup.locate();
	}
}

PopupMask = {};

PopupMask.show = function(color, opacity) {
    /// <summary>显示 Mask<summary>
    PopupMask.resize();

    $x('#PopupMask')
        .show()
        .style('visibility', 'visible')
        .style('backgroundColor', color)
        .style('opacity', opacity / 10);

    if (window.Animation != null && Animation.Entity != null) {
        Animation('timing-function: ease; duration: 0.5s; from:x(0).y(0) 100% 20%; to:x(0).y(0) 100% ' + (opacity * 10) + '%; fill-mode: forwards;')
         .apply('#PopupMask')
         .play();
    }
}

PopupMask.hide = function(opacity) {

    /// <summary>隐藏 Mask<summary>
    if (window.Animation != null && Animation.Entity != null) {
        Animation('timing-function: ease; duration: 0.5s; from:x(0).y(0) 100% ' + (opacity * 10) + '%; to:x(0).y(0) 100% 0%; fill-mode: forwards;')
                 .apply('#PopupMask')
                 .on('stop', function() {
                                 $x('#PopupMask').style('visibility', 'hidden').hide();
                              })
                 .play();
    }
    else {
        $x('#PopupMask')
        .style('visibility', 'hidden')
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

    $x('#PopupMask')
        .style('width', sx - 1 + 'px')
        .style('height', sy - 1 + 'px');
}

Popup.apply = function (element) {
    return new Popup(element);
}

Popup.initializeAll = function () {

    $x('BODY').append('<div id="PopupMask" style="background-color:#666666; z-index:1000; position:absolute; visibility:hidden; display:none; left:0; top:0;">&nbsp;</div>');

    $x(window).on('resize', Popup.resize);

    PopupMask.resize();

    $a('div[popup]').forEach(div => {
        Popup.apply(div);
    });
}

$ready(function () {
    Popup.initializeAll();
});