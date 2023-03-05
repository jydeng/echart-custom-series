# 自定义系列

[自定义系列（custom series）](option.html#series-custom)，是一种系列的类型。它把绘制图形元素这一步留给开发者去做，从而开发者能在坐标系中自由绘制出自己需要的图表。

Apache ECharts<sup>TM</sup> 为什么会要支持 `自定义系列` 呢？

ECharts 内置支持的图表类型是最常见的图表类型，但是图表类型是难于穷举的，有很多小众的需求 echarts 并不能内置的支持。那么就需要提供一种方式来让开发者自己扩展。另一方面，所提供的扩展方式要尽可能得简单，例如图形元素创建和释放、过渡动画、tooltip、[数据区域缩放（dataZoom）](option.html#dataZoom)、[视觉映射（visualMap）](option.html#visualMap)等功能，尽量在 ECharts 中内置得处理，使开发者不必纠结于这些细节。综上考虑形成了 [自定义系列（custom series）](option.html#series-custom)。

**例如，下面的例子使用 custom series 扩展出了 x-range 图：**
~[800x500](${galleryViewPath}custom-profile&reset=1&edit=1)

**更多的例子参见：[custom examples](${websitePath}/examples/zh/index.html#chart-type-custom)**

下面来介绍开发者怎么使用 [自定义系列（custom series）](option.html#series-custom)。


## （一）renderItem 方法

开发者自定义的图形元素渲染逻辑，是通过书写 `renderItem` 函数实现的，例如：

```ts
var option = {
    ...,
    series: [{
        type: 'custom',
        renderItem: function (params, api) {
            // ...
        },
        data: data
    }]
}
```

在渲染阶段，对于 [series.data](option.html#series-custom.data) 中的每个数据项（为方便描述，这里称为 `dataItem`)，会调用此 [renderItem](option.html#series-custom.renderItem) 函数。这个 `renderItem` 函数的职责，就是返回一个（或者一组）`图形元素定义`，`图形元素定义` 中包括图形元素的类型、位置、尺寸、样式等。echarts 会根据这些 `图形元素定义` 来渲染出图形元素。如下的示意：


```ts
var option = {
    ...,
    series: [{
        type: 'custom',
        renderItem: function (params, api) {
            // 对于 data 中的每个 dataItem，都会调用这个 renderItem 函数。
            // （但是注意，并不一定是按照 data 的顺序调用）

            // 这里进行一些处理，例如，坐标转换。
            // 这里使用 api.value(0) 取出当前 dataItem 中第一个维度的数值。
            var categoryIndex = api.value(0);
            // 这里使用 api.coord(...) 将数值在当前坐标系中转换成为屏幕上的点的像素值。
            var startPoint = api.coord([api.value(1), categoryIndex]);
            var endPoint = api.coord([api.value(2), categoryIndex]);
            // 这里使用 api.size(...) 获得 Y 轴上数值范围为 1 的一段所对应的像素长度。
            var height = api.size([0, 1])[1] * 0.6;

            // shape 属性描述了这个矩形的像素位置和大小。
            // 其中特殊得用到了 echarts.graphic.clipRectByRect，意思是，
            // 如果矩形超出了当前坐标系的包围盒，则剪裁这个矩形。
            // 如果矩形完全被剪掉，会返回 undefined.
            var rectShape = echarts.graphic.clipRectByRect({
                // 矩形的位置和大小。
                x: startPoint[0],
                y: startPoint[1] - height / 2,
                width: endPoint[0] - startPoint[0],
                height: height
            }, {
                // 当前坐标系的包围盒。
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height
            });

            // 这里返回为这个 dataItem 构建的图形元素定义。
            return rectShape && {
                // 表示这个图形元素是矩形。还可以是 'circle', 'sector', 'polygon' 等等。
                type: 'rect',
                shape: rectShape,
                // 用 api.style(...) 得到默认的样式设置。这个样式设置包含了
                // option 中 itemStyle 的配置和视觉映射得到的颜色。
                style: api.style()
            };
        },
        data: [
            [12, 44, 55, 60], // 这是第一个 dataItem
            [53, 31, 21, 56], // 这是第二个 dataItem
            [71, 33, 10, 20], // 这是第三个 dataItem
            ...
        ]
    }]
}
```


[renderItem](option.html#series-custom.renderItem) 函数提供了两个参数：
+ [params](option.html#series-custom.renderItem.arguments.params)：包含了当前数据信息（如 `seriesIndex`、`dataIndex` 等等）和坐标系的信息（如坐标系包围盒的位置和尺寸）。
+ [api](option.html#series-custom.renderItem.arguments.api)：是一些开发者可调用的方法集合（如 `api.value()`、`api.coord()`）。

[renderItem](option.html#series-custom.renderItem) 函数须返回根据此 `dataItem` 绘制出的图形元素的定义信息，参见 [renderItem.return](option.html#series-custom.renderItem.return)。

一般来说，[renderItem](option.html#series-custom.renderItem) 函数的主要逻辑，是将 `dataItem` 里的值映射到坐标系上的图形元素。这一般需要用到 [renderItem.arguments.api](option.html#series-custom.renderItem.arguments.api) 中的两个函数：
+ [api.value(...)](option.html#series-custom.renderItem.arguments.api.value)，意思是取出 `dataItem` 中的数值。例如 `api.value(0)` 表示取出当前 `dataItem` 中第一个维度的数值。
+ [api.coord(...)](option.html#series-custom.renderItem.arguments.api.coord)，意思是进行坐标转换计算。例如 `var point = api.coord([api.value(0), api.value(1)])` 表示 `dataItem` 中的数值转换成坐标系上的点。

有时候还需要用到 [api.size(...)](option.html#series-custom.renderItem.arguments.api.size) 函数，表示得到坐标系上一段数值范围对应的长度。

返回值中样式的设置可以使用 [api.style(...)](option.html#series-custom.renderItem.arguments.api.style) 函数，他能得到 [series.itemStyle](option.html#series-custom.itemStyle) 中定义的样式信息，以及视觉映射的样式信息。也可以用这种方式覆盖这些样式信息：`api.style({fill: 'green', stroke: 'yellow'})`。

书写完 `renderItem` 方法后，自定义系列的 90% 工作就做完了。剩下的是一些精化工作。