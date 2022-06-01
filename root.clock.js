
class Clock {
    constructor(elementOrSettings) {
        $initialize(this)
        .with(elementOrSettings)
        .declare({
            name: 'Clock_' + String.shuffle(7),
           
            $value: 'HH:mm:ss',

            //0表示只读，不可选择不可输入; 1表示可输入可选择; 大于0表示步长, 逗号分隔的列表表示枚举，可选择不可输入
            //为了避免错误，关闭了输入
            //3项都为 0 表示时钟
            hourInterval: '0', 
            minuteInterval: '0',
            secondInterval: '0',

            hourVisible: true,
            minuteVisible: true,
            secondVisible: true,

            //最小最大逻辑未实现，感觉必要性不大。需要动态生成下拉列表
            //minTime: '1970-01-01 00:00:00',
            //maxTime: '2100-12-31 23:59:59',
            //calendar: '',

            optionFrameAlign: 'center|left|right',
            optionFrameSide: 'downside|upside',

            frameClass: '-clock',
            hourClass: '-clock-hour',
            minuteClass: '-clock-minute',
            secondClass: '-clock-second',
            colonClass: '-clock-colon',

            optionFrameClass: '-clock-option-frame',
            optionClass: '-clock-option',
            checkedOptionClass: '-clock-checked-option'
        })
        .elementify(element => {
            this.container = $create('DIV', { className: this.frameClass }, { }, { sign: 'CLOCK-CONTAINER' });
            element.parentNode.insertBefore(this.container, element);

            element.remove();
        });

        if (this.minTime == 'now') {
            this.minTime = DateTime.now();
        }
        else if (this.minTime != '') {
            this.minTime = new DateTime(this.minTime);
        }
        if (this.maxTime == 'now') {
            this.maxTime = DateTime.now();
        }
        else if (this.maxTime != '') {
            this.maxTime = new DateTime(this.maxTime);
        }
    }    

    get tick() {
        return this.hourInterval == '0' && this.minuteInterval == '0' && this.secondInterval == '0';
    }

    get value() {
        return this.time;
    }

    get time() {
        return this.hourInput.value + ':' + this.minuteInput.value + ':' + this.secondInput.value;
    }

    set time(value) {
        let time = DateTime.now();
        this.hourInput.value = time.getHourString();
        this.minuteInput.value = time.getMinuteString();
        this.secondInput.value = time.getSecondString();

        if (/^\d+$/.test(value)) {
            this.hourInput.value = value;
            this.minuteInput.value = '00';
            this.secondInput.value = '00';
        }
        else if (value.includes(':')) {
            let hour = value.takeBefore(':');
            value = value.takeAfter(':');

            if (/^\d+$/.test(hour)) {
                this.hourInput.value = hour;
            }

            if (value.includes(':')) {
                let minute = value.takeBefore(':');
                let second = value.takeAfter(':');
                if (/^\d+$/.test(minute)) {
                    this.minuteInput.value = minute;
                }
                if (/^\d+$/.test(second)) {
                    this.secondInput.value = second;
                }
            }
            else if (/^\d+$/.test(value)) {
                this.minuteInput.value = value;
                this.secondInput.value = '00';
            }
        }

        if (this.hourInput.value.toInt() > 23) {
            this.hourInput.value = 23;
        }
        if (this.minuteInput.value.toInt() > 59) {
            this.minuteInput.value = 23;
        }
        if (this.secondInput.value.toInt() > 59) {
            this.secondInput.value = 23;
        }
    }

    get hour() {
        return this.hourInput.value.toInt();
    }

    set hour(hour) {
        if (hour < 0) {
            hour = 0;
        }
        if (hour > 23) {
            hour = 23;
        }

        this.hourInput.value = (hour < 10 ? '0' + hour : hour);
    }

    get minute() {
        return this.minuteInput.value.toInt();
    }

    set minute(minute) {
        if (minute < 0) {
            minute = 0;
        }
        if (minute > 59) {
            minute = 59;
        }

        this.minuteInput.value = (minute < 10 ? '0' + minute : minute);
    }

    get second() {
        return this.secondInput.value.toInt();
    }

    set second(second) {
        if (second < 0) {
            second = 0;
        }
        if (second > 59) {
            second = 59;
        }

        this.secondInput.value = (second < 10 ? '0' + second : second);
    }

    get hidden() {
        return this.container.hidden;
    }

    set hidden(value) {
        this.container.hidden = value;
    }
}

