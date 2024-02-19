export type Func = () => any | Promise<any>

interface QueueElement {
    fn: Func;
    isSkippable: boolean
}

export class FuncQueue {
    private isBusy = false
    private waitingFuncs: QueueElement[] = []
    private currentFunc: Func

    addFunction(fn: Func, isSkippable = true) {
        this.waitingFuncs.push({fn, isSkippable})
        this.executeQueue()
    }

    getNextFunc() {
        this.currentFunc = null
        while(this.waitingFuncs.length > 1 && this.waitingFuncs[0].isSkippable) {
           this.waitingFuncs.splice(0, 1) 
        }
        if (this.waitingFuncs.length > 0) {
            this.currentFunc = this.waitingFuncs.splice(0, 1)[0]['fn']
        }
    }

    async executeQueue() {
        if (this.isBusy) return

        this.isBusy = true
        while (this.waitingFuncs.length > 0) {
            this.getNextFunc()

            if (this.currentFunc) {
                await this.currentFunc()
            }
        }
        this.isBusy = false
    }
}
