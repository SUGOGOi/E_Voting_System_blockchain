import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import * as anchor from "@project-serum/anchor";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idlPath = path.join(__dirname, "../idl.json");
const idlJSON = await fs.readFile(idlPath, "utf8");
const idl = JSON.parse(idlJSON);
import dotenv from "dotenv";
dotenv.config();

const EVM_SMART_CONTRACT_PUBKEY = new PublicKey(
  process.env.SMART_CONTRACT_PUBKEY
);

// Create a connection using the same approach as your frontend
// You can use the default endpoint or specify one from environment variables
const getConnection = () => {
  return new Connection(clusterApiUrl("devnet"));
};

// Create a wallet instance for backend use
export const createWalletFromPrivateKey = () => {
  const privateKey = bs58.decode(process.env.WALLET_PRIVATE_KEY);
  const keypair = anchor.web3.Keypair.fromSecretKey(privateKey);

  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs) => {
      return txs.map((tx) => {
        tx.partialSign(keypair);
        return tx;
      });
    },
  };
};

// Initialize the program with wallet and connection
export const initializeProgram = (wallet) => {
  const connection = getConnection();
  // console.log(connection);
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );

  return new anchor.Program(idl, EVM_SMART_CONTRACT_PUBKEY, provider);
};

// Get voter PDA function
export const getVoterPda = (voterId) => {
  // Create a buffer of 8 bytes
  const buffer = new ArrayBuffer(8);
  // Create a DataView to manipulate the buffer
  const dataView = new DataView(buffer);
  // Set the value as a little-endian 64-bit integer
  dataView.setBigUint64(0, BigInt(voterId), true); // true for little-endian
  return PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("voter"), new Uint8Array(buffer)],
    EVM_SMART_CONTRACT_PUBKEY
  );
};

// Function to get voter by ID
export const getVoterById = async (voterId, wallet) => {
  // console.log(voterId);

  // console.log(idl);

  const program = initializeProgram(wallet);
  // console.log(program);

  if (!program || !wallet.publicKey) {
    console.log("No program and publicKey");
    return;
  }

  try {
    const [voterPda] = await getVoterPda(voterId);
    // console.log(voterPda);
    const voterAccount = await program.account.voter.fetch(voterPda);
    // console.log(voterAccount);
    return voterAccount;
  } catch (err) {
    console.log(err);
    console.error(`Failed to fetch voter ${voterId}.`);
    return null;
  }
};
