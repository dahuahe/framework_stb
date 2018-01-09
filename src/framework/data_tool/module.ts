import { PageEvent } from "./pageEvent";

class Module {
    event: PageEvent;
    constructor(pageEvent: PageEvent) {
        console.log('父类构造方法');
        this.event = pageEvent;
        this.initialize();
        this.subscribeToEvents();
    }
    initialize() {
        console.log('父类initialize');
        throw new Error('There is no implementation initialize()');
    }
    subscribeToEvents() {
        console.log('父类subscribeToEvents');
        throw new Error('There is no implementation subscribeToEvents()');
    }
}
export { Module } 