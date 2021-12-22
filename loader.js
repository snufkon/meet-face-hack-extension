function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      console.log(`loaded: ${src}`)
      resolve()
    }
    script.onerror = (e) => reject(e)
    document.body.insertBefore(script, document.body.firstChild)
  })
}

async function loadLocalScript(path) {
  const res = await fetch(chrome.runtime.getURL(path), {method: 'GET'})
  const text = await res.text()
  const script = document.createElement('script')
  script.textContent = text
  document.body.insertBefore(script, document.body.firstChild)
}


async function load() {
  loadLocalScript("lmMarkImg.js")
  
  await loadScript("https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js")
  await loadScript("https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js")
  await loadScript("https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js")
  await loadScript("https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js")

  loadLocalScript("main.js")
}

window.addEventListener('load', async (evt) => {
  await load()
})
