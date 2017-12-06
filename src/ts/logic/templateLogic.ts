// /**
//  * 编辑作者：张诗涛
//  * 创建时间：2017年11月6日15:46:27
//  * 功能分类：视频数据逻辑层
//  */
// import { BaseLogic, ResponseInfo, RequestInfo } from '../logic/baseLogic';
// import {  } from "../model/model"
// import { Config } from '../config';

// interface IRecommend {
//     guid: number, fetch: string, limit: number, token: string
// }

// class InvitationLogic extends BaseLogic {
//     /**
//      * 推荐数据
//      * @param data 请求参数
//      * @param callback 数据响应
//      * @param <info: ResponseInfo<string>> 返回对象数据类型
//      */
//     getRecommendList(data: IRecommend, callback: (info: ResponseInfo<[InvitationEntity]>) => void) {
// let request = new RequestInfo(`${Config.serviceAddress}/${Config.apiPath.correlationRecommend.replace("{id}", `${data.id}`)}`, data, function (res) {
//     res.status = res._response.statusCode;
//     res.message = res._response.errMsg;
//     res.success = false;

//     if (res._success) {
//         const { api } = res._response.data;
//         if (api) {
//             const list = api.result || [];

//             res.message = api.message;
//             res.data = createModel(list);
//         }

//         res.success = res.data && res.data.length ? true : false;
//     }
//     callback(res);
// });
//         this.requestGet(request);

//         var createModel = function (data) {
//             // Create Model Class And Return
//             var list = [];

//             data.forEach((v, i) => {
//                 var invi = new InvitationEntity();
//                 var video = new VideoEntity();
//                 var owner = new OwnerEntity();
//                 // 文章信息
//                 invi.guid = v.guid;
//                 invi.id = v.id;
//                 invi.title = v.title;
//                 invi.content = v.content;
//                 invi.createTime = v.create_at;
//                 invi.videoEntity = video;
//                 invi.ownerEntity = owner;
//                 // 图片列表
//                 var pictureList = v.attachments.picture;
//                 pictureList.forEach((v_1, i_1) => {
//                     var p = new PictureEntity();
//                     p.height = v_1.parameters.height;
//                     p.width = v_1.parameters.width;
//                     p.url = v_1.url;
//                     invi.pictureEntityList.push(p);
//                 });
//                 // 视频
//                 video.pictureUrl = v.attachments.video.picture_url;
//                 video.width = v.attachments.video.parameters.width;
//                 video.height = v.attachments.video.parameters.height;
//                 video.resolution = v.attachments.video.resolution;
//                 video.duration = v.attachments.video.duration;
//                 video.videoID = v.attachments.video.video_id;
//                 // 用户
//                 owner.id = v.owner.id;
//                 owner.nickname = v.owner.nickname;
//                 owner.gender = v.owner.gender;
//                 owner.headPortrait = v.owner.avatar;
//                 owner.birthday = v.owner.birthday;
//                 owner.cellphone = v.owner.cellphone;
//                 owner.birthday = v.owner.birthday;

//                 list.push(invi);
//             });
//             return list;
//         }
//     }
// }
// export { InvitationLogic }