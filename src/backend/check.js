'use strict'

module.exports = ({ models, express, jwt, jwtToken, cors }) => {
    const routes = express.Router()

    routes.options('*', cors())

    routes.use(async function (req, res, next) {

        const token = req.headers['x-access-token']

        if (!token) return res.status(400).json({ type: 'error', message: 'x-access-token header not found.' })

        try {
            req.user = await jwt.verify(token, jwtToken)
            next()
        }
        catch (error) {
            res.status(403).json({ type: 'error', message: 'Provided token is invalid.', error })
        }
    })

    routes.get('/checks', cors(), async function (req, res) {

        try {
            const checks = await models.Check.find({ user: req.user.id, deletedAt: null })
            var response = []
            checks.forEach(element => {
                response.push({
                    id: element._id,
                    url: element.url,
                    interval: element.interval
                })
            })
            res.json({ type: 'success', checks: response })
        } catch (error) {
            return status(400).json({ type: 'error', message: 'Unknown server error.', error })
        }
    })

    routes.post('/checks', cors(), async function (req, res) {

        if (!req.body.url || !req.body.interval)
            return res.status(400).json({ type: 'error', message: 'url and interval fields are essential for authentication.' })

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

    return routes
}
