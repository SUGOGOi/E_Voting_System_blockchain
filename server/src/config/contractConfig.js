// utils.js

import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import * as anchor from "@project-serum/anchor";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idlPath = path.join(__dirname, "../idl.json");
const idlJSON = await fs.readFile(idlPath, "utf8");
const idl = JSON.parse(idlJSON);

const FIXED_SALT = "voting_system_salt_2025_secure";
const PROGRAM_ID = new PublicKey(process.env.SMART_CONTRACT_PUBKEY);

const getConnection = () => new Connection(clusterApiUrl("devnet"));

export const createWalletFromPrivateKey = () => {
  const privateKey = bs58.decode(process.env.WALLET_PRIVATE_KEY);
  const keypair = anchor.web3.Keypair.fromSecretKey(privateKey);
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs) =>
      txs.map((tx) => {
        tx.partialSign(keypair);
        return tx;
      }),
  };
};

export const initializeProgram = (wallet) => {
  const connection = getConnection();
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  return new anchor.Program(idl, PROGRAM_ID, provider);
};

export const computeVoterHash = (name, dob, voterId, salt = FIXED_SALT) => {
  const combined = `${name}${dob}${voterId}${salt}`;
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

export const getVoterPdaFromHash = (voterHash) =>
  PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("voter"), voterHash],
    PROGRAM_ID
  );

export const getCandidatePda = (candidateId) => {
  const buffer = new ArrayBuffer(8);
  const dataView = new DataView(buffer);
  dataView.setBigUint64(0, BigInt(candidateId), true);
  return PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("candidate"), new Uint8Array(buffer)],
    PROGRAM_ID
  );
};

export const getStatePda = () =>
  PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("state")],
    PROGRAM_ID
  );

export const getVoterByHash = async (voterHash, wallet) => {
  const program = initializeProgram(wallet);
  try {
    const [voterPda] = getVoterPdaFromHash(voterHash);
    const voterAccount = await program.account.voter.fetch(voterPda);
    return { ...voterAccount, pda: voterPda.toString() };
  } catch (err) {
    console.error("Error fetching voter by hash:", err);
    return null;
  }
};

export const getVoterByCredentials = async (
  name,
  dob,
  voterId,
  salt,
  wallet
) => {
  try {
    const voterHash = computeVoterHash(name, dob, voterId, salt);
    return await getVoterByHash(voterHash, wallet);
  } catch (error) {
    console.error("Error getting voter by credentials:", error);
    return null;
  }
};

export const getCandidateById = async (candidateId, wallet) => {
  const program = initializeProgram(wallet);
  try {
    const [candidatePda] = getCandidatePda(candidateId);
    const candidateAccount = await program.account.candidate.fetch(
      candidatePda
    );
    return { ...candidateAccount, pda: candidatePda.toString() };
  } catch (err) {
    console.error("Error fetching candidate:", err);
    return null;
  }
};

export const getAllCandidates = async (wallet) => {
  const program = initializeProgram(wallet);
  try {
    const accounts = await program.account.candidate.all();
    return accounts.map(({ account, publicKey }) => ({
      ...account,
      pda: publicKey.toString(),
    }));
  } catch (err) {
    console.error("Error fetching all candidates:", err);
    return [];
  }
};

export const getAllVoters = async (wallet) => {
  const program = initializeProgram(wallet);
  try {
    const accounts = await program.account.voter.all();
    return accounts.map(({ account, publicKey }) => ({
      ...account,
      pda: publicKey.toString(),
    }));
  } catch (err) {
    console.error("Error fetching all voters:", err);
    return [];
  }
};

export const getSystemState = async (wallet) => {
  const program = initializeProgram(wallet);
  try {
    const [statePda] = getStatePda();
    const stateAccount = await program.account.state.fetch(statePda);
    return { ...stateAccount, pda: statePda.toString() };
  } catch (err) {
    console.error("Error fetching system state:", err);
    return null;
  }
};

export const checkIsAdmin = async (userPublicKey, wallet) => {
  const systemState = await getSystemState(wallet);
  if (!systemState) return false;
  return systemState.admin.equals(new PublicKey(userPublicKey));
};

export const verifyVoterExists = async (name, dob, voterId, salt, wallet) => {
  try {
    const voter = await getVoterByCredentials(name, dob, voterId, salt, wallet);
    return {
      exists: !!voter,
      voter,
      hasVoted: voter?.hasVoted || false,
    };
  } catch (error) {
    console.error("Error verifying voter:", error);
    return {
      exists: false,
      voter: null,
      hasVoted: false,
    };
  }
};

export {
  FIXED_SALT,
  PROGRAM_ID as EVM_SMART_CONTRACT_PUBKEY,
  getConnection,
  idl,
};
