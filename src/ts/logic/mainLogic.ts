import { BaseLogic, CallBackInfo, RequestSetting } from '../logic/baseLogic';
import { Config } from '../config';

interface IRequestToMain {
    // Please edit fields
}
export class MainLogic extends BaseLogic {
    // Please edit any => entity
    getMain(requestParams: IRequestToMain, callback: (info: CallBackInfo<any>) => void) {

        let set = new RequestSetting(`${Config.APIPath}/${Config.APIPath}`, requestParams);
        let info = new CallBackInfo();

        set.success = (response: any) => {

            // build Data of value

            info.Success = false;
            info.Response = response;
            info.Status = response.state; // please change state
            info.Message = response.msg;  // please change msg
            callback(info);
        };
        set.failure = (response: any) => {
            info.Success = false;
            info.Response = response;
            info.Status = response.state; // please change state
            info.Message = response.msg;  // please change msg
            callback(info);
        }

        this.requestGetAsync(set);
    }
}