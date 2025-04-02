import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../Usercontext";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    fetch(`https://blog-portfolio-project-alx.vercel.app/post/${id}`).then(
      (response) => {
        response.json().then((postInfo) => {
          setPostInfo(postInfo);
        });
      }
    );
  }, []);

  const handleDelete = () => {
    console.log("User ID:", userInfo.id);
    console.log("User Info:", userInfo);
    console.log("Token:", userInfo.token);
    fetch(`https://blog-portfolio-project-alx.vercel.app/post/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/";
        } else {
          console.error("Failed to delete post");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  if (!postInfo) return "";
  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author.username} </div>

      {userInfo.id === postInfo.author._id && (
        <div className="edit-delete-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Edit this post
          </Link>

          <button className="delete-btn" onClick={handleDelete}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Delete
          </button>
        </div>
      )}
      <div className="image">
        <img
          src={`https://blog-portfolio-project-alx.vercel.app/${postInfo.cover}`}
          alt=""
        />
      </div>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      />
    </div>
  );
}
