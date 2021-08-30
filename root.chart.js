
$root.chart = { };
$root.chart.colors = ['#ff7f50','#87cefa','#da70d6','#32cd32','#6495ed',
                                            '#ff69b4','#ba55d3','#cd5c5c','#ffa500','#40e0d0',
                                            '#1e90ff','#ff6347','#7b68ee','#00fa9a','#ffd700',
                                            '#6699FF','#ff6666','#3cb371','#b8860b','#30e0e0'].repeat(5);


/*
    <chart id="" title="" width="" height="" data="select name, score FROM students" x-axis="">
        <serie type="line" data=""></serie>
        <serie type="line" data=""></serie>
    </chart>

    <chart id="CpuUsage" title="# chart-cpu-usage-title #" type="line" x-axis="@NodeStat.moments" y-axis="@NodeStat.cpu_usage"></chart>
*/


class Chart {
    constructor(element) {

        this.series = [];

        $initialize(this)
            .with(element)
            .declare({
                name: 'Chart_' + document.components.size,
                _data: '',
                await: '',

                title: null,
                type: 'line',
                legend: '',
                xAxis: '',
                yAxis: '',
                
                width: '100%',
                height: 300,

                onload: null, //function (data)
                onreload: null //function (data)
            })
            .elementify(element => {
                this.element = element;
                this.element.id = '';
                
                this.container = $create('DIV', { id: this.name, className: element.className }, { width: this.width, height: this.height + 'px' });
                this.element.insertAdjacentElement('beforeBegin', this.container);
                this.echart = echarts.init(this.container);
            });        
    }

    get data() {
        return this._data;
    }

    set data(data) {
        this._data = data;
    }
}

Chart.prototype.xData = null;
Chart.prototype.yData = null;

Chart.prototype.load = function() {
    $TAKE(this._data, this.element, this, function(data) {
        this.render(data);
    });
}

Chart.prototype.reload = function() {
    this.load();
}

Chart.prototype.render = function(data) {
    this.xData = this.xAxis.placeModelData(this.name);
    if (typeof(this.xData) == 'string' && data != null) {
        this.xData = this.xData.placeData(data);
    }
    
    this.yData = this.yAxis.placeModelData(this.name);
    if (typeof(this.yData) == 'string' && data != null) {
        this.yData = this.yData.placeData(data);
    }

    this.echart.setOption({
        title: {
                show: true,
                text: this.title
                //,subtext: '(unit: seconds)'
            },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        color: ['var(--primary)'],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: this.xData,
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'value',
            inverse: false
        },
        series: [
            {
                name: this.legend,
                type: this.type,
                data: this.yData,
                itemStyle: {
                    normal: {
                                color: function(params) {
                                    return $root.chart.colors[params.dataIndex];
                                }
                            }
                        }
            }
        ]
    });
}

Chart.prototype.initialize = function() {
    if (this._data != '') {
        if (this.await == '') {
            this.load();
        }
        else {
            Event.await(this, this.await);
        }    
    }
    else {
        this.render();
    }
}

class Serie {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({

        })
        .elementify(element => {

        });
    }
}


Chart.initializeAll = function() {
    $n('chart').forEach(chart => {
        new Chart(chart).load();
    });
}

document.on('post', function() {
    Chart.initializeAll();
});