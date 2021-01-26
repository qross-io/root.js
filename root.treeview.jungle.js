//-----------------------------------------------------------------------
// <TreeView> Root.TreeView.js
//-----------------------------------------------------------------------
// Jungle v1.0 Beta
//-----------------------------------------------------------------------
// http://jroot.net
// Any probolem, question, idea or bug, please email to wuguo@live.cn
//-----------------------------------------------------------------------
// Created at 2011/8/2 22:33
// Realsed at 2011/12/21 17:21
// Updated at 2015/7/30 17:47

// Features
// Load-on-demand by Xml or JSON dataSource
// Powerful data mappings
// Unlimited levels
// Tristate checkBoxes
// Node-text-editing enabledf
// Keyboard navigation and copy & paste enabled
// Drag & drop supported (IE10, Firefox, Chrome, Opera)
// Internal node options
// Node text & tip supports html
// Kinds properties, methods and events

// Customizable node properties for transfering data
// CSS style supported
// Customizable images (node, expand, collaspse, loading)
// Customizable padding & spacing

/*
TreeView Tag Example

	<TreeView ID="TreeView1"	
		NodeCellStyle="TEXT|ROW" NodeIndent="Integer" NodeSpacing="Integer" NodePadding="Integer" ChildNodesPadding="Integer"
		Class="ClassName" NodeClass="ClassName" HoverNodeClass="ClassName" SelectedNodeClass="ClassName" NodeEditClass="ClassName" CutNodeClass="ClassName" SelectedHoverNodeClass="ClassName" NodeTipClass="ClassName" DropChildClass="ClassName"
		ImagesBaseUrl="Images Path" CollapseImageUrl="" ExpandImageUrl="" ContentLoadingImageUrl="" NoExpandImageUrl=""
		ShowBurls="true" ShowImages="true" ShowCheckBoxes="FALSE,NONE|SINGLE|TRUE,RELATIVE" ShowLines="Boolean"
		Enabled="Boolean" NodeEditingEnabled="TRUE|DBLCLICK|SHIFT_E|FALSE" DragAndDropEnabled="Boolean"
             KeyboardEnabled="true" KeyboardCutCopyPasteEnabled="" DropChildEnabled="" DropRootEnabled="" ExternalDropTargets=""	
		ExpandOnSelect="Boolean" CollapseOnSelect="Boolean"
		PathToSelect="TreeNodePath" PathsToCheck="TreeNodePaths" ExpandDepth="Integer" PreLoadDepth="Integer"
		OnLoaded="Function"
		OnNodeExpanded="Function" OnNodeCollapsed="Function"
        OnNodeHover="Function"
		OnNodeSelected="Function" OnNodeCheckChanged="Function"
		OnNodeCopied="Function" OnNodeMoved="Function"
        OnNodeDropStart="Function" OnNodeDropEnd="Function"
        OnNodeDropped="Function" OnNodeExternalDropped="Function"
        OnNodeRemove="Function"
		OnNodeTextChanged="Function"
		OnNodeOptionsBoxShow="Function"
        OnNodeOptionClick="Function"
		OnNodeNavigate="Function"		
		DataSource="Xml|Json">

    	<TreeNode Name="IdentityKey" Text="String" Value="String" Title="String" Tip="HTML" ImageUrl="ImagePath" ExpandedImageUrl="" NavigateUrl="Url|Path" Target="_blank|_parent|frameName"
		Draggable="Boolean" Droppable="Boolean" Editable="Boolean"
		Indent="Integer" Padding="Integer" Spacing="Integer" ChildNodesPadding="Integer"
		Class="ClassName" HoverClass="ClassName" TipClass="ClassName" CutClass="ClassName" SelectedClass="ClassName" SelectedHoverClass="ClassName" DropClass="ClassName"
		DataSource="Xml|Json"></TreeNode>

        <DataMapping Url="String|RegularExpression" ParseOnly="Boolean">
	        <Map Tag="TagName" Object="ObjectName" Name="{Field}" Text="javascript:" Value="" ImageUrl="" NavigateUrl="" Target=""></Map>
	        ......
        </DataMapping>

        <NodeOptions Display="contextmenu|follow|right|top">
            <NodeOption Type="normal|seperator" Name="" Text="" Title="" ImageUrl="" Enabled="" Visible=""></NodeOption>
            <NodeOption Type="Separator" Enabled="" Visible=""></NodeOption>
        </NodeOptions>
	
	</TreeView>

    [
        {
            name:''
            text:'',
            value:'',
            title:'',
            tip:'',
            imageUrl:'',
            expandedImageUrl:'',
            navigateUrl:'',
            target:'',

            draggable:'inherit',
            droppable:'',
            editable:'',

            indent:'inherit',
            padding:'inherit',
            spacing:'inherit',
            childNodesPadding:'inherit',

            cssClass:'',
            hoverClass:'',
            selectedClass:'',
            selectedHoverClass:'',
            tipClass:'',
            cutClass:'',
            editClass:'',
            dropClass:'',
            
            dataSource:''
        },
        {
            ...
        }
    ]

*/

/*
为了兼容IE9以下版本(事件绑定中的this会被识别为window), 事件绑定并没有通过 addEventListener 附加到元素上, 只能直接指定, 如 a.onclick。

What's new in TreeView 1.0? (Release 2011/12/21)

TreeView
1. # 大量属性、方法和事件被加入, 修改了少量原来属性名称以表意更明确, 移除了一些样式属性。
2. # Drag & Drop 加入, 目前仅支持 Firefox 和 Chrome
3. # Node Editing 加入
4. # 增加对 Json 数据类型的支持。因为增加和修改了大量节点属性, 数据源格式也有相同的变化。XML数据仍然不区分大小写, JSON数据格式区分大小写。
5. # 键盘复制/剪切/粘贴操作加入
6. # Node Tip 加入
7. # 使用了 HTML5 的一些属性
8. # 内置了ContectMenu

TreeView Basic
1. # 属性 xml 名称更改为 dataSource, 增加了对json数据的支持
2. # 属性 images 名称修改为 imagesBaseUrl
3. # 增加 4个图片属性, 以定义更多的显示样式
    1) collapseImageUrl burl-
    2) expandImageUrl burl+
    3) contentLoadingImageUrl spinner
    4) noExpandImageUrl blank.gif
4. # 增加 collapseOnSelect 属性, 用来定义在选择一个被打开的节点时是否自动闭合, 默认false
5. # 属性 selectedPath 名称更改为 pathToSelect
6. # 属性 checkedPaths 名称更改为 pathsToCheck
7. # 增加 preloadDepth 属性 和 preloadTo 方法, 用来预加载节点
8. # 所有事件名称采用 camel 命名法重命名, 并增加时态以备将来扩展, 事件列表：
    1) onLoaded TreeView加载完成后触发
    2) onNodeCollapsed 节点闭合时触发
    3) onNodeExpanded 节点打开时触发
    4) onNodeSelected 节点选择时触发
    5) onNodeCheckChanged 节点选中状态改变时触发
    6) onNodeCopied 复制后触发 - 键盘事件
    7) onNodeMoved 移动后触发 - 键盘事件 
    8) onNodeDropped 拖放结束后触发
    9) onNodeExternalDropped 拖放到外部元素时触发
    10) onNodeOptionsBoxShow 打到右键菜单之前
    11) onNodeOptionClick 右键菜单项被点击时
    12) onNodeNavigate 打开节点链接时触发
    13) onNodeTextChanged 节点文字改变时触发
    14) onNodeRemove 节点被删除之前触发，支持return
    15) onNodeDragOver 拖放到其他节点时触发，支持return
9. # showCheckBoxes属性修改为3个值: NONE, SINGLE, RELATIVE, SINGLE表示显示独立的CheckBox
10. # 数据映射
   
    Xml格式中的Tag和Json格式中的Object在表达式中要用中括号括起来, 如[TagName],表示计算这个Tag或Object的值
    Xml格式中映射如果没有设置tag, 则表示根节点
    Json格式中映射如果指向根对象，则object必须设置为空

TreeView Style
1. # 移除 width, height 属性
2. # 移除 theme, backColor, borderWidth, borderStyle, borderColor 属性
3. # 增加 7种Css样式属性
    1) cssClass TreeView样式, 名称"class"不被IE兼容
    2) cutNodeClass 剪切中的节点样式, 默认无, 透明度 50%
    3) hoverNodeClass 鼠标划过节点样式
    4) nodeClass 默认节点样式, 默认无
    5) nodeEditClass 编辑节点文本时的文本框样式, 默认无
    6) nodeTipClass 节点提醒文字样式, 默认无
    7) selectedHoverNodeClass 选中节点的鼠标划过样式, 默认无, 即与选中节点
    8) dropChildClass 表示当拖动的节点Hover到可放置节点时 可放置节点的样式
4. # 增加 nodeCellStyle 属性, 用来定义鼠标划过或选择节点时的样式范围, 可选
    1) TEXT 默认值, 只文字
    2) ROW 整行

TreeNode Editing
1. # 增加 nodeEidtingEnabled 属性, 设置为true时启用节点编辑
2. # 增加 nodeEditClass 设置节点编辑下的输入框样式

TreeView Keyboard - Copy & Move
1. # 增加了 keyboardEnabled 属性来指标是否启用键盘导航 → ← ↑ ↓ Enter DELETE Shift+E
2. # 增加了 keyboardCutCopyPasteEnabled 属性来启用节点复制和移动

TreeView Drag & Drop
1. # 增加 dragAndDropEnabled 属性，表示是否启用拖放, 默认false
2. # 增加 dropChildClass 属性，表示当拖动的节点Hover到可放置节点时 可放置节点的样式
3. # 增加 dropChildEnabled 属性, 表示是否可以放置到没有子节点的节点中, 默认true, false表示只能排序
4. # 增加 dropRootEnabled 属性, 表示是否可以放置为根节点, 默认true
5. # 支持多个树形之间的拖放
6. # 增加 externalDropTargets 属性, 设置从TreeView拖放到其他类型元素的ID列表(逗号分开), 支持

TreeNode General
1. # 增加 indent, padding, spacing, childNodesPadding 属性, 用来定义缩进和间距, 默认从TreeView继承
2. # 增加 cssClass, hoverClass, selectedClass, selectedHoverClass, cutClass, tipClass, dropClass 共7个样式属性, 节点样式优先于树形中定义的样式
3. # 增加 index 属性, 用来表示节点在同级节点中的位置
4. # 增加 draggable, droppable, editable 属性, 用来支持拖放和节点编辑
5. # 增加 copy, cut, paste 方法, 与TreeView键盘事件和拖放事件对应
6. # 增加 edit, reset 方法用来编辑节点
7. # 增加 navigate 方法用来打开节点的链接

TreeNode Tip
1. # Tip 显示在文本的后面, 表示提醒信息, 如“未读邮件数量”。
2. # 通过TreeView.nodeTipClass和TreeNode.tipClass对Tip样式进行控制。
3. # 通过TreeNode.updateTip方法更新Tip内容
4. # Tip支持HTML
*/

/*
2015/7/30 修正了TreeView removeAll时不清除选择节点的bug
2015/1/19 增加onExternalElementDropped事件, 支持外部元素拖入
2015/1/16 showCheckBoxes增加在标签中true和false的设置支持
2014/12/24 增加事件onNodeDragStart, onNodeDragEnd
修正了执行removeAll方法时没有删除多余SPACING的问题
修正了执行reload方法时多次附加externalTargets事件的问题
2014/12/23 修正了执行reload方法时添加多个nodeOptionsBox元素的问题
2014/7/26 修正了连续点击右键菜单显示空白菜单的问题
NodeOption.box属性名称修改为 nodeOptionsBox
2013/5/9 修正了removeAll方法同时移除NodeOption的DIV的Bug
2013/5/7 修正了当NodeCellStyle为ROW时，鼠标划过和节点选项冲突的bug
为TreeView增加showBurls属性
2013/4/27 节点增加html属性
2013/4/26 修正IE10-对classList属性的支持问题
IE 6不再被支持
2013/4/25 修正NodeOptions.Top的样式
2013/3/21 增加子标签NodeOptions和Option及相应的对象NodeOptionsBox和NodeOption
ContextMenu被整合进NodeOptions
2013/3/12 增加onNodeHover事件
2013/2/1 编辑状态ESC取消时出现DOM 8错误
编辑完成提交时Enter出现[Object object]没有方法updateText
有链接节点取消编辑后链接消失
reset方法之后value值被保留，增加了resetText方法
增加OK和Candel按钮
增加onNodeEdit事件
2013/1/31 增加onNodeDragOver事件
2013/1/30 修正了节点editable设置为false仍可编辑的问题
2013/1/18 修正了有链接的节点在draggable设置为false时仍可拖拽的问题
2012/11/26 TreeView.NodeOptionsBox增加intialize方法, 将TreeView.load中的初始化代码放到这个方法中
2012/10/23 由窗口下载完成时(window.onload)初始化改为文档下载完成时(document.ready)初始化
2012/9/27 修正了有链接节点编辑完成后链接消失的问题
修正了节点编辑完成后两次提交的问题
修正了有链接节点在编辑状态下按回车同时触发navigate方法的问题
2012/9/26 appendChild方法增加第二参数action, action现在支持值'EDIT', 添加完节点开始编辑
修正了<TreeNode>之间有空白字符被判断"有子节点"的问题
2012/9/4 数据映射占位符标记由"[]"改为"{}"
2012/4/24 解决了非数据源节点不能显示子节点的问题
2012/3/16 解决了Loading出错或未完成时多次加载子节点的问题
2012/3/9 TreeView的id逻辑重新设定
2012/1/6 修正了获得ContentType为空时出错的bug
2011/12/28 修正了IE8下ChildNodesPadding大于0时的一个bug
2011/12/28 修正了IE9-浏览器不能选中节点的问题。触发选中事件由onmouseup改为onclick
2011/12/28 节点的imageUrl为空时, 不再生成image单元格
2011/12/27 TreeView增加defaultTarget属性, 默认为当前窗口
2011/12/27 现在可以将引用脚本放在<HEAD>中，但调用TreeView脚本必须在winodw.onload之内或之后
2011/12/23 修正了removeChild中setLines的bug
2011/12/23 数据映射字段现在支持javascript表达式
2011/12/21 Release
*/

document.treeViews = new Object();

TreeView = function (properties) {
    /// <summary>TreeView构造函数</summary>

    /// <value type="String">显示TreeView的元素ID</value>
    this.id = '';
    /// <value type="String">节点文本链接的默认目标</value>
    this.defaultTarget = '';
    /// <value type="Boolean">指示TreeView是否启用, 默认true, 通过enable/disable方法启停用</value>
    //this.enabled = true;

    /// <value type="String">源数据地址, XML或JSON</value>
    this.dataSource = '';
    /// <value type="Array">数据映射表</value>
    this.dataMappings = [];

    /// <value type="String">图片存放目录</value>
    this.imagesBaseUrl = 'images/';
    /// <value type="String">指示节点可以被展开的图标, 一般是一个+号</value>
    this.expandImageUrl = 'burl_0a.gif|burl_0b.gif';
    /// <value type="String">指标节点可以被闭合的图标, 一般是一个-号</value>
    this.collapseImageUrl = 'burl_1a.gif|burl_1b.gif';
    /// <value type="String">正在载入状态图标, 在展开load-on-demand节点时显示</value>
    this.contentLoadingImageUrl = 'spinner.gif';
    /// <value type="String">不可展开节点图片, 一般是空白</value>
    this.noExpandImageUrl = 'blank.gif';

    /// <value type="string">定义鼠标划过或选择节点时的样式范围, 可选TEXT, ROW</value>
    this.nodeCellStyle = 'TEXT';
    /// <value type="String|Integer">每级TreeNode的缩进距离</value>
    this.nodeIndent = 16;
    /// <value type="String|Integer">节点内对象(如文本、图标)与节点外框之间的距离</value>
    this.nodePadding = 2;
    /// <value type="String|Integer">两个同级节点之间的间距</value>
    this.nodeSpacing = 0;
    /// <value type="String|Integer">父节点与子节点之间的距离</value>
    this.childNodesPadding = 0;

    /// <value type="String">TreeView样式</value>
    this.cssClass = 'treeViewDefaultClass';
    /// <value type="String">鼠标划过状态下的节点样式</value>
    this.hoverNodeClass = 'treeNodeDefaultHoverClass';
    /// <value type="String">普通状态下的节点样式</value>
    this.nodeClass = 'treeNodeDefaultClass';
    /// <value type="String">被选择状态下的节点样式</value>
    this.selectedNodeClass = 'treeNodeDefaultSelectedClass';
    /// <value type="String">被选择节点的鼠标划过样式, 默认与被选择节点样式相同</value>
    this.selectedHoverNodeClass = '';
    /// <value type="String">编辑节点文本时的文本框样式, 默认无</value>
    this.nodeEditClass = '';
    /// <value type="String">节点提醒文字样式, 默认无</value>
    this.nodeTipClass = '';
    /// <value type="String">剪切或移动中的节点样式, 默认无, 透明度 50%</value>
    this.cutNodeClass = '';
    /// <value type="String">当拖动的节点Hover到可放置节点时 可放置节点的样式</value>
    this.dropChildClass = '';
    /// <value type="String">节点选项盒样式</value>
    //this.nodeOptionsBoxClass = '';
    /// <value type="String">节点选项样式</value>
    //this.nodeOptionClass = '';

    /// <value type="Boolean">是否显示节点展开和闭合图标</value>
    this.showBurls = true;
    /// <value type="Boolean">是否显示分支线</value>
    this.showLines = false;
    /// <value type="Boolean">是否显示节点图标</value>
    this.showImages = true;
    /// <value type="String">是否显示复选框, 可选值 NONE,false|SINGLE|RELATIVE,true <value>
    this.showCheckBoxes = 'NONE';
    /// <value type="Boolean">是否在选择节点时展开子节点</value>
    this.expandOnSelect = false;
    /// <value type="Boolean">是否在选择节点时关闭子节点</value>
    this.collapseOnSelect = false;

    /// <value type="Boolean">是否可以编辑节点文本</value>
    this.nodeEditingEnabled = false;

    /// <value type="Boolean">Navigate 启用键盘导航 → ← ↑ ↓ Enter Shift+E</value>
    this.keyboardEnabled = true;
    /// <value type="Boolean">启用键盘编辑 Ctrl+C, Ctrl+X, Ctrl+V 默认false</value>
    this.keyboardCutCopyPasteEnabled = false;

    /// <value type="Boolean">启用拖放, 默认false</value>
    this.dragAndDropEnabled = false;
    /// <value type="Boolean">是否可以放置到其他节点中, 默认true, false表示只排序</value>
    this.dropChildEnabled = true;
    /// <value type="Boolean">是否可以放置为根节点, 默认true</value>
    this.dropRootEnabled = true;
    /// <value type="Boolean">从TreeView拖放到其他类型元素的ID列表(逗号分开)</value>
    this.externalDropTargets = '';

    /// <value type="Integer">默认展开的TreeNode深度, 1为根节点, 0为展开所有</value>
    this.expandDepth = 1;
    /// <value type="Integer">默认加载的TreeNode深度, 1为根节点, 0为加载所有</value>
    this.preloadDepth = 1;

    /// <value type="String">默认选择的项, 格式 n1.n2.n3</value>
    this.pathToSelect = '';
    /// <value type="String">默认选中的项, 格式 n1.n2.n3,n1.n2.n4,...</value>
    this.pathsToCheck = new Array();

    /// <value type="Array" elementType="TreeNode">所有根节点的集合</value>
    this.childNodes = new Array();

    // 初始化
    if (properties != null) {
        for (var n in properties) {
            if (properties[n] != null) { this[n] = properties[n]; }
        }
    }
}

/// <value type="Array" elementType="TreeNode">所有根节点</value>
//TreeView.prototype.childNodes = [];
/// <value type="TreeNode">第一个根节点</value>
TreeView.prototype.firstChild = null;
/// <value type="TreeNode">最后一个根节点</value>
TreeView.prototype.lastChild = null;

/// <value type="Element">显示TreeView的HTML元素的引用(div或其他),用于读取或设置属性值</value>
TreeView.prototype.element = null;

/// <value type="Boolean">标识TreeView是否已经被加载</value>
TreeView.prototype.loaded = false;

/// <value type="TreeNode">选择的节点项</value>
TreeView.prototype.selectedNode = null;

/// <value type="TreeView.NodeOptionsBox">节点选项组</value>
TreeView.prototype.nodeOptionsBox = null;

/// <value type="Array" elementType="TreeNode">在TreeView.getCheckedNodes, TreeNode.prototype.__getCheckedNodes方法中使用的临时变量</value>
TreeView.prototype.__checkedNodes = null;

/// <value type="TreeNode">正在编辑的节点</value>
TreeView.prototype.__editingNode = null;

//TreeView.prototype.enable = function () {
    /// <summary>启用TreeView</summary>
//}

//TreeView.prototype.disable = function () {
    /// <summary>禁用TreeView</summary>    
//}

