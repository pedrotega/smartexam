// Function that creates the html to show the exam's questions.
async function showQuestions() {
    const outputDiv = document.getElementById("questions");
    n_questions = await contractMath.methods.getQuestionsCount().call({from: account});
    let outputString = "";
    
    for (let i = 0; i < n_questions; i++){
        let x = await contractMath.methods.getQuestionByIndex(i).call({from: account});
        outputString += "<div class='question'><h2> " + (i+1) + ": " + x + "</h2></div>"
    }

    if (await contractMath.methods.getExamAvailability().call()) {
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
  maxScore = await contractMath.methods.getMaxScore().call()
  n_students = await contractMath.methods.getStudentsCount().call();
  n_questions = await contractMath.methods.getQuestionsCount().call({from: account});
  let outputString = "<div class='question'>"

  for (let i = 0; i < n_students; i++){
    let x = await contractMath.methods.getStudentByIndex(i).call();
    if(x.score == -10){
      if(!(x.checkExam)){
        outputString +="<h2> " + (i+1) + " - " + x.studentAddress + " - [TO BE MINTED]</h2>"
      }else{
        outputString +="<h2> " + (i+1) + " - " + x.studentAddress + " - [TO BE ASSESSED]</h2>"
      }
    } else {
      outputString +="<h2> " + (i+1) + " - " + x.studentAddress + " - "+x.score+"</h2>"
    }      
  }
  
  if(n_students == 0){
    outputString +="<h2>No student submit the exam.</h2>"
    outputString += "</div>"
  } else {
    student = await contractMath.methods.getStudentByIndex(0).call()
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
                        '<p id="studentAdd">'+student.studentAddress+'</p>'+
                        '<a href='+student.ipfsURI+' id="ipfsURI">Student metadata</a>'
                      for(let i = 0; i < n_questions; i++){
                        let x = await contractMath.methods.getQuestionByIndex(i).call({from: account});
                        outputString += '<h3>'+x+'</h3>'+
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
  n_questions = await contractMath.methods.getQuestionsCount().call({from: account});
  maxScore = await contractMath.methods.getMaxScore().call()
  var scores = []
  var notes = []
  error = false;
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
    document.getElementById('error-message-assess').innerHTML = "Scores cannot be negative or greater than "+parseInt(maxScore/n_questions)+".";
    alert.apply("Error: Scores cannot be negative or greater than "+maxScore/n_questions+".")
  } else {
    result = await contractMath.methods.computeScore(scores, notes, student.studentAddress).call({from: account});
    await contractMath.methods.computeScore(scores, notes, student.studentAddress).send({from: account});
    if(result == -1){
      document.getElementById('error-message-assess').innerHTML = "Only professors can submit scores."; 
    } else if (result == -2) {
      document.getElementById('error-message-assess').innerHTML = "Student does not did the exam\n Or exam was not minted yet.";
    }
  } 
}

// Function to change the student's exam to be assessed by the professor.
async function selectStudent(event){
  event.preventDefault();
  n_questions = await contractMath.methods.getQuestionsCount().call({from: account});
  var idStudent = await document.getElementById('student').value - 1;
  console.log(idStudent)
  if (idStudent >= await contractMath.methods.getStudentsCount().call()){
    document.getElementById('error-message-student').innerHTML = "Exam is not available.";
  } else {
    student = await contractMath.methods.getStudentByIndex(idStudent).call();
    console.log(student.studentAddress);
    document.getElementById("studentAdd").innerHTML = student.studentAddress;
    document.getElementById("ipfsURI").href = student.ipfsURI;
  }
}

// Function that indicates that the exam was completely formed by the professors.
async function examDone(){
    const result = await contractMath.methods.examDone().call({from: account})
    await contractMath.methods.examDone().send({from: account})
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

    res = await contractMath.methods.addQuestion(question).call({from: account})
    await contractMath.methods.addQuestion(question).send({from: account})
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
  const result = await contractMath.methods.deleteQuestion(questionDel).call({from: account});
  await contractMath.methods.deleteQuestion(questionDel).send({from: account});
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
