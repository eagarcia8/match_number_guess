const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// Setting up Mongoose.
const dbUrl = "mongodb+srv://db-example:SW3U4TUjvTWuCHPH@cluster0.u2ghq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(dbUrl, mongooseOptions, function (error) {
    checkError(error, "Successfully connected to MongoDB!");
});

let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Error: "));

mongoose.Promise = global.Promise;

const guessStructure = {
    userGuess: String,
    serverGuess: String,
    userName: String,
    timestamp: Date
};

let guessSchema = new mongoose.Schema(guessStructure);
let guessModel = new mongoose.model("match_number_guesses", guessSchema);

// Setting up Express.
const app = express();
const http = require("http").Server(app);
const port = 3000;
http.listen(port);
console.log(`Express server is running on port ${port}.`);

// Setting up Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Express Routes
app.use("/", express.static("public_html/"));

app.post("/submitGuess", function (request, response) {

    let serverGuess = _.random(1, 100);
    let userGuess = request.body.userGuess;

    console.log(serverGuess, userGuess);

    request.body.timestamp = new Date();
    request.body.serverGuess = serverGuess;

    let newGuessEntry = new guessModel(request.body);

    newGuessEntry.save(function (error) {
        checkError(error, "Successfully saved entry.");
    });

    let responseObject;

    if (serverGuess === userGuess) {
        responseObject = {
            serverMessage: "Congratz, you have won the internet!",
            error: false
        };
    } else {
        responseObject = {
            serverMessage: `Sorry, the server picked ${serverGuess}, but you picked ${userGuess}.`,
            error: false
        };
    }

    response.send(responseObject);

});


function checkError(error, successMessage) {
    if (error) {
        console.log("An error happened: " + error);
    } else {
        console.log(successMessage);
    }
}