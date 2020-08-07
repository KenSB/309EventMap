/* server.js for react-express-authentication */
"use strict";

const log = console.log;

const express = require("express");
// starting the express server
const app = express();

// mongoose and mongo connection
const { mongoose } = require("./db/mongoose");
mongoose.set('useFindAndModify', false); // for some deprecation issues

// import the mongoose models
const { Event } = require("./models/event");
const { User } = require("./models/user");

// to validate object IDs
const { ObjectID } = require("mongodb");

// body-parser: middleware for parsing HTTP JSON body into a usable object
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// express-session for managing user sessions
const session = require("express-session");
app.use(bodyParser.urlencoded({ extended: true }));

// DB place holders for testing
const TEST_EVENT_DATA = require("./csc309teamproject/src/data/crimeData.json");
const TEST_USER_DATA = require("./csc309teamproject/src/data/userData.json");

// Helper functions
function isMongoError(error) { // checks for first error returned by promise rejection if Mongo database suddently disconnects
	return typeof error === 'object' && error !== null && error.name === "MongoNetworkError"
}


const API_VERSION = "v1";

/*** Session handling **************************************/
// Create a session cookie
app.use(session({
    secret: '3v3nt@p1S3crEt',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60000,
        httpOnly: true
    }
}));

app.post(`/api/${API_VERSION}/login`, (req, res) => {
  const data = TEST_USER_DATA;
  for(let i = 0; i < data.users.length; i++){
    if (req.body.user === data.users[i].email && req.body.password === data.users[i].password){
        req.session.user = data.users[i].id;
        req.session.email = data.users[i].email;
        res.json({
          result: true,
          user: data.users[i]
      });
      
      return;
    }
  }
  res.json({
    result: false
  });
});

app.get(`/api/${API_VERSION}/logout`, (req, res) => {
    req.session.destroy((error) => {
        log(error);
        if (error) {
            res.status(500).send('Internal Server Error');
        }
        else{
            res.redirect("/");
        }
    });
});


app.get(`/api/${API_VERSION}/events/:id`, (req, res) => {
  const eventId = req.params.id
  const data = TEST_EVENT_DATA
  for (let i = 0; i < data.crimeList.length; i++) {
    if (parseInt(data.crimeList[i].CRIME_ID) === parseInt(eventId)) {
        res.json({
          result: true,
          event: data.crimeList[i]
        });
        return;
    }
  }
  res.json({
    result: false,
    event: null
  });
});
app.get(`/api/${API_VERSION}/events`, (req, res) => {
  const eventId = req.params.id
  const data = TEST_EVENT_DATA
  let skip = 0;
  let take = 0;
  try {
      skip = parseInt(req.query.skip);
      take = parseInt(req.query.take);
  }
  catch {
      skip = 0;
      take = 0;
  }
  let events = [];
  let totalEntries = data.crimeList.length;
  if (skip >= 0 && take >= 0) {
    events = data.crimeList.slice(skip, skip + take);
  }
  else {
    events = data.crimeList;
  }
  res.json({
    events: events,
    totalEntries: totalEntries
  });
});

app.get(`/api/${API_VERSION}/users/:id`, (req, res) => {
  if (!req.session.user) {
    res.status(500).send('Internal Server Error');
    return;
  }
  const eventId = req.params.id
  const data = TEST_USER_DATA;
  for (let i = 0; i < data.users.length; i++) {
    if (parseInt(data.users[i].id) === parseInt(eventId)) {
        res.json({
          result: true,
          user: data.users[i]
        });
        return;
    }
  }
  res.json({
    result: false,
    event: null
  });
});

app.get(`/api/${API_VERSION}/users`, (req, res) => {
  if (!req.session.user) {
    res.status(500).send('Internal Server Error');
    return;
  }
  const eventId = req.params.id
  const data = TEST_USER_DATA;
  let users = [];
  let skip = 0;
  let take = 0;
  try {
      skip = parseInt(req.query.skip);
      take = parseInt(req.query.take);
  }
  catch {
      skip = 0;
      take = 0;
  }
  const totalEntries = data.users.length;
  if (skip >= 0 && take >= 0) {
    users = data.users.slice(skip, skip + take);
  }
  else {
    users = data.users;
  }
  res.json({users: users, totalEntries: totalEntries});
});

// Create user account
app.post(`/api/${API_VERSION}/users`, (req, res) => {
    const user = new User({
        email: req.body.email,
        displayName: req.body.displayName,
        password: req.body.password
    });
    user.save().then((result) => {
        res.send({
            success: true
        });
    })
    .catch((e) => {
        log(e);
        if (isMongoError(e)) {
            res.status(500).send('Internal Server Error');
        }
        else {
            res.status(400).send('Bad Request');
        }
        
    });
});

/*** Webpage routes below **********************************/
// Serve the build
app.use(express.static(__dirname + "/csc309teamproject/build"));

// All routes other than above will go to index.html
app.get("*", (req, res) => {
    // check for page routes that we expect in the frontend to provide correct status code.
    const goodPageRoutes = ["/", "/login", "/dashboard"];
    if (!goodPageRoutes.includes(req.url)) {
        // if url not in expected page routes, set status to 404.
        res.status(404);
    }

    // send index.html
    res.sendFile(__dirname + "/csc309teamproject/build/index.html");
});

/*************************************************/
// Express server listening...
const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`Listening on port ${port}...`);
});
