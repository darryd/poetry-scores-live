export function getOldChanges(oldObj: any, newObj: any) {

    var oldChanges : {[key: string]: any}= {}

    var o = JSON.parse(JSON.stringify(oldObj))
    var n = JSON.parse(JSON.stringify(newObj))

    var keys = Object.keys(o)
    var keys = keys.concat(Object.keys(n))

    keys.forEach(key => {
        if (o[key] !== n[key]) {
            oldChanges[key] = oldObj[key]
        }
    })

    return oldChanges
}