TreeView.prototype.appendChild = function (treeNode, action) {
    /// <summary>添加根节点</summary>

    //name
    treeNode.__parseName(this.id + '_' + this.childNodes.length);

    //parentNode
    treeNode.parentNode = null;
    //treeView
    treeNode.treeView = this;
    //depth
    treeNode.depth = 1;
    //path
    treeNode.path = treeNode.name;
    //checked

    var length = this.childNodes.length;

    //index
    treeNode.index = length;

    // childNodes
    this.childNodes.push(treeNode);

    // render
    this.childNodes[length].populate();
    if (length > 0 && this.element.lastChild.getAttribute('sign') == 'SPACING') {
        this.element.insertBefore(this.childNodes[length].element, this.element.lastChild);
        this.element.insertBefore(this.childNodes[length].__childrenElement, this.element.lastChild);
    }
    else {
        this.element.appendChild(this.childNodes[length].element);
        this.element.appendChild(this.childNodes[length].__childrenElement);
    }
    //添加动画
    if (this.childNodes[length].element.classList != null) {
        this.childNodes[length].element.classList.add('treeNodeFadeInClass');
    }    

    // firstChild & lastChild
    if (length == 0) { this.firstChild = this.childNodes[length]; }
    this.lastChild = this.childNodes[length];

    //previousSibling & nextSibling
    if (length > 0) {
        this.childNodes[length].previousSibling = this.childNodes[length - 1];
        this.childNodes[length - 1].nextSibling = this.childNodes[length];
        this.childNodes[length].nextSibling = null;
    }

    //启用dragAndDrop 或者 spacing大于0并且showLines时, 创建分隔DIV
    if (this.dragAndDropEnabled || (this.childNodes[length].spacing > 0 && this.showLines)) {
        //before
        var divB = document.createElement('DIV');
        divB.setAttribute('sign', 'SPACING');
        divB.style.height = this.childNodes[length].spacing + 'px';
        //divB.style.backgroundColor = '#090';        
        divB.setAttribute('parent', '');
        divB.setAttribute('prev', (length == 0 ? '' : this.childNodes[length - 1].name));
        divB.setAttribute('next', this.childNodes[length].name);
        this.element.insertBefore(divB, this.childNodes[length].element);

        if (length > 0) {
            this.childNodes[length].__childrenElement.nextSibling.setAttribute('prev', this.childNodes[length].name);
        }

        if (this.showLines && this.childNodes[length].spacing > 0) {
            divB.appendChild(TreeView.__populateLinesSpacing(this.childNodes[length]));
        }

        if (this.dragAndDropEnabled) {
            divB.appendChild(TreeView.__populateDropLine(this.childNodes[0]));
        }

        if (length == 0) {
            //after
            var divA = document.createElement('DIV');
            divA.setAttribute('sign', 'SPACING');
            divA.style.height = this.childNodes[0].spacing + 'px';
            //divA.style.backgroundColor = '#FC0';            
            divA.setAttribute('parent', '');
            divA.setAttribute('prev', this.childNodes[0].name);
            divA.setAttribute('next', '');
            this.element.appendChild(divA);

            //showLines - 最后一行, 没有lines

            if (this.dragAndDropEnabled) {
                divA.appendChild(TreeView.__populateDropLine(this.childNodes[0]));
            }
        }       
    }

    //setLines
    this.childNodes[length].__setLines();

    if (action != null && typeof (action) == 'string') {
        action = action.toUpperCase();
        switch (action) {
            case 'EDIT':
                treeNode.edit();
                break;
        }
    }
};

TreeView.prototype.insertBefore = function (treeNode, referenceNode) {
    /// <summary>在referenceNode之前插入根节点</summary>
    /// <param name="treeNode" type="TreeNode">要添加的节点</param>
    /// <param name="referenceNode" type="TreeNode">参考节点</param>

    //name
    treeNode.__parseName(this.id + '_' + this.childNodes.length);

    //parentNode
    treeNode.parentNode = null;
    //treeView
    treeNode.treeView = this;
    //depth
    treeNode.depth = 1;
    //path
    treeNode.path = treeNode.name;

    var index = referenceNode.index;

    // childNodes
    this.childNodes.splice(index, 0, treeNode);

    // render	
    this.childNodes[index].populate();
    if (referenceNode.element.previousSibling != null && referenceNode.element.previousSibling.nodeType == 1 &&referenceNode.element.previousSibling.getAttribute('sign') == 'SPACING') {
        this.element.insertBefore(this.childNodes[index].element, referenceNode.element.previousSibling);
        this.element.insertBefore(this.childNodes[index].__childrenElement, referenceNode.element.previousSibling);
    }
    else {
        this.element.insertBefore(this.childNodes[index].element, referenceNode.element);
        this.element.insertBefore(this.childNodes[index].__childrenElement, referenceNode.element);
    }

    // index
    for (var i = index; i < this.childNodes.length; i++) {
        this.childNodes[i].index = i;
    }

    // firstChild
    if (index == 0) { this.firstChild = this.childNodes[0]; }

    //previousSibling & nextSibling
    var previousNode = referenceNode.previousSibling;
    this.childNodes[index].previousSibling = previousNode;
    if (previousNode != null) previousNode.nextSibling = this.childNodes[index];
    this.childNodes[index].nextSibling = referenceNode;
    referenceNode.previousSibling = this.childNodes[index];

    //if (index > -1) {

    //    }
    //    else {
    //        //如果没有找到参考节点, 就直接附加
    //        this.appendChild(treeNode);
    //    }

    //启用dragAndDrop 或者 spacing大于0并且showLines时, 创建分隔DIV
    if (this.dragAndDropEnabled || (this.childNodes[index].spacing > 0 && this.showLines)) {
        //before 在节点之前添加间隔
        var divB = document.createElement('DIV');
        divB.style.height = this.childNodes[0].spacing + 'px';
        //divB.style.backgroundColor = '#FC0';
        divB.setAttribute('sign', 'SPACING');
        divB.setAttribute('parent', '');
        divB.setAttribute('prev', (index > 0 ? this.childNodes[index - 1].name : ''));
        divB.setAttribute('next', this.childNodes[index].name);
        this.element.insertBefore(divB, this.childNodes[index].element);
        //更新下方spacing的prev
        this.childNodes[index].__childrenElement.nextSibling.setAttribute('prev', this.childNodes[index].name);

        if (this.showLines && this.childNodes[index].spacing > 0) {
            divB.appendChild(TreeView.__populateLinesSpacing(this.childNodes[index]));
        }

        if (this.dragAndDropEnabled) {
            //添加dropLine
            divB.appendChild(TreeView.__populateDropLine(this.childNodes[index]));
        }       

        //dropLine
        //        if (this.dragAndDropEnabled) {
        //            //添加节点下方的dropLine
        //            this.element.insertBefore(TreeView.__populateDropLine(this.childNodes[index], referenceNode), referenceNode.element);
        //            //更新上面节点的dropLine的next属性
        //            this.childNodes[index].element.previousSibling.setAttribute('next', this.childNodes[index].name);
        //        }
    }

    this.childNodes[index].__setLines();
};

TreeView.prototype.removeChild = function (treeNode) {
    /// <summary>删除根节点</summary>
    /// <param name="treeNode" type="TreeNode">要删除的节点</param>

    var index = treeNode.index;

    if (this.dragAndDropEnabled || (this.childNodes[index].spacing > 0 && this.showLines)) {
        if (this.childNodes.length == 1) {
            //删除下方的spacing
            this.element.removeChild(this.childNodes[index].__childrenElement.nextSibling);
        }
        else if (this.childNodes.length >= 1) {
            //节点的下方spacing的prev变为上一个节点的name
            this.childNodes[index].__childrenElement.nextSibling.setAttribute('prev', (index > 0 ? this.childNodes[index - 1].name : ''));
        }

        //删除上方的spacing
        this.element.removeChild(this.childNodes[index].element.previousSibling);

        //dropLine
        //    if (this.dragAndDropEnabled) {
        //        if (this.childNodes.length == 1) {
        //            //删除最后一个节点时删除上方的dropLine
        //            this.element.removeChild(this.childNodes[index].element.previousSibling);
        //        }
        //        else if (this.childNodes.length >= 1) {
        //            //节点的上一个dropLine的next值变为下一个节点的name
        //            this.childNodes[index].element.previousSibling.setAttribute('next', (this.childNodes[index].nextSibling != null ? this.childNodes[index + 1].name : ''));
        //        }

        //        //先删除节点下方的dropLine
        //        this.element.removeChild(this.childNodes[index].__childrenElement.nextSibling);
        //    }
    }

    //删除节点元素
    this.element.removeChild(this.childNodes[index].element);
    this.element.removeChild(this.childNodes[index].__childrenElement);

    //从子节点集合中删除节点
    this.childNodes.splice(index, 1);
    //清空
    treeNode.treeView = null;
    treeNode = null;

    //index
    for (var i = index; i < this.childNodes.length; i++) {
        this.childNodes[i].index = i;
    }

    // firstChild, lastChild, nextSibling, previousSibling
    if (this.childNodes.length == 0) {
        //一项不剩下
        this.firstChild = null;
        this.lastChild = null;

        //留下一个虚节点, 可以从其他树形中拖入节点
        if (this.dragAndDropEnabled && this.dropChildEnabled && this.loaded) {

            var div = document.createElement('DIV');
            div.id = this.id + '_VoidNode';
            div.style.width = '100px';
            div.style.height = '32px';
            div.innerHTML = '&nbsp;';
            div.style.backgroundColor = 'transparent';
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
            var treeView = this;
            div.ondrop = function (ev) {
                var originalNode = TreeView.clipBoard.treeNode;
                var oTreeView = originalNode.treeView;

                //克隆节点
                var node = originalNode.clone();

                //处理原节点
                if (TreeView.clipBoard.action == 'DRAGMOVE') {
                    //删除原节点
                    originalNode.remove(false);
                }

                //取消选择
                //originalNode.unselect(false);

                //添加节点
                treeView.appendChild(node);

                //选择
                node = treeView.lastChild;
                node.select(false);

                //执行事件
                if (TreeView.clipBoard.action == 'DRAGMOVE') {
                    treeView.__executeEvent('onNodeMoved', node);
                }
                else if (TreeView.clipBoard.action == 'DRAGCOPY') {
                    treeView.__executeEvent('onNodeCopied', node);
                }
                treeView.__executeEvent('onNodeDropped', node);

                //移除这个占位元素
                treeView.element.removeChild(this);

                ev.preventDefault();
                ev.stopPropagation();

                //拖放正常结束
                treeView.__executeEvent('onNodeDragEnd', node);
            }
            this.element.appendChild(div);
        }
    }
    else if (this.childNodes.length == 1) {
        //只剩下一项
        this.firstChild = this.childNodes[0];
        this.lastChild = this.childNodes[0];
        this.childNodes[0].previousSibling = null;
        this.childNodes[0].nextSibling = null;
    }
    else {
        if (index == 0) {
            //是第一项
            this.firstChild = this.childNodes[0];
            this.childNodes[0].previousSibling = null;
        }
        else if (index == this.childNodes.length) {
            //是最后一项
            this.lastChild = this.childNodes[index - 1];
            this.childNodes[index - 1].nextSibling = null;
        }
        else {
            //在中间
            this.childNodes[index].previousSibling = this.childNodes[index - 1];
            this.childNodes[index - 1].nextSibling = this.childNodes[index];
        }
    }

    if (this.childNodes.length > 0 && index == this.childNodes.length) {
        this.lastChild.__setLines();
    }
};

TreeView.prototype.removeAll = function () {
    /// <summary>删除所有根节点</summary>

    if (this.selectedNode != null) {
        this.selectedNode.unselect();
    }

    //清除子节点
    this.childNodes.length = 0;

    //删除元素节点
    for (var i = this.element.childNodes.length - 1; i >= 0; i--) {
        //只移除DIV元素, SPAN元素为节点配置
        if (this.element.childNodes[i].nodeName == 'DIV' && (this.element.childNodes[i].getAttribute('sign') == 'ROW' || this.element.childNodes[i].getAttribute('sign') == 'CHILDNODES' || this.element.childNodes[i].getAttribute('sign') == 'SPACING')) {
            this.element.removeChild(this.element.childNodes[i]);
        }
    }
    //firstChild & lastChild
    this.firstChild = null;
    this.lastChild = null;
}

TreeView.prototype.load = function () {
    /// <summary>加载TreeView的根节点</summary>

    if (this.id == null) { this.id = ''; }
    if (typeof (this.element) == 'string') {
        this.element = document.getElementById(this.element);
    }
    if (this.id != '' && this.element == null) {
        this.element = document.getElementById(this.id);
    }
    else if (this.id == '' && this.element != null) {
        this.id = this.element.id;
    }
    // id 如果为空, 自动以序号命名
    if (this.id == '') { this.id = '__TreeView_' + TreeView.__getAmount(); }

    // sign
    this.element.setAttribute('sign', 'TREEVIEW');

    //defaultTarget
    if (this.defaultTarget == null) { this.defaultTarget = ''; }

    // enabled
    //this.enabled = TreeView.__parseBoolean(this.enabled, true);

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
    this.nodeCellStyle = TreeView.__parseString(this.nodeCellStyle, /(TEXT)|(ROW)/i, 'U', 'TEXT');
    /// nodeIndent
    this.nodeIndent = TreeView.__parseInteger(this.nodeIndent, 16);
    /// nodePadding
    this.nodePadding = TreeView.__parseInteger(this.nodePadding, 2);
    /// nodeSpacing
    this.nodeSpacing = TreeView.__parseInteger(this.nodeSpacing, 0);
    /// childNodesPadding
    this.childNodesPadding = TreeView.__parseInteger(this.childNodesPadding, 0);

    // 应用TreeView样式
    /// cssClass
    this.cssClass = TreeView.__parseString(this.cssClass, /\w+/i, 'I', 'treeViewDefaultClass');
    this.element.className = this.cssClass;
    /// nodeClass
    this.nodeClass = TreeView.__parseString(this.nodeClass, /\w+/i, 'I', 'treeNodeDefaultClass');
    /// hoverNodeClass
    this.hoverNodeClass = TreeView.__parseString(this.hoverNodeClass, /\w+/i, 'I', 'treeNodeDefaultHoverClass');
    /// selectedNodeClass
    this.selectedNodeClass = TreeView.__parseString(this.selectedNodeClass, /\w+/i, 'I', 'treeNodeDefaultSelectedClass');
    /// selectedHoverNodeClass
    this.selectedHoverNodeClass = TreeView.__parseString(this.selectedHoverNodeClass, /\w+/i, 'I', '');
    /// nodeEditClass
    this.nodeEditClass = TreeView.__parseString(this.nodeEditClass, /\w*/i, 'I', '');
    /// cutNodeClass
    this.cutNodeClass = TreeView.__parseString(this.cutNodeClass, /\w*/i, 'I', '');
    /// nodeTipClass
    this.nodeTipClass = TreeView.__parseString(this.nodeTipClass, /\w*/i, 'I', '');
    /// dropChildClass
    this.dropChildClass = TreeView.__parseString(this.dropChildClass, /\w*/i, 'I', '');
    /// nodeOptionsBoxClass
    //this.nodeOptionsBoxClass = TreeView.__parseString(this.nodeOptionsBoxClass, /\w*/i, 'I', '');
    /// nodeOptions
    //this.nodeOptionClass = TreeView.__parseString(this.nodeOptionClass, /\w*/i, 'I', '');

    /// expandOnSelect
    this.expandOnSelect = TreeView.__parseBoolean(this.expandOnSelect, false);
    /// collapseOnSelect
    this.collapseOnSelect = TreeView.__parseBoolean(this.collapseOnSelect, false);

    /// showBurls
    this.showBurls = TreeView.__parseBoolean(this.showBurls, true);
    /// showImages
    this.showImages = TreeView.__parseBoolean(this.showImages, true);
    /// showLines
    this.showLines = TreeView.__parseBoolean(this.showLines, false);
    /// showCheckBoxes
    if (typeof (this.showCheckBoxes) == 'boolean') {
        this.showCheckBoxes = (this.showCheckBoxes ? 'RELATIVE' : 'NONE');
    }
    else {
        this.showCheckBoxes = TreeView.__parseString(this.showCheckBoxes, /^(NONE|SINGLE|RELATIVE|TRUE|FALSE)$/i, 'U', 'NONE');
        if (this.showCheckBoxes == 'TRUE') {
            this.showCheckBoxes = 'RELATIVE'; 
        }
        else if (this.showCheckBoxes == 'FALSE') {
            this.showCheckBoxes = 'NONE'; 
        }
    }

    /// expandDepth
    this.expandDepth = TreeView.__parseInteger(this.expandDepth, 1);
    /// preLoadDepth
    this.preLoadDepth = TreeView.__parseInteger(this.preLoadDepth, 1);

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
    this.dragAndDropEnabled = TreeView.__parseBoolean(this.dragAndDropEnabled, false);
    /// dropChildEnabled
    this.dropChildEnabled = TreeView.__parseBoolean(this.dropChildEnabled, true);
    /// dropRootEnabled
    this.dropRootEnabled = TreeView.__parseBoolean(this.dropRootEnabled, true);
    /// externalDropTargets
    if (this.externalDropTargets == null) { this.externalDropTargets = ''; }

    /// nodeEditingEnabled
    this.nodeEditingEnabled = TreeView.__parseBoolean(this.nodeEditingEnabled, false);

    /// keyboardEnabled
    this.keyboardEnabled = TreeView.__parseBoolean(this.keyboardEnabled, true);
    /// keyboardCutCopyPasteEnabled
    this.keyboardCutCopyPasteEnabled = TreeView.__parseBoolean(this.keyboardCutCopyPasteEnabled, false);

    //从配置获得节点
    this.__parseChildNodes('text/xml', this.element);

    var i, j;

    //从dataSource加载数据
    if (this.dataSource == null) { this.dataSource = ''; }
    //解析dataMappings, 数据映射只应用于外部数据
    if (!(this.dataMappings instanceof Array)) { this.dataMappings = []; }
    if (this.dataMappings.length == 0) {
        var dl = [];
        //查找保存数据映射信息的DL节点
        for (i = 0; i < this.element.childNodes.length; i++) {
            if (this.element.childNodes[i].nodeType == 1 && this.element.childNodes[i].nodeName == 'DL') {
                dl.push(this.element.childNodes[i]);
            }
        }

        if (dl.length > 0) {
            var mapping, map, m, dd, f;
            var t = new TreeNode();
            for (i = 0; i < dl.length; i++) {
                mapping = new TreeView.DataMapping();
                mapping.url = dl[i].getAttribute('url');
                if (mapping.url == null) { mapping.url = ''; }
                mapping.parseOnly = TreeView.__parseBoolean(dl[i].getAttribute('parseOnly'), false);
                if (!mapping.parseOnly) {
                    for (j = 0; j < dl[i].childNodes.length; j++) {
                        dd = dl[i].childNodes[j];
                        if (dd.nodeType == 1 && dd.nodeName == 'DD') {
                            map = {};
                            map.tag = dd.getAttribute('tag');
                            map.object = dd.getAttribute('object');

                            for (var k = 0; k < dd.attributes.length; k++) {
                                if (!/(tag)|(object)/i.test(dd.attributes[k].name)) {
                                    f = false;
                                    for (var p in t) {
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
        this.__appendLoadingNode();
        TreeView.request(this.dataSource, null, this, '__getChildNodesFromDataSource');
    }

    //保存到全局对象
    document.treeViews[this.id] = this;

    //onLoaded事件    
    if (this.dataSource == '' && !this.loaded) {
        if (this.childNodes.length > 0) {

            // expandDepth & expandTo
            this.expandTo(this.expandDepth);

            // ↓
            // preloadDepth & preloadTo
            // ↓
            // pathToSelect & selectNodeByPath
            // ↓
            // pathsToCheck & checkNodesByPaths
            // ↓
            // __completeLoading()
        }
        else {
            this.__completeLoading();
        }
    }

    var treeView = this;

    if (this.dragAndDropEnabled) {
        // 从一个dropLine左右侧来回移动有时不会重置dropLine, 在TreeView上添加此事件是为了还原曾经激活的dropLine
        this.element.ondragleave = function () { TreeView.__restoreDropLine(); }

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
                        treeView.__executeEvent('onNodeExternalDropped', this);
                        //正常拖放结束
                        treeView.__executeEvent('onNodeDragEnd', treeView.selectedNode);
                        ev.preventDefault();
                        ev.stopPropagation();
                    };
                }
            }
        }
    }

    //解释节点选项盒
    var ul = null;
    //查找保存右键菜单信息的UL节点
    for (i = 0; i < this.element.childNodes.length; i++) {
        if (this.element.childNodes[i].nodeType == 1 && this.element.childNodes[i].nodeName == 'UL') {
            ul = this.element.childNodes[i];
            break;
        }
    }
    if (ul != null) {
        this.nodeOptionsBox = new TreeView.NodeOptionsBox(this, ul.getAttribute('display'));
        this.nodeOptionsBox.initialize(ul.childNodes);
    }
};

TreeView.prototype.reload = function () {
    /// <summary>从__dataElement和dataSource重新加载所有节点</summary>

    //删除所有节点
    this.removeAll();

    //删除nodeOptionsBox元素
    if (this.nodeOptionsBox != null) {
        this.element.removeChild(this.nodeOptionsBox.element);
    }

    this.loaded = false;
    this.load();
}

TreeView.prototype.expandAll = function () {
    /// <summary>展开所有</summary>
    for (var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].__expandAll();
    }
};

TreeView.prototype.expandAllNodeByNode = function () {
    /// <summary>一个节点一个节点展开所有</summary>
    if (this.firstChild != null) { this.firstChild.__expandNodeByNode(); }
}

TreeView.prototype.collapseAll = function () {
    /// <summary>关闭所有</summary>
    if (this.firstChild != null) { this.firstChild.__collapseAll(); }
};

TreeView.prototype.loadAll = function () {
    /// <summary>加载所有</summary>
    for (var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].__loadAll();
    }
};

TreeView.prototype.loadAllNodeByNode = function () {
    /// <summary>一个节点一个节点加载所有</summary>
    if (this.firstChild != null) { this.firstChild.__loadNodeByNode(); }
};

TreeView.prototype.checkAll = function () {
    /// <summary>选中所有</summary>

    if (this.showCheckBoxes == 'RELATIVE') {
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].checked != 1) this.childNodes[i].check(false);
        }
    }
    else if (this.showCheckBoxes == 'SINGLE') {
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].checked == 0) { this.childNodes[i].check(false); }
            if (this.childNodes[i].hasChildNodes && this.childNodes[i].loaded) { this.childNodes[i].__checkAll(); }
        }
    }
};

