
class DateTimePicker {
    constructor(element) {

        $initialize(this)
        .with(element)
        .declare({
            name: 'DateTimePicker_' + document.components.size,
            title: '',
            tip: '',

            onpick: ''
        })
        .elementify(element => {
            this.element = element;
            this.nodeName = this.element.nodeName;            
        });
    }

    get value() {
        if (this.nodeName == 'INPUT') {
            return this.element.value;
        }
        else {
            return this.element.innerHTML;
        }
    }

    set value(value) {
        if (this.nodeName == 'INPUT') {
            this.element.value = value;
        }
        else {
            this.element.innerHTML = value;
        }
    }
}

DateTimePicker.prototype.apply = function() {

    let id = this.id;

    if (this.value == 'now') {
        this.value = DateTime.now();
    }
    else if (this.value == 'today') {
        this.value = DateTime.today() + ' 00:00:00';
    }
    if (this.nodeName != 'INPUT') {
        this.element.insertAdjacentElement('afterEnd', $create('A', { 'id': id + 'Popup_OpenButton', href: 'javascript:void(0)', innerHTML: '<i class="iconfont icon-calendar"></i>'}));
    }    

    document.body.appendChild($create('DIV', { 'id': id + 'Popup', className: 'popup'}, { }, { popup: 'sidebar', position: 'right' }));
    $s('#' + id + 'Popup').innerHTML = `
        <div id="${id}Popup_CloseButton" class="popup-close-button"><i class="iconfont icon-close"></i></div>
        <div class="popup-bar"><i class="iconfont icon-calendar"></i> &nbsp; <span id="${id}PopupTitle">${this.title}</span></div>
        <div id="${id}Tip" class="popup-title">${this.tip}</div>
        <calendar id="${id}Calendar" date="today"></calendar>
        <div class="space10"></div>
        <clock id="${id}Clock" hour-interval="1" minute-interval="1" second-interval="1" option-frame-side="upside" value="00:00:00"></clock>
        <div class="space40">&nbsp;</div>
        <div class="popup-button"><button id="${id}Popup_ConfirmButton" class="normal-button prime-button w80">OK</button> &nbsp; &nbsp; &nbsp; <button id="${id}Popup_CancelButton" class="normal-button minor-button w80">Cancel</button></div>
    `;

    let popup = '#' + id + 'Popup';
    let calendar = '#' + id + 'Calendar';
    let clock = '#' + id + 'Clock';

    this.element.getAttributeNames()
        .forEach(attr => {
            if (attr.toLowerCase().startsWith('calendar-') && attr.toLowerCase() != 'calendar-mode') {
                $s(calendar).set(attr.replace(/^calendar-/i, ''), this.element.getAttribute(attr));
            }
            else if (attr.toLowerCase().startsWith('clock-')) {
                $s(clock).set(attr.replace(/^clock-/i, ''), this.element.getAttribute(attr));
            }
            else if (attr.toLowerCase().startsWith('popup-')) {
                $s(popup).set(attr.replace(/^popup-/i, ''), this.element.getAttribute(attr));
            }
        });

    if (Calendar != null) {
        new Calendar(document.querySelector(calendar)).display();
    }

    if (Clock != null) {
        new Clock(document.querySelector(clock)).display();
    }

    if (Popup != null) {
        Popup.apply(document.querySelector(popup));
    }

    $listen(id + 'Popup').on('confirm', function() {
        let el = $s('#' + id);
        let value = $s('#' + id + 'Calendar').value + ' ' + $s('#' + id + 'Clock').value;
        if (el.nodeName == 'INPUT') {
            el.value = value;
        }
        else {
            el.innerHTML = value;
        }
        Event.execute(id, 'onpick', value);
    });
}

DateTimePicker.initializeAll = function() {
    for (let dp of $a('input[type=datetime],span[type=datetime]')) {
        new DateTimePicker(dp).apply();
    }
}

document.on('post', function() {
    DateTimePicker.initializeAll();    
});