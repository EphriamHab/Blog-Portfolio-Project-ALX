import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Navigate } from 'react-router-dom';

const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],    
      [{ 'header': 1 }, { 'header': 2 }],               
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean'],                                        
      ['link', 'image']                       
    ]
  };
const formats = [
'header',
'bold','italic','underline','strike','blockquote',
'list','bullet','indent',
'link','image'
] 
export default function CreatePost(){
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files,setFiles] = useState('');
    const [redirect,setRedirect] = useState(false);
 async function createNewPost(e){
    const data = new FormData();
    data.set('title',title);
    data.set('summary',summary);
    data.set('content',content);
    data.set('file',files[0]);
    e.preventDefault();
    console.log(files)
    const response = await fetch('http://localhost:4000/post',{
       method:'POST',
       body: data,
       credentials:'include',
    })
    if(response.ok){
      setRedirect(true);
    }

}
   if(redirect){
    <Navigate to = {'/'}/>
   }
    return(
        <form onSubmit={createNewPost}>
         <input type="title" 
                placeholder={"Title"} 
                value={title}
                onChange={e=>setTitle(e.target.value)}/> 
         <input type="summary" 
                placeholder={"Summary"}
                value={summary} 
                onChange={e=>setSummary(e.target.value)}/>
         <input type="file" 
                // value={files}
                multiple
                onChange={e=>setFiles(e.target.files)}/>
         <ReactQuill value={content} 
                     onChange={newContent => setContent(newContent)}
                     modules={modules} 
                     formats={formats}/>
         <button style={{marginTop:'5px'}}>Create Post</button>
        </form>
    )
}