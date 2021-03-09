

class SelectButton {

    constructor(element) {
        
        this.$options = [];

        $initialize(this)
        .with(element)
        .declare({
            $name: 'SelectButton_' + document.components.size,
            
            $focusOptionClass: 'green-button',
            $blurOptionClass: 'optional-button',
            $disabledOptionClass: 'disabled',
            $scale: SelectButtonScale.NORMAL,

            $selectedIndex: -1,
            multiple: false,

            action: '',
            
            $disabled: false,

            onchange: null, //function(beforeOption, ev) { },
            onerror: null, //function(statusText) { },
            onsuccess: null //function(result) { }
        }).elementify(element => {
            if (element.nodeName == 'SPAN') {
                this.container = element;
            }
            else {
                this.container = $create('SPAN', { id: this.id }, { }, { name: this.$name, 'selectbutton': 'yes', value: element.getAttribute('value') || '' });
                if (element.getAttribute('style') != null) {
                    this.container.setAttribute('style', element.getAttribute('style'));
                }
                $x(element).insertFront(this.container);
            }
            this.element = element;
        }).objectify(object => {
            if (object['container'] != null) {
                this.container = (typeof(object['container']) == 'string') ? $s(object['container']) : object['container'];
            }
        });        

        let selectButton = this;
        this.container.onclick = function(ev) { 
            let index = ev.target.getAttribute('index').toInt();
            if (selectButton.multiple) {
                selectButton.options[index].selected = !selectButton.options[index].selected;
            }
            else if (!selectButton.options[index].selected) {
                selectButton.options[index].selected = true;
            }
        }
    }

    get name() {
        return this.$name;
    }

    set name(name) {
        if (name != this.$name) {
            this.container.id = name;
            document.components.delete(this.$name);
            document.components.set(name, this);
            this.id = name;
            this.$name = name;
        }
    }
    
    get selectedIndex() {
        return this.$selectedIndex;
    }

    set selectedIndex(index) {
        if (index != this.$selectedIndex) {
            if (index < -1) {
                index = -1;
            }
            if (index > this.options.length - 1) {
                index = this.options.length - 1;
            }

            if (index == -1) {
                this.options.filter(option => option.selected).forEach(option => option.selected = false);
            }
            else {
                if (this.multiple) {
                    this.options.filter(option => option.selected && option.index != index).forEach(option => option.selected = false);
                }
                this.options[index].selected = true;
            }
        }
    }

    get disabled() {
        return this.$disabled;
    }

    set disabled(disabled) {
        if (disabled != this.$disabled) {
            this.options.forEach(option => option.disabled = disabled);
            this.$disabled = disabled;
        }
    }

    get text() {
        return this.container.getAttribute('text') || '';
    }

    get value() {        
        return this.container.getAttribute('value') || '';
    }

    get options() {
        return this.$options;
    }

    get blurOptionClass() {
        return this.$blurOptionClass;
    }

    set blurOptionClass(className) {
        if (className != this.$blurOptionClass) {
            this.$blurOptionClass = className;
            this.updateAppearances();
        }
    }

    get focusOptionClass() {
        return this.$focusOptionClass;
    }

    set focusOptionClass(className) {
        if (className != this.$focusOptionClass) {
            this.$focusOptionClass = className;
            this.updateAppearances();
        }
    }

    get disabledOptionClass() {
        return this.$disabledOptionClass;
    }

    set disabledOptionClass(className) {
        if (className != this.$disabledOptionClass) {
            this.$disabledOptionClass = className;
            this.updateAppearances();
        }
    }

    get scale() {
        return this.$scale;
    }

    set scale(scale) {
        if (scale != this.$scale) {
            this.$scale = scale;
            this.updateAppearances();
        }
    }

    get initialized() {
        return this.$initialized;
    }
}

SelectButtonScale = {
    LARGE: 'large',
    BIG: 'big',
    MEDIUM: 'medium',
    NORMAL: 'normal',
    SMALL: 'small',
    MINI: 'mini'
}

$select = function(name) {
    let select = $t(name);
    if (select != null && select.tagName.startsWith('SELECT')) {
        return select;
    }
    else {
        return null;
    }
}

// SelectButton.prototype.onchange = function(beforeOption, ev) { };
// SelectButton.prototype.onsend = function(url, data) { };
// SelectButton.prototype.onerror = function(status, statusText) { };
// SelectButton.prototype.onsuccess = function(result) { };
// SelectButton.prototype.oncomplete = function(req) { };

