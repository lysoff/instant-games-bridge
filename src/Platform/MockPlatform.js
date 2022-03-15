import EventLite from 'event-lite'
import { EVENT_NAME as ADVERTISEMENT_EVENT_NAME, INTERSTITIAL_STATE, REWARDED_STATE } from '../Advertisement'

const LOCAL_STORAGE_GAME_DATA_KEY = 'game_data'

class MockPlatform {

    get id() {
        return 'mock'
    }

    get sdk() {
        return { }
    }

    get interstitialState() {
        return this.#interstitialState
    }

    get rewardedState() {
        return this.#rewardedState
    }

    #interstitialState
    #rewardedState
    #gameData

    initialize() {
        return Promise.resolve()
    }

    showInterstitial() {
        return new Promise(resolve => {
            resolve()
            this.#setInterstitialState(INTERSTITIAL_STATE.OPENED)
            this.#setInterstitialState(INTERSTITIAL_STATE.CLOSED)
        })
    }

    showRewarded() {
        return new Promise(resolve => {
            resolve()
            this.#setRewardedState(REWARDED_STATE.OPENED)
            this.#setRewardedState(REWARDED_STATE.REWARDED)
            this.#setRewardedState(REWARDED_STATE.CLOSED)
        })
    }

    getGameData(key) {
        return new Promise(resolve => {
            if (this.#gameData) {
                if (typeof this.#gameData[key] === 'undefined')
                    resolve(null)
                else
                    resolve(this.#gameData[key])

                return
            }

            try {
                let json = localStorage.getItem(LOCAL_STORAGE_GAME_DATA_KEY)
                if (json)
                    this.#gameData = JSON.parse(json)
            }
            catch (e) { }

            if (!this.#gameData || typeof this.#gameData[key] === 'undefined')
                resolve(null)
            else
                resolve(this.#gameData[key])
        })
    }

    setGameData(key, value) {
        if (!this.#gameData)
            this.#gameData = { }

        this.#gameData[key] = value

        return new Promise(resolve => {
            try {
                localStorage.setItem(LOCAL_STORAGE_GAME_DATA_KEY, JSON.stringify(this.#gameData))
            }
            catch (e) { }
            resolve()
        })
    }

    #setInterstitialState(state) {
        this.#interstitialState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.INTERSTITIAL_STATE_CHANGED, this.#interstitialState)
    }

    #setRewardedState(state) {
        this.#rewardedState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.REWARDED_STATE_CHANGED, this.#rewardedState)
    }

}

EventLite.mixin(MockPlatform.prototype)
export default MockPlatform