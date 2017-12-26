import { Key, Guid, Extend } from './dataTool';
import { HElement } from '../ui_tool/uiTool';
import { PageEvent, PageEventType, PageEventResponse } from './pageEvent';
import { SetTimeout } from './dataTool'
var FocusType = {
    // 扩展插件相关事件
    /**
     * Focus 对象 - 坐标更新完毕
     */
    Changeed: 'D208E9F88690620608548CE81813DB58_FocusType_Changeed',
    /**
     * Focus 对象 - 接收到Focus事件后触发
     */
    Focused: '0FCE091F3018326434A550A9DE018A06_FocusType_Focused',
    /**
     * Focus 对象 - 接收到Blur事件并处理完相应事件后执行
     */
    Blured: "B1619F75059FF85089D5D247CC5244ED_FocusType_Blured"
}
/**
 * 更新版本：v1.0.1
 * 更新时间：2017年9月6日17:44:35
 * 更新内容：1.Focus将不依赖传入data数据2.Focus将解耦模板自动渲染功能3.传入数据为HElement对象数组
 *          2.using 取值为 false 时进行提示。并且可自定义 PageEvent 的 keydown 事件
 */
class Site {
    readonly leapId: string = null;
    public x: number = null;
    public y: number = null;
    public index: number = null;
    public element: HElement = null;

    constructor() {
        this.leapId = new Guid().getGuid();
    }
}
export class FocusResponse {
    Event: any;
    IdentCode: string | number;
    EventName: string;
    KeyCode: number;
    Data: any;
    SiteSource: Site;
    Success: boolean;
    SiteHanlde: Site
}
interface ILeapSetting {
    /**
     * 实例唯一标识（用于系统级事件通知，该字段必须唯一）
     */
    identCode: string | number;
    /**
     * 地图算法前置条件最大生成宽度 0 代表无线长
     */
    width?: number,
    /**
     * 地图算法前置条件最大生成高度 0 代表无线高(前提宽度不为 0 )
     */
    height?: number,
    /**
     * @param Array<Key> 接收 Key 对象值
     * @param Object{keyCode:Key,callback:()=>void} 接收 Key 对象值 并定义处理规则
     * @desc 自动填充规则 是指触发 Leap对象的set方法返回值为false的情况下所预定制规则 该规则将改变 app.leap.set 事件触发条件
     * 当前内置规则有 :
     * Key.Left(自动查找上一坐标，基于index属性) 
     * Key.right(自动查找下一坐标，基于index属性) 
     * Key.dn(坐标缺失情况自动补位坐标，基于getSite('last')方法)
     */
    autoFill?: [Key],
    /**
     * autoTarget 优先级高于 autoFill 冲突事件会被覆盖
     */
    autoTarget?: [{ keyCode: Key, target: string | number }],
    /**
     * 焦点样式
     */
    activeClass?: string,
    /**
     * 离开样式
     */
    blurClass?: string,
    /**
     * 焦点样式回掉
     */
    activeCallback?: (info: FocusResponse) => void,
    /**
     * 离开样式回掉
     */
    blurCallback?: (info: FocusResponse) => void,
    /**
     * 基本动作是否启用 (上、下、左、右)
     * false：禁用 Focus 对象内置 上、下、左、右、事件的处理，通过自定义订阅 PageEvent 的 keydown 事件完成相关业务需求
     */
    usingMove?: boolean
}
// 内部可用事件
var InsideFocusType = {
    // 坐标改变后发送改变坐标命令更新相应样式
    SiteChangeed: '7F65E6A85953FABA141EBFABD1473140_InsideFocusType_SiteChangeed'
}
/**
 * @desc 移动对象，页面元素组的内存映射地图表。关联/控制页面元素
 */
