//-----------------------------------------------------------------------
// <TreeView> root.treeview.js
//-----------------------------------------------------------------------
// v7.0 Banyan
//-----------------------------------------------------------------------
// http://www.qross.cn
// Any problem, question, idea or bug, please email to wu@qross.io
//-----------------------------------------------------------------------
// Created at 2018/10/10 7:57

// Features
// Load-on-demand by JSON dataSource
// Powerful template and data mapping
// Unlimited levels
// Three-state checkBoxes
// Node-text-editing enabled
// Keyboard navigation and copy & paste enabled
// Drag & drop supported
// Internal node option buttons
// Node text & tip supports html
// Kinds properties, methods and events

// Customizable node properties for transferring data
// CSS style supported
// Customizable images (node, expand, collapse, loading)

/*
TreeView Tag Example

<treeview id= target='' showlines='' showburls='' checkBoxesVisible='yes/no' nodeEditingEnabled='' dragAndDropEnabled='' template="">
    <treenode name='' template='default'></treenode>    
    <template name="default">
        <treenode name=''></treenode>
        ...        
        <for var='name' in='@data' path="/">
            <if test=''>
                <treenode selectable=false icon-class='' template='name' icon='' tip='' text='' link='' target='' data='' path=''>
                    <icon class=''>
                        <span editable='yes' datatype='switch'></span>
                    </icon>
                    <text class=''>
                        <span editable='yes'></span>
                    </text>
                    <tip class=''>                    
                    <tip>
                    <gap class=""></gap>                    
                    <treenode/>
                    <treenode/>
                </treenode>
            <elsif test=''>
                <treenode></treenode>
            <else>
                ......
            </if>
        </for>
        ....
        <treenode/>
    </template>
    <editor name="" elements="" selector="" action="" post=""></editor> 其实放在哪都可以
    <editor></editor>
</treeview>

<optionbox display='selectbutton|checkbutton|right|follow|top'>
    <option of='#nodeName'></option>
    <separator of='name'/>
    <option of='name'></option>
<optionbox>

//$tree('abc').on('load', func).execute();
*/

class TreeView {

    constructor(elementOrSettings) {

        //保存所有内嵌模板元素
        this.templates = new Array();                

        $initialize(this)
        .with(elementOrSettings)
        .declare({
            //显示TreeView的元素ID
            name: 'TreeView_' + document.components.size,

            //节点文本链接的默认目标
            linkStyle: 'text|node',
            target: '',

            data: '',
            template: '$root', //root template

            imagesBaseUrl: $root.home + 'images/', //图片存放目录
            expandImageUrl: ['burl_0a.gif', 'burl_0b.gif'], //指示节点可以被展开的图标, 一般是一个+号
            collapseImageUrl: ['burl_1a.gif', 'burl_1b.gif'], //指标节点可以被闭合的图标, 一般是一个-号
            contentLoadingImageUrl: 'spinner.gif', //正在载入状态图标, 在展开load-on-demand节点时显示
            noExpandImageUrl: 'blank.gif',

            //定义鼠标划过或选择节点时的样式范围, 可选TEXT, ROW
            nodeCellStyle: 'text|row',
            nodeIndent: 16, //每级TreeNode的缩进距离
            nodePadding: 2, //节点内对象(如文本、图标)与节点外框之间的距离
            nodeSpacing: 0, //两个同级节点之间的间距
            childrenPadding: 0, //父节点与子节点之间的距离

            className: 'treeView-default-class', //TreeView样式
            nodeClass: 'treeNode-default-class', //普通状态下的节点样式
            nodeFrameClass: '',
            nodeTextClass: '',
            nodeHoverClass: 'treeNode-default-hover-class', //鼠标划过节点的默认样式
            selectedNodeClass: 'treeNode-default-selected-class', //被选择状态下的节点样式
            selectedNodeHoverClass: 'treeNode-default-selected-hover-class',
            editingBoxClass: '',
            nodeIconClass: '',
            expandedNodeIconClass: '',
            nodeTipClass: '', //节点提醒文字样式, 默认无
            nodeCapClass: '', //节点上方元素的样式
            nodeGapClass: '', //节点和其子点之间的空隙元素的样式
            nodeLipClass: '', //节点的子节点下方元素的样式
            cutNodeClass: '', //剪切或移动中的节点样式, 默认无, 透明度 50%
            dropChildClass: '', //当拖动的节点Hover到可放置节点时 可放置节点的样式
            dropTargetClass: '', //外部拖放目标的默认样式
            dropTargetHoverClass: '', //外部拖放目标鼠标划过样式

            burls: 'visible|hidden', //是否显示节点展开和闭合图标
            lines: 'hidden|visible', //是否显示分支线
            icons: 'hidden|visible', //是否显示节点图标
            checkBoxes: 'hidden|visible', //是否显示复选框

            expandOnSelect: true, //是否在选择节点时展开子节点
            collapseOnSelect: false, //是否在选择节点时关闭子节点

            nodeEditingEnabled: false, //是否可以编辑节点文本
            keyboardEnabled: true, //Navigate 启用键盘导航 → ← ↑ ↓ Enter Shift+E
            keyboardCutCopyPasteEnabled: false, //启用键盘编辑 Ctrl+C, Ctrl+X, Ctrl+V

            dragAndDropEnabled: false, //启用拖放
            dragNodeEnabled: true, //是否可以拖动节点
            dropSpacingEnabled: true, //是否可以拖放到节点和节点之间
            dropChildEnabled: true, //是否可以放置到其他节点中, false表示只排序
            dropRootEnabled: true, //是否可以放置为根节点, 默认true

            //1. 禁用拖放 dragAndDropEnabled="false"
            //2. 只能将节点拖放到外部元素上 dropSpacingEnabled="false" dropChildEnabled="false"
            //3. 只接收外部元素的拖放  dropSpacingEnabled="false" dragNodeEnabled="false"
            //4. 不可以将节点拖放为某一元素的子节点，仅同级排序 dropChildEnabled="false" dropSpacingEnabled="true"
            //5. 不可以将节点拖放到根节点下（即根节点的spacing中） dropRootEnabled="false"
            //拖放的目标是节点，节点可以被拖放到内部的节点位置或其他节点的子节点，也可以被拖放到外部
            //外部元素只能被拖放到节点上，$ 可以被拖放为cap, gap, lap 或其他            

            externalDropTargets: '', //从TreeView拖放到其他类型元素的selector

            expandDepth: 1, //默认展开的TreeNode深度, 1为根节点, 0为展开所有
            preloadDepth: 1, //默认加载的TreeNode深度, 1为根节点, 0为加载所有
            pathToSelect: '', //默认选择的项, 格式 n1.n2.n3
            pathsToCheck: [], //默认选中的项, 格式 n1.n2.n3,n1.n2.n4,...
        })
        .elementify(element => {
            this.element = element;            
            this.element.parentNode.insertBefore($create('DIV', { id: this.name, className: this.className }), this.element);
            this.container = this.element.previousElementSibling;
      
            //查找所有template和optionBox
            for (let i = element.childElementCount - 1; i >= 0; i--) {
                if (element.children[i].nodeName == 'TEMPLATE') {
                    let name = element.children[i].getAttribute('name');
                    if (name != null) {
                        //模板名字为空为默认根模板
                        this.templates[name] = element.children[i];
                        element.children[i].remove();
                    }                    
                }
                else if (element.children[i].nodeName == 'OPTIONBOX') {
                    //to be handle
                    element.children[i].remove();
                }
            }
            
            //剩下的元素就是根节点模板
            //指定了模板名字和未指定模板名字
            //有模板节点和没有模板节点
            let template = element.querySelector('template');
            if (template != null) {
                //处理空名template模板
                if (this.template != '' && this.templates[this.template] != null) {
                    //这种情况下这个空名模板无意义
                    this.templateObject = new Template(this.templates[this.template], this.container, this.name);
                    this.templateObject.extend(
                        element.innerHTML.takeBefore(/<template/i),
                        element.innerHTML.takeAfter(/<\/template>/i)
                    );

                    console.warn('The template element without name is redundant.');
                }
                else {
                    //还有未删除的template节点, 就是根节点模板。说明设置了根节点模板
                    template.setAttribute("name", "$root");
                    this.templates['$root'] = template;
                    this.templateObject = new Template(template, this.container, this.name);
                    this.templateObject.extend(
                        element.innerHTML.takeBefore(/<template/i),
                        element.innerHTML.takeAfter(/<\/template>/i)
                    );

                    if (this.template != '') {
                        console.warn('The template namme ' + this.template + ' is invalid.');
                    }
                }

                template.remove();

                //多个空名模板未处理
            }
            else {
                if (this.template != '' && this.templates[this.template] != null) {
                    this.templateObject = new Template(this.templates[this.template], this.container, this.name);
                    this.templateObject.extend(element.innerHTML);
                }
                else {
                    //没有设置根节点模板, 当前所有内容都默认是根节点模板
                    this.templates['$root'] = element
                    this.templateObject = new Template(element, this.container, this.name);

                    if (this.template != '$root' && this.template != '') {
                        console.warn('The template namme ' + this.template + ' is invalid.');
                    }
                }
            }            

            element.remove();
        })
        .objectify(object => {
            for (let key in object) {
                if (this[key] !== undefined) {
                    this[key] = object[key];
                }    
            }            

            //用对象声明TreeView会有很多问题, 不建议使用
            //有可能当数据结构用
        });
     
        /// <value type="Array" elementType="TreeNode">所有根节点的集合</value>
        this.children = new Array();
    }
}

$tree = function(name) {
    let tree = $t(name);
    if (tree != null && tree.tagName == 'TREEVIEW') {
        return tree;
    }
    else {
        return null;
    }
}

//保存配置信息的元素
TreeView.prototype.element = null;
//显示内容的容器元素
TreeView.prototype.container = null;
//Template 模板对象
TreeView.prototype.templateObject = null;

//TreeView.prototype.children = [];
/// <value type="TreeNode">第一个根节点</value>
TreeView.prototype.firstChild = null;
/// <value type="TreeNode">最后一个根节点</value>
TreeView.prototype.lastChild = null;

/// <value type="Boolean">标识TreeView是否已经被加载</value>
TreeView.prototype.loaded = false;

/// <value type="TreeNode">选择的节点项</value>
TreeView.prototype.selectedNodes = null;

/// <value type="TreeView.OptionBox">节点选项组</value>
TreeView.prototype.optionBox = null;

/// <value type="Array" elementType="TreeNode">在TreeView.getCheckedNodes, TreeNode.prototype.$getCheckedNodes方法中使用的临时变量</value>
TreeView.prototype.$checkedNodes = null;

/// <value type="TreeNode">正在编辑的节点</value>
TreeView.prototype.$editingNode = null;

//加载之前触发
TreeView.prototype.onBeforeLoad = function() { }

//重新加载之前触发
TreeView.prototype.onBeforeReload = function() { }

//加载完成后触发
TreeView.prototype.onLoaded = function () { };

//每次重新加载之后触发
TreeView.prototype.onReloaded = function() { }

//每次加载完成之后触发但不包含lazyLoad
TreeView.prototype.onEveryLoaded = function() { }

//每次增量加载之后触发
TreeView.prototype.onLazyLoaded = function() { }

// 节点展开后触发 - expandedNode 刚刚被展开的节点
TreeView.prototype.onNodeExpanded = function (expandedNode) { };

// 节点关闭后触发 colapsedNode 刚刚被闭合的节点
TreeView.prototype.onNodeCollapsed = function (colapsedNode) { };

// 每次节点加载完之后触发 loadedNode 刚刚加载完数据的节点 data 加载返回的数据
TreeView.prototype.onNodeLoaded = function(loadedNode, data) { };

// 当鼠标划过节点时触发 hoverNode鼠标划过的那个节点, 支持return
TreeView.prototype.onNodeHover = function (hoverNode) { };

// 节点图标被点击时触发  clickedNode被点击的那个节点
TreeView.prototype.onNodeIconClick = function(clickedNode) { };

/// <summary type="Function">当选择节点改变后触发</summary>
/// <param name="selectedNode" type="TreeNode">刚刚被选择的那个节点</param>
TreeView.prototype.onNodeSelected = function (selectedNode) { };

// 当选中的节点被再次点击时触发
TreeView.prototype.onSelectedNodeClick = function (selectedNode) { };

/// <summary type="Function">当某个节点选中状态改变后触发</summary>
/// <param name="node" type="TreeNode">选中状态变化的那个节点</param>
TreeView.prototype.onNodeCheckChanged = function (node) { };

/// <summary type="Function">当某个节点开始编辑时触发</summary>
/// <param name="node" type="TreeNode">正在编辑的那个节点</param>
TreeView.prototype.onNodeEdit = function (editingNode) { };

/// <summary type="Funciton">节点文本更改后触发</summary>
/// <param name="editedNode" type="TreeNode">被编辑的节点</param>
TreeView.prototype.onNodeTextChanged = function (editedNode) { };

/// <summary type="Function">节点被复制后触发 - 键盘事件</summary>
/// <param name="copiedNode" type="TreeNode">被拷贝的节点</param>
TreeView.prototype.onNodeCopied = function (copiedNode) { };

/// <summary type="Function">节点被移动后触发 - 键盘事件</summary>
/// <param name="copiedNode" type="TreeNode">被移动的节点</param>
TreeView.prototype.onNodeMoved = function (movedNode) { };

/// <summary type="Function">节点开始被拖拽时触发</summary>
/// <param name="droppingNode" type="TreeNode">被拖拽的节点</param>
TreeView.prototype.onNodeDragStart = function (draggedNode) { };

/// <summary type="Function">节点结束被拖拽时触发</summary>
/// <param name="droppingNode" type="TreeNode">被拖拽的节点</param>
TreeView.prototype.onNodeDragEnd = function (draggedNode) { };

/// <summary type="Function">节点拖放到其他节点上时触发</summary>
/// <param name="droppingNode" type="TreeNode">拖放划过的节点</param>
TreeView.prototype.onNodeDragOver = function (droppingNode) { };

/// <summary type="Function">节点被拖放后触发 - 鼠标事件</summary>
/// <param name="droppedNode" type="TreeNode">被拖放的节点</param>
TreeView.prototype.onNodeDropped = function (droppedNode) { };

//节点被拖放到外部元素时，拖动进入目标元素时触发, target目标元素
TreeView.prototype.onNodeExternalDragOver = function (target) {};

//节点被拖放到外部元素时，拖动离开目标元素时触发, target目标元素
TreeView.prototype.onNodeExternalDragLeave = function (target) {};

//节点被拖放到外部元素后触发 (可通过this.selectedNode得到被拖放的节点), target接受拖放的元素
TreeView.prototype.onNodeExternalDropped = function (target) { };

//外部元素拖动到节点后触发， overNode 正在拖放划过的节点
TreeView.prototype.onExternalElementDragOver = function (overNode) { };

//外部元素拖放到节点后触发， droppedNode 接受拖放的节点
TreeView.prototype.onExternalElementDropped = function (droppedNode) { };

/// <summary type="Funciton">点击节点上的链接时触发, "javascript:"类不算链接</summary>	
/// <param name="node" type="TreeNode">目标节点</summary>	
TreeView.prototype.onNodeNavigate = function (node) { };

/// <summary type="Funciton">显示节点选项盒之前触发</summary>	
/// <param name="node" type="TreeNode">目标节点</summary>	
TreeView.prototype.onOptionBoxShow = function (node) { };

/// <summary type="Funciton">点击节点选项时触发</summary>
/// <param name="item" type="TreeViewNodeOption">目标菜单项</summary>
TreeView.prototype.onNodeOptionClick = function (item) { };

/// <summary type="Funciton">在节点上删除前触发</summary>	
/// <param name="node" type="TreeNode">目标节点</summary>	
TreeView.prototype.onNodeRemove = function (node) { };

TreeView.prototype.enable = function () {
    /// <summary>启用TreeView</summary>
    //用一个mask实现
}

TreeView.prototype.disable = function () {
    /// <summary>禁用TreeView</summary>    
}

TreeView.prototype.hasChildNodes = function() {
    if (this.loaded) {
        return this.children.length > 0;
    }
    else {
        return (this.data != '' || this.templateObject.nonEmpty());
    }
}

TreeView.prototype.$renderChild = function(child, ref) {
    if (ref != null) {
        if (child.capDiv != null) {
            this.container.insertBefore(child.capDiv, ref);
        }
        this.container.insertBefore(child.primeDiv, ref);
        if (child.gapDiv != null) {
            this.container.insertBefore(child.gapDiv, ref);
        }
        this.container.insertBefore(child.childrenDiv, ref);
        if (child.lapDiv != null) {
            this.container.insertBefore(child.lapDiv, ref);
        }
    }
    else {
        if (child.capDiv != null) {
            this.container.appendChild(child.gapDiv);
        }
        this.container.appendChild(child.primeDiv);
        if (child.gapDiv != null) {
            this.container.appendChild(child.gapDiv);
        }
        this.container.appendChild(child.childrenDiv);
        if (child.lapDiv != null) {
            this.container.appendChild(child.lapDiv);
        }
    }
}

