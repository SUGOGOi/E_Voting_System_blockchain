import React from "react";
import '../styles/candidateCard.scss'

const CandidateCard = ({ candidate, isSelected, onSelect }) => {
  console.log(isSelected)
  return (
    <div
      className={`candidate-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <img
        src={`http://localhost:5000/${candidate.candidate_Photo}`}
        alt={`${candidate.candidate_name}`}
        className="candidate-photo"
      />
      <h3>{candidate.candidate_name}</h3>
      <div className="party-info">
        <img
          src={`http://localhost:5000/${candidate.party_Photo}`}
          alt={`${candidate.party_Photo}`}
          className="party-photo"
        />
        <p>{candidate.party_name}</p>
      </div>
    </div>
  );
};

export default CandidateCard;
