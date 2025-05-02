import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
    isVoted: "",

    setVoterID: (voterId) => set({ voterId: voterId }),
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

export const SERVER_URL = "http://localhost:4000";
