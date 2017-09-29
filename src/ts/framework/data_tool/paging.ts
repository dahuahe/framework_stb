export var PagingHelper = {
    getData(sourceData: Array<object>, params: { pageSize: number, pageIndex: number }) {
        let dt = [];
        let startAt: number = params.pageSize * params.pageIndex - params.pageSize;
        let stopAt: number = params.pageSize * params.pageIndex;

        for (var index = 0; index < sourceData.length; index++) {
            if (index < stopAt && index >= startAt) {
                dt.push(sourceData[index]);
            }
            if (index >= stopAt) {
                break;
            }
        }
        return dt;
    },
    getScope(params: { pageSize: number, pageIndex: number }) {
        let startAt: number = params.pageSize * params.pageIndex - params.pageSize + 1;
        let maxItems: number = params.pageSize;
        return {
            startAt: startAt,
            maxItems: maxItems
        };
    },
    getPageIndex(dataSize: number, pageSize: number, index: number) {

        let pageIndex: number;
        pageIndex = Math.floor((index / pageSize) + 1);

        return pageIndex;
    },
    getDataScope(params: { dataSize: number, pageSize: number, pageIndex: number }) {
        let startAt: number = params.pageSize * params.pageIndex - params.pageSize;
        let stopAt: number = startAt + params.pageSize - 1;

        if (startAt > (params.dataSize - 1)) {
            startAt = 0;
            stopAt = 0;
        } else {
            if (stopAt > (params.dataSize - 1)) {
                stopAt = params.dataSize - 1;
            }
        }
        return {
            startAt: startAt,
            stopAt: stopAt
        }
    },
    getCountPage(dataSize: number, pageSize: number) {
        return Math.ceil(dataSize / pageSize);
    }
}
export class Paging {
    private pageIndex = 1;
    private pageSize = 0;
    private countPage = 0;
    private dataSize = 0;

    constructor(pageSize: number) {
        this.pageSize = pageSize;
    }
    setDataSize(size: number) {
        this.dataSize = size;
        this.countPage = Math.ceil(this.dataSize / this.pageSize);
    }
    getDataSize(): number {
        return this.dataSize;
    }
    setPageIndex(index: number) {
        this.pageIndex = index;
    }
    getCountPage() {
        return this.countPage;
    }
    getPageIndex(): number {
        return this.pageIndex;
    }
    getPageSize(): number {
        return this.pageSize;
    }
    toNextPage(): number {
        return (1 + this.pageIndex) > this.countPage ? this.pageIndex : ++this.pageIndex;
    }
    isNextPage(): boolean {
        return (1 + this.pageIndex) > this.countPage ? false : true;
    }
    toPreviousPage(): number {
        return (-1 + this.pageIndex) < 1 ? this.pageIndex : --this.pageIndex;
    }
    isPreviousPage(): boolean {
        return (-1 + this.pageIndex) < 1 ? false : true;
    }
}