import PropTypes from 'prop-types';
import '../styles/candidateCard.scss'

const CandidateCard = ({ candidate, isSelected, onSelect }) => {
  // console.log(isSelected)
  return (
    <div
      className={`candidate-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <img
        src={`http://localhost:4000/${candidate.candidate_Photo}`}
        alt={`${candidate.candidate_name}`}
        className="candidate-photo"
      />
      <h3>{candidate.candidate_name}</h3>
      <div className="party-info">
        <img
          src={`http://localhost:4000/${candidate.party_Photo}`}
          alt={`${candidate.party_Photo}`}
          className="party-photo"
        />
        <p>{candidate.party_name}</p>
      </div>
    </div>
  );
};

export default CandidateCard;

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    candidate_Photo: PropTypes.string.isRequired,
    candidate_name: PropTypes.string.isRequired,
    party_Photo: PropTypes.string.isRequired,
    party_name: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};