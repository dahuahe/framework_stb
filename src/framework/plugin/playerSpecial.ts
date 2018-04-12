/**
 * 编辑作者：张诗涛
 * 更新时间：2018年4月12日 14点57分
 * 功能分类：自定义apk 播放器
 */
/// <reference path="./player.d.ts" />
import { SetTimeout, SetInterval } from '../data_tool/dataTool';
import { Mediator } from '../../framework/data_tool/mediator';
import { PageType } from '../../framework/data_tool/pageEvent';
import { Guid, FuncLock } from '../../framework/data_tool/dataTool';

declare let MediaPlayer: any;
declare let Hqhy: any;

// 此类做枚举使用
var PlayerType = {
    StartPlaying: 'PlayerType.StartPlaying',                // 开始
    PausePlaying: 'PlayerType.PausePlaying',                // 暂停
    ReleasePlaying: 'PlayerType.ReleasePlaying',            // 结束并释放
    ResumePlaying: 'PlayerType.ResumePlaying',              // 恢复
    FinishPlay: 'PlayerType.FinishPlay',                    // 完毕
    ProgressChanging: 'PlayerType.ProgressChanging',        // 改变进行
    ProgressChanged: 'PlayerType.ProgressChanged',          // 改变完成
    TotalProgressInit: 'PlayerType.TotalProgressInit',      // 总进度初始化
    VolumeChanging: 'PlayerType.VolumeChanging',            // 音量指令发出
    VolumeChanged: 'PlayerType.VolumeChanged',              // 音量真实改变
    VolumeInit: "PlayerType.VolumeInit",
    ResumeVolume: "PlayerType.ResumeVolume",
    MuteVolume: "PlayerType.MuteVolume"
}

// 1.播放 2.固定窗口大小位置
class Player {
    private totalTime: number = 0;
    private customTotalTime: number = 0;
    private currentTime: number = 0;
    private currentVolume: number = 0;
    private muteVolume: number = 0;
    private pageEvent: IPageEvent;
    public readonly identCode: number;
    private muteStatus: boolean = false;

    // private volumeDelayTimeOut = new SetTimeout(800);
    private fastProgressTimeOut = new SetTimeout(1000);

    private lock = new FuncLock();
    private finish = false;

    // 状态记录
    // 开始播放
    // 进度实时获取
    private progressMonitor = new SetInterval(300);

