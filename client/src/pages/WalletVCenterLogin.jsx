import { useState } from 'react';
import '../styles/walletPage.scss';
import axios from 'axios';
import { vcState } from '../store/store.js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useVotingSystem } from "../hooks/useVotingSystem";


function WalletVCenterLogin() {
  //========================for solana
  const {
    initialize
  } = useVotingSystem();






  const navigateTo = useNavigate();

  // States to hold input values and connection status
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');

  // Zustand states
  const { setVCID, setEmail, setName, setRole, setStatus, setMessage } = vcState();



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ID && password) {
      try {
        // Make an API call using Axios
        const response = await axios.post(
          'http://localhost:4000/v1/voting_center_login',
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
          initialize()
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
      <div className="connectt-button">
        {/* {!isMetaMaskConnected ? (
          <button onClick={connectMetaMask} className="connect-btn">
            Connect to MetaMask
          </button>
        ) : (
          <span className="connected">Connected to MetaMask</span>
        )} */}
        <h3>Connect to wallet</h3><WalletMultiButton />
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        <label htmlFor="ID">Voting Center ID</label>
        <input
          className='input-id'
          type="text"
          id="ID"
          value={ID}
          onChange={(e) => setID(e.target.value)}
          placeholder="Enter Voting Center ID"
        />

        <label htmlFor="password">Password</label>
        <input
          className='input-pass'
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
        />

        <button
          type="submit"
          className="submit-btn"
          disabled={!ID || !password}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default WalletVCenterLogin;
