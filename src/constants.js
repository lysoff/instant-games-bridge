export const PLATFORM_ID = {
    VK: 'vk',
    VK_PLAY: 'vk_play',
    OK: 'ok',
    YANDEX: 'yandex',
    CRAZY_GAMES: 'crazy_games',
    ABSOLUTE_GAMES: 'absolute_games',
    GAME_DISTRIBUTION: 'game_distribution',
    PLAYGAMA: 'playgama',
    WORTAL: 'wortal',
    PLAYDECK: 'playdeck',
    TELEGRAM: 'telegram',
    Y8: 'y8',
    MOCK: 'mock',
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
    PAYMENTS: 'payments',
    REMOTE_CONFIG: 'remote_config',
    CLIPBOARD: 'clipboard',
}

export const EVENT_NAME = {
    INTERSTITIAL_STATE_CHANGED: 'interstitial_state_changed',
    REWARDED_STATE_CHANGED: 'rewarded_state_changed',
    BANNER_STATE_CHANGED: 'banner_state_changed',
    VISIBILITY_STATE_CHANGED: 'visibility_state_changed',
}

export const VISIBILITY_STATE = {
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
}

export const INTERSTITIAL_STATE = {
    LOADING: 'loading',
    OPENED: 'opened',
    CLOSED: 'closed',
    FAILED: 'failed',
}

export const REWARDED_STATE = {
    LOADING: 'loading',
    OPENED: 'opened',
    CLOSED: 'closed',
    FAILED: 'failed',
    REWARDED: 'rewarded',
}

export const BANNER_STATE = {
    LOADING: 'loading',
    SHOWN: 'shown',
    HIDDEN: 'hidden',
    FAILED: 'failed',
}

export const STORAGE_TYPE = {
    LOCAL_STORAGE: 'local_storage',
    PLATFORM_INTERNAL: 'platform_internal',
}

export const DEVICE_TYPE = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
    TABLET: 'tablet',
    TV: 'tv',
}

export const PLATFORM_MESSAGE = {
    GAME_READY: 'game_ready',
    IN_GAME_LOADING_STARTED: 'in_game_loading_started',
    IN_GAME_LOADING_STOPPED: 'in_game_loading_stopped',
    GAMEPLAY_STARTED: 'gameplay_started',
    GAMEPLAY_STOPPED: 'gameplay_stopped',
    PLAYER_GOT_ACHIEVEMENT: 'player_got_achievement',
    GAME_OVER: 'game_over',
}

export const ACTION_NAME = {
    INITIALIZE: 'initialize',
    AUTHORIZE_PLAYER: 'authorize_player',
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
    GET_PURCHASES: 'get_purchases',
    GET_CATALOG: 'get_catalog',
    PURCHASE: 'purchase',
    CONSUME_PURCHASE: 'consume_purchase',
    GET_REMOTE_CONFIG: 'get_remote_config',
    GET_STORAGE_DATA: 'get_storage_data',
    SHOW_LEADERBOARD_NATIVE_POPUP: 'show_leaderboard_native_popup',
    CLIPBOARD_WRITE: 'clipboard_write',
    ADBLOCK_DETECT: 'adblock_detect',
}

export const ERROR = {
    SDK_NOT_INITIALIZED: { message: 'Before using the SDK you must initialize it' },
    STORAGE_NOT_SUPPORTED: { message: 'Storage not supported' },
    STORAGE_NOT_AVAILABLE: { message: 'Storage not available' },
    GAME_DISTRIBUTION_GAME_ID_IS_UNDEFINED: { message: 'GameDistribution Game ID is undefined' },
    VK_PLAY_GAME_ID_IS_UNDEFINED: { message: 'VK Play Game ID is undefined' },
    Y8_GAME_ID_IS_UNDEFINED: { message: 'Y8 Game ID is undefined' },
    OK_GAME_PARAMS_NOT_FOUND: { message: 'OK Game params are not found' },
    INVITE_FRIENDS_MESSAGE_LENGTH_ERROR: { message: 'Message is too long' },
}
