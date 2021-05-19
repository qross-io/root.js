/*
    <table id="" data="URL"
        imagesBaseUrl="URL" filterImageUrl="URL" searchImageUrl="URL" pickerImageUrl="URL" ascImageUrl="URL" descImageUrl="URL"
        rowClass="ClassName" alternativeRowClass="ClassName" hoverRowClass="ClassName" activeRowClass="ClassName" focusRowClass="ClassName"
        hoverColumnClass="ClassName" activeColumnClass="ClassName" focusColumnClass="ClassName">
        <colgroup>
            <col />
            <col name="columnName" databind="{field}" reloadOnFilter="name=value" reloadOnSort="order=asc"
                editable="Boolean" excludings="Array - 0,L" options="Array - 1,2,3" maxLength="INTEGER, 0" validator="RegExp" allowEmpty="Boolean"
                defaultClass="ClassName" hoverClass="ClassName" activeClass="ClassName" focusClass="ClassName" editClass="ClassName" />
            <col />
        <colgroup>
        <tbody>
            <tr>
                <td row="0" col="0">1</td>
                <td row="0" col="1">2</td>
            </tr>
        </tbody>
    </table>
*/

$enhance(HTMLTableElement.prototype)
    .declare({
        name: 'Table_' + document.components.size,
        exclusions: '', //0, n

        captionClass: '', //caption
        headerClass: 'header-row', //thead
        footerClass: '', //tfoot        
        rowClass: 'row',
        alternativeRowClass: 'alternate-row',
        hoverRowClass: 'row-hover',
        activeRowClass: 'row-active',
        focusRowClass: 'row-focus',
                
        //hoverColumnClass: '',
        //activeColumnClass: '',
        //focusColumnClass: '',

        //hoverCellClass: '',
        //activeCellClass: '',
        //focusCellClass: '',
        //editingCellClass: '',

        data: '',

        onrowhover: null, //function(row) { },
        onrowleave: null, //function(row) { },
        onrowfocus: null, //function(row) { },
        onrowblur: null, //function(row) { },
        onrowdblclick: null, //function(row) { },
        onrowremove: null, //function(row) { },
        onload: null, //function() { },
        onreload: null, //function() { },
        onfilter: null, //function() {},
        onsort: null, //function() {},
        onfiltercancel: null, //function() {}
        
        reloadOnFilterOrSorting: false, //如果为true, 则到后端请求数据, 如果为false, 则仅在前端过滤和筛选
        reloadOnFilter: false,
        reloadOnSort: false
    })
    .define({
        'value': {
            get () {            
                return '';
            }
        }
    });

HTMLTableElement.prototype.template = null;
HTMLTableElement.prototype.cols = new Array(); //表格的列数组
HTMLTableElement.prototype.excludedRows = new Set();
HTMLTableElement.prototype.hoverRow = null;
//HTMLTableElement.prototype.hoverColumn = -1;
HTMLTableElement.prototype.focusRow = null;
//HTMLTableElement.prototype.focusRows = new Array();
//HTMLTableElement.prototype.focusColumn = -1;
//数据源数据是否已经加载完成
HTMLTableElement.prototype.loaded = false;

HTMLTableElement.prototype.initialize = function() {
    if (this.id == '') {
        this.id = this.name;
    }

    if (this.querySelector('template') != null) {
        this.template = new Template(this.querySelector('template'))
                            .of(this, this)
                            .asArray();
    }

    if (this.tBodies.length == 0) {
        this.appendChild($create('TBODY'));        
    }
    
    Event.interact(this, this);

    if (this.data == '') {
        this.__initializeSettings();
        this.__initializeAllRows();
        this.loaded = true;

        this.execute('onload');
    }
    else {
        this.load();
    }

    let table = this;
    $x(this)
        .bind('mouseover', function (ev) { table.hover(ev); })
        .bind('mouseout', function (ev) { table.leave(ev); })
        .bind('mousedown', function (ev) { table.active(ev); })
        .bind('mouseup', function (ev) { table.focus(ev); })
        .bind('dblclick', function (ev) { table.dblclick(ev); });    
}

HTMLTableElement.prototype.hover = function (ev) {

    let row = this.__bubbleRow(ev);
    if (row.nodeName == 'TR' && row.isContent && !row.isExcludedRow) {
        if (this.hoverRow == null || !row.isHoverRow) {
            if (!row.isFocusRow) {
                if (this.hoverRow != null) {
                    this.hoverRow.className = Number.parseInt(this.hoverRow.getAttribute('index')) % 2 == 0 ? this.rowClass : this.alternativeRowClass;
                }
                this.hoverRow = row.tr;
                row.tr.className = this.hoverRowClass;
            }
            this.execute('onrowhover', row.tr);
        }
    }
}

