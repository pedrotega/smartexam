// SPDX-License-Identifier: MIT.
pragma solidity 0.8.19;

import "./SmartExam.sol";

abstract contract SmartWrittenExam is SmartExam{

    // Array with all the exam's questions.
    string[] questions;

    // Constant that indicates the maximun score that can be reach in the exam.
    uint constant maxScore = 100;

    // Funtion to add a question to questions[].
    function addQuestion (string calldata _statement) external returns (uint){
        if(checkProfessor(msg.sender)){
            questions.push(_statement);
            lastUpdate = block.timestamp;
            return 0;
        }
        return 1;
    }

    // Function to delete a question from questions[].
    function deleteQuestion (uint index) external returns (uint){
        if(!examAvailable){
            if(checkProfessor(msg.sender) && (index < questions.length)){
                questions[index] = questions[questions.length - 1];
                questions.pop();
                lastUpdate = block.timestamp;
                return 0;
            }
            if(!checkProfessor(msg.sender)){
                return 1; // Only professors can change exams.
            }
            return 2; // Question does not exists.
        } else {
            return 3;//The exam cannot be modified.
        }
    }

    // Getter of the number of questions.
    function getQuestionsCount() external view returns (uint) {
        if((checkProfessor(msg.sender))){
            return questions.length;
        } else if (examAvailable){
            return questions.length;
        }
        return 0;
    }

    // Getter of a question by its index on questions[].
    function getQuestionByIndex(uint index) external view returns (string memory){
        if(checkProfessor(msg.sender)){
            return questions[index];
        } else if (examAvailable){
            return questions[index];
        }
        string memory error;
        return error;
    }
    
    // Getter of the maximun possible score.
    function getMaxScore() external pure returns (uint) {
        return maxScore;
    }
}