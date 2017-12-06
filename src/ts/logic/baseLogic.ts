/**
 * 编辑作者：张诗涛
 * 创建时间：2017年10月31日11:02:23
 * 更新日志：
 *      时间：2017年11月24日17:31:31
 *      内容：增加 native 请求方式，解决API频繁访问问题
 */
/**
 * 请求类
 * T：请求参数类型
 */
import { Ajax } from "../framework/data_tool/ajax";
export class RequestInfo {

    public readonly data: any;
    public readonly url: string;
    public header: any;
    public readonly callback: (success: boolean, result: any) => void;

    constructor(url: string, data: any, callback: (response: ResponseInfo<any>) => void) {
        this.data = data;
        this.url = url;
        this.header = {};
        this.callback = function (status: boolean, res) {
            callback(new ResponseInfo(status, res));
        }
    }
}
// 响应类
export class ResponseInfo<T> {
    public readonly _success: boolean;
    public readonly _response: any;
    public success: boolean;
    public message: string;
    public status: number;
    public data: T;
    constructor(success: boolean, response: any) {
        this._success = success;
        this._response = response;
    }
}
/**
 * 逻辑类
 */
export class BaseLogic {
    constructor() {
    }
    protected requestGet(request: RequestInfo) {
        // request.header['content-type'] = 'application/json';
        this.request(request, 'GET');
    }
    protected requestPut(request: RequestInfo) {
        // request.header['content-type'] = 'application/x-www-form-urlencoded';
        this.request(request, 'PUT');
    }
    protected requestDelete(request: RequestInfo) {
        // request.header['content-type'] = 'application/x-www-form-urlencoded';
        this.request(request, 'DELETE');
    }
    protected requestPost(request: RequestInfo) {
        // request.header['content-type'] = 'application/x-www-form-urlencoded';
        this.request(request, 'POST');
    }
    protected requestNative(request: RequestInfo, jsonString: string) {
        setTimeout(() => {
            request.callback(true, JSON.parse(jsonString));
        }, 0);
    }
    private request(request: RequestInfo, method: string) {
        new Ajax({
            url: request.url,
            async: true,
            method: method,
            data: request.data,
            success: function (result: any) {
                request.callback && request.callback(true, result);
            },
            failure: function (result: any) {
                request.callback && request.callback(false, result);
            }
        });
    }
}