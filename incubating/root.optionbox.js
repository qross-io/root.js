/*
TreeView.OptionBox
*/

TreeView.OptionBox = function (treeView, display) {
    /// <summary>构造函数</summary>
    /// <param name="treeView" type="TreeView">所属的TreeView</param>

    /// <value type="TreeView">菜单所属的TreeView</value>
    this.treeView = treeView;
    /// <value type="String">显示模式, CONTEXTMENU|FOLLOW|LEFT|RIGHT|TOP</value>
    this.display = display || 'RIGHT';
    /// <value type="Element">菜单的元素</value>
    this.element = null;
    /// <value type="TreeNode">菜单的触发对象</value>
    this.target = null;
    /// <value type="Enum">菜单项集合</value>
    this.items = {};

    /// <value type="String">样式</value>
    //this.className = '';
    /// <value type="String">选项样式</value>
    //this.optionClass = '';

    /// 是否可见
    this.visible = false;
}

TreeView.OptionBox.prototype.initialize = function (lis) {
    /// <summary>初始化</summary>
    /// <param name="lis" type="HtmlLiCollection">列表集合</param>

    if (this.treeView != null) {

        //初始化items
        let li, name;
        for (let i = 0; i < lis.length; i++) {
            if (lis[i].nodeType == 1 && lis[i].nodeName == 'LI') {
                li = lis[i];
                name = li.getAttribute('name');
                if (name == null || name == '') { name = 'Item_' + i; }
                this.items[name] = new TreeView.NodeOption({
                    optionBox: this,
                    type: li.getAttribute('type'),
                    name: name,
                    imageUrl: li.getAttribute('imageUrl'),
                    text: li.getAttribute('text'),
                    value: li.getAttribute('value'),
                    title: li.getAttribute('title'),
                    enabled: $parseBoolean(li.getAttribute('enabled'), true),
                    visible: $parseBoolean(li.getAttribute('visible'), true)
                });
            }
        }
        
        //display
        this.display = $parseString(this.display, /^(CONTEXTMENU)|(FOLLOW)|(LEFT)|(RIGHT)|(TOP)$/i, 'U', 'RIGHT');

        //生成一个DIV，放在TreeView的DIV第一个位置
        //选项在触发显示时生成，切换时移除
        let div = document.createElement('DIV');
        div.id = this.treeView.id + '_OptionBox';
        if (this.display != 'TOP') {
            div.style.position = 'absolute';
            div.style.zIndex = 1002;
            div.style.display = 'none';

            //this.treeView.element.parentNode.insertBefore(div, this.treeView.element);
            this.treeView.element.appendChild(div);
        }
        else {
            //嵌套一个div，为了把上左右的阴影去掉
            let d2 = document.createElement('DIV');
            d2.style.backgroundColor = '#FFFFFF';
            d2.style.marginBottom = '2px';
            d2.style.overflow = 'hidden';

            div.style.borderBottom = '1px solid #999999';
            div.style.boxShadow = '0px 2px 6px #999999';
            div.style.marginBottom = '6px';

            d2.appendChild(div);
            this.treeView.element.parentNode.insertBefore(d2, this.treeView.element);
            
        }
        if (this.display == 'CONTEXTMENU') {
            div.style.border = '1px solid #999999';            
            div.className = 'treeViewContextMenuClass1';
        }
        div.style.padding = '1px';        
        this.element = div;

        //CONTEXTMENU
        if (this.display == 'CONTEXTMENU') {
            this.element.setAttribute('sign', 'TREEVIEWCONTEXTMENU');

            let box = this;
            //右键事件, 在空白处点击将要显示的菜单
            this.treeView.element.oncontextmenu = function (ev) {                
                ev = ev || window.event;
                let target = ev.target || ev.srcElement;

                while (!/^(ROW)|(NODE)|(TEXT)$/i.test(target.getAttribute('sign')) && target != this && target != box.element) {
                    target = target.parentNode;
                }
                if (target == this) {
                    box.treeView.optionBox.target = null;
                    box.treeView.optionBox.show(ev);
                    return false;
                }
            };

        }
        else {
            this.element.setAttribute('sign', 'TREEVIEWNODEOPTIONSBOX');
        }

        //if (this.display == 'TOP') {
            //默认显示
            //this.target = null;
            //this.show();
        //}

        //非ContextMenu的选项盒表现等式一样, 只不过LEFT和RIGHT需要定位, TOP不需要 -- 适用于 LEFT, FOLLOW, RIGHT, CONTEXTMENU
        //onmouseover 显示，鼠标划出后消失。见__nodeObject.onmouseover事件 -- 适用于 LEFT, FOLLOW, RIGHT
        //onselected 后一直显示（如果没有显示，则显示）。见Node.select方法 -- 适用于 LEFT, FOLLOW, RIGHT, TOP
    }
}

