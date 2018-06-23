'use strict'
module.exports = ({ models, express, bcrypt, jwt, jwtToken, cors }) => {
    const routes = express.Router()

    // const corsOpt = {
    //     optionsSuccessStatus: 200,
    //     origin: true,
    //     methods: ['POST'],
    //     credentials: false,
    //     maxAge: 10,
    // //    preflightContinue: true
    // }

    // const corsOptPf = {
    //     optionsSuccessStatus: 200,
    //     origin: true,
    //     methods: ['POST'],
    //     credentials: true,
    //     maxAge: 10,
    //     preflightContinue: true
    // }

    var options = {
        origin: true,
        methods: ['POST'],
        credentials: true,
        maxAge: 3600
    }
    
    routes.options('/login', cors(options))

    routes.post('/login', cors(options), async function (req, res) {
        const email = req.body.email
        const password = req.body.password
        console.log('1')

        if (!email || !password)
            return res.status(400).json({ type: 'error', message: 'email and password fields are essential for authentication.' })

        const users = await models.User.find({ email: email })
        console.log('2')
        if (users.length == 0)
            return res.status(403).json({ type: 'error', message: 'User with provided email not found in database.' })
        console.log('3')
        const user = users[0]

        if (await bcrypt.compare(password, user.password)) {
            res.json({
                type: 'success',
                message: 'User logged in.',
                user: { id: user._id, email: user.email },
                token: jwt.sign({ id: user._id, email: user.email }, jwtToken, { expiresIn: '7d' })
            })
        } else {
            return res.status(403).json({ type: 'error', message: 'Password is incorrect.' })
        }
    })

    routes.get('/me', async function (req, res) {

        const token = req.headers['x-access-token']

        if (!token) return res.status(400).json({ type: 'error', message: 'x-access-token header not found.' })

        try {
            const result = await jwt.verify(token, jwtToken)

            return res.json({
                type: 'success',
                message: 'Provided token is valid.',
                result
            })
        }
        catch (error) {
            res.status(403).json({ type: 'error', message: 'Provided token is invalid.', error })
        }
    })

    routes.post('/register', async function (req, res) {
        const email = req.body.email
        const password = req.body.password
        if (!email || !password) return res.status(400).json({ type: 'error', message: 'email and password fields are essential for registration.' })

        const newUser = new models.User({
            email: email,
            password: await bcrypt.hash(password, 10)
        });

        try {
            await newUser.save()
            res.json({ type: 'success', id: newUser._id })
        }
        catch (e) {
            if (e.name == 'MongoError' && e.code == 11000) {
                res.status(400).json({ type: 'error', message: 'email already exist' })
            } else {
                res.status(400).json({ type: 'error' })
            }
        }
    })

    return routes
}