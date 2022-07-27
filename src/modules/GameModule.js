import EventLite from 'event-lite'
import ModuleBase from './ModuleBase'
import { EVENT_NAME } from '../constants'

class GameModule extends ModuleBase {

    constructor(platformBridge) {
        super(platformBridge)

        this._platformBridge.on(
            EVENT_NAME.VISIBILITY_CHANGED,
            state => this.emit(EVENT_NAME.VISIBILITY_CHANGED, state))
    }

}

EventLite.mixin(GameModule.prototype)
export default GameModule