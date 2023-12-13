import PlatformBridgeBase from './PlatformBridgeBase'
import { addJavaScript, waitFor } from '../common/utils'
import {
    PLATFORM_ID,
    ACTION_NAME,
    INTERSTITIAL_STATE,
    REWARDED_STATE,
    STORAGE_TYPE,
    DEVICE_TYPE,
    BANNER_STATE,
    PLATFORM_MESSAGE
} from '../constants'

const SDK_URL = 'https://yandex.ru/games/sdk/v2'

class YandexPlatformBridge extends PlatformBridgeBase {

    // platform
    get platformId() {
        return PLATFORM_ID.YANDEX
    }

    get platformLanguage() {
        if (this._platformSdk) {
            return this._platformSdk.environment.i18n.lang.toLowerCase()
        }

        return super.platformLanguage
    }

    get platformTld() {
        if (this._platformSdk) {
            return this._platformSdk.environment.i18n.tld.toLowerCase()
        }

        return super.platformTld
    }


    // device
    get deviceType() {
        if (this._platformSdk) {
            switch (this._platformSdk.deviceInfo.type) {
                case DEVICE_TYPE.DESKTOP: {
                    return DEVICE_TYPE.DESKTOP
                }
                case DEVICE_TYPE.MOBILE: {
                    return DEVICE_TYPE.MOBILE
                }
                case DEVICE_TYPE.TABLET: {
                    return DEVICE_TYPE.TABLET
                }
                case DEVICE_TYPE.TV: {
                    return DEVICE_TYPE.TV
                }
            }
        }

        return super.deviceType
    }


    // player
    get isPlayerAuthorizationSupported() {
        return true
    }


    // social
    get isAddToHomeScreenSupported() {
        return this.#isAddToHomeScreenSupported
    }

    get isRateSupported() {
        return true
    }


    // leaderboard
    get isLeaderboardSupported() {
        return true
    }

    get isLeaderboardMultipleBoardsSupported() {
        return true
    }

    get isLeaderboardSetScoreSupported() {
        return true
    }

    get isLeaderboardGetScoreSupported() {
        return true
    }

    get isLeaderboardGetEntriesSupported() {
        return true
    }

    //payments
    get isPaymentsSupported() {
        return true
    }


