import React, { useState,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';

const messagesTrue = ["Sublime !","Bravo !", "Trop fort !", "Tout juste !", "Génie !", "A l'aise !", "Magnifique !"];
const messagesFalse = ["Peut mieux faire !","Raté...", "Presque !", "Une prochaine fois...", "Dommage !", "Bien tenté !"];


// --- Les Questions ---
const questions = [
  { text: "Quelle est la signification de PIT ?", options: [{ t: "Passeport Informatique Telecom", img: "/astus.png", isCorrect: true }, { t: "Projet Informatique Telecom", img: "/astus.png", isCorrect: false }, { t: "Partage d’Informations pour Tous", img: "/astus.png", isCorrect: false }, { t: "Pas de IF en TC", img: "/astus.png", isCorrect: false }] },
  { text: "En quelle année a été créée l’Astus?", image: "/astus.png", options: [{ t: "1957", isCorrect: false }, { t: "1998", isCorrect: true }, { t: "2005", isCorrect: false }, { t: "2026", isCorrect: false }] },
  { text: "Quel est le bon logo du pull TC 2026?", options: [{ t: "1", img: "/Logo 1 Projet WEB 2026.png", isCorrect: true }, { t: "2", img: "/Logo 2 Projet WEB 2026.png", isCorrect: false }, { t: "3", img: "/Logo 3 Projet WEB 2026.png", isCorrect: false }, { t: "4",img: "/Logo 4 Projet WEB 2026.png", isCorrect: false }] },
  { text: "Quelle est la matière du 3TCS1 avec le plus de rattrapages?", options: [{ t: "PBS", isCorrect: false }, { t: "IP", isCorrect: true }, { t: "NRP", isCorrect: false }, { t: "Théâtre", isCorrect: false }] },
  { text: "Quel est le nom de la salle réseau au rez-de-chaussée?", options: [{ t: "TP Info A", isCorrect: false }, { t: "Plateforme Radiocom", isCorrect: false }, { t: "Salle ISO", isCorrect: true }, { t: "Salle Coin-coin", isCorrect: false }] },
  { text: "Combien y a-t-il de départements à l’INSA ? (en comptant le FIMI)", options: [{ t: "8", isCorrect: false }, { t: "9", isCorrect: false }, { t: "10", isCorrect: true }, { t: "67", isCorrect: false }] },
  { type: "image-order", text: "Trie ces événements Astus du plus ancien au plus récent", items: [{ id: "event2", label: "Soirée Casino", image: "/2.png" }, { id: "event4", label: "Nouveau bureau 2026", image: "/4.png" }, { id: "event1", label: "Création de l’Astus", image: "/1.png" }, { id: "event3", label: "Retrouvailles", image: "/3.png" }], correctOrder: ["event1", "event2", "event3", "event4"] },
  { type: "spam-click", text: "Clique assez vite pour rendre ton projet avant la deadline. Objectif : 55 clics.", duration: 10, targetClicks: 55 },
  { text: "Quelle était la couleur du bouton « Commencer » du quiz ?", options: [{ t: "Vert", img: "/vert.png", isCorrect: false }, { t: "Jaune", img:"/jaune.png", isCorrect: false }, { t: "Bleu", img:"/bleu.png", isCorrect: false }, { t: "Violet", img:"violet.png", isCorrect: true }] },
  { type: "image-click", text: "Où se trouve le RI sur cette carte de l’INSA ?", image: "/carte-insa.png", correctZone: { xMin: 16.6, xMax: 19.5, yMin: 67.8, yMax: 72.5 } },
];

const questions2 = [
  { text: "Quel est le nouveau président de l’Astus 2026?", options: [{ t: "Enzo", isCorrect: false }, { t: "Paul", isCorrect: false }, { t: "Laura", isCorrect: true }, { t: "Macron", isCorrect: false }] },
  { text: "insa question 2", options: [{ t: "faux 1", isCorrect: false }, { t: "réponse bonne", isCorrect: true }] },
];

const questions3 = [
  { text: "test1 question 1", options: [{ t: "faux 1", isCorrect: false }, { t: "réponse bonne", isCorrect: true }, { t: "faux 2", isCorrect: false }, { t: "faux 3", isCorrect: false }] },
  { text: "test1 question 2", options: [{ t: "faux 1", isCorrect: false }, { t: "réponse bonne", isCorrect: true }] },
];

const questionCategory = [
  { name: "TC Quizz 1", index: 0 },
  { name: "TC Quizz 2", index: 1 },
  { name: "TC Quizz 3", index: 2 }
];

// --- Boutons de choix des questions ---
function TabButtons({ setUsedQuestions }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    getQuestions();
  }, []);

  const getQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/questions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      setAllQuestions(data);
      
      console.log("fetchQuestions backend response:", data);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    const categoryQuestions = [];

    for (const q of allQuestions) {
      if (Number(q.category) === activeTab) {
        categoryQuestions.push(q);
      }
    }

    setUsedQuestions(categoryQuestions);

  }, [activeTab, allQuestions]);

  const handleClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div className="tabs-container">
      {questionCategory.map((item, index) => (
        <button 
          onClick={() => handleClick(index)} 
          className={`tab-pill ${activeTab === index ? "active" : ""}`} 
          key={item.name}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

// --- Classement de la page d'accueil ---
function Leaderboard() {
  const [pastScores, setPastScores] = useState([]);

  useEffect(() => {
    getScore();
  }, []);

  const getScore = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/scores", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      const sortedData = data.sort((a, b) => b.score - a.score);
      setPastScores(sortedData);
      console.log("getScore backend response:", data)
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Classement 🏆</h2>
      <ul className="leaderboard-list">
        {pastScores.map((scoreEntry, index) => (
          <li 
            key={index} 
            /* On ajoute la classe rank-1, rank-2, rank-3 si c'est le top 3 */
            className={`leaderboard-item ${index < 3 ? `rank-${index + 1}` : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="rank-badge">#{index+1}</span>
            <span style={{ flexGrow: 1, textAlign: 'left', marginLeft: '15px' }}>{scoreEntry.username}</span>
            <span className="player-score">{scoreEntry.score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// --- Page d'Accueil ---
function Accueil({ setUsername, setUsedQuestions }) {
  return (
    <div className="accueil-background">
      
      <div className="home-layout">
        <div className="glass-card" style={{ flex: '1.5', maxWidth: '600px' }}>
          <img src="/favicon.png" alt="Logo TC Quiz" style={{ width: '150px', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }} />
          <h1 style={{ color: '#333', margin: '0' }}>Le TC Quiz</h1>
          
          <TabButtons setUsedQuestions={setUsedQuestions} />
          

          <input
            style={{...styles.textInput, textAlign: 'center', width: '80%', border: '2px solid #eee'}}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Entre ton pseudo..."
          />
          
          <Link to="/jeu" style={{ width: '100%', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            <button style={{...styles.button, width: '80%', padding: '15px', borderRadius: '50px', fontSize: '1.4rem', boxShadow: '0 4px 15px rgba(245, 190, 39, 0.5)'}}>
              COMMENCER LA PARTIE
            </button>
          </Link>
        </div>

        <div className="glass-card-secondary">
          <Leaderboard />
        </div>

      </div>
    </div>
  );
}

// --- Carte draggable pour les questions de tri ---
function SortableImageCard({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, border: '2px solid #F5BE27', borderRadius: '8px', padding: '12px', marginBottom: '12px', backgroundColor: '#f8f9fa', cursor: 'grab', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img src={item.image} alt={item.label} style={{ width: '100%', maxWidth: '250px', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
      <div style={{ fontWeight: 'bold' }}>{item.label}</div>
    </div>
  );
}

// --- Question de tri d'images ---
function ImageOrderQuestion({ question, handleAnswer }) {
  const [items, setItems] = useState(question.items);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    setItems((prevItems) => arrayMove(prevItems, oldIndex, newIndex));
  };

  const validateOrder = () => {
    const userOrder = items.map((item) => item.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(question.correctOrder);
    handleAnswer(isCorrect);
  };

  return (
    <div>
      <p style={{ fontSize: '1.2rem' }}>{question.text}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => <SortableImageCard key={item.id} item={item} />)}
        </SortableContext>
      </DndContext>
      <button onClick={validateOrder} style={{ ...styles.button, marginTop: '20px' }}>Valider l’ordre</button>
    </div>
  );
}

// --- Question spam click ---
function SpamClickQuestion({ question, handleAnswer }) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(question.duration);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const startGame = () => {
    if (started || finished) return;
    setStarted(true);
    let currentTime = question.duration;

    const interval = setInterval(() => {
      currentTime -= 1;
      setTimeLeft(currentTime);

      if (currentTime <= 0) {
        clearInterval(interval);
        setFinished(true);
        setClicks((finalClicks) => {
          const isCorrect = finalClicks >= question.targetClicks;
          setTimeout(() => handleAnswer(isCorrect), 800);
          return finalClicks;
        });
      }
    }, 1000);
  };

  const handleClick = () => { if (!started || finished) return; setClicks((prev) => prev + 1); };

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '1.2rem' }}>{question.text}</p>
      <p><strong>Temps restant :</strong> {timeLeft}s</p>
      <p><strong>Clics :</strong> {clicks}</p>
      <p><strong>Objectif :</strong> {question.targetClicks} clics</p>

      {!started && !finished && <button onClick={startGame} style={{ ...styles.button, margin: '20px' }}>Commencer</button>}

      <div>
        <button onClick={handleClick} disabled={!started || finished} style={{ padding: '30px 50px', fontSize: '1.5rem', cursor: started && !finished ? 'pointer' : 'not-allowed', backgroundColor: started && !finished ? '#F5BE27' : '#ccc', color: 'white', border: 'none', borderRadius: '12px' }}>
          CLIQUE ICI
        </button>
      </div>

      {finished && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{clicks >= question.targetClicks ? "Projet rendu à temps, pas de rattrapage." : "Deadline ratée... les rattrapages approchent."}</p>}
    </div>
  );
}

// --- Question clic sur image ---
function ImageClickQuestion({ question, handleAnswer }) {
  const [clickedPoint, setClickedPoint] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setClickedPoint({ x, y });

    const { xMin, xMax, yMin, yMax } = question.correctZone;
    const isCorrect = x >= xMin && x <= xMax && y >= yMin && y <= yMax;

    setMessage(isCorrect ? "Bien joué !" : "Mauvais endroit...");

    setTimeout(() => handleAnswer(isCorrect), 800);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '1.2rem' }}>{question.text}</p>

      <div style={{ position: 'relative', width: '90%', maxWidth: '700px', margin: '0 auto' }}>
        <img src={question.image} alt="Carte de l'INSA" onClick={handleImageClick} style={{ display: 'block', width: '100%', borderRadius: '10px', cursor: 'crosshair', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }} />

        {clickedPoint && (
          <div style={{ position: 'absolute', left: `${clickedPoint.x}%`, top: `${clickedPoint.y}%`, transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'red', border: '2px solid white', pointerEvents: 'none' }} />
        )}
      </div>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

// --- Page de Jeu (Le Quiz) ---
function Jeu({ username, questions }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [countdown, setCountdown] = useState(3);

  const sendScore = async (username, score, nbrQuestions) => {
    try {
      const response = await fetch("http://localhost:5001/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, score, nbrQuestions})
      });

      const data = await response.json();
      console.log({ username, score, nbrQuestions });
      console.log("sendScore backend response:", data);
      

    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    if (showScore) {
      sendScore(username, score, questions.length);
    }
  }, [showScore, username, score, questions.length]);

  useEffect(() =>{
    let timer;
    if (countdown >0) {
      timer = setTimeout(() => {
        setCountdown(countdown-1);
      }, 500);
    }

    else if (countdown === 0){
      timer = setTimeout(()=>{
        setCountdown("Partez !");
      },500);
    }

    else if (countdown === "Partez !"){
      timer = setTimeout(()=>{
        setCountdown(null);
      },1000);
    }

    return () => {
      clearTimeout(timer)
    };
  }, [countdown]);

  const printScore = (isCorrect) => { //affiche réponse juste à l'utilisateur
    if (isCorrect) {
    setScore(score + 1);
    setFeedback(true); 
    const randomMsg = messagesTrue[Math.floor(Math.random() * messagesTrue.length)];
    setFeedbackMsg(randomMsg);
  } else {
    setFeedback(false);
    const randomMsg = messagesFalse[Math.floor(Math.random() * messagesFalse.length)];
    setFeedbackMsg(randomMsg); 
  }
  
  const nextQuestion = () => {
    setFeedback(null);
  }

}
  const handleAnswer = (isCorrect) => {
    // 1. On gère le score et le message
    if (isCorrect) {
      setScore(score + 1);
      setFeedback(true);
      setFeedbackMsg(messagesTrue[Math.floor(Math.random() * messagesTrue.length)]);
    } else {
      setFeedback(false);
      setFeedbackMsg(messagesFalse[Math.floor(Math.random() * messagesFalse.length)]);
    }

    setTimeout(() => {
      setFeedback(null);
    }, 2000);

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) setCurrentQuestion(nextQuestion);
    else setShowScore(true);
  };


  const currentQ = questions[currentQuestion];

  // rajouter <JeuHeader username={username} />
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', position: 'relative' }}> 

      {countdown !== null ? ( 
        <div className={`telecom-countdown-container ${countdown === "Partez !" ? "fade-out-end" : ""}`}>
          <div className="telecom-screen">
            <h1 className="telecom-text">
              {countdown}
            </h1>
          </div>
        </div>
      ) : (
        <> {/* Début du bloc "Jeu normal" */}

          {feedback !== null && (
            <div 
              key={feedbackMsg}
              className={feedback ? 'animate-shake' : 'animate-shake'} 
              style={{ 
                position: 'absolute', 
                top: '-60px', 
                left: '50%',
                padding: '10px 25px', 
                borderRadius: '20px', 
                backgroundColor: feedback ? '#d4edda' : '#f8d7da', 
                color: feedback ? '#1a9536' : '#721c24',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                zIndex: 1000 
              }}
            >
              {feedbackMsg} {feedback ? "(+1 pt)" : ""}
            </div>
          )}

          {showScore ? (
            <div>
              <h2>Terminé !</h2>
              <p style={{ fontSize: '1.5rem' }}>Ton score est de {score} sur {questions.length}</p>
              <Link to="/"><button style={styles.button}>Revenir à l'accueil</button></Link>
            </div>
          ) : (
            <div>
              <h3>Question {currentQuestion + 1} / {questions.length}</h3>

              {currentQ.type === "image-order" ? (
                <ImageOrderQuestion question={currentQ} handleAnswer={handleAnswer} />
              ) : currentQ.type === "spam-click" ? (
                <SpamClickQuestion question={currentQ} handleAnswer={handleAnswer} />
              ) : currentQ.type === "image-click" ? (
                <ImageClickQuestion question={currentQ} handleAnswer={handleAnswer} />
              ) : (
                <>
                  <p style={{ fontSize: '1.2rem' }}>{currentQ.text}</p>

                  {currentQ.image && <img src={currentQ.image} alt="Illustration question" style={{ width: '300px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }} />}

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {currentQ.options.map((option, index) => (
                      <button key={index} onClick={() => handleAnswer(option.isCorrect)} style={styles.optionButton}>
                        {option.img && <img src={option.img} alt={option.t} style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '10px' }} />}
                        <div style={{ fontWeight: 'bold' }}>{option.t}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </> 
      )} 

    </div>
  );
}

// --- Styles simples ---
const styles = {
  // ... ton style 'button'
  button: {
    padding: '10px 20px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    backgroundColor: '#EE82EE',
    color: 'white',
    border: 'none',
    borderRadius: '5px' },

  optionButton: { 
    padding: '15px', 
    fontSize: '1rem', 
    cursor: 'pointer', 
    backgroundColor: '#f8f9fa', 
    border: '2px solid #F5BE27', 
    borderRadius: '8px',
    display: 'flex',           // Ajouté pour aligner image + texte
    flexDirection: 'column',   // Empile l'image sur le texte
    alignItems: 'center',      // Centre horizontalement
    justifyContent: 'center',  // Centre verticalement
    width: '180px',            // Largeur fixe pour que tous les boutons soient égaux
    transition: 'transform 0.2s', // Petit effet au survol (optionnel)
  },

  textInput: {
    padding: '10px 20px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    border: 'none',
    borderRadius: '5px' },
};

// --- App Principal ---
export default function App() {
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [username, setUsername] = useState("");

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Accueil setUsername={setUsername} setUsedQuestions={setUsedQuestions} />} />  {/* Sert à changer les questions utilisées avec le hook */}
          <Route path="/jeu" element={<Jeu username={username} questions={usedQuestions} />} />  {/* Changer les questions utilisées */}
        </Routes>
      </Router>
      
  );
}