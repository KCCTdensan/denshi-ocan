import cv from "./opencv.js"
import { sleep } from "./utils.js"

const hue = 0
const q = 'video'
const fps = 1

let handler = console.log

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

function isGlowing(src) {
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
  res = !!cv.countNonZero(denoise)
  // cv.imshow('canv', denoise)

  img.delete()
  gray.delete()
  low.delete()
  high.delete()
  blur.delete()
  denoise.delete()

  return res
}
