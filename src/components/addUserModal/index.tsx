'use client';
import styles from "./styles.module.css";
import { TextField } from "@mui/material";
import { User2, X, UserRoundPlus  } from "lucide-react";
import { Button } from "@mui/material";
import { useState } from "react";
import { useParams } from "next/navigation";

interface ModalProps{
    onClose: () => void;
}

export default function AddUserModal({onClose} : ModalProps){
    const [username, setUsername] = useState<string>("")
    const { id } = useParams<{ id: string }>();

    const handleAddUser = async () => {
        await fetch(`http://localhost:5000/api/project/${id}?username=${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        });
        setUsername("")
        onClose();
    }

    return(
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "white",
            width: "20%",
            borderRadius: "8px",
            padding: "10px",
            color: "black"
          }}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: "0.2rem 0.2rem 1rem 0.2rem"}}>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <User2 size={24}/>
                    <div style={{marginLeft: "0.2rem"}}>Добавить пользователя</div>
                </div>
                <X size={24} onClick={onClose} className={styles.closeBtn}></X> 
            </div>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <TextField placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value) }/>
                <Button style={{marginRight: "0.4rem"}} onClick={() => handleAddUser()}>Отправить</Button>
                {/* <UserRoundPlus size={36}/> */}
            </div>
        </div>
    )
}