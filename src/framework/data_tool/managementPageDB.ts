/**
 * 编辑作者：张诗涛
 * 创建时间：2017年11月15日15:02:32
 * 功能分类：数据分页缓存（本地/网络）模块
 * 更新日志（ManagementPageDB）：
 *          时间：2017年11月15日15:03:43
 *          内容：增加方法使用说明 setRequestPageCount 、setPageSize 、setDataSize
 *          内容：增加 complete 方法检测数据是否全部加载完毕，必须配置 setDataSize();
 * 更新日志（ManagementPageDB）：
 *          时间：2017年11月17日09:56:35
 *          内容：默认请求三页
 *          内容：完善预缓存逻辑
 *          内容：修复同时发送多个请求（缓存请求/网络请求），忽略后续请求。比如网络请求已发出本可以在缓存之后满足第二个网络请求转换为本地请求。因此需要避免请求的有效顺序
 * 更新日志（ManagementPageDB）：
 *          时间：2017年11月20日15:18:37
 *          内容：增加 cacheCount 方法检查已缓存数据量
 *          内容：取消 complete 方法。数据是可配置的包括（删除、修改、新增）。无法检测准确的缓存数据。
 *          内容：取消 setDataSize 方法。该方法无实际意义，可直接集合 Paging 对象来使用。
 *          内容：纠正 处理后的缓存数量小于页面大小时，不做处理（可能存在数据库还有数据，但缓存的本地页面缺失部分数据）。可调整 请求页数量 setRequestPageCount 来避免。当前默认请求 3 页，推荐请求页数不小于 3
 * 更新日志（ManagementPageDB）：
 *          内容：取消 setPageSize 方法。去掉不完善的动态页面大小接口
 * 更新日志（ManagementFlowDB）：
 *          内容：增加 ManagementFlowDB 类。作为手机端前后刷新数据缓存管理
 * 更新日志（MangementPageDB）
 *          时间：2017年11月27日11:11:07
 *          内容：清空缓存
 * 更新日志：ManagementFlowDB
 *          时间：2017年11月29日18:32:31
 *          内容：传递数据类型改为 node 级别
 *          内容：可根据前后关系获取数据
 */
import { Dictionary, DoublyLinkedList, DoublyLinkedNode } from './collection';
import { PagingHelper } from './paging';
import { Extend } from './dataTool';
import { FuncLock } from "./dataTool";
interface IPramsOne {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
}
/**
 * 应用场景：带有下标的数据分页
 * 支持数据分页
 * 支持网络数据缓存
 * 高速读取缓存数据
 * 支持跃级缓存页面
 * 支持预缓存页数
 * 核心数据储存结构基于字典（Dictionary<Array<T>>）
 * 支持接口数据与 callbackSuccess 回掉数据一致
 * 兼容推荐接口数据与 callbackSuccess 回掉数据不一致 前提是对页面数据量完整性要求不高场景（默认兼容页面大小数量差的 100 % 以下（不包括100%），删除后的数据空缺会保存到预缓存页数的最后一页，高于 100%（包含）可能导致最后缓存页面为空）
 */
export class ManagementPageDB<T>{
    private PanelDictionary: Dictionary<Array<T>>;      // 页面集合
    private RequestPageCount: number;                   // 每次请求页数
    private NativeDataSize: number;                     // 已缓存数据条数
    public OnBeforeSendRequest: (params: IPramsOne, callbackSuccess: (data: Array<T>) => void) => void;
    private PageSize: number;
    // 请求队列
    private func: FuncLock;

