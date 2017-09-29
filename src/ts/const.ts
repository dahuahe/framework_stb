// 盒子相关属性
const PageTitle = document.title.split('-').length > 1 ? document.title.split('-')[1].toLowerCase() : "";
declare var Authentication: any;
declare var Utility: any;
try {

    Authentication.CTCGetConfig("UserID")
} catch (err) {
    var Authentication
    Authentication = {
        CTCGetConfig(): any {
            return undefined
        }
    }
}
const UserID = Authentication.CTCGetConfig("UserID") || 'youtu0325'
const UserGroupID = Authentication.CTCGetConfig("UserGroupNMB") || ''
const UserToken = Authentication.CTCGetConfig("UserToken") || ''
const EpgGroupID = Authentication.CTCGetConfig("AreaNode") || ''
const STBID = Authentication.CTCGetConfig("STBID") || ''
const STBType = Authentication.CTCGetConfig("STBType") || ''
const TerminalType = Authentication.CTCGetConfig("TerminalType") || ''
const AreaNode = Authentication.CTCGetConfig("AreaNode") || ''
const IP = Authentication.CTCGetConfig("IP") || ''
const MAC = Authentication.CTCGetConfig("MAC") || ''
const CountyID = Authentication.CTCGetConfig("CountyID") || ''
const Version = "game";

// 盒子对象
var Utility;
if (!Utility) {
    Utility = {
        setValueByName(command: string): any {
            return undefined;
        }
    }
}
// 返回launcher
const Util = {
    setValueByName: function () {
        return Utility.setValueByName("exitIptvApp")
    }
};