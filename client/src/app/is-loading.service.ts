import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsLoadingService {

  private i = 0
  private loadingStatus = new Subject<boolean>()
  $loadingStatus = this.loadingStatus.asObservable()

  get isLoading() {
    return this.i > 0
  }

  fetching() {
    this.i++
    this.loadingStatus.next(true)
  }
  
  fetched() {
    this.i--
    this.loadingStatus.next(this.isLoading)
  }

  constructor() { }
}
