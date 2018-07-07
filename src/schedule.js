'use strict'
const _ = require('lodash')
const models = require('./mongo')
const moment = require('moment')
var colors = require('colors/safe')

const Log = models.Log,
    Check = models.Check,
    Periodic = models.Periodic

const msPerMinutes = 60000

class Schedule {

    constructor() {
    }

    addAllToPeriodic() {
        Check.find({ deletedAt: null }).then(check_res => {
            check_res.forEach((check) => {
                Periodic.findOne({ check: check._id }).then(periodic => {
                    if (periodic == null) {
                        const NewPeriodic = new Periodic({ check: check._id, next: new Date((new Date()).getTime() + check.interval * msPerMinutes) })
                        NewPeriodic.save()
                    }
                })
            })
        })
    }

    async scheduleBatch(_interval, _cb) {
        const start = moment()
        const end = moment().add(_interval,'ms')

        console.log( start.format('DD.MM.YYYY HH:mm:ss'),'-', end.format('DD.MM.YYYY HH:mm:ss'))
        
        const periodic_list = await Periodic.find({ 
            next: {
                $lt: end.toDate()
            }
        })

        periodic_list.forEach(async function (periodic) {
            const check = await Check.findById(periodic.check)

            console.log(colors.cyan(check.url), colors.yellow(check.interval), moment(periodic.next).format('DD.MM.YYYY HH:mm:ss'),colors.cyan('->'), 
                moment(periodic.next).add(check.interval,'m').format('DD.MM.YYYY HH:mm:ss'))

            const delay = moment(periodic.next).diff(moment())
            
            periodic.next = moment(periodic.next).add(check.interval,'m').toDate()
            await periodic.save()

            setTimeout(function () {
                _cb(check)
            }, delay)
            
        })
            
    }
}

module.exports = Schedule