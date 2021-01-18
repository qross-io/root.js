

/*
    <table id="" datatable="Boolean" data="URL"
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

    //原本无数据，从接口加载部分数据(分页), 排序和过滤时重新加载

    ## Idea ##
    能获取到表格内的数据或者原始Json数据   dataTable.rows[i].cells[i].data
    多选 - CheckList, focusRows
    拖动排序 - 可能适用于FocusView

    statusColumnClass
    statusCellClass
    enable()
    disable()

    this.imagesBaseUrl = table.getAttribute('imagesBaseUrl') || $root.home + 'images/';
    //this.searchImageUrl = table.getAttribute('searchImageUrl') || 'search.png';
    //this.pickerImageUrl = table.getAttribute('pickerImageUrl') || 'picker.png';
    this.ascImageUrl = table.getAttribute('ascImageUrl') || 'asc.png';
    this.descImageUrl = table.getAttribute('descImageUrl') || 'desc.png';
*/

DataTable = function(element) {

    $initialize(this)
    .with(element)
    .declare({
        name: 'DataTable_' + document.components.size,

        exclusions: '', //0, n
        
        captionClass: '', //caption
        headerClass: '', //thead
        footerClass: '', //tfoot        
        rowClass: '',
        alternativeRowClass: '',
        hoverRowClass: '',
        activeRowClass: '',
        focusRowClass: '',

        //hoverColumnClass: '',
        //activeColumnClass: '',
        //focusColumnClass: '',

        //hoverCellClass: '',
        //activeCellClass: '',
        //focusCellClass: '',
        //editingCellClass: '',

        tBodyIndex: 0, //默认的tbody容器索引
        data: '',
        path: '',
        template: '',

        reloadOnFilterOrSorting: false, //如果为true, 则到后端请求数据, 如果为false, 则仅在前端过滤和筛选

        onrowhover: function(row) { },
        onrowleave: function(row) { },
        onrowfocus: function(row) { },
        onrowblur: function(row) { },
        onrowdblclick: function(row) { },
        onrowremove: function(row) { },
        onload: function() { },
        onreload: function() { },
        onfilter: function() {},
        onsort: function() {},
        onfiltercancel: function() {}
    })
    .elementify(element => {
        this.table = element;
    });

    if (this.table.querySelector('template') != null) {
        this.template = new Template(this.table.querySelector('template'), this.table.tBodies[this.tBodyIndex])
                            .of(this, this.table)
                            .asArray();
    }

    //表格的列，与原生的cols区分
    this.columns = new Object();
}

$table = function(name) {
    let table = $t(name);
    if (table != null && table.tagName == 'DATATABLE') {
        return table;
    }
    else {
        return null;
    }
}

DataTable.prototype.table = null;

DataTable.prototype.excludedRows = new Set();
DataTable.prototype.hoverRow = null;
//DataTable.prototype.hoverColumn = -1;
//TR
DataTable.prototype.focusRow = null;
//DataTable.prototype.focusRows = new Array();
//DataTable.prototype.focusColumn = -1;
//数据源数据是否已经加载完成
DataTable.prototype.loaded = false;

DataTable.prototype.apply = function(table) {

    if(table != null) {
        this.table = typeof(table) == 'string' ? $s(table) : table;
    }
    
    if (this.table == null) {
        throw new Error('Must specify a table element.');
    }

    if (this.table.tBodies.length == 0) {
        this.table.appendChild($create('TBODY'));        
    }

    if (this.data == '') {
        this.__initializeSettings();
        this.__initializeAllRows();
        this.loaded = true;

        this.execute('onload');
    }
    else {
        this.load();
    }

    if (typeof (this.reloadOnFilterOrSorting) != 'boolean') {
        this.reloadOnFilterOrSorting = $parseBoolean(this.reloadOnFilterOrSorting, false);
    }

    let dataTable = this;
    $x(this.table)
        .bind('mouseover', function (ev) { dataTable.hover(ev); })
        .bind('mouseout', function (ev) { dataTable.leave(ev); })
        .bind('mousedown', function (ev) { dataTable.active(ev); })
        .bind('mouseup', function (ev) { dataTable.focus(ev); })
        .bind('dblclick', function (ev) { dataTable.dblclick(ev); });
    
}

