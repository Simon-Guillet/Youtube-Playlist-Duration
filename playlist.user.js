// ==UserScript==
// @name        Youtube Playlist Duration
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @grant       none
// @version     1.0
// @author      Simon-Guillet
// @description 13/05/2022, 00:04:25
// @require https://cdn.jsdelivr.net/npm/@violentmonkey/dom@1

// ==/UserScript==

VM.observe(document.body, () => {
	// Find the target node
	const publisherContainer = document.querySelector(
		"#secondary #playlist #publisher-container"
	)

	let listVideos = document.querySelectorAll(
		"#secondary #playlist ytd-thumbnail-overlay-time-status-renderer"
	)

	if (publisherContainer) {
		//indexMessage = video "2 / 8"
		let indexMessage =
			publisherContainer.querySelector(".index-message").textContent
		videoNum = parseInt(indexMessage.slice(indexMessage.search("/") + 2))

		if (
			videoNum === listVideos.length &&
			window.getComputedStyle(publisherContainer, null).display === "flex"
		) {
			function reset() {
				// Setup variables
				indexMessage =
					publisherContainer.querySelector(".index-message").textContent
				currentVideo = parseInt(
					indexMessage.slice(0, indexMessage.search("/") - 1)
				)
				listVideos = document.querySelectorAll(
					"#secondary #playlist ytd-thumbnail-overlay-time-status-renderer"
				)
				currentTime = document.querySelector(
					".ytp-chrome-bottom .ytp-time-current"
				).textContent

				currentLength = document.querySelector(
					".ytp-chrome-bottom .ytp-time-duration"
				).textContent

				timeList = []
				secondsList = []
				sumnHours = 0
				sumnMinutes = 0
				sumnSeconds = 0
				sumnHoursPast = 0
				sumnMinutesPast = 0
				sumnSecondsPast = 0
			}

			function getTimeList() {
				// get the duration of all videos
				listVideos.forEach(function (currentValue, currentIndex, listObj) {
					timeList.push(currentValue.lastChild.innerText)
				})
				timeList.forEach(function (value, index, array) {
					turnLengthIntoNumbers(value)
					seconds = convertToSeconds(hours, minutes, seconds)
					secondsList.push(seconds)
				})
			}

			function addTimes() {
				// adds all durations together
				secondsList.forEach(function (value, i, array) {
					sumnSeconds += value
				})

				// adds all past durations together
				for (let i = 0; i < currentVideo - 1; i++) {
					const value = secondsList[i]
					sumnSecondsPast += value
				}

				// gets lenght of video playing and the one that should play
				turnLengthIntoNumbers(currentLength)
				currentLength = convertToSeconds(hours, minutes, seconds)
				currentLengthActual = timeList[currentVideo - 1]
				turnLengthIntoNumbers(currentLengthActual)
				currentLengthActual = convertToSeconds(hours, minutes, seconds)

				// is video playing not an ad?
				if (
					currentLength === currentLengthActual ||
					currentLength === currentLengthActual - 1
				) {
					// adds time of video playing to past
					turnLengthIntoNumbers(currentTime)
					currentTime = convertToSeconds(hours, minutes, seconds)
					sumnSecondsPast += currentTime
				}
			}

			function normaliseTime(hours, minutes, seconds) {
				// converts into formated duration
				quo = Math.floor(seconds / 60)
				seconds %= 60

				minutes += quo
				quo = Math.floor(minutes / 60)
				minutes %= 60
				hours += quo
				minutes = minutes.toLocaleString("en-US", {
					minimumIntegerDigits: 2,
					useGrouping: false,
				})
				seconds = seconds.toLocaleString("en-US", {
					minimumIntegerDigits: 2,
					useGrouping: false,
				})
				return [hours, minutes, seconds]
			}

			function turnLengthIntoNumbers(length) {
				// converts "h:mm:ss" into (hours, minutes, seconds)

				// get part before first ":"
				firstThing = length.search(":")
				newStr = length.slice(firstThing + 1)

				secondThing = newStr.search(":") // second ":" position
				if (secondThing > -1) {
					// hh:mm:ss
					hours = length.slice(0, firstThing)
					minutes = length.slice(firstThing + 1, firstThing + 3)
					seconds = length.slice(firstThing + 4)
				} else {
					// mm:ss
					hours = "0"
					minutes = length.slice(0, firstThing)
					seconds = length.slice(firstThing + 1)
				}
				// turn str into int
				hours = parseInt(hours)
				minutes = parseInt(minutes)
				seconds = parseInt(seconds)
			}

			function convertToSeconds(hours, minutes, seconds) {
				seconds += minutes * 60 + hours * 360
				return seconds
			}

			function createNode() {
				// creates div w/ "mm:ss / mm:ss"
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
				duration.textContent =
					totalPast[0] +
					":" +
					totalPast[1] +
					":" +
					totalPast[2] +
					" / " +
					total[0] +
					":" +
					total[1] +
					":" +
					total[2]
				duration.style.marginInline = "8px"
				duration.style.fontWeight = "bold"
				publisherContainer.append(duration)
			}

			function update() {
				reset()
				getTimeList()
				addTimes()
				total = normaliseTime(sumnHours, sumnMinutes, sumnSeconds)
				totalPast = normaliseTime(
					sumnHoursPast,
					sumnMinutesPast,
					sumnSecondsPast
				)
				createNode()
			}

			update()
			var monTimer = setInterval(function () {
				update()
			}, 1000)

			// disconnect observer
			return true
		}
	}
})
