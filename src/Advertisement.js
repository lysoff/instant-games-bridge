import EventLite from 'event-lite'
import Timer, { STATE as TIMER_STATE } from './Common/Timer'

export const EVENT_NAME = {
    INTERSTITIAL_STATE_CHANGED: 'interstitial_state_changed',
    REWARDED_STATE_CHANGED: 'rewarded_state_changed',
}

export const INTERSTITIAL_STATE = {
    OPENED: 'opened',
    CLOSED: 'closed',
    FAILED: 'failed'
}

export const REWARDED_STATE = {
    OPENED: 'opened',
    CLOSED: 'closed',
    FAILED: 'failed',
    REWARDED: 'rewarded'
}

class Advertisement {

    get interstitialState() {
        return this.#platformProvider.interstitialState
    }

    get rewardedState() {
        return this.#platformProvider.rewardedState
    }

    #platformProvider
    #interstitialTimer
    #minimumDelayBetweenInterstitial = 60

    constructor(platformProvider) {
        this.#platformProvider = platformProvider

        this.#platformProvider.on(
            EVENT_NAME.INTERSTITIAL_STATE_CHANGED,
            state => this.emit(EVENT_NAME.INTERSTITIAL_STATE_CHANGED, state))

        this.#platformProvider.on(
            EVENT_NAME.REWARDED_STATE_CHANGED,
            state => this.emit(EVENT_NAME.REWARDED_STATE_CHANGED, state))
    }

    setMinimumDelayBetweenInterstitial(value) {
        this.#minimumDelayBetweenInterstitial = value

        if (this.#interstitialTimer) {
            this.#interstitialTimer.stop()
            this.#startInterstitialTimer()
        }
    }

    showInterstitial(options) {
        let ignoreDelay = false

        if (options)
            ignoreDelay = options.ignoreDelay

        if (this.#interstitialTimer && this.#interstitialTimer.state !== TIMER_STATE.COMPLETED && !ignoreDelay)
            return Promise.reject('The minimum delay between interstitials has not passed')

        if (this.#minimumDelayBetweenInterstitial > 0)
            this.#startInterstitialTimer()

        return this.#platformProvider.showInterstitial()
    }

    showRewarded() {
        return this.#platformProvider.showRewarded()
    }

    #startInterstitialTimer() {
        this.#interstitialTimer = new Timer(this.#minimumDelayBetweenInterstitial)
        this.#interstitialTimer.start()
    }
}

EventLite.mixin(Advertisement.prototype)
export default Advertisement