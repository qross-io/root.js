class Calendar {

    constructor(elementOrSettings) {
        $initialize(this)
        .with(elementOrSettings)
        .declare({
            name: 'Calendar_' + document.components.size,
            //单日/周/日期期间
            mode: Enum('DAY', 'WEEK', 'RANGE', 'NONE'),
            //显示的月数
            months: function(value = 1) {
                //must be 1,2,3,12
                //12 means whole year
                //now only supports 1
                value = $parseInt(value, 1);
                if (value < 0) {
                    value = 1;
                }
                if (value > 12) {
                    value = 12;
                }
                if (value > 6 && value != 12) {
                    value = 6;
                }
                return value;
            },
            
            init: function(value) {
                if (value == null || !/^[+-=]?\d+$/i.test(value)) {
                    switch(this.months) {
                        case 2:
                        case 3:
                            return '-1';
                        case 4:
                        case 5:
                            return '-2';                        
                        case 6:
                            return '-3';
                        case 12:
                            return '=1'; //显示第一月
                        default:
                            return '0';
                    }
                }
                return value.trim();
            },

            firstDayOfWeek: function(value = 'MON') {
                return DateTime.parseWeek(value);
            },

            //当月是否显示其他月的日期
            daysOfOtherMonth: Enum('VISIBLE', 'HIDDEN'),
            
            minDate: '1900-01-01', //可选择的最小日期
            maxDate: '2100-12-31', //可选择的最大日期

            //初始值
            //day: 仅有date有值
            //week: week和startDate和endDate有值
            //range: startDate和endDate有值
            $date: '',
            $week: '',
            $startDate: '',
            $endDate: '',

            // yyyy-MM yyyy/MM MM/yyyy MMM yyyy yyyy年MM月
            titleFormat: '', //为空表示不显示, 一般整年时显示，分月时不显示
            headFormat: 'yyyy-MM',
            
            weekTitle: 'Week',
            weekNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], //年历时使用
            cornerNames: ['R', 'W'],
            todayText: 'Today',
            thisWeekText: 'This Week',
            thisMonthText: 'This Month',
            thisYearText: 'This Year',
            confirmText: 'OK',

            quickSwitch: true, //年数小于4时，或月数小于 months+3时，自动关闭quickSwitch

            lunar: false, //农历
            holiday: false, //自定义的假日和工作日
            extensionApi: '',

            frameClass: '-calendar', //整体框架样式
            titleClass: '-calendar-title', //整个日历的标题框样式
            titleTextClass: '-calendar-title-text', //（年）标题文字样式
            headClass: '-calendar-head', //月历头样式，包含导航按钮和日历标题(年月)
            navClass: '-calendar-nav', //导航框样式
            navMonthButtonClass: '-calendar-nav-button', //上一月/下一月
            navYearButtonClass: '-calendar-nav-year-button', //上一年/上一年
            headTitleClass: '-calendar-head-title', //日历标题样式 year-month
            bodyClass: '-calendar-body', //日历主体样式div
            contentClass: '-calendar-content', //日历内容样式table
            cornerClass: '-calendar-corner', //角标样式
            dayClass: '-calendar-day', //日期数字样式
            lunarClass: '-calendar-lunar', //农历样式
            todayClass: '-calendar-today', //今日样式
            holidayClass: '-calendar-holiday', //假日单元格样式
            workdayClass: '-calendar-workday', //工作日单元格样式
            focusDayClass: '-calendar-focus-day', //选中日期样式
            disabledDayClass: '-calendar-disabled-day', //可选择日期区间外的日期样式
            focusStartDayClass: '-calendar-focus-start-day', //range模式下选中的开始日期样式
            focusEndDayClass: '-calendar-focus-start-day', //range模式下选中的结束日期样式
            selectionDayClass: '-calendar-selection-day', //range模式下选中的开始日期和结束日期之间的日期样式            
            weekHeadClass: '-calendar-week-head', //第几周
            weekNameClass: '-calendar-week-name', //周一到周日
            weekRowClass: '-calendar-week-row', //content table 的行样式
            weekFocusRowClass: '-calendar-week-focus-row', //week模式下选中行样式
            weekOfYearClass: '-calendar-week-of-year', //week模式下周数样式       
            weekOfYearFocusClass: '-calendar-week-of-year-focus',
            daysOfOtherMonthClass: '-calendar-days-of-other-month',
            footClass: '-calendar-foot',
            footButtonClass: '-calendar-foot-button',

            switchFrameClass: '-calendar-switch-frame',
            switchYearOptionClass: '-calendar-switch-year-option',
            switchThisYearOptionClass: '-calendar-switch-this-year-option',
            switchYearCheckedOptionClass: '-calendar-switch-year-checked-option',

            switchYearHeadClass: '-calendar-switch-year-head',
            switchMonthOptionClass: '-calendar-switch-month-option',
            switchThisMonthOptionClass: '-calendar-switch-this-month-option',
            switchMonthCheckedOptionClass: '-calendar-switch-month-checked-option',

            icon: 'font',//Enum('FONT', 'IMAGE'),
            align: Enum('LEFT', 'RIGHT')
        })
        .elementify(element => {
            element.parentNode.insertBefore($create('DIV', { className: this.frameClass }), element);
            this.container = element.previousElementSibling;
            this.container.setAttribute('sign', 'CALENDAR-CONTAINER');
            if (element.nodeName == 'INPUT') {

                this.container.id = this.name + '_Calendar';                

                if (element.value != '') {
                    this.$date = element.value;
                }

                this.container.style.visibility = 'hidden';
                this.container.style.position = 'absolute';
                this.container.style.zIndex = 999;
                this.container.style.border = '1px solid var(--primary)';

                element.readOnly = true;
                if (this.icon.toLowerCase() == 'font') {
                    element.insertAdjacentHTML('afterEnd', '<a sign="CALENDAR-BUTTON" class="iconfont icon-calendar" href="javascript:void(0)" style="margin-left: -24px;"></a>');
                }
                else if (this.icon.toLowerCase() == 'image') {
                    element.insertAdjacentHTML('afterEnd', '<a sign="CALENDAR-BUTTON" href="javascript:void(0)"><img src="' + $root.home + 'images/calendar' + $random(0, 4) + '.png" style="margin-left: -24px;" /></a>');
                }
                else if (/\.(jpg|png|jpeg|gif)$/i.test(this.icon)) {
                    element.insertAdjacentHTML('afterEnd', '<a sign="CALENDAR-BUTTON" href="javascript:void(0)"><img src="' + this.icon + '" style="margin-left: -24px;" /></a>');
                }
                else {
                    element.insertAdjacentHTML('afterEnd', '<a sign="CALENDAR-BUTTON" class="iconfont ' + this.icon + '" href="javascript:void(0)" style="margin-left: -24px;"></a>');
                }

                let calendar = this;
                element.nextElementSibling.onclick = function(ev) {
                    $x(calendar.container)                        
                        .left(
                            calendar.align == 'LEFT' ? $x(element).left() : ($x(element).left() + $x(element).width() - $x(calendar.container).width())
                        )
                        .top(
                            $x(element).top() + $x(element).height() + 1
                        ).fadeIn();
                    calendar.visible = true;
                }

                $x(document.body).on('click', function(ev) {
                    if (calendar.visible) {
                        let target = ev.target;
                        while(target.nodeName != 'BODY') {
                            if (target.getAttribute('sign') != null && target.getAttribute('sign').startsWith('CALENDAR-')) {
                                break;
                            }
                            else {
                                target = target.parentNode;
                            }
                        }
                        if (target.nodeName == 'BODY') {
                            $x(calendar.container).fadeOut();
                            calendar.visible = false;
                        }                        
                    }                    
                });

                this.element = element;
            }
            else {
                element.remove();
                this.element = null;
                this.container.id = this.name;
            }
        });

        if (this.$date == 'today') {
            this.$date = this.today;
        }
        if (this.minDate == 'today') {
            this.minDate = this.today;
        }
        if (this.maxDate == 'today') {
            this.maxDate = this.today;
        }
        if (this.$startDate == 'today') {
            this.$startDate = this.today;
        }
        if (this.$endDate == 'today') {
            this.$endDate = this.today;
        }
    }

    get today() {
        return DateTime.now().get('yyyy-MM-dd');
    }
    
    get date() {
        return this.$date;
    }

    set date(date) {
        if (!/^\d\d\d\d-\d\d-\d\d$/.test(date)) {
            date = date.toDateTime().get("yyyy-MM-dd");
        }        
        this.setFocusDayClass(date);        
        
        if (this.$date != '') {
            this.resetDayClass(this.$date);
        }

        this.$date = date;
        this.container.setAttribute('date', date);
    }

    get week() {
        return this.$week;
    }

    set week(week) {

        //week 2019-1
         if (this.$week != '') {
            $x(this.container).select('tr[week=v' + this.$week + ']')
                .css(this.weekRowClass)
                .firstChild()
                .css(this.weekOfYearClass);
        }

        $x(this.container).select('tr[week=v' + week + ']')
            .css(this.weekFocusRowClass)
            .firstChild()
            .css(this.weekOfYearFocusClass)
            .parent()
            .first()
            .objects
            .forEach(row => {
                this.$week = week;
                this.$startDate = row.cells[1].getAttribute('value');
                this.$endDate = row.cells[7].getAttribute('value');

                this.container.setAttribute('week', this.$week);
                this.container.setAttribute('startDate', this.$startDate);
                this.container.setAttribute('endDate', this.$endDate);
            });        
    }

    get startDate() {
        return this.$startDate;
    }

    set startDate(startDate) {
        if (this.$startDate != '') {
            this.resetDayClass(this.$startDate);
        }

        this.$startDate = startDate;
        this.container.setAttribute('startDate', startDate);
        
        if (startDate != '') {
            this.setFocusDayClass(startDate);            
        }

        this.setSelectionClass();
    }

    get endDate() {
        return this.$endDate;
    }

    set endDate(endDate) {
         if (this.$endDate != '') {
            this.resetDayClass(this.$endDate);
        }

        this.$endDate = endDate;
        this.container.setAttribute('endDate', endDate);

        if (endDate != '') {
            this.setFocusDayClass(endDate);            
        }

        this.setSelectionClass();
    }

    get minYear() {
        return this.minDate == '' ? 1900 : this.minDate.takeBefore('-').toInt();
    }

    get maxYear() {
        return this.maxDate == '' ? 2100 : this.maxDate.takeBefore('-').toInt();        
    }

    get minMonth() {
        return this.minDate == '' ? '1900-01' : this.minDate.takeBeforeLast('-');
    }

    get maxMonth() {
        return this.maxDate == '' ? '2100-12' : this.maxDate.takeBeforeLast('-');
    }

    get year() {
        let current = this.container.getAttribute('current');
        if (current != '') {
            return current.substring(0, 4).toInt();
        }
        else {
            return DateTime.now().getYear();
        }
    }

    set year(year) {
        if (this.months == 12) {
            if (year >= this.minYear && year <= this.maxYear) {
                this.switching = true;

                this.container.querySelector('div[sign=CALENDAR-TITLE-TEXT]').innerHTML = this.$getTitleText(DateTime.of(year, 1, 1))
                let body = this.container.querySelector('div[sign=CALENDAR-BODY]');

                let calendar = this;
                
                //先隐藏当年，再显示下一年的
                for (let i = 0; i < body.children.length; i++) {
                    Animation('timing-function: ease; duration: ' + ((i + 1) * 50) + 'ms; from: x(0).y(0) 100% 100%; to: x(0).y(0) 100% 0%; fill-mode: forwards;')
                        .apply(body.children[Math.abs(i - body.children.length + 1)])
                        .on('stop', function() {
                                if (i == body.children.length - 1) {
                                    body.innerHTML = '';
                                    calendar.$renderYearCalendar(body, year); 
                                }
                            })
                        .play();
                }

                calendar.container.setAttribute('current', year);
                
                let prev = calendar.container.querySelector('button[sign=CALENDAR-PREV-YEAR]');
                let next = calendar.container.querySelector('button[sign=CALENDAR-NEXT-YEAR]');
                
                prev.innerHTML = year - 1;
                next.innerHTML = year + 1;
                
                
                $x(prev).enable(year > calendar.minYear);
                $x(next).enable(year < calendar.maxYear);
            }
        }
        //非年历时无法设置
    }

    //格式 yyyy-MM
    get month() {
        let current = this.container.getAttribute('current');
        if (current != '') {
            return current;
        }
        else {
            return DateTime.now().get('yyyy-MM');
        }
    }

    set month(month) {
        if (this.months < 12) {
            if (month >= this.minMonth && month <= this.maxMonth) {
                month = month.toDateTime();
                if (this.months > 1) {
                    while (this.maxMonth.toDateTime().plusMonths(-this.months + 1).get('yyyy-MM') < month.get('yyyy-MM')) {
                        month.plusMonths(-1);
                    }
                }

                this.switching = true;
                let calendar = this;

                let content = this.container.querySelector('table[sign=CALENDAR-CONTENT]');
                let head = this.container.querySelectorAll('td[sign=CALENDAR-YEAR-MONTH]');
                //清除body框中的所有日历
                Animation('timing-function: ease; duration: 500ms; from: x(0).y(0) 100% 100%; to: x(0).y(0) 150% 0%; fill-mode: forwards;')
                    .apply(content)
                    .on('stop', function() {
                        content.firstChild.firstChild.innerHTML = '';
                        content.style.marginLeft = '0';

                        calendar.container.setAttribute('current', month.get('yyyy-MM'));

                        calendar.container.querySelector('button[sign=CALENDAR-PREV-MONTH]').disabled = month.get('yyyy-MM') == calendar.minMonth;
                        for (let i = 0; i < calendar.months; i++) {
                            //head text
                            head[i].innerHTML = calendar.$getHeadText(month);
                            //content text
                            content.firstChild.firstChild.appendChild($create('TD'));
                            content.rows[0].cells[i].appendChild(calendar.$populateMonthContent(month));
                            calendar.loading.add(month.getYear());
                            month.plusMonths(1);
                        }
                        calendar.container.querySelector('button[sign=CALENDAR-NEXT-MONTH]').disabled = month.plusMonths(-1).get('yyyy-MM') == calendar.maxMonth;

                        calendar.switching = false;

                        Animation('timing-function: ease; duration: 400ms; from: x(0).y(0) 80% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;')
                            .apply(content)
                            .play();

                        calendar.loadExtraInfo();

                    })
                    .play();
            }
        }
        //月历时才可以设置, 格式yyyy-MM
    }
}

