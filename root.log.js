
class Log {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
			name: 'Log_' + document.components.size,
			
            loadingText: 'Loading...',
            autoStart: true,
            terminal: '',
            interval: 1000,
            delay: 3, //在结束后延长加载几次
            loadUntilEmpty: true, //直到没有日志时才结束加载

            data: '',
            await: '',
            _cursor: 0, //初始值

            filter: '', //日志过滤

            onload: null, //所有日志加载完成。第一次。
            onreload: null, //重新加载日志，参数可能会被改变。以后每一次都触发。
            onterminate: null //达到中止条件
		})
		.elementify(element => {
            this.element = element;
            this.container = $create('DIV', { className: 'logs' });
            this.element.insertAdjacentElement('beforeBegin', this.container);
            if (this.interval < 0) {
                this.interval = 1000;
            }

            this.loadingTextDiv = $create('DIV', { innerHTML: '<img src="' + $root.images + 'spinner.gif" align="absmiddle" /> ' + this.loadingText }, { display: 'none' });
            this.element.insertAdjacentElement('beforeBegin', this.loadingTextDiv);
        });
    }

    get cursor() {
        return this.element.getAttribute('cursor')?.toInt() ?? 0;
    }

    set cursor(cursor) {
        this.element.setAttribute('cursor', cursor);
    }
}

Log.prototype.timer = null;

Log.prototype.loading = false; //是否正在加载，请求接口前设置为 true，请求接口完成后为 false
Log.prototype.terminated = false; //是否达成中断条件
Log.prototype.deferral = 0; //在加载完成后再延时 `delay` 次 interval 
Log.prototype.loaded = false; //是否已加载完成，达到结束条件。仅第一次加载时有用。

