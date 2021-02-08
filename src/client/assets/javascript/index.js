// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

/**
* @description updates store 
* @param {state, state} - Store, new version of store
*/
const updateStore = (store, newState) => {
    store = Object.assign(store, newState)    
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {

	const racers = await getRacers();
	const player_id = store.player_id;
	const track_id = store.track_id;

	try {

		// render starting UI
		renderAt('#race', renderRaceStartView(track_id, racers))
		
		// const race = TODO - invoke the API call to create the race, then save the result
		createRace(player_id, track_id)
		.then((race) => {		
		
			// TODO - update the store with the race id
			updateStore(store, {race_id: race.ID});			
			// The race has been created, now start the countdown
			// TODO - call the async function runCountdown
			return runCountdown();		
		})
		.then((data) => {
			// TODO - call the async function startRace								
			return startRace(store.race_id)
		})
		.then((data) => {
			// TODO - call the async function runRace			
			return runRace(store.race_id)
		})

	} catch (error) {
		console.log(`oops, looks like we have an error in handleCreateRace: ${error}`);
	}
	
}

/**
* @description runs the race 
* @param {number} - id of created race
*/
function runRace(id) {

	// NOTE - use Javascript's built in setInterval method to get race info

	return new Promise(resolve => {

		const getRaceDetails = async () => {

			getRace(id)

			.then((race) => {

				switch (race.status) {
					case "in-progress":
						renderAt('#leaderBoard', raceProgress(race.positions))
						break;	
					case "finished":
						clearInterval(raceInterval)
						renderAt('#race', resultsView(race.positions))
						resolve(race)
						break;				
					default:
					  console.log(`oops, looks like we have an error in runRace() - switch case -> default`);
				  }
			})

		}

		// every 500ms
		let raceInterval = setInterval(getRaceDetails, 500, id)
	})
	.catch((error) => {
		console.log(`oops, looks like we have an error in runRace: ${error}`)
	})
}

/**
* @description starts countdown when race start 
*/
async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3	
		
		return new Promise(resolve => {

			let interval = setInterval(() => {

				if (timer !== 0) {
					document.getElementById('big-numbers').innerHTML = --timer
				} else {
					clearInterval(interval);
					return resolve();
				}


			}, 1000);
		});

	} catch(error) {
		console.log(`oops, looks like we have an error in runCountdown: ${error}`);
	}
}

/**
* @description updates store with selected racer 
*/
function handleSelectPodRacer(target) {
	
	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store	
	updateStore(store, { player_id: target.id }); 
		
}

/**
* @description updates store with selected track
*/
function handleSelectTrack(target) {
	
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	updateStore(store, { track_id: target.id }); 	
	
}

/**
* @description calls method that invoke accelerate api call
*/
function handleAccelerate() {
	
	// TODO - Invoke the API call to accelerate
	try {
		accelerate(store.race_id)
	} catch (error) {
		console.log(`oops, looks like we have an error in handleAccelerate(): ${error}`)
	}
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

/**
* @description render list of racers
*/
function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

/**
* @description render cards for racer selection 
*/
function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	
	return `
		<div class="racer-container">		
			<li class="card podracer avatar-${getNierRacerName(id)}" id="${id}"></li>
			<li>	
				<p>${getNierRacerName(id)}</p>
				<p>${top_speed}</p>
				<p>${acceleration}</p>
				<p>${handling}</p>	 
			</li>						
		<div>		
	`
}

/**
* @description changes racer name based on id 
*/
const getNierRacerName = (id) => {

	let name = '';

	switch (id) {
		case 1:
			name = '2B' 
			break;	
		case 2:
			name = '9S' 
			break;	
		case 3:
			name = 'A2' 
			break;	
		case 4:
			name = 'Pascal' 
			break;
		case 5:
			name = 'Emil' 
			break;
		default:
		  console.log(`oops, looks like we have an error getting nier racer name =(`);
	  }

	 return name; 	
}

/**
* @description render list of tracks
*/
function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

/**
* @description render cards for track selection 
*/
function renderTrackCard(track) {
	const { id, name } = track
	
	return `
	<div class=track-container>
		<li id="${id}" class="card track location-${id}"></li>		
		<h3 class="location-title">${getTrackLocationName(id)}</h3>
	</div>
	`
}

/**
* @description changes track name based on id  
*/
const getTrackLocationName = (id) => {

	let name = '';

	switch (id) {
		case 1:
			name = 'City Ruin' 
			break;	
		case 2:
			name = 'Amusement Park' 
			break;	
		case 3:
			name = 'Desert' 
			break;	
		case 4:
			name = 'Forest' 
			break;
		case 5:
			name = 'Abandoned Factory' 
			break;
		case 6:
			name = 'Machine Village' 
			break;
		default:
		  console.log(`oops, looks like we have an error getting track location  =(`);
	  }

	 return name; 	
}

/**
* @description render countdown number 
* @param {number} current countdown second
*/
function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

/**
* @description render race ui 
* @param {object, object} selected track and racers
*/
function renderRaceStartView(track, racers) {	

	return `
		<header>
			<h1>Race: ${getTrackLocationName(parseInt(store.track_id))}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

/**
* @description render template for race progression 
* @param {Array} array with racers positions
*/
function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<button type="button" class="btn btn-dark"><a href="/race">Start a new race</a></button>
		</main>
	`
}

/**
* @description render race progression 
* @param {Array} array with racers positions
*/
function raceProgress(positions) {

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {

		//find selected charater
		if (p.id == store.player_id) {
			return `
				<tr>
					<td>
						<h3>${count++} - ${getNierRacerName(p.id)} (You)</h3>					
					</td>
				</tr>
			`
		} else {
			return `
				<tr>
					<td>
						<h3>${count++} - ${getNierRacerName(p.id)}</h3>					
					</td>
				</tr>
			`
		}	

	}).join(''); //fix weird comma appearing in DOM

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

const getTracks = async () => {

	try {
		const tracks = await fetch(`${SERVER}/api/tracks`)
		return tracks.json();
	} catch (error) {
		console.log(`Error fetching tracks: ${error}`)		
	}

}

const getRacers = async () => {
		
	try {
		const racers = await fetch(`${SERVER}/api/cars`)		
		return racers.json();
	} catch (error) {
		console.log(`Error fetching racers: ${error}`)		
	}

}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	return fetch(`${SERVER}/api/races/${id - 1}`)
	.then(response => response.json())
	.catch(error => console.error(`An error occured while getting race: ${error}`))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id - 1}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}

function accelerate(id) {
	return fetch(`${SERVER}/api/races/${id -1}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.status)
	.catch(err => console.log("Problem with accelerate request::", err))
}
