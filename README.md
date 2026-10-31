# rpgo

类似`RPG Maker`系列的低代码可视化游戏编辑器。

## 为什么有本项目 ==> 源于对 RPG Maker Unite 的失望

我朋友一直喜欢玩《重装机兵》,但觉得里面的剧情不完美,并不符合预期。希望有机会能重新塑造一个自己的游戏。而我与他一样,虽觉得游戏结局不完美但也算有趣。直到他后来找到我,希望我们重制《重装机兵》,于是我们先尝试了`RPG Maker MV`、`RPG Maker MZ`,但其编辑器不开源、不免费且插件系统不尽人意,最终导致项目搁浅。后来听说出了`RPG Maker Unite`,于是又尝试了`RPG Maker Unite`并抱有很大期望,但其引擎未能与`Unity`良好结合导致卡顿频频,问题不断,并且Unity后来与Unity中国分家(二次搁浅~)。后来我本科即将毕业,正好需要做一个毕业设计,于是我决定自己写一个类似的游戏编辑器来解决我们的问题,并将 TA 取名为`rpgo`。

## 技术栈

- ui:[vue](https://github.com/vuejs/core)
- 框架:[mygo](https://github.com/egoist/mygo)
- 编辑器内部渲染:[cocos2d-html5](https://github.com/cocos2d/cocos2d-html5)
- ...

## 注意

`本人本科毕业设计。并不保证后续更新,代码仅供参考`

- 将从零开始提交代码
- [设计、指南](./docs/)其基于[vitepress](https://github.com/vuejs/vitepress)
- 主要参考`RPG Maker MV`、`RPG Maker MZ`功能实现
- 需要安装[go](https://github.com/golang/go)和[bun](https://github.com/oven-sh/bun)
- 目前仅支持中文
- 仅支持 2D
- ...

## 在寻找类似的项目?

- [RPGCreator](https://github.com/Ward727a/RPGCreator)
- [RPGReactor](https://github.com/Psychronic-Games/RPGReactor)

## 开源协议

本项目发布于[MIT License](https://opensource.org/license/MIT)协议下,更多信息请参阅[LICENSE](./LICENSE)。项目中所使用的第三方库遵守其各自的许可证,并与本项目兼容。请参阅这些库以获取其所用许可证的详细信息。
