import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// --- Les Questions ---
const questions = [
  
  { type: 'standard', text: "Quelle est la signification de PIT ?", options: [{ t: "Passeport Informatique Telecom", isCorrect: true }, { t: "Projet Informatique Telecom", isCorrect: false }, { t: "Partage d’Informations pour Tous", isCorrect: false }, { t: "Pas de IF en TC", isCorrect: false }] },
  { type: 'standard', text: "Quel est le bon logo du pull TC 2026?", options: [{ t: "1", img: "/Logo 1 Projet WEB 2026.png", isCorrect: true }, { t: "2", img: "/Logo 2 Projet WEB 2026.png", isCorrect: false }, { t: "3", img: "/Logo 3 Projet WEB 2026.png", isCorrect: false }, { t: "4",img: "/Logo 4 Projet WEB 2026.png", isCorrect: false }] },
  { type: 'standard', text: "En quelle année a été créée l’Astus?", image: "/astus.png", options: [{ t: "1957", isCorrect: false }, { t: "1998", isCorrect: true }, { t: "2005", isCorrect: false }, { t: "2026", isCorrect: false }] },
  
  // EXEMPLE de question avec AUDIO
  { 
    type: 'standard', 
    text: "A quel professeur appartient cette voix ? (Le football il a changé)", 
    audio: "wrong.mp3", // Fichier dans public/
    options: [
      { t: "Stéphane Frénot", isCorrect: false }, 
      { t: "Victor Rebecq", isCorrect: true }, 
      { t: "Olivier Simonin", isCorrect: false }, 
      { t: "Kylian Mbappé", isCorrect: false }
    ] 
  },
  
  { type: 'standard', text: "Quel est le nom de la salle réseau au rez-de-chaussée?", options: [{ t: "TP Info A", isCorrect: false }, { t: "Plateforme Radiocom", isCorrect: false }, { t: "Salle ISO", isCorrect: true }, { t: "Salle Coin-coin", isCorrect: false }] },
  
  { 
    type: 'action', 
    text: "⚠️ DES IF ESSAYENT DE FORCER LA PORTE DU BAT TC ! Vite ! Clique sur la porte le plus vite possible !",
    image: "/shining.png",
    instruction: "Clique 50 fois sur le bouton en moins de 10 secondes !",
    targetClicks: 50,
    timeLimit: 10
  },

  { type: 'standard', text: "Combien y’a t’il de départements à l’INSA ? (en comptant le FIMI)", options: [{ t: "8", isCorrect: false }, { t: "9", isCorrect: false }, { t: "10", isCorrect: true }, { t: "67", isCorrect: false }] },
  { type: 'standard', text: "Quelle était la couleur du bouton « Commencer » du quiz ?", options: [{ t: "Vert", img: "/vert.png", isCorrect: false }, { t: "Jaune", img:"/jaune.png", isCorrect: false }, { t: "Bleu", img:"/bleu.png", isCorrect: false }, { t: "Violet", img:"violet.png", isCorrect: true }] },
  
  { 
    type: 'standard', 
    text: "Quel est le numéro de cette question ?", 
    hideNumber: true, // L'astuce est ici
    options: [
      { t: "10", isCorrect: false }, 
      { t: "11", isCorrect: false }, 
      { t: "12", isCorrect: true }, // Met le bon chiffre selon l'index (ici si c'est la 12ème)
      { t: "13", isCorrect: false }
    ] 
  },

  { type: 'standard', text: "Quelle est la matière du 3TCS1 avec le plus de rattrapages?", options: [{ t: "PBS", isCorrect: false }, { t: "IP", isCorrect: true }, { t: "NRP", isCorrect: false }, { t: "Théâtre", isCorrect: false }] },
  
  { 
    type: 'timer-check', 
    text: "Depuis combien de temps joues-tu à ce quiz ? (Vite, ça change !)", 
    options: [
      { offset: 0, isCorrect: true },
      { offset: -30, isCorrect: false },
      { offset: 100, isCorrect: false },
      { offset: 45, isCorrect: false }
    ]
  },
  
  { type: 'standard', text: "Quel est le nouveau président de l’Astus 2026?", options: [{ t: "Enzo", isCorrect: false }, { t: "Paul", isCorrect: false }, { t: "Laura", isCorrect: true }, { t: "Macron", isCorrect: false }] },
  { type: 'standard', text: "Combien de câbles rouges ne sont pas reliés à eth1?", image: "/switchs.png", options: [{ t: "0", isCorrect: false }, { t: "2", isCorrect: true }, { t: "4", isCorrect: false }, { t: "6", isCorrect: false }] },
];

const formatTime = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
};

function Accueil() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <img src="/favicon.png" alt="Logo TC Quiz" style={{ width: '400px', marginBottom: '20px' }} />
      <h1>Bienvenue sur le TC Quiz !</h1>
      <Link to="/jeu"><button style={styles.button}>Commencer le jeu</button></Link>
    </div>
  );
}

