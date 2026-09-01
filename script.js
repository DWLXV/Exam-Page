const { useState, useEffect, useRef } = React;

const MathText = ({ text }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    const renderMath = () => {
      if (isCancelled) return;
      if (containerRef.current) {
        containerRef.current.textContent = text;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetClear([containerRef.current]);
          window.MathJax.typesetPromise([containerRef.current]).catch((err) => console.log('MathJax error:', err));
        } else {
          setTimeout(renderMath, 100);
        }
      }
    };
    renderMath();
    return () => { isCancelled = true; };
  }, [text]);

  return <span ref={containerRef} />;
};

const Passage = ({ title, text, isHTML }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-5 py-3 flex justify-between items-center bg-blue-100 hover:bg-blue-200 transition-colors text-blue-900 font-bold focus:outline-none text-left">
        <span>{title}</span>
        <svg className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="px-5 py-4 bg-white border-t border-blue-100 text-gray-800 text-sm sm:text-base leading-relaxed overflow-x-auto">
          {isHTML ? <div dangerouslySetInnerHTML={{ __html: text }} /> : text.split('\n\n').map((p, i) => <p key={i} className="mb-3 last:mb-0">{p}</p>)}
        </div>
      )}
    </div>
  );
};

// Centralized Exam Database
const examsDatabase = [
  {
    id: 'g8-english',
    title: 'Grade 8 English Assessment',
    subject: 'English',
    durationMinutes: 60,
    description: 'Comprehensive assessment covering reading comprehension, vocabulary, and grammar (focusing on subject-verb agreement and reported speech backshifting).',
    questions: [
      {
        id: 1, text: "Identify the correct reported speech for: She said, 'I am reading a book.'",
        options: [
          { id: 'A', text: "She said that she is reading a book." },
          { id: 'B', text: "She said that she was reading a book." },
          { id: 'C', text: "She says that she was reading a book." },
          { id: 'D', text: "She said she read a book." }
        ], correctAnswer: 'B'
      },
      {
        id: 2, text: "The team, along with their coach, ___ traveling to the tournament tomorrow.",
        options: [
          { id: 'A', text: "are" },
          { id: 'B', text: "is" },
          { id: 'C', text: "were" },
          { id: 'D', text: "have been" }
        ], correctAnswer: 'B'
      }
    ]
  },
  {
    id: 'sec-math',
    title: 'Secondary Mathematics Practice',
    subject: 'Mathematics',
    durationMinutes: 90,
    description: 'Focuses on algebraic formulas, consecutive integers, and ratio-based scaling.',
    questions: [
      {
        id: 1, text: "Which algebraic expression represents the sum of two consecutive odd integers if the first integer is $x$?",
        options: [
          { id: 'A', text: "$2x + 1$" },
          { id: 'B', text: "$2x + 2$" },
          { id: 'C', text: "$x^2 + 2$" },
          { id: 'D', text: "$2x + 3$" }
        ], correctAnswer: 'B'
      },
      {
        id: 2, text: "An 8cm by 4cm photo is enlarged by an 11:4 ratio. What is the new length of the longer side?",
        options: [
          { id: 'A', text: "11 cm" },
          { id: 'B', text: "16 cm" },
          { id: 'C', text: "22 cm" },
          { id: 'D', text: "32 cm" }
        ], correctAnswer: 'C'
      }
    ]
  }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'exam', 'results'
  const [activeExam, setActiveExam] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [flagReasons, setFlagReasons] = useState({});
  const [score, setScore] = useState(0);

  const [timerStatus, setTimerStatus] = useState('idle'); // 'idle', 'running', 'paused', 'finished'
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerHidden, setIsTimerHidden] = useState(false);

  const [inputHours, setInputHours] = useState(1);
  const [inputMinutes, setInputMinutes] = useState(0);
  const [inputSeconds, setInputSeconds] = useState(0);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSelectedIds, setExportSelectedIds] = useState(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerStatus === 'running' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && timerStatus === 'running') {
      handleSubmit();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerStatus, timeLeft]);

  useEffect(() => {
    if (currentView !== 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex, currentView]);

  const handleSelectExam = (exam) => {
    setActiveExam(exam);
    const initialSeconds = exam.durationMinutes * 60;
    setInputHours(Math.floor(initialSeconds / 3600));
    setInputMinutes(Math.floor((initialSeconds % 3600) / 60));
    setInputSeconds(initialSeconds % 60);
    setTimeLeft(initialSeconds);
    setCurrentView('exam');
  };

  const startTimer = () => {
    const customTime = (inputHours * 3600) + (inputMinutes * 60) + inputSeconds;
    setTimeLeft(customTime > 0 ? customTime : 3600);
    setTimerStatus('running');
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOptionSelect = (questionId, optionId) => {
    if (currentView === 'results') return;
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const clearSelection = (questionId) => {
    if (currentView === 'results') return;
    const newAnswers = { ...answers };
    delete newAnswers[questionId];
    setAnswers(newAnswers);
  };

  const toggleFlag = (questionId) => setFlagged({ ...flagged, [questionId]: !flagged[questionId] });
  const handleReasonChange = (questionId, reason) => setFlagReasons({ ...flagReasons, [questionId]: reason });

  const handleSubmit = () => {
    let finalScore = 0;
    activeExam.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) finalScore++;
    });
    setScore(finalScore);
    setCurrentView('results');
    setTimerStatus('finished');
  };

  const handleReset = () => {
    setAnswers({});
    setFlagged({});
    setFlagReasons({});
    setScore(0);
    setCurrentIndex(0);
    setShowResetModal(false);
    setTimerStatus('idle');
    
    const initialSeconds = activeExam.durationMinutes * 60;
    setTimeLeft(initialSeconds);
    setInputHours(Math.floor(initialSeconds / 3600));
    setInputMinutes(Math.floor((initialSeconds % 3600) / 60));
    setInputSeconds(initialSeconds % 60);
    
    setCurrentView('exam');
  };

  const exitToDashboard = () => {
    setActiveExam(null);
    setAnswers({});
    setFlagged({});
    setFlagReasons({});
    setScore(0);
    setCurrentIndex(0);
    setTimerStatus('idle');
    setCurrentView('dashboard');
  };

  const openExportModal = () => {
    const initialSelected = new Set();
    activeExam.questions.forEach(q => {
      if (answers[q.id] !== q.correctAnswer || flagged[q.id]) {
        initialSelected.add(q.id);
      }
    });
    setExportSelectedIds(initialSelected);
    setCopySuccess(false);
    setShowExportModal(true);
  };

  const toggleExportSelection = (id) => {
    const newSet = new Set(exportSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExportSelectedIds(newSet);
  };

  const convertHtmlToText = (htmlStr) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlStr;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleCopyForAI = () => {
    let exportText = `I need help understanding my mistakes on the ${activeExam.title}.\n\n`;
    const sortedIds = [...exportSelectedIds].sort((a, b) => a - b);
    const includedPassages = new Set();

    sortedIds.forEach(id => {
      const q = activeExam.questions.find(item => item.id === id);
      if (q.passageTitle && q.passage && !includedPassages.has(q.passageTitle)) {
        includedPassages.add(q.passageTitle);
        const cleanPassageText = q.isHTML ? convertHtmlToText(q.passage) : q.passage;
        exportText += `===================================================\nREFERENCE DATA: ${q.passageTitle}\n===================================================\n${cleanPassageText}\n===================================================\n\n`;
      }
      exportText += `--- Question ${q.id} ---\n`;
      if (flagged[q.id]) {
        exportText += `[Flagged by User]\n`;
        if (flagReasons[q.id]) exportText += `User's reason for flagging: ${flagReasons[q.id].trim()}\n`;
      }
      exportText += `Question: ${q.text}\n`;
      q.options.forEach(opt => { exportText += `${opt.id}) ${opt.text}\n`; });
      const myAnsId = answers[q.id];
      const myAnsText = myAnsId ? q.options.find(o => o.id === myAnsId)?.text : "None Selected";
      exportText += `\nMy Selected Answer: ${myAnsId ? myAnsId + ') ' + myAnsText : 'None Selected'}\n`;
      exportText += `Correct Answer: ${q.correctAnswer}) ${q.options.find(o => o.id === q.correctAnswer)?.text}\n\n`;
    });

    const textArea = document.createElement("textarea");
    textArea.value = exportText;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      if (document.execCommand('copy')) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  // --- VIEW: DASHBOARD ---
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Assessments</h1>
            <p className="mt-3 text-lg text-gray-500">Select an exam to begin.</p>
          </header>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {examsDatabase.map((exam) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all duration-200 flex flex-col p-6">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-100 text-blue-800 mb-3 uppercase">
                    {exam.subject}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{exam.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{exam.description}</p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {exam.durationMinutes} mins
                  </div>
                  <button onClick={() => handleSelectExam(exam)} className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors focus:ring-4 focus:ring-gray-200">
                    Start Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: EXAM / RESULTS ---
  const isSubmitted = currentView === 'results';
  const question = activeExam.questions[currentIndex] || activeExam.questions[0];

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8 relative pb-20">
      {/* Modals */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Retake Exam?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to retake the entire exam? All progress will be lost.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium">Cancel</button>
              <button onClick={handleReset} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium">Yes, Retake</button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity p-4">
          <div className="bg-white rounded-lg shadow-2xl flex flex-col max-w-3xl w-full max-h-[90vh]">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">Export for AI Agent</h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-white">
              <div className="space-y-3">
                {activeExam.questions.map(q => {
                  const isSelected = exportSelectedIds.has(q.id);
                  const isWrong = answers[q.id] !== q.correctAnswer;
                  const isFlagged = flagged[q.id];
                  return (
                    <label key={q.id} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'}`}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleExportSelection(q.id)} className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900">Question {q.id}</span>
                          {isWrong && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Incorrect</span>}
                          {isFlagged && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Flagged</span>}
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2"><MathText text={q.text} /></div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-lg">
              <span className="text-sm font-medium text-gray-600">Selected: {exportSelectedIds.size}</span>
              <div className="flex gap-3">
                <button onClick={handleCopyForAI} className={`px-5 py-2.5 text-white rounded-lg font-medium flex items-center gap-2 ${copySuccess ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                  {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
           <button onClick={exitToDashboard} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Back to Dashboard
           </button>
        </div>

        {/* Timer UI */}
        <div className="fixed bottom-6 right-6 sm:top-6 sm:right-8 sm:bottom-auto z-40 flex-shrink-0">
          {isTimerHidden ? (
            <button onClick={() => setIsTimerHidden(false)} className="flex items-center justify-center w-10 h-10 bg-white text-gray-400 rounded-full shadow-md border border-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          ) : (
            <div className="bg-white rounded-full border border-gray-200 shadow-md py-1.5 px-3 flex items-center gap-3">
              <button onClick={() => setIsTimerHidden(true)} className="text-gray-400 hover:text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              {timerStatus === 'idle' && !isSubmitted ? (
                <div className="flex items-center text-sm font-mono text-gray-700 font-medium">
                  <select value={inputHours} onChange={(e) => setInputHours(Number(e.target.value))} className="appearance-none bg-transparent outline-none cursor-pointer text-center w-6 hover:text-blue-600 transition-colors">
                    {[...Array(13).keys()].map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                  </select><span>:</span>
                  <select value={inputMinutes} onChange={(e) => setInputMinutes(Number(e.target.value))} className="appearance-none bg-transparent outline-none cursor-pointer text-center w-6 hover:text-blue-600 transition-colors">
                    {[...Array(60).keys()].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                  </select><span>:</span>
                  <select value={inputSeconds} onChange={(e) => setInputSeconds(Number(e.target.value))} className="appearance-none bg-transparent outline-none cursor-pointer text-center w-6 hover:text-blue-600 transition-colors">
                    {[...Array(60).keys()].map(s => <option key={s} value={s}>{String(s).padStart(2, '0')}</option>)}
                  </select>
                </div>
              ) : (
                <div className={`font-mono font-bold text-base tracking-wider ${timeLeft <= 300 && timerStatus === 'running' ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                  {formatTime(timeLeft)}
                </div>
              )}
              {!isSubmitted && (
                <div className="flex items-center pl-1 border-l border-gray-200">
                  {timerStatus === 'idle' && (
                    <button onClick={startTimer} className="p-1 ml-1 rounded-full text-green-600 hover:bg-green-50"><svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>
                  )}
                  {timerStatus === 'running' && (
                    <button onClick={() => setTimerStatus('paused')} className="p-1 ml-1 rounded-full text-amber-500 hover:bg-amber-50"><svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                  )}
                  {timerStatus === 'paused' && (
                    <button onClick={() => setTimerStatus('running')} className="p-1 ml-1 rounded-full text-blue-500 hover:bg-blue-50"><svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <header className="mb-6 text-center mt-2 border-b border-gray-200 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">{activeExam.title}</h1>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">{activeExam.subject}</span>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 relative">
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 h-fit bg-white rounded-lg border border-gray-200 shadow-sm p-4 order-2 lg:order-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Questions</h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-5 gap-2 mb-6 pr-2 pb-2 max-h-[300px] lg:max-h-[50vh] overflow-y-auto">
              {activeExam.questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = !!flagged[q.id];
                const isActive = currentIndex === idx;
                let bgClass = "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";

                if (isSubmitted) {
                  if (!answers[q.id]) bgClass = "bg-gray-100 text-gray-500 border-gray-300";
                  else if (answers[q.id] === q.correctAnswer) bgClass = "bg-green-100 text-green-800 border-green-400";
                  else bgClass = "bg-red-100 text-red-800 border-red-400";
                } else if (isAnswered) bgClass = "bg-blue-100 text-blue-800 border-blue-300";

                return (
                  <button onClick={() => setCurrentIndex(idx)} key={q.id} className={`relative flex items-center justify-center py-2 px-1 text-xs sm:text-sm font-medium rounded border transition-colors ${bgClass} ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
                    {idx + 1}
                    {isFlagged && <div className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-l-[10px] border-t-red-500 border-l-transparent rounded-tr-[3px]"></div>}
                  </button>
                );
              })}
            </div>

            {!isSubmitted ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-600 mb-1">Answered: <span className="font-bold">{Object.keys(answers).length}</span> / {activeExam.questions.length}</div>
                <button onClick={handleSubmit} className="w-full px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                  Submit Exam
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-bold text-gray-800 border-b pb-1">Final Score</h4>
                <div className="text-2xl font-black text-center py-2 text-gray-900">
                  {score} / {activeExam.questions.length}
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => setShowResetModal(true)} className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors">Retake Exam</button>
                  <button onClick={openExportModal} className="w-full px-4 py-2 bg-purple-100 text-purple-800 font-medium rounded-lg hover:bg-purple-200 transition-colors flex justify-center items-center gap-2">
                    Export to AI
                  </button>
                </div>
              </div>
            )}
          </aside>

          <main className="flex-1 order-1 lg:order-2">
            <div className="bg-[#f8f9fa] border border-gray-200 rounded-lg p-5 sm:p-8 shadow-sm min-h-[400px] flex flex-col justify-between">
              <div>
                {question.passage && <Passage title={question.passageTitle} text={question.passage} isHTML={question.isHTML} />}
                <div className="mb-5 flex justify-between items-start gap-4">
                  <div className="w-full overflow-hidden">
                    <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Question {currentIndex + 1}</h2>
                    {question.image && <img src={question.image} alt="Figure" className="mb-4 max-w-full rounded-md border border-gray-200 mt-2 max-h-64 object-contain" />}
                    <div className="text-gray-900 text-lg sm:text-xl whitespace-pre-wrap leading-relaxed">
                      <span className="font-bold mr-2">{currentIndex + 1}.</span><MathText text={question.text} />
                    </div>
                  </div>
                  <button onClick={() => toggleFlag(question.id)} className={`p-1.5 rounded-md transition-colors group ${flagged[question.id] ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-gray-600 fill-none"}`}>
                    <svg className="w-7 h-7" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                  </button>
                </div>
                
                <div className="space-y-4 pl-0 sm:pl-6 transition-all duration-300">
                  {question.options.map((option) => {
                    const isSelected = answers[question.id] === option.id;
                    const isCorrect = option.id === question.correctAnswer;
                    let labelClass = "flex items-start p-3 border rounded-lg transition-colors cursor-pointer w-full " + 
                      (isSubmitted ? (isCorrect ? "bg-green-50 border-green-300" : (isSelected ? "bg-red-50 border-red-300" : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed")) 
                      : (isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:bg-gray-50"));

                    return (
                      <label key={option.id} className={labelClass}>
                        <div className="flex items-center h-6 mt-0.5 shrink-0">
                          <input type="radio" checked={isSelected} onChange={() => handleOptionSelect(question.id, option.id)} disabled={isSubmitted} className="w-5 h-5 text-blue-600 bg-white border-gray-300 cursor-pointer" />
                        </div>
                        <span className={`ml-3 text-base mt-0.5 w-full ${isSubmitted ? (isCorrect ? "text-green-800 font-medium" : (isSelected ? "text-red-800 font-medium" : "text-gray-700")) : "text-gray-700"}`}>
                          <span className="font-semibold mr-1">{option.id}.</span> <MathText text={option.text} />
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex justify-between border-t border-gray-200 pt-5">
                <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 ${currentIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Previous
                </button>
                <button onClick={() => setCurrentIndex(prev => Math.min(activeExam.questions.length - 1, prev + 1))} disabled={currentIndex === activeExam.questions.length - 1} className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 ${currentIndex === activeExam.questions.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                  Next
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
