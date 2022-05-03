import EventLite from 'event-lite'
import Timer, { STATE as TIMER_STATE } from '../Common/Timer'
import ModuleBase from './ModuleBase'
import { EVENT_NAME } from '../constants'

class AdvertisementModule extends ModuleBase {

    get interstitialState() {
        return this._platformBridge.interstitialState
    }

    get rewardedState() {
        return this._platformBridge.rewardedState
    }

    get minimumDelayBetweenInterstitial() {
        return this.#minimumDelayBetweenInterstitial
    }

    #interstitialTimer
    #minimumDelayBetweenInterstitial = 60

    constructor(platformBridge) {
        super(platformBridge)

        this._platformBridge.on(
            EVENT_NAME.INTERSTITIAL_STATE_CHANGED,
            state => this.emit(EVENT_NAME.INTERSTITIAL_STATE_CHANGED, state))

        this._platformBridge.on(
            EVENT_NAME.REWARDED_STATE_CHANGED,
            state => this.emit(EVENT_NAME.REWARDED_STATE_CHANGED, state))
    }

    setMinimumDelayBetweenInterstitial(value) {
        if (typeof value !== 'number') {
            value = parseInt(value)
            if (isNaN(value))
                return
        }

        this.#minimumDelayBetweenInterstitial = value

        if (this.#interstitialTimer) {
            this.#interstitialTimer.stop()
            this.#startInterstitialTimer()
        }
    }

    showInterstitial(options) {
        let ignoreDelay = options && options.ignoreDelay

        if (this.#interstitialTimer && this.#interstitialTimer.state !== TIMER_STATE.COMPLETED && !ignoreDelay)
            return Promise.reject('The minimum delay between interstitials has not passed')

        if (this.#minimumDelayBetweenInterstitial > 0)
            this.#startInterstitialTimer()

        return this._platformBridge.showInterstitial()
    }

    showRewarded() {
        return this._platformBridge.showRewarded()
    }

    #startInterstitialTimer() {
        this.#interstitialTimer = new Timer(this.#minimumDelayBetweenInterstitial)
        this.#interstitialTimer.start()
    }

}

EventLite.mixin(AdvertisementModule.prototype)
export default AdvertisementModule