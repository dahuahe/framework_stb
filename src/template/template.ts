/**
 * 编辑作者：
 * 创建时间：
 * 功能分类：
 */
import { Config } from "../../config";
import { AppEvent, Dictionary, DoublyLinkedNode, DoublyLinkedList, Queue, EventEmitter, Mediator, FormatTime, FuncLock, PageSource, ParseUrl, Key, SetInterval, SetTimeout, Extend, Random, FormatUrl, Guid, Json, ConvertKey, Cookie, HElement, VerticalRoll, HorizontalRoll, ManagementPageDB, ManagementFlowDB, ManagementPageDBToNative, PageEvent, Module, Paging, PagingHelper, Site, Focus, FocusType, PageType } from "../../framework/framework";
import { } from "../../model/model";
import { } from "../../logic/logic";

interface IRequest {
}

enum MType {
    Default
}

let pageEvent = new PageEvent(null, [
    {
        topic: PageType.Keydown, data: null, handler: [
            MType.Default
        ]
    }
], true);

class DefaultModule extends Module {
    foc: Focus;
    constructor(pageEvent: PageEvent) {
        super(pageEvent);
        this.initialize();
        this.subscribeToEvents();
    }
    protected initialize() {
        this.foc = new Focus({
            identCode: MType.Default,
            className: "focus"
        }, this.event);
    }
    protected subscribeToEvents() {
    }
    loadData() {
    }
}

let request = <IRequest>new ParseUrl(window.location.search).getDecodeURIComponent();
let source = new PageSource("default_source");
let cokStatus = new Cookie('default_status');

let modDefu = new DefaultModule(pageEvent);

function main() {
    entrancePage();

    subscribeToEvents();

    modDefu.loadData();

    recoverPage();
}
function subscribeToEvents() {
}
function openBlank() {
    leavePage();
    // ...
}
function entrancePage() {
    source.saveToLocal();
    // ...
}
function leavePage() {
    cokStatus.setCookie(Json.serializ({ code: null, index: null }));
    // ...
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