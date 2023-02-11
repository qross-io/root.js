//-----------------------------------------------------------------------
// <TreeView> root.treeview.js
//-----------------------------------------------------------------------
// v9.0 Gingko
//-----------------------------------------------------------------------
// http://www.qross.cn
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

        this.element.$$('template').forEach(template => {
            if (template.name != '') {
                this.#templates[template.name] = template;
            }
            else {
                throw new Error('All TEMPLATE elements must have "name" attribute.');
            }
        });

        this.#slots = this.$$children('slot');
        if (this.#slots.length == 0) {
            if (this.template != '') {
                this.#slots.push($create('SLOT', {}, {}, { 'for': this.template, 'data': this.data }));
                this.element.appendChild(this.#slots.first);
            }
        }
    }

    #templates = new Object();
    #slots = null;
    #slotsToLoad = 0;

    // --- 数据 ---

    get template() {
        return this.getAttribute('template', '');
    }

    set template(template) {
        return this.setAttribute('template', template);
    }

    get data() {
        return this.getAttribute('data') ?? '';
    }

    set data(data) {
        this.setAttribute('data', data);
    }

    //基础模板的 name 或 #id 或空
    get templates() {
        return this.#templates;
    }

    //等待其他组件加载完成后再加载，仅初始化之前有用
    get await() {
        return this.getAttribute('await', '');
    }

    set await(await) {
        return this.setAttribute('await', await);
    }

    // -- 链接 ---

    //链接风格
    get linkMode() {
        return Enum('text|node').validate(this.getAttribute('link-mode'));
    }

    set linkMode(mode) {
        this.setAttribute('link-mode', mode);
    }

    //链接目标, 一般为 frame 的名字
    get linkTarget() {
        return this.getAttribute('link-target', '');
    }
    
    set linkTarget(target) {
        this.setAttribute('link-target', target);
    }

    //-- 图标 ---

    //图片存放目录
    get imagesBasePath() {
        return this.getAttribute('images-base-path', $root.images).suffix('/');
    }

    set imagesBasePath(path) {
        this.setAttribute('images-base-path', path);
    }

    get blankImageURL() {
        return this.getImageAttribute('blank-image-url', 'blank.gif');
    }

    set blankImageURL(url) {
        this.setAttribute('blank-image-url', url);
    }

    //指示节点可以被展开的图标, 一般是一个+号
    get plusSignURL() {
        return this.getImageAttribute('plus-sign-url', 'burl_0a.gif');
        //return this.getAttribute('plus-sign-url', 'burl_0a.gif').if(s = s != '' && !s.includes('/'))?.prefix(this.imagesBasePath ?? '') ?? $else;
    }

    set plusSignURL(url) {
        this.setAttribute('plus-sign-url', url);
    }

    get plusSignHoverURL() {
        return this.getImageAttribute('plus-sign-hover-url', 'burl_0b.gif');
    }

    set plusSignHoverURL(url) {
        this.setAttribute('plus-sign-hover-url', url);
    }
    
    //指标节点可以被闭合的图标, 一般是一个-号
    get minusSignURL() {
        return this.getImageAttribute('minus-sign-url', 'burl_1a.gif');
    }

    set minusSignURL(url) {
        this.setAttribute('minus-sign-url', url);
    }

    get minusSignHoverURL() {
        return this.getImageAttribute('minus-sign-hover-url', 'burl_1b.gif');
    }

    set minusSignHoverURL(url) {
        this.setAttribute('minus-sign-hover-url', url);
    }

    //正在载入状态图标, 在展开load-on-demand节点时显示
    get contentLoadingImageURL() {
        return this.getImageAttribute('content-loading-image-url', 'spinner.gif');
    }

    set contentLoadingImageURL(url) {
        this.setAttribute('content-loading-image-url', url);
    }

    get nonExpandableImageURL() {
        return this.getImageAttribute('no-expandable-image-url', 'blank.gif');
    }

    set nonExpandableImageURL(url) {
        this.setAttribute('no-expandable-image-url', url);
    }

    //定义鼠标划过或选择节点时的样式范围, 可选TEXT, NODE
    //涉及到节点上各个构成元素的事件，在加载后不可重新设置
    get nodeCellStyle() {
        return Enum('text|node').validate(this.getAttribute('node-cell-style'));
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
        this.$$('table[sign=NODE]').forEach(table => table.cellPadding = this.nodePadding);
    }
    
    //两个同级节点之间的间距
    get nodeSpacing() {
        return $parseInt(this.getAttribute('node-spacing'), 1);
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
        return this.getAttribute('node-text-class', 'treenode-node-text-class');
    }

    set nodeTextClass(className) {
        this.setAttribute('node-text-class', '');
    }

    get nodeClass() {
        return this.getAttribute('node-class', 'treenode-default-class')
    }

    set nodeClass(className) {
        this.setAttribute('node-class', className);
    }

    get nodeHoverClass() {
        return this.getAttribute('node-hover-class', 'treenode-default-hover-class');
    }

    set nodeHoverClass(className) {
        this.setAttribute('node-hover-class', className);
    }

    //被选择状态下的节点样式
    get selectedNodeClass() {
        return this.getAttribute('selected-node-class', 'treenode-default-selected-class');
    }

    set selectedNodeClass(className) {
        this.setAttribute('selected-node-class', className);
    }

    get selectedNodeHoverClass() {
        return this.getAttribute('selected-node-hover-class', 'treenode-default-selected-hover-class');
    }

    set selectedNodeHoverClass(className) {
        this.setAttribute('selected-node-hover-class', className);
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
        return this.getAttribute('node-tip-class', 'gray');
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
        return $parseBoolean(this.getAttribute('burls-visible'), true, this);
    }

    set burlsVisible(visible) {
        this.setAttribute('burls-visible', visible);
    }

    //是否显示分支线
    get linesVisible() {
        return $parseBoolean(this.getAttribute('lines-visible'), false, this);
    }

    set linesVisible(visible) {
        this.setAttribute('lines-visible', visible);
    }

    //是否显示节点图标
    get iconsVisible() {
        return $parseBoolean(this.getAttribute('icons-visible'), true, this);
    }

    set iconsVisible(visible) {
        this.setAttribute('icons-visible', visible);
        this.$$('td[sign=ICON]').forEach(td => td.visible = $parseBoolean(visible, true, this));
    }

    //是否显示复选框
    get checkBoxesVisible() {
        return $parseBoolean(this.getAttribute('checkboxes-visible'), false, this);
    }

    set checkBoxesVisible(visible) {
        this.setAttribute('checkboxes-visible', visible);
    }

    //是否在选择节点时展开子节点
    get expandOnSelect() {
        return $parseBoolean(this.getAttribute('expand-on-select'), true, this);
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
        return this.getAttribute('path-to-check', '').split(',').map(p => p.trim());
    } 

    // -- 非标签属性 ---

    #children = new Array(); //root TreeNodes
    #checkedNodes = new Array();
 
    #loaded = false;

    get loaded() {
        return this.#loaded;
    }

    #editingNode = null;

    get firstChild() {
        return this.#children.first;
    }

    get lastChild() {
        return this.#children.last;
    }

    #selectedNode = null;

    get selectedNode() {
        return this.#selectedNode;
    }

    set selectedNode(node) {
        this.#selectedNode = node;
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
   
    get childNodes() {
        return this.#children;
    }

    get hasChildNodes() {
        if (this.loaded) {
            return this.#children.nonEmpty;
        }
        else {
            return this.element.$$children('treenode') || this.#slots.nonEmpty;
        }
    }

    get text() {
        return this.#selectedNode?.text;
    }

    get value() {
        return this.#selectedNode?.value;
    }

    get path() {
        return this.#selectedNode?.path;
    }


    initialize() {

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
                
            if (this.#slots.nonEmpty) {                                                   
                this.#slotsToLoad = this.#slots.length;
                this.#slots.forEach(slot => {                    
                    this.#appendLoadingNode(slot);
                    slot.template
                        .of(this)
                        .setPage(0)
                        .load(function() {
                            this.#removeLoadingNode(slot);
                            this.#populateChildren();
                            this.#slotsToLoad --;
                            if (this.#slotsToLoad == 0) {                                
                                this.#completeLoading();
                            }
                        });
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

    #appendLoadingNode(slot) {
        this.insertBefore({
            name: 'Loading__' + String.shuffle(7),
            text: 'Loading...',
            icon: this.contentLoadingImageURL,
            draggable: false,
            droppable: false
        }, slot);
    }
   
    #removeLoadingNode (slot) {
        slot.$previous('treenode[name^=Loading__]')?.instance?.remove();
    }

    #completeLoading() {

        if (!this.#loaded) {
            this.#loaded = true;
            this.dispatch('onLoaded');
    
            //第一次加载初始化拖拽相关对象
            if (this.dragAndDropEnabled) {
                // 从一个dropLine左右侧来回移动有时不会重置dropLine, 在TreeView上添加此事件是为了还原曾经激活的dropLine
                if (this.dropSpacingEnabled) {
                    this.element.ondragleave = function () { HTMLTreeViewElement.__restoreDropLine(); }
                }            
        
                let treeView = this;
                // 可以将节点拖放到外部对象, 不移除被拖放的节点
                if (this.externalDropTargets != '') {
                    $a(this.externalDropTargets).forEach(target => {
                        target.ondragover = function (ev) {
                            if (treeView.dispatch('onNodeExternalDragOver')) {
                                this.className = treeView.dropTargetHoverClass;
                                ev.preventDefault(); 
                            }                        
                        };
                        target.ondragleave = function (ev) {
                            this.className = treeView.dropTargetClass;
                            ev.preventDefault(); 
                            treeView.dispatch('onNodeExternalDragLeave');
                        }
                        target.ondrop = function (ev) {
                                //向外部拖放完成
                                treeView.dispatch('onNodeExternalDropped', this);
                                //正常拖放结束
                                treeView.dispatch('onNodeDragEnd', treeView.selectedNode);
                                ev.preventDefault();
                                ev.stopPropagation();
                            };
                    });                
                }
            }
        }
        else {
            this.dispatch('onReloaded');
        }
        this.dispatch('onEveryloaded');

        if (!this.#preloaded) {
            this.expandTo(this.expandDepth);
        }        
    }

    #populateChildren() {
        this.$$children('treenode:not([initialized])').forEach(treeNode => new HTMLTreeNodeElement(treeNode).grow(this).populate());
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

    insertBefore (treeNode, reference) {
        if (treeNode instanceof HTMLTreeNodeElement || treeNode instanceof HTMLElement) {
            this.element.insertBefore(treeNode.element, reference.cap ?? reference);
            treeNode.grow(this).populate();
        }        
        else if (typeof(treeNode) == 'object') {
            this.insertBefore(HTMLTreeNodeElement.from(treeNode), reference);
        }
    }

    insertAfter(treeNode, reference) {
        if (treeNode instanceof HTMLTreeNodeElement || treeNode instanceof HTMLElement) {
            this.element.insertAfter(treeNode.element, reference.lap ?? reference.childrenElement ?? reference);
            treeNode.grow(this).populate?.();
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
        this.firstChild?.expandAllNodeByNode();
    }

    collapseAll() {
        this.firstChild?.collapseAll();
    }

    loadAll() {
        this.#children.forEach(treeNode => treeNode.loadAll());
    }

    loadAllNodeByNode() {
        this.firstChild?.loadAllNodeByNode();
    }

    checkAll() {

    }

    uncheckAll() {

    }

    // expandDepth & expandTo
    // ↓
    // preloadDepth & preloadTo
    // ↓
    // pathToSelect & selectNodeByPath
    // ↓
    // pathsToCheck & checkNodesByPaths
    // ↓
    // done

    #preloaded = false;

    get preloaed() {
        return this.#preloaded;
    }

    expandTo(depth) {
        if (depth > 1) {
            this.firstChild?.__expandTo(depth) ?? (this.#preloaded = true); 
        }
        else if (depth == 0) {
            //展开所有
            this.expandAllNodeByNode();
        }
        else if (!this.#preloaded) { 
            this.preloadTo(this.preloadDepth);         
        }
    }

    expandAllNodeByNode () {
        /// <summary>一个节点一个节点展开所有</summary>
        this.firstChild?.__expandNodeByNode() ?? (this.#preloaded = true);
    }

    preloadTo(depth) {
        if (depth > 1) {
            this.firstChild?.__preloadTo(depth) ?? (this.#preloaded = true);
        }
        else if (depth == 0) {
            //加载所有
            this.loadAllNodeByNode();
        }
        else if (!this.#preloaded) {
            this.selectNodeByPath(this.pathToSelect);
        }
    }

    loadAllNodeByNode () {
        /// <summary>一个节点一个节点加载所有</summary>
        this.firstChild?.__loadNodeByNode() ?? (this.#preloaded = true);
    };

    selectNodeByPath (path) {

        if (path != '') {
            let names = path.split('.');
            let node = this.$child('treenode[name=' + names.first + ']')?.instance;

            if (node != null) {
                if (names.length > 1) {
                    names.splice(0, 1);
                    if (node.loaded) {
                        if (!node.expanded) { node.expand(false); }
                        node.__selectNodeByPath(names);
                    }
                    else {
                        node.once('onExpanded', function () { this.__selectNodeByPath(names); });
                        node.expand(false);
                    }
                }
                else {
                    node.select(false);
                }
            }
            else {
                throw new Error('Incorrect treenode name "' + names.first + '".');
            }
        }

        if (!path.includes('.')) {
            if (!this.#preloaded) { this.checkNodesByPaths(this.pathsToCheck); }
        }
    }    

    checkNodesByPaths (paths) {
        /// <summary>根据paths集合选中节点</summary>
    
        if (this.checkBoxesVisible && paths.length > 0) {
            this.__checkNodesByPaths(paths, paths.first); 
        }
        else {
            this.#preloaded = true;
        }
    }

    __checkNodesByPaths (paths) {
        
        if (paths.nonEmpty) {
            let names = paths[0].split('.');
            let node = this.$child('treenode[name=' + names.first + ']')?.instance;

            if (node != null) {
                if (names.length > 1) {
                    names.splice(0, 1);
                    if (node.loaded) {
                        node.__checkNodeByPath(paths, names);
                    }
                    else {
                        node.once('onExpanded',
                            function () {
                                this.__checkNodeByPath(paths, names);
                            }
                        );
                        node.expand(false);
                    }
                }
                else {
                    node.check(false);
        
                    //查找下一个节点                    
                    if (paths.length > 1) {
                        paths.splice(0, 1);
                        this.__checkNodeByPath(paths, paths[0]);
                    }
                    else {
                        this.#preloaded = true;
                    }
                }
            }
            else {
                throw new Error('Incorrect treenode name "' + names.first + '".');
            }
        } 
        else {
            this.#preloaded = true;
        }           
    }

    //按 name 或 path 查找已加载的节点
    $node(path) {
        return this.$(path.replaceAll('.', '] treenode[name=').prefix('treenode[name=').suffix(']'))?.instance;
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
    'onnoderemove+': 'onNodeRemoved+'
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

    get treeView() {
        return this.#treeView;
    }

    get initialized() {
        return this.#initialized;
    }

    #slots = null;
    #slotsToLoad = 0;

    get template() {
        return this.getAttribute('template', '') ;        
    }

    set template(name) {
        this.setAttribute('template', name);
    }

    get data() {
        return this.getAttribute('data') ?? '';
    }

    set data(data) {
        this.setAttribute('data', data);
    }

    #nodeTable = null;
    #nodeTr = null;
    #burlCell = null;
    #burlImage = null;
    #checkBoxCell = null;
    #checkBoxImage = null;
    #childrenElement = null;
    #textBox = null;
    #majorElement = null;

    #iconCell = null;

    get icon() {
        if (!this.#initialized) {
            return this.getAttribute('icon') ?? this.$child('icon')?.innerHTML ?? '';
        }
        else {
            return this.#iconCell.first.getAttribute('origin') ?? this.#iconCell.first.innerHTML;
        } 
    }

    set icon(icon) {
        if (!this.#initialized) {
            this.$child('icon')?.setHTML(icon) ?? this.setAttribute('icon', icon);
        }
        else {
            this.#iconCell.first.removeAttribute('origin');
            this.#iconCell.first.innerHTML = icon.iconToHTML(this.treeView?.imagesBasePath);
            if (icon != this.#iconCell.first.innerHTML) {
                this.#iconCell.first.setAttribute('origin', icon);
            }
        }
    }

    get expandedIcon() {
        if (!this.#initialized) {
            return this.getAttribute('expanded-icon') ?? this.$child('expanded-icon,expandedicon')?.innerHTML ?? ''; 
        }
        else {
            return this.#iconCell.last.getAttribute('origin') ?? this.#iconCell.last.innerHTML;
        }               
    }

    set expandedIcon(icon) {
        if (!this.#initialized) {
            this.$child('expanded-icon,expandedicon')?.setHTML(icon) ?? this.setAttribute('expanded-icon', icon);
        }
        else {
            this.#iconCell.removeAttribute('origin');
            this.#iconCell.last.innerHTML = icon.iconToHTML(this.treeView?.imagesBasePath);
            if (icon != this.#iconCell.last.innerHTML) {
                this.#iconCell.last.setAttribute('origin', icon);
            }
        }
    }

    //节点icon样式, 默认从TreeView继承
    get iconClass() {
        if (!this.#initialized) {
            return this.getAttribute('icon-class') ?? this.$child('icon')?.className ?? this.treeView?.nodeIconClass ?? '';
        }
        else {
            return this.#iconCell.first.className;
        }
    }

    set iconClass(className) {
        if (!this.#initialized) {
            this.setAttribute('icon-class', className);
        }
        else {
            if (this.#iconCell.last.className == this.#iconCell.first.className) {
                this.#iconCell.last.className = className;
            }
            this.#iconCell.first.className = className;
        }
    }

    //节点icon展开时样式, 默认从TreeView继承
    get expandedIconClass() {
        if (!this.#initialized) {
            return this.getAttribute('expanded-icon-class') ?? this.$child('expanded-icon,expandedicon')?.className ?? this.treeView?.expandedNodeIconClass ?? '';
        }
        else {
            return this.#iconCell.last.className;
        }
    }

    set expandedIconClass(className) {
        if (!this.#initialized) {
            this.setAttribute('expanded-icon-class', className);
        }
        else {
            this.#iconCell.last.className = this.className;
        }        
    }

    get iconCell() {
        return this.#iconCell;
    }

    #textCell = null;

    get text() {
        if (!this.#initialized) {
            return this.getAttribute('text') ?? this.$child('text')?.innerHTML ?? '';
        }
        else {
            return (this.#linkAnchor ?? this.#textCell).innerHTML;
        }
    }

    set text(text) {
        if (!this.#initialized) {
            this.$child('text')?.setHTML(text) ?? this.setAttribute('text', text);
        }
        else {
            (this.#linkAnchor ?? this.#textCell).innerHTML = text;
        }
    }

    get textCell() {
        return this.#textCell;
    }

    #linkAnchor = null;

    get link() {
        return this.getAttribute('link') ?? this.getAttribute('href') ?? '';
    }

    get href() {
        return this.getAttribute('href') ?? this.getAttribute('link') ?? '';
    }

    get linkMode() {
        return Enum('text|node').validate(this.getAttribute('link-mode') ?? this.treeView?.linkMode);
    }

    get target() {
        return this.getAttribute('target') ?? this.getAttribute('link-target') ?? this.treeView?.linkTarget ?? '';
    }

    set target(target) {
        this.linkTarget = target;
    }

    get linkTarget() {
        return this.getAttribute('link-target') ?? this.getAttribute('target') ?? this.treeView?.linkTarget ?? '';
    }

    set linkTarget(target) {
        this.#linkAnchor?.set('target', target) ?? this.setAttribute('link-target', target);
    }

    get linkAnchor() {
        return this.#linkAnchor;
    }

    get value() {
        return this.getAttribute('value') ?? '';
    }

    set value(value) {
        this.setAttribute('value', value);
    }

    get path() {
        return this.getAttribute('path');
    }

    get depth() {
        return this.getAttribute('depth').toInt();
    }

    get title() {
        return this.#initialized ? this.#textCell.title : this.element.title;
    }

    set title(title) {
        this.#textCell?.set('title', title) ?? this.set('title', title);
    }

    #tipCell = null;

    get tip() {
        if (!this.#initialized) {
            return this.getAttribute('tip') ?? this.$child('tip')?.innerHTML ?? '';
        }
        else {
            return this.#tipCell.innerHTML;
        }
    }

    set tip(tip) {
        this.setAttribute('tip', tip);
        this.$child('tip')?.remove();
        if (this.#initialized) {
            this.#tipCell.innerHTML = tip;
        }
        else {
            this.$child('tip')?.setHTML(tip) ?? this.setAttribute('tip', tip);
        }        
    }

    get tipTitle() {
        return this.getAttribute('tip-title') ?? '';
    }

    set tipTitle(title) {
        this.setAttribute('tip-title', title);
        this.#tipCell?.set('title', title);
    }

    #capElement = null;

    get cap() {
        return this.#capElement;
    }

    #gapElement = null;

    get gap() {
        return this.#gapElement;
    }

    #lapElement = null;

    get lap() {
        return this.#lapElement;
    }

    get childrenElement() {
        return this.#childrenElement;
    }

    //缩进, -1表示从TreeView继承
    get indent() {
        return $parseInt(this.getAttribute('indent'), this.treeView?.nodeIndent ?? 16);
    }

    set indent(indent) {
        this.setAttribute('indent', this.indent);
        //...
    }

    //节点内间距
    get padding() {
        return $parseInt(this.getAttribute('padding'), this.treeView?.nodePadding ?? 2);
    }

    set padding(padding) {
        this.setAttribute('padding', padding);
        //...
    }

    //同级节点之间的距离, -1表示从TreeView继承
    get spacing() {
        return $parseInt(this.getAttribute('spacing'), this.treeView?.nodeSpacing ?? 0);
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
    get className() {
        return this.getAttribute('node-class') ?? this.getAttribute('class') ?? this.treeView?.nodeClass ?? '';
    }

    set className(className) {
        if (!this.selected) {
            this.#majorElement.removeClass(this.className).addClass(className);
        }
        this.setAttribute('node-class', className);
    }

    get hoverClass() {
        return this.getAttribute('hover-class') ?? this.treeView?.nodeHoverClass ?? '';
    }

    set hoverClass(className) {
        this.setAttribute('hover-class', className);
    }

    //文本部分的样式, 默认从TreeView继承
    get textClass() {
        return this.getAttribute('text-class') ?? this.treeView?.nodeTextClass ?? '';
    }

    set textClass(className) {
        this.#textCell.removeClass(this.textClass).addClass(className);
        this.setAttribute('text-class', className);
    }

    //节点选择时样式, 默认从TreeView继承
    get selectedClass() {
        return this.getAttribute('selected-class') ?? this.treeView?.selectedNodeClass ?? '';
    }

    set selectedClass(className) {
        if (this.selected) {
            this.#majorElement.removeClass(this.selectedClass).addClass(className);            
        }
        this.setAttribute('selected-class', className);
    }

    get selectedHoverClass() {
        return this.getAttribute('selected-hover-class') ?? this.treeView?.seletedNodeHoverClass ?? '';
    }

    set selectedHoverClass(className) {
        this.setAttribute('selected-hover-class', className);
    }
            
    //编辑状态下的文本框样式, 默认从TreeView继承
    get editingBoxClass() {
        return this.getAttribute('editing-box-class') ?? this.treeView?.editingBoxClass ?? '';
    }

    set editingBoxClass(className) {
        this.setAttribute('editing-box-class', className);
        if (this.editing) {
            this.#textBox.className = className;
        }
    }

            
    get tipClass() {
        return this.getAttribute('tip-class') ?? this.$child('tip')?.className ?? this.treeView?.nodeTipClass;
    }        

    //节点tip样式, 默认从TreeView继承
    set tipClass(className) {
        this.setAttribute('tip-class', className);
        this.#tipCell?.setClass(className);
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

    #expanded = false;
    #expanding = false;

    //是否在呈现时展开，或者是否在展开状态
    get expanded() {
        return this.#expanded;
    }

    //切换展开的折叠状态
    set expanded(expanded) {
        $parseBoolean(expanded, true, this) ? this.expand() : this.collapse();
    }

    get expanding() {
        return this.#expanding;
    }

    #loaded = false;
    #loading = false;

    get loaded() {
        return this.#loaded;
    }

    #selected = false;

    //是否默认选择, 或者是否在选择状态
    get selected() {
        return this.#selected;
    }

    //切换选择状态
    set selected(selected) {
        $parseBoolean(selected, true, this) ? this.select(true) : this.deselect();
    }

    #checked = HTMLTreeNodeElement.UNCHECKED;

    //是否默认选中, 当显示复选框时生效, 0 未选中 1 选中 2 部分子节点被选中
    get checked() {
        //default 0
        return this.#checked;
    }

    set checked(checked) {
        this.#checked = checked;
        if (typeof(checked) == 'boolean') {

        }
        else if (tyoeof(checked) == 'number') {

        }
        else {

        }        
    }

    get parentNode() {
        return this.element.parentNode?.if(e => e.nodeName == 'TREENODE-CHILDREN')?.$previous('treenode')?.instance;
    }

    get nextSibling() {
        return this.element.$next('treenode')?.instance;
    }

    get previousSibling() {
        return this.element.$previous('treenode')?.instance;
    }

    #children = new Array(); //child TreeNodes

    get children() {
        return this.#children;
    }

    get childNodes() {
        return this.#children;
    }

    get hasChildNodes() {
        if (this.loaded) {
            return this.#children.nonEmpty;
        }
        else {
            return this.#childrenElement.$$('treenode').nonEmpty || this.#slots.nonEmpty;
        }
    }

    get firstChild() {
        return this.#children.first;
    }

    get lastChild() {
        return this.#children.last;
    }

    #appendLoadingNode (slot) {
        this.insertBefore({
            name: 'Loading__' + String.shuffle(7),
            text: 'Loading...',
            icon: this.contentLoadingImageURL,
            draggable: false,
            droppable: false
        }, slot);
    }
   
    #removeLoadingNode (slot) {
        slot.$previous('treenode[name^=Loading__]')?.instance?.remove();
    }

    grow (treeView) {
        this.#treeView = treeView;
        return this;
    }

    populate () {

        //初始化
        this.setAttribute('path', (this.parentNode?.path.suffix('.') ?? '') + this.name);
        this.setAttribute('depth', (this.parentNode?.depth ?? 0) + 1);
        (this.parentNode ?? this.treeView).children.push(this);

        if (!this.hasAttribute('text') && this.element.firstChild != null && this.element.firstChild.nodeType == 3) {
            this.setAttribute('text', this.element.firstChild.textContent);
            this.element.firstChild.remove();
        }
        
        let iconHTML = this.$child('icon')?.outerHTML.replace(/^<icon\b/i, '<collapsed').replace(/\bicon>$/i, 'collapsed>');
        let expandedIconHTML = this.$child('expanded-icon,expandedicon')?.outerHTML.replace(/^<expanded-?icon\b/i, '<expanded').replace(/\bexpanded-?icon>$/i, 'expanded>');
        let capHTML = this.$child('cap')?.outerHTML.replace(/^<cap\b/i, '<treenode-cap').replace(/\bcap>$/i, 'treenode-cap>') ?? '';
        let gapHTML = this.$child('gap')?.outerHTML.replace(/^<gap\b/i, '<treenode-gap').replace(/\bgap>$/i, 'treenode-gap>') ?? '';
        let lapHTML = this.$child('lap')?.outerHTML.replace(/^<lap\b/i, '<treenode-gap').replace(/\blap>$/i, 'treenode-lap>') ?? '';

        let textHTML = this.$child('text')?.innerHTML;
        this.#textCell = $create('TD', { title: this.title }, { cursor: 'default', whiteSpace: 'nowrap' }, this.$child('text')?.set('sign', 'TEXT') ?? { 'sign': 'TEXT' });
        if (this.#textCell.className != '') {
            this.setAttribute('text-class', this.#textCell.className);
        }
        else {
            this.#textCell.className = this.textClass;
        }
        if (this.tip != '') {
            this.#tipCell = $create('TD', { className: this.tipClass, innerHTML: this.tip, title: (this.tipTitle != null ? this.tipTitle : '') }, { cursor: 'default', whiteSpace: 'nowrap' }, this.$child('tip')?.set('sign', 'TIP') ?? { 'sign': 'TIP' });
        }        

        this.$$children('text,icon,expand-icon,tip,cap,gap,lap').forEach(e => e.remove());

        if (capHTML != '') {
            this.element.insertBeforeBegin(capHTML);
            this.#capElement = this.element.previous;
            this.#capElement.setIf('', 'className', this.treeView.nodeCapClass)
                            .set('for', this.name)
                            .setStyle('dispaly', 'block');
        }

        if (gapHTML != '') {
            this.element.insertAfterEnd(gapHTML);
            this.#gapElement = this.element.next;
            this.#gapElement.setIf('', 'className', this.treeView.nodeGapClass)
                            .set('for', this.name)
                            .setStyle('dispaly', 'block');       
        }

        this.#childrenElement = $create('TREENODE-CHILDREN', { innerHTML: this.element.innerHTML }, { display: 'none' }, { 'for': this.name });
        if (this.childrenPadding > 0) {
            if (this.treeView.linesVisible) {
                this.#childrenElement.appendChild(HTMLTreeViewElement.__populateChildrenPadding(this, 'top'));
                this.#childrenElement.appendChild(HTMLTreeViewElement.__populateChildrenPadding(this, 'bottom'));
            }
            else {
                this.#childrenElement.style.paddingTop = this.childrenPadding + 'px';
                this.#childrenElement.style.paddingBottom = this.childrenPadding + 'px';
            }
        }        
        this.element.insertAfterEnd(this.#childrenElement);

        if (lapHTML != '') {
            this.#childrenElement.insertAfterEnd(lapHTML);  
            this.#lapElement = this.#childrenElement.next;
            this.#lapElement.setIf('', 'className', this.treeView.nodeLapClass)
                            .set('for', this.name)
                            .setStyle('dispaly', 'block');;
        }

        this.element.innerHTML = '';

        this.#slots = this.#childrenElement.$$children('slot');
        if (this.#slots.length == 0) {
            if (this.template != '') {
                this.#slots.push($create('SLOT', {}, {}, { 'for': this.template, 'data': this.data }));
                this.#childrenElement.appendChild(this.#slots.first);
            }
        }

        let treeNode = this;

        //spacing
        if (this.spacing > 0) {
            //大于0且启用拖放或者显示树线时, 在添加或删除节点时用DIV控制间隔
            if ((!this.treeView.dragAndDropEnabled && !this.treeView.linesVisible) || (this.treeView.dragAndDropEnabled && !this.treeView.dropSpacingEnabled)) {
                this.style.marginTop = this.spacing + 'px';
                this.style.marginBottom = this.spacing + 'px';
            }
        }

        //节点
        this.#nodeTable = $create('TABLE', { cellPadding: this.padding, cellSpacing: 0 }, { }, { 'sign': 'NODE', 'indent': this.indent });
        this.#nodeTable.insertAfterBegin('TBODY');
        this.#nodeTr = $create('TR');
        this.#nodeTable.tBodies[0].appendChild(this.#nodeTr);
        this.element.appendChild(this.#nodeTable);

        //如果不是根节点，则需要设置缩进
        if (this.depth > 1) {
            //td的宽度浏览器会自动加上cellPadding的宽度, 所有TD内填充图片宽度和TD宽度设置一致即可
            for (let i = 0; i < this.depth - 1; i++) {
                this.#nodeTr.insertAfterBegin('TD', { innerHTML : '<img src="' + this.treeView.imagesBasePath + 'blank.gif" width="' + this.parentNode.first.getAttribute('indent') + '" height="1" border="0" />' }, { }, { 'sign': 'INDENT' });
            }            
        }

        // burl + -
        if (this.treeView.burlsVisible) {
            this.#burlCell = $create('TD', { align: 'center' }, { }, { sign: 'BURL' });
            this.#burlImage = $create('IMG', { align: 'absmiddle' }, { position: 'relative', top: '-2px' });
            this.#burlCell.appendChild(this.#burlImage);
            this.#nodeTr.appendChild(this.#burlCell);

            if (this.hasChildNodes) {
                this.#burl();
            }
            else {
                this.#burlImage.src = this.treeView.nonExpandableImageURL;
            }
        }

        //checkbox
        if (this.treeView.checkBoxesVisible) {
            this.#checked = ((this.parentNode != null && this.parentNode.checked == HTMLTreeNodeElement.CHECKED) ? HTMLTreeNodeElement.CHECKED : HTMLTreeNodeElement.UNCHECKED);
            this.#checkBoxCell = $create('TD', { align: 'center' }, { }, { sign: 'CHECKBOX' });
            this.#nodeTr.appendChild(this.#checkBoxCell);

            this.#checkBoxImage = $create('IMG', {
                align: 'absmiddle',
                src: this.treeView.imagesBasePath + 'checkbox_' + this.checked + 'a.gif',
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
                        if (treeNode.checked == HTMLTreeNodeElement.UNCHECKED) {
                            treeNode.check();
                        }
                        else {
                            treeNode.uncheck();
                        }
                    }
                }
            });
                
            this.#checkBoxCell.appendChild(this.#checkBoxImage);
        }

        // icon
        this.#iconCell = $create('TD', { align: 'center', hidden: !this.treeView.iconsVisible || this.icon == '' }, { }, { 'sign': 'ICON' });
        this.#nodeTr.appendChild(this.#iconCell);
        this.#iconCell.insertAfterBegin(iconHTML ?? `<collapsed class="${this.iconClass}" origin="${this.icon}">${this.icon.iconToHTML(this.treeView.imagesBasePath)}</collapsed>`);
        this.#iconCell.insertBeforeEnd(expandedIconHTML ?? `<expanded class="${this.expandedIconClass || this.iconClass}" origin="${this.expandedIcon}">${this.expandedIcon.iconToHTML(this.treeView.imagesBasePath)}</expanded>`);
        this.#iconCell.on('click', function(ev) {
            treeNode.treeView.dispatch('onNodeIconClick', { 'treeNode': treeNode });
        });

        //text td
        this.#nodeTr.appendChild(this.#textCell);
                
        //节点对象
        this.setAttribute('node-class', this.className);
        if (this.treeView.nodeCellStyle == 'text') {
            this.#majorElement = this.#textCell;
            this.removeAttribute('class');
            this.#majorElement.addClass(this.selected ? this.selectedClass : this.className);
        }
        else {
            this.#majorElement = this.element;
            this.#majorElement.className = this.selected ? this.selectedClass : this.className;
        }        

        //Edit
        if (this.treeView.nodeEditingEnabled) {
            this.#majorElement.ondblclick = function () {
                treeNode.edit();
            }
        }

        //Drag & Drop
        if (this.treeView.dragAndDropEnabled) {
            //draggable为true才能拖动
            this.#majorElement.draggable = this.draggable;
            this.element.droppable = this.droppable;

            this.#majorElement.ondragstart = function (ev) {
                if (!treeNode.selected) { treeNode.select(false); }

                //如果已经展开, 隐藏
                if (treeNode.expanded) { treeNode.collapse(false); }

                //拖放事件
                HTMLTreeViewElement.clipBoard.treeNode = treeNode;

                //拖放数据
                let t = ev.dataTransfer;

                if (ev.shiftKey) {
                    t.effectAllowed = 'copy';
                    HTMLTreeViewElement.clipBoard.action = 'DRAGCOPY';
                }
                else {
                    t.effectAllowed = 'move';
                    HTMLTreeViewElement.clipBoard.action = 'DRAGMOVE';
                }
                //这里有什么用吗？没看到getData的地方 - 2015/1/19
                //t.setData('text/plain', '{treeView:"' + treeNode.treeView.id + '", action:"' + t.effectAllowed + '", treeNode:"' + treeNode.name + '"}');

                //克隆节点
                //HTMLTreeViewElement.clipBoard.treeNode = treeNode.clone();

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
                treeNode.treeView.dispatch('onNodeDragStart', treeNode);
            }

            //是否可以拖放到其他节点, false 表示仅排序
            if (this.treeView.dropChildEnabled) {
                this.#majorElement.ondragover = function (ev) {

                    let droppable = treeNode.droppable;
                    if (droppable) {
                        let originalNode = HTMLTreeViewElement.clipBoard.treeNode;

                        //树内部或其他树的节点拖动
                        if (originalNode != null) {
                            let oTreeView = originalNode.treeView;
                            //如果被drag节点是drop节点的lastChild, 不能drop
                            //节点不能拖放到自己的子节点上
                            if (originalNode == treeNode.lastChild) { droppable = false; }
                            if (treeNode.treeView == oTreeView && ('.' + treeNode.path + '.').indexOf('.' + originalNode.path + '.') > -1) { droppable = false; }
                        }

                        if (droppable) {
                            if ((originalNode != null && treeNode.treeView.dispatch('onNodeDragOver', treeNode))
                                || (originalNode == null && treeNode.treeView.dispatch('onExternalElementDragOver', treeNode))) {
                                
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

                this.#majorElement.ondragleave = function (ev) {
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

                this.#majorElement.ondrop = function (ev) {
                    let originalNode = HTMLTreeViewElement.clipBoard.treeNode;

                    //节点拖放
                    if (originalNode != null) {
                        //onAppended 添加完节点之后执行
                        let onAppended = function (node) {

                            //结束拖放, 清空数据
                            HTMLTreeViewElement.clipBoard.clear();

                            node.select(false);

                            //执行事件
                            if (HTMLTreeViewElement.clipBoard.action == 'DRAGMOVE') {
                                treeNode.treeView.dispatch('onNodeMoved', node);
                            }
                            else if (HTMLTreeViewElement.clipBoard.action == 'DRAGCOPY') {
                                treeNode.treeView.dispatch('onNodeCopied', node);
                            }
                            //拖放到某一个节点
                            treeNode.treeView.dispatch('onNodeDropped', node);

                            //正常结束事件
                            treeNode.treeView.dispatch('onNodeDragEnd', node);
                        }

                        let node = originalNode.clone();

                        //处理原节点
                        if (HTMLTreeViewElement.clipBoard.action == 'DRAGMOVE') {
                            //删除原节点
                            originalNode.remove(false);
                        }

                        //在当前节点添加子节点          
                        if (treeNode.hasChildNodes) {
                            //有子节点, 未展开
                            if (!treeNode.expanded) {
                                treeNode.on('onExpanded',
                                    function () {
                                        this.on('onAppended', onAppended);
                                        this.appendChild(node);
                                    });
                                HTMLTreeViewElement.clipBoard.$expanding = true;
                                treeNode.expand(false);
                            }
                            //有子节点, 已展开
                            else {
                                treeNode.on('onAppended', onAppended);
                                treeNode.appendChild(node);
                            }
                        }
                        else {
                            //无子节点
                            treeNode.on('onAppended', onAppended);
                            treeNode.appendChild(node);
                            treeNode.expand(false);
                        }
                    }
                    else {
                        //外部元素拖放
                        treeNode.treeView.dispatch('onExternalElementDropped', treeNode);
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
                this.#majorElement.ondragover = function (ev) {
                    ev.stopPropagation();
                }
            }

            this.#majorElement.ondragend = function (ev) {
                //恢复默认设置
                if (HTMLTreeViewElement.clipBoard.action != '') {
                    if (!HTMLTreeViewElement.clipBoard.$expanding) { HTMLTreeViewElement.clipBoard.clear(); }

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
                    treeNode.treeView.dispatch('onNodeDragEnd', treeNode);
                }
            }
        }

        //为节点对象添加事件

        this.#majorElement.on('mouseover', function (ev) {
            if (treeNode.treeView.dispatch('onNodeHover', { 'hoverNode': treeNode, 'ev': ev })) {
                if (!treeNode.selected) {
                    this.removeClass(treeNode.className).addClass(treeNode.hoverClass);
                }
                else if (treeNode.selectedHoverClass != '') {
                    this.removeClass(treeNode.selectedClass).addClass(treeNode.selectedHoverClass);
                }
            }
        });

        //鼠标划出
        this.#majorElement.on('mouseout', function (ev) {
            if (!treeNode.selected) {
                this.removeClass(treeNode.hoverClass).addClass(treeNode.className);
            }
            else {
                this.removeClass(treeNode.selectedHoverClass).addClass(treeNode.selectedClass);                
            }
        });

        //点击
        this.#majorElement.onclick = function (ev) {
            if (!treeNode.selected) {
                treeNode.select(ev);
            }
            else {
                treeNode.treeView.dispatch('onSelectedNodeClick', { 'selectedNode': treeNode, ev: ev });
            }
        }

        this.#majorElement.oncontextmenu = function (ev) {
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
            if (this.linkMode == 'text') {
                this.#linkAnchor = $create('A', { 
                        href: this.link.$p(this),
                        target: this.target, 
                        innerHTML: textHTML || this.text,
                        onclick: function () {
                            //onNodeNavigate事件
                            if (this.href != '' && !this.href.includes('javascript:')) {
                                treeNode.treeView.dispatch('onNodeNavigate', treeNode);
                            }
                        } 
                    }, { }, { 'sign': 'LINK' });
                this.#textCell.appendChild(this.#linkAnchor);
                if (!this.#textCell.draggable) {
                    this.#linkAnchor.draggable = false;
                }
            }
            else {
                this.#textCell.innerHTML = this.text;
                this.#majorElement.on('click', function() {
                    if (treeNode.target == '_blank') {
                        window.open(treeNode.link.$p(treeNode));
                    }
                    else if (treeNode.target != '') {
                        if (!treeNode.target.startsWith('_')) {
                            if (window.frames[treeNode.target] != null) {
                                window.frames[treeNode.target].location.href = treeNode.link.$p(treeNode);
                            }
                            else {
                                console.warn("TreeNode link attribute 'target' value '" + treeNode.target + "' may be incorrect.");
                            }
                        }
                        else {
                            console.warn("TreeNode link attribute 'target' only supports '_blank' in linkMode 'node'.");
                        }
                    }
                    else {
                        console.warn("TreeNode link attribute 'target' can't be empty if you set linkMode as 'node'.");
                    }
                });
            }
        }
        else {
            this.#textCell.innerHTML = textHTML || this.text;
        }

        if (this.#tipCell != null) {
            this.#nodeTr.appendChild(this.#tipCell);
        }
    
        //optionBox
        // this.#nodeTable.onmouseover = function (ev) {
        //     if (treeNode.treeView.optionBox != null && treeNode.treeView.optionBox.display != 'CONTEXTMENU' && treeNode.treeView.optionBox.display != 'TOP') {
        //         if (!treeNode.editing) {
        //             if (!treeNode.treeView.optionBox.visible || treeNode.treeView.optionBox.target != treeNode) {
        //                 treeNode.treeView.optionBox.target = treeNode;
        //                 treeNode.treeView.optionBox.show(ev);
        //             }
        //         }
        //     }
        // }

        this.#initialized = true;
        this.setAttribute('initialized', '')
    }

    #burl () {
        /// <summary>恢复节点的+-</summary>

        let treeNode = this;

        //如果正在展开或者已经展开
        if (this.#expanding || this.#expanded) {
            this.#burlImage.src = this.treeView.minusSignURL;
            this.#burlImage.setAttribute('current', 'minus');
        }
        else {
            this.#burlImage.src = this.treeView.plusSignURL;
            this.#burlImage.setAttribute('current', 'plus');
        }
    
        this.#burlImage.onmouseover = function () {
            if (this.getAttribute('current') == 'plus' && treeNode.treeView.plusSignHoverURL != '') {
                this.src = treeNode.treeView.plusSignHoverURL;
                this.setAttribute('current', 'plus-hover');
            }
            else if (this.getAttribute('current') == 'minus' && treeNode.treeView.minusSignHoverURL != '') {
                this.src = treeNode.treeView.minusSignHoverURL;
                this.setAttribute('current', 'minus-hover');
            }
        }
    
        this.#burlImage.onmouseout = function () {
            if (this.getAttribute('current') == 'plus-hover') {
                this.src = treeNode.treeView.plusSignURL;
                this.setAttribute('current', 'plus');
            }
            else if (this.getAttribute('current') == 'minus-hover') {
                this.src = treeNode.treeView.minusSignURL;
                this.setAttribute('current', 'minus');
            }
        }

        this.#burlImage.onclick = function (ev) {
            treeNode.toggle(ev);
            ev.stopPropagation();
        }
    }

    #unburl() {
        if (this.treeView.burlsVisible) {
            this.#burlImage.src = this.treeView.blankImageURL;
            this.#burlImage.onmouseover = null;
            this.#burlImage.onmouseout = null;
            this.#burlImage.onclick = null;
        }
        // 恢复节点图标
        if (this.treeView.iconsVisible && this.expandedIcon != '' && this.icon != '') {
            this.#iconCell.first.show();
        }
    
        this.#childrenElement.style.display = 'none';
        this.#gapElement?.setStyle('display', 'none');

        this.#expanded = false;
    }

    select (triggerEvent = false) {

        if (this.treeView != null && this != this.treeView.selectedNode) {

            this.treeView.selectedNode?.deselect();
    
            this.#majorElement.removeClass(this.className, this.hoverClass).addClass(this.selectedClass);
    
            this.#selected = true;
    
            // selectedNode
            this.treeView.selectedNode = this;
    
            // 触发各种事件
            if (triggerEvent !== false) {
                //onNodeSelected
                this.treeView.dispatch('onNodeSelected', { selectedNode: this, ev: triggerEvent || null });
    
                //this.fire('onSelected');
    
                let doToggle = true;
    
                //triggerEvent为用户点击事件 或 键盘事件
                if (typeof (triggerEvent) == 'object') {
                    //由burl节点触发的节点切换不再触发 expandOnSelect && collapseOnSelect
                    if (this.treeView.nodeCellStyle == 'node' && triggerEvent.type == 'click') {
                          if (triggerEvent.target == this.#burlImage) { doToggle = false; }
                    }
    
                    //键盘导航时不再触发 expandOnSelect && collapseOnSelect
                    if (this.treeView.keyboardNavigationEnabled && triggerEvent.type == 'keyup') {
                        if (triggerEvent.keyCode == KEYCODE.UP || triggerEvent.keyCode == KEYCODE.DOWN) { doToggle = false; }
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
    
            if (this.treeView.optionBox != null && this.treeView.optionBox.display != 'CONTEXTMENU') {
                if (!this.treeView.optionBox.visible || this.treeView.optionBox.target != this) {
                    this.treeView.optionBox.target = this;
                    this.treeView.optionBox.show(triggerEvent);
                }            
            }
        }
    }

    deselect() {
        if (this.treeView != null) {
            if (this.selected) {
                this.#majorElement.removeClass(this.selectedClass, this.hoverClass, this.selectedHoverClass).addClass(this.className);

                this.#selected = false;
    
                this.treeView.selectedNode = null;
            }
        }
    }

    toggle(triggerEvent = false) {
        if (!this.expanded) {
            //展开
            this.expand(triggerEvent);
        }
        else {
            //闭合
            this.collapse(triggerEvent);
        }
    }

    expand(triggerEvent = false) {

        if (this.treeView != null && !this.#expanded) {

            this.#expanding = true;
    
            //+-
            if (this.treeView.burlsVisible) {
                this.#burlImage.src = this.treeView.minusSignURL;
                this.#burlImage.setAttribute('current', 'minus');
            }
            
            //icon
            if (this.treeView.iconsVisible && this.expandedIcon != '') {
                this.#iconCell.first.hidden = true;
                this.#iconCell.last.hidden = false;                          
            }
    
            //展开子节点
            this.#childrenElement.style.display = 'block';
            this.#gapElement?.setStyle('display', 'block');
    
            //如果数据没有加载就加载		
            if (!this.#loaded) {
                //展开动作引发的load, 附加expand事件
                this.once('onLoaded', 
                    function () {
                        if (this.#expanding) {
                            this.#completeExpanding(triggerEvent); 
                        }
                    }).load();
            }
            else {
                this.#completeExpanding(triggerEvent);
            }
        }
    }

    collapse(triggerEvent = false) {
        if (this.treeView != null) {
            //+-
            if (this.treeView.burlsVisible) {
                this.#burlImage.src = this.treeView.plusSignURL;
                this.#burlImage.setAttribute('current', 'plus');
            }
            //icon
            if (this.treeView.iconsVisible && this.expandedIcon != '') {
                this.#iconCell.first.hidden = false;
                this.#iconCell.last.hidden = true; 
            }
    
            this.#childrenElement.style.display = 'none';
            this.#gapElement?.setStyle('display', 'none');
    
            this.#expanded = false;

            if (triggerEvent != false) { this.treeView.dispatch('onNodeCollapsed', { 'collapsedNode': this, ev: triggerEvent || null }); }    
        }
    }

    #completeExpanding (triggerEvent) {

        this.#expanding = false;

        if (this.hasChildNodes) {
            this.#expanded = true; 
        }
    
        //如果行为来自用户
        if (triggerEvent) {
            this.treeView.dispatch('onNodeExpanded', { 'expandedNode': this, ev: triggerEvent || null });
        }
    
        //执行TreeNode私有事件
        this.#dispatch('onExpanded');
    }

    load () {
        this.#loading = true;

        if (!this.#loaded) {
            this.#populateChildren();
        }

        if (this.#slots.nonEmpty) {                                                   
            this.#slotsToLoad = this.#slots.length;
            this.#slots.forEach(slot => {                    
                this.#appendLoadingNode(slot);
                slot.template
                    .of(this)
                    .setPage(0)
                    .setContainer(slot)
                    .setPosition('beforeBegin')
                    .setIrremovable(slot.$$previousAll(null, 'SLOT'))
                    .load(function() {
                        this.#removeLoadingNode(slot);
                        this.#populateChildren();
                        this.#slotsToLoad --;
                        if (this.#slotsToLoad == 0) {                                
                            this.#completeLoading();
                        }
                    });
            });
        }
        else {
            this.#completeLoading();
        }       
    }

    #completeLoading () {
        this.#loading = false;
        this.#loaded = true;
        //当没有子节点时, 处理burl为blank
        if (this.children.length == 0) { 
            this.#unburl(); 
        }
        //执行TreeView事件
        this.treeView.dispatch('onNodeLoaded', { 'loadedNode': this });
        //执行TreeNode事件
        this.#dispatch('onLoaded');
    }

    reload(completely) {

        if (completely === false) {
            //仅重新装备节点
            this.load(true);
        }
        else {
            //移除所有节点
            this.removeAll();
            //重置done属性
            if (this.templateObject != null) {
                this.templateObject.done = false;
            }        
            //如果之前是展开状态，还是展开; 反之则只加载
            if (this.expanded) {
                this.expand(false);
            }
            else {         
                this.load();
            }
        }
    }

    #populateChildren() {
        this.#childrenElement.$$children('treenode:not([initialized])').forEach(treeNode => new HTMLTreeNodeElement(treeNode).grow(this.treeView).populate());
    }

    insertBefore (treeNode, reference) {
        if (treeNode instanceof HTMLTreeNodeElement || treeNode instanceof HTMLElement) {
            this.#childrenElement.insertBefore(treeNode.element, reference.cap ?? reference);
            treeNode.grow(this.treeView).populate();
        }        
        else if (typeof(treeNode) == 'object') {
            this.insertBefore(HTMLTreeNodeElement.from(treeNode), reference);
        }
    }

    insertAfter(treeNode, reference) {
        if (treeNode instanceof HTMLTreeNodeElement || treeNode instanceof HTMLElement) {
            this.#childrenElement.insertAfter(treeNode.element, reference.lap ?? reference.childrenElement ?? reference);
            treeNode.grow(this.treeView).populate?.();
        }        
        else if (typeof(treeNode) == 'object') {
            this.insertAfter(HTMLTreeNodeElement.from(treeNode), reference);
        }
    }

    remove() {
        this.cap?.remove();
        this.gap?.remove();
        this.lap?.remove();
        this.#childrenElement.remove();
        this.element.remove();
    }

    __expandTo (depth) {
        /// <summary>依次展开节点到指定的深度, 在HTMLTreeViewElement.expandTo方法中被调用</summary>
    
        if (depth > this.depth && this.hasChildNodes) {
            if (this.expanded) {
                this.firstChild.__expandTo(depth);
            }
            else {
                this.once('onExpanded',
                    function () {
                        this.firstChild?.__expandTo(depth) ?? this.__expandTo(depth);                        
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
                node.nextSibling.__expandTo(depth);
            }
            else if (!this.treeView.preloaded) {
                this.treeView.preloadTo(this.treeView.preloadDepth); 
            }
        }
    };

    __preloadTo (depth) {
        /// <summary>依次展开节点到指定的深度, 在HTMLTreeViewElement.expandTo方法中被调用</summary>
    
        if (depth > this.depth && this.hasChildNodes) {
            if (this.expanded) {
                this.firstChild.__preloadTo(depth);
            }
            else {
                this.once('onLoaded',
                    function () {
                        if (this.firstChild != null) {
                            this.firstChild.__preloadTo(depth);
                        }
                        else {
                            this.__preloadTo(depth);
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
                node.nextSibling.__preloadTo(depth);
            }
            else {
                if (!this.treeView.preloaded) {
                    this.treeView.selectNodeByPath(this.treeView.pathToSelect);
                }
            }
        }
    }

    __selectNodeByPath (names) {
        /// <summary>根据路径选择一个节点, 在HTMLTreeViewElement.selectNodeByPath中被调用</summary>	
        /// <param name="names" type="String">节点name数组</param>

        let node = this.#childrenElement.$child('treenode[name=' + names.first + ']')?.instance;
        if (node != null) {
            if (names.length > 1) {
                names.splice(0, 1);
                if (node.loaded) {
                    if (!node.expanded) node.expand(false);
                    node.__selectNodeByPath(names);
                }
                else {
                    node.once('onExpanded', function () {
                            this.__selectNodeByPath(names);
                        });
                    node.expand(false);
                }
            }
            else {
                node.select(false);

                if (!this.treeView.preloaded) {
                    this.treeView.checkNodesByPaths(this.treeView.pathsToCheck);
                }
            }
        }
        else {
            throw new Error('Incorrect treenode name "' + names.first + '"');
        }
    }

    __checkNodeByPath (paths, names) {
        /// <summary>根据路径选中一个节点, 在HTMLTreeViewElement.prototype.checkNodeByPath中被调用</summary>
        /// <param name="paths" type="Array" elementType="String">节点path数组</param>
        /// <param name="names" type="String">节点name数组</param>
    
        let node = this.#childrenElement.$child('treenode[name=' + names.first + ']')?.instance;
        if (node != null) {
            if (names.length > 1) {
                names.splice(0, 1);
                if (node.loaded) {
                    node.__checkNodeByPath(paths, names);
                }
                else {
                    node.once('onExpanded', 
                        function () {
                            this.__checkNodeByPath(paths, names);
                        });
                    node.expand(false);
                }
            }
            else {
                node.check(false);
    
                //查找下一个节点
                paths.splice(0, 1);
                this.treeView.__checkNodeByPath(paths);
            }
        }
        else {
            throw new Error('Incorrect treenode name "' + names.first + '"');
        }
    }

    // eventName -> [eventFunc]
    #events = new Object();

    //绑定一次性事件
    once (eventName, func) {
        if (this.#events[eventName] == null) {
            this.#events[eventName] = [];
        }
        this.#events[eventName].push(func);

        return this;
    }

    //执行一次性事件
    #dispatch (eventName, ...args) {
        if (this.#events[eventName] != null) {
            for (let i = 0; i < this.#events[eventName].length; i++) {
                this.#events[eventName][i].call(this, ...args);
            }
            this.#events[eventName].length = 0;
        }    
    }
}

HTMLTreeNodeElement.from = function(properties) {
    let treeNode = new HTMLTreeNodeElement(document.createElement('TREENODE'));
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
    treenode { display: block; background-color: transparent; }
    treenode a { text-decoration: none; color: inherit; }
    .treenode-default-class { border: 1px solid #FFFFFF; border-radius: 3px; }
    .treenode-default-hover-class { border: 1px solid var(--darker); border-radius: 3px; background-image: linear-gradient(to bottom, var(--lighter), var(--primary)); color: #FFFFFF; }
    .treenode-default-hover-class a { text-decoration: none; color: #EEEEEE !important; }
    .treenode-default-hover-class a:hover { text-decoration: none; color: #FFFFFF !important; }
    .treenode-default-selected-class { border: 1px solid var(--darker); border-radius: 3px; background-image: linear-gradient(to bottom, var(--primary), var(--darker));  color: #FFFFFF; }
    .treenode-default-selected-class a { text-decoration: none; color: #EEEEEE; }
    .treenode-default-selected-class a:hover { color: #FFFFFF; }
    .treenode-default-selected-hover-class { border: 1px solid var(--darker); border-radius: 3px; background-image: linear-gradient(to bottom, var(--darker), var(--primary));;  color: #FFFFFF; }
    .treenode-default-selected-hover-class a:hover { text-decoration: none; color: #FFFFFF; }
    .treenode-node-text-class { padding: 2px 5px; }
    @keyframes treeview-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
    @keyframes treeview-fade-out { 0% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes dropline-fade-in-out { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
    .treenode-fade-in { animation-name: treeView-fade-in; animation-duration: 0.4s; animation-timing-function: ease-in; animation-fill-mode: forwards; }
    .dropline { box-shadow: 1px 1px 6px #999999; animation-name: dropLine-fade-in-out; animation-duration: 1s; animation-timing-function: ease; animation-iteration-count: infinite; }    
`);


HTMLTreeViewElement.initializeAll = function() {
    document.querySelectorAll('treeview').forEach(treeView => new HTMLTreeViewElement(treeView).initialize());
}

document.on('post', function() {
    HTMLTreeViewElement.initializeAll();
});