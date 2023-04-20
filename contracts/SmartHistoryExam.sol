// SPDX-License-Identifier: MIT.
pragma solidity 0.8.19;

import "./SmartExam.sol";
import "./SmartWrittenExam.sol";

contract SmartHistoryExam is SmartExam, SmartWrittenExam{

    /*
     The test exams are formed by:
     - The address of the student.
     - The answers of the questions.
     - The correction notes (Added by a professor).
     - The score of the exam (Added by a professor).
     - The date when the exam was submited.
     - The date when the exam was assessed.
     */
    struct StudentExam {
        address studentAddress;
        string[] answers;
        string[] correctionNotes;
        int score;
        uint256 dateCommit;
        uint256 dateAssess;
    }

    // Array with all the information of the submissions.
    StudentExam[] studentExams;

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

    // Funtion to obtain the info of a student's exam by its address.
    function getStudent(address studentAdd) public view returns (StudentExam memory) {
        uint index = 0;
        for (uint i = 0; i<studentExams.length; i++){
            if(studentAdd == studentExams[i].studentAddress){
                index = i;
                break;
            }
        }
        return studentExams[index];
    }

    // Funtion to obtain the number of submited exams.
    function getStudentsCount() external view returns (uint) {
        return studentExams.length;
    }

    // Function to obtain the info of a student's exam by its index on studentExams.
    function getStudentByIndex(uint index) public view returns (StudentExam memory){
        return studentExams[index];
    }

    // Function to sum the scores in all of the questions.
    function computeScore(int[] memory _scores, string[] memory notes, address studentAdd) external returns (int) {
        int score = 0;
        if(!checkProfessor(msg.sender)){
            return -1;
        } else if (!checkStudent(studentAdd)){
            return -2;
        }
        
        for(uint i = 0; i < _scores.length; i++){
            score += _scores[i];
        }

        for(uint i = 0; i < studentExams.length; i++) {
            if(studentAdd == studentExams[i].studentAddress){
                studentExams[i].score = score;
                studentExams[i].correctionNotes = notes;
                studentExams[i].dateAssess = block.timestamp;
            }
        }

        return score;
    }

    // Function that let students to submit his questions. 
    function doExam(string[] calldata _answers) public returns (uint) {
        if ((!checkStudent(msg.sender)) && examAvailable){
            studentExams.push(StudentExam({
                studentAddress: msg.sender,
                answers: _answers,
                correctionNotes: new string[](0),
                score: -10,
                dateCommit: block.timestamp,
                dateAssess: block.timestamp
            }));
            return 0;
        }
        if(!(examAvailable)){
            return 1; 
        }
        return 2;// The student already did the exam.
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
        return -1;
    }

    // Function that returns the answers of a student's exam.
    function getAnswers(address _studentAdd) external view returns (string[] memory){
        if(checkStudent(_studentAdd)){
            for (uint i = 0; i < studentExams.length; i++){
                if (_studentAdd == studentExams[i].studentAddress){
                    return studentExams[i].answers;
                }
            }   
        }
        string[] memory error = new string[](1);
        error[0] = 'error';
        return error;
    }

    // Function that returns the correction notes of a student exams.
    function getCorrectionNotes(address _studentAdd) external view returns (string[] memory){
        if(checkStudent(_studentAdd)){
            for (uint i = 0; i < studentExams.length; i++){
                if (_studentAdd == studentExams[i].studentAddress){
                    return studentExams[i].correctionNotes;
                }
            }   
        }
        string[] memory error = new string[](1);
        error[0] = 'error';
        return error;
    }

}
