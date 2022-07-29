import EventLite from 'event-lite'
import { PLATFORM_ID, EVENT_NAME, INTERSTITIAL_STATE, REWARDED_STATE, STORAGE_TYPE, ERROR, VISIBILITY_STATE } from '../constants'
import PromiseDecorator from '../common/PromiseDecorator'

class PlatformBridgeBase {

    // platform
    get platformId() {
        return PLATFORM_ID.MOCK
    }

    get platformSdk() {
        return this._platformSdk
    }

    get platformLanguage() {
        let value = navigator.language
        if (typeof value === 'string') {
            return value.substring(0, 2)
        }

        return 'en'
    }

    get platformPayload() {
        let url = new URL(window.location.href)
        return url.searchParams.get('payload')
    }


    // game
    get visibilityState() {
        return this._visibilityState
    }


    // player
    get isPlayerAuthorizationSupported() {
        return false
    }

    get isPlayerAuthorized() {
        return this._isPlayerAuthorized
    }

    get playerId() {
        return this._playerId
    }

    get playerName() {
        return this._playerName
    }

    get playerPhotos() {
        return this._playerPhotos
    }


    // storage
    get defaultStorageType() {
        return this._defaultStorageType
    }


    // advertisement
    get interstitialState() {
        return this._interstitialState
    }

    get rewardedState() {
        return this._rewardedState
    }


    // social
    get isInviteFriendsSupported() {
        return false
    }

    get isJoinCommunitySupported() {
        return false
    }

    get isShareSupported() {
        return false
    }

    get isCreatePostSupported() {
        return false
    }

    get isAddToHomeScreenSupported() {
        return false
    }

    get isAddToFavoritesSupported() {
        return false
    }

    get isRateSupported() {
        return false
    }


