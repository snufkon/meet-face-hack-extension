const video = document.createElement('video')
const canvas = document.createElement('canvas')
const canvasCtx = canvas.getContext('2d')
let model = null
let keepAnimation = false

let imageIndex = 0
function getImage() {
  const image = lmMarkImages[imageIndex]
  imageIndex += 1
  if (imageIndex == lmMarkImages.length) {
    imageIndex = 0
  }

  return image
}

function drawImage(prediction) {
  let imageIndex = 0
  const boundingBox = prediction.boundingBox
  const x = boundingBox.topLeft[0]
  const y = boundingBox.topLeft[1]
  const w = boundingBox.bottomRight[0] - x
  const h = boundingBox.bottomRight[1] - y

  // draw Rectangle for debug
  // canvasCtx.strokeStyle = "rgb(255, 0, 0)";
  // canvasCtx.strokeRect(x, y, w, h)

  const image = getImage()
  canvasCtx.drawImage(image, x, y, w, h)
}

async function updateCanvas() {
  if (!keepAnimation) return

  if (model) {
    canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const predictions = await model.estimateFaces({ input: video })
    for (const prediction of predictions) {
      drawImage(prediction)
    }
  }
  requestAnimationFrame(updateCanvas)
}

function isScreenSharing(constraints) {
  return !constraints.video.deviceId
}

function replaceStopFunction(stream, videoTrack) {
  if (!videoTrack) return

  videoTrack._stop = videoTrack.stop
  videoTrack.stop = function () {
    keepAnimation = false
    videoTrack._stop()
    stream.getTracks().forEach((track) => {
      track.stop()
    })
  }
}

const _getUserMedia = navigator.mediaDevices.getUserMedia.bind(
  navigator.mediaDevices
)

navigator.mediaDevices.getUserMedia = async function (constraints) {
  const srcStream = await _getUserMedia(constraints)

  if (isScreenSharing(constraints)) {
    return srcStream
  }

  video.srcObject = srcStream
  video.onloadedmetadata = function (e) {
    video.play()
    video.volume = 0.0
    video.width = video.videoWidth
    video.height = video.videoHeight
    canvas.width = video.width
    canvas.height = video.height

    keepAnimation = true
    updateCanvas()
  }

  const outStream = canvas.captureStream(10)
  const videoTrack = outStream.getVideoTracks()[0]
  replaceStopFunction(srcStream, videoTrack)

  return outStream
}

async function loadModel() {
  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
  )
  //console.log("model: loaded")
}

function main() {
  loadModel()
}

main()
