// // /**
// //  * 编辑作者：张诗涛
// //  * 创建时间：2018年1月5日17:13:38
// //  * 功能分类：模板逻辑页
// //  */
// import { Config } from "../../config";
// import { PageEvent, PageEventType, Module, Site, Focus, FocusType, HElement, FuncLock, FocusResponse, Key } from "../../framework/framework";
// import { } from "../../model/model";
// import { } from "../../logic/logic";

// enum ModuleType {
//     Default
// }
// enum EventType {
// }
// let pageEvent = new PageEvent(null, [
//     {
//         topic: PageEventType.Keydown, data: null, handler: [
//             ModuleType.Default
//         ]
//     }
// ], false);

// // 发现-首页
// class DefaultModule extends Module {
//     focus: Focus;

//     constructor(event: PageEvent) {
//         super(event);
//     }
//     initialize() {
//         this.focus = new Focus({
//             identCode: ModuleType.Default
//         }, pageEvent);
//     }
//     subscribeToEvents() {
//     }
// };
// let focusDefault = new DefaultModule(pageEvent);
// function main() {

//     subscribeToEvents();
// }
// function subscribeToEvents() {
// }