//-----------------------------------------------------------------------
// <TreeView> root.treeview.js
//-----------------------------------------------------------------------
// v9.0 Gingko
//-----------------------------------------------------------------------
// http://www.qross.cn
// Any problem, question, idea or bug, please email to wu@qross.io
//-----------------------------------------------------------------------
// Created at 2022/05/10 21:40

/*
<treeview>
    <treenode template="t1">
        <text></text>
        <icon></icon>
        <expanded-icon></expanded-icon>
        <tip></tip>
        <cap></cap>
        <gap></gap>
        <lap></lap>
        <slot></slot>
    </treenode>
    <template>
        <treenode>...</treenode>
    </template>
    <template name="t1">
    </tempate>
</treeview>
*/

document.treeView = null;

class HTMLTreeViewElement extends HTMLCustomElement {

    constructor(element) {
        super(element);
    }

    // --- 数据 ---

    get data() {
        return this.getAttribute('data') ?? '';
    }

    set data(data) {
        this.setAttribute('data', data);
    }

    #template = undefined;

    //基础模板的 name 或 #id 或空
    get template() {
        if (this.#template === undefined) {
            this.#template = this.getAttribute('template') || '';
        }

        if (typeof(this.#template) == 'string') {
            if (this.#template == '') {
                this.#template = this.$child('template:not([name])'); //没有 name 即根节点模板
            }
            else if (!this.#template.startsWith('#')) {
                this.#template = this.$child('template[name=' + this.#template + ']'); //指定 name
            }
            else {
                this.#template = this.$child(this.#template); //指定 id
            }
        }
        
        return this.#template;
    }

    set template(template) {
        this.#template = template;
    }

    //等待其他组件加载完成后再加载，仅初始化之前有用
    get await() {
        return this.getAttribute('await') || '';
    }

    set await(await) {
        return this.setAttribute('await', await);
    }

    // -- 链接 ---

    //链接风格
    get linkStyle() {
        return Enum('text|node').validate(this.getAttribute('link-style'));
    }

    set linkStyle(style) {
        this.setAttribute('link-style', style);
    }

    //链接目标, 一般为 frame 的名字
    get linkTarget() {
        return this.getAttribute('link-target');
    }
    
    set linkTarget(target) {
        this.setAttribute('link-target', target);
    }

    //-- 图标 ---

    //图片存放目录
    get imagesBasePath() {
        return this.getAttribute('images-base-path', $root.images);
    }

    set imagesBasePath(path) {
        this.setAttribute('images-base-path', path);
    }

    //指示节点可以被展开的图标, 一般是一个+号
    get plusSignURL() {
        return this.parseImageURL('plus-sign-url', 'burl_0a.gif', this.imagesBasePath);
        //return this.getAttribute('plus-sign-url', 'burl_0a.gif').if(s = s != '' && !s.includes('/'))?.prefix(this.imagesBasePath ?? '') ?? $else;
    }

    set plusSignURL(url) {
        this.setAttribute('plus-sign-url', url);
    }

    get plusSignHoverURL() {
        return this.parseImageURL('plus-sign-hover-url', 'burl_0b.gif', this.imagesBasePath);
    }

    set plusSignHoverURL(url) {
        this.setAttribute('plus-sign-hover-url', url);
    }
    
    //指标节点可以被闭合的图标, 一般是一个-号
    get minusSignURL() {
        return this.parseImageURL('minus-sign-url', 'burl_1a.gif', this.imagesBasePath);
    }

    set minusSignURL(url) {
        this.setAttribute('minus-sign-url', url);
    }

    get minusSignHoverURL() {
        return this.parseImageURL('minus-sign-hover-url', 'burl_1b.gif', this.imagesBasePath);
    }

    set minusSignHoverURL(url) {
        this.setAttribute('minus-sign-hover-url', url);
    }

    //正在载入状态图标, 在展开load-on-demand节点时显示
    get contentLoadingImageURL() {
        return this.parseImageURL('content-loading-image-url', 'spinner.gif', this.imagesBasePath);
    }

    set contentLoadingImageURL(url) {
        this.setAttribute('content-loading-image-url', url);
    }

    get nonExpandableImageURL() {
        return this.parseImageURL('no-expandable-image-url', 'blank.gif', this.imagesBasePath);
    }

    set nonExpandableImageURL(url) {
        this.setAttribute('no-expandable-image-url', url);
    }

    //定义鼠标划过或选择节点时的样式范围, 可选TEXT, ROW
    get nodeCellStyle() {
        return Enum('text|node').validate(this.getAttribute('node-cell-style'));
    }

    set nodeCellStyle(style) {
        this.setAttribute('node-cell-style', style);
    }

    //每级TreeNode的缩进距离
    get nodeIndent() {
        return $parseInt(this.getAttribute('node-indent'), 16);
    }

    set nodeIndent(indent) {
        this.setAttribute('node-indent', indent);
    }
    
    //节点内对象(如文本、图标)与节点外框之间的距离
    get nodePadding() {
        return $parseInt(this.getAttribute('node-padding'), 2);
    }

    set nodePadding(padding) {
        this.setAttribute('node-padding', padding);
    }
    
    //两个同级节点之间的间距
    get nodeSpacing() {
        return $parseInt(this.getAttribute('node-spacing'), 0);
    }

    set nodeSpacing(spacing) {
        this.setAttribute('node-spacing', spacing);
    }

    //父节点与其子节点之间的距离
    get childrenPadding() {
        return $parseInt(this.getAttribute('children-padding'), 0);
    }

    set childrenPadding(padding) {
        this.setAttribute('children-padding', padding);
    }

    //--- 样式 ---
    
    //节点文本样式
    get nodeTextClass() {
        return this.getAttribute('node-text-class', '');
    }

    set nodeTextClass(className) {
        this.setAttribute('node-text-class', '');
    }

    //被选择状态下的节点样式
    get selectedNodeClass() {
        return this.getAttribute('selected-node-class', 'tree-node-selected-class');
    }

    set selectedNodeClass(className) {
        this.setAttribute('selected-node-class', className);
    }

    //编辑状态下文本框的样式
    get editingBoxClass() {
        return this.getAttribute('editing-box-class', '');
    }

    set editingBoxClass(className) {
        this.setAttribute('editing-box-class', className);
    }

    get nodeIconClass() {
        return this.getAttribute('node-icon-class', '');
    }

    set nodeIconClass(className) {
        this.setAttribute('node-icon-class', className);
    }

    get expandedNodeIconClass() {
        return this.getAttribute('expanded-node-icon-class', '');
    }

    //节点提醒文字样式, 默认无
    set expandedNodeIconClass(className) {
        this.setAttribute('expanded-node-icon-class', className);
    }
    
    get nodeTipClass() {
        return this.getAttribute('node-tip-class', '');
    }

    set nodeTipClass(className) {
        this.setAttribute('node-tip-class', className);
    } 

    //节点上方元素的样式
    get nodeCapClass() {
        return this.getAttribute('node-cap-class', '');
    }

    set nodeCapClass(className) {
        this.setAttribute('node-cap-class', '');
        //...
    }

    //节点和其子点之间的空隙元素的样式
    get nodeGapClass() {
        return this.getAttribute('node-gap-class', '');
    }

    set nodeGapClass(className) {
        this.setAttribute('node-gap-class', '');
    }

    //节点的子节点下方元素的样式
    get nodeLapClass() {
        return this.getAttribute('node-lap-class', '');
    }

    set nodeLapClass(className) {
        this.setAttribute('node-lap-class', '');
    }
    
    //剪切或移动中的节点样式, 默认无, 透明度 50%
    get cutNodeClass() {
        return this.getAttribute('cut-node-class', '');
    }

    set cutNodeClass(className) {
        this.setAttribute('cut-node-class', className);
    }

    //当拖动的节点Hover到可放置节点时 可放置节点的样式
    get dropChildClass() {
        return this.getAttribute('drop-child-class', '');
    }
    
    set dropChildClass(className) {
        this.setAttribute('drop-child-class', className);
    }

    
    //外部拖放目标的默认样式
    get dropTargetClass() {
        return this.getAttribute('drop-target-class', '');
    }
    
    set dropTargetClass(className) {
        this.setAttribute('drop-target-class', className);
    }

    //-- 可见性 --

    //是否显示节点展开和闭合图标
    get burlsVisible() {
        return $parseBoolean(this.getAttribute('burls-visible'), true);
    }

    set burlsVisible(visible) {
        this.setAttribute('burls-visible', visible);
    }

    //是否显示分支线
    get linesVisible() {
        return $parseBoolean(this.getAttribute('lines-visible'), false);
    }

    set linesVisible(visible) {
        this.setAttribute('lines-visible', visible);
    }

    //是否显示节点图标
    get iconsVisible() {
        return $parseBoolean(this.getAttribute('icons-visible'), true);
    }

    set iconsVisible(visible) {
        this.setAttribute('icons-visible', visible);
    }

    //是否显示复选框
    get checkBoxesVisible() {
        return $parseBoolean(this.getAttribute('checkboxes-visible'), false);
    }

    set checkBoxesVisible(visible) {
        this.setAttribute('checkboxes-visible', visible);
    }

    //是否在选择节点时展开子节点
    get expandOnSelect() {
        return $parseBoolean(this.getAttribute('expand-on-select'), true);
    }

    set expandOnSelect(expand) {
        this.setAttribute('expand-on-select', expand);
    }

    //是否在选择节点时关闭子节点
    get collapseOnSelect() {
        return $parseBoolean(this.getAttribute('collapse-on-select'), false);
    }

    set collapseOnSelect(collapse) {
        this.setAttribute('collapse-on-select', collapse);
    }

    //是否可以编辑节点文本，双击，shift + E
    get nodeEditingEnabled() {
        return $parseBoolean(this.getAttribute('node-editing-enabled'), false);
    }
    
    set nodeEditingEnabled(enabled) {
        this.setAttribute('node-editing-enabled', enabled);
    }

    //Navigate 启用键盘导航 → ← ↑ ↓ Enter Shift+E
    get keyboardNavigationEnabled() {
        return $parseBoolean(this.getAttribute('keyboard-navigation-enabled'), true);
    }

    set keyboardNavigationEnabled(enabled) {
        this.setAttribute('keyboard-navigation-enabled', enabled);
    }

    //启用键盘编辑 Ctrl+C, Ctrl+X, Ctrl+V
    get keyboardCutCopyPasteEnabled() {
        return $parseBoolean(this.getAttribute('keyboard-cut-copy-paste-enabled'), false);
    }
    
    set keyboardCutCopyPasteEnabled(enabled) {
        this.setAttribute('keyboard-cut-copy-paste-enabled', enabled);
    }

    //1. 禁用拖放 dragAndDropEnabled="false"
    //2. 只能将节点拖放到外部元素上 dropSpacingEnabled="false" dropChildEnabled="false"
    //3. 只接收外部元素的拖放  dropSpacingEnabled="false" dragNodeEnabled="false"
    //4. 不可以将节点拖放为某一元素的子节点，仅同级排序 dropChildEnabled="false" dropSpacingEnabled="true"
    //5. 不可以将节点拖放到根节点下（即根节点的spacing中） dropRootEnabled="false"
    //拖放的目标是节点，节点可以被拖放到内部的节点位置或其他节点的子节点，也可以被拖放到外部
    //外部元素只能被拖放到节点上，$ 可以被拖放为cap, gap, lap 或其他   

    //启用拖放
    get dragAndDropEnabled() {
        return $parseBoolean(this.getAttribute('drag-and-drop-enabled'), false);
    }
    
    set dragAndDropEnabled(enabled) {
        this.setAttribute('drag-and-drop-enableed', enabled);
    }

    //是否可以拖动节点
    get dragNodeEnabled() {
        return $parseBoolean(this.getAttribute('drag-node-enabled'), true);
    }
    
    set dragNodeEnabled(enabled) {
        this.setAttribute('drag-node-enabled', enabled);
    }

    //是否可以拖放到节点和节点之间
    get dropSpacingEnabled() {
        return $parseBoolean(this.getAttribute('drop-spacing-enabled'), true);
    }
    
    set dropSpacingEnabled(enabled) {
        this.setAttribute('drop-spacing-enabled', enabled);
    }

    //是否可以放置到其他节点中, false表示只排序
    get dropChildEnabled() {
        return $parseBoolean(this.getAttribute('drop-child-enabled'), true);
    }
    
    set dropChildEnabled(enabled) {
        this.setAttribute('drop-child-enabled', enabled);
    }

    //是否可以放置为根节点, 默认true
    get dropRootEnabled() {
        return $parseBoolean(this.getAttribute('drop-root-enabled'), true);
    }
    
    set dropRootEnabled(enabled) {
        this.setAttribute('drop-root-enabled', enabled);
    }

    //从TreeView拖放到其他类型元素的selector
    #externalDropTargets = null;

    get externalDropTargets() {
        if (this.#externalDropTargets == null) {
            this.#externalDropTargets = $$(this.getAttribute('external-drop-targets'));
        }

        return this.#externalDropTargets;
    }

    set externalDropTargets(targets) {
        this.#externalDropTargets = $parseElements(targets, 'externalDropTargets');
    }

    //-- 初始化设置，只读属性 --

    //默认展开的TreeNode深度, 1为根节点, 0为展开所有
    get expandDepth() {
        return $parseInt(this.getAttribute('expand-depth'), 1);
    }

    //默认加载的TreeNode深度, 1为根节点, 0为加载所有
    get preloadDepth() {
        return $parseInt(this.getAttribute('preload-depth'), 1);
    }

    //默认选择的项, 格式 n1.n2.n3
    get pathToSelect() {
        return this.getAttribute('path-to-select', '');
    }

    //默认选中的项, 格式 n1.n2.n3,n1.n2.n4,...
    get pathsToCheck() {
        return this.getAttribute('path-to-check', '').split(',');
    } 

    // -- 非标签属性 ---

    #children = new Array(); //root TreeNodes
    #checkedNodes = new Array();
 
    #loaded = false;

    #firstChild = null;
    #lastChild = null;
    #selectedNode = null;
    #editingNode = null;

    get firstChild() {
        return this.#firstChild;
    }

    get lastChild() {
        return this.#lastChild;
    }

    get selectedNode() {
        return this.#selectedNode;
    }

    get editingNode() {
        return this.#editingNode;
    }

    get loaded() {
        return this.#loaded;
    }

    get checkedNodes() {
        return this.#checkedNodes;
    }

    get children() {
        return this.#children;
    }
   
    get hasChildNodes() {
        if (this.loaded) {
            return this.children.length > 0;
        }
        else {
            return (this.data != '' || !this.#template.empty);
        }
    }

    get childNodes() {
        return this.#children;
    }

    get text() {
        return this.#selectedNode?.text || null;
    }

    get value() {
        return this.#selectedNode?.value || null;
    }

    get path() {
        return this.#selectedNode?.path || null;
    }


    initialize() {

        //初始化模板
        if (!this.loaded) {
            this.template
                ?.of(this)
                .on('lazyload', function(e) {
                    this.owner.__populateChildren();
                    this.owner.dispatch('onLazyLoaded', e.detail);
                })
        }

        Event.interact(this, this.element);

        if (this.await == '') {
            this.load();
        }
        else {
            Event.await(this, this.await);
        }
    }

    load () {
        //如果已经加载则不再执行beforeLoad事件
        if (this.loaded ? true : this.dispatch('onBeforeLoad')) {
    
            if (!this.loaded) {
                this.#populateChildren();
            }                

            if (this.template != null) {

                this.#appendLoadingNode();
            
                this.template
                    .setPage(0)
                    .setData(this.data)
                    .load(function() {

                        this.#removeLoadingNode();

                        this.#populateChildren();

                        this.#completeLoading();                       
                    });
            }
            else {
                this.#completeLoading();
            }
        }        
    }

    reload() {
        if (this.template != null && this.dispatch('onBeforeReload')) {
            //重置 template
            this.template.clear();
            
            this.load();
        } 
    }

    #appendLoadingNode() {
        this.insertBefore({
            name: 'Loading__' + String.shffle(7),
            text: 'Loading...',
            icon: this.contentLoadingImageURL,
            draggable: false,
            droppable: false
        }, this.template);
    }
   
    #removeLoadingNode () {
        this.$child('treenode[name^=Loading__]')?.remove();        
    }

