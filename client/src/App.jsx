import { useEffect, useState } from 'react'
import WalletVCenterLogin from './pages/WalletVCenterLogin'
import VoterValidation from './pages/VoterValidation'
import './App.scss'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast";
import VotingBooth from './pages/VotingBooth';
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import { adminState, SERVER_URL } from './store/store'
import axios from 'axios'


const App = () => {
  const { isLogin, setIsLogin } = adminState();
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState] = useState({ web3: null, contract: null, account: null })
  const saveState = ({ web3, contract, account }) => {
    setState({ web3: web3, contract: contract, account: account })
  }

  const router = createBrowserRouter([
    { path: "/", element: <WalletVCenterLogin saveState={saveState} /> },
    { path: "/voter-validation", element: <VoterValidation saveState={saveState} /> },
    { path: "/voting-booth", element: <VotingBooth saveState={saveState} /> },
    { path: "/admin", element: isLogin ? <AdminDashboard saveState={saveState} /> : <Navigate to="/a-login" /> },
    { path: "/a-login", element: isLogin ? <Navigate to="/admin" /> : <AdminLogin saveState={saveState} /> },
  ])

  useEffect(() => {
    if (isLogin === null) {
      setIsLoading(true)
      const checkLogin = async () => {
        try {
          const response = await axios.get(`${SERVER_URL}/v1/login-check`, {
            withCredentials: true
          })

          if (response.data.success === true) {
            setIsLogin(true)
            setIsLoading(false)
          }

        } catch (error) {
          console.log(error);
          setIsLogin(false);
          setIsLoading(false)
        }
      }
      checkLogin();
    } else {
      return;
    }
  }, [setIsLogin, isLogin])


  return (


    <>
      {/* {isLoading && (
        <div className="lazy-div"><p className='lazy-loading'></p></div>
      )} */}
      <RouterProvider router={router} />
      <Toaster position='top-center' />

    </>
  )
}

export default App