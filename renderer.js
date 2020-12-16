
const { ipcRenderer: ipc } = require( 'electron' )
const { TIMERS_LOAD_SUCCESS, TIMER_UPDATE, REQUEST_TIMER_START, REQUEST_TIMER_PAUSE, REQUEST_TIMER_STOP, TIMER_STOP, REQUEST_TIMER_ADD, REQUEST_TIMER_REMOVE, REQUEST_WINDOWS } = require( "./constants" )


ipc.on( TIMERS_LOAD_SUCCESS, ( e, { timers } ) => {
    console.log( 'timers', timers )
    this.timers = timers
} )

// @ts-ignore
const app = new Vue( {
    el: '#app',
    data: {
        timers: [],
        windows: [],
        selectedWindows: [],
        timePassed: 0,
        activeTimer: null,
        newTitle: "",
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
        add: function () {
            ipc.invoke( REQUEST_TIMER_ADD, { title: this.newTitle } )
                .then( result => this.timers = result )
        },
        remove: function ( index ) {
            ipc.invoke( REQUEST_TIMER_REMOVE, { index } )
                .then( result => this.timers = result )
        },
        toggleWindow: function ( index ) {
            if ( this.selectedWindows.includes( index ) ) {
                this.selectedWindows = this.selectedWindows.filter( i => i !== index )
            } else {
                this.selectedWindows.push( index )
            }
        },
        fetchWindows: async function () {
            this.windows = []
            this.selectedWindows = []
            ipc.invoke( REQUEST_WINDOWS )
                .then( result => this.windows = result )

        }
    }
} )



