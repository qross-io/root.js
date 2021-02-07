let contentWidth = 500;//全局存iframe宽度
let popupName = 'contentPopup';//popup层name

class Doc {
    constructor(element) {
        $initialize(this)
            .with(element)
            .declare({
                doc:'/doc/pql',
                isDraging:false,
            })
            .elementify(element => {

                this.popupName = popupName;//popup组件name
                this.iconClass = 'iconfont icon-question-circle';
                this.contentWidth = contentWidth;
                this.contentWrap = null;
                this.startX = 0;
                this.endX = 0;

                //生成a标签
                let aElement = $create('A', { innerText:element.innerText }, {}, { 'isSelector':true, href: 'javascript:void(0)' });
                //生成i
                let iElement = $create('I', { innerHTML: element.innerText ? '&nbsp;&nbsp;': '' }, {}, { class: this.iconClass });
                $x(aElement).insertFirst(iElement);
                let parentNode = $x(element).parent();
                $x(element).remove();
                parentNode.insertFirst(aElement);
                this.aElement = aElement;
            })
        let helpIcon = this;
        $x(this.aElement).on('click',function() {
            //给popup内容区添加内容 iframe路径从 ref属性传入
            $x('#popupContent').html(`<iframe class="iframeClass" style="width:${helpIcon.contentWidth + 'px'};" src="${helpIcon.doc}"></iframe>`);
            helpIcon.contentWrap = $x('iframe[src]');
            $popup(helpIcon.popupName).show();
            $x(document).on('mousedown',function(ev) {
                if (ev.target.tagName == 'IFRAME') {
                    helpIcon.isDraging = true;
                    helpIcon.startX = ev.clientX;//当前鼠标位置X

                    $x(document).on('mousemove',function(ev) {
                        if (ev.target.tagName == 'IFRAME') {
                            if (helpIcon.isDraging) {

                                helpIcon.endX = ev.clientX;
                                let contentX = helpIcon.startX - helpIcon.endX;
                                helpIcon.contentWidth += contentX;
                                contentWidth = helpIcon.contentWidth;//全局变量 iframe内容宽度 多次打开宽度均为上一次
                                // $x('.popup-bar').width(helpIcon.contentWidth + 5);
                                $x('iframe[src]').width(helpIcon.contentWidth + 5);

                                helpIcon.startX = helpIcon.endX;
                            }
                        }

                    })
                }

            })
            $x('html').on('mouseup',function(ev) {
                helpIcon.isDraging = false;
            })

            //关闭按钮移到iframe子页面
            $s(helpIcon.contentWrap).objects[0].contentWindow.onload = function() {
                //子页面加载完成绑定点击关闭事件
                this.document.getElementsByClassName('icon-guanbi')[0].onclick = function() {
                    $popup(popupName).close();
                }

                $x('html').on('mouseup',function(ev) {//防止拖动到iframe里失效
                    helpIcon.isDraging = false;
                })
            }
        })


    }
}

function initializeAll() {
    $a('a[doc]').forEach(item => {
        new Doc(item);
    })
}

$ready(function() {
    let popupLayer = `<div name='${popupName}' popup="yes" class="popup-autosize" display="sidebar" position="right">
        <div id="popupContent" style="height: 100%;position: relative;">  
        </div>  
    </div>`
    $x('body').append(popupLayer);//添加popup层 重新调用popup的方法
    Popup.initializeAll();
    initializeAll();
})
