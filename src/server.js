const mnats = require('nats')
const mongoose = require('mongoose')
const queue = require('./queue')
const models = require('./mongo')
const Schedule = require('./schedule')

const Log = models.Log,
    Check = models.Check,
    Periodic = models.Periodic

const nats = mnats.connect(queue.connect)

nats.subscribe(queue.ping_out, msg => {

    const message = JSON.parse(msg)

    const log = new Log({
        parent: mongoose.Types.ObjectId(message.id),
        date: new Date(message.date),
        status: message.status
    })
    log.save()
})

const Sched = new Schedule()

Sched.addAllToPeriodic()

setInterval(function () {
    console.log('scan')
    Sched.scheduleBatch(10, (periodic) => {
        console.log(periodic)
    })
}, 10000)