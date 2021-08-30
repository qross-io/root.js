
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

HTMLDivElement.initializeAll = function() {
    $a('div[display]').forEach(p => {
        let display = p.getAttribute('display');
        switch(display) {
            case 'panel':
                HTMLDivElement.layPanel(p);
                break;
            case 'justify':
                HTMLDivElement.layJustify(p);
                break;
        }        
    });
}

document.on('post', function() {
    HTMLDivElement.initializeAll();
});