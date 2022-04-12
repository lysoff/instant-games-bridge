import EventLite from 'event-lite'
import PlatformBase from './PlatformBase'
import PromiseDecorator from '../Common/PromiseDecorator'
import { addJavaScript } from '../Common/utils'
import { EVENT_NAME as ADVERTISEMENT_EVENT_NAME, INTERSTITIAL_STATE, REWARDED_STATE } from '../Advertisement'

const YANDEX_SDK_URL = 'https://yandex.ru/games/sdk/v2'
const LOCAL_STORAGE_GAME_DATA_KEY = 'game_data'

class YandexPlatform extends PlatformBase {

    get id() {
        return 'yandex'
    }

    get sdk() {
        return this.#sdk
    }

    get language() {
        if (this.#sdk)
            return this.#sdk.environment.i18n.lang

        return super.language
    }

    get interstitialState() {
        return this.#interstitialState
    }

    get rewardedState() {
        return this.#rewardedState
    }

    #sdk
    #isInitialized
    #initializationPromiseDecorator

    #interstitialState
    #rewardedState
    #showInterstitialPromiseDecorator
    #showRewardedPromiseDecorator

    #player
    #safeStorage
    #gameData


    initialize() {
        if (this.#isInitialized)
            return Promise.resolve()

        if (!this.#initializationPromiseDecorator) {
            this.#initializationPromiseDecorator = new PromiseDecorator()
            addJavaScript(YANDEX_SDK_URL).then(() => {
                window.YaGames
                    .init()
                    .then(sdk => {
                        this.#sdk = sdk

                        this.#sdk.getPlayer({ scopes: false })
                            .then(player => {
                                this.#player = player

                                this.#isInitialized = true

                                if (this.#initializationPromiseDecorator) {
                                    this.#initializationPromiseDecorator.resolve()
                                    this.#initializationPromiseDecorator = null
                                }
                            })
                            .catch(error => {
                                this.#sdk.getStorage()
                                    .then(safeStorage => {
                                        this.#safeStorage = safeStorage

                                        this.#isInitialized = true

                                        if (this.#initializationPromiseDecorator) {
                                            this.#initializationPromiseDecorator.resolve()
                                            this.#initializationPromiseDecorator = null
                                        }
                                    })
                            })
                    })
            })
        }

        return this.#initializationPromiseDecorator.promise
    }


    showInterstitial() {
        if (this.#interstitialState === INTERSTITIAL_STATE.OPENED)
            return Promise.reject()

        if (!this.#showInterstitialPromiseDecorator) {
            this.#showInterstitialPromiseDecorator = new PromiseDecorator()
            this.#sdk.adv.showFullscreenAdv({
                callbacks: {
                    onOpen: () => {
                        if (this.#showInterstitialPromiseDecorator) {
                            this.#showInterstitialPromiseDecorator.resolve()
                            this.#showInterstitialPromiseDecorator = null
                        }

                        this.#setInterstitialState(INTERSTITIAL_STATE.OPENED)
                    },
                    onClose: wasShown => {
                        if (wasShown) {
                            this.#setInterstitialState(INTERSTITIAL_STATE.CLOSED)
                        } else {
                            if (this.#showInterstitialPromiseDecorator) {
                                this.#showInterstitialPromiseDecorator.reject()
                                this.#showInterstitialPromiseDecorator = null
                            }

                            this.#setInterstitialState(INTERSTITIAL_STATE.FAILED)
                        }
                    }
                }
            })
        }

        return this.#showInterstitialPromiseDecorator.promise
    }

    showRewarded() {
        if (this.#rewardedState === REWARDED_STATE.OPENED || this.#rewardedState === REWARDED_STATE.REWARDED)
            return Promise.reject()

        if (!this.#showRewardedPromiseDecorator) {
            this.#showRewardedPromiseDecorator = new PromiseDecorator()
            this.#sdk.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => {
                        if (this.#showRewardedPromiseDecorator) {
                            this.#showRewardedPromiseDecorator.resolve()
                            this.#showRewardedPromiseDecorator = null
                        }

                        this.#setRewardedState(REWARDED_STATE.OPENED)
                    },
                    onRewarded:  () => {
                        this.#setRewardedState(REWARDED_STATE.REWARDED)
                    },
                    onClose: () => {
                        this.#setRewardedState(REWARDED_STATE.CLOSED)
                    },
                    onError: error => {
                        if (this.#showRewardedPromiseDecorator) {
                            this.#showRewardedPromiseDecorator.reject(error)
                            this.#showRewardedPromiseDecorator = null
                        }

                        this.#setRewardedState(REWARDED_STATE.FAILED)
                    }
                }
            })
        }

        return this.#showRewardedPromiseDecorator.promise
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

            if (this.#player) {
                this.#player.getData()
                    .then(loadedData => {
                        this.#gameData = loadedData
                        if (typeof this.#gameData[key] === 'undefined')
                            resolve(null)
                        else
                            resolve(this.#gameData[key])
                    })
                    .catch(() => {
                        resolve(null)
                    })

                return
            }

            if (this.#safeStorage) {
                let json = this.#safeStorage.getItem(LOCAL_STORAGE_GAME_DATA_KEY)
                if (json)
                    this.#gameData = JSON.parse(json)
            } else {
                try {
                    let json = localStorage.getItem(LOCAL_STORAGE_GAME_DATA_KEY)
                    if (json)
                        this.#gameData = JSON.parse(json)
                }
                catch (e) { }
            }

            if (typeof this.#gameData[key] === 'undefined')
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


    #setInterstitialState(state) {
        if (this.#interstitialState === state)
            return

        this.#interstitialState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.INTERSTITIAL_STATE_CHANGED, this.#interstitialState)
    }

    #setRewardedState(state) {
        if (this.#rewardedState === state)
            return

        this.#rewardedState = state
        this.emit(ADVERTISEMENT_EVENT_NAME.REWARDED_STATE_CHANGED, this.#rewardedState)
    }

    #saveGameData() {
        return new Promise((resolve, reject) => {
            if (this.#player) {
                this.#player.setData(this.#gameData)
                    .then(() => {
                        resolve()
                    })
                    .catch(error => {
                        reject(error)
                    })
            } else if (this.#safeStorage) {
                this.#safeStorage.setItem(LOCAL_STORAGE_GAME_DATA_KEY, JSON.stringify(this.#gameData))
                resolve()
            } else {
                try {
                    localStorage.setItem(LOCAL_STORAGE_GAME_DATA_KEY, JSON.stringify(this.#gameData))
                }
                catch (e) { }
                resolve()
            }
        })
    }
}

EventLite.mixin(YandexPlatform.prototype)
export default YandexPlatform