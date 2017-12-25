/**
 * 百分比滚动辅助模块
 * 支持页面内容模拟滚动条算法计算
 * 计算内容滚动值与混动条值
 */
export class PercentageRoll {
    private contentHeight = 0;
    private contentTop = 0;
    private cursorTop = 0;
    private containerHeight = 0;

    private cursorBarHeight = 0;
    private cursorHieght = 0;

    constructor(containerHeight: number, cursorBarHeight: number, cursorHieght: number) {

        this.containerHeight = containerHeight;
        this.cursorBarHeight = cursorBarHeight;
        this.cursorHieght = cursorHieght;
    }
    hasRoll(contentHeight: number) {
        return contentHeight > this.containerHeight;
    }
    plus(contentHeight: number, value: number) {
        // 设置增加内容高度
        this.contentHeight = contentHeight;
        let validTop = Math.abs(this.contentHeight - this.containerHeight);

        if (this.contentTop + value > validTop) {
            this.contentTop = validTop;
        } else {
            this.contentTop += value;
        }
        let percent = Math.round(this.contentTop / validTop * 100);

        // 计算光标距离顶部高度
        this.cursorTop = Math.round(percent / 100 * (this.cursorBarHeight - this.cursorHieght));

        return { contentTop: -this.contentTop, cursorTop: this.cursorTop };
    }
    minus(contentHeight: number, value: number) {
        // 设置增加内容高度
        this.contentHeight = contentHeight;

        let validTop = Math.abs(this.contentHeight - this.containerHeight);

        if (this.contentTop - value < 0) {
            this.contentTop = 0;
        } else {
            this.contentTop -= value;
        }
        let percent = Math.round(this.contentTop / validTop * 100);

        // 计算光标距离顶部高度
        this.cursorTop = Math.round(percent / 100 * (this.cursorBarHeight - this.cursorHieght));

        return { contentTop: -this.contentTop, cursorTop: this.cursorTop };
    }
}