    #completeLoading() {

    }

    #populateChildren() {
        this.$$children('treenode:not([initialized])').forEach(treeNode => treeNode.populate());
    }

    appendChild(treeNode) {
        if (treeNode instanceof HTMLTreeNodeElement || treeNode instanceof HTMLElement) {
            this.element.appendChild(treeNode);
            treeNode.populate?.();
        }
        else if (typeof(treeNode) == 'object') {
            this.appendChild(HTMLTreeNodeElement.from(treeNode));
        }
    }

    insertBefore(treeNode, reference) {
        if (treeNode instanceof HTMLTreeNodeElement || treeNode instanceof HTMLElement) {
            this.element.insertBefore(treeNode, reference.cap ?? reference);
            treeNode.populate?.();
        }        
        else if (typeof(treeNode) == 'object') {
            this.insertBefore(HTMLTreeNodeElement.from(treeNode), reference);
        }
    }

    insertAfter(treeNode, reference) {
        if (treeNode instanceof HTMLTreeNodeElement || treeNode instanceof HTMLElement) {
            this.element.insertAfter(treeNode, reference.lap ?? reference);
            treeNode.populate?.();
        }        
        else if (typeof(treeNode) == 'object') {
            this.insertAfter(HTMLTreeNodeElement.from(treeNode), reference);
        }
    }

    removeChild(treeNode) {

    }

    removeAll() {

    }

    expandAll() {
        this.#children.forEach(treeNode => treeNode.expandAll());
    }

    expandAllNodeByNode() {
        this.#firstChild?.expandAllNodeByNode();
    }

    collapseAll() {
        this.#firstChild?.collapseAll();
    }

    loadAll() {
        this.#children.forEach(treeNode => treeNode.loadAll());
    }

    loadAllNodeByNode() {
        this.#firstChild?.loadAllNodeByNode();
    }

    checkAll() {

    }

    uncheckAll() {

    }

    expandTo(depth) {

    }

    preloadTo(deptth) {

    }

    $node(path) {
        return this.$(path.replaceAll('.', '] treenode[name=').prefix('treenode[name=').suffix(']'));
    }

    $$nodes(...paths) {
        let nodes = [];
        paths.forEach(path => {
            nodes.concat(this.$$(path.replaceAll('.', '] treenode[name=').prefix('treenode[name=').suffix(']')));
        });

        return nodes;
    }

    getCheckedNodes() {

    }
}

