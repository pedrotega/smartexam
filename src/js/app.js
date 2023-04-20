// Function to go to the corresponding owner's page
function goOwner(windowName) {
  if (windowName === "drive") {
      window.Location.href = "owner_drive.html";
  } else if (windowName === "history"){
      window.Location.href = "owner_history.html";
  } else if (windowName === "math"){
      window.Location.href = "owner_history.html";
  }
}

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");
const addressInput = document.getElementById("user_address");

// Function that connect the web with the metamask wallet.
(async () => {
  if(window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      window.web3 = new Web3(window.ethereum);
  
      var accounts = await web3.eth.getAccounts();
      account = accounts[0]
      addressInput.value = account
  }
  })();

// Function that check the password of the user and then go to the correponding page.
form.addEventListener("submit", async function(event) {
  event.preventDefault();
  const user_address = form.user_address.value;
  const user_password = CryptoJS.SHA256(form.password.value).toString();
  const owner_address = await contractDrive.methods.owner().call()
  let owner_password;
  let user_real_password;
  let userExists = false; 

  await fetch('src/users.json')
  .then(response => response.json())
  .then(data => {
    let owner = data.find(obj => obj.address === owner_address);
    if (owner) {
      owner_password = owner.password;
    } else {
      console.error('Owner not found.');
    }

    let user = data.find(obj => obj.address === user_address);
    if (user) {
      userExists = true;
      user_real_password = user.password;
    } else {
      console.error('User does not exists.')
    }
  })
  .catch(error => console.error(error));

  if (userExists){
    if(user_password === user_real_password){
      if (user_address === owner_address && user_password === owner_password) {
        window.location.href = "owner_drive.html";
      } else {
        console.log('User is not owner.');
        if (await checkProfessor(user_address)){
          window.location.href = "professor_drive.html"
        } else {
          console.log("User is not a professor.");
          window.location.href = "student_drive.html"
        }  
      }
    } else {
      errorMessage.textContent = "Incorrect password.";
    }    
  } else {
    errorMessage.textContent = "User does not exists.";
  }  
});

const passInput = document.getElementById("password");

passInput.addEventListener("input", function() {
  if (passInput.checkValidity()) {
    errorMessage.textContent = "";
  }
});

