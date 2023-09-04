import { useContext, useEffect,useState } from "react";
import {Link} from "react-router-dom"
import { UserContext } from "./Usercontext";
export default function Header(){
   const {userInfo,setUserInfo} = useContext(UserContext);
    useEffect(()=>{
        fetch('http://localhost:4000/profile',{
            credentials:'include',
        }).then(response =>{
           response.json().then(userInfo=>{
           setUserInfo(userInfo);
           });
        });
    },[]);

    function logout(){
      fetch('http://localhost:4000/logout',{
        credentials:'include',
        method:'POST',
      }).then(() => {
        setUserInfo(null);
      });
    }
    const username = userInfo?.username;
    return(
        <header>
        <nav className="navbar">
        <Link to="/" className="logo">
          MyBlog
        </Link>
            {username && (
                <>
                <Link to="/create" className="create-post">Create new post</Link>
                <a className="logout" onClick={logout}>Logout</a>
                </>
            )}
            {!username &&(
              <>
               
               <Link to="/login" className="login">Login</Link>
               <Link to="/register" className="register">Register</Link>
             </>
            )}

        </nav>
        </header>
    );

}