/**
 * 修改：2017年9月5日11:33:59
 * 版本：v1.0.2
 * 内容：√1.PageEvent 焦点移交，若目标模块没有订阅，加入异常提示
 *      √2.针对常用 focus blur keydown 事件做封装并且可扩展
 *      √3.针对 focus 添加来源对象
 *      √4.取消 Mediator 中介器 改用 EventMeitter 发射器代替(可支持同一事件被多个地方订阅)
 *      √5.移除 v1.0.0 system.${ele.topic}.${targetName} 方式订阅内部处理事件 改用发射器订阅 执行方式仍然是 模块封装的自动行为执行 > 开发者自定义事件处理执行
 *      √6.增加初始化 targetName 可以为 null 禁用默认焦点的设置
 *      √7.多个模块具有同一功能，比如返回、确定等。新增同一处理入口
 *      √8.加入队列管理事件执行队列与顺序
 */
import { Mediator } from './mediator';
import { EventEmitter } from './eventEmitter';
import { SetTimeout, Key } from './dataTool';
import { AppEvent } from './appEvent';

var PageEventType = {
    // 基本事件
    /**
     * 模块获取焦点
     */
    Focus: 'focus',
    /**
     * 模块失去焦点
     */
    Blur: 'blur',
    /**
     * 用户点击触发
     */
    Keydown: 'keydown',
    /**
     * 基于PageEvent 相关异常信息
     */
    Error: 'PageEventType.Error'
}
interface PageEventResponse {
    Event: any,
    Target: string | number,
    EventName: string | number,
    KeyCode: number,
    Data: any,
    Source: string | number;
}
class PageEvent implements IPageEvent {
    private readonly _eventEmitter: IEventEmitter;
    private readonly events: Array<{ target?: Document | Window, topic: string | number, data: any, handler: Array<string | number>; }>;
    private targetName: string | number = null;
    private previousName: string | number = null;
    private disableTops: number[] = [];
    private lockTops: number[] = [];
    private lockKeycodes: any = {};

