const axios = require('axios')

module.exports = function http_check(url) {
    return new Promise((resolve, reject) => {
        const start = process.hrtime()
        axios.get(url)
        .then( response => {
            const diff = process.hrtime(start)
            resolve({
                url: url,
                status: response.status,
                duration_ns: diff[0] * 1e9 + diff[1]
            })
        })
        .catch( error => {
            const diff = process.hrtime(start)
            console.log(error)
            reject({
                    url: url,
                    code: error.errno,
                    duration_ns: diff[0] * 1e9 + diff[1]
                })
        })
    })
}

