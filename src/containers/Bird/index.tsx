import { useEffect, useRef, useState } from "react";
import { Button, message } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import * as echarts from "echarts";
import { getObstacleData, getOption, judgeCollision, speed, vw } from "./utils";
import "./style.css";

const Bird = () => {
  const echartsInstance = useRef<echarts.ECharts>();
  // 障碍物数据
  const obstacleData = useRef<number[][]>(getObstacleData());
  // echarts配置
  const option = useRef(getOption(obstacleData.current));
  // 设置加速度
  const vh = useRef(0);
  // 运行中
  const [isRunning, setIsRunning] = useState(false);
  // 最终成绩
  const score = useRef(0);

  // 游戏主进程
  const timer = useRef<number>();
  const initAnimation = () => {
    echartsInstance.current?.clear();
    timer.current = window.setInterval(() => {
      // 鸟的位置和仰角调整，给一个自动下坠的力、方向
      vh.current -= speed;
      // @ts-ignore
      option.current.series[0].data[0][1] += vh.current;
      // @ts-ignore
      option.current.series[0].data[0][0] += vw;
      // @ts-ignore
      option.current.series[0].symbolRotate = option.current.series[0]
        .symbolRotate
        ? // @ts-ignore
          option.current.series[0].symbolRotate - 5
        : 0;
      // 坐标系范围调整，场景不断前移
      // @ts-ignore
      option.current.xAxis.min += vw;
      // @ts-ignore
      option.current.xAxis.max += vw;
      // @ts-ignore end

      // 碰撞判断
      const result = judgeCollision(
        // @ts-ignore
        option.current.series[0].data[0],
        obstacleData.current,
        (_score) => (score.current = _score)
      );
      if (result) {
        onEndGame();
      }
      echartsInstance.current?.setOption(option.current);
    }, 25);
  };

  // 开始游戏
  const onStartGame = () => {
    if (!isRunning) {
      vh.current = 0;
      obstacleData.current = getObstacleData();
      option.current = getOption(obstacleData.current);
      score.current = 0;
      setIsRunning(true);
      initAnimation();
    }
  };

  // 结束游戏
  const onEndGame = () => {
    setIsRunning(false);
    // 绘制一帧失败
    // @ts-ignore
    option.current.series[0].symbolRotate = 180;
    echartsInstance.current?.setOption(option.current);
    // 清空定时器&弹窗提示成绩
    timer.current && window.clearInterval(timer.current);
    message.success(`游戏结束，最终得分${score.current}`);
  };


  // 初始化场景，事件绑定，绘制第一帧
  useEffect(() => {
    const dom = document.querySelector(".canvas") as HTMLElement;
    // 绑定空格按下事件
    const fn = function (e: any) {
      if (e.code === "Space") {
        vh.current += 1;
        // @ts-ignore
        option.series[0].symbolRotate = 45;
      }
    };

    // 初始化echarts
    if (dom) {
      echartsInstance.current = echarts.init(dom);
      echartsInstance.current?.setOption(option.current);
      document.addEventListener("keydown", fn);
    }

    return () => {
      echartsInstance.current?.dispose();
      document.removeEventListener("keydown", fn);
    };
  }, []);

  return (
    <div className="bird">
      <div className="canvas" />
      {!isRunning && (
        <div className="tool">
          <Button icon={<PlayCircleFilled />} block onClick={onStartGame}>
            点击开始游戏
          </Button>
          <div className="tip">Tip: 点击空格向上飞行👆</div>
        </div>
      )}
    </div>
  );
};

export default Bird;
