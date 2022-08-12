
/**

<select type="button/image/checkbox/radio" data="" text="" value="" cols="">
    <option value="" icon="url/icon/other" show="" hide=""></option>
    <option>text</option>
    <optgroup data="@[initial]">
        <option value="@[id]" if="@[age] >= 18">@[name]<option>
    </optgroup>
</select>

reload-on
 */ 

HTMLSelectElement.valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

$enhance(HTMLSelectElement.prototype)
    .defineProperties({
        text: {
            get() {
                if (this.selectedIndex > -1) {
                    if (this.multiple) {
                        return [...this.options].filter(option => option.selected).map(option => option.text).join(',');
                    }
                    else {
                        return this.options[this.selectedIndex].text;
                    }
                }
                else {
                    return "";
                }
            },
            set(value) {
                if (typeof(value) == 'string') {
                    value = value.split(',');
                }
                if (value instanceof Array) {
                    let vs = new Set(value);
                    [...this.options].forEach(option => option.selected = vs.has(option.value));                    
                }
                else {
                    HTMLSelectElement.valueDescriptor.set.call(this, value);
                }
            }
        },
        value: {
            get() {
                if (this.multiple) {
                    return [...this.options].filter(option => option.selected).map(option => option.value).join(',');
                }
                else {
                    return HTMLSelectElement.valueDescriptor.get.call(this);
                }
            },
            set(value) {
                if (this.multiple) {
                    if (typeof(value) == 'string') {
                        value = value.split(',');
                    }
                    [...this.options].forEach(option => option.selected = value.includes(option.value));
                }
                else {
                    HTMLSelectElement.valueDescriptor.set.call(this, value);
                }                
            }
        },
        selectedIndexes: {
            get() {
                if (this.multiple) {
                    return [...this.selectedOptions].map(option => option.index);
                }
                else {
                    return [this.selectedIndex];
                }
            },
            set(indexes) {
                if (this.multiple) {
                    let before = this.selectedIndexes;
                    before.filter(index => !indexes.includes(index)).forEach(index => this.options[index].selected = false);
                    indexes.filter(index => !before.includes(index)).forEach(index => this.options[index].selected = true);
                }
                else {
                    this.selectedIndex = indexes[0] ?? -1;
                }
            }
        }
    });



class HTMLSelectPlusElement extends HTMLCustomElement {

    constructor(element) {
        super(element);

        this.#value_ = element.getAttribute('value') ?? ''; //intialize value
        this.#className = element.className;
        this.#disabled = $parseBoolean(this.getAttribute('disabled'), false, this);

        if (this.type == 'checkbox' && !this.multiple) {
            this.multiple = true;
        }        
    }

    #options = [];
    #selectedIndex = -1;
    #selectedIndexes = [];
    #source = 'none'; // 触发 selected 的来源 value/text/index/none
    #initialized = false;
    #container = null; //容器元素

    #value_ = '';
    #onchange_ = null; //原生 onchange 事件
    #for = null; //as a for loop
    
    get container() {
        return this.#container;
    }

    get type() {
        return Enum('original|beauty|button|image|checkbox|radio').validate(this.getAttribute('type'));
    }

    get options() {
        return this.#options;
    }
    
    get selectedIndex() {
        return this.#selectedIndex;
    }

