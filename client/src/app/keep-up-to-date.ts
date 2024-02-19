
export interface EventMessage {
    modelName: string,
    url: string,
    event: string,
    object: any
}

export class KeepUpToDate {

    rows: any[] = []
    row: any // Intended to be used when you're dealing with only one item.

    newEventName = 'new'
    updateEventName = 'update'
    deleteEventName = 'delete'
    deleteParentEventName = 'delete-parent'

    constructor() {} 

    updateRow() {
        if (this.rows)
            this.row = this.rows.length === 0 ? undefined : this.rows[0]
    }

    processEvent(message: EventMessage) {
        switch (message.event) {
            case this.newEventName: {
                this.newEvent(message)
                break
            }
            case this.updateEventName:{
                this.updateEvent(message)
                break
            }
            case this.deleteEventName: {
                this.deleteEvent(message)
                break
            }
            case this.deleteParentEventName: {
                this.deleteParentEvent()
                break
            }
        }
        this.updateRow()
    }

    private newEvent(message: EventMessage) {
        var row = message.object
        if (this.getIndexById(row['_id']) === -1) {
            this.rows.push(row)
        }
    }
    private updateEvent(message: EventMessage) {
        var row = message.object
        var index = this.getIndexById(row['_id'])
        if (index !== -1) {
            var rowToUpdate = this.rows[index]

            var timeOfRowToBeUpdated = Number(new Date(rowToUpdate['updatedAt']))
            var timeOfRow = Number(new Date(row['updatedAt']))

            if (timeOfRowToBeUpdated < timeOfRow) {
                this.rows[index] = row
            }
        }
    }
    private deleteEvent(message: EventMessage) {
        var row = message.object
        var index = this.getIndexById(row['_id'])
        if (index !== -1) {
            this.rows.splice(index, 1)
        }
    }

    private deleteParentEvent() {

        if (!this.rows) {
          return;
        }

        // ignore for now as this courses a bug! // BOOKMARK
        //this.rows.splice(0, this.rows.length) 
    }


    getIndexById(_id) {
        return this.rows.findIndex( (row) => row['_id'] === _id)
    }
}