import realtime = require('ably')
import { getOldChanges } from './changes'

var apiKey = process.env['ABLY_API_KEY']
var client = new realtime.Realtime({ key: apiKey })
import { SpeedGovernor } from './speed-governor'

var speedGovernor = new SpeedGovernor()


export var prefix = process.env['PREFIX'] || ''

export type EventName = 'new' | 'update' | 'delete' 

export interface ChannelNameUrl {
    channelName: string,
    url: string | undefined
}

var callbacks :{[key: string]: [NotifyCallbackFunc]} = {}
export type NotifyCallbackFunc = (object: any, event?: EventName, oldChange?: any) => ChannelNameUrl | Promise<ChannelNameUrl>

export function addNotifyCallback(modelName: string, cb : NotifyCallbackFunc ) {
    callbacks[modelName] = callbacks[modelName] || []
    callbacks[modelName].push(cb)
}

export function notifySpecific(modelName: string, event: EventName, object: any, oldObject: any | undefined, channelName: string, url: string) {

    var oldChange
    if (oldObject) {

        var o = typeof oldObject === 'function' ? oldObject.toObject() : oldObject
        var n = typeof object === 'function' ? object.toObject() : object

        oldChange = getOldChanges(o, n)
    }

    notify(channelName, { modelName, url, event, object, oldChange: oldChange })
}

export function notifyCallbacks(modelName: string, event: EventName, object: any, oldObject?: any) {

    var callbacksForModelName = callbacks[modelName]

    if (Array.isArray(callbacksForModelName)) {
        callbacksForModelName.map(async cb => {
            var channelNameUrl = await cb(object, event, oldObject)
            var channelName = channelNameUrl.channelName
            var url = channelNameUrl.url

            if (url) {
                notifySpecific(modelName, event, object, oldObject, channelName, url)
            }
        })
    }
}

function publish(channelName: string, data: any, key: string) {

    const fullChannelName = `${prefix}${channelName}`
    const message = { timestamp: Date.now(), data }
    console.log(`Channel: ${channelName} full: ${fullChannelName}`)
    console.log(JSON.stringify(message))

    return new Promise<void>((resolve, reject) => {
        var realChannel = client.channels.get(fullChannelName)

        realChannel.publish(message, (error) => {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                resolve()
            }
            speedGovernor.done(key)
        })
    })

}

export function sleep (interval: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, interval)
    })
}

export async function notify(channelName: string, data: any) {
    
    console.log('channelName:', channelName, 'data:', data)
    speedGovernor.newTask((key) => {
        return publish(channelName, data, key) 
    })
}


// async function notifyOld(channelName: string, data: any) {
//     var interval = 500
//     var tryAgain = false

//     do {
//         try {
//             console.log('channelName:', channelName, 'data:', data)
//             await publish(channelName, data)
//             tryAgain = false
//         } catch (error) {

//             /*
//             if (error.code === 42911) {
//                 // https://help.ably.io/error/42911
//                 tryAgain = true
//                 console.log('Will try again soon....')
//                 await sleep(interval)
//             }
//             */
//         }
//     } while (tryAgain)
// }