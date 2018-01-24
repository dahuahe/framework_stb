// /**
//  * 编辑作者：张诗涛
//  * 创建时间：2018年1月18日14:50:14
//  * 功能分类：安徽送祝福活动接口
//  */
// import { BaseLogic, ResponseInfo, RequestInfo } from '../logic/baseLogic';
// import { PrizeEntity, PrizeGrade, MainEntity } from "../model/model";
// import { Config } from '../config';

// interface IMain {
//     user_id: string;
// }
// interface IWinners {
//     token: string;
//     lottery_id: number;
// }
// interface IPlay {
//     token: string;
//     play_password: string;
// }
// interface IDraw {
//     token: string;
//     lottery_id: number;
//     cellphone: string;
// }

// class CommandLogic extends BaseLogic {
//     getMainData(data: IMain, callback: (info: ResponseInfo<MainEntity>) => void) {
//         let request = new RequestInfo(`${Config.serviceAddress}/${Config.apiPath.main}`, data, function (res) {
//             res.status = res._response.result.state;
//             res.message = res._response.result.reason;
//             res.success = 200 == res.status ? true : false;

//             if (res.success) {
//                 const data = res._response.data;
//                 if (data) {
//                     res.data = createModel(data);
//                 }
//             }
//             callback(res);
//         });

//         var createModel = function (data: any) {
//             let ntt = new MainEntity();
//             const { token, cdn_domain, background, api_domain, api } = data;

//             ntt.apiCollection = api;
//             ntt.apiDomain = api_domain;
//             ntt.backgroundImage = background;
//             ntt.cdnDomain = cdn_domain;
//             ntt.token = token;
//             return ntt;
//         }

//         this.syncGet(request);
//     }
//     getWinnersData(data: IWinners, callback: (info: ResponseInfo<PrizeEntity[]>) => void) {
//         let request = new RequestInfo(`${Config.serviceAddress}/${Config.apiPath.show}`, data, function (res) {
//             res.status = res._response.result.state;
//             res.message = res._response.result.reason;
//             res.success = 200 == res.status ? true : false;

//             if (res.success) {
//                 const { winner_list } = res._response.data;
//                 if (winner_list) {
//                     const list = winner_list || [];

//                     res.data = createModel(list);
//                 }
//             }
//             callback(res);
//         });
//         this.requestGet(request);

//         var createModel = function (data: [any]) {
//             // Create Model Class And Return
//             var list: PrizeEntity[] = [];

//             data.forEach((v, i) => {
//                 let ntt = new PrizeEntity();
//                 ntt.cellphone = v.cellphone;
//                 ntt.createTime = v.create_time;
//                 if (4 == v.item_lv) {
//                     ntt.prizeGrade = PrizeGrade.thanks;
//                 }
//                 else if (3 == v.item_lv) {
//                     ntt.prizeGrade = PrizeGrade.ten;
//                 }
//                 else if (2 == v.item_lv) {
//                     ntt.prizeGrade = PrizeGrade.fifty;
//                 }
//                 else if (1 == v.item_lv) {
//                     ntt.prizeGrade = PrizeGrade.oneHundredYuan;
//                 }
//                 ntt.prizeName = v.item_name;
//                 list.push(ntt);
//             });
//             return list;
//         }
//     }
//     getPlayData(data: IPlay, callback: (info: ResponseInfo<{ playUrl: string }>) => void) {
//         let request = new RequestInfo(`${Config.serviceAddress}/${Config.apiPath.play}`, data, function (res) {
//             res.status = res._response.result.state;
//             res.message = res._response.result.reason;
//             res.success = 200 == res.status ? true : false;

//             if (res.success) {
//                 const { play_url } = res._response.data;
//                 if (play_url) {
//                     res.data = { playUrl: play_url };
//                 }
//             }
//             callback(res);
//         });
//         this.requestGet(request);
//     }
//     getDrawData(data: IDraw, callback: (info: ResponseInfo<PrizeEntity>) => void) {
//         let request = new RequestInfo(`${Config.serviceAddress}/${Config.apiPath.draw}`, data, function (res) {
//             res.status = res._response.result.state;
//             res.message = res._response.result.reason;
//             res.success = 200 == res.status ? true : false;

//             if (res.success) {
//                 const { prize } = res._response.data;
//                 if (prize) {
//                     const data = prize || {};

//                     res.data = createModel(data);
//                 }
//             }
//             callback(res);
//         });
//         this.requestGet(request);

//         var createModel = function (v: any) {
//             // Create Model Class And Return
//             let ntt = new PrizeEntity();
//             if (4 == v.item_lv) {
//                 ntt.prizeGrade = PrizeGrade.thanks;
//             }
//             else if (3 == v.item_lv) {
//                 ntt.prizeGrade = PrizeGrade.ten;
//             }
//             else if (2 == v.item_lv) {
//                 ntt.prizeGrade = PrizeGrade.fifty;
//             }
//             else if (1 == v.item_lv) {
//                 ntt.prizeGrade = PrizeGrade.oneHundredYuan;
//             }
//             ntt.prizeName = v.item_name;
//             return ntt;
//         }
//     }
// }
// export { CommandLogic }