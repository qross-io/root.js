

TreeView.prototype.load = function () {
    /// <summary>加载TreeView的根节点</summary>

    if (this.id == null) { this.id = ''; }
    if (typeof (this.element) == 'string') {
        this.element = document.querySelector(this.element);
    }
    if (this.id != '' && this.element == null) {
        this.element = document.getElementById(this.id);
    }
    else if (this.id == '' && this.element != null) {
        this.id = this.element.id;
    }
    // id 如果为空, 自动以序号命名
    if (this.id == '') { this.id = 'TreeView_' + $size(document.treeViews); }

    // sign
    this.element.setAttribute('sign', 'TREEVIEW');

    //target
    if (this.target == null) { this.target = ''; }

    // enabled
    //this.enabled = $parseBoolean(this.enabled, true);

    //基本图像元素
    /// imagesBaseUrl
    if (this.imagesBaseUrl == null) { this.imagesBaseUrl = ''; }
    /// expandImageUrl burl+
    if (this.expandImageUrl == null) { this.expandImageUrl = 'burl_0a.gif|burl_0b.gif'; }
    if (typeof (this.expandImageUrl) == 'string') {
        if (this.expandImageUrl.indexOf('|') > 0) { this.expandImageUrl = this.expandImageUrl.split('|'); }
    }
    /// collapseImageUrl burl-
    if (this.collapseImageUrl == null) { this.collapseImageUrl = 'burl_1a.gif|burl_1b.gif'; }
    if (typeof (this.collapseImageUrl) == 'string') {
        if (this.collapseImageUrl.indexOf('|') > 0) { this.collapseImageUrl = this.collapseImageUrl.split('|'); }
    }
    /// contentLoadingImageUrl spinner
    if (this.contentLoadingImageUrl == null) { this.contentLoadingImageUrl = 'spinner.gif'; }
    /// noExpandImageUrl blank.gif
    if (this.noExpandImageUrl == null) { this.noExpandImageUrl = 'blank.gif'; }

    //布局设置
    /// NodeCellStyle
    this.nodeCellStyle = $parseString(this.nodeCellStyle, /(TEXT)|(ROW)/i, 'U', 'TEXT');
    /// nodeIndent
    this.nodeIndent = $parseInt(this.nodeIndent, 16);
    /// nodePadding
    this.nodePadding = $parseInt(this.nodePadding, 2);
    /// nodeSpacing
    this.nodeSpacing = $parseInt(this.nodeSpacing, 0);
    /// childrenPadding
    this.childrenPadding = $parseInt(this.childrenPadding, 0);

    // 应用TreeView样式
    /// className
    this.className = $parseString(this.className, /\w+/i, 'I', 'treeView-default-class');
    this.element.className = this.className;
    /// nodeClass
    this.nodeClass = $parseString(this.nodeClass, /\w+/i, 'I', 'treeNodeDefaultClass');
    /// hoverNodeClass
    this.hoverNodeClass = $parseString(this.hoverNodeClass, /\w+/i, 'I', 'treeNodeDefaultHoverClass');
    /// selectedNodeClass
    this.selectedNodeClass = $parseString(this.selectedNodeClass, /\w+/i, 'I', 'treeNodeDefaultSelectedClass');
    /// selectedHoverNodeClass
    this.selectedHoverNodeClass = $parseString(this.selectedHoverNodeClass, /\w+/i, 'I', '');
    /// nodeEditClass
    this.nodeEditClass = $parseString(this.nodeEditClass, /\w*/i, 'I', '');
    /// cutNodeClass
    this.cutNodeClass = $parseString(this.cutNodeClass, /\w*/i, 'I', '');
    /// nodeTipClass
    this.nodeTipClass = $parseString(this.nodeTipClass, /\w*/i, 'I', '');
    /// dropChildClass
    this.dropChildClass = $parseString(this.dropChildClass, /\w*/i, 'I', '');
    /// optionBoxClass
    //this.optionBoxClass = $parseString(this.optionBoxClass, /\w*/i, 'I', '');
    /// nodeOptions
    //this.nodeOptionClass = $parseString(this.nodeOptionClass, /\w*/i, 'I', '');

    /// expandOnSelect
    this.expandOnSelect = $parseBoolean(this.expandOnSelect, false);
    /// collapseOnSelect
    this.collapseOnSelect = $parseBoolean(this.collapseOnSelect, false);

    /// showBurls
    this.showBurls = $parseBoolean(this.showBurls, true);
    /// showIcons
    this.showIcons = $parseBoolean(this.showIcons, true);
    /// showLines
    this.showLines = $parseBoolean(this.showLines, false);
    /// showCheckBoxes
    if (typeof (this.showCheckBoxes) == 'boolean') {
        this.showCheckBoxes = (this.showCheckBoxes ? 'RELATIVE' : 'NONE');
    }
    else {
        this.showCheckBoxes = $parseString(this.showCheckBoxes, /^(NONE|SINGLE|RELATIVE|TRUE|FALSE)$/i, 'U', 'NONE');
        if (this.showCheckBoxes == 'TRUE') {
            this.showCheckBoxes = 'RELATIVE'; 
        }
        else if (this.showCheckBoxes == 'FALSE') {
            this.showCheckBoxes = 'NONE'; 
        }
    }

    /// expandDepth
    this.expandDepth = $parseInt(this.expandDepth, 1);
    /// preLoadDepth
    this.preLoadDepth = $parseInt(this.preLoadDepth, 1);

    /// pathToSelect
    if (this.pathToSelect == null) { this.pathToSelect = ''; }
    /// pathsToCheck
    if (this.pathsToCheck == null) {
        this.pathsToCheck = new Array();
    }
    else if (typeof (this.pathsToCheck) == 'string') {
        this.pathsToCheck = this.pathsToCheck.split(',');
    }

    /// dragAndDropEnabled
    this.dragAndDropEnabled = $parseBoolean(this.dragAndDropEnabled, false);
    /// dropChildEnabled
    this.dropChildEnabled = $parseBoolean(this.dropChildEnabled, true);
    /// dropRootEnabled
    this.dropRootEnabled = $parseBoolean(this.dropRootEnabled, true);
    /// externalDropTargets
    if (this.externalDropTargets == null) { this.externalDropTargets = ''; }

    /// nodeEditingEnabled
    this.nodeEditingEnabled = $parseBoolean(this.nodeEditingEnabled, false);

    /// keyboardEnabled
    this.keyboardEnabled = $parseBoolean(this.keyboardEnabled, true);
    /// keyboardCutCopyPasteEnabled
    this.keyboardCutCopyPasteEnabled = $parseBoolean(this.keyboardCutCopyPasteEnabled, false);

    //从配置获得节点
    this.$parseChildren('text/xml', this.element);

    let i, j;

    //从dataSource加载数据
    if (this.dataSource == null) { this.dataSource = ''; }
    //解析dataMappings, 数据映射只应用于外部数据
    if (!(this.dataMappings instanceof Array)) { this.dataMappings = []; }
    if (this.dataMappings.length == 0) {
        let dl = [];
        //查找保存数据映射信息的DL节点
        for (i = 0; i < this.element.children.length; i++) {
            if (this.element.children[i].nodeType == 1 && this.element.children[i].nodeName == 'DL') {
                dl.push(this.element.children[i]);
            }
        }

        if (dl.length > 0) {
            let mapping, map, m, dd, f;
            let t = new TreeNode();
            for (i = 0; i < dl.length; i++) {
                mapping = new TreeView.DataMapping();
                mapping.url = dl[i].getAttribute('url');
                if (mapping.url == null) { mapping.url = ''; }
                mapping.parseOnly = $parseBoolean(dl[i].getAttribute('parseOnly'), false);
                if (!mapping.parseOnly) {
                    for (j = 0; j < dl[i].children.length; j++) {
                        dd = dl[i].children[j];
                        if (dd.nodeType == 1 && dd.nodeName == 'DD') {
                            map = {};
                            map.tag = dd.getAttribute('tag');
                            map.object = dd.getAttribute('object');

                            for (let k = 0; k < dd.attributes.length; k++) {
                                if (!/(tag)|(object)/i.test(dd.attributes[k].name)) {
                                    f = false;
                                    for (let p in t) {
                                        if (t.hasOwnProperty(p) && !(t[p] instanceof Array)) {
                                            if (new RegExp('^' + p + '$', 'i').test(dd.attributes[k].name)) {
                                                map[p] = dd.attributes[k].value;
                                                f = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (!f) {
                                        //浏览器会自动将属性名变成小写                                        
                                        map[dd.attributes[k].name] = dd.attributes[k].value;
                                    }
                                }
                            }
                            mapping.maps.push(map);
                        }
                    }
                }
                this.dataMappings.push(mapping);
            }
        }
    }
    if (this.dataSource != '' && !this.loaded) {
        this.$appendLoadingNode();
        TreeView.request(this.dataSource, null, this, '$getChildNodesFromDataSource');
    }

    //保存到全局对象
    document.treeViews[this.id] = this;

    //onLoaded事件    
    if (this.dataSource == '' && !this.loaded) {
        if (this.children.length > 0) {

            // expandDepth & expandTo
            this.expandTo(this.expandDepth);

            // ↓
            // preloadDepth & preloadTo
            // ↓
            // pathToSelect & selectNodeByPath
            // ↓
            // pathsToCheck & checkNodesByPaths
            // ↓
            // $completeLoading()
        }
        else {
            this.$completeLoading();
        }
    }

    let treeView = this;

    if (this.dragAndDropEnabled) {
        // 从一个dropLine左右侧来回移动有时不会重置dropLine, 在TreeView上添加此事件是为了还原曾经激活的dropLine
        this.element.ondragleave = function () { TreeView.$restoreDropLine(); }

        // 可以将节点拖放到外部对象, 不移除被拖放的节点
        if (this.externalDropTargets != '') {
            if (typeof (this.externalDropTargets) == 'string') { this.externalDropTargets = this.externalDropTargets.split(','); }
            for (i = 0; i < this.externalDropTargets.length; i++) {
                if (typeof (this.externalDropTargets[i]) == 'string') {
                    this.externalDropTargets[i] = document.getElementById(this.externalDropTargets[i]);
                }
            }
            for (i = 0; i < this.externalDropTargets.length; i++) {
                if (this.externalDropTargets[i] != null) {
                    //不使用addListener是因为使用reload时会多次附加事件
                    this.externalDropTargets[i].ondragover = function (ev) { ev.preventDefault(); };
                    this.externalDropTargets[i].ondrop = function (ev) {
                        //向外部拖放完成
                        Event.execute(treeView, 'onNodeExternalDropped', this);
                        //正常拖放结束
                        Event.execute(treeView, 'onNodeDragEnd', treeView.selectedNode);
                        ev.preventDefault();
                        ev.stopPropagation();
                    };
                }
            }
        }
    }

    //解析节点选项盒
    let ul = null;
    //查找保存右键菜单信息的UL节点
    for (i = 0; i < this.element.children.length; i++) {
        if (this.element.children[i].nodeType == 1 && this.element.children[i].nodeName == 'UL') {
            ul = this.element.children[i];
            break;
        }
    }
    if (ul != null) {
        this.optionBox = new TreeView.OptionBox(this, ul.getAttribute('display'));
        this.optionBox.initialize(ul.children);
    }
};

TreeNode = function (settings) {
    /// <summary>构造函数</summary>

    /// <value type="String">节点的唯一标识, 传递节点引用</value>
    this.name = '';
    /// <value type="String">节点的文本，不支持HTML</value>
    this.text = '';
    /// <value type="String|Html">提醒文字, 显示在文本之后, 支持Html</value>
    this.tip = '';
    /// <value type="String">节点的值</value>
    this.value = '';
    /// <value type="String">节点的注释, 鼠标划过节点时显示</value>
    this.title = '';

    /// <value type="String">节点的默认图标</value>
    this.icon = '';
    /// <value type="String">节点展开时的图标</value>
    this.expandedIcon = '';

    /// <value type="String">鼠标点击节点时的链接路径</value>
    this.link = '';
    /// <value type="String">节点链接目标</value>
    this.target = '';

    /// <value type="String|Element">子节点数据源</value>
    this.data = '';
    this.path = '/';
    this.template = '';

    /// <value type="Integer">缩进, null表示从TreeView继承</value>
    this.indent = null;
    /// <value type="Integer">节点内间距, null表示从TreeView继承</value>
    this.padding = null;
    /// <value type="Integer">同级节点之间的距离, null表示从TreeView继承</value>
    this.spacing = null;
    /// <value type="Integer">与子节点之间的距离, null表示从TreeView继承</value>
    this.childrenPadding = null;

    /// <value type="String">节点默认样式, 默认从TreeView继承</value>
    this.className = '';
    /// <value type="String">节点被选择样式, 默认从TreeView继承</value>
    this.selectedClass = '';
    /// <value type="String">编辑状态下的文本框样式, 默认从TreeView继承</value>
    this.editClass = '';
    /// <value type="String">节点tip样式, 默认从TreeView继承</value>
    this.tipClass = '';
    /// <value type="String">节点被剪切时的样式, 默认从TreeView继承</value>
    this.cutClass = '';
    /// <value type="String">有节点被拖放到当前节点时的样式, 默认从TreeView继承</value>
    this.dropClass = '';

    /// <value type="Boolean">可以被拖动, TreeView.dragAndDropEnabled启用时生效</value>
    this.selectable = true;
    /// <value type="Boolean">可以被拖动, TreeView.dragAndDropEnabled启用时生效</value>
    this.draggable = true;
    /// <value type="Boolean">可以被拖放, TreeView.dragAndDropEnabled启用时生效</value>
    this.droppable = true;
    /// <value type="Boolean">节点是否可编辑</value>
    this.editable = true;    

    /// <value type="Array" elementType="TreeNode">获取当前节点子节点的集合</value>
    this.children = new Array();

    /// <value type="Array" elementType="String">属性数组, 用于初始化节点和getAttribute和setAttribute方法</value>
    this.attributes = new Object();

    // 初始化
    if (settings != null) {
        for (let n in settings) {
            if (settings[n] != null) { this[n] = settings[n]; }
        }
    }
}

TreeNode.prototype.populate = function () {
    /// <summary>装配节点</summary>

    //this.enabled = $parseBoolean(this.enabled, true);

    //pupulate不能独立被调用, 需要先指定treeView和parentNode

    // name值在appendChild和insertBefore时(populate之前)验证

    // 不需要验证 value, title, tip

    //text, html
    if (this.html == '' && this.text != '') {
        this.html = this.text;
    }
    else if (this.text == '' && this.html != '') {
        this.text = this.html;
    }
    //清理text
    if (/<text>(.*?)<\/text>/i.test(this.text)) {
        this.text = /<text>(.*?)<\/text>/i.exec(this.text)[1];
    }
    this.text = this.text.replace(/<[^>]+?>/ig, '');

    // imageUrl | expandedImageUrl
    if (this.imageUrl == null) { this.imageUrl = ''; };
    if (this.expandedImageUrl == null) { this.expandedImageUrl = ''; };

    // navigateUrl && target
    if (this.navigateUrl == null) { this.navigateUrl = ''; }
    this.target = $parseString(this.target, /\w+/i, 'I', this.treeView.target);

    if (this.tip == null) { this.tip = ''; }

    //验证各非文本属性
    //样式, 如果null或'', 从TreeView继承
    this.className = $parseString(this.className, /\w+/i, 'I', this.treeView.nodeClass);
    this.hoverClass = $parseString(this.hoverClass, /\w+/i, 'I', this.treeView.hoverNodeClass);
    this.selectedClass = $parseString(this.selectedClass, /\w+/i, 'I', this.treeView.selectedNodeClass);
    this.selectedHoverClass = $parseString(this.selectedHoverClass, /\w+/i, 'I', this.treeView.selectedHoverNodeClass);
    this.tipClass = $parseString(this.tipClass, /\w+/i, 'I', this.treeView.nodeTipClass);
    this.cutClass = $parseString(this.cutClass, /\w+/i, 'I', this.treeView.cutNodeClass);
    this.editClass = $parseString(this.editClass, /\w+/i, 'I', this.treeView.nodeEditClass);
    this.dropClass = $parseString(this.dropClass, /\w+/i, 'I', this.treeView.dropChildClass);

    //indent, padding, spacing, childrenPadding
    this.indent = $parseInt(this.indent, this.treeView.nodeIndent);
    this.padding = $parseInt(this.padding, this.treeView.nodePadding);
    this.spacing = $parseInt(this.spacing, this.treeView.nodeSpacing);
    this.childrenPadding = $parseInt(this.childrenPadding, this.treeView.childrenPadding);

    // draggable:true, droppable:true 需要TreeView同时启用才能生效    
    this.draggable = $parseBoolean(this.draggable, true);
    this.droppable = $parseBoolean(this.droppable, true);

    this.selectable = $parseBoolean(this.selectable, true);
    //editable:true 需要TreeView同时启用才能生效
    this.editable = $parseBoolean(this.editable, true);

    //dataSource
    if (this.dataSource == null) { this.dataSource = ''; }

    //hasChildren
    this.hasChildren = ((this.dataSource != '' && !this.loaded) || this.children.length > 0 || this.dataElement != null);

    let treeNode = this;

    let div, table, tbody, tr, td, img;

    //节点行
    div = document.createElement('DIV');
    div.id = 'TreeNode_' + this.name;
    div.setAttribute('sign', 'ROW');
    div.setAttribute('path', this.path);

    //spacing
    if (this.spacing > 0) {
        //大于0且启用拖放或者显示树线时, 在添加或删除节点时用DIV控制间隔
        if (!this.treeView.dragAndDropEnabled && !this.treeView.showLines) {
            div.style.marginTop = this.spacing + 'px';
            div.style.marginBottom = this.spacing + 'px';
        }
    }

    //节点
    table = document.createElement('TABLE');
    table.setAttribute('sign', 'NODE');
    //table.border = 1;
    table.cellPadding = this.padding + 'px';
    table.cellSpacing = 0;
    table.setAttribute('indent', this.indent + 'px');
    tbody = document.createElement('TBODY');
    tr = document.createElement('TR');

    if (this.depth > 1) {
        let parent = this.parentNode;
        while (parent != null) {
            td = document.createElement('TD');
            td.style.width = parent.nodeElement.getAttribute('indent');
            //td的宽度浏览器会自动加上cellPadding的宽度, 所有TD内填充图片宽度和TD宽度设置一致即可
            td.innerHTML = '<img src="' + this.treeView.imagesBaseUrl + 'blank.gif" width="' + parseInt(td.style.width) + '" height="1" border="0" />';
            if (tr.children.length > 0) {
                tr.insertBefore(td, tr.firstChild);
            }
            else {
                tr.appendChild(td);
            }
            parent = parent.parentNode;
        }
    }

    // burl + -
    if (this.treeView.showBurls) {
        td = document.createElement('TD');
        td.setAttribute('sign', 'BURL');
        td.align = 'center';
        img = document.createElement('IMG');
        img.align = 'absmiddle';
        this.burlElement = img;
        if (this.hasChildren) {
            this.burl();
        }
        else {
            img.src = this.treeView.imagesBaseUrl + this.treeView.noExpandImageUrl;
        }
        td.appendChild(img);
        tr.appendChild(td);
    }

    //checkbox
    if (this.treeView.showCheckBoxes != 'NONE') {
        if (this.treeView.showCheckBoxes == 'RELATIVE') {
            this.checked = ((this.parentNode != null && this.parentNode.checked == 1) ? 1 : 0);
        }

        td = document.createElement('TD');
        td.setAttribute('sign', 'CHECKBOX');
        td.align = 'center';

        if (this.treeView.showCheckBoxes == 'RELATIVE') {
            img = document.createElement('IMG');
            img.align = 'absmiddle';
            img.src = this.treeView.imagesBaseUrl + 'checkbox_' + this.checked + 'a.gif';
            img.onmouseover = function () { this.src = this.src.replace(/a\.gif$/i, 'b.gif'); }
            img.onmouseout = function () { this.src = this.src.replace(/[bc]\.gif$/i, 'a.gif'); }
            img.onmousedown = function (ev) {
                ev = ev || window.event;
                if (ev.button == 1 || ev.button == 0) {
                    this.src = this.src.replace(/b\.gif$/i, 'c.gif');
                }
            }
            img.onmouseup = function (ev) {
                ev = ev || window.event;
                if (ev.button == 1 || ev.button == 0) {
                    this.src = this.src.replace(/c\.gif$/i, 'b.gif');

                    if (treeNode.checked == 0) {
                        treeNode.check();
                    }
                    else {
                        treeNode.uncheck();
                    }
                }
            }
            td.appendChild(img);
            this.checkBoxElement = img;
        }
        else {
            let input = document.createElement('INPUT');
            input.type = 'checkbox';
            input.name = this.treeView.id;
            input.value = this.path;
            input.onclick = function (ev) {
                ev = ev || window.event;
                if (ev.button == 1 || ev.button == 0) {
                    if (treeNode.checked == 0) {
                        treeNode.check();
                    }
                    else {
                        treeNode.uncheck();
                    }
                }
            }
            td.appendChild(input);
            this.checkBoxElement = input;
        }
        tr.appendChild(td);
    }

    //image
    if (this.treeView.showIcons && this.imageUrl != '') {
        td = document.createElement('TD');
        td.align = 'center';
        td.setAttribute('sign', 'IMAGE');
        img = document.createElement('IMG');
        img.align = 'absmiddle';
        if (this.imageUrl != '') { img.src = this.treeView.imagesBaseUrl + this.imageUrl; }
        td.appendChild(img);
        tr.appendChild(td);

        this.iconElement = img;
    }

    //text
    td = document.createElement('TD');
    td.setAttribute('sign', 'TEXT');
    td.style.cursor = 'default';
    td.style.whiteSpace = 'nowrap';
    td.title = this.title;

    //节点对象
    switch (this.treeView.nodeCellStyle) {
        case 'TEXT':
            this.majorElement = td;
            break;
        //        case 'NODE':                                                    
        //            this.majorElement = table;                                                    
            break;
        case 'ROW':
            this.majorElement = div;
            break;
        default:
            this.majorElement = td;
            break;
    }
    this.majorElement.className = (this.selected ? this.selectedClass : this.className);

    //Edit
    if (this.treeView.nodeEditingEnabled) {
        this.majorElement.ondblclick = function () {
            treeNode.edit();
        }
    }

    //Drag & Drop
    if (this.treeView.dragAndDropEnabled) {
        //draggable为true才能拖动
        this.majorElement.draggable = this.draggable;

        this.majorElement.ondragstart = function (ev) {
            if (!treeNode.selected) { treeNode.select(false); }

            //如果已经展开, 隐藏
            if (treeNode.expanded) { treeNode.collapse(false); }

            //拖放事件
            TreeView.clipBoard.treeNode = treeNode;

            //拖放数据
            let t = ev.dataTransfer;

            if (ev.shiftKey) {
                t.effectAllowed = 'copy';
                TreeView.clipBoard.action = 'DRAGCOPY';
            }
            else {
                t.effectAllowed = 'move';
                TreeView.clipBoard.action = 'DRAGMOVE';
            }
            //这里有什么用吗？没看到getData的地方 - 2015/1/19
            t.setData('text/plain', '{treeView:"' + treeNode.treeView.id + '", action:"' + t.effectAllowed + '", treeNode:"' + treeNode.name + '"}');

            //克隆节点
            //TreeView.clipBoard.treeNode = treeNode.clone();

            if (t.effectAllowed == 'move') {
                //被拖放节点样式
                if (treeNode.cutClass != '') {
                    this.className = treeNode.cutClass;
                }
                else {
                    this.style.opacity = 0.6;
                    //this.style.borderStyle = 'dashed';
                }
            }
            //            else {
            //                //复制
            //                this.style.borderStyle = 'dashed';
            //            }

            //执行开始拖拽事件
            Event.execute(treeNode.treeView, 'onNodeDragStart', treeNode);
        }

        //是否可以拖放到其他节点, false 表示仅排序
        if (this.treeView.dropChildEnabled) {
            this.majorElement.ondragover = function (ev) {
                let originalNode = TreeView.clipBoard.treeNode;

                let droppable = true;
                //树内部或其他树的节点拖动
                if (originalNode != null) {
                    let oTreeView = originalNode.treeView;

                    //如果目标节点的droppable为false
                    //如果被drag节点是drop节点的lastChild, 不能drop                
                    //节点不能拖放到自己的子节点上                    
                    if (!treeNode.droppable) { droppable = false; }
                    if (originalNode == treeNode.lastChild) { droppable = false; }
                    if (treeNode.treeView == oTreeView && ('.' + treeNode.path + '.').indexOf('.' + originalNode.path + '.') > -1) { droppable = false; }
                }

                if (droppable) {
                    if (Event.execute(treeNode.treeView, 'onNodeDragOver', treeNode)) {
                        ev.preventDefault();

                        if (treeNode.dropClass != '') {
                            this.className = treeNode.dropClass;
                        }
                        else {
                            this.style.boxShadow = '1px 2px 6px #CCCCCC';
                        }
                    }
                }
            }

            this.majorElement.ondragleave = function (ev) {
                ev.preventDefault();

                if (treeNode.dropClass != '') {
                    this.className = '';
                }
                else {
                    this.style.boxShadow = '';
                }
            }

            this.majorElement.ondrop = function (ev) {
                let originalNode = TreeView.clipBoard.treeNode;

                //节点拖放
                if (originalNode != null) {
                    //$onAppended 添加完节点之后执行
                    let $onAppended = function (node) {

                        //结束拖放, 清空数据
                        TreeView.clipBoard.clear();

                        node.select(false);

                        //执行事件
                        if (TreeView.clipBoard.action == 'DRAGMOVE') {
                            Event.execute(treeNode.treeView, 'onNodeMoved', node);
                        }
                        else if (TreeView.clipBoard.action == 'DRAGCOPY') {
                            Event.execute(treeNode.treeView, 'onNodeCopied', node);
                        }
                        Event.execute(treeNode.treeView, 'onNodeDropped', node);

                        //正常结束事件
                        Event.execute(treeNode.treeView, 'onNodeDragEnd', node);
                    }

                    let node = originalNode.clone();

                    //处理原节点
                    if (TreeView.clipBoard.action == 'DRAGMOVE') {
                        //删除原节点
                        originalNode.remove(false);
                    }

                    //在当前节点添加子节点          
                    if (treeNode.hasChildren) {
                        //有子节点, 未展开
                        if (!treeNode.expanded) {
                            TreeNode.$attachEvent(treeNode, '$onExpanded',
                            function () {
                                TreeNode.$attachEvent(this, '$onAppended', $onAppended);
                                this.appendChild(node);
                            }
                        );
                            TreeView.clipBoard.$expanding = true;
                            treeNode.expand(false);
                        }
                        //有子节点, 已展开
                        else {
                            TreeNode.$attachEvent(treeNode, '$onAppended', $onAppended);
                            treeNode.appendChild(node);
                        }
                    }
                    else {
                        //无子节点
                        TreeNode.$attachEvent(treeNode, '$onAppended', $onAppended);
                        treeNode.appendChild(node);
                        treeNode.expand(false);
                    }
                }
                else {
                    //外部元素拖放
                    Event.execute(treeNode.treeView, 'onExternalElementDropped', treeNode);
                    treeNode.select(false);
                }

                //清除拖放样式
                if (treeNode.dropClass != '') {
                    this.className = treeNode.className;
                }
                else {
                    this.style.boxShadow = '';
                }

                ev.preventDefault();
                ev.stopPropagation();
            }
        }
        else {
            this.majorElement.ondragover = function (ev) {
                ev.stopPropagation();
            }
        }

        this.majorElement.ondragend = function (ev) {
            //恢复默认设置
            if (TreeView.clipBoard.action != '') {
                if (!TreeView.clipBoard.$expanding) { TreeView.clipBoard.clear(); }

                if (treeNode.cutClass != '') {
                    this.className = treeNode.selectedClass;
                }
                else {
                    this.style.opacity = 1;
                }
            }
            //ev.dataTransfer.clearData('text/plain');

            //拖放取消 - 不正常结束
            if (treeNode.treeView != null) {
                Event.execute(treeNode.treeView, 'onNodeDragEnd', treeNode);
            }
        }
    }

    //为节点对象添加事件

    //鼠标划入:为了避免和optionBox冲突
    $x(this.majorElement).bind('mouseover', function (ev) {
        if (Event.execute(treeNode.treeView, 'onNodeHover', this)) {
            if (!treeNode.selected) {
                this.className = treeNode.hoverClass;
            }
            else {
                if (treeNode.selectedHoverClass != '') {
                    this.className = treeNode.selectedHoverClass;
                }
            }
        }
    });

    //鼠标划出
    this.majorElement.onmouseout = function () {
        this.className = (!treeNode.selected ? treeNode.className : treeNode.selectedClass);
    }

    //点击
    this.majorElement.onclick = function (ev) {
        ev = ev || window.event;
        if (!treeNode.selected) {
            treeNode.select(ev);
        }
    }

    this.majorElement.oncontextmenu = function (ev) {

        //显示右键菜单
        if (!treeNode.editing) {
            ev = ev || window.event;
            if (!treeNode.selected) {
                treeNode.select(ev);
            }

            if (treeNode.treeView.optionBox != null && treeNode.treeView.optionBox.display == 'CONTEXTMENU') {
                treeNode.treeView.optionBox.target = treeNode;
                treeNode.treeView.optionBox.show(ev);
                return false;
            }
        }
    }

    //navigateUrl & text
    if (this.navigateUrl != null && this.navigateUrl != '') {
        let a = document.createElement('A');
        //a.id = table.id + '_text';
        a.setAttribute('sign', 'LINK');
        a.href = treeNode.navigateUrl;
        if (this.target != null && this.target != '') {
            a.target = this.target;
        }
        //a.innerHTML = TreeView.$textEncode(this.text);
        a.innerHTML = this.html;
        a.onclick = function () {
            //onNodeNavigate事件
            if (this.href != '' && this.href.indexOf('javascript:') == -1) {
                Event.execute(treeNode.treeView, 'onNodeNavigate', treeNode);
            }
        }
        td.appendChild(a);
        if (!td.draggable) {
            a.draggable = false;
        }
    }
    else {
        //td.innerHTML = TreeView.$textEncode(this.text);
        td.innerHTML = this.html;
    }

    tr.appendChild(td);
    this.textElement = td;

    if (this.tip != '') {
        td = document.createElement('TD');
        td.className = this.tipClass;
        td.style.cursor = 'default';
        td.style.whiteSpace = 'nowrap';
        td.innerHTML = this.tip;
        tr.appendChild(td);

        this.tipElement = td;
    }

    tbody.appendChild(tr);
    table.appendChild(tbody);
    div.appendChild(table);

    this.element = div;
    this.nodeElement = table;
    //optionBox

    this.element.onmouseover = function (ev) {
        if (treeNode.treeView.optionBox != null && treeNode.treeView.optionBox.display != 'CONTEXTMENU' && treeNode.treeView.optionBox.display != 'TOP') {
            if (!treeNode.editing) {
                if (!treeNode.treeView.optionBox.visible || treeNode.treeView.optionBox.target != treeNode) {
                    ev = ev || window.event;
                    treeNode.treeView.optionBox.target = treeNode;
                    treeNode.treeView.optionBox.show(ev);
                }
            }
        }
    }

    div = document.createElement('DIV');
    div.setAttribute('sign', 'CHILDREN');
    div.setAttribute('for', this.name);
    if (this.childrenPadding > 0) {
        if (this.treeView.showLines) {
            div.appendChild(TreeView.$populateChildNodesPadding(this, 'top'));
            div.appendChild(TreeView.$populateChildNodesPadding(this, 'bottom'));
        }
        else {
            div.style.paddingTop = this.childrenPadding + 'px';
            div.style.paddingBottom = this.childrenPadding + 'px';
        }
    }
    div.style.display = 'none';
    this.childrenElement = div;
}

TreeNode.prototype.repopulate = function () {
    /// <summary>重新装配已经存在的节点</summary>

    this.loaded = false;
    this.expanded = false;

    let parentNode = this.element.parentNode;
    let nextSibling = this.childrenElement.nextSibling;

    //删除
    parentNode.removeChild(this.childrenElement);
    parentNode.removeChild(this.element);

    //装配
    this.populate();

    //重新添加
    if (nextSibling != null) {
        parentNode.insertBefore(this.element, nextSibling);
        parentNode.insertBefore(this.childrenElement, nextSibling);
    }
    else {
        parentNode.appendChild(this.element);
        parentNode.appendChild(this.childrenElement);
    }

    if (this.selected) { this.select(false); }
}

TreeNode.prototype.load = function (repopulate) {
    /// <summary>加载子节点项</summary>
    /// <param name="repopulate" type="Boolean">是否重新装配<param>
    this.loading = true;

    if (repopulate == true) {
        //从children重新装配节点 -- 用于节点移动和复制
        this.$parseChildren('self');
    }
    else {
        //从配置获得节点
        if (this.dataElement != null) { this.$parseChildren('text/xml', this.dataElement); }

        //从dataSource加载数据
        if (this.dataSource != '' && !this.loaded) {
            // 如果div的子节点数为0或者不存在loading节点, 表明不是正在加载, 加载子节点
            if (this.childrenElement.children.length == 0 || this.childrenElement.lastChild.getAttribute('sign') != 'LOADING') {
                this.treeView.$appendLoadingNode(this);

                TreeView.request(this.dataSource, null, this, '$getChildNodesFromDataSource');
            }
        }
    }

    // 如果dataSource为空 或者 是仅从现有节点重新装备
    if ((this.dataSource == '' || repopulate == true) && !this.loaded) {
        //当没有子节点时, 处理burl为blank
        if (this.children.length == 0) { this.unburl(); }

        this.loading = false;
        this.loaded = true;
        //执行TreeNode事件
        TreeNode.$executeEvent(this, '$onLoaded');

    }
};

TreeNode.prototype.reload = function (completely) {
    /// <summary>重新加载</summary>
    /// <param name="completely" type="Boolean" defaultValue="true">true: 从dataElement和dataSource重新加载; false: 从children重新加载</param>

    this.loaded = false;

    if (completely == false) {
        //仅重新装备节点
        this.load(true);
    }
    else {
        //记录展开状态
        let expanded = this.expanded;
        //移除所有节点
        this.removeAll();
        //如果之前是展开状态，还是展开; 反之则只加载
        if (expanded) {
            this.expand(false);
        }
        else {         
            this.load();
        }
    }
}


//默认CSS样式 | Default Css Class
TreeView.$defautlClass = '.treeView-default-class { background-color:transparent; }';
TreeView.$defautlClass += '.treeNodeDefaultClass { border:1px solid transparent; border-radius:3px; }';
TreeView.$defautlClass += '.treeNodeDefaultHoverClass { border:1px solid #999999; border-radius:3px; background-color:#EEEEEE; }';
TreeView.$defautlClass += '.treeNodeDefaultSelectedClass { border:1px solid #0F6D39; border-radius:3px; background-color:#3DBC77; }';
TreeView.$defautlClass += '@keyframes treeViewFadeIn {0%{opacity:0;} 100%{opacity:1;}}';
TreeView.$defautlClass += '@keyframes treeViewFadeOut {0%{opacity:1;} 100%{opacity:0;}}';
TreeView.$defautlClass += '@keyframes dropLineFadeInOut {0%{opacity:0.2;} 50%{opacity:1;} 100%{opacity:0.2;}}';
TreeView.$defautlClass += '.treeNodeFadeInClass { animation-name: treeViewFadeIn; animation-duration: 0.4s; animation-timing-function: ease-in; animation-fill-mode: forwards; -webkit-animation-name: treeViewFadeIn; -webkit-animation-duration: 0.4s; -webkit-animation-timing-function: ease-in; -webkit-animation-fill-mode: forwards;}';
TreeView.$defautlClass += '.dropLineDefaultClass {box-shadow:1px 1px 6px #999999;animation-name:dropLineFadeInOut;animation-duration:1s;animation-timing-function:ease;animation-iteration-count:infinite;-webkit-animation-name:dropLineFadeInOut;-webkit-animation-duration:1s;-webkit-animation-timing-function:ease;-webkit-animation-iteration-count:infinite;}';
TreeView.$defautlClass += '.treeViewContextMenuClass1 {opacity:1; box-shadow:1px 2px 6px #999999; border-radius:2px;}'; //normal
TreeView.$defautlClass += '.treeViewContextMenuClass2 {opacity:0; box-shadow:1px 2px 6px #999999; border-radius:2px; animation-name:treeViewFadeOut; animation-duration:0.4s; animation-timing-function:ease-in; -webkit-animation-name:treeViewFadeOut; -webkit-animation-duration:0.8s; -webkit-animation-timing-function:ease-in;}'; //fade out
TreeView.$defautlClass += '.treeViewNodeOption0a {background-color:#F8F8F8; padding:2px 3px; border-style:dotted; border-width:1px 0px 1px 1px; border-color:transparent;  border-top-left-radius:2px; border-bottom-left-radius:2px;}';
TreeView.$defautlClass += '.treeViewNodeOption0b {cursor:default; padding:2px 3px; border-style:solid; border-width:1px 0px 1px 1px; border-color:#FFCC66;  border-top-left-radius:2px; border-bottom-left-radius:2px;}';
TreeView.$defautlClass += '.treeViewNodeOption1a {padding:2px 9px 2px 8px; border-style:solid; border-width:1px 0px 1px 1px; border-color:transparent transparent transparent #F0F0F0; border-top-right-radius:2px; border-bottom-right-radius:2px;}'; //enabled normal
TreeView.$defautlClass += '.treeViewNodeOption1b {padding:2px 8px 2px 9px; cursor:default; border-style:solid; border-width:1px 1px 1px 0px; border-color:#FFCC66 #FFCC66 #FFCC66 transparent;  border-top-right-radius:2px; border-bottom-right-radius:2px;}'; //enabled hover
TreeView.$defautlClass += '.treeViewNodeOption1c {padding:2px 9px 2px 8px; cursor:default; border-style:solid; border-width:1px 0px 1px 1px; border-color:transparent transparent transparent #F0F0F0; border-top-right-radius:2px; border-bottom-right-radius:2px; color:#AAAAAA;}'; //disabled
TreeView.$defautlClass += '.treeViewNodeOption2a {padding:2px 3px; cursor:default; border:1px solid transparent; background-color:inherit; border-radius:2px;}'; //enabled normal
TreeView.$defautlClass += '.treeViewNodeOption2b {padding:2px 3px; cursor:default; border:1px solid #FFCC66; border-radius:2px;}'; //enabled hover
TreeView.$defautlClass += '.treeViewNodeOption2c {padding:2px 3px; cursor:default; border:1px solid #CC9933; background-color:#FFCC66; border-radius:2px;}'; //enabled mousedown
TreeView.$defautlClass += '.treeViewNodeOption2d {padding:2px 3px; cursor:default; color:#AAAAAA; background-color:#FFFFFF; border-radius:2px;}'; //disbaled

//window.style = TreeView.$defautlClass;
//document.createStyleSheet("javascript:style");

TreeView.$defautlClassTag = document.createElement('STYLE');
TreeView.$defautlClassTag.type = 'text/css';

if (TreeView.$defautlClassTag.styleSheet) {
    // IE
    TreeView.$defautlClassTag.styleSheet.cssText = TreeView.$defautlClass;
}
else {
    // Other
    TreeView.$defautlClassTag.innerHTML = TreeView.$defautlClass;
}
document.getElementsByTagName('HEAD').item(0).appendChild(TreeView.$defautlClassTag);





TreeNode = function (elementOrSettngs) {
    /// <summary>构造函数</summary>

    let settings = new $Setting(elementOrSettings);

    /// <value type="String">节点的唯一标识, 传递节点引用</value>
    this.name = settings.getString('name');
    /// <value type="String">节点的文本，不支持HTML</value>
    this.text = settings.getElementString('text');
    /// <value type="String|Html">提醒文字, 显示在文本之后, 支持Html</value>
    this.tip = settings.getElementString('tip');
    /// <value type="String">节点的值</value>
    this.value = settings.getString('value');
    /// <value type="String">节点的注释, 鼠标划过节点时显示</value>
    this.title = settings.getString('title');

    /// <value type="String">节点的默认图标</value>
    this.icon = settings.getElementString('icon');
    /// <value type="String">节点展开时的图标</value>
    this.expandedIcon = settings.getElementString('expandedIcon');

    /// <value type="String">鼠标点击节点时的链接路径</value>
    this.link = settings.getString('link');
    /// <value type="String">节点链接目标</value>
    this.target = settings.getString('target');

    /// <value type="String">子节点数据源</value>
    this.data = settings.getString('data');
    this.path = settings.getString('path');
    /// <value type="String">模板名</value>
    this.template = settings.getString('template');

    /// <value type="Integer">缩进, null表示从TreeView继承</value>
    this.indent = settings.getInt('indent', null);
    /// <value type="Integer">节点内间距, null表示从TreeView继承</value>
    this.padding = settings.getInt('padding', null);
    /// <value type="Integer">同级节点之间的距离, null表示从TreeView继承</value>
    this.spacing = settings.getInt('spacing', null);
    /// <value type="Integer">与子节点之间的距离, null表示从TreeView继承</value>
    this.childrenPadding = settings.getInt('childrenPadding', null);

    /// <value type="String">节点默认样式, 默认从TreeView继承</value>
    this.className = settings.getString('className');
    /// <value type="String">节点被选择样式, 默认从TreeView继承</value>
    this.textClass = settings.getClassString('text');
    /// <value type="String">节点被选择样式, 默认从TreeView继承</value>
    this.selectedClass = settings.getString('selectedClass');
    /// <value type="String">编辑状态下的文本框样式, 默认从TreeView继承</value>
    this.editingClass = settings.getString('editingClass');
    /// <value type="String">节点icon样式, 默认从TreeView继承</value>
    this.iconClass = settings.getClassString('icon');
    /// <value type="String">节点icon样式, 默认从TreeView继承</value>
    this.expandedIconClass = settings.getClassString('expandedIcon');
    /// <value type="String">节点tip样式, 默认从TreeView继承</value>
    this.tipClass = settings.getClassString('tip');
    /// <value type="String">节点被剪切时的样式, 默认从TreeView继承</value>
    this.cutClass = settings.getString('cutClass');
    /// <value type="String">有节点被拖放到当前节点时的样式, 默认从TreeView继承</value>
    this.dropClass = settings.getString('dropClass');

    /// <value type="Boolean">可以被拖动, TreeView.dragAndDropEnabled启用时生效</value>
    this.selectable = settings.getBoolean('selectable', true);
    /// <value type="Boolean">可以被拖动, TreeView.dragAndDropEnabled启用时生效</value>
    this.draggable = settings.getBoolean('draggable', true);
    /// <value type="Boolean">可以被拖放, TreeView.dragAndDropEnabled启用时生效</value>
    this.droppable = settings.getBoolean('droppable', true);
    /// <value type="Boolean">节点是否可编辑</value>
    this.editable = settings.getString('editable', true);

    /// <value type="Array" elementType="TreeNode">获取当前节点子节点的集合</value>
    this.children = new Array();

    /// <value type="Array" elementType="String">属性数组, 用于初始化节点和getAttribute和setAttribute方法</value>
    this.attributes = new Object();

    let tags = element.querySelectorAll('icon,expandedIcon,text,tip');
    for (let i = tags.length - 1; i >= 0; i++) {
        tags[i].remove();
    }

    if (element.hasChildren) {
        let children = element.querySelectorAll('children');
        for (let i = children.length - 1; i >= 0; i++) {
            children[i].insertAdjacentHTML('beforeBegin', children[i].innerHTML);
            children[i].remove();
        }

        /*
        if (this.template != '') {
            this.templates[this.template].extend(element.innerHTML.trim());
        }
        else {
            this.template = 'root';
            this.templates[this.template] = new Template(element);
        }
        */
    }
}

TreeNode = function (elementOrSettngs) {
    /// <summary>构造函数</summary>

    PropertyInitializer(elementOrSettings).of(this)
        .string('name') //节点的唯一标识, 传递节点引用

        .html('text') //节点的文本，支持HTML
        .html('tip') //提醒文字, 显示在文本之后, 支持Html
        .string('value') //节点的值
        .string('title') //节点的注释, 鼠标划过节点时显示
        .html('icon') //节点的默认图标
        .html('expandedIcon') //节点展开时的图标

        .string('link') //鼠标点击节点时的链接路径
        .string('target') //节点链接目标

        .string('data') //子节点数据源
        .string('path') //jsonPath
        .string('template') //template name

        .int('indent', null) //缩进, null表示从TreeView继承
        .int('padding', null) //节点内间距, null表示从TreeView继承    
        .int('spacing', null) //同级节点之间的距离, null表示从TreeView继承
        .int('childrenPadding', null) // 与子节点之间的距离, null表示从TreeView继承

        .string('className') //节点被选择样式, 默认从TreeView继承
        .css('text') //textClass    
        .string('selectedClass') //节点被选择样式, 默认从TreeView继承
        .string('editingClass') //编辑状态下的文本框样式, 默认从TreeView继承
        .css('icon') //节点icon样式, 默认从TreeView继承
        .css('expandedIcon') //节点icon样式, 默认从TreeView继承
        .css('tip') //节点tip样式, 默认从TreeView继承
        .string('cutClass') //节点被剪切时的样式, 默认从TreeView继承
        .string('dropClass') //有节点被拖放到当前节点时的样式, 默认从TreeView继承

        .boolean('selectable', true) //是否可以被选中
        .boolean('draggable', true) //是否可以被拖动, TreeView.dragAndDropEnabled启用时生效
        .boolean('droppable', true) //是否可以把拖动的节眯放置为其子节点
        .boolean('editable', true); //节点是否可编辑

        `
            string name = 'tom';
            css tip;
            string cutClass;
            boolean editable = true;
            array icons = [];
        `.initialize(elementOrSettngs)
         .declare(this);

        $initialize(this)
        .with(elementOrSettngs)
        .declare({
            name: 'tom',
            tipClass: css,
            editable: false,
            hello: [1, 2, 3]
        })

        /// <value type="Array" elementType="TreeNode">获取当前节点子节点的集合</value>
        this.children = new Array();

        /// <value type="Array" elementType="String">属性数组, 用于初始化节点和getAttribute和setAttribute方法</value>
        this.attributes = new Object();

        let tags = element.querySelectorAll('icon,expandedIcon,text,tip');
        for (let i = tags.length - 1; i >= 0; i++) {
            tags[i].remove();
        }

        if (element.hasChildren) {
            let children = element.querySelectorAll('children');
            for (let i = children.length - 1; i >= 0; i++) {
                children[i].insertAdjacentHTML('beforeBegin', children[i].innerHTML);
                children[i].remove();
            }

            /*
            if (this.template != '') {
                this.templates[this.template].extend(element.innerHTML.trim());
            }
            else {
                this.template = 'root';
                this.templates[this.template] = new Template(element);
            }
            */
        }
}

TreeNode.prototype.$parseName = function (defaultName) {
    /// <summary>在被添加到TreeVIew之前, 需要确定节点的name, 节点名在树中必须唯一</summary>
    /// <param name="defaultName" type="String">默认name</param>
    if (this.name == null || this.name == '') { this.name = defaultName; }

    if (document.getElementById('TreeNode_' + this.name) != null) {
        let mch;
        while (document.getElementById('TreeNode_' + this.name) != null) {
            mch = /^(.*)_(\d+)$/.exec(this.name);
            if (mch != null) {
                this.name = mch[1] + '_' + (parseInt(mch[2]) + 1);
            }
            else {
                this.name = this.name + '_1';
            }
        }
    }
}

TreeNode.prototype.render = function() {
    //element node must be in document.
    
    this.populate();
    this.element.parentNode.insertBefore(this.element, this.nodeDiv);
    this.element.remove();

    return this;
}


TreeView.$textEncode = function (t) {
    /// <summary>解决节点的text中 <> 不能显示的问题</summary>
    /// <param name="t" type="String">文本</param>
    while (t.indexOf('<') > -1) {
        t = t.replace('<', '&lt;');
    }
    while (t.indexOf('>') > -1) {
        t = t.replace('>', '&gt;');
    }
    return t;
}

class TreeView {
    constructor (element) {
        
        if (element == null || element.nodeName == null || (element.nodeName != 'TREEVIEW' && element.nodeName != 'DIV')) {
            throw new Error('To be create a TreeView, must from TREEVIEW or DIV element');
        }

        this.element = element;
        this.template = element.getAttribute('template') || '';

        //先加载模板再解析TREENODE
              
    }
} 



TreeView.prototype.addTemplate = function(name, template) {

}

//name a anonymous node
TreeNode.prototype.checkName = function() {
    if (this.name == '') {
        if (this.parentNode == null) {
            this.name = 'root_' + this.treeView.children.length;
        }
        else {
            this.name = this.parentNode.name + '_child_' + this.parentNode.children.length;
        }
    }    
    return this;
}


let tags = element.querySelectorAll('icon,expandedIcon,text,tip');
for (let i = tags.length - 1; i >= 0; i--) {
    tags[i].remove();
}

TreeNode.prototype.in = function(treeView) {
    this.treeView = treeView;
    return this;
}

TreeNode.prototype.inherit = function(treeProperty) {
    this.$inheriting = treeProperty;
    return this;
}

TreeNode.prototype.to = function(nodeProperty) {
    if (this.$inheriting == null) {
        throw new Error('Must use inherit method first to inherit a property.');
    }
    if (this[nodeProperty] == '' || this[nodeProperty] == -1) {
        return this.treeView[this.$inheriting];
    }
    else {
        return this[nodeProperty];
    }
}

nodeCellStyle: function(style) {
    return /^(ROW|TEXT)$/i.test(style) ? style.toUpperCase() : 'TEXT';
},

showBurls: true,
showLines: false,
showIcons: false,
showCheckBoxes: fakse

burlsVisible: true, //是否显示节点展开和闭合图标
linesVisible: false, //是否显示分支线
iconsVisible: false, //是否显示节点图标
checkBoxesVisible: false, //是否显示复选框

TreeNode.$attachEvent = function (node, eventName, func) {
    /// <summary>给私有事件添加动作</summary>
    /// <param name="eventName" type="String">事件名</param>

    if (TreeNode[eventName]['e_' + node.name] == null) {
        TreeNode[eventName]['e_' + node.name] = new Array(); 
    }

    TreeNode[eventName]['e_' + node.name].push(func);
}

TreeNode.$executeEvent = function (node, eventName, args) {
    /// <summary>执行私有事件</summary>
    /// <param name="node" type="TreeNode">执行事件的节点</param>
    /// <param name="eventName" type="String">事件名</param>
    /// <param name="args" type="TreeNode">相关节点, $onAppended, $onInserted中可以使用到</param>

    let events = TreeNode[eventName]['e_' + node.name];

    if (events != null) {
        //原本为后入先出, 因为setLines问题改为先入先出, 后果未知
        //for (let i = events.length - 1; i >= 0; i--) {
        for (let i = 0; i < events.length; i++) {
            events[i].call(node, args);            
        }
    }

    TreeNode[eventName]['e_' + node.name] = null;
}

//TreeNode.prototype.load 2018.12.25
//当没有子节点时, 处理burl为blank
//if (this.childrenDiv.childElementCount == 0) { this.unburl(); }


TreeNode.prototype.$evalMappingValue = function (property, value, ignoreCase) {
    /// <summary>计算映射属性的值</summary>
    /// <param name="property" type="String">属性名</param>
    /// <param name="value" type="String">要计算的值</param>
    /// <param name="ignoreCase" type="String">是否忽略大小写</param>

    if (typeof (value) == 'string') {
        let r = new RegExp('\\{([^\\}]+)\\}', (ignoreCase != true ? '' : 'i'));
        let m;

        while (r.test(value)) {
            m = r.exec(value);
            value = value.replace(m[0], TreeView.$bracketEncode(this.getAttribute(m[1])));
        }
        value = TreeView.$bracketDecode(value);

        //支持javascript表达式
        if (/^javascript:/i.test(value)) {
            value = value.replace(/^javascript:/i, '');
            value = eval(value);
        }

        this[property] = value;
        this.setAttribute(property, value);
    }
}

TreeView.$getTreeNodesFromJson = function (jsonStr, mapping) {
    /// <summary>从Json字符串得到TreeNodes</summary>

    let nodes;
    try {
        nodes = eval('(' + jsonStr + ')');
    }
    catch (e) {
        window.alert(e.name + ': ' + e.message);
        nodes = null;
    }

    let treeNodes = [];
    let treeNode;
    if (nodes != null) {
        if (mapping == null) {
            if (!(nodes instanceof Array)) { nodes = [nodes]; }
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].text != null) {
                    treeNode = new TreeNode();
                    for (let property in nodes[i]) {
                        treeNode[property] = nodes[i][property];
                        treeNode.setAttribute(property, nodes[i][property]);                        
                    }
                    treeNodes.push(treeNode);
                }
            }
        }
        else {
            if (!(nodes instanceof Array)) { nodes = [nodes]; }
            let objects, value;
            //let r = /\[([^\]]+)\]/, m;
            //逐个解析数据中的每个对象
            for (let i = 0; i < nodes.length; i++) {
                //逐个解析每条map
                for (let j = 0; j < mapping.maps.length; j++) {
                    objects = mapping.maps[j].object;
                    if (objects == null) {
                        objects = nodes[i];
                    }
                    else {
                        objects = nodes[i][objects];
                    }
                    if (!(objects instanceof Array)) { objects = [objects]; }

                    for (let k = 0; k < objects.length; k++) {
                        treeNode = new TreeNode();
                        //先将属性遍历把值放进attributes
                        for (let property in objects[k]) {
                            treeNode[property] = objects[k][property];
                            treeNode.setAttribute(property, objects[k][property]);                            
                        }
                        //读取单条映射值
                        for (let property in mapping.maps[j]) {
                            treeNode.$evalMappingValue(property, mapping.maps[j][property], false);
                        }
                        if (treeNode.text != null) { treeNodes.push(treeNode); }
                    }
                }
            }
        }
    }    

    return treeNodes;
}

