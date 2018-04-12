/**
 * 编辑作者：张诗涛
 * 创建时间：2018年3月26日 15点29分
 * 功能分类：专题列表逻辑页
 */
import { Config } from "../../config";
import { AppEvent, Dictionary, DoublyLinkedNode, DoublyLinkedList, Queue, EventEmitter, Mediator, FormatTime, FuncLock, PageSource, ParseUrl, Key, SetInterval, SetTimeout, Extend, Random, FormatUrl, Guid, Json, ConvertKey, Cookie, HElement, VerticalRoll, HorizontalRoll, ManagementPageDB, ManagementFlowDB, ManagementPageDBToNative, PageEvent, PageEventType, Module, Paging, PagingHelper, Site, Focus, FocusType, FocusResponse, Player, PlayerType } from "../../framework/framework";
import { } from "../../model/model";
import { } from "../../logic/logic";

// 页面参数对象
interface IRequest {
}
// 焦点模块
enum ModuleType {
    Default
    // ...
}

// 事件管理
let pageEvent = new PageEvent(ModuleType.Default, [
    {
        topic: PageEventType.Keydown, data: null, handler: [
            ModuleType.Default
            // ...
        ]
    }
], true);

// 模块抽象
class DefaultModule extends Module {
    foc: Focus;
    constructor(pageEvent: PageEvent) {
        super(pageEvent);
        this.initialize();
        this.subscribeToEvents();
    }
    initialize() {
        this.foc = new Focus({
            identCode: ModuleType.Default,
            className: "active",
        }, this.event);
    }
    subscribeToEvents() {
        // Key 键码事件
        this.event.on(ModuleType.Default, Key.Enter, () => {

        });
    }
    loadData() {

    }
}
// ...

/**
 * 全局变量
 */
let modDefu = new DefaultModule(pageEvent);

let cokStatus = new Cookie('template_status');
let source = new PageSource("template_source");
let request = <IRequest>new ParseUrl(window.location.search).getDecodeURIComponent();

// ...

function main() {
    entrancePage();

    subscribeToEvents();



    recoverPage();
}
function subscribeToEvents() {
    // 全局事件定义 ...
}
function openBlank() {
    leavePage();
    // ...
}
function entrancePage() {
    source.saveToLocal();

}
function leavePage() {
    // ...
    cokStatus.setCookie(Json.serializ({ code: null, index: null }));
}
function recoverPage() {
    let leave = Json.deSerializ(cokStatus.getCookie());


    if (leave) {
        let index = leave.index;
        let code = leave.code;
        // ...
    }
}
function previousPage() {
    let url = source.takeToLocal();
    cokStatus.clearCookie();

    if (url) {
        source.removeToLocal();
        window.location.href = url;
    } else {
        // ...
    }
}
main();