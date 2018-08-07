module.exports = function getBool(str) {
    const lo = str.toLowerCase()

    return ((lo == 'true') || (lo == 'yes')) 
}
