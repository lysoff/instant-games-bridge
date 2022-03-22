class PlatformBase {

    get language() {
        let value = navigator.language
        if (typeof value === 'string')
            return value.substring(0, 2)

        return 'en'
    }

    get payload() {
        let url = new URL(window.location.href)
        return url.searchParams.get('payload')
    }

}

export default PlatformBase