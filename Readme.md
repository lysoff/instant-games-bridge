# Instant Games Bridge
One SDK for cross-platform publishing HTML5 games.

Supported platforms:
+ [VK.COM](https://vk.com)
+ [Yandex Games](https://yandex.com/games/)

Plugins for game engines:
+ [Construct 3](https://github.com/mewtongames/instant-games-bridge-construct)
+ [Unity](https://github.com/mewtongames/instant-games-bridge-unity)
+ [Defold](https://github.com/mewtongames/instant-games-bridge-defold)
+ [Godot](https://github.com/mewtongames/instant-games-bridge-godot)

Roadmap: https://trello.com/b/NjF29vTW.

Join community: https://t.me/instant_games_bridge.

## Usage
+ [Setup](#setup)
+ [Modules Overriding](#modules-overriding)
+ [Platform](#platform)
+ [Device](#device)
+ [Player](#player)
+ [Game](#game)
+ [Storage](#storage)
+ [Advertisement](#advertisement)
+ [Social](#social)
+ [Leaderboard](#leaderboard)

### Setup
First you need to initialize the SDK:
```html
<script src="./instant-games-bridge.js"></script>
<script>
    bridge.initialize()
        .then(() => {
            // Initialized. You can use other methods.
        })
        .catch(error => {
            // Error
        })
    
    // You can forcibly set needed platform ID and skip the internal detection
    bridge.initialize({ forciblySetPlatformId: bridge.PLATFORM_ID.MOCK })
</script>
```

### Modules Overriding
```js
// You can override any module ('advertisement', 'device', 'game', 'player', 'storage', 'platform', 'social', 'leaderboard').
// Сorrect public interface and return types are required!
class CustomAdvertisementModule {

    initialize(builtinModule) {
        this.builtinModule = builtinModule
    }

    showInterstitial(options) {
        console.log('CustomAdvertisementModule.showInterstitial')
        return new Promise((resolve, reject) => {
            // Custom logic
        })
    }

    showRewarded() {
        console.log('CustomAdvertisementModule.showRewarded')
        // Fallback to builtin module
        return this.builtinModule.showRewarded()
    }

    // ... other methods

}

bridge.overrideModule(bridge.MODULE_NAME.ADVERTISEMENT, new CustomAdvertisementModule())
```

### Platform
```js
// ID of current platform ('vk', 'yandex', 'mock')
bridge.platform.id

// Platform native SDK
bridge.platform.sdk

// If platform provides information - this is the user language on platform. 
// If not - this is the language of the user's browser.
bridge.platform.language

// The value of the payload parameter from the url. Examples:
// VK: vk.com/app8056947#your-info
// Yandex: yandex.com/games/play/183100?payload=your-info
// Mock: site.com/game?payload=your-info
bridge.platform.payload
```

### Device
```js
// 'mobile', 'tablet', 'desktop', 'tv'
bridge.device.type
```

### Player
```js
// VK, Yandex: true
bridge.player.isAuthorizationSupported

// VK: true, Yandex: true/false
bridge.player.isAuthorized

// If player is authorized
bridge.player.id

// If player is authorized (Yandex: and allowed access to this information)
bridge.player.name
bridge.player.photos // Array of player photos, sorted in order of increasing photo size

// If authorization is supported and player is not authorized
let authorizationOptions = {
    yandex: {
        scopes: true // Request access to name and photo
    }
}
bridge.player.authorize(authorizationOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })
```

### Game
```js
// Current visibility state ('visible', 'hidden')
bridge.game.visibilityState

// Fired when visibility state changed ('visible', 'hidden')
// For example: you can play/pause music here 
bridge.game.on(bridge.EVENT_NAME.VISIBILITY_STATE_CHANGED, state => console.log('Visibility state:', state))
```

### Storage
```js
// Current platform storage type ('local_storage', 'platform_internal')
bridge.storage.defaultType

// Check if the storage supported
bridge.storage.isSupported(bridge.STORAGE_TYPE.LOCAL_STORAGE)
bridge.storage.isSupported(bridge.STORAGE_TYPE.PLATFORM_INTERNAL)

// Get data from storage
bridge.storage.get('key')
    .then(data => {
        // Data has been received and you can work with them
        // data = null if there is no data for this key
        console.log('Data:', data)
    })
    .catch(error => {
        // Error
    })

// Set game data in storage
bridge.storage.set('key', 'value')
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

// Delete game data from storage
bridge.storage.delete('key')
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

/* -- -- -- Different Storage Types -- -- -- */
// You can choose storage type for each platform separately:
let options = {
    vk: bridge.STORAGE_TYPE.PLATFORM_INTERNAL,
    yandex: bridge.STORAGE_TYPE.LOCAL_STORAGE
}
bridge.storage.get('key', options)
bridge.storage.set('key', 'value', options)
bridge.storage.delete('key', options)

// Or common to all platforms:
let storageType = bridge.STORAGE_TYPE.LOCAL_STORAGE
bridge.storage.get('key', storageType)
bridge.storage.set('key', 'value', storageType)
bridge.storage.delete('key', storageType)

/* -- -- -- Multiple keys and values -- -- -- */
// You can send an array of keys and values
bridge.storage.get(['key_1', 'key2'])
bridge.storage.set(['key_1', 'key2'], ['value_1', 'value_2'])
bridge.storage.delete(['key_1', 'key2'])
```

### Advertisement
If you want to show banners on VK — add [bridge-vk-banner-extension](https://github.com/instant-games-bridge/instant-games-bridge-vk-banner-extension) (+482kb).
```js
/* -- -- -- Banners -- -- -- */
bridge.advertisement.isBannerSupported
bridge.advertisement.isBannerShowing

let bannerOptions = {
    vk: {
        position: 'top' // Default = bottom
    }
}
bridge.advertisement.showBanner(bannerOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

bridge.advertisement.hideBanner()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

/* -- -- -- Delays Between Interstitials -- -- -- */
bridge.advertisement.minimumDelayBetweenInterstitial // Default = 60 seconds

// You can override minimum delay. You can use platform specific delays:
let delayOptions = {
    vk: 30,
    yandex: 60,
    mock: 0
}
// Or common to all platforms:
let delayOptions = 60
bridge.advertisement.setMinimumDelayBetweenInterstitial(delayOptions)

/* -- -- -- Interstitial -- -- -- */
//  You can use platform specific ignoring:
let interstitialOptions = {
    vk: {
        ignoreDelay: true
    },
    yandex: {
        ignoreDelay: false
    }
}
// Or common to all platforms:
let interstitialOptions = {
    ignoreDelay: true // Default = false
}
// Request to show interstitial ads
bridge.advertisement.showInterstitial(interstitialOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

/* -- -- -- Rewarded Video -- -- -- */
// Request to show rewarded video ads
bridge.advertisement.showRewarded()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

/* -- -- -- Advertisement States -- -- -- */
// Fired when interstitial state changed ('opened', 'closed', 'failed')
bridge.advertisement.on(bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, state => console.log('Interstitial state:', state))

// Fired when rewarded video state changed ('opened', 'rewarded', 'closed', 'failed')
// It is recommended to give a reward when the state is 'rewarded'
bridge.advertisement.on(bridge.EVENT_NAME.REWARDED_STATE_CHANGED, state => console.log('Rewarded state:', state))
```

### Social
```js
// VK: true
// Yandex: false
bridge.social.isShareSupported
bridge.social.isJoinCommunitySupported
bridge.social.isInviteFriendsSupported
bridge.social.isCreatePostSupported
bridge.social.isAddToFavoritesSupported

// VK, Yandex: partial supported
bridge.social.isAddToHomeScreenSupported

// VK: false
// Yandex: true
bridge.social.isRateSupported

let shareOptions = {
    vk: {
        link: 'https://vk.com/wordle.game'
    }
}
bridge.social.share(shareOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

let joinCommunityOptions = {
    vk: {
        groupId: '199747461'
    }
}
bridge.social.joinCommunity(joinCommunityOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

bridge.social.inviteFriends()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

let createPostOptions = {
    vk: {
        message: 'Hello world!',
        attachments: 'photo-199747461_457239629'
    }
}
bridge.social.createPost(createPostOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

bridge.social.addToHomeScreen()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

bridge.social.addToFavorites()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

bridge.social.rate()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })
```

### Leaderboard
```js
// VK, Yandex: true
bridge.leaderboard.isSupported

// VK: true, Yandex: false
bridge.leaderboard.isNativePopupSupported

// VK: false, Yandex: true
bridge.leaderboard.isMultipleBoardsSupported
bridge.leaderboard.isSetScoreSupported
bridge.leaderboard.isGetScoreSupported
bridge.leaderboard.isGetEntriesSupported

let setScoreOptions = {
    yandex: {
        leaderboardName: 'YOU_LEADERBOARD_NAME',
        score: 42
    }
}
bridge.leaderboard.setScore(setScoreOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

let getScoreOptions = {
    yandex: {
        leaderboardName: 'YOU_LEADERBOARD_NAME',
    }
}
bridge.leaderboard.getScore(getScoreOptions)
    .then(score => {
        // Success
        console.log(score)
    })
    .catch(error => {
        // Error
    })

let getEntriesOptions = {
    yandex: {
        leaderboardName: 'YOU_LEADERBOARD_NAME',
        includeUser: true, // Default = false
        quantityAround: 10, // Default = 5
        quantityTop: 10 // Default = 5
    }
}
bridge.leaderboard.getEntries(getEntriesOptions)
    .then(entries => {
        // Success
        entries.forEach(e => {
            console.log('ID: ' + e.id + ', name: ' + e.name + ', score: ' + e.score + ', rank: ' + e.rank + ', small photo: ' + e.photos[0])
        })
    })
    .catch(error => {
        // Error
    })

let showNativePopupOptions = {
    vk: {
        userResult: 42,
        global: true // Default = false
    }
}
bridge.leaderboard.showNativePopup(showNativePopupOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })
```