    constructor(pageSize?: number) {
        this.PageSize = pageSize;
        this.RequestPageCount = 3;     //默认请求 3 页
        this.NativeDataSize = 0;
        this.PanelDictionary = new Dictionary<Array<T>>();
        this.func = new FuncLock();
    }
    // 根据页数
    public getItem(pageIndex: number, callback?: (list: Array<T>) => void) {
        this.func.enable(() => {
            let dt: Array<any> = [];

            let pageList = this.PanelDictionary.get(`${pageIndex}`) || [];

            if (pageList.length) {
                // console.log('从缓存获取');
                dt = pageList;
                //根据页数获取
                this.func.clear();
                callback && callback(dt);
            } else {
                // console.log('从数据库获取');
                // let pageSize = this.PageSize * this.RequestPageCount;

                this.OnBeforeSendRequest({ pageIndex: pageIndex, pageSize: this.PageSize, pageCount: this.RequestPageCount }, (paddingList) => {
                    //追加当前缓存
                    if (paddingList.length >= 1) {

                        if (this.RequestPageCount === 1) {
                            //添加一页数据
                            this.addItem(pageIndex, paddingList);

                        } else if (this.RequestPageCount > 1 || this.RequestPageCount === 0) {
                            //添加多页数据
                            let nowDt = [];
                            let nowIndex = pageIndex;//页数下标标记开始为当前请求下标
                            for (let i = 0; i < paddingList.length; i++) {

                                let item = paddingList[i];

                                nowDt.push(item);

                                //一页数据已满，或者已便利完所有数据
                                if (nowDt.length >= this.PageSize || i + 1 === paddingList.length) {
                                    this.addItem(nowIndex, nowDt);
                                    //清空当前页，继续填充下一页
                                    nowDt = [];
                                    ++nowIndex;

                                    //已便利完所有数据
                                    if (i + 1 === paddingList.length) {
                                        break;
                                    }
                                }
                            }
                        } else {
                            console.log('RequestPageLength Error Value:' + this.RequestPageCount);
                        }
                    }
                    // 再次取
                    //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                    let pgBoxs = this.PanelDictionary.get(`${pageIndex}`) || [];

                    if (pgBoxs && pgBoxs.length >= 1) {

                        //从缓存获取
                        dt = pgBoxs;

                        // console.log('缓存');
                        //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                    }
                    //根据页数获取
                    this.func.clear();
                    callback && callback(dt);
                });
            }
        })
    }
    public addItem(pageIndex: number | string, value: Array<T>) {
        if (!this.PanelDictionary.has(String(pageIndex))) {
            this.PanelDictionary.set(String(pageIndex), value);
            this.NativeDataSize += value.length; // 累加已缓存数据量
        }
    }
    /**
     * 假如 pageSize为 10 count 2 那么每次网络请求数据长度为20，但DB对象返回前十条，并本地缓存二十条。默认请求全部数据
     * @param count 每次网络请求缓存页面总数
     */
    public setRequestPageCount(count: number) {
        this.RequestPageCount = count;
    }
    /**
     * 缓存数目
     */
    public cacheCount(): number {
        return this.NativeDataSize;
    }
    /**
     * 清空缓存
     */
    public clearCache() {
        this.PanelDictionary.clear();
        this.NativeDataSize = 0;
    }
}
interface IPramsFlow<T> {
    fetch: 'after' | 'before' | 'first';
    pageSize: number;
    marginList: T[];
}
/**
 * 应用场景：没有下标和页面大小的数据流，手机端的前后刷新等
 * 支持数据分页（不支持页标记录）
 * 支持网络数据缓存
 * 高速读取缓存数据
 * 不支持跃级缓存页面（支持兄弟关系访问）
 * 不支持预缓存页数（每次请求一页）
 * 核心数据储存结构基于双向链表（DoublyLinkedList）
 * 兼容推荐接口数据与 callbackSuccess 回掉数据不一致
 */
export class ManagementFlowDB<T>{
    private doublyLinked = new DoublyLinkedList<Array<T>>();          // 页面集合
    private node: DoublyLinkedNode<Array<T>>;
    private NativeDataSize = 0;                     // 已缓存数据条数
    public OnBeforeSendRequest: (params: IPramsFlow<T>, callbackSuccess: (list: T[]) => void) => void;
    private PageSize: number;
    // 请求队列
    private func: FuncLock;

