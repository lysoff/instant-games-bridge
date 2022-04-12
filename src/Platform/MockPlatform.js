import EventLite from 'event-lite'
import PlatformBase from './PlatformBase'
import { EVENT_NAME as ADVERTISEMENT_EVENT_NAME, INTERSTITIAL_STATE, REWARDED_STATE } from '../Advertisement'

const LOCAL_STORAGE_GAME_DATA_KEY = 'game_data'

class MockPlatform extends PlatformBase {

    get id() {
        return 'mock'
    }

    get isInviteFriendsSupported() {
        if (this.options && this.options.social && this.options.social.simulateInviteFriends)
            return this.options.social.simulateInviteFriends

        return false
    }

    get isCommunitySupported() {
        if (this.options && this.options.social && this.options.social.simulateJoinCommunity)
            return this.options.social.simulateJoinCommunity

        return false
    }

    get isShareSupported() {
        if (this.options && this.options.social && this.options.social.simulateShare)
            return this.options.social.simulateShare

        return false
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
        if (this.options && this.options.advertisement && this.options.advertisement.simulateInterstitial) {
            return new Promise(resolve => {
                resolve()
                this.#setInterstitialState(INTERSTITIAL_STATE.OPENED)
                this.#setInterstitialState(INTERSTITIAL_STATE.CLOSED)
            })
        } else
            return Promise.reject()
    }

    showRewarded() {
        if (this.options && this.options.advertisement && this.options.advertisement.simulateRewarded) {
            return new Promise(resolve => {
                resolve()
                this.#setRewardedState(REWARDED_STATE.OPENED)
                this.#setRewardedState(REWARDED_STATE.REWARDED)
                this.#setRewardedState(REWARDED_STATE.CLOSED)
            })
        } else
            return Promise.reject()
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
        return this.#saveGameData()
    }

    deleteGameData(key) {
        if (this.#gameData)
            delete this.#gameData[key]

        return this.#saveGameData()
    }

    inviteFriends() {
        if (this.isInviteFriendsSupported)
            return Promise.resolve()
        else
            return Promise.reject()
    }

    joinCommunity() {
        if (this.isCommunitySupported)
            return Promise.resolve()
        else
            return Promise.reject()
    }

    share() {
        if (this.isShareSupported)
            return Promise.resolve()
        else
            return Promise.reject()
    }

    #setInterstitialState(state) {
        this.#interstitialState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.INTERSTITIAL_STATE_CHANGED, this.#interstitialState)
    }

    #setRewardedState(state) {
        this.#rewardedState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.REWARDED_STATE_CHANGED, this.#rewardedState)
    }

    #saveGameData() {
        return new Promise(resolve => {
            try {
                localStorage.setItem(LOCAL_STORAGE_GAME_DATA_KEY, JSON.stringify(this.#gameData))
            }
            catch (e) { }
            resolve()
        })
    }
}

EventLite.mixin(MockPlatform.prototype)
export default MockPlatform