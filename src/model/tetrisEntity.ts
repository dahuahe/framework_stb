/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月19日 13点54分
 * 功能分类：俄罗斯方块实体类
 */
enum TetrisType {
    /**
     * 正方形
     */
    Square,
    /**
     * 三角形
     */
    Triangle,
    /**
     * 线
     */
    Line,
    /**
     * 7
     */
    Seven
}
class TetrisEntity {
    private type: TetrisType;
    private sites: ISite[] = [];

    constructor(type: TetrisType) {
        this.type = type;
    }
    initData(sites: ISite[]) {
        this.sites = sites;
    }
    getSites() {
        return this.sites;
    }
}
export { TetrisType, TetrisEntity }