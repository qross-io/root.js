

DateTime = function(value) {

    //支持格式
    //yyyyMMdd
    //yyyyMMddHHmmss

    //yyyy-MM-dd HH:mm:ss

    if (typeof(value) == 'string') {
        let [year, month, day, hour, minute, second] = [0, 0, 1, 0, 0, 0];
        if (/^\d+$/.test(value)) {
            if (value.length < 4) {
                throw new Error('Unsupported date format: ' + value);
            }
            else {
                year = value.substring(0, 4).toInt();
            }
            if (value.length >= 6) {
                month = value.substring(4, 6).toInt() - 1;
            }
            if (value.length >= 8) {
                day = value.substring(6, 8).toInt();
            }
            if (value.length >= 10) {
                hour = value.substring(8, 10).toInt();
            }
            if (value.length >= 12) {
                minute = value.substring(10, 12).toInt();
            }
            if (value.length >= 14) {
                second = value.substring(12, 14).toInt();
            }
        }
        else if (/^\d{4}[-/]\d{2}[-/]\d{2}/i.test(value)) {
            year = value.substring(0, 4).toInt();
            month = value.substring(5, 7).toInt() - 1;
            day = value.substring(8, 10).toInt();
            //2019-03-01 19:20:21
            if (value.length >= 13) {
                hour = value.substring(11, 13).toInt();
            }
            if (value.length >= 16) {
                minute = value.substring(14, 16).toInt();
            }
            if (value.length >= 19) {
                second = value.substring(17, 19).toInt();
            }
        }

        if (year > 0) {
            value = new Date(year, month, day, hour, minute, second);
        }
    }

    if (value instanceof Date) {
        this.date = value;
    }
    else if (value != null && value != '') {
        //try to parse
        this.date = new Date(value);    
    }
    else {
        this.date = new Date();
    }

    if (this.date == 'Invalid Date') {
        throw new Error(this.date + ' ' + value);
    }
}

DateTime.of = function(year, month = 1, dayOfMonth = 1, hour = 0, minute = 0, second = 0, milli = 0) {
    return new DateTime(new Date(year, month - 1, dayOfMonth, hour, minute, second, milli));
}

//DateTime.
DateTime.allWeekNames = {
    '星期一': 1,
    '星期二': 2,
    '星期三': 3,
    '星期四': 4,
    '星期五': 5,
    '星期六': 6,
    '星期日': 0,
    '星期天': 0,
    '周一': 1,
    '周二': 2,
    '周三': 3,
    '周四': 4,
    '周五': 5,
    '周六': 6,
    '周日': 0,
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '日': 0,  
    'MO': 1,
    'TU': 2,
    'WE': 3,
    'TH': 4,
    'FR': 5,
    'SA': 6,
    'SU': 0
}

DateTime.shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
DateTime.fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

DateTime.prototype.get = function (style = 'yyyy-MM-dd HH:mm:ss') {

    // 2018-08-01 13:05:03.235
    // yyyy 2018  getFullYear()
    // yy 18   getYear()
    // MMMM
    // MMM
    // MM 08  getMonth() + 1
    // M 8
    // dd 01    getDate()
    // d 1
    // HH 13    getHours()
    // H 13
    // mm 05    getMinutes()
    // m 5
    // ss 03    getSeconds()
    // s 3  get
    // SSS 235   getMilliseconds

    let values = {
        'yyyy': this.date.getFullYear().toString(),
        'yy': this.date.getFullYear().toString().substring(2),
        'MMMM': DateTime.fullMonthNames[this.date.getMonth()],
        'MMM': DateTime.shortMonthNames[this.date.getMonth()],
        'MM': (this.date.getMonth() + 1).toString().padStart(2, '0'),
        'M': (this.date.getMonth() + 1).toString(),
        'dd': this.date.getDate().toString().padStart(2, '0'),
        'd': this.date.getDate().toString(),
        'HH': this.date.getHours().toString().padStart(2, '0'),
        'H': this.date.getHours().toString(),
        'mm': this.date.getMinutes().toString().padStart(2, '0'),
        'm': this.date.getMinutes().toString(),
        'ss': this.date.getSeconds().toString().padStart(2, '0'),
        's': this.date.getSeconds().toString(),
        'SSS': this.date.getMilliseconds().toString().padStart(3, '0')
    }

    for (let name in values) {
        let rex = new RegExp(name, 'g');
        if (rex.test(style)) {
            style = style.replace(rex, values[name]);
        }
    }

    return style;
}

