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

Join community: https://t.me/instant_games_bridge.

## Usage
+ [Setup](#setup)
+ [Platform](#platform)
+ [Advertisement](#advertisement)
+ [Game Data](#game-data)

### Setup
First you need to initialize the SDK:
```html
<script src="https://cdn.jsdelivr.net/gh/instant-games-bridge/instant-games-bridge@1.1.0/dist/instant-games-bridge.js"></script>
<script>
    instantGamesBridge
        .initialize()
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

### Advertisement
#### Methods
```js
let seconds = 30 // Default = 60
instantGamesBridge.advertisement.setMinimumDelayBetweenInterstitial(seconds)

// Optional parameter
let interstitialOptions = {
    ignoreDelay: true // Default = false
}

// Request to show interstitial ads
instantGamesBridge
    .advertisement
    .showInterstitial(interstitialOptions)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })

// Request to show rewarded video ads
instantGamesBridge
    .advertisement
    .showRewarded()
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
### Game Data
```js
// Get game data from storage
instantGamesBridge
    .game
    .getData(key)
    .then(data => {
        // Data has been received and you can work with them
        // data = null if there is no data for this key
        console.log('Data:', data)
    })
    .catch(error => {
        // Error
    })

// Set game data in storage
instantGamesBridge
    .game
    .setData(key, value)
    .then(() => {
        // Success
    })
    .catch(error => {
        // Error
    })
```