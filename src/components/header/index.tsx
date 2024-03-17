"use client";
import styles from "./styles.module.css";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Chat from "../chat";
import { IProject } from "@/types";
import { Drawer } from "@mui/material";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { CookieInfo } from "@/types";
import { useCookies } from "react-cookie";

interface HeaderProps {
  setIsSelectorVisible: Dispatch<SetStateAction<boolean>>
  projectInfo: IProject | null;
}

export default function Header({ setIsSelectorVisible, projectInfo }: HeaderProps) {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [cookies, setCookie, removeCookie] = useCookies(["test-cookies"]);
  const [project, setProject] = useState<IProject | null>(projectInfo);

  useEffect(() => {
    const token = cookies["test-cookies"];
    const decoded = jwtDecode(token) as CookieInfo;
    if (decoded.userId == projectInfo?.owner?.id) setIsOwner(true);
    else setIsOwner(false);
  }, [projectInfo]);

  return (
    <div className={styles.container}>
      <h2 style={{ fontFamily: "inherit", margin: "10px" }}>
        {projectInfo?.owner?.username} / {projectInfo?.name}
      </h2>
      <div className={styles.chatButton} onClick={() => setIsChatOpen(true)}>
        <h3>Чат проекта</h3>
      </div>
      <Link href={`/project/${projectInfo?.id}/board`} onClick={() => setIsSelectorVisible(true)}>
        <h3>Задачи</h3>
      </Link>
      {isOwner ? (
        <Link href={`/project/${projectInfo?.id}/settings`} onClick={() => setIsSelectorVisible(false)}>
          <h3>Настройки</h3>
        </Link>
      ) : (
        <div></div>
      )}
      <Drawer
        anchor={"right"}
        open={isChatOpen}
        onClose={() => {}}
        sx={{ maxWidth: "40vw" }}
      >
        <Chat onClose={() => setIsChatOpen(false)} chatId={projectInfo?.chatId} projectName={projectInfo?.name}/>
      </Drawer>
    </div>
  );
}
