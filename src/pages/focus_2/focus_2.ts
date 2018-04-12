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

// 获取 HTMLElement 对象实例（类似 jquery 选择器）
let eleTips = new HElement('#tips');

let focLeft = new Focus({
    identCode: MType.Left,
    width: 5,
    className: "focus"
}, pageEvent);

focLeft.initData(new HElement("#con-lf").children("div"));

// 订阅坐标改变事件
pageEvent.on(MType.Left, FocusType.Changed, (e: IChanged) => {

    // 获取当前坐标对象
    let site = focLeft.getSite();

    // 坐标改变状态
    if (e.success) {
        if (Key.Left === e.keyCode) {
            eleTips.html(`按了左键 且改变单元格坐标为 ${Json.serializ(site)}`);
        }
        else if (Key.Up === e.keyCode) {
            eleTips.html(`按了上键 且改变单元格坐标为 ${Json.serializ(site)}`);
        }
        else if (Key.Right === e.keyCode) {
            eleTips.html(`按了右键 且改变单元格坐标为 ${Json.serializ(site)}`);
        }
        else if (Key.Down === e.keyCode) {
            eleTips.html(`按了下键 且改变单元格坐标为 ${Json.serializ(site)}`);
        }
    } else {
        if (Key.Left === e.keyCode) {
            eleTips.html(`按了左键 改变单元格坐标失败 ${Json.serializ(site)}`);
        }
        else if (Key.Up === e.keyCode) {
            eleTips.html(`按了上键 改变单元格坐标失败 ${Json.serializ(site)}`);
        }
        else if (Key.Right === e.keyCode) {
            eleTips.html(`按了右键 改变单元格坐标失败 ${Json.serializ(site)}`);
        }
        else if (Key.Down === e.keyCode) {
            eleTips.html(`按了下键 改变单元格坐标失败 ${Json.serializ(site)}`);
        }
    }
});