TreeView.prototype.appendChild = function (treeNode, editing) {
    /// <summary>添加根节点</summary>
    
    //parentNode
    treeNode.parentNode = null;
    //treeView
    treeNode.treeView = this;
    //depth
    treeNode.depth = 1;
    //path
    treeNode.path = treeNode.name;
    //checked

    let length = this.children.length;

    //index
    treeNode.index = length;

    // children
    this.children.push(treeNode);

    // render
    this.children[length].populate();

    //element不为空表示从节点生成
    if (this.children[length].element != null) {
        this.$renderChild(this.children[length], this.children[length].element);
    }
    else {
        if (length > 0 && this.container.lastElementChild.getAttribute('sign') == 'SPACING') {
            this.$renderChild(this.children[length], this.container.lastElementChild);            
        }
        else {
            this.$renderChild(this.children[length]);
        }
    }    

    //添加动画
    if (this.children[length].primeDiv.classList != null) {
        this.children[length].primeDiv.classList.add('treeNode-fade-in');
        if (this.children[length].gapDiv != null) {
            this.children[length].gapDiv.classList.add('treeNode-fade-in');
        }
    }    

    // firstChild & lastChild
    if (length == 0) { this.firstChild = this.children[length]; }
    this.lastChild = this.children[length];

    //previousSibling & nextSibling
    if (length > 0) {
        this.children[length].previousSibling = this.children[length - 1];
        this.children[length - 1].nextSibling = this.children[length];
        this.children[length].nextSibling = null;
    }

    //启用dragAndDrop 或者 spacing大于0并且lines == 'VISIBLE'时, 创建分隔DIV
    if ((this.dragAndDropEnabled && this.dropSpacingEnabled) || (this.children[length].spacing > 0 && this.lines == 'VISIBLE')) {
        //before
        let divB = $create('DIV', { }, 
                    { height: this.children[length].spacing + 'px' }, 
                    { 
                        'sign' : 'SPACING',
                        'parent': '',
                        'prev': (length == 0 ? '' : this.children[length - 1].name),
                        'next': this.children[length].name 
                    });
        this.container.insertBefore(divB, this.children[length].primeDiv);
        if (length > 0) {
            this.children[length].childrenDiv.nextSibling.setAttribute('prev', this.children[length].name);
        }

        if (this.lines == 'VISIBLE' && this.children[length].spacing > 0) {
            divB.appendChild(TreeView.$populateLinesSpacing(this.children[length]));
        }

        if (this.dragAndDropEnabled && this.dropSpacingEnabled) {
            divB.appendChild(TreeView.$populateDropLine(this.children[0]));
        }

        if (length == 0) {
            //after
            let divA = $create('DIV', { }, 
                            { height: this.children[0].spacing + 'px' },
                            { 
                                'sign': 'SPACING',
                                'parent': '',
                                'prev': this.children[0].name,
                                'next': '' 
                            });
            this.container.appendChild(divA);

            //lines == 'VISIBLE' - no lines at last line

            if (this.dragAndDropEnabled && this.dropSpacingEnabled) {
                divA.appendChild(TreeView.$populateDropLine(this.children[0]));
            }
        }       
    }

    //setLines
    this.children[length].$setLines();

    if (editing != null) {
        treeNode.edit();
    }
};

//在最前面插入节点
TreeView.prototype.insertFront = function(treeNode) {
    if (this.firstChild != null) {
        this.insertBefore(treeNode, this.firstChild);            
    }
    else {
        this.appendChild(treeNode);
    }
}

TreeView.prototype.insertBefore = function (treeNode, referenceNode) {
    /// <summary>在referenceNode之前插入根节点</summary>
    /// <param name="treeNode" type="TreeNode">要添加的节点</param>
    /// <param name="referenceNode" type="TreeNode">参考节点</param>

    //parentNode
    treeNode.parentNode = null;
    //treeView
    treeNode.treeView = this;
    //depth
    treeNode.depth = 1;
    //path
    treeNode.path = treeNode.name;

    let index = referenceNode.index;

    // children
    this.children.splice(index, 0, treeNode);

    // render	
    this.children[index].populate();
    if (referenceNode.primeDiv.previousSibling != null && referenceNode.primeDiv.previousSibling.nodeType == 1 && referenceNode.element.previousSibling.getAttribute('sign') == 'SPACING') {
        this.container.insertBefore(this.children[index].primeDiv, referenceNode.primeDiv.previousSibling);
        this.container.insertBefore(this.children[index].childrenDiv, referenceNode.primeDiv.previousSibling);
    }
    else {
        this.container.insertBefore(this.children[index].primeDiv, referenceNode.primeDiv);
        this.container.insertBefore(this.children[index].childrenDiv, referenceNode.primeDiv);
    }

    // index
    for (let i = index; i < this.children.length; i++) {
        this.children[i].index = i;
    }

    // firstChild
    if (index == 0) { this.firstChild = this.children[0]; }

    //previousSibling & nextSibling
    let previousNode = referenceNode.previousSibling;
    this.children[index].previousSibling = previousNode;
    if (previousNode != null) previousNode.nextSibling = this.children[index];
    this.children[index].nextSibling = referenceNode;
    referenceNode.previousSibling = this.children[index];

    //启用dragAndDrop 或者 spacing大于0并且lines == 'VISIBLE'时, 创建分隔DIV
    if (this.dragAndDropEnabled || (this.children[index].spacing > 0 && this.lines == 'VISIBLE')) {
        //before 在节点之前添加间隔
        let divB = $create('DIV', { }, { height: this.children[length].spacing + 'px' }, 
        {
            'sign' : 'spacing', 
            'parent': '', 
            'prev': (index > 0 ? this.children[index - 1].name : ''),
            'next': this.children[index].name
        });
        this.element.insertBefore(divB, this.children[index].element);
        //更新下方spacing的prev
        this.children[index].childrenDiv.nextSibling.setAttribute('prev', this.children[index].name);

        if (this.lines == 'VISIBLE' && this.children[index].spacing > 0) {
            divB.appendChild(TreeView.$populateLinesSpacing(this.children[index]));
        }

        if (this.dragAndDropEnabled && this.dropSpacingEnabled) {
            //添加dropLine
            divB.appendChild(TreeView.$populateDropLine(this.children[index]));
        }
    }

    this.children[index].$setLines();
};

TreeView.prototype.insertAfter = function (treeNode, referenceNode) {
    if (referenceNode.nextSibling != null) {
        this.insertBefore(treeNode, referenceNode.nextSibling);
    }
    else {
        this.appendChild(treeNode);
    }
}

TreeView.prototype.removeChild = function (treeNode) {
    /// <summary>删除根节点</summary>
    /// <param name="treeNode" type="TreeNode">要删除的节点</param>

    let index = treeNode.index;

    if ((this.dragAndDropEnabled && this.dropSpacingEnabled) || (this.children[index].spacing > 0 && this.lines == 'VISIBLE')) {
        if (this.children.length == 1) {
            //删除下方的spacing
            this.container.removeChild(this.children[index].childrenDiv.nextSibling);
        }
        else if (this.children.length >= 1) {
            //节点的下方spacing的prev变为上一个节点的name
            this.children[index].childrenDiv.nextSibling.setAttribute('prev', (index > 0 ? this.children[index - 1].name : ''));
        }

        //删除上方的spacing
        this.container.removeChild(this.children[index].primeDiv.previousSibling);
    }

    //删除节点元素
    this.container.removeChild(treeNode.primeDiv);
    this.container.removeChild(treeNode.childrenDiv);

    //从子节点集合中删除节点
    this.children.splice(index, 1);

    //index
    for (let i = index; i < this.children.length; i++) {
        this.children[i].index = i;
    }

    // firstChild, lastChild, nextSibling, previousSibling
    if (this.children.length == 0) {
        //一项不剩下
        this.firstChild = null;
        this.lastChild = null;

        //留下一个虚节点, 可以从其他树形中拖入节点
        if (this.dragAndDropEnabled && this.dropChildEnabled && this.loaded) {

            let div = $create('DIV', { id: this.name + '_VoidNode', innerHTML: '&nbsp;' }, { width: 'inherit', height: '32px', backgroundColor: 'transparent' });
            div.ondragover = function (ev) {
                this.style.boxShadow = '1px 2px 6px #CCCCCC';
                this.style.border = '';
                this.style.borderRadius = '3px';

                ev.preventDefault();
            }
            div.ondragleave = function (ev) {
                this.style.boxShadow = '';
                this.style.border = '';
            }
            let treeView = this;
            div.ondrop = function (ev) {
                let originalNode = TreeView.clipBoard.treeNode;
                //let oTreeView = originalNode.treeView;

                //克隆节点
                let node = originalNode.clone();

                //处理原节点
                if (TreeView.clipBoard.action == 'DRAGMOVE') {
                    //删除原节点
                    originalNode.remove(false);
                }

                //取消选择
                //originalNode.deselect(false);

                //添加节点
                treeView.appendChild(node);

                //选择
                node = treeView.lastChild;
                node.select(false);

                //执行事件
                if (TreeView.clipBoard.action == 'DRAGMOVE') {
                    treeView.execute('onNodeMoved', node);
                }
                else if (TreeView.clipBoard.action == 'DRAGCOPY') {
                    treeView.execute('onNodeCopied', node);
                }
                //拖放到根目录
                treeView.execute('onNodeDropped', node);

                //移除这个占位元素
                treeView.element.removeChild(this);

                ev.preventDefault();
                ev.stopPropagation();

                //拖放正常结束
                treeView.execute('onNodeDragEnd', node);
            }
            this.container.appendChild(div);
        }
    }
    else if (this.children.length == 1) {
        //只剩下一项
        this.firstChild = this.children[0];
        this.lastChild = this.children[0];
        this.children[0].previousSibling = null;
        this.children[0].nextSibling = null;
    }
    else {
        if (index == 0) {
            //是第一项
            this.firstChild = this.children[0];
            this.children[0].previousSibling = null;
        }
        else if (index == this.children.length) {
            //是最后一项
            this.lastChild = this.children[index - 1];
            this.children[index - 1].nextSibling = null;
        }
        else {
            //在中间
            this.children[index].previousSibling = this.children[index - 1];
            this.children[index - 1].nextSibling = this.children[index];
        }
    }

    if (this.children.length > 0 && index == this.children.length) {
        this.lastChild.$setLines();
    }
};

TreeView.prototype.removeAll = function () {
    /// <summary>删除所有根节点</summary>

    if (this.selectedNode != null) {
        this.selectedNode.deselect();
    }

    //清除子节点
    this.children.length = 0;

    //删除元素节点
    for (let i = this.element.children.length - 1; i >= 0; i--) {
        //只移除DIV元素, SPAN元素为节点配置
        if (this.element.children[i].nodeName == 'DIV' && (this.element.children[i].getAttribute('sign') == 'ROW' || this.element.children[i].getAttribute('sign') == 'CHILDREN' || this.element.children[i].getAttribute('sign') == 'SPACING')) {
            this.element.removeChild(this.element.children[i]);
        }
    }
    //firstChild & lastChild
    this.firstChild = null;
    this.lastChild = null;
}

TreeView.prototype.apply = function(container) {
    this.container = container;
}

TreeView.prototype.load = function() {

    if (this.container == null) {
        throw new Error("Must speciefy a DIV element to contains TreeView's content.");
    }

    //初始化模板
    if (!this.loaded) {
        this.templateObject
            //owner, ownerElement
            .of(this, this.element)
            .load(this.data)
            .on('lazyload', function() {
                this.owner.$populateChildren();
                this.owner.execute('onLazyLoaded');
            })
    }

    //如果已经加载则不再执行beforeLoad事件
    if (this.loaded ? true : this.execute('onBeforeLoad')) {

        //添加"加载中"节点
        this.$appendLoadingNode();
    
        this.templateObject
            .of(this, this.element)
            .setPage(0)            
            .append(function() {
                //移除"加载中"节点
                this.$removeLoadingNode();
                
                this.$populateChildren();

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
            });
    }
}

TreeView.prototype.reload = function () {
    /// <summary>从dataElement和dataSource重新加载所有节点</summary>

    if (this.execute('onBeforeReload')) {
        //删除所有节点
        this.removeAll();
        //重置done属性
        this.template.done = false;

        //删除optionBox元素
        if (this.optionBox != null) {
            this.container.removeChild(this.optionBox.element);
        }

        this.load();
    }    
}

TreeView.prototype.expandAll = function () {
    /// <summary>展开所有</summary>
    for (let i = 0; i < this.children.length; i++) {
        this.children[i].$expandAll();
    }
};

TreeView.prototype.expandAllNodeByNode = function () {
    /// <summary>一个节点一个节点展开所有</summary>
    if (this.firstChild != null) { this.firstChild.$expandNodeByNode(); }
}

TreeView.prototype.collapseAll = function () {
    /// <summary>关闭所有</summary>
    if (this.firstChild != null) { this.firstChild.$collapseAll(); }
};

TreeView.prototype.loadAll = function () {
    /// <summary>加载所有</summary>
    for (let i = 0; i < this.children.length; i++) {
        this.children[i].$loadAll();
    }
};

TreeView.prototype.loadAllNodeByNode = function () {
    /// <summary>一个节点一个节点加载所有</summary>
    if (this.firstChild != null) { this.firstChild.$loadNodeByNode(); }
};

TreeView.prototype.checkAll = function () {
    /// <summary>选中所有</summary>

    if (this.checkBoxes == 'VISIBLE') {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].checked != 1) this.children[i].check(false);
        }
    }
    // else if (this.checkBoxesVisible == 'SINGLE') {
    //     for (let i = 0; i < this.children.length; i++) {
    //         if (this.children[i].checked == 0) { this.children[i].check(false); }
    //         if (this.children[i].hasChildNodes && this.children[i].loaded) { this.children[i].$checkAll(); }
    //     }
    // }
};

TreeView.prototype.uncheckAll = function () {
    /// <summary>取消选中所有</summary>
    if (this.checkBoxes == 'VISIBLE') {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].checked != 0) { this.children[i].uncheck(false); }
        }
    }
    // else if (this.checkBoxesVisible == 'SINGLE') {
    //     for (let i = 0; i < this.children.length; i++) {
    //         if (this.children[i].checked == 1) { this.children[i].uncheck(false); }
    //         if (this.children[i].hasChildNodes && this.children[i].loaded) { this.children[i].$uncheckAll(); }
    //     }
    // }
};

TreeView.prototype.expandTo = function (depth) {
    /// <summary>展开节点到指定的深度</summary>
    /// <param name="depth" type="integer">展开到指定的深度</param>
    if (depth > 1) {
        if (this.firstChild != null) {
            this.firstChild.$expandTo(depth); 
        }
    }
    else if (depth == 0) {
        //展开所有
        this.expandAllNodeByNode();
    }
    else if (!this.loaded) { 
        this.preloadTo(this.preloadDepth);         
    }
}

TreeView.prototype.preloadTo = function (depth) {
    /// <summary>预加载节点到指定的深度</summary>
    /// <param name="depth" type="integer">预加载到指定的深度</param>

    if (depth > 1) {
        if (this.firstChild != null) {
            this.firstChild.$preloadTo(depth);
        }
    }
    else if (depth == 0) {
        //加载所有
        this.loadAllNodeByNode();
    }
    else {
        if (!this.loaded) {
            this.selectNodeByPath(this.pathToSelect);
        }
    }
}

TreeView.prototype.selectNodeByPath = function (path) {
    /// <summary>根据路径选择一个节点</summary>
    /// <param name="path" type="String">节点完整路径</param>

    let names = path.split('.');
    let index = -1;
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    let finished = true;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.children[index].loaded) {
                if (!this.children[index].expanded) { this.children[index].expand(false); }
                this.children[index].$selectNodeByPath(names);
            }
            else {
                this.children[index].bind('onExpanded', function () { this.$selectNodeByPath(names); });
                this.children[index].expand(false);
            }
            finished = false;
        }
        else {
            //在这个方法里默认不触发事件
            this.children[index].select(false);
        }
    }

    if (finished) {
        if (!this.loaded) { this.checkNodesByPaths(this.pathsToCheck); }
    }
}

TreeView.prototype.checkNodesByPaths = function (paths) {
    /// <summary>根据paths集合选中节点</summary>
    /// <param name="paths" type="Array" elementType="String">path数组, 格式['1.2', '1.3.4', ...]</param>

    if (typeof (paths) == 'string') paths = paths.split(',');

    if (this.checkBoxesVisible != 'NONE' && paths.length > 0) {
        this.$checkNodeByPath(paths, paths[0]);
    }
    else {
        if (!this.loaded) { this.$completeLoading(); }
    }
}

TreeView.prototype.getNodeByName = function (nodeName) {
    /// <summary>根据name获得节点, 要求节点已经被载入, 否则返回null</summary
    let primeDiv = $s(nodeName.startsWith('#') ? nodeName : '#' + nodeName);
    if (primeDiv != null) {
        
        let node = null;
        let parentNode = this;
        let names = primeDiv.getAttribute('path').split('.');

        while (names.length > 0) {
            for (let i = 0; i < parentNode.children.length; i++) {
                if (parentNode.children[i].name == names[0]) {
                    node = parentNode.children[i];
                    parentNode = parentNode.children[i];
                    break;
                }
            }
            names.splice(0, 1);
        }
        
        return node;
    }
    else {
        return null;
    }
}

