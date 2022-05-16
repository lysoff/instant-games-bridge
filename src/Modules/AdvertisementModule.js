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

    setMinimumDelayBetweenInterstitial(options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions)
                return this.setMinimumDelayBetweenInterstitial(platformDependedOptions)
        }

        let optionsType = typeof options
        let delay = this.#minimumDelayBetweenInterstitial

        switch (optionsType) {
            case 'number': {
                delay = options
                break
            }
            case 'string': {
                delay = parseInt(options)
                if (isNaN(delay))
                    return
            }
        }

        this.#minimumDelayBetweenInterstitial = delay

        if (this.#interstitialTimer) {
            this.#interstitialTimer.stop()
            this.#startInterstitialTimer()
        }
    }

    showInterstitial(options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions)
                return this.showInterstitial(platformDependedOptions)
        }

        let ignoreDelay = false
        if (options && typeof options.ignoreDelay === 'boolean')
            ignoreDelay = options.ignoreDelay

        if (this.#interstitialTimer && this.#interstitialTimer.state !== TIMER_STATE.COMPLETED && !ignoreDelay)
            return Promise.reject()

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