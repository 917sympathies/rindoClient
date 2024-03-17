"use client";
import styles from "./styles.module.css";
import type { PropsWithChildren } from "react";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Drawer from "@mui/material/Drawer/Drawer";
import AddProjectModal from "@/components/addProjectModal";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { CookieInfo } from "@/types";
import { useRouter, redirect } from "next/navigation";

export default function WorkspaceLayout({
  children,
}: PropsWithChildren<unknown>) {
  const [isOpen, setIsOpen] = useState(false);
  const [fetch, setFetch] = useState(false);
  const [cookies, setCookies, removeCookie] = useCookies();
  const router = useRouter();

  useEffect(() => {
    const token = cookies["test-cookies"];
    console.log(token);
    if (token === undefined) {
      console.log("token is undefined");
      router.push("/login");
      redirect("/login");
    }
    const decoded = jwtDecode(token) as CookieInfo;
  }, [cookies]);

  return (
    <div className={styles.main} style={{ gridTemplateColumns: "2fr 10fr" }}>
      <Sidebar
        onCreate={() => setIsOpen(true)}
        toFetch={fetch}
        setFetch={setFetch}
      />
      {children}
      <Drawer
        anchor={"right"}
        open={isOpen}
        onClose={() => {}}
        sx={{ maxWidth: "40vw" }}
      >
        <AddProjectModal onClose={() => setIsOpen(false)} setFetch={setFetch} />
      </Drawer>
    </div>
  );
}
