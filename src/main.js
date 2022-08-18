const sleep = ms => new Promise(res => setTimeout(res, ms))
const q = query => document.querySelector(query)

////////////////////////////////////////////////////////////////

const target = q("#target"),
      dencon = q("#dencon"),
      denconAnime = q("#denconAnime")
const denconAnimationRot = "property: rotation; to: 0 360 0; dur: 4000; easing: linear; loop: true"
      denconAnimationLookback = "property: rotation; to: 0 0 0; dur: 1000; easing: easeInOutQuad"
      denconAnimationCenter = "property: position; to: 0 0 0; dur: 1000; easing: easeInOutQuad"

////////////////////////////////////////////////////////////////

let fuwafuwaLast = true
let front
let animeLast = denconAnimationRot
let dancing = 0 // 0 | 1 | 2 | 3

////////////////////////////////////////////////////////////////

// dencon animation fuwafuwa

function stopFuwafuwa() { front = undefined }

// todo: when switch models, call this
function resumeFuwafuwa() {
  front = q(".frontView")
  if(fuwafuwaLast) startFuwafuwa() // beacuse fuwafuwa stops when front not found
}

function startFuwafuwa(t) {
  fuwafuwaLast = true
  if(!front) return
  front?.setAttribute("position", `0 ${(Math.sin(t/200)+1)/4} 0`)
  requestAnimationFrame(startFuwafuwa)
}

// dencon animation utils

function pauseAnime(ignoreDancing = false) {
  // ダンスはポーズしない
  if(!ignoreDancing && dancing) {
    stopDance()
    return
  }
  stopFuwafuwa()
  dencon.removeAttribute("animation")
}

function resumeAnime() {
  resumeFuwafuwa()
  dencon.setAttribute("animation", animeLast)
}

function startRotation() {
  animeLast = denconAnimationRot
  dencon.setAttribute("animation", denconAnimationRot)
}

const lookback = () => new Promise(res => {
  pauseAnime(true)
  dencon.setAttribute("animation__rot", denconAnimationLookback)
  dencon.setAttribute("animation__ctr", denconAnimationCenter)
  dencon.addEventListener("animationcomplete", animationEnd)
  function animationEnd() {
    dencon.removeEventListener("animationcomplete", animationEnd)
    dencon.removeAttribute("animation__rot")
    dencon.removeAttribute("animation__ctr")
    res()
  }
})

// dencon click animation

function stopDance() {
  switch(dancing) {
    // not dancing
    case 0: break
    // lokking back or sleeping
    case 1: dancing = 0; break
    // now dancing!
    case 2: dancing = 0
      denconAnime.removeEventListener("animation-finished", onDanceEnd)
      denconAnime.setAttribute("visible", "false")
      denconAnime.removeAttribute("animation-mixer")
      dencon.setAttribute("visible", "true")
      break
    // dance ended
    case 3: dancing = 0; break
  }
}

dencon.addEventListener("click", async () => {
  if(!dancing) { dancing = 1
    await lookback()
    await sleep(250)
    if(!dancing) return; dancing = 2
    dencon.setAttribute("visible", "false")
    dencon.setAttribute("position", "0 0 0")
    denconAnime.setAttribute("visible", "true")
    denconAnime.setAttribute("animation-mixer", "loop: once")
    denconAnime.addEventListener("animation-finished", onDanceEnd)
  }
})

async function onDanceEnd() {
  if(!dancing) return; dancing = 3
  denconAnime.removeEventListener("animation-finished", onDanceEnd)
  denconAnime.setAttribute("visible", "false")
  denconAnime.removeAttribute("animation-mixer")
  dencon.setAttribute("visible", "true")
  await sleep(500)
  if(!dancing) return; dancing = 0
  resumeAnime()
}

// event

target.addEventListener("targetFound", resumeAnime)

target.addEventListener("targetLost", pauseAnime)

// LED

window.handler = led => {}

////////////////////////////////////////////////////////////////

resumeFuwafuwa() // ふわふわ
startRotation() // ぐるぐる
