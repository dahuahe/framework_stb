// 处理计时器如果隐藏时就不处理

/// <reference path="./player.d.ts" />
import { SetTimeout, SetInterval } from './dataTool';
import { Mediator } from '../../framework/data_tool/mediator';
import { PageEventType } from '../../framework/data_tool/pageEvent';
import { Guid } from '../../framework/data_tool/dataTool';

// 此类做枚举使用
export var PlayerType = {
    StartPlaying: 'd71334c8663d',           // 开始
    PausePlaying: 'd71334c83232',           // 暂停
    ReleasePlaying: '620886d1c6aa',         // 结束并释放
    ResumePlaying: 'df8e374e31ea',          // 恢复
    FinishPlay: '7ffbc587c94f',             // 完毕
    CurrentProgressChange: 'f04832b37941',  // 进行
    TotalProgressInit: 'f04832b37s46',      // 总进度初始化
    CurrentVolumeChange: 'f0a8b2b37s46'     // 音量
}

// 1.播放 2.固定窗口大小位置
export class Player {
    private mediaPlay: MediaPlayer | null;
    private playUrl: string;
    private instanceId:any;
    private totalTime: number = 0;
    private currentTime: number = 0;
    private currentVolume: number = 0;
    private isValidInstanceOf: boolean = false;            // 是否有效的实例 1.创建 2.等待创建 3.获取实例编号 => 有效
    private pageEvent: IPageEvent;
    public readonly identCode = new Guid().getGuid();

    private volumeDelayTimeOut = new SetTimeout(1000);
    private fastProgressTimeOut = new SetTimeout(1000);

    // 状态记录
    // 开始播放
    // 进度实时获取
    private progressMonitor = new SetInterval(300);

