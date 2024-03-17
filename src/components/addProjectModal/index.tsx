'use client'
import styles from "./styles.module.css";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import {
  Box,
  Button,
  Input,
  InputBase,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import React from 'react';
import dynamic from 'next/dynamic';
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"
import { CookieInfo } from "@/types";
import { LocalizationProvider, DatePicker  } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";

const CustomEditor = dynamic( () => {
  return import( '../editor/CustomEditor' );
}, { ssr: false } );

interface IAddProjectModalProps {
  setFetch: Dispatch<SetStateAction<boolean>>,
  onClose: () => void;
}

interface IProjectDto{
  name: string,
  description: string,
  ownerId: string,
  startDate: string,
  finishDate: string
}

const AddProjectModal = ({ setFetch, onClose }: IAddProjectModalProps) => {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(['test-cookies']);
  const [project, setProject] = useState<IProjectDto>({} as IProjectDto);
  const [startDate, setStart] = useState(dayjs().format('YYYY-MM-DD'))
  const [finishDate, setFinish] = useState(dayjs().format('YYYY-MM-DD'))
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const handleCreateProject = async () => {
    const token = cookies["test-cookies"];
    if(token === undefined) router.push("/login");
    const decoded = jwtDecode(token) as CookieInfo;
    project.ownerId = decoded.userId;
    const response = await fetch("http://localhost:5000/api/project", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        body: JSON.stringify(project)
    });
    const data = await response.json()
    if(data.errors === undefined){
      setFetch(true);
      onClose();
    }
    else{
        if (data.errors.Name !== undefined) setErrorMessage(data.errors.Name);
    }
  }

  useEffect(() => {
    setProject((prevState) => ({
        ...prevState,
        finishDate: finishDate,
      }));
  }, [finishDate])

  useEffect(() => {
    setProject((prevState) => ({
        ...prevState,
        startDate: startDate,
      }));
  }, [startDate])

  useEffect(() => {
    setProject((prevState) => ({
        ...prevState,
        description: desc,
      }));
  }, [desc])

  const handleChangeStartDate = (date: any) => {
      const temp = dayjs(date.toDate()).format('YYYY-MM-DD')
      setStart(temp);
  }

  const handleChangeFinishDate = (date : any) => {
      const temp = dayjs(date.toDate()).format('YYYY-MM-DD')
      setFinish(temp);
  }

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
            Новый проект
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
              Название проекта
            </Typography>
            <TextField
              onChange={(event) => {
                setErrorMessage("");
                setProject((prevState) => ({
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
              Описание проекта
            </Typography>
            <div
              style={{
                position: "relative",
                overflowX: "hidden",
                overflowY: "auto",
                maxWidth: "100%",
              }}
            >
                <CustomEditor
                    // initialData={desc}
                    setState={setDesc}
                />
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'ru'}>
              <div style={{display:"flex", flexDirection: "column"}}>
                <div style={{marginBottom: "0.8rem"}}>
                <DatePicker label={"Выберите дату начала проекта"} defaultValue={dayjs()}
                onChange={(date) => {
                  if(date != null)
                    handleChangeStartDate(date);
                }}/>
                </div>
                <div>
                <DatePicker label={"Выберите дату конца проекта"} defaultValue={dayjs()}
                onChange={(date) => {
                  if(date != null)
                    handleChangeFinishDate(date);
                }}/>
                </div>
              </div>
            </LocalizationProvider>
          </div>
          <div>
            {errorMessage === "" ? <div></div> : <p style={{margin: "2rem 0", color: "red"}}>{errorMessage}</p>}
          </div>
          <div style={{ marginTop: "2.5rem" }}>
            <Button
              variant="outlined"
              className={styles.createProjectBtn}
              onClick={() => handleCreateProject()}
            >
              Создать проект
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProjectModal;