TreeView.prototype.uncheckAll = function () {
    /// <summary>取消选中所有</summary>
    if (this.showCheckBoxes == 'RELATIVE') {
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].checked != 0) { this.childNodes[i].uncheck(false); }
        }
    }
    else if (this.showCheckBoxes == 'SINGLE') {
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].checked == 1) { this.childNodes[i].uncheck(false); }
            if (this.childNodes[i].hasChildNodes && this.childNodes[i].loaded) { this.childNodes[i].__uncheckAll(); }
        }
    }
};

TreeView.prototype.expandTo = function (depth) {
    /// <summary>展开节点到指定的深度</summary>
    /// <param name="depth" type="integer">展开到指定的深度</param>

    if (depth > 1) {
        if (this.firstChild != null) { this.firstChild.__expandTo(depth); }
    }
    else if (depth == 0) {
        //展开所有
        this.expandAllNodeByNode();
    }
    else {
        if (!this.loaded) { this.preloadTo(this.preloadDepth); }
    }
}

TreeView.prototype.preloadTo = function (depth) {
    /// <summary>预加载节点到指定的深度</summary>
    /// <param name="depth" type="integer">预加载到指定的深度</param>

    if (depth > 1) {
        if (this.firstChild != null) { this.firstChild.__preloadTo(depth); }
    }
    else if (depth == 0) {
        //加载所有
        this.loadAllNodeByNode();
    }
    else {
        if (!this.loaded) { this.selectNodeByPath(this.pathToSelect); }
    }
}

TreeView.prototype.selectNodeByPath = function (path) {
    /// <summary>根据路径选择一个节点</summary>
    /// <param name="path" type="String">节点完整路径</param>

    var names = path.split('.');
    var index = -1;
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    var finished = true;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.childNodes[index].loaded) {
                if (!this.childNodes[index].expanded) { this.childNodes[index].expand(false); }
                this.childNodes[index].__selectNodeByPath(names);
            }
            else {
                TreeNode.__attachEvent(this.childNodes[index], '__onExpanded', function () { this.__selectNodeByPath(names); });
                this.childNodes[index].expand(false);
            }
            finished = false;
        }
        else {
            //在这个方法里默认不触发事件
            this.childNodes[index].select(false);
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

    if (this.showCheckBoxes != 'NONE' && paths.length > 0) {
        this.__checkNodeByPath(paths, paths[0]);
    }
    else {
        if (!this.loaded) { this.__completeLoading(); }
    }
}

TreeView.prototype.getNodeByName = function (nodeName) {
    /// <summary>根据name获得节点, 要求节点已经被载入, 否则返回null</summary
    var element = document.getElementById('__node_' + nodeName);
    if (element != null) {
        var names = element.getAttribute('path').split('.');
        var rootNode = null;
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].name == names[0]) {
                rootNode = this.childNodes[i];
                break;
            }
        }
        if (rootNode != null && names.length > 1) {
            names.splice(0, 1);
            return rootNode.__getNodeByName(names);
        }
        else {
            return rootNode;
        }
    }
    else {
        return null;
    }
}

TreeView.prototype.getCheckedNodes = function () {
    /// <summary>得到所有被checked的节点</summary>

    if (this.showCheckBoxes != 'NONE') {
        this.__checkedNodes = [];
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].checked == 1) {
                this.__checkedNodes.push(this.childNodes[i]);
            }
            if (this.childNodes[i].checked == 2 || this.showCheckBoxes == 'SINGLE') {
                this.childNodes[i].__getCheckedNodes();
            }
        }
        return this.__checkedNodes;
    }
    else {
        return null;
    }
}

/*
TreeView.prototype.showNodeOptionsBox = function () {
    /// <summary>显示节点选项</summary>

    if (this.nodeOptionsBox != null) { this.nodeOptionsBox.show(); }
}
*/

/// <summary>加载完成后触发</summary>
TreeView.prototype.onLoaded = function () {};

/// <summary type="Function">节点展开后触发</summary>
/// <param name="expandedNode" type="TreeNode">刚刚被展开的节点</param>
TreeView.prototype.onNodeExpanded = function (expandedNode) { };

/// <summary type="Function">节点关闭后触发</summary>
/// <param name="colapsedNode" type="TreeNode">刚刚被闭合的节点</param>
TreeView.prototype.onNodeCollapsed = function (colapsedNode) { };

/// <summary type="Function">当鼠标划过节点时触发</summary>
/// <param name="hoveringNode" type="TreeNode">鼠标划过的那个节点, 支持return</param>
TreeView.prototype.onNodeHover = function (hoverNode) { };

/// <summary type="Function">当选择节点改变后触发</summary>
/// <param name="selectedNode" type="TreeNode">刚刚被选择的那个节点</param>
TreeView.prototype.onNodeSelected = function (selectedNode) { };

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

/// <summary type="Function">节点被拖放到外部元素后触发 (通过this.selectedNode得到被拖放的节点)</summary>
/// <param name="target" type="Element">接受拖放的元素</param>
TreeView.prototype.onNodeExternalDropped = function (target) { };

/// <summary type="Function">外部元素拖放到节点后触发（）</summary>
/// <param name="droppedNode" type="Element">接受拖放的节点</param>
TreeView.prototype.onExternalElementDropped = function (droppedNode) { };

/// <summary type="Funciton">点击节点上的链接时触发, "javascript:"类不算链接</summary>	
/// <param name="node" type="TreeNode">目标节点</summary>	
TreeView.prototype.onNodeNavigate = function (node) { };

/// <summary type="Funciton">显示节点选项盒之前触发</summary>	
/// <param name="node" type="TreeNode">目标节点</summary>	
TreeView.prototype.onNodeOptionsBoxShow = function (node) { };

/// <summary type="Funciton">点击节点选项时触发</summary>
/// <param name="item" type="TreeViewNodeOption">目标菜单项</summary>
TreeView.prototype.onNodeOptionClick = function (item) { };

/// <summary type="Funciton">在节点上删除前触发</summary>	
/// <param name="node" type="TreeNode">目标节点</summary>	
TreeView.prototype.onNodeRemove = function (node) { };

TreeView.prototype.__completeLoading = function () {
    /// <summary>完成load, 触发onLoaded事件</summary>
    this.loaded = true;
    this.__executeEvent('onLoaded');
}

TreeView.prototype.__getChildNodesFromDataSource = function (xmlRequest, url) {
    /// <summary>读取数据源后执行的函数</summary>

    //移除loading节点
    this.__removeLoadingNode();

    //获取子节点
    var contentType = xmlRequest.getResponseHeader("Content-Type");
    contentType = (/text\/xml/i.test(contentType) ? 'text/xml' : 'text/plain');

    if (contentType == 'text/xml') {
        if (xmlRequest.responseXML != null) {
            this.__parseChildNodes(contentType, xmlRequest.responseXML.lastChild, url);
        }
    }
    else {
        this.__parseChildNodes(contentType, xmlRequest.responseText, url);
    }

    //loaded
    if (!this.loaded) {
        if (this.childNodes.length > 0) {
            // expandDepth & expandTo
            this.expandTo(this.expandDepth);

            // ↓
            // preloadDepth & preloadTo
            // ↓
            // pathToSelect & selectNodeByPath
            // ↓
            // pathsToCheck & checkNodesByPaths
            // ↓
            // __completeLoading()
        }
        else {
            this.__completeLoading();
        }
    }
}

TreeView.prototype.__parseChildNodes = function (contentType, data, url) {
    /// <summary>从element配置获取TreeView的根节点</summary>
    /// <param name="contentType" type=""String">数据类型</param>
    /// <param name="data" type="Element|Xml|JsonString">从Element/Xml的子节点或Json字符串获取根节点信息</param>
    /// <param name="url" type="String">计算数据映射用到的url</param>

    var mapping = null;
    if (this.dataMappings.length > 0 && url != null) {
        for (var i = 0; i < this.dataMappings.length; i++) {
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

    var treeNodes;
    if (contentType == 'text/xml') {
        treeNodes = TreeView.__getTreeNodesFromXml(data, mapping);
    }
    else {
        treeNodes = TreeView.__getTreeNodesFromJson(data, mapping);
    }

    for (var i = 0; i < treeNodes.length; i++) {
        this.appendChild(treeNodes[i]);
    }    
}

TreeView.prototype.__appendLoadingNode = function (parentNode) {
    /// <summary>获得"正在载入..."节点</summary>

    var loading = new TreeNode({
        name: 'loading',
        text: 'Loading...',
        imageUrl: this.contentLoadingImageUrl,
        isLoadingNode: true
    });

    if (parentNode == null) {
        this.appendChild(loading);
    }
    else {
        parentNode.appendChild(loading);
    }
}

TreeView.prototype.__removeLoadingNode = function (parentNode) {
    /// <summary>移除"正在载入..."节点</summary>

    if (parentNode == null) { parentNode = this; }

    for (var i = parentNode.childNodes.length - 1; i >= 0; i--) {
        if (parentNode.childNodes[i].isLoadingNode) {
            parentNode.removeChild(parentNode.childNodes[i]);
        }
    }
}

TreeView.prototype.__checkNodeByPath = function (paths, path) {
    /// <summary>根据path选中项</summary>
    /// <param name="paths" type="Array" elementType="string">path数组</param>
    /// <param name="path" type="String">单个path</param>

    var names = path.split('.');
    var index = -1;
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    var finished = false;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.childNodes[index].loaded) {
                this.childNodes[index].__checkNodeByPath(paths, names);
            }
            else {
                TreeNode.__attachEvent(this.childNodes[index], '__onExpanded',
                    function () {
                        this.__checkNodeByPath(paths, names);
                    }
                );
                this.childNodes[index].expand(false);
            }
        }
        else {
            //在这个方法里默认不触发事件
            this.childNodes[index].check(false);

            //查找下一个节点
            paths.splice(0, 1);
            if (paths.length > 0) {
                this.__checkNodeByPath(paths, paths[0]);
            }
            else {
                finished = true;
            }
        }
    }

    if (finished) {
        if (!this.loaded) {
            this.__completeLoading();
        }
    }
}

TreeView.prototype.__executeEvent = function (eventName, argument) {
    /// <summary>执行事件</summary>
    /// <param name="eventName" type="String">事件名</param>
    /// <param name="argument" type="Object">事件参数</param>

    var returnValue = true;
    if (this[eventName] != null) {
        if (typeof (this[eventName]) == 'function') {
            returnValue = this[eventName](argument);
        }
        else if (typeof (this[eventName]) == 'string') {
            //var ev;
            //eval('ev = function(){' + this[eventName] + '}');
            //ev.call(this, argument);
            returnValue = eval('returnValue = function(){' + this[eventName] + '}').call(this, argument);
        }

        if (returnValue != false && returnValue != true) { returnValue = true; };
    }
    return returnValue;
}

/**********
	
TreeNode 树形节点
	
**********/

TreeNode = function (properties) {
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

    /// <value type="String">节点的Html</value>
    this.html = '';

    //this.toolTip = '';

    /// <value type="String">节点的默认图标</value>
    this.imageUrl = '';
    /// <value type="String">节点展开时的图标</value>
    this.expandedImageUrl = '';

    /// <value type="String">鼠标点击节点时的链接路径</value>
    this.navigateUrl = '';
    /// <value type="String">节点链接目标</value>
    this.target = '';

    /// <value type="String|Element">子节点数据源</value>
    this.dataSource = '';

    /// <value type="Integer">缩进, null表示从TreeView继承</value>
    this.indent = null;
    /// <value type="Integer">节点内间距, null表示从TreeView继承</value>
    this.padding = null;
    /// <value type="Integer">同级节点之间的距离, null表示从TreeView继承</value>
    this.spacing = null;
    /// <value type="Integer">与子节点之间的距离, null表示从TreeView继承</value>
    this.childNodesPadding = null;

    /// <value type="String">节点默认样式, 默认从TreeView继承</value>
    this.cssClass = '';
    /// <value type="String">节点鼠标划过样式, 默认从TreeView继承</value>
    this.hoverClass = '';
    /// <value type="String">节点被选择样式, 默认从TreeView继承</value>
    this.selectedClass = '';
    /// <value type="String">节点被选择后鼠标划过样式, 默认从TreeView继承</value>
    this.selectedHoverClass = '';
    /// <value type="String">编辑状态下的文本框样式, 默认从TreeView继承</value>
    this.editClass = '';
    /// <value type="String">节点tip样式, 默认从TreeView继承</value>
    this.tipClass = '';
    /// <value type="String">节点被剪切时的样式, 默认从TreeView继承</value>
    this.cutClass = '';
    /// <value type="String">有节点被拖放到当前节点时的样式, 默认从TreeView继承</value>
    this.dropClass = '';

    /// <value type="Boolean">可以被拖动, TreeView.dragAndDropEnabled启用时生效</value>
    this.draggable = true;
    /// <value type="Boolean">可以被拖放, TreeView.dragAndDropEnabled启用时生效</value>
    this.droppable = true;
    /// <value type="Boolean">节点是否可编辑</value>
    this.editable = true;

    /// <value type="Array" elementType="TreeNode">获取当前节点子节点的集合</value>
    this.childNodes = new Array();

    /// <value type="Array" elementType="String">属性数组, 用于初始化节点和getAttribute和setAttribute方法</value>
    this.attributes = new Object();

    // 初始化
    if (properties != null) {
        for (var n in properties) {
            if (properties[n] != null) { this[n] = properties[n]; }
        }
    }
}

/// <value type="TreeView">指定TreeNode所属的TreeView</value>
TreeNode.prototype.treeView = null;

/// <value type="Element">TreeNode的节点元素, 根据nodeCellStyle设定</value>
TreeNode.prototype.__nodeObject = null;
/// <value type="Element">TreeNode DIV, 用于节点更新</value>
TreeNode.prototype.element = null;
/// <value type="Element">TreeNode Table, TABLE</value>
TreeNode.prototype.__nodeElement = null;
/// <value type="Element">TreeNode ChildNodes, DIV</value>
TreeNode.prototype.__childrenElement = null;
/// <value type="Element">TreeNode Burl IMG, IMG</value>
TreeNode.prototype.__burlElement = null;
/// <value type="Element">TreeNode CheckBox IMG, IMG</value>
TreeNode.prototype.__checkBoxElement = null;
/// <value type="Element">TreeNode Image IMG, IMG</value>
TreeNode.prototype.__imageElement = null;
/// <value type="Element">TreeNode Text, TD</value>
TreeNode.prototype.__textElement = null;
/// <value type="Element">TreeNode Link, A</value>
TreeNode.prototype.__linkElement = null;
/// <value type="Element">TreeNode Tip, TD</value>
TreeNode.prototype.__tipElement = null;

/// <value type="Element">在子节点未加载时保存数据的元素, element用来保存配置节点信息, xml用来保存从外部XML文件得到的节点信息</value>
TreeNode.prototype.__dataElement = null;
/// <value type="Array" elementType="String">属性数组, 用于初始化节点和getAttribute和setAttribute方法</value>
//TreeNode.prototype.attributes = new Array();

/// <value type="Boolean">指示节点是否有子节点</value>
TreeNode.prototype.hasChildNodes = false;
/// <value type="Array" elementType="TreeNode">获取当前节点子节点的集合</value>
//TreeNode.prototype.childNodes = [];	
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

/// <value type="String">从根TreeNode到当前节点的路径</value>
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
/// <value type="Boolean">判断节点是否处于选择状态</value>
TreeNode.prototype.selected = false;
/// <value type="Integer">判断节点是否处于选中状态 0 未选中 1 选中 2 部分子节点被选中</value>
TreeNode.prototype.checked = 0;
/// <value type="Boolean">判断节点是否正在被编辑</value>
TreeNode.prototype.editing = false;

