// Function that creates the html to show the exam's questions.
async function showQuestions() {

  const outputDiv = document.getElementById("questions");
  n_questions = await contractDrive.methods.getQuestionsCount().call({from: account})
  let outputString = "";

  for (let i = 0; i<n_questions; i++){
    let x = await contractDrive.methods.getQuestionByIndex(i).call({from: account})
    outputString += "<div class='question'><h2> " + (i+1) + " - " + x.statement + "</h2>"
                        + "<ul>"
                        + "<li>" + x.op1 +"</li>"
                        + "<li>" + x.op2 +"</li>"
                        + "<li>" + x.op3 +"</li>"
                        + "<li> (Answer " + x.ans +")</li>"
                        + "</ul>"
                        + "</div>";
  }

  if (!(await contractDrive.methods.getExamAvailability().call())) {
    console.log("hola")
    outputString += '<button class="correctButton" onclick="examDone()">Finish exam</button>'   
  }    

  outputDiv.innerHTML = outputString;
}

// Function that indicates that the exam was completely formed by the professors.
async function examDone(){
    const result = await contractDrive.methods.examDone().call({from: account})
    await contractDrive.methods.examDone().send({from: account})

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
    const op1 = form.op1.value;
    console.log(op1)
    const op2 = form.op2.value;
    console.log(op2)

    const op3 = form.op3.value;
    console.log(op3)

    const ans = parseInt(form.ans.value);
    console.log(ans)

    res = await contractDrive.methods.addQuestion(question, op1, op2, op3, ans).call({from: account})
    await contractDrive.methods.addQuestion(question, op1, op2, op3, ans).send({from: account})
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
  const result = await contractDrive.methods.deleteQuestion(questionDel).call({from: account});
  await contractDrive.methods.deleteQuestion(questionDel).send({from: account});
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

