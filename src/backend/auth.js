'use strict'

module.exports = ({ models, express, bcrypt, jwt, jwtToken, cors }) => {
    const routes = express.Router()
    
    routes.options('*', cors())

    routes.post('/login', cors(), async function (req, res) {
        const email = req.body.email
        const password = req.body.password

        if (!email || !password)
            return res.status(400).json({ type: 'error', message: 'email and password fields are essential for authentication.' })

        const users = await models.User.find({ email: email })
        
        if (users.length == 0)
            return res.status(403).json({ type: 'error', message: 'Неверный email или пароль' })
        
        const user = users[0]

        if (await bcrypt.compare(password, user.password)) {
            res.json({
                type: 'success',
                message: 'User logged in.',
                user: { id: user._id, email: user.email },
                token: jwt.sign({ id: user._id, email: user.email }, jwtToken, { expiresIn: '7d' })
            })
        } else {
            return res.status(403).json({ type: 'error', message: 'Неверный email или пароль' })
        }
    })

    routes.get('/me', cors(), async function (req, res) {

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

    routes.post('/register', cors(), async function (req, res) {
        const email = req.body.email
        const password = req.body.password

        if (!email || !password) return res.status(400).json({ type: 'error', message: 'email and password fields are essential for registration.' })

        const newUser = new models.User({
            email: email,
            password: await bcrypt.hash(password, 10)
        });

        try {
            await newUser.save()

            res.json({
                type: 'success', id: newUser._id,
                message: 'User registered and logged in.',
                user: { id: newUser._id, email: newUser.email },
                token: jwt.sign({ id: newUser._id, email: newUser.email }, jwtToken, { expiresIn: '7d' })
            })

        }
        catch (e) {
            if (e.name == 'MongoError' && e.code == 11000) {
                res.status(400).json({ type: 'error', message: 'Пользователь с таким email уже существует' })
            } else {
                res.status(400).json({ type: 'error', message: 'Ошибка сервера' })
            }
        }
    })

    return routes
}