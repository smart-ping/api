'use strict'

const mongoose = require('mongoose')
const getBool = require('./getbool')

module.exports = async function (req, res, next) {

    var options = {}

    var match = {
        check: mongoose.Types.ObjectId(req.params.id)
    }

    var _id = {} 
    var _sort = { status: 'Ok' } // Агрегации можно делать только для записей успешной проверки

    try {
        const from = new Date(req.query.from)
        const to = new Date(req.query.to)

        if (to) {
            match.date = {
                $gte: from ? from : new Date(),
                $lt: to
            }
        } else {
            if (from) {
                match.date = {
                    $gte: from
                }
            }
        }

        switch(req.query.aggregate)
        {
            case 'minute':
                _id = {
                    minute: { $minute: "$date" },
                    hour: { $hour: "$date" },
                    day: { $dayOfMonth: "$date" },
                    month: { $month: "$date" },
                    year: { $year: "$date" }
                }
                _sort = {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                    "_id.hour": 1,
                    "_id.minute": 1
                }
            break
            case 'hour':
                _id = {
                    hour: { $hour: "$date" },
                    day: { $dayOfMonth: "$date" },
                    month: { $month: "$date" },
                    year: { $year: "$date" }
                }
                _sort = {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                    "_id.hour": 1,
                }
            break
            case 'day':
                _id = {
                    day: { $dayOfMonth: "$date" },
                    month: { $month: "$date" },
                    year: { $year: "$date" }
                }
                _sort = {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                }

            break
            case 'week':
                _id = {
                    month: { $month: "$date" },
                    year: { $year: "$date" }
                }
                _sort = {
                    "_id.month": 1,
                    "_id.day": 1,
                }
            break

            default:
            {
                throw new Error('Неверное значение параметра aggregate (minute, hour, day, week)')
            }
        }

    } catch (error) {
        console.error(error)
        res.status(404).json({ status: 'error', error: 'Invalid params.' }).end()
        return
    }
    try {

        const agg = [
            { $match: match },
            { $group: {
                "_id": _id,
                avg: { $avg: "$duration" }
            } },
            { $sort: _sort }
        ]

        const recs = await req.models.Log.aggregate(agg)

        res.json({ type: 'success', data: recs  })
        
    } catch (error) {
        console.error(error)
        res.status(404).json({ type: 'error', error: error })
    }
}