TreeNode.prototype.populate = function () {
    /// <summary>装配节点</summary>

    //this.enabled = TreeView.__parseBoolean(this.enabled, true);

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
    while (/<[^>]+?>/i.test(this.text)) {
        this.text = this.text.replace(/<[^>]+?>/i, '');
    }

    // imageUrl | expandedImageUrl
    if (this.imageUrl == null) { this.imageUrl = ''; };
    if (this.expandedImageUrl == null) { this.expandedImageUrl = ''; };

    // navigateUrl && target
    if (this.navigateUrl == null) { this.navigateUrl = ''; }
    this.target = TreeView.__parseString(this.target, /\w+/i, 'I', this.treeView.defaultTarget);

    if (this.tip == null) { this.tip = ''; }

    //验证各非文本属性
    //样式, 如果null或'', 从TreeView继承
    this.cssClass = TreeView.__parseString(this.cssClass, /\w+/i, 'I', this.treeView.nodeClass);
    this.hoverClass = TreeView.__parseString(this.hoverClass, /\w+/i, 'I', this.treeView.hoverNodeClass);
    this.selectedClass = TreeView.__parseString(this.selectedClass, /\w+/i, 'I', this.treeView.selectedNodeClass);
    this.selectedHoverClass = TreeView.__parseString(this.selectedHoverClass, /\w+/i, 'I', this.treeView.selectedHoverNodeClass);
    this.tipClass = TreeView.__parseString(this.tipClass, /\w+/i, 'I', this.treeView.nodeTipClass);
    this.cutClass = TreeView.__parseString(this.cutClass, /\w+/i, 'I', this.treeView.cutNodeClass);
    this.editClass = TreeView.__parseString(this.editClass, /\w+/i, 'I', this.treeView.nodeEditClass);
    this.dropClass = TreeView.__parseString(this.dropClass, /\w+/i, 'I', this.treeView.dropChildClass);

    //indent, padding, spacing, childNodesPadding
    this.indent = TreeView.__parseInteger(this.indent, this.treeView.nodeIndent);
    this.padding = TreeView.__parseInteger(this.padding, this.treeView.nodePadding);
    this.spacing = TreeView.__parseInteger(this.spacing, this.treeView.nodeSpacing);
    this.childNodesPadding = TreeView.__parseInteger(this.childNodesPadding, this.treeView.childNodesPadding);

    // draggable:true, droppable:true 需要TreeView同时启用才能生效    
    this.draggable = TreeView.__parseBoolean(this.draggable, true);
    this.droppable = TreeView.__parseBoolean(this.droppable, true);

    //editable:true 需要TreeView同时启用才能生效
    this.editable = TreeView.__parseBoolean(this.editable, true);

    //dataSource
    if (this.dataSource == null) { this.dataSource = ''; }

    //hasChildNodes
    this.hasChildNodes = ((this.dataSource != '' && !this.loaded) || this.childNodes.length > 0 || this.__dataElement != null);

    var treeNode = this;

    var div, table, tbody, tr, td, img;

    //节点行
    div = document.createElement('DIV');
    div.id = '__node_' + this.name;
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
        var parent = this.parentNode;
        while (parent != null) {
            td = document.createElement('TD');
            td.style.width = parent.__nodeElement.getAttribute('indent');
            //td的宽度浏览器会自动加上cellPadding的宽度, 所有TD内填充图片宽度和TD宽度设置一致即可
            td.innerHTML = '<img src="' + this.treeView.imagesBaseUrl + 'blank.gif" width="' + parseInt(td.style.width) + '" height="1" border="0" />';
            if (tr.childNodes.length > 0) {
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
        this.__burlElement = img;
        if (this.hasChildNodes) {
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
            this.__checkBoxElement = img;
        }
        else {
            var input = document.createElement('INPUT');
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
            this.__checkBoxElement = input;
        }
        tr.appendChild(td);
    }

    //image
    if (this.treeView.showImages && this.imageUrl != '') {
        td = document.createElement('TD');
        td.align = 'center';
        td.setAttribute('sign', 'IMAGE');
        img = document.createElement('IMG');
        img.align = 'absmiddle';
        if (this.imageUrl != '') { img.src = this.treeView.imagesBaseUrl + this.imageUrl; }
        td.appendChild(img);
        tr.appendChild(td);

        this.__imageElement = img;
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
            this.__nodeObject = td;
            break;
        //        case 'NODE':                                                    
        //            this.__nodeObject = table;                                                    
            break;
        case 'ROW':
            this.__nodeObject = div;
            break;
        default:
            this.__nodeObject = td;
            break;
    }
    this.__nodeObject.className = (this.selected ? this.selectedClass : this.cssClass);

    //Edit
    if (this.treeView.nodeEditingEnabled) {
        this.__nodeObject.ondblclick = function () {
            treeNode.edit();
        }
    }

    //Drag & Drop
    if (this.treeView.dragAndDropEnabled) {
        //draggable为true才能拖动
        this.__nodeObject.draggable = this.draggable;

        this.__nodeObject.ondragstart = function (ev) {
            if (!treeNode.selected) { treeNode.select(false); }

            //如果已经展开, 隐藏
            if (treeNode.expanded) { treeNode.collapse(false); }

            //拖放事件
            //treeNode.treeView.__actions.dragging = true;
            TreeView.clipBoard.treeNode = treeNode;

            //拖放数据
            var t = ev.dataTransfer;

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
            treeNode.treeView.__executeEvent('onNodeDragStart', treeNode);
        }

        //是否可以拖放到其他节点, false 表示仅排序
        if (this.treeView.dropChildEnabled) {
            this.__nodeObject.ondragover = function (ev) {
                var originalNode = TreeView.clipBoard.treeNode;

                var droppable = true;
                //树内部或其他树的节点拖动
                if (originalNode != null) {
                    var oTreeView = originalNode.treeView;

                    //如果目标节点的droppable为false
                    //如果被drag节点是drop节点的lastChild, 不能drop                
                    //节点不能拖放到自己的子节点上                    
                    if (!treeNode.droppable) { droppable = false; }
                    if (originalNode == treeNode.lastChild) { droppable = false; }
                    if (treeNode.treeView == oTreeView && ('.' + treeNode.path + '.').indexOf('.' + originalNode.path + '.') > -1) { droppable = false; }
                }

                if (droppable) {
                    if (treeNode.treeView.__executeEvent('onNodeDragOver', treeNode)) {
                        ev.preventDefault();
                        //未展开节点放dragover 1s之后展开 - 有问题, 放弃
                        //                    if (!treeNode.expanded) {
                        //                        treeNode.treeView.__events.dragOverTimer = window.setTimeout(
                        //                            function () {
                        //                                treeNode.expand(false);
                        //                                window.clearTimeout(treeNode.treeView.__events.dragOverTimer);
                        //                            }, 2000);
                        //                    }

                        if (treeNode.dropClass != '') {
                            this.className = treeNode.dropClass;
                        }
                        else {
                            this.style.boxShadow = '1px 2px 6px #CCCCCC';
                        }
                    }
                }
            }

            this.__nodeObject.ondragleave = function (ev) {
                ev.preventDefault();

                if (treeNode.dropClass != '') {
                    this.className = '';
                }
                else {
                    this.style.boxShadow = '';
                }
            }

            this.__nodeObject.ondrop = function (ev) {
                var originalNode = TreeView.clipBoard.treeNode;

                //节点拖放
                if (originalNode != null) {
                    //__onAppended 添加完节点之后执行
                    var __onAppended = function (node) {

                        //结束拖放, 清空数据
                        TreeView.clipBoard.clear();

                        node.select(false);

                        //执行事件
                        if (TreeView.clipBoard.action == 'DRAGMOVE') {
                            treeNode.treeView.__executeEvent('onNodeMoved', node);
                        }
                        else if (TreeView.clipBoard.action == 'DRAGCOPY') {
                            treeNode.treeView.__executeEvent('onNodeCopied', node);
                        }
                        treeNode.treeView.__executeEvent('onNodeDropped', node);

                        //正常结束事件
                        treeNode.treeView.__executeEvent('onNodeDragEnd', node);
                    }

                    var node = originalNode.clone();

                    //处理原节点
                    if (TreeView.clipBoard.action == 'DRAGMOVE') {
                        //删除原节点
                        originalNode.remove(false);
                    }

                    //在当前节点添加子节点          
                    if (treeNode.hasChildNodes) {
                        //有子节点, 未展开
                        if (!treeNode.expanded) {
                            TreeNode.__attachEvent(treeNode, '__onExpanded',
                            function () {
                                TreeNode.__attachEvent(this, '__onAppended', __onAppended);
                                this.appendChild(node);
                            }
                        );
                            TreeView.clipBoard.__expanding = true;
                            treeNode.expand(false);
                        }
                        //有子节点, 已展开
                        else {
                            TreeNode.__attachEvent(treeNode, '__onAppended', __onAppended);
                            treeNode.appendChild(node);
                        }
                    }
                    else {
                        //无子节点
                        TreeNode.__attachEvent(treeNode, '__onAppended', __onAppended);
                        treeNode.appendChild(node);
                        treeNode.expand(false);
                    }
                }
                else {
                    //外部元素拖放
                    treeNode.treeView.__executeEvent('onExternalElementDropped', treeNode);
                    treeNode.select(false);
                }

                //清除拖放样式
                if (treeNode.dropClass != '') {
                    this.className = treeNode.cssClass;
                }
                else {
                    this.style.boxShadow = '';
                }

                ev.preventDefault();
                ev.stopPropagation();
            }
        }
        else {
            this.__nodeObject.ondragover = function (ev) {
                ev.stopPropagation();
            }
        }

        this.__nodeObject.ondragend = function (ev) {
            //if (treeNode.treeView.__events.dragOverTimer != null) window.clearTimeout(treeNode.treeView.__events.dragOverTimer);
            //恢复默认设置
            if (TreeView.clipBoard.action != '') {
                if (!TreeView.clipBoard.__expanding) { TreeView.clipBoard.clear(); }

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
                treeNode.treeView.__executeEvent('onNodeDragEnd', treeNode);
            }
        }
    }

    //为节点对象添加事件

    //鼠标划入:为了避免的nodeOptionsBox冲突
    TreeView.addListener(this.__nodeObject, 'mouseover', function (ev) {
        if (treeNode.treeView.__executeEvent('onNodeHover', this)) {
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
    this.__nodeObject.onmouseout = function () {
        this.className = (!treeNode.selected ? treeNode.cssClass : treeNode.selectedClass);
    }

    //点击
    this.__nodeObject.onclick = function (ev) {
        ev = ev || window.event;
        if (!treeNode.selected) {
            treeNode.select(ev);
        }
    }

    this.__nodeObject.oncontextmenu = function (ev) {

        //显示右键菜单
        if (!treeNode.editing) {
            ev = ev || window.event;
            if (!treeNode.selected) {
                treeNode.select(ev);
            }

            if (treeNode.treeView.nodeOptionsBox != null && treeNode.treeView.nodeOptionsBox.display == 'CONTEXTMENU') {
                treeNode.treeView.nodeOptionsBox.target = treeNode;
                treeNode.treeView.nodeOptionsBox.show(ev);
                return false;
            }
        }
    }

    //navigateUrl & text
    if (this.navigateUrl != null && this.navigateUrl != '') {
        var a = document.createElement('A');
        //a.id = table.id + '_text';
        a.setAttribute('sign', 'LINK');
        a.href = treeNode.navigateUrl;
        if (this.target != null && this.target != '') {
            a.target = this.target;
        }
        //a.innerHTML = TreeView.__textEncode(this.text);
        a.innerHTML = this.html;
        a.onclick = function () {
            //onNodeNavigate事件
            if (this.href != '' && this.href.indexOf('javascript:') == -1) {
                treeNode.treeView.__executeEvent('onNodeNavigate', treeNode);
            }
        }
        td.appendChild(a);
        if (!td.draggable) {
            a.draggable = false;
        }
    }
    else {
        //td.innerHTML = TreeView.__textEncode(this.text);
        td.innerHTML = this.html;
    }

    tr.appendChild(td);
    this.__textElement = td;

    if (this.tip != '') {
        td = document.createElement('TD');
        td.className = this.tipClass;
        td.style.cursor = 'default';
        td.style.whiteSpace = 'nowrap';
        td.innerHTML = this.tip;
        tr.appendChild(td);

        this.__tipElement = td;
    }

    tbody.appendChild(tr);
    table.appendChild(tbody);
    div.appendChild(table);

    this.element = div;
    this.__nodeElement = table;
    //nodeOptionsBox

    this.element.onmouseover = function (ev) {
        if (treeNode.treeView.nodeOptionsBox != null && treeNode.treeView.nodeOptionsBox.display != 'CONTEXTMENU' && treeNode.treeView.nodeOptionsBox.display != 'TOP') {
            if (!treeNode.editing) {
                if (!treeNode.treeView.nodeOptionsBox.visible || treeNode.treeView.nodeOptionsBox.target != treeNode) {
                    ev = ev || window.event;
                    treeNode.treeView.nodeOptionsBox.target = treeNode;
                    treeNode.treeView.nodeOptionsBox.show(ev);
                }
            }
        }
    }

    div = document.createElement('DIV');
    div.setAttribute('sign', 'CHILDNODES');
    div.setAttribute('for', this.name);
    if (this.childNodesPadding > 0) {
        if (this.treeView.showLines) {
            div.appendChild(TreeView.__populateChildNodesPadding(this, 'top'));
            div.appendChild(TreeView.__populateChildNodesPadding(this, 'bottom'));
        }
        else {
            div.style.paddingTop = this.childNodesPadding + 'px';
            div.style.paddingBottom = this.childNodesPadding + 'px';
        }
    }
    div.style.display = 'none';
    this.__childrenElement = div;
}

TreeNode.prototype.repopulate = function () {
    /// <summary>重新装配已经存在的节点</summary>

    this.loaded = false;
    this.expanded = false;

    var parentNode = this.element.parentNode;
    var nextSibling = this.__childrenElement.nextSibling;

    //删除
    parentNode.removeChild(this.__childrenElement);
    parentNode.removeChild(this.element);

    //装配
    this.populate();

    //重新添加
    if (nextSibling != null) {
        parentNode.insertBefore(this.element, nextSibling);
        parentNode.insertBefore(this.__childrenElement, nextSibling);
    }
    else {
        parentNode.appendChild(this.element);
        parentNode.appendChild(this.__childrenElement);
    }

    if (this.selected) { this.select(false); }
}

TreeNode.prototype.load = function (repopulate) {
    /// <summary>加载子节点项</summary>
    /// <param name="repopulate" type="Boolean">是否重新装配<param>
    this.loading = true;

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

    // 如果dataSource为空 或者 是仅从现有节点重新装备
    if ((this.dataSource == '' || repopulate == true) && !this.loaded) {
        //当没有子节点时, 处理burl为blank
        if (this.childNodes.length == 0) { this.unburl(); }

        this.loading = false;
        this.loaded = true;
        //执行TreeNode事件
        TreeNode.__executeEvent(this, '__onLoaded');

    }
};

TreeNode.prototype.reload = function (completely) {
    /// <summary>重新加载</summary>
    /// <param name="completely" type="Boolean" defaultValue="true">true: 从__dataElement和dataSource重新加载; false: 从childNodes重新加载</param>

    this.loaded = false;

    if (completely == false) {
        //仅重新装备节点
        this.load(true);
    }
    else {
        //记录展开状态
        var expanded = this.expanded;
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

    if (this.treeView != null) {

        this.expanding = true;

        //+-
        if (this.treeView.showBurls) {            
            this.__burlElement.src = this.__burlElement.getAttribute('c');
            this.__burlElement.setAttribute('current', 'c');
        }
        //image
        if (this.treeView.showImages && this.expandedImageUrl != '') {
            this.__imageElement.src = this.treeView.imagesBaseUrl + this.expandedImageUrl;
        }

        //展开子节点
        this.__childrenElement.style.display = '';

        //如果数据没有加载就加载		
        if (!this.loaded) {
            //展开动作引发的load, 附加expand事件
            TreeNode.__attachEvent(this, '__onLoaded', function () { if (this.expanding) { this.__completeExpanding(triggerEvent); } });
            this.load();
        }
        else {
            //有子节点, 但是没有子节点元素, 在移动或复制后会出现这种情况
            if (this.hasChildNodes && this.__childrenElement.innerHTML == '') { this.reload(false); }

            this.__completeExpanding(triggerEvent);
        }
    }
};

TreeNode.prototype.collapse = function (triggerEvent) {
    /// <summary>闭合节点</summary>
    if (this.treeView != null) {
        //+-
        if (this.treeView.showBurls) {
            this.__burlElement.src = this.__burlElement.getAttribute('e');
            this.__burlElement.setAttribute('current', 'e');
        }
        //image
        if (this.treeView.showImages && this.imageUrl != '') {
            this.__imageElement = this.treeView.imagesBaseUrl + this.imageUrl;
        }

        this.__childrenElement.style.display = 'none';

        this.expanded = false;
        if (triggerEvent != false) { this.treeView.__executeEvent('onNodeCollapsed', this); }

        //TreeNode.__executeEvent(this, '__onCollapsed');
    }
};

TreeNode.prototype.select = function (triggerEvent) {
    /// <summary>选择当前节点</summary>
    /// <param name="triggerEvent" type="Boolean|Event">是否触发事件, 默认触发</param>

    if (this.treeView != null && this != this.treeView.selectedNode) {

        if (this.treeView.selectedNode != null) {
            this.treeView.selectedNode.unselect();
        }

        this.__nodeObject.className = this.selectedClass;

        this.selected = true;

        // selectedNode
        this.treeView.selectedNode = this;

        // 触发各种事件
        if (triggerEvent != false) {
            //onNodeSelected
            this.treeView.__executeEvent('onNodeSelected', this);

            //TreeNode.__executeEvent(this, '__onSelected');

            var doToggle = true;

            //triggerEvent为用户点击事件 或 键盘事件
            if (typeof (triggerEvent) == 'object') {
                //由burl节点触发的节点切换不再触发 expandOnSelect && collapseOnSelect
                if (this.treeView.nodeCellStyle != 'TEXT' && triggerEvent.type == 'click') {
                    var target = triggerEvent.target || triggerEvent.srcElement;
                    if (target == this.__burlElement) { doToggle = false; }
                }

                //键盘导航时不再触发 expandOnSelect && collapseOnSelect
                if (this.treeView.keyboardEnabled && triggerEvent.type == 'keyup') {
                    if (triggerEvent.keyCode == 38 || triggerEvent.keyCode == 40) { doToggle = false; }
                }
            }

            if (doToggle) {
                //是否由用户触发事件
                // expandOnSelect
                if (this.hasChildNodes && this.treeView.expandOnSelect && !this.expanded && !this.expanding) {
                    this.expand(triggerEvent);
                }
                // collapseOnSelect
                else if (this.hasChildNodes && this.treeView.collapseOnSelect && this.expanded) {
                    this.collapse(triggerEvent);
                }
            }
        }

        if (this.treeView.nodeOptionsBox != null && this.treeView.nodeOptionsBox.display != 'CONTEXTMENU') {
            if (!this.treeView.nodeOptionsBox.visible || this.treeView.nodeOptionsBox.target != this) {
                this.treeView.nodeOptionsBox.target = this;
                this.treeView.nodeOptionsBox.show(triggerEvent);
            }            
        }
    }
};

TreeNode.prototype.unselect = function () {
    /// <summary>取消选择当前节点</summary>
    if (this.treeView != null) {
        if (this.selected) {
            this.__nodeObject.className = this.cssClass;

            this.selected = false;

            this.treeView.selectedNode = null;

            //TreeNode.__executeEvent(this, '__onUnSelected');
        }
    }
};

TreeNode.prototype.burl = function () {
    /// <summary>恢复节点的+-</summary>

    // 给当前节点添加burl
    if (typeof (this.treeView.expandImageUrl) == 'string') {
        this.__burlElement.setAttribute('e', this.treeView.imagesBaseUrl + this.treeView.expandImageUrl);
    }
    else if (this.treeView.expandImageUrl instanceof Array) {
        this.__burlElement.setAttribute('e', this.treeView.imagesBaseUrl + this.treeView.expandImageUrl[0]);
        this.__burlElement.setAttribute('eh', this.treeView.imagesBaseUrl + this.treeView.expandImageUrl[1]);
    }
    if (typeof (this.treeView.collapseImageUrl) == 'string') {
        this.__burlElement.setAttribute('c', this.treeView.imagesBaseUrl + this.treeView.collapseImageUrl);
    }
    else if (this.treeView.collapseImageUrl instanceof Array) {
        this.__burlElement.setAttribute('c', this.treeView.imagesBaseUrl + this.treeView.collapseImageUrl[0]);
        this.__burlElement.setAttribute('ch', this.treeView.imagesBaseUrl + this.treeView.collapseImageUrl[1]);
    }
    //如果正在展开或者已经展开
    if (this.expanding || this.expanded) {
        this.__burlElement.src = this.__burlElement.getAttribute('c');
        this.__burlElement.setAttribute('current', 'c');

        this.__childrenElement.style.display = '';
    }
    else {
        this.__burlElement.src = this.__burlElement.getAttribute('e');
        this.__burlElement.setAttribute('current', 'e');

        //if (this.__childrenElement) {this.__childrenElement.style.display = 'none';}
    }

    this.__burlElement.onmouseover = function () {
        if (this.getAttribute('current') == 'c' && this.getAttribute('ch') != null) {
            this.src = this.getAttribute('ch');
            this.setAttribute('current', 'ch');
        }
        else if (this.getAttribute('current') == 'e' && this.getAttribute('eh') != null) {
            this.src = this.getAttribute('eh');
            this.setAttribute('current', 'eh');
        }
    }

    this.__burlElement.onmouseout = function () {
        if (this.getAttribute('current') == 'ch') {
            this.src = this.getAttribute('c');
            this.setAttribute('current', 'c');
        }
        else if (this.getAttribute('current') == 'eh') {
            this.src = this.getAttribute('e');
            this.setAttribute('current', 'e');
        }
    }

    var treeNode = this;
    this.__burlElement.onclick = function (ev) { treeNode.toggle(ev); }

    //TreeNode.__executeEvent(this, '__onBurled');
}

TreeNode.prototype.unburl = function () {
    /// <summary>去掉节点的+-</summary>

    // 去掉当前节点的burl
    if (this.treeView.showBurls) {
        this.__burlElement.src = this.treeView.imagesBaseUrl + 'blank.gif';
        this.__burlElement.onmouseover = null;
        this.__burlElement.onmouseout = null;
        this.__burlElement.onclick = null;
    }
    // 恢复节点图标
    if (this.treeView.showImages && this.expandedImageUrl != '' && this.imageUrl != '') {
        this.__imageElement.src = this.treeView.imagesBaseUrl + this.imageUrl;
    }

    // 恢复展开默认值
    this.hasChildNodes = false;

    this.__childrenElement.style.display = 'none';
    this.expanded = false;

    //TreeNode.__executeEvent(this, '__onUnBurled');
};

TreeNode.prototype.check = function (triggerEvent) {
    /// <summary>选中当前节点</summary>
    /// <param name="triggerEvent" type="Boolean">是否触发事件, 默认触发</param>

    this.__toggleCheckBox(1);

    if (this.treeView.showCheckBoxes == 'RELATIVE') {
        //检查子项
        this.__traverseChildNodes();

        //检查父级项
        this.__traverseParentNodes();
    }

    //执行事件
    if (triggerEvent != false) { this.treeView.__executeEvent('onNodeCheckChanged', this); }

    //TreeNode.__executeEvent(this, '__onChecked');
};

TreeNode.prototype.uncheck = function (triggerEvent) {
    /// <summary>取消选中当前节点</summary>
    this.__toggleCheckBox(0);

    if (this.treeView.showCheckBoxes == 'RELATIVE') {
        //检查子项数
        this.__traverseChildNodes();

        //检查父级项 - 需要递归函数
        this.__traverseParentNodes();
    }

    //执行事件
    if (triggerEvent != false) { this.treeView.__executeEvent('onNodeCheckChanged', this); }

    //TreeNode.__executeEvent(this, '__onUnChecked');
}

TreeNode.prototype.navigate = function () {
    /// <summary>打开节点链接</summary>

    if (this.navigateUrl != '' && this.navigateUrl.indexOf('javascript:') == -1) {
        if (this.target == '' || this.target == '_self') {
            window.location.href = this.navigateUrl;
        }
        else if (this.target == '_blank') {
            window.open(this.navigateUrl);
        }
        else if (this.target == '_top') {
            top.location.href = this.navigateUrl;
        }
        else {
            window.frames[this.target].location.href = this.navigateUrl;
        }

        this.treeView.__executeEvent('onNodeNavigate', this);
    }
}

TreeNode.prototype.getAttribute = function (attributeName) {
    /// <summary>Xml格式时得到自定义的属性值</summary>

    return this.attributes[attributeName.toLowerCase()];
}

TreeNode.prototype.setAttribute = function (attributeName, attributeValue) {
    /// <summary>Xml格式设置自定义的属性值</summary>

    this.attributes[attributeName.toLowerCase()] = attributeValue;
}

TreeNode.prototype.appendChild = function (treeNode, action) {
    /// <summary>添加子节点</summary>

    //name
    treeNode.__parseName(this.name + '_' + this.childNodes.length);

    //parentNode
    treeNode.parentNode = this;
    //treeView
    treeNode.treeView = this.treeView;
    //depth
    treeNode.depth = this.depth + 1;
    //path
    treeNode.path = this.path + '.' + treeNode.name;

    var length = this.childNodes.length;

    //index
    treeNode.index = length;

    // childNodes
    this.childNodes.push(treeNode);

    // render
    this.childNodes[length].populate();

    var ref = null; //参考节点
    
    if (this.__childrenElement.childNodes.length > 0) {
        if (this.__childrenElement.lastChild.getAttribute('sign') == 'CHILDNODESPADDING') {
            if (this.__childrenElement.lastChild.previousSibling.getAttribute('sign') == 'SPACING') {
                ref = this.__childrenElement.lastChild.previousSibling;
            }
            else {
                ref = this.__childrenElement.lastChild;
            }
        }
        else if (this.__childrenElement.lastChild.getAttribute('sign') == 'SPACING') {
            ref = this.__childrenElement.lastChild;
        }
    }

    if (ref != null) {
        this.__childrenElement.insertBefore(this.childNodes[length].element, ref);
        this.__childrenElement.insertBefore(this.childNodes[length].__childrenElement, ref);
    }
    else {
        this.__childrenElement.appendChild(this.childNodes[length].element);
        this.__childrenElement.appendChild(this.childNodes[length].__childrenElement);
    }
    if (this.childNodes[length].element.classList != null) {
        this.childNodes[length].element.classList.add('treeNodeFadeInClass');
    }

    // firstChild & lastChild
    if (length == 0) { this.firstChild = this.childNodes[length]; }
    this.lastChild = this.childNodes[length];

    //previousSibling & nextSibling
    if (length > 0) {
        this.childNodes[length].previousSibling = this.childNodes[length - 1];
        this.childNodes[length - 1].nextSibling = this.childNodes[length];
    }

    //启用dragAndDrop 或者 spacing大于0并且showLines时, 创建分隔DIV
    if (this.treeView.dragAndDropEnabled || (this.childNodes[length].spacing > 0 && this.treeView.showLines)) {

        //before
        var divB = document.createElement('DIV');
        divB.setAttribute('sign', 'SPACING');
        divB.style.height = this.childNodes[0].spacing + 'px';
        //divB.style.backgroundColor = '#F0C';
        divB.setAttribute('parent', this.name);
        divB.setAttribute('prev', (length == 0 ? '' : this.childNodes[length - 1].name));
        divB.setAttribute('next', this.childNodes[length].name);
        this.__childrenElement.insertBefore(divB, this.childNodes[length].element);

        if (length > 0) {
            this.childNodes[length].__childrenElement.nextSibling.setAttribute('prev', this.childNodes[length].name);
        }

        if (this.treeView.showLines && this.childNodes[length].spacing > 0) {
            divB.appendChild(TreeView.__populateLinesSpacing(this.childNodes[length]));
        }

        if (this.treeView.dragAndDropEnabled) {
            divB.appendChild(TreeView.__populateDropLine(this.childNodes[length]));
        }

        if (length == 0) {
            //after
            var divA = document.createElement('DIV');
            divA.setAttribute('sign', 'SPACING');
            divA.style.height = '0px';
            //divA.style.borderBottom = '1px dotted #F0C';
            //divB.style.backgroundColor = '#F0C';
            divA.setAttribute('parent', this.name);
            divA.setAttribute('prev', this.childNodes[0].name);
            divA.setAttribute('next', '');
            if (this.__childrenElement.lastChild.getAttribute('sign') == 'CHILDNODESPADDING') {
                this.__childrenElement.insertBefore(divA, this.__childrenElement.lastChild);
            }
            else {
                this.__childrenElement.appendChild(divA);
            }

            if (this.treeView.dragAndDropEnabled) {
                divA.appendChild(TreeView.__populateDropLine(this.childNodes[0], true));
            }

            //因为高度为0, 忽略showLines
        }

        //dropLine
        //        if (this.treeView.dragAndDropEnabled) {
        //            //添加拖放线0
        //            if (length == 0) {
        //                this.__childrenElement.insertBefore(TreeView.__populateDropLine(null, this.childNodes[0]), this.childNodes[0].element);
        //            }
        //            //添加节点下方的拖放线
        //            this.__childrenElement.appendChild(TreeView.__populateDropLine(this.childNodes[length], null));
        //            //更新上方dropLine的next属性
        //            if (length > 0) {
        //                this.childNodes[length].element.previousSibling.setAttribute('next', this.childNodes[length].name);
        //            }
        //        }
    }

    // 如果添加的节点是第一个节点, 处理burl为+-, 并展开节点
    if (length == 0 && !this.hasChildNodes) {
        if (this.treeView.showBurls) {
            this.burl();
        }
        this.hasChildNodes = true;
    }

    this.childNodes[length].__setLines();

    TreeNode.__executeEvent(this, '__onAppended', treeNode);

    if (action != null) {
        action = action.toUpperCase();
        switch (action) {
            case 'EDIT':
                treeNode.edit();
                break;
        }
    }
};

TreeNode.prototype.insertBefore = function (treeNode, referenceNode) {
    /// <summary>在referenceNode之前插入节点</summary>
    /// <param name="treeNode" type="TreeNode">要添加的节点</param>
    /// <param name="referenceNode" type="TreeNode">参考节点</param>

    //name
    treeNode.__parseName(this.id + '_' + this.childNodes.length);

    //parentNode
    treeNode.parentNode = this;
    //treeView
    treeNode.treeView = this.treeView;
    //depth
    treeNode.depth = this.depth + 1;
    //path
    treeNode.path = this.path + '.' + treeNode.name;

    //index
    var index = referenceNode.index;

    // childNodes
    this.childNodes.splice(index, 0, treeNode);

    // render	
    this.childNodes[index].populate();
    if (referenceNode.element.previousSibling != null && referenceNode.element.previousSibling.getAttribute('sign') == 'SPACING') {
        this.__childrenElement.insertBefore(this.childNodes[index].element, referenceNode.element.previousSibling);
        this.__childrenElement.insertBefore(this.childNodes[index].__childrenElement, referenceNode.element.previousSibling);
    }
    else {
        this.__childrenElement.insertBefore(this.childNodes[index].element, referenceNode.element);
        this.__childrenElement.insertBefore(this.childNodes[index].__childrenElement, referenceNode.element);
    }

    for (var i = index; i < this.childNodes.length; i++) {
        this.childNodes[i].index = i;
    }

    // firstChild
    if (index == 0) { this.firstChild = this.childNodes[0]; }

    //previousSibling & nextSibling
    var previousNode = referenceNode.previousSibling;
    this.childNodes[index].previousSibling = previousNode;
    if (previousNode != null) { previousNode.nextSibling = this.childNodes[index]; }
    this.childNodes[index].nextSibling = referenceNode;
    referenceNode.previousSibling = this.childNodes[index];

    //启用dragAndDrop 或者 spacing大于0并且showLines时, 创建分隔DIV
    if (this.treeView.dragAndDropEnabled || (this.childNodes[index].spacing > 0 && this.treeView.showLines)) {
        //before 在节点之前添加间隔
        var divB = document.createElement('DIV');
        divB.style.height = this.childNodes[0].spacing + 'px';
        //divB.style.backgroundColor = '#FC0';
        divB.setAttribute('sign', 'SPACING');
        divB.setAttribute('parent', this.name);
        divB.setAttribute('prev', (index > 0 ? this.childNodes[index - 1].name : ''));
        divB.setAttribute('next', this.childNodes[index].name);
        this.__childrenElement.insertBefore(divB, this.childNodes[index].element);

        //更新下方spacing的prev
        this.childNodes[index].__childrenElement.nextSibling.setAttribute('prev', this.childNodes[index].name);

        if (this.treeView.showLines && this.childNodes[index].spacing > 0) {
            divB.appendChild(TreeView.__populateLinesSpacing(this.childNodes[index]));
        }

        if (this.treeView.dragAndDropEnabled) {
            //添加dropLine
            divB.appendChild(TreeView.__populateDropLine(this.childNodes[index]));
        }        

        //dropLine
        //        if (this.treeView.dragAndDropEnabled) {
        //            //添加节点下方的dropLine
        //            this.__childrenElement.insertBefore(TreeView.__populateDropLine(this.childNodes[index], referenceNode), referenceNode.element);
        //            //更新上面节点的dropLine的next属性
        //            this.childNodes[index].element.previousSibling.setAttribute('next', this.childNodes[index].name);
        //        }
    }

    this.childNodes[index].__setLines();

    //TreeNode.__executeEvent(this, '__onInserted', treeNode);
};

TreeNode.prototype.removeChild = function (treeNode) {
    /// <summary>删除子节点</summary>
    
    var index = treeNode.index;

    if (this.treeView.dragAndDropEnabled || (this.childNodes[index].spacing > 0 && this.treeView.showLines)) {
        if (this.childNodes.length == 1) {
            //删除下方的spacing
            this.__childrenElement.removeChild(this.childNodes[index].__childrenElement.nextSibling);
        }
        else if (this.childNodes.length >= 1) {
            //节点的下方spacing的prev变为上一个节点的name
            this.childNodes[index].__childrenElement.nextSibling.setAttribute('prev', (index > 0 ? this.childNodes[index - 1].name : ''));
        }

        //删除上方的spacing
        this.__childrenElement.removeChild(this.childNodes[index].element.previousSibling);
    }

    //dropLine
    //    if (this.treeView.dragAndDropEnabled) {
    //        if (this.childNodes.length == 1) {
    //            //删除最后一个节点上方的dropLine
    //            this.__childrenElement.removeChild(this.__childrenElement.firstChild);
    //        }
    //        else if (this.childNodes.length >= 1) {
    //            //节点的上一个dropLine的next值变为下一个节点的name
    //            this.childNodes[index].element.previousSibling.setAttribute('next', (this.childNodes[index].nextSibling != null ? this.childNodes[index + 1].name : ''));
    //        }
    //        //先删除节点下方的dropLine
    //        this.__childrenElement.removeChild(this.childNodes[index].__childrenElement.nextSibling);
    //    }

    //删除元素节点
    this.__childrenElement.removeChild(this.childNodes[index].element);
    this.__childrenElement.removeChild(this.childNodes[index].__childrenElement);

    //从子节点集合中删除子节点
    this.childNodes.splice(index, 1);
    //清空
    treeNode.treeView = null;
    treeNode.parentNode = null;
    treeNode = null;

    //index
    for (var i = index; i < this.childNodes.length; i++) {
        this.childNodes[i].index = i;
    }

    //checked
    //删除前, 如果当前节点checked为2, 子节点数量肯定大于等于2
    //删除之后, 根据第一个子节点的选中状态向上递归
    if (this.treeView.showCheckBoxes == 'RELATIVE') {
        if (this.checked == 2) { this.childNodes[0].__traverseParentNodes(); }
    }

    // firstChild, lastChild, nextSibling, previousSibling
    if (this.childNodes.length == 0) {
        //一项不剩下
        this.firstChild = null;
        this.lastChild = null;
    }
    else if (this.childNodes.length == 1) {
        //只剩下一项
        this.firstChild = this.childNodes[0];
        this.lastChild = this.childNodes[0];
        this.childNodes[0].previousSibling = null;
        this.childNodes[0].nextSibling = null;
    }
    else {
        if (index == 0) {
            //是第一项
            this.firstChild = this.childNodes[0];
            this.childNodes[0].previousSibling = null;
        }
        else if (index == this.childNodes.length) {
            //是最后一项
            this.lastChild = this.childNodes[index - 1];
            this.childNodes[index - 1].nextSibling = null;
        }
        else {
            //在中间
            this.childNodes[index].previousSibling = this.childNodes[index - 1];
            this.childNodes[index - 1].nextSibling = this.childNodes[index];
        }
    }

    //+-
    if (this.childNodes.length == 0) { this.unburl(); }

    if (this.childNodes.length > 0 && index == this.childNodes.length) {
        this.lastChild.__setLines();
    }
};

TreeNode.prototype.removeAll = function () {
    /// <summary>删除所有子节点</summary>

    this.childNodes.length = 0;
    this.hasChildNodes = false;
    this.__childrenElement.innerHTML = '';
    this.__childrenElement.style.display = 'none';
    this.unburl();

    //firstChild & lastChild
    this.firstChild = null;
    this.lastChild = null;

    //checkbox
    if (this.treeView.showCheckBoxes == 'RELATIVE') {
        if (this.checked == 2) { this.uncheck(false); }
    }
};

TreeNode.prototype.remove = function (triggerEvent) {
    /// <summary>删除自身</summary>

    var doRemove = true;
    if (triggerEvent != false) {
        doRemove = this.treeView.__executeEvent('onNodeRemove', this);
    }

    if (doRemove) {
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
        
        if (this.treeView.__executeEvent('onNodeEdit', this)) {
            //同时只能编辑一个节点
            if (this.treeView.__editingNode != null) {
                this.treeView.__editingNode.reset();
            }
            this.treeView.__editingNode = this;

            //编辑时禁用拖放
            if (this.treeView.dragAndDropEnabled) {
                this.__nodeObject.draggable = false;
            }

            function __getLength(str) {
                var l = 0;
                var c;
                for (var i = 0; i < str.length; i++) {
                    c = str.charCodeAt(i);
                    l += (c < 256 || (c >= 0xff61 && c <= 0xff9f)) ? 1 : 2;
                }
                return l;
            }

            this.__textElement.setAttribute('text', this.text);
            this.__textElement.setAttribute('html', this.html);
            if (this.__textElement.firstChild.nodeType == 1 && this.__textElement.firstChild.getAttribute('sign') == 'LINK') {
                this.__textElement.firstChild.style.display = 'none';
            }
            else {
                this.__textElement.innerHTML = '';
            }

            var treeNode = this;
            var input = document.createElement('INPUT');
            input.type = 'text';
            input.className = this.editClass;
            input.value = this.text;
            input.defaultValue = this.text;
            input.size = __getLength(this.text) + 1;
            input.onkeyup = function (ev) {
                ev = ev || window.event;
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
                    this.size = __getLength(this.value) + 1;
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
                    var r = this.createTextRange();
                    r.moveStart('character', this.value.length);
                    r.collapse(true);
                    r.select();
                }
            }

            this.__textElement.appendChild(input);
            input.focus();
            //v x
            var td = document.createElement('TD');
            td.setAttribute('sign', 'EDITING');
            td.style.whiteSpace = 'nowrap';
            //v
            var a, img;
            a = document.createElement('A');
            a.href = 'javascript:void(0);';
            a.title = 'OK';
            img = document.createElement('IMG');
            img.width = 16;
            img.height = 16;
            img.src = this.treeView.imagesBaseUrl + 'ok.png';
            img.align = 'absmiddle';
            img.style.borderWidth = '1px';
            img.style.borderStyle = 'solid';
            img.style.borderColor = 'transparent';
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
            a = document.createElement('A');
            a.href = 'javascript:void(0);';
            a.title = 'Cancel';
            img = document.createElement('IMG');
            img.width = 16;
            img.height = 16;
            img.src = this.treeView.imagesBaseUrl + 'cancel.png';
            img.align = 'absmiddle';
            img.style.borderWidth = '1px';
            img.style.borderStyle = 'solid';
            img.style.borderColor = 'transparent';
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

            if (this.__textElement.nextSibling != null) {
                this.__textElement.parentNode.insertBefore(td, this.__textElement.nextSibling);
            }
            else {
                this.__textElement.parentNode.appendChild(td);
            }

            this.editing = true;

            //隐藏nodeOptionsBox
            if (this.treeView.nodeOptionsBox != null && /^(FOLLOW)|(LEFT)|(RIGHT)$/i.test(this.treeView.nodeOptionsBox.display)) {
                this.treeView.nodeOptionsBox.hide(true);
            }
        }
    }
};

TreeNode.prototype.update = function () {
    /// <summary>根据节点配置更新TreeNode节点的显示</summary>
    // ownProperty excludes childNodes & attributes
    // text, imageUrl, expandedImageUrl, tip, title, navigateUrl, target

    if (this.treeView != null) {
        //name
        this.element.id = '__node_' + this.name;

        //path
        if (this.parentNode == null) {
            this.path = this.name;
        }
        else {
            this.path = this.parentNode.path + '.' + this.name;
        }
        this.setAttribute('path', this.path);

        // imageUrl | expandedImageUrl
        if (this.treeView.showImages) {
            if (this.expanded && this.expandedImageUrl != '') {
                this.__imageElement.src = this.treeView.imagesBaseUrl + this.expandedImageUrl;
            }
            else {
                this.__imageElement.src = this.treeView.imagesBaseUrl + this.imageUrl;
            }
        }

        // title
        this.__textElement.title = this.title;

        // navigateUrl & text
        if (this.navigateUrl != '') {
            this.__linkElement.href = this.navigateUrl;
            this.target = TreeView.__parseString(this.target, /\w+/i, 'I', this.treeView.defaultTarget);
            this.__linkElement.target = this.target;
            this.__linkElement.innerHTML = TreeView.__textEncode(this.text);
        }
        else {
            this.__textElement.innerHTML = TreeView.__textEncode(this.text);
        }

        // tip
        if (this.tip != '') {
            if (this.__tipElement == null) {
                var td = document.createElement('TD');
                td.className = this.tipClass;
                td.style.cursor = 'default';
                td.style.whiteSpace = 'nowrap';
                td.innerHTML = this.tip;
                this.__nodeElement.rows[0].appendChild(td);

                this.__tipElement = td;
            }
            this.__tipElement.innerHTML = this.tip;
        }
    }
};

TreeNode.prototype.updateText = function (text) {
    /// <summary>更新文本并从编辑状态恢复为正常状态</summary>
    /// <param name="text" valueType="String"></param>
    this.text = text;
    if (/<text>(.*?)<\/text>/i.test(this.html)) {
        this.html = this.html.replace(/<text>(.*?)<\/text>/i, '<text>' + text + '</text>');
    }
    else {
        this.html = text;
    }
    if (this.__textElement.firstChild.nodeType == 1 && this.__textElement.firstChild.getAttribute('sign') == 'LINK') {
        this.__textElement.firstChild.innerHTML = this.html//TreeView.__textEncode(text);
        this.__textElement.firstChild.style.display = '';
        this.__textElement.removeChild(this.__textElement.lastChild);
    }
    else {
        //this.__textElement.innerHTML = TreeView.__textEncode(text);
        this.__textElement.removeChild(this.__textElement.firstChild); //移除文本框
        this.__textElement.innerHTML = this.html; //
        //this.__textElement.appendChild(document.createTextNode(TreeView.__textEncode(text)));
    }

    //v x
    this.__textElement.parentNode.removeChild(this.__textElement.nextSibling);

    this.editing = false;
    this.treeView.__editingNode = null;

    //恢复拖放
    if (this.treeView.dragAndDropEnabled) {
        this.__nodeObject.draggable = this.draggable;
    }

    //恢复nodeOptionsBox
    if (this.treeView.nodeOptionsBox != null && /^(FOLLOW)|(LEFT)|(RIGHT)$/i.test(this.treeView.nodeOptionsBox.display)) {
        this.treeView.nodeOptionsBox.target = this;
        this.treeView.nodeOptionsBox.show();
    }

    //执行事件
    this.treeView.__executeEvent('onNodeTextChanged', this);
};

TreeNode.prototype.updateTip = function (tip) {
    /// <summary>更新tip内容</summary>
    /// <param name="tip" valueType="Text|Html">要更新的tip内容</param>

    if (tip != null) { this.tip = tip; }
    this.__tipElement.innerHTML = this.tip;
};

TreeNode.prototype.reset = function () {
    /// <summary>从编辑状态恢复为正常状态</summary>
    if (this.__textElement.firstChild.nodeType == 1 && this.__textElement.firstChild.getAttribute('sign') == 'LINK') {
        this.__textElement.firstChild.innerHTML = this.__textElement.getAttribute('html');//TreeView.__textEncode(this.__textElement.getAttribute('text'));
        this.__textElement.firstChild.style.display = '';
        this.__textElement.removeChild(this.__textElement.lastChild);
    }
    else {
        this.__textElement.removeChild(this.__textElement.firstChild);
        this.__textElement.innerHTML = this.__textElement.getAttribute('html');
        //this.__textElement.appendChild(document.createTextNode(TreeView.__textEncode(this.__textElement.getAttribute('text'))));
    }    
    //v x
    this.__textElement.parentNode.removeChild(this.__textElement.nextSibling);

    this.editing = false;
    this.treeView.__editingNode = null;

    if (this.treeView.dragAndDropEnabled) {
        this.__nodeObject.draggable = this.draggable;
    }

    //恢复nodeOptionsBox
    if (this.treeView.nodeOptionsBox != null && /^(FOLLOW)|(LEFT)|(RIGHT)$/i.test(this.treeView.nodeOptionsBox.display)) {
        this.treeView.nodeOptionsBox.target = this;
        this.treeView.nodeOptionsBox.show();
    }
}

TreeNode.prototype.resetText = function () {
    /// <summary>恢复最后一次编辑之前的文字</summary>

    //this.text = TreeView.__textEncode(this.__textElement.getAttribute('text'));
    this.text = this.__textElement.getAttribute('text');
    this.html = this.__textElement.getAttribute('html');
    if (this.__textElement.firstChild.nodeType == 1 && this.__textElement.firstChild.getAttribute('sign') == 'LINK') {
        this.__textElement.firstChild.innerHTML = this.html;
    }
    else {
        this.__textElement.innerHTML = this.html;
    }
}

TreeNode.prototype.clone = function (args) {
    /// <summary>克隆一个节点, 默认只克隆OwnProperty</summary>
    /// <param name="args" type="String">要克隆的一个或多个非OwnProperty属性</param>
    var node = new TreeNode();

    //childNodes不克隆, 使用时重新加载

    //OwnProperties
    for (var member in this) {
        if (node.hasOwnProperty(member)) { node[member] = this[member]; }
    }

    //复制状态
    node.hasChildNodes = this.hasChildNodes;
    node.loaded = this.loaded;
    node.selected = this.selected;
    node.checked = this.checked;

    //Non-OwnProperties
    for (var i = 0; i < arguments.length; i++) { node[arguments[i]] = this[arguments[i]]; }

    return node;
}

TreeNode.prototype.cut = function () {
    /// <summary>剪切节点</summary>

    //剪贴板有其他节点
    if (TreeView.clipBoard.action != '') {
        //有其他节点正在被剪切, 恢复样式
        if (TreeView.clipBoard.action == 'MOVE') {
            var node = TreeView.clipBoard.treeNode;
            if (node.cutClass != '') {
                node.__nodeObject.className = (node.selected ? node.selectedClass : node.cssClass);
            }
            else {
                node.__nodeObject.style.opacity = 1;
            }
        }

        TreeView.clipBoard.clear();
    }

    TreeView.clipBoard.treeNode = this;
    TreeView.clipBoard.action = 'MOVE';

    if (this.cutClass != '') {
        this.__nodeObject.className = this.cutClass;
    }
    else {
        this.__nodeObject.style.opacity = 0.5;
    }
}

TreeNode.prototype.copy = function () {
    /// <summary>拷贝节点</summary>

    //剪贴板有其他节点
    if (TreeView.clipBoard.action != '') {
        //有其他节点正在被剪切, 恢复样式
        if (TreeView.clipBoard.action == 'MOVE') {
            var node = TreeView.clipBoard.treeNode;
            if (node.cutClass != '') {
                node.__nodeObject.className = (node.selected ? node.selectedClass : node.cssClass);
            }
            else {
                node.__nodeObject.style.opacity = 1;
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
            var treeNode = this;

            //__onAppended 添加完节点之后执行
            var __onAppended = function (node) {

                node.select(false);

                //执行事件
                if (TreeView.clipBoard.action == 'MOVE') {
                    treeNode.treeView.__executeEvent('onNodeMoved', node);
                    //清空数据
                    TreeView.clipBoard.clear();
                }
                else {
                    treeNode.treeView.__executeEvent('onNodeCopied', node);
                }
            }

            var originalNode = TreeView.clipBoard.treeNode;
            var node = originalNode.clone();

            //处理原节点
            if (TreeView.clipBoard.action == 'MOVE') {
                //删除原节点
                originalNode.remove(false);                
            }

            //在当前节点添加子节点          
            if (treeNode.hasChildNodes) {
                //有子节点, 未展开
                if (!treeNode.expanded) {
                    TreeNode.__attachEvent(treeNode, '__onExpanded', function () {
                        TreeNode.__attachEvent(this, '__onAppended', __onAppended);
                        this.appendChild(node);
                    });
                    TreeView.clipBoard.__expanding = true;
                    treeNode.expand(false);
                }
                //有子节点, 已展开
                else {
                    TreeNode.__attachEvent(treeNode, '__onAppended', __onAppended);
                    treeNode.appendChild(node);
                }
            }
            else {
                //无子节点
                TreeNode.__attachEvent(treeNode, '__onAppended', __onAppended);
                treeNode.appendChild(node);
                treeNode.expand(false);
            }


        }
        //        else {
        //            window.alert("Can't copy or move ancestor node to this node.");
        //        }
    }
}

TreeNode.prototype.__completeExpanding = function (triggerEvent) {
    /// <summary>完成展开</summary>
    /// <param name="triggerEvent" type="Boolean">是否触发事件, 默认触发</param>

    this.expanding = false;

    if (this.hasChildNodes) { this.expanded = true; }

    //如果行为来自用户, 执行TreeView事件
    if (triggerEvent != false) {
        this.treeView.__executeEvent('onNodeExpanded', this);
    }

    //执行TreeNode私有事件
    TreeNode.__executeEvent(this, '__onExpanded');
};

TreeNode.prototype.__toggleCheckBox = function (checkedState) {
    /// <summary>切换checkbox状态和checked</summary>
    /// <param name="checkedState" valueType="Integer">要切换到的状态</param>

    if (this.treeView.showCheckBoxes == 'RELATIVE') {
        switch (checkedState) {
            case 0:
                this.__checkBoxElement.src = this.__checkBoxElement.src.replace(/checkbox_(1|2)/i, 'checkbox_0');
                break;
            case 1:
                this.__checkBoxElement.src = this.__checkBoxElement.src.replace(/checkbox_(0|2)/i, 'checkbox_1');
                break;
            case 2:
                this.__checkBoxElement.src = this.__checkBoxElement.src.replace(/checkbox_(0|1)/i, 'checkbox_2');
                break;
        }
    }
    else if (this.treeView.showCheckBoxes == 'SINGLE') {
        switch (checkedState) {
            case 0:
                this.__checkBoxElement.checked = false;
                break;
            case 1:
                this.__checkBoxElement.checked = true;
                break;
        }
    }
    this.checked = checkedState;
};

TreeNode.prototype.__traverseChildNodes = function () {
    /// <summary>遍历子节点, 让子节点的选中状态和父节点一致, 适用于当前节点选中状态为0和1的时候</summary>

    if (this.loaded && this.hasChildNodes) {
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].checked != this.checked) {
                this.childNodes[i].__toggleCheckBox(this.checked);
                this.childNodes[i].__traverseChildNodes();
            }
        }
    }
};

TreeNode.prototype.__traverseParentNodes = function () {
    /// <summary>遍历父节点, 改变父级节点的选中状态</summary>
    if (this.parentNode != null) {
        var checkState = this.checked;
        for (var i = 0; i < this.parentNode.childNodes.length; i++) {
            if (this.parentNode.childNodes[i].checked != checkState) {
                checkState = 2;
                break;
            }
        }
        if (this.parentNode.checked != checkState) { this.parentNode.__toggleCheckBox(checkState); }

        this.parentNode.__traverseParentNodes();
    }
};

TreeNode.prototype.__getCheckedNodes = function () {
    /// <summary>获得当前节点子节点被checked的项, 被自己调用或在TreeView.getCheckedNodes中调用</summary>
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].checked == 1) { this.treeView.__checkedNodes.push(this.childNodes[i]); }

        if (this.childNodes[i].checked == 2 || this.treeView.showCheckBoxes == 'SINGLE') { this.childNodes[i].__getCheckedNodes(); }
    }
};