$clock = function(name) {
    let clock = $t(name);
    if (clock != null && clock.tagName == 'CLOCK') {
        return clock;
    }
    else {
        return null;
    }
}

Clock.prototype.hourInput = null;
Clock.prototype.minuteInput = null;
Clock.prototype.secondInput = null;
Clock.prototype.hourOptionFrame = null;
Clock.prototype.minuteOptionFrame = null;
Clock.prototype.secondOptionFrame = null;

Clock.prototype.onHourChanged = function(hour) {};
Clock.prototype.onMinuteChanged = function(minute) {};
Clock.prototype.onSecondChanged = function(second) {};
Clock.prototype.onTimeChanged = function(time) {};

Clock.prototype.getHourList = function() {

    let hours = [];
    if (this.hourInterval.includes(',')) {
        this.hourInterval.split(',')
            .map(hour => hour.trim().toInt())
            .forEach(hour => {
                hours.push(hour < 10 ? '0' + hour : hour);
            });
    }
    else {
        let step = this.hourInterval.toInt();
        for (i = 0; i <= 23; i += step) {
            hours.push(i < 10 ? '0' + i : i);
        }
    }

    return hours;
}

Clock.prototype.getMinuteList = function() {
    let minutes = [];
    if (this.minuteInterval.includes(',')) {
        this.minuteInterval.split(',')
            .map(minute => minute.trim().toInt())
            .forEach(minute => {
                minutes.push(minute < 10 ? '0' + minute : minute);
            });
    }
    else {
        let step = this.minuteInterval.toInt();
        for (i = 0; i <= 59; i += step) {
            minutes.push(i < 10 ? '0' + i : i);
        }
    }

    return minutes;
}

Clock.prototype.getSecondList = function() {
    let seconds = [];
    if (this.secondInterval.includes(',')) {
        this.secondInterval.split(',')
            .map(second => second.trim().toInt())
            .forEach(second => {
                seconds.push(second < 10 ? '0' + second : second);
            });
    }
    else {
        let step = this.secondInterval.toInt();
        for (i = 0; i <= 59; i += step) {
            seconds.push(i < 10 ? '0' + i : i);
        }
    }

    return seconds;
}

