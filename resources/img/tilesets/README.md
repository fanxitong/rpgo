# tilesets == 瓦片地图

## 介绍

- 基于[Tiled](https://www.mapeditor.org/)的固定版本[v1.4.1](https://github.com/mapeditor/tiled/releases?page=4#release-v1.4.1)实现。

## 制作地图要求

| 参数 | 推荐值 |
| ------ | ------ |
| 地图保存格式 | TMX(XML) |
| 方向(Orientation) | Orthogonal(正交)或 Isometric(斜45°)，根据需求选 |
| 图层格式(Tile Layer Format) | CSV |
| 渲染顺序(Render Order) | Right Down(默认) |
| 地图大小(Width x Height) | 固定数值(如 20×15)，不要勾选 Infinite |
| 瓦片大小(Tile Size) | 常见 32×32 或 64×64 |
| 图块集(Tileset) | 外部文件(.tsx)+ 外部图片(.png)，不要嵌入图片 |
| 属性(Properties) | 不需要额外自定义属性 |

## 注意事项

- 所有文件(.tmx, .tsx, .png)放在同一目录下，用相对路径引用。
- 图片文件名不要包含中文、空格或特殊符号。
- 不要在 Tiled 中使用图层组(Group Layers)、Wang tiles、地形刷(Terrain Brush)、图片集合图块(Image Collection Tileset)等高级功能 ==> cocos2d-js v3.13 不支持这些。
- 每个 Tile Layer 最好只引用一个 tileset(使用多 tileset 时注意引用关系,避免引起解析异常)。
- 需要使用`.png`格式文件

## 策划参考

[详情参考](./scheme/README.md)
