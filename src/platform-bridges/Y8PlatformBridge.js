import { addJavaScript, waitFor } from '../common/utils'
import { ACTION_NAME, ERROR, PLATFORM_ID } from '../constants'
import PlatformBridgeBase from './PlatformBridgeBase'

const SDK_URL = 'https://cdn.y8.com/api/sdk.js'

class Y8PlatformBridge extends PlatformBridgeBase {
    get platformId() {
        return PLATFORM_ID.Y8
    }

    initialize() {
        if (this._isInitialized) {
            return Promise.resolve()
        }

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.INITIALIZE)

            if (!this._options || typeof this._options.gameId !== 'string') {
                this._rejectPromiseDecorator(ACTION_NAME.INITIALIZE, ERROR.Y8_GAME_ID_IS_UNDEFINED)
            } else {
                addJavaScript(SDK_URL).then(() => {
                    waitFor('ID').then(() => {
                        this._platformSdk = window.ID

                        this._platformSdk.Event.subscribe('id.init', () => {
                            this._isInitialized = true
                            this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                        })

                        this._platformSdk.init({
                            appId: this._options.gameId,
                        })
                    })
                })
            }
        }

        return promiseDecorator.promise
    }
}

export default Y8PlatformBridge
