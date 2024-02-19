import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommData } from '../communication-lights/communication-lights.component';
import { PermissionsService } from '../permissions.service';
import { SyncArray } from '../sync-array';
import { SyncArrayService } from '../sync-array.service';

@Component({
  selector: 'app-club-info',
  templateUrl: './club-info.component.html',
  styleUrls: ['./club-info.component.css']
})
export class ClubInfoComponent implements OnInit {
  paramsSub: any;
  name: string;
  syncClub: SyncArray
  syncCompetitions: SyncArray
  syncSubs = []
  club: any;
  changed: any;
  syncWatchers: SyncArray;
  syncWatchersChanged: any;
  isTransferHidden = true
  syncAdmin: SyncArray;

  constructor(  private syncArrayService: SyncArrayService, 
                private activatedRoute: ActivatedRoute,
                public permissionsService: PermissionsService ) {}

  trackByFn(_index, item) {
    return item._id
  }
  
  getCreateCommDataFunction(that=this) {

    return function (email: string) {
      var commData = <CommData>{}

      commData.url = '/api/admin'
      commData.httpVerb = 'post'
      commData.body = { club_id: that.club._id, email }

      return commData
    }
  }

  getDeleteCommData(row) {

    var commData = <CommData> {}
    commData.httpVerb = 'delete'
    commData.url = `/api/admin/${row._id}`

    return commData
  }


  isOwner() {
    return this.club && this.permissionsService.isMyRole('owner', this.club._id)
  }
  
  isAdmin() {
    return this.club && this.permissionsService.isMyRole('admin', this.club._id)
  }

  initSync() {

    this.syncSubs.push(this.syncClub = this.syncArrayService.getSync(`api/club/${this.name}`, false, 'name'))
    this.syncSubs.push(this.syncCompetitions = this.syncArrayService.getSync(`api/competition/club/${this.name}`, false, 'name'))
    this.syncSubs.push(this.syncWatchers = this.syncArrayService.getSync(`api/club/watchers/${this.name}`, true))

    this.syncSubs.push(this.syncClub.$changed.subscribe(() => {
      this.club = this.syncClub.keepUpToDate.row
      this.syncSubs.push(this.syncAdmin  = this.syncArrayService.getSync(`api/admin/club/${this.club._id}`))
    }))

    this.syncSubs.push(this.syncCompetitions.$changed.subscribe(() => {
      var competitions = this.syncCompetitions.keepUpToDate.rows

      competitions.sort((a: any, b: any) => {
        return b.order - a.order
      })
    }))
  }


  getWatchers(competition_id) {

    if (!this.syncWatchers.keepUpToDate || !this.syncWatchers.keepUpToDate.rows) {
      return
    }

    var watchers = this.syncWatchers.keepUpToDate.rows.find(w => w._id === competition_id)

    if (watchers) {
      return watchers.watchers
    }
    
    return 0
  }


  stopSync() {
    this.syncSubs.map(sub => sub.unsubscribe())
  }  

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.name = params['name']
      this.stopSync()
      this.initSync()
    })

  }

  ngOnDestroy() {
    if (this.paramsSub) {
      this.paramsSub.unsubscribe()
    }
    this.stopSync()
  }
}