TreeNode.prototype.__getNodeByName = function (names) {
    /// <summary>根据name获得节点</summary
    var node = null;
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].name == names[0]) {
            node = this.childNodes[i];
            break;
        }
    }

    if (node != null && names.length > 1) {
        names.splice(0, 1);
        return node.__getNodeByName(names);
    }
    else {
        return node;
    }
};

TreeNode.prototype.__expandAll = function () {
    /// <summary>展开所有子节点, 并继续向下传递</summary

    if (this.hasChildNodes) {
        if (this.expanded) {
            for (var i = 0; i < this.childNodes.length; i++) { this.childNodes[i].__expandAll(); }
        }
        else {
            TreeNode.__attachEvent(this, '__onExpanded', function () {
                for (var i = 0; i < this.childNodes.length; i++) { this.childNodes[i].__expandAll(); }
            });
            this.expand(false);
        }
    }
}

TreeNode.prototype.__expandNodeByNode = function () {
    /// <summary>展开所有子节点, 在TreeView.expandAllNodeByNode中被调用</summary>

    if (this.hasChildNodes) {
        if (this.expanded) {
            this.firstChild.__expandNodeByNode();
        }
        else {
            TreeNode.__attachEvent(this, '__onExpanded',
                function () {
                    if (this.childNodes.length > 0) {
                        //如果有子节点, 就继续展开
                        this.firstChild.__expandNodeByNode();
                    }
                    else {
                        //如果没有子节点, 就回调自身查找下一个节点
                        this.__expandNodeByNode();
                    }
                }
            );
            this.expand(false);
        }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        var node = this;
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
            node.__expandNodeByNode();
        }
        else {
            if (!this.treeView.loaded) { this.treeView.preloadTo(this.treeView.preloadDepth); }
        }
    }
};