TreeView.OptionBox.prototype.show = function (ev) {
    /// <summary>显示菜单</summary>
    /// <param name="ev" type="Event">事件源</param>

    if (Event.execute(this.treeView, 'onOptionBoxShow', this.target)) {
        if (this.element.innerHTML != '') {
            this.element.innerHTML = '';
        }

        /*
        定位：
        CONTEXTMENU 鼠标位置
        RIGHT NodeRow 右对齐
        LEFT|FOLLOW Node 右侧
        TOP 不定位
        */

        let table = document.createElement('TABLE');
        table.border = 0;
        table.cellPadding = 0;
        table.cellSpacing = 0;
        this.element.appendChild(table);

        //子项
        let tbody = document.createElement('TBODY');
        table.appendChild(tbody);
        let item;
        if (this.display == 'CONTEXTMENU') {
            table.style.backgroundColor = '#FFFFFF';
            for (let i in this.items) {
                item = this.items[i].populate();
                if (item != null) {
                    tbody.appendChild(item);
                }
            }
        }
        else {
            let tr = document.createElement('TR');
            for (let i in this.items) {
                item = this.items[i].populate();
                if (item != null) {
                    tr.appendChild(item);
                }
            }
            tbody.appendChild(tr);
        }

        //定位
        this.element.style.visibility = 'hidden';
        this.element.style.display = '';
        let x, y;
        let body = document.compatMode == 'CSS1Compat' ? document.documentElement : document.body;
        if (this.display == 'CONTEXTMENU') {
            //重置样式
            this.element.className = 'treeViewContextMenuClass1';

            x = ev.clientX;
            y = ev.clientY;

            //确定菜单的显示位置
            if (x + this.element.offsetWidth > body.clientWidth) { x = body.clientWidth - this.element.offsetWidth; }
            if (y + this.element.offsetHeight > body.clientHeight) { y = body.clientHeight - this.element.offsetHeight; }
            if (y < 0) { y = 0; }

            x += (document.documentElement.scrollLeft || document.body.scrollLeft);
            y += (document.documentElement.scrollTop || document.body.scrollTop);
        }
        else if (this.display != 'TOP') {
            if (this.display == 'RIGHT') {
                x = this.target.element.offsetLeft + this.target.element.offsetWidth - this.element.offsetWidth - 5;
            }
            else {
                x = this.target.element.offsetLeft + this.target.__nodeElement.offsetWidth + 5;
            }
            y = this.target.element.offsetTop + (this.target.element.offsetHeight - this.element.offsetHeight) / 2;
        }

        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.element.style.visibility = 'visible';

        this.visible = true;
    }
}

TreeView.OptionBox.prototype.hide = function (quick) {
    /// <summary>隐藏菜单</summary>
    /// <param name="quick" type="boolean">是否快速隐藏</param>

    quick = $parseBoolean(quick, false);

    this.target = null;
    this.visible = false;

    function __hide(div) {
        div.innerHTML = '';
        div.style.visibility = 'hidden';
        div.style.display = 'none';        
    }

    if (quick) {
        __hide(this.element);
    }
    else {
        let div = this.element;
        div.className = 'treeViewContextMenuClass2';
        window.setTimeout(function () { __hide(div) }, 800);
    }
}

/*
    TreeView.NodeOption
*/

TreeView.NodeOption = function (properties) {
    /// <summary>构造函数</summary>
    /// <param name="properties" type="Object">初始化参数</param>

    /// <value type="TreeView.OptionBox">所属的选项盒</value>
    this.optionBox = null;
    /// <value type="Enum" elementType="String">选项类型</value>
    this.type = 'NORMAL'; //NORMAL, SEPARATOR, TEXTBOX

    /// <value type="String">菜单项名称</value>
    this.name = '';
    /// <value type="String">菜单项图标</value>
    this.imageUrl = '';
    /// <value type="String">菜单项显示文本</value>
    this.text = '';
    /// <value type="String">菜单项保存的值</value>
    this.value = '';
    /// <value type="String">菜单项的鼠标划过标题</value>
    this.title = '';
    /// <value type="Boolean">菜单项是否可用</value>
    this.enabled = true;
    /// <value type="Boolean">菜单项是否可见</value>
    this.visible = true;

    /// <value type="String">样式</value>
    this.className = '';

    // 初始化
    if (properties != null) {
        for (let n in properties) {
            if (properties[n] != null) { this[n] = properties[n]; }
        }
    }

    this.type = this.type.toUpperCase();
    if (!/(NORMAL)|(SEPARATOR)/i.test(this.type)) { this.type = 'NORMAL'; }
}

