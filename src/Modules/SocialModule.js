import ModuleBase from './ModuleBase'

class SocialModule extends ModuleBase {

    get isInviteFriendsSupported() {
        return this._platformBridge.isInviteFriendsSupported
    }

    get isJoinCommunitySupported() {
        return this._platformBridge.isJoinCommunitySupported
    }

    get isShareSupported() {
        return this._platformBridge.isShareSupported
    }

    get isCreatePostSupported() {
        return this._platformBridge.isCreatePostSupported
    }

    get isAddToHomeScreenSupported() {
        return this._platformBridge.isAddToHomeScreenSupported
    }

    get isAddToFavoritesSupported() {
        return this._platformBridge.isAddToFavoritesSupported
    }

    get isRateSupported() {
        return this._platformBridge.isRateSupported
    }

    inviteFriends() {
        return this._platformBridge.inviteFriends()
    }

    joinCommunity() {
        return this._platformBridge.joinCommunity()
    }

    share() {
        return this._platformBridge.share()
    }

    createPost(message) {
        return this._platformBridge.createPost(message)
    }

    addToHomeScreen() {
        return this._platformBridge.addToHomeScreen()
    }

    addToFavorites() {
        return this._platformBridge.addToFavorites()
    }

    rate() {
        return this._platformBridge.rate()
    }

}

export default SocialModule