//保存配置的元素
SelectButton.prototype.element = null;
//窗器元素
SelectButton.prototype.container = null;
SelectButton.prototype.$initialized = false;

SelectButton.prototype.apply = function(container) {

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
        for (let option of this.element.querySelectorAll('option,button')) {
            this.add(option);
        }

        if (this.value == '' && this.selectedIndex > -1) {
            this.container.setAttribute('text', this.options.filter(option => option.selected).map(option => option.text).join(','));
            this.container.setAttribute('value', this.options.filter(option => option.selected).map(option => option.value).join(','));
        }
        
        if (this.element.nodeName == 'SELECT') {
            this.element.remove();
        }
    }

    this.$initialized = true;
}

SelectButton.prototype.add = function(settingsOrOptionElement) {

    let option = new ButtonOption(settingsOrOptionElement);
    if (option.value != '' && option.text == '') {
        option.$text = option.value;
    }
    if (option.text != '' && option.value == '') {
        option.$value = option.text;
    }
    option.selectButton = this;

    option.$index = this.options.length;
    if (option.element == null) {
        option.element = $create('BUTTON', { innerHTML: option.text, title: option.title }, { }, { value: option.value, index: option.index });
        this.container.appendChild(option.element);
    }
    else {
        option.element.innerHTML = option.text;        
        option.element.setAttribute('value', option.value);
        option.element.setAttribute('index', option.index);
        option.element.title = option.title;
    }
    this.$options.push(option);    

    if (this.value.$includes(option.value) || option.$selected) {
        if (!this.multiple) {
            if (this.selectedIndex > -1) {
                $x(this.options[this.selectedIndex].element).swap(this.options[this.selectedIndex].focusClass, this.options[this.selectedIndex].blurClass);
                this.options[this.selectedIndex].$selected = false;
            }
        }

        $x(option.element).swap(option.focusClass, option.blurClass);
        option.$selected = true;
        this.$selectedIndex = option.index;
    }
    
    if (option.disabled && !option.element.disabled) {
        option.disabled = true;
    }

    option.$updateAppearance();
};

SelectButton.prototype.delete = function(option) {

    //原索引位置
    let index = option.index;
    
    //更新selectButton的value和text
    option.selected = false;

    //删除元素和数组项
    option.element.remove();
    this.options.splice(index, 1);
    
    //更新其他option的index
    for (let i = index + 1; i < this.options.length; i++) {
        this.options[i].$index -= 1;
    }

    this.updateAppearances();
}

SelectButton.prototype.updateAppearances = function() {
    for (let i = 0; i < this.$options.length; i++) {
        this.$options[i].$updateAppearance(); 
    }
}

SelectButton.prototype.$change = function() {
    
}

SelectButton.prototype.selectAll = function() {
    if (this.multiple) {
        this.options.forEach(option => option.selected = true);
    }
    else if (this.selectedIndex == -1 && this.options.length > 0) {
        this.options[0].selected = true;
    }
}

SelectButton.prototype.deselectAll = function() {
    this.selectedIndex = -1;
}

SelectButton.prototype.disableAll = function() {
    this.disabled = true;
};

SelectButton.prototype.enableAll = function() {
    this.disabled = false;
};

SelectButton.prototype.insertBefore = function(index, text, value, className) { };
SelectButton.prototype.insertAfter = function(index, text, value, className) { };
SelectButton.prototype.clear = function() {
    this.container.innerHTML = '';
    this.$options.length = 0;
 };
SelectButton.prototype.indexOf = function(value) { };
SelectButton.prototype.indexTextOf = function(text) { };

//回退到上一个状态
SelectButton.prototype.$rollback = function(before, after) {
    if (this.multiple) {
        $x(this.options[after].element).swap(this.options[after].focusClass, this.options[after].blurClass);
        this.options[after].$selected = !this.options[after].$selected;

        let options = this.options.filter(option => option.selected);
        if (options.length == 0) {
            this.container.setAttribute('text', '');
            this.container.setAttribute('value', '');
            this.$selectedIndex = -1;
        }
        else {
            this.container.setAttribute('text', options.map(option => option.text).join(','));
            this.container.setAttribute('value', options.map(option => option.value).join(','));
            this.$selectedIndex = options[0].index;

            options.forEach(option => {
                if (option.hide != '') {
                    $x(option.hide).hide();
                }
                if (option.show != '') {
                    $x(option.show).show();
                }
            })
        }
    }
    else {
        if (before > -1) {
            $x(this.options[before].element).swap(this.options[before].focusClass, this.options[before].blurClass);
            this.options[before].$selected = true;
        }
        if (after > -1) {
            $x(this.options[after].element).swap(this.options[after].focusClass, this.options[after].blurClass);
            this.options[after].$selected = false;
        }

        this.$selectedIndex = before;
        this.container.setAttribute('text', before != -1 ? this.options[before].text : '');
        this.container.setAttribute('value', before != -1 ? this.options[before].value : '');

        if (this.options[before].hide != '') {
            $x(this.options[before].hide).hide();
        }
        if (this.options[before].show != '') {
            $x(this.options[before].show).show();
        }
    }
}