    constructor(targetName: string | number, events: Array<{ target?: Document | Window, topic: string | number, data: any, handler: Array<string | number>; }>, otherDebug: boolean = false, emitterDebug: boolean = false, ) {
        this.events = events;
        let mediator = new Mediator(emitterDebug);
        this._eventEmitter = new EventEmitter(mediator);
        // 订阅异常事件
        if (otherDebug) {
            this.subscribeEvent();
        }
        this.initialize(events);
        // 解释器初始化后触发
        new SetTimeout().enable(() => {
            if (null === this.targetName) {
                if (null !== targetName)
                    this.target(targetName);
                else
                    this.trigger("*", PageEventType.Error, "当前 PageEvent 未设置默认焦点模块");
            }
        });
    }
    private initialize(events: Array<{ target?: Document | Window, topic: string | number, data: any, handler: Array<string | number>; }>) {
        for (var i = 0; i < events.length; i++) {
            let ele: any = events[i];
            ele.target = ele.target || document;    // 默认目标文档

            ele.target[`on${ele.topic}`] = (event: any) => {
                let e = event || window.event;

                // 订阅所有 处理
                for (let j = 0; j < ele.handler.length; j++) {
                    let targetName = ele.handler[j];

                    // 触发目标为焦点事件
                    if (this.targetName == targetName) {
                        let params: PageEventResponse = { Event: e, Target: targetName, EventName: ele.topic, KeyCode: e.keyCode, Source: null, Data: null };
                        let trigger = false;
                        if (!this.hasDisable(targetName)) {
                            if (!this.hasLock(targetName)) {
                                trigger = true;
                            } else {
                                // 锁定的键码
                                if (!this.hasLockKeycode(targetName, e.keyCode)) {
                                    trigger = true;
                                }
                            }
                        }
                        if (trigger) {
                            // 发布当前触发事件简码事件
                            if (params && params.KeyCode) {
                                this.trigger(targetName, params.KeyCode, params);
                            }
                            // topic 为 number 类型默认当中 keyCode 处理
                            this.trigger(targetName, ele.topic, params);
                            // 所有模块的事件
                            // this.trigger("*", ele.topic, params);
                        }
                        break;
                    }
                }
            }
        }
    }
    trigger(identCode: string | number, topic: string | number, data: any = null) {
        this._eventEmitter.triggerEvent(new AppEvent(`${identCode}-${topic}`, data, null));
    }
    on(identCode: string | number, topic: string | number, callback: any) {
        this._eventEmitter.subscribeToEvents(new AppEvent(`${identCode}-${topic}`, null, callback));
    }
    off(identCode: string | number, topic: string | number) {
        this._eventEmitter.unsubscribeToEvents(new AppEvent(`${identCode}-${topic}`, null, null));
    }
    hasSubscribe(identCode: string | number, topic: string | number): boolean {
        return this._eventEmitter.hasSubscribe(new AppEvent(`${identCode}-${topic}`, null, null));
    }
    target(identCode: string | number, data?: any) {
        // 是否有模块订阅该事件（通常为 Focus 也可以是其他自定义组件）
        if (!this.hasSubscribe(identCode, PageEventType.Focus)) {
            this.trigger("*", PageEventType.Error, "当前 PageEvent 的 target 执行焦点移交时模块：" + identCode + " 未订阅Focus相关事件当前操作无效");
        } else {
            // 加入有效模块列表，否则不予执行
            // events 目前仅处理第一组数据的 keydown 事件。
            let handlers = this.events[0].handler;
            if (typeof handlers[<number>identCode] == 'number') {

                // 如果被标记为禁用则不处理
                if (!this.hasDisable(Math.round(<number>identCode))) {
                    let sourceTargetName = this.targetName;
                    // 失去焦点事件
                    if (this.targetName !== null) {

                        let response: PageEventResponse = {
                            Event: null,
                            Target: identCode,
                            EventName: PageEventType.Blur,
                            KeyCode: -1,
                            Source: sourceTargetName,
                            Data: null
                        };

                        this.trigger(this.targetName, PageEventType.Blur, response);
                    }

                    // 获取焦点事件
                    let response: PageEventResponse = {
                        Event: null,
                        Target: identCode,
                        EventName: PageEventType.Focus,
                        KeyCode: 0,
                        Data: data,
                        Source: sourceTargetName
                    };
                    if (null !== this.targetName) {
                        this.previousName = this.targetName;
                    }
                    this.targetName = identCode;
                    this.trigger(identCode, PageEventType.Focus, response);
                }

            } else {
                this.trigger("*", PageEventType.Error, "当前 PageEvent 的 target 执行焦点移交时模块：" + identCode + " 未加入 PageEvent 的 handler 列表当前操作无效");
            }
        }
    }
    getTargetIdentCode() {
        return this.targetName;
    }
    getPreviousIdentCode() {
        return this.previousName;
    }
    private subscribeEvent() {
        // 程序异常调试参考信息
        this.on("*", PageEventType.Error, (msg: any) => {
            console.log(msg);
        });
    }
    enableTopic(identCode: number) {
        let list = this.disableTops, length = list.length;
        for (let i = 0; i < length; i++) {
            const ele = list[i];
            if (identCode == ele) {
                delete list[i];
                this.trigger("*", PageEventType.Error, "PageEvent 已将 " + identCode + " 模块启用")
                break;
            }
        }
    }
    disableTopic(identCode: number) {
        let list = this.disableTops, length = list.length, isAdd = true;
        for (let i = 0; i < length; i++) {
            const ele = list[i];
            if (identCode == ele) {
                isAdd = false;
                break;
            }
        }
        if (isAdd) {
            list.push(identCode);
        }
    }
    hasDisable(identCode: number): boolean {
        let list = this.disableTops, length = list.length, isDisable = false;
        for (let i = 0; i < length; i++) {
            const ele = list[i];
            if (identCode == ele) {
                isDisable = true;
                break;
            }
        }
        return isDisable;
    }
    lockTopic(identCode: number, keyCodes?: number[]) {
        let list = this.lockTops, length = list.length, isAdd = false;
        for (let i = 0; i < length; i++) {
            const ele = list[i];
            if (identCode == ele) {
                isAdd = true;
                break;
            }
        }
        if (!isAdd) {
            list.push(identCode);
            this.trigger("*", PageEventType.Error, "PageEvent 已将 " + identCode + " 模块锁定")
        }
        // 锁定 keyCode
        if (keyCodes && keyCodes.length) {
            keyCodes.forEach((v, i) => {
                this.lockKeycode(identCode, v);
            });
        }
    }
    unlockTopic(identCode: number, keyCodes?: number[]) {
        let isRemove = false;
        // 解锁 keyCode
        if (undefined != keyCodes) {
            if (keyCodes && keyCodes.length) {
                keyCodes.forEach((v, i) => {
                    this.unlockKeycode(identCode, v);
                });
                let arr: Array<number> = this.lockKeycodes[identCode], j = 0;
                for (let i = 0; i < arr.length; i++) {
                    const ele = arr[i];
                    if (ele) {
                        j++;
                        break;
                    }
                }
                if (!j) {
                    isRemove = true;
                }
            }
        } else {
            // 删除所有
            this.unlockKeycode(identCode);
            isRemove = true;
        }
        // 所有键码都被删除则删除焦点锁定
        if (isRemove) {
            let list = this.lockTops, length = list.length;
            for (let i = 0; i < length; i++) {
                const ele = list[i];
                if (identCode == ele) {
                    delete list[i];
                    this.trigger("*", PageEventType.Error, "PageEvent 已将 " + identCode + " 模块解锁")
                    break;
                }
            }
        }
    }
    hasLock(identCode: number) {
        let list = this.lockTops, length = list.length, isLock = false;
        for (let i = 0; i < length; i++) {
            const ele = list[i];
            if (identCode == ele) {
                isLock = true;
                break;
            }
        }
        return isLock;
    }
    private lockKeycode(identCode: number, keyCode: number) {
        let keycodes: number[] = <any>this.lockKeycodes[identCode];
        if (keycodes && keycodes.length) {
            let isAdd = true;
            for (let i = 0; i < keycodes.length; i++) {
                const ele = keycodes[i];
                if (keyCode == ele) {
                    isAdd = false;
                    break;
                }
            }
            if (isAdd) {
                keycodes.push(keyCode);
                this.trigger("*", PageEventType.Error, "PageEvent 已将 keyCode:" + keyCode + " 禁用");
            }
        } else {
            this.lockKeycodes[identCode] = [keyCode];
            this.trigger("*", PageEventType.Error, "PageEvent 已将 keyCode:" + keyCode + " 禁用");
        }
    }
    private unlockKeycode(identCode: number, keyCode?: number) {
        if (undefined != keyCode) {
            let keycodes: number[] = <any>this.lockKeycodes[identCode];
            if (keycodes && keycodes.length) {
                for (let i = 0; i < keycodes.length; i++) {
                    const ele = keycodes[i];
                    if (keyCode == ele) {
                        delete keycodes[i];
                        this.trigger("*", PageEventType.Error, "PageEvent 已将 keyCode:" + keyCode + " 启用");
                        break;
                    }
                }
            }
        } else {
            // 删除所有相关 keyCode 集合
            this.lockKeycodes[identCode] = [];
            this.trigger("*", PageEventType.Error, "PageEvent 已将 identCode:" + identCode + " 解锁");
        }
    }
    /**
     * 该 identCode 对应 锁定码列表如果为空则返回 true
     * 该 identCode 对应 解锁码列表至少有一个元素且存在 keyCode 则返回 true
     * @param identCode 
     * @param keyCode 
     */
    private hasLockKeycode(identCode: number, keyCode: number) {
        let keycodes: number[] = <any>this.lockKeycodes[identCode], isLock = false;
        if (keycodes && keycodes.length) {
            for (let i = 0; i < keycodes.length; i++) {
                const ele = keycodes[i];
                if (keyCode == ele) {
                    isLock = true;
                    break;
                }
            }
        } else {
            isLock = true;
        }
        return isLock;
    }
}
export { PageEvent, PageEventType, PageEventResponse }