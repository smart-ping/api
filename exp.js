const axios = require('axios')
axios.get('http://localhost:1844').then( res => {
    console.log(res)
}).catch( err => {
    console.error(err)
})
