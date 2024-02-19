/* 
It is safe to multiply Date.now() by 1000 so long as
Number.MAX_SAFE_INTEGER - Date.now() * 1000 >= 0.
In fact, if you solve the equation,
Number.MAX_SAFE_INTEGER - (Date.now() + future) * 1000 == 0
for future, you'll discover that we can keep multipliying Date.now()
safely by 1000 for about another 285.

Here's how I reached that conclusion:

var future = (Number.MAX_SAFE_INTEGER - Date.now()/1000) / 1000
var years = future / 1000 / 60 / 60 / 24 / 365.25


*/

export function getOrderValue() {
    return Number(Date.now()) * 1000
}

export function getNegativeOrderValue() {
    return -1 * getOrderValue()
}

export async function switchPositions(model: any, id_1: any, id_2: any) {

    console.log('Switch Positions')

    const doc1 = await model.findById(id_1)
    if (!doc1) {
        throw new Error(`Could not find document with id ${id_1}.`)
    }

    const doc2 = await model.findById(id_2)
    if (!doc2) {
        throw new Error(`Could not find document with id ${id_2}.`)
    }

    var temp = doc1.order
    doc1.order = doc2.order
    doc2.order = temp

    await doc1.save()
    await doc2.save()

    return [doc1, doc2]
}