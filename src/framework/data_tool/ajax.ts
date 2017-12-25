class Setting {
    url: string
    async?: boolean
    method?: string
    data?: object
    success?: Function
    failure?: Function
    constructor() {
    };
}
export class Ajax {

    private opt: Setting;
    constructor(opt: {
        url: string
        async?: boolean
        method?: string
        data?: object
        success?: Function
        failure?: Function
    }) {
        this.opt = opt;
        this.send();
    }
    //执行网络请求
    private send = () => {
        const fn = () => { }
        let opt = this.opt;
        let url = opt.url;
        let { async = true, method = "GET", data = null, success = fn, failure = fn } = opt
        if (method.toUpperCase() === "GET" && data !== null) {
            url += (url.indexOf("?") === -1 ? "?" : "&") + this.charFormat(data);
        }

        let xhr = new XMLHttpRequest()

        xhr.onreadystatechange = () => {
            this.onStateChange(xhr, success, failure)
        }

        // TODO: request error
        xhr.onerror = (e: ErrorEvent) => {
            console.dir(e)
        }

        xhr.open(method, url, async)

        if (method.toUpperCase() === `POST`) {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        }

        xhr.send()
    }
    private onStateChange = (xhr: XMLHttpRequest, success: Function, failure: Function) => {
        if (xhr.readyState === 4) {
            let s = xhr.status
            if (s >= 200 && s < 300) {
                let responseText = xhr.responseText;
                let responseObj = {}
                try {
                    // 兼容解析 ie 8 需要引入json2
                    responseObj = JSON.parse(responseText);

                } catch (error) {
                    // message(error);
                    responseObj = {
                        status: 0,
                        errorMessage: "parse response to json failure"
                    }
                }
                success(responseObj)
            } else {
                failure(xhr)
            }
        }
    }
    charFormat = (obj: any) => {
        let param: string = ``
        for (let key in obj) {
            param += `${key}=${obj[key]}&`
        }
        return param.substring(0, param.length - 1)
    }
}