HTMLTableElement.prototype.leave = function (ev) {
    if (this.hoverRow != null) {
        this.hoverRow.className = Number.parseInt(this.hoverRow.getAttribute('index')) % 2 == 0 ? this.rowClass : this.alternativeRowClass;
        this.execute('onrowleave', this.hoverRow);
        this.hoverRow = null;
    }
//    else {
//        let row = this.__bubbleRow(ev)
//        if (row.isFocusRow) {
//            this.execute('onrowleave', row.tr);
//        }
//    }
}

HTMLTableElement.prototype.active = function (ev) {
    let row = this.__bubbleRow(ev);
    if (row.nodeName == 'TR' && row.isContent && !row.isExcludedRow && !row.isFocusRow) {
        row.tr.className = this.activeRowClass;
    }
}

HTMLTableElement.prototype.focus = function (ev) {
    let row = this.__bubbleRow(ev);
    if (row.nodeName == 'TR' && row.isContent && !row.isExcludedRow && !row.isFocusRow) {
        this.hoverRow = null;
        if (this.focusRow != null) {
            this.execute('onrowblur', this.focusRow);
            this.focusRow.className = Number.parseInt(this.focusRow.getAttribute('index')) % 2 == 0 ? this.rowClass : this.alternativeRowClass;
        }
        this.focusRow = row.tr;        
        row.tr.className = this.focusRowClass;

        this.execute('onrowfocus', row.tr);
    }
}

HTMLTableElement.prototype.dblclick = function (ev) {
    let row = this.__bubbleRow(ev);
    if (row.nodeName == 'TR' && row.isContent && !row.isExcludedRow) {
        this.execute('onrowdblclick', row.tr);
    }
}

HTMLTableElement.prototype.remove = function(row) {
    if (row == null) {
        row = this.focusRow;
    }

    if (row != null) {
        if (this.execute('onrowremove', row)) {
            row.remove();
            this.__initializeAllRows();
        }        
    }
}

HTMLTableElement.prototype.__bubbleRow = function (ev) {
    let isContent = false;
    let tr = ev.target;
    let td = null;
    while (tr.nodeName != 'TR' && tr.nodeName != 'BODY') {
        if (tr.nodeName == 'TD') {
            td = tr;
            isContent = true;
        }
        tr = tr.parentNode;
    }

    return {
        tr: tr,
        td: td,
        nodeName: tr.nodeName,
        isContent: isContent,
        isHoverRow: tr == this.hoverRow,
        isFocusRow: tr == this.focusRow,
        isExcludedRow: this.excludedRows.has(Number.parseInt(tr.getAttribute('index')))
    };
}

HTMLTableElement.prototype.__initializeAllRows = function() {

    let rows = 0;

    for (let tr of this.tBodies[0].children) {
        if (tr.firstElementChild != null && tr.style.display != 'none') {
            if (tr.firstElementChild.nodeName == 'TD') {
                tr.className = rows % 2 == 0 ? this.rowClass : this.alternativeRowClass;
                tr.setAttribute("index", rows);
                rows++;
            }
        }
    }

    if (this.exclusions != '') {
        this.excludedRows = new Set(this.exclusions.replace(/n/ig, rows - 1).split(',').map(e => eval(e)));
    }
}

HTMLTableElement.clearFilter = function(tr, columnName) {
    //在meet中去掉
    if (tr.getAttribute("filter-meet") != null) {
        if (tr.getAttribute('filter-meet') == '(' + columnName + ')') {
            tr.removeAttribute('filter-meet');
        }
        else {
            tr.setAttribute('filter-meet', tr.getAttribute('filter-meet').replace('(' + columnName + ')', ''));
        }
    }
    //在miss中去掉
    if (tr.getAttribute("filter-miss") != null) {
        if (tr.getAttribute('filter-miss') == '(' + columnName + ')') {
            tr.removeAttribute('filter-miss');
        }
        else {
            tr.setAttribute('filter-miss', tr.getAttribute('filter-miss').replace('(' + columnName + ')', ''));
        }
    }

    if (tr.getAttribute('filter-miss') == null) {
        tr.style.display = '';
    }
}

