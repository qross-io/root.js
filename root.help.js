Help$prefix = window.location.hostname == 'localhost' ? 'http://localhost:8082/doc' : 'http://www.qross.cn/doc';
Help$initialize = function(a) {
    let url = a.getAttribute('help');
    if (url.startsWith('@')) {
        url = Help$prefix + url.substring(1);
    }
    let icon = a.getAttribute('icon');
    if (icon == null) {
        icon = 'question-circle';
    }
    if (icon != '') {
        a.insertAdjacentHTML('afterBegin', '<i class="iconfont icon-' + icon + '"></i> ');
    }    
    a.href = 'javascript:void(0)';
    a.onclick = function(ev) {
        if ($s('#HelpContentFrame').src != url) {
            $s('#HelpContentFrame').src = url;
        }
        let width = this.getAttribute('width')?.toInt(0);
        if (width > 0) {
            $s('#HelpPopup').width = width;
            $s('#HelpContentFrame').width = width;
        }        
        $('#HelpPopup').show();
    }
}

document.on('ready', function() {
    let popup = $create('DIV', { id: 'HelpPopup', className: 'popup-autosize', hidden: true }, { width: '500px', borderLeft: '1px solid #666666', boxShadow: '-2px -3px 4px #CCCCCC' }, { position: 'right', popup: 'sidebar', modal: 'no'});
    popup.innerHTML = `<div style="height: 100%; position: relative;">
                        <iframe id="HelpContentFrame" style="width: 500px; height: 100%; border-width: 0px; position: fixed; bottom:0%; right: 0%; top: 0%;"></iframe>
                    </div>`;
    document.body.appendChild(popup);
    Popup.apply(popup);

    $a('a[help]').forEach(a => {
        Help$initialize(a);
    });
});