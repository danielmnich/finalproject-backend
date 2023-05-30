import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import validator from 'validator';
const multer = require('multer');
const path = require('path');

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

// user och preferences
const PreferenceSchema = new mongoose.Schema({
  preference: {
    type: String,
    required: true,
    enum: ["mentor", "mentee", "fullstack", "frontend", "backend", "react", "javascript", "python", "java", "c++", "c#", "ruby", "php", "sql", "html", "css", "node", "angular", "vue", "swift", "kotlin", "flutter", "react native", "android", "ios", "unity"]
  }
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
    type: [PreferenceSchema],
  },
  verificationToken: {
    type: String,
    unique: true,
  },
  bio: {
    type: String,
    default: ''
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
  const { firstName, lastName, password, email, username, preference } = req.body;
  try {
const user = await User.findOneAndUpdate( {_id: req.params.userId}, {

  firstName: firstName,
  lastName: lastName,
  password: password,
  email: email,
  username: username,
  preference: preference
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

//  preferences - GET - get all preferences
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
 const fileExtension = path.extname(file.originalname)
  cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension) 
  }
})
const upload = multer({ storage: storage })

// Endpoint for uploading a profile picture
app.post('/user/:userId/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  const userId = req.params.userId;
  const profilePicture = req.file;

  // Update the user's profile picture in the database
  try {
    await User.findOneAndUpdate(
      { _id: userId },
      { profilePicture: profilePicture.filename }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      file: profilePicture
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});

// Endpoint for deleting a profile picture
app.delete('/user/:userId/delete-profile-picture', async (req, res) => {
  const userId = req.params.userId;

  // Update the user's profile picture in the database
  try {
    await User.findOneAndUpdate(
      { _id: userId },
      { profilePicture: null }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile picture',
      error: error.message
    });
  }
});

// Endpoint for changing a profile picture
app.patch('/user/:userId/change-profile-picture', upload.single('profilePicture'), async (req, res) => {
  const userId = req.params.userId;
  const profilePicture = req.file;

  // Update the user's profile picture in the database
  try {
    await User.findOneAndUpdate(
      { _id: userId },
      { profilePicture: profilePicture.filename }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture changed successfully',
      file: profilePicture
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change profile picture',
      error: error.message
    });
  }
});


const BioSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 200
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

const Secret = mongoose.model("Bio", BioSchema);

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

app.get("/bio", authenticateUser);
app.get("/bio", async (req, res) => {
  try {
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken })

    if (user) {
      const bio = await Bio.find({ username: user._id }).sort({ createdAt: -1 }).limit(20)
      res.status(200).json({
        success: true,
        response: bio,
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



app.get("/bio", authenticateUser);
app.get("/bio", async(req, res) => {
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

app.post("/bio", authenticateUser);
app.post("/bio", async (req, res) => {
  try {
    const { message } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({accessToken: accessToken});
    const secrets = await new Secret({
      message: message, 
      username: user._id
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

app.put("/bio", authenticateUser);
app.put("/bio", async (req, res) => {
  try {
    const { message } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({accessToken: accessToken});
    
    // Find and update the bio, returning the updated bio
    const updatedBio = await Bio.findOneAndUpdate(
      { username: user._id }, // Find bio by user's _id
      { message: message }, // Update the message
      { new: true } // Option to return the updated document
    );
    
    if (!updatedBio) {
      return res.status(404).json({
        success: false, 
        response: "Bio not found", 
      });
    }
    
    res.status(200).json({
      success: true, 
      response: updatedBio
    });
    
  } catch (e) {
    res.status(500).json({
      success: false, 
      response: e, 
      message: "An error occurred"
    });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