    constructor(pageEvent: IPageEvent) {
        this.pageEvent = pageEvent;

        this.initialize(pageEvent);
    }
    // 初始化
    private initialize(pageEvent: IPageEvent) {
        // 创建实例
        this.mediaPlay = new MediaPlayer();
        this.instanceId = -10;
        do {
            if (this.mediaPlay) {
                // ID
                if (this.instanceId === -10) {
                    this.instanceId = parseInt(this.mediaPlay.getNativePlayerInstanceID().toString());/*读取本地的媒体播放实例的标识*/
                    this.isValidInstanceOf = true;
                }
            }
        } while (this.instanceId === -10 || !this.mediaPlay);

        // 配置默认视频状态为全屏
        this.configDisplay('full');
    }
    // 恢复
    resume(isTriggerPlayerTypeEvent = true) {
        if (this.isValidInstanceOf) {
            this.mediaPlay.resume();
            if (isTriggerPlayerTypeEvent) {
                this.pageEvent.trigger(this.identCode, PlayerType.ResumePlaying);
            }
        }
        else {
            this.pageEvent.trigger(this.identCode, PageEventType.Error, { message: 'MediaPlayer Instanceof Create Failure' });
        }
    }
    /**
     * 从头播放
     * 在播放过程中调用此方法可能异常，原因未深入纠
     */
    playFromStart() {
        // alert(this.isValidInstanceOf)
        if (this.isValidInstanceOf) {
            // alert(this.playUrl)
            if (this.playUrl) {

                this.currentTime = 0;
                this.totalTime = 0;

                this.mediaPlay.setSingleMedia(this.playUrl);      // 播放源
                this.mediaPlay.playFromStart();

                this.startMonitorProgress(true);
            }
        } else {
            this.pageEvent.trigger(this.identCode, PageEventType.Error, { message: 'MediaPlayer Instanceof Create Failure' });
        }
    }
    // 开始监听进度
    private startMonitorProgress(isTriggerStartPlayingEvent: boolean = false) {
        let isAfter = false;

        // 开始自动监听最新进度
        this.progressMonitor.enable(() => {
            let time = parseInt(this.mediaPlay.getCurrentPlayTime().toString());
            if (time > 0) {
                if (time > this.currentTime) {

                    this.currentTime = time;

                    // 播放中
                    if (this.currentTime < this.totalTime) {
                        this.pageEvent.trigger(this.identCode, PlayerType.CurrentProgressChange, this.currentTime);
                    }
                    else {

                    }
                }
            }

            if (this.totalTime <= 0) {
                this.totalTime = parseInt(this.mediaPlay.getMediaDuration().toString());
                if (this.totalTime > 0) {

                    // 开始播放事件触发，条件是影片从头开始播放，并且当前进度大于等于 1 ，并且仅执行一次
                    if (isTriggerStartPlayingEvent === true && isAfter === false) {
                        isAfter = true;
                        this.pageEvent.trigger(this.identCode, PlayerType.StartPlaying, this.totalTime);
                    }
                    this.pageEvent.trigger(this.identCode, PlayerType.TotalProgressInit, this.totalTime);
                }
            }

            // 播放完毕
            if (this.totalTime > 0) {
                if (this.currentTime >= this.totalTime) {
                    this.stopMonitorProgress();
                    // 会触发两次需要解决 TODO
                    this.pageEvent.trigger(this.identCode, PlayerType.FinishPlay);
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
        if (this.isValidInstanceOf) {
            this.mediaPlay.pause();        //视频状态

            if (triggerPlayerTypeEvent) {
                this.pageEvent.trigger(this.identCode, PlayerType.PausePlaying);
            }

        }
    }
    // 注销
    release() {
        if (this.isValidInstanceOf) {
            // 暂停
            this.pause(false);
            // 停止流
            this.mediaPlay.stop();

            // 释放
            // 10 秒 之内未释放 mediaPly 则自动跳出
            let result = -2;
            let timeout = setTimeout(function () {
                result = result !== -2 ? result : -1;

                clearTimeout(timeout);
            }, 10000);

            do {
                result = this.mediaPlay.releaseMediaPlayer(this.instanceId);
            } while (result === -2);
            if (result !== -2) {
                // 释放成功
                this.isValidInstanceOf = false;
                clearTimeout(timeout);

                this.pageEvent.trigger(this.identCode, PlayerType.ReleasePlaying);
                return true;
            } else {
                return false;
            }
        }
    }
    // 音量 + 
    plusVolume(value: number) {
        this.setCurrentVolume(value, true);
    }
    // 音量 - 
    minusVolume(value: number) {
        this.setCurrentVolume(value, false);
    }
    getVolume(): number {
        if (this.isValidInstanceOf) {
            return this.mediaPlay.getVolume();
        }
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
        let setVal: any;

        // 暂停自动监听进度
        this.stopMonitorProgress();

        if (this.isValidInstanceOf) {

            if (speedOrReverse) {
                this.currentTime += value;
            } else {
                this.currentTime -= value;
            }

            this.currentTime = this.currentTime <= 0 ? 1 : this.currentTime;
            this.currentTime = this.currentTime > this.totalTime ? this.totalTime : this.currentTime;

            // 及时更新目标进度已便让界面实时更新
            this.pageEvent.trigger(this.identCode, PlayerType.CurrentProgressChange, this.currentTime);

            // 显示加载真实进度
            this.fastProgressTimeOut.enable(() => {
                // 暂停
                this.pause(false);

                this.mediaPlay.playByTime(1, parseInt(this.currentTime.toString()), 1);

                // 恢复
                this.resume(false);
                // 开始监听并且通知目标最新进度
                this.startMonitorProgress();
            });

        }
    }
    private setCurrentVolume(value: number, plusOrMinus: boolean) {

        if (this.isValidInstanceOf) {
            if (plusOrMinus) {
                this.currentVolume += value;
            } else {
                this.currentVolume -= value;
            }
            this.currentVolume = this.currentVolume < 0 ? 0 : this.currentVolume;
            this.currentVolume = this.currentVolume > 100 ? 100 : this.currentVolume;

            // 及时更新界面音量状态
            this.pageEvent.trigger(this.identCode, PlayerType.CurrentVolumeChange, this.currentVolume);

            // 延时设置真实音量
            this.volumeDelayTimeOut.enable(() => {
                this.mediaPlay.setVolume(parseInt(this.currentVolume.toString()));
            });
        }
    }
    // 关联
    relevanceInstanceId(instanceId:any) {
        this.mediaPlay.bindNativePlayerInstance(instanceId);
    }
    configPlayUrl(playUrl: string) {
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
    configDisplay(displayMethod: 'full' | 'size', displayArea = { left: 0, top: 0, width: 1280, height: 720 }) {

        if (displayMethod === 'full') {
            // 全屏显示
            this.mediaPlay.setVideoDisplayArea(displayArea.left, displayArea.top, displayArea.width, displayArea.height);/*left ,top,width,height*/
            this.mediaPlay.setVideoDisplayMode(1);/*指定屏幕大小 0:按给定大小显示 1：全屏*/
        } else if (displayMethod === 'size') {
            // 窗口显示
            this.mediaPlay.setVideoDisplayArea(displayArea.left, displayArea.top, displayArea.width, displayArea.height);/*left ,top,width,height*/
            this.mediaPlay.setVideoDisplayMode(0);/*指定屏幕大小 0:按给定大小显示 1：全屏*/
        }

        // 公用配置部分
        this.mediaPlay.refreshVideoDisplay();/*调整视频显示，需要上面两函数配合*/
        this.mediaPlay.setNativeUIFlag(0);/*播放器是否显示缺省的Native UI，  0:不允许 1：允许*/
    }
    validInstanceId(instanceId: number): boolean {
        let ret = false;

        // 部分盒子可能为 0 
        if (instanceId != null && instanceId != undefined && typeof instanceId === 'number' && instanceId >= 0 && instanceId <= 255) {
            ret = true;
        }
        return ret;
    }
    getInstanceId() {
        return this.instanceId;
    }
}
// // 使用教程
// let pageEvent = null, playUrl = null;
// // 1.初始化
// let mediaPlayer = new Player(pageEvent);
// mediaPlayer.configPlayUrl(playUrl);

// // 配置视频显示方式 该方法可以在任何时候改变视频状态
// mediaPlayer.configDisplay("full"); // 全屏播放 同步 无返回值
// mediaPlayer.configDisplay("size"); // 窗口播放 同步 无返回值


// mediaPlayer.playFromStart(); // 开始从头播放 同步 无返回值

// // 2.调用方法
// mediaPlayer.release(); // 注销播放器 同步 返回布尔值
// ...

// 3.监听事件
// pageEvent.on(PlayerType.StartPlaying, (cur) => {
//     alert("开始播放");
// });
// pageEvent.on(PlayerType.CurrentProgressChange, (cur) => {
//     alert("当前播放进度");
// });
// pageEvent.on(PlayerType.TotalProgressInit, (tot) => {
//     alert("总进度获取成功 近触发一次");
// });
// pageEvent.on(PlayerType.CurrentVolumeChange, (cur) => {
//     alert("当前音量改变");
// });
// pageEvent.on(PlayerType.PausePlaying, (cur) => {
//     alert('暂停')
// });
// pageEvent.on(PlayerType.ReleasePlaying, (cur) => {
//     alert('释放')
// });
// pageEvent.on(PlayerType.ResumePlaying, (cur) => {
//     alert('恢复')
// });
// pageEvent.on(PlayerType.FinishPlay, (cur) => {
//     alert('完毕')
// });
// pageEvent.on(PlayerType., (cur) => {
//     alert('完毕')
// });