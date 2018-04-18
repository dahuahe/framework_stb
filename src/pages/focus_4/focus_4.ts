/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月12日 21点45分
 * 功能分类：Focus 模块使用示例
 */
import { Focus, FocusType, PageEvent, PageType, HElement, Key, Json } from "../../framework/framework";

enum MType {
    Top,
    Bottom
}

let pageEvent = new PageEvent(MType.Top, [
    {
        topic: PageType.Keydown, data: null, handler: [
            MType.Top,
            MType.Bottom
        ]
    }
], true);

let focTop = new Focus({
    identCode: MType.Top,
    width: 7,
    className: "focus",
    span: [
        { index: 0, colspan: 2 },
        { index: 1, rowspan: 2 },
        { index: 2, colspan: 2 },
        { index: 3, rowspan: 2 }
    ],
    autoTarget: [
        { keyCode: Key.Down, target: MType.Bottom }
    ]
}, pageEvent);

let focBottom = new Focus({
    identCode: MType.Bottom,
    width: 7,
    className: "focus",
    span: [
        { index: 0, rowspan: 2 },
        { index: 1, colspan: 4 }
    ],
    autoTarget: [
        { keyCode: Key.Up, target: MType.Top }
    ]
}, pageEvent);

focTop.initData(new HElement("#tab").children("tbody").children("tr").children("td"));
focBottom.initData(new HElement("#tab-bottom").children("tbody").children("tr").children("td"));

// 查看算法矩阵
focTop.debuggerOut();
focBottom.debuggerOut();