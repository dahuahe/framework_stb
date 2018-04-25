/**
 * 编辑作者：
 * 创建时间：
 * 功能分类：
 */
import { Config } from "../../config";
import { Set, AppEvent, Dictionary, DoublyLinkedNode, DoublyLinkedList, Queue, EventEmitter, Mediator, FormatTime, FuncLock, PageSource, ParseUrl, Key, SetInterval, SetTimeout, Extend, Random, FormatUrl, Guid, Json, ConvertKey, Cookie, HElement, VerticalRoll, HorizontalRoll, ManagementPageDB, ManagementFlowDB, ManagementPageDBToNative, PageEvent, Module, Paging, PagingHelper, Site, Focus, FocusType, PageType } from "../../framework/framework";
import { TetrisType, TransformType } from "../../model/model";
import { TetrisBasic, MapLogic, SquareTetris, TriangleTetris, LineTetris, SevenTetris } from "../../logic/logic";

interface IRequest {
}

enum MType {
    /**
     * 焦点模块
     */
    List,
    /**
     * 交互模块
     */
    Command
}

let pageEvent = new PageEvent(null, [
    {
        topic: PageType.Keydown, data: null, handler: [
            MType.Command,
            MType.List
        ]
    }
]);

/**
 * @name 命令操控模块
 */
class CommonModule extends Module {
    private foc: Focus;
    private timerMove = new SetInterval(500);

    private lgcTet: TetrisBasic;
    private lgcMap: MapLogic;

    private score = 0;
    private txtScore = new HElement('#txt-score');

    constructor(pageEvent: PageEvent) {
        super(pageEvent);
        this.initialize();
        this.subscribeToEvents();
    }
    protected initialize() {

        this.foc = new Focus({
            identCode: MType.List,
            width: 18
        }, this.event);

        this.foc.initData(new HElement('#container').children());

        this.lgcMap = new MapLogic(this.foc);
    }
    protected subscribeToEvents() {
        this.onfocus(MType.Command, null);

        this.onKeydown(MType.Command, (e) => {
            let keyCode = e.keyCode, list: ISite[] = [];

            if (Key.Left === keyCode) {

                list = this.lgcTet.getLeft();
                if (this.lgcMap.valid(list)) {
                    this.lgcTet.update(this.foc.getSite([Key.Left]), list);
                }

            }
            else if (Key.Right === keyCode) {

                list = this.lgcTet.getRight();


                if (this.lgcMap.valid(list)) {

                    this.lgcTet.update(this.foc.getSite([Key.Right]), list);

                }

            }
            else if (Key.Down === keyCode) {

                list = this.lgcTet.getDown();
                if (this.lgcMap.valid(list)) {
                    this.lgcTet.update(this.foc.getSite([Key.Down]), list);
                }

            }
            else if (Key.Spacing === keyCode) {

                list = this.lgcTet.transform();
                if (this.lgcMap.valid(list)) {
                    this.lgcTet.update(this.foc.getSite([Key.Down]), list);
                } else {
                    this.lgcTet.recoverTransform();
                }
            }
            this.lgcMap.draw();
        });
    }
    start() {
        // 初始化坐标
        this.foc.setSite(8);

        // 类型数量
        let r = Random.scope(0, 4), list;
        this.lgcTet = this.lgcMap.create(r);
        this.lgcMap.draw();

        this.timerMove.enable(() => {
            list = this.lgcTet.getDown();
            if (this.lgcMap.valid(list)) {
                this.lgcTet.update(this.foc.getSite([Key.Down]), list);
            } else {

                this.timerMove.clear();

                if (this.foc.getSite().x > 0) {

                    this.lgcMap.add(this.lgcTet.getSites());

                    let score = this.lgcMap.clear();

                    this.score += score;

                    if (score) {
                        this.txtScore.text(`${this.score}`);
                    }

                    this.start();
                } else {
                    alert("游戏结束")
                }
            }
            this.lgcMap.draw();
        });
    }
}

let modCom = new CommonModule(pageEvent);

let boxPage = new HElement('#page');

function main() {
    subscribeToEvents();
}
function subscribeToEvents() {
    document.getElementById('btn-start').onclick = function () {
        // 绘画
        pageEvent.target(MType.Command);
        modCom.start();
        boxPage.addClass("animation");
    }
    document.getElementById("btn-reload").onclick = function () {
        window.location.reload();
    }
}
main();