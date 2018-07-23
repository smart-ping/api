'use strict'

module.exports = {
    port: process.env.PORT || 8080,
    jwtToken: '7AzDqu4P4E9VbokJ',
    mongourl: process.env.MONGO_URL || 'mongodb://localhost/checks',
    natsurl: process.env.NATS_URL || 'hats://localhost:4222' 
}