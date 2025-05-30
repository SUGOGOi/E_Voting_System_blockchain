import * as anchor from "@project-serum/anchor";
import { useMemo, useState } from "react";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import idl from "../../idl.json";
import {
  EVM_SMART_CONTRACT_PUBKEY,
  initializeState,
  resultState,
  SERVER_URL,
} from "../store/store";
import {
  useAnchorWallet,
  useConnection,
  // useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import axios from "axios";

window.Buffer = Buffer;

// Fixed salt for consistent hashing (matches smart contract)
const FIXED_SALT = "voting_system_salt_2025_secure";

export const useVotingSystem = () => {
  const { connection } = useConnection();
  // const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { setSystemInitialized, setProgramState } = initializeState();
  const { candidateResult, setCandidateResult } = resultState();

  const [loading, setLoading] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );
      return new anchor.Program(idl, EVM_SMART_CONTRACT_PUBKEY, provider);
    }
  }, [connection, anchorWallet]);

  // Utility function to compute voter hash (client-side)
  const computeVoterHash = (name, dob, voterId) => {
    const combined = `${name}${dob}${voterId}${FIXED_SALT}`;
    const hash = CryptoJS.SHA256(combined);
    return new Uint8Array(
      hash.words.flatMap((word) => [
        (word >>> 24) & 0xff,
        (word >>> 16) & 0xff,
        (word >>> 8) & 0xff,
        word & 0xff,
      ])
    );
  };

  // PDA helpers
  const getStatePda = () =>
    findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("state")],
      program.programId
    );

  const getCandidatePda = (candidateId) =>
    findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("candidate"),
        new anchor.BN(candidateId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

  // ✅ Updated: Uses hash for voter PDA derivation
  const getVoterPda = (voterHash) =>
    findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("voter"), Buffer.from(voterHash)],
      program.programId
    );

  // Fetch candidates
  const fetchCandidates = async () => {
    if (!program || !anchorWallet) {
      toast.error("Please connect your wallet");
      console.log("no program and anchorWallet");
      return;
    }
    setLoading(true);
    console.log(program.programId);
    try {
      const accounts = await program.account.candidate.all();
      setCandidates(accounts);
      setCandidateResult(accounts);
      console.log(candidateResult);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  // Fetch voters
  const fetchVoters = async () => {
    if (!program) {
      return;
    }

    setLoading(true);

    try {
      const accounts = await program.account.voter.all();
      console.log(accounts);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch voters.");
    } finally {
      setLoading(false);
    }
  };

  // Get candidate by ID
  const getCandidateById = async (candidateId) => {
    if (!program || !anchorWallet) {
      console.log("no program and anchorWallet");
      return;
    }
    try {
      const [candidatePda] = getCandidatePda(candidateId);
      const candidateAccount = await program.account.candidate.fetch(
        candidatePda
      );
      return candidateAccount;
    } catch (err) {
      console.log(err);
      toast.error(`Failed to fetch candidate ${candidateId}.`);
      return null;
    }
  };

  // ✅ Updated: Get voter by hash instead of ID
  const getVoterByHash = async (voterHash) => {
    if (!program || !anchorWallet) {
      console.log("no program and anchorWallet");
      return;
    }
    try {
      const [voterPda] = getVoterPda(voterHash);
      const voterAccount = await program.account.voter.fetch(voterPda);
      return voterAccount;
    } catch (err) {
      console.log(err);
      toast.error(`Failed to fetch voter.`);
      return null;
    }
  };

  // ✅ New: Check if voter exists with credentials
  const checkVoterExists = async (name, dob, voterId) => {
    try {
      const voterHash = computeVoterHash(name, dob, voterId);
      const voterData = await getVoterByHash(voterHash);
      return {
        exists: !!voterData,
        voterData,
        voterHash: Array.from(voterHash),
        voterPda: getVoterPda(voterHash)[0].toString(),
      };
    } catch (error) {
      console.log(error);
      return {
        exists: false,
        voterData: null,
        voterHash: null,
        voterPda: null,
      };
    }
  };

  // Initialize admin state
  const initialize = async () => {
    if (!program || !anchorWallet) {
      toast.error("Please connect your wallet");
      return;
    }

    await connection.getLatestBlockhash();

    try {
      setTransactionPending(true);

      const [statePda] = getStatePda();

      const accountInfo = await connection.getAccountInfo(statePda);
      if (accountInfo !== null) {
        const adminPubkey = new PublicKey(accountInfo.data.slice(8, 40));
        if (anchorWallet.publicKey.toString() === adminPubkey.toString()) {
          setSystemInitialized(true);
          setProgramState(program);
          toast.success("System initialized with current wallet");
        } else {
          toast.error("System initialized with different wallet");
        }
        return;
      }

      await program.methods
        .initialize()
        .accounts({
          state: statePda,
          admin: anchorWallet.publicKey, // ✅ Fixed: Use anchorWallet
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("System initialized successfully");
      setProgramState(program);
      setSystemInitialized(true);
    } catch (error) {
      console.log(error);
      toast.error("Error initialization");
    } finally {
      setTransactionPending(false);
    }
  };

  // Add candidate
  const addCandidate = async (candidateId, name, party) => {
    if (!program || !anchorWallet) {
      console.log("no program and anchorWallet");
      return;
    }

    try {
      setTransactionPending(true);
      const [statePda] = getStatePda();
      const [candidatePda] = getCandidatePda(candidateId);

      const signature = await program.methods
        .addCandidate(new anchor.BN(candidateId), name, party)
        .accounts({
          state: statePda,
          candidate: candidatePda,
          admin: anchorWallet.publicKey, // ✅ Fixed: Use anchorWallet
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      if (signature) {
        // console.log(signature);
        console.log("Candidate added to blockchain. Signature:", signature);
        toast.success("Candidate added to blockchain");

        const res = await axios.post(
          `${SERVER_URL}/transaction/record`,
          {
            txHash: signature,
            type: "addCandidate",
          },
          {
            withCredentials: true,
          }
        );

        if (res.data.success === true) {
          toast.success(res.data.message);
          console.log(res.data.message);
        } else {
          toast.error(res.data.error);
          console.log(res.data.error);
        }
        await fetchCandidates();
      }
    } catch (error) {
      console.log(error);
      toast.error("error adding candidate in blockchain");
    } finally {
      setTransactionPending(false);
    }
  };

  // ✅ Updated: Add voter with name, voter_id, dob (matches smart contract)
  const addVoter = async (name, voterId, dob) => {
    if (!program || !anchorWallet) {
      console.log("no program and anchorWallet");
      return;
    }

    try {
      setTransactionPending(true);

      // Compute hash client-side for PDA derivation
      const voterHash = computeVoterHash(name, dob, voterId);
      console.log(voterHash);
      const [statePda] = getStatePda();
      const [voterPda] = getVoterPda(voterHash);

      console.log(`voter pda: ${voterPda}`);
      console.log(`statePda: ${statePda}`);

      const signature = await program.methods
        .addVoter(name, new anchor.BN(voterId), dob) // ✅ Updated parameter order
        .accounts({
          state: statePda,
          voter: voterPda,
          admin: anchorWallet.publicKey, // ✅ Fixed: Use anchorWallet
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      if (signature) {
        console.log("voter added to blockchain. Signature:", signature);
        toast.success("Voter added to blockchain");

        const res = await axios.post(
          `${SERVER_URL}/transaction/record`,
          {
            txHash: signature,
            type: "addVoter",
          },
          {
            withCredentials: true,
          }
        );

        if (res.data.success === true) {
          toast.success(res.data.message);
          console.log(res.data.message);
        } else {
          toast.error(res.data.error);
          console.log(res.data.error);
        }

        // Store voter data for future reference
        const voterData = {
          name,
          dob,
          voterId: voterId.toString(),
          hash: Array.from(voterHash)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
          pda: voterPda.toString(),
        };

        localStorage.setItem(`voter_${voterId}`, JSON.stringify(voterData));
        await fetchVoters();

        return {
          success: true,
          voterHash: Array.from(voterHash),
          voterPda: voterPda.toString(),
          signature,
        };
      }
    } catch (error) {
      console.log(error);
      toast.error("error adding voter to blockchain");
      return { success: false, error: error.message };
    } finally {
      setTransactionPending(false);
    }
  };

  // ✅ Updated: Vote with voter_hash and candidate_id (matches smart contract)
  const vote = async (voterId, voterName, voterDob, candidateId) => {
    if (!program || !anchorWallet) {
      console.log("no program and anchorWallet");
      return;
    }

    try {
      setTransactionPending(true);

      let name = voterName;
      let dob = voterDob;

      // Compute voter hash client-side
      const voterHash = computeVoterHash(name, dob, voterId);
      const [voterPda] = getVoterPda(voterHash);
      const [candidatePda] = getCandidatePda(candidateId);

      console.log(`voter pda: ${voterPda}`);
      console.log(`candidate pda: ${candidatePda}`);

      const signature = await program.methods
        .vote(Array.from(voterHash), new anchor.BN(candidateId)) // ✅ Updated parameters
        .accounts({
          voter: voterPda,
          candidate: candidatePda,
          signer: anchorWallet.publicKey, // ✅ Fixed: Use anchorWallet
        })
        .rpc();

      if (signature) {
        console.log("vote successfully");
        toast.success("vote successfully");
        const res = await axios.post(
          `${SERVER_URL}/transaction/record`,
          {
            txHash: signature,
            type: "vote",
          },
          {
            withCredentials: true,
          }
        );

        if (res.data.success === true) {
          toast.success(res.data.message);
          console.log(res.data.message);
        } else {
          toast.error(res.data.error);
          console.log(res.data.error);
        }
        await fetchCandidates(); // Refresh candidates to show updated vote counts
        return { success: true, signature };
      }
    } catch (error) {
      console.log(error);
      toast.error("Error casting vote");
      return { success: false, error: error.message };
    } finally {
      setTransactionPending(false);
    }
  };

  // ✅ New: Vote with stored credentials
  // const voteWithStoredCredentials = async (voterId, candidateId) => {
  //   try {
  //     const storedData = localStorage.getItem(`voter_${voterId}`);
  //     if (!storedData) {
  //       toast.error(
  //         "Voter credentials not found. Please provide voter details."
  //       );
  //       return { success: false, error: "Credentials not found" };
  //     }

  //     const { name, dob } = JSON.parse(storedData);
  //     return await vote(name, dob, parseInt(voterId), candidateId);
  //   } catch (error) {
  //     toast.error("Error retrieving stored credentials");
  //     return { success: false, error: error.message };
  //   }
  // };

  // ✅ New: Load stored voter data
  // const loadStoredVoterData = (voterId) => {
  //   try {
  //     const stored = localStorage.getItem(`voter_${voterId}`);
  //     if (stored) {
  //       return JSON.parse(stored);
  //     }
  //     return null;
  //   } catch (error) {
  //     console.log("Error loading stored voter data:", error);
  //     return null;
  //   }
  // };

  // ✅ New: Check if user is admin
  const checkIsAdmin = async () => {
    if (!program || !anchorWallet) {
      return false;
    }

    try {
      const [statePda] = getStatePda();
      const stateAccount = await program.account.state.fetch(statePda);
      return stateAccount.admin.equals(anchorWallet.publicKey);
    } catch (error) {
      console.log("Error checking admin status:", error);
      return false;
    }
  };

  return {
    // Core functions
    initialize,
    addCandidate,
    addVoter,
    vote,
    // voteWithStoredCredentials,

    // Data fetching
    fetchCandidates,
    fetchVoters,
    getCandidateById,
    getVoterByHash,
    checkVoterExists,

    // Utility functions
    computeVoterHash,
    // loadStoredVoterData,
    checkIsAdmin,

    // State
    candidates,
    loading,
    transactionPending,
    candidateResult,

    // PDA helpers
    getStatePda,
    getCandidatePda,
    getVoterPda,

    // Constants
    FIXED_SALT,
  };
};
