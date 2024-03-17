"use client";
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Typography, TextField, Box, InputBase } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface ChatProps {
  chatId: string | undefined;
  projectName: string | undefined;
  onClose: () => void;
}

export default function Chat({ onClose, chatId, projectName }: ChatProps) {
  const [message, setMessage] = useState<string>("");
  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "0.6rem 0.6rem",
          justifyContent: "space-between"
        }}
      >
        <Typography sx={{fontSize: "1.2rem", marginLeft: "2rem"}}>{`Чат проекта ${projectName}`}</Typography>
        <X onClick={onClose} className={styles.closeBtn} />
      </div>
      <div style={{display: "flex", justifyContent: "center"}}>
        
        <Box
          sx={{
            backgroundColor: "#ECF0F3",
            padding: ".4rem .8rem",
            borderRadius: ".6rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            m: ".5rem 0 1vh 0",
            width: "80%",
          }}
        >
          <InputBase
            sx={{ flex: 1, fontSize: ".9rem" }}
            placeholder="Написать сообщение..."
            inputProps={{ "aria-label": "Написать сообщение..." }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <SendIcon
            sx={{
              fontSize: ".9rem",
              color: "rgba(102, 153, 255, 0.6)",
              "&:hover": { color: "rgba(102, 153, 255, 0.3)" },
            }}
            onClick={() => {}}
          />
        </Box>
      </div>
    </div>
  );
}