$calendar = function(name) {
    let calendar = $t(name);
    if (calendar != null && calendar.tagName == 'CALENDAR') {
        return calendar;
    }
    else {
        return null;
    }
}

Calendar.LUNAR = { };

//Calendar.prototype.headFrame = null;
//Calendar.prototype.bodyFrame = null;
Calendar.prototype.contentFrame = null;
Calendar.prototype.switching = false; //是否正在切换年份或者月份
Calendar.prototype.visible = false; //适用于 input.calendar, 日期选择框是否正在显示

Calendar.prototype.loading = new Set(); //正在加载的农历或休息日的年份

Calendar.prototype.onNavPrevMonth = function(month) { }
Calendar.prototype.onNavNextMonth = function(month) { }
Calendar.prototype.onNavPrevYear = function(year) { }
Calendar.prototype.onNavNextYear = function(year) { }
Calendar.prototype.onDaySelected = function(day) { }
Calendar.prototype.onDayClick = function(cell) { }
Calendar.prototype.onWeekSelected = function(year, weekOfYear, startDate, endDate) { }
Calendar.prototype.onRangeStartSelected = function(startDate, endDate) { }
Calendar.prototype.onRangeStartCanceled = function(endDate) { }
Calendar.prototype.onRangeEndSelected = function(startDate, endDate) { }
Calendar.prototype.onRangeEndCanceled = function(startDate) { }
Calendar.prototype.onRangeSelected = function(startDate, endDate) { }
Calendar.prototype.onRangeCanceled = function() { }

