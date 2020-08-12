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
	const email = req.body.email
	const password = req.body.password
	User.findByEmailPassword(email, password).then((user)=>{
		if(!user){
			res.json({
		  	result: false
		  });
		}
		else{
			req.session.user = user.user;
			req.session.email = user.email;
			res.json({
				result: true,
				user: user
			});
		}
	}).catch((error) => {
		if (isMongoError(error)) {
			res.status(500).send(error);
		} else {
			log(error)
			res.status(400).send(error);
		}
	})
});
app.post(`/api/${API_VERSION}/changeVote`, (req, res) => {
  const dataFromChild = req.body.dataFromChild
  const currentUserId = req.body.currentUser._id
  console.log("this is", currentUserId)
  const votedCrime = {
    "eventId": req.body.crime._id
  }
  Event.findById(req.body.crime._id).then((event) => {
    if(dataFromChild > 0) {
      event.vote = event.vote + 1
      User.findById(currentUserId).then((user)=> {
        user.upvote.push(votedCrime)
        console.log("found user", user.upvote)
        user.save()
      }).catch((error) => {
        if (isMongoError(error)) {
          res.status(500).send(error);
        } else {
          log("found error", error)
          res.status(400).send(error);
        }
      })
    }
    else if (dataFromChild < 0) {
        if (req.body.flag) {
          event.vote = event.vote - 1
          User.findById(currentUserId).then((user)=> {
            user.upvote.pull(votedCrime)
            console.log("found user", user.downvote)
            user.save()
          }).catch((error) => {
            if (isMongoError(error)) {
              res.status(500).send(error);
            } else {
              log("found error", error)
              res.status(400).send(error);
            }
          })
        }
        else{
          event.vote = event.vote + 1
          User.findById(currentUserId).then((user)=> {
            user.downvote.pull(votedCrime)
            console.log("found user", user.upvote)
            user.save()
          }).catch((error) => {
            if (isMongoError(error)) {
              res.status(500).send(error);
            } else {
              log("found error", error)
              res.status(400).send(error);
            }
          })
        }
    }
    else {
      event.vote = event.vote - 1
      User.findById(currentUserId).then((user)=> {
        user.downvote.push(votedCrime)
        console.log("found user", user.downvote)
        user.save()
      }).catch((error) => {
        if (isMongoError(error)) {
          res.status(500).send(error);
        } else {
          log("found error", error)
          res.status(400).send(error);
        }
      })
    }
    event.save().then((result) =>{
      res.json({
				result: result,
				status: true,
		    event: event
			})
    })
    .catch((error) => {
				log(error) // log server error to the console, not to the client.
				res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
    })
  }).catch((err) => {
		log(err) // log server error to the console, not to the client.
		res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
  })
});
app.post(`/api/${API_VERSION}/createUser`, (req, res) => {
	const newUser = new User({
    email: req.body.email,
    displayName: req.body.displayName,
    password:req.body.password,
    admin:false,
    events:[],
    upvote:[],
    downvote:[],
  })
	newUser.save().then((result)=>{
		res.json({
			result: result,
			status: true,
	    user: newUser
		})
	}).catch((error) => {
			log(error) // log server error to the console, not to the client.
			res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
	})
	// User.estimatedDocumentCount().then((userCount) => {
	// 	const newUser = new User({
	// 		id: userCount,
	//     email: req.body.email,
	//     displayName: req.body.displayName,
	//     password:req.body.password,
	//     admin:false,
	//     events:[],
	//     upvote:[],
	//     downvote:[],
	//   })
	// 	newUser.save().then((result)=>{
	// 		res.json({
	// 			result: result,
	// 			status: true,
	// 	    user: newUser
	// 		})
	// 	}).catch((error) => {
	// 			log(error) // log server error to the console, not to the client.
	// 			res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
	// 	})
  // }).catch(err => {
	// 	log(error) // log server error to the console, not to the client.
	// 	res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
  // })
});

