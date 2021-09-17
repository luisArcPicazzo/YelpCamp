/**
 * Wrapper function which catches the errors an then passes them to next.
 * A function that returns a function that catches the errors and then calls next
 * */

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}
