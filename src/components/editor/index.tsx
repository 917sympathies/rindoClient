import styles from "./styles.module.css"
import { Dispatch, SetStateAction } from "react"

interface IEditorProps{
    desc: string | undefined,
    placeholder?: string 
    setDesc: Dispatch<SetStateAction<string>>
}

export default function Editor({desc, placeholder, setDesc} : IEditorProps){
    return(
        <div style={{width: "100%"}}>
                <textarea className={styles.editor} placeholder={placeholder ? placeholder : "Описание..."} value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
        </div>
    )
}