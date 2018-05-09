/**
 * 编辑作者：张诗涛
 * 创建时间：2018年1月18日12:12:43
 * 更新时间：2018年3月8日 10点00分
 * 功能分类：安徽盒子
 */
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
const STBType = Authentication.CTCGetConfig("STBType") || 'Browser'
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
    /**
     * 安徽
     */
    setValueByName: function () {
        return Utility.setValueByName("exitIptvApp")
    },
    /**
     * 云南
     */
    getDomainUrl: function () {
        return Authentication.CTCGetConfig("EPGDomain");
    }
};

/**
 * 设备配置映射
 * type：厂商 安徽盒子
 * is4K：是否是4k盒子
 * needAnimate：加载页面是否需要动画效果
 * supportSmallWin：是否支持小窗口播放视频
 * supportXiri: 是否支持讯飞语音 （在讯飞功能没有正式上线之前，该处统一设置为false）
 */
var DEV_MAP: any = {
    /**
     * 中兴
     */
    "B760EV3": {
        type: "ZH",
        is4K: false,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: false
    },
    "B760H": {
        type: "ZH",
        is4K: false,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: false
    },
    "B860A": {
        type: "ZH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "B860AV1.1": {
        type: "ZH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "B860AV1.1-T": {
        type: "ZH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "B860AV1.1-T2": {
        type: "ZH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "B860GV1.1": {
        type: "ZH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: false,
        supportXiri: false
    },
    /**
     * 创维
     */
    "E8205": {
        type: "CW",
        is4K: false,
        needAnimate: false,
        supportSmallWin: false,
        supportXiri: false
    },
    "E910": {
        type: "CW",
        is4K: false,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: false
    },
    "E909": {
        type: "CW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: false,
        supportXiri: true
    },
    "E900": {
        type: "CW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true, // 小窗不能切换到全屏；小窗始终在页面上面
        supportXiri: true
    },
    "E900-s": {
        type: "CW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "E910V10D": {
        type: "CW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: false,
        supportXiri: true
    },
    "E910V10C": {
        type: "CW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: false,
        supportXiri: true
    },
    "E950": {
        type: "CW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: false,
        supportXiri: true
    },
    /**
     * 数码视讯
     * 的两款盒子，不支持Velocity来做页面加载的上滑效果,所以就算开启了动画也要把上滑效果屏蔽掉
     */
    "Q5": {
        type: "SMSX",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: false
    },
    "S6CT": {
        type: "SMSX",
        is4K: false,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: false
    },
    /**
     * 烽火 HG680
     */
    "HG680": {
        type: "FH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    "HG680-J": {
        type: "FH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 烽火 MR820
     */
    "MR820": {
        type: "FH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 烽火 MR622
     */
    "MR622": {
        type: "FH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 海信
     */
    "IP906H_36T1": {
        type: "HX",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 天翼 TY1208-Z
     */
    "TY1208-Z": {
        type: "TY",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 九州 PTV-8098
     */
    "PTV-8098": {
        type: "JZ",
        is4K: true,
        needAnimate: true,
        supportSmallWin: false,
        supportXiri: true
    },
    /**
     * 九州 PTV-8508
     */
    "PTV-8508": {
        type: "JZ",
        is4K: false,
        needAnimate: true,
        supportSmallWin: false,
        supportXiri: false
    },
    "EC6108V9C": {
        type: "HW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "EC6108V9_pub_ahwdx": {
        type: "HW",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 四创
     */
    "SCIP906H_R": {
        type: "SC",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 长虹
     */
    "IHO-3000S": {
        type: "CH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    "GP920": {
        type: "CH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 中通服
     */
    "YiX-G110": {
        type: "CH",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 器贸
     */
    "AHQM-RG01": {
        type: "QM",
        is4K: true,
        needAnimate: false,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 贝尔
     */
    "RG020ET-CA": {
        type: "CH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "G-120WT-P": {
        type: "CH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 瑞斯康达
     */
    "HT660": {
        type: "CH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    "HT670-GP-V": {
        type: "CH",
        is4K: true,
        needAnimate: true,
        supportSmallWin: true,
        supportXiri: true
    },
    /**
     * 浏览器
     */
    "Browser": {
        type: "PC",
        is4K: true,
        needAnimate: true,
        supportSmallWin: false,
        supportXiri: false
    }
};
function hasSupportSmallWin(stbType: string) {
    if (DEV_MAP[stbType] && !DEV_MAP[stbType].supportSmallWin) {
        return false;
    } else {
        return true;
    }
}
function hasDesignatedBox(stbType: string, stbName: string) {
    if (DEV_MAP[stbType] && stbName == DEV_MAP[stbType].type) {
        return true;
    } else {
        return false;
    }
}