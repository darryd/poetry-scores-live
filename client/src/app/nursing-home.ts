//const message = {data: {url, event: 'delete-parent'}}

import { HttpClient } from "@angular/common/http";
import { IsLoadingService } from "./is-loading.service";


// Note: that children will also be parents to themselves.

interface ParentAndChildren {
    parent: any,
    children: object[]
}

export class NursingHome {

    parents :ParentAndChildren[] = []

    private isParent(parent: ParentAndChildren) {
        return parent.children !== undefined || parent.children.length === 0
    }

    private removeNonParents() {
        if (this.parents === undefined) {
            return
        }

        var newParents = []
        for (var i=0; i<this.parents.length; i++) {
            var parent = this.parents[i]
            if (this.isParent(parent)) {
                newParents.push(parent)
            }
        }
        this.parents = newParents
    } 


    addChild(name: string, _id: string, url: string, listener: (message: any) => void) {
        // Get Parents... 
    }

    constructor(private http: HttpClient, private isLoadingService: IsLoadingService) {

    }

}
