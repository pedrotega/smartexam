// Function that creates the html to show the exam's questions.
async function showQuestions() {

  const outputQue = document.getElementById("questions");
  n_questions = await contractDrive.methods.getQuestionsCount().call({from: account})
  let outputString = "";
  const score = await contractDrive.methods.checkScore().call({from: account});
  const examAvailable = await contractDrive.methods.getExamAvailability().call()
  if(!examAvailable){
    outputString += "<h2>Exam is not available.</h2>";
  } else if (score > 0){
    outputString += "<h2>Student with address " +account+ " has already done the exam.</h2>";
    outputString += "<h3>Score: "+score+"/"+n_questions+"</h3>"
  } else {
    outputString += "<form id='form-exam' onsubmit='submitSmartExam(event)'>"
    for (let i = 0; i<n_questions; i++){
      let x = await contractDrive.methods.getQuestionByIndex(i).call({from: account})
      outputString += "<h3> Question " + (i+1) + ":</h3>"
                        + "<p>(Q"+(i+1)+"): " + x.statement + "</p>"
                        + "<label>"
                        +      "<input type='radio' name='q"+ (i) + "' value=1 required>"
                        +      "a) " + x.op1
                        +  "</label><br>"
                        + "<label>"
                        +      "<input type='radio' name='q"+ (i) + "' value=2 required>"
                        +      "b) " + x.op2
                        +  "</label><br>"
                        +  "<label>"
                        +      "<input type='radio' name='q"+ (i) + "' value=3 required>"
                        +      "c) " + x.op3
                        +  "</label><br>";
    }
    outputString += "<input type='submit' value='Submit'>"
    outputString += "<div id='error-message'></div>"
    outputString += "</form>"
  }  
  
  outputQue.innerHTML = outputString;
}
  
const errorMessage = document.getElementById("error-message");

// Function for students to submit their answers.
async function submitSmartExam(event){
  event.preventDefault();
  n_questions = await contractDrive.methods.getQuestionsCount().call({from: account});
  var answers = [];
  for(let i = 0; i < n_questions; i++){
      answers.push(parseInt(document.querySelector('input[name="q'+(i)+'"]:checked').value));
  }

  const result = await contractDrive.methods.doExam(answers).call({from: account})
  await contractDrive.methods.doExam(answers).send({from: account});
  
  if(result == 1){
    document.getElementById('error-message').innerHTML = "Exam is not available.";
  } else if (result == 2){
    document.getElementById('error-message').innerHTML = "Student already did the exam.";
  } else{
    location.reload();
  }
}
