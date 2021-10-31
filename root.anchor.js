//链接扩展

$enhance(HTMLAnchorElement.prototype)
    .declare({        
        confirmText: '', //确定提醒文字
        confirmButtonText: 'OK', //确定框确定按钮
        cancelButtonText: 'Cancel', //确定框取消按钮
        confirmTitle: 'Confirm', //确定框标题

        successText: '', //执行成功后的提示文字
        failureText: '', //执行失败后的提醒文字
        exceptionText: '', //请求发生错误的提醒文字

        callout: null,
        message: null        
    })
    .extend('onclick+')
    .define({
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
        'hintText': {
            set (text) {
                if (text != '') {
                    if (this.callout != null) {                        
                        Callout(text).position(this, this.callout).show();
                    }

                    if (this.message != null) {
                        window.Message?.[this.status == 'success' ? 'green' : 'red'](text).show(this.message.toFloat(0));
                    }
                }                
            }
        }
    });

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
            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
        },
        function() {
            // if (this._href != '') {
            //     this.href = this._href;
            // }
        }
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

    Event.interact(this, this);
}

HTMLAnchorElement.initializeAll = function(container) {
    for (let a of (container ?? document).querySelectorAll('a')) {
        if (!a.hasAttribute('root-anchor')) {
            a.setAttribute('root-anchor', '');
            window.Model?.boostPropertyValue(a);            
            if (a.getAttribute('onclick+') != null) {
                a.initialize();
            }
            else if (a.getAttribute('onclick-') != null) {
                if (a.href == '') {
                    a.href = 'javascript:void(0)';
                }
                Event.interact(a, a);
            }
        }
    }
}

document.on('post', function () {
    HTMLAnchorElement.initializeAll();
});