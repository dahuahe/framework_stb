// // /**
// //  * 编辑作者：张诗涛
// //  * 创建时间：2017年11月21日15:15:30
// //  * 功能分类：模板逻辑页
// //  */
// import { Config } from "../config";
// import { PageEvent, PageEventType, Module, Site, Focus, FocusType, HElement } from "../framework/framework";
// import { } from "../model/model";
// import { } from "../logic/logic";

// enum ModuleType {
//     /**
//      * 全局
//      */
//     IdentCode,
//     /**
//      * 视频媒体
//      */
//     VideoMedia
// }
// enum EventType {
// }
// let pageEvent = new PageEvent(null, [
//     {
//         topic: PageEventType.Keydown, data: null, handler: [
//             ModuleType.VideoMedia
//         ]
//     }
// ], false);

// // 发现-首页
// class PageHome extends Module {
//     focus: Focus;

//     constructor(event: PageEvent) {
//         super(event);
//     }
//     initialize() {
//         this.focus = new Focus({
//             /**
//              * 实例唯一标识（用于系统级事件通知，该字段必须唯一）
//              */
//             identCode: string | number;
//             /**
//              * 地图算法前置条件最大生成宽度 0 代表无线长
//              */
//             width?: number,
//             /**
//              * 地图算法前置条件最大生成高度 0 代表无线高(前提宽度不为 0 )
//              */
//             height?: number,
//             /**
//              * @param Array<Key> 接收 Key 对象值
//              * @param Object{keyCode:Key,callback:()=>void} 接收 Key 对象值 并定义处理规则
//              * @desc 自动填充规则 是指触发 Leap对象的set方法返回值为false的情况下所预定制规则 该规则将改变 app.leap.set 事件触发条件
//              * 当前内置规则有 :
//              * Key.Left(自动查找上一坐标，基于index属性) 
//              * Key.right(自动查找下一坐标，基于index属性) 
//              * Key.dn(坐标缺失情况自动补位坐标，基于getSite('last')方法)
//              */
//             autoFill?: [Key],
//             /**
//              * autoTarget 优先级高于 autoFill 冲突事件会被覆盖
//              */
//             autoTarget?: [{ keyCode: Key, target: string | number }],
//             /**
//              * 焦点样式
//              */
//             activeClass?: string,
//             /**
//              * 离开样式
//              */
//             blurClass?: string,
//             /**
//              * 焦点样式回掉
//              */
//             activeCallback?: (info: FocusResponse) => void,
//             /**
//              * 离开样式回掉
//              */
//             blurCallback?: (info: FocusResponse) => void,
//             /**
//              * 基本动作是否启用 (上、下、左、右)
//              * false：禁用 Focus 对象内置 上、下、左、右、事件的处理，通过自定义订阅 PageEvent 的 keydown 事件完成相关业务需求
//              */
//             usingMove?: boolean
//         }, pageEvent);
//     }
//     subscribeToEvents() {
//     }
// }
// function main() {
//     subscribeToEvents();

//     new PageHome(pageEvent);

//     // 初始焦点
//     pageEvent.target(ModuleType.VideoMedia);

// }
// function subscribeToEvents() {
// }