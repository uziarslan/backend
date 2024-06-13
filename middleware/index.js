module.exports.isLoggedin = (req, res, next) => {
    if (!req.user) {
        req.flash('error', "Sign up/Sign in First");
        return res.redirect('/admin/login')
    }
    next();
}