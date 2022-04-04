class PlatformBase {

    get sdk() {
        return null
    }

    get language() {
        let value = navigator.language
        if (typeof value === 'string')
            return value.substring(0, 2)

        return 'en'
    }

    get payload() {
        let url = new URL(window.location.href)
        return url.searchParams.get('payload')
    }

    get isInviteFriendsSupported() {
        return false
    }

    get isCommunitySupported() {
        return false
    }

    get isShareSupported() {
        return false
    }

    constructor(options) {
        if (options)
            this.options = { ...options }
    }

    inviteFriends() {
        return Promise.reject()
    }

    joinCommunity() {
        return Promise.reject()
    }

    share() {
        return Promise.reject()
    }

}

export default PlatformBase