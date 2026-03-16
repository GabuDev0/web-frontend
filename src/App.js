import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Page d'Accueil ---
function Accueil() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <img src="/favicon.png" alt="Logo TC Quiz" style={{ width: '200px', marginBottom: '20px' }} />
      <h1>Bienvenue sur le TC Quiz !</h1>
      <Link to="/jeu"><button style={styles.button}>Commencer le jeu</button></Link>
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

  useEffect(() => { setItems(question.items || []); }, [question]);

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

  useEffect(() => {
    setClicks(0);
    setTimeLeft(question.duration);
    setStarted(false);
    setFinished(false);
  }, [question]);

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

  useEffect(() => {
    setClickedPoint(null);
    setMessage("");
  }, [question]);

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

        {clickedPoint && <div style={{ position: 'absolute', left: `${clickedPoint.x}%`, top: `${clickedPoint.y}%`, transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'red', border: '2px solid white', pointerEvents: 'none' }} />}
      </div>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

// --- Page de Jeu (Le Quiz) ---
function Jeu() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/questions')
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur chargement questions :', error);
        setLoading(false);
      });
  }, []);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) setCurrentQuestion(nextQuestion);
    else setShowScore(true);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><h2>Chargement...</h2></div>;
  if (!questions.length) return <div style={{ textAlign: 'center', marginTop: '100px' }}><h2>Aucune question trouvée.</h2></div>;

  const currentQ = questions[currentQuestion];

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
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
    </div>
  );
}

// --- Styles simples ---
const styles = {
  button: { padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#F5BE27', color: 'white', border: 'none', borderRadius: '5px' },
  optionButton: { padding: '15px', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '2px solid #F5BE27', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '180px', transition: 'transform 0.2s' }
};

// --- App Principal ---
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