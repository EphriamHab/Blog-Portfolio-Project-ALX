
import './App.css';
import Header from './components/Header';
import Layout from './components/Layout';
import Post from './components/post';
import {Route,Routes} from "react-router-dom";
import IndexPage from './components/pages/Indexpage';
import LoginPage from './components/pages/Loginpage';
import RegisterPage from './components/pages/RegisterPage';
import PostPage from './components/pages/PostPage';
import { UserContextProvider } from './components/Usercontext';
import CreatePost from './components/pages/Createpost';

function App() {
  return (
    <UserContextProvider>
    <Routes>
      <Route path='/' element={<Layout/>}>
      <Route index element={<IndexPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage/>}/>
      <Route path ='/create' element={<CreatePost/>}/>
      <Route path='/post/:id' element={<PostPage/>} />
      </Route>
    </Routes>
    </UserContextProvider>

  );
}

export default App;
