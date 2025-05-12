import { useState } from 'react';
import '../styles/voterValidation.scss';  // Import the CSS file
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { faceState, voterState } from '../store/store.js';
import FaceVerification from '../components/FaceVerification.jsx';
import { useVotingSystem } from "../hooks/useVotingSystem";


function VoterValidation() {
  const { getVoterById } = useVotingSystem()
  const navigateTo = useNavigate();
  const [voter_ID, setVoter_ID] = useState('');
  const [voter_DOB, setVoter_DOB] = useState('');
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);


  const { setVoterID, setIsVoted } = voterState();
  const { isFaceMatch, setFaceMatch } = faceState();

  //Handle face verification
  const faceVerificationHandler = async (e) => {
    e.preventDefault();
    if (!voter_DOB && !voter_ID) {
      toast.error("Please provide Voter ID ")
      return;
    }
    setShowVerification(true)
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (voter_DOB && voter_ID) {
      try {
        const response = await axios.post('http://localhost:4000/voter/voter-validation', {
          voter_ID,
          voter_DOB
        }, {
          withCredentials: true,  // Include credentials (cookies, HTTP auth)
        });
        setVoterID(voter_ID)

        //call getcandidate details through backend
        const response2 = await axios.get(`http://localhost:4000/v1/admin/get_voter_details/${voter_ID}`, {
          withCredentials: true,  // Include credentials (cookies, HTTP auth)
        })
        // console.log(response2.data)

        if (response2.data.voter.hasVoted === true) {
          toast.error("Already voted")
          setVoter_ID("")
          setVoter_DOB("")
          setFaceMatch(false)

        }
        else {
          setFaceMatch(false)
          toast.success("cast your vote")
          navigateTo("/voting-booth")

        }
      } catch (error) {
        if (error.response.data.error) {
          toast.error(error.response.data.error)
        }
      }
    }

  }



  return (
    <div className="voter-validation-container">
      <h2>Voter Validation</h2>
      <div className="voter-form">
        <div className="form-group">
          <label htmlFor="voterId">Voter ID:</label>
          <input
            type="text"
            id="voterId"
            value={voter_ID}
            onChange={(e) => setVoter_ID(e.target.value)}
            className="input-field"
            placeholder="Enter Voter ID"
          />
        </div>
        <div className="form-group">
          <label htmlFor="dob">Date of Birth:</label>
          <input
            type="date"
            id="dob"
            value={voter_DOB}
            onChange={(e) => setVoter_DOB(e.target.value)}
            className="input-field"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="face_area">
          {
            !isFaceMatch ? (

              <button className="face_v_button" onClick={faceVerificationHandler}>
                Open Face Verification
              </button>

            ) : (
              <div className="face_retake_area">
                <div className="face_status_text">
                  <p>Verified✅</p>
                </div>
                <button className="face_retake_button" onClick={() => {
                  setFaceMatch(false);
                  setShowVerification(true);
                }}>
                  Retake
                </button>
              </div>
            )
          }

          <FaceVerification
            show={showVerification}
            voter_ID={voter_ID}
            onClose={() => setShowVerification(false)}
            onSuccess={() => setShowVerification(false)}
          />
        </div>

        {/* <button type="submit" onClick={() => (handleSubmit)} className="submit-button">Validate</button> */}
        <button
          type="submit"
          onClick={handleSubmit}
          className={!isFaceMatch ? "unsubmit-button" : "submit-button"}
        >Validate</button>
      </div>
    </div>
  );
}

export default VoterValidation;
