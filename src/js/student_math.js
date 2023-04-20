// Function that creates the html to show the exam's questions.
async function showQuestions() {
    
  const outputQue = document.getElementById("questions");
  n_questions = await contractMath.methods.getQuestionsCount().call({from: account})
  maxScore = await contractMath.methods.getMaxScore().call()
  let outputString = "";
  console.log(account)
  const studentExists = await contractMath.methods.checkStudent(account).call();
  const examAvailable = await contractMath.methods.getExamAvailability().call()
  if(!examAvailable){
    outputString += "<h2>Exam is not available.</h2>";
  } else if (studentExists){
      student = await contractMath.methods.getStudent(account).call();
      if (student.score > 0){
          outputString += "<h2>Student with address " +account+ " has already done the exam.</h2>"+
          '<form id="assess-student-form">'+
              '<h1>Assess Student - Address:</h1>'+
              '<p id="studentAdd">'+account+'</p>'+  
              '<a href='+student.ipfsURI+' id="ipfsURI">Metadata exam</a>'  
          for(let i = 0; i < n_questions; i++){
              let x = await contractMath.methods.getQuestionByIndex(i).call({from: account})
              let z = await contractMath.methods.getCorrectionNotes(account).call()
              outputString += '<h3>'+x+'</h3>'+
                              '<p class="answer" id="note'+i+'">Note: '+z[i]+'</p>'+                            
                              '<br>'
          }
          outputString += '</form>'
          outputString += "<h3>Score: "+student.score+"/"+maxScore+"</h3>"
      } else {
          outputString += "<h2>Student with address " +account+ " has already done the exam.</h2>";
          outputString += "<h3>Exam is waiting to be assessed</h3>"
      }
      
  }else {
    outputString += "<form id='form-exam' onsubmit='submitsmartExam(event)'>"
    for (let i = 0; i<n_questions; i++){
      let x = await contractMath.methods.getQuestionByIndex(i).call({from: account})
      outputString += "<h3> Question " + (i+1) + ":</h3>"
                        + "<p>(Q"+(i+1)+"): " + x + "</p>"
    }
    outputString += '<label for="ipfsURI">Metadata IPFS URI:</label>'+
                  '<input type="text" id="ipfsURI" name="ipfsURI" required>'
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
  console.log(document.querySelector('input[name="ipfsURI"]').value);
  let ipfsURI = document.querySelector('input[name="ipfsURI"]').value;

  const result = await contractMath.methods.doExam(ipfsURI).call({from: account})
  await contractMath.methods.doExam(ipfsURI).send({from: account});
  
  if(result == 1){
    document.getElementById('error-message').innerHTML = "Exam is not available.";
  } else if (result == 2){
    document.getElementById('error-message').innerHTML = "Student already did the exam.";
  } else{
    location.reload();
  }
}
