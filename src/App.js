import './App.css';
import { Route, Routes } from "react-router-dom";
import { Public, Home, Login } from "./pages";
import path from "./ultils/path";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route path={path.PUBLIC} element={<Public />} />
        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.HOME} element={<Home />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
