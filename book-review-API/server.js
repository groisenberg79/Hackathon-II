const express = require('express');
const { PORT } = require('./configs/configs.js');
const session = require('express-session');
const reviewRouter = require('./routes/reviewRoutes.js');
const app = express();


app.use(express.json());
app.use(session({
    secret: 'superUser123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,  // set to true if you're using HTTPS
      httpOnly: true, // Makes cookie inaccessible from JavaScript for security
    }
  }));
app.use('/', reviewRouter);

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})