TreeNode.prototype.__collapseAll = function () {
    /// <summary>闭合所有子节点, 在TreeView.collapseAll中使用</summary>
    if (this.hasChildNodes) {
        if (this.loaded) { this.firstChild.__collapseAll(); }
        if (this.expanded) { this.collapse(); }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        var node = this;
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
            node.__collapseAll();
        }
    }
};

TreeNode.prototype.__loadAll = function () {

    if (this.hasChildNodes) {
        if (this.loaded) {
            for (var i = 0; i < this.childNodes.length; i++) { this.childNodes[i].__loadAll(); }
        }
        else {
            TreeNode.__attachEvent(this, '__onLoaded', function () {
                for (var i = 0; i < this.childNodes.length; i++) { this.childNodes[i].__loadAll(); }
            });
            this.load();
        }
    }
}

TreeNode.prototype.__loadNodeByNode = function () {
    /// <summary>展开所有子节点, 在TreeView.loadAll中使用</summary>
    if (this.hasChildNodes) {
        if (this.loaded) {
            this.firstChild.__loadAll();
        }
        else {
            TreeNode.__attachEvent(this, '__onLoaded',
                function () {
                    if (this.firstChild != null) {
                        this.firstChild.__loadNodeByNode();
                    }
                    else {
                        this.__loadNodeByNode();
                    }
                }
            );
            this.load();
        }
    }
    else {

        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        var node = this;
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
            node.__loadNodeByNode();
        }
        else {
            if (!this.treeView.loaded) {
                this.treeView.selectNodeByPath(this.treeView.pathToSelect); 
            }
        }
    }
};

TreeNode.prototype.__expandTo = function (depth) {
    /// <summary>依次展开节点到指定的深度, 在TreeView.expandTo方法中被调用</summary>

    if (depth > this.depth && this.hasChildNodes) {
        if (this.expanded) {
            this.firstChild.__expandTo(depth);
        }
        else {
            TreeNode.__attachEvent(this, '__onExpanded',
                function () {
                    if (this.firstChild != null) {
                        this.firstChild.__expandTo(depth);
                    }
                    else {
                        this.__expandTo(depth);
                    }
                }
            );
            this.expand(false);
        }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        var node = this;
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
            node.__expandTo(depth);
        }
        else {
            if (!this.treeView.loaded) {
                this.treeView.preloadTo(this.treeView.preloadDepth); 
            }
        }
    }
};

TreeNode.prototype.__preloadTo = function (depth) {
    /// <summary>依次展开节点到指定的深度, 在TreeView.expandTo方法中被调用</summary>

    if (depth > this.depth && this.hasChildNodes) {
        if (this.expanded) {
            this.firstChild.__preloadTo(depth);
        }
        else {
            TreeNode.__attachEvent(this, '__onLoaded',
                function () {
                    if (this.firstChild != null) {
                        this.firstChild.__preloadTo(depth);
                    }
                    else {
                        this.__preloadTo(depth);
                    }
                }
            );
            this.load();
        }
    }
    else {
        //查找下一个节点, 如果没有下一个相临节点, 就查找父级节点
        var node = this;
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
            node.__preloadTo(depth);
        }
        else {
            if (!this.treeView.loaded) {
                this.treeView.selectNodeByPath(this.treeView.pathToSelect);
            }
        }
    }
};

TreeNode.prototype.__selectNodeByPath = function (names) {
    /// <summary>根据路径选择一个节点, 在TreeView.selectNodeByPath中被调用</summary>	
    /// <param name="names" type="String">节点name数组</param>

    var index = -1;
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    var finished = true;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.childNodes[index].loaded) {
                if (!this.childNodes[index].expanded) this.childNodes[index].expand(false);
                this.childNodes[index].__selectNodeByPath(names);
            }
            else {
                TreeNode.__attachEvent(this.childNodes[index], '__onExpanded', function () {
                    this.__selectNodeByPath(names);
                });
                this.childNodes[index].expand(false);
            }
            finished = false;
        }
        else {
            //在这个方法里默认不触发事件
            this.childNodes[index].select(false);
        }
    }

    if (finished) {
        if (!this.treeView.loaded) { this.treeView.checkNodesByPaths(this.treeView.pathsToCheck); }
    }
};

TreeNode.prototype.__checkNodeByPath = function (paths, names) {
    /// <summary>根据路径选中一个节点, 在TreeView.prototype.__checkNodeByPath中被调用</summary>
    /// <param name="paths" type="Array" elementType="String">节点path数组</param>
    /// <param name="names" type="String">节点name数组</param>

    var index = -1;
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].name == names[0]) {
            index = i;
            break;
        }
    }

    //是否查找完成
    var finished = false;

    //如果找到节点
    if (index > -1) {
        if (names.length > 1) {
            names.splice(0, 1);
            if (this.childNodes[index].loaded) {
                this.childNodes[index].__checkNodeByPath(paths, names);
            }
            else {
                TreeNode.__attachEvent(this.childNodes[index], '__onExpanded', function () {
                    this.__checkNodeByPath(paths, names);
                });
                this.childNodes[index].expand(false);
            }
        }
        else {
            this.childNodes[index].check(false);

            //查找下一个节点
            paths.splice(0, 1);
            if (paths.length > 0) {
                this.treeView.__checkNodeByPath(paths, paths[0]);
            }
            else {
                //查找完成
                finished = true;
            }
        }
    }

    if (finished) {
        if (!this.treeView.loaded) { this.treeView.__completeLoading(); }
    }
};

TreeNode.prototype.__checkAll = function () {
    /// <summary>SINGLE模式下, 选中已呈现的所有节点, 在 TreeView.checkAll中被使用</summary>

    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].checked == 0) {
            this.childNodes[i].check(false);
        }
        if (this.childNodes[i].hasChildNodes && this.childNodes[i].loaded) {
            this.childNodes[i].__checkAll();
        }
    }
}

TreeNode.prototype.__uncheckAll = function () {
    /// <summary>SINGLE模式下, 取消选中已呈现的所有节点, 在 TreeView.uncheckAll中被使用</summary>
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].checked == 1) {
            this.childNodes[i].uncheck(false);
        }
        if (this.childNodes[i].hasChildNodes && this.childNodes[i].loaded) {
            this.childNodes[i].__uncheckAll();
        }
    }
}

TreeNode.prototype.__getChildNodesFromDataSource = function (xmlRequest, url) {
    /// <summary>读取数据源后执行的函数</summary>

    //移除loading节点	
    this.treeView.__removeLoadingNode(this);

    //获取子节点
    var contentType = xmlRequest.getResponseHeader("Content-Type");
    contentType = (/text\/xml/i.test(contentType) ? 'text/xml' : 'text/plain');

    if (contentType == 'text/xml') {
        if (xmlRequest.responseXML != null) {
            this.__parseChildNodes(contentType, xmlRequest.responseXML.lastChild, url);
        }
    }
    else {
        this.__parseChildNodes(contentType, xmlRequest.responseText, url);
    }

    //loaded
    if (!this.loaded) {
        //当没有子节点时, 处理burl为blank
        if (this.childNodes.length == 0) { this.unburl(); }

        this.loading = false;
        this.loaded = true;

        //执行__onload事件
        TreeNode.__executeEvent(this, '__onLoaded');

    }
};

TreeNode.prototype.__evalMappingValue = function (property, value, ignoreCase) {
    /// <summary>计算映射属性的值</summary>
    /// <param name="property" type="String">属性名</param>
    /// <param name="value" type="String">要计算的值</param>
    /// <param name="ignoreCase" type="String">是否忽略大小写</param>

    if (typeof (value) == 'string') {
        var r = new RegExp('\\{([^\\}]+)\\}', (ignoreCase != true ? '' : 'i'));
        var m;

        while (r.test(value)) {
            m = r.exec(value);
            value = value.replace(m[0], TreeView.__bracketEncode(this.getAttribute(m[1])));
        }
        value = TreeView.__bracketDecode(value);

        //支持javascript表达式
        if (/^javascript:/i.test(value)) {
            value = value.replace(/^javascript:/i, '');
            value = eval(value);
        }

        this[property] = value;
        this.setAttribute(property, value);
    }
}