    set selectedIndex(index) {
        if (index < -1) {
            index = -1;
        }
        if (index > this.#options.length - 1) {
            index = this.#options.length - 1;
        }

        if (!this.multiple) {            
            if (index != this.#selectedIndex) {
                if (this.initialized) {
                    this.container.setAttribute('value-', select.getComingValue(index));
                    if (this.execute('onchange', index)) {
                        this.#source = 'index';
                        if (index == -1) {
                            this.options[this.#selectedIndex].selected = false;                        
                        }
                        else {                        
                            this.options[index].selected = true;                
                        }
                        this.#source = 'none';
                        this.#selectedIndex = index;  
                        this.#fireChange();
                    }
                    this.container.removeAttribute('value-');
                }
                else {
                    this.#source = 'index';
                    if (index == -1) {
                        this.options[this.#selectedIndex].selected = false;                        
                    }
                    else {                        
                        this.options[index].selected = true;                
                    }
                    this.#selectedIndex = index;
                    this.#source = 'none';
                }
            }            
        }
        else {
            this.selectedIndexes = [index];
        }
    }

    get selectedIndexes() {
        return this.#selectedIndexes;
    }

    set selectedIndexes(indexes) {
        if (JSON.stringify(indexes) != JSON.stringify(this.#selectedIndexes)) {
            if (this.initialized) {
                this.container.setAttribute('value-', select.getComingValue(indexes));
                if (this.execute('onchange', indexes)) {
                    this.#source = 'indexes';
                    this.#selectedIndexes.filter(index => !indexes.includes(index)).forEach(index => this.options[index].selected = false);
                    indexes.filter(index => !this.#selectedIndexes.includes(index)).forEach(index => this.options[index].selected = true);
                    this.#source = 'none';
                    this.#selectedIndexes = indexes;
                    this.#selectedIndex = indexes[0] ?? -1;
                    this.#fireChange();
                }
                this.container.removeAttribute('value-');
            }
            else {
                this.#source = 'indexes';
                this.#selectedIndexes.filter(index => !indexes.includes(index)).forEach(index => this.options[index].selected = false);
                indexes.filter(index => !this.#selectedIndexes.includes(index)).forEach(index => this.options[index].selected = true);
                this.#source = 'none';
                this.#selectedIndexes = indexes;
                this.#selectedIndex = indexes[0] ?? -1;
            }
        }
    }

    get source() {
        return this.#source;
    }

    #disabled = null;

    get disabled() {
        return this.#disabled;
    }

    set disabled(disabled) {
        if (typeof(disabled) != 'boolean') {
            disabled = $parseBoolean(disabled, true, this);
        }        
        this.options.forEach(option => option.disabled = disabled);
        this.#disabled = disabled;
    }

    get enabled() {
        return !this.#disabled;
    }

    set enabled(enabled) {
        if (typeof(enabled) != 'boolean') {
            enabled = $parseBoolean(enabled, true, this);
        }
        this.disabled = !enabled;
    }

    get text() {
        if (this.type != 'original') {
            if (this.multiple) {
                return [...this.options].filter(option => option.selected).map(option => option.text).join(',');
            }
            else {
                return this.selectedIndex > -1 ? this.options[this.selectedIndex].text : '';
            }
        }
        else {
            return this.container.text;
        }
    }

    set text(text) {
        if (this.type != 'original') {
            if (this.multiple) {
                this.selectedIndexes = this.indexesTextOf(typeof(value) == 'string' ? text.split(',') : text);
            }
            else {
                this.selectedIndex = this.indexTextOf(text);
            }
        }
        else {
            this.container.text = text;
        }
    }

    get value() {
        if (this.type != 'original') {
            //value- = coming value
            if (this.container.hasAttribute('value-')) {
                return this.container.getAttribute('value-');
            }
            else {
                if (this.multiple) {
                    return [...this.options].filter(option => option.selected).map(option => option.value).join(',');
                }
                else {
                    return this.selectedIndex > -1 ? this.options[this.selectedIndex].value : '';
                }
            }
        }
        else {
            return this.container.value;
        }        
    }

    set value(value) {
        if (this.type != 'original') {
            if (this.multiple) {
                this.selectedIndexes = this.indexesOf(typeof(value) == 'string' ? value.split(',') : value);
            }
            else {
                this.selectedIndex = this.indexOf(value);
            }
        }
        else {
            this.container.value = value;
        }
    }

    get data() {
        return this.getAttribute('data', '');
    }

    set data(data) {
        this.setAttribute('data', data);
    }

    get await() {
        return this.getAttribute('await', '');
    }

    set await(await) {
        this.setAttribute('await', await);
    }

    #className = null;

    get className() {
        return this.#className;
    }

    set className(className) {
        this.#className = className;
        if (this.type != 'beauty') {
            this.container.className = className;
        }
        else {
            this.box.className = className;
        }
    }

    //for beauty only
    get frameClass() {
        return this.getAttribute('frame-class') ?? this.#className;
    }

    set frameClass(className) {
        this.setAttribute('frame-class', className)
        this.container.className = className;
    }

    //for beauty only
    get labelClass() {
        return this.getAttribute('label-class');
    }

    set labelClass(className) {
        this.setAttribute('label-class', className);
    }

    get optionClass() {
        return this.getAttribute('option-class') ?? HTMLSelectPlusElement[this.type].optionClass;
    }

    set optionClass(className) {
        if (className != this.optionClass) {
            this.setAttribute('option-class', className);
            this.#updateAppearances();
        }
    }

    get selectedOptionClass() {
        return this.getAttribute('selected-option-class') ?? HTMLSelectPlusElement[this.type].selectedOptionClass;
    }

    set selectedOptionClass(className) {
        if (className != this.selectedOptionClass) {
            this.setAttribute('selected-option-class', className)
            this.#updateAppearances();
        }
    }

    get disabledOptionClass() {
        return this.getAttribute('disabled-option-class') ?? HTMLSelectPlusElement[this.type].disabledOptionClass;
    }

    set disabledOptionClass(className) {
        if (className != this.disabledOptionClass) {
            this.setAttribute('disabled-option-class', className);
            this.#updateAppearances();
        }
    }

    #status = 'none';
    #hintElement = undefined;

    get hintElement() {
        if (this.#hintElement === undefined) {
            this.hintElement = this.getAttribute('hint') ?? this.getAttribute('hint-element');
        }
        return this.#hintElement;
    }

    set hintElement(element) {
        this.#hintElement = $parseElement(element, 'hintElement');
    }

    get calloutPosition() {
        return this.getAttribute('callout-position') ?? this.getAttribute('callout');
    }

    set calloutPosition(position) {
        this.setAttribute('callout-position', position);
    }

    get messageDuration() {
        return this.getAttribute('message-duration') ?? this.getAttribute('message');
    }

    set messageDuration(duration) {
        this.setAttribute('message-duration', duration);
    }

    get successText() {
        return this.getAttribute('success-text', '');
    }

    set successText(text) {
        this.setAttribute('success-text', text);
    }

    get failureText() {
        return this.getAttribute('failure-text', '');
    }

    set failureText(text) {
        this.setAttribute('failure-text', text);
    }

    get exceptionText() {
        return this.getAttribute('exception-text', '');
    }

    set exceptionText(text) {
        this.setAttribute('exception-text', text);
    }

    //optGroup: 'OPTGROUP',  //选项元素组的标签选择器
    //option: 'OPTION', //选项元素的标签选择器
    //cols: 1,
    
    get multiple() {
        return $parseBoolean(this.getAttribute('multiple'), false, this);
    }
    
    set multiple(multiple) {
        this.setAttribute('multiple', multiple);
    }

    //select button only
    get scale() {
        return this.getAttribute('scale') ?? SelectButtonScale.NORMAL;
    }

    set scale(scale) {
        if (scale != this.scale) {
            this.setAttribute('scale', scale);
            this.#updateAppearances();
        }
    }

    get initialized() {
        return this.#initialized;
    }

    get hidden() {
        return this.container.hidden;
    }

    set hidden(value) {
        this.container.hidden = value;
    }

    set hintText(text) {
        if (this.hintSpan != null) {
            this.hintSpan.innerHTML = text;
            if (this.#status == 'success') {
                this.hintSpan.className = 'correct';
            }
            else {
                this.hintSpan.className = 'error';
            }                    
            this.hintSpan.hidden = text == '';
        }
        
        if (text != '') {
            if (this.calloutPosition != null) {
                Callout(text).position(this.container, this.callout).show();
            }
            
            if (this.messageDuration != null) {
                window.Message?.[this.#status != 'success' ? 'red' : 'green'](text).show(this.message.toFloat(0));
            }
        }
    }

    initialize() {

        if (this.type == 'beauty') {
            //this.box =           
        }
        else if (this.type != 'original') {
            this.#container = $create(HTMLSelectPlusElement[this.type].container, { className: this.frameClass });
            this.#container.setAttribute('style', this.element.getAttribute('style', ''));
            this.element.insertAdjacentElement('beforeBegin', this.#container);
        }
        else {
            this.#container = this.element;
        }
        
        let select = this;
        if (this.type != 'original') {
            this.#container.onclick = function(ev) {
                if (!select.disabled) {
                    let target = ev.target;
                    let allowed = true;
                    if (select.type == 'radio' || select.type == 'checkbox') {
                        allowed = target.nodeName == 'INPUT' || target.nodeName == 'LABEL';
                    }
                    while (target.getAttribute('index') == null && target.nodeName != 'BODY') {
                        target = target.parentNode;
                    }
                    if (allowed && target.nodeName != 'BODY') {
                        let index = target.getAttribute('index').toInt();
                        if (select.initialized) {
                            select.#container.setAttribute('value-', select.#getComingValue(index));
                            if (select.dispatch('onchange', { index: index, ev: ev })) {
                                if (select.multiple) {
                                    select.options[index].selected = !select.options[index].selected;
                                }
                                else if (!select.options[index].selected) {
                                    select.options[index].selected = true;
                                }
                                select.#fireChange();
                            }
                            select.#container.removeAttribute('value-');
                        }                    
                    }
                }
            }
        }
        else {
            if (this.#container.onchange != null && this['onchange+'] != null) {
                this.#onchange_ = this.container.onchange;
                this.#container.onchange = null;
            }

            this.#container.on('change', function(ev) {
                if (select.dispatch(select.onchange_ != null ? 'onchange_' : 'onchange', { selectedIndex: this.selectedIndex, ev: ev })) {
                    select.#fireChange();
                }
            });
        }

        if (this.type != 'original') {
            this.element.hidden = true; 
        }
        
        if (this.data != '') {        
            this.#for = HTMLForElement.from(this.element, this);
            this.#for.onload = function(data) {
                this.owner.completeLoading(data);
            }
    
            if (this.await == '') {
                this.load();
            }
            else {
                Event.await(this, this.await);
            }
        }
    
        Event.interact(this, this.element);
    
        if (this.data == '') {
            this.completeLoading();
        }
    
        if (this.#disabled) {
            this.disabled = true;
        }
    
        if (this.successText != '' || this.failureText != '' || this.exceptionText != '') {
            if (this.hintElement == null && this.calloutPosition == null && this.messageDuration == null) {
                this.hintElement = $create('SPAN', { innerHTML: '', className: 'error' }, { marginLeft: '30px' });
                this.insertAdjacentElement('afterEnd', this.hintElement);            
            }    
        }
    }

    load() {
        this.#for?.load();
    }

    completeLoading (data) {

        if (this.type != 'original') {
            for (let option of this.element.querySelectorAll('option')) {
                this.add(option);
            }
        }
        else {
            //同步属性
            this.#selectedIndex = this.container.selectedIndex;
            this.options.push(...this.container.options);
        }
    
        if (!this.#initialized) {
            if (this.#value_ != '' && this.value != this.#value_) {
                this.value = this.#value_;
            }
        }

        if (this.data == '') {
            this.#initialized = true;
            this.dispatch('onload');
        }
        else {
            if (this.#initialized) {
                this.dispatch('onreload', { data: data });
            }
            else {
                this.#initialized = true;
                this.setAttribute('loaded', '');
                this.dispatch('onload', { data: data });
            }
        }
    }

    #getComingValue = function(index) {
        if (this.multiple) {
            if (index instanceof Array) {
                return index.map(i => this.options[i].value).join(',');
            }
            else {
                let indexes = new Set(this.selectedIndexes);
                if (indexes.has(index)) {
                    index.delete(index);
                }
                else {
                    indexes.add(index);
                }
                return [...indexes].map(i => this.options[i].value).join(',');
            }
        }
        else {
            return this.options[index].value;
        }
    }

    #fireChange = function() {
        if (this['onchange+'] != null) {
            $FIRE(this, 'onchange+',
                    function(data) {
                        this.#status = 'success';
                        this.hintText = this.successText.$p(this, data);
                    }, 
                    function(data) {
                        this.#status = 'failure';
                        this.hintText = this.failureText.$p(this, data);
                    },
                    function(error) {
                        this.#status = 'exception';
                        this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
                    });
        }
    }

    enable () {
        this.disabled = false;
    }
    
    disable () {
        this.disabled = true;
    }
    
    
    load () {
        this.#for?.load();
    }
    
    reload () {
        if (this.data != '') {
            this.clear();
            this.load();
        }    
    }

    add (optionElement) {

        let option = new SelectPlusOption(optionElement).populate(this);
        this.#container.appendChild(option.container);
        this.#options.push(option);
    
        if (option.selected) {
            if (this.multiple) {
                this.#selectedIndexes.push(option.index);
                this.#selectedIndex = this.#selectedIndexes[0];
            }
            else {
                if (this.#selectedIndex > -1) {
                    this.#options[this.#selectedIndex].deselect();
                }
                this.#selectedIndex = option.index;
            }
    
            option.doselect();
            option.hideAndShow();
        }
        
        if (option.disabled) {
            option.disabled = true;
        }
    
        option.updateAppearance();
    };

    delete = function(option) {

        //原索引位置
        let index = option.index;
        
        //更新select的value和text
        option.selected = false;
    
        //删除元素和数组项
        option.container.remove();
        this.options.splice(index, 1);
        
        //更新其他option的index
        for (let i = index + 1; i < this.options.length; i++) {
            this.options[i].index -= 1;
        }
    
        this.#updateAppearances();
    }

    clear () {
        this.container.innerHTML = '';
        this.element.innerHTML = '';
        this.#selectedIndex = -1;
        this.text = '';
        this.value = '';
        this.options.length = 0;
    };

    indexOf (value) {
        let index = -1;
        if (value != '') {
            for (let option of this.options) {
                if (option.value == value) {
                    index = option.index;
                    break;
                }
            }
        }
        return index;
    };

    indexesOf (values) {
        let indexes = [];
        if (values.length > 0) {
            for (let option of this.options) {
                if (values.includes(option.value)) {
                    indexes.push(option.index);
                }
            }
        }
        return indexes;
    }

    indexTextOf (text) { 
        let index = -1;
        for (let option of this.options) {
            if (option.text == text) {
                index = option.index;
            }
        }
        return index;
    };

    indexesTextOf (texts) {
        let indexes = [];
        if (texts.length > 0) {
            for (let option of this.options) {
                if (texts.includes(option.text)) {
                    indexes.push(option.index);
                }
            }
        }
        return indexes;
    }

    #updateAppearances = function() {
        for (let i = 0; i < this.options.length; i++) {
            this.options[i].updateAppearance(); 
        }
    }