TreeView.NodeOption.prototype.populate = function () {
    /// <summary>装配菜单项</summary>

    /*
    CONTEXTMENU 返回TR
    其他 返回TD
    */

    if (this.visible) {        
        if (this.optionBox.display == 'CONTEXTMENU') {
            let tr, td, img;

            tr = document.createElement('TR');
            tr.setAttribute('sign', 'TREEVIEWNODEOPTION');
            tr.setAttribute('name', this.name);
            //tr.setAttribute('enabled', this.enabled);
            tr.setAttribute('type', this.type);
            tr.title = this.title;

            if (this.type == 'NORMAL') {
                td = document.createElement('TD');
                td.className = 'treeViewNodeOption0a';
                img = document.createElement('IMG');
                img.border = 0;
                img.align = 'absmiddle';
                if (!this.enabled) { img.style.opacity = '0.3'; }

                if (this.imageUrl != '') {
                    img.src = this.optionBox.treeView.imagesBaseUrl + this.imageUrl;
                }
                else {
                    img.src = this.optionBox.treeView.imagesBaseUrl + 'blank.gif';
                    img.width = 16;
                    img.height = 16;
                }
                td.appendChild(img);
                tr.appendChild(td);

                td = document.createElement('TD');
                td.className = (this.enabled ? 'treeViewNodeOption1a' : 'treeViewNodeOption1c');
                td.innerHTML = (this.text != '' ? this.text : '&nbsp;');
                tr.appendChild(td);
            }
            else if (this.type == 'SEPARATOR') {
                td = document.createElement('TD');
                td.style.backgroundColor = '#F8F8F8';
                td.style.padding = '0px';
                td.style.height = '3px';
                tr.appendChild(td);

                td = document.createElement('TD');
                td.style.height = '3px';
                td.style.padding = '1px 4px';
                td.style.borderLeft = '1px solid #F0F0F0';
                td.innerHTML = '<div style="height:0px; border-top:1px solid #BBBBBB;"></div>';
                tr.appendChild(td);
            }

            if (this.enabled && this.type != 'SEPARATOR') {
                let item = this;
                tr.onmouseover = function () {
                    this.cells[0].className = 'treeViewNodeOption0b';
                    this.cells[0].style.backgroundImage = 'url(' + item.optionBox.treeView.imagesBaseUrl + 'option.png)';
                    this.cells[1].className = 'treeViewNodeOption1b';
                    this.cells[1].style.backgroundImage = 'url(' + item.optionBox.treeView.imagesBaseUrl + 'option.png)';
                }
                tr.onmouseout = function () {
                    this.cells[0].className = 'treeViewNodeOption0a';
                    this.cells[0].style.backgroundImage = '';
                    this.cells[1].className = 'treeViewNodeOption1a';
                    this.cells[1].style.backgroundImage = '';
                }
                tr.onclick = function (ev) {
                    if (item.type == 'NORMAL') {
                        Event.execute(item.optionBox.treeView, 'onNodeOptionClick', item);
                    }
                }
            }
            return tr;
        }
        else {
            let td, img;
            td = document.createElement('TD');
            td.setAttribute('sign', 'TREEVIEWNODEOPTION');
            td.setAttribute('name', this.name);
            //td.setAttribute('enabled', this.enabled);
            td.setAttribute('type', this.type);
            td.title = this.title;
            td.className = (this.enabled ? 'treeViewNodeOption2a' : 'treeViewNodeOption2d');

            if (this.type == 'NORMAL') {
                if (this.imageUrl != '') {
                    img = document.createElement('IMG');
                    img.border = 0;
                    img.align = 'absmiddle';
                    if (!this.enabled) { img.style.opacity = '0.3'; }
                    img.src = this.optionBox.treeView.imagesBaseUrl + this.imageUrl;
                    td.appendChild(img);
                }

                if (this.text != '') {
                    td.appendChild(document.createTextNode(' ' + this.text));
                }
            }
            else if (this.type == 'SEPARATOR') {
                td.style.backgroundColor = '#F8F8F8';
                td.style.padding = '0px';
                td.style.width = '3px';
                td.innerHTML = '<div style="height:16px; width:1px; border-left:1px solid #BBBBBB;"></div>';
            }

            if (this.enabled && this.type != 'SEPARATOR') {
                let item = this;
                td.onmouseover = function () {
                    this.className = 'treeViewNodeOption2b';
                    this.style.backgroundImage = 'url(' + item.optionBox.treeView.imagesBaseUrl + 'option.png)';
                }
                td.onmouseout = function () {
                    this.className = 'treeViewNodeOption2a';
                    this.style.backgroundImage = '';
                }
                td.onmousedown = function () {
                    this.className = 'treeViewNodeOption2c';
                    this.style.backgroundImage = '';
                }
                td.onmouseup = function () {
                    this.className = 'treeViewNodeOption2b';
                    this.style.backgroundImage = 'url(' + item.optionBox.treeView.imagesBaseUrl + 'option.png)';
                }
                td.onclick = function (ev) {
                    if (item.type == 'NORMAL') {
                        Event.execute(item.optionBox.treeView, 'onNodeOptionClick', item);
                    }
                }
            }

            return td;
        }
    }
    else {
        return null;
    }
};