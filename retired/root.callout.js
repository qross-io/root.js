/*
<div callout="">
    <callout for="selector" class="" show-on="hover|click|call">
        content
    </callout>
</div>

//这个要慎重, 每个都弹出让人烦，在右侧或左侧还好
<treenode callout="" callout-class="" callout-mode="" position="top|bottom|left|right|auto">
    <callout class="" mode="hover|click|wait">
        content
    </callout>
</treenode>
*/

//Callout("Content").upside(element).downside(element).leftside(element).rightside().call();

Callout = function(content) {
    return new Callout.Entity(content);
}

Callout.Entity = function(content) {
    this.content = content;
    this.reference = null;
    this.location = 1;
    this.offsetX = 0;
    this.offsetY = 0;
}

//up
Callout.Entity.prototype.upside = function(element) {
    this.reference = typeof(element) == 'string' ? $s(element) : element;
    this.location = 1;
    return this;
}

//bottom
Callout.Entity.prototype.downside = function(element) {
    this.reference = typeof(element) == 'string' ? $s(element) : element;
    this.location = 3;
    return this;
}

//left
Callout.Entity.prototype.leftside = function(element) {
    this.reference = typeof(element) == 'string' ? $s(element) : element;
    this.location = 0;
    return this;
}

//right
Callout.Entity.prototype.rightside = function(element) {
    this.reference = typeof(element) == 'string' ? $s(element) : element;
    this.location = 2;
    return this;
}

Callout.Entity.prototype.offset = function(x, y) {
    this.offsetX = x;
    this.offsetY = y;
    return this;
}

Callout.Entity.prototype.position = function(element, pos) {
    this.reference = typeof(element) == 'string' ? $s(element) : element;
    switch (pos.toLowerCase()) {
        case 'left':
        case 'leftside':
            this.location = 0;
            break;
        case 'right':
        case 'rightside':
            this.location = 2;
            break;
        case 'down':
        case 'downside':
        case 'under':
        case 'bottom':
            this.location = 3;
            break;
        default:
            this.location = 1;
            break;
    }

    return this;
}

Callout.Entity.prototype.locate = function() {
    switch(this.location) {
        case 0:  //left
            return $x('#Callout').css("callout callout-right").leftside(this.reference, this.offsetX - 12, this.offsetY);
        case 1: //over
            return $x('#Callout').css("callout callout-bottom").upside(this.reference, this.offsetX, this.offsetY - 12);
        case 2: //right
            return $x('#Callout').css("callout callout-left").rightside(this.reference, this.offsetX + 12, this.offsetY);
        case 3: //under
            return $x('#Callout').css("callout callout-top").downside(this.reference, this.offsetX, this.offsetY + 12);
        default:
            return true;
    }
}

Callout.Entity.$timer = null;
Callout.Entity.prototype.show = function(seconds) {
    $x('#Callout').html(this.content).show().style('visibility', 'hidden');
    while (!this.locate()) {
        this.location = (this.location + 1) % 4;
    }

    $x('#Callout').style('visibility', 'visible');
    if (seconds != null) {
        if (Callout.Entity.$timer != null) {
            window.clearTimeout(Callout.Entity.$timer);
        }
        Callout.Entity.$timer = window.setTimeout(function() {
            $x('#Callout').hide();
            window.clearTimeout(Callout.Entity.$timer);
        }, seconds * 1000);
    }
}

Callout.hide = function() {
    $x('#Callout').hide();
}

$finish(function() {
    if ($s('#Callout') == null) {
        $x(document.body).append('DIV', { id: 'Callout', className: 'callout' }, { display: 'none' });
        $x('#Callout').bind('click', function() { this.style.display = 'none'; window.clearTimeout(Callout.Entity.$timer); });
    }
})