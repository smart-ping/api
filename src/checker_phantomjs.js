'use strict'
const phantom = require('phantom')
const moment = require('moment')

async function check(url) {

    const instance = await phantom.create()
    const page = await instance.createPage()
    let metrika = {
        resource:[]
    }

    await page.on('onLoadStarted', function () {
        metrika.startAt = new Date();
    });

    await page.on('onResourceRequested', function (data) {
        metrika.resource.push({
            id: data.id,
            requestAt: new Date(),
            req: data,
            start: null,
            end: null
        })
    });

    await page.on('onResourceReceived', function (data) {

        var index = -1
        metrika.resource.forEach(function (elem, idx) {
            if (elem.id == data.id) {
                index = idx
                return false
            }
            return true;
        })
        if (index < 0)
            return

        if (data.stage == 'end') {
            metrika.resource[index].end = data
        } else if (data.stage == 'start') {
            metrika.resource[index].start = data
        }
    })

    await page.on('onLoadFinished', function (status) {
        metrika.finishAt = new Date()
    })

    const status = await page.open(url, { operation: 'GET' })
    if (status !== 'success') {

        await instance.exit()

        throw new Error('cannot open')
    }

//    const metrika = await page.property('metrika')

    await instance.exit()

    return metrika
}

async function check_full (url) {
    try {
        const metrika = await check(url)

        const start = moment(metrika.startAt)
        const end = moment(metrika.finishAt)
        const time = end.diff(start)

        var sum = 0
        metrika.resource.forEach((elem) => {
            if (elem.start && elem.start.bodySize)
                sum += elem.start.bodySize

        })

        console.log(`Url: ${url}, size: ${sum}, time: ${time}`)
        
        return {
            url: url,
            status: 'Ok',
            duration: time,
            downloadSize: sum
        }
    }
    catch (e){
        return {
            url: url,
            status: 'Error'
        }
    }
}

module.exports = check_full

/*check_full('http://www.yandex.ru').then( res => {
    console.log(res)
})*/