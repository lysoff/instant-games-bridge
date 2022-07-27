import PlatformBridgeBase from './PlatformBridgeBase'
import { PLATFORM_ID, ACTION_NAME, STORAGE_TYPE, ERROR } from '../constants'
import { addJavaScript } from '../common/utils'

const TGG_SDK_URL = 'https://storage.yandexcloud.net/tgg-sdk/v1.2.0/tggsdk.js'

class TggPlatformBridge extends PlatformBridgeBase {

    // platform
    get platformId() {
        return PLATFORM_ID.TGG
    }

    get platformLanguage() {
        return 'en'
    }


    // player
    get isPlayerAuthorizationSupported() {
        return true
    }

    get isPlayerAuthorized() {
        return true
    }


    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            addJavaScript(TGG_SDK_URL).then(() => {
                this._platformSdk = window.tggsdk
                this._platformSdk.initialize()
                    .then(() => {
                        this._platformSdk.player.getData()
                            .then(playerData => {
                                this._playerId = playerData.id
                                this._playerName = playerData.name
                            })
                            .finally(() => {
                                this._isInitialized = true
                                this._defaultStorageType = STORAGE_TYPE.PLATFORM_INTERNAL
                                this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                            })
                    })
                    .catch(error => this._rejectPromiseDecorator(ACTION_NAME.INITIALIZE, error))
            })
        }

        return promiseDecorator.promise
    }


    // player
    authorizePlayer(options) {
        return Promise.resolve()
    }


    // storage
    isStorageSupported(storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return true
        }

        return super.isStorageSupported(storageType)
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

                this._platformSdk.game.getData()
                    .then(loadedData => {
                        this._platformStorageCachedData = loadedData

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
            })
        }

        return super.getDataFromStorage(key, storageType)
    }

    setDataToStorage(key, value, storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return new Promise((resolve, reject) => {
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

                this._platformSdk.game.setData(data)
                    .then(() => {
                        this._platformStorageCachedData = data
                        resolve()
                    })
                    .catch(error => reject(error))
            })
        }

        return super.setDataToStorage(key, value, storageType)
    }

    deleteDataFromStorage(key, storageType) {
        if (storageType === STORAGE_TYPE.PLATFORM_INTERNAL) {
            return new Promise((resolve, reject) => {
                let data = this._platformStorageCachedData !== null
                    ? {...this._platformStorageCachedData}
                    : { }

                if (Array.isArray(key)) {
                    for (let i = 0; i < key.length; i++) {
                        delete data[key[i]]
                    }
                } else {
                    delete data[key]
                }

                this._platformSdk.game.setData(data)
                    .then(() => {
                        this._platformStorageCachedData = data
                        resolve()
                    })
                    .catch(error => reject(error))
            })
        }

        return super.deleteDataFromStorage(key, storageType)
    }

}

export default TggPlatformBridge