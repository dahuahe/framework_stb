# framework_stb
面向机顶盒开发的框架库 相对完善的底层库封装 并持续更新中...

# 框架结构
├─dist              // 编译文件
│  ├─images
│  ├─css
│  ├─js
│  └─*.html
├─doc                       // 文档资料
└─src                       // 源码文件
    ├─less                      // 公用样式
    ├─framework                 // 框架基础库
        ├─data_tool                 // 数据相关逻辑
        └─ui_tool                   // html相关逻辑
    ├─logic                     // 业务逻辑
        ├─baseLogic.ts              // 业务逻辑父类
        ├─logic.ts                  // 业务逻辑集合
        └─template.ts               // templateLogic 模板文件用于快速创建可访问网络的 api
    ├─model                     // 对象实体
        ├─baseModel.ts              // 业务逻辑父类
        ├─logic.ts                  // 业务逻辑集合
        └─template.ts               // templateLogic 模板文件用于快速创建 api 对象实体类
    ├─pages                     // page 页面相关文件
        └─index                     // 页面文件夹(可添加多个具有相同文件的文件夹)
            ├─*.less                // html 页面对应 css 文件
            ├─*.ts                  // html 页面对应 js 文件
            └─*.html                // html 页面文件
    ├─config.ts                 // api 路径配置
    ├─const.ts                  // apk 相关属性
    ├─require.js
    └─template.html             // html 模板文件用于快速创建兼容盒子的 html 页面

# 对象详解

# 自动流程
    npm run watch   // 自动化编译流程

# 对象名称
# 对象详解
# 概念描述
# 内部解析
# 使用方式

还需改进


更新日志
各类TS插件编写
   模块：PageEvent and EventEmitter and Focus
 * 修改：2017年9月5日11:33:59
 * 版本：v1.0.2
 * 内容：√1.PageEvent 焦点移交，若目标模块没有订阅，加入异常提示
 *      √2.针对常用 focus blur keydown 事件做封装并且可扩展
 *      √3.针对 focus 添加来源对象
 *      √4.取消 Mediator 中介器 改用 EventMeitter 发射器代替(可支持同一事件被多个地方订阅)
 *      √5.移除 v1.0.0 system.${ele.topic}.${targetName} 方式订阅内部处理事件 改用发射器订阅 执行方式仍然            是 模块封装的自动行为执行 > 开发者自定义事件处理执行
 *      √6.增加初始化 targetName 可以为 null 禁用默认焦点的设置
 *      √7.多个模块具有同一功能，比如返回、确定等。新增同一处理入口
 *      √8.加入队列管理事件执行队列与顺序
        9.定义日志打印接口并且实现相应逻辑，当前方案有两种，1.通过浏览器函数 console.log()(已经实现) 2.通过     写入本地.txt或者.json 文件，以此实现跨平台
    2017年11月10日09:41:06
        1.调整baseloogic 与 logic 访问逻辑

  盒子与浏览器差异：
      1·盒子关机后 cookie 清空

FOcus 对象  创建的时候注意一定要检测当前事件是否需要释放，否则导致重复订阅

// 卸载所有事件并释放对象
        if (this.focusNav) {
            this.focusNav.release();
        }


        // 安徽盒子 E900 如果变量未声明 使用则报错
# 需要改进的功能
1. 事件触发机制将 PageEventType.Keydown 键码重要性提升，直接代替 Keydown 简化开发流程。思路是不要用枚举改为对象，这样可以判断枚举值是来自那个类而进行分别处理
2. 继承 Module 模块，当前模块不能再属性初始化时赋值
3. 保存页面状态，类似于 前段 mvc 框架效果，根据路由参数可以改变页面状态。这里基于对 pageEvent 事件的处理实现该效果