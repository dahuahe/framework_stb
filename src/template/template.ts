// /**
//  * 编辑作者：张诗涛
//  * 创建时间：2018年1月30日 14点29分
//  * 功能分类：视频逻辑页
//  */
// import { Config } from "../../config";
// import { AppEvent, Dictionary, DoublyLinkedNode, DoublyLinkedList, Queue, EventEmitter, Mediator, FormatTime, FuncLock, PageSource, ParseUrl, Key, SetInterval, SetTimeout, Extend, Random, FormatUrl, Guid, Json, ConvertKey, HElement, ManagementPageDB, ManagementFlowDB, PageEvent, PageEventResponse, PageEventType, Module, Paging, PagingHelper, Site, Focus, FocusType, FocusResponse, Player, PlayerType } from "../../framework/framework";
// import { } from "../../model/model";
// import { } from "../../logic/logic";

// enum ModuleType {
//     /**
//      * 代表选择月份的下拉框
//      */
//     Month,
//     /**
//      * 视频列表
//      */
//     Videos,
//     /**
//      * 向上翻页的按钮
//      */
//     PageUp,
//     /**
//      * 向下翻页的按钮
//      */
//     PageDown
// }
// let pageEvent = new PageEvent(null, [
//     {
//         topic: PageEventType.Keydown, data: null, handler: [
//             ModuleType.Month,
//             ModuleType.PageDown,
//             ModuleType.PageUp,
//             ModuleType.Videos
//         ]
//     }
// ], false);
// let focVideo = new Focus({
//     identCode: ModuleType.Videos,
//     className: "active"
// }, pageEvent);

// let boxVides = new HElement('#video-list');

// class VideoModule extends Module {
//     constructor(pageEvent: PageEvent) {
//         super(pageEvent);
//         this.initialize();
//         this.subscribeToEvents();
//     }
//     initialize() {

//     }
//     subscribeToEvents() {

//     }
//     loadVideo() {

//     }
// }
// let modVideo = new VideoModule(pageEvent);
// function main() {


//     subscribeToEvents();
// }
// function subscribeToEvents() {
// }
// main();