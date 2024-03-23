"use client";
import styles from "./styles.module.css";
import {
  TextField,
  InputLabel,
  Button,
  Modal,
  Avatar,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { IProject, IProjectSettings } from "@/types";
import { SquareCheck, X } from "lucide-react";
import Editor from "@/components/editor";
import AddUserModal from "@/components/addUserModal";
// import dynamic from "next/dynamic";

// const CustomEditor = dynamic(
//   () => {
//     return import("../../../../../components/editor/CustomEditor");
//   },
//   { ssr: false }
// );

enum Setting {
  General,
  Roles,
  Users,
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [projectSettings, setProjectSettings] = useState<IProject>(
    {} as IProject
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [currentSetting, setCurrentSetting] = useState<Setting>(
    Setting.General
  );
  const [isModified, setIsModified] = useState<boolean>(false);

  useEffect(() => {
    if (name !== projectSettings.name || desc !== projectSettings.description)
      setIsModified(true);
    else setIsModified(false);
  }, [desc, name]);

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
        setDesc(data.description);
        setName(data.name);
        setProjectSettings((prev) => ({
          ...prev,
          users: [...data.users, data.owner],
        }));
        console.log(data);
      }
    }
    fetchInfo();
  }, []);

  const saveChanges = () => {
    if (desc !== projectSettings.description) handleChangeDescription();
    if (name !== projectSettings.name) handleChangeName();
    setIsModified(false);
  };

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
      `http://localhost:5000/api/project/${projectSettings.id}/name?name=${name}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
  };
  const handleChangeDescription = async () => {
    const response = await fetch(
      `http://localhost:5000/api/project/${projectSettings.id}/desc?description=${desc}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    console.log(response);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div
          className={
            currentSetting === Setting.General
              ? styles.selectedsidebaritem
              : styles.sidebaritem
          }
          onClick={() => setCurrentSetting(Setting.General)}
        >
          <Typography style={{ font: "inherit" }}>Общие</Typography>
        </div>
        <div
          className={
            currentSetting === Setting.Users
              ? styles.selectedsidebaritem
              : styles.sidebaritem
          }
          onClick={() => setCurrentSetting(Setting.Users)}
        >
          <Typography style={{ font: "inherit" }}>Участники проекта</Typography>
        </div>
        <div
          className={
            currentSetting === Setting.Roles
              ? styles.selectedsidebaritem
              : styles.sidebaritem
          }
          onClick={() => setCurrentSetting(Setting.Roles)}
        >
          <Typography style={{ font: "inherit" }}>Роли</Typography>
        </div>
      </div>
      <div className={styles.body}>
        {(() => {
          switch (currentSetting) {
            case Setting.General:
              return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* <InputLabel id="namelabel">Имя</InputLabel> */}
                  <TextField
                    size="small"
                    label="Название проекта"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {/* <InputLabel>Описание</InputLabel> */}
                  <TextField
                    size="small"
                    label="Описание проекта"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    style={{ marginTop: "2rem", marginBottom: "2rem" }}
                  />
                  <div>
                  <Button onClick={() => setIsModalOpen(true)} sx={{ color: "red", border: "1px solid red", marginRight: "0.2rem" }}>Удалить проект</Button>
                  <Button
                    style={
                      isModified
                        ? { color: "green", border: "1px solid green" }
                        : { visibility: "hidden" }
                    }
                    onClick={() => saveChanges()}
                  >
                    Сохранить изменения
                  </Button>
                  </div>
                </div>
              );
            case Setting.Users:
              return (
                <div style={{ color: "black", width: "80%" }}>
                  <Button
                    style={{
                      border: "1px solid #1976D2",
                      marginBottom: "2rem",
                    }}
                    onClick={() => setIsUserModalOpen(true)}
                  >
                    Добавить пользователя
                  </Button>
                  {projectSettings.users ? (
                    projectSettings.users.map((user) => (
                      <div
                        style={{
                          backgroundColor: "rgba(1, 1, 1, 0.1)",
                          color: "inherit",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.1rem 1rem",
                          marginBottom: "0.2rem",
                          borderRadius: "0.4rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "#4198FF",
                              width: "4vh",
                              height: "4vh",
                              fontSize: "1rem",
                              marginRight: "0.8rem",
                            }}
                            src="/static/images/avatar/1.jpg"
                          >
                            {user?.firstName?.slice(0, 1)}
                            {user?.lastName?.slice(0, 1)}
                          </Avatar>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <Typography>{user.username}</Typography>
                            <Typography>{`${user.firstName} ${user.lastName}`}</Typography>
                          </div>
                        </div>
                        <X size={16} className={styles.deleteUserBtn}></X>
                      </div>
                    ))
                  ) : (
                    <div></div>
                  )}
                </div>
              );
            case Setting.Roles:
              return <div></div>;
            default:
              return <div></div>;
          }
        })()}
      </div>
      <Modal
        open={isUserModalOpen}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignSelf: "center",
          alignContent: "center",
        }}
      >
        <AddUserModal onClose={() => setIsUserModalOpen(false)} />
      </Modal>
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

