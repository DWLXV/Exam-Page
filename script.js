const { useState, useEffect, useRef } = React;

const firebaseConfig = {
    apiKey: "AIzaSyDRNfbYa7hQPKqU7iG39Cav7uYR2ZxoPzk",
    authDomain: "exam-page-52ca7.firebaseapp.com",
    projectId: "exam-page-52ca7",
    storageBucket: "exam-page-52ca7.firebasestorage.app",
    messagingSenderId: "443344349852",
    appId: "1:443344349852:web:5eb470af4438d24e12db59",
    measurementId: "G-PTZ7700E40"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Helper: Parse pasted raw text into structured question objects
const parseRawQuestions = (rawText) => {
    if (!rawText.trim()) return [];

    const blocks = rawText.trim().split(/\n\s*\n/);
    const parsedQuestions = [];

    blocks.forEach((block, idx) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return;

        let questionText = "";
        const options = [];
        let correctAnswer = "";

        lines.forEach(line => {
            const ansMatch = line.match(/^(?:Answer|Ans|Correct)[:\s]*([A-D])/i);
            const optMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);

            if (ansMatch) {
                correctAnswer = ansMatch[1].toUpperCase();
            } else if (optMatch) {
                options.push({
                    id: optMatch[1].toUpperCase(),
                    text: optMatch[2]
                });
            } else {
                questionText += (questionText ? "\n" : "") + line.replace(/^\d+[\.\)]\s*/, '');
            }
        });

        if (questionText && options.length > 0) {
            parsedQuestions.push({
                id: idx + 1,
                text: questionText,
                options: options,
                correctAnswer: correctAnswer || options[0].id
            });
        }
    });

    return parsedQuestions;
};

