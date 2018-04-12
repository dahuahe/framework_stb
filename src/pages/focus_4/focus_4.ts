/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月12日 21点45分
 * 功能分类：Focus 模块使用示例
 */
import { Focus, FocusType, PageEvent, PageType, HElement, Key, Json, Random } from "../../framework/framework";

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

let eleTips = new HElement('#tips');
let fishIndex = -1; // 记录鱼坐标
let len = 1; // 记录身体长度

let focLeft = new Focus({
    identCode: MType.Left,
    width: 5,
    className: "focus"
}, pageEvent);

focLeft.initData(new HElement("#con-lf").children("div"));

// 监听蛇爬行事件
pageEvent.on(MType.Left, FocusType.Changed, (e: IChanged) => {
    let ele = e.site.element;

    // 有效的爬行动作
    if (e.success) {

        // 吃到鱼
        if (fishIndex === e.site.index) {

            ele.removeClas('fish');
            // 身体长大一节
            if (len <= 10) {
                len++;
            } else {
                // 禁用
                pageEvent.disableTopic(MType.Left);

                eleTips.html("恭喜通关!")
            }
            createFish();
        }

        // 重置身体
        focLeft.record().forEach((v, i) => {
            v.element.removeClas("head");
            v.element.removeClas("body");
        });

        // 绘画身体
        focLeft.record().reverse();

        focLeft.record().forEach((v, i) => {
            if (i < len) {
                if (i === 0) {
                    v.element.clas("head");
                } else {
                    v.element.clas("body");
                }
            }
        });

        focLeft.record().reverse();
    }else{

    }
});

createFish();

// 创建一条鱼
function createFish() {
    let records = focLeft.record();

    let bodys: number[] = [];

    records.reverse();

    records.forEach((v, i) => {
        if (i < len) {
            bodys.push(v.index);
        }
    });

    records.reverse();

    // 排除身体
    let idx = -1, v: number;
    do {
        v = Random.scope(0, focLeft.getSites().length);

        if (bodys.every((v_2) => {
            return v_2 !== v;
        })) {
            idx = v;
        }
    } while (-1 === idx);

    fishIndex = idx;
    focLeft.getSites()[fishIndex].element.clas('fish');
}
