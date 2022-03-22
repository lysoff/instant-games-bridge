# Instant Games Bridge
One SDK for cross-platform publishing HTML5 games.

Supported platforms:
+ [VK.COM](https://vk.com)
+ [Yandex Games](https://yandex.com/games/)

Plugins for game engines:
+ [Construct 3](https://github.com/mewtongames/instant-games-bridge-construct)
+ [Unity](https://github.com/mewtongames/instant-games-bridge-unity)
+ [Defold](https://github.com/mewtongames/instant-games-bridge-defold)

Join community: https://t.me/instant_games_bridge.

## Usage
+ [Setup](#setup)
+ [Platform](#platform)
+ [Advertisement](#advertisement)
+ [Game Data](#game-data)

### Setup
First you need to initialize the SDK:
```html
<script src="https://cdn.jsdelivr.net/gh/mewtongames/instant-games-bridge@1.0.2/dist/instant-games-bridge.js"></script>
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
// Get ID of current platform ('vk', 'yandex', 'mock')
instantGamesBridge.platform.id

// Get platform native SDK
instantGamesBridge.platform.sdk
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