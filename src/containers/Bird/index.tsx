import { useRef } from 'react';
import type { ECharts } from 'echarts';
import ReactECharts from 'echarts-for-react';
import './style.css';

const Bird = () => {
    const echartsInstance = useRef<ECharts>();
    const minHeight = 20;
    let obstacleData = [];
    let option;
    let a = 0.05;
    let vh = 0;
    let vw = 0.5
    let timer;
    let score = 0;
    let isGameStarted = false;


    function startGame() {
        if (isGameStarted) {
            return;
        }
        isGameStarted = true;
        a = 0.05;
        vh = 0;
        vw = 0.5
        score = 0;
        echartsInstance?.current?.clear();
        initObstacleData();
        initOption();
        initAnimation();
    }

    function initObstacleData() {
        let start = 150;
        obstacleData = [];
        for (let index = 0; index < 50; index++) {
            const height = Math.random() * 30 + minHeight;
            const obstacleStart = Math.random() * (90 - minHeight);
            obstacleData.push(
                [
                    start + 50 * index,
                    obstacleStart,
                    obstacleStart + height > 100 ? 100 : obstacleStart + height
                ]
            )
        }
    }

    function judgeCollision(centerCoord) {
        if (centerCoord[1] < 0 || centerCoord[1] > 100) {
            return true;
        }
        let coordList = [
            [centerCoord[0] + 15, centerCoord[1] + 1.5],
            [centerCoord[0] + 15, centerCoord[1] - 1.5],
        ]

        for (let i = 0; i < 2; i++) {
            const coord = coordList[i];
            const index = coord[0] / 50;
            if (index % 1 < 0.6 && obstacleData[Math.floor(index) - 3]) {
                if (obstacleData[Math.floor(index) - 3][1] > coord[1] || obstacleData[Math.floor(index) - 3][2] < coord[1]) {
                    return true;
                }
                score = (Math.floor(index) - 2) * 2
            }
        }

        return false
    }

    function initOption() {
        option = {
            xAxis: {
                show: false,
                type: 'value',
                min: 0,
                max: 200,
            },
            yAxis: {
                show: false,
                min: 0,
                max: 100
            },
            grid: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
            backgroundcolor: 'trans',
            series: [
                {
                    name: 'bird',
                    type: 'scatter',
                    symbolSize: 50,
                    symbolRotate: 45,
                    symbol: 'image://bird.png',
                    data: [
                        [50, 80]
                    ],
                    animation: false
                },
                {
                    name: '障碍物',
                    type: 'custom',
                    data: [...obstacleData],
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 0,
                            colorStops: [{
                                offset: 0, color: '#ddf38c' // 0% 处的颜色
                            }, {
                                offset: 1, color: '#587d2a' // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        },
                        borderWidth: 3
                    },
                    renderItem: function (params, api) {
                        let start1 = api.coord([api.value(0) - 10, api.value(1)]);
                        let start2 = api.coord([api.value(0) - 10, 100]);
                        let startHead1 = api.coord([api.value(0) - 12, api.value(1)]);
                        let startHead2 = api.coord([api.value(0) - 12, api.value(2) + 8])
                        let headSize = api.size([24, 8])
                        let rect = api.size([20, api.value(1)]);
                        let rect2 = api.size([20, 100 - api.value(2)]);
                        const common = {
                            x: params.coordSys.x,
                            y: params.coordSys.y,
                            width: params.coordSys.width,
                            height: params.coordSys.height
                        }
                        const rectShape = echarts.graphic.clipRectByRect(
                            {
                                x: start1[0],
                                y: start1[1],
                                width: rect[0],
                                height: rect[1]
                            }, common
                        );
                        const rectHeadShape = echarts.graphic.clipRectByRect(
                            {
                                x: startHead1[0],
                                y: startHead1[1],
                                width: headSize[0],
                                height: headSize[1]
                            }, common
                        );

                        const rectHeadShape2 = echarts.graphic.clipRectByRect(
                            {
                                x: startHead2[0],
                                y: startHead2[1],
                                width: headSize[0],
                                height: headSize[1]
                            }, common
                        );

                        const rectShape2 = echarts.graphic.clipRectByRect(
                            {
                                x: start2[0],
                                y: start2[1],
                                width: rect2[0],
                                height: rect2[1]
                            },
                            common
                        )

                        return {
                            type: 'group',
                            children: [{
                                type: 'rect',
                                shape: rectShape,
                                style: {
                                    ...api.style(),
                                    lineWidth: 1,
                                    stroke: '#000'
                                }
                            }, {
                                type: 'rect',
                                shape: rectShape2,
                                style: {
                                    ...api.style(),
                                    lineWidth: 1,
                                    stroke: '#000'
                                }
                            },
                            {
                                type: 'rect',
                                shape: rectHeadShape,
                                style: {
                                    ...api.style(),
                                    lineWidth: 1,
                                    stroke: '#000'
                                }
                            },
                            {
                                type: 'rect',
                                shape: rectHeadShape2,
                                style: {
                                    ...api.style(),
                                    lineWidth: 1,
                                    stroke: '#000'
                                }
                            }]
                        };
                    },
                }
            ]
        };
    }

    function initAnimation() {
        // 动画设置
        timer = setInterval(() => {
            // 小鸟速度和仰角调整
            vh = vh - a;
            option.series[0].data[0][1] += vh;
            option.series[0].data[0][0] += vw;
            option.series[0].symbolRotate = option.series[0].symbolRotate ? option.series[0].symbolRotate - 5 : 0;

            // 坐标系范围调整
            option.xAxis.min += vw;
            option.xAxis.max += vw;

            // 碰撞判断
            const result = judgeCollision(option.series[0].data[0])

            if (result) {
                endAnimation();
            }

            myChart.setOption(option);
        }, 25);
    }


    function endAnimation() {
        option.series[0].symbolRotate = 180;
        myChart.setOption(option);
        clearInterval(timer);
        isGameStarted = false;
        setTimeout(() => {
            alert(`最终得分： ${score}`)
        });
    }

    document.onkeydown = function (e) {
        if (e.code === 'Space') {
            vh += 1;
            option.series[0].symbolRotate = 45
        }
    }

    return <div className="bird">
        <div className='canvas'>
            <ReactECharts
                style={{ height: '100%', width: '100%' }}
                option={{
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            data: [150, 230, 224, 218, 135, 147, 260],
                            type: 'line'
                        }
                    ]
                }}
                notMerge={true}
                lazyUpdate={true}
                onChartReady={instance => echartsInstance.current = instance}
            />
        </div>
        <div className="btn">开始游戏</div>
        <p style={{ textAlign: 'center' }}>（点击空格向上飞行）</p>
    </div>
}

export default Bird;