TreeView.prototype.$node = function(nodeName) {
    return this.getNodeByName(nodeName);
}

TreeView.prototype.getCheckedNodes = function () {
    /// <summary>得到所有被checked的节点</summary>

    if (this.checkBoxesVisible != 'NONE') {
        this.$checkedNodes = [];
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].checked == 1) {
                this.$checkedNodes.push(this.children[i]);
            }
            if (this.children[i].checked == 2 || this.checkBoxesVisible == 'SINGLE') {
                this.children[i].$getCheckedNodes();
            }
        }
        return this.$checkedNodes;
    }
    else {
        return null;
    }
}

TreeView.prototype.$appendLoadingNode = function (parentNode) {
    /// <summary>获得"正在载入..."节点</summary>

    let loading = new TreeNode({
        name: 'loading__',
        text: 'Loading...',
        icon: this.contentLoadingImageUrl,
        draggable: false,
        droppable: false
    });

    if (parentNode == null) {
        this.appendChild(loading);
    }
    else {
        parentNode.appendChild(loading);
    }
}

TreeView.prototype.$removeLoadingNode = function (parentNode) {
    /// <summary>移除"正在载入..."节点</summary>
    // (parentNode == null ? this.container : parentNode.childrenDiv)
    //     .querySelectorAll('div[name=loading__],div[for=loading__]')
    //     .forEach(loading => loading.remove());

    if (parentNode == null) {
        parentNode = this;
    }

    for (let i = parentNode.children.length - 1; i >= 0; i--) {
        if (parentNode.children[i].name == 'loading__') {
            parentNode.removeChild(parentNode.children[i]);
        }
    }
}

TreeView.prototype.$completeLoading = function () {
    /// <summary>完成load, 触发onLoaded事件</summary>
    Model.initializeForOrIf('TREEVIEW.LOADED');
    if (!this.loaded) {
        this.loaded = true;
        this.execute('onLoaded');

        //第一次加载初始化拖拽相关对象
        if (this.dragAndDropEnabled) {
            // 从一个dropLine左右侧来回移动有时不会重置dropLine, 在TreeView上添加此事件是为了还原曾经激活的dropLine
            if (this.dropSpacingEnabled) {
                this.container.ondragleave = function () { TreeView.__restoreDropLine(); }
            }            
    
            let treeView = this;
            // 可以将节点拖放到外部对象, 不移除被拖放的节点
            if (this.externalDropTargets != '') {
                $a(this.externalDropTargets).forEach(target => {
                    target.ondragover = function (ev) {
                        if (treeView.execute('onNodeExternalDragOver')) {
                            this.className = treeView.dropTargetHoverClass;
                            ev.preventDefault(); 
                        }                        
                    };
                    target.ondragleave = function (ev) {
                        this.className = treeView.dropTargetClass;
                        ev.preventDefault(); 
                        treeView.execute('onNodeExternalDragLeave');
                    }
                    target.ondrop = function (ev) {
                            //向外部拖放完成
                            treeView.execute('onNodeExternalDropped', this);
                            //正常拖放结束
                            treeView.execute('onNodeDragEnd', treeView.selectedNode);
                            ev.preventDefault();
                            ev.stopPropagation();
                        };
                });                
            }
        }
    }
    else {
        this.execute('onReloaded');
    }
    this.execute('onEveryloaded');
}

TreeView.prototype.$populateChildren = function() {
    //装配根节点
    let treeNodes = [];
    for (let child of this.container.children) {
        if (child.nodeName == 'TREENODE') {
            treeNodes.push(child);
        }     
    }

    for (let treeNode of treeNodes) {
        this.appendChild(new TreeNode(treeNode));
        treeNode.remove();
    }
}

TreeView.prototype.$checkNodeByPath = function (paths, path) {
    /// <summary>根据path选中项</summary>
    /// <param name="paths" type="Array" elementType="string">path数组</param>
    /// <param name="path" type="String">单个path</param>

    let names = path.split('.');
    let index = -1;
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    let finished = false;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.children[index].loaded) {
                this.children[index].$checkNodeByPath(paths, names);
            }
            else {
                this.children[index].bind('onExpanded',
                    function () {
                        this.$checkNodeByPath(paths, names);
                    }
                );
                this.children[index].expand(false);
            }
        }
        else {
            //在这个方法里默认不触发事件
            this.children[index].check(false);

            //查找下一个节点
            paths.splice(0, 1);
            if (paths.length > 0) {
                this.$checkNodeByPath(paths, paths[0]);
            }
            else {
                finished = true;
            }
        }
    }

    if (finished) {
        if (!this.loaded) {
            this.$completeLoading();
        }
    }
}


/**********
	
TreeNode 树形节点
	
**********/

class TreeNode {
    /// <summary>构造函数</summary>
    constructor (elementOrSettngs) {

        /// <value type="Array" elementType="String">属性数组, 用于初始化节点, 使用getAttribute和setAttribute方法设置和更新</value>
        this.attributes = new Object(); 
        
        $initialize(this)
        .with(elementOrSettngs)
        .burnAfterReading()
        .declare({
            $name: TreeNode.$parseName(), //节点的唯一标识, 传递节点引用
            $text: 'html', //节点的文本，支持HTML
            $tip: 'html', //提醒文字, 显示在文本之后, 支持Html            
            $icon: 'html', //节点的默认图标
            $expandedIcon: 'html', //节点展开时的图标
            cap: 'html',
            gap: 'html',
            lap: 'html',
            value: '', //节点的值
            $title: '', //节点的注释, 鼠标划过节点时显示
            $tipTitle: 'tip[title]',
            $link: '', //鼠标点击节点时的链接路径
            linkStyle: '', //链接样式: text 在文本上包围 a 标签, node 点击 node 跳转
            target: '', //节点默认链接目标

            data: '', //子节点数据源
            template: '', //template name

            indent: -1, //缩进, -1表示从TreeView继承
            padding: -1, //节点内间距, -1表示从TreeView继承
            spacing: -1, //同级节点之间的距离, -1表示从TreeView继承
            childrenPadding: -1, // 与子节点之间的距离, -1表示从TreeView继承

            className: '',  //节点的默认样式, 默认从TreeView继承
            frameClass: '', //节点的框架样式, 默认从TreeView继承
            textClass: 'css', //文本部分的样式, 默认从TreeView继承
            hoverClass: '', //划过节点样式，默认从TreeView继承
            selectedClass: '', //节点选择时样式, 默认从TreeView继承
            selectedHoverClass: '', //节点选择时鼠标划过样式，默认从TreeView继承
            editingBoxClass: '', //编辑状态下的文本框样式, 默认从TreeView继承
            iconClass: 'css', //节点icon样式, 默认从TreeView继承
            expandedIconClass: 'css', //节点icon展开时样式, 默认从TreeView继承
            $tipClass: 'css', //节点tip样式, 默认从TreeView继承
            capClass: 'css',
            gapClass: 'css', //节点gap样式, 默认从TreeView继承
            lapClass: 'css',
            cutClass: '', //节点被剪切时的样式, 默认从TreeView继承
            dropClass: '', //有节点被拖放到当前节点时的样式, 默认从TreeView继承

            selectable: true, //是否可以被选中
            $draggable: true, //是否可以被拖动, TreeView.dragAndDropEnabled启用时生效
            droppable: true, //是否可以把拖动的节点放置为其子节点, TreeView.dragAndDropEnabled启用时生效
            editable: true, //节点是否可编辑, TreeView.nodeEditingEnabled启用时生效
            $visible: true, //节点是否可见

            expandOnRender: false, //是否在呈现时展开

            $selected: false, //是否默认选择
            $checked: 0 //是否默认选中, 当显示复选框时生效, 0 未选中 1 选中 2 部分子节点被选中
        })
        .elementify(function(element) {
            //删除支持HTML的配置节点
            for (let i = element.childElementCount - 1; i >=0; i--) {
                if (/(text|icon|expandedicon|tip|cap|gap|lap)/i.test(element.children[i].nodeName)) {
                    element.children[i].remove();
                }
            }
            //保存自定义属性
            element.removeAttribute('id');
            element.getAttributeNames().forEach(attr => {
                this.attributes[attr] = element.getAttribute(attr);
            });
            
            this.element = element;
        })
        .objectify(function(object) {
            //自定义属性
            for (let key in object) {
                if (this[key] !== undefined) {
                    this[key] = object[key];
                }
                else {
                    this.attributes[key] = object[key];
                }
            }
        });

        this.leaves = new Array();

        /// <value type="Array" elementType="TreeNode">获取当前节点子节点的集合</value>
        this.children = new Array();
        /// <value type="TreeView">指定TreeNode所属的TreeView</value>
        this.$treeView = null;
    }

    get treeView() {
        return this.$treeView;
    }

    set treeView(treeView) {
        this.$treeView = treeView;
        //inherits: treeNode property -> treeView property
        for (let pair of Object.entries({
            indent: 'nodeIndent',
            padding: 'nodePadding',
            spacing: 'nodeSpacing',
            childrenPadding: 'childrenPadding',

            className: 'nodeClass',
            frameClass: 'nodeFrameClass',
            textClass: 'nodeTextClass',
            hoverClass: 'nodeHoverClass',
            selectedClass: 'selectedNodeClass',
            selectedHoverClass: 'selectedNodeHoverClass',
            editingBoxClass: 'editingBoxClass',
            iconClass: 'nodeIconClass',
            expandedIconClass: 'expandedNodeIconClass',
            tipClass: 'nodeTipClass',
            capClass: 'nodeCapClass',
            gapClass: 'nodeGapClass',
            lapClass: 'nodeLapClass',
            cutClass: 'cutNodeClass',
            dropClass: 'dropChildClass',
            linkStyle: 'linkStyle',
            target: 'target'
        })) {
            //0 == '' true
            if (this[pair[0]] == null || this[pair[0]] === '' || this[pair[0]] == -1) {
                this[pair[0]] = this.treeView[pair[1]];
            }
        }
    }

    get name() {
        return this.$name;
    }

    set name(name) {        
        name = $s('#' + name) == null ? name : TreeNode.$parseName();
        this.$name = name;
        this.primeDiv.id = name;
        this.primeDiv.setAttribute('name', name);
    }

    get text() {
        return this.$text;
    }

    set text(text) {
        this.$text = text;        
        if (this.textCell.firstElementChild != null && this.textCell.firstElementChild.nodeType == 1 && this.textCell.firstElementChild.getAttribute('sign') == 'LINK') {
            this.textCell.firstElementChild.innerHTML = this.text;
        }
        else {
            this.textCell.innerHTML = this.text;
        }
    }

    get title() {
        return this.$title;
    }

    set title(title) {
        this.$title = title;
        this.textCell.title = title;
    }

    get link() {
        return this.$link;
    }

    set link(link) {
        this.$link = link;
        if (this.linkElement != null) {
            this.linkElement.href = link;
        }
        else {
            let treeNode = this;
            let a = $create('A', { 
                href: this.$link, 
                target: this.target, 
                innerHTML: this.text,
                onclick: function () {
                    if (this.href != '' && !this.href.includes('javascript:')) {
                        treeNode.treeView.execute('onNodeNavigate', treeNode);
                    }
                } 
            }, { }, { 'sign': 'LINK' });                
            this.textCell.innerHTML = '';
            this.textCell.appendChild(a);
            if (!this.textCell.draggable) {
                a.draggable = false;
            }
            this.linkElement = a;
        }
    }

    get tip() {        
        return this.$tip;
    }

    set tip(tip) {
        this.$tip = tip;
        if (this.tipCell == null) {
            let td = $create('TD', { className: this.tipClass, innerHTML: '&nbsp;' }, { cursor: 'default', whiteSpace: 'nowrap' }, { 'sign': 'TIP' });
            if (this.textCell.nextSibling != null) {
                this.tableElement.rows[0].insertBefore(td, this.textCell);
            }
            else {
                this.tableElement.rows[0].appendChild(td);
            }
            this.tipCell = td;
        }        
        this.tipCell.innerHTML = tip == '' ? '&nbsp' : tip;
    }

    get tipTitle() {
        return this.$tipTitle;
    }

    set tipTitle(title) {
        this.$tipTitle = title;
        if (this.tipCell != null && this.$tip != '') {
            this.tipCell.title = title;
        }
    }

    get icon() {
        return this.$icon;
    }

    set icon(icon) {
        this.$icon = icon;
        this.iconCell.style.display = icon == '' ? 'none' : '';
        if (icon.isImage()) {
            if (this.iconCell.querySelector('IMG') != null) {
                this.iconCell.querySelector('IMG').src = icon;
            }
            else {
                this.iconCell.innerHTML = '';    
                this.iconCell.appendChild($create('IMG', { align: 'absmiddle', src: this.treeView.imagesBaseUrl + icon }));
            }
        }
        else {
            this.iconCell.innerHTML = '';
            this.iconCell.innerHTML = icon;
        }
    }

    get expandedIcon() {
        return this.$expandedIcon;
    }

    set expandedIcon(icon) {
        this.$expandedIcon = icon;
        if (this.expanded) {
            if (icon.isImage()) {
                if (this.iconCell.querySelector('IMG') != null) {
                    this.iconCell.querySelector('IMG').src = icon;
                }
                else {
                    this.iconCell.innerHTML = '';    
                    this.iconCell.appendChild($create('IMG', { align: 'absmiddle', src: this.treeView.imagesBaseUrl + icon }));
                }
            }
            else {
                this.iconCell.innerHTML = '';
                this.iconCell.innerHTML = icon == '' ? '&nbsp;' : icon;
            }
        }
    }

    get tipClass() {
        return this.$inherit('$tipClass', 'nodeTipClass');        
    }

    set tipClass(tipClass) {
        this.$tipClass = tipClass;
        if (this.tipCell != null) {
           this.tipCell.className = tipClass; 
        }        
    }

    get draggable() {
        if (this.treeView != null && !this.treeView.dragNodeEnabled) {
            return false;
        }
        else {
            return this.$draggable;
        }
    }            

    set draggable(able) {
        this.$draggable = able;
    }

    get visible() {
        return this.$visible;
    }

    set visible(able) {
        if (typeof(able) == 'boolean') {
            this.$visible = able;
        }
        else if (typeof(able) == 'number') {
            this.$visible = (able > 0);
        }
        else if (typeof(able) == 'string') {
            this.$visible = able.toBoolean(true);
        }
        else {
            this.$visible = true;
        }
        
        $x(this.primeDiv, this.childrenDiv, this.capDiv, this.gapDiv, this.lapDiv).show(this.$visible);
    }

    get selected() {
        return this.$selected;
    }

    set selected(bool) {
        this.$selected = bool;
    }

    get checked() {
        return this.$checked;
    }

    set checked(bool) {
        this.$checked = bool;
    }
}

// 保存节点配置的元素
TreeNode.prototype.element = null;
// Template模板对象, 每个节点一个模板对象
TreeNode.prototype.templateObject = null;

/// <value type="Element">TreeNode DIV, 用于节点更新</value>
TreeNode.prototype.primeDiv = null;
/// <value type="Element">TreeNode的节点元素, 根据nodeCellStyle设定</value>
TreeNode.prototype.majorElement = null; //majorElement
/// <value type="Element">TreeNode Table, TABLE</value>
TreeNode.prototype.tableElement = null;
/// <value type="Element">TreeNode ChildNodes, DIV</value>
TreeNode.prototype.childrenDiv = null;
/// <value type="Element">TreeNode Burl IMG, IMG</value>
TreeNode.prototype.burlImage = null;
/// <value type="Element">TreeNode CheckBox IMG, IMG</value>
TreeNode.prototype.checkBoxElement = null;
/// <value type="Element">TreeNode Icon所在的单元格</value>
TreeNode.prototype.iconCell = null;
/// <value type="Element">TreeNode Text, TD</value>l
TreeNode.prototype.textCell = null;
/// <value type="Element">TreeNode Link, A</value>
TreeNode.prototype.linkElement = null;
/// <value type="Element">TreeNode Tip, TD</value>
TreeNode.prototype.tipCell = null;
/// <value type="Element">TreeNode CAP, DIV</value>
TreeNode.prototype.capDiv = null;
/// <value type="Element">TreeNode GAP, DIV</value>
TreeNode.prototype.gapDiv = null;
/// <value type="Element">TreeNode LAP, DIV</value>
TreeNode.prototype.lapDiv = null;

/// <value type="TreeNode">获取子节点中的第一个子节点</value>
TreeNode.prototype.firstChild = null;
/// <value type="TreeNode">获取子节点中的最后一个子节点</value>
TreeNode.prototype.lastChild = null;
/// <value type="TreeNode">获取上一个同辈节点</value>
TreeNode.prototype.previousSibling = null;
/// <value type="TreeNode">获取下一个同辈节点</value>
TreeNode.prototype.nextSibling = null;
/// <value type="TreeNode">获取当前节点的父节点, null 为一级节点</value>
TreeNode.prototype.parentNode = null;

/// <value type="String">从根节点到当前节点的路径</value>
TreeNode.prototype.path = '';
/// <value type="Integer">获得节点的当前深度, 1为根节点</value>
TreeNode.prototype.depth = 1;
/// <value type="Integer">获得节点在当前集合中的位置, 从0开始</value>
TreeNode.prototype.index = 0;


