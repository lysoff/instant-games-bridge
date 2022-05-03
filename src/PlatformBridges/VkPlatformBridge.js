import PlatformBridgeBase, {ACTION_NAME} from './PlatformBridgeBase'
import PromiseDecorator from '../Common/PromiseDecorator'
import { addJavaScript } from '../Common/utils'
import { INTERSTITIAL_STATE, REWARDED_STATE } from '../constants'

const VK_BRIDGE_URL = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js'

class VkPlatformBridge extends PlatformBridgeBase {

    // platform
    get platformId() {
        return 'vk'
    }

    get platformLanguage() {
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

        return super.platformLanguage
    }

    get platformPayload() {
        let url = new URL(window.location.href)
        if (url.searchParams.has('hash'))
            return url.searchParams.get('hash')

        return super.platformPayload
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


    // leaderboard
    get isLeaderboardSupported() {
        return true
    }

    get isLeaderboardNativePopupSupported() {
        return this.deviceType === 'mobile'
    }


    #isAddToHomeScreenSupported = false

    initialize() {
        if (this._isInitialized)
            return Promise.resolve()

        let promiseDecorator = this._getPromiseDecorator(ACTION_NAME.INITIALIZE)

        if (!promiseDecorator) {
            promiseDecorator = this._createPostPromiseDecorator(ACTION_NAME.INITIALIZE)

            addJavaScript(VK_BRIDGE_URL).then(() => {
                this._platformSdk = window.vkBridge
                this._platformSdk
                    .send('VKWebAppInit')
                    .then(() => {

                        let url = new URL(window.location.href)
                        if (url.searchParams.has('platform')){
                            let vkPlatform = url.searchParams.get('platform')
                            this.#isAddToHomeScreenSupported = vkPlatform === 'html5_android'
                        }

                        this._platformSdk.send('VKWebAppGetUserInfo')
                            .then(data => {
                                if (data) {
                                    this._playerId = data['platformId']
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
                                this._resolvePromiseDecorator(ACTION_NAME.INITIALIZE)
                            })

                    })
            })
        }

        return promiseDecorator.promise
    }


    // player
    authorizePlayer() {
        return Promise.resolve()
    }


    // game
    getGameData(key) {
        return new Promise(resolve => {
            this._platformSdk
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

            this._platformSdk
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

        return this.#requestToVKBridge(ACTION_NAME.SHOW_INTERSTITIAL, 'VKWebAppCheckNativeAds', { ad_format: 'interstitial' }, 'result')
            .then(() => {

                this._platformSdk
                    .send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
                    .then(data => {
                        this._setInterstitialState(data.result ? INTERSTITIAL_STATE.CLOSED : INTERSTITIAL_STATE.FAILED)
                    })
                    .catch(error => {
                        this._setInterstitialState(INTERSTITIAL_STATE.FAILED)
                    })

            })
    }

    showRewarded() {
        if (!this._canShowAdvertisement())
            return Promise.reject()

        return this.#requestToVKBridge(ACTION_NAME.SHOW_REWARDED, 'VKWebAppCheckNativeAds', { ad_format: 'reward', use_waterfall: true }, 'result')
            .then(() => {

                this._platformSdk
                    .send('VKWebAppShowNativeAds', { ad_format: 'reward', use_waterfall: true })
                    .then(data => {
                        if (data.result) {
                            this._setRewardedState(REWARDED_STATE.REWARDED)
                            this._setRewardedState(REWARDED_STATE.CLOSED)
                        } else {
                            this._setRewardedState(REWARDED_STATE.FAILED)
                        }
                    })
                    .catch(error => {
                        this._setRewardedState(REWARDED_STATE.FAILED)
                    })

            })
    }


    // social
    inviteFriends() {
        return this.#requestToVKBridge(ACTION_NAME.INVITE_FRIENDS, 'VKWebAppShowInviteBox', { }, 'success')
    }

    joinCommunity() {
        if (!this._options || !this._options.groupId)
            return Promise.reject()

        if (typeof this._options.groupId === 'string') {
            let groupId = parseInt(this._options.groupId)
            if (!isNaN(groupId))
                this._options.groupId = groupId
        }

        return this.#requestToVKBridge(ACTION_NAME.JOIN_COMMUNITY, 'VKWebAppJoinGroup', { 'group_id': this._options.groupId }, 'result')
            .then(() => {
                window.open('https://vk.com/public' + this._options.groupId)
            })
    }

    share() {
        return this.#requestToVKBridge(ACTION_NAME.SHARE, 'VKWebAppShare', { }, 'type')
    }

    createPost(message) {
        return this.#requestToVKBridge(ACTION_NAME.CREATE_POST, 'VKWebAppShowWallPostBox', { message }, 'post_id')
    }

    addToHomeScreen() {
        if (!this.isAddToHomeScreenSupported)
            return Promise.reject()

        return this.#requestToVKBridge(ACTION_NAME.ADD_TO_HOME_SCREEN, 'VKWebAppAddToHomeScreen', { }, 'result')
    }

    addToFavorites() {
        return this.#requestToVKBridge(ACTION_NAME.ADD_TO_FAVORITES, 'VKWebAppAddToFavorites', { }, 'result')
    }


    // leaderboard
    showLeaderboardNativePopup(score, leaderboardId) {
        if (!this.isLeaderboardNativePopupSupported)
            return Promise.reject()

        if (!this._showLeaderboardNativePopupPromiseDecorator) {
            this._showLeaderboardNativePopupPromiseDecorator = new PromiseDecorator()

            this._platformSdk
                .send('VKWebAppShowLeaderBoardBox', { user_result: score })
                .then(data => {
                    if (data && data.result) {
                        if (this._showLeaderboardNativePopupPromiseDecorator) {
                            this._showLeaderboardNativePopupPromiseDecorator.resolve()
                            this._showLeaderboardNativePopupPromiseDecorator = null
                        }

                        return
                    }

                    if (this._showLeaderboardNativePopupPromiseDecorator) {
                        this._showLeaderboardNativePopupPromiseDecorator.reject()
                        this._showLeaderboardNativePopupPromiseDecorator = null
                    }
                })
                .catch(error => {
                    if (this._showLeaderboardNativePopupPromiseDecorator) {
                        if (error && error.error_data && error.error_data.error_reason)
                            this._showLeaderboardNativePopupPromiseDecorator.reject(error.error_data.error_reason)
                        else
                            this._showLeaderboardNativePopupPromiseDecorator.reject()

                        this._showLeaderboardNativePopupPromiseDecorator = null
                    }
                })
        }

        return this._showLeaderboardNativePopupPromiseDecorator.promise
    }


    #requestToVKBridge(actionName, vkMethodName, parameters, successKey) {
        let promiseDecorator = this._getPromiseDecorator(actionName)
        if (!promiseDecorator) {
            promiseDecorator = this._createPromiseDecorator(actionName)

            this._platformSdk
                .send(vkMethodName, parameters)
                .then(data => {
                    if (data[successKey]) {
                        this._resolvePromiseDecorator(actionName)
                        return
                    }

                    this._rejectPromiseDecorator(actionName)
                })
                .catch(error => {
                    this._rejectPromiseDecorator(actionName, error)
                })
        }

        return promiseDecorator.promise
    }

}

export default VkPlatformBridge