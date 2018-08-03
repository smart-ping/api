'use strict'

const mongoose = require('mongoose')
const models = require('./mongo')

async function closeAndOpenEvent(checkId, eventId, online) {

    if (eventId) {

        const event = await models.Event.findById(eventId)
        if (event) {
            event.finish = new Date()
            event.duration = event.finish - event.start
            await event.save()
        }
    }

    try {
        const event = new models.Event({
            online: online,
            check: mongoose.Types.ObjectId(checkId),
            start: new Date()
        })

        await event.save()

        return event._id

    } catch (e) {
        console.error('ERR: store event', e.message)
    }

    return null
}

module.exports = {
    async saveStateMessage(msg) {
        try {
            const check = await models.Check.findById(msg.id)
            const online = (msg.status == 'Ok')
            let eventId = check.event
    
            if (check) {
                if (( check.online != online ) || (eventId == null)) {
                    eventId = await closeAndOpenEvent(check.id, check.event, online)
                }
                check.online = online
                check.event = eventId

                await check.save()
            }
    
            const log = new models.Log({
                check: mongoose.Types.ObjectId(msg.id),
                event: mongoose.Types.ObjectId(eventId),
                date: new Date(msg.date),
                status: msg.status,
                duration: msg.duration,
                downloadSize: msg.downloadSize
            })
    
            await log.save()
    
        } catch (error) {
            console.log('Error:', error.message)
        }
    }
}