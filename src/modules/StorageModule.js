import ModuleBase from './ModuleBase'

class StorageModule extends ModuleBase {

    #cachedData = []

    get defaultType() {
        return this._platformBridge.defaultStorageType
    }

    isSupported(options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions) {
                return this.isSupported(platformDependedOptions)
            }
        }

        return this._platformBridge.isStorageSupported(options)
    }

    isAvailable(options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions) {
                return this.isSupported(platformDependedOptions)
            }
        }

        return this._platformBridge.isStorageAvailable(options)
    }

    get(key, options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions) {
                return this.get(key, platformDependedOptions)
            }
        }

        let storageType = options
        if (!storageType) {
            storageType = this.defaultType
        }

        let cachedData = this.#cachedData[storageType]
        if (cachedData) {
            if (typeof cachedData[key] !== 'undefined') {
                return Promise.resolve(cachedData[key])
            }
        }

        return this._platformBridge
            .getDataFromStorage(key, storageType)
            .then(data => {
                this._addToCache(storageType, key, data)
                return data
            })
    }

    set(key, value, options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions) {
                return this.set(key, value, platformDependedOptions)
            }
        }

        let storageType = options
        if (!storageType) {
            storageType = this.defaultType
        }

        return this._platformBridge
            .setDataToStorage(key, value, storageType)
            .then(() => this._addToCache(storageType, key, value))
    }

    delete(key, options) {
        if (options) {
            let platformDependedOptions = options[this._platformBridge.platformId]
            if (platformDependedOptions) {
                return this.delete(key, platformDependedOptions)
            }
        }

        let storageType = options
        if (!storageType) {
            storageType = this.defaultType
        }

        return this._platformBridge
            .deleteDataFromStorage(key, storageType)
            .then(() => this._deleteFromCache(storageType, key))
    }

    _addToCache(storageType, key, data) {
        if (!this.#cachedData[storageType]) {
            this.#cachedData[storageType] = []
        }

        if (Array.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                this.#cachedData[storageType][key[i]] = data[key[i]]
            }
        } else {
            this.#cachedData[storageType][key] = data
        }
    }

    _deleteFromCache(storageType, key) {
        if (!this.#cachedData[storageType]) {
            return
        }

        if (Array.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                delete this.#cachedData[storageType][key[i]]
            }
        } else {
            delete this.#cachedData[storageType][key]
        }
    }

}

export default StorageModule
