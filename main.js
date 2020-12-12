const { app, BrowserWindow, Tray, Menu, ipcMain: ipc } = require( 'electron' )
const fs = require( 'fs' )

let mainWindow = null
let tray = null

let currentTimerIndex = -1
let interval
let start

const timers = []

function createWindow () {
	mainWindow = new BrowserWindow( {
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		}
	} )

	mainWindow.loadFile( 'index.html' )

	mainWindow.on( 'minimize', e => {
		e.preventDefault();
		mainWindow.hide();
	} )

}

app.whenReady().then( () => {
	createWindow()

	const loadedTimers = loadJSON()
	if ( loadedTimers ) {
		timers.splice( 0, timers.length )
		loadedTimers.forEach( timer => {
			timers.push( {
				title: timer.title,
				time: timer.time,
				isPaused: true,
			} )
		} );
	}

	mainWindow.webContents.on( 'did-finish-load', () => {
		mainWindow.webContents.send( 'loadTimers', timers )
	} )

	// mainWindow.webContents.openDevTools()


	tray = new Tray( 'icon.jpg' )

	tray.setToolTip( 'Timer' )
	updateTrayMenu()


	ipc.handle( 'delete', ( event, index ) => {
		if ( currentTimerIndex === index ) return false
		timers.splice( index, 1 )
		return true
	} )

	ipc.handle( 'rename', ( event, index, name ) => {
		timers[ index ].title = name
		updateTrayMenu()
		return true
	} )

	ipc.on( 'create', ( event, newName ) => {
		timers.push( {
			title: newName,
			time: 0,
			isPaused: false,
		} )
		mainWindow.webContents.send( 'loadTimers', timers )
	} )


	mainWindow.on( 'close', () => {
		clearInterval( interval )
		saveJSON()
	} )



	app.on( 'activate', function () {
		if ( BrowserWindow.getAllWindows().length === 0 ) createWindow()
	} )

} )


app.on( 'window-all-closed', function () {
	if ( process.platform !== 'darwin' ) app.quit()
} )


function startTimer ( timerIndex ) {
	if ( timers[ timerIndex ].isPaused ) {
		start = Date.now() - timers[ timerIndex ].time
	} else {
		start = Date.now()
	}
	currentTimerIndex = timerIndex
	interval = setInterval( () => {
		timers[ timerIndex ].time = Date.now() - start
		mainWindow.webContents.send( 'timerUpdate' + timerIndex, timers[ timerIndex ].time )
		updateTrayMenu()
	}, 1000 )
}

function pauseTimer ( timerIndex ) {
	clearInterval( interval )
	timers[ timerIndex ].isPaused = true
}

function stopTimer ( timerIndex ) {
	clearInterval( interval )
	timers[ timerIndex ].time = 0
	start = null
	timers[ timerIndex ].isPaused = false
	mainWindow.webContents.send( 'timerUpdate' + timerIndex, timers[ timerIndex ].time )
	currentTimerIndex = -1
	updateTrayMenu()
}



function updateTrayMenu () {

	const menuItems = []

	menuItems.push( {
		label: currentTimerIndex === -1 || timers[ currentTimerIndex ].isPaused ? "No timer running" : timers[ currentTimerIndex ].title,
		enabled: false
	} )


	menuItems.push( {
		type: 'separator',
	} )



	timers.forEach( ( timer, index ) => {
		menuItems.push( {
			label: 'Start ' + timer.title,
			click: () => {
				timers.forEach( ( otherTimer, otherIndex ) => {
					if ( otherTimer !== timer ) {
						pauseTimer( otherIndex )
					}
				} )
				startTimer( index )
			}
		} )
	} )

	menuItems.push( {
		label: 'Clear All', click: () => {
			if ( currentTimerIndex !== -1 ) {
				timers.forEach( ( timer, index ) => {
					stopTimer( index )
				} )
				currentTimerIndex = -1
				updateTrayMenu()
				saveJSON()
			}
		}
	} )


	menuItems.push( {
		label: 'Pause', click: () => {
			if ( currentTimerIndex !== -1 ) {
				pauseTimer( currentTimerIndex )
				saveJSON()
			}
		}
	} )


	menuItems.push( {
		label: 'Open App', click: () => mainWindow.show()
	} )


	tray.setContextMenu( Menu.buildFromTemplate( menuItems ) )

}

function saveJSON () {

	const data = JSON.stringify( timers.map( timer => ( {
		title: timer.title, time: timer.time
	} ) ) )

	fs.writeFile( 'storage.json', data, err => { } )

}


function loadJSON () {

	try {
		const json = fs.readFileSync( 'storage.json', { encoding: 'utf8' } )
		return JSON.parse( json )
	} catch ( error ) {
		console.error( error )
		return null
	}

}

