"use client";
import styles from "./styles.module.css";
import {
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import Link from "next/link";
import { useRouter, useParams, redirect } from "next/navigation";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Drawer,
} from "@mui/material";
import { SquareActivity, ArrowDown, Plus } from "lucide-react";
import AddProjectModal from "../addProjectModal";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { IUser } from "@/types";
import { ICookieInfo } from "@/types";

interface ISidebarProps {
  // toFetch: boolean;
  // setFetch: Dispatch<SetStateAction<boolean>>;
  // onCreate: () => void;
}

interface IProjectInfo {
  id: string;
  name: string;
}

const Sidebar = ({}: ISidebarProps) => {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["test-cookies"]);
  const { id } = useParams();
  const [user, setUser] = useState<IUser>();
  const [projects, setProjects] = useState<IProjectInfo[] | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [toFetch, setFetch] = useState(false);

  useEffect(() => {
    const fetchProjectsInfo = async () => {
      const token = cookies["test-cookies"];
      if (token === undefined) {
        // return;
        router.push("/login");
        redirect("/login");
      }
      const decoded = jwtDecode(token) as ICookieInfo;
      const response = await fetch(
        `http://localhost:5000/api/project?userId=${decoded.userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.status === 401 || response.status === 404) {
        removeCookie("test-cookies", { path: "/" });
        router.push("/login");
      }
      const data = await response.json();
      //setUser(data);
      setProjects(data);
    };

    if (!user || toFetch) {
      fetchProjectsInfo();
      setFetch(false);
    }
  }, [toFetch]);

  const signOut = () => {
    removeCookie("test-cookies", { path: "/" });
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <List disablePadding sx={{ width: "90%", maxHeight: "80vh" }}>
        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 100 100"
            fill="none"
          >
            <rect width="36" height="36" fill="white" />
            <path
              d="M42.5 16H59L30 75H12L42.5 16Z"
              fill="#88FFD4"
              fill-opacity="0.7"
            />
            <path
              d="M54.6383 46.514C44.2979 45.3575 42 46.514 42 46.514L64.2128 92H78C78 92 64.9787 47.6704 54.6383 46.514Z"
              fill="#88FFD4"
              fill-opacity="0.5"
            />
            <path
              d="M56.5 16H93.5C93.5 16 101 18 93.5 27C86 36 51 27 51 27L56.5 16Z"
              fill="#88FFD4"
              fill-opacity="0.3"
            />
            <path
              d="M70 24C68 17 60 24 86 24C112 24 57.5 48 57.5 48C57.5 48 38 46 42.5 46.5C47 47 72 31 70 24Z"
              fill="#88FFD4"
              fill-opacity="0.4"
            />
          </svg>
          <Typography
            style={{
              textTransform: "uppercase",
              fontFamily: "inherit",
              fontSize: "1.1rem",
              color: "rgba(136, 255, 212, 0.4)",
            }}
          >
            indo
          </Typography>
        </div> */}
        <ListItem>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ArrowDown
              style={{ color: "rgb(102, 153, 255)", marginRight: "6px" }}
              size={16}
            />
            {/* color: "#4b0066" */}
            <div
              style={{
                color: "#727376",
                fontWeight: "600px",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                fontFamily: "inherit",
              }}
            >
              проекты
            </div>
          </div>
        </ListItem>
        {projects &&
          projects.map((project) => (
            <div
              className={styles.sidebarproject}
              style={
                project.id == id
                  ? { backgroundColor: "rgba(1, 1, 1, 0.1)", color: "black" }
                  : {}
              }
              key={project.id}
            >
              <Link
                href={`/project/${project.id}/board`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SquareActivity
                  style={{ marginRight: "12px" }}
                  size={16}
                  color="rgba(1, 1, 1, 0.6)"
                />
                {project.name}
              </Link>
            </div>
          ))}
        <ListItemButton
          className={styles.addProjectBtn}
          onClick={() => setIsOpen(true)}
        >
          <Plus style={{ color: "inherit", marginRight: "6px" }} size={16} />
          <div
            style={{
              color: "inherit",
              fontWeight: "300px",
              fontSize: "0.9rem",
              textTransform: "capitalize",
            }}
          >
            Новый проект
          </div>
        </ListItemButton>
      </List>
      <Button
        className={styles.signoutBtn}
        disableRipple
        onClick={() => signOut()}
      >
        <div
          style={{
            color: "inherit",
            fontWeight: "300px",
            fontSize: "0.9rem",
            textTransform: "capitalize",
          }}
        >
          Выйти
        </div>
      </Button>
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
};

export default Sidebar;
