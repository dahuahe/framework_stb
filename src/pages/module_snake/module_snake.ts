/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月12日 21点45分
 * Module 模块使用示例
 */
import { Focus, FocusType, PageEvent, PageType, HElement, Key, Json, Random, Module } from "../../framework/framework";

enum MType {
    Left
}

let pageEvent = new PageEvent(MType.Left, [
    {
        topic: PageType.Keydown, data: null, handler: [
            MType.Left
        ]
    }
], true);

class SnakeModule extends Module {
    private foc: Focus;

    // datas
    private fishIndex = -1; // 记录鱼坐标
    private len = 1;        // 记录身体长度

    // eles
    private eleTips = new HElement('#tips');

    constructor(e: PageEvent) {
        super(e);
        this.initialize();
        this.subscribeToEvents();
    }
    protected initialize() {
        this.foc = new Focus({
            identCode: MType.Left,
            width: 5,
            className: "focus"
        }, pageEvent);
        this.foc.initData(new HElement("#con-lf").children("div"));

        this.createFish();
    }
    protected subscribeToEvents() {
        // 监听蛇爬行
        this.onchanged(MType.Left, (e) => {
            let ele = e.site.element;

            // 有效的爬行动作
            if (e.success) {
                // 重置方向
                this.foc.record().forEach((v, i) => {
                    v.element.removeClas("head");
                    v.element.removeClas("body");
                    v.element.style("background-image", "");
                });
                // 方向
                if (Key.Left === e.keyCode) {
                    e.site.element.style("background-image", "url('./images/head_left.png')");
                }
                else if (Key.Up === e.keyCode) {
                    e.site.element.style("background-image", "url('./images/head_up.png')");
                }
                else if (Key.Right === e.keyCode) {
                    e.site.element.style("background-image", "url('./images/head_right.png')");
                }
                else if (Key.Down === e.keyCode) {
                    e.site.element.style("background-image", "url('./images/head_down.png')");
                }

                // 吃到鱼
                if (this.fishIndex === e.site.index) {

                    ele.removeClas('fish');
                    // 身体长大一节
                    if (this.len <= 10) {
                        this.len++;
                    } else {
                        // 禁用
                        pageEvent.disableTopic(MType.Left);

                        this.eleTips.html("恭喜通关!")
                    }
                    this.createFish();
                }

                // 重置身体
                this.foc.record().forEach((v, i) => {
                    v.element.removeClas("head");
                    v.element.removeClas("body");
                });

                // 绘画身体
                this.foc.record().reverse();

                this.foc.record().forEach((v, i) => {
                    if (i < this.len) {
                        if (i === 0) {
                            v.element.clas("head");
                        } else {
                            v.element.clas("body");
                        }
                    }
                });

                this.foc.record().reverse();
            }
        });
    }
    private createFish() {
        let records = this.foc.record();

        let bodys: number[] = [];

        records.reverse();

        records.forEach((v, i) => {
            if (i < this.len) {
                bodys.push(v.index);
            }
        });

        records.reverse();

        // 排除身体
        let idx = -1, v: number;
        do {
            v = Random.scope(0, this.foc.getSites().length);

            if (bodys.every((v_2) => {
                return v_2 !== v;
            })) {
                idx = v;
            }
        } while (-1 === idx);

        this.fishIndex = idx;
        this.foc.getSites()[this.fishIndex].element.clas('fish');
    }
}

let modSna = new SnakeModule(pageEvent);