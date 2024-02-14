import PlatformBridgeBase from './PlatformBridgeBase'
import { addJavaScript, waitFor } from '../common/utils'
import {
    PLATFORM_ID,
    REWARDED_STATE,
    INTERSTITIAL_STATE,
    ACTION_NAME,
} from '../constants'

export const LOGIN_STATUS = {
    NOT_AUTHORIZED: 0,
    NOT_REGISTRATED: 1,
    REGISTRATED: 2,
    PREMIUM_REGISTRATED: 3,
}

const getSdkUrl = (gameId) => `//vkplay.ru/app/${gameId}/static/mailru.core.js`

class VkPlayPlatformBridge extends PlatformBridgeBase {
    _loginStatus = 0

    // platform
    get platformId() {
        return PLATFORM_ID.VK_PLAY
    }

    // player
    get isPlayerAuthorizationSupported() {
        return true
    }

    get #callbacks() {
        return {
            appid: this.#gameId,
            userProfileCallback: (profile) => this.#setProfile(profile),
            getLoginStatusCallback: (status) => this.#setLoginStatus(status),
            registerUserCallback: (registerInfo) => this.#setRegistrationInfo(registerInfo),
            adsCallback: (adsIfo) => this.#setAdsInfo(adsIfo),
            getGameInventoryItemsCallback: (inventoryItems) => this.#setInventoryItems(inventoryItems),
            paymentReceivedCallback: (inventoryItems) => this.#setPaymentStatus(inventoryItems),
            paymentWindowClosedCallback: (info) => this.#setPaymentWindowClosedStatus(info),
        }
    }

    #gameId = null

    #setProfile(profileData) {
        if (profileData.status === 'error') {
            this._rejectPromiseDecorator(ACTION_NAME.GET_PROFILE, profileData.errmsg)
            return
        }

        this._resolvePromiseDecorator(ACTION_NAME.GET_PROFILE, {
            _playerId: profileData.uid,
            _playerName: profileData.nick,
            _playerPhotos: [profileData.avatar],
        })
    }

    #setLoginStatus(loginInfo) {
        if (loginInfo.status === 'error') {
            this._rejectPromiseDecorator(ACTION_NAME.GET_LOGIN_STATUS, loginInfo.errmsg)
            return
        }

        this._resolvePromiseDecorator(ACTION_NAME.GET_LOGIN_STATUS, loginInfo)
    }

    #setRegistrationInfo(regInfo) {
        if (regInfo.status === 'error') {
            this._rejectPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER, regInfo.errmsg)
            return
        }

        this._resolvePromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
    }

    #setAdsInfo(adsInfo) {
        if (adsInfo.type === 'adError') {
            this._rejectPromiseDecorator(ACTION_NAME.GET_ADVERTISEMENT, adsInfo.code)
            return
        }

        this._resolvePromiseDecorator(ACTION_NAME.GET_ADVERTISEMENT)
    }

    #setInventoryItems(inventoryItems) {
        if (inventoryItems?.length === 0) {
            this._rejectPromiseDecorator(ACTION_NAME.GET_CATALOG)
            return
        }

        this._resolvePromiseDecorator(ACTION_NAME.GET_CATALOG, inventoryItems)
    }

    #setPaymentStatus(paymentStatus) {
        if (!paymentStatus?.uid) {
            this._rejectPromiseDecorator(ACTION_NAME.PURCHASE)
            return
        }

        this._resolvePromiseDecorator(ACTION_NAME.PURCHASE)
    }

    #setPaymentWindowClosedStatus() {
        this._resolvePromiseDecorator(ACTION_NAME.PURCHASE)
    }

    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            this.#gameId = this._options.gameId

            addJavaScript(getSdkUrl(this.#gameId))
                .then(() => {
                    waitFor('iframeApi')
                        .then(() => {
                            if (!window.iframeApi) {
                                const error = 'Cannot find iframeApi function'
                                this._rejectPromiseDecorator(ACTION_NAME.INITIALIZE, error)
                            }
                            window.iframeApi(this.#callbacks)
                                .then((sdk) => {
                                    this._platformSdk = sdk
                                    const getLoginStatusPromise = this.#getLoginStatus()
                                    const getPlayerPromise = this.#getProfile()

                                    Promise
                                        .all([getLoginStatusPromise, getPlayerPromise])
                                        .finally(() => {
                                            this._isInitialized = true
                                            this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                                        })
                                })
                        })
                })
        }

        return promiseDecorator.promise
    }

    // payments

    getPaymentsCatalog() {
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_CATALOG)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_CATALOG)
            this._platformSdk.getGameInventoryItems()
        }
        return promiseDecorator.promise
    }

    purchase(options) {
        if (!options) {
            return Promise.reject()
        }
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.PURCHASE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.PURCHASE)
            this._platformSdk.paymentFrameItem(options)
        }
        return promiseDecorator.promise
    }

    // advertisement

    showInterstitial() {
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_ADVERTISEMENT)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_ADVERTISEMENT)
            this._platformSdk.showAds({
                interstitial: true,
            })
            this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
        }
        promiseDecorator.promise.then(() => {
            this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
        })
            .catch(() => {
                this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
            })
    }

    showRewarded() {
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_ADVERTISEMENT)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_ADVERTISEMENT)
            this._platformSdk.showAds({
                interstitial: false,
            })
            this._setRewardedState(REWARDED_STATE.OPENED)
        }
        promiseDecorator.promise.then(() => {
            this._setRewardedState(REWARDED_STATE.REWARDED)
            this._setRewardedState(REWARDED_STATE.CLOSED)
        })
            .catch(() => {
                this._setRewardedState(REWARDED_STATE.FAILED)
            })
    }

    // player

    authorizePlayer() {
        if (this._isPlayerAuthorized) {
            return Promise.resolve()
        }
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
            if (this._loginStatus === LOGIN_STATUS.NOT_AUTHORIZED) {
                this._platformSdk.authUser()
            }
            if (this._loginStatus === LOGIN_STATUS.NOT_REGISTRATED) {
                this._platformSdk.registerUser()
            }
        }
        return promiseDecorator.promise.then(() => this._platformSdk.reloadWindow())
    }

    #getProfile() {
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_PROFILE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_PROFILE)
            this._platformSdk.userProfile()
        }
        return promiseDecorator.promise.then((profile) => {
            const {
                _playerId,
                _playerName,
                _playerPhotos,
            } = profile
            this._playerId = _playerId
            this._playerName = _playerName
            this._playerPhotos = _playerPhotos
        })
    }

    #getLoginStatus() {
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_LOGIN_STATUS)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_LOGIN_STATUS)
            this._platformSdk.getLoginStatus()
        }
        return promiseDecorator.promise.then((loginInfo) => {
            this._loginStatus = loginInfo.loginStatus
            this._isPlayerAuthorized = loginInfo.loginStatus === LOGIN_STATUS.REGISTRATED
        || loginInfo.loginStatus === LOGIN_STATUS.PREMIUM_REGISTRATED
        })
    }
}

export default VkPlayPlatformBridge
