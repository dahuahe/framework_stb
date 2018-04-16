/**
 * 编辑作者：张诗涛
 * 创建时间：2018年4月16日 16点28分
 * 功能分类：uitool 工具库使用演示
 */
import { HElement } from "../../framework/framework";

document.getElementById("btn-console-helement").onclick = function () {
    console.log(new HElement(""));
}
document.getElementById("btn-console-page").onclick = function () {
    console.log(new HElement('#btn-console-page'));
}
document.getElementById("btn-console-container").onclick = function () {
    console.log(new HElement('.container'));
}
document.getElementById("btn-console-row").onclick = function () {
    console.log(new HElement('.row'));
}
document.getElementById("btn-console-addclass").onclick = function () {
    new HElement('.row').eq(0).addClass("red");
}
document.getElementById("btn-console-removeclass").onclick = function () {
    new HElement('.row').eq(0).removeClass("red");
}
document.getElementById("btn-console-length").onclick = function () {
    console.log(new HElement('.row').length);
}
document.getElementById("btn-console-hidden").onclick = function () {
    new HElement('.row').eq(1).hidden()
}
document.getElementById("btn-console-visible").onclick = function () {
    new HElement('.row').eq(1).visible()
}
document.getElementById("btn-console-hide").onclick = function () {
    new HElement('.row').eq(1).hide()
}
document.getElementById("btn-console-show").onclick = function () {
    new HElement('.row').eq(1).show()
}
document.getElementById("btn-console-getattr").onclick = function () {
    console.log(new HElement('.row').eq(2).children("div").eq(1).attr("data-tips"));
}
document.getElementById("btn-console-setattr").onclick = function () {
    new HElement('.row').eq(2).children("div").eq(1).attr("data-tips", "这是改变后的值")
}
document.getElementById("btn-console-setstyle").onclick = function () {
    new HElement('.row').eq(1).children("div").eq(1).style("border", "1px solid red");
}
