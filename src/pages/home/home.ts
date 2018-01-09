// /**
//  * 编辑作者：张诗涛
//  * 创建时间：2018年1月5日17:13:38
//  * 功能分类：模板逻辑页
//  */
import { Config } from "../../config";
import { PageEvent, PageEventType, Module, Site, Focus, FocusType, HElement, FuncLock, FocusResponse } from "../../framework/framework";
import { } from "../model/model";
import { } from "../logic/logic";
import { Key } from "../../framework/data_tool/dataTool";

enum ModuleType {
    IdentCode1,
    IdentCode2
}
enum EventType {
}
let pageEvent = new PageEvent(ModuleType.IdentCode1, [
    {
        topic: PageEventType.Keydown, data: null, handler: [
            ModuleType.IdentCode1,
            ModuleType.IdentCode2
        ]
    }
], true);

// 发现-首页
class PageHome extends Module {
    focus: Focus;

    constructor(event: PageEvent) {
        
        console.log('子类构造方法 调用父类之前');
        super(event);
        console.log('子类构造方法 调用父类之后');
    }
    initialize() {
        console.log('重写 initialize');

        let list: HElement[] = [];
        let container = document.getElementById('container')
        for (let i = 0; i < 5; i++) {
            let div = document.createElement('div');
            div.className = 'grid';
            list.push(new HElement(div));
            container.appendChild(div);
        }
        this.focus = new Focus({
            identCode: ModuleType.IdentCode1,
            width: 4,
            className: 'active',
            usingClass: function (e: FocusResponse) {
                console.log('usingClass');
            },
            cancelClass: function (e: FocusResponse) {
                console.log('cancelClass');
            },
            autoFill: [Key.Down],
            leaveClass: 'disable',
            autoTarget: [
                { keyCode: Key.Down, target: ModuleType.IdentCode2 }
            ]
        }, pageEvent);
        this.focus.initData(list);
        this.focus.debuggerOut();
    }
    subscribeToEvents() {
        
        console.log('重写 subscribeToEvents');
    }
}
class PageHome2 extends Module {
    focus: Focus;
    constructor(event: PageEvent) {
        super(event);
    }
    initialize() {
        let list: HElement[] = [];
        let container = document.getElementById('container_2')
        for (let i = 0; i < 5; i++) {
            let div = document.createElement('div');
            div.className = 'grid';
            list.push(new HElement(div));
            container.appendChild(div);
        }
        this.focus = new Focus({
            identCode: ModuleType.IdentCode2,
            width: 4,
            className: 'active',
            autoTarget: [{ keyCode: Key.Up, target: ModuleType.IdentCode1 }],
            usingClass: function (e: FocusResponse) {
                console.log('usingClass2');
            },
            cancelClass: function (e: FocusResponse) {
                console.log('cancelClass2');
            }
        }, pageEvent);
        this.focus.initData(list);
        this.focus.debuggerOut();
    }
    subscribeToEvents() {
    }
}
let homeOne = new PageHome(pageEvent);
let homeTwo = new PageHome2(pageEvent);
function main() {
    pageEvent.disableTopic(ModuleType.IdentCode2);
    pageEvent.enableTopic(ModuleType.IdentCode2);
}
main();