// Calendar.$animate = function(fromPosition, toPosition, fromOpacity = 100, toOpacity = 100) {
//     return Animation('timing-function: ease; duration: 0.8s; from: x(' + fromPosition + ').y(0) 100% ' + fromOpacity + '%; to: x(' + toPosition + ').y(0) 100% ' + toOpacity + '%; fill-mode: forwards;');
// }

Calendar.prototype.setFocusDayClass = function(day) {
    $x(this.container).select('td[day=v' + day + ']').stash('className').css(this.focusDayClass).objects.forEach(td => td.removeAttribute('range'));
}

Calendar.prototype.resetDayClass = function(day) {
    let selector = (day == undefined ? 'range' : 'day=v' + day);
    $x(this.container).select('td[' + selector + ']').reset('className').objects.forEach(td => td.removeAttribute('range'));
}

Calendar.prototype.setSelectionClass = function() {

    //cancel all first
    this.resetDayClass();

    if (this.startDate != '' && this.endDate != '') {
        let start = new DateTime(this.startDate).plusDays(1);
        let end = new DateTime(this.endDate);

        while (start.before(end)) {
            $x(this.container).select('td[day=v' + start.get('yyyy-MM-dd') + ']')
                .css(this.selectionDayClass)
                .attr('range', '');
            start.plusDays(1);
        }
    }
}

