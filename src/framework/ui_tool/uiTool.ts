
/**
 * 更新时间：2018年4月12日 14点39分
 * 模块分类：HTML View 插件
 * 模块说明：以 HTMLElement 为基础，将常用动作抽象为多个模块进行管理复用
 */
import { SetInterval, SetTimeout } from '../data_tool/dataTool';

/**
 * 对 HTMLElement 的封装
 */
export class HElement implements IHElement {
    private readonly eles: HTMLElement[] = [];

    public readonly length: number = 0;

    constructor(eleName: string);
    constructor(htmlElement: HTMLElement);
    constructor(htmlElements: HTMLElement[]);
    constructor(eleName: string | HTMLElement | HTMLElement[]) {

        let getHtmlElements = (eleName: string): HTMLElement[] => {
            if (!eleName)
                return [];
            let eles: HTMLElement[] = [];
            //接收的document类型(可扩展)
            let char = eleName.substring(0, 1);
            let charV = eleName.substring(1, eleName.length);

            if (char === '#') {
                let ele = document.getElementById(charV);
                if (ele) {
                    eles.push(document.getElementById(charV));
                }
            } else if (char === '.') {
                let data = document.getElementsByClassName(charV), len = data.length;
                for (let i = 0; i < len; i++) {
                    eles.push(<HTMLElement>data.item(i));
                }
            }
            return eles;
        }

        let name: string;
        let eles: HTMLElement[] = [];

        if (typeof eleName === 'string') {
            name = eleName;
            eles = getHtmlElements(eleName);
        }
        else if (eleName instanceof Array) {
            eles = eleName;
        }
        else {
            name = eleName.id;
            eles.push(eleName);
        }

        if (eles && eles.length) {
            this.length = eles.length;
            this.eles = eles;
        }
    }
    addClass(clasName: string): this {
        let eles = this.eles;
        if (eles && eles.length) {
            let keyName = clasName || null;

            if (keyName && keyName.trim()) {

                let data = eles;

                data.forEach((v) => {

                    let arr = v.className.split(" ") || [], len_2 = arr.length;
                    for (let i_2 = 0; i_2 < len_2; i_2++) {
                        const item = arr[i_2];
                        if (item == clasName) {
                            delete arr[i_2];
                            break;
                        }
                    }
                    // 添加
                    arr.push(clasName);
                    v.className = arr.join(" ").trim();
                });
            }
        }
        return this;
    }
    removeClass(): this;
    removeClass(clasName: string): this;
    removeClass(clasName?: string): this {
        let eles = this.eles;
        if (eles && eles.length) {
            let keyName = clasName || null;

            if (keyName && keyName.trim()) {

                let data = eles;

                data.forEach((v) => {

                    let arr = v.className.split(" ") || [], len_2 = arr.length;
                    for (let i = 0; i < len_2; i++) {
                        const item = arr[i];
                        if (item == clasName) {
                            delete arr[i];
                            v.className = arr.join(" ").trim();
                            break;
                        }
                    }

                });

            } else {
                eles.forEach((v) => {
                    v.className = "";
                });
            }
        }
        return this;
    }
    html(): string;
    html(html: string): this;
    html(html?: string): this | string {
        let eles = this.eles;
        if (eles && eles.length) {
            if (html || html === '' || html === "") {
                eles.forEach((v) => {
                    v.innerHTML = html;
                });
            } else {
                return eles[0].innerHTML;
            }
        }
        return this;
    }
    text(): string;
    text(text: string): this;
    text(text?: string): this | string {
        let eles = this.eles;
        if (text || text === '' || text === "") {
            eles.forEach((v) => {
                v.innerText = text;
            });
            return this;
        } else {
            return eles[0].innerText;
        }
    }
    style(propName: string): string;
    style(propName: string, value: string): this;
    style(propName: string, value?: string): this | string {
        let eles = this.eles;

        if (eles && eles.length) {

            if (undefined === value) {
                return eles[0].style.getPropertyValue(propName);
            } else {

                eles.forEach((v) => {

                    if (!v.hasAttribute('style')) {
                        v.setAttribute('style', '');
                    }

                    v.style.setProperty(propName, value);
                });
            }
        }
        return this;
    }
    removeStyle(): this;
    removeStyle(propertyName: string): this;
    removeStyle(propertyName?: string) {
        let eles = this.eles;
        if (eles && eles.length) {

            if (undefined === propertyName) {
                eles.forEach((v) => {
                    v.setAttribute("style", "");
                });
            } else {
                eles.forEach((v) => {
                    v.style.removeProperty(propertyName);
                });
            }
        }
        return this;
    }
    attr(name: string): string;
    attr(name: string, value: string): this;
    attr(name: string, value?: string): this | string {
        let eles = this.eles;

        if (undefined === value) {
            return eles[0].getAttribute(name);
        } else {
            eles.forEach((v) => {
                v.setAttribute(name, value);
            });
        }
        return this;
    }
    removeAttr(name: string): this {
        let eles = this.eles;
        eles.forEach((v) => {
            v.removeAttribute(name);
        });
        return this;
    }
    show(): this {
        let eles = this.eles;
        eles.forEach((v) => {
            if (!v.hasAttribute('style')) {
                v.setAttribute('style', '');
            }
            v.style.setProperty('display', 'block');
        });
        return this;
    }
    hide(): this {
        let eles = this.eles;
        eles.forEach((v) => {
            if (!v.hasAttribute('style')) {
                v.setAttribute('style', '');
            }
            v.style.setProperty('display', 'none');
        });
        return this;
    }
    hidden(): this {
        let eles = this.eles;
        eles.forEach((v) => {
            if (!v.hasAttribute('style')) {
                v.setAttribute('style', '');
            }
            v.style.setProperty('visibility', 'hidden');
        });
        return this;
    }
    visible(): this {
        let eles = this.eles;
        eles.forEach((v) => {
            if (!v.hasAttribute('style')) {
                v.setAttribute('style', '');
            }
            v.style.setProperty('visibility', 'visible');
        });
        return this;
    }
    hasClass(clasName: string): boolean {
        let name = this.eles[0].className || "";

        if (clasName && name) {
            return name.indexOf(clasName) === -1 ? false : true;
        } else {
            return false;
        }
    }
    children(): IHElement;
    children(keyword: string): IHElement;
    children(keyword?: string): IHElement {

        let eles = this.eles, retuList: HTMLElement[] = [], tagName: string, className: string;

        if (keyword) {

            keyword = keyword.replace(/\s/g, "");

            tagName = keyword.toUpperCase(), className = "." === keyword.substr(0, 1) ? keyword.substr(1, keyword.length) : "";

        }

        eles.forEach((v) => {
            let data = v.childNodes, len = data.length, item: any;

            // nodeType
            for (let i = 0; i < len; i++) {
                item = data[i];
                if (item.nodeType === 1) {
                    // all children node
                    if (undefined === keyword) {
                        retuList.push(item);
                    }
                    // className
                    else if (className) {
                        if (item.className && className === item.className) {
                            retuList.push(item);
                        }
                    }
                    // assign type node
                    else {
                        // tag name
                        if (tagName === item.tagName) {
                            retuList.push(item);
                        }
                    }
                }
            }
        });
        return new HElement(retuList);
    }
    eq(index: number): IHElement {
        return new HElement(this.eles[index]);
    }
    get(index: number): HTMLElement {
        return this.eles[index];
    }
}
/**
 * 上下滚动效果封装（流）
 */
