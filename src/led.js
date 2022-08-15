import cv from "./opencv.js"

function isGlowing(src, hue = 0) {
  // HSV
  const img = new cv.Mat()
  cv.cvtColor(src, img, cv.COLOR_RGB2HSV)

  // color mask range
  const gray = new cv.Mat()
  const low = cv.matFromArray(3, 1, cv.CV_64F, [hue, 0, 225])
  const high = cv.matFromArray(3, 1, cv.CV_64F, [hue, 255, 255])
  cv.inRange(img, low, high, gray)

  // blur and threshold
  const denoise = new cv.Mat()
  const blur = new cv.Mat()
  cv.blur(gray, blur, new cv.Size(4, 4))
  cv.threshold(blur, denoise, 100, 255, cv.THRESH_BINARY)

  // result
  res = // denoise to bool

  src.delete()
  img.delete()
  gray.delete()
  low.delete()
  high.delete()
  blur.delete()
  denoise.delete()

  return res
}

cv.onRuntimeInitialized = () => {
}
