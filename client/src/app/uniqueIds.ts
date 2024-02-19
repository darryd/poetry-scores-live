function getUniqueInArray1(array1: any[], array2: any[]) {
    
    var uniqueIds :any[] = []

    array1.forEach(array1_item => {

        var result = array2.find(array2_item => array1_item._id === array2_item._id)
        if (result === undefined) {
            var uniqueId = array1_item._id
            uniqueIds.push(uniqueId)
        }
    })

    return uniqueIds
}

export function getUniqueIds(array1: any[], array2: any[]) {
    return {
              array1: getUniqueInArray1(array1, array2), 
              array2: getUniqueInArray1(array2, array1)
            }
}

function test() {
    var array1 = [{_id: 1}, {_id: 2}, {_id: 4}, {_id: 6}]
    var array2 = [{_id: 2}, {_id: 7}]
    
    console.log('Array 1', array1)
    console.log('Array 2', array2)
    console.log(getUniqueIds(array1, array2))
}

