const cookieParser = require('cookie-parser');
const express = require('express');
const httpErrors = require('http-errors');
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');

const app = express();

const mongoUrl = 'mongodb://localhost:27017/retail';
mongoose
  .connect(mongoUrl, { useNewUrlParser: true });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/customer/:id', (req, res) => {
  const CustomerSchema = mongoose.Schema({
    customer_id: { type: Number, required: true, unique: true },
    customer_fname: { type: String, required: true },
    customer_lname: { type: String, required: true },
    customer_email: {
      type: String, required: true, unique: true, uppercase: true
    },
    customer_password: { type: String, required: true },
    customer_street: { type: String, required: true },
    customer_city: { type: String, required: true },
    customer_state: { type: String, required: true },
    customer_zipcode: { type: String, required: true }
  });
  const CustomerModel = mongoose.model('customer', CustomerSchema, 'customers');
  CustomerModel
    .findOne({ customer_id: req.params.id })
    .exec()
    .then((customer) => {
      res.send(customer);
    })
    .catch((err) => {
      throw err;
    });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