/// <value type="Boolean">判断节点是否正在加载</value>
TreeNode.prototype.loading = false;
/// <value type="Boolean">判断子节点是否已经加载完成</value>
TreeNode.prototype.loaded = false;
/// <value type="Boolean">判断节点是否正在展开</value>
TreeNode.prototype.expanding = false;
/// <value type="Boolean">判断节点是否处于展开状态</value>
TreeNode.prototype.expanded = false;
/// <value type="Boolean">判断节点是否正在被编辑</value>
TreeNode.prototype.editing = false;

TreeNode.prototype.$inherit = function(nodeProperty, treeProperty) {
    if (this[nodeProperty] == null || this[nodeProperty] == '' || this[nodeProperty] == -1) {
        return this.treeView[treeProperty];
    }
    else {
        return this[nodeProperty];
    }
}

TreeNode.prototype.of = function(parentNode) {
    this.parentNode = parentNode;
    return this;
}

TreeNode.prototype.appendTo = function(parentNode) {
    parentNode.appendChild(this);
    return this;
}

TreeNode.prototype.insertToBefore = function(parentNode, referenceNode) {
    parentNode.insertBefore(this, referenceNode);
    return this;
}

TreeNode.prototype.insertToAfter = function(parentNode, referenceNode) {
    parentNode.insertAfter(this, referenceNode);
    return this;
}

/// <value type="Boolean">指示节点是否有子节点</value>
TreeNode.prototype.hasChildNodes = function() {
    if (this.loaded) {
        return this.children.length > 0;        
    }
    else {
        return (this.element != null && this.element.querySelector('treenode') != null) || (this.templateObject != null && this.templateObject.nonEmpty()) || this.data != '';
    }
};

