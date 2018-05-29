import mnats from 'nats'
import queue from './queue'
import { Check, Log } from './mongo'
import { setTimeout } from 'timers';
import mongoose from 'mongoose'

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

function periodical() {
    Check.find({ deleteAt: null }).then((docs) => {
        docs.forEach((doc)=> {
            var job = {
                url: doc.url,
                interval: doc.interval,
                id: doc._id
            }
            nats.publish(queue.ping_in,JSON.stringify(job))
        })
    })
}   


setInterval(periodical, 10000)