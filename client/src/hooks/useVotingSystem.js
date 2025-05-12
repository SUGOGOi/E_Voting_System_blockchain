import * as anchor from "@project-serum/anchor";
import { useMemo, useState } from "react";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import idl from "../../idl.json";
import {
  EVM_SMART_CONTRACT_PUBKEY,
  initializeState,
  resultState,
} from "../store/store";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
// import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import toast from "react-hot-toast";
import { Buffer } from "buffer";
window.Buffer = Buffer;
// import { useWallet } from "@solana/wallet-adapter-react";

export const useVotingSystem = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { setSystemInitialized, setProgramState } = initializeState();
  const { candidateResult, setCandidateResult } = resultState();

  const [loading, setLoading] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [candidates, setCandidates] = useState([]);
  // const [voters, setVoters] = useState([]);

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

  // console.log(program.programId);
  // const program_ID = program.programId;

  //PDA helpers
  const getStatePda = () =>
    findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("state")],
      program.programId
    );
  const getCandidatePda = (candidateId) =>
    findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("candidate"),
        new anchor.BN(candidateId).toArrayLike(Uint8Array, "le", 8),
      ],
      program.programId
    );

  const getVoterPda = (voterId) =>
    findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("voter"),
        new anchor.BN(voterId).toArrayLike(Uint8Array, "le", 8),
      ],
      program.programId
    );

  //fetch candidates
  const fetchCandidates = async () => {
    if (!program || !publicKey) {
      toast.error("Please connect your wallet");
      console.log("no program and publickey");
      return;
    }
    setLoading(true);
    console.log(program.programId);
    try {
      const accounts = await program.account.candidate.all();
      setCandidates(accounts);
      setCandidateResult(accounts);
      // console.log(accounts);
      console.log(candidateResult);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  //fetch voters
  const fetchVoters = async () => {
    if (!program) {
      // console.log("no program");
      return;
    }

    setLoading(true);

    try {
      const accounts = await program.account.voter.all();
      console.log(accounts);
      // setVoters(accounts);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch voters.");
    } finally {
      setLoading(false);
    }
  };

  const getCandidateById = async (candidateId) => {
    if (!program || !publicKey) {
      console.log("no program and publickey");
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

  // Get single voter data by ID
  const getVoterById = async (voterId) => {
    if (!program || !publicKey) {
      console.log("no program and publickey");
      return;
    }
    try {
      const [voterPda] = getVoterPda(voterId);
      const voterAccount = await program.account.voter.fetch(voterPda);
      return voterAccount;
    } catch (err) {
      console.log(err);
      toast.error(`Failed to fetch voter ${voterId}.`);
      return null;
    }
  };

  //Initialize admin state
  const initialize = async () => {
    if (!program || !publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    await connection.getLatestBlockhash();
    // console.log(latestBlockhash);

    try {
      setTransactionPending(true);

      const [statePda] = getStatePda();
      // console.log(`state pda : ${statePda}`);
      // console.log(`systemProgram : ${SystemProgram.programId}`);

      const accountInfo = await connection.getAccountInfo(statePda);
      if (accountInfo !== null) {
        // Decode the account data
        // First 8 bytes are discriminator, next 32 bytes are admin pubkey
        const adminPubkey = new PublicKey(accountInfo.data.slice(8, 40));
        // console.log("Admin wallet address:", adminPubkey.toString());
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
          admin: publicKey,
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

  //=========================Add candidate

  const addCandidate = async (candidateId, name, party) => {
    if (!program || !publicKey) {
      console.log("no program and publickey");
      return;
    }

    try {
      setTransactionPending(true);
      const [statePda] = getStatePda();
      const [candidatePda] = getCandidatePda(candidateId);

      // Capture the transaction signature
      const signature = await program.methods
        .addCandidate(new anchor.BN(candidateId), name, party)
        .accounts({
          state: statePda,
          candidate: candidatePda,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Only show success toast if we got a valid signature back
      if (signature) {
        console.log(signature);
        console.log("Candidate added to blockchain. Signature:", signature);
        toast.success("Candidate added to blockchain");
        await fetchCandidates();
      }
    } catch (error) {
      console.log(error);
      toast.error("error adding candidate in blockchain");
    } finally {
      setTransactionPending(false);
    }
  };

  //=========================Add voter
  const addVoter = async (voterId, name) => {
    if (!program || !publicKey) {
      console.log("no program and publickey");
      return;
    }

    try {
      setTransactionPending(true);
      const [statePda] = getStatePda();
      const [voterPda] = getVoterPda(voterId);

      const signature = await program.methods
        .addVoter(new anchor.BN(voterId), name)
        .accounts({
          state: statePda,
          voter: voterPda,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      if (signature) {
        console.log("voter added to blockchain. Signature:", signature);
        toast.success("Voter added to blockchain");
        await fetchVoters();
      }
    } catch (error) {
      console.log(error);
      toast.success("error adding voter to blockchain");
    } finally {
      setTransactionPending(false);
    }
  };

  //===================================cast vote
  const vote = async (voterId, candidateId) => {
    if (!program || !publicKey) {
      console.log("no program and publickey");
      return;
    }

    try {
      setTransactionPending(true);
      const [voterPda] = getVoterPda(voterId);
      const [candidatePda] = getCandidatePda(candidateId);
      // console.log(voterPda);
      // console.log(candidatePda);

      const signature = await program.methods
        .vote()
        .accounts({
          voter: voterPda,
          candidate: candidatePda,
          Signer: publicKey,
        })
        .rpc();

      if (signature) {
        console.log("vote successfully");
        toast.success("vote successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error casting vote");
    } finally {
      setTransactionPending(false);
    }
  };

  return {
    initialize,
    addCandidate,
    addVoter,
    vote,
    candidates,
    // voters,
    fetchCandidates,
    fetchVoters,
    loading,
    transactionPending,
    getCandidateById,
    getVoterById,
  };
};