TreeNode.prototype.populate = function() {
    
    //(re)build primeDiv only

    let treeNode = this;

    let div, table, tbody, tr, td, img;

    //节点行
    div = $create('DIV', { id: this.name }, { 'display': this.visible ? '' : 'none' }, { sign: 'ROW', name: this.name });

    div.setAttribute('path', this.path);

    //spacing
    if (this.spacing > 0) {
        //大于0且启用拖放或者显示树线时, 在添加或删除节点时用DIV控制间隔
        if ((!this.treeView.dragAndDropEnabled && this.treeView.lines == 'HIDDEN') || (this.treeView.dragAndDropEnabled && !this.treeView.dropSpacingEnabled)) {
            div.style.marginTop = this.spacing + 'px';
            div.style.marginBottom = this.spacing + 'px';
        }
    }

    //节点
    table = $create('TABLE', { cellPadding: this.padding, cellSpacing: 0 }, { }, { 'sign': 'NODE', 'indent': this.indent });
    tbody = $create('TBODY');
    tr = $create('TR');

    //如果不是根节点，则需要设置缩进
    if (this.depth > 1) {
        let parent = this.parentNode;
        while (parent != null) {
            td = $create('TD', { innerHTML : '<img src="' + this.treeView.imagesBaseUrl + 'blank.gif" width="' + parent.tableElement.getAttribute('indent') + '" height="1" border="0" />' });
            //td的宽度浏览器会自动加上cellPadding的宽度, 所有TD内填充图片宽度和TD宽度设置一致即可
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
    if (this.treeView.burls == 'VISIBLE') {
        td = $create('TD', { align: 'center' }, { }, { sign: 'BURL' });
        img = $create('IMG', { align: 'absmiddle' }, { position: 'relative', top: '-2px' });
        this.burlImage = img;
        
        if (this.hasChildNodes()) {
            this.burl();
        }
        else {
            img.src = this.treeView.imagesBaseUrl + this.treeView.noExpandImageUrl;
        }
        
        td.appendChild(img);
        tr.appendChild(td);
    }

    //checkbox
    if (this.treeView.checkBoxesVisible) {
        this.checked = ((this.parentNode != null && this.parentNode.checked == 1) ? 1 : 0);

        td = $create('TD', { align: 'center' }, { }, { sign: 'CHECKBOX' });

        img = $create('IMG', {
            align: 'absmiddle',
            src: this.treeView.imagesBaseUrl + 'checkbox_' + this.checked + 'a.gif',
            onmouseover: function () { this.src = this.src.replace(/a\.gif$/i, 'b.gif'); },
            onmouseout: function () { this.src = this.src.replace(/[bc]\.gif$/i, 'a.gif'); },
            onmousedown: function (ev) {
                if (ev.button == 1 || ev.button == 0) {
                    this.src = this.src.replace(/b\.gif$/i, 'c.gif');
                }
            },
            onmouseup: function (ev) {
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
        });
                    
        td.appendChild(img);
        this.checkBoxElement = img;
        
        tr.appendChild(td);
    }

    //icon
    //&& this.icon != ''
    // icons="visible"     
    td = $create('TD', { align: 'center', className: this.iconClass }, { display: this.treeView.icons == 'VISIBLE' && this.icon != '' ? '' : 'none' }, { 'sign': 'ICON' });
    if (this.icon.isImage()) {
        td.appendChild($create('IMG', { align: 'absmiddle', src: this.treeView.imagesBaseUrl + this.icon }));
    }
    else {
        td.innerHTML = this.icon;
    }
    this.iconCell = td;
    tr.appendChild(td);
    $x(this.iconCell).bind('click', function(ev) {
        treeNode.treeView.execute('onNodeIconClick', treeNode);
    });

    //text td
    td = $create('TD', { title: this.title, className: this.textClass }, { cursor: 'default', whiteSpace: 'nowrap' }, { 'sign': 'TEXT' });
    
    //节点对象
    this.majorElement = this.treeView.nodeCellStyle == 'TEXT' ? td : div;
    (this.selected ? this.selectedClass : this.className).split(' ').forEach(className => this.majorElement.classList.add(className));

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
        div.droppable = this.droppable;

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
            //t.setData('text/plain', '{treeView:"' + treeNode.treeView.id + '", action:"' + t.effectAllowed + '", treeNode:"' + treeNode.name + '"}');

            //克隆节点
            //TreeView.clipBoard.treeNode = treeNode.clone();

            if (t.effectAllowed == 'move') {
                //被拖放节点样式
                if (treeNode.cutClass != '') {
                    this.className = treeNode.cutClass;
                }
                else {
                    this.style.opacity = 0.6;
                }
            }
            else {
                //复制
                this.style.borderStyle = 'dashed';
            }

            //执行开始拖拽事件
            treeNode.treeView.execute('onNodeDragStart', treeNode);
        }

        //是否可以拖放到其他节点, false 表示仅排序
        if (this.treeView.dropChildEnabled) {
            this.majorElement.ondragover = function (ev) {

                let droppable = treeNode.droppable;
                if (droppable) {
                    let originalNode = TreeView.clipBoard.treeNode;

                    //树内部或其他树的节点拖动
                    if (originalNode != null) {
                        let oTreeView = originalNode.treeView;
                        //如果被drag节点是drop节点的lastChild, 不能drop
                        //节点不能拖放到自己的子节点上
                        if (originalNode == treeNode.lastChild) { droppable = false; }
                        if (treeNode.treeView == oTreeView && ('.' + treeNode.path + '.').indexOf('.' + originalNode.path + '.') > -1) { droppable = false; }
                    }

                    if (droppable) {
                        if ((originalNode != null && treeNode.treeView.execute('onNodeDragOver', treeNode))
                            || (originalNode == null && treeNode.treeView.execute('onExternalElementDragOver', treeNode))) {
                            
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
            }

            this.majorElement.ondragleave = function (ev) {
                ev.preventDefault();

                if (treeNode.droppable) {
                    if (treeNode.dropClass != '') {                    
                        this.className = treeNode.selected ? treeNode.selectedClass : treeNode.className;
                    }
                    else {
                        this.style.boxShadow = '';
                    }
                }                
            }

            this.majorElement.ondrop = function (ev) {
                let originalNode = TreeView.clipBoard.treeNode;

                //节点拖放
                if (originalNode != null) {
                    //onAppended 添加完节点之后执行
                    let onAppended = function (node) {

                        //结束拖放, 清空数据
                        TreeView.clipBoard.clear();

                        node.select(false);

                        //执行事件
                        if (TreeView.clipBoard.action == 'DRAGMOVE') {
                            treeNode.treeView.execute('onNodeMoved', node);
                        }
                        else if (TreeView.clipBoard.action == 'DRAGCOPY') {
                            treeNode.treeView.execute('onNodeCopied', node);
                        }
                        //拖放到某一个节点
                        treeNode.treeView.execute('onNodeDropped', node);

                        //正常结束事件
                        treeNode.treeView.execute('onNodeDragEnd', node);
                    }

                    let node = originalNode.clone();

                    //处理原节点
                    if (TreeView.clipBoard.action == 'DRAGMOVE') {
                        //删除原节点
                        originalNode.remove(false);
                    }

                    //在当前节点添加子节点          
                    if (treeNode.hasChildNodes()) {
                        //有子节点, 未展开
                        if (!treeNode.expanded) {
                            treeNode.bind('onExpanded',
                                function () {
                                    this.bind('onAppended', onAppended);
                                    this.appendChild(node);
                                });
                            TreeView.clipBoard.$expanding = true;
                            treeNode.expand(false);
                        }
                        //有子节点, 已展开
                        else {
                            treeNode.bind('onAppended', onAppended);
                            treeNode.appendChild(node);
                        }
                    }
                    else {
                        //无子节点
                        treeNode.bind('onAppended', onAppended);
                        treeNode.appendChild(node);
                        treeNode.expand(false);
                    }
                }
                else {
                    //外部元素拖放
                    treeNode.treeView.execute('onExternalElementDropped', treeNode);
                    //treeNode.select(false);
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
                treeNode.treeView.execute('onNodeDragEnd', treeNode);
            }
        }
    }

    //为节点对象添加事件

    //鼠标划入:为了避免和optionBox冲突
    $x(this.majorElement).bind('mouseover', function (ev) {
        if (treeNode.treeView.execute('onNodeHover', treeNode)) {
            if (!treeNode.selected) {
                this.className = treeNode.hoverClass;
            }
            else if (treeNode.selectedHoverClass != '') {
                this.className = treeNode.selectedHoverClass;                
            }
        }
    });

    //鼠标划出
    $x(this.majorElement).bind('mouseout', function () {
        this.className = (!treeNode.selected ? treeNode.className : treeNode.selectedClass);
    });

    //点击
    this.majorElement.onclick = function (ev) {
        if (!treeNode.selected) {
            treeNode.select(ev);
        }
        else {
            treeNode.treeView.execute('onSelectedNodeClick', treeNode);
        }
    }

    this.majorElement.oncontextmenu = function (ev) {

        //显示右键菜单
        if (!treeNode.editing) {
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

    //link & text
    if (this.link != '') {
        if (this.linkStyle == 'text') {
            let a = $create('A', { 
                href: this.link.$p(this),
                target: this.target, 
                innerHTML: this.text,
                onclick: function () {
                    //onNodeNavigate事件
                    if (this.href != '' && !this.href.includes('javascript:')) {
                        treeNode.treeView.execute('onNodeNavigate', treeNode);
                    }
                } 
            }, { }, { 'sign': 'LINK' });               
            td.appendChild(a);
            if (!td.draggable) {
                a.draggable = false;
            }
            this.linkElement = a;
        }
        else {
            td.innerHTML = this.text;
            $x(this.majorElement).on('click', function() {
                if (treeNode.target == '_blank') {
                    window.open(treeNode.link.$p(treeNode));
                }
                else if (treeNode.target != '') {
                    if (!treeNode.target.startsWith('_')) {
                        if (window.frames[treeNode.target] != null) {
                            window.frames[treeNode.target].location.href = treeNode.link.$p(treeNode);
                        }
                        else {
                            console.warn("TreeNode link attribute 'target' can't be empty if you set linkStyle as 'node'.");
                        }
                    }
                    else {
                        console.warn("TreeNode link attribute 'target' only supports '_blank' in linkStyle 'node'.");
                    }
                }
                else {
                    console.warn("TreeNode link attribute 'target' can't be empty if you set linkStyle as 'node'.");
                }
            });
        }
    }
    else {
        td.innerHTML = this.text;
    }

    tr.appendChild(td);
    this.textCell = td;

    if (this.tip != '') {
        td = $create('TD', { className: this.tipClass, innerHTML: this.tip, title: (this.tipTitle != null ? this.tipTitle : '') }, { cursor: 'default', whiteSpace: 'nowrap' }, { 'sign': 'TIP' });
        tr.appendChild(td);
        this.tipCell = td;
    }

    tbody.appendChild(tr);
    table.appendChild(tbody);
    div.appendChild(table);

    this.primeDiv = div;
    this.tableElement = table;
    
    //optionBox
    this.primeDiv.onmouseover = function (ev) {
        if (treeNode.treeView.optionBox != null && treeNode.treeView.optionBox.display != 'CONTEXTMENU' && treeNode.treeView.optionBox.display != 'TOP') {
            if (!treeNode.editing) {
                if (!treeNode.treeView.optionBox.visible || treeNode.treeView.optionBox.target != treeNode) {
                    treeNode.treeView.optionBox.target = treeNode;
                    treeNode.treeView.optionBox.show(ev);
                }
            }
        }
    }

    if (this.cap != '') {
        div = $create('DIV', { className: this.capClass, innerHTML: this.cap }, { 'display': this.visible ? '' : 'none' }, { sign: 'CAP', 'for': this.name });
        this.capDiv = div;
    }
    if (this.gap != '') {
        div = $create('DIV', { className: this.gapClass, innerHTML: this.gap }, { 'display': this.visible ? '' : 'none' }, { sign: 'GAP', 'for': this.name });
        this.gapDiv = div;
    }
    if (this.lap != '') {
        div = $create('DIV', { className: this.lapClass, innerHTML: this.lap }, { 'display': this.visible ? '' : 'none' }, { sign: 'LAP', 'for': this.name });
        this.lapDiv = div;
    }

    div = $create('DIV', { }, { display: 'none' }, { sign: 'CHILDREN', 'for': this.name });
    let childrenPadding = this.childrenPadding; 
    if (childrenPadding > 0) {
        if (this.treeView.lines == 'VISIBLE') {
            div.appendChild(TreeView.$populateChildrenPadding(this, 'top'));
            div.appendChild(TreeView.$populateChildrenPadding(this, 'bottom'));
        }
        else {
            div.style.paddingTop = childrenPadding + 'px';
            div.style.paddingBottom = childrenPadding + 'px';
        }
    }
   
    this.childrenDiv = div;   

    //处理template
    if (this.template != '') {
        if (this.treeView.templates[this.template] != null) {
            this.templateObject = new Template(this.treeView.templates[this.template], this.childrenDiv, this.name);

            if (this.element != null && this.element.childElementCount > 0) {
                this.templateObject.extend(element.innerHTML.trim());
            }
        }
        else {
            console.warn('The template name "' + this.template + '" is invalid.');
        }
    }
    else if (this.element != null && this.element.childElementCount > 0) {
        this.templateObject = new Template(this.element, this.childrenDiv, this.name);
    }

    return this.primeDiv;
}

TreeNode.prototype.load = function (repopulate) {
    /// <summary>加载子节点项</summary>
    /// <param name="repopulate" type="Boolean">是否重新装配<param>
    this.loading = true;

    if (this.templateObject != null) {
        if (this.data != '') {
            //添加"加载中"节点
            this.treeView.$appendLoadingNode(this);
        }

        this.templateObject 
            //owner, ownerElement
            .of(this, this.element)
            .setPage(0)
            .load(this.data) 
            .on('lazyload', function() {            
                this.owner.$populateChildren();
            })
            .append(function(data) {
                if (this.data != '') {
                    //移除"加载中"节点
                    this.treeView.$removeLoadingNode(this);
                }
    
                this.$populateChildren();
    
                this.loading = false;
                this.loaded = true;
    
                if (this.treeView.loaded) {
                    Model.initializeForOrIf('TREENODE.LOADED');
                }

                //当没有子节点时, 处理burl为blank
                if (this.children.length == 0) { 
                    this.unburl(); 
                }

                //执行TreeView事件
                this.treeView.execute('onNodeLoaded', this, data);
                //执行TreeNode事件
                this.fire('onLoaded');
            });
        
    }
    else {
        //无模板时当无子节点处理
        this.loading = false;
        this.loaded = true;
        //当没有子节点时, 处理burl为blank
        if (this.children.length == 0) { 
            this.unburl(); 
        }
        //执行TreeView事件
        this.treeView.execute('onNodeLoaded', this);
        //执行TreeNode事件
        this.fire('onLoaded');
    }
};

TreeNode.prototype.reload = function (completely) {
    /// <summary>重新加载</summary>
    /// <param name="completely" type="Boolean" defaultValue="true">true: 从__dataElement和dataSource重新加载; false: 从childNodes重新加载</param>
    this.loaded = false;

    if (completely === false) {
        //仅重新装备节点
        this.load(true);
    }
    else {
        //记录展开状态
        let expanded = this.expanded;
        //移除所有节点
        this.removeAll();
        //重置done属性
        if (this.templateObject != null) {
            this.templateObject.done = false;
        }        
        //如果之前是展开状态，还是展开; 反之则只加载
        if (expanded) {
            this.expand(false);
        }
        else {         
            this.load();
        }
    }
}

TreeNode.prototype.toggle = function (triggerEvent) {
    /// <summary>将节点切换为展开或闭合状态</summary>
    if (!this.expanded) {
        //展开
        this.expand(triggerEvent);
    }
    else {
        //闭合
        this.collapse(triggerEvent);
    }
};

TreeNode.prototype.expand = function (triggerEvent) {
    /// <summary>展开节点</summary>
    if (this.treeView != null && !this.expanded) {

        this.expanding = true;

        //+-
        if (this.treeView.burls == 'VISIBLE') {            
            this.burlImage.src = this.burlImage.getAttribute('c');
            this.burlImage.setAttribute('current', 'c');
        }
        
        //icon
        if (this.treeView.icons == 'VISIBLE' && this.expandedIcon != '') {
            if (this.icon.isImage()) {
                this.iconCell.firstChild.src = this.treeView.imagesBaseUrl + this.expandedIcon;
            }
            else {
                this.iconCell.innerHTML = this.expandedIcon;
            }            
        }

        //展开子节点
        this.childrenDiv.style.display = '';

        //如果数据没有加载就加载		
        if (!this.loaded) {
            //展开动作引发的load, 附加expand事件
            this.bind('onLoaded', 
                function () {
                    if (this.expanding) {
                        this.$completeExpanding(triggerEvent); 
                    }
                }).load();
        }
        else {
            //有子节点, 但是没有子节点元素, 在移动或复制后会出现这种情况
            if (this.hasChildNodes() && this.childrenDiv.innerHTML == '') { 
                this.reload(false); 
            }

            this.$completeExpanding(triggerEvent);
        }
    }
};

TreeNode.prototype.collapse = function (triggerEvent) {
    
    /// <summary>闭合节点</summary>
    if (this.treeView != null) {
        //+-
        if (this.treeView.burls == 'VISIBLE') {
            this.burlImage.src = this.burlImage.getAttribute('e');
            this.burlImage.setAttribute('current', 'e');
        }
        //icon
        if (this.treeView.icons == 'VISIBLE' && this.expandedIcon != '' && this.icon != '') {
            if (this.icon.isImage()) {
                this.iconCell.firstChild.src = this.treeView.imagesBaseUrl + this.icon;
            }
            else {
                this.iconCell.innerHTML = this.icon;
            } 
        }

        this.childrenDiv.style.display = 'none';

        this.expanded = false;
        if (triggerEvent != false) { this.treeView.execute('onNodeCollapsed', this); }

        //this.execute('onCollapsed');
    }
};

TreeNode.prototype.select = function (triggerEvent) {
    /// <summary>选择当前节点</summary>
    /// <param name="triggerEvent" type="Boolean|Event">是否触发事件, 默认触发</param>
    if (this.treeView != null && this != this.treeView.selectedNode) {

        if (this.treeView.selectedNode != null) {
            this.treeView.selectedNode.deselect();
        }

        this.majorElement.className = this.selectedClass;

        this.selected = true;

        // selectedNode
        this.treeView.selectedNode = this;

        // 触发各种事件
        if (triggerEvent != false) {
            //onNodeSelected
            this.treeView.execute('onNodeSelected', this);

            //this.fire('onSelected');

            let doToggle = true;

            //triggerEvent为用户点击事件 或 键盘事件
            if (typeof (triggerEvent) == 'object') {
                //由burl节点触发的节点切换不再触发 expandOnSelect && collapseOnSelect
                if (this.treeView.nodeCellStyle != 'TEXT' && triggerEvent.type == 'click') {
                    let target = triggerEvent.target || triggerEvent.srcElement;
                    if (target == this.burlImage) { doToggle = false; }
                }

                //键盘导航时不再触发 expandOnSelect && collapseOnSelect
                if (this.treeView.keyboardEnabled && triggerEvent.type == 'keyup') {
                    if (triggerEvent.keyCode == 38 || triggerEvent.keyCode == 40) { doToggle = false; }
                }
            }

            if (doToggle) {
                //是否由用户触发事件
                // expandOnSelect
                if (this.hasChildNodes() && this.treeView.expandOnSelect && !this.expanded && !this.expanding) {
                    this.expand(triggerEvent);
                }
                // collapseOnSelect
                else if (this.hasChildNodes() && this.treeView.collapseOnSelect && this.expanded) {
                    this.collapse(triggerEvent);
                }
            }
        }

        if (this.treeView.optionBox != null && this.treeView.optionBox.display != 'CONTEXTMENU') {
            if (!this.treeView.optionBox.visible || this.treeView.optionBox.target != this) {
                this.treeView.optionBox.target = this;
                this.treeView.optionBox.show(triggerEvent);
            }            
        }
    }
};

TreeNode.prototype.deselect = function () {
    /// <summary>取消选择当前节点</summary>
    if (this.treeView != null) {
        if (this.selected) {
            this.majorElement.className = this.className;

            this.selected = false;

            this.treeView.selectedNode = null;

            //this.execute('onUnSelected');
        }
    }
};

TreeNode.prototype.burl = function () {
    /// <summary>恢复节点的+-</summary>

    // 给当前节点添加burl
    if (typeof (this.treeView.expandImageUrl) == 'string') {
        this.burlImage.setAttribute('e', this.treeView.imagesBaseUrl + this.treeView.expandImageUrl);
    }
    else if (this.treeView.expandImageUrl instanceof Array) {
        this.burlImage.setAttribute('e', this.treeView.imagesBaseUrl + this.treeView.expandImageUrl[0]);
        this.burlImage.setAttribute('eh', this.treeView.imagesBaseUrl + this.treeView.expandImageUrl[1]);
    }
    if (typeof (this.treeView.collapseImageUrl) == 'string') {
        this.burlImage.setAttribute('c', this.treeView.imagesBaseUrl + this.treeView.collapseImageUrl);
    }
    else if (this.treeView.collapseImageUrl instanceof Array) {
        this.burlImage.setAttribute('c', this.treeView.imagesBaseUrl + this.treeView.collapseImageUrl[0]);
        this.burlImage.setAttribute('ch', this.treeView.imagesBaseUrl + this.treeView.collapseImageUrl[1]);
    }
    //如果正在展开或者已经展开
    if (this.expanding || this.expanded) {
        this.burlImage.src = this.burlImage.getAttribute('c');
        this.burlImage.setAttribute('current', 'c');

        this.childrenDiv.style.display = '';
    }
    else {
        this.burlImage.src = this.burlImage.getAttribute('e');
        this.burlImage.setAttribute('current', 'e');

        //if (this.childrenDiv) {this.childrenDiv.style.display = 'none';}
    }

    this.burlImage.onmouseover = function () {
        if (this.getAttribute('current') == 'c' && this.getAttribute('ch') != null) {
            this.src = this.getAttribute('ch');
            this.setAttribute('current', 'ch');
        }
        else if (this.getAttribute('current') == 'e' && this.getAttribute('eh') != null) {
            this.src = this.getAttribute('eh');
            this.setAttribute('current', 'eh');
        }
    }

    this.burlImage.onmouseout = function () {
        if (this.getAttribute('current') == 'ch') {
            this.src = this.getAttribute('c');
            this.setAttribute('current', 'c');
        }
        else if (this.getAttribute('current') == 'eh') {
            this.src = this.getAttribute('e');
            this.setAttribute('current', 'e');
        }
    }

    let treeNode = this;
    this.burlImage.onclick = function (ev) {
        treeNode.toggle(ev);
        ev.stopPropagation();
    }

    //this.execute('onBurled');
}

TreeNode.prototype.unburl = function () {
    /// <summary>去掉节点的+-</summary>

    // 去掉当前节点的burl
    if (this.treeView.burls == 'VISIBLE') {
        this.burlImage.src = this.treeView.imagesBaseUrl + 'blank.gif';
        this.burlImage.onmouseover = null;
        this.burlImage.onmouseout = null;
        this.burlImage.onclick = null;
    }
    // 恢复节点图标
    if (this.treeView.icons == 'VISIBLE' && this.expandedIcon != '' && this.icon != '') {
        this.iconCell.src = this.treeView.imagesBaseUrl + this.icon;
    }

    this.childrenDiv.style.display = 'none';
    this.expanded = false;

    //this.execute('onUnBurled');
};

TreeNode.prototype.check = function (triggerEvent) {
    /// <summary>选中当前节点</summary>
    /// <param name="triggerEvent" type="Boolean">是否触发事件, 默认触发</param>

    this.$toggleCheckBox(1);

    if (this.treeView.checkBoxes == 'VISIBLE') {
        //检查子项
        this.$traverseChildren();

        //检查父级项
        this.$traverseParents();
    }

    //执行事件
    if (triggerEvent != false) { this.treeView.execute('onNodeCheckChanged', this); }

    //this.execute('onChecked');
};

TreeNode.prototype.uncheck = function (triggerEvent) {
    /// <summary>取消选中当前节点</summary>
    this.$toggleCheckBox(0);

    if (this.treeView.checkBoxes == 'VISIBLE') {
        //检查子项数
        this.$traverseChildren();

        //检查父级项 - 需要递归函数
        this.$traverseParents();
    }

    //执行事件
    if (triggerEvent != false) { this.treeView.execute('onNodeCheckChanged', this); }

    //this.execute('onUnChecked');
}

TreeNode.prototype.navigate = function () {
    /// <summary>打开节点链接</summary>

    if (this.link != '' && this.link.indexOf('javascript:') == -1) {
        if (this.target == '' || this.target == '_self') {
            window.location.href = this.link;
        }
        else if (this.target == '_blank') {
            window.open(this.link);
        }
        else if (this.target == '_top') {
            top.location.href = this.link;
        }
        else {
            window.frames[this.target].location.href = this.link;
        }

        this.treeView.execute('onNodeNavigate', this);
    }
}

TreeNode.prototype.getAttribute = function (attr) {
    /// <summary>得到自定义的属性值</summary>
    if (this[attr] !== undefined) {
        return this[attr];
    }
    else {
        return this.attributes[attr.toLowerCase()];
    }    
}

TreeNode.prototype.setAttribute = function (attr, value) {
    /// <summary>设置自定义的属性值</summary>    
    this.attributes[attr.toLowerCase()] = value;
}

TreeNode.prototype.$renderChild = function(child, ref) {
    if (ref != null) {
        if (child.capDiv != null) {
            this.childrenDiv.insertBefore(child.capDiv, ref);
        }
        this.childrenDiv.insertBefore(child.primeDiv, ref.element);
        if (child.gapDiv != null) {
            this.childrenDiv.insertBefore(child.gapDiv, ref.element);
        }
        this.childrenDiv.insertBefore(child.childrenDiv, ref.element);
        if (child.lapDiv != null) {
            this.childrenDiv.insertBefore(child.lapDiv, ref);
        }
    }
    else {
        if (child.capDiv != null) {
            this.childrenDiv.appendChild(child.capDiv);
        }
        this.childrenDiv.appendChild(child.primeDiv);
        if (child.gapDiv != null) {
            this.childrenDiv.appendChild(child.gapDiv);
        }
        this.childrenDiv.appendChild(child.childrenDiv);
        if (child.lapDiv != null) {
            this.childrenDiv.appendChild(child.lapDiv);
        }
    }
}

TreeNode.prototype.$removeChildElements = function(child) {
    if (child.capDiv != null) {
        this.childrenDiv.removeChild(child.capDiv);
    }
    this.childrenDiv.removeChild(child.primeDiv);
    if (child.gapDiv != null) {
        this.childrenDiv.removeChild(child.gapDiv);
    }
    this.childrenDiv.removeChild(child.childrenDiv);
    if (child.lapDiv != null) {
        this.childrenDiv.removeChild(child.lapDiv);
    }
}

TreeNode.prototype.appendChild = function (treeNode, editing) {
    /// <summary>添加子节点</summary>

    if (!(treeNode instanceof TreeNode)) {
        treeNode = new TreeNode(treeNode);
    }

    //parentNode
    treeNode.parentNode = this;
    //treeView
    treeNode.treeView = this.treeView;
    //depth
    treeNode.depth = this.depth + 1;
    //path
    treeNode.path = this.path + '.' + treeNode.name;

    let length = this.children.length;

    //index
    treeNode.index = length;

    // children
    this.children.push(treeNode);

    // render
    this.children[length].populate();
    
    if (this.children[length].element != null) {
        this.$renderChild(this.children[length], this.children[length].element);
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

        this.$renderChild(this.children[length], ref);        
    }
        
    if (this.children[length].primeDiv.classList != null) {
        this.children[length].primeDiv.classList.add('treeNode-fade-in');
        if (this.children[length].gapDiv != null) {
            this.children[length].gapDiv.classList.add('treeNode-fade-in');
        }
    }

    // firstChild & lastChild
    if (length == 0) { this.firstChild = this.children[length]; }
    this.lastChild = this.children[length];

    //previousSibling & nextSibling
    if (length > 0) {
        this.children[length].previousSibling = this.children[length - 1];
        this.children[length - 1].nextSibling = this.children[length];
    }

    //启用dragAndDrop 或者 spacing大于0并且lines == 'VISIBLE'时, 创建分隔DIV
    if ((this.treeView.dragAndDropEnabled && this.treeView.dropSpacingEnabled) || (this.children[length].spacing > 0 && this.treeView.lines == 'VISIBLE')) {
        
        //ahead spacing        
        //创建新的，只在节点羰有间隔
        let divB = $create('DIV');
        divB.setAttribute('sign', 'SPACING');
        divB.style.height = this.children[length].spacing + 'px';
        //divB.style.backgroundColor = '#F0C';
        divB.setAttribute('parent', this.name);
        divB.setAttribute('prev', (length == 0 ? '' : this.children[length - 1].name));
        divB.setAttribute('next', this.children[length].name);
        this.childrenDiv.insertBefore(divB, this.children[length].primeDiv);

        if (this.treeView.lines == 'VISIBLE' && this.children[length].spacing > 0) {
            divB.appendChild(TreeView.$populateLinesSpacing(this.children[length]));
        }

        if (this.treeView.dragAndDropEnabled && this.treeView.dropSpacingEnabled) {
            divB.appendChild(TreeView.$populateDropLine(this.children[length]));
        }
        
        //只更新上一级
        // this.children[length - 1].childrenDiv.nextSibling.setAttribute('prev', this.children[length].name);
        
        //after
        // let divA = $create('DIV');
        // divA.setAttribute('sign', 'SPACING');
        // divA.style.height = '0px';
        // divA.setAttribute('parent', this.name);
        // divA.setAttribute('prev', this.children[length].name);
        // divA.setAttribute('next', '');
        // if (this.childrenDiv.lastChild.getAttribute('sign') == 'CHILDRENPADDING') {
        //     this.childrenDiv.insertBefore(divA, this.childrenDiv.lastChild);
        // }
        // else {
        //     this.childrenDiv.appendChild(divA);
        // }

        // if (this.treeView.lines == 'VISIBLE' && this.children[length].spacing > 0) {
        //     divA.appendChild(TreeView.$populateLinesSpacing(this.children[length]));
        // }

        if (this.treeView.dragAndDropEnabled && this.treeView.dropSpacingEnabled) {
            divA.appendChild(TreeView.$populateDropLine(this.children[0], true));
        }

        //dropLine
        //        if (this.treeView.dragAndDropEnabled) {
        //            //添加拖放线0
        //            if (length == 0) {
        //                this.childrenDiv.insertBefore(TreeView.$populateDropLine(null, this.children[0]), this.children[0].element);
        //            }
        //            //添加节点下方的拖放线
        //            this.childrenDiv.appendChild(TreeView.$populateDropLine(this.children[length], null));
        //            //更新上方dropLine的next属性
        //            if (length > 0) {
        //                this.children[length].element.previousSibling.setAttribute('next', this.children[length].name);
        //            }
        //        }
    }

    // 如果添加的节点是第一个节点, 处理burl为+-, 并展开节点
    if (length == 0) {
        if (this.treeView.burls == 'VISIBLE') {
            this.burl();
        }
    }

    this.children[length].$setLines();

    this.fire('onAppended', treeNode);

    if (editing != null) {
        treeNode.edit();
    }

    if (treeNode.expandOnRender) {
        treeNode.expand();
    }    
};

TreeNode.prototype.appendChildElement = function(child) {
    if (typeof(child) == 'string') {
        this.childrenDiv.insertAdjacentHTML('beforeEnd', child);
    }
    else {
        this.childrenDiv.appendChild(child);
    }
}

TreeNode.prototype.insertFront = function(treeNode) {

    if (!(treeNode instanceof TreeNode)) {
        treeNode = new TreeNode(treeNode);
    }

    if (this.firstChild != null) {
        this.insertBefore(treeNode, this.firstChild);
    }
    else {
        if (!this.expanded && this.hasChildNodes()) {
            this.bind('onExpanded', function() {
                this.insertFront(treeNode);
            });
            this.expand(false);
        }
        else {
            this.appendChild(treeNode);
        }
    }    
}

TreeNode.prototype.insertBefore = function (treeNode, referenceNode) {
    /// <summary>在referenceNode之前插入节点</summary>
    /// <param name="treeNode" type="TreeNode">要添加的节点</param>
    /// <param name="referenceNode" type="TreeNode">参考节点</param>

    if (!(treeNode instanceof TreeNode)) {
        treeNode = new TreeNode(treeNode);
    }

    //parentNode
    treeNode.parentNode = this;
    //treeView
    treeNode.treeView = this.treeView;
    //depth
    treeNode.depth = this.depth + 1;
    //path
    treeNode.path = this.path + '.' + treeNode.name;

    //index
    let index = referenceNode.index;

    // children
    this.children.splice(index, 0, treeNode);

    // render	
    this.children[index].populate();
    if (referenceNode.primeDiv.previousElementSibling != null && referenceNode.primeDiv.previousElementSibling.getAttribute('sign') == 'SPACING') {
        this.childrenDiv.insertBefore(this.children[index].primeDiv, referenceNode.primeDiv.previousElementSibling);
        this.childrenDiv.insertBefore(this.children[index].childrenDiv, referenceNode.primeDiv.previousElementSibling);
    }
    else {
        this.childrenDiv.insertBefore(this.children[index].primeDiv, referenceNode.primeDiv);
        this.childrenDiv.insertBefore(this.children[index].childrenDiv, referenceNode.primeDiv);
    }

    for (let i = index; i < this.children.length; i++) {
        this.children[i].index = i;
    }

    // firstChild
    if (index == 0) { this.firstChild = this.children[0]; }

    //previousElementSibling & nextElementSibling
    let previousNode = referenceNode.previousElementSibling;
    this.children[index].previousElementSibling = previousNode;
    if (previousNode != null) { previousNode.nextElementSibling = this.children[index]; }
    this.children[index].nextElementSibling = referenceNode;
    referenceNode.previousElementSibling = this.children[index];

    //启用dragAndDrop 或者 spacing大于0并且lines == 'VISIBLE'时, 创建分隔DIV
    if (this.treeView.dragAndDropEnabled || (this.children[index].spacing > 0 && this.treeView.lines == 'VISIBLE')) {
        //before 在节点之前添加间隔
        let divB = $create('DIV');
        divB.style.height = this.children[0].spacing + 'px';
        //divB.style.backgroundColor = '#FC0';
        divB.setAttribute('sign', 'SPACING');
        divB.setAttribute('parent', this.name);
        divB.setAttribute('prev', (index > 0 ? this.children[index - 1].name : ''));
        divB.setAttribute('next', this.children[index].name);
        this.childrenDiv.insertBefore(divB, this.children[index].element);

        //更新下方spacing的prev
        this.children[index].childrenDiv.nextElementSibling.setAttribute('prev', this.children[index].name);

        if (this.treeView.lines == 'VISIBLE' && this.children[index].spacing > 0) {
            divB.appendChild(TreeView.$populateLinesSpacing(this.children[index]));
        }

        if (this.treeView.dragAndDropEnabled && this.treeView.dropSpacingEnabled) {
            //添加dropLine
            divB.appendChild(TreeView.$populateDropLine(this.children[index]));
        }        

        //dropLine
        //        if (this.treeView.dragAndDropEnabled) {
        //            //添加节点下方的dropLine
        //            this.childrenDiv.insertBefore(TreeView.$populateDropLine(this.children[index], referenceNode), referenceNode.element);
        //            //更新上面节点的dropLine的next属性
        //            this.children[index].element.previousSibling.setAttribute('next', this.children[index].name);
        //        }
    }

    this.children[index].$setLines();

    //this.execute('onInserted', treeNode);
    
    if (treeNode.expandOnRender) {
        treeNode.expand();
    }
};

TreeNode.prototype.insertElementBefore = function(child, referenceNode) {
    if (typeof(child) == 'string') {
        this.childrenDiv.insertAdjacentHTML('beforeBegin', referenceNode.primeDiv);
    }
    else {
        this.childrenDiv.insertBefore(child, referenceNode.primeDiv);
    }
}

TreeNode.prototype.insertAfter = function (treeNode, referenceNode) {
    if (referenceNode.nextSibling != null) {
        this.insertBefore(treeNode, referenceNode.nextSibling);
    }
    else {
        this.appendChild(treeNode);
    }
}

TreeNode.prototype.removeChild = function (treeNode) {
    /// <summary>删除子节点</summary>
    
    let index = treeNode.index;

    if ((this.treeView.dragAndDropEnabled && this.treeView.dropSpacingEnabled) || (this.children[index].spacing > 0 && this.treeView.lines == 'VISIBLE')) {
        if (this.children.length == 1) {
            //删除下方的spacing
            this.childrenDiv.removeChild(this.children[index].childrenDiv.nextSibling);
        }
        else if (this.children.length >= 1) {
            //节点的下方spacing的prev变为上一个节点的name
            this.children[index].childrenDiv.nextSibling.setAttribute('prev', (index > 0 ? this.children[index - 1].name : ''));
        }

        //删除上方的spacing
        this.childrenDiv.removeChild(this.children[index].primeDiv.previousElementSibling);
    }

    //dropLine
    //    if (this.treeView.dragAndDropEnabled) {
    //        if (this.children.length == 1) {
    //            //删除最后一个节点上方的dropLine
    //            this.childrenDiv.removeChild(this.childrenDiv.firstChild);
    //        }
    //        else if (this.children.length >= 1) {
    //            //节点的上一个dropLine的next值变为下一个节点的name
    //            this.children[index].element.previousSibling.setAttribute('next', (this.children[index].nextSibling != null ? this.children[index + 1].name : ''));
    //        }
    //        //先删除节点下方的dropLine
    //        this.childrenDiv.removeChild(this.children[index].childrenDiv.nextSibling);
    //    }

    //删除元素节点
    this.$removeChildElements(this.children[index]);

    //从子节点集合中删除子节点
    this.children.splice(index, 1);

    //index
    for (let i = index; i < this.children.length; i++) {
        this.children[i].index = i;
    }

    //checked
    //删除前, 如果当前节点checked为2, 子节点数量肯定大于等于2
    //删除之后, 根据第一个子节点的选中状态向上递归
    if (this.treeView.checkBoxes == 'VISIBLE') {
        if (this.checked == 2) { this.children[0].$traverseParents(); }
    }

    // firstChild, lastChild, nextSibling, previousSibling
    if (this.children.length == 0) {
        //一项不剩下
        this.firstChild = null;
        this.lastChild = null;
    }
    else if (this.children.length == 1) {
        //只剩下一项
        this.firstChild = this.children[0];
        this.lastChild = this.children[0];
        this.children[0].previousSibling = null;
        this.children[0].nextSibling = null;
    }
    else {
        if (index == 0) {
            //是第一项
            this.firstChild = this.children[0];
            this.children[0].previousSibling = null;
        }
        else if (index == this.children.length) {
            //是最后一项
            this.lastChild = this.children[index - 1];
            this.children[index - 1].nextSibling = null;
        }
        else {
            //在中间
            this.children[index].previousSibling = this.children[index - 1];
            this.children[index - 1].nextSibling = this.children[index];
        }
    }

    //+-
    if (this.children.length == 0) { this.unburl(); }

    if (this.children.length > 0 && index == this.children.length) {
        this.lastChild.$setLines();
    }
};

TreeNode.prototype.removeAll = function () {
    /// <summary>删除所有子节点</summary>

    this.children.length = 0;
    this.childrenDiv.innerHTML = '';
    this.childrenDiv.style.display = 'none';
    this.unburl();

    //firstChild & lastChild
    this.firstChild = null;
    this.lastChild = null;

    //checkbox
    if (this.treeView.checkBoxes == 'VISIBLE') {
        if (this.checked == 2) { this.uncheck(false); }
    }
};

TreeNode.prototype.remove = function (triggerEvent) {
    /// <summary>删除自身</summary>

    if (triggerEvent !== false ? this.treeView.execute('onNodeRemove', this) : true) {
        if (this.parentNode == null) {
            this.treeView.removeChild(this);
        }
        else {
            this.parentNode.removeChild(this);
        }
    }
}

TreeNode.prototype.isFirst = function () {
    /// <summary>判断是否是同级节点的第一个节点</summary>
    if (this.parentNode == null) {
        return (this == this.treeView.firstChild);
    }
    else {
        return (this == this.parentNode.firstChild);
    }
}

TreeNode.prototype.isLast = function () {
    /// <summary>判断是否是同级节点的最后一个节点</summary>
    if (this.parentNode == null) {
        return (this == this.treeView.lastChild);
    }
    else {
        return (this == this.parentNode.lastChild);
    }
}

TreeNode.prototype.edit = function () {
    /// <summary>编辑节点</summary>

    // 可编辑并且没有在编辑时
    if (this.editable && !this.editing) {
        
        if (this.treeView.execute('onNodeEdit', this)) {
            //同时只能编辑一个节点
            if (this.treeView.$editingNode != null) {
                this.treeView.$editingNode.reset();
            }
            this.treeView.$editingNode = this;

            //编辑时禁用拖放
            if (this.treeView.dragAndDropEnabled) {
                this.majorElement.draggable = false;
            }

            this.textCell.setAttribute('text', this.text);
            if (this.textCell.firstChild.nodeType == 1 && this.textCell.firstChild.getAttribute('sign') == 'LINK') {
                this.textCell.firstChild.style.display = 'none';
            }
            else {
                this.textCell.innerHTML = '';
            }

            let treeNode = this;
            let input = $create('INPUT', { type: 'text', className: this.editingBoxClass, value: this.text, defaultValue: this.text, size: this.text.$length() + 2 });
            input.onkeyup = function (ev) {
                if (ev.keyCode == 27) {
                    //恢复
                    treeNode.reset();
                    ev.stopPropagation();
                }
                else if (ev.keyCode == 13) {
                    if (this.value != this.defaultValue) {
                        treeNode.updateText(this.value);
                    }
                    else {
                        treeNode.reset();
                    }

                    ev.stopPropagation();
                    return false;
                }
                else {
                    this.size = this.value.$length() + 1;
                }
            }
            input.onfocus = function () {
                //让光标文本最后
                if (this.setSelectionRange != null) {
                    //IE 9+, Firefox, Chrome, Safari
                    this.setSelectionRange(this.value.length, this.value.length);
                }
                else if (this.createTextRange != null) {
                    //IE 8-
                    let r = this.createTextRange();
                    r.moveStart('character', this.value.length);
                    r.collapse(true);
                    r.select();
                }
            }

            this.textCell.appendChild(input);
            input.focus();
            //v x
            let td = $create('TD', { }, { whiteSpace: 'nowrap' }, { 'sign': 'EDITING' });
            //v
            let a = $create('A', { href: 'javascript:void(0);', title: 'Submit' });
            let img = $create('IMG', 
                { width: 16, height: 16, src: this.treeView.imagesBaseUrl + 'ok.png', align: 'absmiddle' }, 
                { border: '1px solid transparent' });
            img.onmouseover = function () {
                this.style.borderColor = '#999999';
            }
            img.onmouseout = function () {
                this.style.borderColor = 'transparent';
            }
            a.appendChild(img);
            a.onclick = function () {
                if (input.value != input.defaultValue) {
                    treeNode.updateText(input.value);
                }
                else {
                    treeNode.reset();
                }
            }
            td.appendChild(a);
            //x
            a = $create('A', { href: 'javascript:void(0);', title: 'Cancel' });
            img = $create('IMG', { width: 16, height: 16, src: this.treeView.imagesBaseUrl + 'cancel.png', align: 'absmiddle' }, { border: '1px solid transparent' });
            img.onmouseover = function () {
                this.style.borderColor = '#999999';
            }
            img.onmouseout = function () {
                this.style.borderColor = 'transparent';
            }
            a.appendChild(img);
            a.onclick = function () {
                treeNode.reset();
            }
            td.appendChild(a);

            if (this.textCell.nextSibling != null) {
                this.textCell.parentNode.insertBefore(td, this.textCell.nextSibling);
            }
            else {
                this.textCell.parentNode.appendChild(td);
            }

            this.editing = true;

            //隐藏optionBox
            if (this.treeView.optionBox != null && /^(FOLLOW)|(LEFT)|(RIGHT)$/i.test(this.treeView.optionBox.display)) {
                this.treeView.optionBox.hide(true);
            }
        }
    }
};

TreeNode.prototype.updateText = function (text) {
    /// <summary>更新文本并从编辑状态恢复为正常状态</summary>

    //执行事件
    this.text = text;
    if (this.textCell.firstChild.nodeType == 1 && this.textCell.firstChild.getAttribute('sign') == 'LINK') {
        this.textCell.firstChild.innerHTML = this.text;
        this.textCell.firstChild.style.display = '';
        this.textCell.removeChild(this.textCell.lastChild);
    }
    else {
        this.textCell.removeChild(this.textCell.firstChild); //移除文本框
        this.textCell.innerHTML = this.text;
    }

    //v x
    this.textCell.parentNode.removeChild(this.textCell.nextSibling);

    this.editing = false;
    this.treeView.$editingNode = null;

    //恢复拖放
    if (this.treeView.dragAndDropEnabled) {
        this.majorElement.draggable = this.draggable;
    }

    //恢复optionBox
    if (this.treeView.optionBox != null && /^(FOLLOW)|(LEFT)|(RIGHT)$/i.test(this.treeView.optionBox.display)) {
        this.treeView.optionBox.target = this;
        this.treeView.optionBox.show();
    }    

    //如果更新失败，则显示上一次的text
    this.treeView.execute('onNodeTextChanged', this);    
};

TreeNode.prototype.reset = function () {
    /// <summary>从编辑状态恢复为正常状态</summary>
    if (this.textCell.firstChild.nodeType == 1 && this.textCell.firstChild.getAttribute('sign') == 'LINK') {
        this.textCell.firstChild.innerHTML = this.textCell.getAttribute('text');
        this.textCell.firstChild.style.display = '';
        this.textCell.removeChild(this.textCell.lastChild);
    }
    else {
        if (this.textCell.firstChild.nodeType == 1 && this.textCell.firstChild.nodeName == 'INPUT') {
            this.textCell.removeChild(this.textCell.firstChild);
        }      
        this.text = this.textCell.getAttribute('text');
    }    
    //v x
    if (this.textCell.nextElementSibling != null && this.textCell.nextElementSibling.getAttribute('sign') == 'EDITING') {
        this.textCell.parentNode.removeChild(this.textCell.nextElementSibling);
    }    

    this.editing = false;
    this.treeView.$editingNode = null;

    if (this.treeView.dragAndDropEnabled) {
        this.majorElement.draggable = this.draggable;
    }

    //恢复optionBox
    if (this.treeView.optionBox != null && /^(FOLLOW)|(LEFT)|(RIGHT)$/i.test(this.treeView.optionBox.display)) {
        this.treeView.optionBox.target = this;
        this.treeView.optionBox.show();
    }
}

TreeNode.prototype.clone = function (args) {
    /// <summary>克隆一个节点, 默认只克隆OwnProperty</summary>
    /// <param name="args" type="String">要克隆的一个或多个非OwnProperty属性</param>
    let node = new TreeNode();

    //children不克隆, 使用时重新加载

    //OwnProperties
    for (let member in this) {
        if (node.hasOwnProperty(member)) { node[member] = this[member]; }
    }

    //复制状态
    node.loaded = this.loaded;
    node.selected = this.selected;
    node.checked = this.checked;

    //Non-OwnProperties
    for (let i = 0; i < arguments.length; i++) { node[arguments[i]] = this[arguments[i]]; }

    return node;
}

TreeNode.prototype.cut = function () {
    /// <summary>剪切节点</summary>

    //剪贴板有其他节点
    if (TreeView.clipBoard.action != '') {
        //有其他节点正在被剪切, 恢复样式
        if (TreeView.clipBoard.action == 'MOVE') {
            let node = TreeView.clipBoard.treeNode;
            if (node.cutClass != '') {
                node.majorElement.className = (node.selected ? node.selectedClass : node.className);
            }
            else {
                node.majorElement.style.opacity = 1;
            }
        }

        TreeView.clipBoard.clear();
    }

    TreeView.clipBoard.treeNode = this;
    TreeView.clipBoard.action = 'MOVE';

    if (this.cutClass != '') {
        this.majorElement.className = this.cutClass;
    }
    else {
        this.majorElement.style.opacity = 0.5;
    }
}

TreeNode.prototype.copy = function () {
    /// <summary>拷贝节点</summary>

    //剪贴板有其他节点
    if (TreeView.clipBoard.action != '') {
        //有其他节点正在被剪切, 恢复样式
        if (TreeView.clipBoard.action == 'MOVE') {
            let node = TreeView.clipBoard.treeNode;
            if (node.cutClass != '') {
                node.majorElement.className = (node.selected ? node.selectedClass : node.className);
            }
            else {
                node.majorElement.style.opacity = 1;
            }
        }

        TreeView.clipBoard.clear();
    }

    TreeView.clipBoard.treeNode = this;
    TreeView.clipBoard.action = 'COPY';
}

TreeNode.prototype.paste = function () {
    /// <summary>粘贴复制或剪切的节点</summary>

    if (TreeView.clipBoard.action != '' && TreeView.clipBoard.treeNode != this) {
        //粘贴的节点不能是其父级节点
        if (this.path.indexOf(TreeView.clipBoard.treeNode.path + '.') == -1) {
            let treeNode = this;

            //onAppended 添加完节点之后执行
            let onAppended = function (node) {

                node.select(false);

                //执行事件
                if (TreeView.clipBoard.action == 'MOVE') {
                    treeNode.treeView.execute('onNodeMoved', node);
                    //清空数据
                    TreeView.clipBoard.clear();
                }
                else {
                    treeNode.treeView.execute('onNodeCopied', node);
                }
            }

            let originalNode = TreeView.clipBoard.treeNode;
            let node = originalNode.clone();

            //处理原节点
            if (TreeView.clipBoard.action == 'MOVE') {
                //删除原节点
                originalNode.remove(false);                
            }

            //在当前节点添加子节点          
            if (treeNode.hasChildNodes()) {
                //有子节点, 未展开
                if (!treeNode.expanded) {
                    treeNode.bind('onExpanded', function () {
                        this.bind('onAppended', onAppended);
                        this.appendChild(node);
                    });
                    TreeView.clipBoard.$expanding = true;
                    treeNode.expand(false);
                }
                //有子节点, 已展开
                else {
                    treeNode.bind('onAppended', onAppended);
                    treeNode.appendChild(node);
                }
            }
            else {
                //无子节点
                treeNode.bind('onAppended', onAppended);
                treeNode.appendChild(node);
                treeNode.expand(false);
            }


        }
        //        else {
        //            window.alert("Can't copy or move ancestor node to this node.");
        //        }
    }
}

TreeNode.prototype.show = function() {
    this.visible = true;
}

TreeNode.prototype.hide = function() {
    this.visible = false;
}

TreeNode.prototype.$completeExpanding = function (triggerEvent) {
    /// <summary>完成展开</summary>
    /// <param name="triggerEvent" type="Boolean">是否触发事件, 默认触发</param>

    this.expanding = false;

    if (this.hasChildNodes()) {
        this.expanded = true; 
    }

    //如果行为来自用户, 执行TreeView事件
    if (triggerEvent) {
        this.treeView.execute('onNodeExpanded', this);
    }

    //执行TreeNode私有事件
    this.fire('onExpanded');
};

TreeNode.prototype.$populateChildren = function() {
    //装配节点
    let treeNodes = [];
    for (let child of this.childrenDiv.children) {
        if (child.nodeName == 'TREENODE') {
            treeNodes.push(child);
        }     
    }

    for (let treeNode of treeNodes) {
        this.appendChild(new TreeNode(treeNode));
        treeNode.remove();
    }
}

TreeNode.prototype.$toggleCheckBox = function (checkedState) {
    /// <summary>切换checkbox状态和checked</summary>
    /// <param name="checkedState" valueType="Integer">要切换到的状态</param>

    if (this.treeView.checkBoxes == 'VISIBLE') {
        switch (checkedState) {
            case 0:
                this.checkBoxElement.src = this.checkBoxElement.src.replace(/checkbox_(1|2)/i, 'checkbox_0');
                break;
            case 1:
                this.checkBoxElement.src = this.checkBoxElement.src.replace(/checkbox_(0|2)/i, 'checkbox_1');
                break;
            case 2:
                this.checkBoxElement.src = this.checkBoxElement.src.replace(/checkbox_(0|1)/i, 'checkbox_2');
                break;
        }
    }
    else if (this.treeView.checkBoxesVisible == 'SINGLE') {
        switch (checkedState) {
            case 0:
                this.checkBoxElement.checked = false;
                break;
            case 1:
                this.checkBoxElement.checked = true;
                break;
        }
    }
    this.checked = checkedState;
};

TreeNode.prototype.$traverseChildren = function () {
    /// <summary>遍历子节点, 让子节点的选中状态和父节点一致, 适用于当前节点选中状态为0和1的时候</summary>

    if (this.loaded && this.hasChildNodes()) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].checked != this.checked) {
                this.children[i].$toggleCheckBox(this.checked);
                this.children[i].$traverseChildren();
            }
        }
    }
};

TreeNode.prototype.$traverseParents = function () {
    /// <summary>遍历父节点, 改变父级节点的选中状态</summary>
    if (this.parentNode != null) {
        let checkState = this.checked;
        for (let i = 0; i < this.parentNode.children.length; i++) {
            if (this.parentNode.children[i].checked != checkState) {
                checkState = 2;
                break;
            }
        }
        if (this.parentNode.checked != checkState) { this.parentNode.$toggleCheckBox(checkState); }

        this.parentNode.$traverseParents();
    }
};

TreeNode.prototype.$getCheckedNodes = function () {
    /// <summary>获得当前节点子节点被checked的项, 被自己调用或在TreeView.getCheckedNodes中调用</summary>
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].checked == 1) { this.treeView.$checkedNodes.push(this.children[i]); }

        if (this.children[i].checked == 2 || this.treeView.checkBoxesVisible == 'SINGLE') { this.children[i].$getCheckedNodes(); }
    }
};

