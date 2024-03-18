// import React from 'react';
import {Dispatch, SetStateAction} from 'react'
import { CKEditor } from "@ckeditor/ckeditor5-react";
//import Editor from "@ckeditor5-custom-build";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic" 

const editorConfiguration = {
    toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'undo',
        'redo'
    ],
    placeholder: 'Описание...',
};

interface EditorProps{
    initialData?: string,
    setState: Dispatch<SetStateAction<string>>
}

function CustomEditor( {initialData, setState} : EditorProps ) {
        return (
            // <CKEditor
            //     editor={ ClassicEditor }
            //     config={ editorConfiguration }
            //     data={ props.initialData }
            //     onChange={ (event, editor ) => {
            //         const data = editor.getData();
            //         props.setState((prevState) => ({
            //             ...prevState,
            //             description: data,
            //           }));
            //     } }
            // />
            <CKEditor
                editor={ ClassicEditor }
                config={ editorConfiguration }
                data={ initialData }
                onChange={ (event, editor ) => {
                    const data = editor.getData();
                    setState(data);
                } }
            />
        )
}

export default CustomEditor;