TreeView.$bracketEncode = function (v) {
    /// <summary>解决数据映射参数中 [] 的问题</summary>
    /// <param name="v" type="String">值</param>
    if (v == null) { v = ''; }
    if (typeof (v) != 'string') { v = v.toString(); }
    while (v.indexOf('[') > -1) {
        v = v.replace('[', '#091');
    }
    while (v.indexOf(']') > -1) {
        v = v.replace(']', '#093');
    }
    return v;
}

TreeView.$bracketDecode = function (v) {
    /// <summary>解决数据映射参数中 [] 的问题</summary>
    /// <param name="v" type="String">值</param>
    if (v != null) {
        while (v.indexOf('#091') > -1) {
            v = v.replace('#091', '[');
        }
        while (v.indexOf('#093') > -1) {
            v = v.replace('#093', ']');
        }
    }
    return v;
}

TreeNode.prototype.$parseChildren = function (contentType, data, url) {
    /// <summary>获取TreeNode子节点</summary>
    /// <param name="contentType" type="String">数据类型 text/xml, text/html, text/plain, array</param>
    /// <param name="data" type="Element|Xml|JsonString">从Element/Xml的子节点或Json字符串获取根节点信息</param>

    let mapping = null;
    if (this.treeView.dataMappings.length > 0 && url != null) {
        for (let i = 0; i < this.treeView.dataMappings.length; i++) {
            if (typeof (this.treeView.dataMappings[i].url) == 'string') {
                if (url.indexOf(this.treeView.dataMappings[i].url) > -1 || new RegExp(this.treeView.dataMappings[i].url, 'i').test(url)) {
                    mapping = this.treeView.dataMappings[i];
                    break;
                }
            }
            else if (this.treeView.dataMappings[i].url instanceof RegExp) {
                if (this.treeView.dataMappings[i].url.test(url)) {
                    mapping = this.treeView.dataMappings[i];
                    break;
                }
            }
        }
    }

    let treeNodes = [];
    if (contentType == 'self') {
        //从自身children加载
        for (let i = 0; i < this.children.length; i++) {
            treeNodes.push(this.children[i].clone());
        }
        this.children.length = 0;
        this.childrenDiv.innerHTML = '';
    }
    else {
        treeNodes = TreeView.$getTreeNodesFromJson(data, mapping);
    }

    for (let i = 0; i < treeNodes.length; i++) {
        this.appendChild(treeNodes[i]);
    }
};

