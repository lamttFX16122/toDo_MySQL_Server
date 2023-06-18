/**
 * Render string to format '0h0p'
 * @param {*} mitutes 
 * @returns string
 */
const changeMinutesToHours = (mitutes) => {
    let hours = parseInt(mitutes / 60) > 0 ? `${parseInt(mitutes / 60)}h` : '';
    let min = mitutes % 60 > 0 ? `${mitutes % 60}p` : '';
    if (hours === '' && min === '') {
        return 0;
    }
    return `${hours} ${min}`
}
module.exports = {
    changeMinutesToHours
}