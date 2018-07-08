'use strict'
const _ = require('lodash')
const models = require('./mongo')
const moment = require('moment')
var colors = require('colors/safe')

class Schedule {

    async scheduleBatch(_interval, _cb) {
        const end = moment().add(_interval,'ms') // До какого момента будем сканировать

        console.log( moment().format('DD.MM.YYYY [HH:mm:ss'),'-', end.format('HH:mm:ss]')) 
        
        const periodic_list = await models.Periodic.find({ 
            next: {
                $lt: end.toDate()
            }
        })

        periodic_list.forEach(async function (periodic) {
            const check = await models.Check.findById(periodic.check)

            var next = moment(periodic.next).add(check.interval,'m') // новый момент для запуска

            if (next < moment()) { // новый момент в прошлом
                next = moment().add(check.interval,'m') // пересчитаем от теущего момента
            }  

            const delay = moment(periodic.next).diff(moment())  // уточняем когда точно надо будет послать событие

            console.log(colors.cyan(check.url), 
                colors.yellow(check.interval), 
                moment(periodic.next).format('DD.MM.YYYY HH:mm:ss'),colors.cyan('->'), 
                moment(next).format('DD.MM.YYYY HH:mm:ss'), 
                (delay < 0 ) ? colors.red(delay) : colors.green(delay)
            )

            periodic.next = next
            await periodic.save()

            if (delay > 0) {            // если можем корретируем точность исполнения
                setTimeout(function () {
                    _cb(check)
                }, delay)
            }
            else {
                _cb(check)
            }
        })
    }
}

module.exports = Schedule