TreeView.prototype.$parseChildren = function (data, url) {
    /// <summary>从element配置获取TreeView的根节点</summary>
    /// <param name="contentType" type=""String">数据类型</param>
    /// <param name="data" type="Element|Xml|JsonString">从Element/Xml的子节点或Json字符串获取根节点信息</param>
    /// <param name="url" type="String">计算数据映射用到的url</param>

    let mapping = null;
    if (this.dataMappings.length > 0 && url != null) {
        for (let i = 0; i < this.dataMappings.length; i++) {
            if (typeof (this.dataMappings[i].url) == 'string') {
                if (url.indexOf(this.dataMappings[i].url) > -1 || new RegExp(this.dataMappings[i].url, 'i').test(url)) {
                    mapping = this.dataMappings[i];
                    break;
                }
            }
            else if (this.dataMappings[i].url instanceof RegExp) {
                if (this.dataMappings[i].url.test(url)) {
                    mapping = this.dataMappings[i];
                    break;
                }
            }
        }
    }

    let treeNodes = TreeView.$getTreeNodesFromJson(data, mapping);
    for (let i = 0; i < treeNodes.length; i++) {
        this.appendChild(treeNodes[i]);
    }    
}

//2019.1.1 remove
TreeView.prototype.$getChildNodesFromDataSource = function (xmlRequest, url) {
    /// <summary>读取数据源后执行的函数</summary>

    //移除loading节点
    this.$removeLoadingNode();

    //获取子节点
    this.$parseChildren(contentType, xmlRequest.responseText, url);
    

    //loaded
    if (!this.loaded) {
        if (this.children.length > 0) {
            // expandDepth & expandTo
            this.expandTo(this.expandDepth);

            // ↓
            // preloadDepth & preloadTo
            // ↓
            // pathToSelect & selectNodeByPath
            // ↓
            // pathsToCheck & checkNodesByPaths
            // ↓
            // done
        }
        else {
            this.$completeLoading();
        }
    }
}

