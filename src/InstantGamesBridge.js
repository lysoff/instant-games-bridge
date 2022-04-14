import PromiseDecorator from './Common/PromiseDecorator'
import MockPlatform from './Platform/MockPlatform'
import VkPlatform from './Platform/VkPlatform'
import YandexPlatform from './Platform/YandexPlatform'
import Player from './Player'
import Game from './Game'
import Advertisement from './Advertisement'
import Social from './Social'

class InstantGamesBridge {

    get version() {
        return '1.3.0'
    }

    get isInitialized() {
        return this.#isInitialized
    }

    get platform() {
        return this.#platform
    }

    get player() {
        return this.#player
    }

    get game() {
        return this.#game
    }

    get advertisement() {
        return this.#advertisement
    }

    get social() {
        return this.#social
    }

    #isInitialized = false
    #initializationPromiseDecorator

    #platform
    #player
    #game
    #advertisement
    #social

    initialize(options) {
        if (this.#isInitialized)
            return Promise.resolve()

        if (!this.#initializationPromiseDecorator) {
            this.#initializationPromiseDecorator = new PromiseDecorator()
            this._options = { ...options }
            this.#createPlatform()
            this.#platform
                .initialize()
                .then(() => {
                    this.#player = new Player(this.#platform)
                    this.#game = new Game(this.#platform)
                    this.#advertisement = new Advertisement(this.#platform)
                    this.#social = new Social(this.#platform)

                    this.#isInitialized = true
                    console.log('%c InstantGamesBridge v.' + this.version + ' initialized. ', 'background: #01A5DA; color: white')

                    if (this.#initializationPromiseDecorator) {
                        this.#initializationPromiseDecorator.resolve()
                        this.#initializationPromiseDecorator = null
                    }
                })
        }

        return this.#initializationPromiseDecorator.promise
    }

    #createPlatform() {
        let url = new URL(window.location.href)
        let yandexUrl = ['g', 'a', 'm', 'e', 's', '.', 's', '3', '.', 'y', 'a', 'n', 'd', 'e', 'x', '.', 'n', 'e', 't'].join('')
        if (url.hostname.includes(yandexUrl))
            this.#platform = new YandexPlatform(this._options && this._options.platforms && this._options.platforms.yandex)
        else if (url.searchParams.has('api_id') && url.searchParams.has('viewer_id') && url.searchParams.has('auth_key'))
            this.#platform = new VkPlatform(this._options && this._options.platforms && this._options.platforms.vk)
        else
            this.#platform = new MockPlatform(this._options && this._options.platforms && this._options.platforms.mock)
    }

}

export default InstantGamesBridge