    #isAddToHomeScreenSupported = false
    #yandexPlayer = null
    #leaderboards = null
    #payments = null


    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            addJavaScript(SDK_URL).then(() => {
                waitFor('YaGames', 'init').then(() => {
                    window.YaGames.init().then(sdk => {
                        this._platformSdk = sdk

                        let getPlayerPromise = this.#getPlayer()
                        let getSafeStoragePromise = this._platformSdk.getStorage()
                            .then(safeStorage => {
                                this._localStorage = safeStorage
                            })

                        let checkAddToHomeScreenSupportedPromise = this._platformSdk.shortcut.canShowPrompt()
                            .then(prompt => {
                                this.#isAddToHomeScreenSupported = prompt.canShow
                            })

                        let checkAddToHomeScreenSupportedTimeoutPromise = new Promise(resolve => { setTimeout(resolve, 1000) })
                        let checkAddToHomeScreenSupportedRacePromise = Promise.race([checkAddToHomeScreenSupportedPromise, checkAddToHomeScreenSupportedTimeoutPromise])

                        let getLeaderboardsPromise = this._platformSdk.getLeaderboards()
                            .then(leaderboards => {
                                this.#leaderboards = leaderboards
                            })

                        let getPaymentsPromise = this._platformSdk.getPayments()
                            .then(payments => {
                                this.#payments = payments
                            })

                        this._isBannerSupported = true
                        let getBannerStatePromise = this._platformSdk.adv.getBannerAdvStatus()
                            .then(data => {
                                if (data.stickyAdvIsShowing) {
                                    this._setBannerState(BANNER_STATE.SHOWN)
                                }
                            })

                        Promise.all([getPlayerPromise, getSafeStoragePromise, checkAddToHomeScreenSupportedRacePromise, getLeaderboardsPromise, getBannerStatePromise, getPaymentsPromise])
                            .finally(() => {
                                this._isInitialized = true

                                this._defaultStorageType = this._isPlayerAuthorized
                                    ? STORAGE_TYPE.PLATFORM_INTERNAL
                                    : STORAGE_TYPE.LOCAL_STORAGE

                                this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                            })
                    })
                })
            })
        }

        return promiseDecorator.promise
    }


    // platform
    sendMessage(message) {
        switch (message) {
            case PLATFORM_MESSAGE.GAME_READY: {
                this._platformSdk.features.LoadingAPI?.ready()
                return Promise.resolve()
            }
        }

        return super.sendMessage(message)
    }


    // player
    authorizePlayer(options) {
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)

            if (this._isPlayerAuthorized) {
                this.#getPlayer(options).then(() => {
                    this._resolvePromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
                })
            } else {
                this._platformSdk.auth.openAuthDialog()
                    .then(() => {
                        this.#getPlayer(options).then(() => {
                            this._resolvePromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
                        })
                    })
                    .catch(error => {
                        this._rejectPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER, error)
                    })
            }
        }

        return promiseDecorator.promise
    }


    // storage
    isStorageSupported(storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return true
        }

        return super.isStorageSupported(storageType)
    }

    isStorageAvailable(storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return this._isPlayerAuthorized
        }

        return super.isStorageAvailable(storageType)
    }

    getDataFromStorage(key, storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return new Promise((resolve, reject) => {
                if (this._platformStorageCachedData) {
                    if (Array.isArray(key)) {
                        let values = []

                        for (let i = 0; i < key.length; i++) {
                            let value = typeof this._platformStorageCachedData[key[i]] === 'undefined'
                                ? null
                                : this._platformStorageCachedData[key[i]]

                            values.push(value)
                        }

                        resolve(values)
                        return
                    }

                    resolve(typeof this._platformStorageCachedData[key] === 'undefined' ? null : this._platformStorageCachedData[key])
                    return
                }

                if (this.#yandexPlayer) {
                    this.#yandexPlayer.getData()
                        .then(data => {
                            this._platformStorageCachedData = data

                            if (Array.isArray(key)) {
                                let values = []

                                for (let i = 0; i < key.length; i++) {
                                    let value = typeof this._platformStorageCachedData[key[i]] === 'undefined'
                                        ? null
                                        : this._platformStorageCachedData[key[i]]

                                    values.push(value)
                                }

                                resolve(values)
                                return
                            }

                            resolve(typeof this._platformStorageCachedData[key] === 'undefined' ? null : this._platformStorageCachedData[key])
                        })
                        .catch(error => {
                            reject(error)
                        })
                } else {
                    reject()
                }
            })
        }

        return super.getDataFromStorage(key, storageType)
    }

    setDataToStorage(key, value, storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return new Promise((resolve, reject) => {
                if (this.#yandexPlayer) {
                    let data = this._platformStorageCachedData !== null
                        ? { ...this._platformStorageCachedData }
                        : { }

                    if (Array.isArray(key)) {
                        for (let i = 0; i < key.length; i++) {
                            data[key[i]] = value[i]
                        }
                    } else {
                        data[key] = value
                    }

                    this.#yandexPlayer.setData(data)
                        .then(() => {
                            this._platformStorageCachedData = data
                            resolve()
                        })
                        .catch(error => {
                            reject(error)
                        })
                } else {
                    reject()
                }
            })
        }

        return super.setDataToStorage(key, value, storageType)
    }

    deleteDataFromStorage(key, storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return new Promise((resolve, reject) => {
                if (this.#yandexPlayer) {
                    let data = this._platformStorageCachedData !== null
                        ? { ...this._platformStorageCachedData }
                        : { }

                    if (Array.isArray(key)) {
                        for (let i = 0; i < key.length; i++) {
                            delete data[key[i]]
                        }
                    } else {
                        delete data[key]
                    }

                    this.#yandexPlayer.setData(data)
                        .then(() => {
                            this._platformStorageCachedData = data
                            resolve()
                        })
                        .catch(error => {
                            reject(error)
                        })
                } else {
                    reject()
                }
            })
        }

        return super.deleteDataFromStorage(key, storageType)
    }


    // advertisement
    showBanner(options) {
        this._platformSdk.adv.showBannerAdv()
            .then(data => {
                if (data.stickyAdvIsShowing) {
                    this._setBannerState(BANNER_STATE.SHOWN)
                } else {
                    this._setBannerState(BANNER_STATE.FAILED)
                }
            })
            .catch(error => {
                this._setBannerState(BANNER_STATE.FAILED)
            })
    }

    hideBanner() {
        this._platformSdk.adv.hideBannerAdv()
            .then(data => {
                if (!data.stickyAdvIsShowing) {
                    this._setBannerState(BANNER_STATE.HIDDEN)
                }
            })
    }

    showInterstitial() {
        this._platformSdk.adv.showFullscreenAdv({
            callbacks: {
                onOpen: () => {
                    this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
                },
                onClose: wasShown => {
                    if (wasShown) {
                        this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
                    } else {
                        this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
                    }
                }
            }
        })
    }

    showRewarded() {
        this._platformSdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    this._setRewardedState(REWARDED_STATE.OPENED)
                },
                onRewarded:  () => {
                    this._setRewardedState(REWARDED_STATE.REWARDED)
                },
                onClose: () => {
                    this._setRewardedState(REWARDED_STATE.CLOSED)
                },
                onError: error => {
                    this._setRewardedState(REWARDED_STATE.FAILED)
                }
            }
        })
    }


    // social
    addToHomeScreen() {
        if (!this.isAddToHomeScreenSupported) {
            return Promise.reject()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.ADD_TO_HOME_SCREEN)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.ADD_TO_HOME_SCREEN)

            this._platformSdk.shortcut.showPrompt()
                .then(result => {
                    if (result.outcome === 'accepted') {
                        this._resolvePromiseDecorator(ACTION_NAME.ADD_TO_HOME_SCREEN)
                        return
                    }

                    this._rejectPromiseDecorator(ACTION_NAME.ADD_TO_HOME_SCREEN)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.ADD_TO_HOME_SCREEN, error)
                })
        }

        return promiseDecorator.promise
    }

    rate() {
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.RATE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.RATE)

            this._platformSdk.feedback.canReview()
                .then(result => {
                    if (result.value) {
                        this._platformSdk.feedback.requestReview()
                            .then(({ feedbackSent }) => {
                                if (feedbackSent) {
                                    this._resolvePromiseDecorator(ACTION_NAME.RATE)
                                    return
                                }

                                this._rejectPromiseDecorator(ACTION_NAME.RATE)
                            })
                            .catch(error => {
                                this._rejectPromiseDecorator(ACTION_NAME.RATE, error)
                            })

                        return
                    }

                    this._rejectPromiseDecorator(ACTION_NAME.RATE, result.reason)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.RATE, error)
                })
        }

        return promiseDecorator.promise
    }


    // leaderboard
    setLeaderboardScore(options) {
        if (!this._isPlayerAuthorized) {
            return Promise.reject()
        }

        if (!this.#leaderboards || !options || !options.score || !options.leaderboardName) {
            return Promise.reject()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.SET_LEADERBOARD_SCORE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.SET_LEADERBOARD_SCORE)

            if (typeof options.score === 'string') {
                options.score = parseInt(options.score)
            }

            this.#leaderboards.setLeaderboardScore(options.leaderboardName, options.score)
                .then(() => {
                    this._resolvePromiseDecorator(ACTION_NAME.SET_LEADERBOARD_SCORE)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.SET_LEADERBOARD_SCORE, error)
                })
        }

        return promiseDecorator.promise
    }

    getLeaderboardScore(options) {
        if (!this._isPlayerAuthorized) {
            return Promise.reject()
        }

        if (!this.#leaderboards || !options || !options.leaderboardName) {
            return Promise.reject()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_LEADERBOARD_SCORE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_LEADERBOARD_SCORE)

            this.#leaderboards.getLeaderboardPlayerEntry(options.leaderboardName)
                .then(result => {
                    this._resolvePromiseDecorator(ACTION_NAME.GET_LEADERBOARD_SCORE, result.score)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.GET_LEADERBOARD_SCORE, error)
                })
        }

        return promiseDecorator.promise
    }

    getLeaderboardEntries(options) {
        if (!this.#leaderboards || !options || !options.leaderboardName) {
            return Promise.reject()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_LEADERBOARD_ENTRIES)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_LEADERBOARD_ENTRIES)

            let parameters = {
                includeUser: false,
                quantityAround: 5,
                quantityTop: 5
            }

            if (typeof options.includeUser === 'boolean') {
                parameters.includeUser = options.includeUser
            }

            if (typeof options.quantityAround === 'string') {
                options.quantityAround = parseInt(options.quantityAround)
            }

            if (typeof options.quantityAround === 'number') {
                parameters.quantityAround = options.quantityAround
            }

            if (typeof options.quantityTop === 'string') {
                options.quantityTop = parseInt(options.quantityTop)
            }

            if (typeof options.quantityTop === 'number') {
                parameters.quantityTop = options.quantityTop
            }

            this.#leaderboards.getLeaderboardEntries(options.leaderboardName, parameters)
                .then(result => {
                    let entries = null

                    if (result && result.entries.length > 0) {
                        entries = result.entries.map(e => {
                            let photos = []
                            let photoSmall = e.player.getAvatarSrc('small')
                            let photoMedium = e.player.getAvatarSrc('medium')
                            let photoLarge = e.player.getAvatarSrc('large')

                            if (photoSmall) {
                                photos.push(photoSmall)
                            }

                            if (photoMedium) {
                                photos.push(photoMedium)
                            }

                            if (photoLarge) {
                                photos.push(photoLarge)
                            }

                            return {
                                id: e.player.uniqueID,
                                score: e.score,
                                rank: e.rank,
                                name: e.player.publicName,
                                photos
                            }
                        })
                    }

                    this._resolvePromiseDecorator(ACTION_NAME.GET_LEADERBOARD_ENTRIES, entries)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.GET_LEADERBOARD_ENTRIES, error)
                })
        }

        return promiseDecorator.promise
    }


    //payments

    purchase(options) {
        if (!this.#payments || !options) {
            return Promise.reject()
        }
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.PURCHASE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.PURCHASE)

            this.#payments.purchase(options)
                .then(result => {
                    this._resolvePromiseDecorator(ACTION_NAME.PURCHASE, result)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.PURCHASE, error)
                })
        }
        return promiseDecorator.resolve
    }

    getPaymentsPurchases() {
        if (!this.#payments) {
            return Promise.reject()
        }
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_PURCHASES)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_PURCHASES)

            this.#payments.getPurchases()
                .then(result => {
                    this._resolvePromiseDecorator(ACTION_NAME.GET_PURCHASES, result)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.GET_PURCHASES, error)
                })
        }
        return promiseDecorator.resolve
    }

    getPaymentsCatalog() {
        if (!this.#payments) {
            return Promise.reject()
        }
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.GET_CATALOG)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.GET_CATALOG)

            this.#payments.getCatalog()
                .then(result => {
                    this._resolvePromiseDecorator(ACTION_NAME.GET_CATALOG, result)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.GET_CATALOG, error)
                })
        }
        return promiseDecorator.resolve
    }

    consumePurchase(options) {
        if (!this.#payments || !options) {
            return Promise.reject()
        }
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.CONSUME_PURCHASE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.CONSUME_PURCHASE)

            this.#payments.consumePurchase(options.purchaseToken)
                .then(result => {
                    this._resolvePromiseDecorator(ACTION_NAME.CONSUME_PURCHASE, result)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(ACTION_NAME.CONSUME_PURCHASE, error)
                })
        }
        return promiseDecorator.resolve
    }

    #getPlayer(options) {
        return new Promise(resolve => {
            let parameters = {
                scopes: false
            }

            if (options && typeof options.scopes === 'boolean') {
                parameters.scopes = options.scopes
            }

            this._platformSdk.getPlayer(parameters)
                .then(player => {
                    this._playerId = player.getUniqueID()
                    this._isPlayerAuthorized = player.getMode() !== 'lite'

                    let name = player.getName()
                    if (name !== '') {
                        this._playerName = name
                    }

                    this._playerPhotos = []
                    let photoSmall = player.getPhoto('small')
                    let photoMedium = player.getPhoto('medium')
                    let photoLarge = player.getPhoto('large')

                    if (photoSmall) {
                        this._playerPhotos.push(photoSmall)
                    }

                    if (photoMedium) {
                        this._playerPhotos.push(photoMedium)
                    }

                    if (photoLarge) {
                        this._playerPhotos.push(photoLarge)
                    }

                    this.#yandexPlayer = player
                })
                .finally(() => {
                    resolve()
                })
        })
    }

}

export default YandexPlatformBridge