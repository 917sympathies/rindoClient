"use client";
import styles from "./styles.module.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { IProject, IProjectSettings, IRole } from "@/types";
import { SquareCheck, X } from "lucide-react";
import Editor from "@/components/editor";
import AddUserModal from "@/components/addUserModal";

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
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<IRole>({} as IRole)


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
        // console.log(data);
      }
    }
    async function fetchRoles() {
      const response = await fetch(
        `http://localhost:5000/api/role?projectId=${id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
        setSelectedRole(data[0])
      }
    }
    fetchInfo();
    fetchRoles();
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
          <Label style={{ font: "inherit" }}>Общие</Label>
        </div>
        <div
          className={
            currentSetting === Setting.Users
              ? styles.selectedsidebaritem
              : styles.sidebaritem
          }
          onClick={() => setCurrentSetting(Setting.Users)}
        >
          <Label style={{ font: "inherit" }}>Участники проекта</Label>
        </div>
        <div
          className={
            currentSetting === Setting.Roles
              ? styles.selectedsidebaritem
              : styles.sidebaritem
          }
          onClick={() => setCurrentSetting(Setting.Roles)}
        >
          <Label style={{ font: "inherit" }}>Роли</Label>
        </div>
      </div>
      <div className={styles.body}>
        {(() => {
          switch (currentSetting) {
            case Setting.General:
              return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* <InputLabel id="namelabel">Имя</InputLabel> */}
                  <Input className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-slate-950 focus-visible:ring-offset-0"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {/* <InputLabel>Описание</InputLabel> */}
                  <Input className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-slate-950 focus-visible:ring-offset-0"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    style={{ marginTop: "2rem", marginBottom: "2rem" }}
                  />
                  <div className="flex flex-row gap-8">
                  <Button onClick={() => setIsModalOpen(true)} className="bg-white text-red-700 border border-red-700 hover:bg-red-500 hover:text-white" >Удалить проект</Button>
                  <Button
                  className={isModified ? "border border-green-500 bg-white text-green-500 hover:bg-green-500 hover:text-white ease-in-out duration-300" : "invisible"}
                    // style={
                    //   isModified
                    //     ? { color: "green", border: "1px solid green" }
                    //     : { visibility: "hidden" }
                    // }
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
                  className="text-white bg-blue-500 hover:bg-blue-800 mb-4 rounded-full"
                    // style={{
                    //   border: "1px solid #1976D2",
                    //   marginBottom: "2rem",
                    // }}
                    onClick={() => setIsUserModalOpen(true)}
                  >
                    Добавить пользователя
                  </Button>
                  <div className="flex flex-col gap-2">
                  {projectSettings.users ? (
                    projectSettings.users.map((user) => (
                      <div
                        key={user.id}
                        style={{
                          backgroundColor: "rgba(1, 1, 1, 0.1)",
                          color: "inherit",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.6rem 1rem",
                          marginBottom: "0.2rem",
                          borderRadius: "0.4rem",
                        }}
                      >
                        <div
                          className="flex flex-row items-center"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "row",
                          //   alignItems: "center",
                          // }}
                        >
                          <Avatar
                            style={{
                              backgroundColor: "#4198FF",
                              color: "white",
                              width: "2.5vh",
                              height: "2.5vh",
                              fontSize: "0.6rem",
                              margin: "0.1rem",
                              marginLeft: "0.4rem",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
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
                            <Label>{user.username}</Label>
                            <Label>{`${user.firstName} ${user.lastName}`}</Label>
                          </div>
                        </div>
                        <X size={24} className={styles.deleteUserBtn}></X>
                      </div>
                    ))
                  ) : (
                    <div></div>
                  )}
                  </div>
                </div>
              );
            case Setting.Roles:
              return (
                <div className="flex flex-row items-start">
                  <ul className="list-none ml-8 rounded-l-full">
                    {roles.map(role => (
                      <li className={selectedRole.id === role.id ? "rounded-l-full bg-gray-100" : "bg-white"} key={role.id} onClick={() => setSelectedRole(role)}>
                        <div className={selectedRole.id === role.id ? "p-4" : "p-4 hover:bg-gray-50 rounded-l-full ease-in-out duration-300"}>
                          {role.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-100 rounded-r-lg rounded-bl-lg">
                    <div className="p-4">
                      <Input className="rounded-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-slate-950 focus-visible:ring-offset-0" 
                      placeholder="Название роли"></Input>
                      <div className="flex flex-row items-center pt-4 pr-4 gap-4">
                        <Switch id='canAddTask' checked={selectedRole ? selectedRole.canAddTask : false} onCheckedChange={(value : boolean) => setSelectedRole({...selectedRole, canAddTask: value})}></Switch>
                        <Label htmlFor="canAddTask">Может добавлять задачи в проект</Label>
                      </div>
                      <div className="flex flex-row items-center pt-4 pr-4 gap-4">
                        <Switch id='canDeleteTask' checked={selectedRole ? selectedRole.canDeleteTask : false} onCheckedChange={(value : boolean) => setSelectedRole({...selectedRole, canDeleteTask: value})}></Switch>
                        <Label htmlFor="canDeleteTask">Может удалять задачи из проекта</Label>
                      </div>
                      <div className="flex flex-row items-center pt-4 pr-4 gap-4">
                        <Switch id='canUseChat' 
                        checked={selectedRole ? selectedRole.canUseChat : false} 
                        onCheckedChange={(value : boolean) => setSelectedRole({...selectedRole, canUseChat: value})}
                        ></Switch>
                        <Label htmlFor="canUseChat">Может пользоваться чатом</Label>
                      </div>
                      <Button className="w-full mt-4 text-black bg-gray-200 hover:bg-white ease-in-out duration-300"
                      onClick={() => console.log(selectedRole)}>Сохранить изменения</Button>
                    </div>
                  </div>
                </div>
              )
            default:
              return <div></div>;
          }
        })()}
      </div>
      <Dialog
        open={isUserModalOpen}
        // style={{
        //   display: "flex",
        //   justifyContent: "center",
        //   alignSelf: "center",
        //   alignContent: "center",
        // }}
      >
        <DialogContent>
          <AddUserModal onClose={() => setIsUserModalOpen(false)} />
        </DialogContent>
      </Dialog>
      <Dialog
        open={isModalOpen}
        // onClose={() => setIsModalOpen(false)}
        // style={{
        //   display: "flex",
        //   justifyContent: "center",
        //   alignSelf: "center",
        //   alignContent: "center",
        // }}
      >
        <DialogContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "white",
            width: "100%",
            borderRadius: "8px",
            padding: "10px",
            gap: 8
          }}
        >
          <Label style={{ color: "black", alignSelf: "center" }}>
            Вы действительно хотите удалить проект?
          </Label>
          <div style={{ display: "flex", alignSelf: "center" }}>
            <Button
              onClick={() => handleDeleteProject()}
              style={{
                color: "white",
                backgroundColor: "green",
                marginRight: "0.4rem",
              }}
            >
              Да
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ color: "white", backgroundColor: "red" }}
            >
              Нет
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>
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
//         <Input
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
//         <Input
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
//         <Button onClick={() => setIsModalOpen(true)} style={{ color: "red" }}>
//           Удалить проект
//         </Button>
//       </div>
//       <Modal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         style={{
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
//           <Label style={{ color: "black", alignSelf: "center" }}>
//             Вы действительно хотите удалить проект?
//           </Label>
//           <div style={{ display: "flex", alignSelf: "center" }}>
//             <Button
//               onClick={() => handleDeleteProject()}
//               style={{
//                 color: "white",
//                 backgroundColor: "green",
//                 marginRight: "0.4rem",
//               }}
//             >
//               Да
//             </Button>
//             <Button
//               onClick={() => setIsModalOpen(false)}
//               style={{ color: "white", backgroundColor: "red" }}
//             >
//               Нет
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }
