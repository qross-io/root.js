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

        callout: 'upside',
        alert: null        
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
                    if (this.alert != null) {
                        if ($root.alert != null) {
                            $root.alert(text, this.confirmButtonText);
                        }
                        else {
                            window.alert(text);
                        }
                    }
                    else {
                        Callout(text).position(this, this.callout).show();
                    }
                }                
            }
        }
    });

HTMLAnchorElement.prototype._href = '';

HTMLAnchorElement.prototype.go = function() {

    $FIRE(this, 'onclick+',
        function(data) {
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
            this.hintText = this.failureText.$p(this, data);           
        },
        function(error) {
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

    $x(this).on('click', function(ev) {
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
    for (let a of $n(container, 'a')) {
        if (a.getAttribute('root') == null) {
            a.setAttribute('root', 'A');
            if (document.models != null) {
                Model.boostPropertyValue(a);
            }
            if (a.getAttribute('onclick+') != null) {
                a.initialize();
            }
        }
    }
}

$finish(function () {
    HTMLAnchorElement.initializeAll();
});