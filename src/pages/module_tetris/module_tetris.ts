/**
 * 编辑作者：
 * 创建时间：
 * 功能分类：
 */
import { Config } from "../../config";
import { AppEvent, Dictionary, DoublyLinkedNode, DoublyLinkedList, Queue, EventEmitter, Mediator, FormatTime, FuncLock, PageSource, ParseUrl, Key, SetInterval, SetTimeout, Extend, Random, FormatUrl, Guid, Json, ConvertKey, Cookie, HElement, VerticalRoll, HorizontalRoll, ManagementPageDB, ManagementFlowDB, ManagementPageDBToNative, PageEvent, Module, Paging, PagingHelper, Site, Focus, FocusType, PageType } from "../../framework/framework";
import { TetrisType, TetrisEntity } from "../../model/model";
import { } from "../../logic/logic";

interface IRequest {
}

enum MType {
    Map,
    Command
}

let pageEvent = new PageEvent(MType.Command, [
    {
        topic: PageType.Keydown, data: null, handler: [
            MType.Map,
            MType.Command
        ]
    }
], true);

class MapModule extends Module {
    private foc: Focus;
    private type: TetrisType;
    private tetris: TetrisEntity;
    private timer = new SetInterval(500);
    private finish: ISite[] = [];
    private transform = 0;