Log.prototype.load = function() {
    this.loadingTextDiv.style.display = '';
    let log = this;
    let filter = log.filter != '' ? log.filter.$p(log.element) : '';
    this.timer = window.setInterval(function() {
                if (!log.loading) {
                    log.loading = true;
                    $cogo(log.data, log.element, log)
                        .then(function(data) {
                            if (data.cursor > -1) {                      
                                for (let item in data) {
                                    if (item == 'logs') {
                                        data.logs.forEach(line => {
                                            let logType = line.log_type ?? line.logType ?? '';
                                            let logText = line.log_text ?? line.logText ?? '';
                                            if (filter == '') {
                                                if (logType == 'ERROR') {
                                                    log.container.insertAdjacentHTML('beforeEnd', '<div><span class="datetime">' + line.datetime + '</span> <span class="ERROR">[ERROR]</span> &nbsp; <span class="ERROR">' + logText + '</span></div>');
                                                }
                                                else {
                                                    log.container.insertAdjacentHTML('beforeEnd', '<div><span class="datetime">' + line.datetime + '</span> <span class="' + logType + '">[' + logType + ']</span> &nbsp; ' + Log.format(logText) + '</div>');
                                                }
                                            }
                                            else {
                                                let matches = logText.match(new RegExp(filter, 'ig'));
                                                if (matches != null) {
                                                    if (logType == 'ERROR') {
                                                        log.container.insertAdjacentHTML('beforeEnd', '<div><span class="datetime">' + line.datetime + '</span> <span class="ERROR">[ERROR]</span> &nbsp; <span class="ERROR">' + Log.highlight(logText, ...matches) + '</span></div>');
                                                    }
                                                    else {
                                                        log.container.insertAdjacentHTML('beforeEnd', '<div><span class="datetime">' + line.datetime + '</span> <span class="' + logType + '">[' + logType + ']</span> &nbsp; ' + Log.format(logText, ...matches) + '</div>');
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    else if (item == 'cursor') {
                                        log.cursor = data.cursor;
                                    }
                                    else {
                                        log.element.setAttribute(item, data[item]);
                                    }
                                }
                            }
                            else {
                                //出错了
                                log.container.insertAdjacentHTML('beforeEnd', '<div><span class="ERROR">' + (data.error ?? data.exception ?? data.message ?? data.info ?? data) + '</span></div>');
                            }

                            log.loading = false;

                            if (!log.terminated) {
                                if (log.terminal != '') {
                                    if (eval(log.terminal.placeModelData().$p(log.element))) {
                                        //达到中止条件                                            
                                        if (log.loadUntilEmpty) {
                                            //日志量为 0 并不中断，因为可能有的日志还没有生成
                                            if (data.logs.length == 0) {
                                                log.terminated = true;
                                            }
                                        }
                                        else {
                                            log.terminated = true;
                                        }
                                    }
                                }
                                else if (data.logs.length == 0) {
                                    log.terminated = true;
                                }
                            }

                            if (log.terminated) {
                                if (log.deferral == 0) {                                    
                                    Event.execute(log.name, 'onterminate');
                                }

                                log.deferral ++;
                                if (log.deferral >= log.delay) {
                                    window.clearInterval(log.timer);
                                    log.deferral = 0;
                                    log.loadingTextDiv.style.display = 'none';
                                    if (!log.loaded) {
                                        log.loaded = true;
                                        Event.execute(log.name, 'onload');
                                    }
                                    else {
                                        Event.execute(log.name, 'onreload');
                                    }
                                }
                            }
                        })
                        .catch(error => {
                            log.container.insertAdjacentHTML('beforeEnd', '<div><span class="ERROR">' + error + '</span></div>');
                            log.loading = false;
                        });
                }                
            }, this.interval);
}

Log.prototype.clear = function() {

    window.clearInterval(this.timer);

    this.container.innerHTML = '';
    this.cursor = this._cursor;
    this.terminated = false;
    this.deferral = 0;
}

Log.prototype.start = function() {
    this.load();
}

Log.prototype.reload = function() {  
    //force to loaded, 可以在未完成时中断并重新加载
    if (!this.loaded) {
        this.loaded = true;
    }

    this.clear();
    this.load();
}

Log.prototype.initialize = function() {

    if (this.autoStart) {
        if (this.await == '') {
            this.start();
        }
        else {
            Event.await(this, this.await);
        }
    }

    Event.interact(this, this.element);
}

Log.highlight = function(log, ...matches) {
    if (matches.length > 0) {
        return matches.forEach(m => {
            log = log.replace(m, '<span class="HIGHLIGHT">' + m + '</span>');
        })
    }
    else {
        return log;
    }
}

Log.format = function(log, ...matches) {
    let str = [];
    let dt = [];
    let address = [];
    let highlight = [];

    matches.forEach(m => {
        highlight.push(m);
        log = log.replace(m, '~highlight#' + (highlight.length - 1) + '#')
    });

    return log.replace(/<\/[^>]+>/g, '')
            .replace(/<\d+\.\d+\.\d+\.\d+(\.\d+\.\d+)?:\d+>/g, $1 => {
                address.push($1);
                return  '~address#' + (address.length - 1) + '#';
            })
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"[^"]*"/g, $1 => {
                str.push($1);
                return '~str#' + (str.length - 1) + '#';
            })
            .replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?/g, $1 => {
                dt.push($1);
                return '~date#' + (dt.length - 1) + '#';
            })
            .replace(/\\r\\n|\\n|\\r/g, '<br/>')
            .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')    
            .replace(/([^\da-z#])(\d+)([^\da-z#])/g, ($1, $2, $3, $4) => {
                if ($2 != '#' && $4 != '#') {
                    return $2 + '<span class="NUMBER">' + $3 +'</span>' + $4;
                }
                else {
                    return $1;
                }
            })    
            .replace(/-\d+|-?\d+\.\d+/, $1 => '<span class="NUMBER">' + $1 +'</span>')
            .replace(/~str#(\d+)#/g, ($1, $2) => '<span class="STRING">' + str[$2.toInt()] + '</span>')
            .replace(/~date#(\d+)#/g, ($1, $2) => '<span class="DATETIME">' + dt[$2.toInt()] + '</span>')
            .replace(/~address#(\d+)#/g, ($1, $2) => '<span class="ADDRESS">' + address[$2.toInt()] + '</span>')
            .replace(/~highlight#(\d+)#/g, ($1, $2) => '<span class="HIGHLIGHT">' + highlight[$2.toInt()] + '</span>');
}

Log.initializeAll = function() {
    $a('log').forEach(log => {
        if (!log.getAttribute('root-log')) {
            log.setAttribute('root-log', '');
            new Log(log).initialize();
        }        
    })
}

document.on('post', function() {
    Log.initializeAll();
});