const MathText = ({ text }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        let isCancelled = false;
        const renderMath = () => {
            if (isCancelled) return;
            if (containerRef.current) {
                containerRef.current.textContent = text || '';
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

function App() {
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [activeExam, setActiveExam] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [flagReasons, setFlagReasons] = useState({});
    const [score, setScore] = useState(0);

    // High Scores State persistent in localStorage
    const [highScores, setHighScores] = useState(() => {
        try {
            const saved = localStorage.getItem('exam_high_scores');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
    const [customSubjects, setCustomSubjects] = useState(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']);

    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [examTitle, setExamTitle] = useState('');
    const [examSubject, setExamSubject] = useState('');
    const [examDuration, setExamDuration] = useState(60);
    const [examDescription, setExamDescription] = useState('');
    const [rawQuestionsInput, setRawQuestionsInput] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [isSavingExam, setIsSavingExam] = useState(false);

    // Edit Modal State
    const [editingExam, setEditingExam] = useState(null);
    const [editQuestions, setEditQuestions] = useState([]);
    const [isUpdatingExam, setIsUpdatingExam] = useState(false);

    // Delete Modal State
    const [examToDelete, setExamToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Timer states
    const [timerStatus, setTimerStatus] = useState('idle');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerHidden, setIsTimerHidden] = useState(false);
    const [inputHours, setInputHours] = useState(1);
    const [inputMinutes, setInputMinutes] = useState(0);
    const [inputSeconds, setInputSeconds] = useState(0);

    const [showResetModal, setShowResetModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportSelectedIds, setExportSelectedIds] = useState(new Set());
    const [copySuccess, setCopySuccess] = useState(false);

    // Fetch exams from Firestore
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const snapshot = await db.collection('exams').get();
                const fetchedList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setExams(fetchedList);
            } catch (err) {
                console.error("Error fetching exams: ", err);
            } finally {
                setLoadingExams(false);
            }
        };
        fetchExams();
    }, []);

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

    const handleParseText = () => {
        const result = parseRawQuestions(rawQuestionsInput);
        setParsedQuestions(result);
    };

    const handleSaveExamToFirestore = async () => {
        if (!examTitle || !examSubject || parsedQuestions.length === 0) {
            alert("Please provide a Title, Subject, and parse at least 1 valid question.");
            return;
        }

        setIsSavingExam(true);
        const generatedId = examTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `exam-${Date.now()}`;

        const newExamObj = {
            id: generatedId,
            title: examTitle,
            subject: examSubject,
            durationMinutes: Number(examDuration),
            description: examDescription,
            questions: parsedQuestions,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('exams').doc(generatedId).set(newExamObj);
            setExams(prev => [newExamObj, ...prev]);

            setExamTitle('');
            setExamSubject('');
            setExamDuration(60);
            setExamDescription('');
            setRawQuestionsInput('');
            setParsedQuestions([]);
            setShowAddModal(false);

            alert("Exam added and published successfully!");
        } catch (error) {
            console.error("Error saving exam to Firestore: ", error);
            alert("Failed to save exam.");
        } finally {
            setIsSavingExam(false);
        }
    };

    const handleOpenEditModal = (exam) => {
        setEditingExam({ ...exam });
        setEditQuestions(JSON.parse(JSON.stringify(exam.questions || [])));
    };

    const handleUpdateQuestionField = (qIdx, field, val) => {
        const updated = [...editQuestions];
        updated[qIdx][field] = val;
        setEditQuestions(updated);
    };

    const handleUpdateOptionText = (qIdx, optIdx, val) => {
        const updated = [...editQuestions];
        updated[qIdx].options[optIdx].text = val;
        setEditQuestions(updated);
    };

    const handleAddQuestionToEdit = () => {
        const newQ = {
            id: editQuestions.length + 1,
            text: "New Question Text",
            options: [
                { id: "A", text: "Option A" },
                { id: "B", text: "Option B" },
                { id: "C", text: "Option C" },
                { id: "D", text: "Option D" }
            ],
            correctAnswer: "A"
        };
        setEditQuestions([...editQuestions, newQ]);
    };

    const handleDeleteQuestionFromEdit = (qIdx) => {
        const updated = editQuestions.filter((_, idx) => idx !== qIdx).map((q, idx) => ({ ...q, id: idx + 1 }));
        setEditQuestions(updated);
    };

    const handleSaveEditedExam = async () => {
        if (!editingExam.title || !editingExam.subject || editQuestions.length === 0) {
            alert("Exam must have a title, subject, and at least one question.");
            return;
        }

        setIsUpdatingExam(true);
        const updatedExamData = {
            ...editingExam,
            durationMinutes: Number(editingExam.durationMinutes),
            questions: editQuestions,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('exams').doc(editingExam.id).set(updatedExamData, { merge: true });
            setExams(prev => prev.map(e => e.id === editingExam.id ? updatedExamData : e));
            setEditingExam(null);
            alert("Exam updated successfully!");
        } catch (err) {
            console.error("Error updating exam:", err);
            alert("Failed to update exam.");
        } finally {
            setIsUpdatingExam(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!examToDelete) return;
        setIsDeleting(true);
        try {
            await db.collection('exams').doc(examToDelete.id).delete();
            setExams(prev => prev.filter(e => e.id !== examToDelete.id));
            setExamToDelete(null);
        } catch (err) {
            console.error("Error deleting exam:", err);
            alert("Failed to delete exam from database.");
        } finally {
            setIsDeleting(false);
        }
    };

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

    const toggleFlag = (questionId) => setFlagged({ ...flagged, [questionId]: !flagged[questionId] });

    const handleSubmit = () => {
        let finalScore = 0;
        activeExam.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) finalScore++;
        });
        setScore(finalScore);

        // Update High Score calculation (percentage)
        const totalQ = activeExam.questions.length || 1;
        const scorePct = Math.round((finalScore / totalQ) * 100);

        setHighScores(prev => {
            const previousHigh = prev[activeExam.id] !== undefined ? prev[activeExam.id] : -1;
            const newHigh = Math.max(previousHigh, scorePct);
            const updated = { ...prev, [activeExam.id]: newHigh };
            try {
                localStorage.setItem('exam_high_scores', JSON.stringify(updated));
            } catch (e) { }
            return updated;
        });

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
        } catch (err) { }
        document.body.removeChild(textArea);
    };

    // Filter Logic
    const availableSubjects = ['All', ...new Set(exams.map(e => e.subject).filter(Boolean))];
    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = selectedSubjectFilter === 'All' || exam.subject === selectedSubjectFilter;
        return matchesSearch && matchesSubject;
    });

    // Helper for Grade Style logic (with percentage fill gradients)
    const getExamGradeStyling = (scorePct) => {
        if (scorePct === undefined || scorePct === null) {
            return {
                cardBg: "bg-white border-gray-200 hover:border-gray-300",
                badgeClass: "bg-gray-100 text-gray-600 border-gray-200 inline-block px-2 py-0.5 rounded-md text-[10px] border",
                label: null
            };
        }

        const baseClass = "font-bold inline-block px-2 py-0.5 rounded-md text-[10px] border relative z-10 text-center min-w-[90px]";

        if (scorePct >= 75) {
            return {
                cardBg: "bg-emerald-50/80 border-emerald-300 hover:border-emerald-400 shadow-sm",
                badgeClass: `text-emerald-900 border-emerald-400 ${baseClass}`,
                label: `${scorePct}%`,
                gradient: `linear-gradient(to right, #6ee7b7 ${scorePct}%, #ecfdf5 ${scorePct}%)`
            };
        } else if (scorePct >= 50) {
            return {
                cardBg: "bg-amber-50/80 border-amber-300 hover:border-amber-400 shadow-sm",
                badgeClass: `text-amber-900 border-amber-400 ${baseClass}`,
                label: `${scorePct}%`,
                gradient: `linear-gradient(to right, #fcd34d ${scorePct}%, #fffbeb ${scorePct}%)`
            };
        } else {
            return {
                cardBg: "bg-rose-50/80 border-rose-300 hover:border-rose-400 shadow-sm",
                badgeClass: `text-rose-900 border-rose-400 ${baseClass}`,
                label: `${scorePct}%`,
                gradient: `linear-gradient(to right, #fca5a5 ${scorePct}%, #fff1f2 ${scorePct}%)`
            };
        }
    };
    const allAvailableSubjects = Array.from(new Set([...customSubjects, ...exams.map(e => e.subject).filter(Boolean)]));

    // --- VIEW: DASHBOARD ---
    if (currentView === 'dashboard') {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Assessments Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">Manage exams, search questions, or start practice tests.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors shrink-0 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Add Exam
                        </button>
                    </header>

                    {/* Search & Subject Filter Bar */}
                    <div className="mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full sm:flex-1">
                            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search exams by title, topic, or subject..."
                                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-xs font-semibold text-gray-600 shrink-0">Filter Subject:</label>
                            <select
                                value={selectedSubjectFilter}
                                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                                className="w-full sm:w-auto border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    </div>

                    {loadingExams ? (
                        <div className="text-center py-12 text-gray-500">Loading exams from Firestore...</div>
                    ) : filteredExams.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 p-8">
                            <p className="text-gray-500 mb-4">No matching exams found.</p>
                            <button onClick={() => { setSearchQuery(''); setSelectedSubjectFilter('All'); }} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">Clear Search Filters</button>
                        </div>
                    ) : (
                        /* Slim 4:1 Ratio Horizontal Rectangle Grid Layout */
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            {filteredExams.map((exam) => {
                                const topScorePct = highScores[exam.id];
                                const styling = getExamGradeStyling(topScorePct);

                                return (
                                    <div
                                        key={exam.id}
                                        className={`rounded-xl border transition-all duration-200 flex flex-col justify-between p-3.5 relative group aspect-[4/1] min-h-[105px] ${styling.cardBg}`}
                                    >
                                        {/* Top Line: Subject Tag + Edit/Delete + Score Badge */}
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-blue-100 text-blue-800 uppercase border border-blue-200">
                                                    {exam.subject}
                                                </span>
                                                {styling.label && (
                                                    <span
                                                        className={styling.badgeClass}
                                                        title="Highest Score Percentage"
                                                        style={{ background: styling.gradient }}
                                                    >
                                                        Score: {styling.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleOpenEditModal(exam)} title="Edit Exam" className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                <button onClick={() => setExamToDelete(exam)} title="Delete Exam Set" className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Title & Clamped Short Description */}
                                        <div className="my-auto pr-1">
                                            <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{exam.title}</h3>
                                            <p className="text-gray-600 text-xs line-clamp-1 mt-0.5">{exam.description || 'No description provided.'}</p>
                                        </div>

                                        {/* Footer Row */}
                                        <div className="border-t border-gray-200/60 pt-2 flex items-center justify-between mt-1">
                                            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                {exam.durationMinutes} mins • {exam.questions?.length || 0} Qs
                                            </div>
                                            <button onClick={() => handleSelectExam(exam)} className="px-3.5 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm">
                                                Start Exam
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Modal: Add New Exam */}
                    {showAddModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                            <div className="bg-white rounded-xl shadow-2xl flex flex-col max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-xl font-bold text-gray-900">Add New Exam to Database</h3>
                                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Title *</label>
                                            <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="e.g. AAU Model Exam 1" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={examSubject}
                                                    onChange={(e) => setExamSubject(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                >
                                                    <option value="" disabled>Select subject...</option>
                                                    {allAvailableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSub = window.prompt("Enter new subject name:");
                                                        if (newSub && newSub.trim()) {
                                                            setCustomSubjects(prev => [...prev, newSub.trim()]);
                                                            setExamSubject(newSub.trim());
                                                        }
                                                    }}
                                                    className="px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-md border border-blue-200 transition-colors"
                                                    title="Add Custom Subject"
                                                >+</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Minutes)</label>
                                            <input type="number" value={examDuration} onChange={(e) => setExamDuration(e.target.value)} min="1" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                        <textarea value={examDescription} onChange={(e) => setExamDescription(e.target.value)} rows="2" placeholder="Brief details about this exam..." className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-semibold text-gray-700">Paste Raw Questions Text</label>
                                            <button onClick={handleParseText} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded">
                                                Parse Raw Text
                                            </button>
                                        </div>
                                        <textarea
                                            value={rawQuestionsInput}
                                            onChange={(e) => setRawQuestionsInput(e.target.value)}
                                            rows="8"
                                            placeholder={`Paste text here in format:\n\n1. What is 2 + 2?\nA) 3\nB) 4\nC) 5\nD) 6\nAnswer: B`}
                                            className="w-full border border-gray-300 rounded-md p-3 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                        ></textarea>
                                    </div>

                                    {parsedQuestions.length > 0 && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-bold text-gray-900 mb-3 text-sm">Parsed Preview ({parsedQuestions.length} Questions Found)</h4>
                                            <div className="space-y-3 max-h-60 overflow-y-auto border p-3 rounded bg-gray-50">
                                                {parsedQuestions.map((q, idx) => (
                                                    <div key={idx} className="p-3 bg-white border rounded text-xs space-y-1 shadow-sm">
                                                        <p className="font-bold text-gray-900">{idx + 1}. {q.text}</p>
                                                        <div className="grid grid-cols-2 gap-1 text-gray-600 pl-2">
                                                            {q.options.map(o => (
                                                                <span key={o.id} className={o.id === q.correctAnswer ? 'font-bold text-green-600' : ''}>
                                                                    {o.id}) {o.text} {o.id === q.correctAnswer ? '✓' : ''}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                                    <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-md text-gray-700 text-sm font-medium hover:bg-gray-100">Cancel</button>
                                    <button
                                        onClick={handleSaveExamToFirestore}
                                        disabled={isSavingExam || parsedQuestions.length === 0}
                                        className={`px-5 py-2 text-white text-sm font-bold rounded-md shadow transition-colors ${isSavingExam || parsedQuestions.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                    >
                                        {isSavingExam ? 'Saving...' : 'Save & Publish Exam'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal: Edit Existing Exam & Questions */}
                    {editingExam && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                            <div className="bg-white rounded-xl shadow-2xl flex flex-col max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-xl font-bold text-gray-900">Edit Exam & Questions</h3>
                                    <button onClick={() => setEditingExam(null)} className="text-gray-400 hover:text-gray-700">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                            <input type="text" value={editingExam.title} onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                            <input type="text" value={editingExam.subject} onChange={(e) => setEditingExam({ ...editingExam, subject: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Mins)</label>
                                            <input type="number" value={editingExam.durationMinutes} onChange={(e) => setEditingExam({ ...editingExam, durationMinutes: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                        <textarea value={editingExam.description || ''} onChange={(e) => setEditingExam({ ...editingExam, description: e.target.value })} rows="2" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-gray-900 text-base">Questions ({editQuestions.length})</h4>
                                            <button onClick={handleAddQuestionToEdit} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded flex items-center gap-1">
                                                + Add Question
                                            </button>
                                        </div>

                                        <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                                            {editQuestions.map((q, qIdx) => (
                                                <div key={qIdx} className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-gray-800 text-sm">Question {qIdx + 1}</span>
                                                        <button onClick={() => handleDeleteQuestionFromEdit(qIdx)} className="text-red-500 hover:text-red-700 text-xs font-semibold">
                                                            Delete Question
                                                        </button>
                                                    </div>

                                                    <textarea
                                                        value={q.text}
                                                        onChange={(e) => handleUpdateQuestionField(qIdx, 'text', e.target.value)}
                                                        rows="2"
                                                        className="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                                        placeholder="Question Stem Text..."
                                                    ></textarea>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {q.options.map((opt, optIdx) => (
                                                            <div key={opt.id} className="flex items-center gap-2 bg-white p-1.5 border rounded">
                                                                <span className="font-bold text-xs text-gray-600 w-4">{opt.id}.</span>
                                                                <input
                                                                    type="text"
                                                                    value={opt.text}
                                                                    onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                                                                    className="w-full text-xs border-none outline-none"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center gap-3 pt-1">
                                                        <label className="text-xs font-semibold text-gray-700">Correct Answer:</label>
                                                        <select
                                                            value={q.correctAnswer}
                                                            onChange={(e) => handleUpdateQuestionField(qIdx, 'correctAnswer', e.target.value)}
                                                            className="border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                        >
                                                            {q.options.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                                    <button onClick={() => setEditingExam(null)} className="px-4 py-2 border rounded-md text-gray-700 text-sm font-medium hover:bg-gray-100">Cancel</button>
                                    <button
                                        onClick={handleSaveEditedExam}
                                        disabled={isUpdatingExam}
                                        className={`px-5 py-2 text-white text-sm font-bold rounded-md shadow transition-colors ${isUpdatingExam ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {isUpdatingExam ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal: Delete Confirmation */}
                    {examToDelete && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Entire Exam Set?</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Are you sure you want to delete <span className="font-bold text-gray-900">"{examToDelete.title}"</span>? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setExamToDelete(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium">Cancel</button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        disabled={isDeleting}
                                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Exam'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                                        <button onClick={() => setTimerStatus('paused')} className="p-1 ml-1 rounded-full text-amber-500 hover:bg-amber-50"><svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
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
                                    {score} / {activeExam.questions.length} ({Math.round((score / (activeExam.questions.length || 1)) * 100)}%)
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
