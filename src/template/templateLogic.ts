/**
 * 编辑作者：
 * 创建时间：
 * 功能分类：
 */
import { BaseLogic, ResponseInfo, RequestInfo } from '../logic/baseLogic';
import { } from "../model/model";
import { Config } from '../config';

interface IMain {
}

class CommonLogic extends BaseLogic {
    getMainData(data: IMain, callback: (info: ResponseInfo<null>) => void) {
        let request = new RequestInfo(`${Config.serviceDomain}/${Config.apiPath.auth}`, data, function (res) {

            res.status = res._response.code;
            res.message = res._response.message;
            res.success = 200 == res.status ? true : false;

            if (res.success) {
                const { data } = res._response.data;
                if (data) {
                    res.data = createModel(data);
                }
            } else {
                // ...
            }
            callback(res);
        });

        var createModel = function (data: any) {
            const { } = data;

            let ntt = new Object();
            // ...

            return ntt;
        }

        this.requestGet(request);
    }
}
export { CommonLogic }