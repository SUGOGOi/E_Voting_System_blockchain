// AgentLogin.jsx
import { useState } from 'react';
import '../styles/pollingAgentLogin.scss';
import axios from 'axios';
import { SERVER_URL } from '../store/store';
import { toast } from 'react-hot-toast';
import { agentState } from "../store/store.js"
import { useNavigate } from 'react-router-dom';


const AgentLogin = () => {
    const navigateTo = useNavigate();
    const { candidatePda, agentId, agentName, setAgentId, setAgentName, setCandidate_ID } = agentState();

    const [formData, setFormData] = useState({
        agent_ID: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await axios.post(`${SERVER_URL}/agent/agent-login`, {
                agent_ID: formData.agent_ID,
                password: formData.password
            }, {
                withCredentials: true,
            });

            console.log(response)

            if (response.data.success === true) {
                // Redirect to agent dashboard
                setAgentId(response.data.agent.agent_ID)
                // console.log(response.data.agent.agent_ID)
                setAgentName(response.data.agent.agent_name)
                setCandidate_ID(response.data.agent.candidateId.candidate_ID)
                // console.log(response.data.agent.candidateId.candidate_ID)
                // window.location.href = '/agent-dashboard';
                navigateTo('/agent-dashboard');

                toast.success(response.data.message);
            } else {
                toast.error(response.data.error);
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.error || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-login">
            <div className="login-container">
                <div className="login-header">
                    <div className="logo">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                        </svg>
                    </div>
                    <h1 className="title">Election Commission</h1>
                    <h2 className="subtitle">Polling Agent Portal</h2>
                    <p className="description">Secure access for authorized polling agents</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="agent_ID" className="form-label">
                            Agent ID
                        </label>
                        <div className="input-wrapper">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="input-icon">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <input
                                type="text"
                                id="agent_ID"
                                name="agent_ID"
                                value={formData.agent_ID}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your Agent ID"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="input-wrapper">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="input-icon">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="16" r="1" fill="currentColor" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`login-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" />
                                    <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2" />
                                    <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="footer">
                    <div className="security-notice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shield-icon">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span>Secure Authentication System</span>
                    </div>
                    <p className="help-text">
                        Need help? Contact your election administrator
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AgentLogin;
