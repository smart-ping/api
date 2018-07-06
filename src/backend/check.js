'use strict'

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
            const checks = await models.Check.find({ user: req.user.id, deletedAt: null })
            var response = []
            checks.forEach(element => {
                response.push({
                    id: element._id,
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
            var check = new models.Check({
                user: req.user.id,
                url: req.body.url,
                interval: req.body.interval
            })

            const result = await check.save()

            res.json({
                type: 'success',
                id: result._id
            })
        }
        catch (error) {
            res.status(403).json({ type: 'error', message: 'Create error.', error })
        }
    })

    routes.get('/checks/:id', cors(), async function (req, res) {
        const id = req.params.id
    })

    return routes
}
