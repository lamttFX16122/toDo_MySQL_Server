const changeMinutesToHours = (mitutes) => {
    let hours = parseInt(mitutes / 60) > 0 ? `${parseInt(mitutes / 60)}h` : '';
    let min = mitutes % 60 > 0 ? `${mitutes % 60}p` : '';
    return `${hours} ${min}`
}
module.exports = {
    changeMinutesToHours
}