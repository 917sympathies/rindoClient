"use client";
import styles from "./styles.module.css";
import {
  TextField,
  InputLabel,
  Button,
  Modal,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { IProject, IProjectSettings } from "@/types";
import { SquareCheck  } from "lucide-react";
import Editor from "@/components/editor";
// import dynamic from "next/dynamic";

// const CustomEditor = dynamic(
//   () => {
//     return import("../../../../../components/editor/CustomEditor");
//   },
//   { ssr: false }
// );

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [projectSettings, setProjectSettings] = useState<IProject>(
    {} as IProject
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [desc, setDesc] = useState<string>("");

  useEffect(() => {
    setProjectSettings((prev) => ({
      ...prev,
      description: desc
    }));
  }, [desc])

  useEffect(() => {
    async function fetchInfo() {
      const response = await fetch(
        `http://localhost:5000/api/project/${id}/settings`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProjectSettings(data);
        setDesc(data.description)
        console.log(data);
      }
    }
    fetchInfo();
  }, []);

  const handleDeleteProject = async () => {
    const response = await fetch(
      `http://localhost:5000/api/project/${projectSettings.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (response.ok === true) {
      router.push("/main");
      // redirect("/main");
    }
  };

  const handleChangeName = async () => {
    const response = await fetch(
      `http://localhost:5000/api/project/${projectSettings.id}/name?name=${projectSettings.name}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
  };
  const handleChangeDescription = async () => {
    const response = await fetch(
      `http://localhost:5000/api/project/${projectSettings.id}/desc?description=${projectSettings.description}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    console.log(response);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: "1rem",
        }}
      >
        <InputLabel style={{ alignSelf: "center", fontSize: "1.2rem" }}>
          Название проекта
        </InputLabel>
        <TextField
          value={
            // projectSettings == null ? "Название проекта" : projectSettings.name
            projectSettings.name || "Название проекта"
          }
          className={styles.textField}
          size="small"
          InputProps={{ className: styles.textField }}
          onChange={(event) => {
            setProjectSettings((prevState) => ({
              ...prevState,
              name: event.target.value,
            }));
          }}
        />
        <SquareCheck
          className={styles.checkmark}
          onClick={() => handleChangeName()}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "60%",
          justifyContent: "space-evenly",
          marginTop: "1rem",
        }}
      >
        <InputLabel style={{ alignSelf: "center", fontSize: "1.2rem", textOverflow: "ellipsis" }}>
          Описание проекта
        </InputLabel>
        {/* <CustomEditor
          // initialData={
          //   //projectSettings == null ? "Описание..." : projectSettings.description
          //   projectSettings.description || "Описание..."
          // }
          setState={setDesc}
        /> */}
        <Editor desc={desc} setDesc={setDesc}/>
        <SquareCheck
          className={styles.checkmark}
          size={48}
          onClick={() => handleChangeDescription()}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: "1rem",
        }}
      >
        <InputLabel style={{ alignSelf: "center", fontSize: "1.2rem"}}>
          Ссылка приглашения
        </InputLabel>
        <TextField
          value={
            projectSettings.inviteLink || ""
          }
          size="small"
          className={styles.textField}
          InputProps={{ className: styles.textField, readOnly: true }}
          onClick={(e) =>
            navigator.clipboard.writeText((e.target as HTMLInputElement).value)
          }
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: "1rem",
        }}
      >
        <Button onClick={() => setIsModalOpen(true)} sx={{ color: "red" }}>
          Удалить проект
        </Button>
      </div>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignSelf: "center",
          alignContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "white",
            width: "20%",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <Typography sx={{ color: "black", alignSelf: "center" }}>
            Вы действительно хотите удалить проект?
          </Typography>
          <div style={{ display: "flex", alignSelf: "center" }}>
            <Button
              onClick={() => handleDeleteProject()}
              sx={{
                color: "white",
                backgroundColor: "green",
                marginRight: "0.4rem",
              }}
            >
              Да
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
              sx={{ color: "white", backgroundColor: "red" }}
            >
              Нет
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
