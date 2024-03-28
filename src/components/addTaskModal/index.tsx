"use client";
import styles from "./styles.module.css";
import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar } from "../ui/avatar";
import { X } from "lucide-react";
import React from "react";
import { IProject, ITask, IUser } from "@/types";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { IUserInfo } from "@/types";
import Editor from "../editor";

// const CustomEditor = dynamic(
//   () => {
//     return import("../editor/CustomEditor");
//   },
//   { ssr: false }
// );

interface IAddTaskModalProps {
  // projectId: string | undefined;
  stageId: string | undefined;
  // users: IUser[] | undefined;
  setFetch: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
}

const AddTaskModal = ({
  onClose,
  // projectId,
  stageId,
  setFetch,
}: // users,
IAddTaskModalProps) => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<ITask>({} as ITask);
  const [responsibleUser, setResponsibleUser] = useState("");
  const [desc, setDesc] = useState<string>("");
  const [startDate, setStart] = useState(dayjs().format("YYYY-MM-DD"));
  const [finishDate, setFinish] = useState(dayjs().format("YYYY-MM-DD"));
  const [users, setUsers] = useState<IUserInfo[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setTask((prevState) => ({
      ...prevState,
      description: desc,
    }));
  }, [desc]);

  useEffect(() => {
    getUsers(id);
  }, [id]);

  const getUsers = async (id: string) => {
    const response = await fetch(
      `http://localhost:5000/api/user?projectId=${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const data = await response.json();
    setUsers(data);
  };

  const handleChangeResponsibleUser = (value: string) => {
    if (value === "все") setResponsibleUser("");
    else setResponsibleUser(value);
  };

  const handleChangeStartDate = (date: any) => {
    const temp = dayjs(date.toDate()).format("YYYY-MM-DD");
    setStart(temp);
  };

  const handleChangeFinishDate = (date: any) => {
    const temp = dayjs(date.toDate()).format("YYYY-MM-DD");
    setFinish(temp);
  };

  const handleAddTask = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (new Date(startDate) > new Date(finishDate)) {
      setErrorMessage("Вы выбрали некорректные даты!");
      return;
    }
    const taskDto = {
      name: task.name,
      description: task.description,
      projectId: id,
      stageId: stageId,
      comments: null,
      responsibleUserId: responsibleUser,
      startDate: startDate,
      finishDate: finishDate,
    } as ITask;
    const response = await fetch("http://localhost:5000/api/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(taskDto),
    });
    setFetch(true);
    onClose();
    console.log(response);
  };

  return (
    <>
      <div
        style={{
          maxWidth: "100vw",
          display: "grid",
          gridTemplateRows: "1fr 15fr",
          maxHeight: "70vh",
          height: "70vh",
        }}
      >
        <div
          style={{
            backgroundColor: "#F4F6F8",
            padding: "1rem 3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Label
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textTransform: "capitalize",
              fontSize: "0.95rem",
              color: "black",
              fontFamily: "inherit",
            }}
          >
            Задача
          </Label>
          <X
            style={{
              cursor: "pointer",
              borderRadius: "50%",
              fontSize: "1.2rem",
              // "&:hover": {
              //   backgroundColor: "white",
              //   transition: "all .1s ease-in-out",
              // },
              padding: ".5vh",
              transition: "all .1s ease-in-out",
            }}
            onClick={onClose}
          />
        </div>
        <div style={{ padding: "1rem 3rem" }}>
          <div style={{ marginBottom: ".5rem" }}>
            <Label
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: "capitalize",
                fontSize: "0.9rem",
                color: "black",
                fontWeight: "500",
                marginBottom: ".5rem",
                fontFamily: "inherit",
              }}
            >
              Название задачи
            </Label>
            <Input
              onChange={(event) => {
                setTask((prevState) => ({
                  ...prevState,
                  name: event.target.value,
                }));
              }}
              placeholder="Без названия"
              style={{
                width: "100%",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignContent: "center",
            }}
          >
            {/* {project?.tags?.map((e, index) => (
                      <Box style={{padding: '.1rem .7rem', mr: '.3rem',  backgroundColor: `#F4F6F8`, borderRadius: '3vh', display: 'inline-flex', flexDirection: 'row',alignItems: 'center', justifyContent: 'space-between', width: '6rem'}}>
                        <InputBase style={{ fontSize: '.7rem', color: 'black', textTransform: 'capitalize', '& .MuiOutlinedInput-notchedOutline': { border: 'unset' }, '& .MuiOutlinedInput-input': { padding: 0 }, width: 'auto'}} value={e}
                                   placeholder='Введите тег'
                                   onChange={(event) => {
                                     setProject(prevState => ({
                                       ...prevState,
                                       tags: [
                                         ...prevState.tags.slice(0, index),
                                         prevState.tags[index] = event.target.value,
                                         ...prevState.tags.slice(index + 1),
                                       ],
                                     }))
                                   }}
                        />
                        <ClearIcon style={{color: 'black', fontSize: '.8rem', borderRadius: '50%', '&:hover': {backgroundColor: '#F4F6F8', cursor: 'pointer'}}}
                                   onClick={() => {
                                     setProject(prevState => (
                                       {
                                         ...prevState,
                                         tags: [...prevState.tags.slice(0, index), ...prevState.tags.slice(index + 1)]
                                       }
                                     ))
                                   }
                                   }
                        />
                      </Box>
                    ) )} */}
            {/* <div style={{padding: '.1rem .7rem', marginRight: '.3rem', borderRadius: '3vh', display: 'flex', flexDirection: 'row',alignItems: 'center', justifyContent: 'space-between', border: '1px solid #DDE1E1', cursor: 'pointer'}}
                         onClick={() => {
                        //    if(project.tags[0] !== '') {
                        //      setProject(prevState => (
                        //        {...prevState, tags: [...prevState.tags, '']}
                        //      ))
                        //    }
                         }}
                    >
                      <AddIcon style={{color: 'black', fontSize: '.8rem', borderRadius: '50%', '&:hover': {backgroundColor: '#F4F6F8', cursor: 'pointer'}}}/>
                      <Label style={{textTransform: 'lowercase', fontSize: '.8rem', color: 'black', ml: '.3rem'}}>Добавить тег</Label>
                    </div> */}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "calc(50vw - 6rem)",
            }}
          >
            <Label
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: "capitalize",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "black",
                marginTop: "1.5rem",
                marginBottom: ".5rem",
                fontFamily: "inherit",
              }}
            >
              Описание задачи
            </Label>
            <div
              style={{
                position: "relative",
                overflowX: "hidden",
                overflowY: "auto",
                maxWidth: "100%",
              }}
            >
              {/* <div style={{width: "100%"}}>
                <textarea className={styles.editor} value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
              </div> */}
              <Editor desc={desc} setDesc={setDesc} />
              {/* <CustomEditor
                // initialData={desc}
                setState={setDesc}
              /> */}
              <Label
                id="responsibleinput"
                style={{ marginTop: "10px", color: "black" }}
              >
                Ответственный
              </Label>
              <Select
                // className={styles.select}
                value={responsibleUser}
                onValueChange={(value) => handleChangeResponsibleUser(value)}
              >
                <SelectTrigger className="SelectTrigger" aria-label="Food">
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem style={{ paddingLeft: "2.5rem" }} value={"все"}>
                    Все
                  </SelectItem>
                  {users &&
                    users.map((user) => (
                      <SelectItem key={user.username} value={user.id}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
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
                            // src="/static/images/avatar/1.jpg"
                          >
                            {user?.firstName?.slice(0, 1)}
                            {user?.lastName?.slice(0, 1)}
                          </Avatar>
                          <div>
                            {user.firstName +
                              " " +
                              user.lastName +
                              " (" +
                              user.username +
                              ")"}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
              <Label style={{ marginBottom: "0.2rem" }}>Начало</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      dayjs(startDate).format("YYYY-MM-DD")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(startDate)}
                    onSelect={(value) =>
                      setStart(dayjs(value).format("YYYY-MM-DD"))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Label style={{ marginBottom: "0.2rem" }}>Конец </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !finishDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {finishDate ? (
                      dayjs(finishDate).format("YYYY-MM-DD")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(finishDate)}
                    onSelect={(value) =>
                      setFinish(dayjs(value).format("YYYY-MM-DD"))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            {errorMessage === "" ? (
              <div></div>
            ) : (
              <p style={{ margin: "2rem 0", color: "red" }}>{errorMessage}</p>
            )}
          </div>
          <div style={{ marginTop: "2.5rem" }}>
            <Button
              className="bg-white border border-sky-300 text-black hover:text-white hover:bg-sky-600 ease-in-out"
              // className={styles.createProjectBtn}
              onClick={(e) => handleAddTask(e)}
            >
              Добавить задачу
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTaskModal;
