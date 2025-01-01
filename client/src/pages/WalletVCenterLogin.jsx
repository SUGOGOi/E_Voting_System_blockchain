import React, { useState } from 'react';
import { ethers } from 'ethers';
import '../styles/walletPage.css';
import axios from 'axios';
import { vcState } from '../store/store.js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function WalletVCenterLogin() {
  const navigateTo = useNavigate();

  // States to hold input values and connection status
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');

  // Zustand states
  const { setVCID, setEmail, setName, setRole, setStatus, setMessage } = vcState();

  // Connect to MetaMask function
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Request account access from MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create a provider from MetaMask's window.ethereum
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await signer.getAddress();

        toast.success('Connected to MetaMask');
        setIsMetaMaskConnected(true);
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      toast.error('MetaMask is not installed. Please install it to continue.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ID && password) {
      try {
        // Make an API call using Axios
        const response = await axios.post(
          'http://localhost:5000/v1/voting_center_login',
          { ID, password },
          { withCredentials: true } // Include credentials (cookies, HTTP auth)
        );

        // console.log(response)

        if (response.data) {
          // Save API response to Zustand store
          setVCID(response.data.voting_center.ID);
          setEmail(response.data.voting_center.email);
          setName(response.data.voting_center.name);
          setRole(response.data.voting_center.role);
          setStatus(response.data.status);
          setMessage(response.data.message);

          // Show success toast and navigate
          toast.success(response.data.message);
          navigateTo('/voter-validation');
        } else {
          toast.error('No response data received from server.');
        }
      } catch (error) {
        console.error('Error making API call:', error);
        toast.error(error.response?.data?.message || 'An error occurred.');
      }
    } else {
      toast.error('Please fill in all fields');
    }
  };

  return (
    <div className="App">
      <h1>Voting Portal</h1>
      <div className="connect-button">
        {!isMetaMaskConnected ? (
          <button onClick={connectMetaMask} className="connect-btn">
            Connect to MetaMask
          </button>
        ) : (
          <span className="connected">Connected to MetaMask</span>
        )}
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        <label htmlFor="ID">Voting Center ID</label>
        <input
          type="text"
          id="ID"
          value={ID}
          onChange={(e) => setID(e.target.value)}
          placeholder="Enter Voting Center ID"
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
        />

        <button
          type="submit"
          className="submit-btn"
          disabled={!isMetaMaskConnected || !ID || !password}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default WalletVCenterLogin;
