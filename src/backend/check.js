'use strict'

const mongoose = require('mongoose')

function getBool(str) {
    const lo = str.toLowerCase()

    return ((lo == 'true') || (lo == 'yes')) 
}

module.exports = ({ models, express, jwt, jwtToken, cors }) => {
    const routes = express.Router()

    routes.use(async function (req, res, next) {

        const token = req.cookies['x-access-token']

        if (!token) return res.status(400).json({ type: 'error', message: 'x-access-token cookie not found.' })

        try {
            req.user = await jwt.verify(token, jwtToken)
            next()
        }
        catch (error) {
            res.status(403).json({ type: 'error', message: 'Provided token is invalid.', error })
        }
    })

    routes.get('/checks', async function (req, res) {

        try {
            const checks = await models.Check.find({ user: req.user.id })
            var response = []
            checks.forEach(element => {
                response.push({
                    id: element._id,
                    title: element.title,
                    url: element.url,
                    interval: element.interval,
                    online: element.online
                })
            })
            res.json({ type: 'success', checks: response })
        } catch (error) {
            return status(400).json({ type: 'error', message: 'Unknown server error.', error })
        }
    })

    routes.post('/checks', cors(), async function (req, res) {

        if (!req.body.url || !req.body.interval)
            return res.status(400).json({ type: 'error', message: 'Для создания проверки нужен url и интервал' })

        try {
            const check = new models.Check({
                user: req.user.id,
                title: req.body.title,
                url: req.body.url,
                interval: req.body.interval
            })

            const result = await check.save()

            const periodic = new models.Periodic({
                check: check._id,
                next: new Date()
            })

            await periodic.save()

            res.json({
                type: 'success',
                id: result._id
            })
        }
        catch (error) {
            res.status(403).json({ type: 'error', message: 'Create error.', error })
        }
    })

    routes.delete('/checks/:id', cors(), async function (req, res) {

        if (!req.params.id)
        {
            res.sendStatus(404).json({ type: 'error', error: 'Нужен id для удаления' })
        }

        try {
            await models.Check.findByIdAndRemove(req.params.id)
            await models.Periodic.deleteMany( { check: req.params.id })
            await models.Log.deleteMany( { check: req.params.id })
            await models.Event.deleteMany( { check: req.params.id })
            
            res.json({ type: 'success' })

        } catch (error) {
            console.log(error)
            res.status(404).json({ type: 'error', error: error })
        }
    })

    routes.get('/checks/log/:id', cors(), async function (req, res) {

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

            var from = req.query.from
            var to = req.query.to

            if (to) {
                query.date = {
                    $gte: from ? new Date(from) : new Date(),
                    $lt: new Date(to)
                }
            } else {
                if (from) {
                    query.date = {
                        $gte: new Date(from)
                    }
                }
            }

        } catch (error) {
            res.status(404).json({ status: 'error', error: 'Invalid params.' })
        }

        try {
            if (req.query.onlycount && getBool(req.query.onlycount)) {

                res.json({
                    type: 'success',
                    count: await models.Log.count(query)
                })

            } else {
                const recs = await models.Log.find(query, null, options)

                var result = []

                recs.forEach(item => {
                    result.push({
                        id: item._id,
                        date: item.date,
                        status: item.status,
                        duration: item.duration,
                        downloadSize: item.downloadSize
                    })
                })

                res.json({ type: 'success', log: result })
            }
        } catch (error) {
            res.status(404).json({ type: 'error', error: error })
        }
    })

    routes.get('/checks/stat/:id', cors(), async function (req, res, next) {

        var options = {}

        var match = {
            check: mongoose.Types.ObjectId(req.params.id)
        }

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
                        $gte: from.toISOString()
                    }
                }
            }

        } catch (error) {
            console.error(error)
            res.status(404).json({ status: 'error', error: 'Invalid params.' }).end()
            return
        }

        try {

            const agg = [
                { $match: match }
            ]

            console.log(JSON.stringify(agg, null, ' '))


            const recs = await models.Log.aggregate(agg)

            res.json({ type: 'success', data: recs  })
            
        } catch (error) {
            console.error(error)
            res.status(404).json({ type: 'error', error: error })
        }
    })

    routes.get('/checks/evt/:id', cors(), async function (req, res) {
        const id = req.params.id
        res.json({ type: 'success', id: id })
    })

    return routes
}
