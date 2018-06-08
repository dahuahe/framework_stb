/**
 * 编辑作者：
 * 创建时间：
 * 功能分类：
 */
import { Config } from "../../config";
import { AppEvent, Dictionary, DoublyLinkedNode, DoublyLinkedList, Queue, EventEmitter, Mediator, FormatTime, FuncLock, PageSource, ParseUrl, Key, SetInterval, SetTimeout, Extend, Random, FormatUrl, Guid, Json, ConvertKey, Cookie, HElement, VerticalRoll, HorizontalRoll, ManagementPageDB, ManagementBothwayDB, ManagementPageDBToNative, PageEvent, Module, Paging, PagingHelper, Site, Focus, FocusType, PageType, ModulePage, VerticalVisualRangeRoll, Position, ManagementDynamicDB } from "../../framework/framework";
import { } from "../../model/model";
import { } from "../../logic/logic";

interface IRequest {
    return: string;
}

interface IMemo {
    key: MType;
    index: number;
    pageIndex: number;
}

enum MType {
    Default
}

let pageEvent = new PageEvent(MType.Default, [
    {
        topic: PageType.Keydown, data: null, handler: [
            MType.Default
        ]
    }
]);

/**
 * 普通组建
 */
class NormalModule extends Module {
    private foc: Focus;

    private readonly eles = new HElement("");

    private readonly box = new HElement("");

    constructor(pageEvent: PageEvent) {
        super(pageEvent);
        this.initialize();
        this.subscribeToEvents();
    }
    protected initialize() {
        this.foc = new Focus({
            identCode: MType.,
            className: "focus",
            width: 0,
            height: 0,
            autoTarget: [
                { keyCode: Key.Down, target: MType. }
            ]
        }, this.event);
        this.foc.initData(this.eles);
    }
    protected subscribeToEvents() {
    }
    loadData(ntt: any) {
        if (ntt) {
            // ...TODO
        }
    }
    recoverStatus() {

    }
}
/**
 * 列表组建
 */
class ListModule extends ModulePage<any> {
    private foc: Focus;

    private readonly size = ;

    private pg = new Paging(this.size);
    private db = new ManagementPageDB<any>(this.size);

    private readonly eles = new HElement("");
    private readonly txtCur = new HElement("");
    private readonly txtTot = new HElement("");
    private readonly box = new HElement("");

    private readonly horArr = new Dictionary<HorizontalRoll>();

    constructor(pageEvent: PageEvent) {
        super(pageEvent);
        this.initialize();
        this.subscribeToEvents();
    }
    protected initialize() {
        this.foc = new Focus({
            identCode: MType.,
            className: "focus",
            width: 0,
            height: 0,
            autoTarget: [
                { keyCode: Key.Down, target: MType. }
            ],
            // 走马灯
            enableSite: (e) => {
                if (!e) return;
                let hor, ele: IHelement = ;
                if (this.horArr.has(e.index)) {
                    hor = this.horArr.get(e.index);
                } else {
                    hor = new HorizontalRoll(ele);
                    this.horArr.set(e.index, hor);
                }
                hor.enable();
            },
            disableSite: (e) => {
                if (!e) return;

                if (this.horArr.has(e.index)) {
                    this.horArr.get(e.index).disable();
                }
            }
        }, this.event);

        this.db.OnBeforeSendRequest = (p, c) => {

            lgc.getSearchList({
                // ...TODO
            }, (info) => {
                if (info.success) {
                    let total = , list = ;
                    if (!this.pg.getDataSize()) {
                        this.pg.setDataSize(total);
                    }
                    c(list);
                } else {
                    c([]);
                }
            });
        }

        this.initSetting({
            foc: this.foc,
            eles: this.eles,
            pg: this.pg,
            db: this.db,
            activeClass: "",

            showItemBox: (e: IHElement) => {
                e.show();
            },
            hideItemBox: (e: IHElement) => {
                e.hide();
            },
            onDBLoadList: (list, s, callback: (list: any) => void) => {
                callback(list);
            },
            onDBLoadView: (list, s) => {
                this.txtCur.text(`${s.pg.getPageIndex()}`);
                this.txtTot.text(`${s.pg.getCountPage()}`);
            },
            onDBLoadData: (v, i: number, e: IHElement, s) => {

                let size = "175x260", img = new Image(), imgEle = e, poster = v., src = ;

                if (poster) {

                    img.onload = () => {

                        imgEle.attr("src", src);

                    }
                    img.onerror = () => {

                        imgEle.attr("src", src);

                    }
                    img.src = src;

                } else {
                    imgEle.attr("src", "");
                }
            },
        });
    }
    protected subscribeToEvents() {
    }
    loadData(ntt: any) {
        if (ntt) {
            // ...TODO
        }
    }
    recoverStatus() {

    }
}

let request = <IRequest>new ParseUrl(window.location.search).getDecodeURIComponent();

let source = new PageSource("default_source");
let cokStatus = new Cookie('default_status');

let lgc = null;

let modNor = new NormalModule(pageEvent);
let modLis = new ListModule(pageEvent);

let ntt: any = null;

function main() {

    entrancePage();

    subscribeToEvents();

    loadData().then(() => {
        recoverPage();
    });
}
function loadData() {
    return new Promise((resolve, reject) => {
        resolve();
    });
}
function subscribeToEvents() {
    // backspace
    pageEvent.on([MType.Default], Key.Backspace, () => {
        previousPage();
    });
}
function openBlank(url: string, params: any, memo: IMemo) {
    leavePage(memo);
    window.location.href = new FormatUrl(url, params).getEncodeURIComponent();
}
function entrancePage() {
    source.saveToLocal(request.return);

    // ...TODO
}
function leavePage(memo: IMemo) {
    cokStatus.setCookie(Json.serializ(memo));
}
function recoverPage() {
    let leave: IMemo = Json.deSerializ(cokStatus.getCookie());

    if (leave) {
        const { key, index, pageIndex } = leave;
        if (MType. === key) {

        }
    }
}
function previousPage() {
    let url = source.takeToLocal();

    if (url) {
        cokStatus.clearCookie();
        source.removeToLocal();
        window.location.href = url;
    } else {
        // ...
    }
}
main();