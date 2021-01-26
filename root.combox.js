
/*
    <select id="Select" name="select" combox="yes" cols="1" inputable="no"
        align-options="start/end/center/stretch"
        class="" label-class="" option-class="" selected-option-class=""
         data="" onchange="">
        <optgroup label="Number" class="" option-class="" selected-option-class="" data="@:group1">
            <option selected="yes" value="@[value]" class="" selected-class="">@[text]</option>
        </optgroup>
        <optgroup label="Letter" data="@:group2">
            <option>A</option>
            <option>B</option>
            <option>C</option>
        </optgroup>
    </select>
*/

document.comboxes = new Object();

class Combox {
    constructor(element) {

        this.$options = [];
        
        $initialize(this)
        .with(element)
        .declare({
            $name: 'Combox_' + $size(document.comboxes),
            cols: 1,
            inputable: false,
            alignOptions: 'start',
            class: '',
            labelClass: '',
            optionClass: '',
            selectedOptionClass: '',

            data: '',

            disabled: false,
            selectedIndex: -1,

            onload: null,   // function(data) { }
            onchange: null  // function(beforeOption, ev) { }
        })
        .elementify(element => {            
            this.container = $create('SPAN', { id: this.id }, { }, { name: this.$name, 'selectbutton': 'yes', value: element.getAttribute('value') || '' });
            $x(element).insertFront(this.container);
            
            this.element = element;        
        })
        .objectify(object => {
            if (object['container'] != null) {
                this.container = (typeof(object['container']) == 'string') ? $s(object['container']) : object['container'];
            }
        });
    }
    
    get initialized() {
        return this.$initialized;
    }
}

//保存配置的元素
Combox.prototype.element = null;
//容器元素
Combox.prototype.container = null;
Combox.prototype.$initialized = false;

Combox.prototype.apply = function(container) {

    if (container != null) {
        this.container = typeof(container) == 'string' ? $s(container) : container;
    }

    if (this.container == null) {
        throw new Error('Must specify set container property to contain buttons.');
    }
    else {
        //clear #text        
        for (let child of this.container.childNodes) {
            if (child.nodeType == 3) {
                child.remove();
            }
        }
    }

    if (this.element != null) {
        if (this.data != '') {
            $TAKE(this.data, this.element, this, function(result) {
                //model.js的解析规则
            });
        }
        else {
            for (let option of this.element.querySelectorAll('option')) {
                this.add(option);
            }
        }
        
        this.element.remove();
    }

    this.$initialized = true;
}

Combox.prototype.add = function(option) {

}


class ComOptGroup {
    constructor(element) {

        $initialize(this)
        .with(element)
        .declare({
            label: '',

            class: '',            
            optionClass: '',
            selectedOptionClass: '',

            data: '',
            path: ''
        });
    }
}

class ComOption {
    constructor() {
        
        $initialize(this)
        .with(element)
        .declare({
            text: '',
            value: '',
    
            class: '',
            selectedClass: '',
    
            selected: false
        });        
    }
}

//所属分组
ComOption.prototype.group = null;

Combox.initialize = function(box) {
    if (typeof(box) == 'string') {
        box = $s(box);
    }
    if (box != null) {
        new Combox(box).apply();
    }
    else {
        throw new Error('Must specify a SELECT element width attribute "combox".');
    }
}

Combox.initializeAllIn = function(element) {
    if (typeof(element) == 'string') {
        element = $s(element);
    }
    element.querySelectorAll('select[combox]').forEach(box => {
        new Combox(box).apply();
    });
}

Combox.initializeAll = function() {
    Combox.initializeAllIn(document);
}

$box = function(name) {
    return document.comboxes[name.replace(/^#/, '')];
}


$finish(function () {
    Combox.initializeAll();
});