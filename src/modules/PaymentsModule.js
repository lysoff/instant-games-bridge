import ModuleBase from './ModuleBase'

class PaymentsModule extends ModuleBase {
    get isSupported() {
        return this._platformBridge.isPaymentsSupported
    }

    purchase(id, developerPayload) {
        return this._platformBridge.paymentsPurchase(id, developerPayload)
    }

    consume(token) {
        return this._platformBridge.paymentsConsume(token)
    }

    getPurchases() {
        return this._platformBridge.paymentsGetPurchases()
    }

    getCatalog() {
        return this._platformBridge.paymentsGetCatalog()
    }
}

export default PaymentsModule