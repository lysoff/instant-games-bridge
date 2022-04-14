class Player {

    get isAuthorizationSupported() {
        return this.#platformProvider.isPlayerAuthorizationSupported
    }

    get isAuthorized() {
        return this.#platformProvider.isPlayerAuthorized
    }

    get id() {
        return this.#platformProvider.playerId
    }

    get name() {
        return this.#platformProvider.playerName
    }

    get photos() {
        return this.#platformProvider.playerPhotos
    }

    #platformProvider

    constructor(platformProvider) {
        this.#platformProvider = platformProvider
    }

    authorize() {
        return this.#platformProvider.authorizePlayer()
    }

}

export default Player