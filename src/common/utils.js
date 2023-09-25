export const addJavaScript = function(src) {
    return new Promise(resolve => {
        let script = document.createElement('script')
        script.src = src
        script.addEventListener('load', resolve)
        document.head.appendChild(script)
    })
}

export const waitFor = function() {
    if (arguments.length <= 0) {
        return Promise.resolve()
    }

    return new Promise(resolve => {
        let checkInterval = setInterval(() => {
            let parent = window

            for (let i = 0; i < arguments.length; i++) {
                let currentObject = parent[arguments[i]]
                if (!currentObject) {
                    return
                }

                parent = currentObject
            }

            resolve()
            clearInterval(checkInterval)
        }, 100)
    })
}

