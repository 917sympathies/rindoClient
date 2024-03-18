"use client";
import styles from "./styles.module.css";
import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Input,
  InputBase,
  TextField,
  InputLabel,
  Typography,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
//import dynamic from "next/dynamic";
import { IProject, ITask, IUser } from "@/types";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
    setResponsibleUser(value);
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
          <Typography
            variant="body2"
            fontWeight="500"
            sx={{
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
          </Typography>
          <CloseIcon
            sx={{
              cursor: "pointer",
              borderRadius: "50%",
              fontSize: "1.2rem",
              "&:hover": {
                backgroundColor: "white",
                transition: "all .1s ease-in-out",
              },
              padding: ".5vh",
              transition: "all .1s ease-in-out",
            }}
            onClick={onClose}
          />
        </div>
        <div style={{ padding: "1rem 3rem" }}>
          <div style={{ marginBottom: ".5rem" }}>
            <Typography
              variant="body2"
              fontWeight="500"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: "capitalize",
                fontSize: "0.9rem",
                color: "black",
                mb: ".5rem",
                fontFamily: "inherit",
              }}
            >
              Название задачи
            </Typography>
            <TextField
              onChange={(event) => {
                setTask((prevState) => ({
                  ...prevState,
                  name: event.target.value,
                }));
              }}
              placeholder="Без названия"
              variant="outlined"
              fullWidth
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-input": { padding: 0 },
                "& .MuiOutlinedInput-notchedOutline": { border: "unset " },
                "& .MuiOutlinedInput-root": {
                  fontSize: "2.7rem",
                  fontWeight: "700",
                  fontFamily: "inherit",
                },
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
                      <Box sx={{padding: '.1rem .7rem', mr: '.3rem',  backgroundColor: `#F4F6F8`, borderRadius: '3vh', display: 'inline-flex', flexDirection: 'row',alignItems: 'center', justifyContent: 'space-between', width: '6rem'}}>
                        <InputBase sx={{ fontSize: '.7rem', color: 'black', textTransform: 'capitalize', '& .MuiOutlinedInput-notchedOutline': { border: 'unset' }, '& .MuiOutlinedInput-input': { padding: 0 }, width: 'auto'}} value={e}
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
                        <ClearIcon sx={{color: 'black', fontSize: '.8rem', borderRadius: '50%', '&:hover': {backgroundColor: '#F4F6F8', cursor: 'pointer'}}}
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
                      <AddIcon sx={{color: 'black', fontSize: '.8rem', borderRadius: '50%', '&:hover': {backgroundColor: '#F4F6F8', cursor: 'pointer'}}}/>
                      <Typography sx={{textTransform: 'lowercase', fontSize: '.8rem', color: 'black', ml: '.3rem'}}>Добавить тег</Typography>
                    </div> */}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "calc(50vw - 6rem)",
            }}
          >
            <Typography
              variant="body2"
              fontWeight="500"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: "capitalize",
                fontSize: "0.9rem",
                color: "black",
                mt: "1.5rem",
                mb: ".5rem",
                fontFamily: "inherit",
              }}
            >
              Описание задачи
            </Typography>
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
              <Editor desc={desc} setDesc={setDesc}/>
              {/* <CustomEditor
                // initialData={desc}
                setState={setDesc}
              /> */}
              <InputLabel
                id="responsibleinput"
                style={{ marginTop: "10px", color: "black" }}
              >
                Ответственный
              </InputLabel>
              <Select
                labelId="responsibleinput"
                className={styles.select}
                value={responsibleUser}
                onChange={(e) => handleChangeResponsibleUser(e.target.value)}
              >
                {users &&
                  users.map((user) => (
                    <MenuItem key={user.username} value={user.id}>
                      <Avatar
                        sx={{
                          bgcolor: "#4198FF",
                          width: "4vh",
                          height: "4vh",
                          fontSize: "1rem",
                          marginRight: "0.4rem",
                        }}
                        src="/static/images/avatar/1.jpg"
                      >
                        {user?.firstName?.slice(0, 1)}
                        {user?.lastName?.slice(0, 1)}
                      </Avatar>
                      {user.firstName +
                        " " +
                        user.lastName +
                        " (" +
                        user.username +
                        ")"}
                    </MenuItem>
                  ))}
              </Select>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "0.8rem" }}>
                  <DatePicker
                    label={"Выберите дату начала проекта"}
                    defaultValue={dayjs()}
                    onChange={(date) => {
                      if (date != null) handleChangeStartDate(date);
                    }}
                  />
                </div>
                <div>
                  <DatePicker
                    label={"Выберите дату конца проекта"}
                    defaultValue={dayjs()}
                    onChange={(date) => {
                      if (date != null) handleChangeFinishDate(date);
                    }}
                  />
                </div>
              </div>
            </LocalizationProvider>
          </div>
          <div style={{ marginTop: "2.5rem" }}>
            <Button
              variant="outlined"
              className={styles.createProjectBtn}
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
