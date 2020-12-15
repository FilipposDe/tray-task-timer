
const { ipcRenderer: ipc } = require( 'electron' )
const { TIMERS_LOAD_SUCCESS, TIMER_UPDATE, REQUEST_TIMER_START, REQUEST_TIMER_PAUSE, REQUEST_TIMER_STOP, TIMER_STOP } = require( "./constants" )


ipc.on( TIMERS_LOAD_SUCCESS, ( e, { timers } ) => {
    console.log( 'timers', timers )
    this.timers = timers
} )

// @ts-ignore
const app = new Vue( {
    el: '#app',
    data: {
        timers: [],
        timePassed: 0,
        activeTimer: null,
    },
    mounted: function () {
        console.log( 'finished load', new Date() )


        ipc.on( TIMERS_LOAD_SUCCESS, ( e, { timers } ) => {
            this.timers = timers
        } )

        ipc.on( TIMER_UPDATE, ( e, { timers, index, timePassed } ) => {
            this.timers = timers
            this.activeTimer = timers[ index ]
            this.timePassed = timePassed
        } )

        ipc.on( TIMER_STOP, ( e, { timers } ) => {
            this.timers = timers
            this.activeTimer = null
            this.timePassed = 0
        } )

    },
    methods: {
        displayTime: function ( time ) {
            console.log( 'time', time )
            return ( new Date( time ) ).toISOString().substr( 11, 8 )
        },
        start: function ( index ) {
            ipc.send( REQUEST_TIMER_START, { index } )
        },
        pause: function () {
            ipc.send( REQUEST_TIMER_PAUSE )
        },
        stop: function () {
            ipc.send( REQUEST_TIMER_STOP )
        },
    }
} )




// ipc.on( 'loadTimers', ( event, timers ) => {

//     const allContainers = document.querySelectorAll( '.container' )
//     allContainers.forEach( container => {
//         container.parentElement.removeChild( container )
//     } )

//     timers.forEach( ( timer, index ) => {
//         setupTimerElements( timer, index )
//     } );


//     const addInput = document.querySelector( '#new-timer' )
//     const addBtn = document.querySelector( '#add-btn' )
//     addBtn.addEventListener( 'click', ( e ) => {
//         e.preventDefault()
//         ipc.send( 'create', addInput.value )
//     } )


// } )

// function setupTimerElements ( timer, index ) {

//     const container = document.createElement( 'div' )
//     document.body.appendChild( container )
//     container.id = 'timer' + index
//     container.classList.add( 'container' )

//     const heading = document.createElement( 'h2' )
//     container.appendChild( heading )
//     heading.innerText = timer.title
//     heading.addEventListener( 'dblclick', ( e ) => {
//         e.preventDefault()
//         heading.style.display = 'none'
//         input.style.display = 'inline-block'
//         saveBtn.style.display = 'inline-block'
//     } )

//     const input = document.createElement( 'input' )
//     container.appendChild( input )
//     input.value = timer.title
//     input.style.display = 'none'

//     const saveBtn = document.createElement( 'button' )
//     container.appendChild( saveBtn )
//     saveBtn.innerText = 'OK'
//     saveBtn.addEventListener( 'click', e => {
//         e.preventDefault()
//         ipc.invoke( 'rename', index, input.value ).then( renamed => {
//             if ( renamed ) {
//                 heading.innerText = input.value
//             }
//         } )
//         heading.style.display = 'block'
//         input.style.display = 'none'
//         saveBtn.style.display = 'none'
//     } )
//     saveBtn.style.display = 'none'


//     const deleteBtn = document.createElement( 'button' )
//     container.appendChild( deleteBtn )
//     deleteBtn.innerText = 'x'
//     deleteBtn.addEventListener( 'click', ( e ) => {
//         e.preventDefault()
//         ipc.invoke( 'delete', index ).then( deleted => {
//             if ( deleted ) {
//                 container.parentElement.removeChild( container )
//             }
//         } )
//     } )



//     const text = document.createElement( 'p' )
//     container.appendChild( text )
//     text.innerText = ( new Date( timer.time ) ).toISOString().substr( 11, 8 )
//     text.style.padding = '10px'

//     ipc.on( 'timerUpdate' + index, ( event, time ) => {
//         text.innerText = ( new Date( time ) ).toISOString().substr( 11, 8 )
//         document.querySelectorAll( 'p' ).forEach( p => {
//             p.style.backgroundColor = 'transparent'
//         } )
//         text.style.backgroundColor = '#aadee6'
//     } )
// }