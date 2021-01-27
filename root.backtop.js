
//<div backtop anchor="name" class="backtop">Top</div>

class BackTop {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            name: 'BackTop_' + document.components.size,
            text: 'html',
            anchor: function(value) {
                if (value == null || value == '') {
                    value = 'BackTopAnchor';
                    if (document.body.firstElementChild != null) {
                        if (document.body.firstElementChild.id == '') {
                            document.body.firstElementChild.id = value;
                        }
                        else {
                            value = document.body.firstElementChild.id;
                        }
                    }
                }                
                return value;
            },
            className: '',
            opacity: 0,
            onback: null
        })
        .elementify(function(element) {
            if (element.nodeName != 'BACKTOP') {
                this.element = element;
            }
            else {
                element.remove();
            }    
        });
    }
}

BackTop.prototype.element = null;

$backtop = function(name) {
    let backtop = $t(name);
    if (backtop.tagName == 'BACKTOP') {
        return backtop;
    }
    else {
        return null;
    }
}

BackTop.prototype.initialize = function() {

    if ($s('#' + this.anchor + ',[name=' + this.anchor + ']') == null) {
        $x(document.body).insertFirst($create('A', { id: this.anchor, name: this.anchor }));        
    }

    if (this.element == null) {
        this.element = $create('DIV', { id: this.id, innerHTML: `<a href="#${this.anchor}">${this.text}</a>`, className: this.className });
        if (this.className == '') {
            $x(this.element)
                .styles({ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--darker)', backgroundColor: 'var(--primary)' })
                .first()
                .styles({ textDecoration: 'none', fontWeight: 'bold', color: '#FFFFFF', fontSize: '1rem' });
        }
        document.body.appendChild(this.element);
    }

    $x(this.element).styles({
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        opacity: 0,
        display: 'none'
    });
   
    let backTop = this;

    if (self != parent) {
        $x(this.element).on('click', function() {
            $root.scrollTop(0);
            backTop.execute('onback');
        });
    }
    else {
        for (let a of $a(`[href$=${this.anchor}]`)) {
            if (a.href.endsWith('#' + this.anchor)) {
                $x(a).on('click', function() {
                    backTop.execute('onback');
                });
                break;
            }
        }
    }

    $x(window).on('scroll', function() {
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

    $x(this.element).on('mouseover', function() {
        this.style.opacity = 1;
    });

    $x(this.element).on('mouseout', function() {
        this.style.opacity = backTop.opacity;
    });
}

$finish(function() {
    let backTop = $s('backtop,[backtop]');
    if (backTop != null) {
        new BackTop(backTop).initialize();
    }
    else {
        new BackTop({ text: 'TOP', className: 'backtop' }).initialize();
    }
});