class ButtonOption {
    constructor(settings) {
        $initialize(this)
            .with(settings)
            .declare({
                $value: '',
                $text: 'html',
                $title: '',
                $focusClass: '', //默认从SelectButton继承
                $blurClass: '', //默认从SelectButton继承
                $disabledClass: '', //默认从SelectButton继承
                $selected: function(value) {
                    return value === '' || value == 'selected' || $parseBoolean(value, false);
                },
                $disabled: function(value) {
                    return value === '' || value == 'disabled' || $parseBoolean(value, false);
                },
                show: '', //切换到当前选项时显示哪些元素
                hide: '' //切换到当前选项时隐藏哪些元素
            })
            .elementify(element => {
                if (element.nodeName == 'BUTTON') {
                    this.element = element;
                }
            });

        this.$index = -1; //read only
    }
    
    get text() {
        return this.$text;
    }

    set text(text) {
        if (text != this.$text) {
            if (this.selected) {
                this.selectButton.element.setAttribute('text', text);
            }
            this.element.innerHTML = text;
            this.$text = text;
        }        
    }

    get value() {
        return this.$value;
    }

    set value(value) {
        if (value != this.$value) {
            if (this.selected) {
                this.selectButton.element.setAttribute('value', value);
            }
            this.element.setAttribute('value', value);
            this.$value = value;
        }        
    }

    get title() {
        return this.$title;
    }

    set title(title) {
        this.$title = title;
        this.element.title = title;        
    }

    get focusClass() {
        return this.$focusClass == '' ? this.selectButton.focusOptionClass : this.$focusClass;
    }

    set focusClass(className) {
        if (className != this.$focusClass) {
            if (this.selected) {
                this.element.className = this.element.className.replace(this.$focusClass, className);
            }            
            this.$focusClass = className;
        }
    }

    get blurClass() {
        return this.$blurClass == '' ? this.selectButton.blurOptionClass : this.$blurClass;
    }

    set blurClass(className) {
        if (className != this.$blurClass) {
            if (!this.selected) {
                this.element.className = this.element.className.replace(this.$blurClass, className);
            }            
            this.$blurClass = className;
        }
    }

    get disabledClass() {
        return this.$disabledClass == '' ? this.selectButton.disabledOptionClass : this.$disabledClass;
    }

    set disabledClass(className) {
        if (className != this.$disabledClass) {
            if (this.disabled) {
                this.element.className = this.element.className.replace(this.$disabledClass, className);
            }         
            this.$disabledClass = className;
        }
    }

    get index() {
        return this.$index;
    }

    get selected() {
        return this.$selected;
    }

