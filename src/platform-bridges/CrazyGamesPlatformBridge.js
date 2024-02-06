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

const SDK_URL = 'https://sdk.crazygames.com/crazygames-sdk-v3.js'

class CrazyGamesPlatformBridge extends PlatformBridgeBase {
    // platform
    get platformId() {
        return PLATFORM_ID.CRAZY_GAMES
    }

    get platformLanguage() {
        if (this.#systemInfo) {
            return this.#systemInfo.countryCode.toLowerCase()
        }

        return super.platformLanguage
    }

    // device
    get deviceType() {
        if (this.#systemInfo) {
            const userDeviceType = this.#systemInfo.device.type.toLowerCase()
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

    #systemInfo = null

    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            addJavaScript(SDK_URL)
                .then(() => {
                    waitFor('CrazyGames', 'SDK')
                        .then(async () => {
                            try {
                                await window.CrazyGames.SDK.init();
                                this._platformSdk = window.CrazyGames.SDK
                                this._defaultStorageType = STORAGE_TYPE.LOCAL_STORAGE
                                this.#systemInfo = this._platformSdk?.user?.systemInfo
                                this._isBannerSupported = true
                                this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                            } catch (e) {
                                this._rejectPromiseDecorator(ACTION_NAME.INITIALIZE)
                            }
                        })
                })
        }

        return promiseDecorator.promise
    }

    // platform
    sendMessage(message) {
        switch (message) {
            case PLATFORM_MESSAGE.IN_GAME_LOADING_STARTED: {
                this._platformSdk.game.loadingStart()
                return Promise.resolve()
            }
            case PLATFORM_MESSAGE.IN_GAME_LOADING_STOPPED: {
                this._platformSdk.game.loadingStop()
                return Promise.resolve()
            }
            case PLATFORM_MESSAGE.GAMEPLAY_STARTED: {
                this._platformSdk.game.gameplayStart()
                return Promise.resolve()
            }
            case PLATFORM_MESSAGE.GAMEPLAY_STOPPED: {
                this._platformSdk.game.gameplayStop()
                return Promise.resolve()
            }
            case PLATFORM_MESSAGE.PLAYER_GOT_ACHIEVEMENT: {
                this._platformSdk.game.happytime()
                return Promise.resolve()
            }
            default: {
                return super.sendMessage(message)
            }
        }
    }

    // advertisement
    async showBanner(options) {
        if (options && options.containerId && typeof options.containerId === 'string') {
            try {
                await this._platformSdk.banner.requestResponsiveBanner([options.containerId])
                this._setBannerState(BANNER_STATE.SHOWN)
            } catch (e) {
                this._setBannerState(BANNER_STATE.FAILED)
            }
        } else {
            this._setBannerState(BANNER_STATE.FAILED)
        }
    }

    hideBanner() {
        this._platformSdk.banner.clearAllBanners()
        this._setBannerState(BANNER_STATE.HIDDEN)
    }

    showInterstitial() {
        this._platformSdk.ad.requestAd('midgame', {
            adStarted: () => {
                this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
            },
            adFinished: () => {
                this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
            },
            adError: () => {
                this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
            },
        })
    }

    showRewarded() {
        this._platformSdk.ad.requestAd('rewarded', {
            adStarted: () => {
                this._setRewardedState(REWARDED_STATE.OPENED)
            },
            adFinished: () => {
                this._setRewardedState(REWARDED_STATE.REWARDED)
                this._setRewardedState(REWARDED_STATE.CLOSED)
            },
            adError: () => {
                this._setRewardedState(REWARDED_STATE.FAILED)
            },
        })
    }
}

export default CrazyGamesPlatformBridge
