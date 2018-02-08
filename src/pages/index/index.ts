/**
 * 编辑作者：张诗涛
 * 创建时间：2018年1月30日 14点29分
 * 功能分类：视频逻辑页
 */
import { Config } from "../../config";
import { PageEvent, PageEventType, Module, Site, Focus, FocusType, HElement, FuncLock, FocusResponse, Key } from "../../framework/framework";
import { } from "../../model/model";
import { } from "../../logic/logic";

enum ModuleType {
    One,
    Two
}
let pageEvent = new PageEvent(ModuleType.One, [
    {
        topic: PageEventType.Keydown, data: null, handler: [
            ModuleType.One,
            ModuleType.Two
        ]
    }
], false);
let focOne = new Focus({
    identCode: ModuleType.One,
    className: "active",
    autoTarget: [{ keyCode: Key.Enter, target: ModuleType.Two }, { keyCode: Key.Backspace, target: ModuleType.Two }]
}, pageEvent);
let focTwo = new Focus({
    identCode: ModuleType.Two,
    className: "active",
    autoTarget: [{ keyCode: Key.Enter, target: ModuleType.One }, { keyCode: Key.Backspace, target: ModuleType.One }]
}, pageEvent);

function main() {
    focOne.initData([new HElement('#one')]);
    focTwo.initData([new HElement('#two')]);
    subscribeToEvents();
}
function subscribeToEvents() {
}
main();