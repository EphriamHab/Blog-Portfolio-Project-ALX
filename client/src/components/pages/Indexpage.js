import { useEffect } from "react";
import Post from "../post";
export default function IndexPage(){
     useEffect(()=>{
        fetch('/post').then(response =>{
            response.json().then(posts =>{
              console.log(posts);  
            });
        })
     },[]);
    return(
        <div>
        <Post/>
        <Post/>
        </div>
    );

}