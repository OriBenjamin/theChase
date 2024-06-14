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
    question: "מה השם המלא של אורי?",
    answers: ["אורי יוסף", "אורי קורן", "אורי זקל"],
    correctAnswer: 2,
  },
  {
    question: "מי היו החברות הטובות ביותר של נועם בגן?",
    answers: ["גלי ומיה", "מאיה וגל", "מיה וגל"],
    correctAnswer: 2,
  },
  {
    question: "מה השם שאמא ואבא תכננו לתת לנועם לפני שנולדה:",
    answers: ["זוהר", "הילה", "ברקת"],
    correctAnswer: 0,
  },
  {
    question: "מה המשקה האהוב על נועם עד גיל 12?",
    answers: ["חלב", "קפה", "שוקו"],
    correctAnswer: 2,
  },
  {
    question: "האם לנועם היה מוצץ?",
    answers: ["כן", "לא", "היו לה שניים- אחד ביד ואחד בפה"],
    correctAnswer: 1,
  },
  {
    question: "ממה נועם פחדה סביב גיל 10?",
    answers: ["מפלצות", "גנבים", "עכברים"],
    correctAnswer: 1,
  },
  {
    question: "ממי נועם פחדה כשהיתה קטנה?",
    answers: ["שושה המכשושה", "מימי המכשפה", "המכשפה לילי"],
    correctAnswer: 0,
  },
  {
    question: "איזו הופעה נועם ראתה בזאפה תל אביב עם חברה?",
    answers: ["ג'סטין ביבר", "נתן גושן", "אליעד נחום"],
    correctAnswer: 2,
  },
  {
    question:
      "ביום הולדת 2 של נועם אצל אוצרה נועם בכתה ולא הסכימה לחגוג עד ש…. יגיע",
    answers: ["סבא", "אורי", "סבא טוביה"],
    correctAnswer: 1,
  },
];

let chaserAnswer = null;

let participantAnswer = null;

function sendQuestion() {
  io.emit(
    "sendQuestion",
    questions[answer].question,
    questions[answer].answers
  );
  const currentAnswer = answer;
  setTimeout(() => {
    if (answer === currentAnswer && (!chaserAnswer || !participantAnswer)) {
      io.emit("revealAnswer", questions[answer].correctAnswer);
      io.emit("chaserAnswer", chaserAnswer);
      answer++;
      chaserAnswer = null;
      participantAnswer = null;
    }
  }, 20000);
}

io.on("connection", (socket) => {
  answer = 0;
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
    socket.emit("tooManyPlayers");
    setTimeout(() => {
      socket.disconnect();
    }, 1000);
  }

  socket.on("selectAnswer", (index) => {
    if (role === "chaser") chaserAnswer = index;
    else if (role === "participant") participantAnswer = index;
    if (chaserAnswer !== null && participantAnswer !== null) {
      io.emit("revealAnswer", questions[answer].correctAnswer);
      io.emit("chaserAnswer", chaserAnswer);
      answer++;
      chaserAnswer = null;
      participantAnswer = null;
    }
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
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
