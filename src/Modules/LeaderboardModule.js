import ModuleBase from './ModuleBase'

class LeaderboardModule extends ModuleBase {

    get isSupported() {
        return this._platformBridge.isLeaderboardSupported
    }

    get isNativePopupSupported() {
        return this._platformBridge.isLeaderboardNativePopupSupported
    }

    get isMultipleBoardsSupported() {
        return this._platformBridge.isLeaderboardMultipleBoardsSupported
    }

    get isSetScoreSupported() {
        return this._platformBridge.isLeaderboardSetScoreSupported
    }

    get isGetScoreSupported() {
        return this._platformBridge.isLeaderboardGetScoreSupported
    }

    get isGetEntriesSupported() {
        return this._platformBridge.isLeaderboardGetEntriesSupported
    }

    setScore(value, leaderboardId) {
        return this._platformBridge.setLeaderboardScore(value, leaderboardId)
    }

    getScore(leaderboardId) {
        return this._platformBridge.getLeaderboardScore(leaderboardId)
    }

    getEntries(leaderboardId) {
        return this._platformBridge.getLeaderboardEntries(leaderboardId)
    }

    showNativePopup(score, leaderboardId) {
        return this._platformBridge.showLeaderboardNativePopup(score, leaderboardId)
    }

}

export default LeaderboardModule