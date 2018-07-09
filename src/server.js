'use strict'
const mongoose = require('mongoose')
const queue = require('./queue')
const models = require('./mongo')
const Schedule = require('./schedule')

const nats = require('nats').connect({ url: queue.connect, json: true })

nats.subscribe(queue.ping_out, async function(msg) {
 
    try {
        const check = await models.Check.findById(msg.id)
        const online = (msg.status == 'Ok')

        if (check) {
            if ( check.online != online ) {
                const event = new models.Event({
                    statusUp: online,
                    check: mongoose.Types.ObjectId(msg.id)
                })
                await event.save()
            }
            check.online = online
            await check.save()
        }

        const log = new models.Log({
            check: mongoose.Types.ObjectId(msg.id),
            date: new Date(msg.date),
            status: msg.status,
            duration: msg.duration,
            downloadSize: msg.downloadSize
        })

        await log.save()

    } catch (error) {
        console.log('Error:', error)
    }
})

const Sched = new Schedule()

setInterval(function () {
    Sched.scheduleBatch(5000, (check) => {
        nats.publish(queue.ping_in, {
            url: check.url,
            id: check._id
        })
    })
}, 5000)