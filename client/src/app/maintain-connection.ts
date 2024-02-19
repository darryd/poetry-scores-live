import { Types } from 'ably';
import { NotificationService } from './notification.service';

export class MaintainConnection {


  private channel: Types.RealtimeChannelCallbacks
  private lastConnectionTime = 0;
  private tooLongATime = 1.90 * 60 * 1000
  private channelName: string;
  private listener
  private action: any;

  constructor( private notifications: NotificationService) {}

  private subscribeToChannel() {
    var channelName = this.notifications.prefix + this.channelName
    this.channel = this.notifications.realtime.channels.get(channelName)
    this.channel.subscribe(this.listener)
  }

  private callActionIfConnectionWasLostForALongTime(stateChange) {
    if (stateChange.current === 'connected' && stateChange.previous !== 'connected')
      if (Date.now() - this.lastConnectionTime > this.tooLongATime) {
        this.action()
      }
  }


  private subscribeWhenPossible(that = this) {
    if (that.notifications.realtime && that.channelName) {
      that.subscribeToChannel()
    } else {
      var interval = 100
      setTimeout(that.subscribeWhenPossible, interval, that)
    }
  }

  unsubscribe() {
    if (this.channel) {
      this.channel.unsubscribe(this.listener)
    }
  }

  init(channelName: string, listener, actionAfterLongTime) {
    this.channelName = channelName
    this.listener = listener
    this.action = actionAfterLongTime

    this.subscribeWhenPossible() 

    this.notifications.$stateChange.subscribe((stateChange: any) => {
      this.callActionIfConnectionWasLostForALongTime(stateChange)
    })
  }
}
