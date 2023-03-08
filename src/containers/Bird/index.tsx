import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getObstacleData, getOption, judgeCollision, speed, vw } from './utils';
import './style.css';


const Bird = () => {
    const echartsInstance = useRef<echarts.ECharts>();
    // 障碍物数据
    const obstacleData = useRef(getObstacleData());
    // echarts配置
    const option = useRef(getOption(obstacleData.current));
    // 设置加速度
    const vh = useRef(0);
    // 运行中标识
    const [isRunning, setIsRunning] = useState(false);
    // 最终成绩
    const score = useRef(0);

    // 主进程
    const timer = useRef<number>();
    const initAnimation = () => {
        echartsInstance.current?.clear();
        timer.current = window.setInterval(() => {
            // 鸟的位置和仰角调整
            vh.current -= speed;
            // @ts-ignore 
            option.current.series[0].data[0][1] += vh.current;
            // @ts-ignore 
            option.current.series[0].data[0][0] += vw;
            // @ts-ignore 
            option.current.series[0].symbolRotate = option.current.series[0].symbolRotate ? option.current.series[0].symbolRotate - 5 : 0;
            // 坐标系范围调整
            // @ts-ignore 
            option.current.xAxis.min += vw;
            // @ts-ignore 
            option.current.xAxis.max += vw;
            // @ts-ignore end

            // 碰撞判断
            // @ts-ignore
            const _score = judgeCollision(option.current.series[0].data[0], obstacleData.current);
            // -1 表示失败，其他表示成绩
            if (_score === -1) {
                onEndGame();
            } else {
                score.current = _score
            }
            echartsInstance.current?.setOption(option.current);
        }, 25);
    }


    // 开始游戏
    const onStartGame = () => {
        if (!isRunning) {
            vh.current = 0
            obstacleData.current = getObstacleData();
            option.current = getOption(obstacleData.current);
            score.current = 0;
            setIsRunning(true);
            initAnimation();
        }

    }

    // 结束游戏
    const onEndGame = () => {
        setIsRunning(false);
        // @ts-ignore
        option.current.series[0].symbolRotate = 180;
        echartsInstance.current?.setOption(option.current);
        timer.current && window.clearInterval(timer.current)
        window.setTimeout(() => {
            alert(`game over, score： ${score.current}`)
        });
    }

    // 初始化场景，事件绑定，绘制第一帧
    useEffect(() => {
        const dom = document.querySelector('.canvas') as HTMLElement;
        const fn = function (e: any) {
            if (e.code === 'Space') {
                vh.current += 1;
                // @ts-ignore
                option.series[0].symbolRotate = 45
            }
        }

        if (dom) {
            echartsInstance.current = echarts.init(dom);
            echartsInstance.current?.setOption(option.current);
            document.addEventListener('keydown', fn)
        }

        return () => {
            echartsInstance.current?.dispose();
            document.removeEventListener('keydown', fn);
        }
    }, []);


    return <div className="bird" onKeyDown={console.info}>
        <div className='canvas' />
        <div className="btn" onClick={onStartGame}>开始游戏</div>
        <p style={{ textAlign: 'center' }}>（点击空格向上飞行）</p>
    </div>
}

export default Bird;