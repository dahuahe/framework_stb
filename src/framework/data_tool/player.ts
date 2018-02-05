/**
 * 编辑作者：张诗涛
 * 创建时间：2018年1月18日12:12:43
 * 更新时间：2018年1月24日14点57分
 * 功能分类：安徽盒子 播放器
 * 盒子差异：
 *          部分盒子到最后 1 或 2 s直接停止
            盒子开始播放时 当前进度返回 0 延迟 部分时间才返回当前进度
 */
/// <reference path="./player.d.ts" />
import { SetTimeout, SetInterval } from './dataTool';
import { Mediator } from '../../framework/data_tool/mediator';
import { PageEventType } from '../../framework/data_tool/pageEvent';
import { Guid } from '../../framework/data_tool/dataTool';

// 此类做枚举使用
export var PlayerType = {
    StartPlaying: 'PlayerType.StartPlaying',                        // 开始（通常真实进度会有延迟，在调用 播放后直接触发）
    PausePlaying: 'PlayerType.PausePlaying',                        // 暂停
    Released: 'PlayerType.ReleasePlaying',                          // 结束并释放（返回参数释放成功或失败）
    ResumePlaying: 'PlayerType.ResumePlaying',                      // 恢复
    FinishPlay: 'PlayerType.FinishPlay',                            // 完毕
    ProgressChanging: 'PlayerType.ProgressChanging',                // 进度改变进行
    ProgressChanged: 'PlayerType.ProgressChanged',                  // 进度改变完成
    TotalProgressInit: 'PlayerType.TotalProgressInit',              // 总进度初始化
    VolumeInit: "PlayerType.CurrentVolumeInit",                     // 音量初始完毕
    VolumeChanged: 'PlayerType.CurrentVolumeChanged',               // 音量改变完成
    VolumeChanging: 'PlayerType.CurrentVolumeChanging',             // 音量改变进行
    MuteVolume: "PlayerType.MuteVolume",                            // 设置静音
    ResumeVolume: "PlayerType.ResumeVolume"                         // 从静音恢复
}
// 1.播放 2.固定窗口大小位置
export class Player {
    private mediaPlay: MediaPlayer = null;
    private playUrl: string;
    private instanceId: number = -100;                   // 默认 -100 非 -100 则为播放器实例
    private totalTime: number = 0;
    private currentTime: number = 0;
    private currentVolume: number = 0;
    private pageEvent: IPageEvent;
    public readonly identCode: number = null;

    private settingVolumeTimer = new SetTimeout(1000);
    private settingProgressTimer = new SetTimeout(1000);
    private progressMonitor = new SetInterval(1000); // 视频播放进度以 秒 为单位进行播放，该参数禁止改变（部分盒子进度不会到达最后一或二秒便依赖该定时器进行模拟进度进行）

