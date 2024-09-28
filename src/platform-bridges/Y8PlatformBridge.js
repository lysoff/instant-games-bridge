import { addJavaScript, waitFor } from '../common/utils'
import { ACTION_NAME, ERROR, PLATFORM_ID } from '../constants'
import PlatformBridgeBase from './PlatformBridgeBase'

const SDK_URL = 'https://cdn.y8.com/api/sdk.js'

class Y8PlatformBridge extends PlatformBridgeBase {
    get platformId() {
        return PLATFORM_ID.Y8
    }

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

            if (!this._options || typeof this._options.gameId !== 'string') {
                this._rejectPromiseDecorator(ACTION_NAME.INITIALIZE, ERROR.Y8_GAME_ID_IS_UNDEFINED)
            } else {
                addJavaScript(SDK_URL).then(() => {
                    waitFor('ID').then(() => {
                        this._platformSdk = window.ID

                        this._platformSdk.Event.subscribe('id.init', () => {
                            this._platformSdk.getLoginStatus((data) => {
                                if (data.status === 'ok') {
                                    this.#setPlayerDetails(data)
                                }

                                this._isInitialized = true
                                this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                            })
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

    // player
    authorizePlayer() {
        if (this._isPlayerAuthorized) {
            return Promise.resolve()
        }
        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
            this._platformSdk.login((data) => {
                if (data.status === 'ok') {
                    this.#setPlayerDetails(data)
                    this._resolvePromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER)
                } else {
                    this._rejectPromiseDecorator(ACTION_NAME.AUTHORIZE_PLAYER, 'Authorization failed')
                }
            })
        }
        return promiseDecorator.promise
    }

    #setPlayerDetails(data) {
        if (!data?.authResponse?.details) return

        const {
            pid, locale, nickname, avatars,
        } = data.authResponse.details
        this._playerId = pid
        this._platformLanguage = locale
        this._playerName = nickname

        if (avatars?.thumb_url) {
            this._playerPhotos.push(avatars?.thumb_url)
        }
        if (avatars?.medium_url) {
            this._playerPhotos.push(avatars?.medium_url)
        }
        if (avatars?.large_url) {
            this._playerPhotos.push(avatars?.large_url)
        }

        this._isPlayerAuthorized = true
    }
}

export default Y8PlatformBridge
