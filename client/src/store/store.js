import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { PublicKey } from "@solana/web3.js";

export const vcState = create(
  devtools((set) => ({
    VCID: "",
    email: "",
    name: "",
    role: "",
    status: "",
    message: "",

    setVCID: (ID) => set({ VCID: ID }),
    setEmail: (email) => set({ email: email }),
    setName: (name) => set({ name: name }),
    setRole: (role) => set({ role: role }),
    setStatus: (status) => set({ status: status }),
    setMessage: (message) => set({ message: message }),
  }))
);

export const voterState = create(
  devtools((set) => ({
    voterId: "",
    voterName: "",
    voterDob: "",
    isVoted: "",

    setVoterID: (voterId) => set({ voterId: voterId }),
    setVoterName: (voterName) => set({ voterName: voterName }),
    setVoterDob: (voterDob) => set({ voterDob: voterDob }),
    setIsVoted: (isVoted) => set({ isVoted: isVoted }),
  }))
);

export const adminState = create(
  devtools((set) => ({
    isLogin: null,
    setIsLogin: (item) => set({ isLogin: item }),
  }))
);

export const faceState = create(
  devtools((set) => ({
    faceData: null,
    isFaceMatch: false,
    setFaceMatch: (item) => set({ isFaceMatch: item }),
    setFaceData: (encoding) => set({ faceData: encoding }),
    clearFaceData: () => set({ faceData: null }),
  }))
);

export const initializeState = create(
  devtools((set) => ({
    systemInitialized: false,
    programState: null,
    setSystemInitialized: (item) => set({ systemInitialized: item }),
    setProgramState: (item) => set({ programState: item }),
  }))
);

export const resultState = create(
  devtools((set) => ({
    candidateResult: [],
    setCandidateResult: (item) => set({ candidateResult: item }),
  }))
);

export const SERVER_URL = "http://localhost:4000";

// export const EVM_SMART_CONTRACT_PUBKEY = new PublicKey(
//   "DexJ1VxAuL8PM3E8B7mi7gpk934XvrxTK2aN1eB2vbLn"
// );

// export const EVM_SMART_CONTRACT_PUBKEY = new PublicKey(
//   "D6FmaZDfQAMQ3GERMEnxLKmkwbP21q14r1hciAy2L5o"
// );

export const EVM_SMART_CONTRACT_PUBKEY = new PublicKey(
  "5dqd27fMiBV5DZd4DdnZw7Qd2XBAVt8LZKDRGxLK99Ng"
);

// BbtLbZj9Eywph1uuLJkWgArRsFEEijcaNvUL1CHLvicK;
