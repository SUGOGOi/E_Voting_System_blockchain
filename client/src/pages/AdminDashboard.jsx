import React, { useState, useEffect } from "react";
import "../styles/adminDashboard.scss";
import { toast } from "react-hot-toast"
import axios from "axios"
import { io } from 'socket.io-client';
import FaceRegister from "../components/FaceRegister";
import { faceState, resultState, SERVER_URL } from "../store/store"
import { useVotingSystem } from "../hooks/useVotingSystem";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { initializeState } from "../store/store"
import { useRef } from "react";



function deleteCookie(name) {
  const expires = new Date(Date.now() - 1000).toUTCString(); // 1 second in the past
  document.cookie = `${name}=; expires=${expires}; path=/;`;
}




const AdminDashboard = () => {
  //===========================FOR solana
  const { initialize,
    addCandidate,
    addVoter,

    fetchCandidates,
  } = useVotingSystem();

  const { systemInitialized, setSystemInitialized, programState } = initializeState();
  const { candidateResult } = resultState();
  const candidatePhotoRef = useRef();
  const partyPhotoRef = useRef();






  //==========================For face recognition
  const { faceData, setFaceData } = faceState();
  const clearFaceEncoding = faceState((state) => state.clearFaceData);
  const [showRegister, setShowRegister] = useState(false);

  //============================basic page
  const [activeSection, setActiveSection] = useState("addCandidate");
  // const [votingResults, setVotingResult] = useState([])
  // const contractAddress = "0x13f3e68525a2aa5ed8094843f806c45ee117535d";
  const [loading, setLoading] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  console.log(loading)


  // Add Candidate
  const [candidate_ID, setCandidate_ID] = useState("");
  const [candidate_name, setCandidate_name] = useState("");
  const [party_name, setParty_name] = useState("");
  const [candidate_Photo, setCandidate_Photo] = useState("");
  const [party_Photo, setParty_Photo] = useState("");//party_Photo
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
    // console.log(candidate_Photo)
    setCandidate_Photo(e.target.files[0]);
  };
  const handlePartyPhotoChange = (e) => {
    setParty_Photo(e.target.files[0]);
  };



  //<======================================================Add candidate
  const handleAddCandidate = async (e) => {

    e.preventDefault();
    if (!programState) { return toast.error("wallet connection problem") };
    if (!candidate_name || !party_name || !candidate_ID || !candidate_Photo || !party_Photo) { return toast.error("Enter all fields") };

    try {
      setLoading(true);
      await addCandidate(parseInt(candidate_ID), candidate_name, party_name)

      // toast.success("Candidate Registered in Blockchain")
    } catch (error) {
      console.log(error)
      toast.error("ERROR! adding candidate to Blockchain")
    }

    //================================add candidate to db
    formData.append("candidate_ID", candidate_ID);
    formData.append("candidate_name", candidate_name);
    formData.append("party_name", party_name);
    formData.append("file1", candidate_Photo);
    formData.append("file2", party_Photo);
    try {
      const response = await axios.post("http://localhost:4000/v1/admin/register_candidate", {
        candidate_ID, candidate_name, party_name, file1: candidate_Photo, file2: party_Photo
      }, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        }
      },)

      console.log(response)
      toast.success(response.data.message)
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error)
      }
    } finally {
      setLoading(false)
    }

    candidatePhotoRef.current.value = "";
    partyPhotoRef.current.value = "";
    setCandidate_ID("");
    setCandidate_name("");
    setParty_name("");
    setCandidate_Photo(null);
    setParty_Photo(null);

  };

  //<=============================================================Add Voter
  const [voter_name, setVoter_name] = useState("");
  const [voter_ID, setVoter_ID] = useState("");
  const [voter_DOB, setVoter_DOB] = useState("");
  const handleAddVoter = async (e) => {

    e.preventDefault();
    try {
      setLoading(true);
      await addVoter(voter_name, voter_ID, voter_DOB)
      setFaceData(null)
    } catch (error) {
      console.log(error)
      toast.error("ERROR! adding voter to blockchain")
    }


    formData1.append("voter_name", voter_name);
    formData1.append("voter_ID", voter_ID);
    formData1.append("voter_DOB", voter_DOB);
    formData1.append("encoding", faceData)

    try {
      // console.log(faceData)
      const response = await axios.post("http://localhost:4000/v1/admin/register_voter", {
        voter_name, voter_ID, voter_DOB, encoding: faceData
      }, {
        withCredentials: true
      },)

      console.log(response)
      toast.success(response.data.message)
    } catch (error) {

      console.log(error)
      toast.error("Error adding voter to database")
    } finally {
      setVoter_name("")
      setVoter_ID("")
      setVoter_DOB("")
      clearFaceEncoding()
      setLoading(false)
    }

  };


  //==========================================Add agent============================================
  const [agent_ID, setAgent_ID] = useState("")
  const [agent_name, setAgent_name] = useState("")
  const [agent_email, setAgentEmail] = useState("")
  const [agent_password, setAgentPassword] = useState("")
  const [agent_candidate_Id, setAgentCandidateId] = useState("")
  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${SERVER_URL}/v1/add-polling-agent`, {
        agent_ID, agent_name, email: agent_email, password: agent_password, candidate_ID: agent_candidate_Id
      }, {
        withCredentials: true
      })



      if (res.data.success === true) {
        toast.success(res.data.message)
        setAgent_ID("")
        setAgent_name("")
        setAgentEmail("")
        setAgentPassword("")
        setAgentCandidateId("")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.error)
    } finally {
      setAgent_ID("")
      setAgent_name("")
      setAgentEmail("")
      setAgentPassword("")
      setAgentCandidateId("")
    }

  }

  //<========================================COUNTDOWN============================================>
  useEffect(() => {
    // Connect to the backend WebSocket
    socket.current = io('http://localhost:4000');

    // Listen for countdown updates
    socket.current.on('countdown', ({ countdownValue, isPaused }) => {
      setCountdown(countdownValue);
      setIsPaused(isPaused);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);


  //================for solana
  // useEffect(() => {
  //   initialize()
  //   fetchCandidates()
  //   fetchVoters()
  // }, [wallet.connected, connection, wallet])



  const handleSetCountdown = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    socket.current.emit('setCountdown', totalSeconds);
  };

  const handleStart = () => {
    socket.current.emit('startCountdown');
  };

  // const handlePause = () => {
  //   socket.current.emit('pauseCountdown');
  // };

  const handleReset = () => {
    socket.current.emit('resetCountdown');
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };


  //===========================handle initialize


  //<===========================================FETCH RESULT=======================================>
  const fetchVotingResults = async () => {
    await fetchCandidates()


  }


  //<=================================================FETCH transactions=======================================
  const [selectedType, setSelectedType] = useState("all")
  const [transactions, setTransactions] = useState([])
  const fetchTransactions = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.get(`${SERVER_URL}/transaction/${selectedType}`, {
        withCredentials: true
      })


      if (res.data.success === true) {
        setTransactions(res.data.transactions)
        toast.success(`${selectedType} Transactions fetched!`)
      }
    } catch (error) {
      console.log(error)
    }
  }


  //==========================================COPY TRANSACTION HASH ============================================
  const copyTansactionHash = (txHash) => {
    navigator.clipboard.writeText(txHash)
    toast.success("copied!")
  }


  //=================================================LOG OUT=============================================
  const logoutHandler = async (e) => {

    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/v1/logout", {
        withCredentials: true
      })

      if (response.data.success === true) {
        setSystemInitialized(false);
        toast.success(response.data.message)
        // navigateTo("/a-login")
        window.location.href = '/a-login';
      }
    } catch (error) {
      console.log(error)
      if (error.response.data.error) {
        toast.error(error.response.data.error)
      }
    }


    deleteCookie("token")
  }

  return (
    <div className="full_body">

      <div className="admin-dashboard">

        {/* Sidebar */}
        <div className="sidebar">
          <div>
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
                className={activeSection === "addAgent" ? "active" : ""}
                onClick={() => setActiveSection("addAgent")}
              >
                Add Agent
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
              <li
                className={activeSection === "viewTransactionHistory" ? "active" : ""}
                onClick={() => setActiveSection("viewTransactionHistory")}
              >
                Transaction History
              </li>

            </ul>
          </div>
          <div className="imp_btns">
            {/* <button>Delete all candidates</button>
          <button>Delete all voters</button> */}
            <button onClick={logoutHandler} className="logout_btn">Logout</button>
          </div>
        </div>

        {/* Main Content */}
        {systemInitialized ? (<div className="main-content">
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
                // value={candidate_Photo}
                ref={candidatePhotoRef}
                onChange={handleCandidatePhotoChange}
              />
              <label className="party_logo"  >Party Logo</label>
              <input
                type="file"
                placeholder="Party Logo"
                accept="image/*"
                // value={party_Photo}
                ref={partyPhotoRef}

                onChange={handlePartyPhotoChange}
              />
              <button className="a_button" style={{ width: "300px" }} onClick={handleAddCandidate}>Add Candidate</button>
            </div>
          )}

          {activeSection === "addVoter" && (
            <div className="section">
              <h2>Add Voter</h2>
              <input
                type="text"
                placeholder="Voter ID"
                value={voter_ID}
                onChange={(e) => setVoter_ID(e.target.value)}
              />
              <input
                type="text"
                placeholder="Voter Name"
                value={voter_name}
                onChange={(e) => setVoter_name(e.target.value)}
              />
              <input
                type="date"
                id="dob"
                value={voter_DOB}
                onChange={(e) => setVoter_DOB(e.target.value)}

              />
              <div className="face_area" style={{ padding: "1rem" }}>
                {!faceData ? (
                  <button className="face_reg_button" onClick={() => setShowRegister(true)}>
                    Open Face Registration
                  </button>
                ) : (
                  <div className="face_retake_area">
                    <div className="face_status_text">
                      <p>Face Saved✅</p>
                    </div>
                    <button className="face_retake_button" onClick={() => {
                      clearFaceEncoding();
                      setShowRegister(true);
                    }}>
                      Retake
                    </button>
                  </div>
                )}
                <FaceRegister
                  show={showRegister}
                  onClose={() => setShowRegister(false)}
                  onSuccess={() => setShowRegister(false)}
                />
              </div>
              <button className="a_button" style={{ width: "300px" }} onClick={handleAddVoter}>Add Voter</button>

            </div>
          )}


          {activeSection === "addAgent" && (
            <div className="section">
              <h2>Add Agent</h2>
              <input
                type="text"
                placeholder="Agent ID"
                value={agent_ID}
                onChange={(e) => setAgent_ID(e.target.value)}
              />
              <input
                type="text"
                placeholder="Agent Name"
                value={agent_name}
                onChange={(e) => setAgent_name(e.target.value)}
              />
              <input
                type="email"
                // id="dob"
                placeholder="Agent Email"
                value={agent_email}
                onChange={(e) => setAgentEmail(e.target.value)}

              />

              <input
                type="password"
                // id="dob"
                placeholder="Agent password"
                value={agent_password}
                onChange={(e) => setAgentPassword(e.target.value)}

              />

              <input
                type="text"
                // id="dob"
                placeholder="Candidate Id"
                value={agent_candidate_Id}
                onChange={(e) => setAgentCandidateId(e.target.value)}

              />
              <button className="a_button" style={{ width: "300px" }} onClick={handleAddAgent}>Add Agent</button>

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
                      style={{ margin: '0 10px', width: '50px' }}
                    />
                  </label>
                  <label>
                    Minutes:
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
                      style={{ margin: '0 10px', width: '50px' }}
                    />
                  </label>
                  <label>
                    Seconds:
                    <input
                      type="number"
                      value={seconds}
                      onChange={(e) => setSeconds(parseInt(e.target.value, 10) || 0)}
                      style={{ margin: '0 10px', width: '50px' }}
                    />
                  </label>
                  <button className="a_button" onClick={handleSetCountdown}>Set Timer</button>
                </div>
              ) : null}

              <div style={{ marginTop: '20px' }}>
                <button className="a_button" style={{ margin: '0 10px' }} onClick={handleStart} disabled={countdown === 0 || !isPaused}>
                  Start
                </button>
                {/* <button style={{ margin: '0 10px' }} onClick={handlePause} disabled={isPaused}>
                Pause
              </button> */}
                <button className="a_button" style={{ margin: '0 10px' }} onClick={handleReset}>Reset</button>
              </div>

            </div>
          )}

          {activeSection === "viewResults" && (
            <div className="section">
              <h2>Voting Results</h2>
              <button className="fetch-button" onClick={fetchVotingResults}>
                Fetch Results
              </button>
              {candidateResult.length > 0 ? (
                <ul className="results-list">
                  {candidateResult.map((candidateResult, index) => (
                    <li key={index} style={{ width: "100%" }}>
                      <strong>ID : {candidateResult.account.candidateId.toNumber()} </strong> <strong>{candidateResult.account.name}</strong>: {candidateResult.account.voteCount.toNumber()} vote
                    </li>
                  ))}
                </ul>
              ) : (
                // <p>No results to display. Click "Fetch Results" to load data.</p>
                <p>No results to display. Click &quot;Fetch Results&quot; to load data.</p>
              )}
            </div>
          )}


          {activeSection === "viewTransactionHistory" && (
            <div className="transaction-section">
              <h2>View Transactions</h2>

              {/* Dropdown to select transaction type */}
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="transactionType" style={{ marginRight: "0.5rem" }}>Select Type:</label>
                <select
                  id="transactionType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ padding: "0.5rem" }}
                >
                  <option value="all">All</option>
                  <option value="votes">Vote</option>
                  <option value="candidates">Add Candidate</option>
                  <option value="voters">Add Voter</option>
                </select>
              </div>

              {/* Button to fetch transactions */}
              <div className="sub-section">
                <button className="fetch-button" onClick={fetchTransactions}>
                  Fetch
                </button>

                <p>Total Transactions: {transactions.length}</p>
              </div>

              {/* Transaction list */}
              {transactions.length > 0 ? (
                <div
                  style={{
                    maxHeight: "300px", // You can adjust this height as needed
                    overflowY: "auto",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    width: "500px"
                  }}
                >
                  <ul className="results-list" style={{ marginTop: "1rem" }}>
                    {transactions.map((txn, index) => (
                      <li key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span title={txn.txHash}>
                          {txn.txHash.slice(0, 10)}...{txn.txHash.slice(-6)}
                        </span>
                        <button
                          onClick={() => copyTansactionHash(txn.txHash)}
                          style={{ marginLeft: "10px", padding: "5px 10px" }}
                        >
                          Copy
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ marginTop: "1rem" }}>No results to display.Click &quot; Fetch&quot; to load data.</p>
              )}
            </div>
          )}

        </div>) : (<div className="connect-button">

          <div className=""><h3>1. Connect to wallet:</h3><WalletMultiButton /></div>
          <div className=""><h3>2. Initialize state:</h3>
            <button className="initialize-btn" onClick={() => { initialize() }}>
              Initalize
            </button></div>
        </div>)}
      </div>
    </div>
  );
};

export default AdminDashboard;