// -- 事件 --
HTMLCustomElement.defineEvents(HTMLTreeViewElement.prototype, {
        
    onbeforeload: 'onBeforeLoad', // 加载数据之前触发
    onbeforereload: 'onBeforeReload',     // 重新加载之前触发
    onload: 'onLoaded', //加载完成后触发
    onreload: 'onReloaded', //每次重新加载之后触发
    oneveryload: 'onEveryLoaded', //每次加载完成之后触发但不包含lazyLoad
    onlazyload: 'onLazyLoaded', //每次增量加载之后触发
    onnodeexpand: 'onNodeExpanded', //节点展开后触发 - expandedNode 刚刚被展开的节点
    onnodecollapse: 'onNodeCollapsed',//节点关闭后触发 colapsedNode 刚刚被闭合的节点
    onnodeload: 'onNodeLoaded', //每次节点加载完之后触发 loadedNode 刚刚加载完数据的节点 data 加载返回的数据
    onnodehover: 'onNodeHover', //当鼠标划过节点时触发 hoverNode鼠标划过的那个节点, 支持 return
    onnodeiconclick: 'onNodeIconClick', //节点图标被点击时触发  clickedNode被点击的那个节点
    onnodeselect: 'onNodeSelected', //当选择节点改变后触发 selectedNode 刚刚被选择的那个节点
    onselectednodeclick: 'onSelectedNodeClick', //当选中的节点被再次点击时触发
    onnodecheck: 'onNodeChecked', //当某个节点选中状态改变后触发 node 选中状态变化的那个节点
    onnodeedit: 'onNodeEdit', //当某个节点开始编辑时触发 node 正在编辑的那个节点
    onnodetextchange: 'onNodeTextChanged', //节点文本更改后触发 editedNode 被编辑的节点
    onnodecopy: 'onNodeCopied', //节点被复制后触发 - 键盘事件 copiedNode 被拷贝的节点
    onnodemove: 'onNodeMoved', //节点被移动后触发 - 键盘事件 copiedNode 被移动的节点
    onnodedragstart: 'onNodeDragStart', //节点开始被拖拽时触发 droppingNode 被拖拽的节点
    onnodedragend: 'onNodeDragEnd', //节点结束被拖拽时触发 droppingNode 被拖拽的节点
    onnodedragover: 'onNodeDragOver', //节点拖放到其他节点上时触发 droppingNode 拖放划过的节点
    onnodedrop: 'onNodeDropped', //节点被拖放后触发 - 鼠标事件 droppedNode 被拖放的节点
    onnodeexternaldragover: 'onNodeExternalDragOver', //节点被拖放到外部元素时，拖动进入目标元素时触发, target目标元素
    onnodeexternaldragleave: 'onNodeExternalDragLeave', //节点被拖放到外部元素时，拖动离开目标元素时触发, target目标元素
    onnodeexternaldrop: 'onNodeExternalDropped', //节点被拖放到外部元素后触发 (可通过this.selectedNode得到被拖放的节点), target接受拖放的元素
    onexternalelementdragover: 'onExternalElementDragOver', //外部元素拖动到节点后触发， overNode 正在拖放划过的节点
    onexternalelementdrop: 'onExternalElementDropped', //外部元素拖放到节点后触发， droppedNode 接受拖放的节点
    onnodenavigate: 'onNodeNavigate', //点击节点上的链接时触发, "javascript:"类不算链接  node 目标节点
    onnoderemove: 'onNodeRemove', //在节点上删除前触发 node 目标节点)

    'onnodetextchange+': 'onNodeTextChanged+',
    'onnoderemove+': 'onNodeRemove+'
});

