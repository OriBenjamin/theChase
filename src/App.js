import "./App.css";
import { twMerge } from "tailwind-merge";
import io from "socket.io-client";

import { useState, useEffect } from "react";
function Option(props) {
  return (
    <button
      onClick={props.onClick}
      className={twMerge(
        "bg-gradient-to-b from-black via-black/80 to-black/60 flex-1 h-20 flex justify-center items-center text-white rounded-xl relative",
        props.participant && "border-b-4 border-b-blue-300",
        props.chaser && "border-t-8 border-t-red-800",
        props.right &&
          "bg-gradient-to-r from-green-950 via-green-700 via-50% to-green-950"
      )}
    >
      <div className="bg-black w-3 h-5 p-2 border absolute -top-3 flex justify-center items-center">
        {props.number}
      </div>
      {props.children}
    </button>
  );
}
function App() {
  const [socket, setSocket] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);

  const [answers, setAnswers] = useState([]);
  const [playerAnswer, setPlayerAnswer] = useState(null);
  const [chaserAnswer, setChaserAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [tooManyPlayers, setTooManyPlayers] = useState(false);
  const [question, setQuestion] = useState(null);
  const [canChoose, setCanChoose] = useState(false);

  // timer
  const [timer, setTimer] = useState(20);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const socket = io("https://thechaseserver.onrender.com/", {
      transports: ["websocket"],
    });
    // const socket = io("http://localhost:4000/", {
    //   transports: ["websocket"],
    // });
    setSocket(socket);

    socket.on("tooManyPlayers", () => {
      console.log("Too many players");
      setTooManyPlayers(true);
    });

    socket.on("startGame", (role) => {
      setPlayerRole(role);
    });

    socket.on("chaserAnswer", (chaserAnswer) => {
      console.log("chaserAnswer", chaserAnswer);
      setChaserAnswer(chaserAnswer);
    });

    socket.on("sendQuestion", (question, answers) => {
      setStarted(true);
      setQuestion(question);
      setAnswers(answers);
      setPlayerAnswer(null);
      setCorrectAnswer(null);
      setCanChoose(true);
      setChaserAnswer(null);
    });

    socket.on("revealAnswer", (answer) => {
      setCorrectAnswer(answer);
      setCanChoose(false);
      setTimer(0);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (canChoose) {
      interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
    } else {
      setTimer(20); // Reset the timer when canChoose becomes false
    }

    return () => clearInterval(interval);
  }, [canChoose]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-red-600">
      {tooManyPlayers && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 flex justify-center items-center text-white text-2xl z-10">
          Too many players
        </div>
      )}
      <div className="absolute top-0 right-0 p-2 bg-blue-700/40 rounded-xl m-2 text-white font-light">
        {playerRole}
      </div>
      <div className="relative w-3/4 h-20 flex justify-center items-center bg-gradient-to-b from-black via-black/80 to-black/40 text-white rounded-xl opacity-90 border-t border-blue-600">
        {question}
        <div className="absolute -top-0.5 w-1/4 flex">
          <div className="w-1/2 bg-gradient-to-l from-blue-300 h-0.5"></div>
          <div className="w-1/2 bg-gradient-to-r from-blue-300 h-0.5"></div>
        </div>
      </div>
      <div className="flex flex-row-reverse w-3/4 mt-1">
        {answers.map((answer, i) => (
          <Option
            key={i}
            number={["א", "ב", "ג"][i]}
            participant={playerRole === "participant" && playerAnswer === i}
            chaser={
              (playerRole === "chaser" && playerAnswer === i) ||
              chaserAnswer === i
            }
            right={correctAnswer === i}
            onClick={() => {
              if (canChoose) {
                setPlayerAnswer(i);
                socket.emit("selectAnswer", i);
              }
            }}
          >
            {answer}
          </Option>
        ))}
      </div>
      <div
        className={twMerge(
          "absolute top-0 bg-black p-2 rounded-xl text-white mt-2",
          !started && "hidden"
        )}
      >
        {canChoose ? `Time Left: ${timer} seconds` : "Time's up!"}
      </div>
      {!canChoose && (
        <button
          className="h-10 w-24 bg-black/40 rounded-3xl text-white m-5"
          onClickCapture={() => {
            if (!canChoose) {
              socket.emit("nextQuestion", question, answers);
              setChaserAnswer(null);
            }
          }}
        >
          Next
        </button>
      )}
    </div>
  );
}

export default App;
