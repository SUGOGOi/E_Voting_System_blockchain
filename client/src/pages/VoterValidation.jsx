import { useState } from 'react';
import '../styles/voterValidation.scss';  // Import the CSS file
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { voterState } from '../store/store.js';

function VoterValidation() {
  const navigateTo = useNavigate();
  const [voter_ID, setVoter_ID] = useState('');
  const [voter_DOB, setVoter_DOB] = useState('');
  const [error, setError] = useState('');

  const { setVoterID, setIsVoted } = voterState();

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (voter_DOB && voter_ID) {
      try {
        const response = await axios.post('http://localhost:5000/voter/voter-validation', {
          voter_ID,
          voter_DOB
        }, {
          withCredentials: true,  // Include credentials (cookies, HTTP auth)
        });
        setVoterID(voter_ID)


        //call getcandidate details through backend
        const response2 = await axios.get(`http://localhost:5000/v1/admin/get_voter_details/${voter_ID}`, {
          withCredentials: true,  // Include credentials (cookies, HTTP auth)
        })

        if (response2.data.isVoted === true) {
          toast.error("Already voted")
          setVoter_ID("")
          setVoter_DOB("")

        }
        else {
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
      <form onSubmit={handleSubmit} className="voter-form">
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
        <button type="submit" className="submit-button">Validate</button>
      </form>
    </div>
  );
}

export default VoterValidation;
