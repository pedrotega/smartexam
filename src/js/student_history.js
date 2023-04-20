// Function that creates the html to show the exam's questions.
async function showQuestions() {
    
  const outputQue = document.getElementById("questions");
  n_questions = await contractHistory.methods.getQuestionsCount().call({from: account})
  maxScore = await contractHistory.methods.getMaxScore().call()
  let outputString = "";
  console.log(account)
  const score = await contractHistory.methods.checkScore().call({from: account});
  console.log(score)
  const examAvailable = await contractHistory.methods.getExamAvailability().call()
  if(!examAvailable){
    outputString += "<h2>Exam is not available.</h2>";
  } else if (score > 0){
      outputString += "<h2>Student with address " +account+ " has already done the exam.</h2>"+
      '<form id="assess-student-form">'+
          '<h1>Assess Student - Address:</h1>'+
          '<p id="studentAdd">'+account+'</p>'
        for(let i = 0; i < n_questions; i++){
          let x = await contractHistory.methods.getQuestionByIndex(i).call({from: account})
          let y = await contractHistory.methods.getAnswers(account).call()
          let z = await contractHistory.methods.getCorrectionNotes(account).call()
          outputString += '<h3>(Q'+ (i+1) +'): '+x+'</h3>'+
                          '<p class="answer" id="ans'+i+'">'+y[i]+'</p>'+
                          '<p class="answer" id="note'+i+'">Note: '+z[i]+'</p>'+                            
                          '<br>'
        }
        outputString += '</form>'
      outputString += "<h3>Score: "+score+"/"+maxScore+"</h3>"
  } else if (score == -10){
      outputString += "<h2>Student with address " +account+ " has already done the exam.</h2>";
      outputString += "<h3>Exam is waiting to be assessed</h3>"
  }else {
    outputString += "<form id='form-exam' onsubmit='submitsmartExam(event)'>"
    for (let i = 0; i<n_questions; i++){
      let x = await contractHistory.methods.getQuestionByIndex(i).call({from: account})
      outputString += "<h3> Question " + (i+1) + ":</h3>"
                        + "<p>" + x + "</p>"
                        + "<label>"
                        +      "<input type='text' name='q"+ (i) + "' value='' >"
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
async function submitsmartExam(event){
  event.preventDefault();
  n_questions = await contractHistory.methods.getQuestionsCount().call({from: account});
  var answers = [];
  for(let i = 0; i < n_questions; i++){
      console.log(document.querySelector('input[name="q'+(i)+'"]').value);
      answers.push(document.querySelector('input[name="q'+(i)+'"]').value);
  }

  const result = await contractHistory.methods.doExam(answers).call({from: account})
  await contractHistory.methods.doExam(answers).send({from: account});
  
  if(result == 1){
    document.getElementById('error-message').innerHTML = "Exam is not available.";
  } else if (result == 2){
    document.getElementById('error-message').innerHTML = "Student already did the exam.";
  } else{
    location.reload();
  }
}
