import ModuleBase from './ModuleBase'

class PaymentsModule extends ModuleBase {

    get isSupported() {
        return this._platformBridge.isPaymentsSupported
    }

    purchase(options) {
        return this._platformBridge.setPurchase(options);
    }

    getPurchases() {
        return this._platformBridge.getPaymentsPurchases();
    }

    getCatalog() {
        return this._platformBridge.getPaymentsCatalog();
    }

    consumePurchases(options) {
        return this._platformBridge.consumePaymentsPurchases(options);
    }

}

export default PaymentsModule
