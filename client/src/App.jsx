import React,{useState} from 'react'
import WalletVCenterLogin from './pages/WalletVCenterLogin'
import VoterValidation from './pages/VoterValidation'
import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "react-hot-toast";
import VotingBooth from './pages/VotingBooth';
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'

const App = () => {

  const [state, setState] = useState({ web3: null, contract: null, account: null })
  const saveState = ({ web3, contract, account }) => {
    setState({ web3: web3, contract: contract, account: account })
  }

  const router = createBrowserRouter([
    { path: "/", element: <WalletVCenterLogin saveState={saveState} /> },
    { path: "/voter-validation", element: <VoterValidation saveState={saveState} /> },
    { path: "/voting-booth", element: <VotingBooth saveState={saveState} /> },
    { path: "/admin", element: <AdminDashboard saveState={saveState} /> },
    { path: "/a-login", element: <AdminLogin saveState={saveState} /> },
  ])
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position='bottom-center' />
    </>
  )
}

export default App