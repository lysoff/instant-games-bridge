import PlatformBase from './PlatformBase'
import { INTERSTITIAL_STATE, REWARDED_STATE } from '../Advertisement'

class MockPlatform extends PlatformBase {

    // platform
    get id() {
        return 'mock'
    }


    // social
    get isInviteFriendsSupported() {
        if (this._options && this._options.social && this._options.social.simulateInviteFriends)
            return this._options.social.simulateInviteFriends

        return false
    }

    get isJoinCommunitySupported() {
        if (this._options && this._options.social && this._options.social.simulateJoinCommunity)
            return this._options.social.simulateJoinCommunity

        return false
    }

    get isShareSupported() {
        if (this._options && this._options.social && this._options.social.simulateShare)
            return this._options.social.simulateShare

        return false
    }

    get isCreatePostSupported() {
        if (this._options && this._options.social && this._options.social.simulateCreatePost)
            return this._options.social.simulateCreatePost

        return false
    }


    // advertisement
    showInterstitial() {
        if (this._options && this._options.advertisement && this._options.advertisement.simulateInterstitial) {
            return new Promise(resolve => {
                resolve()
                this._setInterstitialState(INTERSTITIAL_STATE.OPENED)
                this._setInterstitialState(INTERSTITIAL_STATE.CLOSED)
            })
        } else
            return Promise.reject()
    }

    showRewarded() {
        if (this._options && this._options.advertisement && this._options.advertisement.simulateRewarded) {
            return new Promise(resolve => {
                resolve()
                this._setRewardedState(REWARDED_STATE.OPENED)
                this._setRewardedState(REWARDED_STATE.REWARDED)
                this._setRewardedState(REWARDED_STATE.CLOSED)
            })
        } else
            return Promise.reject()
    }


    // social
    inviteFriends() {
        if (this.isInviteFriendsSupported)
            return Promise.resolve()
        else
            return Promise.reject()
    }

    joinCommunity() {
        if (this.isJoinCommunitySupported)
            return Promise.resolve()
        else
            return Promise.reject()
    }

    share() {
        if (this.isShareSupported)
            return Promise.resolve()
        else
            return Promise.reject()
    }

    createPost(message) {
        if (this.isCreatePostSupported)
            return Promise.resolve()
        else
            return Promise.reject()
    }

}

export default MockPlatform