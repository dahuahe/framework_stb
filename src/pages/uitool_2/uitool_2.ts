/**
 * 编辑作者：
 * 创建时间：
 * 功能分类：
 */
import { VerticalRoll, HElement, HorizontalRoll } from "../../framework/framework";

let verticalRoll = new VerticalRoll({
    ele: new HElement("#verticalroll-content"),
    height: 100, // 外部容器高度
    lenght: 12   // 上下动作长度 单位(像素)
});

document.getElementById('btn-verticalroll-up').onclick = function () {
    verticalRoll.toCeil();
}
document.getElementById('btn-verticalroll-down').onclick = function () {
    verticalRoll.toFloor();
}

let horizontalRoll = new HorizontalRoll(new HElement("#horizontalroll-box"));

document.getElementById('btn-horizontalroll-left').onclick = function () {
    horizontalRoll.enable();
}
document.getElementById('btn-horizontalroll-stop').onclick = function () {
    horizontalRoll.disable();
}