    // device
    get deviceType() {
        if (navigator && navigator.userAgent) {
            let userAgent = navigator.userAgent.toLowerCase()
            if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
                return 'mobile'
            }

            if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP)))/.test(userAgent)) {
                return 'tablet'
            }
        }

        return 'desktop'
    }


    // leaderboard
    get isLeaderboardSupported() {
        return false
    }

    get isLeaderboardNativePopupSupported() {
        return false
    }

    get isLeaderboardMultipleBoardsSupported() {
        return false
    }

    get isLeaderboardSetScoreSupported() {
        return false
    }

    get isLeaderboardGetScoreSupported() {
        return false
    }

    get isLeaderboardGetEntriesSupported() {
        return false
    }


    _isInitialized = false
    _platformSdk = null
    _isPlayerAuthorized = false
    _playerId = null
    _playerName = null
    _playerPhotos = []
    _visibilityState = null
    _localStorage = null
    _defaultStorageType = STORAGE_TYPE.LOCAL_STORAGE
    _platformStorageCachedData = null
    _interstitialState = null
    _rewardedState = null

    #promiseDecorators = { }


    constructor(options) {
        try { this._localStorage = window.localStorage } catch (e) { }

        this._visibilityState = document.visibilityState === 'visible' ? VISIBILITY_STATE.VISIBLE : VISIBILITY_STATE.HIDDEN

        document.addEventListener('visibilitychange', () => {
            this._visibilityState = document.visibilityState === 'visible' ? VISIBILITY_STATE.VISIBLE : VISIBILITY_STATE.HIDDEN
            this.emit(EVENT_NAME.VISIBILITY_STATE_CHANGED, this._visibilityState)
        })

        if (options) {
            this._options = { ...options }
        }
    }

    initialize() {
        return Promise.resolve()
    }


    // player
    authorizePlayer(options) {
        return Promise.reject()
    }


    // storage
    isStorageSupported(storageType) {
        switch (storageType) {
            case STORAGE_TYPE.LOCAL_STORAGE: {
                return this._localStorage !== null
            }
            case STORAGE_TYPE.PLATFORM_INTERNAL: {
                return false
            }
            default: {
                return false
            }
        }
    }

    getDataFromStorage(key, storageType) {
        switch (storageType) {
            case STORAGE_TYPE.LOCAL_STORAGE: {
                if (this._localStorage) {
                    if (Array.isArray(key)) {
                        let values = []

                        for (let i = 0; i < key.length; i++) {
                            values.push(this._getDataFromLocalStorage(key[i]))
                        }

                        return Promise.resolve(values)
                    }

                    let value = this._getDataFromLocalStorage(key)
                    return Promise.resolve(value)
                } else {
                    return Promise.reject(ERROR.STORAGE_NOT_SUPPORTED)
                }
            }
            default: {
                return Promise.reject(ERROR.STORAGE_NOT_SUPPORTED)
            }
        }
    }

    setDataToStorage(key, value, storageType) {
        switch (storageType) {
            case STORAGE_TYPE.LOCAL_STORAGE: {
                if (this._localStorage) {
                    if (Array.isArray(key)) {
                        for (let i = 0; i < key.length; i++) {
                            this._setDataToLocalStorage(key[i], value[i])
                        }
                        return Promise.resolve()
                    }

                    this._setDataToLocalStorage(key, value)
                    return Promise.resolve()
                } else {
                    return Promise.reject(ERROR.STORAGE_NOT_SUPPORTED)
                }
            }
            default: {
                return Promise.reject(ERROR.STORAGE_NOT_SUPPORTED)
            }
        }
    }

    deleteDataFromStorage(key, storageType) {
        switch (storageType) {
            case STORAGE_TYPE.LOCAL_STORAGE: {
                if (this._localStorage) {
                    if (Array.isArray(key)) {
                        for (let i = 0; i < key.length; i++) {
                            this._deleteDataFromLocalStorage(key[i])
                        }
                        return Promise.resolve()
                    }

                    this._deleteDataFromLocalStorage(key)
                    return Promise.resolve()
                } else {
                    return Promise.reject(ERROR.STORAGE_NOT_SUPPORTED)
                }
            }
            default: {
                return Promise.reject(ERROR.STORAGE_NOT_SUPPORTED)
            }
        }
    }


    // advertisement
    showInterstitial() {
        return Promise.reject()
    }

    showRewarded() {
        return Promise.reject()
    }


    // social
    inviteFriends() {
        return Promise.reject()
    }

    joinCommunity() {
        return Promise.reject()
    }

    share() {
        return Promise.reject()
    }

    createPost(message) {
        return Promise.reject()
    }

    addToHomeScreen() {
        return Promise.reject()
    }

    addToFavorites() {
        return Promise.reject()
    }

    rate() {
        return Promise.reject()
    }


    // leaderboard
    setLeaderboardScore(options) {
        return Promise.reject()
    }

    getLeaderboardScore(options) {
        return Promise.reject()
    }

    getLeaderboardEntries(options) {
        return Promise.reject()
    }

    showLeaderboardNativePopup(options) {
        return Promise.reject()
    }


    _getDataFromLocalStorage(key) {
        let value = this._localStorage.getItem(key)

        if (typeof value === 'string') {
            try {
                value = JSON.parse(value)
            }
            catch (e) { }
        }

        return value
    }

    _setDataToLocalStorage(key, value) {
        if (typeof value === 'object') {
            value = JSON.stringify(value)
        }

        this._localStorage.setItem(key, value)
    }

    _deleteDataFromLocalStorage(key) {
        this._localStorage.removeItem(key)
    }


    _setInterstitialState(state) {
        if (this._interstitialState === state && state !== INTERSTITIAL_STATE.FAILED) {
            return
        }

        this._interstitialState = state
        this.emit(EVENT_NAME.INTERSTITIAL_STATE_CHANGED, this._interstitialState)
    }

    _setRewardedState(state) {
        if (this._rewardedState === state && state !== REWARDED_STATE.FAILED) {
            return
        }

        this._rewardedState = state
        this.emit(EVENT_NAME.REWARDED_STATE_CHANGED, this._rewardedState)
    }

    _canShowAdvertisement() {
        if (this._interstitialState && this._interstitialState === INTERSTITIAL_STATE.OPENED) {
            return false
        } else if (this._rewardedState && (this._rewardedState === REWARDED_STATE.OPENED || this._rewardedState !== REWARDED_STATE.REWARDED)) {
            return false
        }

        return true
    }

    _createPromiseDecorator(actionName) {
        let promiseDecorator = new PromiseDecorator()
        this.#promiseDecorators[actionName] = promiseDecorator
        return promiseDecorator
    }

    _getPromiseDecorator(actionName) {
        return this.#promiseDecorators[actionName]
    }

    _resolvePromiseDecorator(id, data) {
        if (this.#promiseDecorators[id]) {
            this.#promiseDecorators[id].resolve(data)
            delete this.#promiseDecorators[id]
        }
    }

    _rejectPromiseDecorator(id, error) {
        if (this.#promiseDecorators[id]) {
            this.#promiseDecorators[id].reject(error)
            delete this.#promiseDecorators[id]
        }
    }
}

EventLite.mixin(PlatformBridgeBase.prototype)
export default PlatformBridgeBase