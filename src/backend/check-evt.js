
'use strict'

const mongoose = require('mongoose')
const getBool = require('./getbool')

module.exports = async function (req, res) {

    var options = {}

    var query = {
        check: mongoose.Types.ObjectId(req.params.id)
    }

    try {
        const offset = Number.parseInt(req.query.offset)
        const limit = Number.parseInt(req.query.limit)

        if (limit)
            options.limit = limit
        if (offset)
            options.skip = offset

        const from = new Date(req.query.from)
        const to = new Date(req.query.to)

        if (to) {
            query.start = {
                $gte: from ? from : new Date(),
                $lt: to
            }
        } else {
            if (from) {
                query.start = {
                    $gte: from
                }
            }
        }
    } catch (error) {
        res.status(404).json({ status: 'error', error: 'Invalid params.' }).end()
        return
    }

    try {
        if (req.query.onlycount && getBool(req.query.onlycount)) {

            res.json({
                type: 'success',
                count: await req.models.Event.count(query)
            })

        } else {
            const recs = await req.models.Event.find(query, null, options)

            var result = []

            recs.forEach(item => {
                result.push({
                    id: item._id,
                    start: item.start,
                    finish: item.finish,
                    duration: item.duration,
                    online: item.online
                })
            })

            res.json({ type: 'success', log: result })
        }
    } catch (error) {
        console.error(error)
        res.status(404).json({ type: 'error', error: error })
    }
}