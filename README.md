# framework_stb
- 面向机顶盒开发的框架库 相对完善的底层库封装 并持续更新中...

# 框架结构
- ├─dist              // 编译文件
- │  ├─images
- │  ├─css
- │  ├─js
- │  └─*.html
- ├─doc                       // 文档资料
- └─src                       // 源码文件
-     ├─less                      // 公用样式
-     ├─framework                 // 框架基础库
-         ├─data_tool                 // 数据相关逻辑
-         └─ui_tool                   // html相关逻辑
-     ├─logic                     // 业务逻辑
-         ├─baseLogic.ts              // 业务逻辑父类
-         ├─logic.ts                  // 业务逻辑集合
-         └─template.ts               // templateLogic 模板文件用于快速创建可访问网络的 api
-     ├─model                     // 对象实体
-         ├─baseModel.ts              // 业务逻辑父类
-         ├─logic.ts                  // 业务逻辑集合
-         └─template.ts               // templateLogic 模板文件用于快速创建 api 对象实体类
-     ├─pages                     // page 页面相关文件
-         └─index                     // 页面文件夹(可添加多个具有相同文件的文件夹)
-             ├─*.less                // html 页面对应 css 文件
-             ├─*.ts                  // html 页面对应 js 文件
-             └─*.html                // html 页面文件
-     ├─config.ts                 // api 路径配置
-     ├─const.ts                  // apk 相关属性
-     ├─require.js
-     └─template.html             // html 模板文件用于快速创建兼容盒子的 html 页面

# frameword 对象详解
## Focus 描述
### 初始化对象
- identCode
    - 属性类型: Enum
    - 属性描述: 模块唯一标识
- activateClass
    - 属性类型: String
    - 属性描述: site 被设置焦点会应用该类定义的样式，site 失去焦点也会相应去掉该类样式
- confirmClass
    - 属性类型：Function
    - 回掉类型：FocusResponse
    - 属性描述：activateClass 属性被应用时触发该回掉，同理activeClass未设置时不会触发该回掉
- cancelClass
    - 属性类型：Function
    - 回掉类型：FocusResponse
    - 属性描述：activateClass 属性被取消时触发该回掉，同理activeClass未设置时不会触发该回掉
### 使用 get
### 使用 set
### 使用

## Module 描述
- 继承 Module 模块，当前模块不能再属性初始化时赋值然后在重写 init
### 初始化对象
### 使用 get
### 使用 set
### 使用


# 自动流程
    npm run start   // 自动化编译流程

# 对象名称
# 对象详解
# 概念描述
# 内部解析
# 使用方式

# 盒子与浏览器差异
- 盒子关机后 cookie 清空

# 需要改进的功能
- 继承 Module 模块，当前模块不能再属性初始化时赋值
- 保存页面状态，类似于 前段 mvc 框架效果，根据路由参数可以改变页面状态。这里基于对 pageEvent 事件的处理实现该效果
- focus 可以有开关功能，如果关闭则自动焦点和焦点移交则不会执行
- pageEvent target 转移焦点有开关功能，如果关闭则不发送事件到 focus 模块，以此达到禁用效果
- 强化focus 完整性检查，如果该对象不能接受到事件那么则取消该行为，以免让页面陷入失焦状态。从而让页面死掉
- 事件触发机制将 PageEventType.Keydown 键码重要性提升，直接代替 Keydown 简化开发流程。思路是不要用枚举改为对象，这样可以判断枚举值是来自那个类而进行分别处理（不进行改变，按钮按键过多，注册和卸载都一定程度造成性能瓶颈）
- Focus 对象卸载时保存订阅的事件。重新创建时可以不用重复在订阅，事件可重用
- 事件触发地方，是自动触发还是主动调用方法时触发。特别是处理订阅事件和回掉的时候
- 主动触发函数设置焦点。相应事件也能执行。并且发送事件类型时应该标注事件触发源为调用接口触发
- PageEvent 加开关功能，禁用某个组件接受消息
- // TODO

# 日志
**2017年9月5日11:33:59**
- √ PageEvent 对象 trigger 方法进行焦点移交时若目标模块没有订阅加入异常提示
- √ PageEvent 对象 on 方法订阅 focus blur keydown 等事件选项封装为枚举类型且可扩展
- √ 取消 Mediator 中介器 新增 EventMeitter 发射器代替(可支持同一事件被多个地方订阅)
- √ 移除 system.${ele.topic}.${targetName} 事件订阅方式 改用发射器订阅。执行顺序为模块封装的自动行为执行（比如Focus对象） > 开发者自定义事件处理执行（比如 Module 子类的 subscribeEvent 方法）
- √ PageEvent 对象 增加初始化时 targetName 属性可以为 null 意思是当前页面无焦点。然后通过 target 方法在需要地方手动设置
- √ 多个模块具有同一功能，比如返回、确定等。新增同一处理入口（已经作废，大部分模块对事件需要进行业务逻辑处理，该思路没有通用性）
- √ 加入队列管理事件执行队列与顺序（发射器）
- √ 定义日志打印接口并且实现相应逻辑，当前方案有两种，1.通过浏览器函数 console.log()(已经实现) 2.通过     写入本地.txt或者.json 文件，以此实现跨平台（模块通过实现 PageEventType.Error 方法，上报错误信息）
**2018年1月4日18:07:46**
- √ PageEvent 发布当前触发事件简码事件。订阅 PageEventType.keydown 事件可以替换为 Key 枚举的值

# Focus 模块测试项参考
**2018年1月5日11:57:35**
- √ 成功创建
- √ 选中节点赋予焦点（添加了active类样式）
- √ 焦点可以移动
- √ className 已设置时需要触发 usingClass
- √ className 已设置时需要触发 cancelClass
- √ className 未设置时不会触发 usingClass
- √ className 未设置时不会触发 cancelClass
- √ identCode 未设置时不能创建
- width 
    - √ width 未定义默认值为 0
    - √ width 未定义 height 为 0 时根据 initData 参数创建宽度无限长高度为 1 的坐标集
- height 
    - √ height 未定义默认值为 0
    - √ height 未定义 width 为 0 时根据 initData 参数创建高度无限长高度为 1 的坐标集
- autoFill
    - √ autoTarget 属性优先级高于 autoFill 冲突事件会被覆盖
- autoTarget
- className
- leaveClass
    - √ leaveClass 已定义时在组件失去焦点时应用该样式
    - √ leaveClass 已定义时在组件获取焦点时移除该样式
- usingClass
    - 应用 className 类样式时触发
- cancelClass
    - 取消 className 类样式时触发
- enableMove:boolean
- disableSite
- enableSite
- initData
    - 未调用该函数进行初始化时发布 Error 提示信息

# PageEvent 模块测试项参考
**2018年1月9日10:04:59**
- 成功创建
- 初始化可设置默认焦点
- topic 属性目前支持 PageEventType.Keydown 按键事件；handler 属性设置有效模块标识列表，如果未设置 keydown 事件不会通知到该模块