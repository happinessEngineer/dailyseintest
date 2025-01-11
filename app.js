function App() {
    const [questions, setQuestions] = React.useState([]);
    const [gameNumber, setGameNumber] = React.useState(0);
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const [showResult, setShowResult] = React.useState(false);
    const [results, setResults] = React.useState([]);
    const [gameComplete, setGameComplete] = React.useState(false);
    const [selectedAnswer, setSelectedAnswer] = React.useState(null);
    const [product, setProduct] = React.useState(null);
    const [useFixedAnswers, setUseFixedAnswers] = React.useState(true);
    const [shouldFixAnswers, setShouldFixAnswers] = React.useState(true);
    const questionRef = React.useRef(null);
    const answersRef = React.useRef(null);

    React.useEffect(() => {
        try {
            const loadGameData = async () => {
                const [gameNumber, questions] = await fetchTriviaQuestions();
                const product = await fetchProduct();

                setQuestions(questions);
                setGameNumber(gameNumber);
                setProduct(product);
            };
            loadGameData();
        } catch (error) {
            reportError(error);
        }
    }, []);

    React.useEffect(() => {
        const checkOverlap = () => {
            if (questionRef.current && answersRef.current) {
                const questionRect = questionRef.current.getBoundingClientRect();
                const answersRect = answersRef.current.getBoundingClientRect();
                const questionBottom = questionRect.top + questionRect.height;
                const answersHeight = answersRect.height;
                const viewportHeight = window.innerHeight;
                setShouldFixAnswers(questionBottom + 40 + answersHeight < viewportHeight);
            }
        };

        checkOverlap();
        window.addEventListener('resize', checkOverlap);
        return () => window.removeEventListener('resize', checkOverlap);
    }, [questions, currentQuestion]);

    const handleAnswer = async (answer) => {
        if (showResult) return;
        
        setSelectedAnswer(answer);
        setShowResult(true);
        
        const isCorrect = answer === questions[currentQuestion].correctAnswer;
        const newResults = [...results];
        newResults[currentQuestion] = isCorrect;
        setResults(newResults);
        
        // First, reset states
        setTimeout(() => {
            setShowResult(false);
            setSelectedAnswer(null);
            // Add a tiny delay before showing next question
            if (currentQuestion < questions.length - 1) {
                setTimeout(() => {
                    setCurrentQuestion(currentQuestion + 1);
                }, 50);
            } else {
                setGameComplete(true);
            }
        }, 2000);
    };

    if (questions.length === 0) {
        return (
            <div data-name="upload-container" className="container mx-auto max-w-2xl px-4 py-8 text-center">
                <h1 data-name="game-title" className="logo text-3xl font-bold mb-8">
                    The Daily Sein
                </h1>
            </div>
        );
    }

    if (gameComplete) {
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0]; // Format: yyyy-mm-dd
        const gameResults = {
            score: results.filter(Boolean).length,
            totalQuestions: questions.length,
            results: results
        };
        localStorage.setItem(dateKey, JSON.stringify(gameResults));

        return (
            <div data-name="game-complete" className="container mx-auto max-w-2xl px-4 py-8">
                <ResultDisplay 
                    score={results.filter(Boolean).length}
                    totalQuestions={questions.length}
                    results={results}
                    gameNumber={gameNumber}
                    product={product}
                />
            </div>
        );
    }

    const currentQuestionData = questions[currentQuestion];

    return (
        <div data-name="game-container" className="container mx-auto max-w-2xl px-4 py-8">
            <h1 data-name="game-title" className="logo text-3xl font-bold text-center mb-8">
                The Daily Sein {gameNumber ? `#${gameNumber}` : ''}
            </h1>
            
            <div ref={questionRef}>
                <QuestionDisplay 
                    question={currentQuestionData}
                    currentQuestion={currentQuestion}
                    totalQuestions={questions.length}
                />
            </div>

            <div 
                ref={answersRef}
                data-name="answers-container" 
                className={`answers-container grid gap-3 ${shouldFixAnswers ? 'answers-container-fixed' : ''}`}
            >
                {currentQuestionData.characters.map((character, index) => (
                    <AnswerButton
                        key={`${currentQuestion}-${character}`}
                        character={character}
                        isCorrect={character === currentQuestionData.correctAnswer}
                        isSelected={character === selectedAnswer}
                        onClick={() => handleAnswer(character)}
                        showResult={showResult}
                    />
                ))}
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
