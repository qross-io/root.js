
HTMLDivElement.layPanel = function(panel) {
    panel.classList.add('panel');
    panel.style.width = (panel.getAttribute('width') || '330') + 'px';
    if (panel.getAttribute('height') != null) {
        panel.style.height = panel.getAttribute('height') + 'px';
    }    
}

HTMLDivElement.layJustify = function(justify) {
    justify.classList.add('justify');
}

HTMLDivElement.layColumn = function(frame) {
    frame.classList.add('column');
    for (let div of frame.children) {
        div.style.width = 'calc(' + div.getAttribute('width') + ')';
        /* width:calc(40% - 15px);
        width:calc(60% - 15px); */
    }
}

HTMLDivElement.initializeAll = function() {
    $$('div[display]').forEach(p => {
        switch(p.getAttribute('display')) {
            case 'panel':
                HTMLDivElement.layPanel(p);
                break;
            case 'justify':
                HTMLDivElement.layJustify(p);
                break;
            case 'column':
                HTMLDivElement.layColumn(p);
        }        
    });
}

document.on('post', function() {
    HTMLDivElement.initializeAll();
});