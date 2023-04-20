// SPDX-License-Identifier: MIT.
pragma solidity 0.8.19;

import "./SmartExam.sol";

contract SmartDriveTest is SmartExam{

    // The questions in the test exam have one statement, three options and only one correct answer
    struct Question {
        string statement;
        string op1;
        string op2;
        string op3;
        uint16 ans;
    }

    /*
     The test exams are formed by:
     - The address of the student.
     - The answers of the questions.
     - The score of the exam.
     - The date when the exam was submited.
     */
    struct StudentExam {
        address studentAddress;
        uint[] answers;
        int score;
        uint256 dateCommit;
    }

    // Array with all the exam's questions.
    Question[] questions;
    // Array with all the information of the submissions.
    StudentExam[] public studentExams;

    // Function that check if a student submited a test.
    function checkStudent(address studentAdd) internal view returns (bool) {
        bool studentExists = false;
        for (uint i = 0; i<studentExams.length; i++){
            if(studentAdd == studentExams[i].studentAddress){
                studentExists = true;
                break;
            }
        }
        return studentExists;
    }

    // Funtion to add a question to questions[].
    function addQuestion (string calldata _statement, string calldata _op1, string calldata _op2, string calldata _op3, uint16 _ans) external returns (uint){
        if(!examAvailable){
            if(checkProfessor(msg.sender)){
                questions.push(Question({
                    statement: _statement,
                    op1: _op1,
                    op2: _op2,
                    op3: _op3,
                    ans: _ans
                }));
                lastUpdate = block.timestamp;
                return 0;
            }
        } else {
            return 2;//The exam cannot be modified.
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
                return 1;// Only professors can change exams.
            }
            return 2;// Question does not exists.
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
    function getQuestionByIndex(uint index) external view returns (Question memory){
        if((checkProfessor(msg.sender))){
            return questions[index];
        } else if (examAvailable){
            return questions[index];
        }
        Question memory error;
        return error;
    }

    // Function to sum the scores in all of the questions.
    function computeScore(uint[] calldata _answers) internal view returns (int) {
        int score = 0;
        for (uint i = 0; i < questions.length; i++) {
            if (questions[i].ans == _answers[i]){
                score++;
            }
        }
        return score;
    }

    // Function that let students to submit his questions. It automatically compute the score
    function doExam(uint[] calldata _answers) public returns (uint) {
        if ((!checkStudent(msg.sender)) && examAvailable){
            studentExams.push(StudentExam({
                studentAddress: msg.sender,
                answers: _answers,
                score: computeScore(_answers),
                dateCommit: block.timestamp
            }));
            return 0;
        }
        if(!(examAvailable)){
            return 1;
        }
        return 2;
    }

    // Funtion to get the score of a student.
    function checkScore() external view returns (int) {
        if(checkStudent(msg.sender)){
            for (uint i = 0; i < studentExams.length; i++){
                if(msg.sender == studentExams[i].studentAddress){
                    return studentExams[i].score;
                }
            }
        }
        return -1;// Student does not submit the test.
    }

}
