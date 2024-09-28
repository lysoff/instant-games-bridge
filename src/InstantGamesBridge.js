import {
    PLATFORM_ID,
    MODULE_NAME,
    EVENT_NAME,
    INTERSTITIAL_STATE,
    REWARDED_STATE,
    BANNER_STATE,
    STORAGE_TYPE,
    VISIBILITY_STATE,
    DEVICE_TYPE,
    PLATFORM_MESSAGE,
    ERROR,
} from './constants'
import PromiseDecorator from './common/PromiseDecorator'
import PlatformModule from './modules/PlatformModule'
import PlayerModule from './modules/PlayerModule'
import GameModule from './modules/GameModule'
import StorageModule from './modules/StorageModule'
import AdvertisementModule from './modules/AdvertisementModule'
import SocialModule from './modules/SocialModule'
import DeviceModule from './modules/DeviceModule'
import LeaderboardModule from './modules/LeaderboardModule'
import PaymentsModule from './modules/PaymentsModule'
import RemoteConfigModule from './modules/RemoteConfigModule'
import ClipboardModule from './modules/ClipboardModule'

import PlatformBridgeBase from './platform-bridges/PlatformBridgeBase'
import VkPlatformBridge from './platform-bridges/VkPlatformBridge'
import YandexPlatformBridge from './platform-bridges/YandexPlatformBridge'
import CrazyGamesPlatformBridge from './platform-bridges/CrazyGamesPlatformBridge'
import AbsoluteGamesPlatformBridge from './platform-bridges/AbsoluteGamesPlatformBridge'
import GameDistributionPlatformBridge from './platform-bridges/GameDistributionPlatformBridge'
import VkPlayPlatformBridge from './platform-bridges/VkPlayPlatformBridge'
import OkPlatformBridge from './platform-bridges/OkPlatformBridge'
import PlaygamaPlatformBridge from './platform-bridges/PlaygamaPlatformBridge'
import PlayDeckPlatformBridge from './platform-bridges/PlayDeckPlatformBridge'
import WortalPlatformBridge from './platform-bridges/WortalPlatformBridge'
import TelegramPlatformBridge from './platform-bridges/TelegramPlatformBridge'
import Y8PlatformBridge from './platform-bridges/Y8PlatformBridge'

class InstantGamesBridge {
    get version() {
        return PLUGIN_VERSION
    }

    get isInitialized() {
        return this.#isInitialized
    }

    get platform() {
        return this.#getModule(MODULE_NAME.PLATFORM)
    }

    get player() {
        return this.#getModule(MODULE_NAME.PLAYER)
    }

    get game() {
        return this.#getModule(MODULE_NAME.GAME)
    }

    get storage() {
        return this.#getModule(MODULE_NAME.STORAGE)
    }

    get advertisement() {
        return this.#getModule(MODULE_NAME.ADVERTISEMENT)
    }

    get social() {
        return this.#getModule(MODULE_NAME.SOCIAL)
    }

    get device() {
        return this.#getModule(MODULE_NAME.DEVICE)
    }

    get leaderboard() {
        return this.#getModule(MODULE_NAME.LEADERBOARD)
    }

    get payments() {
        return this.#getModule(MODULE_NAME.PAYMENTS)
    }

    get remoteConfig() {
        return this.#getModule(MODULE_NAME.REMOTE_CONFIG)
    }

    get clipboard() {
        return this.#getModule(MODULE_NAME.CLIPBOARD)
    }

    get PLATFORM_ID() {
        return PLATFORM_ID
    }

    get PLATFORM_MESSAGE() {
        return PLATFORM_MESSAGE
    }

    get MODULE_NAME() {
        return MODULE_NAME
    }

    get EVENT_NAME() {
        return EVENT_NAME
    }

    get INTERSTITIAL_STATE() {
        return INTERSTITIAL_STATE
    }

    get REWARDED_STATE() {
        return REWARDED_STATE
    }

    get BANNER_STATE() {
        return BANNER_STATE
    }

    get STORAGE_TYPE() {
        return STORAGE_TYPE
    }

    get VISIBILITY_STATE() {
        return VISIBILITY_STATE
    }

    get DEVICE_TYPE() {
        return DEVICE_TYPE
    }

    #isInitialized = false

    #initializationPromiseDecorator = null

    #platformBridge = null

    #modules = {}

    initialize(options) {
        if (this.#isInitialized) {
            return Promise.resolve()
        }

        if (!this.#initializationPromiseDecorator) {
            this.#initializationPromiseDecorator = new PromiseDecorator()
            this._options = { ...options }
            this.#createPlatformBridge()
            this.#platformBridge
                .initialize()
                .then(() => {
                    this.#modules[MODULE_NAME.PLATFORM] = new PlatformModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.PLAYER] = new PlayerModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.GAME] = new GameModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.STORAGE] = new StorageModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.ADVERTISEMENT] = new AdvertisementModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.SOCIAL] = new SocialModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.DEVICE] = new DeviceModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.LEADERBOARD] = new LeaderboardModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.PAYMENTS] = new PaymentsModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.REMOTE_CONFIG] = new RemoteConfigModule(this.#platformBridge)
                    this.#modules[MODULE_NAME.CLIPBOARD] = new ClipboardModule(this.#platformBridge)

                    this.#isInitialized = true
                    console.info(`%c InstantGamesBridge v.${this.version} initialized. `, 'background: #01A5DA; color: white')

                    if (this.#initializationPromiseDecorator) {
                        this.#initializationPromiseDecorator.resolve()
                        this.#initializationPromiseDecorator = null
                    }
                })
        }

        return this.#initializationPromiseDecorator.promise
    }