    constructor(params: { identCode: number }, pageEvent: IPageEvent) {
        this.identCode = params.identCode;
        this.pageEvent = pageEvent;
        this.createPlayer(pageEvent);
    }
    /**
     * 从头播放
     * 
     */
    play(playUrl: string) {
        this.configPlayUrl(playUrl);
        if (this.playUrl) {
            this.currentTime = 0;
            this.totalTime = 0;

            // 在播放过程中调用此方法可能异常，原因未深纠所以做结束处理再重新播放
            this.pause(false);
            this.stop();
            this.mediaPlay.setSingleMedia(this.playUrl);      // 播放源
            this.mediaPlay.playFromStart();
            this.startMonitorProgress(true);
        }
    }
    resume(isTrigger = true) {
        this.mediaPlay.resume();
        isTrigger && this.pageEvent.trigger(this.identCode, PlayerType.ResumePlaying);
    }
    playPoint(playUrl: string, point: number) {

        this.configPlayUrl(playUrl);
        if (this.playUrl) {
            this.currentTime = 0;
            this.totalTime = 0;

            this.mediaPlay.setSingleMedia(this.playUrl);      // 播放源
            this.mediaPlay.playByTime(1, parseInt(<any>this.currentTime), 1);
            this.startMonitorProgress(true);
        }
    }
    pause(triggerPlayerTypeEvent = true) {
        this.mediaPlay.pause();        //视频状态

        if (triggerPlayerTypeEvent) {
            this.pageEvent.trigger(this.identCode, PlayerType.PausePlaying);
        }
    }
    stop() {
        this.stopMonitorProgress();
        this.mediaPlay.pause();
        this.mediaPlay.stop();
    }
    release() {
        this.stopMonitorProgress();
        // 暂停
        this.pause(false);
        // 停止流
        this.mediaPlay.stop();

        // 10 秒 之内未释放 mediaPly 则自动跳出
        let r = -100; // -1 默认值 ；0 跳出
        let timer = setTimeout(function () {
            r = r === -100 ? 0 : r;
            clearTimeout(timer);
        }, 10000);

        do {
            r = this.mediaPlay.releaseMediaPlayer(this.instanceId);
        } while (r == -100);
        let b = false;
        if (r !== -100) {
            // 释放成功
            b = true;
            clearTimeout(timer);
        }
        this.pageEvent.trigger(this.identCode, PlayerType.Released, <ReleasedResponse>{ success: b });
    }
    plusVolume(value: number) {
        this.setCurrentVolume(value, true);
    }
    minusVolume(value: number) {
        this.setCurrentVolume(value, false);
    }
    getVolume(): number {
        return this.mediaPlay.getVolume();
    }
    getTime(): number {
        return this.currentTime;
    }
    setMute() {
        this.mediaPlay.setMuteFlag(1);
        this.pageEvent.trigger(this.identCode, PlayerType.MuteVolume, <MuteVolumeResponse>{ currentVolume: this.currentVolume });
    }
    resumeVolume() {
        this.mediaPlay.setMuteFlag(0);
        this.pageEvent.trigger(this.identCode, PlayerType.ResumeVolume, <ResumeVolumeResponse>{ currentVolume: this.currentVolume });
    }
    isMute(): boolean {
        return Boolean(this.mediaPlay.getMuteFlag());
    }
    speed(value: number) {
        this.setCurrentProgress(value, true);
    }
    reverse(value: number) {
        this.setCurrentProgress(value, false);
    }
    displayFull() {
        this.configDisplay("full");
    }
    displaySmall(displayArea: { left: number, top: number, width: number, height: number }) {
        this.configDisplay("size", displayArea);
    }
    private createPlayer(pageEvent: IPageEvent) {
        // 创建实例
        this.mediaPlay = new MediaPlayer();

        // 10 秒 之内未创建 mediaPly 则自动跳出
        let r = -1; // -1 默认值 ；0 跳出
        let timer = setTimeout(function () {
            r = r === -1 ? 0 : r;
            clearTimeout(timer);
        }, 10000);

        do {
            if (this.mediaPlay) {
                if (this.instanceId === -100) {
                    this.instanceId = parseInt(<any>this.mediaPlay.getNativePlayerInstanceID());/*读取本地的媒体播放实例的标识*/
                }
            }
        } while (this.instanceId == -100 && -1 == r);

        if (this.mediaPlay) {
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeInit, <VolumeInitResponse>{ currentTime: this.getVolume() });
        }