DateTime.prototype.toString = function() {
    return this.get('yyyy-MM-dd HH:mm:ss');
}

DateTime.prototype.toDateString = function() {
    return this.date.getFullYear().toString() + '-' + (this.date.getMonth() + 1).toString().padStart(2, '0') + '-' + this.date.getDate().toString().padStart(2, '0');
}

DateTime.prototype.toTimeString = function() {
    return this.date.getHours().toString().padStart(2, '0') + ':'+ this.date.getMinutes().toString().padStart(2, '0') + ':' + this.date.getSeconds().toString().padStart(2, '0');
}

DateTime.prototype.getYear = function() {
    return this.date.getFullYear();    
}

DateTime.prototype.getMonth = function() {
    return this.date.getMonth() + 1;
}

DateTime.prototype.getDayOfMonth = function() {
    return this.date.getDate();
}

DateTime.prototype.getWeek = function() {
    return this.date.getDay();
}

DateTime.prototype.getWeekName = function() {
    
}

DateTime.prototype.getHour = function() {
    return this.date.getHours();
}

DateTime.prototype.getHourString = function() {
    return this.getHour().toString().padStart(2, '0');
}

DateTime.prototype.getMinute = function() {
    return this.date.getMinutes();
}

DateTime.prototype.getMinuteString = function() {
    return this.getMinute().toString().padStart(2, '0');
}

DateTime.prototype.getSecond = function() {
    return this.date.getSeconds();
}

DateTime.prototype.getSecondString = function() {
    return this.getSecond().toString().padStart(2, '0');
}

DateTime.prototype.getMilli = function() {
    return this.date.getMilliseconds();
}

DateTime.prototype.getWeekOfYear = function(firstDay = 'MON') {

    firstDay = DateTime.parseWeek(firstDay);
    let beginDay = DateTime.of(this.getYear(), 1, 1);
    let offset = (7 + firstDay - beginDay.getWeek()) % 7;
    beginDay.plusDays(offset);

    if (this.before(beginDay)) {
        return 1;
    }
    else {
        return Math.ceil(this.daysSpan(beginDay) / 7 + 0.01) + 1;
    }

    //2, 1, 7 = 6
    //3, 1, 7 = 5
    //4, 1, 7 = 4
    //5, 1, 7 = 3
    //6, 1, 7 = 2
    //0, 1, 7 = 1
    //1, 1, 7 = 0

    //2, 3, 7 = 1
    //3, 3, 7 = 0
    //4, 3, 7 = 6
    //5, 3, 7 = 5
    //6, 3, 7 = 4
    //0, 3, 7 = 3
    //1, 3, 7 = 2
}

DateTime.prototype.setYear = function(year) {
    this.date.setFullYear(year);
    return this;
}

DateTime.prototype.setMonth = function(month = 1) {
    if (month > 12) month = 12;
    if (month < 0) month = 1;
    this.date.setMonth(month - 1);

    return this;
}

//31可设置到某月的最后一天
DateTime.prototype.setDayOfMonth = function(dayOfMonth = 1) {
    if (typeof(dayOfMonth) == 'string' && /l/i.test(dayOfMonth)) {
        dayOfMonth = 31;
    }

    let month = this.date.getMonth();
    this.date.setDate(dayOfMonth);
    while (this.date.getMonth() > month) {
        this.plusDays(-1);
    }
    return this;
}

DateTime.prototype.setDay = function(dayOfMonth) {
    this.date.setDate(dayOfMonth);
    return this;
}

