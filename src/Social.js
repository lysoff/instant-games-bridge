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

}

export default Social