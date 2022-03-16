### Instant Games Bridge
One SDK for cross-platform publishing HTML5 games.

Supported platforms:
1. [VK.COM](https://vk.com)
2. [Yandex Games](https://yandex.com/games/)

Plugins for game engines:
+ [Construct 3](https://github.com/mewtongames/instant-games-bridge-construct)
+ [Unity](https://github.com/mewtongames/instant-games-bridge-unity)
+ [Defold](https://github.com/mewtongames/instant-games-bridge-defold)

Join community: https://t.me/instant_games_bridge.

### Usage
```
<script src="https://cdn.jsdelivr.net/gh/mewtongames/instant-games-bridge@1.0.2/dist/instant-games-bridge.js"></script>
<script>
    instantGamesBridge
        .initialize()
        .then(() => {
            // Initialized. You can use other methods.
            console.log('Platform ID:', instantGamesBridge.platform.id)
        })
</script>
```