class Focus {
    private listHElement: HElement[] = [];
    private map: Array<Array<Site>>;
    private site: Site = null;
    private dataArray: Array<Site> = [];
    private dataObject: any = {};
    private recordArray: Array<Site> = [];
    private recordMaxLength: number = 20;            // 历史记录不超过20步
    private validInstance: boolean = false;            // 是否有效的实例，如果为false限制所有函数使用
    private readonly pageEvent: IPageEvent;
    private isFirstLoad = true;
    // 配置参数
    private readonly width: number;
    private readonly height: number;
    private readonly template: string = null;
    private readonly autoFill: [Key];
    private readonly autoTarget: [{ keyCode: Key, target: string | number }];
    private readonly activeClass: string;
    private readonly blurClass: string;
    private readonly focusSite: Function;
    private readonly blurSite: Function;
    private readonly identCode: string | number;
    private readonly usingMove: boolean;
    private readonly activeCallback: (info: FocusResponse) => void;
    private readonly blurCallback: (info: FocusResponse) => void;

    constructor(leapSetting: ILeapSetting, pageEvent: IPageEvent) {

        let defaults: any = {
            width: 0, height: 0, autoFill: null, autoTarget: null,
            activeClass: null, blurClass: null, identCode: null,
            usingMove: true, focusSite: null, blurSite: null,
            activeCallback: null, blurCallback: null
        }
        defaults = new Extend(true, defaults, leapSetting);

        this.width = defaults.width;
        this.height = defaults.height;
        this.autoFill = defaults.autoFill;
        this.autoTarget = defaults.autoTarget;
        this.activeClass = defaults.activeClass;
        this.blurClass = defaults.blurClass;
        this.focusSite = defaults.focusSite;
        this.blurSite = defaults.blurSite;
        this.identCode = defaults.identCode;
        this.usingMove = defaults.usingMove;
        this.activeCallback = defaults.activeCallback;
        this.blurCallback = defaults.blurCallback;

        this.pageEvent = pageEvent;

        // 顶月前检测当前对象是否已经在 PageEvent中注册，如果注册了那么先释放掉
        if (this.pageEvent.hasSubscribe(this.identCode, PageEventType.Focus)) {
            this.release();
        }
        this.initializeEvent(pageEvent);

        // move 操作被禁止并且没有订阅 keydown 事件进行自定义处理则给出提示
        if (!this.usingMove) {
            // JS解释器执行完毕后 因为有可能在 Focus 对象实例化之后订阅了自定义处理事件
            new SetTimeout().enable(() => {
                if (!pageEvent.hasSubscribe(this.identCode, PageEventType.Keydown)) {
                    pageEvent.trigger("*", PageEventType.Error, `模块：${this.identCode} 参数 usingMove 取值为 ${this.usingMove} 并且 未订阅和处理 PageEventType.keydown 事件 如果该结果不是您想要的请处理该异常`);
                }
            });
        }
    }
    public initData(data: HElement[]) {
        this.initialize(data);
    }
    private initialize(data: HElement[]) {

        this.map = this.createMap(data);

        if (this.map.length > 0) {
            this.site = this.map[0][0];         // 初始化坐标
            this.validInstance = true;
        }
    }
    private createMap(data: HElement[]): Array<Array<Site>> {
        let xRow = this.height;
        let yCol = this.width;

        //至少生成一行
        if (xRow === 0 && yCol === 0)
            xRow = 1;

        if (xRow === 0 && yCol > 0) {
            let count = parseInt((data.length / yCol).toString());
            //判断余数
            if (count === data.length / yCol) {

                xRow = count + 1;
            } else {
                //有余数，多循环一圈
                xRow = count + 1;
            }
        }
        if (yCol === 0 && xRow > 0) {
            let count = parseInt((data.length / xRow).toString());
            //判断余数
            if (count === data.length / xRow) {
                yCol = count + 1;
            } else {
                //有余数，多循环一圈
                yCol = count;
            }
        }

        //确定宽高高格子√
        //确定宽，忽略高格子，以宽来填充
        let xArr = new Array();
        let yArr = new Array();
        let index = 0;//自增长下标
        let isAll = false;
        do {
            for (var i = 0; i < xRow; i++) {
                yArr = [];
                for (let j = 0; j < yCol; j++) {
                    //创建单元格
                    if (index < data.length) {
                        let site = new Site(), item = data[index];
                        site.x = i;
                        site.y = j;
                        site.index = index;
                        site.element = item;
                        yArr.push(site);
                        // 数据组装
                        this.dataObject[site.leapId] = site;
                        this.dataArray.push(site);
                        this.listHElement.push(item);
                    } else {
                        break;
                    }
                    index++;
                }
                //创建行
                if (yArr[0]) {
                    xArr.push(yArr);
                }
            }
            //结束
            if (data.length <= index) {
                isAll = false;
            }
        } while (isAll);
        //根据数据源无线填充高度

        //生成实体
        return xArr;

    }
    /**
     * 订阅系统事件
     */
    private initializeEvent(pageEvent: IPageEvent) {
        // 按键按下后 根据 usingMove 控制是否订阅并启用 Focus 对象预定义处理规则
        if (this.usingMove)
            pageEvent.on(this.identCode, PageEventType.Keydown, (args: any) => { this.onKeydown(args) });

        // 获取焦点后
        pageEvent.on(this.identCode, PageEventType.Focus, (args: any) => { this.onFocus() });
        // 焦点失去后
        pageEvent.on(this.identCode, PageEventType.Blur, (args: any) => { this.unFocus() });
        // 坐标改变后
        pageEvent.on(this.identCode, InsideFocusType.SiteChangeed, (args: any) => { this.onChange(args) });
        // 坐标改变完毕后
        pageEvent.on(this.identCode, FocusType.Changeed, (args: any) => {
            let data: FocusResponse = args;
            if (data.Success) {

                // 必须是首次获取焦点
                if (this.isFirstLoad) {
                    this.isFirstLoad = false;
                    this.pageEvent.trigger(this.identCode, FocusType.Focused);
                }
            }
        });
    }
    private onChange(args: any) {

        if (args.result === 'failure') {
            // 处理焦点移交规则 如果成功不触发当前 change 事件 如果失败 将流程转交给 内部移动规则处理
            let autoTarget = this.handlerAutoTarget(args);

            // 处理内部移动规则 试图让当前动作变得有效 如果无效则表示移动无效
            let autoFill = false;
            if (!autoTarget)
                autoFill = this.handlerAutoFill(args);

            // 应用新规则后当前操作有效
            if (autoFill) {
                args.result = autoFill ? 'success' : 'failure';
            }
            // 发布程序事件
            // 当前坐标改变成功后
            // 当坐标改变失败后
            // 焦点转移成功后
            // 焦点转移失败后
            if (!autoTarget) {
                let response = new FocusResponse();
                response.Event = args;
                response.IdentCode = this.identCode;
                response.EventName = FocusType.Changeed;
                response.KeyCode = args.keyCode;
                response.Data = null;
                response.SiteSource = this.record(-1) || null;
                response.Success = false;
                response.SiteHanlde = this.site;

                this.pageEvent.trigger(this.identCode, FocusType.Changeed, response);
            }
        } else if (args.result === 'success') {

        }
        if (this.handlerAutoClass(args)) {

            let response = new FocusResponse();
            response.Event = args;
            response.IdentCode = this.identCode;
            response.EventName = FocusType.Changeed;
            response.KeyCode = args.keyCode;
            response.Data = null;
            response.SiteSource = this.record(-1) || null;
            response.Success = true;
            response.SiteHanlde = this.site || null;

            this.pageEvent.trigger(this.identCode, FocusType.Changeed, response);
        }
    }
    private onKeydown(args: any) {
        let data: PageEventResponse = args;
        // 合法参数 key.left key.up key.right key.dn
        let keyCode = data.KeyCode;
        if (keyCode === Key.Left || keyCode === Key.Up || keyCode === Key.Right || keyCode === Key.Down) {
            this.setSite([keyCode]);
        }
    }
    private onFocus() {
        // 异常提示
        if (this.validInstance) {
            this.isFirstLoad = true;
            this.setSite();
        } else {
            this.pageEvent.trigger("*", PageEventType.Error, "当前 Focus 对象模块：" + this.identCode + " 未调用 initData 函数进行初始化");
        }
    }
    private unFocus() {
        let present = this.site;

        if (present instanceof Object) {
            let ele = present.element;// new HElement('[leapId=' + present.leapId + ']');
            if (ele) {
                ele.removeClas(this.activeClass);

                let response = new FocusResponse();
                response.Event = null;
                response.IdentCode = this.identCode;
                response.EventName = FocusType.Changeed;
                response.KeyCode = null;
                response.Data = null;
                response.SiteSource = null;
                response.Success = true;
                response.SiteHanlde = present;

                this.blurCallback && this.blurCallback(response);
            }
            if (this.blurClass) {
                if (ele) {
                    ele.clas(this.blurClass);

                    let response = new FocusResponse();
                    response.Event = null;
                    response.IdentCode = this.identCode;
                    response.EventName = FocusType.Changeed;
                    response.KeyCode = null;
                    response.Data = null;
                    response.SiteSource = null;
                    response.Success = true;
                    response.SiteHanlde = present;

                    this.activeCallback && this.activeCallback(response);
                }
            }
        }

        this.blurSite ? this.blurSite(present) : null;

        this.isFirstLoad = true;

        // 焦点失去完毕后
        let response = new FocusResponse();
        response.Data = null;
        response.Event = null;
        response.EventName = FocusType.Blured;
        response.IdentCode = this.identCode;
        response.SiteHanlde = this.site || null;
        response.SiteSource = this.record(-1) || null;
        response.Success = true;
        this.pageEvent.trigger(this.identCode, FocusType.Blured, response);
    }
    // 获取当前
    public setSite(): void;
    // 根据id获取
    public setSite(leapId: string): void;
    // index 获取
    public setSite(index: number): void;
    // 根据set获取 id/x/y/index/leapId全匹配
    public setSite(set: Site): void;
    // 根据x and y 获取
    public setSite(x: number, y: number): void;
    // 根据键码获取
    public setSite(keyCode: [number]): void;// keyCode => 34,56,32,32...
    // 根据语义命令获取
    public setSite(target: 'first' | 'last'): void;
    // 根据语义命令并加条件
    public setSite(x: 'first' | 'last', y: 'first' | 'last'): void;
    // 根据语义与x,y的配合获取
    public setSite(x: 'first', y: number): void;
    // 根据语义与x,y的配合获取
    public setSite(x: 'last', y: number): void;
    // 根据语义与x,y的配合获取
    public setSite(x: number, y: 'first'): void;
    // 根据语义与x,y的配合获取
    public setSite(x: number, y: 'last'): void;
    public setSite(valOne?: string | number | Site | [number] | 'first' | 'last', valTwo?: string | number | 'first' | 'last') {
        let retSite: Site = null;
        if (!this.validInstance)
            return;

        let keyCode = null;
        // The current order is issued by keyCode 
        if (valOne instanceof Array) {
            let i = valOne.length - 1;
            // The current command is forbidden
            if (valOne[i] === Key.Left || valOne[i] === Key.Up || valOne[i] === Key.Right || valOne[i] === Key.Down)
                keyCode = valOne[i];
        }

        let isExecuteAutoFill = true;
        let _arguments = [];
        valOne ? _arguments.push(valOne) : null;
        valTwo ? _arguments.push(valTwo) : null;

        retSite = this.getSite(<any>valOne, <any>valTwo);

        retSite = retSite ? retSite : null;

        // 是否设置成功
        if (retSite) {
            // 更新坐标
            this.site = retSite;

            // 添加历史记录
            this.record(this.site);
            this.pageEvent.trigger(this.identCode, InsideFocusType.SiteChangeed, { keyCode: keyCode, result: 'success', arguments: _arguments, identCode: this.identCode });
        } else {
            this.pageEvent.trigger(this.identCode, InsideFocusType.SiteChangeed, { keyCode: keyCode, result: 'failure', arguments: _arguments, identCode: this.identCode });
        }
    }
    // 获取当前
    public getSite(): Site;
    // 根据id获取
    public getSite(leapId: string): Site;
    // index 获取
    public getSite(index: number): Site;
    // 根据set获取 id/x/y/index/leapId全匹配
    public getSite(set: Site): Site;
    // 根据x and y 获取
    public getSite(x: number, y: number): Site;
    // 根据键码获取
    public getSite(keyCode: [number]): Site;// keyCode => 34,56,32,32...
    // 根据语义命令获取
    public getSite(target: 'first' | 'last'): Site;
    // 根据语义命令并加条件
    public getSite(x: 'first' | 'last', y: 'first' | 'last'): Site;
    // 根据语义与x,y的配合获取
    public getSite(x: 'first', y: number): Site;
    // 根据语义与x,y的配合获取
    public getSite(x: 'last', y: number): Site;
    // 根据语义与x,y的配合获取
    public getSite(x: number, y: 'first'): Site;
    // 根据语义与x,y的配合获取
    public getSite(x: number, y: 'last'): Site;
    public getSite(valOne?: string | number | Site | [number] | 'first' | 'last', valTwo?: string | number | 'first' | 'last'): Site {
        let ret: Site = null;

        if (!this.validInstance)
            return ret;

        // Get the site
        if (valOne === undefined && valTwo === undefined) {
            ret = this.site;
        }
        // Get the leapId(guid code)
        else if (typeof valOne === 'string' && valOne.length === 36 && valTwo === undefined) {
            ret = this.dataObject[valOne];
        }
        // Get the site by index
        else if (typeof valOne === 'number' && valOne < this.listHElement.length && valTwo === undefined) {
            ret = this.dataArray[valOne];
        }
        // Get the site by Site
        else if (valOne instanceof Site && valTwo === undefined) {
            let data = this.dataArray;
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                if (ele && ele.index === valOne.index && ele.leapId === valOne.leapId && ele.x === valOne.x && ele.y === valOne.y) {
                    ret = ele;
                    break;
                }
            }
        }
        // Get the site by keyCode
        else if (valOne instanceof Array && valTwo === undefined) {
            // 上 | 下 | 左 | 右
            let codeArr = valOne;

            // 找到单条或多条单元格信息
            if (codeArr.length > 0) {
                let currSite = this.getSite();
                for (let i = 0; i < codeArr.length; i++) {
                    let code = codeArr[i];
                    if (currSite) {

                        if (code === Key.Left) {
                            if (this.map[currSite.x]) {
                                currSite = this.map[currSite.x][currSite.y - 1];
                            } else {
                                currSite = null;
                            }
                        } else if (code === Key.Up) {
                            if (this.map[currSite.x - 1]) {
                                currSite = this.map[currSite.x - 1][currSite.y];
                            } else {
                                currSite = null;
                            }
                        } else if (code === Key.Right) {
                            if (this.map[currSite.x]) {
                                currSite = this.map[currSite.x][currSite.y + 1];
                            } else {
                                currSite = null;
                            }

                        } else if (code === Key.Down) {
                            if (this.map[currSite.x + 1]) {
                                currSite = this.map[currSite.x + 1][currSite.y];
                            } else {
                                currSite = null;
                            }
                        }
                    } else {
                        break;
                    }
                }
                ret = Focus.equal(currSite, this.site) ? null : currSite;
            }
        }
        // Get the site by 'first' | 'last'
        else if (typeof valOne === 'string' && (valOne === 'first' || valOne === 'last') && valTwo === undefined) {
            // 获取所有坐标中第一格
            if (valOne === 'first') {
                ret = this.map[0][0];
            }
            // 获取所有坐标中最后一格
            else if (valOne === 'last') {
                ret = this.map[this.map.length - 1][this.map[this.map.length - 1].length - 1]
            }
        }
        // Get the site by valOne:'first' | 'last' and valTwo:'first' | 'last'
        else if ((valOne === 'first' || valOne === 'last') && (valTwo === 'first' || valTwo === 'last')) {
            // 获取{x:'first',y:'first'}
            if (valOne === 'first' && valTwo === 'first') {
                ret = this.map[0][0];
            }
            // 获取{x:'first',y:'last'}
            if (valOne === 'first' && valTwo === 'last') {
                ret = this.map[0][this.map[0].length - 1];
            }
            // 获取{x:'last',y:'first'}
            if (valOne === 'last' && valTwo === 'first') {
                ret = this.map[this.map.length - 1][0];
            }
            // 获取{x:'last',y:'last'}
            if (valOne === 'last' && valTwo === 'last') {
                ret = this.map[this.map.length - 1][this.map[this.map.length - 1].length - 1];
            }
        }
        // Get the site by x and y
        else if (typeof valOne === 'number' && typeof valTwo === 'number') {
            ret = this.map[valOne][valTwo];
        }
        // Get the site by x and y public getSite(x: 'first', y: number);
        else if (valOne === 'first' && typeof valTwo === 'number') {
            ret = this.map[0][valTwo];
        }
        // Get the site by x and y public getSite(x: 'last', y: number);
        else if (valOne === 'last' && typeof valTwo === 'number') {
            ret = this.map[this.map.length - 1][valTwo];
        }
        // public getSite(x: number, y: 'first');
        else if (typeof valOne === 'number' && valTwo === 'first') {

            ret = this.map[valOne][0];
        }
        // public getSite(x: number, y: 'last');
        else if (typeof valOne === 'number' && valTwo === 'last') {

            ret = this.map[valOne][this.map[valOne].length - 1];
        }
        return ret || null;
    }
    public getSites(): Array<Site> {
        return this.dataArray;
    }
    public getIdentCode() {
        return this.identCode;
    }
    // 添加site到历史记录
    public record(site: Site): void;
    // 获取所有历史记录
    public record(): Array<Site>;
    // 根据index获取历史记录
    public record(index: number): Site;
    public record(site?: number | Site): Site | Array<Site> {

        // Set the site by set
        if (site instanceof Site) {

            // 控制历史记录长度
            if (this.recordArray.length >= this.recordMaxLength) {
                this.recordArray.shift();
            }
            this.recordArray.push(site);
        }
        // Get the site by index or undefind
        else if (typeof site === 'number' || site === undefined) {
            let length, ret;
            if (site === undefined) {
                ret = this.recordArray;
            } else {
                length = this.recordArray.length;
                ret = this.recordArray[(length - 1) + site];
            }
            return ret || null;
        }
    }
    /**
     * 处理内部移动规则
     */
    private handlerAutoFill(args: any) {
        let ret = args.result === 'success'
        let site: Site;
        let params = args.arguments;
        // 必须是在定义移动规则的情况下
        // 必须是在 system.change.site 失败后执行
        // 必须是keyCode类型(并且没有连续KeyCode指令)
        // 处理keyCode left right bottom规则
        // 当前对象配有移动规则的情况下
        if (this.autoFill && this.autoFill.length > 0) {
            if (args && args.result === 'failure') {
                if (params && params instanceof Array && params.length > 0) {
                    if (params[0] && params instanceof Array && params[0][0] && params[0].length === 1) {
                        let keyCode = params[0][0];
                        let validKeyCode = false;

                        // 试图让 当前 keyCode 有效
                        for (let key in this.autoFill) {
                            if (this.autoFill.hasOwnProperty(key)) {
                                let item = this.autoFill[key];
                                if (keyCode === item) {
                                    validKeyCode = true;
                                    break;
                                }
                            }
                        }
                        if (validKeyCode) {
                            site = this.getSite();
                            let last = this.getSite('last');

                            if (keyCode === Key.Left) {
                                if (site && site.index > 0) {
                                    site = this.getSite(site.index - 1);     // 上一坐标 by index
                                }
                            }
                            else if (keyCode === Key.Right) {
                                if (site && site.index < last.index) {
                                    site = this.getSite(site.index + 1);     // 一下坐标 by index
                                }
                            }
                            else if (keyCode === Key.Down) {
                                if (last.x > site.x) {
                                    site = this.getSite('last');             // 自动补位
                                }
                            }
                        }
                    }
                    if (site) {
                        // 更新坐标
                        this.site = site;

                        // 添加历史记录
                        this.record(this.site);

                        ret = true;
                    }
                }
            }
        }
        return ret;
    }
    /**
     * 处理焦点移交规则
     */
    private handlerAutoTarget(args: any): boolean {

        let ret: boolean = false;
        let params = args.arguments;
        // 必须在配有焦点移交规则的情况下
        // 必须是在 system.change.site 失败后执行
        // 必须是keyCode类型(并且没有连续KeyCode指令)
        // 处理 left up right dn 规则
        if (this.autoTarget && this.autoTarget.length > 0) {
            if (args && args.result === 'failure') {
                if (params && params instanceof Array && params.length > 0) {
                    if (params[0] && params[0] instanceof Array && params[0][0] && params[0].length === 1) {
                        let keyCode = params[0][0];
                        let autoTarget = this.autoTarget;

                        if (keyCode === Key.Left || keyCode === Key.Up || keyCode === Key.Right || keyCode === Key.Down) {
                            // 试图找到预定义规则
                            for (let i = 0; i < autoTarget.length; i++) {
                                let item = autoTarget[i];
                                if (item && item.keyCode === keyCode) {
                                    this.pageEvent ? this.pageEvent.target(item.target) : null;

                                    ret = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return ret;
    }
    /**
     * 焦点样式管理
     */
    private handlerAutoClass(args: any): boolean {

        let ret: boolean;
        let result = args.result;
        let params = args.arguments;
        let length = params ? params.length : 0;
        let keyCode = params instanceof Array && params[0] instanceof Array ? params[0][0] : null;

        // 必须是在 system.change.site 执行之后
        // 支持任何类型的指令
        // 处理所有 keyCode 规则
        // 必须在设置class样式后
        // 在坐标改变后或者失去/获取焦点后
        if (result === 'success') {
            // if (this.activeClass) {
            let present = this.site;
            let previous = this.record(-1);

            // // 未变动则不执行
            // if (Leap.equal(previous, present)) {
            // }
            let record = this.recordArray;

            // 重置样式
            if (previous instanceof Object) {
                let ele = previous.element;
                if (ele) {
                    ele.removeClas(this.activeClass);

                    let response = new FocusResponse();
                    response.Event = null;
                    response.IdentCode = this.identCode;
                    response.EventName = FocusType.Changeed;
                    response.KeyCode = null;
                    response.Data = null;
                    response.SiteSource = null;
                    response.Success = true;
                    response.SiteHanlde = present;
                    this.blurCallback && this.blurCallback(response);
                }
            }
            this.blurSite ? this.blurSite(previous) : null;

            // 设置样式
            if (present instanceof Object) {
                let ele = present.element;
                if (ele) {
                    ele.clas(this.activeClass);

                    let response = new FocusResponse();
                    response.Event = null;
                    response.IdentCode = this.identCode;
                    response.EventName = FocusType.Changeed;
                    response.KeyCode = null;
                    response.Data = null;
                    response.SiteSource = null;
                    response.Success = true;
                    response.SiteHanlde = present;
                    this.activeCallback && this.activeCallback(response);

                    if (this.blurClass) {
                        if (ele) {
                            ele.removeClas(this.blurClass);

                            let response = new FocusResponse();
                            response.Event = null;
                            response.IdentCode = this.identCode;
                            response.EventName = FocusType.Changeed;
                            response.KeyCode = null;
                            response.Data = null;
                            response.SiteSource = null;
                            response.Success = true;
                            response.SiteHanlde = present;

                            this.blurCallback && this.blurCallback(response);
                        }
                    }
                }
            }
            this.focusSite ? this.focusSite(present) : null;
            return true;
            // }
        }
        return false;
    }
    // 对比两个site实例是否相等
    public static equal(siteOne: Site, siteTwo: Site) {
        let ret = false;
        if (siteOne && siteTwo && siteOne instanceof Site && siteTwo instanceof Site) {
            if (siteOne.index === siteTwo.index && siteOne.leapId === siteTwo.leapId && siteOne.x === siteTwo.x && siteOne.y === siteTwo.y) {
                ret = true;
            }
        }
        return ret;
    }
    public static validate(site: Site) {
        return site instanceof Site ? true : false;
    }
    public debuggerOut(): void {
        let map = this.map;
        for (var i = 0; i < map.length; i++) {
            let temp = '';
            for (let j = 0; j < map[i].length; j++) {
                temp += map[i][j]['x'] + ':' + map[i][j]['y'] + ':' + map[i][j]['index'] + '|';
            }
            console.log(temp + '/n');
        }
    }
    /**
     *  释放当前对象实例
     */
    public release() {
        this.validInstance = false;
        this.recordArray.length = 0;

        // 卸载当前事件队列
        this.pageEvent.off(this.identCode, FocusType.Changeed);
        this.pageEvent.off(this.identCode, FocusType.Blured);
        this.pageEvent.off(this.identCode, FocusType.Focused);
        this.pageEvent.off(this.identCode, InsideFocusType.SiteChangeed);
        this.pageEvent.off(this.identCode, PageEventType.Blur);
        this.pageEvent.off(this.identCode, PageEventType.Error);
        this.pageEvent.off(this.identCode, PageEventType.Focus);
        this.pageEvent.off(this.identCode, PageEventType.Keydown);
    }
}
export { Site, Focus, FocusType }