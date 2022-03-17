# Instant Games Bridge
One SDK for cross-platform publishing HTML5 games.

Supported platforms:
1. [VK.COM](https://vk.com)
2. [Yandex Games](https://yandex.com/games/)

Plugins for game engines:
+ [Construct 3](https://github.com/mewtongames/instant-games-bridge-construct)
+ [Unity](https://github.com/mewtongames/instant-games-bridge-unity)
+ [Defold](https://github.com/mewtongames/instant-games-bridge-defold)

Join community: https://t.me/instant_games_bridge.

## Usage
+ [Initialize](#initialize)
+ [Advertisement](#advertisement)
+ [Data](#data)

### Initialize
```html
<script src="https://cdn.jsdelivr.net/gh/mewtongames/instant-games-bridge@1.0.2/dist/instant-games-bridge.js"></script>
<script>
    instantGamesBridge
        .initialize()
        .then(() => {
            // Initialized. You can use other methods.
            // For example 
            console.log('Platform ID:', instantGamesBridge.platform.id)
        })
</script>
```
### Advertisement
#### Methods
```js
// Request to show interstitial ads
instantGamesBridge.advertisement.showInterstitial()

// Request to show reward video ads
instantGamesBridge.advertisement.showRewarded()
```
#### Events
```js
instantGamesBridge.advertisement.on('interstitial_state_changed', state => console.log('Interstitial state:', state))
instantGamesBridge.advertisement.on('rewarded_state_changed', state => console.log('Rewarded state:', state))
```
### Data
```js
// Get data from storage
instantGamesBridge
    .game
    .getData(key)
    .then(data => {
        // Data has been received and you can work with them.
        console.log('Data:', data)
    })

// Set data in storage
instantGamesBridge
    .game
    .setData(key, value)
    .then(() => {
        // Success
        console.log('SetData success')
    })
```
