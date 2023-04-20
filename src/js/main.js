function openWindow(windowName) {
    var i, windows, links;
    windows = document.getElementsByClassName("window");
    for (i = 0; i < windows.length; i++) {
      windows[i].classList.remove("active");
    }
    links = document.getElementsByTagName("a");
    for (i = 0; i < links.length; i++) {
      links[i].classList.remove("active");
    }
    document.getElementById(windowName).classList.add("active");
    event.currentTarget.classList.add("active");
  }

// Function that check if the professor exists.
async function checkProfessor(profAdd) {
    n_professors = await contractDrive.methods.getProfessorsCount().call()
    profExists = false;
    for (let i = 0; i<n_professors; i++){
        if (profAdd === await contractDrive.methods.getProfessorByIndex(i).call()){
            profExists = true;
            break;
        }
    }

    return profExists
}

// Function that let you return to the login webpage.
function goLogin(){
    window.location.href = "index.html";
}

var account = null;

var contractDrive = null;
var abiDataDrive = null;
var addressDataDrive = null;

var contractHistory = null;
var abiDataHistory = null;
var addressDataHistory = null;

var contractMath = null;
var abiDataMath = null;
var addressDataMath = null;

// Get information of drive test smart-contract.
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        const parsedData = JSON.parse(this.responseText);
        abiDataDrive = parsedData.abi;
        addressDataDrive = parsedData.networks['5777'].address;
    }
};

xhr.open('GET', '../../build/contracts/smartDriveTest.json', true);
xhr.send();

// Get information of history exam smart-contract.
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        const parsedData = JSON.parse(this.responseText);
        abiDataHistory = parsedData.abi;
        addressDataHistory = parsedData.networks['5777'].address;
    }
};

xhr.open('GET', '../../build/contracts/smartHistoryExam.json', true);
xhr.send();

// Get information of math exam smart-contract.
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        const parsedData = JSON.parse(this.responseText);
        abiDataMath = parsedData.abi;
        addressDataMath = parsedData.networks['5777'].address;
    }
};

xhr.open('GET', '../../build/contracts/smartMathExam.json', true);
xhr.send();
 
// Initialize the smart-contracts
(async () => {
if(window.ethereum) {
    await window.ethereum.send('eth_requestAccounts');
    window.web3 = new Web3(window.ethereum);

    var accounts = await web3.eth.getAccounts();
    account = accounts[0]

    contractDrive = new web3.eth.Contract(abiDataDrive, addressDataDrive);
    contractHistory = new web3.eth.Contract(abiDataHistory, addressDataHistory);
    contractMath = new web3.eth.Contract(abiDataMath, addressDataMath);
}
})();
