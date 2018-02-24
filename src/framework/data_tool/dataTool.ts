/**
 * 编辑作者：张诗涛
 * 创建时间：2017年11月17日11:03:44
 * 功能分类：数据抽象模块
 *  * 更新日志：
 *          时间：2017年11月15日15:03:43
 *          内容：重构 Extend 调用方式为构造函数
 * /
 * 更新日志：FormatTime
 *          时间：2017年11月28日11:07:33
 *          内容：重构 FormatTime 调用方式为构造函数
/*
/**
 * 导航工具
 * 描述：管理本站点或第三方来源地址
 * 依赖：Cookie class
 */
export class PageSource {
    private cookie: Cookie;
    private cookieName: string;
    constructor(cookieName: string) {
        this.cookieName = cookieName;
        this.cookie = new Cookie(this.cookieName);
    }
    saveToLocal(url?: string) {
        let cookie = this.cookie;
        if (url) {
            let referrer = cookie.getCookie();
            referrer || cookie.setCookie(url);
        } else {
            let referrer = cookie.getCookie();
            referrer || cookie.setCookie(document.referrer);
        }
    }
    takeToLocal() {
        return this.cookie.getCookie();
    }
    removeToLocal(): string {
        let url = this.cookie.getCookie();
        this.cookie.clearCookie();
        return url;
    }
}
export class Cookie {
    private key: any;
    constructor(key: string) {
        this.key = key;
    }
    setCookie(value: string, params?: any) {
        this.cookie(this.key, value, params);
    }
    getCookie() {
        return this.cookie(this.key);
    }
    clearCookie() {
        this.cookie(this.key, null);
    }
    private cookie = (key: string, value?: string, params?: any) => {
        if (typeof value !== 'undefined') {
            var expires = '';
            params = params || {};
            if (value === null) {
                value = '';
                params.expires = -1;
            }
            if (params.expires) {
                var date: Date = new Date();
                date.setTime(date.getTime() + (params.expires * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            var path = params.path ? '; path=' + params.path : '';
            var domain = params.domain ? '; domain=' + params.domain : '';
            var secure = params.secure ? '; secure' : '';
            document.cookie = [key, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else {
            var cookies;
            if (document.cookie && document.cookie !== '') {
                cookies = document.cookie.match(new RegExp('(^| )' + key + '=([^;]*)(;|$)'));
                if (cookies) {
                    return decodeURIComponent(cookies[2]);
                } else {
                    return null;
                }
            }
        }
    }
}
/*
 * 
 * 扩展数据结构
 */
export class Extend {
    private deep: any;
    private target: any;
    private options: any;
    constructor(deep: any, target: any, options: any) {
        this.deep = deep;
        this.target = target;
        this.options = options;

        var copyIsArray: any;
        var toString = Object.prototype.toString;
        var hasOwn = Object.prototype.hasOwnProperty;

        var class2type: any = {
            '[object Boolean]': 'boolean',
            '[object Number]': 'number',
            '[object String]': 'string',
            '[object Function]': 'function',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object RegExp]': 'regExp',
            '[object Object]': 'object'
        };

        var type = function (obj: any) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
        };

        var isWindow = function (obj: any) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        };

        var isArray = Array.isArray || function (obj) {
            return type(obj) === "array";
        };

        var isPlainObject = function (obj: any) {
            if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
                return false;
            }

            if (obj.constructor && !hasOwn.call(obj, "constructor")
                && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }

            var key;
            for (key in obj) {
            }

            return key === undefined || hasOwn.call(obj, key);
        };

        var extend = function (deep: any, target: any, options: any) {
            for (let name in options) {
                let src = target[name];
                let copy = options[name];

                if (target === copy) { continue; }

                if (deep && copy
                    && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                    let clone;
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && isArray(src) ? src : [];

                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    target[name] = extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
            return target;
        };
        return extend(this.deep, this.target, this.options);
    }
}
export class ParseUrl {
    private readonly search: string;
    constructor(search: string) {
        this.search = search;
    }
    getParam() {
        return this.decodeURL();
    }
    getDecodeURI() {
        return this.decodeURL(decodeURI);
    }
    getDecodeURIComponent() {
        return this.decodeURL(decodeURIComponent);
    }
    private decodeURL(decode?: any) {
        let search = this.search;

        if (!decode) {
            decode = function (str: string) {
                return str;
            }
        }

        //返回当前 URL 的查询部分（问号 ? 之后的部分）。
        let urlParameters = location.search;
        if (search) urlParameters = search;
        //声明并初始化接收请求参数的对象
        var requestParameters: any = {};
        //如果该求青中有请求的参数，则获取请求的参数，否则打印提示此请求没有请求的参数
        if (urlParameters.indexOf('?') != -1) {
            //获取请求参数的字符串
            var parameters = decode(urlParameters.substr(1));
            //将请求的参数以&分割中字符串数组
            let parameterArray = parameters.split('&');
            //循环遍历，将请求的参数封装到请求参数的对象之中
            for (let i = 0; i < parameterArray.length; i++) {
                requestParameters[parameterArray[i].split('=')[0]] = (parameterArray[i].split('=')[1]);
            }
            //console.info('theRequest is =====', requestParameters);
        }
        return requestParameters;
    }
}
export class FormatUrl {
    private url: any;
    private params: any;
    constructor(url: string, params: Object) {
        this.url = url;
        this.params = params;
    }
    getURL() {
        return this.encodeURL();
    }
    getEncodeURI() {
        return this.encodeURL(encodeURI);
    }
    getEncodeURIComponent() {
        return this.encodeURL(encodeURIComponent);
    }
    private encodeURL(encode?: any): string {
        let url = this.url;
        let params = this.params;

        if (!encode) {
            encode = function (str: string) {
                return str;
            }
        }

        // 初始化当前参数
        let charIdx = url.indexOf("?");
        if (charIdx != -1) {
            url = url.substr(0, charIdx);
        }

        let newUrl = "?";
        if (params) {
            for (let item in params) {
                if (params.hasOwnProperty(item)) {
                    var element = encode(params[item]);
                    newUrl += item + '=' + element + '&'
                }
            }
            url += newUrl.substr(0, newUrl.length - 1);
        }
        return url || null;
    }
}
export class Json<T>{
    public serializ = (content: (string | object)): string => {
        return JSON.stringify(content);
    }
    public deSerializ = (content: string): T => {
        let result = null;
        if (content) {
            result = JSON.parse(content);
        }
        return result;
    }
}
export class SetTimeout {
    private timer: any;
    private timeOut: any;

    constructor(time = 0) {
        if (time >= 1) {
            this.timeOut = time;
        }
    }
    enable = (action: Function) => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            clearTimeout(this.timer);
            action();
        }, this.timeOut);
    }
    clear = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}
