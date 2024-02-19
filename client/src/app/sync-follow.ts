import { HttpClient } from '@angular/common/http';
import { AllChildren } from './AllChildren';
import { SyncArrayService } from './sync-array.service';
import { SyncArray } from './sync-array';
import { getUniqueIds } from './uniqueIds';
import { Subject } from 'rxjs';
import { IsLoadingService } from './is-loading.service';

export class SyncFollow {

    name: string
    _id: any
    allChildren: AllChildren[]
    
    syncArray: SyncArray
    followRows = [] 
    followRow
    private changed = new Subject<any>()
    changed$ = this.changed.asObservable()
    changedEvent: any;
    unsubscribedEvent: any;

    constructor(private http: HttpClient, 
                private syncArrayService: SyncArrayService,
                private isLoadingService: IsLoadingService) {}
    async follow(_id: any, name: string, url: string, allChildren?: AllChildren[]) {

        this._id = _id
        this.name = name

        this.allChildren = await this.getAllChildren(name, allChildren)
        this.syncArray = this.syncArrayService.getSync(url)

        this.watch()
    }

    watch() {
        this.changedEvent = this.syncArray.$changed.subscribe(() => {
            this.followChildren()
        })
        this.unsubscribedEvent = this.syncArray.unsubscribed$.subscribe(() => {
            this.unfollowAllChildren()
        })
    }

    followChildren(message?) {
        var rows = this.syncArray.keepUpToDate.rows
        var uniqueIds = getUniqueIds(rows, this.followRows)
        this.followNewChildren(uniqueIds.array1)
        this.unfollowDeletedChildren(uniqueIds.array2)

        this.followRows.forEach(followRow => {
            var _id = followRow._id
            followRow.object = this.getObject(_id)
            followRow.name = this.name
        })
        
        this.followRow = this.followRows.length === 0 ? undefined : this.followRows[0]
        this.changed.next(message)
    }

    getObject(_id) {
        for (var i=0; i<this.syncArray.keepUpToDate.rows.length; i++) {
            var row = this.syncArray.keepUpToDate.rows[i]
            if (row._id === _id) {
                return row
            }
        }
        return undefined
    }

    followNewChildren(ids: any[]) {
        ids.forEach(_id => {
            var row = {_id, object: this.getObject(_id), children: {}}
            this.followRows.push(row)

            this.allChildren.forEach(childNode => {
                var name = childNode.kid.name
                var url = this.rewriteUrl(_id, childNode.kid.url)
                var next = childNode.next

                var syncFollow = new SyncFollow(this.http, this.syncArrayService, this.isLoadingService)
                syncFollow.follow(_id, name, url, next)

                row.children[childNode.kid.name] = syncFollow
            })
        })
        
    }

    unfollowDeletedChildren(ids: any[]) {
        var newFollowRows = []
        ids.forEach(id => {
            for (var i = 0; i < this.followRows.length; i++) {
                var followRow = this.followRows[i]
                if (followRow._id === id) {
                    var keys = Object.keys(followRow.children)
                    keys.forEach(key => {
                        followRow.children[key].unfollow()
                    })
                } else {
                    newFollowRows.push(followRow)
                }
            }
            this.followRows = newFollowRows
        })
    }

    unfollow() {
        this.syncArray.unsubscribe()
        this.changedEvent.unsubscribe()
        this.unsubscribedEvent.unsubscribe()
    }

    unfollowAllChildren() {
        this.followRows.forEach(followRow => {
            var keys = Object.keys(followRow.children)
            keys.forEach(key => followRow.children[key].unfollow())            
        })
    }

    async getAllChildren(name: string, allChildren?: AllChildren[]) {

        if (allChildren === undefined) {
            this.isLoadingService.fetching()
            allChildren = await this.http.get<AllChildren[]>(`/api/live/allChildren/${name}`).toPromise()
            this.isLoadingService.fetched()
        }
        return allChildren
    }

    async getAllParents(name: string) {
        this.isLoadingService.fetching()
        var allParents = await this.http.get(`/api/live/allParents/${name}`).toPromise()
        this.isLoadingService.fetched()

        return allParents
    }

    rewriteUrl(id: string, url: string) {
        // For example: "round/competition/:_id"
        // Replace the :_id with the value competition['_id']

        var parts = url.split('/')

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i]

            if (part.charAt(0) === ':') {
                parts[i] = id
            }
        }

        return parts.join('/')
    }
}