DateTime.prototype.setHour = function(hour = 0) {
    this.date.setHours(hour);
    return this;
}

DateTime.prototype.setMinute = function(minute = 0) {
    this.date.setMinutes(minute);
    return this;
}

DateTime.prototype.setSecond = function(second = 0) {
    this.date.setSeconds(second);
    return this;
}

DateTime.prototype.setMilli = function(milli = 0) {
    this.date.setMilliseconds(milli);
    return this;
}

DateTime.prototype.before = function(other) {
    return this.toEpoch() < other.toEpoch();
}

DateTime.prototype.beforeOrEquals = function(other) {
    return this.toEpoch() <= other.toEpoch();
}

DateTime.prototype.equals = function(other) {
    return this.toEpoch() == other.toEpoch();
}

DateTime.prototype.after = function(other) {
    return this.toEpoch() > other.toEpoch();
}

DateTime.prototype.afterOrEquals = function(other) {
    return this.toEpoch() >= other.toEpoch();
}

DateTime.prototype.between = function(start, end) {
    if (typeof(start) == 'string') {
        if (start == '') {
            return false;
        }
        else {
            start = new DateTime(start);
        }
    }
    if (typeof(end) == 'string') {
        if (end == '') {
            return false;
        }
        else {
            end = new DateTime(end);
        }
    }

    if (start == null || end == null) {
        return false;
    }
    else {
        return this.afterOrEquals(start) && this.beforeOrEquals(end);
    }
}

//当前月大于比较月为正
DateTime.prototype.monthsSpan = function(other) {
    let otherYear = (typeof(other) == 'string' ? other.takeBefore('-').toInt() : other.getYear());
    let otherMonth = (typeof(other) == 'string' ? other.takeAfter('-').toInt() : other.getMonth());
    return (this.getYear() - otherYear) * 12 + (this.getMonth() - otherMonth);    
}

//当前日期大于比较日期为正
DateTime.prototype.daysSpan = function(other) {
    return Math.floor((this.toEpoch() - other.toEpoch()) / 86400);    
}

DateTime.prototype.hoursSpan = function(other) {
    return Math.floor((this.toEpoch() - other.toEpoch()) / 3600);
}

DateTime.prototype.minutsSpan = function(other) {
    return Math.floor((this.toEpoch() - other.toEpoch()) / 60);
}

DateTime.prototype.secondsSpan = function(other) {
    return this.toEpoch() - other.toEpoch();
}


DateTime.parseWeek = function(weekName) {
    if (typeof(weekName) == 'number') {
        weekName = weekName % 7;        
    }
    else if (typeof(weekName) == 'string') {
        if (/^\d+$/.test(weekName)) {
            weekName = weekName.toInt() % 7;
        }
        else if (/[a-z]/i.test(weekName)) {
            if (weekName.length > 2) {
                weekName = weekName.substring(0, 2);
            }
            weekName = weekName.toUpperCase();
        }

        if (DateTime.allWeekNames[weekName] != null) {
            weekName = DateTime.allWeekNames[weekName];
        }
    }

    return typeof(weekName) == 'number' ? weekName : 1;
}

DateTime.prototype.plusYears = function(years) {
    return this.setYear(this.getYear() + years);
}

DateTime.prototype.plusMonths = function(months) {
    if (months != 0) {    
        let month = this.date.getMonth();
        this.date.setMonth(month + months);
        while (month == this.date.getMonth()) {
            this.date = new Date(this.date.valueOf() - 86400 * 1000);
        }
    }
    return this;
}

DateTime.prototype.plusDays = function(days) {
    this.date = new Date(this.date.valueOf() + days * 86400 * 1000);
    return this;
}

DateTime.prototype.plusHours = function(hours) {
    this.date = new Date(this.date.valueOf() + hours * 3600 * 1000);
    return this;
}

DateTime.prototype.plusMinutes = function(minutes) {
    this.date = new Date(this.date.valueOf() + days * minutes * 1000);
    return this;
}