class HTMLTreeNodeElement extends HTMLCustomElement { 

    constructor(element) {
        super(element);
    }

    get name() {
        if (!this.hasAttribute('name')) {
            if (this.id == '') {
                this.id = 'TreeNode_' + String.shuffle(9);
            }
            this.name = this.id;
        }
        return this.getAttribute('name');
    }

    set name(name) {
        this.setAttribute('name', name);
    }

    #treeView = null;
    #initialized = false;
    #expanded = false;    

    get treeView() {
        return this.#treeView;
    }

    get initialized() {
        return this.#initialized;
    }

    get data() {

    }

    set data() {

    }

    #textCell = null;
    #iconCell = null;
    #tipCell = null;
    #cap = null;
    #gap = null;
    #lap = null;

    get icon() {
        return this.getAttribute('icon') ?? this.$child('icon')?.innerHTML ?? '';
    }

    set icon(icon) {
        this.setAttribute('icon', icon);
        this.$child('icon')?.remove();
        if (this.#initialized && !this.#expanded) {
            this.#iconCell.innerHTML = icon.iconToHTML(this.treeView.imagesBasePath);            
        }        
    }

    get expandedIcon() {
        return this.getAttribute('expanded-icon') ?? this.$child('expanded-icon,expandedicon')?.innerHTML ?? '';        
    }