    constructor(pageEvent: PageEvent) {
        super(pageEvent);
        this.initialize();
        this.subscribeToEvents();
    }
    protected initialize() {
        this.foc = new Focus({
            identCode: MType.Map,
            width: 18
        }, this.event);
        this.foc.initData(new HElement('#container').children());
    }
    protected subscribeToEvents() {
        this.onfocus(MType.Command, () => {

        });
        this.onKeydown(MType.Command, (e) => {
            if (Key.Right === e.keyCode) {
                this.toRight();
            }
            else if (Key.Down === e.keyCode) {
                this.toDown();
            }
            else if (Key.Left === e.keyCode) {
                this.toLeft();
            }
            // 变形
            else if (Key.Spacing === e.keyCode) {
                this.transform++;
                if (3 < this.transform) {
                    this.transform = 0;
                }
                this.createTetris(this.foc.getSite().index, this.transform);
            }
        });
    }
    drawTetris() {
        // 类型数量
        let r = Random.scope(0, 4);
        this.type = r;

        let gameover = false, data = [], len = 0, v: any;

        this.toFirst();

        this.timer.enable(() => {

            if (this.toDown()) {

            } else {
                this.timer.clear();

                data = this.tetris.getSites(), len = data.length;

                for (let i = 0; i < len; i++) {
                    v = data[i];
                    if (0 === v.x) {
                        gameover = true;
                        break;
                    } else {
                        this.finish.push(v);
                    }
                }

                // 自动向下归位
                if (!gameover) {
                    let clearI: number[] = [];
                    this.foc.forEachRow((v, i) => {
                        if (v.every((v_2) => {
                            return v_2.element.hasClass("focus");
                        })) {
                            v.forEach((v_3) => {
                                clearI.push(v_3.index);
                            })
                        }
                    });

                    if (clearI.length) {
                        clearI.forEach((i) => {
                            for (let j = 0; j < this.finish.length; j++) {
                                const ele = this.finish[j];
                                if (i === ele.index) {
                                    this.finish[j].element.removeClass("focus")
                                    this.finish.splice(j, 1);
                                    break;
                                }
                            }
                        });
                    }

                    // 创建
                    this.drawTetris();
                } else {
                    alert("游戏结束");
                }
            }
        });
    }
    private toFirst() {
        this.createTetris(8, 0);
    }
    private toDown() {
        if (this.hasDownValid()) {

            let i = this.foc.getSite([Key.Down]);
            this.createTetris(i.index);

            return true;
        } else {
            return false;
        }
    }
    private toRight() {
        if (this.hasRightValid()) {

            let i = this.foc.getSite([Key.Right]);
            this.createTetris(i.index);

            return true;
        } else {
            return false;
        }
    }
    private toLeft() {
        if (this.hasLeftValid()) {

            let i = this.foc.getSite([Key.Left]);
            this.createTetris(i.index);

            return true;
        } else {
            return false;
        }
    }
    private hasDownValid() {
        let list = this.tetris.getSites(), site: Site;

        return list.every((v) => {
            site = this.foc.getSite(v.x + 1, v.y);

            if (site) {
                // 有效区域
                if (this.finish.length) {
                    if (this.finish.every((v) => {
                        return v.index !== site.index;
                    })) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        });
    }
    private hasRightValid() {
        let list = this.tetris.getSites(), site: Site;

        return list.every((v) => {
            site = this.foc.getSite(v.x, v.y + 1);

            if (site) {
                // 有效区域
                if (this.finish.length) {
                    if (this.finish.every((v) => {
                        return v.index !== site.index;
                    })) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        });
    }
    private hasLeftValid() {
        let list = this.tetris.getSites(), site: Site;

        return list.every((v) => {
            site = this.foc.getSite(v.x, v.y - 1);

            if (site) {
                // 有效区域
                if (this.finish.length) {
                    if (this.finish.every((v) => {
                        return v.index !== site.index;
                    })) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        });
    }
    private createTetris(index: number, transform: number = this.transform) {
        this.transform = transform;
        this.foc.setSite(index);

        if (this.tetris) {
            this.tetris.getSites().forEach((v) => {
                v.element.removeClass("focus");
            });
        }
        this.tetris = new TetrisEntity(this.type);
        // 正方形
        if (TetrisType.Square === this.type) {
            this.tetris.initData([
                this.foc.getSite(),
                this.foc.getSite([Key.Right]),
                this.foc.getSite([Key.Down]),
                this.foc.getSite([Key.Down, Key.Right])
            ]);
        }
        // 三角形
        else if (TetrisType.Triangle === this.type) {

            if (0 === transform) {
                this.tetris.initData([
                    this.foc.getSite([Key.Down]),
                    this.foc.getSite([Key.Down, Key.Right]),
                    this.foc.getSite([Key.Down, Key.Right, Key.Up]),
                    this.foc.getSite([Key.Down, Key.Right, Key.Right]),
                ]);
            } else if (1 === transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Down]),
                    this.foc.getSite([Key.Down, Key.Right]),
                    this.foc.getSite([Key.Down, Key.Down])
                ]);
            }
            else if (2 === transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Right]),
                    this.foc.getSite([Key.Right, Key.Right]),
                    this.foc.getSite([Key.Right, Key.Down])
                ]);
            } else if (3 === transform) {
                this.tetris.initData([
                    this.foc.getSite([Key.Down]),
                    this.foc.getSite([Key.Right]),
                    this.foc.getSite([Key.Down, Key.Right]),
                    this.foc.getSite([Key.Down, Key.Right, Key.Down])
                ]);
            }
        }
        // 线
        else if (TetrisType.Line === this.type) {
            if (0 === this.transform || 2 === this.transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Right]),
                    this.foc.getSite([Key.Right, Key.Right]),
                    this.foc.getSite([Key.Right, Key.Right, Key.Right])
                ]);
            }
            else if (1 === this.transform || 3 === this.transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Down]),
                    this.foc.getSite([Key.Down, Key.Down]),
                    this.foc.getSite([Key.Down, Key.Down, Key.Down])
                ]);
            }
        }
        // 7
        else if (TetrisType.Seven === this.type) {
            if (0 === this.transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Down]),
                    this.foc.getSite([Key.Down, Key.Down]),
                    this.foc.getSite([Key.Down, Key.Down, Key.Right])
                ]);
            }
            else if (1 === this.transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Down]),
                    this.foc.getSite([Key.Right]),
                    this.foc.getSite([Key.Right, Key.Right])
                ]);
            }
            else if (2 === this.transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Right]),
                    this.foc.getSite([Key.Right, Key.Down]),
                    this.foc.getSite([Key.Right, Key.Down, Key.Down])
                ]);
            }
            else if (3 === this.transform) {
                this.tetris.initData([
                    this.foc.getSite(),
                    this.foc.getSite([Key.Down]),
                    this.foc.getSite([Key.Down, Key.Right]),
                    this.foc.getSite([Key.Down, Key.Right, Key.Right])
                ]);
            }
        }

        this.tetris.getSites().forEach((v) => {
            v.element.addClass("focus");
        });
        this.finish.forEach((v) => {
            v.element.addClass("focus");
        });
    }
    unload() {
        this.timer.clear();
        this.tetris.getSites().forEach((v) => {
            v.element.removeClass("focus");
        });
        this.tetris = null;
        this.finish.forEach((v) => {
            v.element.removeClass("focus");
        });
        this.finish = [];
    }
}

let modMap = new MapModule(pageEvent);

function main() {

    subscribeToEvents();

}
function subscribeToEvents() {
    document.getElementById('btn-start').onclick = function () {
        // 绘画
        modMap.drawTetris();
    }
    document.getElementById("btn-reload").onclick = function () {
        modMap.unload();
    }
}
main();