import ModuleBase from './ModuleBase'

class GameModule extends ModuleBase {

    getData(key) {
        return this._platformBridge.getGameData(key)
    }

    setData(key, value) {
        return this._platformBridge.setGameData(key, value)
    }

    deleteData(key) {
        return this._platformBridge.deleteGameData(key)
    }

}

export default GameModule