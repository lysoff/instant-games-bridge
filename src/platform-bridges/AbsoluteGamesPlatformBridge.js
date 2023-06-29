import PlatformBridgeBase from './PlatformBridgeBase'
import { addJavaScript } from '../common/utils'
import {
    PLATFORM_ID,
    ACTION_NAME,
    INTERSTITIAL_STATE,
    REWARDED_STATE,
    STORAGE_TYPE
} from '../constants'

const SDK_URL = 'https://unpkg.com/@agru/sdk/dist/umd/index.min.js'

class AbsoluteGamesPlatformBridge extends PlatformBridgeBase {

    // platform
    get platformId() {
        return PLATFORM_ID.ABSOLUTE_GAMES
    }


    // player
    get isPlayerAuthorizationSupported() {
        return true
    }


    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            addJavaScript(SDK_URL).then(() => {
                this._platformSdk = new AgRuSdk()

                this._platformSdk.on(AgRuSdkMethods.ShowCampaign, (data, error) => {
                    switch (data.type) {
                        case 'default': {
                            if (error === null) {
                                if (data.status) {
                                    this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
                                } else {
                                    this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
                                }
                            } else {
                                this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
                            }
                            break
                        }
                        case 'rewarded': {
                            if (error === null) {
                                if (data.status) {
                                    this._setRewardedState(REWARDED_STATE.OPENED)
                                } else {
                                    if (data.reward) {
                                        this._setRewardedState(REWARDED_STATE.REWARDED)
                                    }

                                    this._setRewardedState(REWARDED_STATE.CLOSED)
                                }
                            } else {
                                this._setRewardedState(REWARDED_STATE.FAILED)
                            }
                            break
                        }
                    }
                })

                let getPlayerInfoPromise = this.#getPlayerInfo()

                Promise
                    .all([getPlayerInfoPromise])
                    .finally(() => {
                        this._isInitialized = true

                        this._defaultStorageType = this._isPlayerAuthorized
                            ? STORAGE_TYPE.PLATFORM_INTERNAL
                            : STORAGE_TYPE.LOCAL_STORAGE

                        this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                    })
            })
        }

        return promiseDecorator.promise
    }


    // player
    authorizePlayer(options) {
        if (this._isPlayerAuthorized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)

            this._platformSdk.authorize((data, error) => {
                if (error === null) {
                    this._resolvePromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
                } else {
                    this._rejectPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER, error)
                }
            })
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

                if (this._isPlayerAuthorized) {
                    this._platformSdk.getSaveData((data, error) => {
                        if (error === null) {
                            if (data === null) {
                                data = { }
                            }

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
                        } else {
                            reject(error)
                        }
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
                if (this._isPlayerAuthorized) {
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

                    this._platformSdk.setSaveData(data, (result, error) => {
                        if (error === null) {
                            this._platformStorageCachedData = data
                            resolve()
                        }
                            reject(error)
                        }
                    )
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
                if (this._isPlayerAuthorized) {
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

                    this._platformSdk.setSaveData(data, (result, error) => {
                            if (error === null) {
                                this._platformStorageCachedData = data
                                resolve()
                            }
                            reject(error)
                        }
                    )
                } else {
                    reject()
                }
            })
        }

        return super.deleteDataFromStorage(key, storageType)
    }


    // advertisement
    showInterstitial() {
        this._platformSdk.showCampaign('default')
    }

    showRewarded() {
        this._platformSdk.showCampaign('rewarded')
    }


    #getPlayerInfo() {
        this._playerId = this._platformSdk.options['player_id']
        this._isPlayerAuthorized = this._platformSdk.options['guest'] === 'false'

        return new Promise(resolve => {
            this._platformSdk.getUsers([this._playerId], (data, error) => {
                if (data && data.length === 1) {
                    let playerData = data[0]
                    this._playerName = playerData['full_name']

                    if (playerData['avatar'] !== '') {
                        this._playerPhotos = [playerData['avatar']]
                    }
                }

                resolve()
            })
        })
    }
}

export default AbsoluteGamesPlatformBridge