Clock.prototype.display = function() {

    this.hourInput = $create('INPUT', { size: 2, className: this.hourClass, tabIndex: 1, readOnly: this.hourInterval != '1', maxLength: 2 }, { }, { sign: 'CLOCK-HOUR-INPUT' });
    this.minuteInput = $create('INPUT', { size: 2, className: this.minuteClass, tabIndex: 2, readOnly: this.minuteInterval != '1', maxLength: 2 }, { }, { sign: 'CLOCK-MINUTE-INPUT' });
    this.secondInput = $create('INPUT', { size: 2, className: this.secondClass, tabIndex: 3, readOnly: this.secondInterval != '1', maxLength: 2 }, { }, { sign: 'CLOCK-SECOND-INPUT' });

    this.container.appendChild(this.hourInput);
    this.container.appendChild($create('INPUT', { className: this.colonClass, value: ':', readOnly: true, size: 1 }, { outline: 'none' }, { sign: 'CLOCK-COLON' }));
    this.container.appendChild(this.minuteInput);
    this.container.appendChild($create('INPUT', { className: this.colonClass, value: ':', readOnly: true, size: 1 }, { outline: 'none' }, { sign: 'CLOCK-COLON' }));
    this.container.appendChild(this.secondInput);

    //初始化值
    this.time = this.$value;
   
    if (!this.hourVisible) {
        this.hourInput.style.display = 'none';
        this.hourInput.nextElementSibling.style.display = 'none';
    }
    if (!this.minuteVisible) {        
        this.minuteInput.style.display = 'none';
        this.hourInput.nextElementSibling.style.display = 'none';
        this.minuteInput.nextElementSibling.style.display = 'none';
    }
    if (!this.secondVisible) {
        this.secondInput.style.display = 'none';
        this.secondInput.previousElementSibling.style.display = 'none';
    }
    
    let clock = this;

    if (this.hourInterval != '0') {
        this.hourOptionFrame = $create('DIV', { className: this.optionFrameClass }, { position: 'absolute', zIndex: 1001, padding: '0.3rem', display: 'none' }, { sign: 'CLOCK-HOUR-OPTION-FRAME' });
        let table = $create('TABLE', { 'border': 0, cellPading: 0, cellSpacing: 2 });
        table.appendChild($create('TBODY'));

        let hours = this.getHourList();
        let cols = 1;
        if (hours.length > 16) {
            cols = 3;
        }
        else if (hours.length > 8) {
            cols = 2;
        }

        for (let i = 0; i < hours.length; i++) {
            if (i % cols == 0) {
                table.firstChild.appendChild($create('TR'));
            }
            table.rows[table.rows.length - 1].appendChild($create('TD', { innerHTML: hours[i], className: (this.hourInput.value == hours[i] ? this.checkedOptionClass : this.optionClass) }, { }, { hour: 'v' + hours[i] }));
        }

        this.hourOptionFrame.appendChild(table);
        this.container.parentNode.appendChild(this.hourOptionFrame);

        this.hourInput.onfocus = function() {
            clock.minuteOptionFrame.hide();
            clock.secondOptionFrame.hide();
            clock.hourOptionFrame.$('td.' + clock.checkedOptionClass).className = clock.optionClass;
            clock.hourOptionFrame.$('td[hour=v' + clock.hourInput.value + ']').className = clock.checkedOptionClass;

            $s(clock.hourOptionFrame).show()[clock.optionFrameSide](clock.hourInput, 0, 0, clock.optionFrameAlign);
            clock.hourOptionFrame.fadeIn();                
            clock.container.fadeOut(20);
        }

        this.hourOptionFrame.onclick = function(ev) {
            let target = ev.target;
            if (target.nodeName == 'TD' && target.className != clock.checkedOptionClass) {
                this.$('td.' + clock.checkedOptionClass).className = clock.optionClass;
                target.className = clock.checkedOptionClass;
                clock.hourInput.value = target.innerHTML;
                clock.hourOptionFrame.fadeOut();
                clock.container.fadeIn(20);

                clock.execute('onHourChanged', target.innerHTML);
                clock.execute('onTimeChanged', clock.time);
            }
        }
    }
    else {
        this.hourInput.style.outline = 'none';
    }

    if (this.minuteInterval != '0') {
        this.minuteOptionFrame = $create('DIV', { className: this.optionFrameClass }, { position: 'absolute', zIndex: 1001, padding: '0.3rem', display: 'none' }, { sign: 'CLOCK-MINUTE-OPTION-FRAME' });
        let table = $create('TABLE', { 'border': 0, cellPading: 0, cellSpacing: 2 });
        table.appendChild($create('TBODY'));

        let minutes = this.getMinuteList();
        let cols = 1;
        if (minutes.length >= 48) {
            cols = 5;
        }
        else if (minutes.length >= 36) {
            cols = 4;
        }
        else if (minutes.length >= 24) {
            cols = 3;
        }
        else if (minutes.length >= 12) {
            cols = 2;
        }

        for (let i = 0; i < minutes.length; i++) {
            if (i % cols == 0) {
                table.firstChild.appendChild($create('TR'));
            }
            table.rows[table.rows.length - 1].appendChild($create('TD', { innerHTML: minutes[i], className: (this.minuteInput.value == minutes[i] ? this.checkedOptionClass : this.optionClass) }, { }, { minute: 'v' + minutes[i] }));
        }

        this.minuteOptionFrame.appendChild(table);
        this.container.parentNode.appendChild(this.minuteOptionFrame);

        this.minuteInput.onfocus = function() {
            clock.hourOptionFrame.hide();
            clock.secondOptionFrame.hide();
            clock.minuteOptionFrame.$('td.' + clock.checkedOptionClass).className = clock.optionClass;
            clock.minuteOptionFrame.$('td[minute=v' + clock.minuteInput.value + ']').className = clock.checkedOptionClass;
            clock.minuteOptionFrame.show()[clock.optionFrameSide](clock.minuteInput, 0, 0, clock.optionFrameAlign);
            clock.minuteOptionFrame.fadeIn();
            clock.container.fadeOut(20);
        }

        this.minuteOptionFrame.onclick = function(ev) {
            let target = ev.target;
            if (target.nodeName == 'TD' && target.className != clock.checkedOptionClass) {
                this.$('td.' + clock.checkedOptionClass).className = clock.optionClass;
                target.className = clock.checkedOptionClass;
                clock.minuteInput.value = target.innerHTML;
                clock.minuteOptionFrame.fadeOut();
                clock.container.fadeIn(20);

                clock.execute('onMinuteChanged', target.innerHTML);
                clock.execute('onTimeChanged', clock.time);
            }
        }
    }    
    else {
        this.minuteInput.style.outline = 'none';
    }

    if (this.secondInterval != '0') {
        this.secondOptionFrame = $create('DIV', { className: this.optionFrameClass }, { position: 'absolute', zIndex: 1001, padding: '0.3rem', display: 'none' }, { sign: 'CLOCK-SECOND-OPTION-FRAME' });
        let table = $create('TABLE', { 'border': 0, cellPading: 0, cellSpacing: 2 });
        table.appendChild($create('TBODY'));

        let seconds = this.getSecondList();
        let cols = 1;
        if (seconds.length >= 48) {
            cols = 5;
        }
        else if (seconds.length >= 36) {
            cols = 4;
        }
        else if (seconds.length >= 24) {
            cols = 3;
        }
        else if (seconds.length >= 12) {
            cols = 2;
        }

        for (let i = 0; i < seconds.length; i++) {
            if (i % cols == 0) {
                table.firstChild.appendChild($create('TR'));
            }
            table.rows[table.rows.length - 1].appendChild($create('TD', { innerHTML: seconds[i], className: (this.secondInput.value == seconds[i] ? this.checkedOptionClass : this.optionClass) }, { }, { second: 'v' + seconds[i] }));
        }

        this.secondOptionFrame.appendChild(table);
        this.container.parentNode.appendChild(this.secondOptionFrame);

        this.secondInput.onfocus = function() {
            clock.hourOptionFrame.hide();
            clock.minuteOptionFrame.hide();
            clock.secondOptionFrame.$('td.' + clock.checkedOptionClass).className = clock.optionClass;
            clock.secondOptionFrame.$('td[second=v' + clock.secondInput.value + ']').className = clock.checkedOptionClass;
            clock.secondOptionFrame.show()[clock.optionFrameSide](clock.secondInput, 0, 0, clock.optionFrameAlign);
            clock.secondOptionFrame.fadeIn();
            clock.container.fadeOut(20);
        }

        this.secondOptionFrame.onclick = function(ev) {
            let target = ev.target;
            if (target.nodeName == 'TD' && target.className != clock.checkedOptionClass) {
                this.$('td.' + clock.checkedOptionClass).className = clock.optionClass;
                target.className = clock.checkedOptionClass;
                clock.secondInput.value = target.innerHTML;
                clock.secondOptionFrame.fadeOut();
                clock.container.fadeIn(20);

                clock.execute('onSecondChanged', target.innerHTML);
                clock.execute('onTimeChanged', clock.time);
            }
        }
    }    
    else {
        this.secondInput.style.outline = 'none';
    }

    document.body.on('click', function(ev) {
        if ((clock.hourOptionFrame != null && clock.hourOptionFrame.style.display == '') || (clock.minuteOptionFrame && clock.minuteOptionFrame.style.display == '') || (clock.secondOptionFrame != null && clock.secondOptionFrame.style.display == '')) {
            let target = ev.target;
            while(target.nodeName != 'BODY') {
                if (target.getAttribute('sign') != null && new Set(['CLOCK-HOUR-OPTION-FRAME', 'CLOCK-HOUR-INPUT', 'CLOCK-MINUTE-OPTION-FRAME', 'CLOCK-MINUTE-INPUT', 'CLOCK-SECOND-OPTION-FRAME', 'CLOCK-SECOND-INPUT']).has(target.getAttribute('sign'))) {
                    break;
                }
                else {
                    target = target.parentNode;
                }
            }
            if (target.nodeName == 'BODY') {
                if (clock.hourOptionFrame != null && clock.hourOptionFrame.style.display == '') {
                    clock.hourOptionFrame.fadeOut();
                }
                if (clock.minuteOptionFrame != null && clock.minuteOptionFrame.style.display == '') {
                    clock.minuteOptionFrame.fadeOut();
                }
                if (clock.secondOptionFrame != null && clock.secondOptionFrame.style.display == '') {
                    clock.secondOptionFrame.fadeOut();
                }
                clock.container.fadeIn(20);
            }                        
        }                    
    });

    if (this.tick) {
        window.setInterval(function() {
            let now = DateTime.now();
            clock.hourInput.value = now.getHour().toString().padStart(2, '0');
            clock.minuteInput.value = now.getMinute().toString().padStart(2, '0');
            clock.secondInput.value = now.getSecond().toString().padStart(2, '0');
            
            clock.execute('onTimeChanged', clock.time);
        }, 1000);
    }
}

Clock.initializeAll = function() {
    for (let clock of document.querySelectorAll('Clock')) {
        new Clock(clock).display();
    }    
}

document.on('post', function() {
    Clock.initializeAll();    
});