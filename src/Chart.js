import React, { Component } from 'react';
import ChartJS from 'chart.js';
import orderBy from 'lodash/orderBy'
import map from 'lodash/map'

const chartConfig = {
    java: {
        label: "Java",
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)'
    },
    kotlin: {
        label: "Kotlin",
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)'
    },
    javascript: {
        label: "JS",
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)'
    },
    php: {
        label: "Php",
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)'
    }
} 


class Chart extends Component {
    constructor(props) {
        super(props);
        this.values = {};
        this.chartRef = React.createRef();
        this.sse();
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        this.chart = new ChartJS(
            this.chartRef.current.getContext('2d'), 
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: '# of tweets',
                            data: [],
                            backgroundColor: [],
                            borderColor: [],
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    animation: {
                        duration: 1000
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                }
            }
        );
    }

    componentWillUnmount() {
        this.eventSource.close();
    }

    sse() {
        this.eventSource = new EventSource('/api/hashtag-popularity');
        this.eventSource.onmessage = e => {
            const data = JSON.parse(e.data);
            this.values[data.hashtag] = data.count; 
            this.refreshChart()
        };
    }

    refreshChart() {
        const sortedValues = orderBy(map(this.values, (count, hashtag) => ({ hashtag, count })), ['count'], ['desc']);

        const hashtags = map(sortedValues, ({ hashtag }) => hashtag);

        this.chart.data.labels = map(hashtags, hashtag => chartConfig[hashtag].label);
        this.chart.data.datasets.forEach((dataset) => {
            dataset.data = map(sortedValues, ({ count }) => count);
            dataset.backgroundColor = map(hashtags, hashtag => chartConfig[hashtag].backgroundColor);
            dataset.borderColor = map(hashtags, hashtag => chartConfig[hashtag].borderColor);
        });
        this.chart.update();
    }

    render() {
        return (
            <div>
                <canvas ref={this.chartRef}></canvas>
            </div>
        );
    }
}

export default Chart;