/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月19日 13点54分
 * 功能分类：俄罗斯方块实体类
 */
import { Focus, Key, Site, Set } from "../framework/framework";

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
/**
 * 形态类型
 */
enum TransformType {
    Up,
    Right,
    Left,
    Down
}

export { TetrisType, TransformType }