    set selected(selected) {
        if (typeof (selected) == 'boolean') {
            if (selected != this.$selected || (selected && this.$selected && this.selectButton.selectedIndex == -1)) {
                let before = this.selectButton.selectedIndex;

                if (this.selectButton.multiple) {
                    $x(this.element).swap(this.focusClass, this.blurClass);
                    this.$selected = selected;
            
                    let options = this.selectButton.options.filter(option => option.selected);
                    if (options.length == 0) {
                        this.selectButton.container.setAttribute('text', '');
                        this.selectButton.container.setAttribute('value', '');
                        this.selectButton.$selectedIndex = -1;
                    }
                    else {
                        this.selectButton.container.setAttribute('text', options.map(option => option.text).join(','));
                        this.selectButton.container.setAttribute('value', options.map(option => option.value).join(','));
                        this.selectButton.$selectedIndex = options[0].index;
                    }
                }
                else {
                    if (selected) {
                        if (this.selectButton.selectedIndex > -1) {
                            $x(this.selectButton.options[this.selectButton.selectedIndex].element).swap(this.selectButton.options[this.selectButton.selectedIndex].focusClass, this.selectButton.options[this.selectButton.selectedIndex].blurClass);
                            this.selectButton.options[this.selectButton.selectedIndex].$selected = false;
                        }        
                        $x(this.element).swap(this.focusClass, this.blurClass);
                        this.$selected = true;
                        this.selectButton.$selectedIndex = this.index;
            
                        this.selectButton.container.setAttribute('text', this.text);
                        this.selectButton.container.setAttribute('value', this.value);

                        if (this.hide != '') {
                            $x(this.hide).hide();
                        }
                        if (this.show != '') {
                            $x(this.show).show();
                        }
                    }
                    else {
                        $x(this.element).swap(this.focusClass, this.blurClass);
                        this.$selected = false;
                        this.selectButton.$selectedIndex = -1;
            
                        this.selectButton.container.setAttribute('text', '');
                        this.selectButton.container.setAttribute('value', '');
                    }
                }

                //事件在加载完成后才触发
                if (this.selectButton.initialized) {
                    if (this.selectButton.execute('onchange', this.selectButton.options[before])) {
                        let option = this;
                        if (option.selectButton.action != '') {
                            $cogo(option.selectButton.action.$parseDataURL(option.selectButton.text, option.selectButton.value), option.selectButton.element)
                                .then(data => {
                                    if (!option.selectButton.execute('onsuccess', data)) {
                                        //rollback on incorrect
                                        option.selectButton.$rollback(before, option.index);
                                    }
                                })
                                .catch(error => {
                                    option.selectButton.execute('onerror', error);
                                    //back on error
                                    option.selectButton.$rollback(before, option.index);
                                });
                        }
                    }
                    else {
                        //back on illegal
                        this.selectButton.$rollback(before, this.index);
                    }
                }
            }
        }
    }

    get disabled() {
        return this.$disabled;
    }

    set disabled(disabled) {
        if (typeof(disabled) == 'boolean') {
            if (disabled != this.$disabled) {                
                $x(this.element).swap(this.selected ? this.focusClass : this.blurClass, this.disabledClass);
                this.$disabled = disabled;
            }
            this.element.disabled = disabled;            
        }        
    }
}

//button
ButtonOption.prototype.element = null;
//parent
ButtonOption.prototype.selectButton = null;

ButtonOption.prototype.select = function() {
    this.selected = true;
}

ButtonOption.prototype.deselect = function() {
    if (this.selectButton.multiple) {
        this.selected = false;
    }
    else if (this.selected) {
        this.selectButton.selectedIndex = -1;
    }
}

ButtonOption.prototype.enable = function() {
    this.disabled = false;
}

ButtonOption.prototype.disable = function() {
    this.disabled = true;
}

ButtonOption.prototype.remove = function() {
    this.selectButton.delete(this);
};

ButtonOption.prototype.insertBehind = function(text, value, className) {

};

ButtonOption.prototype.insertFront = function(text, value, className) {

};

// scale = normal
// focusClass = 'new' 或 blurClass = 'old' 或 disabled
ButtonOption.prototype.$updateAppearance = function(terminal) {

    let css = this.selectButton.scale != '' && SelectButtonScale[this.selectButton.scale.toUpperCase()] != null ? this.selectButton.scale + '-button ' : '';
    let length = this.selectButton.options.length;

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

    if (this.disabled) {
        css += ' ' + (this.disabledClass == '' ? this.selectButton.disabledOptionClass : this.disabledClass);
    }
    else if (this.selected) {
        css += ' ' + (this.focusClass == '' ? this.selectButton.focusOptionClass : this.focusClass);
    }
    else {
        css += ' ' + (this.blurClass == '' ? this.selectButton.blurOptionClass : this.blurClass);
    }

    if (this.element.className != css) {
        this.element.className = css;
    }

    if (terminal == null) {
        if (this.index > 0) {
            this.selectButton.options[this.index - 1].$updateAppearance('terminal');
        }
        if (this.index < length - 1) {
            this.selectButton.options[this.index + 1].$updateAppearance('terminal');
        }
    }    
}

SelectButton.initialize = function(button) {
    if (typeof(button) == 'string') {
        button = $s(button);
    }
    if (button != null) {
        new SelectButton(button).apply();
    }
    else {
        throw new Error('Must specify a SELECT element.');
    }
}

SelectButton.initializeAllIn = function(element) {
    if (typeof(element) == 'string') {
        element = $s(element);
    }
    element.querySelectorAll('select[button]').forEach(button => {
        new SelectButton(button).apply();
    });
}

SelectButton.initializeAll = function() {
    SelectButton.initializeAllIn(document);
}

$finish(function () {
    SelectButton.initializeAll();
});