//populate
    //copy attributes
    for (let attr of this.element.getAttributeNames()) {
        if (this.element[attr] != null && typeof(this.element[attr]) == 'string') {
            div[attr] = this.element[attr];
        }
        else {
            div.setAttribute(attr, this.element[attr]);
        }
    }


    TreeView.prototype.getNodeByName = function (nodeName) {
        /// <summary>根据name获得节点, 要求节点已经被载入, 否则返回null</summary
        let nodeDiv = $s(nodeName);
        if (nodeDiv != null) {
            let names = nodeDiv.getAttribute('path').split('.');
            let rootNode = null;
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].name == names[0]) {
                    rootNode = this.children[i];
                    break;
                }
            }
            if (rootNode != null && names.length > 1) {
                names.splice(0, 1);
                return rootNode.$getNodeByName(names);
            }
            else {
                return rootNode;
            }            
        }
        else {
            return null;
        }
    }

    TreeNode.prototype.$getNodeByName = function (names) {
        /// <summary>根据name获得节点</summary
        let node = null;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].name == names[0]) {
                node = this.children[i];
                break;
            }
        }
    
        if (node != null && names.length > 1) {
            names.splice(0, 1);
            return node.$getNodeByName(names);
        }
        else {
            return node;
        }
    };

    TreeNode.prototype.update = function () {
        /// <summary>根据节点配置更新TreeNode节点的显示</summary>
        // ownProperty excludes children & attributes
        // text, icon, expandedIcon, tip, title, link, target
    
        if (this.treeView != null) {
            //name
            this.element.id = 'TreeNode_' + this.name;
    
            //path
            if (this.parentNode == null) {
                this.path = this.name;
            }
            else {
                this.path = this.parentNode.path + '.' + this.name;
            }
            this.setAttribute('path', this.path);
    
            // icon | expandedIcon
            if (this.treeView.icons == 'visible') {
                if (this.expanded && this.expandedIcon != '') {
                    this.iconCell.src = this.treeView.imagesBaseUrl + this.expandedIcon;
                }
                else {
                    this.iconCell.src = this.treeView.imagesBaseUrl + this.icon;
                }
            }
    
            // title
            this.textCell.title = this.title;
    
            // link & text
            if (this.link != '') {
                this.linkElement.href = this.link;
                this.target = $parseString(this.target, /\w+/i, 'I', this.treeView.target);
                this.linkElement.target = this.target;
                this.linkElement.innerHTML = this.text.encode();
            }
            else {
                this.textCell.innerHTML = this.text.encode();
            }
    
            // tip
            if (this.tip != '') {
                if (this.tipCell == null) {
                    let td = $create('TD');
                    td.className = this.tipClass;
                    td.style.cursor = 'default';
                    td.style.whiteSpace = 'nowrap';
                    td.innerHTML = this.tip;
                    this.tableElement.rows[0].appendChild(td);
    
                    this.tipCell = td;
                }
                this.tipCell.innerHTML = this.tip;
            }
        }
    };
    
    
    
    TreeNode.prototype.updateTip = function (tip) {
        /// <summary>更新tip内容</summary>
        /// <param name="tip" valueType="Text|Html">要更新的tip内容</param>
    
        if (tip != null) { this.tip = tip; }
        this.tipCell.innerHTML = this.tip;
    };


    TreeNode.prototype.$getChildNodesFromDataSource = function (xmlRequest, url) {
        /// <summary>读取数据源后执行的函数</summary>
    
        //移除loading节点	
        this.treeView.$removeLoadingNode(this);
    
        //获取子节点
        let contentType = xmlRequest.getResponseHeader("Content-Type");
        contentType = (/text\/xml/i.test(contentType) ? 'text/xml' : 'text/plain');
    
        if (contentType == 'text/xml') {
            if (xmlRequest.responseXML != null) {
                this.$parseChildren(contentType, xmlRequest.responseXML.lastChild, url);
            }
        }
        else {
            this.$parseChildren(contentType, xmlRequest.responseText, url);
        }
    
        //loaded
        if (!this.loaded) {
            //当没有子节点时, 处理burl为blank
            if (this.children.length == 0) { this.unburl(); }
    
            this.loading = false;
            this.loaded = true;
    
            //执行onload事件
            this.fire('onLoaded');
        }
    };

    //TreeView.appendChild
    if (this.children[length].element != null) {
        this.container.insertBefore(this.children[length].nodeDiv, this.children[length].element);
        this.container.insertBefore(this.children[length].childrenDiv, this.children[length].element);
    }
    else {
        if (length > 0 && this.container.lastElementChild.getAttribute('sign') == 'SPACING') {
            this.container.insertBefore(this.children[length].nodeDiv, this.container.lastElementChild);
            this.container.insertBefore(this.children[length].childrenDiv, this.container.lastElementChild);
        }
        else {
            this.container.appendChild(this.children[length].nodeDiv);
            this.container.appendChild(this.children[length].childrenDiv);
        }
    }   


    if (this.children[length].element != null) {
        this.childrenDiv.insertBefore(this.children[length].nodeDiv, this.children[length].element);     
        this.childrenDiv.insertBefore(this.children[length].childrenDiv, this.children[length].element);
    }
    else {
        let ref = null; //参考节点

        if (this.childrenDiv.children.length > 0) {
            if (this.childrenDiv.lastChild.getAttribute('sign') == 'CHILDRENPADDING') {
                if (this.childrenDiv.lastChild.previousSibling.getAttribute('sign') == 'SPACING') {
                    ref = this.childrenDiv.lastChild.previousSibling;
                }
                else {
                    ref = this.childrenDiv.lastChild;
                }
            }
            else if (this.childrenDiv.lastChild.getAttribute('sign') == 'SPACING') {
                ref = this.childrenDiv.lastChild;
            }
        }

        if (ref != null) {
            this.childrenDiv.insertBefore(this.children[length].nodeDiv, ref);
            this.childrenDiv.insertBefore(this.children[length].childrenDiv, ref);
        }
        else {
            this.childrenDiv.appendChild(this.children[length].nodeDiv);
            this.childrenDiv.appendChild(this.children[length].childrenDiv);
        }
    }

    /* removing loading node
    let container = parentNode == null ? this.container : parentNode.childrenDiv;
    for (let i = parentNode.children.length - 1; i >= 0; i--) {
        
        if (parentNode.children[i].name == 'loading__' || parentNode.children[i].getAttribute('for') == 'loading__') {
            parentNode.removeChild(parentNode.children[i]);
        }
    }*/

    TreeNode.prototype.resetText = function () {
        /// <summary>恢复最后一次编辑之前的文字</summary>
    
        this.text = this.textCell.getAttribute('text');
        if (this.textCell.firstChild.nodeType == 1 && this.textCell.firstChild.getAttribute('sign') == 'LINK') {
            this.textCell.firstChild.innerHTML = this.html;
        }
        else {
            this.textCell.innerHTML = this.html;
        }
    }



    /*
    2019.1.17 TreeNode.load 不确定还有没有用
    if (repopulate == true) {
        //从childNodes重新装配节点 -- 用于节点移动和复制
        this.__parseChildNodes('self');
    }
    else {
        //从配置获得节点
        if (this.__dataElement != null) { this.__parseChildNodes('text/xml', this.__dataElement); }

        //从dataSource加载数据
        if (this.dataSource != '' && !this.loaded) {
            // 如果div的子节点数为0或者不存在loading节点, 表明不是正在加载, 加载子节点
            if (this.__childrenElement.childNodes.length == 0 || this.__childrenElement.lastChild.getAttribute('sign') != 'LOADING') {
                this.treeView.__appendLoadingNode(this);

                TreeView.request(this.dataSource, null, this, '__getChildNodesFromDataSource');
            }
        }
    }

    // 如果dataSource为空 或者 是仅从现有节点重新装配
    if ((this.dataSource == '' || repopulate == true) && !this.loaded) {
        //当没有子节点时, 处理burl为blank
        if (this.childNodes.length == 0) { this.unburl(); }

        this.loading = false;
        this.loaded = true;
        //执行TreeNode事件
        TreeNode.__executeEvent(this, 'onLoaded');

    }*/

//事件不好使
    if (!this.treeView.execute('onNodeTextChanged', this)) {
        debugger;
        if (this.textCell.firstChild.nodeType == 1 && this.textCell.firstChild.getAttribute('sign') == 'LINK') {
            this.textCell.firstChild.innerHTML = this.textCell.getAttribute('text');            
        }
        else {
            this.textCell.innerHTML = this.textCell.getAttribute('text');
        }
    };  

/**********
	
TreeLeaf
	
**********/

class TreeLeaf {
    constructor(elementOrSettings) {
        this.sign = 'TEXT'; // TIP, ICON, EXPANDED_ICON, LEAF
        this.innerHTML = '';
    }
}