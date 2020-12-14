const { W_OK } = require( "constants" )
const fs = require( 'fs' )



function checkAccess ( file ) {

    try {
        fs.accessSync( file, W_OK )
    } catch ( error ) {
        console.log( error )
        return false
    }

    return true

}



function readFile ( storagePath ) {

    if ( !fs.existsSync( storagePath ) ) {
        saveTimers( [], storagePath, true )
    }

    if ( checkAccess( storagePath ) ) {

        try {
            const text = fs.readFileSync( storagePath, { encoding: 'utf-8' } )
            return text
        } catch ( error ) {
            throw new Error( `Unable to read file from ${ storagePath }` )
        }

    } else {
        throw new Error( 'Storage file does not have correct access rights' )
    }

}


function loadTimers ( storagePath ) {

    const text = readFile( storagePath )
    const timers = JSON.parse( text )

    return timers
}



function writeFile ( text, storagePath, isFresh ) {

    if ( isFresh || checkAccess( storagePath ) ) {

        try {
            fs.writeFileSync( storagePath, text, { encoding: 'utf-8' } )
        } catch ( error ) {
            console.error( error )
            throw new Error( `Unable to write on ${ storagePath }` )
        }

    } else {
        throw new Error( 'Storage file does not have correct access rights' )
    }

}


function saveTimers ( timers, storagePath, isFresh ) {

    const strippedTimers = timers.map( timer => ( {
        title: timer.title, time: timer.time
    } ) )

    const jsonStr = JSON.stringify( strippedTimers )
    writeFile( jsonStr, storagePath, isFresh )

}


module.exports = { loadTimers, saveTimers }