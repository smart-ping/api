const config = require('../config')

module.exports = {
    connect: config.natsurl,
    ping_in: 'ping.in',
    ping_out: 'ping.out'
}