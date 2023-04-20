// Function that create the html to show the professors.
async function showProfessors() {

  const outputDiv = document.getElementById("professors");

  n_professors = await contractHistory.methods.getProfessorsCount().call()
  let outputString = "";

  for (let i = 0; i<n_professors; i++){
    outputString += "<p>" + await contractHistory.methods.getProfessorByIndex(i).call() + "</p>";
  }
  
  outputDiv.innerHTML = outputString;
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
        const result = await contractHistory.methods.addProfessor(profAdd).call({from: account});
        await contractHistory.methods.addProfessor(profAdd).send({from: account});
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
  const result = await contractHistory.methods.deleteProfessor(profAdd).call({from: account});
  await contractHistory.methods.deleteProfessor(profAdd).send({from: account});
  if(result == 1){
      errorMessageDelete.textContent = "Address does not exists.";
  }
  })

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