        // 配置默认视频状态为全屏
        this.displayFull();
    }
    /**
     * 在播放之后执行才会生效
     */
    private startMonitorProgress(isTriggerStartPlayingEvent: boolean = false) {
        let startPlayCount = 0; // 开始播放事件触发次数
        let pauseTime = 0;      // 进度停止了多少秒（异常状态）
        let finishCount = 0;    // 播放完毕事件触发次数

        // 部分盒子到最后 1 或 2 s直接停止
        // 盒子开始播放时 当前进度返回 0 延迟 部分时间才返回当前进度
        // 完善模拟进度，因此在最后 3 秒内按暂停键的话需要
        let method = () => {
            let time = parseInt(<any>this.mediaPlay.getCurrentPlayTime()) || 0;
            // 播放到最后(0-3)秒视频已经结束
            let num = (this.totalTime - this.currentTime);
            if (0 < this.currentTime && 0 < this.totalTime) {
                if (num <= 3 && num >= 0) {
                    // time 可能为 -1
                    if (time == this.currentTime || time < 0) {
                        pauseTime++;
                    }
                }
            }
            // 模拟真实进度
            if (0 < pauseTime) {
                time = this.currentTime + pauseTime;
            }
            // 播放中 当前进度在进行中且至少是 1
            if (time > 0) {
                if (time > this.currentTime) {
                    this.currentTime = time;
                    this.currentTime = this.currentTime > this.totalTime ? this.totalTime : this.currentTime;
                    // 播放中
                    if (this.currentTime <= this.totalTime) {
                        this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanging, <ProgressChangingResponse>{ currentTime: this.currentTime });
                        this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanged, <ProgressChangedResponse>{ currentTime: this.currentTime });
                    }
                    if (this.currentTime >= this.totalTime) {
                        // 排除刚开始播放情况
                        if (0 < this.currentTime && 0 < this.totalTime && 0 == finishCount) {
                            finishCount++;
                            // 播放完毕
                            pauseTime = 0;
                            this.stopMonitorProgress();
                            this.pageEvent.trigger(this.identCode, PlayerType.FinishPlay);
                        }
                    }
                }
            }
            // 开始播放 当前进度可以等于或大于 0 且仅触发一次
            if (0 == time || time > this.currentTime && 0 == startPlayCount) {
                // 开始播放事件触发，条件是影片从头开始播放，并且当前进度大于等于 1 ，并且仅执行一次
                if (isTriggerStartPlayingEvent === true) {
                    this.pageEvent.trigger(this.identCode, PlayerType.StartPlaying, <StartPlayingResponse>{ totalTime: this.totalTime });
                    this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanging, <ProgressChangingResponse>{ currentTime: this.currentTime });
                    this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanged, <ProgressChangedResponse>{ currentTime: this.currentTime });
                }
                startPlayCount++;
            }
            if (this.totalTime <= 0) {
                this.totalTime = parseInt(<any>this.mediaPlay.getMediaDuration()) || 0;
                if (this.totalTime > 0) {
                    this.pageEvent.trigger(this.identCode, PlayerType.TotalProgressInit, <TotalProgressInitResponse>{ totalTime: this.totalTime });
                }
            }
        };
        // 第一次执行无延迟
        method();
        // 1s 后开始自动监听进度
        this.progressMonitor.enable(method);
    }
    private stopMonitorProgress() {
        this.progressMonitor.clear();
    }
    private configDisplay(displayMethod: 'full' | 'size' | 'hidden', displayArea = { left: 0, top: 0, width: 1280, height: 720 }) {
        if (displayMethod === 'full') {
            // 全屏显示
            this.mediaPlay.setVideoDisplayArea(displayArea.left, displayArea.top, displayArea.width, displayArea.height);/*left ,top,width,height*/
            this.mediaPlay.setVideoDisplayMode(0);/*指定屏幕大小 0:按给定大小显示 1：全屏*/
        } else if (displayMethod === 'size') {
            // 窗口显示
            this.mediaPlay.setVideoDisplayArea(displayArea.left, displayArea.top, displayArea.width, displayArea.height);/*left ,top,width,height*/
            this.mediaPlay.setVideoDisplayMode(0);/*指定屏幕大小 0:按给定大小显示 1：全屏*/
        }
        // 公用配置部分
        this.mediaPlay.refreshVideoDisplay();/*调整视频显示，需要上面两函数配合*/
        this.mediaPlay.setNativeUIFlag(0);/*播放器是否显示缺省的Native UI，  0:不允许 1：允许*/
    }
    private setCurrentProgress(value: number, speedOrReverse: boolean) {
        let setVal: any;

        if (speedOrReverse) {
            this.currentTime += value;
        } else {
            this.currentTime -= value;
        }

        this.currentTime = this.currentTime <= 0 ? 1 : this.currentTime;
        this.currentTime = this.currentTime > this.totalTime ? this.totalTime : this.currentTime;

        // 及时更新目标进度已便让界面实时更新
        this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanging, <ProgressChangingResponse>{ currentTime: this.currentTime });

        // 显示加载真实进度
        this.settingProgressTimer.enable(() => {
            // 暂停
            this.pause(false);

            this.mediaPlay.playByTime(1, parseInt(<any>this.currentTime), 1);
            this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanged, <ProgressChangedResponse>{ currentTime: this.currentTime });

            // 恢复
            this.resume(false);
        });
    }
    private setCurrentVolume(value: number, plusOrMinus: boolean) {

        if (plusOrMinus) {
            this.currentVolume += value;
        } else {
            this.currentVolume -= value;
        }
        this.currentVolume = this.currentVolume < 0 ? 0 : this.currentVolume;
        this.currentVolume = this.currentVolume > 100 ? 100 : this.currentVolume;

        // 及时更新界面音量状态
        this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanging, <VolumeChangingResponse>{ currentVolume: this.currentVolume });

        // 延时设置真实音量
        this.settingVolumeTimer.enable(() => {
            this.mediaPlay.setVolume(parseInt(<any>this.currentVolume));
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanged, <VolumeChangedResponse>{ currentVolume: this.currentVolume });
        });
    }
    private configPlayUrl(playUrl: string) {
        var mediaStr = '[{mediaUrl:"' + playUrl +
            '",mediaCode:"media1",' +
            'mediaType:2,' +
            'audioType:1,' +
            'videoType:1,' +
            'streamType:2,' +
            'drmType:1,' +
            'fingerPrint:0,' +
            'copyProtection:1,' +
            'allowTrickmode:1,' +
            'startTime:0,' +
            'endTime:5000,' +
            'entryID:"entry1"}]';
        this.playUrl = mediaStr;
    }
}