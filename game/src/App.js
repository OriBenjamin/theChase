import logo from "./logo.svg";
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
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [tooManyPlayers, setTooManyPlayers] = useState(false);
  const [question, setQuestion] = useState(null);
  const [canChoose, setCanChoose] = useState(false);
  useEffect(() => {
    const socket = io("http://localhost:4000", { transports: ["websocket"] }); // Change the URL to your server URL
    setSocket(socket);

    socket.on("tooManyPlayers", () => {
      console.log("Too many players");
      setTooManyPlayers(true);
    });

    socket.on("startGame", (role) => {
      setPlayerRole(role);
    });

    socket.on("sendQuestion", (question, answers) => {
      console.log(question, answers);
      setQuestion(question);
      setAnswers(answers);
      setPlayerAnswer(null);
      setCorrectAnswer(null);
      setCanChoose(true);
    });

    socket.on("revealAnswer", (answer) => {
      setCorrectAnswer(answer);
      setCanChoose(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
      {!canChoose && (
        <button
          className="absolute right-0 h-10 w-24 bg-black/40 rounded-3xl text-white m-5"
          onClickCapture={() => {
            if (!canChoose) {
              socket.emit("nextQuestion", question, answers);
            }
          }}
        >
          Next
        </button>
      )}
      <div className="flex flex-row-reverse w-3/4 mt-1">
        {answers.map((answer, i) => (
          <Option
            key={i}
            number={["א", "ב", "ג"][i]}
            participant={playerRole === "participant" && playerAnswer === i}
            chaser={playerRole === "chaser" && playerAnswer === i}
            right={correctAnswer === i}
            onClick={() => {
              if (canChoose) {
                setPlayerAnswer(i);
              }
            }}
          >
            {answer}
          </Option>
        ))}
      </div>
    </div>
  );
}

export default App;