app.post(`/api/${API_VERSION}/createEvent`, (req, res) => {
	const newEvent = new Event({
		title: req.body.title,
		address: req.body.address,
		author: req.body.author,
		date: req.body.date,
		type: req.body.type,
		vote: req.body.vote,
		severity: req.body.severity,
		description: req.body.description,
    coordinates: [req.body.coordinateY,req.body.coordinateX]
  })
	newEvent.save().then((result)=>{
		res.json({
			result: result,
			status: true,
	    event: newEvent
		})
	}).catch((error) => {
			log(error) // log server error to the console, not to the client.
			res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
	})
	// Event.estimatedDocumentCount().then((eventCount) => {
	// 	const newEvent = new Event({
	// 		eventId: eventCount,
	// 		title: req.body.title,
	// 		address: req.body.address,
	// 		author: req.body.author,
	// 		date: req.body.date,
	// 		type: req.body.type,
	// 		vote: req.body.vote,
	// 		severity: req.body.severity,
	// 		description: req.body.description,
  //     coordinates: [req.body.coordinateY,req.body.coordinateX]
	//   })
	// 	newEvent.save().then((result)=>{
	// 		res.json({
	// 			result: result,
	// 			status: true,
	// 	    event: newEvent
	// 		})
	// 	}).catch((error) => {
	// 			log(error) // log server error to the console, not to the client.
	// 			res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
	// 	})
  // }).catch(err => {
	// 	log(error) // log server error to the console, not to the client.
	// 	res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
  // })
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
	if (!ObjectID.isValid(eventId)) {
		res.status(404).send()
		return;  // so that we don't run the rest of the handler.
	}
	Event.findOne({_id: eventId}).then((e) => {
		res.json({
			result: true,
			event: e
		})
	})
	.catch((error) => {
		if (isMongoError(error)) {
			res.status(500).send('Internal Server Error');
		} else {
			log(error)
			res.status(400).send(error);
		}
	})
});
app.get(`/api/${API_VERSION}/events`, (req, res) => {
	let skip = 0;
  let take = 0;
  try {
      skip = parseInt(req.body.skip);
      take = parseInt(req.body.take);
  }
  catch {
      skip = 0;
      take = 0;
  }
	Event.find().then((events)=>{
		let eventSlice = [];
		if (skip >= 0 && take >= 0) {
	    eventSlice = events.slice(skip, skip + take);
	  }
		else {
	    eventSlice = events;
	  }
		res.json({
	    events: eventSlice,
	    totalEntries: eventSlice.length
	  });
	})
});

app.get(`/api/${API_VERSION}/users/:id`, (req, res) => {
  if (!req.session.user) {
    res.status(500).send('Internal Server Error');
    return;
  }
	const userId = req.params.id
	if (!ObjectID.isValid(userId)) {
		res.status(404).send()
		return;  // so that we don't run the rest of the handler.
	}
	User.findOne({_id: userId}).then((u) => {
		res.json({
			result: true,
			event: u
		})
	})
	.catch((error) => {
		if (isMongoError(error)) {
			res.status(500).send('Internal Server Error');
		} else {
			log(error)
			res.status(400).send(error);
		}
	})
});

app.get(`/api/${API_VERSION}/users`, (req, res) => {
  if (!req.session.user) {
    res.status(500).send('Internal Server Error');
    return;
  }
	let skip = 0;
	let take = 0;
	try {
			skip = parseInt(req.body.skip);
			take = parseInt(req.body.take);
	}
	catch {
			skip = 0;
			take = 0;
	}
	User.find().then((users)=>{
		let usersSlice = [];
		if (skip >= 0 && take >= 0) {
			usersSlice = users.slice(skip, skip + take);
		}
		else {
			usersSlice = events;
		}
		res.json({
			events: usersSlice,
			totalEntries: usersSlice.length
		});
	})
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
