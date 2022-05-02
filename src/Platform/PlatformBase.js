import EventLite from 'event-lite'
import { EVENT_NAME as ADVERTISEMENT_EVENT_NAME, INTERSTITIAL_STATE, REWARDED_STATE } from '../Advertisement'

class PlatformBase {

    // platform
    get id() {
        return null
    }

    get sdk() {
        return this._sdk
    }

    get language() {
        let value = navigator.language
        if (typeof value === 'string')
            return value.substring(0, 2)

        return 'en'
    }

    get payload() {
        let url = new URL(window.location.href)
        return url.searchParams.get('payload')
    }

    get deviceType() {
        if (navigator && navigator.userAgent) {
            let userAgent = navigator.userAgent.toLowerCase()
            if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent))
                return 'mobile'

            if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP)))/.test(userAgent))
                return 'tablet'
        }

        return 'desktop'
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


    LOCAL_STORAGE_GAME_DATA_KEY = 'game_data'

    _isInitialized = false
    _initializationPromiseDecorator = null
    _sdk = null
    _localStorage = null

    _isPlayerAuthorized = false
    _authorizationPromiseDecorator = null
    _playerId = null
    _playerName = null
    _playerPhotos = []

    _gameData = null

    _showInterstitialPromiseDecorator = null
    _showRewardedPromiseDecorator = null
    _interstitialState = null
    _rewardedState = null

    _sharePromiseDecorator = null
    _inviteFriendsPromiseDecorator = null
    _joinCommunityPromiseDecorator = null
    _createPostPromiseDecorator = null
    _addToHomeScreenPromiseDecorator = null
    _addToFavoritesPromiseDecorator = null
    _ratePromiseDecorator = null


    constructor(options) {
        if (options)
            this._options = { ...options }

        try {
            this._localStorage = window.localStorage
        }
        catch (e) { }
    }

    initialize() {
        return Promise.resolve()
    }


    // player
    authorizePlayer() {
        return Promise.reject()
    }


    // game
    getGameData(key) {
        return new Promise(resolve => {
            this._loadGameDataFromLocalStorage()
                .finally(() => {
                    if (!this._gameData) {
                        resolve(null)
                        return
                    }

                    let data = this._gameData[key]
                    if (typeof data !== 'undefined')
                        resolve(data)
                    else
                        resolve(null)
                })
        })
    }

    setGameData(key, value) {
        if (!this._gameData)
            this._gameData = { }

        this._gameData[key] = value
        return this._saveGameDataToLocalStorage()
    }

    deleteGameData(key) {
        if (this._gameData) {
            delete this._gameData[key]
            return this._saveGameDataToLocalStorage()
        }

        return Promise.resolve()
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


    _loadGameDataFromLocalStorage() {
        return new Promise((resolve, reject) => {
            try {
                let json = this._localStorage.getItem(this.LOCAL_STORAGE_GAME_DATA_KEY)
                if (json)
                    this._gameData = JSON.parse(json)

                resolve()
            }
            catch (e) {
                reject(e)
            }
        })
    }

    _saveGameDataToLocalStorage() {
        return new Promise((resolve, reject) => {
            try {
                this._localStorage.setItem(this.LOCAL_STORAGE_GAME_DATA_KEY, JSON.stringify(this._gameData))
                resolve()
            }
            catch (e) {
                reject(e)
            }
        })
    }


    _setInterstitialState(state) {
        if (this._interstitialState === state)
            return

        this._interstitialState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.INTERSTITIAL_STATE_CHANGED, this._interstitialState)
    }

    _setRewardedState(state) {
        if (this._rewardedState === state)
            return

        this._rewardedState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.REWARDED_STATE_CHANGED, this._rewardedState)
    }

    _canShowAdvertisement() {
        if (this._interstitialState) {
            if (this._interstitialState !== INTERSTITIAL_STATE.CLOSED)
                return false
        }

        if (this._rewardedState) {
            if (this._rewardedState !== REWARDED_STATE.CLOSED && this._rewardedState !== REWARDED_STATE.FAILED)
                return false
        }

        return true
    }

}

EventLite.mixin(PlatformBase.prototype)
export default PlatformBase