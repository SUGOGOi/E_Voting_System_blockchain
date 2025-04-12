import { useState } from "react";
import "../styles/adminLogin.css";
import axios from "axios"
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { adminState } from "../store/store";


const AdminLogin = () => {
  const { setIsLogin } = adminState();
  const navigateTo = useNavigate();
  const [adminID, setAdminID] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault();
    if (adminID && password) {
      setIsLoading(true)
      try {
        setIsLoading(true)
        const response = await axios.post('http://localhost:5000/v1/admin_login', {
          ID: adminID,
          password
        }, {
          withCredentials: true,  // Include credentials (cookies, HTTP auth)
        });

        if (response && response.data.success === true) {
          setIsLogin(true)
          toast.success(response.data.message)
        }

        setAdminID("")
        setPassword("")
        setIsLoading(false)
        navigateTo("/admin")


      } catch (error) {
        console.log(error)
        if (error.response.data.error) {
          toast.error(error.response.data.error)
        }
        setAdminID("")
        setPassword("")
        setIsLoading(false)
      }
    }

  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="adminID">Admin ID</label>
            <input
              type="text"
              id="adminID"
              placeholder="Enter Admin ID"
              value={adminID}
              onChange={(e) => setAdminID(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
