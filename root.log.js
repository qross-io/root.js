function formatLog(log) {
    let str = [];
    let dt = [];
    return log.replace(/<\/[^>]+>/g, '')
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
    .replace(/([^\d])(\d+)([^\d])/g, ($1, $2, $3, $4) => {
        if ($2 != '#' && $4 != '#') {
            return $2 + '<span class="NUMBER">' + $3 +'</span>' + $4;
        }
        else {
            return $1;
        }
    })    
    .replace(/-\d+|-?\d+\.\d+/, $1 => '<span class="NUMBER">' + $1 +'</span>')
    .replace(/~str#(\d+)#/g, ($1, $2) => '<span class="STRING">' + str[$2.toInt()] + '</span>')
    .replace(/~date#(\d+)#/g, ($1, $2) => '<span class="DATETIME">' + dt[$2.toInt()] + '</span>');
}