// export default function Page() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();
//   const [projectSettings, setProjectSettings] = useState<IProject>(
//     {} as IProject
//   );
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [desc, setDesc] = useState<string>("");

//   useEffect(() => {
//     setProjectSettings((prev) => ({
//       ...prev,
//       description: desc
//     }));
//   }, [desc])

//   useEffect(() => {
//     async function fetchInfo() {
//       const response = await fetch(
//         `http://localhost:5000/api/project/${id}/settings`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         }
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setProjectSettings(data);
//         setDesc(data.description)
//         console.log(data);
//       }
//     }
//     fetchInfo();
//   }, []);

//   const handleDeleteProject = async () => {
//     const response = await fetch(
//       `http://localhost:5000/api/project/${projectSettings.id}`,
//       {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       }
//     );
//     if (response.ok === true) {
//       router.push("/main");
//       // redirect("/main");
//     }
//   };

//   const handleChangeName = async () => {
//     const response = await fetch(
//       `http://localhost:5000/api/project/${projectSettings.id}/name?name=${projectSettings.name}`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       }
//     );
//   };
//   const handleChangeDescription = async () => {
//     const response = await fetch(
//       `http://localhost:5000/api/project/${projectSettings.id}/desc?description=${projectSettings.description}`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       }
//     );
//     console.log(response);
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         flexDirection: "column",
//         alignItems: "center"
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           justifyContent: "flex-start",
//           marginTop: "1rem",
//         }}
//       >
//         <InputLabel style={{ alignSelf: "center", fontSize: "1.2rem" }}>
//           Название проекта
//         </InputLabel>
//         <TextField
//           value={
//             // projectSettings == null ? "Название проекта" : projectSettings.name
//             projectSettings.name || "Название проекта"
//           }
//           className={styles.textField}
//           size="small"
//           InputProps={{ className: styles.textField }}
//           onChange={(event) => {
//             setProjectSettings((prevState) => ({
//               ...prevState,
//               name: event.target.value,
//             }));
//           }}
//         />
//         <SquareCheck
//           className={styles.checkmark}
//           onClick={() => handleChangeName()}
//         />
//       </div>
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           width: "60%",
//           justifyContent: "space-evenly",
//           marginTop: "1rem",
//         }}
//       >
//         <InputLabel style={{ alignSelf: "center", fontSize: "1.2rem", textOverflow: "ellipsis" }}>
//           Описание проекта
//         </InputLabel>
//         {/* <CustomEditor
//           // initialData={
//           //   //projectSettings == null ? "Описание..." : projectSettings.description
//           //   projectSettings.description || "Описание..."
//           // }
//           setState={setDesc}
//         /> */}
//         <Editor desc={desc} setDesc={setDesc}/>
//         <SquareCheck
//           className={styles.checkmark}
//           size={48}
//           onClick={() => handleChangeDescription()}
//         />
//       </div>
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           justifyContent: "flex-start",
//           marginTop: "1rem",
//         }}
//       >
//         <InputLabel style={{ alignSelf: "center", fontSize: "1.2rem"}}>
//           Ссылка приглашения
//         </InputLabel>
//         <TextField
//           value={
//             projectSettings.inviteLink || ""
//           }
//           size="small"
//           className={styles.textField}
//           InputProps={{ className: styles.textField, readOnly: true }}
//           onClick={(e) =>
//             navigator.clipboard.writeText((e.target as HTMLInputElement).value)
//           }
//         />
//       </div>
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           justifyContent: "flex-start",
//           marginTop: "1rem",
//         }}
//       >
//         <Button onClick={() => setIsModalOpen(true)} sx={{ color: "red" }}>
//           Удалить проект
//         </Button>
//       </div>
//       <Modal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignSelf: "center",
//           alignContent: "center",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "center",
//             backgroundColor: "white",
//             width: "20%",
//             borderRadius: "8px",
//             padding: "10px",
//           }}
//         >
//           <Typography sx={{ color: "black", alignSelf: "center" }}>
//             Вы действительно хотите удалить проект?
//           </Typography>
//           <div style={{ display: "flex", alignSelf: "center" }}>
//             <Button
//               onClick={() => handleDeleteProject()}
//               sx={{
//                 color: "white",
//                 backgroundColor: "green",
//                 marginRight: "0.4rem",
//               }}
//             >
//               Да
//             </Button>
//             <Button
//               onClick={() => setIsModalOpen(false)}
//               sx={{ color: "white", backgroundColor: "red" }}
//             >
//               Нет
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }
