import mnats from 'nats'
import queue from './queue'
import axios from 'axios'
import http_check from './checker_http'

const nats = mnats.connect(queue.connect)

nats.subscribe(queue.ping_in, (msg) => {
    const check = JSON.parse(msg)

    const data = {
        id: check.id,
        date: Date.now()
    }

    http_check(check.url)
    .then( response => {
        console.log(`Success check ${check.url} for ${check.id}`)
        data.status = 'Ok'
        nats.publish(queue.ping_out, JSON.stringify(data))
    })
    .catch( error => {
       // console.log(`Fail check ${check.url} for ${check.id}`)
        data.status = 'Fail'
        nats.publish(queue.ping_out, JSON.stringify(data))
    })
})