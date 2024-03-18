"use client";
import styles from "./styles.module.css";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Chat from "../chat";
import { Drawer } from "@mui/material";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ICookieInfo } from "@/types";
import { useCookies } from "react-cookie";

interface HeaderProps {
  setIsSelectorVisible: Dispatch<SetStateAction<boolean>>;
}

interface IProject{
  name: string,
  chatId: string,
  ownerId: string
}

export default function Header({
  setIsSelectorVisible,
}: HeaderProps) {
  const { id } = useParams<{ id: string }>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [cookies, setCookie, removeCookie] = useCookies(["test-cookies"]);
  const [project, setProject] = useState<IProject | null>(null);

  useEffect(() => {
    const token = cookies["test-cookies"];
    if(token === undefined) return;
    const decoded = jwtDecode(token) as ICookieInfo;
    if (decoded.userId == project?.ownerId) setIsOwner(true);
    else setIsOwner(false);
    //setProject(projectInfo)
  }, [project]);

  useEffect(() => {
    const getProjectInfo = async (id: string) => {
      const response = await fetch(`http://localhost:5000/api/project/${id}/header`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      setProject(data);
    };
    getProjectInfo(id);
  }, [id]);

  return (
    <div className={styles.container}>
      <h2 style={{ fontFamily: "inherit", margin: "10px" }}>
        {/* {project && project.owner?.username} / {project && project.name} */}
        {project && project.name}
      </h2>
      <div className={styles.chatButton} onClick={() => setIsChatOpen(true)}>
        <h3>Чат проекта</h3>
      </div>
      <Link
        href={`/project/${id}/board`}
        onClick={() => setIsSelectorVisible(true)}
      >
        <h3>Задачи</h3>
      </Link>
      {isOwner ? (
        <Link
          href={`/project/${id}/settings`}
          onClick={() => setIsSelectorVisible(false)}
        >
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
        <Chat
          isActive={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatId={project?.chatId}
          projectName={project?.name}
        />
      </Drawer>
    </div>
  );
}
