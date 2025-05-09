import React, { useState, useEffect } from "react";
import '../styles/votingBooth.scss';
import CandidateCard from "../components/CandidateCard.jsx";
import LoadingPage from "../components/LoadingPage.jsx";
import axios from "axios";
import ABI from "../../idl.json"
import { voterState } from '../store/store.js';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';


const VotingBooth = () => {
  const navigateTo = useNavigate();
  const [candidates, setCandidates] = useState([]); // State for candidates
  const [selectedCandidate, setSelectedCandidate] = useState(null); // State for selected candidate
  const [isLoading, setIsLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for errors
  const voterId = voterState((state) => state.voterId);
  const [isBtnLoading, setBtnIsLoading] = useState(false);
  // const contractAddress = "0x86a6000e5129c7cc363dbb8fc8ea9fa65aef2a00";
  const contractAddress = "0x13f3e68525a2aa5ed8094843f806c45ee117535d";


  //<===================================================================FOR COUNTDOWN==========================================
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

  useEffect(() => {
    // Connect to the backend WebSocket
    socket.current = io('http://localhost:5000');

    // Listen for countdown updates
    socket.current.on('countdown', ({ countdownValue, isPaused, canVote }) => {
      setCountdown(countdownValue);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      setBtnIsLoading(true);
    } else {
      setBtnIsLoading(false)
    }
  }, [countdown]);


  //<=======================================================================CAST VOTE=========================
  const handleVoteSubmit = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setBtnIsLoading(true)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress, ABI, signer
    );

    try {
      const tx = await contractInstance.vote(voterId, selectedCandidate.candidate_ID);
      await tx.wait();

      setBtnIsLoading(false)
      toast.success("voted successfuly")
      navigateTo("/voter-validation")

    } catch (error) {
      console.log(error)
      setBtnIsLoading(false)
      toast.error("ERROR!")
      navigateTo("/voter-validation")
    }
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setSelectedCandidate(null)
        const response = await axios.get(
          "http://localhost:5000/v1/admin/get-all-candidate-from-server",
          {
            withCredentials: true,
          }
        );
        console.log("API Response:", response.data.candidates); // Log the data
        setCandidates(response.data.candidates); // Ensure this matches the structure of the response
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setError("Failed to fetch candidates. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  if (isLoading) return <LoadingPage />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="voting-booth">
      <div className="candidates">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.candidate_ID}
            candidate={candidate}
            isSelected={selectedCandidate?.candidate_ID === candidate.candidate_ID}
            onSelect={() => setSelectedCandidate(candidate)}
          />
        ))}
      </div>
      {isBtnLoading === true ? (<button className="vote-button" onClick={handleVoteSubmit}>
        Submit Vote
      </button>) : null}
      <h2>Time Remaining</h2>
      <h3>{formatTime(countdown)}</h3>

    </div>
  );
};

export default VotingBooth;