    set expandedIcon(icon) {
        this.setAttribute('expanded-icon', icon);
        this.$child('expanded-icon,expandedicon')?.remove();
        if (this.#initialized && this.#expanded) {
            this.#iconCell.innerHTML = icon.iconToHTML(this.treeView.imagesBasePath);            
        } 
    }

    get text() {
        return this.getAttribute('text') ?? this.$child('text')?.innerHTML ?? '';
    }

    set text(text) {
        this.setAttribute('text', text);
        this.$child('text')?.remove();  
        if (this.#initialized) {
            this.textCell.innerHTML = text;
        }
    }

    get value() {
        return this.getAttribute('value') ?? '';
    }

    set value(value) {
        this.setAttribute('value', value);
    }

    get title() {
        return this.element.title;
    }

    set title(title) {
        this.element.title = title;
        this.#textCell.title = title;
    }

    get tipTitle() {
        return this.getAttribute('tip-title') ?? '';
    }

    set tipTitle(title) {
        this.setAttribute('tip-title', title);
        this.#tipCell.title = title;
    }

    get tip() {
        return this.getAttribute('tip') ?? this.$child('tip')?.innerHTML ?? '';
    }

    set tip(tip) {
        this.setAttribute('tip', tip);
        this.$child('tip')?.remove();
        if (this.#initialized) {
            this.#tipCell.innerHTML = tip;
        }
    }

