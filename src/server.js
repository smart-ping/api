'use strict'
const mongoose = require('mongoose')
const queue = require('./queue')
const models = require('./mongo')
const Schedule = require('./schedule')

const Log = models.Log,
    Check = models.Check,
    Periodic = models.Periodic

const nats = require('nats').connect({ url: queue.connect, json: true })

nats.subscribe(queue.ping_out, msg => {
    const log = new Log({
        parent: mongoose.Types.ObjectId(msg.id),
        date: new Date(msg.date),
        status: msg.status,
        duration: msg.duration,
        downloadSize: msg.downloadSize
    })
    log.save()
})

const Sched = new Schedule()

Sched.addAllToPeriodic()

setInterval(function () {
    console.log('.')
    Sched.scheduleBatch(1, (check) => {
        nats.publish(queue.ping_in, {
            url: check.url,
            id: check._id
        })
    })
}, 10000)