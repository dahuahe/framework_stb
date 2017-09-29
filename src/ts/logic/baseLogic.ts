import { Ajax } from '../framework/data_tool/ajax';

export class CallBackInfo<DataType> {
    Success: boolean;
    Data: DataType;
    Response: any;
    Message: string;
    Status: any;
}
/**
 * 请求信息配置
 */
export class RequestSetting {
    /**
     * 请求参数
     */
    private params: any;
    private requestPath: string;

    // 作为公开参数 以便可以扩展不同处理结果
    success: <T> (response: CallBackInfo<T>) => void;
    failure: <T>(response: CallBackInfo<T>) => void;

    constructor(requestPath: string, requestParams: object) {
        this.params = requestParams;
        this.requestPath = requestPath;

        this.success = () => { };
        this.failure = () => { };
    }
    getRequestPath() {
        return this.requestPath;
    }
    getRequestParams() {
        return this.params;
    }
}
export class BaseLogic {
    protected requestGetAsync(setting: RequestSetting) {
        this.sentRequest(setting, 'GET', true);
    }
    protected requestPostAsync(setting: RequestSetting) {
        this.sentRequest(setting, 'POST', true);
    }
    protected requestGetReal(setting: RequestSetting) {
        this.sentRequest(setting, 'GET', false);
    }
    protected requestPostReal(setting: RequestSetting) {
        this.sentRequest(setting, 'POST', false);
    }
    /**
     * 发送网络请求
     */
    private sentRequest(setting: RequestSetting, method: 'GET' | 'POST', async: boolean) {
        let net = new Ajax({
            url: setting.getRequestPath(),
            async: async,
            method: method,
            data: setting.getRequestParams(),
            /**
             * 服务器成功响应，不代表执行信息执行成功
             */
            success: (response: any) => {
                setting.success(response);
            },
            /**
             * 服务器异常响应，不代表执行信息执行失败
             */
            failure: (response: any) => {
                setting.failure(response);
            }
        });
    }
}
