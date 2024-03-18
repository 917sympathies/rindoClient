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
