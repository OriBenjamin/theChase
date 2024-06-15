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
    question: "איזו זמרת אהובה על הלל?",
    answers: ["שרית חדד", "הודיה", "בילי אייליש"],
    correctAnswer: 2,
  },
  {
    question: "באיזה מקום הלל חולמת לבלות בקיץ?",
    answers: ["בקניון בית שמש", "בים", "בתאטרון"],
    correctAnswer: 1,
  },
  {
    question: "לאן הלל חולמת לטוס?",
    answers: ["לונדון", "תאילנד", "יוון"],
    correctAnswer: 1,
  },
  {
    question: "איזו סדרה הלל ראתה מעל לשלוש פעמים?",
    answers: ["החממה", "שנות ה80", "בת השוטר"],
    correctAnswer: 0,
  },
  {
    question: "מה מידת הנעליים של הלל?",
    answers: ["38", "36", "הלל הולכת יחפה 😉"],
    correctAnswer: 0,
  },
  {
    question: "מה הצבע האהוב על הלל?",
    answers: ["צהוב", "לבן", "כחול"],
    correctAnswer: 2,
  },
  {
    question: "מה המקצוע שהלל רצתה לעסוק בו?",
    answers: ["מורה", "מנקה", "וטרינרית"],
    correctAnswer: 2,
  },
  {
    question: "מה ה שיר שאמא הקדישה להלל כשנולדה?",
    answers: ["היא לא דומה", "היא כל כך יפה", "ילדותי השניה"],
    correctAnswer: 1,
  },
  {
    question: "מה השמות עליהם חשבנו לפני שבחרנו בשם הלל?",
    answers: ["לילך, הילה", "ליאת , לילי", "לילי, הילה"],
    correctAnswer: 2,
  },
  {
    question: "כשהלל היתה קטנה היא אהבה:",
    answers: ["מוצץ וחיתול", "אצבע בפה", "בובה בשם שושה"],
    correctAnswer: 0,
  },
  {
    question: "עד איזה גיל הלל היתה באה בלילה למיטה של אמא ואבא?",
    answers: ["גיל 3.5", "מעולם לא! היא ישנה כל הלילה במיטה שלה", "גיל 2"],
    correctAnswer: 0,
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