DateTime.prototype.plusSeconds = function(seconds) {
    this.date = new Date(this.date.valueOf() + seconds * 1000);
    return this;
}

DateTime.prototype.plusMillis = function(millis) {
    this.date = new Date(this.date.valueOf() + millis);
    return this;
}

DateTime.prototype.toEpoch = function () {
    return Math.floor(this.date.valueOf() / 1000);
}

DateTime.prototype.later = function(other) {
    return this.toEpoch() - (other instanceof DateTime ? other.toEpoch() : new DateTime(other).toEpoch()); 
}

DateTime.prototype.earlier = function(other) {
    return (other instanceof DateTime ? other.toEpoch() : new DateTime(other).toEpoch()) - this.toEpoch();
}

DateTime.prototype.span = function(other) {
    return Math.abs((other instanceof DateTime ? other.toEpoch() : new DateTime(other).toEpoch()) - this.toEpoch());
}

DateTime.now = function() {
    return new DateTime();
}

DateTime.today = function(format = 'yyyy-MM-dd') {
    return new DateTime().get('yyyy-MM-dd');
}

DateTime.getCalendar = function(year, month, firstDay = 'MON') {
    
    firstDay = DateTime.parseWeek(firstDay);
    let date = DateTime.of(year, month, 1);

    while (date.getWeek() != firstDay) {
        date.plusDays(-1);
    }

    let calendar = new Array();        
    for (let i = 0; i < 6; i++) {
        calendar.push(new Array(8).fill(0));        
    }

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 8; j++) {
            if (j > 0) {
                calendar[i][j] = {
                    'date': date.get('yyyy-MM-dd'),
                    'year': date.getYear(),
                    'month': date.getMonth(),
                    'dayOfMonth': date.getDayOfMonth(),
                    'workday': date.getWorkday(),
                    'isOtherMonth': date.getMonth() != month,
                    'lunar': date.getLunar()
                };
                //新年第一周
                if (month == 1 && i == 0 && j == 7) {
                    calendar[0][0] = { 'year': date.getYear(), 'weekOfYear': 1 };
                }
                date.plusDays(1);
            }
            else {
                calendar[i][0] = { 'year': date.getYear(), 'weekOfYear': date.getWeekOfYear(firstDay) };
            }
        }
    }

    return calendar;
}

//天干地支年份
DateTime.prototype.getGanZhiYear = function() {
    //如果知道某一年的天干地支，也可以直接推算其它年份的天干地支。
    //举个例子，如果知道2000年是庚辰龙年，则2012年的干支可以这样推算：（2012-2000）% 10=2，2012年的天干就是从庚开始向后推2个天干，即壬；
    //2012年的地支可以这样推算：（2012 - 2000）% 12 = 0，2012年的地支仍然是辰，因此2012年的天干地支就是壬辰，十二生肖龙年。
    //对于2000年以前的年份，计算出年份差后只要将天干和地支向前推算即可。
    //例如1995年的干支可以这样计算：（2000 – 1995）%10 = 5，（2000 – 1995）%12 = 5，庚向前推算5即是乙，辰向前推算5即是亥，因此1995年的干支就是乙亥，十二生肖猪年

    let GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    let ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    let diff = this.getYear() - 2000;
    let gan = (6 + diff) % 10;
    let zhi = (4 + diff) % 12;

    if (gan < 0) {
        gan += 10;
    }
    if (zhi < 0) {
        zhi += 12;
    }

    return GAN[gan] + ZHI[zhi];
}

DateTime.prototype.getZodiac = function() {
    let ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    let diff = this.getYear() - 2000;
    let zhi = (4 + diff) % 12;
    if (zhi < 0) {
        zhi += 12;
    }

    return  ZODIAC[zhi];
}

DateTime.prototype.getLunarMonth = function() {
    let date = this.toDateString();
    if (document.calendars != null && Calendar.LUNAR[date] != null) {
        return Calendar.LUNAR[date]['lunar_month'];
    }
    else {
        return 'N/A';
    }
}