    resetSelectedIndexes() {
        if (this.#source == 'none') {
            this.#selectedIndexes = this.options.filter(option => option.selected).map(option => option.index);
            this.#selectedIndex = this.#selectedIndexes[0] ?? -1;
        }
    }
}

HTMLCustomElement.defineEvents(HTMLSelectPlusElement.prototype, ['onload', 'onreload', 'onchange', 'onchange+']);

SelectButtonScale = {
    LARGE: 'large',
    BIG: 'big',
    MEDIUM: 'medium',
    NORMAL: 'normal',
    SMALL: 'small',
    MINI: 'mini'
}

class SelectPlusOptGroup {
    #select = null;
    constructor(element) {
        this.label = '';
        this.data = '';
    }
}

class SelectPlusOption extends HTMLCustomElement {

    constructor(element) {
        super(element);

        if (element.value != '' && element.text == '') {
            element.text = element.value;
        }

        if (element.text != '' && element.value == '') {
            element.value = element.text;
        }
    }
    
    #index = -1;
    #group = null;
    #container = null;
    #select = null; 

    get select() {
        return this.#select;
    }

    get text() {
        return this.element.text;
    }

    set text(text) {
        if (text != this.element.text) {
            this.element.text = text;
            HTMLSelectPlusElement[this.#select.type].setText.call(this, text);
        }        
    }

    get value() {
        return this.element.value;
    }

    set value(value) {
        if (value != this.element.value) {
            this.element.value = value;
            this.#container.setAttribute('value', value);
        }        
    }

    get title() {
        return this.element.title;
    }

    set title(title) {
        this.element.title = title;
        this.#container.title = title;
    }

    get src() {
        return this.element.getAttribute('src');
    }

    set src(src) {
        this.element.setAttribute('src', src);
        this.#container?.querySelector('IMG')?.set('src', src);
    }

    get className() {
        return this.element.className || this.#select?.optionClass;
    }

    set className(className) {
        if (className != this.className) {
            if (!this.selected) {
                this.container.removeClass(this.className).addClass(className);
            }            
            this.element.className = className;
        }
    }

    get selectedClass() {
        return this.getAttribute('selected-class') ?? this.#select?.selectedOptionClass ?? '';
    }

    set selectedClass(className) {
        if (className != this.selectedClass) {
            if (this.selected) {
                this.container.removeClass(this.selectedClass).addClass(className);
            }            
            this.setAttribute('selected-class', className);
        }
    }

    get disabledClass() {
        return this.getAttribute('disabled-class') ?? this.#select?.disabledOptionClass ?? '';
    }

    set disabledClass(className) {
        if (className != this.disabledClass) {
            if (this.disabled) {
                this.container.removeClass(this.disabledClass).addClass(className);
            }         
            this.setAttribute('disabled-class', className);
        }
    }

    //切换到当前选项时显示哪些元素
    get toShow() {
        return this.getAttribute('to-show', '');
    }

    set toShow(selector) {
        this.setAttribute('to-show', selector);
    }
    
    //切换到当前选项时隐藏哪些元素
    get toHide() {
        return this.getAttribute('to-hide', '');
    }
    
    set toHide(selector) {
        this.setAttribute('to-hide', selector);
    }

    get index() {
        return this.#index;
    }

    set index(index) {
        this.#index = index;
    }

    get selected() {
        return this.element.selected;
    }

    set selected(selected) {
        if (typeof (selected) != 'boolean') {
            selected = $parseBoolean(selected);
        }
                
        if (selected != this.selected || (selected && this.selected && this.#select.selectedIndex == -1)) {

            if (this.#select.multiple) {
                if (selected) {
                    this.container.removeClass(this.selectedClass).addClass(this.className);
                }
                else {
                    this.container.removeClass(this.className).addClass(this.selectedClass);
                }
                this.element.selected = selected;

                if (selected) {
                    this.hideAndShow();
                }
            }
            else {
                if (selected) {
                    if (this.#select.selectedIndex > -1) {
                        this.#select.options[this.#select.selectedIndex].deselect();
                    }        
                    this.container.removeClass(this.className).addClass(this.selectedClass);
                    this.element.selected = true;

                    this.hideAndShow();
                }
                else {
                    this.container.removeClass(this.selectedClass).addClass(this.className);
                    this.element.selected = false;
                }
            }  
            
            this.#select.resetSelectedIndexes();
        }
        
        HTMLSelectPlusElement[this.#select.type].selectAop.call(this, selected);
    }

    get disabled() {
        return $parseBoolean(this.element.getAttribute('disabled'), true, this);
    }

    set disabled(disabled) {
        if (typeof(disabled) != 'boolean') {
            disabled = $parseBoolean(disabled, true, this);
        }
        if (disabled != this.disabled) {
            if (disabled) {
                this.container.addClass(this.disabledClass);
            }
            else {
                this.container.removeClass(this.disabledClass);
            }
            this.element.disabled = disabled;
            HTMLSelectPlusElement[this.#select.type].disableAop.call(this, disabled);
        }        
    }

    get enabled() {
        return !this.disabled;
    }

    set enabled(enabled) {
        if (typeof(enabled) != 'boolean') {
            enabled = $parseBoolean(enabled, true, this);
        }
        this.disabled = !enabled;
    }

    get container() {
        return this.#container;
    }

    populate(select) {
        this.#select = select;
        this.#index = select.options.length;
        this.#container = HTMLSelectPlusElement[select.type].populate.call(this);

        return this;
    }

    doselect() {
        this.#container.removeClass(this.className).addClass(this.selectedClass);
    }    

    deselect() {
        this.#container.removeClass(this.selectedClass).addClass(this.className);
        this.element.selected = false;
    }

    remove () {
        this.#select.delete(this);
    };

    hideAndShow () {
        $a(this.toHide).forEach(e => e.hide());
        $a(this.toShow).forEach(e => e.show());
    }

    // scale = normal
    // selectedClass = 'new' 或 className = 'old' 或 disabled
    updateAppearance = function(terminal) {
        HTMLSelectPlusElement[this.#select.type].updateAppearance.call(this, terminal);
    }
}

HTMLSelectPlusElement.original = {
    container: '',
    optionClass: '', 
    selectedOptionClass: '',
    disabledOptionClass: '',
    defaultSelectedIndex: 0,
    setText: function(text) {

    },
    populate: function() {

    },
    selectAop: function(yes) {

    },
    disableAop: function(yes) {

    }
}

HTMLSelectPlusElement.button = {
    container: 'SPAN',
    optionClass: 'optional-button', 
    selectedOptionClass: 'blue-button',
    disabledOptionClass: 'disabled-button',
    defaultSelectedIndex: 0,
    setText: function(text) {
        this.container.innerHTML = text;
    },
    populate: function() {
        return $create('BUTTON', { innerHTML: this.text, title: this.title }, { }, { value: this.value, index: this.index });
    },
    selectAop: function(yes) {

    },
    disableAop: function(yes = true) {
        this.container.disabled = yes;
    },
    updateAppearance: function(terminal) {
        let css = this.select.scale != '' && SelectButtonScale[this.select.scale.toUpperCase()] != null ? this.select.scale + '-button ' : '';
        let length = this.select.options.length;

        // l = 1, i = 0 - alone
        // l > 1, i = 0 - left
        // i > 1, i = length -1 = right
        // i > 2, i > 0 && i < length - 1 = center
        if (length == 1) {
            //alone
            css += 'button-alone';
        }
        else if (length == 2) {
            //left-right
            if (this.index == 0) {
                css += 'button-left';
            }
            else if (this.index == 1) {
                css += 'button-right';            
            }      
        }
        else if (length > 2) {
            //left-center-right
            if (this.index == 0) {
                css += 'button-left';
            }
            else if (this.index == length - 1) {
                css += 'button-right';
            }
            else {
                css += 'button-center';
            }
        }

        if (this.selected) {
            css += ' ' + (this.selectedClass || this.select.selectedOptionClass);
        }
        else {
            css += ' ' + (this.className || this.select.optionClass);
        }

        if (this.disabled) {
            css += ' ' + (this.disabledClass || this.select.disabledOptionClass);
        }

        if (this.container.className != css) {
            this.container.className = css;
        }

        if (terminal == null) {
            if (this.index > 0) {
                this.select.options[this.index - 1].updateAppearance('terminal');
            }
            if (this.index < length - 1) {
                this.select.options[this.index + 1].updateAppearance('terminal');
            }
        }
    }
}

HTMLSelectPlusElement.image = {
    container: 'SPAN',
    optionClass: 'image-option', 
    selectedOptionClass: 'image-selected-option',
    disabledOptionClass: 'image-disabled-option',
    defaultSelectedIndex: 0,
    setText: function(text) {
        this.container.lastChild.innerHTML = text;
    },
    populate: function() {
        let span = $create('SPAN', { title: this.title }, { }, { value: this.value, index: this.index });
        let image = $create('IMG', { src: this._src, align: 'absmiddle' });
        span.appendChild(image);
        span.appendChild($create('BR'))
        span.appendChild($create('SPAN', { innerHTML: this.text }));
        return span;
    },
    selectAop: function(yes) {

    },
    disableAop: function(yes = true) {
        this.container.setAttribute('disabled', yes);
    },
    updateAppearance: function(terminal) {
        if (this.selected) {
            this.container.className = this.selectedClass || this.select.selectedOptionClass;
        }
        else {
            this.container.className = this.className || this.select.optionClass;
        }

        if (this.disabled) {
            this.container.className = this.disabledClass || this.select.disabledOptionClass;
        }
    }
}

HTMLSelectPlusElement.radio = {
    container: 'DIV',
    optionClass: 'item-option',
    selectedOptionClass: 'item-selected-option',
    disabledOptionClass: 'item-disabled-option',
    defaultSelectedIndex: 0,
    setText: function(text) {
        this.container.lastChild.innerHTML = text;
    },
    populate: function() {
        let div = $create('DIV', { title: this.title, className: this.className }, { }, { value: this.value, index: this.index });
        let radio = $create('INPUT', { type: 'radio', name: this.select.id, id: this.select.id + '_' + this.index, value: this.value, checked: this.selected }, { }, { index: this.index });
        let label = $create('LABEL', { htmlFor: this.select.id + '_' + this.index, innerHTML: this.text });
        div.appendChild(radio);
        div.appendChild(document.createTextNode(' '));
        div.appendChild(label);
        return div;
    },
    selectAop: function(yes) {
        this.container.firstChild.checked = yes;
    },
    disableAop: function(yes = true) {
        this.container.firstChild.disabled = yes;
    },
    updateAppearance: function(terminal) {
        if (this.selected) {
            this.container.className = this.selectedClass || this.select.selectedOptionClass;
        }
        else {
            this.container.className = this.className || this.select.optionClass;
        }

        if (this.disabled) {
            this.container.className = this.disabledClass || this.select.disabledOptionClass;
        }
    }
}

HTMLSelectPlusElement.checkbox = {
    container: 'DIV',
    optionClass: 'item-option',
    selectedOptionClass: 'item-selected-option',
    disabledOptionClass: 'item-disabled-option',
    defaultSelectedIndex: -1,
    setText: function(text) {
        this.container.lastChild.innerHTML = text;
    },
    populate: function() {
        let div = $create('DIV', { title: this.title, className: this.className }, { }, { value: this.value, index: this.index });
        let radio = $create('INPUT', { type: 'checkbox', name: this.select.id, id: this.select.id + '_' + this.index, value: this.value, checked: this.selected }, { }, { index: this.index });
        let label = $create('SPAN', { htmlFor: this.select.id + '_' + this.index, innerHTML: this.text });
        div.appendChild(radio);
        div.appendChild(document.createTextNode(' '));
        div.appendChild(label);
        return div;
    },
    selectAop: function(yes) {
        this.container.firstChild.checked = yes;
    },
    disableAop: function(yes = true) {
        this.container.firstChild.disabled = yes;
    },
    updateAppearance: function(terminal) {
        if (this.selected) {
            this.container.className = this.selectedClass || this.select.selectedOptionClass;
        }
        else {
            this.container.className = this.className || this.select.optionClass;
        }

        if (this.disabled) {
            this.container.className = this.disabledClass || this.select.disabledOptionClass;
        }
    }
}

HTMLSelectPlusElement.initializeAll = function(element) {
    if (typeof(element) == 'string') {
        element = $s(element);
    }
    (element ?? document).querySelectorAll('select:not([root-select])').forEach(select => {
        HTMLElement.boostPropertyValue(select, 'value');
        select.setAttribute('root-select', '');
        new HTMLSelectPlusElement(select).initialize();
    });
}

document.on('post', function () {
    HTMLSelectPlusElement.initializeAll();
});