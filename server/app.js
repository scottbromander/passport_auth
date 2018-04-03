let express = require('express');
let app = express();
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let passport = require('passport');
let session = require('express-session');
let localStrategy = require('passport-local');

let User = require('./models/user');
let index = require('./routes/index');
let register = require('./routes/register');

let users = require('./routes/users');

let mongoose = require('mongoose');

app.use(session({
    secret: 'secret',
    key: 'user',
    resave: true,
    s: false,
    cookie: {maxAge: 60000, secure: false}
}));

//Mount Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({expanded: true}));
app.use(passport.initialize());
app.use(passport.session());

//Mongo Setup
let mongoURI = "mongodb://localhost:27017/passport";
mongoose.connect(mongoURI);
let MongoDB = mongoose.connection;

MongoDB.on('error', function(err){
    console.log("Mongo Connection Error: ", err);
});

MongoDB.once('open', function(err){
    console.log("Mongo Connection Open")
});

//PASSPORT SESSION
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user){
        if(err) done(err);
        done(null, user);
    });
});

passport.use('local', new localStrategy({
    passReqToCallback: true,
    usernameField: 'username'
}, (req, username, password, done) => {
    User.findOne({username: username}, function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'Incorrect username and password'})
        }

        user.comparePassword(password, function(err, isMatch){
            if(err) throw err;
            if(isMatch)
                return done(null, user);
            else
                done(null, false, {message: 'Incorrect username and password'});
        });
    });
}));


//ROUTES
app.use('/register', register);
app.use('/user', users);
app.use('/', index);

app.set("port", (process.env.PORT || 5000));

app.listen(app.get("port"), () => {
    console.log("Listening on port: " + app.get("port"));
});

module.exports = app;