const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIO(server);

const port = 4000;

let chaserConnected = false;
let playerConnected = false;
let answer = 0;

const questions = [
  {
    question: "מה הצבע האהוב עליך?",
    answers: ["כחול", "אדום", "ירוק"],
    correctAnswer: 1,
  },
  {
    question: "מה המשחק האהוב עליך?",
    answers: ["כדורגל", "כדורסל", "טניס"],
    correctAnswer: 2,
  },
  {
    question: "מה הספורטאי האהוב עליך?",
    answers: ["מסי", "רונאלדו", "ניימאר"],
    correctAnswer: 3,
  },
];

let chaserAnswered = false;
let participantAnswered = false;

function sendQuestion() {
  console.log("Sending question");
  io.emit(
    "sendQuestion",
    questions[answer].question,
    questions[answer].answers
  );
  const currentAnswer = answer;
  setTimeout(() => {
    if (answer === currentAnswer && !chaserAnswered && !participantAnswered) {
      io.emit("revealAnswer", questions[answer].correctAnswer);
      answer++;
      chaserAnswered = false;
      participantAnswered = false;
    }
  }, 20000);
}

io.on("connection", (socket) => {
  console.log("A user connected");
  answer = 0;
  console.log(chaserConnected, playerConnected);
  let role = "";
  if (!chaserConnected) {
    chaserConnected = true;
    role = "chaser";
    // Send the player their role
    socket.emit("startGame", role);
  } else if (!playerConnected) {
    playerConnected = true;
    role = "participant";
    // Send the player their role
    socket.emit("startGame", role);
  } else {
    console.log("Too many players");
    socket.emit("tooManyPlayers");
    setTimeout(() => {
      socket.disconnect();
    }, 1000);
  }

  socket.on("selectAnswer", () => {
    if (role === "chaser") chaserAnswered = true;
    else if (role === "participant") participantAnswered = true;
  });

  socket.on("nextQuestion", () => {
    if (role === "chaser" && playerConnected && chaserConnected) {
      sendQuestion();
    }
  });

  // Disconnect event
  socket.on("disconnect", () => {
    if (role === "chaser") chaserConnected = false;
    else if (role === "participant") playerConnected = false;
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
