'use strict'
const _ = require('lodash')
const models = require('./mongo')

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

    scheduleBatch(_interval, _cb) {
        const start = new Date()
        const end = new Date(start.getTime() + _interval * 10000)
        Periodic.find({
            next: {
                $lt: end
            }
        }).then(periodic_list => {
            periodic_list.forEach((periodic) => {
                Check.findById(periodic.check).then(check => {
                    periodic.next = new Date(start.getTime() + check.interval * msPerMinutes)
                    periodic.save()
                    _cb(periodic)
                })
            })
        })
    }
}


module.exports = Schedule