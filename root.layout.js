
Layout = {};

Layout.layPanel = function(panel) {
    panel.classList.add('panel');
    panel.style.width = (panel.getAttribute('width') || '330') + 'px';
    if (panel.getAttribute('height') != null) {
        panel.style.height = panel.getAttribute('height') + 'px';
    }    
}

Layout.layJustify = function(justify) {
    justify.classList.add('justify');
}

Layout.initializeAll = function() {
    $a('div[display]').forEach(p => {
        let display = p.getAttribute('display');
        switch(display) {
            case 'panel':
                Layout.layPanel(p);
                break;
            case 'justify':
                Layout.layJustify(p);
                break;
        }        
    });
}

$finish(function() {
    Layout.initializeAll();
});