TreeNode.prototype.__parseName = function (defaultName) {
    /// <summary>在被添加到TreeVIew之前, 需要确定节点的name, 节点名在树中必须唯一</summary>
    /// <param name="defaultName" type="String">默认name</param>
    if (this.name == null || this.name == '') { this.name = defaultName; }

    if (document.getElementById('__node_' + this.name) != null) {
        var mch;
        while (document.getElementById('__node_' + this.name) != null) {
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

TreeNode.prototype.__parseChildNodes = function (contentType, data, url) {
    /// <summary>获取TreeNode子节点</summary>
    /// <param name="contentType" type="String">数据类型 text/xml, text/html, text/plain, array</param>
    /// <param name="data" type="Element|Xml|JsonString">从Element/Xml的子节点或Json字符串获取根节点信息</param>

    var mapping = null;
    if (this.treeView.dataMappings.length > 0 && url != null) {
        for (var i = 0; i < this.treeView.dataMappings.length; i++) {
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

    var treeNodes = [];
    if (contentType == 'self') {
        //从自身childNodes加载
        for (var i = 0; i < this.childNodes.length; i++) {
            treeNodes.push(this.childNodes[i].clone());
        }
        this.childNodes.length = 0;
        this.hasChildNodes = false;
        this.__childrenElement.innerHTML = '';
    }
    else if (contentType == 'text/xml') {
        treeNodes = TreeView.__getTreeNodesFromXml(data, mapping);
    }
    else {
        treeNodes = TreeView.__getTreeNodesFromJson(data, mapping);
    }

    for (var i = 0; i < treeNodes.length; i++) {
        this.appendChild(treeNodes[i]);
    }
};

TreeNode.prototype.__setLines = function () {
    /// <summary>设置分支线, 100毫秒后执行</summary>

    if (this.treeView.showLines) {
        var node = this;
        if (node.parentNode != null && !node.parentNode.expanding && !node.parentNode.expanded) {
            //未展开的节点不能设置lines, 在展开后才设置
            TreeNode.__attachEvent(node.parentNode, '__onExpanded', function () { TreeNode.__setLines(node); });
        }
        else {
            window.setTimeout(function () { TreeNode.__setLines(node); }, 100);
        }
    }
}

TreeNode.__setLines = function (node, t) {
    /// <summary>设置节点的分支线</summary>
    /// <param name="node" type="TreeNode">节点</param>
    /// <param name="t" type="Boolean">是否遍历子节点</param>

    if (node.treeView != null) {
        //Line 2, Line 3
        var burl = node.__burlElement.parentNode;
        var w = burl.offsetWidth;

        if (w <= node.padding * 2) {
            //burl节点单元格中的图片未下载完成, 100毫秒之后再执行, 目前适用于Firefox
            window.setTimeout(function () { TreeNode.__setLines(node, t); }, 100);
        }
        else {
            //下载完成后才计算背景位置
            var f = node.isFirst();
            var l = node.isLast();

            burl.style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_' + (l ? '2' : '3') + '.gif)';
            if (f) {
                //3个背景线的宽和高为200, 计算背景线应该显示在什么位置

                var h = burl.offsetHeight;
                var x = (200 - w) / 2 + (w % 2);
                var y = (200 - h) / 2 + (h % 2);
                x = Math.floor(x);
                y = Math.floor(y);
                burl.style.backgroundPosition = '-' + x + 'px -' + y + 'px';
            }
            else {
                burl.style.backgroundPosition = node.previousSibling.__burlElement.parentNode.style.backgroundPosition;
            }
            burl.setAttribute('line', (l ? '2' : '3'));

            //最后一个节点要检查上一个节点
            if (l && !f) {
                if (node.previousSibling.__burlElement.parentNode.getAttribute('line') == '2') {
                    node.previousSibling.__burlElement.parentNode.style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_3.gif)';
                }

                TreeNode.__setChildLines(node.previousSibling);
            }

            //Line 1
            if (node.depth > 1) {
                var parent = node.parentNode;
                var prev = burl.previousSibling;
                //父级节点不是最后一级才添加线, 否则删除线
                while (parent != null) {
                    if (!parent.isLast()) {
                        prev.style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_1.gif)';
                        prev.style.backgroundPosition = parent.__burlElement.parentNode.style.backgroundPosition;
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
                TreeView.__setPaddingOrSpacingLines(node, node.element.previousSibling.firstChild);
            }

            //设置childNodesPadding的lines
            if (node.depth > 1 && node.parentNode.childNodesPadding > 0) {
                if (node.isFirst()) {
                    //TreeNode.DIV<ROW>.DIV<CHILDNODES>.DIV<CHILDNODESPADDING>.TABLE
                    TreeView.__setPaddingOrSpacingLines(node, node.element.parentNode.firstChild.firstChild);
                }

                if (node.isLast()) {
                    TreeView.__setPaddingOrSpacingLines(node, node.element.parentNode.lastChild.firstChild);
                }
            }

            //遍历子节点
            if (t) {
                TreeNode.__setChildLines(node);
            }
        }
    }
}

TreeNode.__setChildLines = function (n) {
    if (n.hasChildNodes && n.loaded && n.__childrenElement.innerHTML != '') {
        for (var i = 0; i < n.childNodes.length; i++) {
            TreeNode.__setLines(n.childNodes[i], true);
        }
    }
}

/// <summary>TreeNode 私有事件</summary>

TreeNode.__onExpanded = {};
//TreeNode.__onCollapsed = {};
TreeNode.__onLoaded = {};
TreeNode.__onAppended = {};
//TreeNode.__onInserted = {};
//TreeNode.__onRemoved = {};
//TreeNode.__onDropped = {};
//TreeNode.__onEdited = {};
//TreeNode.__onCopied = {};
//TreeNode.__onMoved = {};
//TreeNode.__onSelected = {};
//TreeNode.__onUnselected = {};
//TreeNode.__onChecked = {};
//TreeNode.__onUnchecked = {};
//TreeNode.__onNavigate = {};
//TreeNode.__onBurled = {};
//TreeNode.__onUnburled = {};

TreeNode.__attachEvent = function (node, eventName, func) {
    /// <summary>给私有事件添加动作</summary>
    /// <param name="eventName" type="String">事件名</param>

    if (TreeNode[eventName]['e_' + node.name] == null) {
        TreeNode[eventName]['e_' + node.name] = new Array(); 
    }

    TreeNode[eventName]['e_' + node.name].push(func);
}

TreeNode.__executeEvent = function (node, eventName, args) {
    /// <summary>执行私有事件</summary>
    /// <param name="node" type="TreeNode">执行事件的节点</param>
    /// <param name="eventName" type="String">事件名</param>
    /// <param name="args" type="TreeNode">相关节点, __onAppended, __onInserted中可以使用到</param>

    var events = TreeNode[eventName]['e_' + node.name];

    if (events != null) {
        //原本为后入先出, 因为setLines问题改为先入先出, 后果未知
        //for (var i = events.length - 1; i >= 0; i--) {
        for (var i = 0; i < events.length; i++) {
            if (typeof (events[i]) == 'function') {
                events[i].call(node, args);
            }
            else if (typeof (events[i]) == 'string') {
                //                var ev = '';
                //                eval('ev = function(){' + events[i] + '}');
                //                ev.call(node, args);
                eval('ev = function(){' + events[i] + '}').call(node, args);
            }
        }
    }

    TreeNode[eventName]['e_' + node.name] = null;
}

/**********
	
全局属性或方法
	
**********/

//默认CSS样式 | Default Css Class
TreeView.__defautlClass = '.treeViewDefaultClass { background-color:transparent; }';
TreeView.__defautlClass += '.treeNodeDefaultClass { border:1px solid transparent; border-radius:3px; }';
TreeView.__defautlClass += '.treeNodeDefaultHoverClass { border:1px solid #999999; border-radius:3px; background-color:#EEEEEE; }';
TreeView.__defautlClass += '.treeNodeDefaultSelectedClass { border:1px solid #0F6D39; border-radius:3px; background-color:#3DBC77; }';
TreeView.__defautlClass += '@keyframes treeViewFadeIn {0%{opacity:0;} 100%{opacity:1;}}';
TreeView.__defautlClass += '@-webkit-keyframes treeViewFadeIn {0%{opacity:0;} 100%{opacity:1;}}';
TreeView.__defautlClass += '@keyframes treeViewFadeOut {0%{opacity:1;} 100%{opacity:0;}}';
TreeView.__defautlClass += '@-webkit-keyframes treeViewFadeOut {0%{opacity:1;} 100%{opacity:0;}}';
TreeView.__defautlClass += '@keyframes dropLineFadeInOut {0%{opacity:0.2;} 50%{opacity:1;} 100%{opacity:0.2;}}';
TreeView.__defautlClass += '@-webkit-keyframes dropLineFadeInOut {0%{opacity:0.2;} 50%{opacity:1;} 100%{opacity:0.2;}}';
TreeView.__defautlClass += '.treeNodeFadeInClass { animation-name: treeViewFadeIn; animation-duration: 0.4s; animation-timing-function: ease-in; animation-fill-mode: forwards; -webkit-animation-name: treeViewFadeIn; -webkit-animation-duration: 0.4s; -webkit-animation-timing-function: ease-in; -webkit-animation-fill-mode: forwards;}';
TreeView.__defautlClass += '.dropLineDefaultClass {box-shadow:1px 1px 6px #999999;animation-name:dropLineFadeInOut;animation-duration:1s;animation-timing-function:ease;animation-iteration-count:infinite;-webkit-animation-name:dropLineFadeInOut;-webkit-animation-duration:1s;-webkit-animation-timing-function:ease;-webkit-animation-iteration-count:infinite;}';
TreeView.__defautlClass += '.treeViewContextMenuClass1 {opacity:1; box-shadow:1px 2px 6px #999999; border-radius:2px;}'; //normal
TreeView.__defautlClass += '.treeViewContextMenuClass2 {opacity:0; box-shadow:1px 2px 6px #999999; border-radius:2px; animation-name:treeViewFadeOut; animation-duration:0.4s; animation-timing-function:ease-in; -webkit-animation-name:treeViewFadeOut; -webkit-animation-duration:0.8s; -webkit-animation-timing-function:ease-in;}'; //fade out
TreeView.__defautlClass += '.treeViewNodeOption0a {background-color:#F8F8F8; padding:2px 3px; border-style:dotted; border-width:1px 0px 1px 1px; border-color:transparent;  border-top-left-radius:2px; border-bottom-left-radius:2px;}';
TreeView.__defautlClass += '.treeViewNodeOption0b {cursor:default; padding:2px 3px; border-style:solid; border-width:1px 0px 1px 1px; border-color:#FFCC66;  border-top-left-radius:2px; border-bottom-left-radius:2px;}';
TreeView.__defautlClass += '.treeViewNodeOption1a {padding:2px 9px 2px 8px; border-style:solid; border-width:1px 0px 1px 1px; border-color:transparent transparent transparent #F0F0F0; border-top-right-radius:2px; border-bottom-right-radius:2px;}'; //enabled normal
TreeView.__defautlClass += '.treeViewNodeOption1b {padding:2px 8px 2px 9px; cursor:default; border-style:solid; border-width:1px 1px 1px 0px; border-color:#FFCC66 #FFCC66 #FFCC66 transparent;  border-top-right-radius:2px; border-bottom-right-radius:2px;}'; //enabled hover
TreeView.__defautlClass += '.treeViewNodeOption1c {padding:2px 9px 2px 8px; cursor:default; border-style:solid; border-width:1px 0px 1px 1px; border-color:transparent transparent transparent #F0F0F0; border-top-right-radius:2px; border-bottom-right-radius:2px; color:#AAAAAA;}'; //disabled
TreeView.__defautlClass += '.treeViewNodeOption2a {padding:2px 3px; cursor:default; border:1px solid transparent; background-color:inherit; border-radius:2px;}'; //enabled normal
TreeView.__defautlClass += '.treeViewNodeOption2b {padding:2px 3px; cursor:default; border:1px solid #FFCC66; border-radius:2px;}'; //enabled hover
TreeView.__defautlClass += '.treeViewNodeOption2c {padding:2px 3px; cursor:default; border:1px solid #CC9933; background-color:#FFCC66; border-radius:2px;}'; //enabled mousedown
TreeView.__defautlClass += '.treeViewNodeOption2d {padding:2px 3px; cursor:default; color:#AAAAAA; background-color:#FFFFFF; border-radius:2px;}'; //disbaled

//window.style = TreeView.__defautlClass;
//document.createStyleSheet("javascript:style");

TreeView.__defautlClassTag = document.createElement('STYLE');
TreeView.__defautlClassTag.type = 'text/css';

if (TreeView.__defautlClassTag.styleSheet) {
    // IE
    TreeView.__defautlClassTag.styleSheet.cssText = TreeView.__defautlClass;
}
else {
    // Other
    TreeView.__defautlClassTag.innerHTML = TreeView.__defautlClass;
}
document.getElementsByTagName('HEAD').item(0).appendChild(TreeView.__defautlClassTag);

/// <value type="TreeNode">剪贴板, 用于 copy 和 move、drag & drop，存储单个节点</value>
TreeView.clipBoard = {
    treeNode: null, //原始节点
    action: '', //允许值 COPY, MOVE, DRAGCOPY, DRAGMOVE
    __expanding: false, //是否正在展开节点已完成拖放, 在dragend里判断
    clear: function () { //清空剪贴板的数据
        this.treeNode = null;
        this.action = '';
        this.__expanding = false;
    }
};

/// <value type="TreeNode">正在激活的TreeView, 用于键盘事件</value>
TreeView.activeTreeView = null;

/// <value type="Element:DIV">正在激活的拖放线, 只有当某个拖放线激活时才会有值，解决dragLeave时拖放线不隐藏的问题</value>
TreeView.__dropLine = null;
/// <value type="Array" elementType="String:Color">各隐藏颜色</value>
TreeView.__dropLineColors = ['#000000', '#33CC33', '#FF0000', '#FF9900', '#9900FF', '#00CCCC', '#99FF00', '#0000FF', '#CC9900', '#FF0099'];

TreeView.__populateDropLine = function (refNode, isLast) {
    /// <summary>装配DropLine元素</summary>
    /// <value name="refNode" type="String">dropLine的参考节点, 一般指下一个</value>

    var dropLine, line;

    dropLine = document.createElement('DIV');
    dropLine.setAttribute('sign', 'DROPLINE');

    var height = (isLast ? 0 : refNode.spacing);
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
    dropLine.setAttribute('color', TreeView.__dropLineColors[(refNode.depth - 1) % 10]);

    //标识线
    line = document.createElement('DIV');
    line.style.height = Math.round((height + 6 - 1) / 2) + 'px';
    dropLine.appendChild(line);

    line = document.createElement('DIV');
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
        //  dropLine.style.marginLeft = (parseInt(refNode.parentNode.__nodeElement.style.marginLeft) + refNode.indent) + 'px';
        //}
        var indent = 0;
        while (refNode.depth > 1) {
            indent += refNode.indent + refNode.padding * 2;
            refNode = refNode.parentNode;
        }
        dropLine.style.marginLeft = indent + 'px';
    }

    //事件开始
    var tTreeView = refNode.treeView;
    dropLine.ondragover = function (ev) {
        var originalNode = TreeView.clipBoard.treeNode;

        //只接受节点拖入
        if (originalNode == null) {
            return false;
        }

        var oTreeView = originalNode.treeView;

        var parent = this.parentNode.getAttribute('parent');
        var prev = this.parentNode.getAttribute('prev');
        var next = this.parentNode.getAttribute('next');

        var droppable = true;

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

            TreeView.__highlightDropLine(this);
        }
    }

    dropLine.ondragleave = function (ev) { TreeView.__restoreDropLine(this); }

    dropLine.ondrop = function (ev) {
        //源节点
        var originalNode = TreeView.clipBoard.treeNode;
        var oTreeView = originalNode.treeView;

        //目标树 tTreeView

        var parent = this.parentNode.getAttribute('parent');
        var prev = this.parentNode.getAttribute('prev');
        var next = this.parentNode.getAttribute('next');

        var pNode = null, nNode = null; //previous node & next node
        if (prev != '') { pNode = tTreeView.getNodeByName(prev); }
        if (next != '') { nNode = tTreeView.getNodeByName(next); }

        //被拖放的节点, after drop
        //先克隆
        var node = originalNode.clone();

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
            tTreeView.__executeEvent('onNodeMoved', node);
        }
        else if (TreeView.clipBoard.action == 'DRAGCOPY') {
            tTreeView.__executeEvent('onNodeCopied', node);
        }
        tTreeView.__executeEvent('onNodeDropped', node);

        //结束拖放事件
        ev.preventDefault();
        ev.stopPropagation();

        //恢复样式
        TreeView.__restoreDropLine(dropLine);
        //this.lastChild.className = '';
        //this.lastChild.style.backgroundColor = '';
        //this.lastChild.innerHTML = '&nbsp;';

        //拖放正常结束事件
        tTreeView.__executeEvent('onNodeDragEnd', node);
    }

    return dropLine;
}

TreeView.__highlightDropLine = function (dropLine) {
    /// <summary>将dropLine显示出来</summary>
    /// <value name="dropLine" type="Element:DIV"></value>

    dropLine.lastChild.className = 'dropLineDefaultClass';
    dropLine.lastChild.style.backgroundColor = dropLine.getAttribute('color');
    //dropLine.lastChild.style.borderBottom = '1px solid ' + dropLine.getAttribute('color');
    dropLine.lastChild.innerHTML = dropLine.style.zIndex;

    TreeView.__dropLine = dropLine;
}

TreeView.__restoreDropLine = function (dropLine) {
    /// <summary>将dropLine还原成默认样式</summary>
    /// <value name="dropLine" type="Element:DIV"></value>

    if (dropLine == null) { dropLine = TreeView.__dropLine; }

    if (dropLine != null) {
        dropLine.lastChild.className = '';
        dropLine.lastChild.style.backgroundColor = '';
        //dropLine.lastChild.style.borderBottom = '';
        dropLine.lastChild.innerHTML = '&nbsp;';

        TreeView.__dropLine = null;
    }
}

TreeView.__populateLinesSpacing = function (refNode) {
    /// <summary>装配显示间隔Lines的table</summary>
    /// <value name="refNode" type="TreeNode">参考节点</value>

    var table, tbody, tr, td

    table = document.createElement('TABLE');
    table.cellPadding = 0;
    table.cellSpacing = 0;
    table.setAttribute('sign', 'LINES');
    table.style.position = 'absolute';
    table.style.zIndex = 0;
    table.style.height = refNode.spacing + 'px';


    tbody = document.createElement('TBODY');
    tr = document.createElement('TR');

    //td的宽度在setLine时设置
    for (var i = 0; i < refNode.depth; i++) {
        td = document.createElement('TD');
        //td.style.backgroundColor = '#F0C';
        tr.appendChild(td);
    }

    tbody.appendChild(tr);
    table.appendChild(tbody);

    return table;
}

TreeView.__populateChildNodesPadding = function (node, l) {
    /// <summary>当showLines为true时, 装配显示ChildNodesPadding Lines的DIV</summary>
    /// <value name="node" type="TreeNode">父级节点</value>
    /// <value name="l" type="String">位置 top 或 bottom</value>

    var div, table, tbody, tr, td;

    div = document.createElement('DIV');
    div.setAttribute('sign', 'CHILDNODESPADDING');
    div.style.height = node.childNodesPadding + 'px';

    table = document.createElement('TABLE');
    table.cellPadding = 0;
    table.cellSpacing = 0;
    table.style.height = node.childNodesPadding + 'px';

    tbody = document.createElement('TBODY');
    tr = document.createElement('TR');

    for (var i = 0; i <= node.depth - (l == 'bottom' ? 1 : 0); i++) {
        td = document.createElement('TD');
        //td.style.backgroundColor = '#FC9';
        //td.innerHTML = i;
        tr.appendChild(td);
    }

    tbody.appendChild(tr);
    table.appendChild(tbody);
    div.appendChild(table);

    return div;
}

TreeView.__setPaddingOrSpacingLines = function (node, table) {
    /// <summary>设置ChildNodesPadding或Spacing的lines</summary>
    /// <value name="node" type="TreeNode">参考节点</value>
    /// <value name="table" type="HTMLTable">显示lines的Table</value>

    for (var i = 0; i < table.rows[0].cells.length; i++) {
        table.rows[0].cells[i].style.width = node.__nodeElement.rows[0].cells[i].offsetWidth + 'px';

        if (node.__nodeElement.rows[0].cells[i].style.backgroundImage != '') {
            table.rows[0].cells[i].style.backgroundImage = 'url(' + node.treeView.imagesBaseUrl + 'line_1.gif)';
            table.rows[0].cells[i].style.backgroundPosition = node.__nodeElement.rows[0].cells[i].style.backgroundPosition;
        }
        else {
            table.rows[0].cells[i].style.backgroundImage = '';
            table.rows[0].cells[i].style.backgroundPosition = '';
        }
    }
}

TreeView.__parseBoolean = function (value, defaultValue) {
    /// <summary>计算Boolean属性值</summary>
    /// <value name="value" type="String|Boolean">要验证的属性值</value>
    /// <value name="defaultValue" type="Boolean">默认值</value>

    if (value == null) { value = defaultValue; }
    if (typeof (value) == 'string') {
        if (/^true$/i.test(value) || /^false$/i.test(value)) {
            value = value.toLowerCase();
        }
        value = eval(value);
    }
    if (value != true && value != false) { value = defaultValue; }

    return value;
}

TreeView.__parseInteger = function (value, defaultValue) {
    /// <summary>计算像整数值</summary>
    /// <param name="value" type="String|Integer">要验证的属性值</param>
    /// <param name="defaultValue" type="String">默认值</param

    if (value == null) { value = defaultValue; }
    if (typeof (value) != 'number') { value = parseInt(value); }
    if (isNaN(value)) { value = defaultValue; }

    return value;
}

TreeView.__parseString = function (value, enumValues, caseConversion, defaultValue) {
    /// <summary>计算字符串属性的值</summary>
    /// <param name="value" type="String">要验证的属性值</param>
    /// <param name="enumValues" type="Regex">允许值</param>
    /// <param name="caseConversion" type="String" values="L 小写, U 大写, I 保持原样">大小写转换</param>
    /// <param name="defaultValue" type="String">默认值</param>

    if (value == null || typeof (value) != 'string') { value = defaultValue; }
    if (!enumValues.test(value)) { value = defaultValue; }

    if (caseConversion == 'L') {
        value = value.toLowerCase();
    } else if (caseConversion == 'U') {
        value = value.toUpperCase();
    }

    return value;
}

TreeView.addListener = function (object, eventName, func) {
    /// <summary>绑定事件到元素</summary>
    eventName = eventName.toLowerCase();
    if (object.addEventListener != null) {
        object.addEventListener(eventName, func, false);
    }
    else if (object.attachEvent != null) {
        object.attachEvent('on' + eventName, func);
    }
}

TreeView.request = function (url, data, command, args) {
    /// <summary>请求一个数据文件(xml,json)文件并执行事件</summary>
    /// <param name="url" type="String" mayBeNull="false">请求的Xml地址</param>
    /// <param name="data" type="String" mayBeNull="true">
    ///		任何想通过"POST"发送给服务器的数据
    ///		以字符串的形式送, 如: name=value&anothername=othervalue&so=on, 使用Request.Form接收
    ///		为null时通过"GET"请求url, 使用Request.QueryString接收
    ///	</param>
    /// <param name="command" type="CommandQueue|Function|String|Object|Element" mayBeNull="true">
    ///		命令队列名称(仅在Root.CommandQueue.js中支持)、函数、元素或命令字符串
    ///		当为命令字符串时, 支持[Xml]和[Text]占位符, 分别代表responseXML和responseText
    /// </param>
    /// <param name="args" type="CommandQueueIndex|FunctionArguments|Null|ObjectMethod" mayBeNull="true">
    ///		当command为命令队列名称时, args 表示命令队列执行的索引
    ///		当command为函数时, args 表示函数的参数或参数数组
    ///		当command为命令字符串时, args 无效
    ///		当command为对象时, args为空command表示元素, args不为空command表示自定义类或对象, 这时args表示对象的一个方法
    /// </param>

    //加随机数是为了每次刷新都重新载入Xml文件
    var r = (url.indexOf('?') > 0) ? '&' : '?';
    r += 'r' + Math.round(Math.random() * Math.pow(10, 10)) + '=';

    var xmlRequest;

    //判断浏览器是什么牌子	
    if (window.XMLHttpRequest) {
        //Chrome,Mozilla,Firefox,Safari,IE7+ 浏览器
        xmlRequest = new XMLHttpRequest();
//        if (xmlRequest.overrideMimeType) {
//            xmlRequest.overrideMimeType('text/xml');
//        }
    }
    else if (window.ActiveXObject) {
        //IE7- 核心的浏览器适用
        var MSXML = new Array('MSXML2.XMLHTTP', 'Microsoft.XMLHTTP', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.5.0');
        for (var i = 0; i < MSXML.length; i++) {
            try {
                xmlRequest = new ActiveXObject(MSXML[i]);
                break;
            }
            catch (e) {
                xmlRequest = null;
            }
            xmlRequest.setRequestHeader("Content-Type","application/json;charset=utf-8");
        }
    }

    if (xmlRequest != null) {
        //当请求的准备状态改变时......
        xmlRequest.onreadystatechange = function () {
            // readyState
            // 0 (未初始化) unintialized
            // 1 (正在装载) loading
            // 2 (装载完毕) loaded
            // 3 (交互中) interactive
            // 4 (完成) complete

            //console.log(xmlRequest.readyState + ' T.T ' + xmlRequest.status)

            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 0 || (xmlRequest.status >= 200 && xmlRequest.status < 300)) {
                    if (command != null) {
                        //对象类型
                        if (typeof (command) == 'object') {
                            //对象
                            if (args != null && command[args]) {
                                command[args](xmlRequest, url);
                            }
                            //元素
                            else if (args == null) {
                                if (command.id && command.innerHTML) {
                                    command.innerHTML = xmlRequest.responseText;
                                }
                            }
                        }
                        //函数类型
                        else if (typeof (command) == 'function') {
                            if (args != null && args instanceof Array) {
                                command.apply(xmlRequest, args);
                            }
                            else {
                                command.call(xmlRequest, args);
                            }
                        }
                        //字符串类型
                        else if (typeof (command) == 'string') {
                            //命令字符串
                            command = command.replace('{xml}', 'xmlRequest.responseXML');
                            command = command.replace('{text}', 'xmlRequest.responseText');

                            eval(command);
                        }
                    }
                }
                else {
                    //简单错误处理
                    window.alert('ErrorCode:' + xmlRequest.status + '\r\n' + 'ErrorMessage:' + xmlRequest.statusText);
                    window.open(url);
                }
            }
        }

        //open方法第三个参数设置请求是否为异步模式.如果是true, JavaScript函数将继续执行,而不等待服务器响应		
        if (data == null) {
            xmlRequest.open('GET', url + r, true);
            xmlRequest.send(null);
        }
        else {
            xmlRequest.open('POST', url + r, true);
            xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
            xmlRequest.send(data);
        }
    }
}

