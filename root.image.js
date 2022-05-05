
//loading="auto|eager|lazy"

$enhance(HTMLImageElement.prototype).extend('onload+', 'onerror+');

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

    Event.interact(img, img);
}

document.on('post', function() {
    $$('img:not([src])').forEach(img => {
        if (!img.hasAttribute('root-image')) {
            img.setAttribute('root-image', '');
            if (img.hasAttribute('onload+') || img.hasAttribute('onerror+')) {
                img.initialize();
            }
            else if (img.hasAttribute('onload-') || img.hasAttribute('onerror-')) {
                HTMLElement.interactEvents(img);
            }

            window.Model?.boostPropertyValue(img);

            if (!img.hasAttribute('src')) {
                img.src = '';
            }
        }
    })
});