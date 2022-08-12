
$enhance(HTMLAnchorElement.prototype)
    .defineProperties({
        confirmText: '', //确定提醒文字
        confirmButtonText: 'OK', //确定框确定按钮
        cancelButtonText: 'Cancel', //确定框取消按钮
        confirmTitle: 'Confirm', //确定框标题

        successText: '', //执行成功后的提示文字
        failureText: '', //执行失败后的提醒文字
        exceptionText: '', //请求发生错误的提醒文字
        'text': {
            get () {            
                return this.innerHTML;
            },
            set (text) {
                if (text != null && text != '') {
                    this.innerHTML = text;
                }
            }
        },
        'calloutPosition': {
            get() {
                return this.getAttribute('callout-position') ?? this.getAttribute('calloutPosition') ?? this.getAttribute('callout');
            },
            set(position) {
                this.setAttribute('callout-position', position);
            }
        },
        'messageDuration': {
            get() {
                return this.getAttribute('message-duration') ?? this.getAttribute('messageDuration') ?? this.getAttribute('message');
            },
            set(duration) {
                this.setAttribute('message-duration', duration);
            }
        },
        'hintText': {
            set (text) {
                if (text != '') {
                    if (this.calloutPosition != null || this.messageDuration == null) {                        
                        Callout(text).position(this, this.calloutPosition).show();
                    }

                    if (this.messageDuration != null) {
                        window.Message?.[this.status == 'success' ? 'green' : 'red'](text).show(this.messageDuration.toFloat(0));
                    }
                }                
            }
        }
    })
    .defineEvents('onclick+');

HTMLAnchorElement.prototype._href = '';
HTMLAnchorElement.prototype.status = null;

HTMLAnchorElement.prototype.go = function() {

    $FIRE(this, 'onclick+',
        function(data) {
            this.status = 'success';
            this.hintText = this.successText.$p(this, data);            
            
            if (this._href != '') {
                switch(this.target) {
                    case '':
                    case '_self':
                        window.location.href = this._href.$p(this, data);
                        break;
                    case '_top':
                        top.location.href = this._href.$p(this, data);
                        break;
                    case '_parent':
                        parent.location.href = this._href.$p(this, data);
                        break;
                    case '_blank':
                        window.open(this.href.$p(this, data));
                        break;
                    default:
                        window.frames[this.target].location.href = this._href.$p(this, data);
                        break;
                }
            }            
        }, 
        function(data) {
            this.status = 'failure';
            this.hintText = this.failureText.$p(this, data);
        },
        function(error) {
            this.status = 'exception';
            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
        },
        function() {
            // if (this._href != '') {
            //     this.href = this._href;
            // }
        },
        this,
        { 'text': this.textContent }
    );
}

HTMLAnchorElement.prototype.initialize = function() {

    this._href = this.href;
    this.href = 'javascript:void(0)';

    this.on('click', function(ev) {
        if (this.confirmText != '') {
            if ($root.confirm != null) {
                let a = this;
                $root.confirm(this.confirmText.$p(this), this.confirmButtonText, this.cancelButtonText, this.confirmTitle)
                    .on('confirm', function() {                            
                        a.go();      
                    })
                    .on('cancel', function() {
                        // if (a._href != '') {
                        //     a.href = a._href;
                        // }
                    });
            }
            else if (window.confirm(this.confirmText.$p(this))) {
                this.go();         
            }
            else {
                // if (this._href != '') {
                //     this.href = this._href;
                // }
            }
        }
        else {
            this.go();
        }        
    });

    Event.interact(this);
}

HTMLAnchorElement.initializeAll = function(container) {
    for (let a of (container ?? document).querySelectorAll('a')) {
        if (!a.hasAttribute('root-anchor')) {
            a.setAttribute('root-anchor', '');
            HTMLElement.boostPropertyValue(a);            
            if (a.hasAttribute('onclick+')) {
                a.initialize();
            }
            else if (a.hasAttribute('onclick-')) {
                if (a.href == '') {
                    a.href = 'javascript:void(0)';
                }
                Event.interact(a);
            }
        }
    }
}

document.on('post', function () {
    HTMLAnchorElement.initializeAll();
});