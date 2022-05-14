// ==UserScript==
// @name        Youtube Playlist Duration
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/watch
// @grant       none
// @version     1.0
// @author      Simon-Guillet
// @description 13/05/2022, 00:04:25
// @require https://cdn.jsdelivr.net/npm/@violentmonkey/dom@1

// ==/UserScript==

VM.observe(document.body, () => {
	// Find the target node
	const playlistPanel = document.querySelector("ytd-playlist-panel-renderer")
	const publisherContainer = document.querySelector(
		"#secondary #playlist #publisher-container"
	)

	let listVideos = document.querySelectorAll(
		"#secondary #playlist ytd-thumbnail-overlay-time-status-renderer"
	)

	if (publisherContainer) {
		let videoNum =
			publisherContainer.querySelector(".index-message").textContent
		videoNum = parseInt(videoNum.slice(videoNum.search("/") + 2))

		if (playlistPanel && videoNum === listVideos.length) {
			// console.log("Loading script")

			function reset() {
				listVideos = document.querySelectorAll(
					"#secondary #playlist ytd-thumbnail-overlay-time-status-renderer"
				)
				timeList = []
				sumnHours = 0
				sumnMinutes = 0
				sumnSeconds = 0
			}

			function getTimeList() {
				// get the duration of all videos
				listVideos.forEach(function (currentValue, currentIndex, listObj) {
					timeList.push(currentValue.lastChild.innerText)
				})
				// console.log(timeList)
			}

			function addTimes() {
				timeList.forEach(function (value, i, array) {
					// get part before first ":"
					firstThing = value.search(":")
					newStr = value.slice(firstThing + 1)

					secondThing = newStr.search(":") // second ":" position
					if (secondThing > -1) {
						// hh:mm:ss
						hours = value.slice(0, firstThing)
						minutes = value.slice(firstThing + 1, firstThing + 3)
						seconds = value.slice(firstThing + 4)
					} else {
						// mm:ss
						hours = "0"
						minutes = value.slice(0, firstThing)
						seconds = value.slice(firstThing + 1)
					}
					// turn str into int
					hours = parseInt(hours)
					minutes = parseInt(minutes)
					seconds = parseInt(seconds)
					// console.log(hours, minutes, seconds)

					sumnHours += hours
					sumnMinutes += minutes
					sumnSeconds += seconds
					// console.log(sumnHours, sumnMinutes, sumnSeconds)
				})
			}

			function normaliseTime() {
				quo = Math.floor(sumnSeconds / 60)
				sumnSeconds %= 60

				sumnMinutes += quo
				quo = Math.floor(sumnMinutes / 60)
				sumnMinutes %= 60
				sumnHours += quo
				sumnMinutes = sumnMinutes.toLocaleString("en-US", {
					minimumIntegerDigits: 2,
					useGrouping: false,
				})
				sumnSeconds = sumnSeconds.toLocaleString("en-US", {
					minimumIntegerDigits: 2,
					useGrouping: false,
				})
				// console.log(sumnHours, sumnMinutes, sumnSeconds)
			}

			function createNode() {
				if (publisherContainer.lastElementChild.id === "playlist-duration") {
					document.querySelector("#playlist-duration").remove()
				}
				let duration = document.createElement("div")
				duration.setAttribute("id", "playlist-duration")
				duration.classList.add(
					"index-message-wrapper",
					"style-scope",
					"ytd-playlist-panel-renderer"
				)
				duration.textContent = sumnHours + ":" + sumnMinutes + ":" + sumnSeconds
				duration.style.marginInline = "8px"
				duration.style.fontWeight = "bold"
				publisherContainer.append(duration)
			}

			function update() {
				console.log("updating")
				reset()
				getTimeList()
				addTimes()
				normaliseTime()
				createNode()
			}

			update()
			var monTimer = setInterval(function () {
				update()
			}, 10000)

			// console.log("Script loaded")

			// disconnect observer
			return true
		}
	}
})