    constructor(info: { identCode: number }, pageEvent: IPageEvent) {
        this.identCode = info.identCode;
        this.pageEvent = pageEvent;
    }
    /**
     * 从头播放
     */
    play(playUrl: string, left = 0, top = 0, width = 1280, height = 720) {
        if (playUrl) {

            this.finish = false;
            this.currentTime = 0;
            this.totalTime = 0;

            MediaPlayer.initMediaPlayer(-1, playUrl, left, top, width, height);
            // MediaPlayer.initMediaPlayer(playUrl);
            // MediaPlayer.initMediaPlayer(120, playUrl);

            this.currentVolume = this.getVolume() || 0;
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeInit, { currentVolume: this.currentVolume });
            this.startMonitorProgress(true);
        } else {
            this.pageEvent.trigger(this.identCode, PageType.Error, { message: 'playUrl not found' });
        }
    }
    playPoint(playUrl: string, point: number, left = 0, top = 0, width = 1280, height = 720) {
        if (playUrl) {

            this.finish = false;
            this.currentTime = 0;
            this.totalTime = 0;

            MediaPlayer.initMediaPlayer(point, playUrl, left, top, width, height);
            // MediaPlayer.initMediaPlayer(point, playUrl);

            this.startMonitorProgress(true);
        } else {
            this.pageEvent.trigger(this.identCode, PageType.Error, { message: 'playUrl not found' });
        }
    }
    // 恢复
    resume(isTriggerPlayerTypeEvent = true) {
        if (!this.finish) {
            MediaPlayer.resume();

            if (isTriggerPlayerTypeEvent) {
                this.pageEvent.trigger(this.identCode, PlayerType.ResumePlaying);
            }
        }
    }
    // 开始监听进度
    private startMonitorProgress(isTriggerStartPlayingEvent: boolean = false) {
        let isAfter = false;

        // 开始自动监听最新进度
        this.progressMonitor.enable(() => {
            let time = parseInt(MediaPlayer.getCurrentPlayTime());

            if (time > 0) {
                if (time > this.currentTime) {

                    this.currentTime = time;

                    // 播放中
                    if (this.currentTime < this.totalTime) {
                        this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanging, { currentTime: this.currentTime });
                        this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanged, { currentTime: this.currentTime });
                    }
                    else {

                    }
                }
            }

            if (this.totalTime <= 0) {

                // 自定义总市场
                if (0 < this.customTotalTime) {
                    this.totalTime = parseInt(`${this.customTotalTime}`);
                } else {
                    this.totalTime = parseInt(MediaPlayer.getMediaDuration().toString());
                }

                if (this.totalTime > 0) {

                    // 开始播放事件触发，条件是影片从头开始播放，并且当前进度大于等于 1 ，并且仅执行一次
                    if (isTriggerStartPlayingEvent === true && isAfter === false) {
                        isAfter = true;
                        this.lock.clear();
                        this.pageEvent.trigger(this.identCode, PlayerType.StartPlaying, this.totalTime);
                    }
                    this.pageEvent.trigger(this.identCode, PlayerType.TotalProgressInit, { totalTime: this.totalTime });
                }
            }

            // 播放完毕
            if (this.totalTime > 0) {
                if (this.currentTime >= (this.totalTime - 1) && this.currentTime > 0 && this.totalTime > 0) {
                    this.stopMonitorProgress();
                    this.lock.enable(() => {
                        // 暂停
                        this.pause();
                        this.finish = true;
                        this.pageEvent.trigger(this.identCode, PlayerType.FinishPlay);
                    })
                }
            }
        })

    }
    // 停止监听
    private stopMonitorProgress() {
        this.progressMonitor.clear();
    }
    // 暂停
    pause(triggerPlayerTypeEvent = true) {
        MediaPlayer.pause()
        if (triggerPlayerTypeEvent) {
            this.pageEvent.trigger(this.identCode, PlayerType.PausePlaying);
        }
    }
    // 注销
    release() {
        this.finish = true;
        this.currentTime = 0;
        this.totalTime = 0;
        this.stopMonitorProgress();

        MediaPlayer.stop();
        this.pageEvent.trigger(this.identCode, PlayerType.ReleasePlaying);
    }
    // 音量 + 
    plusVolume(value: number) {
        if (this.muteStatus) {
            this.muteStatus = false;
            this.resumeVolume();
        }
        this.setCurrentVolume(value, true);
    }
    // 音量 - 
    minusVolume(value: number) {
        if (this.muteStatus) {
            this.muteStatus = false;
            this.resumeVolume();
        }
        this.setCurrentVolume(value, false);
    }
    setVolume(value: number) {
        MediaPlayer.setVolume(value);
        this.currentVolume = value;
        this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanging, { currentVolume: value });
        this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanged, { currentVolume: value });
    }
    getVolume(): number {
        return MediaPlayer.getVolume();
    }
    getCurrentTime(): number {
        return this.currentTime;
    }
    getTotalTime(): number {
        return this.totalTime;
    }
    resumeVolume() {
        this.muteStatus = false;
        MediaPlayer.setMuteFlag(0);
        this.pageEvent.trigger(this.identCode, PlayerType.ResumeVolume, { currentVolume: this.muteVolume });
    }
    setMute() {
        this.muteStatus = true;
        MediaPlayer.setMuteFlag(1);
        this.pageEvent.trigger(this.identCode, PlayerType.MuteVolume, 0);
    }
    isMute(): boolean {
        return this.muteStatus;
    }
    // 快进
    speed(value: number) {
        this.setCurrentProgress(value, true);
    }
    // 快退
    reverse(value: number) {
        this.setCurrentProgress(value, false);
    }
    private setCurrentProgress(value: number, speedOrReverse: boolean) {
        if (!this.finish) {
            let setVal: any;

            // 暂停自动监听进度
            this.stopMonitorProgress();

            if (speedOrReverse) {
                this.currentTime += value;
            } else {
                this.currentTime -= value;
            }

            this.currentTime = this.currentTime <= 0 ? 1 : this.currentTime;
            this.currentTime = this.currentTime > this.totalTime ? this.totalTime : this.currentTime;

            // 及时更新目标进度已便让界面实时更新
            this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanging, { currentTime: this.currentTime });

            // 显示加载真实进度
            this.fastProgressTimeOut.enable(() => {
                // 暂停
                this.pause(false);

                MediaPlayer.playByTime(0, this.currentTime);
                this.pageEvent.trigger(this.identCode, PlayerType.ProgressChanged, this.currentTime);

                // 恢复
                this.resume(false);
                // 开始监听并且通知目标最新进度
                this.startMonitorProgress();
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
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanging, { currentVolume: this.currentVolume });

            this.setVolume(parseInt(<any>this.currentVolume));
            this.pageEvent.trigger(this.identCode, PlayerType.VolumeChanged, { currentVolume: this.currentVolume });
        }
    }
    setTotalTime(total: number) {
        this.customTotalTime = total;
    }
}
export { Player, PlayerType }