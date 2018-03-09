import { SetInterval, SetTimeout } from '../data_tool/dataTool';

/**
 * 对 HTMLElement 的封装
 */
export class HElement {
    private eleName: string | HTMLElement;
    private faterEle: any;

    public readonly element: HTMLElement;

    constructor(eleName: string | HTMLElement, fatherEle?: HTMLDocument) {

        this.eleName = eleName;
        this.faterEle = fatherEle;

        let _getHtmlElement = (eleName: string) => {
            if (!eleName)
                return null;
            let element = null;
            //接收的document类型(可扩展)
            let char = eleName.substring(0, 1);
            let charV = eleName.substring(1, eleName.length);

            if (char === '#') {
                element = document.getElementById(charV);
            } else if (char === '.') {
                element = document.getElementsByClassName(charV)[0];
            } else {
                // 根据属性名获取
                let charIdx = eleName.indexOf('=');
                if (charIdx !== -1 && charIdx > 0) {
                    let charPrefix = eleName.substr(1, charIdx - 1);
                    let charSuffix = eleName.substr(charIdx + 1, (eleName.length - charPrefix.length) - 3);

                    let items = document.getElementsByTagName('*');
                    for (let i = 0; i < items.length; i++) {
                        let ele = items[i];
                        let name = ele.getAttribute(charPrefix);
                        if (name === charSuffix) {
                            element = ele;
                        }
                    }
                }
            }

            return element || null;
        }

        let ele: HElement;
        let _eleName: string;
        let _element: HTMLElement | Element;

        if (typeof eleName === 'string') {
            _eleName = eleName;
            _element = _getHtmlElement(eleName);
        } else {
            _eleName = eleName.id;
            _element = eleName;
        }
        if (!_element) {
            // return null;
        } else {
            this.element = <HTMLElement>_element;
        }
    }
    clas = (clasName?: string) => {
        let ele = this.element;
        if (ele) {
            let keyName = clasName || null;

            if (keyName && keyName.trim()) {
                let arr = ele.className.split(" ") || [], length = arr.length;
                for (let i = 0; i < length; i++) {
                    const item = arr[i];
                    if (item == clasName) {
                        delete arr[i];
                        break;
                    }
                }
                // 添加
                arr.push(clasName);
                ele.className = arr.join(" ").trim();
            } else {
                return ele.className;
            }
        }
    }
    removeClas = (clasName: string) => {
        let ele = this.element;
        if (ele) {
            let keyName = clasName || null;

            if (keyName && keyName.trim()) {
                let arr = ele.className.split(" ") || [], length = arr.length;
                for (let i = 0; i < length; i++) {
                    const item = arr[i];
                    if (item == clasName) {
                        delete arr[i];
                        ele.className = arr.join(" ").trim();
                        break;
                    }
                }
            } else {
                return ele.className;
            }
        }
    }
    html = (html?: string) => {
        let _element = this.element;
        if (html || html === '' || html === "") {
            _element.innerHTML = html;
        } else {
            return _element.innerHTML;
        }
    }
    text = (text?: string) => {
        let _element = this.element;
        if (text || text === '' || text === "") {
            _element.innerText = text;
        } else {
            return _element.innerText;
        }
    }
    style = (propName: string, value?: string) => {
        let ele = this.element;
        let val = value || null;
        if (!ele.hasAttribute('style')) {
            ele.setAttribute('style', '');
        }
        if (!val) {
            return ele.style.getPropertyValue(propName);
        } else {
            ele.style.setProperty(propName, value);
        }
    }
    removeStyle = (propertyName?: string) => {
        let ele = this.element;
        ele && ele.style.removeProperty(propertyName);
    }
    attr = (name: string, value?: string) => {
        let ele = this.element;
        let val = value || null;

        if (!val) {
            return ele.getAttribute(name);
        } else {
            ele.setAttribute(name, value);
        }
    }
    removeAttr = (name?: string) => {
        let ele = this.element;
        ele && ele.removeAttribute(name);
    }
    show = () => {
        let ele = this.element;
        if (!ele.hasAttribute('style')) {
            ele.setAttribute('style', '');
        }
        ele.style.setProperty('display', 'block');
    }
    hide = () => {
        let ele = this.element;
        if (!ele.hasAttribute('style')) {
            ele.setAttribute('style', '');
        }
        ele.style.setProperty('display', 'none');
    }
    hasHide = () => {
        let ele = this.element;
        if (!ele.hasAttribute('style')) {
            ele.setAttribute('style', '');
        }
        return ele.style.getPropertyValue('display') === 'none' ? true : false;
    }
    hidden = () => {
        let ele = this.element;
        if (!ele.hasAttribute('style')) {
            ele.setAttribute('style', '');
        }
        ele.style.setProperty('visibility', 'hidden');
    }
    visible = () => {
        let ele = this.element;
        if (!ele.hasAttribute('style')) {
            ele.setAttribute('style', '');
        }
        ele.style.setProperty('visibility', 'visible');
    }
    hasHidden = () => {
        let ele = this.element;
        if (!ele.hasAttribute('style')) {
            ele.setAttribute('style', '');
        }
        return ele.style.getPropertyValue('visibility') === 'hidden' ? true : false;
    }
    hasClass = (clasName: string) => {
        let curClsName = this.element.className || "";
        let keyName = clasName || null;

        if (keyName && curClsName) {
            return curClsName.indexOf(clasName) === -1 ? false : true;
        } else {
            return false;
        }
    }
}
/**
 * 上下滚动效果封装
 */