    get linkStyle() {

    }

    set linkStyle() {

    }

    get linkTarget() {

    }

    set linkTarget() {

    }

    get capContent() {
        return this.$child('cap')?.innerHTML ?? '';
    }

    set capContent(cap) {
        if (this.#initialized) {
            this.previousElementSibling?.if(e => e.nodeName == 'TREENODE-CAP')?.setHTML(cap)
                ?? this.insertBeforeBegin('TREEVIEW-CAP').previousElementSibling.setHTML(cap);
            this.$child('cap')?.remove();
        }
        else {
            (this.$child('cap') ?? this.insertAfterBegin('cap').$child('cap')).setHTML(cap);
        }
    }

    get gapContent() {
        return this.$child('gap')?.innerHTML ?? '';
    }

    set gapContent(gap) {
        if (this.#initialized) {
            this.nextElementSibling?.if(e => e.nodeName == 'TREENODE-GAP')?.setHTML(gap)
                ?? this.insertAfterEnd('TREEVIEW-GAP').nextElementSibling.setHTML(gap);
            this.$child('gap')?.remove();
        }
        else {
            (this.$child('gap') ?? this.insertAfterBegin('gap').$child('gap')).setHTML(gap);
        }
    }

    get lapContent() {
        return this.$child('lap')?.innerHTML ?? '';
    }

