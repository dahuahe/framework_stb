
/**
 * 更新时间：2018年4月12日 15点33分
 * 模块分类：组建基类
 * 模块说明：以 Module 为基类定义 initialize 和 subscribeToEvents 方法为组件提供初始化和事件定义基本能力。
 *          基于 Module 类的再次继承 实现更为复杂且具通用性价值组件提供能力且保留用户自定义实现入口 initialize 和 subscribeToEvents 方法
 */
import { PageEvent } from "./pageEvent";
import { Paging, PagingHelper } from "./paging";
import { ManagementPageDBToNative } from "./managementPageDB";
import { Focus } from "./focus";
import { HElement } from "../ui_tool/uiTool";
import { Key } from "./dataTool";
import { ManagementPageDB, PageType, FocusType } from "../framework";
import { Dictionary } from "./collection";

/**
 * 组件基类
 */
class Module {
    protected event: PageEvent;
    constructor(pageEvent: PageEvent) {
        this.event = pageEvent;
    }
    protected initialize() {
        throw new Error('There is no implementation initialize()');
    }
    protected subscribeToEvents() {
        throw new Error('There is no implementation subscribeToEvents()');
    }
    protected on(identCode: string | number, topic: string | number, callback: any): void;
    protected on(identCodes: string[] | number[], topic: string | number, callback: any): void;
    protected on(identCode: any, topic: string | number, callback: any) {
        this.event.on(identCode, topic, callback);
    }
    protected onfocus(identCode: string | number, callback: (e: IFocus) => void): void;
    protected onfocus(identCodes: string[] | number[], callback: (e: IFocus) => void): void;
    protected onfocus(identCode: any, callback: any) {
        this.event.on(identCode, PageType.Focus, callback);
    }
    protected onblur(identCode: string | number, callback: (e: IBlur) => void): void;
    protected onblur(identCodes: string[] | number[], callback: (e: IBlur) => void): void;
    protected onblur(identCode: any, callback: any) {
        this.event.on(identCode, PageType.Blur, callback);
    }
    protected onKeydown(identCode: string | number, callback: (e: IKeydown) => void): void;
    protected onKeydown(identCodes: string[] | number[], callback: (e: IKeydown) => void): void;
    protected onKeydown(identCode: any, callback: any) {
        this.event.on(identCode, PageType.Keydown, callback);
    }
    protected onchanged(identCode: string | number, callback: (e: IChanged) => void): void;
    protected onchanged(identCodes: string[] | number[], callback: (e: IChanged) => void): void;
    protected onchanged(identCode: any, callback: any) {
        this.event.on(identCode, FocusType.Changed, callback);
    }
}

interface ISetting {
    foc: Focus;
    boxs: HElement[];
    pg: Paging;
    db: ManagementPageDB<any> | ManagementPageDBToNative<any>;
    activeClass: string,

    showItemBox: (e: HElement) => void;
    hideItemBox: (e: HElement) => void;
    onDBLoadList: (list: any[], s: ISetting) => void;
    onDBLoadView?: (list: any[], s: ISetting) => void;
    onDBLoadData: (v: any, i: number, e: HElement, s: ISetting) => void;
    // private
    comfirmGlobalSerial?: number;    // 全局 序号 不会大于总数据长度且0开始
    currentList?: any[],
}[];
/**
 * 翻页组件
 * @description 集成属性 db、pg、focus 且具有左右翻页方法智能焦点多页面缓存多类型页面缓存特性的组件
 */
class ModulePage<T> extends Module {

    private dic = new Dictionary<ISetting>();

