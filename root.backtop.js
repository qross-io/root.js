
//<backtop anchor="name" class="backtop">Top</backtop>

class BackTop {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            name: 'BackTop_0',
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

    //创建元素    
    let div = $create(
        'DIV',
        {
            id: this.id,
            innerHTML: `<a href="#${this.anchor}">${this.text}</a>`,
            className: this.className
        },
        {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            opacity: 0,
            display: 'none'
        }, 
        {
            backtop: ''
        }
    );

    if (self != parent) {
        div.onclick = function() {
            $root.scrollTop(0);
            //parent.$root.scrollTop(0);
        }
    }

    if (this.element != null) {
        this.element.parentNode.insertBefore(div, this.element);
        this.element.remove();
    }
    else {
        document.body.appendChild(div);
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
            div.style.display = '';
            div.style.opacity = backTop.opacity;
        }
        else {
            div.style.display = 'none';
            div.style.opacity = 0;
        }
    });

    $x(div).bind('mouseover', function() {
        this.style.opacity = 1;
    });

    $x(div).bind('mouseout', function() {
        this.style.opacity = backTop.opacity;
    });
}

$finish(function() {
    let backTop = $s('backtop');
    if (backTop != null) {
        new BackTop(backTop).initialize();
    }
    else {
        new BackTop({ text: 'TOP', className: 'backtop' }).initialize();
    }
});