export class SetInterval {
    private timer: any;
    private timeOut: any;
    constructor(time = 0) {
        if (time >= 1) {
            this.timeOut = time;
        }
    }
    enable = (method: Function) => {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            method();
        }, this.timeOut);
    }
    clear = () => {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
export class FuncLock {
    private _lock = false;
    constructor() {
    }
    enable = (method: Function, failure?: Function) => {
        if (!this._lock) {
            this._lock = true;
            method();
        } else {
            failure && failure();
        }
    }
    lock = () => {
        this._lock = true;
    }
    clear = () => {
        this._lock = false;
    }
}
export class Guid {
    getGuid = (): string => {
        return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }
}
export class Clone<T>{
    private object: any;
    constructor(object: Array<object> | object) {
        this.object = object;
    }
    getResult = (): T => {
        return this.clone(this.object);
    }
    private clone(object: Array<object> | object | any): any {
        let a: any;
        if (object instanceof Array) {
            a = [];
            for (let i = 0; i < object.length; i++) {
                a.push(this.clone(object[i]))
            }
        } else if (object instanceof Function) {
            return eval('(' + object.toString() + ')')
        } else if (object instanceof Object) {
            a = {};
            for (let i in object) {
                a[i] = this.clone(object[i])
            }
        } else {
            return object;
        }
        return a;
    }
}
export function FormatTime(seconds: number, format?: string) {
    let hours: any, mins: any, secs: any;
    format = format || 'hh:mm:ss';

    hours = Math.floor(seconds / 3600);
    mins = Math.floor((seconds % 3600) / 60);
    secs = Math.floor((seconds % 3600) % 60);

    hours = hours < 10 ? ("0" + hours) : hours;
    mins = mins < 10 ? ("0" + mins) : mins;
    secs = secs < 10 ? ("0" + secs) : secs;
    return format.replace('hh', hours).replace('mm', mins).replace('ss', secs);
}

export class ConvertKey {
    constructor() {

    }

    getFigure(keyCode: number) {
        let val = -1;
        if (96 === keyCode) {
            val = 0;
        }
        else if (97 === keyCode) {
            val = 1;
        }
        else if (98 === keyCode) {
            val = 2;
        }
        else if (99 === keyCode) {
            val = 3;
        }
        else if (100 === keyCode) {
            val = 4;
        }
        else if (101 === keyCode) {
            val = 5;
        }
        else if (102 === keyCode) {
            val = 6;
        }
        else if (103 === keyCode) {
            val = 7;
        }
        else if (104 === keyCode) {
            val = 8;
        }
        else if (105 === keyCode) {
            val = 9;
        }
        return val;
    }
}
// Math.ceil() 返回大于等于数字参数的最小整数(取整函数)，对数字进行上舍入
// Math.floor() 返回小于等于数字参数的最大整数，对数字进行下舍入
// Math.round() 返回数字最接近的整数，四舍五入
export var Random = {
    /**
     * startAt-maxItem的随机整数，包含startAt但不包含maxItem
     */
    scope(startAt: any, maxItem: any) {
        let differ = maxItem - startAt;
        Math.random() * differ;
        let num = Math.random() * differ + startAt;
        return parseInt(num, 10);
    },
    /**
     * 几率获取函数
     * @param percent 1 - 10 对应几率百分比
     */
    raffle(percent: any): boolean {
        let retu = false;
        percent = Math.round(percent);

        let num = Random.scope(1, 10);

        if (num <= percent) {
            retu = true;
        }

        return retu;
    }
}
// 通用键码
export const enum Key {
    Backspace = 8,
    Enter = 13,

    PageUp = 33,
    PageDown = 34,

    Left = 37,
    Up = 38,
    Right = 39,
    Down = 40,

    Zero = 48,
    One = 49,
    Two = 50,
    Three = 51,
    Four = 52,
    Five = 53,
    Six = 54,
    Seven = 55,
    Eight = 56,
    Nine = 57,

    VolumePlus = 259,
    VolumeMinus = 260,
    Mute = 91,

    //菜单键的键值有多个
    Menu1 = 272,
    Menu2 = 277,
    Menu3 = 280,

    // 会被转义
    // Iptv = 0x0300
    Home = 181,
    // 会被转义
    // Iptv = 0x0300
    Pause = 263
}
// 盒子内置键码
// export const enum Key {
//     Backspace = 4,
//     Enter = 23,

//     PageUp = 92,
//     PageDown = 93,

//     Left = 21,
//     Up = 19,
//     Right = 22,
//     Down = 20,

//     Zero = 7,
//     One = 8,
//     Two = 9,
//     Three = 10,
//     Four = 11,
//     Five = 12,
//     Six = 13,
//     Seven = 14,
//     Eight = 15,
//     Nine = 16,

//     VolumePlus = 24,
//     VolumeMinus = 25,
//     Mute = 164,

//     //菜单键的键值有多个
//     Menu1 = 272,
//     Menu2 = 277,
//     Menu3 = 280,

//     // 会被转义
//     // Iptv = 0x0300
// }