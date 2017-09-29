import { Dictionary } from './collection';
import { Ajax } from './ajax';
import { PagingHelper } from './paging';
import { Extend } from './dataTool';
interface IPramsOne {
    pageIndex: number;
    pageSize: number;
}
/**
 * 数据管理分页
 * 支持网络数据分页
 * 支持网络数据缓存
 * 访问过的数据会自动缓存
 */
export class ManagementPageDB<T>{
    private PanelDictionary: Dictionary<Array<T>>;      //页面集合
    private Network: Ajax;                              //网络对象
    private RequestPageCount: number;                   //每次请求页数
    private DataSize: number                            //数据库总共长度
    private IsNetRequest: boolean;                      //是否运行进行网络请求
    private IsRequestFullDataCompletion: boolean;       //是否所有数据请求完毕
    public OnBeforeSendRequest: (params: IPramsOne, callbackSuccess: (data: Array<T>) => void) => void;
    private PageSize: number;

    constructor(pageSize?: number) {
        this.PageSize = pageSize;
        this.IsNetRequest = true;
        this.DataSize = 0;
        this.RequestPageCount = 0;     //默认请求 全部 页
        this.PanelDictionary = new Dictionary<Array<T>>();
    }
    //根据页数
    public getItem(pageIndex: number, callback?: (list: Array<T>) => void) {
        let dt: Array<any> = [];

        //是否已缓存全部数据
        let pgBoxs = this.PanelDictionary.get(`${pageIndex}`);

        if (pgBoxs && pgBoxs.length >= 1) {
            dt = pgBoxs;
            // console.log('从缓存获取');
            //根据页数获取
            callback && callback(dt);
        } else {
            // console.log('从数据库获取');

            this.OnBeforeSendRequest({ pageIndex: pageIndex, pageSize: this.PageSize }, (paddingList) => {
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
                callback && callback(dt);
            });
        }
    }
    public addItem(pageIndex: number | string, value: Array<T>) {
        if (!this.PanelDictionary.has(String(pageIndex))) {
            this.PanelDictionary.set(String(pageIndex), value);
        }
    }
    public setDataSize(size: number) {
        this.DataSize = size;
    }
    public setPageSize(size: number) {
        this.PageSize = size;
    }
    public setRequestPageCount(count: number) {
        this.RequestPageCount = count;
    }
}
/**
 * 数据管理分页
 * 支持本地数据分页
 * 支持数据开始下标与结束下标记录
 * 一次性缓存所有数据
 */
class Panel<T>{
    startAt: number;
    stopAt: number;
    pageIndex: number;
    list: Array<T>;
}
export class ManagementPageDBToLocal<T>{
    private PanelDictionary: Dictionary<Panel<T>>;      //页面集合
    private DataSize: number                            //数据总共长度
    private PageSize: number;

    constructor(pageSize: number) {
        this.PageSize = pageSize;
        this.PanelDictionary = new Dictionary<Panel<T>>();
    }
    initData(data: Array<T>) {
        this.PanelDictionary.clear();

        // 根据页面大小进行数据分页
        let length = data.length, size = this.PageSize, accumI = 0, list = [], accumPageI = 1, startAt = -1, stopAt = -1;
        for (let i = 0; i < length; i++) {
            accumI++;
            list.push(data[i]);
            if (startAt === -1) {
                startAt = i;
            }
            stopAt = i;

            if (accumI >= size) {
                // 添加满足一页
                accumI = 0;

                let panel = new Panel<T>();
                panel.list = new Extend<any>(true, list, null).getResult();
                panel.startAt = startAt;
                panel.stopAt = i;
                panel.pageIndex = accumPageI;

                this.PanelDictionary.set(`${accumPageI}`, panel);

                accumPageI++;
                list = [];
                startAt = -1;
            }
        }
        // 最后一页,添加不满一页
        if (list.length >= 1) {

            let panel = new Panel<T>();
            panel.list = new Extend<any>(true, list, null).getResult();
            panel.startAt = startAt;
            panel.stopAt = stopAt;
            panel.pageIndex = accumPageI;

            this.PanelDictionary.set(`${accumPageI}`, panel);
        }
    }
    //根据页数
    getItem(pageIndex: number): Panel<T> {
        return this.PanelDictionary.get(`${pageIndex}`);
    }
    getLists(): Array<Panel<T>> {
        let list = [];
        let data:any = this.PanelDictionary.getItems();
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                list.push(data[key]);
            }
        }
        return list;
    }
    getItems() {
        return this.PanelDictionary.getItems();
    }
}