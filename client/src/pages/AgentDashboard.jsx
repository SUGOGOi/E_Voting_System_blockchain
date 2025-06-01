// AgentDashboard.jsx
import { useState, useEffect } from 'react';
import '../styles/agentDashboard.scss';
import axios from 'axios';
import { SERVER_URL } from '../store/store';
import { toast } from 'react-hot-toast';
import { agentState } from "../store/store.js"




const AgentDashboard = () => {
    const [voteData, setVoteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const [agentInfo, setAgentInfo] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { candidate_ID, agentId, agentName, } = agentState();



    // Fetch vote count data
    const fetchVoteData = async () => {
        try {
            setRefreshing(true);
            const response = await axios.post(`${SERVER_URL}/agent/vote-of-condidate/${candidate_ID}`, {
                withCredentials: true
            });

            if (response.data.success) {
                setVoteData(response.data.data);
                setError('');
            } else {
                setError(response.data.error || 'Failed to fetch vote data');
            }

        } catch (err) {
            console.error('Error fetching vote data:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchVoteData();
        const interval = setInterval(fetchVoteData, 10000);
        return () => clearInterval(interval);
    }, []);




    const handleLogout = async () => {
        try {
            const response = await axios.post(`${SERVER_URL}/agent/agent-logout`, {}, {
                withCredentials: true
            });

            if (response.data.success) {
                toast.success('Logged out successfully');
                window.location.href = '/agent-login';
            }
        } catch (err) {
            console.error('Logout error:', err);
            toast.error('Logout failed. Please try again.');
        }
    };

    const handleRefresh = () => {
        fetchVoteData();
    };

    if (loading) {
        return (
            <div className="agent-dashboard loading-screen">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <h2>Vote Monitoring Dashboard</h2>
                    <p>Real-time candidate vote tracking</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="title-section">
                            <h2>Vote Monitoring Dashboard</h2>
                            <p>Real-time candidate vote tracking</p>
                        </div>
                    </div>
                    {/* <WalletMultiButton /> */}

                    <div className="agent-info">
                        {agentId ? (
                            <>
                                <div className="agent-details">
                                    <span className="agent-name">{agentName}</span>
                                    <span className="agent-id">ID: {agentId}</span>
                                </div>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" />
                                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="agent-details">
                                    <span className="agent-name">Name...</span>
                                    <span className="agent-id">ID....</span>
                                </div>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" />
                                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="container">
                    {/* Dashboard Title */}
                    <div className="dashboard-title">
                        <div className="refresh-section">
                            <button
                                className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={refreshing ? 'spinning' : ''}>
                                    <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="2" />
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {refreshing ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                            <span className="last-updated">
                                Last updated: {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>



                    {/* Vote Count Display */}
                    {voteData && !error && (
                        <div className="vote-count-section">
                            <div className="candidate-info">
                                <div className="candidate-header">
                                    <h3>Candidate Information</h3>
                                </div>

                                <div className="candidate-details">
                                    <div className="detail-card">
                                        <label>Candidate Name</label>
                                        <span>{voteData.name}</span>
                                    </div>

                                    <div className="detail-card">
                                        <label>Political Party</label>
                                        <span>{voteData.politicalParty}</span>
                                    </div>

                                    {/* <div className="detail-card">
                                        <label>Election Symbol</label>
                                        <span>{voteData.symbol}</span>
                                    </div> */}
                                </div>
                            </div>

                            <div className="vote-display">
                                <div className="vote-count-card">
                                    <div className="vote-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 11H7l5-8 5 8h-2l-3-5-3 5z" fill="currentColor" />
                                            <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" stroke="currentColor" strokeWidth="2" />
                                            <rect x="6" y="12" width="12" height="8" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div className="vote-number">
                                        <span className="count">{voteData.voteCount || 0}</span>
                                        <span className="label">Total Votes Received</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="dashboard-footer">
                        <div className="security-notice">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <div className="security-text">
                                <p>Secure Real-time Monitoring System</p>
                                <p>All data is encrypted and monitored</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AgentDashboard;