    set lapContent(lap) {
        if (this.#initialized) {
            this.#childrenDiv.nextElementSibling?.if(e => e.nodeName == 'TREENODE-LAP')?.setHTML(lap)
                ?? this.#childrenDiv.insertAfterEnd('TREEVIEW-LAP').nextElementSibling.setHTML(lap);
            this.$child('lap')?.remove();
        }
        else {
            (this.$child('lap') ?? this.insertAfterBegin('lap').$child('lap')).setHTML(lap);
        }
    }

    //缩进, -1表示从TreeView继承
    get indent() {
        return $parseInt(this.getAttribute('indent'), -1);
    }

    set indent(indent) {
        this.setAttribute('indent', this.indent);
        //...
    }

    //节点内间距, -1表示从TreeView继承
    get padding() {
        return $parseInt(this.getAttribute('padding'), -1);
    }

    set padding(padding) {
        this.setAttribute('padding', padding);
        //...
    }

    //同级节点之间的距离, -1表示从TreeView继承
    get spacing() {
        return $parseInt(this.getAttribute('spacing'), -1);
    }
    
    set spacing(spacing) {
        this.setAttribute('spacing', spacing);
        //...
    }

    // 与子节点之间的距离, -1表示从TreeView继承
    get childrenPadding() {
        return $parseInt(this.getAttribute('children-padding'), -1);
    }
    
    set childrenPadding(childrenPadding) {
        this.setAttribute('children-padding', childrenPadding);
        //...
    }

    //className //节点的默认样式, 默认从TreeView继承

    //文本部分的样式, 默认从TreeView继承
    get textClass() {
        return this.getAttribute('text-class') ?? this.$child('text')?.className || this.treeView?.nodeTextClass ?? '';
    }

    set textClass(className) {
        this.setAttribute('text-class', className);
        this.#textCell.className = className;
    }

    //节点选择时样式, 默认从TreeView继承
    get selectedClass() {
        return this.getAttribute('selected-class') ?? this.treeView?.selectedNodeClass ?? '';
    }

    set selectedClass(className) {
        this.setAttribute('', className);
        if (this.selected) {
            if (this.treeView?.nodeCellStyle == 'node') {
                this.className = className;
            }
            else {
                this.#textCell.className = className;
            }
        }
    }
            
    //编辑状态下的文本框样式, 默认从TreeView继承
    get editingBoxClass() {
        return this.getAttribute('editing-box-class') ?? this.treeView?.editingBoxClass ?? '';
    }

    set editingBoxClass(className) {
        this.setAttribute('editing-box-class', className);
        if (this.editing) {
            this.#textBox.clasName = className;
        }
    }
            
    //节点icon样式, 默认从TreeView继承
    get iconClass() {
        return this.getAttribute('icon-class') ?? this.$child('icon')?.className || this.treeView?.nodeIconClass ?? '';
    }

    set iconClass(className) {
        this.setAttribute('icon-class', className);
        if (!this.expanded || this.expandedIconClass == '') {
            this.#iconCell.clasName = className;
        }
    }

    //节点icon展开时样式, 默认从TreeView继承
    get expandedIconClass() {
        return this.getAttribute('expanded-icon-class') ?? this.$child('expanded-icon')?.className || this.treeView?.expandedNodeIconClass ?? '';
    }

    set expandedIconClass(className) {
        this.setAttribute('expanded-icon-class', className);
        if (this.expanded && className != '') {
            this.#iconCell.clasName = className;
        }
    }
            
    get tipClass() {
        return this.getAttribute('tip-class') ?? this.$chlid('tip')?.className || this.treeView?.nodeTipClass ?? '';
    }        

    //节点tip样式, 默认从TreeView继承
    set tipClass(className) {
        this.setAttribute('tip-class', className);
        this.#tipCell?.setClass(className);
    }

    get capClass() {
        return this.getAttribute('cap-class') ?? this.$child('cap')?.className || this.treeView?.nodeCapClass ?? '';
    }

    set capClass(className) {
        this.setAttribute('cap-class', className);
        //
    }

    get gapClass() {
        
    }

    set gapClass(className) {

    }

    get lapClass() {
        //nodeLapClass
    }
        
    set lapClass(className) {

    }

    get cutClass() {
        //cutNodeClass
    }

    //节点被剪切时的样式
    set cutClass(className) {

    }
            
    //有节点被拖放到当前节点时的样式, 默认从TreeView继承
    get dropClass() {

    }