TreeView.__getTreeNodesFromXml = function (element, mapping) {
    /// <summary>从元素或XML得到TreeNodes</summary>

    var treeNodes = [];
    var treeNode;

    var nodes = element.childNodes;
    var property, value;
    var i, j, n; //子节点数量

    if (mapping == null) {
        for (i = 0; i < nodes.length; i++) {
            //SPAN标记将被解释为TreeNode
            if (nodes[i].nodeType == 1 && (nodes[i].nodeName == 'SPAN' || nodes[i].nodeName.toUpperCase() == 'TREENODE')) {
                treeNode = new TreeNode();

                //遍历节点的属性, 将[属性名-属性值]保存到node, 包含自定义的属性
                for (j = 0; j < nodes[i].attributes.length; j++) {
                    treeNode.attributes[nodes[i].attributes[j].name.toLowerCase()] = nodes[i].attributes[j].value;
                }

                //ownProperties			
                for (property in treeNode) {
                    if (treeNode.hasOwnProperty(property) && !(treeNode[property] instanceof Array)) {
                        value = treeNode.attributes[property.toLowerCase()];
                        if (value != null) { treeNode[property] = value; }
                    }
                }

                //childNodes
                n = false;
                for (j = 0; j < nodes[i].childNodes.length; j++) {
                    if (nodes[i].childNodes[j].nodeType == 1) {
                        n = true;
                        break;
                    }
                }                
                if (n) {
                    treeNode.__dataElement = nodes[i];
                }

                //hasChildNodes
                if (treeNode.__dataElement != null || treeNode.dataSource != '') {
                    treeNode.hasChildNodes = true;
                }

                treeNodes.push(treeNode);
            }
        }
    }
    else {
        if (!mapping.parseOnly) {
            //var r = /\[([^\]]+)\]/i, m;
            var node;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].nodeType == 1) {
                    for (var j = 0; j < mapping.maps.length; j++) {
                        //判断节点是否能跟映射匹配
                        node = nodes[i];
                        if (mapping.maps[j].tag != '') {
                            if (node.nodeName.toUpperCase() != mapping.maps[j].tag.toUpperCase()) {
                                node = null;
                            }
                        }

                        //将属性或子节点值读进attributes
                        if (node != null) {
                            treeNode = new TreeNode();
                            //属性
                            for (var k = 0; k < node.attributes.length; k++) {
                                treeNode.attributes[node.attributes[k].name.toLowerCase()] = node.attributes[k].value;
                            }
                            //子节点
                            for (var k = 0; k < node.childNodes.length; k++) {
                                if (node.childNodes[k].nodeType == 1) {
                                    if (node.childNodes[k].firstChild != null) {
                                        if (node.childNodes[k].firstChild.nodeType == 3 || node.childNodes[k].firstChild.nodeType == 4) {
                                            treeNode.attributes[node.childNodes[k].nodeName.toLowerCase()] = node.childNodes[k].firstChild.data;
                                        }
                                    }
                                    else {
                                        treeNode.attributes[node.childNodes[k].nodeName.toLowerCase()] = '';
                                    }
                                }
                            }

                            //ownProperties			
                            for (property in treeNode) {
                                if (treeNode.hasOwnProperty(property) && !(treeNode[property] instanceof Array)) {
                                    value = treeNode.attributes[property.toLowerCase()];
                                    if (value != null) { treeNode[property] = value; }
                                }
                            }

                            //获取映射后的值
                            for (property in mapping.maps[j]) {
                                treeNode.__evalMappingValue(property, mapping.maps[j][property], true);
                            }

                            if (treeNode.text != null) { treeNodes.push(treeNode); }
                        }
                    }
                }
            }
        }
        else {
            //parseOnly            
            function __parseNode(n) {
                //nodeType must be 1
                var node = new TreeNode();
                node.imageUrl = 'j_tag.png';

                //attributes
                var a = [];
                for (var i = 0; i < n.attributes.length; i++) {
                    a.push(n.attributes[i].name + '="' + n.attributes[i].value + '"');
                }
                node.text = '<' + n.nodeName;
                if (a.length > 0) { node.text += ' ' + a.join(' '); }
                //childNodes
                var has = false; //has childNodes
                for (var i = 0; i < n.childNodes.length; i++) {
                    if (n.childNodes[i].nodeType == 1) {
                        has = true;
                        break;
                    }
                }
                if (has) {
                    node.text += '>';
                    for (var i = 0; i < n.childNodes.length; i++) {
                        if (n.childNodes[i].nodeType == 1) {
                            node.childNodes.push(__parseNode(n.childNodes[i]));
                        }
                    }
                    node.hasChildNodes = true;
                    node.loaded = true;
                }
                else {
                    if (n.firstChild != null) {
                        node.text += '>';
                        node.text += n.firstChild.data;
                        node.text += '</' + n.nodeName + '>';
                    }
                    else {
                        node.text += ' />';
                    }
                }

                return node;
            }
            treeNode = __parseNode(element);
            treeNodes.push(treeNode);
        }
    }
    return treeNodes;
};

TreeView.__getTreeNodesFromJson = function (jsonStr, mapping) {
    /// <summary>从Json字符串得到TreeNodes</summary>

    var nodes;
    try {
        nodes = eval('(' + jsonStr + ')');
    }
    catch (e) {
        window.alert(e.name + ': ' + e.message);
        nodes = null;
    }

    var treeNodes = [];
    var treeNode;
    if (nodes != null) {
        if (mapping == null) {
            if (!(nodes instanceof Array)) { nodes = [nodes]; }
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].text != null) {
                    treeNode = new TreeNode();
                    for (var property in nodes[i]) {
                        treeNode[property] = nodes[i][property];
                        treeNode.setAttribute(property, nodes[i][property]);                        
                    }
                    treeNodes.push(treeNode);
                }
            }
        }
        else if (!mapping.parseOnly) {
            if (!(nodes instanceof Array)) { nodes = [nodes]; }
            var objects, value;
            //var r = /\[([^\]]+)\]/, m;
            //逐个解析数据中的每个对象
            for (var i = 0; i < nodes.length; i++) {
                //逐个解析每条map
                for (var j = 0; j < mapping.maps.length; j++) {
                    objects = mapping.maps[j].object;
                    if (objects == null) {
                        objects = nodes[i];
                    }
                    else {
                        objects = nodes[i][objects];
                    }
                    if (!(objects instanceof Array)) { objects = [objects]; }

                    for (var k = 0; k < objects.length; k++) {
                        treeNode = new TreeNode();
                        //先将属性遍历把值放进attributes
                        for (var property in objects[k]) {
                            treeNode[property] = objects[k][property];
                            treeNode.setAttribute(property, objects[k][property]);                            
                        }
                        //读取单条映射值
                        for (var property in mapping.maps[j]) {
                            treeNode.__evalMappingValue(property, mapping.maps[j][property], false);
                        }
                        if (treeNode.text != null) { treeNodes.push(treeNode); }
                    }
                }
            }
        }
    }

    if (mapping != null && mapping.parseOnly) {
        //parseOnly
        //o = object
        //p = propertyName
        function __parseObject(o, p) {
            var node = new TreeNode();
            node.text = '&lt;empty&gt;';
            node.imageUrl = 'j_empty.png';

            if (typeof (o) == 'object') {
                if (o instanceof Array) {
                    node.text = 'Array [' + o.length + ']';
                    node.imageUrl = 'j_array.png';
                    for (var i = 0; i < o.length; i++) {
                        node.childNodes.push(__parseObject(o[i]));
                    }
                    if (o.length) {
                        node.hasChildNodes = true;
                        node.loaded = true;
                    }
                }
                else if (o instanceof RegExp) {
                    node.text = o.toString();
                    node.imageUrl = 'j_regexp.png';
                }
                else if (o instanceof Date) {
                    node.text = o.toString();
                    node.imageUrl = 'j_date.png';
                }
                else if (o == null) {
                    node.text = 'null';
                }
                else {
                    node.text = 'Object';
                    node.imageUrl = 'j_object.png';

                    for (var n in o) {
                        node.childNodes.push(__parseObject(o[n], n));
                    }
                    if (node.childNodes.length > 0) {
                        node.hasChildNodes = true;
                        node.loaded = true;
                    }
                }
            }
            else if (typeof (o) == 'string') {
                node.text = '"' + o + '"';
                node.imageUrl = 'j_string.png';
            }
            else if (typeof (o) == 'number') {
                node.text = o.toString();
                node.imageUrl = 'j_number.png';
            }
            else if (typeof (o) == 'boolean') {
                node.text = o.toString();
                node.imageUrl = 'j_boolean.png';
            }
            else if (typeof (o) == 'function') {
                node.text = o.name + ': function(){}';
                node.imageUrl = 'j_function.png';
            }
            else if (typeof (o) == 'undefined') {
                node.text = 'undefined';
                node.imageUrl = 'blank.gif';
            }

            if (p == null) { p = '' };
            if (p != '') {
                node.text = '"' + p + '": ' + node.text;
            }
            return node;
        }
        treeNode = __parseObject(nodes);
        treeNodes.push(treeNode);
    }

    return treeNodes;
}

TreeView.__getAmount = function () {
    /// <summary>计算页面上TreeViews的数量</summary>
    var count = 0;
    for (var t in document.treeViews) {
        count++;
    }
    return count;
}

TreeView.__textEncode = function (t) {
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

TreeView.__bracketEncode = function (v) {
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

TreeView.__bracketDecode = function (v) {
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

/*
TreeView.NodeOptionsBox
*/

TreeView.NodeOptionsBox = function (treeView, display) {
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
    //this.cssClass = '';
    /// <value type="String">选项样式</value>
    //this.optionClass = '';

    /// 是否可见
    this.visible = false;
}

TreeView.NodeOptionsBox.prototype.initialize = function (lis) {
    /// <summary>初始化</summary>
    /// <param name="lis" type="HtmlLiCollection">列表集合</param>

    if (this.treeView != null) {

        //初始化items
        var li, name;
        for (var i = 0; i < lis.length; i++) {
            if (lis[i].nodeType == 1 && lis[i].nodeName == 'LI') {
                li = lis[i];
                name = li.getAttribute('name');
                if (name == null || name == '') { name = 'Item_' + i; }
                this.items[name] = new TreeView.NodeOption({
                    nodeOptionsBox: this,
                    type: li.getAttribute('type'),
                    name: name,
                    imageUrl: li.getAttribute('imageUrl'),
                    text: li.getAttribute('text'),
                    value: li.getAttribute('value'),
                    title: li.getAttribute('title'),
                    enabled: TreeView.__parseBoolean(li.getAttribute('enabled'), true),
                    visible: TreeView.__parseBoolean(li.getAttribute('visible'), true)
                });
            }
        }
        
        //display
        this.display = TreeView.__parseString(this.display, /^(CONTEXTMENU)|(FOLLOW)|(LEFT)|(RIGHT)|(TOP)$/i, 'U', 'RIGHT');

        //生成一个DIV，放在TreeView的DIV第一个位置
        //选项在触发显示时生成，切换时移除
        var div = document.createElement('DIV');
        div.id = this.treeView.id + '_NodeOptionsBox';
        if (this.display != 'TOP') {
            div.style.position = 'absolute';
            div.style.zIndex = 1002;
            div.style.display = 'none';

            //this.treeView.element.parentNode.insertBefore(div, this.treeView.element);
            this.treeView.element.appendChild(div);
        }
        else {
            //嵌套一个div，为了把上左右的阴影去掉
            var d2 = document.createElement('DIV');
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

            var box = this;
            //右键事件, 在空白处点击将要显示的菜单
            this.treeView.element.oncontextmenu = function (ev) {                
                ev = ev || window.event;
                var target = ev.target || ev.srcElement;

                while (!/^(ROW)|(NODE)|(TEXT)$/i.test(target.getAttribute('sign')) && target != this && target != box.element) {
                    target = target.parentNode;
                }
                if (target == this) {
                    box.treeView.nodeOptionsBox.target = null;
                    box.treeView.nodeOptionsBox.show(ev);
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

TreeView.NodeOptionsBox.prototype.show = function (ev) {
    /// <summary>显示菜单</summary>
    /// <param name="ev" type="Event">事件源</param>

    if (this.treeView.__executeEvent('onNodeOptionsBoxShow', this.target)) {
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

        var table = document.createElement('TABLE');
        table.border = 0;
        table.cellPadding = 0;
        table.cellSpacing = 0;
        this.element.appendChild(table);

        //子项
        var tbody = document.createElement('TBODY');
        table.appendChild(tbody);
        var item;
        if (this.display == 'CONTEXTMENU') {
            table.style.backgroundColor = '#FFFFFF';
            for (var i in this.items) {
                item = this.items[i].populate();
                if (item != null) {
                    tbody.appendChild(item);
                }
            }
        }
        else {
            var tr = document.createElement('TR');
            for (var i in this.items) {
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
        var x, y;
        var body = document.compatMode == 'CSS1Compat' ? document.documentElement : document.body;
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

TreeView.NodeOptionsBox.prototype.hide = function (quick) {
    /// <summary>隐藏菜单</summary>
    /// <param name="quick" type="boolean">是否快速隐藏</param>

    quick = TreeView.__parseBoolean(quick, false);

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
        var div = this.element;
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

    /// <value type="TreeView.NodeOptionsBox">所属的选项盒</value>
    this.nodeOptionsBox = null;
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
    this.cssClass = '';

    // 初始化
    if (properties != null) {
        for (var n in properties) {
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
        if (this.nodeOptionsBox.display == 'CONTEXTMENU') {
            var tr, td, img;

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
                    img.src = this.nodeOptionsBox.treeView.imagesBaseUrl + this.imageUrl;
                }
                else {
                    img.src = this.nodeOptionsBox.treeView.imagesBaseUrl + 'blank.gif';
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
                var item = this;
                tr.onmouseover = function () {
                    this.cells[0].className = 'treeViewNodeOption0b';
                    this.cells[0].style.backgroundImage = 'url(' + item.nodeOptionsBox.treeView.imagesBaseUrl + 'option.png)';
                    this.cells[1].className = 'treeViewNodeOption1b';
                    this.cells[1].style.backgroundImage = 'url(' + item.nodeOptionsBox.treeView.imagesBaseUrl + 'option.png)';
                }
                tr.onmouseout = function () {
                    this.cells[0].className = 'treeViewNodeOption0a';
                    this.cells[0].style.backgroundImage = '';
                    this.cells[1].className = 'treeViewNodeOption1a';
                    this.cells[1].style.backgroundImage = '';
                }
                tr.onclick = function (ev) {
                    if (item.type == 'NORMAL') {
                        item.nodeOptionsBox.treeView.__executeEvent('onNodeOptionClick', item);
                    }
                }
            }
            return tr;
        }
        else {
            var td, img;
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
                    img.src = this.nodeOptionsBox.treeView.imagesBaseUrl + this.imageUrl;
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
                var item = this;
                td.onmouseover = function () {
                    this.className = 'treeViewNodeOption2b';
                    this.style.backgroundImage = 'url(' + item.nodeOptionsBox.treeView.imagesBaseUrl + 'option.png)';
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
                    this.style.backgroundImage = 'url(' + item.nodeOptionsBox.treeView.imagesBaseUrl + 'option.png)';
                }
                td.onclick = function (ev) {
                    if (item.type == 'NORMAL') {
                        item.nodeOptionsBox.treeView.__executeEvent('onNodeOptionClick', item);
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

/*
TreeView.DataMapping
*/

TreeView.DataMapping = function () {
    /// <summary>构造函数</summary>

    /// <value type="String">要映射的数据文件地址, 为空表现映射所有文件</value>
    this.url = '';

    /// <value type="Boolean">所属的菜单项</value>
    this.parseOnly = false;

    /// <value type="Array" elementType="TreeNodeMap">映射字段表</value>
    this.maps = [];
}

TreeView.__initializeAllTreeViews = function () {
    /// <summary>初始化document.treeViews并呈现页面上所有TreeView</summary>

    var i;

    // 得到页面上所有TreeView标签
    //var treeViews = document.getElementsByTagName('TreeView');
    var treeViews = document.querySelectorAll('TreeView,div[treeview]');

    // id 如果ID为空, 自动添加ID
    var ids = new Array(treeViews.length);
    for (i = 0; i < treeViews.length; i++) {
        if (treeViews[i].id == '') { treeViews[i].id = '__TreeView_' + i; }
        ids[i] = treeViews[i].id;
    }

    // 替换页面上所有TreeView标签的内部自定义标签
    var parentNode, html;
    for (i = 0; i < ids.length; i++) {
        parentNode = document.getElementById(ids[i]).parentNode;
        html = parentNode.innerHTML;
        html = html.replace(/<treeview/i, '<div');
        html = html.replace(/<\/treeview>/i, '</div>');
        while (/<treenode/i.test(html)) { html = html.replace(/<treenode/i, '<span'); }
        while (/<\/treenode>/i.test(html)) { html = html.replace(/<\/treenode>/i, '</span>'); }

        while (/<datamapping/i.test(html)) { html = html.replace(/<datamapping/i, '<dl style="display:none"'); }
        while (/<\/datamapping>/i.test(html)) { html = html.replace(/<\/datamapping>/i, '</dl>'); }
        while (/<map/i.test(html)) { html = html.replace(/<map/i, '<dd'); }
        while (/<\/map>/i.test(html)) { html = html.replace(/<\/map>/i, '</dd>'); }

        html = html.replace(/<nodeoptions/i, '<ul style="display:none"');
        html = html.replace(/<\/nodeoptions>/i, '</ul>');
        while (/<nodeoption/i.test(html)) { html = html.replace(/<nodeoption/i, '<li'); }
        while (/<\/nodeoption>/i.test(html)) { html = html.replace(/<\/nodeoption>/i, '</li>'); }

        parentNode.innerHTML = html;
    }

    var treeView;
    var property, value;
    //遍历可获取的属性, 将属性读入TreeView对象
    for (i = 0; i < ids.length; i++) {
        treeView = new TreeView({ id: ids[i] });
        treeView.element = document.getElementById(ids[i]);
        //ownProperties
        for (property in treeView) {
            //只初始化除childNodes外的Own属性和事件
            if ((property != 'childNodes' && treeView.hasOwnProperty(property)) || property.indexOf('on') == 0) {
                value = treeView.element.getAttribute(property);
                if (value != null) { treeView[property] = value; }
            }
        }
        treeView.load();
    }

    TreeView.addListener(document, 'click', function (ev) {
        ev = ev || window.event;
        var target = ev.target || ev.srcElement;

        //设置活动的TreeView
        while (target != null && target.nodeName != 'HTML' && target.getAttribute('sign') != 'TREEVIEW') {
            target = target.parentNode;
        }
        if (target != null && target.getAttribute('sign') == 'TREEVIEW') {
            TreeView.activeTreeView = document.treeViews[target.id];
        }
        else {
            TreeView.activeTreeView = null;
        }

        //隐藏NodeOptionsBox:ContextMenu
        if (ev.button == 0) {
            for (var tv in document.treeViews) {
                if (document.treeViews[tv].nodeOptionsBox != null && document.treeViews[tv].nodeOptionsBox.display == 'CONTEXTMENU' && document.treeViews[tv].nodeOptionsBox.visible) {
                    target = ev.target || ev.srcElement;
                    while (target.nodeName != 'HTML' && target.getAttribute('sign') != 'TREEVIEWCONTEXTMENU') {
                        target = target.parentNode;
                    }
                    document.treeViews[tv].nodeOptionsBox.hide(target.nodeName != 'HTML');
                }
            }
        }
    });

    //添加键盘事件
    TreeView.addListener(document, 'keyup', function (ev) {
        var treeView = TreeView.activeTreeView;
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

                ev = ev || window.event;
                var treeNode = treeView.selectedNode;
                var keys = {
                    //Space
                    32: function () {
                        if (treeView.showCheckBoxes != 'NONE') {
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
                        if (treeNode.treeView.nodeOptionsBox != null && treeNode.treeView.nodeOptionsBox.display == 'CONTEXTMENU' && treeNode.treeView.nodeOptionsBox.visible) {
                            treeNode.treeView.nodeOptionsBox.hide();
                        }
                        else {
                            treeNode.unselect();
                            if (treeNode.treeView.nodeOptionsBox != null && treeNode.treeView.nodeOptionsBox.display == 'TOP') {
                                treeNode.treeView.nodeOptionsBox.target = null;
                                treeNode.treeView.nodeOptionsBox.show();
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
            return false;
        }
    });
}

TreeView.__scripts = document.getElementsByTagName('SCRIPT');
if (TreeView.__scripts[TreeView.__scripts.length - 1].parentNode.nodeName == 'HEAD') {
    if (document.addEventListener != null) {
        document.addEventListener("DOMContentLoaded", function () { TreeView.__initializeAllTreeViews(); }, false);
    }
    else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState === 'complete') {
                TreeView.__initializeAllTreeViews();
            }
        });
    }    
}
else {
    TreeView.__initializeAllTreeViews();
}

$tree = function(name) {
    return document.treeViews[name.replace(/^#/, '')];
}