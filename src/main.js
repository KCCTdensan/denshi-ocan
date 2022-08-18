const sleep = ms => new Promise(res => setTimeout(res, ms))
const q = query => document.querySelector(query)

////////////////////////////////////////////////////////////////

const target      = q("#target"),
      entity      = [q("#dencon"), q("#denconRed")],
      entityUra   = [q("#denconRed"), q("#dencon")],
      entityAnime = [q("#denconAnime"), q("#denconAnime2")]
const animationRotL     = "property: rotation; to: 0 360 0; dur: 4000; easing: linear; loop: true",
      animationLookback = "property: rotation; to: 0 0 0; dur: 1000; easing: easeInOutQuad",
      animationCenter   = "property: position; to: 0 0 0; dur: 1000; easing: easeInOutQuad",
      animationSwitchToR      = "property: position; to: 5 0 0; dur: 1000; easing: easeOutQuad",
      animationSwitchToL      = "property: position; to: -5 0 0; dur: 1000; easing: easeOutQuad",
      animationSwitchFromR    = "property: position; to: 0 0 0; dur: 1000; easing: easeOutQuad",
      animationSwitchFromL    = "property: position; to: 0 0 0; dur: 1000; easing: easeOutQuad"

////////////////////////////////////////////////////////////////

let slot = 0
let switching = false
let fuwafuwaLast = true
let _fuwafuwa = true
let animeLast = animationRotL
let dancing = 0 // 0 | 1 | 2 | 3

////////////////////////////////////////////////////////////////

// switch entities

const playAnime = (n, anime) => new Promise(res => {
  entity[n].setAttribute("animation", anime)
  entity[n].addEventListener("animationcomplete", animationEnd)

  function animationEnd() {
    entity[n].removeEventListener("animationcomplete", animationEnd)
    res()
  }
})

async function slotting(n) {
  if(switching
  || n == slot
  || n < 0
  || n >= entity.length) return
  pauseAnime()
  switching = true
  if(n < slot) {
    // switch left to right
    entity[n].setAttribute("position", "-5 0 0")
    entity[n].setAttribute("visible", "true")
    entity[slot].setAttribute("visible", "true")
    await Promise.all([
      playAnime(n, animationSwitchFromL),
      playAnime(slot, animationSwitchToR),
    ])
    entity[slot].setAttribute("visible", "false")
    entity[slot].removeAttribute("animation")
    entity[n].setAttribute("position", "0 0 0")
  } else {
    // switch right to left
    entity[n].setAttribute("position", "5 0 0")
    entity[n].setAttribute("visible", "true")
    entity[slot].setAttribute("visible", "true")
    await Promise.all([
      playAnime(n, animationSwitchFromR),
      playAnime(slot, animationSwitchToL),
    ])
    entity[slot].setAttribute("visible", "false")
    entity[slot].removeAttribute("animation")
    entity[n].setAttribute("position", "0 0 0")
  }
  await sleep(100)
  slot = n
  switching = false
  resumeAnime()
}

// animation fuwafuwa

function pauseFuwafuwa() { _fuwafuwa = false }

function resumeFuwafuwa() {
  if(fuwafuwaLast) startFuwafuwa()
}

function startFuwafuwa() {
  fuwafuwaLast = _fuwafuwa = true
  tick()

  function tick(t) {
    if(!_fuwafuwa) return
    entity[slot].setAttribute("position", `0 ${(Math.sin(t/200)+1)/4} 0`)
    requestAnimationFrame(tick)
  }
}

// animation utils

function pauseAnime(ignoreDancing = false) {
  // 切り替えの方が優先
  if(switching) return
  // ダンスはポーズしない
  if(!ignoreDancing && dancing) {
    stopDance()
    return
  }
  pauseFuwafuwa()
  entity[slot].removeAttribute("animation")
}

function resumeAnime() {
  resumeFuwafuwa()
  entity[slot].setAttribute("animation", animeLast)
}

function startRotL() {
  animeLast = animationRotL
  entity[slot].setAttribute("animation", animationRotL)
}

const lookback = () => new Promise(res => {
  pauseAnime(true)
  entity[slot].setAttribute("animation__rot", animationLookback)
  entity[slot].setAttribute("animation__ctr", animationCenter)
  entity[slot].addEventListener("animationcomplete", animationEnd)

  function animationEnd() {
    entity[slot].removeEventListener("animationcomplete", animationEnd)
    entity[slot].removeAttribute("animation__rot")
    entity[slot].removeAttribute("animation__ctr")
    res()
  }
})

// click animation

function stopDance() {
  switch(dancing) {
    // not dancing
    case 0: break
    // lokking back or sleeping
    case 1: dancing = 0; break
    // now dancing!
    case 2: dancing = 0
      entityAnime[slot].removeEventListener("animation-finished", onDanceEnd)
      entityAnime[slot].setAttribute("visible", "false")
      entityAnime[slot].removeAttribute("animation-mixer")
      entity[slot].setAttribute("visible", "true")
      break
    // dance ended
    case 3: dancing = 0; break
  }
}

entity.forEach((e, i) =>
  e.addEventListener("click", async () => {
    if(!dancing) { dancing = 1
      await lookback()
      await sleep(250)
      if(!dancing) return; dancing = 2
      entity[i].setAttribute("visible", "false")
      entity[i].setAttribute("position", "0 0 0")
      entityAnime[i].setAttribute("visible", "true")
      entityAnime[i].setAttribute("animation-mixer", "loop: once")
      entityAnime[i].addEventListener("animation-finished", onDanceEnd)
    }
  }))

async function onDanceEnd() {
  if(!dancing) return; dancing = 3
  entityAnime[slot].removeEventListener("animation-finished", onDanceEnd)
  entityAnime[slot].setAttribute("visible", "false")
  entityAnime[slot].removeAttribute("animation-mixer")
  entity[slot].setAttribute("visible", "true")
  await sleep(500)
  if(!dancing) return; dancing = 0
  resumeAnime()
}

// event

target.addEventListener("targetFound", resumeAnime)

target.addEventListener("targetLost", pauseAnime)

// LED

window.handler = led => {
  // when growing, switch to ura
}

sleep(10000).then(() => slotting(1))
sleep(20000).then(() => slotting(0))

////////////////////////////////////////////////////////////////

startFuwafuwa() // ふわふわ
startRotL()     // ぐるぐる
