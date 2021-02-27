class Select {
    constructor(element) {
        this.$options = [];//存放生成的option对象 length可用于计算option.$index
        $initialize(this)
            .with(element)
            .declare({
                name: 'Select' + document.components.size,
                _selectedIndex: -1,//选中选项下标 不在这设
                // text: '',
                // value: null,//只读属性 返回当前值
                _disabled: false,//是否禁用
                _inputable: false,
                onchange: null,//
                _visible: false,//是否显示下拉框 不在这设
                // _initialized: false,// 不在这设
                size: Enum('MIDDLE', 'SMALL', 'LARGE'),//尺寸
            })
            .elementify(element => {
                let select = this;
                this.inputClass = (function() {
                    if (select._disabled) {//禁用
                        return 'disabled-input';
                    }
                    else {//非禁用
                        return 'input';
                    }
                } ())

                this.frameClass = (function() {
                    let classStr = 'select-frame';
                    let sizeStr = '';
                    let disableStr = '';
                    if (select.size === 'LARGE') {
                        sizeStr = '-large';
                    }
                    else if (select.size ==='SMALL') {
                        sizeStr = '-small';
                    }
                    else {
                        sizeStr = '';
                    }
                    if (select._disabled) {//禁用
                        disableStr = '-disabled'
                    }
                    else {//非禁用
                        disableStr = '';
                    }
                    return classStr + disableStr + sizeStr;
                } ())

                //标签以外属性在此
                this.options = element.options;//存放原生option 用于后续生成
                this.value = null;//选中结果
                this.text = null;//选中结果文字描述
                this.selectedIndex = -1;//选中项下标
                this.initialized = false;

                //生成元素 替换元素
                //定义外框
                let selectContainer = $create('DIV', {}, {}, { class: this.frameClass, 'isSelector':true });
                //定义用于显示结果的input
                let input = $create('INPUT', {id: element.id,}, {}, {value: '', _value: '', placeholder: 'select', readonly: true, class: this.inputClass,autocomplete:'off'})
                //定义箭头
                let selectArrowIcon = $create('SPAN', {innerHTML: '&#8744;'}, {}, {class: 'arrowIcon'});
                //创建下拉选项层 定位 z-index fixed
                let optionContainer = $create('DIV',{},{display:'none'},{'class': 'option-frame'});

                //组合元素
                selectContainer.append(input);
                selectContainer.append(selectArrowIcon);
                selectContainer.append(optionContainer);
                //通过传入的element 获取select所在位置 替换原有元素
                let parentNode = $x(element).parent();
                $x(element).remove();
                parentNode.insertFirst(selectContainer);

                this.frame = selectContainer;//
                this.optionFrame = optionContainer;
                this.selectInput = input;
                this.element = element;

                this.disabled = this._disabled;//设置禁用与否
                this.inputable = this._inputable;//设置输入与否
            })

        let select = this;//变量名获取this 防止之后其他地方this指向变动

        //点击展开下拉框
        this.frame.onclick = function() {
            if (select._inputable){
                select.selectInput.removeAttribute('readonly');
            }
            if (select._disabled){
                return false;
            }
            select.visible = !select.visible;
        }

        //根据inputable 判断是否可输入 回车键触发
        if (this._inputable){
            this.frame.style.cursor = 'text';
            $x(this.selectInput).on('keydown', function(ev) {
                if(ev.keyCode == 13) {
                    // this.value 输入内容
                    let inputVal = this.value;
                    let isRepeate = false;// isRepeat
                    select.$options.forEach(option => {
                        if (option.text == inputVal) {
                            //选中这项结果
                            isRepeate = true;
                            option.selected = true;
                            $x(select.optionFrame).hide();
                            select.visible = false;
                        }
                    })

                    if (!isRepeate) {
                        let optionStr = `<option value="${inputVal}">${inputVal}</option>`
                        let selfDefineOpt = new SelectOption($create('OPTION', optionStr));
                        select.add(selfDefineOpt);
                        selfDefineOpt.selectFrame = select;
                        selfDefineOpt._selected = true;
                    }

                    $x(select.optionFrame).toggle();
                    select.selectInput.setAttribute('readonly', true);
                }
            })
        }
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        $x(this.optionFrame).toggle();
        let rotateDeg = this._visible ? 0 : 180;
        $x(this.frame).select('.arrowIcon').style('transform', 'rotate('+ rotateDeg +'deg)')
        this._visible = value;
    }

    get inputable() {
        return this._inputable;
    }

    set inputable(value) {
        //调整是否可输入
        this._inputable = value;
        if(this._inputable) {
            this.selectInput.removeAttribute('readonly');
        }else{
            this.selectInput.setAttribute('readonly',true);
        }
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = value;
    }

    get selectedIndex() {//获取选中选项下标
        return this._selectedIndex;
    }

    set selectedIndex(index){
        // debugger
        this._selectedIndex = index;
        this.$options.forEach(optionItem => {
            optionItem.selected = false;
        })
        if (index != -1) {
            this.$options[index]._selected = true;
        }
    }
}

//在initialize后调用 遍历option/data 生成选项对象
Select.prototype.apply = function() {
        //生成选项元素 放到optionContainer
        $x(this.element).select('option').objects.forEach( optionItem => {
            let option = new SelectOption(optionItem);
            this.add(option);
        } )
    this._initialized = true;
}

//添加选项方法
Select.prototype.add = function(optionItem) {
    optionItem.selectFrame = this;
    optionItem._index = this.$options.length;
    this.$options.push(optionItem);
    this.optionFrame.append(optionItem.optionElement);
}

class SelectOption{
    constructor(element) {
        $initialize(this)
            .with(element)
            .declare({
                text: element.text || '',
                value: element.value || '',
                _index: null,
                _selected: false,//是否选中
            })
            .elementify(element => {
                this.class = 'option-item';
                this. selectedClass = 'option-item-selected';

                let optionItem = $create('DIV', { innerHTML: element.text }, {}, {'value': element.value, 'class': this.class});
                this.optionElement = optionItem;
                this.element = element;
            })
        let option = this;
        $x(option.optionElement).on('click', function() {
            option.selected = true;
        })
    }

    get selected() {
        return this._selected;
    }

    set selected(value) {
        if (value) {
            let before = this.selectFrame._selectedIndex;//选中前的选项下标
            this.selectFrame.selectedIndex = this._index;

            this.selectFrame._selectedIndex = this._index;//selectFrame 换 select
            $x(this.selectFrame.selectInput).attr('value',this.text);
            $x(this.selectFrame.selectInput).attr('_value',this.value);

            this.selectFrame.value = this.value;
            this.selectFrame.text = this.text;

            $x(this.optionElement).css(this.selectedClass,this.class);

            if (this.selectFrame._initialized) {//加载完成触发事件
                this.selectFrame.execute('onchange',this.selectFrame.$options[before]);
            }
        }
        else {
            $x(this.optionElement).css(this.class);
        }
    }
}

$select = function(name) {
    //判断类型 tagName
    return $t(name);
}

$finish(function() {
    $a('select').forEach(select => {
        if (!select.getAttribute('button')) {//排除与select button冲突
            // new Select(select).apply();
            if (select.getAttribute('data') != null) {
                new Template(select)
                    .asArray()
                    .setPosition('beforeEnd')
                    .clear()
                    .append(function(data) {
                        new Select(select).apply();
                    })
            }
            else {
                new Select(select).apply();
            }
        }
    })
})
