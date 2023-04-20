// SPDX-License-Identifier: MIT.
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

// The smartExamInterface specfy functions that all the exams that we have
// to develop need to implement
interface SmartExamInterface {
    function addProfessor(address profAdd) external returns (uint);
    function deleteQuestion (uint index) external returns (uint);
    function getProfessorsCount() external view returns (uint);
    function examDone() external returns (uint);
    function getQuestionsCount() external view returns (uint);
    function checkScore() external view returns (int);
}

// One of the previous functions are specify in smartExam contract. This is the
// Contract where all the other ones inherit from.
abstract contract SmartExam is Ownable, SmartExamInterface{

    // Array of the professors' address added by the owner
    address[] professors;

    // Variable that indicates if the professor finished of formed the exam.
    bool examAvailable = false;
    
    // Date that indicates the last update made by the professor.
    uint256 lastUpdate;

    // Function that let the owner add professors' address.
    function addProfessor (address profAdd) external onlyOwner returns (uint){
        if (checkProfessor(profAdd)){
            return 1;
        }
        professors.push(profAdd);
        return 0;
    }

    // Function that let the owner delete a professor by his position in professors[]
    function deleteProfessor (address profAdd) external onlyOwner returns (uint){
        if (checkProfessor(profAdd)){
            uint index = 0;
            for(uint i = 0; i < professors.length; i++){
                if (profAdd == professors[i]){
                    index = i;
                    break;
                }
            }
            professors[index] = professors[professors.length - 1];
            professors.pop();
            return 0;
        }            
        return 1;
    }

    // Getter of the number of professors.
    function getProfessorsCount() external view returns (uint256) {
        return professors.length;
    }

    // Getter of the info of a professor by his position in professors[]
    function getProfessorByIndex(uint index) external view returns (address){
        return professors[index];
    }

    // Getter of the last update date.
    function getLastUpdate() external view returns (uint) {
        return lastUpdate;
    }

    // Getter of the avaiability of the exam.
    function getExamAvailability() external view returns (bool){
        return examAvailable;
    }

    // Function that let a professor say that the exam is able to be done by the students.
    function examDone() external returns (uint){
        if(checkProfessor(msg.sender) && !(examAvailable)){
            examAvailable = true;
            return 0;
        }
        if (examAvailable){
            return 1;
        }
        return 2;
    }

    // Function that check if a professor exists in professors[]
    function checkProfessor(address profAdd) internal view returns (bool) {
        bool profExists = false;
        for (uint i = 0; i<professors.length; i++){
            if(profAdd == professors[i]){
                profExists = true;
                break;
            }
        }
        return profExists;
    }
}
