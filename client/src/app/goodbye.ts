import { HttpClient } from "@angular/common/http";
import { IsLoadingService } from "./is-loading.service";
import { MaintainConnection } from "./maintain-connection";
import { NotificationService } from "./notification.service";

export type Bye = (eventName: string) => void;

interface Event {
    byes: Bye[],
    comments: string[]
}

export class Goodbye {

    private maintainConnection = new MaintainConnection(this.notifications)
    private events: { [key: string]: Event } = {}
    
    constructor(private http: HttpClient, private isLoadingService: IsLoadingService, private notifications: NotificationService) {

        this.maintainConnection.init('obituary', (msg) => {
            //console.log('obituary')

            var eventName = this.generateEventName(msg.data.modelName, msg.data._id)
            //console.log(eventName)
            //console.log(eventName)
            this.trigger(eventName)
        },
        () => {/* check if parents still alive */ })
    }

    // Here we will send the 'delete-parent' message to self and children.
    trigger(eventName: string) {
        const event = this.events[eventName];

        if (event && event.byes) {
            event.byes.forEach((bye) => bye(eventName));
            delete this.events[eventName];
        }
    }

    addBye(eventName: string, bye: Bye, key: string) {
        this.events[eventName] = this.events[eventName] || { byes: [], comments: [] } as Event

        if (!this.events[eventName].comments.find(c => c === key)) {
            this.events[eventName].byes.push(bye);
            this.events[eventName].comments.push(key)
        } 
    }

    generateEventName(name: string, _id: string) {
        return `${name}=>${_id}`
    }

    async lookupParents(child: string, _id: string, listener, url, idField='_id') {
        var that = this
        function getParentList(lookup) {
            var list = []

            list.push(lookup.child)
            return list.concat(lookup.parents)
         }

         function createByes(lookup) {
            var parentList = getParentList(lookup)

            parentList.forEach(parent => {
                var eventName = that.generateEventName(parent.name, parent._id)
                //console.log('parent.name:', parent.name, '_id:', parent._id)
                //console.log('delete-parent', {data: {url, event: 'delete-parent'}})
                that.addBye(eventName, (eventName) => {
                    var msg = {data: {url, event: 'delete-parent'}}
                    listener(msg)
                    //console.log('${eventName}: sending message: ', msg )
                }, `${child} ${_id}`) 
            })
            //console.log(that)
         }

        const parentIdsUrl = `api/live/allParentIds`

        try { 
            this.isLoadingService.fetching()
            var result = await this.http.post(parentIdsUrl, {child, child_id: _id, idField}).toPromise()
            this.isLoadingService.fetched()

            createByes(result)

        } catch (err) {
            console.log(err)
        }
    }

}
