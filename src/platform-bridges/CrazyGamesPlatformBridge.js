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
        if (this.#isUserAccountAvailable) {
            return this._platformSdk.user.systemInfo.countryCode.toLowerCase()
        }

        return super.platformLanguage
    }

    // player
    get isPlayerAuthorizationSupported() {
        return this.#isUserAccountAvailable
    }

    // device
    get deviceType() {
        if (this.#isUserAccountAvailable) {
            const userDeviceType = this._platformSdk.user.systemInfo.device.type.toLowerCase()
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

    #currentAdvertisementIsRewarded = false

    #isUserAccountAvailable = false

    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            addJavaScript(SDK_URL).then(() => {
                waitFor('CrazyGames', 'SDK', 'init').then(() => {
                    this._platformSdk = window.CrazyGames.SDK

                    this._defaultStorageType = STORAGE_TYPE.LOCAL_STORAGE
                    this._isBannerSupported = true
                    this._platformSdk.init().then(() => {
                        this.#isUserAccountAvailable = this._platformSdk.user.isUserAccountAvailable
                        const getPlayerInfoPromise = this.#getPlayer()

                        Promise
                            .all([getPlayerInfoPromise])
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

    // player
    authorizePlayer() {
        if (!this.#isUserAccountAvailable) {
            return Promise.reject()
        }

        if (this._isPlayerAuthorized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
            this._platformSdk.user.showAuthPrompt()
                .then(() => {
                    this.#getPlayer()
                        .then(() => {
                            this._resolvePromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
                        })
                })
                .catch((error) => {
                    this._rejectPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER, error)
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
    showBanner(options) {
        if (options && options.containerId && typeof options.containerId === 'string') {
            this._platformSdk.banner.requestResponsiveBanner([options.containerId])
                .then(() => {
                    this._setBannerState(BANNER_STATE.SHOWN)
                })
                .catch(() => {
                    this._setBannerState(BANNER_STATE.FAILED)
                })
        } else {
            this._setBannerState(BANNER_STATE.FAILED)
        }
    }

    hideBanner() {
        this._platformSdk.banner.clearAllBanners()
        this._setBannerState(BANNER_STATE.HIDDEN)
    }

    showInterstitial() {
        this.#currentAdvertisementIsRewarded = false
        this._platformSdk.ad.requestAd('midgame', this.#adCallbacks)
    }

    showRewarded() {
        this.#currentAdvertisementIsRewarded = true
        this._platformSdk.ad.requestAd('rewarded', this.#adCallbacks)
    }

    #adCallbacks = {
        adStarted: () => {
            if (this.#currentAdvertisementIsRewarded) {
                this._setRewardedState(REWARDED_STATE.OPENED)
            } else {
                this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
            }
        },
        adFinished: () => {
            if (this.#currentAdvertisementIsRewarded) {
                this._setRewardedState(REWARDED_STATE.REWARDED)
                this._setRewardedState(REWARDED_STATE.CLOSED)
            } else {
                this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
            }
        },
        adError: () => {
            if (this.#currentAdvertisementIsRewarded) {
                this._setRewardedState(REWARDED_STATE.FAILED)
            } else {
                this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
            }
        },
    }

    #getPlayer() {
        if (!this.#isUserAccountAvailable) {
            return Promise.reject()
        }

        return new Promise((resolve) => {
            this._platformSdk.user.getUser()
                .then((player) => {
                    this._isPlayerAuthorized = player !== null

                    this._defaultStorageType = this._isPlayerAuthorized
                        ? STORAGE_TYPE.PLATFORM_INTERNAL
                        : STORAGE_TYPE.LOCAL_STORAGE

                    if (this._isPlayerAuthorized && player.username) {
                        this._playerName = player.username
                    }

                    if (this._isPlayerAuthorized && player.profilePictureUrl) {
                        this._playerPhotos = [player.profilePictureUrl]
                    }
                })
                .finally(() => {
                    resolve()
                })
        })
    }
}

export default CrazyGamesPlatformBridge
