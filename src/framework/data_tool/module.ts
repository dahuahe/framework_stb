
/**
 * 更新时间：2018年3月22日 14点17分
 * 模块分类：组建类
 * 模块说明：以 Module 为基类定义 initialize 和 subscribeToEvents 方法为组件提供初始化和事件定义基本能力。
 *          基于 Module 类的再次继承 实现更为复杂且具通用性价值组件提供能力且保留用户自定义实现入口 initialize 和 subscribeToEvents 方法
 */
import { PageEvent } from "./pageEvent";
import { Paging, PagingHelper } from "./paging";
import { ManagementPageDBToNative } from "./managementPageDB";
import { Focus } from "./focus";
import { HElement } from "../ui_tool/uiTool";
import { Key } from "./dataTool";
import { ManagementPageDB } from "../framework";

/**
 * 组件基类
 */
class Module {
    /**
     * 页面事件
     */
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
}

interface IModulePageToNative<T> {
    activeClass: string,
    onEachItemAfter: (v: T, i: number, e: HElement, ) => void;
};
/**
 * 翻页组件
 * @description 集成属性 db、pg、focus 且具有左右翻页方法智能焦点特性的组件
 */
class ModulePage<T> extends Module {
    /**
     * 焦点对象
     */
    protected foc: Focus;
    /**
     * 数据分页
     */
    protected db: IManagementDB<T>;
    /**
     * 分页状态
     */
    protected pg: Paging;
    /**
     * 元素对象列表
     */
    protected boxs: HElement[] = [];
    /**
     * 元素数据列表
     */
    protected list: T[] = [];

    // private
    private comfirmGlobalSerial: number;    // 全局 序号 不会大于总数据长度且0开始
    private previousSiteSerial: number;     // site 序号 不会大于当前页面长度且0开始
    private currentList: T[];
    private setting: IModulePageToNative<T>;

    constructor(pageEvent: PageEvent, setting: IModulePageToNative<T>) {
        super(pageEvent);
        this.setting = setting;
    }
    toBehind() {
        if (this.pg.isNextPage()) {
            this.toDirectionView(this.pg.toNextPage(), Key.Right);
        }
    }
    toFront() {
        if (this.pg.isPreviousPage()) {
            this.toDirectionView(this.pg.toPreviousPage(), Key.Left);
        }
    }
    toPrevious() {
        if (this.pg.isPreviousPage()) {
            this.toDirectionView(this.pg.toPreviousPage(), Key.Up);
        }
    }
    toNext() {
        if (this.pg.isNextPage()) {
            this.toDirectionView(this.pg.toNextPage(), Key.Down);
        }
    }
    setGlobalSerial(serial: number) {
        this.comfirmGlobalSerial = serial;
    }
    toSerial(serial: number) {
        // 根据序号找到页面下标
        // 加载视图
        this.loadView({ serial: serial });
    }
    toPageSerial(pageIndex: number, siteSerial: number) {
        let serial = PagingHelper.getSerial({ pageSize: this.pg.getPageSize(), pageIndex: pageIndex, index: siteSerial });
        this.loadView({ serial: serial });
    }
    private toDirectionView(pageIndex: number, direction: Key.Left | Key.Right | Key.Up | Key.Down) {
        // 加载视图
        this.loadView({ pageIndex: pageIndex, direction: direction });
    }
    private loadView(info: { pageIndex?: number, direction?: Key.Left | Key.Right | Key.Up | Key.Down, serial?: number }) {
        // 根据页面下标获取数据 | 先计算页面下标，在根据页面下标获取数据

        // 填充数据
        // 检测全局焦点

        // 删除上一个 focus 焦点样式
        // 删除上一个 全局焦点样式

        // 加载focus数据
        // 不是根据序号获取情况,根据方向智能获取site序号 | 根据全局序号获取site序号
        // 设置focus焦点
        // 更新上一个焦点
        // 设置全局焦点

        // focus 配置相关
        let focusClass = this.foc.getSetting().className;
        let activeClass = this.setting.activeClass;

        // 先计算页面下标，在根据页面下标获取数据
        if (undefined == info.pageIndex && undefined != info.serial) {
            info.pageIndex = PagingHelper.getPageIndex(this.pg.getDataSize(), this.pg.getPageSize(), info.serial);
            this.pg.setPageIndex(info.pageIndex);
        }
        this.db.getItem(info.pageIndex, (list) => {
            this.list = list;
            let len = this.pg.getPageSize(), dif = len - list.length, globalIndex = -1, siteIndex = 0, curEles = [], dynamic = -1, size = this.pg.getPageSize(), index = info.pageIndex, preIndex = 0;

            let cur = this.foc.getSite();
            // 重置焦点样式
            // if (cur) {
            //     cur.element.removeClas(activeClass);
            // }
            for (let i = 0; i < len; i++) {
                if (i < (len - dif)) {
                    dynamic = PagingHelper.getSerial({ pageSize: size, pageIndex: index, index: i });

                    // 当前页面数据遍历填充
                    this.setting.onEachItemAfter(list[i], i, this.boxs[i]);
                    // 拥有全局焦点，全局序号设置
                    if (globalIndex === -1 && undefined != this.comfirmGlobalSerial && dynamic === this.comfirmGlobalSerial) {
                        globalIndex = i;
                    }
                    curEles.push(this.boxs[i]);
                    this.boxs[i].show();
                    // 重置激活样式
                    if (this.boxs[i].hasClass(activeClass)) {
                        this.boxs[i].removeClas(activeClass);
                    }
                    // 重置焦点样式
                    if (this.boxs[i].hasClass(focusClass)) {
                        this.boxs[i].removeClas(focusClass);
                    }
                } else {
                    this.boxs[i].hide();
                }
            }
            // 加载focus数据
            if (-1 == globalIndex) {
                preIndex = this.foc.getSite() ? this.foc.getSite().index : 0;
            } else {
                preIndex = globalIndex;
            }
            this.foc.initData(curEles);
            // 不是根据序号获取情况,根据方向智能获取site序号 | 根据全局序号获取site序号
            if (undefined !== info.direction) {
                if (Key.Left == info.direction) {
                    siteIndex = this.foc.getSite("last").index;

                    // 设置focus焦点
                    this.foc.setSite(siteIndex);
                }
                else if (Key.Right == info.direction) {
                    siteIndex = this.foc.getSite("first").index;

                    // 设置focus焦点
                    this.foc.setSite(siteIndex);
                }
                else if (Key.Up == info.direction || Key.Down) {
                    if (cur) {
                        cur.x = 0 == cur.x ? 1 : 0;
                        if (!this.foc.getSite(cur.x, cur.y)) {
                            cur = this.foc.getSite('last');
                        }
                        this.foc.setSite(cur.x, cur.y);
                    }
                }
            } else if (undefined !== info.serial) {
                siteIndex = preIndex;

                // 设置focus焦点
                this.foc.setSite(siteIndex);
            }

            // 更新上一个焦点
            this.previousSiteSerial = siteIndex;

            // 设置全局焦点
            if (-1 != globalIndex) {
                this.foc.getSite(globalIndex).element.clas(activeClass);
            }

            // 非当前激活模块异常处理
            if (this.foc.getIdentCode() != this.event.getTargetIdentCode()) {
                this.foc.getSite().element.removeClas(focusClass);
            }
        });
    }
}
export { Module, ModulePage }