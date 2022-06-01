
//<div backtop anchor="name" class="backtop">Top</div>

class HTMLBackTopElement extends HTMLElement {

    #anchor = null;

    get anchor() {
        if (this.#anchor == null) {
            let first = document.body.firstElementChild;
            while (first != null && first.hidden)  {
                first = first.nextElementSibling;
            }
            this.#anchor = first?.id;
            if (this.#anchor == null) {
                first = $create('DIV');
                document.body.insertAfterBegin(first);
                this.#anchor = '';
            }
            if (this.#anchor == '') {
                this.#anchor = 'BackTopAnchor';
                first.id = this.#anchor;
            }
        }
        
        return this.#anchor;
    }
    
    get opacity() {
        return $parseFloat(this.getAttribute('opacity'), 0);
    }

    set opacity(value)  {
        this.setAttribute('opacity', value);
    }

    display = '';

    initialize() {
        this.display = this.css.display;

        this.setStyles({
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            opacity: 0,
            display: 'none'
        });
    }
}

window.customElements.define('back-top', HTMLBackTopElement);

document.on('post', function() {
    let backTop = $s('back-top');
    if (backTop == null) {
        backTop = $create('BACK-TOP', 
                    { innerHTML: `<a style="text-decoration: none; font-weight: bold; color: #FFFFFF; font-size: 1rem;">TOP</a>` },
                    {                         
                        width: '50px', height: '50px', borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--darker)', backgroundColor: 'var(--primary)'
                    });
        document.body.appendChild(backTop);

        backTop.firstChild.href = `#${backTop.anchor}`;
    }
    backTop.initialize();

    if (self != parent) {
        backTop.on('click', function(ev) {
            $root.scrollTop = 0;
            backTop.dispatch('onback', { event: ev });
        });
    }
    else {
        for (let a of $a(`[href$=${backTop.anchor}]`)) {
            if (a.href.endsWith('#' + backTop.anchor)) {
                a.on('click', function(ev) {
                    backTop.dispatch('onback', { event: ev });
                });
                break;
            }
        }
    }

    window.on('scroll', function() {
        let scrollTop = $root.scrollTop;
        if (scrollTop > 200) {
            scrollTop -= 200;
            backTop.opacity = Math.round(scrollTop / 20) / 100;
            if (backTop.opacity > 1) {
                backTop.opacity = 1;
            }
            backTop.style.display = backTop.display;
            backTop.style.opacity = backTop.opacity;
        }
        else {
            backTop.style.display = 'none';
            backTop.style.opacity = 0;
        }
    });

    backTop.on('mouseover', function() {
        this.style.opacity = 1;
    });

    backTop.on('mouseout', function() {
        this.style.opacity = backTop.opacity;
    });
});