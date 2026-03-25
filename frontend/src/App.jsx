import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import Departments from './pages/Departments';
import ComplaintDetails from './pages/ComplaintDetails';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Login from "./pages/Login";
import Signup from "./pages/SignUp";


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitComplaint />} />
          <Route path="/complaints" element={<MyComplaints />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/:department" element={<Admin />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
