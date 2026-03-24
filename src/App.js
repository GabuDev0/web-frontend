import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// --- Les Questions ---
const questions = [
  { text: "Quelle est la signification de PIT ?", options: [{ t: "Passeport Informatique Telecom", isCorrect: true }, { t: "Projet Informatique Telecom", isCorrect: false }, { t: "Partage d’Informations pour Tous", isCorrect: false }, { t: "Pas de IF en TC", isCorrect: false }] },
  { text: "Quel est le bon logo du pull TC 2026?", options: [{ t: "1", img: "/Logo 1 Projet WEB 2026.png", isCorrect: true }, { t: "2", img: "/Logo 2 Projet WEB 2026.png", isCorrect: false }, { t: "3", img: "/Logo 3 Projet WEB 2026.png", isCorrect: false }, { t: "4",img: "/Logo 4 Projet WEB 2026.png", isCorrect: false }] },
  { text: "En quelle année a été créée l’Astus?", image: "/astus.png", options: [{ t: "1957", isCorrect: false }, { t: "1998", isCorrect: true }, { t: "2005", isCorrect: false }, { t: "2026", isCorrect: false }] },
  { text: "Quel est le nom de la salle réseau au rez-de-chaussée?", options: [{ t: "TP Info A", isCorrect: false }, { t: "Plateforme Radiocom", isCorrect: false }, { t: "Salle ISO", isCorrect: true }, { t: "Salle Coin-coin", isCorrect: false }] },
  // Ajoute tes 10 questions ici sur le même modèle...
  { text: "Combien y’a t’il de départements à l’INSA ? (en comptant le FIMI)", options: [{ t: "8", isCorrect: false }, { t: "9", isCorrect: false }, { t: "10", isCorrect: true }, { t: "67", isCorrect: false }] },
  { text: "Quelle est la matière du 3TCS1 avec le plus de rattrapages?", options: [{ t: "PBS", isCorrect: false }, { t: "IP", isCorrect: true }, { t: "NRP", isCorrect: false }, { t: "Théâtre", isCorrect: false }] },
  { text: "Quel est le nouveau président de l’Astus 2026?", options: [{ t: "Enzo", isCorrect: false }, { t: "Paul", isCorrect: false }, { t: "Laura", isCorrect: true }, { t: "Macron", isCorrect: false }] },
];

const questions2 = [
  { text: "insa question 1", options: [{ t: "faux 1", isCorrect: false }, { t: "réponse bonne", isCorrect: true }, { t: "faux 2", isCorrect: false }, { t: "faux 3", isCorrect: false }] },
  { text: "insa question 2", options: [{ t: "faux 1", isCorrect: false }, { t: "réponse bonne", isCorrect: true }] },
];

const questions3 = [
  { text: "test1 question 1", options: [{ t: "faux 1", isCorrect: false }, { t: "réponse bonne", isCorrect: true }, { t: "faux 2", isCorrect: false }, { t: "faux 3", isCorrect: false }] },
  { text: "test1 question 2", options: [{ t: "faux 1", isCorrect: false }, { t: "réponse bonne", isCorrect: true }] },
];
const questionCategory = [
  {
    name: "TC",
    questions: questions
  },
  {
    name: "INSA",
    questions: questions2
  },
  {
    name: "Test1",
    questions: questions3
  }
]

// --- Boutons de choix des questions ---
function TabButtons({ setUsedQuestions }) {
  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (index) => {
    setActiveTab(index);
    setUsedQuestions(questionCategory[index].questions);
  };

  return (
    <div className="tab_header" style={{ display: "flex", flexDirection: "column", width: "200px", gap: "10px"}} >
      {questionCategory.map((item, index) => (
        <button 
          onClick={() => handleClick(index)} 
          className="tab_button" 
          key={item.name}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

// --- Page d'Accueil ---
function Accueil({ setUsername, setUsedQuestions }) {

  return (
    <div>
      <TabButtons setUsedQuestions={setUsedQuestions} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px"}}>
        
        {/* Ton Image ici */}
        <img 
          src="/favicon.png" // Remplace par le nom exact de ton fichier dans le dossier public
          alt="Logo TC Quiz" 
          style={{ width: '200px'}} // Tu peux ajuster la taille ici
        />

        <h1>Bienvenue sur le TC Quiz !</h1>
        

        <input
          style={styles.textInput}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ton pseudo"
        />
        <Link to="/jeu">
          <button style={styles.button}>Commencer le jeu</button>
        </Link>
        <Leaderboard />
      </div>
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
      // Récupère les 10 meilleurs scores de la DB (le 10 est setup dans le backend)
      const response = await fetch("http://localhost:5001/api/scores", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();
      console.log("Réponse backend :", data);

      // tri décroissant des scores récupérés
      const sortedData = data.sort((a, b) => b.score - a.score);
      
      setPastScores(sortedData);

    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div>
      <h2>Classement 🏆</h2>
      <ul>
        {pastScores.map((scoreEntry, index) => (
          <li key={index}>
            #{index+1} - {scoreEntry.username} - ({scoreEntry.score})
          </li>
        ))}
      </ul>

    </div>
  )
}
// --- En-tête de la page de Jeu ---
function JeuHeader( { username }) {
  return (
    <div className="game_header">
      <h5>{username}</h5>
    </div>
    
  )
}
// --- Page de Jeu (Le Quiz) ---
function Jeu({ username, questions }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

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
      console.log("Réponse backend :", data);
      

    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    if (showScore) {
      sendScore(username, score, questions.length);
    }
  }, [showScore]);

  return (
    <div className="game">

      <JeuHeader username={username} />
      <div className="game_content" style={{ textAlign: 'center', marginTop: '100px' }}>
        {showScore ? (
          <div>
            <h2>Terminé !</h2>
            <p style={{ fontSize: '1.5rem' }}>Ton score est de {score} sur {questions.length}</p>

            <Link to="/">
              <button style={styles.button}>Revenir à l'accueil</button>
            </Link>
          </div>
        ) : (
          <div>
            <h3>Question {currentQuestion + 1} / {questions.length}</h3>
            <p style={{ fontSize: '1.2rem' }}>{questions[currentQuestion].text}</p>

            {questions[currentQuestion].image && (
              <img 
                src={questions[currentQuestion].image} 
                alt="Illustration question" 
                style={{ 
                  width: '300px', 
                  borderRadius: '10px', 
                  marginBottom: '20px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' 
                }} 
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {questions[currentQuestion].options.map((option, index) => (
                <button 
                  key={index} 
                  onClick={() => handleAnswer(option.isCorrect)}
                  style={styles.optionButton}
                >
                  {/* Si l'option a une image, on l'affiche au-dessus du texte */}
                  {option.img && (
                    <img 
                      src={option.img} 
                      alt={option.t} 
                      style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '10px' }} 
                    />
                  )}
                  <div style={{ fontWeight: 'bold' }}>{option.t}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
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
    backgroundColor: '#F5BE27',
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
  const [usedQuestions, setUsedQuestions] = useState(questionCategory[0].questions);
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