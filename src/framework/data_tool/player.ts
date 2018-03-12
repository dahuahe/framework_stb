/**
 * 编辑作者：张诗涛
 * 创建时间：2018年1月18日12:12:43
 * 更新时间：2018年1月24日14点57分
 * 功能分类：安徽盒子 播放器
 * 盒子差异：
 *          部分盒子到最后 1 或 2 s直接停止
            盒子开始播放时 当前进度返回 0 延迟 部分时间才返回当前进度
 * 安徽-海信 - ZP906H 小窗播放尺寸异常或黑屏解决方案
 *          1. 开始播放时在 play 之前配置 displaySmall 然后再 PlayerType.StartPlaying 事件中再次配置 displaySmall
 *          2. 播放完毕切换片源时需要 release() > play() 避免尺寸不对播放黑屏无法获取进度等问题(续播2到3次时出现)
 * 云南-广视 - 选集播放时需要释放掉
 * 云南-怕普特 - IP906H 播放视频在黑屏下面
 *          1. 开始播放前调用 configDisplayFull 全屏方法，配置UI层级视频大小等基本信息
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
    mediaPlay: MediaPlayer = null;
    private playUrl: string;
    private instanceId: number = -100;                   // 默认 -100 非 -100 则为播放器实例
    private totalTime: number = 0;
    private currentTime: number = 0;
    private currentVolume: number = 0;
    private pageEvent: IPageEvent;
    private customTotalTime: number = 0;
    public readonly identCode: number = null;

    // 播放完毕
    private finish = false;

    // private settingVolumeTimer = new SetTimeout(1000);
    private settingProgressTimer = new SetTimeout(1000);
    private progressMonitor = new SetInterval(1000); // 视频播放进度以 秒 为单位进行播放，该参数禁止改变（部分盒子进度不会到达最后一或二秒便依赖该定时器进行模拟进度进行）

    private startPlayCount = 0; // 开始播放触发次数

    constructor(params: { identCode: number }, pageEvent: IPageEvent) {
        this.identCode = params.identCode;
        this.pageEvent = pageEvent;
        this.createPlayer(pageEvent);
    }
    /**
     * 从头播放
     */
    play(playUrl: string) {
        this.configPlayUrl(playUrl);
        if (this.playUrl) {
            this.currentTime = 0;
            this.totalTime = 0;
            this.startPlayCount = 0;

            // // 在播放过程中调用此方法可能异常，原因未深纠所以做结束处理再重新播放
            // this.pause(false);
            // this.stop();
            this.mediaPlay.setSingleMedia(this.playUrl);      // 播放源
            this.mediaPlay.playFromStart();
            this.startMonitorProgress(true);
        }
    }
    resume(isTrigger = true) {
        if (!this.finish) {
            this.mediaPlay.resume();
            isTrigger && this.pageEvent.trigger(this.identCode, PlayerType.ResumePlaying);
        }
    }
    playPoint(playUrl: string, point: number) {

        this.configPlayUrl(playUrl);
        if (this.playUrl) {
            this.currentTime = 0;
            this.totalTime = 0;
            this.startPlayCount = 0;

            this.mediaPlay.setSingleMedia(this.playUrl);      // 播放源
            this.mediaPlay.playByTime(1, parseInt(<any>this.currentTime), 1);
            this.startMonitorProgress(true);
        }
    }
    pause(triggerPlayerTypeEvent = true) {
        if (!this.finish) {
            this.mediaPlay.pause();        //视频状态

            if (triggerPlayerTypeEvent) {
                this.pageEvent.trigger(this.identCode, PlayerType.PausePlaying);
            }
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
            this.currentVolume = this.getVolume();
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeInit, <VolumeInitResponse>{ currentVolume: this.getVolume() });
        }

        // 播放器默认已经是全屏播放，这里不做重复处理，小窗播放情况下会重复配置，所以手动配置
        // 配置默认视频状态为全屏。
        // this.displayFull();
    }
    /**
     * 在播放之后执行才会生效
     */
    private startMonitorProgress(isTriggerStartPlayingEvent = true) {
        let stopTime = 0;      // 进度停止了多少秒（异常状态）
        let finishCount = 0;    // 播放完毕事件触发次数
        let buffer = 0;         // 缓冲时间
        let difference = 0;     // 误差

        // 部分盒子到最后 1 或 2 s直接停止
        // 盒子开始播放时 当前进度返回 0 延迟 部分时间才返回当前进度
        // 完善模拟进度，因此在最后 3 秒内按暂停键的话需要
        let method = () => {
            let time = parseInt(<any>this.mediaPlay.getCurrentPlayTime() || -1);

            // document.getElementById('msg').innerHTML = `to:${++lock}time:${time}`;

            // 播放到最后(0-3)秒视频已经结束
            let num = (this.totalTime - this.currentTime);
            if (0 < this.currentTime && 0 < this.totalTime) {
                if (num <= 3 && num >= 0) {
                    // time 可能为 -1
                    if (time == this.currentTime || time < 0) {
                        stopTime++;
                    }
                }
            }
            // 模拟真实进度
            if (0 < stopTime) {
                time = this.currentTime + stopTime;
            }
            // 播放中 当前进度在进行中且至少是 1
            if (time > 0) {
                // 真实进度与界面进度误差不超过 5 s
                difference = 0;
                if (time < this.currentTime) {
                    difference = this.currentTime - time;
                }
                if (time > this.currentTime || difference > 5) {
                    this.currentTime = time;
                    // 视频总时间如果未获取到那么不做最大播放进度的异常处理
                    if (this.totalTime) {
                        this.currentTime = this.currentTime > this.totalTime ? this.totalTime : this.currentTime;
                    }
                    // 播放中
                    if (this.currentTime <= this.totalTime) {
                        this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanging, <ProgressChangingResponse>{ currentTime: this.currentTime });
                        this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanged, <ProgressChangedResponse>{ currentTime: this.currentTime });
                    }
                    if (0 == finishCount) {
                        if (this.totalTime) {
                            // 如果播放器计时器已经停止工作，并且总时间还未初始化，那么触发结束播放事件
                            // 排除刚开始播放情况
                            if (this.currentTime >= this.totalTime && 0 < this.currentTime && 0 < this.totalTime) {
                                // 播放完毕
                                finishCount++;
                            }
                        } else {
                            // 视频流停止 3 s 时
                            if (3 <= stopTime) {
                                finishCount++;
                            }
                        }
                    }
                    // 延迟一秒
                    else if (1 == finishCount) {
                        finishCount++;
                    }
                    else if (2 == finishCount) {
                        this.finish = true;
                        stopTime = 0;
                        this.stopMonitorProgress();
                        this.stop();
                        this.pageEvent.trigger(this.identCode, PlayerType.FinishPlay);
                    }
                }
            }
            // 开始播放 当前进度可以等于或大于 0 且仅触发一次
            if (0 == this.startPlayCount && 0 <= this.currentTime) {
                // 续播时结束后，重叠多个快件或快退事件对新进度进行干扰，这里进行重置
                this.currentTime = 1;
                // 开始播放事件触发，条件是影片从头开始播放，并且当前进度大于等于 1 ，并且仅执行一次
                if (isTriggerStartPlayingEvent == true) {
                    // document.getElementById('msg').innerHTML = `触发开始播放事件第:${++startPlayCount}次`;
                    this.pageEvent.trigger(this.identCode, PlayerType.StartPlaying, <StartPlayingResponse>{ totalTime: this.totalTime });
                    this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanging, <ProgressChangingResponse>{ currentTime: this.currentTime });
                    this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanged, <ProgressChangedResponse>{ currentTime: this.currentTime });

                    this.finish = false;
                }
                this.startPlayCount++;
            }
            if (this.totalTime <= 0) {
                // 自定义总市场
                if (this.customTotalTime > 0) {
                    this.totalTime = this.customTotalTime;
                } else {
                    this.totalTime = parseInt(<any>this.mediaPlay.getMediaDuration()) || 0;
                }

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
        if (!this.finish) {
            this.stopMonitorProgress();

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

                this.startMonitorProgress(false);
            });
        }
    }
    private setCurrentVolume(value: number, plusOrMinus: boolean) {
        if (!this.finish) {
            if (plusOrMinus) {
                this.currentVolume += value;
            } else {
                this.currentVolume -= value;
            }
            this.currentVolume = this.currentVolume < 0 ? 0 : this.currentVolume;
            this.currentVolume = this.currentVolume > 100 ? 100 : this.currentVolume;

            // 及时更新界面音量状态
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanging, <VolumeChangingResponse>{ currentVolume: this.currentVolume });

            this.mediaPlay.setVolume(parseInt(<any>this.currentVolume));
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanged, <VolumeChangedResponse>{ currentVolume: this.currentVolume });
            // // 延时设置真实音量
            // this.settingVolumeTimer.enable(() => {

            // });
        }
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
    setTotalTime(total: number) {
        this.customTotalTime = total;
    }
}
// 使用说明
// 1. this.media = new Player({ identCode: ModuleType.Video }, this.event);
// 2. this.media.displayFull(); 或者 this.media.displaySmall();
// 3. this.media.play(url);
// 如果续播部分盒子需要 先调用 this.media.release(); 需要注意释放并未注销相关事件