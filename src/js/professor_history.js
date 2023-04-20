// Function that creates the html to show the exam's questions.
async function showQuestions() {
    const outputDiv = document.getElementById("questions");
    n_questions = await contractHistory.methods.getQuestionsCount().call({from: account});
    let outputString = "";

    for (let i = 0; i < n_questions; i++){
        let x = await contractHistory.methods.getQuestionByIndex(i).call({from: account})
        outputString += "<div class='question'><h2> " + (i+1) + " - " + x + "</h2></div>"
    }

    if (await contractHistory.methods.getExamAvailability().call()) {
      outputString += "<button class='correctButton' onclick='showStudents()'>Show Students</button>"
      outputString += "<div id='students'></div>"
    } else {
      outputString += '<button class="correctButton" onclick="examDone()">Finish exam</button>'   
    }    

    outputDiv.innerHTML = outputString;
}

var student = null;

// Function that creates the html to show the students and their scores
async function showStudents() {
  const outputDiv = document.getElementById("students")
  maxScore = await contractHistory.methods.getMaxScore().call()
  n_students = await contractHistory.methods.getStudentsCount().call();
  n_questions = await contractHistory.methods.getQuestionsCount().call({from: account});
  let outputString = "<div class='question'>"

  for (let i = 0; i < n_students; i++){
    let x = await contractHistory.methods.getStudentByIndex(i).call();
    if(x.score == -10){
      outputString +="<h2> " + (i+1) + " - " + x.studentAddress + " - [TO BE ASSESSED]</h2>"
    } else {
      outputString +="<h2> " + (i+1) + " - " + x.studentAddress + " - "+x.score+"</h2>"
    }      
  }
  
  if(n_students == 0){
    outputString +="<h2>No student submit the exam.</h2>"
    outputString += "</div>"
  } else {
    student = await contractHistory.methods.getStudentByIndex(0).call()
    outputString += "</div>"
    outputString += '<div class="form-container">'+
                    '<form id="select-student-form" class="inline-form" onsubmit="selectStudent(event)">'+
                        '<h1>Select Student</h1>'+
                        '<label for="student">Student\'s number:</label>'+
                        '<input type="text" id="student" name="student" required>'+
                        '<br>'+
                        '<input type="submit" value="Select">'+
                        '<div id="error-message-student"></div>'+
                      '</form>'+
                      '<form id="assess-student-form" class="inline-form" onsubmit="submitScore(event)">'+
                        '<h1>Assess Student - Address:</h1>'+
                        '<p id="studentAdd">'+student.studentAddress+'</p>'
                      for(let i = 0; i < n_questions; i++){
                        let x = await contractHistory.methods.getQuestionByIndex(i).call({from: account})
                        let y = await contractHistory.methods.getAnswers(student.studentAddress).call()
                        outputString += '<h3>'+x+'</h3>'+
                                        '<p class="answer" id="ans'+i+'">'+y[i]+'</p>'+
                                        '<label>Score (Max. Score: '+parseInt(maxScore/n_questions)+'):</label>'+
                                        '<input type="text" id="q'+i+'" required>'+
                                        '<label>Note:</label>'+
                                        '<input type="text" id="n'+i+'" value="">'+
                                        '<br>'
                      }
                      outputString += '<input type="submit" value="Submit">'
                      outputString += '<div id="error-message-assess"></div>'
                      outputString += '</form>'
                      outputString += '</form>'
                      outputString += '</div>'
  }
  
  outputDiv.innerHTML = outputString;
}

// Function to submit the scores and notes of a student by the professor.
async function submitScore(event){
  event.preventDefault();
  n_questions = await contractHistory.methods.getQuestionsCount().call({from: account});
  maxScore = await contractHistory.methods.getMaxScore().call()
  event.preventDefault();
  var scores = []
  var notes = []
  error = false;
  console.log("hoooooooooooooooooooooolaaaaaaaaaaaaaaaaaaaa")
  console.log(student.studentAddress)
  for(let i = 0; i < n_questions; i++){
    x = parseInt(document.getElementById('q'+i).value)
    y = document.getElementById('n'+i).value
    console.log(x)
    console.log(y)
    if(x < 0 || x > (maxScore/n_questions)){
      error = true;
    }
    scores.push(x);
    notes.push(y)
  }

  if (error == true){
    console.log("error")
    document.getElementById('error-message-assess').innerHTML = "Scores cannot be negative.";
  } else {
    document.getElementById('error-message-assess').innerHTML = "";
    result = contractHistory.methods.computeScore(scores, notes, student.studentAddress).call({from: account});
    contractHistory.methods.computeScore(scores, notes, student.studentAddress).send({from: account});
    if(result == -1){
      document.getElementById('error-message-assess').innerHTML = "Only professors can submit scores."; 
    } else if (result == -2) {
      document.getElementById('error-message-assess').innerHTML = "Student does not did the exam.";
    }
  } 
}

// Function to change the student's exam to be assessed by the professor.
async function selectStudent(event){
  event.preventDefault();
  n_questions = await contractHistory.methods.getQuestionsCount().call({from: account});
  var idStudent = await document.getElementById('student').value - 1;
  if (idStudent >= await contractHistory.methods.getStudentsCount().call()){
    document.getElementById('error-message-student').innerHTML = "Exam is not available.";
  } else {
    student = await contractHistory.methods.getStudentByIndex(idStudent).call();
    answers = await contractHistory.methods.getAnswers(student.studentAddress).call();
    document.getElementById("studentAdd").innerHTML = student.studentAddress;
    for(let i = 0; i < n_questions; i++){
      document.getElementById("ans"+i).innerHTML = answers[i];
    }
  }
}

// Function that indicates that the exam was completely formed by the professors.
async function examDone(){
    const result = await contractHistory.methods.examDone().call({from: account})
    await contractHistory.methods.examDone().send({from: account})

    if(result == 1) {
        errorMessageDelete.textContent = "Exam was already finished.";
    } else if(result == 2){
        errorMessageDelete.textContent = "You have to be a professor.";
    }
}

const form = document.getElementById("add-question-form");
const formDelete = document.getElementById("delete-question-form");
const errorMessage = document.getElementById("error-message");
const errorMessageDelete = document.getElementById("error-message-delete");
const quesAddInput = document.getElementById("question");
const quesDelInput = document.getElementById("delQuestion");

// Form to add a question to the exam by a professor
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const question = form.question.value;
    console.log(question)

    res = await contractHistory.methods.addQuestion(question).call({from: account})
    await contractHistory.methods.addQuestion(question).send({from: account})
    if(res == 1){
        errorMessage.textContent = "Address does not exists.";
    } else if (res == 2){
        errorMessage.textContent = "The exam cannot be modified.";
    }else {
      if (quesAddInput.checkValidity()) {
        errorMessage.textContent = "";
      }
    }
});

// Form to delete a question from the exam.
formDelete.addEventListener("submit", async function(event) {
  event.preventDefault();
  const questionDel = formDelete.delQuestion.value - 1;
  const result = await contractHistory.methods.deleteQuestion(questionDel).call({from: account});
  await contractHistory.methods.deleteQuestion(questionDel).send({from: account});
  if(result == 1){
    errorMessageDelete.textContent = "You have to be a professor.";
  } else if (result == 2){
    errorMessageDelete.textContent = "Question does not exists.";
  } else if (result == 3){
    errorMessageDelete.textContent = "The exam cannot be modified.";
  }
})

quesDelInput.addEventListener("input", function() {
  if (quesDelInput.checkValidity()) {
    errorMessageDelete.textContent = "";
  }
});
