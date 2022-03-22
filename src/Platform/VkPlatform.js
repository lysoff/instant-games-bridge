import EventLite from 'event-lite'
import PlatformBase from './PlatformBase'
import PromiseDecorator from '../Common/PromiseDecorator'
import { addJavaScript } from '../Common/utils'
import { EVENT_NAME as ADVERTISEMENT_EVENT_NAME, INTERSTITIAL_STATE, REWARDED_STATE } from '../Advertisement'

const VK_BRIDGE_URL = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js'

class VkPlatform extends PlatformBase {

    get id() {
        return 'vk'
    }

    get sdk() {
        return this.#sdk
    }

    get language() {
        let url = new URL(window.location.href)
        if (url.searchParams.has('language')) {
            switch (url.searchParams.get('language')) {
                case 0:
                    return 'ru'
                case 1:
                    return 'uk'
                case 2:
                    return 'be'
                case 3:
                    return 'en'
            }
        }

        return super.language
    }

    get payload() {
        let url = new URL(window.location.href)
        if (url.searchParams.has('hash'))
            return url.searchParams.get('hash')

        return super.payload
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

    initialize() {
        if (this.#isInitialized)
            return Promise.resolve()

        if (!this.#initializationPromiseDecorator) {
            this.#initializationPromiseDecorator = new PromiseDecorator()

            addJavaScript(VK_BRIDGE_URL).then(() => {
                this.#sdk = window.vkBridge
                this.#sdk
                    .send('VKWebAppInit')
                    .then(() => {
                        this.#isInitialized = true

                        if (this.#initializationPromiseDecorator) {
                            this.#initializationPromiseDecorator.resolve()
                            this.#initializationPromiseDecorator = null
                        }
                    })
            })
        }

        return this.#initializationPromiseDecorator.promise
    }

    showInterstitial() {
        if (!this.#showInterstitialPromiseDecorator) {
            this.#showInterstitialPromiseDecorator = new PromiseDecorator()
            this.#sdk
                .send('VKWebAppShowNativeAds', { ad_format: 'preloader' })
                .then(data => {
                    if (data.result) {
                        if (this.#showInterstitialPromiseDecorator) {
                            this.#showInterstitialPromiseDecorator.resolve()
                            this.#showInterstitialPromiseDecorator = null
                        }

                        this.#setInterstitialState(INTERSTITIAL_STATE.OPENED)
                        this.#setInterstitialState(INTERSTITIAL_STATE.CLOSED)
                    } else {
                        if (this.#showInterstitialPromiseDecorator) {
                            this.#showInterstitialPromiseDecorator.reject()
                            this.#showInterstitialPromiseDecorator = null
                        }

                        this.#setInterstitialState(INTERSTITIAL_STATE.FAILED)
                    }
                })
                .catch(error => {
                    if (this.#showInterstitialPromiseDecorator) {
                        this.#showInterstitialPromiseDecorator.reject(error)
                        this.#showInterstitialPromiseDecorator = null
                    }

                    this.#setInterstitialState(INTERSTITIAL_STATE.FAILED)
                })
        }

        return this.#showInterstitialPromiseDecorator.promise
    }

    showRewarded() {
        if (!this.#showRewardedPromiseDecorator) {
            this.#showRewardedPromiseDecorator = new PromiseDecorator()
            this.#sdk
                .send('VKWebAppShowNativeAds', { ad_format: 'reward', use_waterfall: true })
                .then(data => {
                    if (data.result) {
                        if (this.#showRewardedPromiseDecorator) {
                            this.#showRewardedPromiseDecorator.resolve()
                            this.#showRewardedPromiseDecorator = null
                        }

                        this.#setRewardedState(REWARDED_STATE.OPENED)
                        this.#setRewardedState(REWARDED_STATE.REWARDED)
                        this.#setRewardedState(REWARDED_STATE.CLOSED)
                    } else {
                        if (this.#showRewardedPromiseDecorator) {
                            this.#showRewardedPromiseDecorator.reject()
                            this.#showRewardedPromiseDecorator = null
                        }

                        this.#setRewardedState(REWARDED_STATE.FAILED)
                    }
                })
                .catch(error => {
                    if (this.#showRewardedPromiseDecorator) {
                        this.#showRewardedPromiseDecorator.reject(error)
                        this.#showRewardedPromiseDecorator = null
                    }

                    this.#setRewardedState(REWARDED_STATE.FAILED)
                })
        }

        return this.#showRewardedPromiseDecorator.promise
    }

    getGameData(key) {
        return new Promise(resolve => {
            this.#sdk
                .send('VKWebAppStorageGet', { 'keys': [key] })
                .then(data => {
                    if (data.keys[0].value === '') {
                        resolve(null)
                        return
                    }

                    let value
                    try {
                        value = JSON.parse(data.keys[0].value)
                    } catch (e) {
                        value = data.keys[0].value
                    }

                    resolve(value)
                })
                .catch(() => {
                    resolve(null)
                })
        })
    }

    setGameData(key, value) {
        return new Promise(resolve => {
            let data = { key, value }

            if (typeof value !== 'string')
                data.value = JSON.stringify(value)

            this.#sdk
                .send('VKWebAppStorageSet', data)
                .then(() => {
                    resolve()
                })
        })
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

}

EventLite.mixin(VkPlatform.prototype)
export default VkPlatform