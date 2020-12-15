function newTimer ( title ) {
    return {
        title,
        isPaused: false,
        isActive: false,
        time: 0,
    }
}

function addTimer ( title, timers ) {
    return [ ...timers, newTimer( title ) ]
}

function removeTimer ( index, timers ) {
    return timers.filter( ( t, i ) => i !== index )
}

function renameTimer ( title, index, timers ) {
    return timers.map( ( t, i ) => i === index ? { ...t, title } : t )
}

module.exports = {
    addTimer,
    removeTimer,
    renameTimer,
}