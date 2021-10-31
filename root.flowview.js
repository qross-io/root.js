/*

<flow-view width="" height="" node-data="" line-data="" popup="#Selector">
    <flow-node name="n1" text="" value="" shape="circle/rectangle/square/oval/rhombus/rounded-reactangle" border="" bgcolor=""></node>
    <flow-node name="n2" x="0" y="0"></node>
    <flow-node name="n3" x="100" y="200"></node>
    <flow-line from="n1" to="n2" shape="curve/straight" size="1" arrow="yes" text="success" value="success"></line>
</flow-view> 

*/

class HTMLFlowViewElement extends HTMLDivElement {

    get width() {
        return this.getAttribute('width');
    }

    set width(width) {
        this.setAttribute('width', width);
        this.style.width = width + (/^\d+$/.test(width) ? 'px' : '');
    }

    get height() {
        return this.getAttribute('height');
    }

    set height(height) {
        this.setAttribute('height', height);
        this.style.height = this.height + (/^\d+$/.test(height) ? 'px' : '');
    }

    get nodeData() {
        return this.getAttribte('node-data') ?? this.getAttribte('nodedata');
    }

    set nodeData(data) {
        this.setAttribute('node-data', data);
    }

    get lineData() {
        return this.getAttribte('line-data') ?? this.getAttribte('linedata');
    }
    
    set lineData(data) {
        this.setAttribute('line-data', data);
    }

    get readonly() {
        return this.getAttribute('readonly');
    }

    set readonly(readonly) {
        this.setAttribute('readonly', readonly);
    }
}

HTMLFlowViewElement.prototype.load = function() {

}

HTMLFlowViewElement.prototype.initialize = function() {

}

class HTMLFlowNodeElement extends HTMLElement {
    constructor() {
        this.hidden = true;
    }
}

class HTMLFlowLineElement extends HTMLElement {
    constructor() {
        this.hidden = true;
    }
}

window.customElements.define('flow-view', HTMLFlowViewElement);
window.customElements.define('flow-node', HTMLFlowNodeElement);
window.customElements.define('flow-line', HTMLFlowLineElement);

FlowView.initializeAll = function() {
    document.querySelectorAll('flow-view')
        .forEach(flowView => {
            if (!flowView.hasAttribute('root-flow-view')) {
                flowView.setAttribute('root-flow-view', '');
                flowView.initialize(); 
            }
        });
}

document.on('post', function() {
    HTMLTreeViewElement.initializeAll();
});