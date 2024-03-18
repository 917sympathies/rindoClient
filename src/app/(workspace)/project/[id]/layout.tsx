"use client";
import styles from "./layoutstyles.module.css";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import { IProject } from "@/types";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {Kanban, GanttChart, TableProperties } from 'lucide-react'

interface Props {
  children: React.ReactNode;
  params: { id: string };
}

export default function Layout({ children, params }: Props) {
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();
  //const [project, setProject] = useState<IProject | null>(null);
  const [isSelectorVisible, setIsSelectorVisible] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<string>(pathname.split("/")[3]);

  useEffect(() => {
    //getProjectInfo(params.id);
  }, [params.id]);

  useEffect(() => {
    setCurrentPage(pathname.split("/")[3]);
  }, [pathname])

  useEffect(() => {
    if(currentPage === "settings") setIsSelectorVisible(false);
  }, [currentPage])

  // const getProjectInfo = async (id: string) => {
  //   const response = await fetch(`http://localhost:5000/api/project/${id}`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //     credentials: "include",
  //   });
  //   const data = await response.json();
  //   console.log(data);
  //   setProject(data);
  // };
  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Header setIsSelectorVisible={setIsSelectorVisible}/>
      {isSelectorVisible ?
      <div className={styles.selector}>
        <Link href={`/project/${id}/board`}>
          <div className={currentPage == "board" ? styles.selectoritemselected : styles.selectoritem}>
            <Kanban style={{color: "inherit"}} size={16}/>
            <p style={{ margin: "0", alignSelf: "center", padding: "0.3rem" }}>
              Канбан
            </p>
          </div>
        </Link>
        <Link href={`/project/${id}/list`}>
          <div className={currentPage == "list" ? styles.selectoritemselected : styles.selectoritem}>
            <TableProperties style={{color: "inherit"}} size={16}/>
            <p style={{ margin: "0", alignSelf: "center", padding: "0.3rem" }}>
              Список
            </p>
          </div>
        </Link>
        <Link href={`/project/${id}/gantt`}>
          <div className={currentPage == "gantt" ? styles.selectoritemselected : styles.selectoritem}>
            <GanttChart style={{color: "inherit"}} size={16}/>
            <p style={{ margin: "0", alignSelf: "center", padding: "0.3rem" }}>
              Диаграмма Ганта
            </p>
          </div>
        </Link>
      </div>
      : <div></div> }
      {children}
    </div>
  );
}
