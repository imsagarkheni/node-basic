var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
var logger = require('morgan');
let mongoose = require("mongoose");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cors = require('cors');

var app = express();
mongoose.set('runValidators', true);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.once('open', () => {
  console.log("Well done! , connected with mongoDB database");
}).on('error', error => {
  console.log("Oops! database connection error:" + error);
});

const server = require('http').createServer(app);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', indexRouter);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const corsOptions = {
  origin: ["http://localhost:3000", "https://react-basic-eta.vercel.app/"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // This option allows cookies to be sent cross-origin
};
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

const apispaths = [
	{ pathUrl: '/', routeFile: 'register' },
  { pathUrl: '/profile', routeFile: 'profile' },
];
apispaths.forEach((path) => {
	app.use('/apis/v1' + path.pathUrl, require('./routes/apis/v1/' + path.routeFile));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
