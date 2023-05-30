import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import validator from 'validator';

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/ ";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

/*/register - POST - pretty self-explanatory - Irro Färdigt- this is also create a user?
/login - POST - as above(typ färdig) - Irro Färdigt
/user/:userId - GET - get single user - doesn't matter if it's a mentee or a mentor Färdigt
/user/:userId - PATCH - update single user - their preferences or whatever you need
/user/:userId - DELETE - deletes single user
/users - GET - get a list of users - here if you are a mentor you get a list of mentees if you are a mentee you get a list of mentors, additionally if you want to expand on that you can show only the users with matching preferences
/match - PATCH - match a user - this can be done in 2 ways - either only one person decides, or both need to be interested and then it's a match */
// preferences - GET - get a list of all preferences 

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 30
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  preferences: {
    type: [String],
  },
  verificationToken: {
    type: String,
    unique: true,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
});


const User = mongoose.model("User", UserSchema);

// CREATE REGISTRATION - Irro- // e mail går även att använda i login
app.post("/register", async (req, res) => {
  const {username, password, email, lastName, firstName} = req.body;

  if (!validator.isEmail(email)) {
    res.status(400).json({message: "Please enter a valid email address"});
    return;
  }

  if (password.length < 6 || password.length > 20 ) {
    res.status(400).json({ success: false, message: "Password must be between 6 and 20 characters"});
    return;
  }

  try {
    const salt = bcrypt.genSaltSync();
    const newUser = await new User({
      username: username,
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: bcrypt.hashSync(password, salt)
    }).save();
    
    res.status(201).json({
      success: true,
      response: {
        username: newUser.username,
        id: newUser._id,
        accessToken: newUser.accessToken
      }
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      response: e,
      message: "Could not create user"
    });
  }
});


//LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({username: username})
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({
        success: true,
        response: {
          username: user.username,
          id: user._id,
          accessToken: user.accessToken,
          message: "Login successful"
        }
      });
    } else {
      res.status(400).json({
        success: false,
        response: "Credentials do not match"
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e
    });
  }
});

// /user/:userId - GET - get single user - doesn't matter if it's a mentee or a mentor
// below is an endpoint to get a single user
app.get("/user/:userId", async (req, res) => {
try {
  const user = await User.findOne({_id: req.params.userId})
  if (user) {
    res.status(200).json({
      success: true,
      response: {
        username: user.username,
        id: user._id,
        preferences: user.preferences,
        message: "User found"
      }
    });
  } else {
    res.status(400).json({
      success: false,
      response: "User not found"
    });
  }
} catch (e) {
  res.status(500).json({
    success: false,
    response: e
  });
}
});


// /user/:userId - PATCH - update single user - their preferences or whatever you need

app.patch("/user/:userId", async (req, res) => {
  const { firstName, lastName, password, email, username } = req.body;
  try {
const user = await User.findOneAndUpdate( {_id: req.params.userId}, {

  firstName: firstName,
  lastName: lastName,
  password: password,
  email: email,
  username: username
}, {new: true});
if (user) {
  res.status(200).json({
    success: true,
    response: {
      username: user.username,
      id: user._id,
      preferences: user.preferences,
      message: "User updated"
    }
  });
} else {
  res.status(400).json({
    success: false,
    response: "User not found"
  });
}
} catch (e) {
res.status(500).json({
  success: false,
  response: e
});
}
});


app.delete("/user/:userId", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.userId })
    if (user) {
      res.status(200).json({
        success: true,
        response: {
          username: user.username,
          id: user._id,
          preferences: user.preferences,
          message: "User deleted"
        }
      });
    } else {
      res.status(400).json({
        success: false,
        response: "User not found"
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e
    });
  }
});







// where do we put the preferences that we wanted to use for matching?
app.get('/preferences', async (req, res) => {
  try {
    const users = await User.find();
    const preferences = users.map(user => user.preferences).flat();
    const uniquePreferences = [...new Set(preferences)];

    res.status(200).json({
      success: true,
      response: {
        preferences: uniquePreferences,
      }
    });
  } catch(e) {
    res.status(500).json({
      success: false,
      response: e
    });
  }
});


const SecretSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 150
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  },
  username: {
    type: String,
    required: true
  }
});

const Secret = mongoose.model("Secrets", SecretSchema);

// Authenticate the user
const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({accessToken: accessToken});
    if (user) {
      next();
    } else {
      res.status(401).json({
        success: false,
        response: "Please log in",
        loggedOut: true
      })
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e
    });
  }
}

app.get("/secrets", authenticateUser);
app.get("/secrets", async (req, res) => {
  try {
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken })

    if (user) {
      const secrets = await Secret.find({ username: user._id }).sort({ createdAt: -1 }).limit(20)
      res.status(200).json({
        success: true,
        response: secrets,
      });
    } else {
      res.status(401).json({
        success: false,
        response: "Please log in",
        loggedOut: true,
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e,
      message: "Ground control... Abort Abort!",
    });
  }
});



app.get("/secrets", authenticateUser);
app.get("/secrets", async(req, res) => {
  try {
    const accessToken = req.header("Authorization");
    const secrets = await Secret.find({});
    res.status(200).json({
      success: true, 
      response: secrets
    })
  } catch (e) {
    res.status(500).json({
      success: false, 
      response: e, 
      message: "Ground control... Abort Abort!"
    });
  }
});

app.post("/secrets", authenticateUser);
app.post("/secrets", async (req, res) => {
  try {
    const { message } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({accessToken: accessToken});
    const secrets = await new Secret({
      message: message, 
      username: user._id
      // username: username
      // username: username._id
    }).save();
    res.status(201).json({
      success: true, 
      response: secrets
    })
  } catch (e) {
    res.status(500).json({
      success: false, 
      response: e, 
      message: "nope get out"
    });
  }
})




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