export class VerticalRoll {
    private readonly ele: HElement;
    private readonly height: number;
    private readonly length: number;
    private marginTop: number;
    constructor(info: { ele: HElement, height: number, lenght: number }) {
        this.ele = info.ele;
        this.height = info.height;
        this.marginTop = 0;
        this.length = info.lenght;
    }
    toCeil() {
        if (this.ele.element.scrollHeight > this.height) {
            this.marginTop += this.length;
            let full = Math.round(this.ele.element.scrollHeight);

            if (this.marginTop > 0) {
                this.marginTop = 0;
            }

            this.ele.style("margin-top", this.marginTop + 'px');
        }
    }
    toFloor() {
        if (this.ele.element.scrollHeight > this.height) {
            this.marginTop -= this.length;
            let full = -Math.round(this.ele.element.scrollHeight);
            let difference = full + this.height;

            if (this.marginTop < difference) {
                this.marginTop = difference;
            }

            this.ele.style("margin-top", this.marginTop + 'px');
        }
    }
}
/**
 * 左右滚动效果封装
 */
export class HorizontalRoll {
    private readonly box: HElement;
    private readonly marquee: HElement;
    private innerHtml: string;

    private marginLeft = 0;
    private out = new SetTimeout(200);
    private timer = new SetInterval(30);

    constructor(ele: HElement) {
        this.box = ele;
        this.marquee = new HElement(document.createElement('div'));
    }
    enable() {
        this.marginLeft = 0;
        this.out.clear();
        this.timer.clear();

        let ele = this.box.element, scrollWidth = ele.scrollWidth, clientWidth = ele.clientWidth, isFirst = true;
        let marquee = <HTMLMarqueeElement>this.marquee.element;
        this.innerHtml = this.box.html();
        this.box.style("white-space", 'nowrap');

        if (ele.scrollWidth > ele.clientWidth) {

            this.box.style("position", 'relative');
            this.marquee.attr('style', "position:absolute;left:0;top:0;");

            this.out.enable(() => {
                this.timer.enable(() => {
                    this.marginLeft -= 2;
                    if ((-scrollWidth) > this.marginLeft) {
                        if (!isFirst) {
                            this.marginLeft = clientWidth;
                        } else {
                            isFirst = false;
                        }
                    }
                    this.marquee.style('left', `${this.marginLeft}px`);
                });
            });

            // 装载
            this.marquee.html(this.innerHtml);
            this.box.html("");
            ele.appendChild(marquee);
        }
    }
    disable() {
        // 卸载
        this.marginLeft = 0;
        this.out.clear();
        this.timer.clear();
        this.box.html(this.innerHtml);
    }
}
