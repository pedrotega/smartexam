// Function that create the html to show the professors.
async function showProfessors() {

  const outputDiv = document.getElementById("professors");

  n_professors = await contractMath.methods.getProfessorsCount().call();
  let outputString = "";

  for (let i = 0; i<n_professors; i++){
    outputString += "<p>" + await contractMath.methods.getProfessorByIndex(i).call() + "</p>";
  }
  
  outputDiv.innerHTML = outputString;
}

// Function to show the exams to mint for the owner.
async function showExamsToMint(){
  const outputDiv = document.getElementById("exams2mint");
  let outputString = "";
  n_students = await contractMath.methods.getStudentsCount().call();
  console.log(n_students)
  for(let i = 0; i < n_students; i++){
    let x = await contractMath.methods.getStudentByIndex(i).call();
    if(!(x.checkExam)){
      outputString += '<br>'
      outputString += '<button class="mintButton" onclick="mintSmartExam('+i+')">Mint '+x.studentAddress+'</button>'
      outputString += '<br>'  
    }
  }
  if(outputString.length == 0){
    outputString += "<h2>No exams to mint</h2>"
  } 
  outputDiv.innerHTML = outputString;
}

// Function to mint the smart-contracts.
async function mintSmartExam(index){
  student = await contractMath.methods.getStudentByIndex(index).call();
  console.log(student.studentAddress)
  await contractMath.methods.mint(student.studentAddress, student.ipfsURI).send({from: account})
    .on('transactionHash', function(hash){
      console.log('Transaction hash:', hash);
    })
    .on('receipt', function(receipt){
      console.log('Receipt:', receipt);
    })
    .on('error', function(error){
      console.error('Error:', error);
    });
}
    
const form = document.getElementById("add-professor-form");
const formDelete = document.getElementById("delete-professor-form");
const errorMessage = document.getElementById("error-message");
const errorMessageDelete = document.getElementById("error-message-delete");
const addProfInput = document.getElementById("addProf");
const delProfInput = document.getElementById("delProf");

// Funtion to add a professor on form submission.
form.addEventListener("submit", async function(event) {
event.preventDefault();

  const profAdd = form.addProf.value;

  let profExists = false;
  await fetch('src/users.json')
    .then(response => response.json())
    .then(data => {
        let usr = data.find(obj => obj.address === profAdd);
        if (usr) {
        profExists = true
        } else {
        errorMessage.textContent = "User not found.";
        }
    })
    .catch(error => console.error(error));

    if (profExists) {
        const result = await contractMath.methods.addProfessor(profAdd).call({from: account});
        await contractMath.methods.addProfessor(profAdd).send({from: account});
        if (result == 1) {
        errorMessage.textContent = "Address was already added.";
        } 
    } else {
        errorMessage.textContent = "Address does not exists.";
    }
});

// Function to delete a profesor on the formDelete submision.
formDelete.addEventListener("submit", async function(event) {
  event.preventDefault();
  const profAdd = formDelete.delProf.value;
  const result = await contractMath.methods.deleteProfessor(profAdd).call({from: account});
  await contractMath.methods.deleteProfessor(profAdd).send({from: account});
  if(result == 1){
      errorMessageDelete.textContent = "Address does not exists.";
  }
});

addProfInput.addEventListener("input", function() {
  if (addProfInput.checkValidity()) {
      errorMessage.textContent = "";
  }
});

delProfInput.addEventListener("input", function() {
  if (delProfInput.checkValidity()) {
      errorMessageDelete.textContent = "";
  }
});