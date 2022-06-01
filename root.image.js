
//loading="auto|eager|lazy"

$enhance(HTMLImageElement.prototype).defineEvents('onload+', 'onerror+');

HTMLImageElement.prototype.initialize = function() {
    let img = this;

    if (this.hasAttribute('onload+')) {
        this.on('load', function() {
            $FIRE(this, 'onload+');
        });
    }

    if (this.hasAttribute('onerror+')) {
        this.on('error', function() {
            $FIRE(this, 'onerror+');
        });
    }
}

document.on('post', function() {
    $$('img').forEach(img => {
        if (!img.hasAttribute('root-image')) {
            img.setAttribute('root-image', '');
            
            if (!img.hasAttribute('src')) {
                if (img.hasAttribute('onload+') || img.hasAttribute('onerror+')) {
                    img.initialize();
                    Event.interact(img);
                }
                else if (img.hasAttribute('onload-') || img.hasAttribute('onerror-')) {
                    Event.interact(img);
                }

                img.src = '';
            }

            HTMLElement.boostPropertyValue(img);
        }
    })
});