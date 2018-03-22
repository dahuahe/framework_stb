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
interface IPageEvent {
    trigger(identCode: string | number, topic: string | number, data?: any): void;
    on(identCode: string | number, topic: string | number, callback: any): void;
    off(identCode: string | number, topic: string | number): void;
    target(identCode: string | number, data?: any): void;
    hasSubscribe(identCode: string | number, topic: string | number): boolean;
    getTargetIdentCode(): void;
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
    initData(list: T[]): void;
}