TreeNode.prototype.$expandAll = function () {
    /// <summary>展开所有子节点, 并继续向下传递</summary

    if (this.hasChildNodes()) {
        if (this.expanded) {
            for (let i = 0; i < this.children.length; i++) { this.children[i].$expandAll(); }
        }
        else {
            this.bind('onExpanded', 
                function () {
                    for (let i = 0; i < this.children.length; i++) { this.children[i].$expandAll(); }
                });
            this.expand(false);
        }
    }
}

TreeNode.prototype.$expandNodeByNode = function () {
    /// <summary>展开所有子节点, 在TreeView.expandAllNodeByNode中被调用</summary>

    if (this.hasChildNodes()) {
        if (this.expanded) {
            this.firstChild.$expandNodeByNode();
        }
        else {
            this.bind('onExpanded',
                function () {
                    if (this.children.length > 0) {
                        //如果有子节点, 就继续展开
                        this.firstChild.$expandNodeByNode();
                    }
                    else {
                        //如果没有子节点, 就回调自身查找下一个节点
                        this.$expandNodeByNode();
                    }
                }
            );
            this.expand(false);
        }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        let node = this;
        while (node.nextSibling == null) {
            if (node.parentNode == null) {
                node = null;
                break;
            }
            else {
                node = node.parentNode;
            }
        }
        if (node != null) {
            node = node.nextSibling;
            node.$expandNodeByNode();
        }
        else {
            if (!this.treeView.loaded) { this.treeView.preloadTo(this.treeView.preloadDepth); }
        }
    }
};