    set dropClass(className) {
        this.setAttribute('drop-class', className);
    }

    //是否可以被选中
    get selectable() {
        return $parseBoolean(this.getAttribute('selectable'), true, this);
    }

    set selectable(able) {
        this.setAttribute('selectable', able);
    }

    //是否可以被拖动, HTMLTreeViewElement.dragAndDropEnabled启用时生效
    get draggable() {
        return $parseBoolean(this.getAttribute('draggable'), true, this);
    }

    set draggable(able) {
        this.setAttribute('draggable', able);
    }

    //是否可以把拖动的节点放置为其子节点, HTMLTreeViewElement.dragAndDropEnabled启用时生效
    get droppable() {
        return $parseBoolean(this.getAttribute('droppable'), true, this);
    }

    set droppable(able) {
        this.setAttribute('droppable', able);
    }

    //节点是否可编辑, HTMLTreeViewElement.nodeEditingEnabled启用时生效
    get editable() {
        return $parseBoolean(this.getAttribute('editable'), true, this);
    }

    set editable(able) {
        this.setAttribute('editable', able);
    }

    //节点是否可见
    get visible() {

    }

    set visible(visible) {

    }

    //节点是否隐藏
    get hidden() {
        
    }

    set hidden(hidden) {

    }

    //是否在呈现时展开，或者是否在展开状态
    get expanded() {

    }

    //切换展开的折叠状态
    set expanded(expanded) {

    }

    //是否默认选择, 或者是否在选择状态
    get selected() {

    }

    //切换选择状态
    set selected(selected) {

    }

    //是否默认选中, 当显示复选框时生效, 0 未选中 1 选中 2 部分子节点被选中
    get checked() {
        //default 0
    }

    set checked(checked) {

    }

    #appendLoadingNode() {
        this.insertBefore({
            name: 'Loading__' + String.shffle(7),
            text: 'Loading...',
            icon: this.contentLoadingImageURL,
            draggable: false,
            droppable: false
        }, this.template);
    }
   
    #removeLoadingNode () {
        this.$child('treenode[name^=Loading__]')?.remove();        
    }

    populate() {
        
    }
}

HTMLTreeNodeElement.from = function(properties) {
    let treeNode = new HTMLTreeNodeElement(document.createElement('TREEVIEW'));
    for (const name in properties) {
        treeNode[name] = properties[name];
    }
    return treeNode;
}

HTMLTreeNodeElement.UNCHECKED = 0;
HTMLTreeNodeElement.CHECKED = 1;
HTMLTreeNodeElement.INCHECKED = 2; //indeterminate checked


$root.appendClass(`
    treeview { display: block; background-color:transparent; }
    treenode { display: block; border: 1px solid transparent; border-radius: 3px; background-color: transparent; }
    treenode a { text-decoration: none; color: inherit; }
    treenode:hover { border: 1px solid var(--darker); border-radius: 3px; background-image: linear-gradient(to bottom, var(--lighter), var(--primary)); color: #FFFFFF; } /*#999999 #EEEEEE*/
    treenode:hover { text-decoration: none; color: inherit; }
    .tree-node-selected-class { border: 1px solid var(--darker); border-radius: 3px; background-image: linear-gradient(to bottom, var(--primary), var(--darker));  color: #FFFFFF; } /*#0F6D39 #3DBC77*/
    .tree-node-selected-class a { text-decoration: none; color: inherit; }
    .tree-node-selected-class:hover { border: 1px solid var(--darker); border-radius: 3px; background-image: linear-gradient(to bottom, var(--darker), var(--primary));;  color: #FFFFFF; } /*#0F6D39 #5FDE99*/
    .tree-node-selected-class:hover a { text-decoration: none; color: inherit; }
    @keyframes tree-view-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
    @keyframes tree-view-fade-out { 0% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes drop-line-fade-in-out { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
    .tree-node-fade-in { animation-name: treeView-fade-in; animation-duration: 0.4s; animation-timing-function: ease-in; animation-fill-mode: forwards; }
    .drop-line { box-shadow: 1px 1px 6px #999999; animation-name: dropLine-fade-in-out; animation-duration: 1s; animation-timing-function: ease; animation-iteration-count: infinite; }    
`);


HTMLTreeViewElement.initializeAll = function() {
    document.querySelectorAll('treeview').forEach(treeView => new HTMLTreeViewElement(treeView).initialize());
}

document.on('post', function() {
    HTMLTreeViewElement.initializeAll();
});