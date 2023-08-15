// Please include the information for your own firebase below

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

firebase.initializeApp(firebaseConfig);


const quizContainer = document.getElementById('quiz-container');
const scoreDisplay = document.getElementById('score-display');
const questionContainer = document.getElementById('question-container');
const answerButtonsContainer = document.getElementById('answer-buttons-container');
const submitButton = document.getElementById('submit-button');
const resultContainer = document.getElementById('result-container');
const nextButton = document.getElementById('next-button');
// Get a ref to the database service
var database = firebase.database();


let shuffledQuestions, currentQuestionIndex, score;

//Put the practice items below using the below format.
const questions = [

{
question: "Question",
answers: [
{ text: "Answer", correct: true },
{ text: "Answer", correct: false },
{ text: "Answer", correct: false },
{ text: "Answer", correct: false },
{ text: "Answer", correct: false }
],
rationale: "This is why"
},

{
question: "Question",
answers: [
{ text: "Answer", correct: true },
{ text: "Answer", correct: false },
{ text: "Answer", correct: false },
{ text: "Answer", correct: false },
{ text: "Answer", correct: false }
],
rationale: "This is why"
}
  
];



function startQuiz() {
  shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  currentQuestionIndex = 0;
  score = 0;0
  updateScoreDisplay();
  quizContainer.style.display = 'block';
  setNextQuestion();
  submitButton.addEventListener('click', submitHandler);
  nextButton.addEventListener('click', () => {
  setNextQuestion();
});
  questions.forEach(question => {
    question.answers.forEach(answer => {
      answer.selected = false;
    });
  });
}

function updateScoreDisplay() {
  const remaining = questions.length - currentQuestionIndex;
  scoreDisplay.innerText = `Score: ${score}/${currentQuestionIndex}, Remaining: ${remaining}`;
}

function setNextQuestion() {
  Array.from(answerButtonsContainer.children).forEach(button => {
    button.disabled = false;
    button.classList.remove('selected');
  });
  resetState();
  nextButton.style.display = 'none';
  if (currentQuestionIndex < shuffledQuestions.length) {
    showQuestion(shuffledQuestions[currentQuestionIndex]);
  } else {
    showResults();
  }
}


 

function showResults() {
 // quizContainer.style.display = 'none';
  resultContainer.style.display = 'block';
  resultContainer.innerText = `You scored ${score}/${questions.length}.`;
  var scoresRef = firebase.database().ref('scores');
  scoresRef.push({score: score, totalQuestions: questions.length});
}

function showQuestion(question) {
  questionContainer.innerText = question.question;
  question.answers.sort(() => Math.random() - 0.5).forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('answer');
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener('click', selectAnswer);
    answerButtonsContainer.appendChild(button);
  });
    // Update the question counter in Firebase
  var questionsAttemptedRef = firebase.database().ref('questionsAttempted');
  questionsAttemptedRef.transaction(function(currentValue) {
    return (currentValue || 0) + 1;
  })
}

function resetState() {
  clearStatusClass(document.body);
  submitButton.disabled = true;
  while (answerButtonsContainer.firstChild) {
    answerButtonsContainer.removeChild(answerButtonsContainer.firstChild);
  }
}

function selectAnswer(e) {
  const selectedButton = e.target;

  // Deselect previously selected button
  Array.from(answerButtonsContainer.children).forEach(button => {
    if (button !== selectedButton) {
      button.removeEventListener('click', selectAnswer);
      button.classList.remove('selected');
    }
  });

  // Toggle selected class on the clicked button
  selectedButton.classList.toggle('selected');

  // Update the selected answer for the current question
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion.answers.find(answer => answer.text.includes(selectedButton.innerText));
  if (selectedAnswer) {
    selectedAnswer.selected = !selectedAnswer.selected;
  }

  // Enable or disable the submit button based on whether an answer is selected
  const isAnyAnswerSelected = currentQuestion.answers.some(answer => answer.selected);
  submitButton.disabled = !isAnyAnswerSelected;

  // Re-add the event listener for deselected buttons
  Array.from(answerButtonsContainer.children).forEach(button => {
    if (button !== selectedButton) {
      button.addEventListener('click', selectAnswer);
    }
  });
}


function submitHandler() {
  submitButton.disabled = true;
  Array.from(answerButtonsContainer.children).forEach(button => {
 //   button.disabled = true;
 //   button.classList.remove('selected');
  });
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const correct = currentQuestion.answers.every(answer => answer.selected === answer.correct);
  if (correct) {
    score++;
  }
Array.from(answerButtonsContainer.children).forEach(button => {
  const isSelected = button.classList.contains('selected');
  setStatusClass(button, button.dataset.correct, isSelected);
  if (button.dataset.correct) {
    const rationale = document.createElement('div');
    rationale.innerText = currentQuestion.rationale;
    button.parentNode.insertBefore(rationale, button.nextSibling);
  }

  
  
});




  currentQuestionIndex++;
  updateScoreDisplay();
 nextButton.style.display = 'block';

}

function setStatusClass(element, correct, isSelected = false) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add('correct');
  } else if (isSelected) {
    element.classList.add('selected');
  } else {
    element.classList.add('wrong');
  }
}


function clearStatusClass(element) {
  element.classList.remove('correct');
  element.classList.remove('wrong');
}

startQuiz();
