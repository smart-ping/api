'use strict'
const minimist = require('minimist')
const models = require('./mongo')

const Log = models.Log,
    Check = models.Check,
    Periodic = models.Periodic


function help()
{
    console.log('Usage: srv-cli [commands [opts...] args]')
    console.log('Available command:')
    console.log(" check\t\tadd, remove and modify check")
}

async function addCheck(_url, _interval)
{
    const newCheck = new Check({url: _url, interval: _interval})
    const newPeriodic = new Periodic({ check: newCheck._id, next: new Date() })

    return await Promise.all([
            newCheck.save(), newPeriodic.save() ])
}

var argv = minimist(process.argv.slice(2));

if (argv._.lenght < 1) {
    help()
} else if (argv._[0] == 'check') {
    switch (argv._[1]) {
        case 'add':
            addCheck(argv.url, argv.interval)
                .then((res) =>{
                    console.log('Successful add!')
                    process.exit(0)
                })
                .catch((e) => {
                    console.error('Error:', e)
                    process.exit(200)
                })
        break
        default:
            help()
    }
} else {
    help()
}

//process.exit(0)