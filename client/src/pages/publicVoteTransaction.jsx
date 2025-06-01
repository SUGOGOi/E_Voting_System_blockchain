import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../styles/publicVotingTransaction.scss';
import { SERVER_URL } from '../store/store';

const VoteTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);



    const fetchVoteTransactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${SERVER_URL}/transaction/votes`, {
                withCredentials: true
            });

            if (res.data.success === true) {
                setTransactions(res.data.transactions);
                toast.success('Vote transactions fetched successfully!');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch vote transactions');
        } finally {
            setLoading(false);
        }
    };

    const copyTransactionHash = (txHash) => {
        navigator.clipboard.writeText(txHash)
            .then(() => {
                toast.success('Transaction hash copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy transaction hash');
            });
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const truncateHash = (hash) => {
        return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
    };

    return (
        <div className="vote-transactions-container">
            <div className="vote-transactions-card">
                <header className="page-header">
                    <h1>Vote Transactions</h1>
                    <p className="page-description">
                        View all voting transactions recorded on the blockchain
                    </p>
                </header>

                <div className="fetch-section">
                    <button
                        className={`fetch-button ${loading ? 'loading' : ''}`}
                        onClick={fetchVoteTransactions}
                        disabled={loading}
                    >
                        {loading ? 'Fetching...' : 'Fetch Vote Transactions'}
                    </button>

                    <div className="transaction-count">
                        <span>Total Vote Transactions: {transactions.length}</span>
                    </div>
                </div>

                <div className="transactions-section">
                    {transactions.length > 0 ? (
                        <div className="transactions-container">
                            <div className="transactions-header">
                                <span>Transaction Hash</span>
                                {/* <span>Timestamp</span>
                                <span>Action</span> */}
                            </div>

                            <div className="transactions-list">
                                {transactions.map((txn, index) => (
                                    <div key={index} className="transaction-item">
                                        <div className="transaction-hash">
                                            <span
                                                title={txn.txHash}
                                                className="hash-text"
                                            >
                                                {truncateHash(txn.txHash)}
                                            </span>
                                        </div>

                                        {/* <div className="transaction-timestamp">
                                            {txn.timestamp ? formatTimestamp(txn.timestamp) : 'N/A'}
                                        </div> */}

                                        <div className="transaction-actions">
                                            <button
                                                className="copy-button"
                                                onClick={() => copyTransactionHash(txn.txHash)}
                                                title="Copy full transaction hash"
                                            >
                                                📋 Copy
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="no-transactions">
                            <div className="no-transactions-icon">🗳️</div>
                            <p>No vote transactions found.</p>
                            <p className="no-transactions-subtitle">
                                Click &quot;Fetch Vote Transactions&quot; to load data.
                            </p>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoteTransactions;
