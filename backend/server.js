import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/project-auth";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;



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

const { Schema } = mongoose;
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 30
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
});

const User = mongoose.model("User", UserSchema);

// CREATE REGISTRATION
app.post("/register", async (req, res) => {
  const {username, password} = req.body;

  try {
const salt = bcrypt.genSaltSync();
const newUser = await new User({
  username: username,
  password: bcrypt.hashSync(password, salt)
}).save();
res.status(201).json({
  success: true,
  response: {
    username: newUser.username,
    id: newUser._id,
    accessToken: newUser.accessToken
  }
})
  } catch (e) {
    res.status(400).json({
      success: false,
      response: e,
      message: "Could not create user"
    })
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


/*
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
*/

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
