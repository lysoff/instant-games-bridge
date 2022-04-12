class Game {

    #platformProvider

    constructor(platformProvider) {
        this.#platformProvider = platformProvider
    }

    getData(key) {
        return this.#platformProvider.getGameData(key)
    }

    setData(key, value) {
        return this.#platformProvider.setGameData(key, value)
    }

    deleteData(key) {
        return this.#platformProvider.deleteGameData(key)
    }

}

export default Game