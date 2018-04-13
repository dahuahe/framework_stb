/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月12日 21点45分
 * 功能分类：Focus 模块使用示例
 */
import { Focus, FocusType, PageEvent, PageType, HElement, Key, Json } from "../../framework/framework";

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

// 1.实例化
let focLeft = new Focus({
    identCode: MType.Left,
    width: 5,
    className: "focus"
}, pageEvent);

// 2.初始化
focLeft.initData(new HElement("#con-lf").children("div"));