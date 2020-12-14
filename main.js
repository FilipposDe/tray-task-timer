const { app, BrowserWindow, Tray, Menu, ipcMain: ipc } = require( 'electron' )
const fs = require( 'fs' )
const path = require( 'path' )
const { windowManager } = require( "node-window-manager" );
const { loadTimers, saveTimers } = require( "./storage" );
const { timerControl } = require( "./timer" );
const config = require( "./config" );
const { STORAGE_FILE, TIMERS_LOAD_SUCCESS, TIMERS_LOAD_ERROR } = require( "./constants" );

const storagePath = path.join( app.getPath( 'appData' ), STORAGE_FILE )



function createWindow () {

	const mainWindow = new BrowserWindow( {
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		}
	} )

	mainWindow.loadFile( 'index.html' )

	if ( config.showDevTools ) mainWindow.webContents.openDevTools()

	return mainWindow


}

function createTray () {

	const tray = new Tray( 'icon.jpg' )
	tray.setToolTip( 'Task Timer' )

	return tray

}

app.whenReady().then( () => {

	// Load timers from storage file
	let timers = []
	let failedTimersLoad = false
	try {
		timers = loadTimers( storagePath )
	} catch ( error ) {
		console.error( error )
		failedTimersLoad = true
	}


	// Create UI
	const mainWindow = createWindow()
	const tray = createTray()

	// Initialze timers logic
	timerControl.init( timers, ( event, data ) => {
		sendWindowEvent( event, data, mainWindow )
		updateTrayMenu( data.timers, tray, mainWindow )
	} )


	// Update Tray UI
	updateTrayMenu( timers, tray, mainWindow )


	// Register Window listeners

	mainWindow.on( 'minimize', e => {
		e.preventDefault();
		mainWindow.hide();
	} )

	mainWindow.on( 'close', () => {
		if ( timerControl.getActiveTimer() ) timerControl.stop()
		saveTimers( timers, storagePath )
	} )

	mainWindow.webContents.on( 'did-finish-load', () => {
		console.log( 'finished load', new Date() )
		sendWindowEvent(
			failedTimersLoad ? TIMERS_LOAD_ERROR : TIMERS_LOAD_SUCCESS,
			{ timers },
			mainWindow
		)
	} )


	// Misc. app events
	app.on( 'activate', function () {
		if ( BrowserWindow.getAllWindows().length === 0 ) createWindow()
	} )

	app.on( 'window-all-closed', function () {
		if ( process.platform !== 'darwin' ) app.quit()
	} )



	// ipc.handle( 'delete', ( event, index ) => {
	// 	if ( currentTimerIndex === index ) return false
	// 	timers.splice( index, 1 )
	// 	return true
	// } )

	// ipc.handle( 'rename', ( event, index, name ) => {
	// 	timers[ index ].title = name
	// 	updateTrayMenu()
	// 	return true
	// } )

	// ipc.on( 'create', ( event, newName ) => {
	// 	timers.push( {
	// 		title: newName,
	// 		time: 0,
	// 		isPaused: false,
	// 	} )
	// 	mainWindow.webContents.send( 'loadTimers', timers )
	// } )



} )




function sendWindowEvent ( event, data, mainWindow ) {
	mainWindow.webContents.send( event, data )
}


function updateTrayMenu ( timers, tray, mainWindow ) {

	const menuItems = []

	const activeTimer = timerControl.getActiveTimer()

	// Current status
	menuItems.push( {
		label: activeTimer ? activeTimer.title : "No timer running ",
		enabled: false
	} )

	// Separator
	menuItems.push( {
		type: 'separator',
	} )

	// List of available timers
	timers.forEach( ( timer, index ) => {
		menuItems.push( {
			label: 'Start ' + timer.title,
			enabled: !activeTimer || !activeTimer.isPaused,
			click: () => {
				timerControl.start( index )
			}
		} )
	} )

	// Separator
	menuItems.push( {
		type: 'separator',
	} )

	// Pause
	menuItems.push( {
		label: 'Pause',
		enabled: !!activeTimer,
		click: () => {
			timerControl.pause()
			saveTimers( timers, storagePath )
		}
	} )

	// Stop
	menuItems.push( {
		label: 'Stop',
		enabled: !!activeTimer,
		click: () => {
			timerControl.stop()
			saveTimers( timers, storagePath )
		}
	} )

	// Separator
	menuItems.push( {
		type: 'separator',
	} )

	// Open app window
	menuItems.push( {
		label: 'Open Task Timer',
		click: () => {
			mainWindow.show()
		}
	} )

	tray.setContextMenu( Menu.buildFromTemplate( menuItems ) )
}



// windowManager.on( 'window-activated', ( window ) => {
	// 	console.log( "Changed to", window.getTitle() )
	// } )
