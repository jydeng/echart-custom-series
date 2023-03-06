import { useRef, useState } from 'react';
import { useInterval } from 'ahooks';
import { cloneDeep } from 'lodash';
import type { ECharts } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { getOption } from './utils';
import './style.css';


const Bird = () => {
    // echarts实例
    const echartsInstance = useRef<ECharts>();

    // echarts配置
    const [option, setOption] = useState(getOption);

    // 设置速度和加速度
    const [speed, setSpeed] = useState(0.05);
    const [vh, setVH] = useState(0);
    const [vw, setVW] = useState(0.5);

    // 主进程
    useInterval(() => {
        // 小鸟位置和仰角调整
        const o = cloneDeep(option);
        const h = vh - speed;

        // @ts-ignore
        o.series[0].data[0][1] += vh;
        // @ts-ignore
        o.series[0].data[0][0] += vw;
        // @ts-ignore
        o.series[0].symbolRotate = o.series[0].symbolRotate ? o.series[0].symbolRotate - 5 : 0;

        // 坐标系范围调整
        // @ts-ignore
        o.xAxis.min += vw;
        // @ts-ignore
        o.xAxis.max += vw;

        setVH(h);
        setOption(o);
    }, 25);

    return <div className="bird">
        <div className='canvas'>
            <ReactECharts
                style={{ height: '100%', width: '100%' }}
                option={option}
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