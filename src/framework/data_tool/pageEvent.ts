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
import { SetTimeout } from './dataTool';
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
    Error: '183C935220E53D024B402878CC578ED3_PageEventType_Error'
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
    private targetName: string | number = null;

    constructor(targetName: string | number, events: Array<{ target?: Document | Window, topic: string | number, data: any, handler: Array<string | number>; }>, otherDebug: boolean = false, emitterDebug: boolean = false, ) {

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
                    if (String(this.targetName) === String(targetName)) {
                        let params: PageEventResponse = { Event: e, Target: targetName, EventName: ele.topic, KeyCode: e.keyCode, Source: null, Data: null };

                        this.trigger(targetName, ele.topic, params);
                        this.trigger("*", ele.topic, params);
                        break;
                    }
                }
            }
        }
    }
    public trigger(identCode: string | number, topic: string | number, data: any = null) {
        this._eventEmitter.triggerEvent(new AppEvent(`${identCode}-${topic}`, data, null));
    }
    public on(identCode: string | number, topic: string | number, callback: any) {
        this._eventEmitter.subscribeToEvents(new AppEvent(`${identCode}-${topic}`, null, callback));
    }
    public off(identCode: string | number, topic: string | number) {
        this._eventEmitter.unsubscribeToEvents(new AppEvent(`${identCode}-${topic}`, null, null));
    }
    hasSubscribe(identCode: string | number, topic: string | number): boolean {
        return this._eventEmitter.hasSubscribe(new AppEvent(`${identCode}-${topic}`, null, null));
    }
    public target(identCode: string | number, data?: any) {
        // 是否有对象订阅该事件
        if (!this.hasSubscribe(identCode, PageEventType.Focus)) {
            this.trigger("*", PageEventType.Error, "当前 PageEvent 的 target 执行焦点移交时模块：" + identCode + " 未订阅Focus相关事件当前操作无效");
        } else {
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

            this.targetName = identCode;
            this.trigger(identCode, PageEventType.Focus, response);
        }
    }
    public getTargetIdentCode() {
        return this.targetName;
    }
    private subscribeEvent() {
        // 程序异常调试参考信息默认开启
        this.on("*", PageEventType.Error, (msg: any) => {
            console.log(msg);
        });
    }
}
export { PageEvent, PageEventType, PageEventResponse }