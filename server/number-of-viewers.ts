import { Server } from "http";
import { Socket } from "net"; // This might be the wrong Socket!
import { clubModel } from "./model/club";
import { competitionModel } from "./model/competition";
import { EventName, notifyCallbacks } from "./notify";
const ws = require('ws');

const timeToLive = 5 * 60 * 1000

interface Connection {
    socket: any, 
    competitionId: string,
    createAt: number
}

export interface Watchers {
    _id: any,
    watchers: number, 
    clubName: string,
    updatedAt: Date
}

var connections: Connection[] = []

export async function getWatchers(name: string): Promise<Watchers[]> {

    var club = await clubModel.findOne({name})
    if (club) {
        var competitions = await competitionModel.find({ club: club._id })

        if (competitions) {
            return competitions.map(competition => {
                var watchers = getNumberOfWatchers(`${competition._id}`)
                return  { _id: competition._id, watchers, clubName: name, updatedAt: new Date() }
            })
        }
    }

    return []
}

function newSocket(socket: WebSocket) {
    var connection = <Connection> {}
    connection.socket = socket
    connection.createAt = Date.now()
    connections.push(connection)
}

export async function notifyChangeWatchers(competitionId: string, event: EventName = 'update') {

    if (!competitionId) {
        return
    }

    var competition = await competitionModel.findById(competitionId).populate('club')

    if (competition) {
        var club = <any>competition.club
        var name = club.name

        var watchers: Watchers = <Watchers>{}

        watchers._id = competitionId
        watchers.clubName = name
        watchers.watchers = getNumberOfWatchers(competitionId)
        watchers.updatedAt = new Date()

        notifyCallbacks('Watchers', event, watchers)
    }
}

function closeSocket(socket: WebSocket) {
    var connection = connections.find(c => c.socket === socket)
    if (connection) {
        notifyChangeWatchers(connection.competitionId)
    }

    connections = connections.filter(connection => connection.socket !== socket)
}

function watching(socket: WebSocket, competitionId: string) {
    
    var connection = connections.find(connection => connection.socket === socket)
    if (connection) {
        notifyChangeWatchers(connection.competitionId)
        connection.competitionId = competitionId
        notifyChangeWatchers(connection.competitionId)
    }
    else { 
        console.error('Could not find socket.')
    }
}

function getNumberOfWatchers(competitionId: string) {
    var sum = 0
    connections.map(connection => {
        sum += connection.competitionId === competitionId ? 1 : 0      
    })
    return sum
}

function getCompetionIds() {

    var competitionIds : {[key: string]: any} = {}
    connections.forEach(connection => competitionIds[connection.competitionId] = true )
    return Object.keys(competitionIds)
}

function sendHowMany(competitionId: string) {
    
    var numberOfWatchers = getNumberOfWatchers(competitionId)
    var connectionsForCompetion = connections.filter(connection => connection.competitionId === competitionId)
    connectionsForCompetion.map(connection => {
        if (connection.socket.readyState === connection.socket.OPEN) {
            connection.socket.send(numberOfWatchers)
        }
    })
}

function sendHowManyToAll() {

    var competitionIds = getCompetionIds()
    competitionIds.forEach(competitionId => {
        sendHowMany(competitionId)
    })
}

async function notifyCallbacksForAllCompetitions() {
    var competitionIds = await competitionModel.find({}).distinct('_id')
    competitionIds.forEach(competitionId => {
        notifyChangeWatchers(competitionId)
    })
}

export function runSocketServer(server: Server) {

    const wsServer = new ws.Server({ noServer: true });
    wsServer.on('connection', (socket: any) => {

        newSocket(socket)
        socket.on('message', (message: string) => {
            try {
                var data = JSON.parse(message) 
                watching(socket, data.competitionId)
                sendHowManyToAll()
            } catch (error) {
                console.error(error)
            }

        });
        socket.on('close', () => { 
            //console.log('Socket disconnected.')
            closeSocket(socket)
            sendHowManyToAll()
        })
    });

    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, (socket: Socket) => {
            wsServer.emit('connection', socket, request);
        });
    });

    // Just in case a browser isn't in sync (for some unknown reason)
    setInterval(sendHowManyToAll, 5000) 

    // Just in case some watchers disappeared while the server was offline 
    // within the last 2 minutes.
    // (Browser will not refetch if connection was gone for less than 
    // two minutes (or something like that)). 
    /*
    This feature has proved to be unreliable. Maybe runing this function makes ably unhappy as it uses too 
    many messages per second. 
    if (process.env.NODE_ENV === 'production') {
        setTimeout(notifyCallbacksForAllCompetitions, 5000)
    }
    */

    setInterval(() => {
        // One time it looked like a socket connection was lingering even though
        // I had all my browsers closed. 
        connections.forEach(connection => {
            if (Date.now() - connection.createAt > timeToLive) {
                connection.socket.close() // If the browser was connected, it will try to reconnect.
            }
        }, 60000)
    })
}