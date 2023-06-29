import EventLite from 'event-lite'
import Timer, { STATE as TIMER_STATE } from '../common/Timer'
import ModuleBase from './ModuleBase'
import { EVENT_NAME, INTERSTITIAL_STATE, REWARDED_STATE, BANNER_STATE } from '../constants'

class AdvertisementModule extends ModuleBase {

    get isBannerSupported() {
        return this._platformBridge.isBannerSupported
    }

    get bannerState() {
        return this._platformBridge.bannerState
    }

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
            state => {
                if (state === INTERSTITIAL_STATE.CLOSED) {
                    if (this.#minimumDelayBetweenInterstitial > 0) {
                        this.#startInterstitialTimer()
                    }
                }

                this.emit(EVENT_NAME.INTERSTITIAL_STATE_CHANGED, state)
            })

        this._platformBridge.on(
            EVENT_NAME.REWARDED_STATE_CHANGED,
            state => this.emit(EVENT_NAME.REWARDED_STATE_CHANGED, state))

        this._platformBridge.on(
            EVENT_NAME.BANNER_STATE_CHANGED,
            state => this.emit(EVENT_NAME.BANNER_STATE_CHANGED, state))
    }


    setMinimumDelayBetweenInterstitial(options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (typeof platformDependedOptions !== 'undefined') {
                return this.setMinimumDelayBetweenInterstitial(platformDependedOptions)
            }
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
                if (isNaN(delay)) {
                    return
                }
            }
        }

        this.#minimumDelayBetweenInterstitial = delay

        if (this.#interstitialTimer) {
            this.#interstitialTimer.stop()
            this.#startInterstitialTimer()
        }
    }


    showBanner(options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions) {
                this.showBanner(platformDependedOptions)
                return
            }
        }

        if (this.bannerState) {
            switch (this.bannerState) {
                case BANNER_STATE.LOADING:
                case BANNER_STATE.SHOWN:
                    return
            }
        }

        this._platformBridge._setBannerState(BANNER_STATE.LOADING)
        if (!this.isBannerSupported) {
            this._platformBridge._setBannerState(BANNER_STATE.FAILED)
            return
        }

        this._platformBridge.showBanner(options)
    }

    hideBanner() {
        if (this.bannerState) {
            switch (this.bannerState) {
                case BANNER_STATE.LOADING:
                case BANNER_STATE.HIDDEN:
                    return
            }
        }

        if (!this.isBannerSupported) {
            return
        }

        this._platformBridge.hideBanner()
    }

    showInterstitial(options) {
        if (this.#hasAdvertisementInProgress()) {
            return
        }

        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions) {
                this.showInterstitial(platformDependedOptions)
                return
            }
        }

        let ignoreDelay = false
        if (options && typeof options.ignoreDelay === 'boolean') {
            ignoreDelay = options.ignoreDelay
        }

        this._platformBridge._setInterstitialState(INTERSTITIAL_STATE.LOADING)

        if (this.#interstitialTimer && this.#interstitialTimer.state !== TIMER_STATE.COMPLETED && !ignoreDelay) {
            this._platformBridge._setInterstitialState(INTERSTITIAL_STATE.FAILED)
            return
        }

        this._platformBridge.showInterstitial()
    }

    showRewarded() {
        if (this.#hasAdvertisementInProgress()) {
            return
        }

        this._platformBridge._setRewardedState(REWARDED_STATE.LOADING)
        this._platformBridge.showRewarded()
    }


    #startInterstitialTimer() {
        this.#interstitialTimer = new Timer(this.#minimumDelayBetweenInterstitial)
        this.#interstitialTimer.start()
    }

    #hasAdvertisementInProgress() {
        if (this.interstitialState) {
            switch (this.interstitialState) {
                case INTERSTITIAL_STATE.LOADING:
                case INTERSTITIAL_STATE.OPENED:
                    return true
            }
        }

        if (this.rewardedState) {
            switch (this.rewardedState) {
                case REWARDED_STATE.LOADING:
                case REWARDED_STATE.OPENED:
                case REWARDED_STATE.REWARDED:
                    return true
            }
        }

        return false
    }

}

EventLite.mixin(AdvertisementModule.prototype)
export default AdvertisementModule
