import PlatformBridgeBase from './PlatformBridgeBase'
import { addJavaScript, waitFor } from '../common/utils'
import {
    PLATFORM_ID,
    ACTION_NAME,
    BANNER_STATE,
    INTERSTITIAL_STATE,
    REWARDED_STATE,
    STORAGE_TYPE,
    DEVICE_TYPE,
    PLATFORM_MESSAGE,
} from '../constants'

const SDK_URL = 'https://sdk.crazygames.com/crazygames-sdk-v1.js'

class CrazyGamesPlatformBridge extends PlatformBridgeBase {
    // platform
    get platformId() {
        return PLATFORM_ID.CRAZY_GAMES
    }

    get platformLanguage() {
        if (this.#userInfo) {
            return this.#userInfo.countryCode.toLowerCase()
        }

        return super.platformLanguage
    }

    // device
    get deviceType() {
        if (this.#userInfo) {
            const userDeviceType = this.#userInfo.device.type.toLowerCase()
            if ([
                DEVICE_TYPE.DESKTOP,
                DEVICE_TYPE.MOBILE,
                DEVICE_TYPE.TABLET,
            ].includes(userDeviceType)
            ) {
                return userDeviceType
            }
        }

        return super.deviceType
    }

    // social
    get isExternalLinksAllowed() {
        return true
    }

    #userInfo = null

    #currentAdvertisementIsRewarded = false

    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            addJavaScript(SDK_URL).then(() => {
                waitFor('CrazyGames', 'CrazySDK', 'getInstance').then(() => {
                    this._platformSdk = window.CrazyGames.CrazySDK.getInstance()

                    this._platformSdk.addEventListener('initialized', (data) => {
                        this.#userInfo = data.userInfo
                        this._isInitialized = true
                        this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                    })

                    this._platformSdk.addEventListener('adStarted', () => {
                        if (this.#currentAdvertisementIsRewarded) {
                            this._setRewardedState(REWARDED_STATE.OPENED)
                        } else {
                            this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
                        }
                    })

                    this._platformSdk.addEventListener('adFinished', () => {
                        if (this.#currentAdvertisementIsRewarded) {
                            this._setRewardedState(REWARDED_STATE.REWARDED)
                            this._setRewardedState(REWARDED_STATE.CLOSED)
                        } else {
                            this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
                        }
                    })

                    this._platformSdk.addEventListener('adError', () => {
                        if (this.#currentAdvertisementIsRewarded) {
                            this._setRewardedState(REWARDED_STATE.FAILED)
                        } else {
                            this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
                        }
                    })

                    this._platformSdk.addEventListener('bannerRendered', () => {
                        this._setBannerState(BANNER_STATE.SHOWN)
                    })

                    this._platformSdk.addEventListener('bannerError', () => {
                        this._setBannerState(BANNER_STATE.FAILED)
                    })

                    this._defaultStorageType = STORAGE_TYPE.LOCAL_STORAGE
                    this._isBannerSupported = true
                    this._platformSdk.init()
                })
            })
        }

        return promiseDecorator.promise
    }

    // platform
    sendMessage(message) {
        switch (message) {
        case PLATFORM_MESSAGE.IN_GAME_LOADING_STARTED: {
            this._platformSdk.sdkGameLoadingStart()
            return Promise.resolve()
        }
        case PLATFORM_MESSAGE.IN_GAME_LOADING_STOPPED: {
            this._platformSdk.sdkGameLoadingStop()
            return Promise.resolve()
        }
        case PLATFORM_MESSAGE.GAMEPLAY_STARTED: {
            this._platformSdk.gameplayStart()
            return Promise.resolve()
        }
        case PLATFORM_MESSAGE.GAMEPLAY_STOPPED: {
            this._platformSdk.gameplayStop()
            return Promise.resolve()
        }
        case PLATFORM_MESSAGE.PLAYER_GOT_ACHIEVEMENT: {
            this._platformSdk.happytime()
            return Promise.resolve()
        }
        default: {
            return super.sendMessage(message)
        }
        }
    }

    // advertisement
    showBanner(options) {
        if (options && options.containerId && typeof options.containerId === 'string') {
            this._platformSdk.requestResponsiveBanner([options.containerId])
        } else {
            this._setBannerState(BANNER_STATE.FAILED)
        }
    }

    hideBanner() {
        this._platformSdk.clearAllBanners()
        this._setBannerState(BANNER_STATE.HIDDEN)
    }

    showInterstitial() {
        this.#currentAdvertisementIsRewarded = false
        this._platformSdk.requestAd('midgame')
    }

    showRewarded() {
        this.#currentAdvertisementIsRewarded = true
        this._platformSdk.requestAd('rewarded')
    }
}

export default CrazyGamesPlatformBridge