    constructor(pageSize?: number) {
        this.PageSize = pageSize;
        this.func = new FuncLock();
    }
    // 当前流的前后刷新数据
    /**
     * TOTD
     * 扩展该参数 传入 Node 节点自动获取数据 可获取节点前面的和后面的，有本地就获取本地，没有本地就获取网络
     * @param fetch 
     * @param callback 
     */
    private getItem(fetch: 'after' | 'before', callback?: (list: T[]) => void) {
        this.func.enable(() => {
            console.log('request')
            let marginList: T[] = [], way: any = 'first';

            if (!this.doublyLinked.isEmpty()) {
                way = fetch;
                if ('after' === fetch)
                    marginList = this.doublyLinked.getTail() ? this.doublyLinked.getTail().element : [];
                if (!marginList.length)
                    marginList = this.doublyLinked.getHead() ? this.doublyLinked.getHead().element : [];
            }

            this.OnBeforeSendRequest({ fetch: way, pageSize: this.PageSize, marginList: marginList }, (list: Array<T>) => {
                //追加当前缓存
                if (list.length) {
                    let node: DoublyLinkedNode<T> = null;
                    // 缓存
                    if (this.doublyLinked.isEmpty() || fetch === 'after') {
                        // 首次加载
                        this.doublyLinked.append(list);
                    }
                    else if (fetch === 'before') {
                        this.doublyLinked.insert(0, list);
                    }
                    this.NativeDataSize += list.length;
                    // 再次取缓存
                    //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                    this.func.clear();
                    callback && callback(list);
                } else {
                    // 没有值
                    this.func.clear();
                    callback && callback([]);
                }
            });
        })
    }
    /**
     * 缓存数目
     */
    public cacheCount(): number {
        return this.NativeDataSize;
    }
    public getHead(): DoublyLinkedNode<T[]> {
        return this.doublyLinked.getHead();
    }
    public getTial(): DoublyLinkedNode<T[]> {
        return this.doublyLinked.getTail();
    }
    public getCurrentNode(): DoublyLinkedNode<T[]> {
        return this.node;
    }
    public setCurrentNode(node: DoublyLinkedNode<T[]>): void {
        this.node = node;
    }
    public isEmpty(): boolean {
        return this.doublyLinked.isEmpty();
    }
    toNextPage(callback: (nextList: T[]) => void) {
        // 未设置当前node 代表首次加载
        // 当前 current 没有值 返回空数组
        // 下一个节点为空
        // 下一个节点有值
        // 为空就请求网络
        if (!this.node && this.getHead()) {
            // 缓存后首次加载
            this.node = this.getHead();
            callback(this.node.element || []);
        } else {
            let list = [];
            if (this.node) {
                // 从某个节点之后开始加载
                if (this.node.next) {
                    list = this.node.next.element || [];
                } else {
                    list = [];
                }
            } else {
                list = [];
            }
            if (!list.length) {
                // 未缓存首次网络数据加载
                this.getItem('after', (data) => {
                    this.node = this.doublyLinked.getTail();
                    callback(data);
                })
            } else {
                callback(list);
            }
        }
    }
    toPreviousPage(callback: (nextList: T[]) => void) {
        // 未设置当前node 代表首次加载
        // 当前 current 没有值 返回空数组
        // 下一个节点为空
        // 下一个节点有值
        // 为空就请求网络
        if (!this.node && this.getHead()) {
            // 缓存后首次加载
            this.node = this.getHead();
            callback(this.node.element || []);
        } else {
            let list = [];
            if (this.node) {
                // 从某个节点之前开始加载
                if (this.node.prev) {
                    list = this.node.prev.element || [];
                } else {
                    list = [];
                }
            } else {
                list = [];
            }
            if (!list.length) {
                // 未缓存首次网络数据加载
                this.getItem('before', (data) => {
                    this.node = this.doublyLinked.getHead();
                    callback(data);
                })
            } else {
                callback(list);
            }
        }
    }
}

/**
 * 数据管理分页
 * 支持本地数据分页
 * 支持数据开始下标与结束下标记录
 * 一次性缓存所有数据
 */
export class ManagementPageDBToNative<T>{
    private PanelDictionary: Dictionary<Array<T>>;      // 页面集合
    private NativeDataSize: number;                     // 已缓存数据条数

    private PageSize: number;
    // 请求队列
    private func: FuncLock;

    constructor(pageSize?: number) {
        this.PageSize = pageSize;
        this.NativeDataSize = 0;
        this.PanelDictionary = new Dictionary<Array<T>>();
        this.func = new FuncLock();
    }
    public initData(list: T[]) {
        //追加当前缓存
        if (list.length >= 1) {
            let pageIndex = 1;

            //添加多页数据
            let nowDt = [];
            let nowIndex = pageIndex;//页数下标标记开始为当前请求下标
            for (let i = 0; i < list.length; i++) {

                let item = list[i];

                nowDt.push(item);

                //一页数据已满，或者已便利完所有数据
                if (nowDt.length >= this.PageSize || i + 1 === list.length) {
                    this.addItem(nowIndex, nowDt);
                    //清空当前页，继续填充下一页
                    nowDt = [];
                    ++nowIndex;

                    //已便利完所有数据
                    if (i + 1 === list.length) {
                        break;
                    }
                }
            }
        }
    }
    // 根据页数
    public getItem(pageIndex: number, callback?: (list: Array<T>) => void) {
        this.func.enable(() => {
            let dt: Array<any> = [];

            let pageList = this.PanelDictionary.get(`${pageIndex}`) || [];

            if (pageList.length) {
                // console.log('从缓存获取');
                dt = pageList;
                //根据页数获取
                this.func.clear();
                callback && callback(dt);
            }
        })
    }
    public addItem(pageIndex: number | string, value: Array<T>) {
        if (!this.PanelDictionary.has(String(pageIndex))) {
            this.PanelDictionary.set(String(pageIndex), value);
            this.NativeDataSize += value.length; // 累加已缓存数据量
        }
    }
    /**
     * 缓存数目
     */
    public cacheCount(): number {
        return this.NativeDataSize;
    }
    /**
     * 清空缓存
     */
    public clearCache() {
        this.PanelDictionary.clear();
        this.NativeDataSize = 0;
    }
}