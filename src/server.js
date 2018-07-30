'use strict'
const mongoose = require('mongoose')
const queue = require('./queue')
const models = require('./mongo')
const Schedule = require('./schedule')
const events = require('./events') 

const nats = require('nats').connect({ url: queue.connect, json: true })

nats.on('connect', nc => {
    console.log('nats connected to:', nc.currentServer.url.href)
})

nats.on('error', nc => {
    console.log('nats connect error:', nc.currentServer.url.href)
})

nats.subscribe(queue.ping_out, events.saveStateMessage)

const Sched = new Schedule()

setInterval(function () {
    Sched.scheduleBatch(5000, (check) => {
        nats.publish(queue.ping_in, {
            url: check.url,
            id: check._id
        })
    })
}, 5000)