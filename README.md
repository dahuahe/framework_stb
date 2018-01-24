# framework_stb
- 最后编辑时间：2018年1月9日15:11:08
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
- 继承 Module 模块，当前模块不能再属性初始化时赋值然后在 initialize 或 subscribeEvent 调用
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
- launcher 相关方法不要通过闭包或 require 加载，出现接口无法访问问题
- 安徽-海信-ZP906H 盒子 全局 top 属性作为 js 关键字。再次声明或赋值操作为无效。尽可能不要使用该关键字 top
- 数码视讯 Q5 小窗视频会覆盖所有元素背景图片样式；添加 背景图片可能导致屏幕部分黑屏（图片相关使用 img 标签）
- 创维 E900 返回简码与其它盒子不一致 Key.Backspace2且隐藏视频接口this.mediaPlay.setVideoDisplayMode(255)无效

# 需要改进的功能
- 完善 autoTarget: [{ keyCode: Key.Left, target: ModuleType.Anwser }] 支持所有按键
- Focus 事件相应类型 定义为 InterfaceName + Response 格式
- 完善 autoTarget: [{ keyCode: Key.Left, target: ModuleType.Anwser }] 支持所有按键
- 锁定某个 site 自动过滤该坐标 并且发布该事件
- Focus 事件相应类型 定义为 InterfaceName + Response 格式
- 播放器当前进度事件加一个总时长参数
- 播放器总市场初始化加一个当前开始时间点参数
- pageEvent 扩展自定义触发事件比如 keydown（除了移动规则其余都带有较复杂功能性质所以不予支持，避免隐藏BUG）
- // TODO

# 日志
**2017年9月5日11:33:59**
- √ PageEvent 对象 trigger 方法进行焦点移交时若目标模块没有订阅加入异常提示
- √ PageEvent 对象 on 方法订阅 focus blur keydown 等事件选项封装为枚举类型且可扩展
- √ EventMeitter 对 Mediator 中介器封装，新增 EventMeitter 发射器代替(可支持同一事件被多个地方订阅)
- √ PageEvent 移除 system.${ele.topic}.${targetName} 订阅方式 改用发射器订阅。执行顺序为模块封装的自动行为执行（比如Focus对象）
- √ PageEvent 增加初始化时 targetName 属性可以为 null 意思是当前页面无焦点。然后通过 target 方法在需要地方手动设置
- √ EventMeitter 加入队列管理事件执行队列与顺序（发射器）
- √ PageEvent 定义日志打印接口并且实现相应逻辑，订阅 * - PageEventType.Error 通过浏览器函数 console.log() 输出日志
**2018年1月4日18:07:46**
- √ PageEvent 发布当前触发事件简码事件。订阅 PageEventType.keydown 事件可以替换为 Key 枚举的值
- √ PageEvent 管理模块可以有开关功能，如果关闭则自动焦点和焦点移交则不会执行
- √ pageEvent 焦点模块列表禁用功能，如果开启则自动排除该模块，不会执行焦点转移
- √ pageEvent 焦点模块列表锁定功能，如果开启该模块仅启用离开事件与焦点事件，不通知具体事件
- √ pageEvent 完整性检查，如果该对象不能接受到事件那么则取消该行为，以免让页面陷入失焦状态。从而让页面死掉
- √ Focus 对象卸载时可保存订阅的事件。重新创建时可以不用重复在订阅，事件可重用
- × Focus 相关事件触发源是自动触发还是主动调用方法触发的标注，特别是处理订阅事件和回掉的时候
**2018年1月11日15:32:56**
- Helement 对象 removeClas,clas 方法导致前后空格，删除异常（类名中某个字符被删除）等问题
- PageEvent 新增 getPreviousIdentCode 方法获取来源模块标识
**2018年1月24日15点03分**
- 新增 template 文件夹 模板文件单独放置且跳过编译配置
- gulpfile.js 增加css多浏览器兼容
- gulpfile.js 增加html压缩
- npm 编译命令增加 npm minify(发布压缩版本、带前缀css版本)

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
    - 配置焦点基本转交规则，复杂的处理逻辑则通过手动触发
- className
    - className 已定义时在组件获取焦点时应用该样式
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

# 应用项目
- 安徽文艺演出（2017）
- 内蒙环球专区（2017）
- 云南4k专区（2017）
- 安徽猜灯谜（2018）
- 安徽送祝福（2018）