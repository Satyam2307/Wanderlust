module.exports.renderSignUpForm = (req , res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = (async(req , res) => {
    try {
        let { username, email, password } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash("error", "A user with the given email is already registered");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser , (err) => {
            if(err){
                return next(err);
            }
        req.flash("success", "Welcome to wanderlust!");
        res.redirect(req.session.redirectUrl);
        });
        } catch(e) {
        if (e.code === 11000) {
            req.flash("error", "A user with the given email is already registered");
        } else {
            req.flash("error", e.message);
        }
        res.redirect("/signup");
    }
});

module.exports.renderLoginForm = (req , res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req,res) => {
    req.flash("success" , "Welcomt to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
    };

module.exports.logout = (req , res , next) =>{
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success" , "Sucessfully logged out!");
        res.redirect("/listings");
    })};
