import { useContext, useEffect } from "react";
import {Link} from "react-router-dom"
import { UserContext } from "./Usercontext";
export default function Header(){
   const {userInfo,setUserInfo} = useContext(UserContext);
    useEffect(()=>{
        fetch('https://blogapp-m884.onrender.com/profile',{
            credentials:'include',
            headers: {
              'Accept': 'application/json', // Request JSON response
            },
        }).then(response =>{
           response.json().then(userInfo=>{
           setUserInfo(userInfo);
           });
        });
    },[]);

    function logout(){
      fetch('https://blogapp-m884.onrender.com/logout',{
        credentials:'include',
        method:'POST',
        headers: {
          'Accept': 'application/json', // Request JSON response
        },
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