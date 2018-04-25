/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月23日 14点10分
 * 功能分类：俄罗斯方块业务逻辑类
 */
import { Focus, Key, Dictionary, Site } from "../framework/framework";
import { TetrisType, TransformType } from "../model/model";
import { Config } from '../config';

/**
 * 俄罗斯方块类（基类）
 */
class TetrisBasic {
    protected foc: Focus;
    protected arrAll: ISite[] = [];
    protected setting: Key[][][] = [];
    protected typTra: TransformType;

    constructor(focMap: Focus, setting: Key[][][]) {
        this.foc = focMap;
        this.setting = setting;
        this.typTra = TransformType.Up;

        for (let i = 0; i < 4; i++) {
            this.arrAll.push(this.foc.getSite(this.setting[this.typTra][i]));
        }
    }
    transform() {
        this.typTra++;
        if (3 < this.typTra) {
            this.typTra = 0;
        }
        return this.getMoveSites(this.foc.getSite());
    }
    recoverTransform() {
        this.typTra--;
        if (0 > this.typTra) {
            this.typTra = 3;
        }
    }
    getSites() {
        return this.arrAll;
    }
    getLeft(): ISite[] {
        return this.getMoveSites(this.foc.getSite([Key.Left]));
    }
    getRight(): ISite[] {
        return this.getMoveSites(this.foc.getSite([Key.Right]));
    }
    getDown(): ISite[] {
        return this.getMoveSites(this.foc.getSite([Key.Down]));
    }
    update(upSite: Site, arr: ISite[]): void {

        this.foc.setSite(upSite);

        this.arrAll = arr;
    }
    protected getMoveSites(site: Site): ISite[] {
        if (site) {
            let index = site.index;
            let list: ISite[] = [];

            // 获取列表
            for (let i = 0; i < 4; i++) {
                list.push(this.foc.getSite(index, this.setting[this.typTra][i]));
            }

            return list;
        }
    }
}
/**
 * 正方形
 */
class SquareTetris extends TetrisBasic {
    constructor(foc: Focus) {
        super(foc, [
            [
                undefined,
                [Key.Right],
                [Key.Down],
                [Key.Down, Key.Right]
            ],
            [
                undefined,
                [Key.Right],
                [Key.Down],
                [Key.Down, Key.Right]
            ],
            [
                undefined,
                [Key.Right],
                [Key.Down],
                [Key.Down, Key.Right]
            ],
            [
                undefined,
                [Key.Right],
                [Key.Down],
                [Key.Down, Key.Right]
            ]
        ])
    }
}
/**
 * 三角形
 */
class TriangleTetris extends TetrisBasic {
    constructor(foc: Focus) {
        super(foc, [
            [
                [Key.Down],
                [Key.Down, Key.Right],
                [Key.Down, Key.Right, Key.Up],
                [Key.Down, Key.Right, Key.Right]
            ],
            [
                undefined,
                [Key.Down],
                [Key.Down, Key.Right],
                [Key.Down, Key.Down]
            ],
            [
                undefined,
                [Key.Right],
                [Key.Right, Key.Right],
                [Key.Right, Key.Down]
            ],
            [
                [Key.Down],
                [Key.Right],
                [Key.Down, Key.Right],
                [Key.Down, Key.Right, Key.Down]
            ]
        ])
    }
}
/**
 * 线形
 */
class LineTetris extends TetrisBasic {
    constructor(foc: Focus) {
        super(foc, [
            [
                undefined,
                [Key.Right],
                [Key.Right, Key.Right],
                [Key.Right, Key.Right, Key.Right]
            ],
            [
                undefined,
                [Key.Down],
                [Key.Down, Key.Down],
                [Key.Down, Key.Down, Key.Down]
            ],
            [
                undefined,
                [Key.Right],
                [Key.Right, Key.Right],
                [Key.Right, Key.Right, Key.Right]
            ],
            [
                undefined,
                [Key.Down],
                [Key.Down, Key.Down],
                [Key.Down, Key.Down, Key.Down]
            ]
        ])
    }
}
/**
 * 形状 7
 */
class SevenTetris extends TetrisBasic {
    constructor(foc: Focus) {
        super(foc, [
            [
                undefined,
                [Key.Down],
                [Key.Down, Key.Down],
                [Key.Down, Key.Down, Key.Right]
            ],
            [
                undefined,
                [Key.Down],
                [Key.Right],
                [Key.Right, Key.Right]
            ],
            [
                undefined,
                [Key.Right],
                [Key.Right, Key.Down],
                [Key.Right, Key.Down, Key.Down]
            ],
            [
                undefined,
                [Key.Down],
                [Key.Down, Key.Right],
                [Key.Down, Key.Right, Key.Right]
            ]
        ])
    }
}

class MapLogic {
    private readonly foc: Focus;
    private arrFin: Dictionary<ISite> = new Dictionary();
    private tetris: TetrisBasic;

    constructor(foc: Focus) {
        this.foc = foc;
    }
    /**
     * 创建方块
     * @param type 
     */
    create(type: TetrisType): TetrisBasic {

        if (TetrisType.Square === type) {
            this.tetris = new SquareTetris(this.foc);
        }
        else if (TetrisType.Triangle === type) {
            this.tetris = new TriangleTetris(this.foc);
        }
        else if (TetrisType.Line === type) {
            this.tetris = new LineTetris(this.foc);
        }
        else if (TetrisType.Seven === type) {
            this.tetris = new SevenTetris(this.foc);
        }
        return this.tetris;
    }
    /**
     * 新增已完成
     */
    add(arr: ISite[]) {
        arr.forEach((v) => {
            this.arrFin.set(v.index, v);
        });
    }
    /**
     * 清空消除
     */
    clear(): number {
        let score = 0;
        let x: number, xs: number[] = [];

        this.foc.forEachRow((v, i) => {
            let list = this.arrFin.values(), len = list.length;

            if (v && v.length) {
                xs.length = 0;
                x = v[0].x;
                if (x) {

                    if (18 <= list.filter((v_2) => {
                        if (x === v_2.x) {
                            xs.push(v_2.index);
                            return v_2;
                        }
                    }).length) {

                        score += 18;
                        
                        xs.forEach((v_3, i) => {
                            this.arrFin.remove(v_3);
                        });

                        // 自动向下归位
                        let nSite;
                        list.reverse();

                        list.forEach((v_4) => {
                            if (v_4.x < v[0].x) {
                                nSite = this.foc.getSite(v_4.index, [Key.Down]);
                                this.arrFin.remove(v_4.index);
                                this.arrFin.set(nSite.index, nSite);
                            }
                        });

                        list.reverse();
                    }
                }
            }
        });
        return score;
    }
    /**
     * 更新视图
     */
    draw() {
        let arr = this.foc.getSites();

        arr.forEach((v) => {
            v.element.removeClass("focus");
        });

        arr = this.tetris.getSites();

        arr.forEach((v) => {
            v.element.addClass("focus");
        });

        arr = this.arrFin.values();
        arr.forEach((v) => {
            v.element.addClass("focus");
        });
    }
    /**
     * 验证方块
     * @param grids 
     */
    valid(arr: ISite[]) {

        if (arr && arr.length) {

            let every = true;

            if (!arr.every((v) => {
                if (v && !this.arrFin.has(v.index)) {
                    return true;
                }
            })) {
                every = false;
            }
            return every;
        }
        return false;
    }
}
export { MapLogic, SquareTetris, TriangleTetris, LineTetris, SevenTetris, TetrisBasic }