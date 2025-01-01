import React, { useState, useEffect } from "react";
import "../styles/adminDashboard.css";
import { toast } from "react-hot-toast"
import axios from "axios"
import ABI from "../../ABI.json"
import { ethers } from 'ethers';
import { io } from 'socket.io-client';



const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [timer, setTimer] = useState("");
  const [activeSection, setActiveSection] = useState("addCandidate");
  const [votingResults, setVotingResult] = useState([])
  const contractAddress = "0x86a6000e5129c7cc363dbb8fc8ea9fa65aef2a00";

  // Add Candidate
  const [candidate_ID, setCandidate_ID] = useState("");
  const [candidate_name, setCandidate_name] = useState("");
  const [party_name, setParty_name] = useState("");
  const [candidate_Photo, setCandidate_Photo] = useState(null);
  const [party_Photo, setParty_Photo] = useState(null);//party_Photo
  const formData = new FormData();
  const formData1 = new FormData();

  const [countdown, setCountdown] = useState(0); // Raw countdown in seconds
  const [isPaused, setIsPaused] = useState(true);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const socket = React.useRef(null);
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')} hr :${String(minutes).padStart(2, '0')} min :${String(seconds).padStart(2, '0')} sec `;
  };



  const handleCandidatePhotoChange = (e) => {
    setCandidate_Photo(e.target.files[0]);
  };
  const handlePartyPhotoChange = (e) => {
    setParty_Photo(e.target.files[0]);
  };


  //<======================================================Add candidate
  const handleAddCandidate = async (e) => {
    if(!window.ethereum){  //======================check for metamask/cryptowallet
      return toast.error("Intall Metamask or any Crypto wallet")
    }

    if (candidate_ID && candidate_name && party_name && candidate_Photo && party_Photo) {

      formData.append("candidate_ID", candidate_ID);
      formData.append("candidate_name", candidate_name);
      formData.append("party_name", party_name);
      formData.append("file1", candidate_Photo);
      formData.append("file2", party_Photo);

      try {
        const response = await axios.post("http://localhost:5000/v1/admin/register_candidate", {
          candidate_ID, candidate_name, party_name, file1: candidate_Photo, file2: party_Photo
        }, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        },)

        //If successful
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress, ABI, signer
        );

        try {
          const tx = await contractInstance.addCandidate(candidate_name, candidate_ID, party_name);
          await tx.wait();
          toast.success("Register successfuly")

        } catch (error) {
          console.log(error)
          toast.error("ERROR!")
        }

      } catch (error) {
        if (error.response.data.error) {
          toast.error(error.response.data.error)
        }

      }
      setCandidate_ID("");
      setCandidate_name("");
      setParty_name("");
      setCandidate_Photo(null);
      setParty_Photo(null);
    } else {
      toast.error("Enter all fields")
    }


  };

  //<=============================================================Add Voter
  const [voter_name, setVoter_name] = useState("");
  const [voter_ID, setVoter_ID] = useState("");
  const [voter_DOB, setVoter_DOB] = useState("");
  const handleAddVoter = async () => {
    if(!window.ethereum){
      return toast.error("Intall Metamask or any Crypto wallet")
    }
    if (voter_DOB && voter_ID && voter_name) {


      formData1.append("voter_name", voter_name);
      formData1.append("voter_ID", voter_ID);
      formData1.append("voter_DOB", voter_DOB);

      try {
        const response = await axios.post("http://localhost:5000/v1/admin/register_voter", {
          voter_name, voter_ID, voter_DOB
        }, {
          withCredentials: true
          // , headers: {
          //   "Content-Type": "multipart/form-data",
          // }
        },)

        //If successful ====> add voter to blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress, ABI, signer
        );

        try {
          const tx = await contractInstance.addVoter(voter_name, voter_ID);
          await tx.wait();
          toast.success("Voter added successfuly")

        } catch (error) {
          console.log(error)
          toast.error("ERROR!")
        }

      } catch (error) {

        console.log(error)
        toast.error("Error adding voter to database")


      }

    } else {
      toast.error("Enter all fields")
    }

  };

  //<========================================COUNTDOWN============================================>
  useEffect(() => {
    // Connect to the backend WebSocket
    socket.current = io('http://localhost:5000');

    // Listen for countdown updates
    socket.current.on('countdown', ({ countdownValue, isPaused }) => {
      setCountdown(countdownValue);
      setIsPaused(isPaused);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleSetCountdown = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    socket.current.emit('setCountdown', totalSeconds);
  };

  const handleStart = () => {
    socket.current.emit('startCountdown');
  };

  const handlePause = () => {
    socket.current.emit('pauseCountdown');
  };

  const handleReset = () => {
    socket.current.emit('resetCountdown');
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };


  //<===========================================FETCH RESULT=======================================>
  const fetchVotingResults = async () => {

    if(!window.ethereum){
      return toast.error("Intall Metamask or any Crypto wallet")
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress, ABI, signer
    );
    const candidatesList = await contractInstance.getAllCandidates();
    const formattedCandidates = candidatesList.map((candidate, index) => {
      return {
        id: Number(candidate.id),
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber()
      }
    });
    console.log(formattedCandidates);
    setVotingResult(formattedCandidates)

  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li
            className={activeSection === "addCandidate" ? "active" : ""}
            onClick={() => setActiveSection("addCandidate")}
          >
            Add Candidate
          </li>
          <li
            className={activeSection === "addVoter" ? "active" : ""}
            onClick={() => setActiveSection("addVoter")}
          >
            Add Voter
          </li>
          <li
            className={activeSection === "setTimer" ? "active" : ""}
            onClick={() => setActiveSection("setTimer")}
          >
            Set Countdown Timer
          </li>
          <li
            className={activeSection === "viewResults" ? "active" : ""}
            onClick={() => setActiveSection("viewResults")}
          >
            View Results
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === "addCandidate" && (
          <div className="section">
            <h2>Add Candidate</h2>
            <input
              type="text"
              placeholder="Candidate ID"
              value={candidate_ID}
              onChange={(e) => setCandidate_ID(e.target.value)}
            />
            <input
              type="text"
              placeholder="Candidate Name"
              value={candidate_name}
              onChange={(e) => setCandidate_name(e.target.value)}
            />
            <input
              type="text"
              placeholder="Party Name"
              value={party_name}
              onChange={(e) => setParty_name(e.target.value)}
            />
            <label className="party_logo"  >Candidate photo</label>
            <input
              type="file"
              placeholder="Candidate Photo"
              accept="image/*"
              onChange={handleCandidatePhotoChange}
            />
            <label className="party_logo"  >Party Logo</label>
            <input
              type="file"
              placeholder="Party Logo"
              accept="image/*"
              onChange={handlePartyPhotoChange}
            />
            <button onClick={handleAddCandidate}>Add Candidate</button>
          </div>
        )}

        {activeSection === "addVoter" && (
          <div className="section">
            <h2>Add Voter</h2>
            <input
              type="text"
              placeholder="Voter Name"
              value={voter_name}
              onChange={(e) => setVoter_name(e.target.value)}
            />
            <input
              type="text"
              placeholder="Voter ID"
              value={voter_ID}
              onChange={(e) => setVoter_ID(e.target.value)}
            />
            <input
              type="date"
              id="dob"
              value={voter_DOB}
              onChange={(e) => setVoter_DOB(e.target.value)}
              className="input-field"
            />
            <button onClick={handleAddVoter}>Add Voter</button>

          </div>
        )}

        {activeSection === "setTimer" && (
          <div className="section">
            <h2>Countdown Timer</h2>
            <h3>{formatTime(countdown)}</h3>
            {countdown === 0 && isPaused ? (
              <div>
                <label>
                  Hours:
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
                    style={{ margin: '0 10px', width:'50px' }}
                  />
                </label>
                <label>
                  Minutes:
                  <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
                    style={{ margin: '0 10px', width:'50px' }}
                  />
                </label>
                <label>
                  Seconds:
                  <input
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(parseInt(e.target.value, 10) || 0)}
                    style={{ margin: '0 10px', width:'50px' }}
                  />
                </label>
                <button onClick={handleSetCountdown}>Set Timer</button>
              </div>
            ) : null}

            <div style={{ marginTop: '20px' }}>
              <button  style={{ margin: '0 10px' }} onClick={handleStart} disabled={countdown === 0 || !isPaused}>
                Start
              </button>
              <button  style={{ margin: '0 10px' }}  onClick={handlePause} disabled={isPaused}>
                Pause
              </button>
              <button   style={{ margin: '0 10px' }} onClick={handleReset}>Reset</button>
            </div>

          </div>
        )}

        {activeSection === "viewResults" && (
          <div className="section">
            <h2>Voting Results</h2>
            <button className="fetch-button" onClick={fetchVotingResults}>
              Fetch Results
            </button>
            {votingResults.length > 0 ? (
              <ul className="results-list">
                {votingResults.map((candidate, index) => (
                  <li key={index}>
                     <strong>ID : {candidate.id} {candidate.name}</strong> : {candidate.voteCount} votes
                  </li>
                ))}
              </ul>
            ) : (
              <p>No results to display. Click "Fetch Results" to load data.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
