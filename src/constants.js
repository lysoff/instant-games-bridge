export const PLATFORM_ID = {
    VK: 'vk',
    YANDEX: 'yandex',
    TGG: 'tgg',
    MOCK: 'mock'
}

export const MODULE_NAME = {
    PLATFORM: 'platform',
    PLAYER: 'player',
    GAME: 'game',
    STORAGE: 'storage',
    ADVERTISEMENT: 'advertisement',
    SOCIAL: 'social',
    DEVICE: 'device',
    LEADERBOARD: 'leaderboard',
}

export const EVENT_NAME = {
    INTERSTITIAL_STATE_CHANGED: 'interstitial_state_changed',
    REWARDED_STATE_CHANGED: 'rewarded_state_changed',
    VISIBILITY_STATE_CHANGED: 'visibility_state_changed'
}

export const VISIBILITY_STATE = {
    VISIBLE: 'visible',
    HIDDEN: 'hidden'
}

export const INTERSTITIAL_STATE = {
    OPENED: 'opened',
    CLOSED: 'closed',
    FAILED: 'failed'
}

export const REWARDED_STATE = {
    OPENED: 'opened',
    CLOSED: 'closed',
    FAILED: 'failed',
    REWARDED: 'rewarded'
}

export const ACTION_NAME = {
    INITIALIZE: 'initialize',
    AUTHORIZE_PLAYER: 'authorize_player',
    SHOW_INTERSTITIAL: 'show_interstitial',
    SHOW_REWARDED: 'show_rewarded',
    SHARE: 'share',
    INVITE_FRIENDS: 'invite_friends',
    JOIN_COMMUNITY: 'join_community',
    CREATE_POST: 'create_post',
    ADD_TO_HOME_SCREEN: 'add_to_home_screen',
    ADD_TO_FAVORITES: 'add_to_favorites',
    RATE: 'rate',
    SET_LEADERBOARD_SCORE: 'set_leaderboard_score',
    GET_LEADERBOARD_SCORE: 'get_leaderboard_score',
    GET_LEADERBOARD_ENTRIES: 'get_leaderboard_entries',
    SHOW_LEADERBOARD_NATIVE_POPUP: 'show_leaderboard_native_popup'
}

export const STORAGE_TYPE = {
    LOCAL_STORAGE: 'local_storage',
    PLATFORM_INTERNAL: 'platform_internal'
}

export const ERROR = {
    STORAGE_NOT_SUPPORTED: { message: 'Storage not supported' }
}