window.addEventListener('message', e => {
  if (e.source === window && e.data.vueDetected) {
    chrome.runtime.sendMessage(e.data)
  }
})

function detect (win) {
  setTimeout(() => {
    const all = document.querySelectorAll('*')
    const iframes = []
    let el
    for (let i = 0; i < all.length; i++) {
      if (all[i].tagName === 'IFRAME') {
        iframes.push(all[i])
      }
      if (all[i].__vue__) {
        el = all[i]
        break
      }
    }

    if (!el && iframes.length) {
      for (let i = 0; i < iframes.length; i++) {
        let iframeNodes
        // prevent cross origin iframe errors
        try {
          iframeNodes = iframes[i].contentDocument.querySelectorAll('*')
        } catch (err) {
          return
        }
        for (let j = 0; j < iframeNodes.length; j++) {
          if (iframeNodes[j].__vue__) {
            el = iframeNodes[j]
            break
          }
        }
      }
    }

    if (el) {
      let Vue = Object.getPrototypeOf(el.__vue__).constructor
      while (Vue.super) {
        Vue = Vue.super
      }
      win.postMessage({
        devtoolsEnabled: Vue.config.devtools,
        vueDetected: true
      }, '*')
    }
  }, 100)
}

// inject the hook
const script = document.createElement('script')
script.textContent = ';(' + detect.toString() + ')(window)'
document.documentElement.appendChild(script)
script.parentNode.removeChild(script)
