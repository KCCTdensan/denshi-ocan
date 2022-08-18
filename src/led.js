import cv from "./opencv.js"
const max = Math.max, min = Math.min
const sleep = ms => new Promise(res => setTimeout(res, ms))

////////////////////////////////////////////////////////////////

const hue       = 0,
      satur     = 0,
      saturMax  = 255,
      value     = 200,
      valueMax  = 255
const blurRatio = 0.2
const threshold = 100

const expandRatioX = 1.2,
      expandRatioY = 2.5

const posCache = 5
const q = 'video'
const fps = 1

////////////////////////////////////////////////////////////////

window.handler ||= console.log

cv.onRuntimeInitialized = async () => {
  let elem
  while(!(elem = document.querySelector(q))) await sleep(100)
  while(!(elem.width && elem.height)) await sleep(10)
  const cap = new cv.VideoCapture(elem)
  const src = new cv.Mat(elem.height, elem.width, cv.CV_8UC4)
  while(true) {
    cap.read(src)
    handler(isGlowing(src))
    await sleep(1000 / fps)
  }
}

////////////////////////////////////////////////////////////////

// points to Rect object
function wrapRect(pts) {
  const x = min(pts[0], pts[6]),
        y = min(pts[1], pts[3])
  return {
    x, y,
    width: max(pts[2], pts[4]) - x,
    height: max(pts[5], pts[7]) - y,
  }
}

// expands Rect object
function expand(rect, ratioX, ratioY) {
  const width = rect.width * ratioX,
        height = rect.height * ratioY
  return {
    x: max(0, rect.x - (width - rect.width) / 2),
    y: max(0, rect.y - (height - rect.height) / 2),
    width, height,
  }
}

let _posCacheN = posCache
let _posCache
function isGlowing(src) {
  try {
    // QR detect
    const detector = new cv.QRCodeDetector()
    const detected = new cv.Mat()
    if(detector.detect(src, detected)) {
      _posCacheN = posCache
      _posCache = detected.data32F
    } else if(!_posCacheN--) {
      return false
    }
    const rect = wrapRect(_posCache) // used in blur ratio
    const qr = src.roi(expand(rect, expandRatioX, expandRatioY))

    // HSV
    const img = new cv.Mat()
    cv.cvtColor(qr, img, cv.COLOR_RGB2HSV)

    // color mask range
    const gray = new cv.Mat()
    const low = cv.matFromArray(3, 1, cv.CV_64F, [hue, satur, value])
    const high = cv.matFromArray(3, 1, cv.CV_64F, [hue+4, saturMax, valueMax])
    cv.inRange(img, low, high, gray)

    // blur and threshold
    const denoise = new cv.Mat()
    const blurred = new cv.Mat()
    const blur = rect.x * blurRatio
    cv.blur(gray, blurred, new cv.Size(blur, blur))
    cv.threshold(blurred, denoise, threshold, 255, cv.THRESH_BINARY)

    // result
    res = !!cv.countNonZero(denoise)

    detector.delete()
    detected.delete()
    qr.delete()
    img.delete()
    gray.delete()
    low.delete()
    high.delete()
    denoise.delete()
    blurred.delete()

    return res
  } catch {
    return false
  }
}
