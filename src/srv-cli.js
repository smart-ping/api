import  { Check } from './mongo'
import minimist from 'minimist'

function help()
{
    console.log('Usage: srv-cli [commands [opts...] args]')
    console.log('Available command:')
    console.log(" check\t\tadd, remove and modify check")
}

function addCheck(_url, _interval)
{
    const newCheck = new Check({url: _url, interval: _interval})

    newCheck.save().then((doc) => {
        console.log(`Saved with id: ${doc.id}`)
        process.exit(0)
    }).catch((err)=> {
        console.log('Error save:', err.message)
        process.exit(200)
    })
}

var argv = minimist(process.argv.slice(2));

if (argv._.lenght < 1) {
    help()
} else if (argv._[0] == 'check') {
    switch (argv._[1]) {
        case 'add':
            addCheck(argv.url, argv.interval)
        break
        default:
            help()
    }
} else {
    help()
}
//process.exit(1)