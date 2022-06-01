
/*
<waterfall name="">
    <stage class="cls1">time1<stage>
    <stage class="cls2">time2<stage>
</waterfall>
*/

WaterFall = function(element) {
    $initialize(this)
    .with(element)
    .declare({
        name: 'WaterFall_' + String.shuffle(7)
    })
    .elementify(function(element) {
        this.element = element;

        for (let stage of element.querySelectorAll('stage')) {
            this.stages.push(new WaterFall.Stage(stage));
        }
    });
}

WaterFall.prototype.element = null;
WaterFall.prototype.stages = [];

WaterFall.Stage = function(element) {
    this.text = element.innerHTML;
    this.className = element.className;
}