import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Editor({value, onChange}){
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
    return(
        <ReactQuill 
        value={value}
        theme={'snow'}
        onChange={onChange}
        modules={modules} 
        formats={formats}/>
    );
}