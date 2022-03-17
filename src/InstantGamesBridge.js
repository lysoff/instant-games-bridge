import MockPlatform from './Platform/MockPlatform'
import VkPlatform from './Platform/VkPlatform'
import YandexPlatform from './Platform/YandexPlatform'
import Advertisement from './Advertisement'
import Game from './Game'

class InstantGamesBridge {

    static get version() {
        return '1.0.2'
    }

    get isInitialized() {
        return this.#isInitialized
    }

    get platform() {
        return this.#platform
    }

    get advertisement() {
        return this.#advertisement
    }

    get game() {
        return this.#game
    }

    #isInitialized = false
    #platform
    #advertisement
    #game

    initialize() {
        if (this.#isInitialized)
            return Promise.resolve()

        return new Promise(resolve => {
            this.#createPlatform()
            this.#platform
                .initialize()
                .then(() => {
                    this.#advertisement = new Advertisement(this.#platform)
                    this.#game = new Game(this.#platform)
                    this.#isInitialized = true
                    console.log('%c InstantGamesBridge v.' + InstantGamesBridge.version + ' initialized. ', 'background: #01A5DA; color: white')
                    resolve()
                })
        })
    }

    #createPlatform() {
        let url = new URL(window.location.href)
        if (url.hostname.includes('games.s3.yandex.net'))
            this.#platform = new YandexPlatform()
        else if (url.searchParams.has('api_id') && url.searchParams.has('viewer_id') && url.searchParams.has('auth_key'))
            this.#platform = new VkPlatform()
        else
            this.#platform = new MockPlatform()
    }

}

export default InstantGamesBridge