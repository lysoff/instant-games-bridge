import PlatformBase from './PlatformBase'
import PromiseDecorator from '../Common/PromiseDecorator'
import { addJavaScript } from '../Common/utils'
import { INTERSTITIAL_STATE, REWARDED_STATE } from '../Advertisement'

const VK_BRIDGE_URL = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js'

class VkPlatform extends PlatformBase {

    // platform
    get id() {
        return 'vk'
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

    get deviceType() {
        let url = new URL(window.location.href)
        if (url.searchParams.has('platform')){
            let platformType = url.searchParams.get('platform')

            switch (platformType) {
                case 'html5_ios':
                case 'html5_android':
                case 'html5_mobile':
                    return 'mobile'
                case 'web':
                    return 'desktop'
            }
        }

        return super.deviceType
    }


    // player
    get isPlayerAuthorizationSupported() {
        return true
    }

    get isPlayerAuthorized() {
        return true
    }


    // social
    get isInviteFriendsSupported() {
        return true
    }

    get isJoinCommunitySupported() {
        return true
    }

    get isShareSupported() {
        return true
    }

    get isCreatePostSupported() {
        return true
    }

    get isAddToHomeScreenSupported() {
        return this.#isAddToHomeScreenSupported
    }

    get isAddToFavoritesSupported() {
        return true
    }

    #isAddToHomeScreenSupported = false

    initialize() {
        if (this._isInitialized)
            return Promise.resolve()

        if (!this._initializationPromiseDecorator) {
            this._initializationPromiseDecorator = new PromiseDecorator()

            addJavaScript(VK_BRIDGE_URL).then(() => {
                this._sdk = window.vkBridge
                this._sdk
                    .send('VKWebAppInit')
                    .then(() => {

                        let url = new URL(window.location.href)
                        if (url.searchParams.has('platform')){
                            let vkPlatform = url.searchParams.get('platform')
                            this.#isAddToHomeScreenSupported = vkPlatform === 'html5_android'
                        }

                        this._sdk.send('VKWebAppGetUserInfo')
                            .then(data => {
                                if (data) {
                                    this._playerId = data['id']
                                    this._playerName = data['first_name'] + ' ' + data['last_name']

                                    if (data['photo_100'])
                                        this._playerPhotos.push(data['photo_100'])

                                    if (data['photo_200'])
                                        this._playerPhotos.push(data['photo_200'])

                                    if (data['photo_max_orig'])
                                        this._playerPhotos.push(data['photo_max_orig'])
                                }
                            })
                            .finally(() => {
                                this._isInitialized = true

                                if (this._initializationPromiseDecorator) {
                                    this._initializationPromiseDecorator.resolve()
                                    this._initializationPromiseDecorator = null
                                }
                            })

                    })
            })
        }

        return this._initializationPromiseDecorator.promise
    }


    // player
    authorizePlayer() {
        return Promise.resolve()
    }


    // game
    getGameData(key) {
        return new Promise(resolve => {
            this._sdk
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
        return new Promise((resolve, reject) => {
            let data = { key, value }

            if (typeof value !== 'string')
                data.value = JSON.stringify(value)

            this._sdk
                .send('VKWebAppStorageSet', data)
                .then(() => {
                    resolve()
                })
                .catch(error => {
                    if (error && error.error_data && error.error_data.error_reason)
                        reject(error.error_data.error_reason)
                    else
                        reject()
                })
        })
    }

    deleteGameData(key) {
        return this.setGameData(key, '')
    }


    // advertisement
    showInterstitial() {
        if (!this._canShowAdvertisement())
            return Promise.reject()

        if (!this._showInterstitialPromiseDecorator) {
            this._showInterstitialPromiseDecorator = new PromiseDecorator()
            this._sdk
                .send('VKWebAppShowNativeAds', { ad_format: 'preloader' })
                .then(data => {
                    if (data.result) {
                        if (this._showInterstitialPromiseDecorator) {
                            this._showInterstitialPromiseDecorator.resolve()
                            this._showInterstitialPromiseDecorator = null
                        }

                        this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
                        this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
                    } else {
                        if (this._showInterstitialPromiseDecorator) {
                            this._showInterstitialPromiseDecorator.reject()
                            this._showInterstitialPromiseDecorator = null
                        }

                        this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
                    }
                })
                .catch(error => {
                    if (this._showInterstitialPromiseDecorator) {
                        this._showInterstitialPromiseDecorator.reject(error)
                        this._showInterstitialPromiseDecorator = null
                    }

                    this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
                })
        }

        return this._showInterstitialPromiseDecorator.promise
    }

    showRewarded() {
        if (!this._canShowAdvertisement())
            return Promise.reject()

        if (!this._showRewardedPromiseDecorator) {
            this._showRewardedPromiseDecorator = new PromiseDecorator()
            this._sdk
                .send('VKWebAppShowNativeAds', { ad_format: 'reward', use_waterfall: true })
                .then(data => {
                    if (data.result) {
                        if (this._showRewardedPromiseDecorator) {
                            this._showRewardedPromiseDecorator.resolve()
                            this._showRewardedPromiseDecorator = null
                        }

                        this._setRewardedState(REWARDED_STATE.OPENED)
                        this._setRewardedState(REWARDED_STATE.REWARDED)
                        this._setRewardedState(REWARDED_STATE.CLOSED)
                    } else {
                        if (this._showRewardedPromiseDecorator) {
                            this._showRewardedPromiseDecorator.reject()
                            this._showRewardedPromiseDecorator = null
                        }

                        this._setRewardedState(REWARDED_STATE.FAILED)
                    }
                })
                .catch(error => {
                    if (this._showRewardedPromiseDecorator) {
                        this._showRewardedPromiseDecorator.reject(error)
                        this._showRewardedPromiseDecorator = null
                    }

                    this._setRewardedState(REWARDED_STATE.FAILED)
                })
        }

        return this._showRewardedPromiseDecorator.promise
    }


    // social
    inviteFriends() {
        if (!this._inviteFriendsPromiseDecorator) {
            this._inviteFriendsPromiseDecorator = new PromiseDecorator()

            this._sdk
                .send('VKWebAppShowInviteBox')
                .then(data => {
                    if (data.success) {
                        if (this._inviteFriendsPromiseDecorator) {
                            this._inviteFriendsPromiseDecorator.resolve()
                            this._inviteFriendsPromiseDecorator = null
                        }

                        return
                    }

                    if (this._inviteFriendsPromiseDecorator) {
                        this._inviteFriendsPromiseDecorator.reject()
                        this._inviteFriendsPromiseDecorator = null
                    }
                })
                .catch(error => {
                    if (this._inviteFriendsPromiseDecorator) {
                        if (error && error.error_data && error.error_data.error_reason)
                            this._inviteFriendsPromiseDecorator.reject(error.error_data.error_reason)
                        else
                            this._inviteFriendsPromiseDecorator.reject()

                        this._inviteFriendsPromiseDecorator = null
                    }
                })
        }

        return this._inviteFriendsPromiseDecorator.promise
    }

    joinCommunity() {
        if (!this._options || !this._options.groupId)
            return Promise.reject()

        if (typeof this._options.groupId === 'string') {
            let groupId = parseInt(this._options.groupId)
            if (!isNaN(groupId))
                this._options.groupId = groupId
        }

        if (!this._joinCommunityPromiseDecorator) {
            this._joinCommunityPromiseDecorator = new PromiseDecorator()

            this._sdk
                .send('VKWebAppJoinGroup', { 'group_id': this._options.groupId })
                .then(data => {
                    if (data && data.result) {
                        if (this._joinCommunityPromiseDecorator) {
                            this._joinCommunityPromiseDecorator.resolve()
                            this._joinCommunityPromiseDecorator = null
                        }

                        window.open('https://vk.com/public' + this._options.groupId)
                        return
                    }

                    if (this._joinCommunityPromiseDecorator) {
                        this._joinCommunityPromiseDecorator.reject()
                        this._joinCommunityPromiseDecorator = null
                    }
                })
                .catch(error => {
                    if (this._joinCommunityPromiseDecorator) {
                        if (error && error.error_data && error.error_data.error_reason)
                            this._joinCommunityPromiseDecorator.reject(error.error_data.error_reason)
                        else
                            this._joinCommunityPromiseDecorator.reject()

                        this._joinCommunityPromiseDecorator = null
                    }
                })
        }

        return this._joinCommunityPromiseDecorator.promise
    }

    share() {
        if (!this._sharePromiseDecorator) {
            this._sharePromiseDecorator = new PromiseDecorator()

            this._sdk
                .send('VKWebAppShare')
                .then(data => {
                    if (data && data.type) {
                        if (this._sharePromiseDecorator) {
                            this._sharePromiseDecorator.resolve()
                            this._sharePromiseDecorator = null
                        }

                        return
                    }

                    if (this._sharePromiseDecorator) {
                        this._sharePromiseDecorator.reject()
                        this._sharePromiseDecorator = null
                    }
                })
                .catch(error => {
                    if (this._sharePromiseDecorator) {
                        if (error && error.error_data && error.error_data.error_reason)
                            this._sharePromiseDecorator.reject(error.error_data.error_reason)
                        else
                            this._sharePromiseDecorator.reject()

                        this._sharePromiseDecorator = null
                    }
                })
        }

        return this._sharePromiseDecorator.promise
    }

    createPost(message) {
        if (!this._createPostPromiseDecorator) {
            this._createPostPromiseDecorator = new PromiseDecorator()

            this._sdk
                .send('VKWebAppShowWallPostBox', { message })
                .then(data => {
                    if (data && data['post_id']) {
                        if (this._createPostPromiseDecorator) {
                            this._createPostPromiseDecorator.resolve()
                            this._createPostPromiseDecorator = null
                        }

                        return
                    }

                    if (this._createPostPromiseDecorator) {
                        this._createPostPromiseDecorator.reject()
                        this._createPostPromiseDecorator = null
                    }
                })
                .catch(error => {
                    if (this._createPostPromiseDecorator) {
                        if (error && error.error_data && error.error_data.error_reason)
                            this._createPostPromiseDecorator.reject(error.error_data.error_reason)
                        else
                            this._createPostPromiseDecorator.reject()

                        this._createPostPromiseDecorator = null
                    }
                })
        }

        return this._createPostPromiseDecorator.promise
    }

    addToHomeScreen() {
        if (!this.isAddToHomeScreenSupported)
            return Promise.reject()

        if (!this._addToHomeScreenPromiseDecorator) {
            this._addToHomeScreenPromiseDecorator = new PromiseDecorator()

            this._sdk
                .send('VKWebAppAddToHomeScreen')
                .then(data => {
                    if (data && data.result) {
                        if (this._addToHomeScreenPromiseDecorator) {
                            this._addToHomeScreenPromiseDecorator.resolve()
                            this._addToHomeScreenPromiseDecorator = null
                        }

                        return
                    }

                    if (this._addToHomeScreenPromiseDecorator) {
                        this._addToHomeScreenPromiseDecorator.reject()
                        this._addToHomeScreenPromiseDecorator = null
                    }
                })
                .catch(error => {
                    if (this._addToHomeScreenPromiseDecorator) {
                        if (error && error.error_data && error.error_data.error_reason)
                            this._addToHomeScreenPromiseDecorator.reject(error.error_data.error_reason)
                        else
                            this._addToHomeScreenPromiseDecorator.reject()

                        this._addToHomeScreenPromiseDecorator = null
                    }
                })
        }

        return this._addToHomeScreenPromiseDecorator.promise
    }

    addToFavorites() {
        if (!this._addToFavoritesPromiseDecorator) {
            this._addToFavoritesPromiseDecorator = new PromiseDecorator()

            this._sdk
                .send('VKWebAppAddToFavorites')
                .then(data => {
                    if (data && data.result) {
                        if (this._addToFavoritesPromiseDecorator) {
                            this._addToFavoritesPromiseDecorator.resolve()
                            this._addToFavoritesPromiseDecorator = null
                        }

                        return
                    }

                    if (this._addToFavoritesPromiseDecorator) {
                        this._addToFavoritesPromiseDecorator.reject()
                        this._addToFavoritesPromiseDecorator = null
                    }
                })
                .catch(error => {
                    if (this._addToFavoritesPromiseDecorator) {
                        if (error && error.error_data && error.error_data.error_reason)
                            this._addToFavoritesPromiseDecorator.reject(error.error_data.error_reason)
                        else
                            this._addToFavoritesPromiseDecorator.reject()

                        this._addToFavoritesPromiseDecorator = null
                    }
                })
        }

        return this._addToFavoritesPromiseDecorator.promise
    }

}

export default VkPlatform