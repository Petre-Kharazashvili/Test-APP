
window.addEventListener('DOMContentLoaded', () => {

  // DOM Elements
  const startButton = document.getElementById('start-btn');
  const nameInput = document.getElementById('name-input');
  const createTestButton = document.getElementById('create-test-btn');
  const takeTestButton = document.getElementById('take-test-btn');
  const saveTestButton = document.getElementById('save-test-btn');
  const testListDiv = document.getElementById('test-list-div');
  const studentRegistration = document.getElementById('name-input-screen');
  const testInterface = document.getElementById('test-interface');
  const welcomeScreen = document.getElementById('welcome-screen');
  const createTestDiv = document.getElementById('create-test-div');
  const testStatsDiv = document.getElementById('test-stats-div');
  const homeButton = document.getElementById('home-btn');
  const statsButton = document.getElementById('stats-btn');
  const skipButton = document.getElementById('skip-btn');

  // Question type selection elements
  const textQuestionBtn = document.getElementById('text-question-btn');
  const imageQuestionBtn = document.getElementById('image-question-btn');
  const textQuestionContainer = document.getElementById('text-question-container');
  const imageQuestionContainer = document.getElementById('image-question-container');
  const questionTextInput = document.getElementById('question-text-input');

  // Points selection elements
  const pointButtons = {
    0.5: document.getElementById('point-btn-05'),
    1: document.getElementById('point-btn-1'),
    1.5: document.getElementById('point-btn-15'),
    2: document.getElementById('point-btn-2')
  };
  const customPointsBtn = document.getElementById('custom-points-btn');
  const addQuestionBtn = document.getElementById('create-next-btn');
  const removeQuestionBtn = document.getElementById('create-before-btn');

  // Test Taking Elements
  const testTitleDisplay = document.getElementById('test-title');
  const questionParagraph = document.getElementById('question-text');
  const questionImage = document.getElementById('question-image');
  const answerBtns = [
    document.getElementById('answer-btn-1'),
    document.getElementById('answer-btn-2'),
    document.getElementById('answer-btn-3'),
    document.getElementById('answer-btn-4')
  ];
  const nextButton = document.getElementById('next-btn');
  const prevButton = document.getElementById('prev-btn');
  const finishButton = document.getElementById('finish-btn');
  const timerDisplay = document.getElementById('timer');
  const questionCounter = document.getElementById('question-counter');

  // Test Creation Elements
  const createImgInput = document.getElementById('create-img-input');
  const createAddImg = document.getElementById('create-add-img');
  const createStarBtn = document.getElementById('create-star-btn');
  const createAnswerBtns = [
    document.getElementById('create-btn-1'),
    document.getElementById('create-btn-2'),
    document.getElementById('create-btn-3'),
    document.getElementById('create-btn-4')
  ];
  const createAnswerInputs = [
    document.getElementById('create-btn-input-1'),
    document.getElementById('create-btn-input-2'),
    document.getElementById('create-btn-input-3'),
    document.getElementById('create-btn-input-4')
  ];
  const createQuestionNumber = document.getElementById('create-question-number');
  const removeImgBtn = document.getElementById('remove-img-btn');

  // Modal Elements
  const testInfoModal = document.getElementById('test-info-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelSaveBtn = document.getElementById('cancel-save-btn');
  const confirmSaveBtn = document.getElementById('confirm-save-btn');
  const modalTestTitle = document.getElementById('modal-test-title');
  const modalValidFrom = document.getElementById('modal-valid-from');
  const modalValidTo = document.getElementById('modal-valid-to');

  // Test Data
  let testData = {
    title: '',
    questions: [{
      questionNumber: 1,
      question: '',
      questionType: 'text',
      correctAnswer: null,
      answerOptions: ['', '', '', ''],
      points: 1
    }],
    validFrom: null,
    validTo: null,
  };

  // Test State
  let currentQuestionIndex = 0;
  let studentAnswers = [];
  let skippedQuestions = [];
  let selectedTestFilePath = '';
  let isCorrectAnswerMode = true;
  let testStartTime = null;
  let testTimerInterval = null;
  let remainingTime = 3600;
  let score = 0;
  let selectedAnswer = null;
  let currentPointsLevel = 1;
  let totalPointsEarned = 0;
  let pointsHistory = [];
  let consecutiveCorrect = 0;
  let consecutiveIncorrect = 0;
  let questionsByPoints = {
    0.5: [],
    1: [],
    1.5: [],
    2: []
  };
  let currentQuestionPool = [];
  let questionsAnswered = 0;

  // Initialize the application
  function init() {
    createTestButton.addEventListener('click', initializeTestInterface);
    takeTestButton.addEventListener('click', showAvailableTests);
    startButton.addEventListener('click', startTest);
    saveTestButton.addEventListener('click', showTestInfoModal);
    homeButton.addEventListener('click', resetInterface);
    statsButton.addEventListener('click', showStats);

    textQuestionBtn.addEventListener('click', () => setQuestionType('text'));
    imageQuestionBtn.addEventListener('click', () => setQuestionType('image'));

    Object.entries(pointButtons).forEach(([points, button]) => {
      button.addEventListener('click', () => setQuestionPoints(parseFloat(points)));
    });

    customPointsBtn.addEventListener('click', addCustomPointsButton);

    nextButton.addEventListener('click', goToNextQuestion);
    prevButton.addEventListener('click', goToPreviousQuestion);
    finishButton.addEventListener('click', finishTest);

    createImgInput.addEventListener('change', handleCreateFileUpload);
    removeImgBtn.addEventListener('click', removeQuestionImage);
    createStarBtn.addEventListener('click', toggleCreateCorrectAnswerMode);
    addQuestionBtn.addEventListener('click', addNewQuestion);
    removeQuestionBtn.addEventListener('click', removeCurrentQuestion);

    createAnswerInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        testData.questions[currentQuestionIndex].answerOptions[index] = e.target.value;
      });
    });

    createAnswerBtns.forEach((btn, index) => {
      btn.addEventListener('click', (e) => handleCreateAnswer(index + 1, e));
    });

    questionTextInput.addEventListener('input', (e) => {
      testData.questions[currentQuestionIndex].question = e.target.value;
    });

    closeModalBtn.addEventListener('click', closeTestInfoModal);
    cancelSaveBtn.addEventListener('click', closeTestInfoModal);
    confirmSaveBtn.addEventListener('click', saveTestWithInfo);

    skipButton.addEventListener('click', (e) => {
      e.preventDefault();
      skipQuestion();
    });

    answerBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => handleAnswer(index + 1));
    });
  }

  function setQuestionType(type) {
    const currentQuestion = testData.questions[currentQuestionIndex];
    currentQuestion.questionType = type;

    if (type === 'text') {
      textQuestionBtn.classList.add('active');
      imageQuestionBtn.classList.remove('active');
      textQuestionContainer.classList.remove('hide');
      imageQuestionContainer.classList.add('hide');
    } else {
      textQuestionBtn.classList.remove('active');
      imageQuestionBtn.classList.add('active');
      textQuestionContainer.classList.add('hide');
      imageQuestionContainer.classList.remove('hide');
    }
  }

  function addCustomPointsButton() {
    const pointsSelector = document.querySelector('.points-selector');

    const newPointBtnContainer = document.createElement('div');
    newPointBtnContainer.className = 'custom-point-container';

    const pointInput = document.createElement('input');
    pointInput.type = 'number';
    pointInput.step = '0.5';
    pointInput.min = '0.5';
    pointInput.placeholder = 'ქულა';
    pointInput.className = 'custom-point-input';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✓';
    confirmBtn.className = 'confirm-point-btn';

    confirmBtn.addEventListener('click', () => {
      const points = parseFloat(pointInput.value);
      if (!isNaN(points) && points >= 0.5) {
        createNewPointButton(points);
        pointsSelector.removeChild(newPointBtnContainer);
      } else {
        alert('გთხოვთ შეიყვანოთ სწორი რიცხვი (მინიმუმ 0.5)');
      }
    });

    newPointBtnContainer.appendChild(pointInput);
    newPointBtnContainer.appendChild(confirmBtn);
    pointsSelector.insertBefore(newPointBtnContainer, customPointsBtn);
  }

  function createNewPointButton(points) {
    points = Math.round(points * 2) / 2;

    const newPointBtn = document.createElement('button');
    newPointBtn.className = 'point-btn';
    newPointBtn.textContent = points;
    newPointBtn.dataset.points = points;

    newPointBtn.addEventListener('click', () => {
      document.querySelectorAll('.point-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      newPointBtn.classList.add('active');
      testData.questions[currentQuestionIndex].points = points;
    });

    const pointsSelector = document.querySelector('.points-selector');
    pointsSelector.insertBefore(newPointBtn, customPointsBtn);
    pointButtons[points] = newPointBtn;
  }

  function setQuestionPoints(points) {
    testData.questions[currentQuestionIndex].points = points;

    Object.values(pointButtons).forEach(btn => btn.classList.remove('active'));
    if (pointButtons[points]) {
      pointButtons[points].classList.add('active');
    }
  }

  function initializeTestInterface() {
    studentAnswers = [];
    skippedQuestions = [];
    currentQuestionIndex = 0;
    remainingTime = 3600;

    if (testTimerInterval) {
      clearInterval(testTimerInterval);
      testTimerInterval = null;
    }

    welcomeScreen.classList.add('hide');
    testListDiv.classList.add('hide');
    testStatsDiv.classList.add('hide');
    studentRegistration.classList.add('hide');
    testInterface.classList.add('hide');
    createTestDiv.classList.remove('hide');

    testData = {
      title: '',
      questions: [{
        questionNumber: 1,
        question: '',
        questionType: 'text',
        correctAnswer: null,
        answerOptions: ['', '', '', ''],
        points: 1
      }],
      validFrom: null,
      validTo: null,
    };

    createAnswerInputs.forEach((input, index) => {
      input.value = `${index + 1}`;
      input.placeholder = `${index + 1}`;
    });

    setQuestionType('text');
    setQuestionPoints(1);
    updateCreateQuestionDisplay();
  }

  function updateCreateQuestionDisplay() {
    const currentQuestion = testData.questions[currentQuestionIndex];
    createQuestionNumber.textContent = currentQuestionIndex + 1;

    createAnswerInputs.forEach((input, index) => {
      input.value = currentQuestion.answerOptions[index] || '';
    });

    createAnswerBtns.forEach(btn => {
      btn.classList.remove('correct-answer');
      const input = btn.querySelector('.answer-input');
      if (input) input.style.color = '';
    });

    if (currentQuestion.correctAnswer !== null) {
      createAnswerBtns[currentQuestion.correctAnswer - 1].classList.add('correct-answer');
      const correctInput = createAnswerBtns[currentQuestion.correctAnswer - 1].querySelector('.answer-input');
      if (correctInput) correctInput.style.color = 'white';
    }

    setQuestionType(currentQuestion.questionType);
    setQuestionPoints(currentQuestion.points);

    if (currentQuestion.questionType === 'text') {
      questionTextInput.value = currentQuestion.question || '';
    } else {
      if (currentQuestion.question) {
        createAddImg.src = currentQuestion.question;
        removeImgBtn.classList.remove('hide');
      } else {
        createAddImg.src = 'https://webcolours.ca/wp-content/uploads/2020/10/webcolours-unknown.png';
        removeImgBtn.classList.add('hide');
      }
    }

    createAnswerBtns.forEach(btn => btn.classList.remove('correct-answer'));
    if (currentQuestion.correctAnswer !== null) {
      createAnswerBtns[currentQuestion.correctAnswer - 1].classList.add('correct-answer');
    }

    removeQuestionBtn.disabled = testData.questions.length <= 1;
    addQuestionBtn.innerHTML = '<i class="fas fa-plus"></i> ახალი კითხვა';
  }

  function addNewQuestion() {
    saveCurrentQuestionData();

    const newQuestion = {
      questionNumber: testData.questions.length + 1,
      question: '',
      questionType: 'text',
      correctAnswer: null,
      answerOptions: ['', '', '', ''],
      points: 1
    };

    testData.questions.push(newQuestion);
    currentQuestionIndex = testData.questions.length - 1;
    updateCreateQuestionDisplay();
  }

  function removeCurrentQuestion() {
    if (testData.questions.length <= 1) return;

    testData.questions.splice(currentQuestionIndex, 1);

    testData.questions.forEach((q, index) => {
      q.questionNumber = index + 1;
    });

    if (currentQuestionIndex >= testData.questions.length) {
      currentQuestionIndex = testData.questions.length - 1;
    }

    updateCreateQuestionDisplay();
  }

  function handleCreateFileUpload() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target.result;
        testData.questions[currentQuestionIndex].question = imageUrl;
        testData.questions[currentQuestionIndex].questionType = 'image';
        createAddImg.src = imageUrl;
        removeImgBtn.classList.remove('hide');
        setQuestionType('image');
      };

      reader.readAsDataURL(file);
    }
  }

  function removeQuestionImage() {
    testData.questions[currentQuestionIndex].question = '';
    testData.questions[currentQuestionIndex].questionType = 'text';
    createAddImg.src = 'https://webcolours.ca/wp-content/uploads/2020/10/webcolours-unknown.png';
    removeImgBtn.classList.add('hide');
    setQuestionType('text');
  }

  function toggleCreateCorrectAnswerMode() {
    isCorrectAnswerMode = !isCorrectAnswerMode;
    createStarBtn.classList.toggle('selecting');

    if (isCorrectAnswerMode) {
      createStarBtn.innerHTML = '<i class="fas fa-check"></i> აირჩიეთ სწორი პასუხი';
      createStarBtn.classList.add('selecting');
    } else {
      createStarBtn.innerHTML = '<i class="fas fa-check"></i> სწორი პასუხის არჩევა';
      createStarBtn.classList.remove('selecting');
    }
  }

  function handleCreateAnswer(answerIndex, e) {
    e.preventDefault();

    if (isCorrectAnswerMode) {
      testData.questions[currentQuestionIndex].correctAnswer = answerIndex;

      createAnswerBtns.forEach(btn => {
        btn.classList.remove('correct-answer');
        const input = btn.querySelector('.answer-input');
        if (input) input.style.color = '';
      });

      createAnswerBtns[answerIndex - 1].classList.add('correct-answer');
      const selectedInput = createAnswerBtns[answerIndex - 1].querySelector('.answer-input');
      if (selectedInput) selectedInput.style.color = 'white';

      isCorrectAnswerMode = false;
      createStarBtn.classList.remove('selecting');
      createStarBtn.innerHTML = '<i class="fas fa-check"></i> სწორი პასუხის არჩევა';
    }
  }

  function saveCurrentQuestionData() {
    const currentQuestion = testData.questions[currentQuestionIndex];

    if (currentQuestion.questionType === 'text') {
      currentQuestion.question = questionTextInput.value.trim();
    }

    createAnswerInputs.forEach((input, index) => {
      currentQuestion.answerOptions[index] = input.value.trim();
    });
  }

  function showTestInfoModal() {
    modalTestTitle.value = testData.title || '';

    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    modalValidFrom.value = now.toISOString().slice(0, 16);
    modalValidTo.value = oneWeekLater.toISOString().slice(0, 16);

    testInfoModal.classList.remove('hide');
  }

  function closeTestInfoModal() {
    testInfoModal.classList.add('hide');
  }

  async function saveTestWithInfo() {
    if (!modalTestTitle.value.trim()) {
      alert('გთხოვთ შეიყვანოთ ტესტის სათაური.');
      return;
    }

    if (!modalValidFrom.value || !modalValidTo.value) {
      alert('გთხოვთ მიუთითოთ ტესტის ხელმისაწვდომის თარიღები.');
      return;
    }

    testData.title = modalTestTitle.value.trim();
    testData.validFrom = modalValidFrom.value;
    testData.validTo = modalValidTo.value;

    testData.questions = testData.questions.filter(q => {
      const hasQuestion = q.question && q.question.trim() !== '';
      const hasCorrectAnswer = q.correctAnswer !== null && q.correctAnswer >= 1 && q.correctAnswer <= 4;
      return hasQuestion && hasCorrectAnswer;
    });

    if (testData.questions.length === 0) {
      alert('არ შეიძლება ტესტის შენახვა ცარიელი კითხვებით.');
      return;
    }

    try {
      const result = await window.electronAPI.saveTestToFile(testData);
      if (result.success) {
        alert(`ტესტი შენახულია: ${result.filePath}`);
        closeTestInfoModal();
        resetInterface();
      } else {
        alert(`შეცდომა ტესტის შენახვისას: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving test:', error);
      alert('ტესტის შენახვისას მოხდა შეცდომა');
    }
  }

  function updateQuestionDisplay() {
    answerBtns.forEach(btn => {
      btn.classList.remove('selected');
    });

    const currentQuestion = currentQuestionPool[currentQuestionIndex];
    testTitleDisplay.textContent = testData.title;
    questionCounter.textContent = `${currentQuestionIndex + 1}/${currentQuestionPool.length}`;

    if (currentQuestion.questionType === 'image') {
      questionImage.src = currentQuestion.question;
      questionImage.classList.remove('hide');
      questionParagraph.classList.add('hide');
    } else {
      questionParagraph.textContent = currentQuestion.question;
      questionImage.classList.add('hide');
      questionParagraph.classList.remove('hide');
    }

    answerBtns.forEach((btn, index) => {
      const answerText = btn.querySelector('.answer-text');
      answerText.textContent = currentQuestion.answerOptions[index] || `${index + 1}`;

      if (studentAnswers[currentQuestionIndex] === index + 1) {
        btn.classList.add('selected');
      }
    });

    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.style.display = 'flex';
    finishButton.style.display = 'flex';

    skipButton.disabled = skippedQuestions.includes(currentQuestionIndex);
    skipButton.classList.toggle('skipped', skippedQuestions.includes(currentQuestionIndex));
  }

  function handleAnswer(selectedAnswerIndex) {
    selectedAnswer = selectedAnswerIndex;
    studentAnswers[currentQuestionIndex] = selectedAnswerIndex;

    answerBtns.forEach((btn, index) => {
      btn.classList.remove('selected');
      if (index + 1 === selectedAnswerIndex) {
        btn.classList.add('selected');
      }
    });

    const skipIndex = skippedQuestions.indexOf(currentQuestionIndex);
    if (skipIndex > -1) {
      skippedQuestions.splice(skipIndex, 1);
    }

    skipButton.disabled = false;
    skipButton.classList.remove('skipped');
  }

  function goToNextQuestion() {
    if (selectedAnswer !== null) {
      const currentQuestion = currentQuestionPool[currentQuestionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

      if (isCorrect) {
        totalPointsEarned += currentQuestion.points;
        consecutiveCorrect++;
        consecutiveIncorrect = 0;

        if (consecutiveCorrect >= 1) {
          if (currentPointsLevel < 2) {
            currentPointsLevel += 0.5;
          }
          consecutiveCorrect = 0;
        }
      } else {
        totalPointsEarned -= currentQuestion.points;
        consecutiveIncorrect++;
        consecutiveCorrect = 0;

        if (consecutiveIncorrect >= 2) {
          if (currentPointsLevel > 0.5) {
            currentPointsLevel -= 0.5;
          }
          consecutiveIncorrect = 0;
        }
      }

      pointsHistory.push({
        question: currentQuestion.question,
        points: currentQuestion.points,
        earned: isCorrect ? currentQuestion.points : -currentQuestion.points,
        isCorrect
      });

      questionsAnswered++;

      if (totalPointsEarned >= 30) {
        finishTest();
        return;
      }

      selectedAnswer = null;
    }

    const nextQuestions = questionsByPoints[currentPointsLevel].filter(q =>
      !studentAnswers.some((ans, idx) =>
        ans !== null && currentQuestionPool[idx].question === q.question
      )
    );

    if (nextQuestions.length > 0) {
      const nextQuestion = nextQuestions[0];
      currentQuestionIndex = currentQuestionPool.findIndex(q => q.question === nextQuestion.question);
      updateQuestionDisplay();
      return;
    }

    const allLevels = [0.5, 1, 1.5, 2];
    for (const level of allLevels) {
      const availableQuestions = questionsByPoints[level].filter(q =>
        !studentAnswers.some((ans, idx) =>
          ans !== null && currentQuestionPool[idx].question === q.question
        )
      );

      if (availableQuestions.length > 0) {
        currentPointsLevel = level;
        const nextQuestion = availableQuestions[0];
        currentQuestionIndex = currentQuestionPool.findIndex(q => q.question === nextQuestion.question);
        updateQuestionDisplay();
        return;
      }
    }

    finishTest();
  }

  function skipQuestion() {
    if (!skippedQuestions.includes(currentQuestionIndex)) {
      skippedQuestions.push(currentQuestionIndex);

      answerBtns.forEach(btn => btn.classList.remove('selected'));
      studentAnswers[currentQuestionIndex] = null;
      goToNextQuestion();
    }
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      updateQuestionDisplay();
    }
  }

  function startTestTimer() {
    testStartTime = Date.now();
    testTimerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    remainingTime--;
    if (remainingTime <= 0) {
      clearInterval(testTimerInterval);
      finishTest();
      return;
    }

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function organizeQuestionsByPoints() {
    questionsByPoints = {
      0.5: [],
      1: [],
      1.5: [],
      2: []
    };

    testData.questions.forEach(question => {
      const points = question.points;
      if (questionsByPoints.hasOwnProperty(points)) {
        questionsByPoints[points].push(question);
      } else {
        const roundedPoints = Math.round(points * 2) / 2;
        if (roundedPoints >= 0.5 && roundedPoints <= 2) {
          questionsByPoints[roundedPoints].push(question);
          question.points = roundedPoints;
        }
      }
    });

    currentQuestionPool = [...questionsByPoints[1]];
    if (currentQuestionPool.length === 0) {
      const levels = [0.5, 1.5, 2];
      for (const level of levels) {
        if (questionsByPoints[level].length > 0) {
          currentQuestionPool = [...questionsByPoints[level]];
          currentPointsLevel = level;
          break;
        }
      }
    }
  }

  async function finishTest() {
    clearInterval(testTimerInterval);

    const percentage = Math.max(0, Math.round((totalPointsEarned / 30) * 100));
    const timeSpent = Math.floor((Date.now() - testStartTime) / 1000);
    const timeString = new Date(timeSpent * 1000).toISOString().substr(11, 8);

    const results = {
      testTitle: testData.title,
      studentName: nameInput.value.trim(),
      score: totalPointsEarned,
      totalPossible: 30,
      percentage,
      timeSpent: timeString,
      timestamp: Date.now(),
      pointsHistory,
      questionsAnswered,
      allAnswers: currentQuestionPool.map((q, i) => ({
        question: q.question,
        points: q.points,
        correctAnswer: q.correctAnswer,
        studentAnswer: studentAnswers[i],
        isCorrect: studentAnswers[i] === q.correctAnswer
      })),
      testValid: isTestCurrentlyValid()
    };

    try {
      await window.electronAPI.saveTestResults(results);
    } catch (error) {
      console.error('Error saving results:', error);
    }

    showStudentResults(results);
  }

  function isTestCurrentlyValid() {
    const currentDate = new Date();
    const validFrom = new Date(testData.validFrom);
    const validTo = new Date(testData.validTo);
    return currentDate >= validFrom && currentDate <= validTo;
  }

  function showStudentResults(results) {
    welcomeScreen.classList.add('hide');
    testListDiv.classList.add('hide');
    studentRegistration.classList.add('hide');
    testInterface.classList.add('hide');
    createTestDiv.classList.add('hide');
    testStatsDiv.classList.add('hide');

    const answersTable = `
      <table class="answers-table">
        <thead>
          <tr>
            <th>კითხვა</th>
            <th>ქულა</th>
            <th>თქვენი პასუხი</th>
            <th>სწორი პასუხი</th>
            <th>მიღებული ქულა</th>
          </tr>
        </thead>
        <tbody>
          ${results.allAnswers.map((answer, index) => {
      let questionDisplay;
      if (answer.question && answer.question.startsWith('data:image')) {
        questionDisplay = `<img src="${answer.question}" alt="კითხვის სურათი" style="max-width: 100px; max-height: 60px; object-fit: contain;">`;
      } else {
        questionDisplay = answer.question || `კითხვა ${index + 1}`;
      }

      return `
              <tr class="${answer.isCorrect ? 'correct' : 'incorrect'}">
                <td class="question-cell">${index + 1}. ${questionDisplay}</td>
                <td>${answer.points}</td>
                <td>${answer.studentAnswer || 'გამოტოვებული'}</td>
                <td>${answer.correctAnswer}</td>
                <td>${answer.isCorrect ? '+' + answer.points : '-' + answer.points}</td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    `;

    testStatsDiv.innerHTML = `
      <div class="student-results">
        <h2>ტესტის შედეგები</h2>
        <div class="test-validity ${results.testValid ? 'valid' : 'invalid'}">
          ${results.testValid ? 'აქტიური ტესტი' : 'ვადაგასული ტესტი'}
        </div>
        <div class="result-card">
          <h3>${results.testTitle}</h3>
          <div class="result-info">
            <p><strong>სტუდენტი:</strong> ${results.studentName}</p>
            <p><strong>ქულა:</strong> ${results.score}/30</p>
            <p><strong>პროცენტი:</strong> ${results.percentage}%</p>
            <p><strong>დრო:</strong> ${results.timeSpent}</p>
            <p><strong>პასუხები:</strong> ${results.questionsAnswered}</p>
          </div>
          <div class="answer-breakdown">
            <h4>დეტალური შედეგები:</h4>
            ${answersTable}
          </div>
          <button id="return-home" class="btn primary">მთავარზე დაბრუნება</button>
        </div>
      </div>
      <style>
        .answers-table {
          width: 100%;
          table-layout: fixed;
        }
        .question-cell {
          width: 30%;
          word-wrap: break-word;
          max-width: 200px;
        }
        .answers-table td {
          vertical-align: top;
          padding: 8px;
        }
        .answers-table img {
          display: block;
          margin: 4px 0;
        }
      </style>
    `;

    document.getElementById('return-home').addEventListener('click', resetInterface);
    testStatsDiv.classList.remove('hide');
  }

  async function showAvailableTests() {
    try {
      const testFiles = await window.electronAPI.listTestFiles();
      testListDiv.innerHTML = '';

      if (testFiles.length === 0) {
        testListDiv.innerHTML = `
        <div class="no-tests">
          <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>ხელმისაწვდომი ტესტები არ არის</p>
        </div>
      `;
        welcomeScreen.classList.add('hide');
        testListDiv.classList.remove('hide');
        return;
      }

      const header = document.createElement('div');
      header.className = 'test-list-header';
      header.innerHTML = `
      <h2 class="section-title">ხელმისაწვდომი ტესტები</h2>
      <div class="search-container">
        <input type="text" id="test-search" placeholder="ძებნა ტესტებში...">
        <button id="search-btn" class="search-btn">
          <i class="fas fa-search"></i>
        </button>
      </div>
    `;
      testListDiv.appendChild(header);

      const listContainer = document.createElement('div');
      listContainer.className = 'test-list';

      testFiles.forEach((file) => {
        const testButton = document.createElement('button');
        testButton.className = 'test-select-btn';

        const testName = file.replace(/_/g, ' ').replace('.quiz', '');
        const testDate = file.split('_').pop().replace('.quiz', '');

        testButton.innerHTML = `
        <div class="test-title">${testName}</div>
        <div class="test-meta">
          <span><i class="far fa-calendar-alt"></i> ${testDate}</span>
        </div>
      `;

        testButton.addEventListener('click', () => selectTest(file));
        listContainer.appendChild(testButton);
      });

      testListDiv.appendChild(listContainer);

      welcomeScreen.classList.add('hide');
      testStatsDiv.classList.add('hide');
      studentRegistration.classList.add('hide');
      testInterface.classList.add('hide');
      createTestDiv.classList.add('hide');
      testListDiv.classList.remove('hide');

      const searchInput = document.getElementById('test-search');
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const buttons = document.querySelectorAll('.test-select-btn');

        buttons.forEach(button => {
          const title = button.querySelector('.test-title').textContent.toLowerCase();
          button.style.display = title.includes(searchTerm) ? 'block' : 'none';
        });
      });

    } catch (error) {
      console.error('Error loading tests:', error);
      testListDiv.innerHTML = `
      <div class="no-tests">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>შეცდომა ტესტების ჩატვირთვისას</p>
      </div>
    `;
      welcomeScreen.classList.add('hide');
      testListDiv.classList.remove('hide');
    }
  }

  async function selectTest(file) {
    try {
      const filePath = await window.electronAPI.getTestFilePath(file);
      const result = await window.electronAPI.loadTestFromFile(filePath);

      if (result.success) {
        testData = result.testData;
        selectedTestFilePath = filePath;

        if (testData.questions.length === 0) {
          alert("ტესტი ცარიელია. გთხოვთ შექმნათ ახალი ტესტი.");
          return;
        }

        welcomeScreen.classList.add('hide');
        testListDiv.classList.add('hide');
        testStatsDiv.classList.add('hide');
        testInterface.classList.add('hide');
        createTestDiv.classList.add('hide');
        studentRegistration.classList.remove('hide');
      } else {
        alert(`შეცდომა ტესტის ჩატვირთვისას: ${result.error}`);
      }
    } catch (error) {
      console.error('Error selecting test:', error);
      alert('შეცდომა ტესტის ჩატვირთვისას');
    }
  }

  function startTest() {
    score = 0;
    selectedAnswer = null;
    currentPointsLevel = 1;
    totalPointsEarned = 0;
    pointsHistory = [];
    consecutiveCorrect = 0;
    consecutiveIncorrect = 0;
    questionsAnswered = 0;

    if (!studentRegistration || !testInterface) {
      console.error('Required elements missing:', { studentRegistration, testInterface });
      return;
    }

    const studentName = nameInput.value.trim();
    if (!studentName) {
      alert('გთხოვთ შეიყვანოთ თქვენი სახელი.');
      return;
    }

    organizeQuestionsByPoints();

    currentQuestionIndex = 0;
    studentAnswers = new Array(testData.questions.length).fill(null);
    skippedQuestions = [];
    remainingTime = 3600;

    welcomeScreen.classList.add('hide');
    createTestDiv.classList.add('hide');
    testListDiv.classList.add('hide');
    testStatsDiv.classList.add('hide');
    studentRegistration.classList.add('hide');
    testInterface.classList.remove('hide');

    if (testData.questions.length === 0) {
      alert('ამ ტესტში არ არის კითხვები.');
      resetInterface();
      return;
    }

    updateQuestionDisplay();
    startTestTimer();
  }

  async function showStats() {
    try {
      welcomeScreen.classList.add('hide');
      testListDiv.classList.add('hide');
      studentRegistration.classList.add('hide');
      testInterface.classList.add('hide');
      createTestDiv.classList.add('hide');

      const response = await window.electronAPI.loadAllTestResults();
      if (!response.success) {
        throw new Error(response.error);
      }

      const allResults = response.results;

      const testsMap = new Map();
      allResults.forEach(result => {
        if (!testsMap.has(result.testTitle)) {
          testsMap.set(result.testTitle, []);
        }
        testsMap.get(result.testTitle).push(result);
      });

      testStatsDiv.innerHTML = `
        <div class="stats-header">
          <h2 class="section-title">ტესტების სტატისტიკა</h2>
        </div>
        <div class="test-selection">
          <h3>აირჩიეთ ტესტი</h3>
          <div class="test-list" id="stats-test-list"></div>
        </div>
        <div class="results-container hide" id="results-container">
          <div class="results-header">
            <h3 id="selected-test-title"></h3>
            <button id="back-to-tests" class="nav-btn">
              <i class="fas fa-arrow-left"></i> უკან
            </button>
          </div>
          <div class="results-table-container">
            <table class="results-table">
              <thead>
                <tr>
                  <th>სტუდენტი</th>
                  <th>ქულა</th>
                  <th>პროცენტი</th>
                  <th>დრო</th>
                  <th>თარიღი</th>
                </tr>
              </thead>
              <tbody id="results-table-body"></tbody>
            </table>
          </div>
        </div>
        <div class="student-details-container hide" id="student-details-container">
          <div class="student-details-header">
            <h3 id="student-details-title"></h3>
            <button id="back-to-results" class="nav-btn">
              <i class="fas fa-arrow-left"></i> უკან
            </button>
          </div>
          <div class="student-details-content">
            <div class="student-info">
              <p><strong>სტუდენტი:</strong> <span id="detail-student-name"></span></p>
              <p><strong>ქულა:</strong> <span id="detail-student-score"></span></p>
              <p><strong>პროცენტი:</strong> <span id="detail-student-percentage"></span>%</p>
              <p><strong>დრო:</strong> <span id="detail-student-time"></span></p>
            </div>
            <div class="question-results">
              <h4>კითხვების შედეგები:</h4>
              <div id="question-results-list" class="question-results-list"></div>
            </div>
          </div>
        </div>
      `;

      const testList = document.getElementById('stats-test-list');
      const resultsContainer = document.getElementById('results-container');
      const selectedTestTitle = document.getElementById('selected-test-title');
      const resultsTableBody = document.getElementById('results-table-body');
      const backToTestsBtn = document.getElementById('back-to-tests');

      const studentDetailsContainer = document.getElementById('student-details-container');
      const backToResultsBtn = document.getElementById('back-to-results');
      const studentDetailsTitle = document.getElementById('student-details-title');
      const detailStudentName = document.getElementById('detail-student-name');
      const detailStudentScore = document.getElementById('detail-student-score');
      const detailStudentPercentage = document.getElementById('detail-student-percentage');
      const detailStudentTime = document.getElementById('detail-student-time');
      const questionResultsList = document.getElementById('question-results-list');

      testsMap.forEach((results, testTitle) => {
        const testBtn = document.createElement('button');
        testBtn.className = 'test-select-btn';
        testBtn.innerHTML = `
          <div class="test-title">${testTitle}</div>
          <div class="test-meta">
            <span><i class="fas fa-users"></i> ${results.length} მონაწილე</span>
          </div>
        `;
        testBtn.addEventListener('click', () => {
          showTestResults(testTitle, results);
        });
        testList.appendChild(testBtn);
      });

      backToTestsBtn.addEventListener('click', () => {
        testList.classList.remove('hide');
        resultsContainer.classList.add('hide');
        studentDetailsContainer.classList.add('hide');
      });

      backToResultsBtn.addEventListener('click', () => {
        resultsContainer.classList.remove('hide');
        studentDetailsContainer.classList.add('hide');
      });

      function showTestResults(testTitle, results) {
        selectedTestTitle.textContent = testTitle;
        resultsTableBody.innerHTML = '';

        results.sort((a, b) => b.score - a.score);

        results.forEach(result => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="student-name-cell">${result.studentName}</td>
            <td>${result.score}/30</td>
            <td>${result.percentage}%</td>
            <td>${result.timeSpent}</td>
            <td>${new Date(result.timestamp).toLocaleString()}</td>
          `;

          const nameCell = row.querySelector('.student-name-cell');
          nameCell.style.cursor = 'pointer';
          nameCell.style.color = 'var(--primary-color)';
          nameCell.style.textDecoration = 'underline';
          nameCell.addEventListener('click', () => {
            showStudentDetails(testTitle, result);
          });

          resultsTableBody.appendChild(row);
        });

        testList.classList.add('hide');
        resultsContainer.classList.remove('hide');
      }

      function showStudentDetails(testTitle, result) {
        studentDetailsTitle.textContent = testTitle;
        detailStudentName.textContent = result.studentName;
        detailStudentScore.textContent = `${result.score}/30`;
        detailStudentPercentage.textContent = result.percentage;
        detailStudentTime.textContent = result.timeSpent;

        displayQuestionDetails(result);

        resultsContainer.classList.add('hide');
        studentDetailsContainer.classList.remove('hide');
      }

      function displayQuestionDetails(result) {
        questionResultsList.innerHTML = '';

        // Show points summary if pointsHistory exists
        if (result.pointsHistory && result.pointsHistory.length > 0) {
          const pointsSummary = {};
          result.pointsHistory.forEach(item => {
            const level = item.points;
            if (!pointsSummary[level]) {
              pointsSummary[level] = { correct: 0, total: 0 };
            }
            pointsSummary[level].total++;
            if (item.isCorrect) {
              pointsSummary[level].correct++;
            }
          });

          questionResultsList.innerHTML += `
            <div class="points-summary">
              <h5>ქულების შეჯამება:</h5>
              ${Object.entries(pointsSummary).map(([points, stats]) => `
                <p>${points} ქულის კითხვები: ${stats.correct}/${stats.total} სწორი (${Math.round((stats.correct / stats.total) * 100)}%)</p>
              `).join('')}
            </div>
          `;
        }

        // Check if allAnswers exists and has data
        if (!result.allAnswers || result.allAnswers.length === 0) {
          questionResultsList.innerHTML += `
            <div class="basic-results">
              <h4>ძირითადი შედეგები</h4>
              <div class="result-summary">
                <p><strong>ქულა:</strong> ${result.score}/30 (${result.percentage}%)</p>
                <p><strong>პასუხები:</strong> ${result.questionsAnswered || 'უცნობი'}</p>
              </div>
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> ამ ტესტისთვის დეტალური ინფორმაცია ხელმისაწვდომი არ არის.
              </div>
            </div>
          `;
          return;
        }

        // Display detailed question results
        result.allAnswers.forEach((answer, index) => {
          const questionResult = document.createElement('div');
          questionResult.className = `question-result-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;

          let questionDisplay;
          if (answer.question && answer.question.startsWith('data:image')) {
            questionDisplay = `<img src="${answer.question}" alt="კითხვის სურათი" style="max-width: 200px; max-height: 150px; object-fit: contain; margin: 8px 0;">`;
          } else {
            questionDisplay = answer.question && answer.question.trim() !== '' ? answer.question : `კითხვა ${index + 1}`;
          }

          const studentAnswerText = answer.studentAnswer ? `ვარიანტი ${answer.studentAnswer}` : 'გამოტოვებული';
          const correctAnswerText = answer.correctAnswer ? `ვარიანტი ${answer.correctAnswer}` : 'არ არის მითითებული';

          questionResult.innerHTML = `
            <div class="question-result-header">
              <h5>კითხვა ${index + 1}: ${answer.isCorrect ? 'სწორი' : 'არასწორი'} (${answer.points} ქულა)</h5>
            </div>
            <div class="question-result-content">
              <div class="question-text">${questionDisplay}</div>
              <p><strong>თქვენი პასუხი:</strong> ${studentAnswerText}</p>
              <p><strong>სწორი პასუხი:</strong> ${correctAnswerText}</p>
              <p><strong>მიღებული ქულა:</strong> ${answer.isCorrect ? '+' + answer.points : '-' + answer.points}</p>
            </div>
          `;

          questionResultsList.appendChild(questionResult);
        });
      }

      testStatsDiv.classList.remove('hide');
    } catch (error) {
      console.error('Error loading statistics:', error);
      testStatsDiv.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>შეცდომა სტატისტიკის ჩატვირთვისას</p>
        </div>
      `;
      testStatsDiv.classList.remove('hide');
    }
  }

  function resetInterface() {
    testInterface.classList.add('hide');
    studentRegistration.classList.add('hide');
    createTestDiv.classList.add('hide');
    testListDiv.classList.add('hide');
    testStatsDiv.classList.add('hide');
    testInfoModal.classList.add('hide');
    welcomeScreen.classList.remove('hide');

    nameInput.value = '';
    currentQuestionIndex = 0;
    isCorrectAnswerMode = false;
    currentPointsLevel = 1;
    totalPointsEarned = 0;
    pointsHistory = [];
    consecutiveCorrect = 0;
    consecutiveIncorrect = 0;
    questionsAnswered = 0;

    clearInterval(testTimerInterval);
    testTimerInterval = null;
  }

  init();
});
