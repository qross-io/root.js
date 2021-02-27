
Layout = {};

Layout.layPanel = function(panel) {
    panel.classList.add('panel');
    panel.style.width = (panel.getAttribute('width') || '330') + 'px';
    if (panel.getAttribute('height') != null) {
        panel.style.height = panel.getAttribute('height') + 'px';
    }    
}

Layout.initializeAll = function() {
    $a('div[display=panel]').forEach(p => {
        Layout.layPanel(p);
    });
}

$finish(function() {
    Layout.initializeAll();
});