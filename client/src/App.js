
import './App.css';
import Header from './components/Header';
import Layout from './components/Layout';
import Post from './components/post';
import {Route,Routes} from "react-router-dom";
import IndexPage from './components/pages/Indexpage';
import LoginPage from './components/pages/Loginpage';
import RegisterPage from './components/pages/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
      <Route index element={<IndexPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage/>}/>
      </Route>

    </Routes>

  );
}

export default App;
