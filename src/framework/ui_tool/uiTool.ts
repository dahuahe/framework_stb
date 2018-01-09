import { SetInterval } from '../data_tool/dataTool';

/**
 * 走马灯
 * 描述：为HTMLElement对象包装走马灯效果
 * 依赖：无其他依赖
 */
export class Marquee {
    private parentElement: HTMLElement;
    private childrenInnerHTML: string;
    private marqueeElement: HTMLMarqueeElement;
    private status = '';

    constructor(parentElement: HTMLElement) {
        this.parentElement = parentElement;
        this.marqueeElement = document.createElement('marquee');
    }
    active() {
        // 满足滚动条件-内容过多时
        if (this.marqueeElement) {
            this.childrenInnerHTML = this.parentElement.innerHTML;
            this.parentElement.style.whiteSpace = 'nowrap';
            if (this.parentElement.scrollWidth > this.parentElement.clientWidth) {
                this.parentElement.style.position = 'relative';
                this.marqueeElement.style.position = 'absolute';
                this.marqueeElement.style.left = '0px';
                this.marqueeElement.style.top = '0px';

                // 装载
                this.marqueeElement.innerHTML = this.childrenInnerHTML;
                this.parentElement.innerHTML = '';
                this.parentElement.appendChild(this.marqueeElement);

                this.marqueeElement.start();
                this.status = 'active';
            }
            // 恢复暂停状态
            if ('pause' === this.status) {
                this.marqueeElement.start();
            }
        }
    }
    stay() {
        this.status = 'pause';
        this.marqueeElement && this.marqueeElement.stop();
    }
    uninstall() {
        if ('' !== this.status) {
            // 样式
            this.parentElement.style.position = '';
            this.status = '';
            // 卸载
            this.parentElement.innerHTML = this.childrenInnerHTML;
        }
    }
    updateInnerHTML(html: string) {
        this.childrenInnerHTML = html;
    }
}
class MarqueeHTML {
    private readonly timer: number = 30;
    private intervalTimer: SetInterval;
    html: HTMLElement;
    private direction: string;
    htmlWidth = 0;
    htmlLeft = 0;

    private parentElement: HTMLElement;
    private childrenInnerHTML: string;

    constructor(parentElement: HTMLElement, params: { timer: number, direction: 'left', position: 'left' | 'right' | 'center' }) {
        this.parentElement = parentElement;

        this.timer = params.timer;
        this.direction = params.direction;
        this.intervalTimer = new SetInterval(params.timer);

        this.html = document.createElement('div');
        this.html.style.overflow = 'hidden';
        this.html.style.whiteSpace = 'nowrap';
        this.html.style.display = 'block';
        this.html.style.marginLeft = '0px';
    }
    start() {
        this.animation();
    }
    pause() {
        this.intervalTimer.clear();
    }
    private animation() {
        if (this.htmlWidth === 0) {
            this.htmlWidth = this.html.scrollWidth;
        }
        // 确定滚动方案

        // 确定滚动方向

        // 开始滚动
        this.intervalTimer.enable(() => {
            this.htmlLeft -= 2;

            // 循环条件
            if (Math.abs(this.htmlLeft) >= this.htmlWidth) {
                this.htmlLeft = this.parentElement.clientWidth;
            }

            this.html.style.marginLeft = this.htmlLeft + 'px';
        });

    }
    active() {
        this.childrenInnerHTML = this.parentElement.innerHTML;

        this.html.innerHTML = this.childrenInnerHTML;

        this.parentElement.innerHTML = '';
        this.parentElement.appendChild(this.html);

        this.start();
    }
    stay() {
        this.pause();
    }
    uninstall() {
        this.intervalTimer.clear();
        this.parentElement.innerHTML = this.childrenInnerHTML;
    }
    updateInnerHTML(html: string) {
        this.childrenInnerHTML = html;
    }
}
export class CustomMarquee {
    marqueeHTML: MarqueeHTML;

    constructor(parentElement: HTMLElement) {
        this.marqueeHTML = new MarqueeHTML(parentElement, { timer: 30, direction: 'left', position: 'left' })
    }
    active() {
        this.marqueeHTML.active();
    }
    stay() {
        this.marqueeHTML.stay();
    }
    uninstall() {
        this.marqueeHTML.uninstall();
    }
    updateInnerHTML(html: string) {
        this.marqueeHTML.updateInnerHTML(html);
    }
}
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

            if (keyName) {
                ele.className = `${ele.className} ${clasName}`;
            } else {
                return ele.className;
            }
        }
    }
    removeClas = (className: string) => {
        let ele = this.element;
        if (ele)
            ele.className = ele.className.replace(className, "").replace(/(^\s*)/g, "");
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