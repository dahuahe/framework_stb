
/**
 * @name 中介器
 */
interface IMediator {
    /**
     * @desc 它用来触发事件。当发布一个事件时，所有订阅事件的地方都会收到通知。
     */
    publish(e: IAppEvent): void;
    /**
     * @desc 它用来订阅一个事件，换句话说，为一个事件设置事件处理。
     */
    subscribe(e: IAppEvent): void;
    /**
     * @desc 它用来取消订阅一个事件，换句话说，移除一个事件的处理函数。
     */
    unsubscribe(e: IAppEvent): void;
}
/**
 * @name 程序事件
 */
interface IAppEvent {
    topic: string | number;
    data: any;
    handler: (e: any, data: any) => void;
}
// 配置部分
interface IPlayerSetting {
    // 播放地址
    mediaUrl?: string;
    instanceId?: number;
    // 显示方式
    /**
     * full 全屏 ; size 指定大小 left top width height
     */
    displayMethod?: 'full' | 'size';
    displayArea?: {
        left?: number,
        top?: number,
        width?: number,
        height?: number
    },
    onStartPlay?: () => void,
    onStopPlay?: () => void,
    onChangeMeter?: (currentTime: number, totalTime: number) => void;
    //configPlayModel not default
}
interface IEventEmitter {
    triggerEvent(event: IAppEvent): void;
    subscribeToEvents(event: IAppEvent): void;
    unsubscribeToEvents(event: IAppEvent): void;
    hasSubscribe(event: IAppEvent): boolean;
}
// 页面事件对象
interface IPageEventResponse {
    Event: any,
    Target: string | number,
    EventName: string | number,
    KeyCode: number,
    Data: any,
    Source: string | number;
}

// 播放器
interface MuteVolumeResponse {
    currentVolume: number
}
interface ResumeVolumeResponse {
    currentVolume: number
}
interface ProgressChangingResponse {
    currentTime: number;
}
interface ProgressChangedResponse {
    currentTime: number;
}
interface VolumeChangedResponse {
    currentVolume: number;
}
interface VolumeChangingResponse {
    currentVolume: number;
}
interface VolumeInitResponse {
    currentVolume: number;
}
interface ReleasedResponse {
    success: boolean;
}
interface TotalProgressInitResponse {
    totalTime: number;
}
interface StartPlayingResponse {
    totalTime: number;
}
// 数据分页
interface IManagementDB<T> {
    getItem(pageIndex: number, callback?: (list: Array<T>) => void): void;
}
interface IHElement {
    readonly element: HTMLElement;
    constructor(eleName: string | HTMLElement, fatherEle?: HTMLDocument): void;
    clas(clasName?: string): void;
    removeClas(clasName: string): void;
    html(html?: string): void
    text(text?: string): void;

    style(propName: string, value?: string): void;
    removeStyle(propertyName?: string): void;
    attr(name: string, value?: string): void;
    removeAttr(name?: string): void;
    show(): void;
    hide(): void;
    hasHide(): void;
    hidden(): void;
    visible(): void;
    hasHidden(): void;
    hasClass(clasName: string): void;
    children(keyword: string): IHElement[];
}
// 焦点对象事件回掉参数类型
interface ISite {
    x: number;
    y: number;
    index: number;
    element: IHElement;
}
interface IFocusChanged {
    /**
     * 模块唯一标识
     */
    identCode: number;
    /**
     * 事件执行状态
     */
    success: boolean;
    /**
     * 当前坐标对象
     */
    site: ISite;
    /**
     * 上一个坐标对象
     */
    previousSite: ISite;
    /**
     * 参数
     */
    data: any;
    /**
     * 键码
     */
    keyCode: number;
    /**
     * 事件触发是否来自系统(Focus 对象内部发出)
     */
    fromSystem: boolean;
}