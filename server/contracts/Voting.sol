// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OnlineVotingSystem {

    // Struct for Candidate
    struct Candidate {
        string name;
        uint256 id;
        uint256 voteCount;
        string politicalParty;
    }

    // Struct for Voter
    struct Voter {
        string name;
        uint256 id;
        bool isVoted;
    }

    // Mappings to store candidates and voters
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => Voter) public voters;

    // Arrays to track candidate and voter IDs
    uint256[] public candidateIds;
    uint256[] public voterIds;

    // Add a candidate
    function addCandidate(string memory _name, uint256 _id, string memory _politicalParty) public {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        require(bytes(_politicalParty).length > 0, "Political party name cannot be empty");
        require(candidates[_id].id == 0, "Candidate with this ID already exists");

        candidates[_id] = Candidate({
            name: _name,
            id: _id,
            voteCount: 0,
            politicalParty: _politicalParty
        });

        candidateIds.push(_id);
    }

    // Add a voter
    function addVoter(string memory _name, uint256 _id) public {
        require(bytes(_name).length > 0, "Voter name cannot be empty");
        require(voters[_id].id == 0, "Voter with this ID already exists");

        voters[_id] = Voter({
            name: _name,
            id: _id,
            isVoted: false
        });

        voterIds.push(_id);
    }

    // Cast a vote
    function vote(uint256 _voterId, uint256 _candidateId) public {
        require(voters[_voterId].id != 0, "Voter does not exist");
        require(candidates[_candidateId].id != 0, "Candidate does not exist");
        require(!voters[_voterId].isVoted, "Voter has already voted");

        // Increment vote count for the candidate
        candidates[_candidateId].voteCount += 1;

        // Mark the voter as having voted
        voters[_voterId].isVoted = true;
    }

    // Get voter details
    function getVoterDetails(uint256 _voterId) public view returns (uint256, bool) {
        require(voters[_voterId].id != 0, "Voter does not exist");
        return (voters[_voterId].id, voters[_voterId].isVoted);
    }

    // Get all candidates with full details (including vote count)
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateIds.length);
        for (uint256 i = 0; i < candidateIds.length; i++) {
            allCandidates[i] = candidates[candidateIds[i]];
        }
        return allCandidates;
    }

    // Get all candidates without vote count
    function getAllCandidatesWithoutVoteCount() public view returns (string[] memory, uint256[] memory, string[] memory) {
        string[] memory names = new string[](candidateIds.length);
        uint256[] memory ids = new uint256[](candidateIds.length);
        string[] memory politicalParties = new string[](candidateIds.length);

        for (uint256 i = 0; i < candidateIds.length; i++) {
            uint256 candidateId = candidateIds[i];
            names[i] = candidates[candidateId].name;
            ids[i] = candidateId;
            politicalParties[i] = candidates[candidateId].politicalParty;
        }

        return (names, ids, politicalParties);
    }
}


//0x86a6000e5129c7cc363dbb8fc8ea9fa65aef2a00
//Hardhat : 0xcc669D41B053d4570C9473D7ead7964A3A4a74d4