
const { ipcRenderer: ipc } = require( 'electron' )
const { TIMERS_LOAD_SUCCESS } = require( "./constants" )


ipc.on( TIMERS_LOAD_SUCCESS, ( e, { timers } ) => {
    console.log( 'timers', timers )
    this.timers = timers
} )

// @ts-ignore
const app = new Vue( {
    el: '#app',
    data: {
        timers: [],
    },
    mounted: function () {
        console.log( 'finished load', new Date() )


        ipc.on( TIMERS_LOAD_SUCCESS, ( e, { timers } ) => {
            console.log( 'timers', timers )
            this.timers = timers
        } )

    },
    methods: {
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