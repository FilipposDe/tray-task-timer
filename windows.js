const { windowManager } = require( "node-window-manager" )



// windowManager.on( 'window-activated', ( window ) => {
// 	console.log( "Changed to", window.getTitle() )
// } )



function windows () {
    return windowManager.getWindows()
}

module.exports = { windows }