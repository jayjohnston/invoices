const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, DOMAIN } = require('./.env');
const domain = DOMAIN;

const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { sequelize } = require('./model/db');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const buildRoute = require('./buildRoute');
const invoiceRoute = require('./invoiceRoute');
const loginRoute = require('./loginRoute');
const privacyRoute = require('./privacyRoute');
const termsRoute = require('./termsRoute');
const debugRoute = require('./debugRoute');
const listRoute = require('./listRoute');
const feedbackRoute = require('./feedbackRoute');

let app = express();

app.use(express.urlencoded({extended: true}));

const session_store = new SequelizeStore({ db: sequelize, });
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: session_store,
  resave: false,
  proxy: true,
}));
session_store.sync();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

/* Passport */
app.use(passport.initialize());
app.use(passport.session());

checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.session.passport.user;
    res.locals.user.email = req.session.passport.user.emails[0].value;
    return next()
  }
  res.locals.error = 'error logging in';
  res.redirect('/login')
}

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${domain}/auth/google/callback`
  },
  function (accessToken, refreshToken, profile, done) { return done(null, profile) }
));

/* Routes */
app.use('/favicon.ico', express.static('./images/favicon.ico'));
app.use('/question.png', express.static('./images/question.png'));

app.use('/build.css', express.static('./css/build.css'));
app.use('/invoice.css', express.static('./css/invoice.css'));
app.use('/style.css', express.static('./css/style.css'));
app.use('/login.css', express.static('./css/login.css'));
app.use('/feedback.css', express.static('./css/feedback.css'));

app.use('/build.js', express.static('./js/build.js'));
app.use('/feedback.js', express.static('./js/feedback.js'));

app.use('/bg-greydots-s.gif', express.static('./images/bg-greydots-s.gif'));
app.use('/bg-greydots-m.gif', express.static('./images/bg-greydots-m.gif'));
app.use('/bg-greydots-l.gif', express.static('./images/bg-greydots-l.gif'));

app.get('/auth/google',
  passport.authenticate('google', { scope : ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) { res.redirect('/'); }
);

app.get('/login', loginRoute);
app.get('/privacy-policy', privacyRoute);
app.get('/terms-of-service', termsRoute);
app.get('/feedback', feedbackRoute);
app.post('/feedbackp', feedbackRoute);

app.get('/logout', function(req, res) {
  req.session.destroy(function (err) {
    res.redirect('/login');
  });
});

app.get('/debug*', checkAuthenticated, debugRoute);

app.use('/', checkAuthenticated, buildRoute);
app.use('/build/:id', checkAuthenticated, buildRoute);

app.post('/invoice', checkAuthenticated, invoiceRoute);
app.get('/invoices', checkAuthenticated, listRoute);
app.get('/invoice/:id', checkAuthenticated, invoiceRoute);

app.listen(3000,function() {
  console.log("Server started");
});