    #createPlatformBridge() {
        let platformId = PLATFORM_ID.MOCK

        if (this._options && this._options.forciblySetPlatformId) {
            platformId = this.#getPlatformId(this._options.forciblySetPlatformId.toLowerCase())
        } else {
            const url = new URL(window.location.href)
            const yandexUrl = ['y', 'a', 'n', 'd', 'e', 'x', '.', 'n', 'e', 't'].join('')
            if (url.searchParams.has('platform_id')) {
                platformId = this.#getPlatformId(url.searchParams.get('platform_id').toLowerCase())
            } else if (url.hostname.includes(yandexUrl) || url.hash.includes('yandex')) {
                platformId = PLATFORM_ID.YANDEX
            } else if (url.hostname.includes('crazygames.') || url.hostname.includes('1001juegos.com')) {
                platformId = PLATFORM_ID.CRAZY_GAMES
            } else if (url.hostname.includes('gamedistribution.com')) {
                platformId = PLATFORM_ID.GAME_DISTRIBUTION
            } else if (url.hostname.includes('wortal.ai')) {
                platformId = PLATFORM_ID.WORTAL
            } else if (url.searchParams.has('api_id') && url.searchParams.has('viewer_id') && url.searchParams.has('auth_key')) {
                platformId = PLATFORM_ID.VK
            } else if (url.searchParams.has('app_id') && url.searchParams.has('player_id') && url.searchParams.has('game_sid') && url.searchParams.has('auth_key')) {
                platformId = PLATFORM_ID.ABSOLUTE_GAMES
            } else if (url.searchParams.has('playdeck')) {
                platformId = PLATFORM_ID.PLAYDECK
            } else if (url.hash.includes('tgWebAppData')) {
                platformId = PLATFORM_ID.TELEGRAM
            } else if (url.hostname.includes('y8.com')) {
                platformId = PLATFORM_ID.Y8
            }
        }

        switch (platformId) {
            case PLATFORM_ID.VK: {
                this.#platformBridge = new VkPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.VK],
                )
                break
            }
            case PLATFORM_ID.VK_PLAY: {
                this.#platformBridge = new VkPlayPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.VK_PLAY],
                )
                break
            }
            case PLATFORM_ID.YANDEX: {
                this.#platformBridge = new YandexPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.YANDEX],
                )
                break
            }
            case PLATFORM_ID.CRAZY_GAMES: {
                this.#platformBridge = new CrazyGamesPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.CRAZY_GAMES],
                )
                break
            }
            case PLATFORM_ID.ABSOLUTE_GAMES: {
                this.#platformBridge = new AbsoluteGamesPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.ABSOLUTE_GAMES],
                )
                break
            }
            case PLATFORM_ID.GAME_DISTRIBUTION: {
                this.#platformBridge = new GameDistributionPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.GAME_DISTRIBUTION],
                )
                break
            }
            case PLATFORM_ID.OK: {
                this.#platformBridge = new OkPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.OK],
                )
                break
            }
            case PLATFORM_ID.PLAYGAMA: {
                this.#platformBridge = new PlaygamaPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.PLAYGAMA],
                )
                break
            }
            case PLATFORM_ID.WORTAL: {
                this.#platformBridge = new WortalPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.WORTAL],
                )
                break
            }
            case PLATFORM_ID.PLAYDECK: {
                this.#platformBridge = new PlayDeckPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.PLAYDECK],
                )
                break
            }
            case PLATFORM_ID.TELEGRAM: {
                this.#platformBridge = new TelegramPlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.TELEGRAM],
                )
                break
            }
            case PLATFORM_ID.Y8: {
                this.#platformBridge = new Y8PlatformBridge(
                    this._options && this._options.platforms && this._options.platforms[PLATFORM_ID.Y8],
                )
                break
            }
            default: {
                this.#platformBridge = new PlatformBridgeBase()
                break
            }
        }
    }

    #getPlatformId(value) {
        const platformIds = Object.values(PLATFORM_ID)
        for (let i = 0; i < platformIds.length; i++) {
            if (value === platformIds[i]) {
                return value
            }
        }

        return PLATFORM_ID.MOCK
    }

    #getModule(id) {
        if (!this.#isInitialized) {
            console.error(ERROR.SDK_NOT_INITIALIZED)
        }

        return this.#modules[id]
    }
}

export default InstantGamesBridge
