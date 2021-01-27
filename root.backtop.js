
//<backtop anchor="name" class="backtop">Top</backtop>

class BackTop {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            name: 'BackTop_' + document.components.size,
            text: 'html',
            anchor: 'top',
            className: '',
            opacity: 0
        })
        .elementify(function(element) {
            this.element = element;
        });
    }
}

BackTop.prototype.element = null;

BackTop.prototype.initialize = function() {

    if ($s('a[name=' + this.anchor + ']') == null) {
        let a = $create('A', { name: this.anchor });
        if (document.body.firstChild != null) {
            document.body.insertBefore(a, document.body.firstChild);
        }
        else {
            document.body.appendChild(a);
        }
    }

    if (this.element == null) {
        //创建元素    
        this.element = $create('DIV', { id: this.id, innerHTML: `<a href="#${this.anchor}">${this.text}</a>`, className: this.className });

        document.body.appendChild(this.element);
    }

    $x(this.element).styles({
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        opacity: 0,
        display: 'none'
    });
   

    if (self != parent) {
        this.element.onclick = function() {
            $root.scrollTop(0);
        }
    }

    let backTop = this;

    $x(window).bind('scroll', function() {
        let scrollTop = $root.scrollTop();
        if (scrollTop > 200) {
            scrollTop -= 200;
            backTop.opacity = Math.round(scrollTop / 20) / 100;
            if (backTop.opacity > 1) {
                backTop.opacity = 1;
            }
            backTop.element.style.display = '';
            backTop.element.style.opacity = backTop.opacity;
        }
        else {
            backTop.element.style.display = 'none';
            backTop.element.style.opacity = 0;
        }
    });

    $x(this.element).bind('mouseover', function() {
        this.style.opacity = 1;
    });

    $x(this.element).bind('mouseout', function() {
        this.style.opacity = backTop.opacity;
    });
}

$finish(function() {
    let backTop = $s('[backtop]');
    if (backTop != null) {
        new BackTop(backTop).initialize();
    }
    else {
        new BackTop({ text: 'TOP', className: 'backtop' }).initialize();
    }
});