//判断是否开启快速切换年和月
Calendar.prototype.yearSwitchEnabled = function() {
    if (this.quickSwitch) {
        if (this.minDate != '' && this.maxDate != '') {
            return this.maxYear - this.minYear > 3;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}

Calendar.prototype.monthSwitchEnabled = function() {
    if (this.quickSwitch) {
        if (this.minDate != '' && this.maxDate != '') {
            return (new DateTime(this.minDate).plusMonths(this.months + 2).get('yyyy-MM-dd') < this.maxDate);
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}

Calendar.prototype.$getTitleText = function(date) {
    if (this.yearSwitchEnabled()) {
        return '<a href="javascript:void(0)" sign="CALENDAR-OPEN-YEAR-SWITCH">' + this.titleFormat.replace(/yy+/, $0 => + date.get($0)) + ' <i class="iconfont icon-down"></i></a>';
    }
    else {
        return this.titleFormat.replace(/yy+/, $0 => + date.get($0));
    }
}

Calendar.prototype.$getHeadText = function(date) {
    if (this.monthSwitchEnabled()) {
        return '<a href="javascript:void(0)" value="' + date.get('yyyy-MM') + '" sign="CALENDAR-OPEN-MONTH-SWITCH">' + this.headFormat.replace(/yy+/, $0 => + date.get($0)).replace(/M+/, $0 => date.get($0)) + ' <i class="iconfont icon-down"></i></a>';
    }
    else {
        return this.headFormat.replace(/yy+/, $0 => + date.get($0)).replace(/M+/, $0 => date.get($0));
    }
}

Calendar.prototype.$populateMonthContent = function(month, header = false) {

    let calendar = this;

    let table = $create('TABLE', { cellPadding: 3, cellSpacing: 1, border: 0, className: this.contentClass }, { }, { sign: 'M' + month.get('yyyy-MM'), month: month.get('yyyy-MM') });
    let tbody = $create('TBODY');
    if (header) {
        tbody.appendChild($create('TR', { innerHTML: '<th class="' + this.headClass + '" colspan="' + (this.mode == 'WEEK' ? 8 : 7) + '">' + this.monthNames[month.getMonth() - 1] + '</th>' }));
    }
    let tr = $create('TR');
    if (this.mode == 'WEEK') { 
        tr.appendChild($create('TH', { innerHTML: this.weekTitle, className: this.weekHeadClass }));
    }
    for (let k = 0; k < 7; k++) {
        tr.appendChild($create('TH', { innerHTML: this.weekNames[k], className: this.weekNameClass }));
    }
    tbody.appendChild(tr);

    let days = DateTime.getCalendar(month.getYear(), month.getMonth(), this.firstDayOfWeek);
    for (let j = 0; j < 6; j++) {
        let tr = $create('TR');
        if (this.mode == 'WEEK') {
            tr.className = this.weekRowClass;            
            tr.setAttribute('value', days[j][0].year + '-' + days[j][0].weekOfYear);
            if (this.daysOfOtherMonth == 'VISIBLE' || days[j][1].month == month.getMonth() || days[j][7].month == month.getMonth()) {
                tr.setAttribute('week', 'v' + days[j][0].year + '-' + days[j][0].weekOfYear);

                if (this.startDate != '' && days[j][1].date == this.startDate) {
                    tr.className = this.weekFocusRowClass;
                    this.$week = tr.getAttribute('value');
                }

                tr.appendChild($create('TD', { innerHTML: days[j][0].weekOfYear, className: tr.className == this.weekFocusRowClass ? this .weekOfYearFocusClass : this.weekOfYearClass }, { }, { 'sign': 'CALENDAR-WEEK-OF-YEAR' }));
            }
            else {
                tr.appendChild($create('TD', { innerHTML: '&nbsp;' }));
            }            
        }
        for (let k = 0; k < 7; k++) {
            let td = $create('TD');
            td.setAttribute('value', days[j][k+1].date);

            if (this.daysOfOtherMonth == 'VISIBLE' || days[j][k+1].month == month.getMonth()) {
                td.setAttribute('day', 'v' + days[j][k+1].date);
                if (Calendar.LUNAR[days[j][k+1].date] == null) {
                    td.setAttribute('extra', days[j][k+1].date);
                }

                if (days[j][k+1].workday > 1) {
                    td.appendChild($create('DIV', { innerHTML: this.cornerNames[days[j][k+1].workday - 2] }, { float: 'left' }));
                }
                else {
                    td.appendChild($create('DIV', { innerHTML: '' }, { float: 'left', display: 'none' }));
                }              
                td.appendChild($create('DIV', { innerHTML: days[j][k+1].dayOfMonth, className: this.dayClass }));
                if (this.lunar) {
                    td.appendChild($create('DIV', { innerHTML: (days[j][k+1].lunar == 'N/A' ? '&nbsp;　　&nbsp;' : days[j][k+1].lunar) }));
                }
                else {
                    td.appendChild($create('DIV', { innerHTML: '' }, { display: 'none' }));
                }
                if (this.months == 12) {
                    td.firstChild.style.position = 'absolute';
                }

                if ((this.minDate != '' && days[j][k+1].date < this.minDate) || (this.maxDate != '' && days[j][k+1].date > this.maxDate)) {
                    td.className = this.disabledDayClass;
                    td.setAttribute('sign', 'DISABLED-DAY');
                }
                else if (days[j][k+1].date == DateTime.today()) {
                    td.className = this.todayClass;
                    td.setAttribute('sign', 'TODAY');
                }
                else if (days[j][k+1].isOtherMonth) {
                    td.className = this.daysOfOtherMonthClass;
                    td.setAttribute('sign', 'OTHER-MONTH-DAY');
                }
                else if (days[j][k+1].workday % 2 == 0) {
                    td.className = this.holidayClass;
                    td.setAttribute('sign', 'HOLIDAY');
                }
                else {
                    td.className = this.workdayClass;
                    td.setAttribute('sign', 'WORKDAY');
                }

                if (td.getAttribute('sign') != 'DISABLED-DAY') {
                    if (this.mode == 'DAY') {                    
                        td.onclick = function(ev) {
                            if (calendar.date != this.getAttribute('value')) {
                                calendar.date = this.getAttribute('value');                            
                                
                                calendar.execute('onDaySelected', calendar.$date);

                                //如果是日期选择框，选中即隐藏
                                if (calendar.element != null) {
                                    calendar.element.value = calendar.$date;
                                    $x(calendar.container).fadeOut();
                                }
                            }
                        }

                        if (this.date == days[j][k+1].date) {
                            td.className = this.focusDayClass;
                        }
                    }
                    else if (this.mode == 'RANGE') {
                        td.onclick = function(ev) {
                            // A 空 B 空
                            // A 不空 B 空
                            // A 空 B 不空
                            // A 不空 B 不空

                            let date = this.getAttribute('value');
                            let value = date.toDateInt();

                            if (calendar.startDate == '' && calendar.endDate == '') {
                                calendar.startDate = date;

                                calendar.execute('onRangeStartSelected', date, '');
                            }
                            else if (calendar.startDate != '' && calendar.endDate == '') {
                                let origin = calendar.startDate.toDateInt();
                                if (value > origin) {
                                    calendar.endDate = date;

                                    calendar.execute('onRangeEndSelected', calendar.startDate, date);
                                    calendar.execute('onRangeSelected', calendar.startDate, date);
                                }
                                else if (value < origin) {
                                    let endDate = calendar.startDate;
                                    calendar.startDate = '';
                                    //this.execute('onRangeStartCanceled', endDate);

                                    calendar.startDate = date;
                                    calendar.endDate = endDate;

                                    calendar.execute('onRangeStartSelected', date, endDate);
                                    calendar.execute('onRangeEndSelected', date, endDate);
                                    calendar.execute('onRangeSelected', date, endDate);
                                }
                                else {
                                    calendar.startDate = '';
                                    calendar.execute('onRangeStartCanceled', '');
                                    calendar.execute('onRangeCanceled');
                                }
                            }
                            else if (calendar.startDate == '' && calendar.endDate != '') {
                                let erigin = calendar.endDate.toDateInt();
                                if (value < erigin) {
                                    calendar.startDate = date;

                                    calendar.execute('onRangeStartSelected', date, calendar.endDate);
                                    calendar.execute('onRangeSelected', date, calendar.endDate);
                                }
                                else if (value > erigin) {
                                    let startDate = calendar.endDate;
                                    calendar.endDate = '';
                                    //this.execute('onRangeEndCanceled', startDate);
                                    calendar.startDate = startDate;
                                    calendar.endDate = date;

                                    calendar.execute('onRangeStartSelected', startDate, date);
                                    calendar.execute('onRangeEndSelected', startDate, date);
                                    calendar.execute('onRangeSelected', startDate, date);
                                }
                                else {
                                    calendar.endDate = '';
                                    calendar.execute('onRangeEndCanceled', '');
                                    calendar.execute('onRangeCanceled');
                                }
                            }
                            else if (calendar.startDate != '' && calendar.endDate != '') {
                                let origin = calendar.startDate.toDateInt();
                                let erigin = calendar.endDate.toDateInt();
                                if (value < origin) {
                                    calendar.startDate = date;

                                    calendar.execute('onRangeStartSelected', date, calendar.endDate);
                                    calendar.execute('onRangeSelected', date, calendar.endDate);
                                }   
                                else if (value == origin) {
                                    calendar.startDate = '';
                                    calendar.execute('onRangeStartCanceled', calendar.endDate);
                                }
                                else if (value == erigin) {
                                    calendar.endDate = '';
                                    calendar.execute('onRangeEndCanceled', calendar.startDate);
                                }      
                                else if (value > erigin) {
                                    calendar.endDate = date;

                                    calendar.execute('onRangeEndSelected', calendar.startDate, date);
                                    calendar.execute('onRangeSelected', calendar.startDate, date);
                                }
                                else {
                                    let n = new DateTime(date);
                                    let s = n.daysSpan(new DateTime(calendar.startDate));
                                    let t = new DateTime(calendar.endDate).daysSpan(n);

                                    if (s < t) {
                                        calendar.startDate = date;
                                        calendar.execute('onRangeStartSelected', date, calendar.endDate);
                                        calendar.execute('onRangeSelected', date, calendar.endDate);
                                    }
                                    else {
                                        calendar.endDate = date;
                                        calendar.execute('onRangeEndSelected', calendar.startDate, date);
                                        calendar.execute('onRangeSelected', calendar.startDate, date);
                                    }
                                }
                            }
                        }

                        if (days[j][k+1].date == this.startDate || days[j][k+1].date == this.endDate) {
                            td.className = this.focusDayClass;
                        }
                        else if (days[j][k+1].date.toDateTime().between(this.startDate, this.endDate)) {
                            td.className = this.selectionDayClass;
                            td.setAttribute('range', 'yes');
                        }
                    }
                    else if (this.mode == 'NONE') {
                        td.onclick = function(ev) {
                            calendar.execute('onDayClick', new CalendarCell(td));
                        }
                    }
                }
            } 
            else {
                td.appendChild($create('DIV', { innerHTML: '' }, { display: 'none' } ));
                td.appendChild($create('DIV', { innerHTML: '&nbsp;', className: this.dayClass }));
                td.appendChild($create('DIV', { innerHTML: '&nbsp;' }));
                if (!this.lunar) {
                    td.lastChild.style.display = 'none';
                }
            }           
            tr.appendChild(td);
        }

        if (this.mode == 'WEEK') {
            if (new Array(...tr.children).filter(td => td.getAttribute('sign') == 'DISABLED-DAY').length < 7) {
                tr.onclick = function(ev) {
                    if (calendar.week != this.getAttribute('value')) {
                        calendar.week = this.getAttribute('value');

                        let year = calendar.week.takeBefore('-');
                        let week = calendar.week.takeAfter('-');

                        if (calendar.element != null) {                            
                            calendar.element.value = navigator.language.toLowerCase() == 'zh-cn' ? '第 ' + week + ' 周, ' + year : 'Week ' + week + ', ' + year;
                            calendar.element.setAttribute('week', calendar.week);
                            calendar.element.setAttribute('start', calendar.startDate);
                            calendar.element.setAttribute('end', calendar.endDate);

                            $x(calendar.container).fadeOut();
                        }
                        
                        calendar.execute('onWeekSelected', year.toInt(), week.toInt(), calendar.startDate, calendar.endDate);  
                    }
                }
            }            
        }

        if (tr.cells[0].innerHTML != '&nbsp;' || tr.cells[6].innerHTML != '&nbsp;') {
            tbody.appendChild(tr);
        }        
    }
    table.appendChild(tbody);

    return table;
}

Calendar.prototype.display = function() {
    if (this.months < 12) {
        this.displayMonth();
    }
    else {
        this.displayYear();
    }

    if (this.element != null && this.element.nodeName == 'INPUT') {
        this.container.style.visibility = 'visible';
        this.container.style.display = 'none';
    }
}

Calendar.prototype.displayYear = function() {
 
    let calendar = this;

    let date = this.date != '' ? new DateTime(this.date) : (this.startDate != '' ? new DateTime(this.startDate) : new DateTime());
    if (date.getYear() < this.minYear) {
        date = new DateTime(this.minDate);
    }
    if (date.getYear() > this.maxYear) {
        date = new DateTime(this.maxDate);
    }
    
    this.container.setAttribute('current', date.get('yyyy'));

    let title = $create('DIV', { className: this.titleClass }, { display: 'flex', justifyContent: 'space-around', alignItems: 'center' }, { sign: 'CALENDAR-TITLE' });
    let frame = $create('DIV', { className: this.switchFrameClass }, { position: 'absolute', zIndex: 1001}, { sign: 'CALENDAR-YEAR-SWITCH' });
    frame.appendChild($create('DIV', { innerHTML: '&nbsp;' }, { 'font-size': '0.6rem' }));
    let years = $create('DIV', { }, { overflow: 'auto', height: '24rem' });
    years.appendChild($create('DIV', { }, { display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }));
    
    title.appendChild($create('DIV', { }, { textAlign: 'left', flex: 'auto' }));
    title.appendChild($create('DIV', { className: this.titleTextClass, innerHTML: this.$getTitleText(date) }, { flex: 'auto' }, { sign: 'CALENDAR-TITLE-TEXT' }));
    title.appendChild($create('DIV', { }, { textAlign: 'right', flex: 'auto' }));

    let body = $create('DIV', { className: this.bodyClass }, { padding: '0.4rem', marginLeft: '0px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }, { sign: 'CALENDAR-BODY' });

    //显示快速切换
    $x(title).on('click', function(ev) {
        if (ev.target.nodeName == 'A' || ev.target.nodeName == 'I') {
            let checked = $x(years).select('div.' + calendar.switchYearCheckedOptionClass);
            if (checked.nonEmpty() && checked.html().toInt() != calendar.year) {
                checked.css(checked.html().toInt() != DateTime.now().getYear() ? calendar.switchYearOptionClass : calendar.switchThisYearOptionClass);                    
            }
            $x(years).select('div[year=v' + calendar.year + ']').css(calendar.switchYearCheckedOptionClass);
            $x(calendar.container)
                .select('div[sign=CALENDAR-YEAR-SWITCH]')
                .show()
                .left(
                    $x(calendar.container).left() + $x(title).width() / 2 - $x(frame).width() / 2
                )
                .top(                
                    $x(body).top() - 8
                ).fadeIn();            
            $x(body).fadeOut(20);
            $x(title).fadeOut(50);
        }
    });

    let prev = $create('BUTTON', { className: this.navYearButtonClass, innerHTML: (date.getYear() - 1) }, { }, { sign: 'CALENDAR-PREV-YEAR' });
    if (date.getYear() <= calendar.minYear) {
        prev.disabled = true;
    }
    prev.onclick = function() {
        if (!calendar.switching) {
            calendar.year -= 1;
            calendar.execute('onNavPrevYear', calendar.year);
        }
    }
    title.firstChild.appendChild(prev);

    let next = $create('BUTTON', { className: this.navYearButtonClass, innerHTML: date.getYear() + 1 }, { }, { sign: 'CALENDAR-NEXT-YEAR' });
    if (date.getYear() >= calendar.maxYear) {
        next.disabled = true;
    }
    next.onclick = function() {
        if (!calendar.switching) {
            calendar.year += 1;
            calendar.execute('onNavPrevYear', calendar.year);
        }
    }

    title.lastChild.appendChild(next);
    this.container.appendChild(title);

    //年快速切换窗口
    let thisYear = DateTime.now().getYear();
    let checkedYear = date.getYear();
    let viewYear = checkedYear - 10;
    if (viewYear < this.minYear) viewYear = this.minYear;
    for (let i = this.minYear; i <= this.maxYear; i++) {
        years.firstChild.appendChild($create('DIV', { innerHTML: i, className: (i == thisYear ? this.switchThisYearOptionClass : (i == checkedYear ? this.switchYearCheckedOptionClass : this.switchYearOptionClass)) }, { }, { 'year': 'v' + i }));
    }
    years.onclick = function(ev) {
        let option = ev.target;
        if (option.getAttribute('year') != null) {            
            let year = option.innerText.toInt();
            if (year != calendar.year) {
                this.querySelector('div[year=v' + calendar.year + ']').className = (calendar.year == DateTime.now().getYear() ? calendar.switchThisYearOptionClass : calendar.switchYearOptionClass);
                option.className = calendar.switchYearCheckedOptionClass;
                calendar.year = year;
            }
            
            $x(frame).fadeOut();
            $x(body).fadeIn(20);
            $x(title).fadeIn(50);    
        }
    }
    frame.appendChild(years);
    
    let thisYearButton = $create('BUTTON', { className: this.footButtonClass, innerHTML: this.thisYearText });
    frame.appendChild($create('DIV', { }, { textAlign: 'right', padding: '1rem 0.6rem 0.6rem 0.6rem' }));
    thisYearButton.onclick = function(ev) {
        let year = DateTime.now().getYear();
        if (year != calendar.year) {
            calendar.year = year;              
        }
        
        $x(frame).fadeOut();
        $x(body).fadeIn(20);
        $x(title).fadeIn(50);
    }
    frame.lastChild.appendChild(thisYearButton); 

    calendar.$renderYearCalendar(body, checkedYear);
    this.container.appendChild(body);

    this.container.appendChild(frame);
    $x(document.body).on('click', function(ev) {
        if (frame.style.display == '') {
            let target = ev.target;
            while(target.nodeName != 'BODY') {
                if (target.getAttribute('sign') != null && (target.getAttribute('sign') == 'CALENDAR-YEAR-SWITCH' || target.getAttribute('sign') == 'CALENDAR-OPEN-YEAR-SWITCH')) {
                    break;
                }
                else {
                    target = target.parentNode;
                }
            }
            if (target.nodeName == 'BODY') {
                $x(frame).fadeOut();
                $x(body).fadeIn(20);
                $x(title).fadeIn(50);
            }                        
        }                    
    });

    //格式化年选择框的宽度
    frame.style.width = body.firstChild.offsetWidth + 'px';
    if (years.firstChild.offsetHeight < years.offsetHeight) {
        years.style.height = years.firstChild.offsetHeight + 10 + 'px';
    }

    frame.querySelector('div[year=v' + viewYear + ']').scrollIntoView();
    frame.style.display = 'none';
}

Calendar.prototype.$renderYearCalendar = function(parentNode, year) {
    //clear first
    parentNode.innerHTML = '';

    let date = DateTime.of(year, 1, 1);
    if (year == this.minYear) {
        date.setMonth(this.minDate.takeAfter('-').takeBefore('-').toInt());
    }
    let max = 12;
    if (year == this.maxYear) {
        max = this.maxDate.takeAfter('-').takeBefore('-').toInt();
    }

    while (date.getYear() == year && date.getMonth() <= max) {
        parentNode.appendChild(this.$populateMonthContent(date, true));
        date.plusMonths(1);
    }
    
    for (let j = 0; j < parentNode.children.length; j++) {
        Animation('timing-function: ease; duration: ' + ((j + 1) * 100) + 'ms; from: x(0).y(0) 100% 0%; to: x(0).y(0) 100% 100%; fill-mode: forwards;')
            .apply(parentNode.children[j])
            .resetOnStop()
            .play();
    }

    this.switching = false;

    this.loading.add(year);
    this.loading.add(year + 1);
    this.loading.add(year - 1);
    this.loadExtraInfo();
}

Calendar.prototype.displayMonth = function() {

    let calendar = this;

    let date = this.date != '' ? new DateTime(this.date) : (this.startDate != '' ? new DateTime(this.startDate) : new DateTime());
    if (this.init.startsWith('=')) {
        date.setMonth(this.init.substring(1).toInt(1));
    }
    else if (this.init != '0') {
        date.plusMonths(eval(this.init));        
        while (date.get('yyyy-MM') < this.minMonth) {
            date.plusMonths(1);
        }
        while (date.get('yyyy-MM') > this.maxMonth) {
            date.plusMonths(-1);
        }        
    }

    this.container.setAttribute('current', date.get('yyyy-MM'));

    let head = $create('DIV', { className: this.headClass }, { display: 'flex', flexWrap: 'nowrap', justifyContent: 'center' }, { sign: 'CALENDAR-HEAD' });

    //没有考虑可以显示的月数小于要显示的月数的情况
    for (let i = 0; i < this.months; i++) {

        let table = $create('TABLE', { className: this.navClass, cellPadding: 0, cellSpacing: 0, border: 0 }, { });
        table.appendChild($create('TBODY'))
        let tr = $create('TR');
        tr.appendChild($create('TD', { }, { textAlign: 'left', width: '2.5rem' }));
        if (i == 0) {
            let prev = $create('BUTTON', { className: this.navMonthButtonClass, innerHTML: '&lt;' }, {  },  { sign: 'CALENDAR-PREV-MONTH' });            
            if (date.get('yyyy-MM') <= calendar.minMonth) {
                prev.disabled = true;
            }            
            prev.onclick = function(ev) {
                if (!calendar.switching) {
                    let currentMonth = calendar.container.getAttribute('current');
                    if (calendar.minDate == '' || currentMonth > calendar.minMonth) {
                        calendar.switching = true;
                        let prevMonth = currentMonth.toDateTime().plusMonths(-1);

                        let currentTable = calendar.container.querySelector('table[sign=M' + currentMonth + ']');
                        let prevTable = calendar.container.querySelector('table[sign=M' + prevMonth.get('yyyy-MM') + ']');

                        let unit = Math.round($x(calendar.contentFrame).width() / calendar.contentFrame.rows[0].cells.length);

                        if (prevTable == null) {
                            prevTable = calendar.$populateMonthContent(prevMonth);                    
                            currentTable.parentNode.parentNode.insertBefore($create('TD'), currentTable.parentNode);
                            currentTable.parentNode.previousElementSibling.appendChild(prevTable);
                            calendar.contentFrame.style.marginLeft = calendar.contentFrame.style.marginLeft.toInt(0) - unit + 'px';
                        }

                        //更新HEAD TEXT
                        let heads = calendar.container.querySelectorAll('td[sign=CALENDAR-YEAR-MONTH]');
                        for (let i = 0; i < heads.length; i++) {
                            heads[i].innerHTML = calendar.$getHeadText(prevMonth);
                            prevMonth.plusMonths(1);
                        }
                        prevMonth.plusMonths(- calendar.months); //reset
                        
                        Animation('timing-function: ease; duration: 0.6s; from: x(0).y(0) 100% 100%; to: x(' + unit + ').y(0) 100% 100%; fill-mode: forwards;')
                            .apply(calendar.contentFrame)
                            .resetOnStop()
                            .on('stop', function() {
                                    calendar.contentFrame.style.marginLeft = calendar.contentFrame.style.marginLeft.toInt(0) + unit + 'px';
                                    calendar.switching = false;
                                })
                            .play();                        

                        calendar.container.setAttribute('current', prevMonth.get('yyyy-MM'));

                        calendar.execute('onNavPrevMonth', prevMonth.get('yyyy-MM'));

                        if (prevMonth.get('yyyy-MM') <= calendar.minMonth) {
                            calendar.container.querySelector('button[sign=CALENDAR-PREV-MONTH]').disabled = true;
                        }
                        if (prevMonth.get('yyyy-MM') < calendar.maxMonth) {
                            calendar.container.querySelector('button[sign=CALENDAR-NEXT-MONTH]').disabled = false;
                        }

                        if (prevMonth.getMonth() == 1) {
                            calendar.loading.add(prevMonth.getYear() - 1);
                            calendar.loadExtraInfo();
                        }
                    }
                }
            }
            tr.firstChild.appendChild(prev);
        }
        else {
            tr.appendChild($create('TD', { innerHTML: '&nbsp;' }));
        }
        tr.appendChild($create('TD', {
            innerHTML: this.$getHeadText(date),
            className: this.headTitleClass }, { textAlign: 'center' }, { sign: 'CALENDAR-YEAR-MONTH', index: i }));
        tr.appendChild($create('TD', { }, { textAlign: 'right', width: '2.5rem' }));
        if (i == this.months - 1) {
            let next = $create('BUTTON', { className: this.navMonthButtonClass, innerHTML: '&gt;' }, { marginLeft: 'auto' },  { sign: 'CALENDAR-NEXT-MONTH' });
            if (date.get('yyyy-MM') >= calendar.maxMonth) {
                next.disabled = true;
            }            
            next.onclick = function(ev) {
                if (!calendar.switching) {
                    let lastMonth = calendar.container.getAttribute('current').toDateTime().plusMonths(calendar.months - 1);
                    if (lastMonth.get("yyyy-MM") < calendar.maxMonth) {
                        calendar.switching = true;
                        
                        let currentTable = calendar.container.querySelector('table[sign=M' + lastMonth.get('yyyy-MM') + ']');

                        let nextMonth = lastMonth.plusMonths(1);
                        let nextTable = calendar.container.querySelector('table[sign=M' + nextMonth.get('yyyy-MM') + ']');

                        let unit = Math.round($x(calendar.contentFrame).width() / calendar.contentFrame.rows[0].cells.length);

                        if (nextTable == null) {
                            nextTable = calendar.$populateMonthContent(nextMonth);                    
                            if (currentTable.parentNode.nextElementSibling == null) {
                                currentTable.parentNode.parentNode.appendChild($create('TD'));
                            }
                            else {
                                currentTable.parentNode.parentNode.insertBefore($create('TD'), currentTable.parentNode.nextElementSibling);
                            }                    
                            currentTable.parentNode.nextElementSibling.appendChild(nextTable);                    
                        }
                        
                        calendar.container.querySelector('td[sign=CALENDAR-YEAR-MONTH]').innerHTML = calendar.$getHeadText(nextMonth);
                        let heads = calendar.container.querySelectorAll('td[sign=CALENDAR-YEAR-MONTH]');
                        for (let i = heads.length -1; i >=0; i--) {
                            heads[i].innerHTML = calendar.$getHeadText(nextMonth);
                            nextMonth.plusMonths(-1);
                        }
                        nextMonth.plusMonths(calendar.months);
                        
                        Animation('timing-function: ease; duration: 0.6s; from: x(0).y(0) 100% 100%; to: x(-' + unit + ').y(0) 100% 100%; fill-mode: forwards;')
                            .apply(calendar.contentFrame)
                            .resetOnStop()
                            .on('stop', function() {
                                    calendar.contentFrame.style.marginLeft = calendar.contentFrame.style.marginLeft.toInt(0) - unit + 'px';
                                    calendar.switching = false;
                                })
                            .play();                       

                        calendar.execute('onNavNextMonth', nextMonth.get('yyyy-MM'));
                        
                        if (nextMonth.get('yyyy-MM') > calendar.minMonth) {
                            calendar.container.querySelector('button[sign=CALENDAR-PREV-MONTH]').disabled = false;
                        }                        
                        if (nextMonth.get('yyyy-MM') >= calendar.maxMonth) {
                            calendar.container.querySelector('button[sign=CALENDAR-NEXT-MONTH]').disabled = true;
                        }
                        
                        calendar.container.setAttribute('current', nextMonth.plusMonths(-calendar.months + 1).get('yyyy-MM'));

                        if (nextMonth.getMonth() + calendar.months - 1 == 12) {
                            calendar.loading.add(nextMonth.getYear() + 1);
                            calendar.loadExtraInfo();
                        }
                    }
                }
            }
            tr.lastChild.appendChild(next);
        }
        else {
            tr.appendChild($create('TD', { innerHTML: '&nbsp;' }));
        }     
        table.firstChild.appendChild(tr);
        head.appendChild(table);

        date.plusMonths(1);
    }
    this.container.appendChild(head);
 
    //reset
    date.plusMonths(-this.months);

    //快速切换窗口
    let frame = $create('DIV', { className: this.switchFrameClass }, { position: 'absolute', zIndex: 1001, visibility: 'visible' }, { sign: 'CALENDAR-MONTH-SWITCH' });
    frame.appendChild($create('DIV', { innerHTML: '' }, { 'height': '0.2rem' }));
    let years = $create('DIV', { }, { overflow: 'auto', height: '24rem' });
    years.appendChild($create('DIV'));
    for (let i = calendar.minYear; i <= calendar.maxYear; i++) {
        let year = $create('DIV', { innerHTML: i, className: this.switchYearHeadClass }, { }, { year: 'v' + i });
        year.onclick = function(ev) {
            $x(this.nextElementSibling).toggle();
            if (this.nextElementSibling.style.display == '') {
                if (this.parentNode.offsetHeight < $x(years).attr('height').toInt()) {
                    $x(years).height(this.parentNode.offsetHeight + 10);
                }
            }
        }
        years.firstChild.appendChild(year);

        let months = $create('TABLE', { border: 0, cellPadding: 5, cellSpacing: 2 }, { margin: '0.1rem 0', display: (i != calendar.year ? 'none': '') });
        months.appendChild($create('TBODY'));        
        let start = 1;
        let end = 12;
        if (i == calendar.minYear) {
            start = calendar.minMonth.takeAfter('-').toInt();
        }
        if (i == calendar.maxYear) {
            end = calendar.maxMonth.takeAfter('-').toInt();
        }

        let k = 0;
        for (let j = start; j <= end; j++) {
            if (k % 3 == 0) {
                months.firstChild.appendChild($create('TR'));
            }
            months.firstChild.lastChild.appendChild($create('TD', { innerHTML: this.monthNames[j - 1], className: (DateTime.now().get('yyyy-MM') == i + '-' + j.toString().padStart(2, '0') ? this.switchThisMonthOptionClass : this.switchMonthOptionClass) }, { }, { month: 'v' + i + '-' + j.toString().padStart(2, '0') }));
            k ++;
        }
        years.firstChild.appendChild(months);
    }
    years.onclick = function(ev) {
        let option = ev.target;
        if (option.nodeName == 'TD' && option.getAttribute('month') != null) {
            let month = option.getAttribute('month').substring(1);
            if (month != calendar.month) {
                this.querySelector('td[month=v' + calendar.month + ']').className = (calendar.month == DateTime.now().get('yyyy-MM') ? calendar.switchThisMonthOptionClass : calendar.switchMonthOptionClass);
                option.className = calendar.switchMonthCheckedOptionClass;
                calendar.month = month;
            }
            
            $x(frame).fadeOut();
            $x(body).fadeIn(20);
            $x(body.nextElementSibling).fadeIn(20);
        }
    }
    frame.appendChild(years);
    //本月按钮
    let thisMonthButton = $create('BUTTON', { className: this.footButtonClass, innerHTML: this.thisMonthText });
    frame.appendChild($create('DIV', { }, { textAlign: 'right', padding: '1rem 0.6rem 0.6rem 0.6rem' }));
    thisMonthButton.onclick = function(ev) {
        let index = frame.getAttribute('head').toInt();
        let month = DateTime.now().plusMonths(-index).get('yyyy-MM');
        if (month != calendar.month) {
            calendar.month = month;
        }        
        $x(frame).fadeOut();
        $x(body).fadeIn(20);
        $x(body.nextElementSibling).fadeIn(20);
    }
    frame.lastChild.appendChild(thisMonthButton); 

    //显示快速切换
    $x(head).on('click', function(ev) {
        let target = ev.target;
        if (target.nodeName == 'I') {
            target = target.parentNode;
        }
        if (target.nodeName == 'A') {
            let month = target.getAttribute('value');
            $x(frame).attr('head', target.parentNode.getAttribute('index'));
            let checked = $x(years).select('td.' + calendar.switchMonthCheckedOptionClass);
            if (checked.nonEmpty() && checked.attr('month') != 'v' + month) {
                checked.css(checked.attr('month') != DateTime.now().get('vyyyy-MM') ? calendar.switchMonthOptionClass : calendar.switchThisMonthOptionClass);                    
            }
            $x(years).select('td[month=v' + month + ']').css(calendar.switchMonthCheckedOptionClass);
            $x(calendar.container)
                .select('div[sign=CALENDAR-MONTH-SWITCH]')
                .style('visibility', 'visible')
                .show()
                .left(
                    $x(target).left() + $x(target).width() / 2 - $x(frame).width() / 2
                )
                .top(                
                    $x(body).top() - 8
                ).fadeIn();

            $x(body).fadeOut(20);
            $x(body.nextElementSibling).fadeOut(20);
        }
    });

    let body = $create('DIV', { className: this.bodyClass }, { overflow: 'hidden' }, { sign: 'CALENDAR-BODY' });
    let content = $create('TABLE', { }, { cellPadding: 0, cellSpacing: 0, border: 0 }, { sign: 'CALENDAR-CONTENT' });
    content.appendChild($create('TBODY'));
    content.firstChild.appendChild($create('TR'));
    for (let i = 0; i < this.months; i++) {
        content.rows[0].appendChild($create('TD'))
        content.rows[0].cells[i].appendChild(this.$populateMonthContent(date));
        this.loading.add(date.getYear());
        date.plusMonths(1);
    }
    body.appendChild(content);
    this.container.appendChild(body);
    this.contentFrame = content;

    if (this.mode != 'NONE') {
        this.container.appendChild($create('DIV', { className: this.footClass }, { }, { sign: 'CALENDAR-FOOT'}));
        let button = $create('BUTTON', { className: this.footButtonClass });
        if (this.mode == 'DAY') {
            button.innerHTML = this.todayText;
            button.onclick = function() {
                let value = DateTime.now().get('yyyy-MM-dd');
                let month = value.takeBeforeLast('-');
                if (calendar.months == 1 ? month != calendar.month : (month < calendar.month || month > calendar.month.toDateTime().plusMonths(calendar.months).get('yyyy-MM'))) {
                    calendar.month = month;
                }
                if (calendar.date != value) {
                    calendar.execute('onDaySelected', calendar.date);
                    calendar.date = value;

                    if (calendar.element != null) {
                        calendar.element.value = calendar.date;
                    }
                }                
                //如果是日期选择框，选中即隐藏
                if (calendar.element != null) {                    
                    $x(calendar.container).fadeOut();
                }                
            }
        }
        else if (this.mode == 'WEEK') {
            button.innerHTML = this.thisWeekText;
            button.onclick = function() {
                let timeout = 100;
                let month = DateTime.now().get('yyyy-MM');
                if (calendar.months == 1 ? month != calendar.month : (month < calendar.month || month > calendar.month.toDateTime().plusMonths(calendar.months).get('yyyy-MM'))) {
                    calendar.month = month;
                    timeout = 600;
                }

                window.setTimeout(function() {
                    let value = calendar.container.querySelector('td[day=v' + DateTime.now().get('yyyy-MM-dd') + ']').parentNode.getAttribute('value');
                    if (calendar.week != value) {
                        calendar.week = value;

                        let year = calendar.week.takeBefore('-');
                        let week = calendar.week.takeAfter('-');                 
                    
                        if (calendar.element != null) {                            
                            calendar.element.value = navigator.language.toLowerCase() == 'zh-cn' ? '第 ' + week + ' 周, ' + year : 'Week ' + week + ', ' + year;
                            calendar.element.setAttribute('week', calendar.week);
                            calendar.element.setAttribute('start', calendar.startDate);
                            calendar.element.setAttribute('end', calendar.endDate);
                        }

                        calendar.execute('onWeekSelected', year.toInt(), week.toInt(), calendar.startDate, calendar.endDate);
                    }

                    if (calendar.element != null) {
                        $x(calendar.container).fadeOut();
                    }
                }, timeout);
            }
        }
        else {
            button.innerHTML = this.confirmText;
            button.onclick = function(ev) {
                let startDate = calendar.startDate;
                let endDate = calendar.endDate;

                if (calendar.element != null) {  
                    calendar.element.value = navigator.language.toLowerCase() == 'zh-cn' ? startDate + ' ~ ' + endDate : startDate + ' to ' + endDate;
                    calendar.element.setAttribute('start', startDate);
                    calendar.element.setAttribute('end', endDate);
                }

                $x(calendar.container).fadeOut();
            }

            if (calendar.element == null) {
                button.style.display = 'none';
            }
        }
        this.container.lastChild.appendChild(button);
    }

    let width = 0;
    for (let i = 0; i < this.months; i++) {
        head.children[i].style.width = content.rows[0].cells[i].firstChild.offsetWidth + 'px';
        width += content.rows[0].cells[i].firstChild.offsetWidth;
        //content.rows[0].cells[i].firstChild.style.width = content.rows[0].cells[i].firstChild.offsetWidth + 'px';
    }
    body.style.width = (width + 12 * this.months) + 'px';
    $x(this.container).select('div[sign=CALENDAR-FOOT]').width(body.offsetWidth);

    this.loadExtraInfo();

    this.container.appendChild(frame);
    $x(document.body).on('click', function(ev) {
        if (frame.style.display == '' && frame.style.visibility == 'visible') {
            let target = ev.target;
            while(target.nodeName != 'BODY') {
                if (target.getAttribute('sign') != null && (target.getAttribute('sign') == 'CALENDAR-MONTH-SWITCH' || target.getAttribute('sign') == 'CALENDAR-OPEN-MONTH-SWITCH')) {
                    break;
                }
                else {
                    target = target.parentNode;
                }
            }
            if (target.nodeName == 'BODY') {
                $x(frame).fadeOut();
                $x(body).fadeIn(20);
            }                        
        }                    
    });
    //格式化月选择框的宽度
    if (years.firstChild.offsetHeight < years.offsetHeight) {
        years.setAttribute('height', years.offsetHeight);
        years.style.height = years.firstChild.offsetHeight + 10 + 'px';        
    }

    frame.querySelector('div[year=v' + (this.year > this.minYear ? this.year - 1 : this.year) + ']').scrollIntoView();
    frame.style.width = frame.offsetWidth + 5 + 'px';
    $x(frame).left(-1000).top(-1000).style('visibility', 'hidden');
}

Calendar.prototype.loadExtraInfo = function() {
    let years = [];
    for (let year of this.loading) {
        if (Calendar.LUNAR[year + '-01-01'] == null) {
            years.push(year);
        }
    }

    if (years.length > 0 && (this.lunar || this.holiday)) {
        if (this.extensionApi != '') {
            let calendar = this;
            //自定义节假日, 接收一或多个年份
            $GET(this.extensionApi + years.join(','))
                .success(function(data) {
                    for (let day in data) {
                        Calendar.LUNAR[day] = data[day];
                    }

                    calendar.container.querySelectorAll('td[extra]')
                        .forEach(td => {
                            let cell = new CalendarCell(td);
                            let day = Calendar.LUNAR[td.getAttribute('value')];
                            if (day != null) {
                                if (day.workday > -1) {
                                    cell.corner = calendar.cornerNames[day.workday];
                                    if (cell.className != calendar.disabledDayClass) {
                                        cell.className = day.workday == 1 ? calendar.workdayClass  : calendar.holidayClass;
                                    }                                    
                                }

                                if (calendar.lunar) {
                                    cell.updateLunar();
                                }
                                td.removeAttribute('extra'); 
                            }
                        })
                });
        }
    }
}

Calendar.prototype.getCell = function(day) {
    let cell = this.container.querySelector('td[day=v' + day +']');
    if (cell != null) {
        return new CalendarCell(cell);
    }
    else {
        return null;
    }
}

class CalendarCell {
    constructor(cell) {
        this.cell = cell;
        this.value = cell.getAttribute('value');
        this.$date = new DateTime(this.value);
    }

    get date() {
        return this.$date;
    }

    get corner() {
        return this.cell.children[0].innerHTML;
    }

    set corner(corner) {
        this.cell.children[0].innerHTML = corner;
        this.cell.children[0].style.display = (corner != '' ? '' : 'none');
    }

    get day() {
        return this.cell.children[1].innerHTML.toInt();
    }

    set day(day) {
        this.cell.children[1].innerHTML = day;
    }

    get lunar() {
        return this.cell.children[2].innerHTML.$trim();
    }

    set lunar(lunar) {
        this.cell.children[2].innerHTML = lunar;        
        this.cell.children[2].style.display = '';
    }

    get cornerClass() {
        return this.cell.children[0].className;
    }

    set cornerClass(className) {
        this.cell.children[0].className = className;
    }

    get dayClass() {
        return this.cell.children[1].className;
    }

    set dayClass(className) {
        this.cell.children[1].className = className;
    }

    get lunarClass() {
        return this.cell.children[2].className;
    }

    set lunarClass(className) {
        this.cell.children[2].className = className;
    }

    get className() {
        return this.cell.className;
    }

    set className(className) {
        this.cell.className = className;
    }
}

CalendarCell.prototype.updateLunar = function() {
    this.lunar = this.date.getLunar();
}

Calendar.initializeAll = function() {
    for (let calendar of document.querySelectorAll('Calendar,input[type=calendar]')) {
        new Calendar(calendar).display();
    }    
}

$finish(function() {
    Calendar.initializeAll();    
});