DataTable.prototype.hover = function (ev) {

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

DataTable.prototype.leave = function (ev) {
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

DataTable.prototype.active = function (ev) {
    let row = this.__bubbleRow(ev);
    if (row.nodeName == 'TR' && row.isContent && !row.isExcludedRow && !row.isFocusRow) {
        row.tr.className = this.activeRowClass;
    }
}

DataTable.prototype.focus = function (ev) {
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

DataTable.prototype.dblclick = function (ev) {
    let row = this.__bubbleRow(ev);
    if (row.nodeName == 'TR' && row.isContent && !row.isExcludedRow) {
        this.execute('onrowdblclick', row.tr);
    }
}

DataTable.prototype.remove = function(row) {
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

DataTable.prototype.__bubbleRow = function (ev) {
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

DataTable.prototype.__initializeAllRows = function() {

    let rows = 0;

    for (let tr of this.table.tBodies[0].children) {
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

DataTable.clearFilter = function(tr, columnName) {
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

DataTable.prototype.__initializeSettings = function () {

    for (let child of this.table.children) {
        if (child.nodeName == 'COLGROUP') {
            let i = 0;
            for (let col of child.children) {
                for (let j = 0; j < col.span; j++) {
                    let name = col.getAttribute('name') || this.name + '_' + i;
                    this.columns[name] = new DataColumn(name, i, col);
                    i++;
                }
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
    let dataTable = this;    
    for (let name in this.columns) {
        let column = this.columns[name];

        if (column.filterable && column.sortable) {
            //筛选和排序 - 下拉菜单(PC) 或弹出框(Mobile)
            //暂时不支持
        }
        else if (column.filterable) {
            //仅筛选 - 直接输入或下拉菜单或弹出框 - 支持输入和选择两种模式
            //以下是需要整合的代码        
            let th = this.table.tHead.rows[0].cells[column.index];
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
                    dataTable.table.setAttribute(column.name, text);
                    //清除所有通过数据源加载的行
                    if (dataTable.reloadOnFilterOrSorting) {
                        dataTable.clear();
                    }
                    //过滤剩下的行
                    //在tr上增加filter-meet="(column-name)(column-name)"和filter-miss="(column-name)"属性
                    if (dataTable.table.tBodies[0].children.length > 0) {
                        for (let i = dataTable.table.tBodies[0].children.length - 1; i >= 0; i--) {
                            let tr = dataTable.table.tBodies[0].children[i];
                            //清除过滤词
                            if (text == '') {
                                DataTable.clearFilter(tr, column.name);
                                dataTable.execute('onfiltercancel');
                            }
                            //添加或替换过滤词
                            else {
                                if (tr.cells[column.index].textContent.includes(text)) {
                                    //在meet中增加
                                    if (tr.getAttribute("filter-meet") == null) {
                                        tr.setAttribute('filter-meet', '(' + column.name + ')');
                                    }
                                    else if (!tr.getAttribute('filter-meet').includes('(' + column.name + ')')) {
                                        tr.setAttribute('filter-meet', tr.getAttribute('filter-meet') + '(' + column.name + ')');
                                    }   
                                    //从miss中去掉
                                    if (tr.getAttribute("filter-miss") != null) {
                                        if (tr.getAttribute('filter-miss') == '(' + column.name + ')') {
                                            tr.removeAttribute('filter-miss');                                            
                                        }
                                        else {
                                            tr.setAttribute('filter-miss', tr.getAttribute('filter-miss').replace('(' + column.name + ')', ''));
                                        }
                                    }

                                    if (tr.getAttribute('filter-miss') == null) {
                                        tr.style.display = '';
                                    }
                                }
                                else {
                                    //从meet中去掉
                                    if (tr.getAttribute("filter-meet") != null) {
                                        if (tr.getAttribute('filter-meet') == '(' + column.name + ')') {
                                            tr.removeAttribute('filter-meet');
                                        }
                                        else {
                                            tr.setAttribute('filter-meet', tr.getAttribute('filter-meet').replace('(' + column.name + ')', ''));
                                        }
                                    }
                                    
                                    //在miss中增加
                                    if (tr.getAttribute("filter-miss") == null) {
                                        tr.setAttribute('filter-miss', '(' + column.name + ')');
                                    }
                                    else if (!tr.getAttribute('filter-miss').includes('(' + column.name + ')')) {
                                        tr.setAttribute('filter-miss', tr.getAttribute('filter-miss') + '(' + column.name + ')');
                                    }

                                    tr.style.display = 'none';
                                }
                            }
                        }
                    }

                    dataTable.execute('onfilter');

                    //设置行样式或加载数据后设置行样式
                    if (dataTable.data == '') {
                        dataTable.__initializeSettings();
                    }
                    else if (dataTable.reloadOnFilterOrSorting) {
                        dataTable.load();
                    }
                    //保存当前的过滤词
                    th.setAttribute('filter', text);
                }                
                th.innerHTML = '';
                th.innerHTML = text == '' ? th.title : text;
                th.appendChild(text == '' ? ficn : cicn);
                column.filtering = false;
            }

            th.ondblclick = function(ev) {
                if (!column.filtering) {
                    th.innerHTML = '';
                    th.appendChild(input);
                    th.appendChild(sicn);
                    column.filtering = true;
                    //filter属性保存当前使用的过滤词
                    if (th.getAttribute('filter') != null) {
                        th.firstChild.value = th.getAttribute('filter');
                    }
                    th.firstChild.focus();
                }                
            } 
            
            cicn.onclick = function(ev) {

                //在table上保存当前过滤词, 目的是data属性可用
                dataTable.table.setAttribute(column.name, '');
                //清除所有通过数据源加载的行
                if (dataTable.reloadOnFilterOrSorting) {
                    dataTable.clear();
                }

                for (let i = dataTable.table.tBodies[0].children.length - 1; i >= 0; i--) {
                    DataTable.clearFilter(dataTable.table.tBodies[0].children[i], column.name);                    
                }
                
                dataTable.execute('onfiltercancel');

                //设置行样式或加载数据后设置行样式
                if (dataTable.data == '') {
                    dataTable.__initializeSettings();
                }
                else if (dataTable.reloadOnFilterOrSorting) {
                     dataTable.load();
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

            if (column.filterOptions != '') {                
                th.onmouseover = function(ev) {

                }
            }        
        }
        else if (column.sortable) {
            //仅排序 - 点击或下拉菜单或弹出框 - 无排序/正序/倒序
            let th = this.table.tHead.rows[0].cells[column.index];
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

                let data = Array.from(dataTable.table.rows)
                                .filter(tr => tr.cells[0].nodeName == 'TD')
                                .map(tr => { 
                                    let v = tr.cells[column.index].textContent;
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
                        dataTable.table.tBodies[dataTable.tBodyIndex].insertBefore(dataTable.table.rows[data[i]], dataTable.table.rows[order[i]]);
                        if (data[i] - order[i] > 1) {
                            if (data[i] == dataTable.table.rows.length - 1) {
                                dataTable.table.tBodies[dataTable.tBodyIndex].appendChild(dataTable.table.rows[order[i] + 1]);
                            }
                            else {
                                dataTable.table.tBodies[dataTable.tBodyIndex].insertBefore(dataTable.table.rows[order[i] + 1], dataTable.table.rows[data[i] + 1]);
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

DataTable.prototype.clear = function() {
    for (let i = this.table.tBodies[this.tBodyIndex].children.length - 1; i >= 0; i--) {
        this.table.tBodies[this.tBodyIndex].children[i].remove();        
    }
}

//添加新行 Object row as list
DataTable.prototype.append = function(row) {
    this.template
        .load([row])
        .append(function(data) {
            this.__initializeAllRows();
        });    
}

DataTable.prototype.load = function(data, path) {

    if (data != null) {
        this.data = data;
    }
    if (path != null) {
        this.path = path;
    }

     //数据格式未实现
    // #{name}
    // #{0}
    // #{name:0.00}
    // #{name:0:00%}
    // #{name:yyyMMdd}
    this.template
        .load(this.data, this.path)
        .asArray()
        .append(function(data) {
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
        });   
}

DataTable.prototype.reload = function() {
    this.clear();
    this.load();
}

DataColumn = function (name, index, col) {

    this.name = name;
    this.index = index; //columnIndex
    this.col = col;
    
    //this.defaultClass = col.getAttribute('defaultClass') || '';
    //this.hoverClass = col.getAttribute('hoverClass') || '';
    //this.activeClass = col.getAttribute('activeClass') || '';
    //this.focusClass = col.getAttribute('focusClass') || '';

    //this.hoverCellClass = col.getAttribute('hoverCellClass') || '';
    //this.activeCellClass = col.getAttribute('activeCellClass') || '';
    //this.focusCellClass = col.getAttribute('focusCellClass') || '';
    //this.editingCellClass = col.getAttribute('editingCellClass') || '';

    $initialize(this)
        .with(col)
        .declare({
            filterable: false,
            filterStyle: Enum('INPUT', 'LIST'), //PC模式下是下拉菜单, MOBILE模式下是弹出框
            sortable: false,
            sortingStyle: Enum('LINK', 'LIST')
        });

    //通过 datatable[name=1,2,3] 来设置初始过滤器
    //无选项的filterable 编辑文本来进行过滤
    //有选项的filterable 下拉菜单进行过滤
    //this.filterOptions = col.getAttribute("filterOptions") || '';
    //通过 datatable[name=az,za] 来设置初始初始排序
    //this.sortingOptions = col.getAttribute("sortingOptions") || { 'asc' : 'az', 'desc': 'za' };
    //search 即通过编辑表头文字来进行筛选
    
    this.editor = this.col.getAttribute('editable') == null ? null : 
        new Editor(this.col).apply('#' + (col.parentNode.nodeName == 'COLGROUP' ? col.parentNode.parentNode.id : col.parentNode) + ' tr td:nth-child(' + (this.index + 1) + ')');
} 

DataColumn.prototype.filtering = false;
DataColumn.prototype.sorting = false;

DataTable.apply = function (table) {

    if (typeof (table) == 'string') {
        table = $s(table);
    }

    if (table.nodeName != null && table.nodeName == 'TABLE') {
        if (table.getAttribute('root') == null) {
            table.setAttribute('root', 'datatable');

            new DataTable(table).apply(table);
        }
    }
    else {
        throw new Error('DataTable only can be apply TABLE element.');
    }
}

DataTable.initializeAll = function () {
    let tables = document.querySelectorAll('table[dataTable]');
    for (let table of tables) {
        if (table.getAttribute('root') == null) {
            DataTable.apply(table);        
        }
    }
}

$finish(function () {
    DataTable.initializeAll();
});