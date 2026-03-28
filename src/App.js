import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';

const messagesTrue = ["Sublime !","Bravo !", "Trop fort !", "Tout juste !", "Génie !", "A l'aise !", "Magnifique !"];
const messagesFalse = ["Peut mieux faire !","Raté...", "Presque !", "Une prochaine fois...", "Dommage !", "Bien tenté !"];



const questionCategory = [
  { name: "TC Quizz 1", index: 0 },
  { name: "TC Quizz 2", index: 1 },
  { name: "TC Quizz 3", index: 2 }
];

// --- Boutons de choix des questions ---
function TabButtons({ category, setCategory, setUsedQuestions }) {
  const [allQuestions, setAllQuestions] = useState([]);

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
      if (Number(q.category) === category) {
        categoryQuestions.push(q);
      }
    }

    setUsedQuestions(categoryQuestions);

  }, [category, allQuestions]);

  const handleClick = (index) => {
    setCategory(index);
  };

  return (
    <div className="tabs-container">
      {questionCategory.map((item, index) => (
        <button 
          onClick={() => handleClick(index)} 
          className={`tab-pill ${category === index ? "active" : ""}`} 
          key={item.name}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

// --- Classement de la page d'accueil ---
function Leaderboard( { category, setCategory } ) {
  const [shownScoreEntries, setShownScoreEntries] = useState([]);
  const [allScoreEntries, setAllScoreEntries] = useState([]);

  useEffect(() => {
    getScore();
  }, []);

  useEffect(() => {
    sortScore();
  }, [category, allScoreEntries])

  const sortScore = async () => {
    const filtered = [];

      for (const scoreEntry of allScoreEntries) {
        if (scoreEntry.category === category) {
          filtered.push(scoreEntry);
        }
      }

      const sortedData = filtered.sort((a, b) => b.score - a.score);

      setShownScoreEntries(sortedData);
  }

  const getScore = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/scores", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      setAllScoreEntries(data);

      console.log("getScore backend response:", data)
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Classement 🏆</h2>
      <ul className="leaderboard-list">
        {shownScoreEntries.map((scoreEntry, index) => (
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
function Accueil({ category, setCategory, setUsername, setUsedQuestions }) {

  useEffect(() => {
    const audioAccueil = new Audio('/MUSIQUE_ACCUEIL.mp3');
    audioAccueil.loop = true; // Joue en boucle
    audioAccueil.volume = 0.4; // 40% du volume pour ne pas exploser les oreilles
    
    // Le .catch est obligatoire car les navigateurs bloquent parfois l'autoplay
    audioAccueil.play().catch(error => console.log("Attente d'interaction pour la musique"));

    // Quand on quitte l'accueil (vers le jeu), on coupe le son !
    return () => {
      audioAccueil.pause();
      audioAccueil.currentTime = 0;
    };
  }, []);
  
  return (
    <div className="accueil-background">
      
      <div className="home-layout">
        <div className="glass-card" style={{ flex: '1.5', maxWidth: '600px' }}>
          <img src="/favicon.png" alt="Logo TC Quiz" style={{ width: '150px', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }} />
          <h1 style={{ color: '#333', margin: '0' }}>Le TC Quiz</h1>
          
          <TabButtons category={category} setCategory={setCategory} setUsedQuestions={setUsedQuestions} />
          

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
          <Leaderboard category={category} setCategory={setCategory} />
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

/// --- Question clic sur image ---
function ImageClickQuestion({ question, handleAnswer }) {
  const [clickedPoint, setClickedPoint] = useState(null);
  const [message, setMessage] = useState("");


  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);


  const getCoordinates = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handleMouseMove = (event) => {

    if (!isHovering) {
      setIsHovering(true);
    }
    const { x, y } = getCoordinates(event);
    setHoverPos({ x, y });
  };

  const handleImageClick = (event) => {
    const { x, y } = getCoordinates(event);
    setClickedPoint({ x, y });

    const { xMin, xMax, yMin, yMax } = question.correctZone;
    const isCorrect = x >= xMin && x <= xMax && y >= yMin && y <= yMax;

    setMessage(isCorrect ? "Bien joué !" : "Mauvais endroit...");

    setTimeout(() => handleAnswer(isCorrect), 800);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '1.2rem' }}>{question.text}</p>

      <div 
        style={{ 
          position: 'relative', 
          width: '90%', 
          maxWidth: '700px', 
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
          cursor: 'crosshair'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleImageClick}
      >
        <img 
          src={question.image} 
          alt="Carte de l'INSA" 
          style={{ 
            display: 'block', 
            width: '100%',

            transform: isHovering ? 'scale(2.5)' : 'scale(1)', 
            transformOrigin: `${hoverPos.x}% ${hoverPos.y}%`, 
            transition: 'transform 0.15s ease-out',
            pointerEvents: 'none'
          }} 
        />

        {clickedPoint && (
          <div style={{ 
            position: 'absolute', 
            left: `${clickedPoint.x}%`, 
            top: `${clickedPoint.y}%`, 
            transform: 'translate(-50%, -50%)', 
            width: '14px', 
            height: '14px', 
            borderRadius: '50%', 
            backgroundColor: 'red', 
            border: '2px solid white', 
            pointerEvents: 'none',
            zIndex: 10
          }} />
        )}
      </div>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

// --- Page de Jeu (Le Quiz) ---
function Jeu({ category, username, questions }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const audioJeu = new Audio('/MUSIQUE_QUESTION.mp3');
    audioJeu.loop = true;
    audioJeu.volume = 0.3; // Un peu plus bas pour laisser le joueur se concentrer
    
    audioJeu.play().catch(error => console.log("Erreur audio jeu :", error));

    return () => {
      audioJeu.pause();
      audioJeu.currentTime = 0;
    };
  }, []);

  const sendScore = async (username, score, nbrQuestions, category) => {
    try {
      const response = await fetch("http://localhost:5001/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, score, nbrQuestions, category })
      });

      const data = await response.json();
      console.log({ username, score, nbrQuestions, category });
      console.log("sendScore backend response:", data);
      

    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    console.log(category);
    if (showScore) {
      sendScore(username, score, questions.length, category);
      const pourcentage = (score / questions.length) * 100;
      let sonFinal;

      if (pourcentage >= 80) {
        sonFinal = new Audio('/son-victoire.mp3');
      } else if (pourcentage >= 50) {
        sonFinal = new Audio('/son-moyen.mp3');
      } else {
        sonFinal = new Audio('/son-defaite.mp3');
      }

      sonFinal.play().catch(e => console.log("Erreur audio fin :", e));
    }
  }, [showScore, username, score, questions.length, category]);

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
      new Audio('/CORRECT.mp3').play().catch(e => console.log(e));
      setScore(score + 1);
      setFeedback(true);
      setFeedbackMsg(messagesTrue[Math.floor(Math.random() * messagesTrue.length)]);
    } else {
      new Audio('/WRONGv2.mp3').play().catch(e => console.log(e));
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
    <div style={{ textAlign: 'center', marginTop: '50px', position: 'relative' }}> 

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
  const [category, setCategory] = useState(0);

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Accueil category={category} setCategory={setCategory} setUsername={setUsername} setUsedQuestions={setUsedQuestions} />} />  {/* Sert à changer les questions utilisées avec le hook */}
          <Route path="/jeu" element={<Jeu category={category} username={username} questions={usedQuestions} />} />  {/* Changer les questions utilisées */}
        </Routes>
      </Router>
      
  );
}