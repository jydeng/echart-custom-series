import * as echarts from 'echarts';

// 鸟~
const birdPNG = `image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAC4ElEQVRoBdXBIa7iQBjA8f93BlBYPHpU5QRRV0GaKi6whgOQJgSH2QugSIMoqoKMrJpLbLIKxxV2tt+qisJr33sr5vcTIidEToicEDkhckLkhMgJkRMiJ0ROiJwQOSFywjfJjA1MUHsnfAPhm2TGBiaovRO+gfBJmbGBnupsGZJvHapqG/ryJEXV3glfIHxSZmygpzpbhuRbh6rahr48SVG1d8IXCBNlxgY61dnS9+d3RV9RzlBV2/BOnqSo2jvhE4SJMmMDneps6fvzu6KvKGeoqm14J09SVO2d8AnCBzJjA29c9k+GFOUMdbgdUcv5ir48SVFV26DyJEXV3gkTCB/IjA28cdk/GVKUM9ThdkQt5yv68iRFVW2DypMUVXsnTCC8kBkb6FRtwzt5kqIu+yd9RTlDHW5H1HK+oi9PUlTVNqg8SVG1d8IEwguZsYFO1Ta8kycp6rJ/0leUM9ThdkQt5yv68iRFVW2DypMUVXsnTCC8kBkb6FRtwxh5kqIu+yd9RTlDHW5H1HK+YkiepKjaO2EC4YXM2ECnahvGyJMUddk/6SvKGepwO6KW8xVD8iRF1d4JEwgvZMYGOtXZ8s/yB4N+/UTlW4e67J8MKcoZU9TeCSMIL2TGBjrV2fLP8geDfv1E5VuHuuyfDCnKGVPU3gkjCB/IjA10qrNlSL51qMv+yZCinKGuOKbYYFG1d8IbwgcyYwOd6mwZkm8d6rJ/MqQoZ6grjik2WFTtnfCGMFJmbGDAaf1gyO6+QF1xqA2WKWrvhBGEkTJjAwNO6wdDdvcF6opDbbBMUXsnjCCMlBkb6JzWD6bY3ReoK44xNlhU7Z0wgjBSZmygc1o/mGJ3X6CuOMbYYFG1d8IIwkSZsYGe0/rBGLv7gjFq74QJhIkyYwM9p/WDMXb3BWPU3gkTCF+UGRsYofZO+A+EL8qMDYxQeyf8B0LkhMgJkRMiJ0ROiJwQOSFyQuSEyAmR+wu9EfIx3PgeXQAAAABJRU5ErkJggg==`;

// 生成障碍物数据
function getObstacleData(): number[][] {
    // 添加minHeight防止空隙太小
    const minHeight = 20;
    const start = 150;
    const data = [];
    for (let index = 0; index < 50; index++) {
        const height = Math.random() * 30 + minHeight;
        const obstacleStart = Math.random() * (90 - minHeight);
        data.push(
            [
                start + 50 * index,
                obstacleStart,
                obstacleStart + height > 100 ? 100 : obstacleStart + height
            ]
        )

    }

    return data;
}

// 生成option
export function getOption(): echarts.EChartsOption {
    return {
        xAxis: { show: false, type: 'value', min: 0, max: 200, },
        yAxis: { show: false, min: 0, max: 100 },
        grid: { top: 0, bottom: 0, left: 0, right: 0 },
        backgroundcolor: 'trans',
        series: [
            {
                name: 'bird',
                type: 'scatter',
                symbolSize: 50,
                symbol: birdPNG,
                data: [[50, 80]],
                animation: false
            },
            {
                name: '障碍物',
                type: 'custom',
                data: [...getObstacleData()],
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
                renderItem: function (params: any, api: any) {
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
    }
}