TreeNode.prototype.$collapseAll = function () {
    /// <summary>闭合所有子节点, 在TreeView.collapseAll中使用</summary>
    if (this.hasChildNodes()) {
        if (this.loaded) { this.firstChild.$collapseAll(); }
        if (this.expanded) { this.collapse(); }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        let node = this;
        while (node.nextSibling == null) {
            if (node.parentNode == null) {
                node = null;
                break;
            }
            else {
                node = node.parentNode;
            }
        }
        if (node != null) {
            node = node.nextSibling;
            node.$collapseAll();
        }
    }
};

TreeNode.prototype.$loadAll = function () {

    if (this.hasChildNodes()) {
        if (this.loaded) {
            for (let i = 0; i < this.children.length; i++) { this.children[i].$loadAll(); }
        }
        else {
            this.bind('onLoaded', 
                function () {
                    for (let i = 0; i < this.children.length; i++) { this.children[i].$loadAll(); }
                });
            this.load();
        }
    }
}

TreeNode.prototype.$loadNodeByNode = function () {
    /// <summary>展开所有子节点, 在TreeView.loadAll中使用</summary>
    if (this.hasChildNodes()) {
        if (this.loaded) {
            this.firstChild.$loadAll();
        }
        else {
            this.bind('onLoaded',
                function () {
                    if (this.firstChild != null) {
                        this.firstChild.$loadNodeByNode();
                    }
                    else {
                        this.$loadNodeByNode();
                    }
                }
            );
            this.load();
        }
    }
    else {

        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        let node = this;
        while (node.nextSibling == null) {
            if (node.parentNode == null) {
                node = null;
                break;
            }
            else {
                node = node.parentNode;
            }
        }
        if (node != null) {
            node = node.nextSibling;
            node.$loadNodeByNode();
        }
        else {
            if (!this.treeView.loaded) {
                this.treeView.selectNodeByPath(this.treeView.pathToSelect); 
            }
        }
    }
};

TreeNode.prototype.$expandTo = function (depth) {
    /// <summary>依次展开节点到指定的深度, 在TreeView.expandTo方法中被调用</summary>

    if (depth > this.depth && this.hasChildNodes()) {
        if (this.expanded) {
            this.firstChild.$expandTo(depth);
        }
        else {
            this.bind('onExpanded',
                function () {
                    if (this.firstChild != null) {
                        this.firstChild.$expandTo(depth);
                    }
                    else {
                        this.$expandTo(depth);
                    }
                }
            );
            this.expand(false);
        }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        let node = this;
        while (node.nextSibling == null) {
            if (node.parentNode == null) {
                node = null;
                break;
            }
            else {
                node = node.parentNode;
            }
        }

        if (node != null) {
            node = node.nextSibling;
            node.$expandTo(depth);
        }
        else {
            if (!this.treeView.loaded) {
                this.treeView.preloadTo(this.treeView.preloadDepth); 
            }
        }
    }
};

TreeNode.prototype.$preloadTo = function (depth) {
    /// <summary>依次展开节点到指定的深度, 在TreeView.expandTo方法中被调用</summary>

    if (depth > this.depth && this.hasChildNodes()) {
        if (this.expanded) {
            this.firstChild.$preloadTo(depth);
        }
        else {
            this.bind('onLoaded',
                function () {
                    if (this.firstChild != null) {
                        this.firstChild.$preloadTo(depth);
                    }
                    else {
                        this.$preloadTo(depth);
                    }
                });
            this.load();
        }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        let node = this;
        while (node.nextSibling == null) {
            if (node.parentNode == null) {
                node = null;
                break;
            }
            else {
                node = node.parentNode;
            }
        }

        if (node != null) {
            node = node.nextSibling;
            node.$preloadTo(depth);
        }
        else {
            if (!this.treeView.loaded) {
                this.treeView.selectNodeByPath(this.treeView.pathToSelect);
            }
        }
    }
};

TreeNode.prototype.$selectNodeByPath = function (names) {
    /// <summary>根据路径选择一个节点, 在TreeView.selectNodeByPath中被调用</summary>	
    /// <param name="names" type="String">节点name数组</param>

    let index = -1;
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    let finished = true;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.children[index].loaded) {
                if (!this.children[index].expanded) this.children[index].expand(false);
                this.children[index].$selectNodeByPath(names);
            }
            else {
                this.children[index].bind('onExpanded', 
                    function () {
                        this.$selectNodeByPath(names);
                    });
                this.children[index].expand(false);
            }
            finished = false;
        }
        else {
            //在这个方法里默认不触发事件
            this.children[index].select(false);
        }
    }

    if (finished) {
        if (!this.treeView.loaded) { this.treeView.checkNodesByPaths(this.treeView.pathsToCheck); }
    }
};

TreeNode.prototype.$checkNodeByPath = function (paths, names) {
    /// <summary>根据路径选中一个节点, 在TreeView.prototype.$checkNodeByPath中被调用</summary>
    /// <param name="paths" type="Array" elementType="String">节点path数组</param>
    /// <param name="names" type="String">节点name数组</param>

    let index = -1;
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    let finished = false;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.children[index].loaded) {
                this.children[index].$checkNodeByPath(paths, names);
            }
            else {
                this.children[index].bind('onExpanded', 
                    function () {
                        this.$checkNodeByPath(paths, names);
                    });
                this.children[index].expand(false);
            }
        }
        else {
            this.children[index].check(false);

            //查找下一个节点
            paths.splice(0, 1);
            if (paths.length > 0) {
                this.treeView.$checkNodeByPath(paths, paths[0]);
            }
            else {
                //查找完成
                finished = true;
            }
        }
    }

    if (finished) {
        if (!this.treeView.loaded) { this.treeView.$completeLoading(); }
    }
};

TreeNode.prototype.$checkAll = function () {
    /// <summary>SINGLE模式下, 选中已呈现的所有节点, 在 TreeView.checkAll中被使用</summary>

    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].checked == 0) {
            this.children[i].check(false);
        }
        if (this.children[i].hasChildNodes() && this.children[i].loaded) {
            this.children[i].$checkAll();
        }
    }
}

TreeNode.prototype.$uncheckAll = function () {
    /// <summary>SINGLE模式下, 取消选中已呈现的所有节点, 在 TreeView.uncheckAll中被使用</summary>
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].checked == 1) {
            this.children[i].uncheck(false);
        }
        if (this.children[i].hasChildNodes() && this.children[i].loaded) {
            this.children[i].$uncheckAll();
        }
    }
}

TreeNode.prototype.$setLines = function () {
    /// <summary>设置分支线, 100毫秒后执行</summary>

    if (this.treeView.lines == 'VISIBLE') {
        let node = this;
        if (node.parentNode != null && !node.parentNode.expanding && !node.parentNode.expanded) {
            //未展开的节点不能设置lines, 在展开后才设置
            node.parentNode.bind('onExpanded', function () { TreeNode.$setLines(node); });
        }
        else {
            window.setTimeout(function () { TreeNode.$setLines(node); }, 100);
        }
    }
}

TreeNode.$setLines = function (node, t) {
    /// <summary>设置节点的分支线</summary>
    /// <param name="node" type="TreeNode">节点</param>
    /// <param name="t" type="Boolean">是否遍历子节点</param>

    if (node.treeView != null) {
        //Line 2, Line 3
        let burl = node.burlImage.parentNode;
        let w = burl.offsetWidth;

        if (w <= node.padding * 2) {
            //burl节点单元格中的图片未下载完成, 100毫秒之后再执行, 目前适用于Firefox
            window.setTimeout(function () { TreeNode.$setLines(node, t); }, 100);
        }
        else {
            //下载完成后才计算背景位置
            let f = node.isFirst();
            let l = node.isLast();

            burl.style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_' + (l ? '2' : '3') + '.gif)';
            if (f) {
                //3个背景线的宽和高为200, 计算背景线应该显示在什么位置

                let h = burl.offsetHeight;
                let x = (200 - w) / 2 + (w % 2);
                let y = (200 - h) / 2 + (h % 2);
                x = Math.floor(x);
                y = Math.floor(y);
                burl.style.backgroundPosition = '-' + x + 'px -' + y + 'px';
            }
            else {
                burl.style.backgroundPosition = node.previousSibling.burlImage.parentNode.style.backgroundPosition;
            }
            burl.setAttribute('line', (l ? '2' : '3'));

            //最后一个节点要检查上一个节点
            if (l && !f) {
                if (node.previousSibling.burlImage.parentNode.getAttribute('line') == '2') {
                    node.previousSibling.burlImage.parentNode.style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_3.gif)';
                }

                TreeNode.$setChildLines(node.previousSibling);
            }

            //Line 1
            if (node.depth > 1) {
                let parent = node.parentNode;
                let prev = burl.previousSibling;
                //父级节点不是最后一级才添加线, 否则删除线
                while (parent != null) {
                    if (!parent.isLast()) {
                        prev.style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_1.gif)';
                        prev.style.backgroundPosition = parent.burlImage.parentNode.style.backgroundPosition;
                    }
                    else {
                        prev.style.backgroundImage = '';
                        prev.style.backgroundPosition = '';
                    }

                    parent = parent.parentNode;
                    prev = prev.previousSibling;
                }
            }

            //设置间隔中的lines
            if (node.spacing > 0) {
                //TreeNode.DIV<ROW>.DIV<SPACING>.TABLE
                TreeView.$setPaddingOrSpacingLines(node, node.primeDiv.previousElementSibling.firstElementChild);
                //TreeView.$setPaddingOrSpacingLines(node, node.childrenDiv.nextElementSibling.firstElementChild);
            }
            

            //设置childrenPadding的lines
            if (node.depth > 1 && node.parentNode.childrenPadding > 0) {
                if (node.isFirst()) {
                    //TreeNode.DIV<ROW>.DIV<CHILDREN>.DIV<CHILDRENPADDING>.TABLE
                    TreeView.$setPaddingOrSpacingLines(node, node.primeDiv.parentNode.firstElementChild.firstElementChild);
                }

                if (node.isLast()) {
                    TreeView.$setPaddingOrSpacingLines(node, node.primeDiv.parentNode.lastElementChild.firstElementChild);
                }
            }

            //遍历子节点
            if (t) {
                TreeNode.$setChildLines(node);
            }
        }
    }
}


TreeNode.$setChildLines = function (n) {
    if (n.hasChildNodes() && n.loaded && n.childrenDiv.innerHTML != '') {
        for (let i = 0; i < n.children.length; i++) {
            TreeNode.$setLines(n.children[i], true);
        }
    }
}

TreeNode.increment = 0;
TreeNode.$parseName = function() {
    while($s('#TreeNode_' + TreeNode.increment) != null) {
        TreeNode.increment++;
    }
    return 'TreeNode_' + TreeNode.increment;
}

/// <summary>TreeNode 私有事件</summary>

