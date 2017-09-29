import {DoublyLinkedList} from './collection';
/**
 * 轮播插件
 * 用于控制轮播逻辑及数据管理
 * 下标为0的数据则是当前焦点banner
 */
export class Carousel{
    private doublyLinked = new DoublyLinkedList();

    constructor(){
    }
    appendData(data:any){
        this.doublyLinked.append(data);
    }
    setBanner(data:any){
        let outSize = this.doublyLinked.size();
        
        for (var i = 0; i < outSize; i++) {
            let curr = this.doublyLinked.getHead();
            if(data === curr.element){
                break;
            }
            this.backward();
        }
    }
    forward(){
        let head = this.doublyLinked.getHead();

        this.doublyLinked.removeAt(0);
        this.doublyLinked.append(head.element);
    }
    backward(){
        let tail = this.doublyLinked.getTail();
        let len = this.doublyLinked.size();
        this.doublyLinked.removeAt(len - 1);
        this.doublyLinked.insert(0,tail.element);
    }
    getData(){
        let head = this.doublyLinked.getHead();
        let curr = head;
        let data = [];

        data.push(head.element);
        while (curr.next) {
            curr = curr.next;
            data.push(curr.element);
        }
        return data;
    }
}