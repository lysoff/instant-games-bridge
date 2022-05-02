class Social {

    get isInviteFriendsSupported() {
        return this.#platformProvider.isInviteFriendsSupported
    }

    get isJoinCommunitySupported() {
        return this.#platformProvider.isJoinCommunitySupported
    }

    get isShareSupported() {
        return this.#platformProvider.isShareSupported
    }

    get isCreatePostSupported() {
        return this.#platformProvider.isCreatePostSupported
    }

    get isAddToHomeScreenSupported() {
        return this.#platformProvider.isAddToHomeScreenSupported
    }

    get isAddToFavoritesSupported() {
        return this.#platformProvider.isAddToFavoritesSupported
    }

    get isRateSupported() {
        return this.#platformProvider.isRateSupported
    }

    #platformProvider

    constructor(platformProvider) {
        this.#platformProvider = platformProvider
    }

    inviteFriends() {
        return this.#platformProvider.inviteFriends()
    }

    joinCommunity() {
        return this.#platformProvider.joinCommunity()
    }

    share() {
        return this.#platformProvider.share()
    }

    createPost(message) {
        return this.#platformProvider.createPost(message)
    }

    addToHomeScreen() {
        return this.#platformProvider.addToHomeScreen()
    }

    addToFavorites() {
        return this.#platformProvider.addToFavorites()
    }

    rate() {
        return this.#platformProvider.rate()
    }

}

export default Social