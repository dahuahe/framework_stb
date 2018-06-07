
/**
 * 模块分类：组件定义
 */
import { PageEvent } from "./pageEvent";
import { Paging, PagingHelper } from "./paging";
import { ManagementPageDBToNative } from "./managementPageDB";
import { Focus } from "./focus";
import { HElement } from "../ui_tool/uiTool";
import { Key } from "./dataTool";
import { ManagementPageDB, PageType, FocusType } from "../framework";
import { Dictionary } from "./collection";

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
interface ISetting<T> {
    foc: Focus;
    eles: IHElement;
    pg: Paging;
    db: ManagementPageDB<any> | ManagementPageDBToNative<any>;
    activeClass: string,

    showItemBox: (e: IHElement) => void;
    hideItemBox: (e: IHElement) => void;
    onDBLoadList: (list: T[], s: ISetting<T>, callback: (list: any) => void) => void;
    onDBLoadView?: (list: T[], s: ISetting<T>) => void;
    onDBLoadData: (v: T, i: number, e: IHElement, s: ISetting<T>) => void;
    // private
    comfirmGlobalSerial?: number;    // 全局 序号 不会大于总数据长度且0开始
    currentList?: T[],
}[];
/**
 * 翻页组件
 * @description 集成属性 db、pg、focus 且具有左右翻页方法智能焦点多页面缓存多类型页面缓存特性的组件
 */
class ModulePage<T> extends Module {

    private setting: ISetting<T> = <any>{};

    constructor(pageEvent: PageEvent, ) {
        super(pageEvent);
    }
    initSetting(setting: ISetting<T>) {
        this.setting = setting;
    }
    toBehind(): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            let pg = this.setting.pg;

            if (pg.isNextPage()) {
                this.loadView(pg.toNextPage(), Key.Right).then(() => {
                    resolve();
                });
            }
        });
    }
    toFront(): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            let pg = this.setting.pg;

            if (pg.isPreviousPage()) {
                return this.loadView(pg.toPreviousPage(), Key.Left).then(() => {
                    resolve();
                });
            }
        });
    }
    toPrevious(): Promise<Array<T>> {

        return new Promise((resolve, reject) => {
            let pg = this.setting.pg;

            if (pg.isPreviousPage()) {
                this.loadView(pg.toPreviousPage(), Key.Up).then(() => {
                    resolve();
                })
            }
        });
    }
    toNext(): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            let pg = this.setting.pg;

            if (pg.isNextPage()) {
                this.loadView(pg.toNextPage(), Key.Down).then(() => {
                    resolve();
                })
            }
        });
    }
    setGlobalSerial(serial: number) {
        let set = this.setting, size = set.pg.getPageSize(), index = set.pg.getPageIndex();
        set.comfirmGlobalSerial = serial;
        let list = set.eles.eqAll();
        list.forEach((v, i) => {
            let dy = PagingHelper.getSerial({ pageSize: size, pageIndex: index, index: i });

            if (dy === set.comfirmGlobalSerial) {
                if (!v.hasClass(set.activeClass)) {
                    v.addClass(set.activeClass);
                }
            } else {
                if (v.hasClass(set.activeClass)) {
                    v.removeClass(set.activeClass);
                }
            }
        })
    }
    toPageSerial(pageIndex: number, siteSerial: number): Promise<Array<T>> {
        let set = this.setting;
        return this.loadView(pageIndex, siteSerial);
    }
    toPage(pageIndex: number): Promise<Array<T>> {
        let set = this.setting;
        return this.loadView(pageIndex);
    }
    /**
     * 
     * @param key 
     * @param pageIndex 序列号从 1 开始
     */
    toSerial(serial: number): Promise<Array<T>> {
        let set = this.setting, pg = set.pg, pageIndex = 0, siteIndex = 0;
        let size = pg.getPageSize();

        pageIndex = Math.ceil(serial / size);
        siteIndex = serial - ((pageIndex - 1) * size) - 1;

        return this.loadView(pageIndex, siteIndex);
    }
    getData() {
        let set = this.setting;
        return set.currentList[set.foc.getSite().index];
    }
    getSetting() {
        return this.setting;
    }
    clearCache() {
        let set = this.setting;
        set.pg.setDataSize(0);
        set.db.clearCache();
    }
    /**
     * 根据模块标识加载渲染页面
     */
    private loadView(pageIndex: number, siteIndex: number): Promise<Array<T>>;
    private loadView(pageIndex: number, direction?: Key.Left | Key.Right | Key.Up | Key.Down): Promise<Array<T>>;
    private loadView(pageIndex: number, direction?: any): Promise<Array<T>> {
        let set = this.setting;
        let pg = set.pg;
        let foc = set.foc;
        let eles = set.eles;
        let focCls = set.foc.getSetting().className;
        let actCls = set.activeClass;

        // update setting
        pg.setPageIndex(pageIndex);

        return new Promise((resolve, reject) => {
            set.db.getItem(pageIndex, (data) => {

                var exe = (data: any[]) => {
                    let len = set.eles.length, dif = len - data.length, globalIndex = -1, siteIndex = 0, curEles: HTMLElement[] = [], dynamicGlobalSerial = -1, size = set.pg.getPageSize(), preIndex = 0;
                    let pre = set.foc.getSite();

                    set.currentList = data;

                    // 没有数据
                    if (!data || !data.length) {
                        set.foc.initData(null);
                        let list = set.eles.eqAll();
                        list.forEach((v, i) => {
                            set.hideItemBox(v);
                        });
                        resolve();
                        return;
                    }

                    for (let i = 0; i < len; i++) {

                        let box = set.eles.eq(i);

                        if (i < (len - dif)) {

                            dynamicGlobalSerial = PagingHelper.getSerial({ pageSize: size, pageIndex: pageIndex, index: i });

                            // 当前页面数据遍历填充
                            set.onDBLoadData(data[i], i, box, set);

                            // 检测全局焦点
                            if (globalIndex === -1 && undefined != set.comfirmGlobalSerial && dynamicGlobalSerial === set.comfirmGlobalSerial) {
                                globalIndex = i;
                            }

                            curEles.push(box.get(0));
                            set.showItemBox(box);


                        } else {
                            set.hideItemBox(box);
                        }

                        // 重置激活样式
                        if (actCls && box.hasClass(actCls)) {
                            box.removeClass(actCls);
                        }
                        // 重置焦点样式
                        if (box.hasClass(focCls)) {
                            box.removeClass(focCls);
                        }
                    }

                    // init
                    foc.initData(new HElement(curEles));

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
                        eles.eq(globalIndex).addClass(actCls);
                    }

                    // 非激活模块异常处理
                    if (foc.getIdentCode() != this.event.getTargetIdentCode()) {
                        foc.getSite().element.removeClass(focCls);
                    }

                    set.onDBLoadView && set.onDBLoadView(data, set);

                    resolve();
                }

                if (set.onDBLoadList) {
                    set.onDBLoadList(data, set, (list) => {
                        exe(list);
                    });
                }
                else {
                    exe(data);
                }
            });
        });
    }
}
export { Module, ModulePage }