export class VerticalFlowRoll {
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
        if (this.ele.get(0).scrollHeight > this.height) {
            this.marginTop += this.length;

            if (this.marginTop > 0) {
                this.marginTop = 0;
            }

            this.ele.style("margin-top", this.marginTop + 'px');
        }
    }
    toFloor() {
        if (this.ele.get(0).scrollHeight > this.height) {
            this.marginTop -= this.length;
            let full = -Math.round(this.ele.get(0).scrollHeight);
            let difference = full + this.height;

            if (this.marginTop < difference) {
                this.marginTop = difference;
            }

            this.ele.style("margin-top", this.marginTop + 'px');
        }
    }
    isRoll() {
        return this.ele.get(0).scrollHeight > this.height;
    }
    isCeil() {
        if (this.ele.get(0).scrollHeight > this.height) {
            if (this.marginTop >= 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    isFloor() {
        if (this.ele.get(0).scrollHeight > this.height) {
            let full = -Math.round(this.ele.get(0).scrollHeight);
            let difference = full + this.height;

            if (this.marginTop <= difference) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}
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
        if (this.ele.get(0).scrollHeight > this.height) {
            // 不足一步不处理
            if ((this.marginTop + this.length) > 0) {

            } else {
                this.marginTop += this.length;
                this.ele.style("margin-top", this.marginTop + 'px');
            }
        }
    }
    toFloor() {
        if (this.ele.get(0).scrollHeight > this.height) {

            let full = -Math.round(this.ele.get(0).scrollHeight);
            let difference = full + this.height;
            // 不足一步不处理
            if ((this.marginTop - this.length) < difference) {

            } else {
                this.marginTop -= this.length;
                this.ele.style("margin-top", this.marginTop + 'px');
            }
        }
    }
    isRoll() {
        return this.ele.get(0).scrollHeight > (this.height + this.length);
    }
    isCeil() {
        if (this.ele.get(0).scrollHeight > this.height) {
            if (this.marginTop >= 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    isFloor() {
        if (this.ele.get(0).scrollHeight > this.height) {
            let full = -Math.round(this.ele.get(0).scrollHeight);
            let difference = full + this.height;

            if (this.marginTop <= difference) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}
export class VerticalVisualRangeRoll {
    private readonly ele: HElement;
    private readonly height: number;
    private readonly length: number;
    private marginTop: number;

    private rollCeil = 0; // 允许混动范围
    private rollFloor = 0; // 允许滚动范围
    private serial = 0;// 当前序号

    constructor(info: { ele: HElement, height: number, lenght: number }) {
        this.ele = info.ele;
        this.height = info.height;
        this.marginTop = 0;
        this.length = info.lenght;

        this.rollCeil = 0;
        this.rollFloor = Math.floor(this.height / this.length) - 1;
    }
    toCeil() {
        if (this.ele.get(0).scrollHeight > this.height) {

            let full = -Math.round(this.ele.get(0).scrollHeight);
            let difference = full + this.height;
            // 不足一步不处理

            // 是否已滚动到分界线（上）
            if ((this.marginTop + this.length) <= 0) {
                // 可视区域内滚动
                if (this.serial > this.rollCeil) {
                    // console.log("可视区域内滚动")
                }
                // 非可视区内滚动
                else {
                    // console.log("非可视区内滚动")
                    this.marginTop += this.length;
                    this.ele.style("margin-top", this.marginTop + 'px');

                    this.rollCeil--;
                    this.rollFloor--;
                }
            } else {
                // 不允许滚动
                // console.log("不允许滚动");
            }
            if ((this.serial - 1) >= this.rollCeil) {
                this.serial--;
            } else {
                // console.log("序号到达顶部");
            }
        }
    }
    toFloor() {
        if (this.ele.get(0).scrollHeight > this.height) {

            let full = -Math.round(this.ele.get(0).scrollHeight);
            let difference = full + this.height;
            // 不足一步不处理

            // 是否已滚动到分界线（下）
            if ((this.marginTop - this.length) >= difference) {
                // 允许滚动

                // 可视区域内滚动
                if (this.serial < this.rollFloor) {
                    // console.log("可视区域内滚动")

                }
                // 非可视区内滚动
                else {
                    // console.log("非可视区内滚动");
                    this.marginTop -= this.length;
                    this.ele.style("margin-top", this.marginTop + 'px');

                    this.rollCeil++;
                    this.rollFloor++;
                }

            } else {
                // 不允许滚动
                // console.log("不允许滚动")
            }
            if ((this.serial + 1) <= this.rollFloor) {
                this.serial++;
            } else {
                // console.log("序号到达底部");
            }
        }
    }
    isRoll() {
        return this.ele.get(0).scrollHeight > (this.height + this.length);
    }
    toSerial(index: number) {
        if (index > this.serial) {
            let difference = (index - this.serial);
            for (let i = 0; i < difference; i++) {
                this.toFloor();
            }
        } else {
            let difference = (index - this.serial);
            for (let i = 0; i < difference; i++) {
                this.toCeil();
            }
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

        let ele = this.box.get(0), scrollWidth = ele.scrollWidth, clientWidth = ele.clientWidth, isFirst = true;
        let marquee = <HTMLMarqueeElement>this.marquee.get(0);
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
export function Position(el: HTMLElement) {
    var box = el.getBoundingClientRect();
    var x = window.pageXOffset;
    var y = window.pageYOffset;
    
    return {
        top: box.top + y,
        right: box.right + x,
        bottom: box.bottom + y,
        left: box.left + x
    };
}