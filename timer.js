const { TIMER_PAUSE, TIMER_START, TIMER_STOP, TIMER_UPDATE } = require( "./constants" )


function start ( timers, index, emitUpdateEvent ) {

    const chosenTimer = timers[ index ]

    const startTime = chosenTimer.isPaused
        ? Date.now() - chosenTimer.time
        : Date.now()

    const interval = setInterval( () => {
        const timePassed = Date.now() - startTime
        emitUpdateEvent( TIMER_UPDATE, { timers, index, timePassed } )
    }, 1000 )

    const newTimers = timers.map( t => {
        if ( t === chosenTimer ) {
            return { ...t, isPaused: false, isActive: true }
        } else {
            return { ...t, isPaused: false, isActive: false }
        }
    } )

    return { timers: newTimers, startTime, interval }

}

function stop ( timers ) {

    const activeTimer = timers.find( t => t.isActive )
    if ( !activeTimer ) throw new Error( 'Unexpected instruction to stop an already stopped timer' )

    const updatedTimer = { ...activeTimer, isPaused: false, isActive: false, time: 0 }
    const newTimers = timers.map( t => t === activeTimer ? updatedTimer : t )

    return { timers: newTimers, startTime: null }

}

function pause ( timers, startTime ) {

    const runningTimer = timers.find( t => t.isActive && !t.isPaused )
    if ( !runningTimer ) throw new Error( 'Unexpected instruction to pause an already paused or inactive timer' )

    const updatedTimer = { ...runningTimer, isPaused: true, time: Date.now() - startTime }
    const newTimers = timers.map( t => t === runningTimer ? updatedTimer : t )

    return { timers: newTimers, startTime: null }

}

const timerControl = {
    startTime: null,
    interval: null,
    timers: null,
    emitTimerEvent: null,
    init ( timers, dispatch ) {
        this.timers = timers
        this.emitTimerEvent = dispatch
    },
    checkInit () {
        if ( this.timers === null || this.emitTimerEvent === null ) {
            throw new Error( 'TimerControl has not been initialized' )
        }
    },
    start ( index ) {
        this.checkInit()
        const { timers, startTime, interval } = start( this.timers, index, this.emitTimerEvent )
        this.timers = timers
        this.startTime = startTime
        this.interval = interval
        this.emitTimerEvent( TIMER_START, { timers, index } )
    },
    stop () {
        this.checkInit()
        clearInterval( this.interval )
        const { timers, startTime } = stop( this.timers )
        this.timers = timers
        this.startTime = startTime
        this.emitTimerEvent( TIMER_STOP, { timers } )
    },
    pause () {
        this.checkInit()
        clearInterval( this.interval )
        const { timers, startTime } = pause( this.timers, this.startTime )
        this.timers = timers
        this.startTime = startTime
        this.emitTimerEvent( TIMER_PAUSE, { timers } )
    },
    getActiveTimer () {
        this.checkInit()
        return this.timers.find( t => t.isActive )
    },
    getRunningTimer () {
        this.checkInit()
        return this.timers.find( t => t.isActive && !t.isPaused )
    },
    getTimers () {
        return this.timers
    },
    remove ( index ) {
        if ( this.getRunningTimer() === this.timers[ index ] ) return this.timers
        this.timers = this.timers.filter( ( t, i ) => i !== index )
        return this.timers
    },
    add ( title ) {
        this.timers = [ ...this.timers, {
            title,
            isPaused: false,
            isActive: false,
            time: 0,
        } ]
        return this.timers
    },
    rename ( title, index ) {
        this.timers = this.timers.map( ( t, i ) => i === index ? { ...t, title } : t )
        return this.timers
    }

}

// function dispatch ( event, data ) {
//     // Update tray
//     // Emit event
// }




module.exports = {
    timerControl
}