function Jeu() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [gameStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [actionClicks, setActionClicks] = useState(0);
  const [actionTimer, setActionTimer] = useState(0);
  const [actionStatus, setActionStatus] = useState('waiting');

  const playSound = (fileName) => {
    const audio = new Audio(`/${fileName}`);
    audio.play().catch(err => console.log("Audio bloqué :", err));
  };

  useEffect(() => {
    const globalInterval = setInterval(() => {
      const seconds = Math.floor((Date.now() - gameStartTime) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);

    const q = questions[currentQuestion];
    let actionTimeout;
    if (q.type === 'action' && actionStatus === 'running') {
      if (actionTimer > 0) {
        actionTimeout = setTimeout(() => setActionTimer(actionTimer - 1), 1000);
      } else if (actionTimer === 0 && feedback === null) {
        handleActionEnd(false);
      }
    }
    return () => { clearInterval(globalInterval); clearTimeout(actionTimeout); };
  }, [gameStartTime, currentQuestion, actionStatus, actionTimer, feedback]);

  const navigateToNextQuestion = () => {
    setFeedback(null);
    setActionClicks(0);
    setActionStatus('waiting');
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
      playSound('victory.mp3'); 
    }
  };

  const handleAnswer = (isCorrect) => {
    if (feedback) return;
    if (isCorrect) {
      setScore(score + 1);
      setFeedback("Bonne réponse ! ✅");
      playSound('success.mp3');
    } else {
      setFeedback("Faux... ❌");
      playSound('wrong.mp3');
    }
    setTimeout(navigateToNextQuestion, 800); 
  };

  const startActionGame = () => {
    const q = questions[currentQuestion];
    setActionClicks(0);
    setActionTimer(q.timeLimit);
    setActionStatus('running');
  };

  const handleActionClick = () => {
    if (actionStatus !== 'running') return;
    const newClicks = actionClicks + 1;
    setActionClicks(newClicks);
    if (newClicks >= questions[currentQuestion].targetClicks) handleActionEnd(true);
  };

  const handleActionEnd = (isSuccess) => {
    setActionStatus(isSuccess ? 'won' : 'lost');
    if (isSuccess) {
      setScore(score + 1);
      setFeedback("BIEN JOUÉ ! RENTREZ CHEZ VOUS ! 🫵");
      playSound('success.mp3');
    } else {
      setFeedback(`NOUS SOMMES ENVAHIS... 😭`);
      playSound('wrong.mp3');
    }
    setTimeout(navigateToNextQuestion, 1500);
  };

  const getEvaluation = (score) => {
    if (score <= 3) return { texte: "Nul... 😴", couleur: "#dc3545" };
    if (score <= 6) return { texte: "Moyen. 😐", couleur: "#ffc107" };
    if (score <= 10) return { texte: "Bien ! 🙂", couleur: "#17a2b8" };
    return { texte: "Très bien ! 🤩", couleur: "#28a745" };
  };

  const evaluation = getEvaluation(score);
  const q = questions[currentQuestion];

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {showScore ? (
        <div style={{ padding: '20px', borderRadius: '15px', backgroundColor: '#fdfdfd', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h2>Terminé !</h2>
          <h3 style={{ color: evaluation.couleur }}>{evaluation.texte}</h3>
          <p style={{ fontSize: '1.5rem' }}>Ton score : <strong>{score}</strong> / {questions.length}</p>
          <p>Temps total : {formatTime(elapsedSeconds)}</p>
          <Link to="/"><button style={styles.button}>Revenir à l'accueil</button></Link>
        </div>
      ) : (
        <div>
          <h3>Question {q.hideNumber ? "?" : currentQuestion + 1} / {questions.length}</h3>
          
          <div style={{ height: '40px' }}>
            {feedback && <p style={{ fontWeight: 'bold', color: feedback.includes('✅') ? '#28a745' : '#dc3545' }}>{feedback}</p>}
          </div>

          {q.type === 'standard' && (
            <div>
              <p style={{ fontSize: '1.3rem' }}>{q.text}</p>
              
              {/* BOUTON AUDIO (Si présent dans la question) */}
              {q.audio && (
                <button 
                  onClick={() => playSound(q.audio)} 
                  style={styles.audioButton}
                  disabled={feedback}
                >
                  🔊 Écouter l'extrait
                </button>
              )}

              {q.image && <img src={q.image} alt="Illustr" style={{ width: '300px', marginBottom: '20px', borderRadius: '10px' }} />}
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt.isCorrect)} style={styles.optionButton} disabled={feedback}>
                    {opt.img && <img src={opt.img} style={{ width: '100px', marginBottom: '10px' }} alt="" />}
                    <strong>{opt.t}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.type === 'timer-check' && (
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{q.text}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt.isCorrect)} style={styles.optionButton} disabled={feedback}>
                    <span style={{ fontSize: '1.5rem' }}>{formatTime(elapsedSeconds + opt.offset)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.type === 'action' && (
            <div style={styles.actionContainer}>
              <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{q.text}</p>
              {q.image && <img src={q.image} alt="" style={{ width: '300px', marginBottom: '10px' }} />}
              <div style={styles.actionInfoZone}>
                <div style={styles.infoBox}>Temps : {actionTimer}s</div>
                <div style={styles.infoBox}>Clics : {actionClicks} / {q.targetClicks}</div>
              </div>
              {actionStatus === 'waiting' && <button onClick={startActionGame} style={styles.actionActionButton}>🚪 COMMENCER LE DÉFI 🚪</button>}
              {actionStatus === 'running' && <button onClick={handleActionClick} style={styles.actionActionButton} disabled={feedback}>CLIQUE 🚪 !!!</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  button: { padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#EE82EE', color: 'white', border: 'none', borderRadius: '5px' },
  audioButton: {
    backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '25px', 
    padding: '10px 20px', marginBottom: '20px', cursor: 'pointer', fontSize: '1rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  },
  optionButton: { 
    padding: '15px', minWidth: '180px', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '2px solid #F5BE27', borderRadius: '8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.2s'
  },
  actionContainer: { maxWidth: '600px', margin: 'auto', padding: '20px', border: '2px dashed #dc3545', borderRadius: '15px' },
  actionInfoZone: { display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px' },
  infoBox: { fontSize: '1.2rem', border: '1px solid #ccc', padding: '10px' },
  actionActionButton: { padding: '20px', fontSize: '1.5rem', backgroundColor: '#dc3545', color: 'white', borderRadius: '10px', cursor: 'pointer' }
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/jeu" element={<Jeu />} />
      </Routes>
    </Router>
  );
}