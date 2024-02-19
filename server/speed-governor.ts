export type TaskFunc = (key: string) => any

const startKey = '-start-key-'

function sleep (interval: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, interval)
    })
}
export class SpeedGovernor {

    private limitTasksPerSecond = 14
    private aSecond = 1000
    private taskCount = 0
    private startTime = 0
    private tasks: {taskFunc: TaskFunc, key: string}[] = []

    private keyWaiting = startKey
    private keyRecieved = startKey
    private lastTaskTime = 0
    private isAwake = true

    constructor() {
        this.startTimer()
    }

    private generateKey() {
        return `key-${Math.random()}`
    }

    private get timeElapsed () {
        return Date.now() - this.startTime
    }

    private get isSecondUp() {
        return this.timeElapsed >= this.aSecond
    }
    
    private startTimer () {
        this.startTime = Date.now()
        this.taskCount = 0
    }
    
    private isDone(): boolean {
        return this.keyWaiting === this.keyRecieved || Date.now() > 1000 + this.lastTaskTime 
    }

    private async sleepUntilNextSecond() {

        var interval = this.aSecond - this.timeElapsed

        //console.log('interval', interval)
        try {

            await sleep(interval)
            await sleep(this.aSecond) // sleep an extra second.
            console.log('Done', 'time elasped', this.timeElapsed)
        } catch (error) {
            console.error(error)
        }
    }

    private checkTime() {
        if (this.isSecondUp) {
            this.startTimer()
        }
    }

    async newTask(taskFunc: TaskFunc) {
        this.tasks.push({taskFunc, key: this.generateKey()})

        var length = this.tasks.length
        //console.log('tasks', this.tasks)


        await this.runTask()
    }

    public done(key: string) {

        this.keyRecieved = key

        console.log('--------------------------------------------------------------------------')
        console.log('Done')
        console.log(`${new Date()} done: ${key} Done:${this.isDone()}`)
        console.log('waiting:', this.keyWaiting, 'received', this.keyRecieved)
        console.log('--------------------------------------------------------------------------')

        this.runTask()
    }

    private async runTask() {

        if (this.tasks.length === 0) {
            return
        }

        this.isAwake = true
        if (!this.isDone()) {
            this.isAwake = false
            await sleep(this.aSecond)
            if (this.isAwake) {
                return
            }
        }


        this.checkTime()
        if (this.taskCount >= this.limitTasksPerSecond) {
            await this.sleepUntilNextSecond()
        } else {
            try {

                // Can we run the next task?
                if (this.isDone()) {
                    this.taskCount++
                    var key = this.tasks[0].key

                    console.log('--------------------------------------------------------------------------')
                    console.log('New task')
                    console.log('task count:', this.taskCount, new Date(), key)
                    console.log('--------------------------------------------------------------------------')

                    this.keyWaiting = key
                    this.tasks[0].taskFunc(this.keyWaiting)
                    this.tasks.splice(0, 1)
                    this.lastTaskTime = Date.now()
                }

            } catch (error) {
                console.error(error)
            } finally {
            }
        }
    }
}