    constructor(pageEvent: PageEvent, ) {
        super(pageEvent);
    }
    initSetting(setting: ISetting[]) {
        this.dic.clear();
        setting.forEach((v, i) => {
            this.dic.set(`${v.foc.getIdentCode()}`, v);
        });
    }
    toBehind(key: number | string) {
        let keyNms = `${key}`, pg = this.dic.get(keyNms).pg;

        if (pg.isNextPage()) {
            this.loadView(keyNms, pg.toNextPage(), Key.Right);
        }
    }
    toFront(key: number | string) {
        let keyNms = `${key}`, pg = this.dic.get(keyNms).pg;

        if (pg.isPreviousPage()) {
            this.loadView(keyNms, pg.toPreviousPage(), Key.Left);
        }
    }
    toPrevious(key: number | string) {
        let keyNms = `${key}`, pg = this.dic.get(keyNms).pg;

        if (pg.isPreviousPage()) {
            this.loadView(keyNms, pg.toPreviousPage(), Key.Up);
        }
    }
    toNext(key: number | string) {
        let keyNms = `${key}`, pg = this.dic.get(keyNms).pg;

        if (pg.isNextPage()) {
            this.loadView(keyNms, pg.toNextPage(), Key.Down);
        }
    }
    setGlobalSerial(key: number | string, serial: number) {
        let keyNms = `${key}`, set = this.dic.get(keyNms), size = set.pg.getPageSize(), index = set.pg.getPageIndex();
        set.comfirmGlobalSerial = serial;

        set.boxs.forEach((v, i) => {
            let dy = PagingHelper.getSerial({ pageSize: size, pageIndex: index, index: i });

            if (dy === set.comfirmGlobalSerial) {
                if (!v.hasClass(set.activeClass)) {
                    v.clas(set.activeClass);
                }
            } else {
                if (v.hasClass(set.activeClass)) {
                    v.removeClas(set.activeClass);
                }
            }
        })
    }
    toPageSerial(key: string | number, pageIndex: number, siteSerial: number) {
        let keyNms = `${key}`, set = this.dic.get(keyNms);
        this.loadView(keyNms, pageIndex, siteSerial);
    }
    toPage(key: string | number, pageIndex: number) {
        let keyNms = `${key}`, set = this.dic.get(keyNms);
        this.loadView(keyNms, pageIndex);
    }
    /**
     * 
     * @param key 
     * @param pageIndex 序列号从 1 开始
     */
    toSerial(key: string | number, serial: number) {
        let keyNms = `${key}`, set = this.dic.get(keyNms), pg = set.pg, pageIndex = 0, siteIndex = 0;
        let size = pg.getPageSize();

        pageIndex = Math.ceil(serial / size);
        siteIndex = serial - ((pageIndex - 1) * size) - 1;

        this.loadView(keyNms, pageIndex, siteIndex);
    }
    getData(key: string | number) {
        let keyNms = `${key}`, set = this.dic.get(keyNms);
        return set.currentList[set.foc.getSite().index];
    }
    getSetting(key: string | number) {
        return this.dic.get(`${key}`);
    }
    clearCache(key: string | number) {
        let set = this.dic.get(`${key}`);
        set.pg.setDataSize(0);
        set.db.clearCache();
        // set.boxs.forEach((v, i) => {
        //     set.hideItemBox(v);
        // });
    }
    /**
     * 根据模块标识加载渲染页面
     */
    private loadView(key: string, pageIndex: number, siteIndex: number): void;
    private loadView(key: string, pageIndex: number, direction?: Key.Left | Key.Right | Key.Up | Key.Down): void;
    private loadView(key: string, pageIndex: number, direction?: any): void {

        let set = this.dic.get(key);
        let pg = set.pg;
        let foc = set.foc;
        let boxs = set.boxs;
        let focCls = set.foc.getSetting().className;
        let actCls = set.activeClass;

        // update setting
        pg.setPageIndex(pageIndex);

        set.db.getItem(pageIndex, (data) => {
            set.onDBLoadList && set.onDBLoadList(data, set);

            let len = set.pg.getPageSize(), dif = len - data.length, globalIndex = -1, siteIndex = 0, curEles = [], dynamicGlobalSerial = -1, size = set.pg.getPageSize(), preIndex = 0;
            let pre = set.foc.getSite();

            set.currentList = data;

            // 没有数据
            if (!data || !data.length) {
                set.foc.initData(0);
                set.boxs.forEach((v, i) => {
                    set.hideItemBox(v);
                });
                return;
            }

            for (let i = 0; i < len; i++) {

                let box = set.boxs[i];

                if (i < (len - dif)) {

                    dynamicGlobalSerial = PagingHelper.getSerial({ pageSize: size, pageIndex: pageIndex, index: i });

                    // 当前页面数据遍历填充
                    set.onDBLoadData(data[i], i, box, set);

                    // 检测全局焦点
                    if (globalIndex === -1 && undefined != set.comfirmGlobalSerial && dynamicGlobalSerial === set.comfirmGlobalSerial) {
                        globalIndex = i;
                    }

                    curEles.push(box);
                    set.showItemBox(box);


                } else {
                    set.hideItemBox(box);
                }

                // 重置激活样式
                if (actCls && box.hasClass(actCls)) {
                    box.removeClas(actCls);
                }
                // 重置焦点样式
                if (box.hasClass(focCls)) {
                    box.removeClas(focCls);
                }
            }

            // init
            foc.initData(curEles);

            pre = pre || foc.getSite();

            // 设置焦点
            // 指定翻页方向
            if (undefined !== direction) {
                if (Key.Left == direction) {
                    let first = set.foc.getSite("first");
                    let last = set.foc.getSite("last");

                    // 多行
                    if (first.x < last.x) {
                        siteIndex = set.foc.getSite(pre.x, "last").index;
                    }
                    // 单行
                    else {
                        siteIndex = last.index;
                    }

                    foc.setSite(siteIndex);
                }
                else if (Key.Right == direction) {
                    let first = set.foc.getSite("first");
                    let last = set.foc.getSite("last");

                    // 设置focus焦点
                    // 多行
                    if (first.x < last.x) {
                        if (set.foc.getSite(pre.x, "first")) {
                            siteIndex = set.foc.getSite(pre.x, "first").index;
                        } else {
                            siteIndex = last.index;
                        }
                    }
                    // 单行
                    else {
                        siteIndex = first.index;
                    }

                    foc.setSite(siteIndex);
                }
                else if (Key.Up == direction || Key.Down == direction) {
                    if (pre) {
                        pre.x = 0 == pre.x ? 1 : 0;
                        if (!set.foc.getSite(pre.x, pre.y)) {
                            pre = set.foc.getSite('last');
                        }
                        foc.setSite(pre.x, pre.y);
                    }
                }
            }
            // 指定页面焦点
            if (undefined !== direction) {
                if (Key.Left !== direction && Key.Up !== direction && Key.Right !== direction && Key.Down !== direction) {

                    if (foc.getSite(direction)) {
                        foc.setSite(direction)
                    } else {
                        foc.getSite(0);
                    }
                }
            }

            // 设置全局焦点样式
            if (-1 !== globalIndex) {
                boxs[globalIndex].clas(actCls);
            }

            // 非激活模块异常处理
            if (foc.getIdentCode() != this.event.getTargetIdentCode()) {
                foc.getSite().element.removeClas(focCls);
            }

            set.onDBLoadView && set.onDBLoadView(data, set);
        });
    }
}
export { Module, ModulePage }