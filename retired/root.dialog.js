/*
if (root.confirm("sure?"))
root.alert('Deny!');
val x = root.prompt("Please input your name.");
*/

$root.alert = function(message, confirmText = 'OK') {

    if ($s('#AlertPopup') == null) {
        let div = $create('DIV', { 'id': 'AlertPopup', className: 'popup' }, {}, { 'position': 'center,middle', 'offsetY': -100, 'maskColor': '#999999', animation: 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;' });
        div.appendChild($create('DIV', { id: 'AlertPopup_CloseButton', className: 'popup-close-button', innerHTML: '<i class="iconfont icon-quxiao"></i>' }));
        div.appendChild($create('DIV', { className: 'popup-bar', innerHTML: '<i class="iconfont icon-tixingshixin"></i> &nbsp; Message' }));
        div.appendChild($create('DIV', { id: 'AlertContent', className: 'popup-title' }, { textAlign: 'center', color: 'var(--primary)' }));
        div.appendChild($create('DIV', { className: 'popup-button', innerHTML: '<input id="AlertPopup_ConfirmButton" type="button" class="normal-button prime-button" value="' + confirmText + '">' }));
        document.body.appendChild(div);

        Popup.apply($s('#AlertPopup'));
    }

    $x('#AlertContent').html(message == null ? 'null' : message);
    $x('#AlertPopup_ConfirmButton').value(' ' + confirmText + ' ');
    $popup('AlertPopup').open();
}

$root.confirm = function(message, confirmText = 'OK', cancelText = 'Cancel', title = 'Confirm', ev = null) {

    if ($s('#ConfirmPopup') == null) {
        let div = $create('DIV', { 'id': 'ConfirmPopup', className: 'popup' }, {}, { 'position': 'center,middle', offsetY: -100, 'maskColor': '#999999', animation: 'timing-function: ease; duration: 0.6s; from: x(0).y(100) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;' });
        div.appendChild($create('DIV', { id: 'ConfirmPopup_CloseButton', className: 'popup-close-button', innerHTML: '<i class="iconfont icon-quxiao"></i>' }));
        div.appendChild($create('DIV', { className: 'popup-bar', innerHTML: '<i class="iconfont icon-tixingshixin"></i> &nbsp; <span id="ConfirmPopupTitle"></span>' }));
        div.appendChild($create('DIV', { id: 'ConfirmContent', className: 'popup-title error' }, { textAlign: 'center' }));
        div.appendChild($create('DIV', { className: 'popup-button', innerHTML: '<input id="ConfirmPopup_ConfirmButton" type="button" class="normal-button prime-button" value="' + confirmText +'"> &nbsp; &nbsp; <input id="ConfirmPopup_CancelButton" type="button" class="normal-button gray-button" value="' + cancelText + '">' }));
        document.body.appendChild(div);

        let w= Math.max($x('#ConfirmPopup_ConfirmButton').width(), $x('#ConfirmPopup_CancelButton').width());
        $x('#ConfirmPopup_ConfirmButton').width(w);
        $x('#ConfirmPopup_CancelButton').width(w);

        Popup.apply($s('#ConfirmPopup'));
    }

    $x('#ConfirmContent').html(message == null ? 'null' : message);
    $x('#ConfirmPopupTitle').html(title);
    $x('#ConfirmPopup_ConfirmButton').value(' ' + confirmText + ' ');
    $x('#ConfirmPopup_CancelButton').value(' ' + cancelText + ' ');
    $popup('ConfirmPopup').open(ev);
    return $popup('ConfirmPopup');
}

//$root.prompt().on('confirm', function(text) { })
$root.prompt = function(message, confirmText = 'OK', concelText = 'Cancel') {
    //return this.propmpText;
}