HTMLTableElement.prototype.__initializeSettings = function () {

    for (let child of this.children) {
        if (child.nodeName == 'COLGROUP') {
            let i = 0;
            for (let col of child.children) {
                if (col.name == '') {
                    col.name = this.id + '_' + i;
                }
                col.index = i;
                if (col.editable) {
                    col.editor = new Editor(col).apply('#' + (col.parentNode.nodeName == 'COLGROUP' ? col.parentNode.parentNode.id : col.parentNode.id) + ' tbody td:nth-child(' + (i + 1) + ')');
                }

                this.cols[i] = col;                
                i += col.span;
            }
        }        
        else if (child.nodeName == 'THEAD') {
            if (child.children.length > 0) {
                child.children[0].className = this.headerClass;
            }            
        }
        else if (child.nodeName == 'TFOOT') {
            if (child.children.length > 0) {
                child.children[0] = this.footerClass;
            }            
        }
        else if (child.nodeName == 'CAPTION') {
            child.className = this.captionClass;
        }
    }
    
    //filter or sorting
    let table = this;    
    for (let i = 0; i < this.cols.length; i++) {
        let col = this.cols[i];
        if (col.filterable && col.sortable) {
            //筛选和排序 - 下拉菜单(PC) 或弹出框(Mobile)
            //暂时不支持
        }
        else if (col.filterable) {
            //仅筛选 - 直接输入或下拉菜单或弹出框 - 支持输入和选择两种模式
            //以下是需要整合的代码        
            let th = this.tHead.rows[0].cells[col.index];
            //let span = $create('SPAN', {}, { borderRight: '2px solid var(--primary)', borderBottom: '2px solid var(--primary)', width: '5px', height: '5px', display: 'inline-block', transform: 'rotate(45deg)', margin: '0px 0px 2px 6px' });
            let ficn = $create('I', { className: 'iconfont icon-filter f14' }, { marginLeft: '5px' });
            let sicn = $create('I', { className: 'iconfont icon-sousuo f14' }, { marginLeft: '-20px' });
            let cicn = $create('I', { className: 'iconfont icon-quxiao f14' }, { marginLeft: '5px' });
            let input = $create('INPUT', { value: th.getAttribute('filter') != null ? th.getAttribute('filter') : '', size: th.textContent.$length(4) }, { borderWidth: '0px', fontWeight: 'inherit', backgroundColor: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', color: '#666666' });

            th.title = th.textContent;
            th.appendChild(ficn);

            input.onkeydown = function(ev) {
                if (ev.keyCode == 13) {
                    this.blur();
                }
                else if (ev.keyCode == 27) {
                    this.blur();
                }
                else {
                    this.size = this.value.$length(4);
                }
            }

            input.onblur = function(ev) {
                let changed = this.value != this.defaultValue;
                let text = this.value;
                if (changed) {
                    //do filter
                    //在table上保存当前过滤词, 目的是data属性可用
                    table.setAttribute(col.name, text);
                    //清除所有通过数据源加载的行
                    if (table.reloadOnFilterOrSorting) {
                        table.clear();
                    }
                    //过滤剩下的行
                    //在tr上增加filter-meet="(column-name)(column-name)"和filter-miss="(column-name)"属性
                    if (table.tBodies[0].children.length > 0) {
                        for (let i = table.tBodies[0].children.length - 1; i >= 0; i--) {
                            let tr = table.tBodies[0].children[i];
                            //清除过滤词
                            if (text == '') {
                                DataTable.clearFilter(tr, col.name);
                                table.execute('onfiltercancel');
                            }
                            //添加或替换过滤词
                            else {
                                if (tr.cells[col.index].textContent.includes(text)) {
                                    //在meet中增加
                                    if (tr.getAttribute("filter-meet") == null) {
                                        tr.setAttribute('filter-meet', '(' + col.name + ')');
                                    }
                                    else if (!tr.getAttribute('filter-meet').includes('(' + col.name + ')')) {
                                        tr.setAttribute('filter-meet', tr.getAttribute('filter-meet') + '(' + col.name + ')');
                                    }   
                                    //从miss中去掉
                                    if (tr.getAttribute("filter-miss") != null) {
                                        if (tr.getAttribute('filter-miss') == '(' + col.name + ')') {
                                            tr.removeAttribute('filter-miss');                                            
                                        }
                                        else {
                                            tr.setAttribute('filter-miss', tr.getAttribute('filter-miss').replace('(' + col.name + ')', ''));
                                        }
                                    }

                                    if (tr.getAttribute('filter-miss') == null) {
                                        tr.style.display = '';
                                    }
                                }
                                else {
                                    //从meet中去掉
                                    if (tr.getAttribute("filter-meet") != null) {
                                        if (tr.getAttribute('filter-meet') == '(' + col.name + ')') {
                                            tr.removeAttribute('filter-meet');
                                        }
                                        else {
                                            tr.setAttribute('filter-meet', tr.getAttribute('filter-meet').replace('(' + col.name + ')', ''));
                                        }
                                    }
                                    
                                    //在miss中增加
                                    if (tr.getAttribute("filter-miss") == null) {
                                        tr.setAttribute('filter-miss', '(' + col.name + ')');
                                    }
                                    else if (!tr.getAttribute('filter-miss').includes('(' + col.name + ')')) {
                                        tr.setAttribute('filter-miss', tr.getAttribute('filter-miss') + '(' + col.name + ')');
                                    }

                                    tr.style.display = 'none';
                                }
                            }
                        }
                    }

                    table.execute('onfilter');

                    //设置行样式或加载数据后设置行样式
                    if (table.data == '') {
                        table.__initializeSettings();
                    }
                    else if (table.reloadOnFilterOrSorting) {
                        table.load();
                    }
                    //保存当前的过滤词
                    th.setAttribute('filter', text);
                }                
                th.innerHTML = '';
                th.innerHTML = text == '' ? th.title : text;
                th.appendChild(text == '' ? ficn : cicn);
                col.filtering = false;
            }

            th.ondblclick = function(ev) {
                if (!col.filtering) {
                    th.innerHTML = '';
                    th.appendChild(input);
                    th.appendChild(sicn);
                    col.filtering = true;
                    //filter属性保存当前使用的过滤词
                    if (th.getAttribute('filter') != null) {
                        th.firstChild.value = th.getAttribute('filter');
                    }
                    th.firstChild.focus();
                }                
            } 
            
            cicn.onclick = function(ev) {

                //在table上保存当前过滤词, 目的是data属性可用
                table.setAttribute(col.name, '');
                //清除所有通过数据源加载的行
                if (table.reloadOnFilterOrSorting) {
                    table.clear();
                }

                for (let i = table.tBodies[0].children.length - 1; i >= 0; i--) {
                    DataTable.clearFilter(table.tBodies[0].children[i], col.name);                    
                }
                
                table.execute('onfiltercancel');

                //设置行样式或加载数据后设置行样式
                if (table.data == '') {
                    table.__initializeSettings();
                }
                else if (table.reloadOnFilterOrSorting) {
                     table.load();
                }
                //保存当前的过滤词
                th.setAttribute('filter', '');
                th.innerHTML = '';
                th.innerHTML = th.title;
                th.appendChild(ficn);

                //阻止冒泡
                ev.preventDefault();
                ev.stopPropagation();

                return false;
            }

            if (col.filterOptions != '') {                
                th.onmouseover = function(ev) {

                }
            }        
        }
        else if (col.sortable) {
            //仅排序 - 点击或下拉菜单或弹出框 - 无排序/正序/倒序
            let th = this.tHead.rows[0].cells[col.index];
            th.title = 'Click to Sort';
            th.style.cursor = 'pointer';
            //th.style.textDecoration = 'underline';

            th.onclick = function() {
                let sorting = this.getAttribute('sorting') || '';
                if (sorting == '' || sorting == 'desc') {
                    sorting = 'asc';
                }
                else {
                    sorting = 'desc';
                }

                let data = Array.from(table.rows)
                                .filter(tr => tr.cells[0].nodeName == 'TD')
                                .map(tr => { 
                                    let v = tr.cells[col.index].textContent;
                                    if (v.isNumberString() || v.isTimeString()) {
                                        v = v.toFloat(0);
                                    }
                                    return { row: tr.rowIndex, score: v };
                                })
                                ['$' + sorting]('score') //do sort
                                .map(item => item.row);

                let order = Array.from(data).$asc();
                for (let i = 0; i < data.length; i++) {
                    if (data[i] > order[i]) { //只有大于一种情况
                        table.tBodies[0].insertBefore(table.rows[data[i]], table.rows[order[i]]);
                        if (data[i] - order[i] > 1) {
                            if (data[i] == table.rows.length - 1) {
                                table.tBodies[0].appendChild(table.rows[order[i] + 1]);
                            }
                            else {
                                table.tBodies[0].insertBefore(table.rows[order[i] + 1], table.rows[data[i] + 1]);
                            }
                        }                
                        for (let j = i + 1; j < data.length; j++) {
                            if (data[j] == order[i]) {
                                data[j] = data[i];
                                break;
                            }
                        }
                        data[i] = order[i];
                    }
                }

                for (let i = 0; i < this.parentNode.children.length; i++) {
                    let h = this.parentNode.children[i];
                    if (h.lastElementChild != null && h.lastElementChild.nodeName == 'I') {
                        h.removeChild(h.lastElementChild); //I
                        //h.removeChild(h.lastElementChild); //SPAN
                    }
                }
                this.setAttribute('sorting', sorting);
                //this.appendChild($create('SPAN', { innerHTML: '&nbsp;' }));
                this.appendChild($create('I', { className: 'iconfont icon-sort-' + sorting + 'ending' }, { fontWeight: 'normal' }));
            }
        }               
    }
}

HTMLTableElement.prototype.__formatCellData = function(row) {
    for (let i = 0; i < this.cols.length; i++) {
        let col = this.cols[i];
        if (col.map != null) {            
            let data = row.cells[col.index].innerHTML;
            if (row.cells[col.index].getAttribute('formatted') == null && col.map[data] != null) {
                row.cells[col.index].innerHTML = col.map[data];
                row.cells[col.index].setAttribute('formatted');
            }
        }
    }
}

HTMLTableElement.prototype.__formatAllCellData = function() {
    //初始化列的值
    for (let i = 0; i < this.cols.length; i++) {
        let col = this.cols[i];
        if (col.map != null) {
            for (let row of this.rows) {
                let data = row.cells[col.index].innerHTML;
                if (row.cells[col.index].getAttribute('formatted') == null && col.map[data] != null) {
                    row.cells[col.index].innerHTML = col.map[data];
                    row.cells[col.index].setAttribute('formatted', '');
                }                
            }
        }
    }
}

HTMLTableElement.prototype.clear = function() {
    for (let i = this.tBodies[0].children.length - 1; i >= 0; i--) {
        let element = this.tBodies[0].children[i];
        if (element.getAttribute('irremovable') == null) {
            element.remove();
        }        
    }
}

//添加新行 Object row as list
HTMLTableElement.prototype.append = function(row) {
    this.template
        .setData([row])
        .load(function(data) {
            this.__initializeAllRows();
            this.__formatCellData(row);
        });    
}

HTMLTableElement.prototype.load = function() {
     //数据格式未实现
    // #{name}
    // #{0}
    // #{name:0.00}
    // #{name:0:00%}
    // #{name:yyyMMdd}
    this.template
        .setData(this.data)
        .asArray()
        .load(function(data) {
            //主要是设置样式
            this.__initializeAllRows();
                    
            if (!this.loaded) {
                //仅第一次加载初始化设置
                this.__initializeSettings();
                //第一次加载执行事件
                this.execute('onload');
                this.loaded = true;
            }
            else {
                //reload执行事件
                this.execute('onreload');
            }
            
            this.__formatAllCellData();
        });   
}

HTMLTableElement.prototype.reload = function() {
    this.clear();
    this.load();
}

$enhance(HTMLTableColElement.prototype)
    .declare({
        name: '',
        editable: false,
        filterable: false,
        filterStyle: Enum('INPUT', 'LIST'), //PC模式下是下拉菜单, MOBILE模式下是弹出框
        sortable: false,
        sortingStyle: Enum('LINK', 'LIST'),
        map: function(value) {
            return value != null ? value.toMap() : null;
        },
        index: -1
    });

    //this.defaultClass = col.getAttribute('defaultClass') || '';
    //this.hoverClass = col.getAttribute('hoverClass') || '';
    //this.activeClass = col.getAttribute('activeClass') || '';
    //this.focusClass = col.getAttribute('focusClass') || '';

    //this.hoverCellClass = col.getAttribute('hoverCellClass') || '';
    //this.activeCellClass = col.getAttribute('activeCellClass') || '';
    //this.focusCellClass = col.getAttribute('focusCellClass') || '';
    //this.editingCellClass = col.getAttribute('editingCellClass') || '';

    //通过 table[name=1,2,3] 来设置初始过滤器
    //无选项的filterable 编辑文本来进行过滤
    //有选项的filterable 下拉菜单进行过滤
    //this.filterOptions = col.getAttribute("filterOptions") || '';
    //通过 table[name=az,za] 来设置初始初始排序
    //this.sortingOptions = col.getAttribute("sortingOptions") || { 'asc' : 'az', 'desc': 'za' };
    //search 即通过编辑表头文字来进行筛选

HTMLTableColElement.prototype.filtering = false;
HTMLTableColElement.prototype.sorting = false;
HTMLTableColElement.prototype.editor = null;

$finish(function () {
    for (let table of $a('table[data]')) {
        // root 设置为 button 表示组件已初始化
        if (table.getAttribute('root') == null) {
            table.setAttribute('root', 'TABLE');
            table.initialize();
        }
    }
});