//TreeNode.onExpanded = {};
//TreeNode.onCollapsed = {};
//TreeNode.onLoaded = {};
//TreeNode.onAppended = {};
//TreeNode.onInserted = {};
//TreeNode.onRemoved = {};
//TreeNode.onDropped = {};
//TreeNode.onEdited = {};
//TreeNode.onCopied = {};
//TreeNode.onMoved = {};
//TreeNode.onSelected = {};
//TreeNode.onUnselected = {};
//TreeNode.onChecked = {};
//TreeNode.onUnchecked = {};
//TreeNode.onNavigate = {};
//TreeNode.onBurled = {};
//TreeNode.onUnburled = {};

//TreeNode事件为一次性事件
// eventName -> [eventFunc]
TreeNode.prototype.$events = new Object();

// func 必须
TreeNode.prototype.bind = function(eventName, func) {
    if (this.$events[eventName] == null) {
        this.$events[eventName] = [];
    }
    this.$events[eventName].push(func);

    return this;
}

//执行一次性事件
TreeNode.prototype.fire = function(eventName, ...args) {
    if (this.$events[eventName] != null) {
        for (let i = 0; i < this.$events[eventName].length; i++) {
            this.$events[eventName][i].call(this, ...args);
        }
        this.$events[eventName].length = 0;
    }    
}

/**********
	
全局属性或方法
	
**********/

/// <value type="TreeNode">剪贴板, 用于 copy 和 move、drag & drop，存储单个节点</value>
TreeView.clipBoard = {
    treeNode: null, //原始节点
    action: '', //允许值 COPY, MOVE, DRAGCOPY, DRAGMOVE
    $expanding: false, //是否正在展开节点已完成拖放, 在dragend里判断
    clear: function () { //清空剪贴板的数据
        this.treeNode = null;
        this.action = '';
        this.$expanding = false;
    }
};

/// <value type="TreeNode">正在激活的TreeView, 用于键盘事件</value>
TreeView.activeTreeView = null;

/// <value type="Element:DIV">正在激活的拖放线, 只有当某个拖放线激活时才会有值，解决dragLeave时拖放线不隐藏的问题</value>
TreeView.$dropLine = null;
/// <value type="Array" elementType="String:Color">各隐藏颜色</value>
TreeView.$dropLineColors = ['#000000', '#33CC33', '#FF0000', '#FF9900', '#9900FF', '#00CCCC', '#99FF00', '#0000FF', '#CC9900', '#FF0099'];

TreeView.$populateDropLine = function (refNode, isLast) {
    /// <summary>装配DropLine元素</summary>
    /// <value name="refNode" type="String">dropLine的参考节点, 一般指下一个</value>

    let dropLine, line;

    dropLine = $create('DIV');
    dropLine.setAttribute('sign', 'DROPLINE');

    let height = (isLast ? 0 : refNode.spacing);
    //dropLine的最小高度是5
    dropLine.style.height = (height + 6) + 'px';
    dropLine.style.position = 'relative';
    dropLine.style.zIndex = refNode.depth;
    dropLine.style.top = '-3px';
    //dropLine.style.backgroundColor = '#90F';
    dropLine.style.backgroundColor = 'transparent';
    //设置paddingTop会增大dropLine的高度
    //dropLine.style.paddingTop = Math.round((height - 1) / 2) + 'px';
    dropLine.setAttribute('parent', refNode.depth > 1 ? refNode.parentNode.name : '');
    dropLine.setAttribute('color', TreeView.$dropLineColors[(refNode.depth - 1) % 10]);

    //标识线
    line = $create('DIV');
    line.style.height = Math.round((height + 6 - 1) / 2) + 'px';
    dropLine.appendChild(line);

    line = $create('DIV');
    line.style.height = '1px';
    line.style.fontSize = '9px';
    line.style.color = dropLine.getAttribute('color');
    line.innerHTML = '&nbsp;';
    //line.style.marginTop = Math.round((height + 6) / 2) + 'px';
    //line.style.marginBottom = Math.round((height - 1) / 2) + 'px';

    dropLine.appendChild(line);

    if (refNode.treeView.nodeCellStyle != 'ROW') {
        //if (refNode.depth == 2) {
        //  dropLine.style.marginLeft = refNode.indent + 'px';
        //}
        //else if (refNode.depth > 2) {
        //  dropLine.style.marginLeft = (parseInt(refNode.parentNode.tableElement.style.marginLeft) + refNode.indent) + 'px';
        //}
        let indent = 0;
        while (refNode.depth > 1) {
            indent += refNode.indent + refNode.padding * 2;
            refNode = refNode.parentNode;
        }
        dropLine.style.marginLeft = indent + 'px';
    }

    //事件开始
    let tTreeView = refNode.treeView;
    dropLine.ondragover = function (ev) {
        let originalNode = TreeView.clipBoard.treeNode;

        //只接受节点拖入
        if (originalNode == null) {
            return false;
        }

        let oTreeView = originalNode.treeView;

        let parent = this.parentNode.getAttribute('parent');
        let prev = this.parentNode.getAttribute('prev');
        let next = this.parentNode.getAttribute('next');

        let droppable = true;

        //不能拖放到临近的dropLine
        if (tTreeView == oTreeView) {
            if (prev == originalNode.name || next == originalNode.name) { droppable = false; }
        }

        //dropChildEnabled 为 false 表示仅排序
        if (!tTreeView.dropChildEnabled) {
            if (tTreeView == oTreeView) {
                if (parent != '') {
                    if (parent != originalNode.parentNode.name) { droppable = false; }
                }
                else {
                    if (originalNode.depth > 1) { droppable = false; }
                }
            }
            else {
                droppable = false;
            }
        }

        // 根节点间的dropLine不能被放置, 只保留根节点排序
        if (!tTreeView.dropRootEnabled) {
            /*
            当原节点和线都属于同一个树
            当原节点和根节点depth = 1
            parent == ''
            */
            if (parent == '') { droppable = (tTreeView == oTreeView && originalNode.depth == 1); }
        }

        if (droppable) {
            ev.preventDefault();

            TreeView.$highlightDropLine(this);
        }
    }

    dropLine.ondragleave = function (ev) { TreeView.$restoreDropLine(this); }

    dropLine.ondrop = function (ev) {
        //源节点
        let originalNode = TreeView.clipBoard.treeNode;
        //let oTreeView = originalNode.treeView;

        //目标树 tTreeView

        let parent = this.parentNode.getAttribute('parent');
        let prev = this.parentNode.getAttribute('prev');
        let next = this.parentNode.getAttribute('next');

        let pNode = null, nNode = null; //previous node & next node
        if (prev != '') { pNode = tTreeView.getNodeByName(prev); }
        if (next != '') { nNode = tTreeView.getNodeByName(next); }

        //被拖放的节点, after drop
        //先克隆
        let node = originalNode.clone();

        //处理原节点        
        if (TreeView.clipBoard.action == 'DRAGMOVE') {
            //删除原节点
            originalNode.remove(false);
        }

        if (parent != '') {
            //不是根节点
            if (nNode != null) {
                nNode.parentNode.insertBefore(node, nNode);
                node = nNode.previousSibling;
            }
            else {
                pNode.parentNode.appendChild(node);
                node = pNode.parentNode.lastChild;
            }
        }
        else {
            //是根节点
            if (nNode != null) {
                tTreeView.insertBefore(node, nNode);
                node = nNode.previousSibling;
            }
            else {
                tTreeView.appendChild(node);
                node = tTreeView.lastChild;
            }
        }

        //选中新节点
        node.select(false);

        //执行事件
        if (TreeView.clipBoard.action == 'DRAGMOVE') {
            tTreeView.execute('onNodeMoved', node);
        }
        else if (TreeView.clipBoard.action == 'DRAGCOPY') {
            tTreeView.execute('onNodeCopied', node);
        }
        //拖放到DropLine
        tTreeView.execute('onNodeDropped', node);

        //结束拖放事件
        ev.preventDefault();
        ev.stopPropagation();

        //恢复样式
        TreeView.$restoreDropLine(dropLine);
        //this.lastChild.className = '';
        //this.lastChild.style.backgroundColor = '';
        //this.lastChild.innerHTML = '&nbsp;';

        //拖放正常结束事件
        Event(tTreeView, 'onNodeDragEnd', node);
    }

    return dropLine;
}

TreeView.$highlightDropLine = function (dropLine) {
    /// <summary>将dropLine显示出来</summary>
    /// <value name="dropLine" type="Element:DIV"></value>

    dropLine.lastChild.className = 'dropLineDefaultClass';
    dropLine.lastChild.style.backgroundColor = dropLine.getAttribute('color');
    //dropLine.lastChild.style.borderBottom = '1px solid ' + dropLine.getAttribute('color');
    dropLine.lastChild.innerHTML = dropLine.style.zIndex;

    TreeView.$dropLine = dropLine;
}

TreeView.$restoreDropLine = function (dropLine) {
    /// <summary>将dropLine还原成默认样式</summary>
    /// <value name="dropLine" type="Element:DIV"></value>

    if (dropLine == null) { dropLine = TreeView.$dropLine; }

    if (dropLine != null) {
        dropLine.lastChild.className = '';
        dropLine.lastChild.style.backgroundColor = '';
        //dropLine.lastChild.style.borderBottom = '';
        dropLine.lastChild.innerHTML = '&nbsp;';

        TreeView.$dropLine = null;
    }
}

TreeView.$populateLinesSpacing = function (refNode) {
    /// <summary>装配显示间隔Lines的table</summary>
    /// <value name="refNode" type="TreeNode">参考节点</value>

    let table, tbody, tr, td

    table = $create('TABLE');
    table.cellPadding = 0;
    table.cellSpacing = 0;
    table.setAttribute('sign', 'LINES');
    table.style.position = 'absolute';
    table.style.zIndex = 0;
    table.style.height = refNode.spacing + 'px';


    tbody = $create('TBODY');
    tr = $create('TR');

    //td的宽度在setLine时设置
    for (let i = 0; i < refNode.depth; i++) {
        td = $create('TD');
        //td.style.backgroundColor = '#F0C';
        tr.appendChild(td);
    }

    tbody.appendChild(tr);
    table.appendChild(tbody);

    return table;
}

TreeView.$populateChildrenPadding = function (node, l) {
    /// <summary>当lines == 'VISIBLE'为true时, 装配显示ChildNodesPadding Lines的DIV</summary>
    /// <value name="node" type="TreeNode">父级节点</value>
    /// <value name="l" type="String">位置 top 或 bottom</value>

    let div, table, tbody, tr, td;

    div = $create('DIV');
    div.setAttribute('sign', 'CHILDRENPADDING');
    div.style.height = node.childrenPadding + 'px';

    table = $create('TABLE');
    table.cellPadding = 0;
    table.cellSpacing = 0;
    table.style.height = node.childrenPadding + 'px';

    tbody = $create('TBODY');
    tr = $create('TR');

    for (let i = 0; i <= node.depth - (l == 'bottom' ? 1 : 0); i++) {
        td = $create('TD');
        //td.style.backgroundColor = '#FC9';
        //td.innerHTML = i;
        tr.appendChild(td);
    }

    tbody.appendChild(tr);
    table.appendChild(tbody);
    div.appendChild(table);

    return div;
}

TreeView.$setPaddingOrSpacingLines = function (node, table) {
    /// <summary>设置ChildNodesPadding或Spacing的lines</summary>
    /// <value name="node" type="TreeNode">参考节点</value>
    /// <value name="table" type="HTMLTable">显示lines的Table</value>

    for (let i = 0; i < table.rows[0].cells.length; i++) {
        table.rows[0].cells[i].style.width = node.tableElement.rows[0].cells[i].offsetWidth + 'px';

        if (node.tableElement.rows[0].cells[i].style.backgroundImage != '') {
            table.rows[0].cells[i].style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_1.gif)';
            table.rows[0].cells[i].style.backgroundPosition = node.tableElement.rows[0].cells[i].style.backgroundPosition;
        }
        else {
            table.rows[0].cells[i].style.backgroundImage = '';
            table.rows[0].cells[i].style.backgroundPosition = '';
        }
    }
}

TreeView.initializeAll = function() {
    document.querySelectorAll('treeview').forEach(treeView => {
        new TreeView(treeView).load();
    });

    $x(document).bind('click', function (ev) {

        let target = ev.target;

        //设置活动的TreeView
        while (target != null && target.nodeName != 'HTML' && target.getAttribute('sign') != 'TREEVIEW') {
            target = target.parentNode;
        }
        if (target != null && target.getAttribute('sign') == 'TREEVIEW') {
            TreeView.activeTreeView = document.components.get(target.id);
        }
        else {
            TreeView.activeTreeView = null;
        }

        //隐藏OptionBox:ContextMenu
        if (ev.button == 0) {
            for (let tv of document.components.values()) {
                if (tv.tagName == 'TREEVIEW') {
                    if (tv.optionBox != null && tv.optionBox.display == 'CONTEXTMENU' && tv.optionBox.visible) {
                        target = ev.target || ev.srcElement;
                        while (target.nodeName != 'HTML' && target.getAttribute('sign') != 'TREEVIEWCONTEXTMENU') {
                            target = target.parentNode;
                        }
                        tv.optionBox.hide(target.nodeName != 'HTML');
                    }
                }
            }
        }
    });

    //添加键盘事件
    $x(document).bind('keyup', function (ev) {
        let treeView = TreeView.activeTreeView;
        if (treeView != null) {
            //启用了键盘导航, 有节点被选择, 节点被有被编辑
            if (treeView.keyboardEnabled && treeView.selectedNode != null && !treeView.selectedNode.editing) {
                //space 32
                //←↑→↓ 37,38,39,40
                //esc 27
                //enter 13
                //→ 展开
                //← 闭合
                //↑ 上一个节点
                //↓ 下一个节点
                //Enter Navigate
                //Esc UnSelect
                //Space Check/UnCheck
                let treeNode = treeView.selectedNode;
                let keys = {
                    //Space
                    32: function () {
                        if (treeView.checkBoxesVisible != 'NONE') {
                            if (treeNode.checked == 0) {
                                treeNode.check();
                            }
                            else {
                                treeNode.uncheck();
                            }
                        }
                    },
                    //←
                    37: function () {
                        if (treeNode.expanded) { treeNode.collapse(); }
                    },
                    //↑
                    38: function () {
                        if (treeNode.previousSibling != null) {
                            if (treeNode.previousSibling.hasChildNodes && treeNode.previousSibling.expanded) {
                                treeNode.previousSibling.lastChild.select(ev);
                            }
                            else {
                                treeNode.previousSibling.select(ev);
                            }
                        }
                        else if (treeNode.parentNode != null) {
                            treeNode.parentNode.select(ev);
                        }
                    },
                    //→
                    39: function () {
                        if (!treeNode.expanded && treeNode.hasChildNodes) { treeNode.expand(); }
                    },
                    //↓
                    40: function () {
                        if (treeNode.hasChildNodes && treeNode.expanded) {
                            treeNode.firstChild.select(ev);
                        }
                        else if (treeNode.nextSibling != null) {
                            treeNode.nextSibling.select(ev);
                        }
                        else if (treeNode.parentNode != null && treeNode.parentNode.nextSibling != null) {
                            treeNode.parentNode.nextSibling.select(ev);
                        }
                    },
                    //Enter
                    13: function () {
                        if (!treeNode.editing) {
                            treeNode.navigate();
                        }
                    },
                    //Esc
                    27: function () {
                        if (treeNode.treeView.optionBox != null && treeNode.treeView.optionBox.display == 'CONTEXTMENU' && treeNode.treeView.optionBox.visible) {
                            treeNode.treeView.optionBox.hide();
                        }
                        else {
                            treeNode.deselect();
                            if (treeNode.treeView.optionBox != null && treeNode.treeView.optionBox.display == 'TOP') {
                                treeNode.treeView.optionBox.target = null;
                                treeNode.treeView.optionBox.show();
                            }
                        }
                    },
                    //Delete
                    46: function () {
                        if (!treeNode.editing) { treeNode.remove(); }
                    }
                    ,
                    //Shift+E
                    's69': function () { treeNode.edit(); },
                    //Ctrl+X
                    'c88': function () { treeNode.cut(); },
                    //Ctrl+C
                    'c67': function () { treeNode.copy(); },
                    //Ctrl+V
                    'c86': function () { treeNode.paste(); }
                }

                if (ev.ctrlKey) {
                    if (treeView.keyboardCutCopyPasteEnabled) {
                        if (ev.keyCode == 88 || ev.keyCode == 67 || ev.keyCode == 86) { keys['c' + ev.keyCode](); }
                    }
                }
                else if (ev.shiftKey) {
                    if (treeView.nodeEditingEnabled) {
                        if (ev.keyCode == 69) { keys['s' + ev.keyCode](); }
                    }
                }
                else {
                    if (keys[ev.keyCode] != null) { keys[ev.keyCode](); }
                }
            }

            //ev.stopImmediatePropagation();
            ev.preventDefault();
            ev.stopPropagation();

            return false;
        }
    });
}

$finish(function() {
    TreeView.initializeAll();
})

/**********
扩展方法
**********/

String.prototype.isImage = function() {
    return /\.(jpg|png|gif|jpeg)$/i.test(this.toString());
}