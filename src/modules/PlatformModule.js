import ModuleBase from './ModuleBase'

class PlatformModule extends ModuleBase {

    get id() {
        return this._platformBridge.platformId
    }

    get sdk() {
        return this._platformBridge.platformSdk
    }

    get language() {
        return this._platformBridge.platformLanguage
    }

    get payload() {
        return this._platformBridge.platformPayload
    }

    get tld() {
        return this._platformBridge.platformTld
    }

    sendMessage(message) {
        return this._platformBridge.sendMessage(message)
    }

}

export default PlatformModule
