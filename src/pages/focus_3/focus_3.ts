/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月12日 21点45分
 * 功能分类：Focus 模块使用示例
 */
import { Focus, FocusType, PageEvent, PageType, HElement, Key, Json } from "../../framework/framework";

enum MType {
    Left,
    Right // 新增一个模块
}

let pageEvent = new PageEvent(MType.Left, [
    {
        topic: PageType.Keydown, data: null, handler: [
            MType.Left,
            MType.Right // 注册事件
        ]
    }
], true);

let eleTips = new HElement('#tips');

let focLeft = new Focus({
    identCode: MType.Left,
    width: 5,
    className: "focus",
    autoTarget: [
        { keyCode: Key.Right, target: MType.Right } // 配置模块焦点右侧移交规则
    ]
}, pageEvent);

focLeft.initData(new HElement("#con-lf").children("div"));

// 实例化右侧 focus 对象
let focRight = new Focus({
    identCode: MType.Right, // 模块唯一标识
    width: 5,
    className: "focus",
    autoTarget: [
        { keyCode: Key.Left, target: MType.Left } // 配置模块焦点左侧移交规则
    ]
}, pageEvent);

// 初始化数据
focRight.initData(new HElement("#con-rg").children("div"));

// 订阅右侧模块 获取焦点 失去焦点事件
pageEvent.on(MType.Right, PageType.Focus, (e: IFocus) => {
    // 当前坐标信息
    let site = focRight.getSite();

    eleTips.html(`焦点从左侧模块 移交 到右侧模块 且当前左侧坐标为 ${Json.serializ(site)}`);

});
pageEvent.on(MType.Right, PageType.Blur, (e: IFocus) => {
    // 当前坐标信息
    let site = focRight.getSite();

    eleTips.html(`焦点从右侧模块离开 且当前右侧坐标为 ${Json.serializ(site)}`);
});
