class PromiseDecorator {

    #promise
    #resolve
    #reject

    get promise() {
        return this.#promise
    }

    constructor() {
        this.#promise = new Promise((resolve, reject) => {
            this.#resolve = resolve
            this.#reject = reject
        })
    }

    resolve() {
        this.#resolve()
    }

    reject() {
        this.#reject()
    }

}

export default PromiseDecorator