DateTime.prototype.getLunarDay = function() {
    let date = this.toDateString();
    if (document.calendars != null && Calendar.LUNAR[date] != null) {
        return Calendar.LUNAR[date]['lunar_day'];
    }
    else {
        return 'N/A';
    }
}

DateTime.prototype.getLunar = function() {
    let date = this.toDateString();
    if (document.calendars != null && Calendar.LUNAR[date] != null) {
        let day = Calendar.LUNAR[date]['lunar_day'];
        let term = Calendar.LUNAR[date]['solar_term'];
        let festival = Calendar.LUNAR[date]['festival'];

        let lunar = (festival != '' ? festival : (term != '' ? term : day));
        if (lunar.length == 2) {
            return '&nbsp;' + lunar + '&nbsp;';
        }
        else {
            return lunar;
        }
    }
    else {
        return 'N/A';
    }
}

DateTime.prototype.getFestival = function() {
    let date = this.toDateString();
    if (document.calendars != null && Calendar.LUNAR[date] != null) {
        return Calendar.LUNAR[date]['festival'];
    }
    else {
        return 'N/A';
    }
}

DateTime.prototype.getWorkday = function() {
    let date = this.toDateString();
    let workday = -1;
    if (document.calendars != null && Calendar.LUNAR[date] != null) {
        //2 特殊休息日 3 特殊工作日
        workday = Calendar.LUNAR[date]['workday'];
    }    

    if (workday == -1) {
        //0 正常休息日 1 正常工作日
        return this.getWeek() % 6 == 0 ? 0 : 1;
    }
    else {
        return workday + 2;
    }
}

DateTime.prototype.setWorkday = function(workday) {
    let date = this.toDateString();
    if (document.calendars != null && Calendar.LUNAR[date] != null) {
        Calendar.LUNAR[date].workday = workday == -1 ? -1 : workday - 2;
    }    
}

DateTime.prototype.copy = function() {
    return DateTime.of(this.getYear(), this.getMonth() - 1, this.getDayOfMonth(), this.getHour(), this.getMinute(), this.getSecond(), this.getMilli());
}

String.prototype.toDateTime = function() {
    return new DateTime(this.toString());
}

String.prototype.toDateInt = function(format = 'yyyy-MM-dd') {
    switch (format) {
        case 'yyyy-MM-dd':
            return this.toString().replace(/-/g, '').toInt();
        case 'yyyy/MM/dd':
            return this.toString().replace(/\//g, '').toInt();
        case 'dd/MM/yyyy':
            let str = this.toString();
            return (str.substring(6) + str.substring(4, 6) + str.substring(0, 2)).toInt();
        default:
            return this.toString().replace(/-/g, '').replace(/\//g, '').toInt();
    }
}

String.prototype.isDateTime = function() {
    return /^\d{4}-\d{2}-\d{2} \d\d:\d\d:\d\d$/.test(this.toString());
}

String.prototype.isDate = function() {
    return /^\d{4}-\d{2}-\d{2}$/.test(this.toString());
}

String.prototype.isTime = function() {
    return /^(\d\d:)?\d\d:\d\d$/.test(this.toString());
}

Number.prototype.toTimeSpan = function(max) {
    let span = '';
    let rem = this;
    let over = '';
    if (rem >= 0) {
        if (max != null) {
            if (rem > max) {
                rem = max;
                over = '+';
            }
        }

        if (rem > 3600 * 24) {
            span += Math.floor(rem / 3600 / 24) + 'd';
            rem = rem % (3600 * 24);
        }
        if (rem > 3600) {
            span += Math.floor(rem / 3600) + 'h';
            rem = rem % 3600;
        }
        if (rem > 60) {
            span += Math.floor(rem / 60) + 'm';
            rem = rem % 60;
        }
        if (span == '' || rem > 0) {
            span += rem + 's';
        }

        span += over;
    }
    else {
        span = 'N/A';
    }
    
    return span;
}