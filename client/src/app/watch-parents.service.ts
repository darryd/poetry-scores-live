import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Goodbye } from './goodbye';
import { IsLoadingService } from './is-loading.service';
import { NotificationService } from './notification.service';


type Listener = (message: any) => void

interface Watcher {
   url?: string,
   target: string,
   beingWatched: string,
   idField?: string
   _id: any,
   listener?: Listener
}

@Injectable({
  providedIn: 'root'
})
export class WatchParentsService {

  goodbye = new Goodbye(this.http, this.isLoadingService, this.notififications)
  watchers : {[index: string]: Watcher} = {}
  lastId = 0;
  constructor(private http: HttpClient, private isLoadingService: IsLoadingService, private notififications: NotificationService) { 
  }

  /*

  Channel: obituary full: local-watch2:obituary
  {"timestamp":1672016904172,"data":{"modelName":"Signup","_id":"63a7a898177e7094a86ec70a"}}

   { modelName: 'Signup',
  url: 'api/signup/competition/62ae9a94af0ea6790c2e5752',
  event: 'delete',
  object:
   { _id: 63a7a898177e7094a86ec70a,
     poet: 'jeff',
     competition: 62ae9a94af0ea6790c2e5752,
     createdAt: 2022-12-25T01:34:16.136Z,
     updatedAt: 2022-12-25T01:34:16.136Z,
     __v: 0 },
  oldChange: undefined }

  {
    register 
  { 
    url: 'api/score/performance/63a8fcf87b4dd0959e5220cf', 
    target: 'Score', 
    beingWatched: 'Performance', 
    _id: '63a8fcf87b4dd0959e5220cf'}
  }

Request to server: POST localhost:9090/api/live/allParentIds
  {
    "child": "Performance", "child_id": "63a8fcf87b4dd0959e5220cf", "omit":["omit_me"]
  }


      Response:
      {
      "parents": [
          {
              "name": "Round",
              "_id": "6316fb4f45a379cea7fbb8fa",
              "isAlive": true
          },
          {
              "name": "Competition",
              "_id": "62ae9a94af0ea6790c2e5752",
              "isAlive": true
          },
          {
              "name": "Club",
              "_id": "62ae9983af0ea6790c2ddbf7",
              "isAlive": true
          }
        ]
      }


  */


  // Build a parent tree or something like that....
  //listener({data: {url, event: 'delete-parent'}})

  private upperCaseFirstLetter(str: string) {
    return str[0].toUpperCase() + str.substring(1)
  }


  private parseUrl(url: string) {
    
    var parts = url.split('/')
    var length = parts.length

    var beingWatched = this.upperCaseFirstLetter(parts[length -2])
    var target = length === 4 ? this.upperCaseFirstLetter(parts[length -3]) : beingWatched
    
    var _id = parts[length -1]

    return {url, target, beingWatched, _id}
  }

  generateId() {
    return `${++this.lastId}`
  }

  register(url, listener: Listener, idField='_id') {

    var watcherId = this.generateId()

    var parsedUrl = this.parseUrl(url)

    this.watchers[watcherId] = parsedUrl
    this.watchers[watcherId].listener = listener

    //console.log('register', this.watchers)
    this.goodbye.lookupParents(parsedUrl.beingWatched, parsedUrl._id, listener, url, idField)

    return watcherId
  }

  unregister(watcherId) {
    delete this.watchers[watcherId] // TODO what about the cleaning up data on goodbye class?
  }
}
