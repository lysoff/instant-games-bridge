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

}

export default Social