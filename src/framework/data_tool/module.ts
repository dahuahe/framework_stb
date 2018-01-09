import { PageEvent } from "./pageEvent";

class Module {
    event: PageEvent;
    constructor(pageEvent: PageEvent) {
        this.event = pageEvent;
        this.initialize();
        this.subscribeToEvents();
    }
    initialize() {
        throw new Error('There is no implementation initialize()');
    }
    subscribeToEvents() {
        throw new Error('There is no implementation subscribeToEvents()');
    }
}
export { Module } 