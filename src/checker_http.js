const axios = require('axios')
const moment = require('moment')

module.exports = async function (url) {
    const startAt = moment()
    try {
        const status = await axios.get(url)

        return {
            status: 'Ok',
            duration: moment().diff(startAt),
            downloadSize: status.data.length,
            statusCode: status.status
        }
    } catch (error) {
        return {
            status: 'Error',
            duration: moment().diff(startAt)
        }
    }
}