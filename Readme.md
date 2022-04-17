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
+ [Platform](#platform)
+ [Player](#player)
+ [Game Data](#game-data)
+ [Advertisement](#advertisement)
+ [Social](#social)

### Setup
First you need to initialize the SDK:
```html
<script src="https://cdn.jsdelivr.net/gh/instant-games-bridge/instant-games-bridge@1.3.0/dist/instant-games-bridge.js"></script>
<script>
    // Optional parameter
    let bridgeOptions = {
        platforms: {
            vk: {
                groupId: 199747461 // If you want to use instantGamesBridge.social.joinCommunity() method
            },
            yandex: {
                authorization: {
                    scopes: true // Request player name and photo, default = false
                }
            },
            // Default = false for all simulations in mock
            mock: {
                social: {
                    simulateShare: true,
                    simulateInviteFriends: true,
                    simulateJoinCommunity: true,
                    simulateCreatePost: true,
                    simulateAddToHomeScreen: true,
                    simulateAddToFavorites: true
                },
                advertisement: {
                    simulateInterstitial: true,
                    simulateRewarded: true
                }
            }
        }
    }
    
    instantGamesBridge.initialize(bridgeOptions)
        .then(() => {
            // Initialized. You can use other methods.
        })
        .catch(error => {
            // Error
        })
</script>
```

### Platform
```js
// ID of current platform ('vk', 'yandex', 'mock')
instantGamesBridge.platform.id

// Platform native SDK
instantGamesBridge.platform.sdk

// If platform provides information - this is the user language on platform. 
// If not - this is the language of the user's browser.
instantGamesBridge.platform.language

// The value of the payload parameter from the url. Examples:
// VK: vk.com/app8056947#your-info
// Yandex: yandex.com/games/play/183100?payload=your-info
// Mock: site.com/game?payload=your-info
instantGamesBridge.platform.payload
```

###Player
```js
instantGamesBridge.player.isAuthorizationSupported

instantGamesBridge.player.isAuthorized

// If player is authorized
instantGamesBridge.player.id

// If player is authorized (Yandex: and allowed access to this information)
instantGamesBridge.player.name
instantGamesBridge.player.photos // Array of player photos, sorted in order of increasing photo size

// If authorization is supported and player is not authorized
instantGamesBridge.player.authorize()
```

### Game Data
```js
// Get game data from storage
instantGamesBridge.game.getData(key)
    .then(data => {
        // Data has been received and you can work with them
        // data = null if there is no data for this key
        console.log('Data:', data)
    })
    .catch(error => {
        // Error
    })

// Set game data in storage
instantGamesBridge.game.setData(key, value)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

// Delete game data from storage
instantGamesBridge.game.deleteData(key)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })
```

### Advertisement
#### Methods
```js
instantGamesBridge.advertisement.minimumDelayBetweenInterstitial // Default = 60 seconds

// You can override minimum delay
let seconds = 30
instantGamesBridge.advertisement.setMinimumDelayBetweenInterstitial(seconds)

// Optional parameter
let interstitialOptions = {
    ignoreDelay: true // Default = false
}

// Request to show interstitial ads
instantGamesBridge.advertisement.showInterstitial(interstitialOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

// Request to show rewarded video ads
instantGamesBridge.advertisement.showRewarded()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })
```
#### Events
```js
instantGamesBridge.advertisement.on('interstitial_state_changed', state => console.log('Interstitial state:', state))
instantGamesBridge.advertisement.on('rewarded_state_changed', state => console.log('Rewarded state:', state))
```

### Social
```js
// VK: true
// Yandex: false
instantGamesBridge.social.isShareSupported
instantGamesBridge.social.isJoinCommunitySupported
instantGamesBridge.social.isInviteFriendsSupported
instantGamesBridge.social.isCreatePostSupported
instantGamesBridge.social.isAddToFavoritesSupported

// VK, Yandex: partial supported
instantGamesBridge.social.isAddToHomeScreenSupported

instantGamesBridge.social.share()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

// For VK - you need to pass the group id when you call the instantGamesBridge.initialize() method
instantGamesBridge.social.joinCommunity()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

instantGamesBridge.social.inviteFriends()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

instantGamesBridge.social.createPost(text)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

instantGamesBridge.social.addToHomeScreen()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

instantGamesBridge.social.addToFavorites()
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })
```