"use client";
import styles from "./styles.module.css";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ICookieInfo } from "@/types";
import { X } from "lucide-react";
import dayjs from "dayjs";
import Editor from "../editor";

// const CustomEditor = dynamic( () => {
//   return import( '../editor/CustomEditor' );
// }, { ssr: false } );

interface IAddProjectModalProps {
  setFetch: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
}

interface IProjectDto {
  name: string;
  description: string;
  ownerId: string;
  startDate: string;
  finishDate: string;
}

const AddProjectModal = ({ setFetch, onClose }: IAddProjectModalProps) => {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["test-cookies"]);
  const [project, setProject] = useState<IProjectDto>({} as IProjectDto);
  // const [startDate, setStart] = useState(dayjs().format('YYYY-MM-DD'))
  // const [finishDate, setFinish] = useState(dayjs().format('YYYY-MM-DD'))
  const [startDate, setStart] = useState(dayjs().format("YYYY-MM-DD"));
  const [finishDate, setFinish] = useState(dayjs().format("YYYY-MM-DD"));
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const handleCreateProject = async () => {
    if (new Date(startDate) > new Date(finishDate)) {
      setErrorMessage("Вы выбрали некорректные даты!");
      return;
    }
    const userId = localStorage.getItem("userId");
    project.ownerId = userId!;
    // const token = cookies["test-cookies"];
    // if (token === undefined) router.push("/login");
    // const decoded = jwtDecode(token) as ICookieInfo;
    // project.ownerId = decoded.userId;
    const response = await fetch("http://localhost:5000/api/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(project),
    });
    const data = await response.json();
    if (data.errors === undefined) {
      setFetch(true);
      onClose();
    } else {
      if (data.errors.Name !== undefined) setErrorMessage(data.errors.Name);
    }
  };

  useEffect(() => {
    setProject((prevState) => ({
      ...prevState,
      finishDate: finishDate,
    }));
  }, [finishDate]);

  useEffect(() => {
    setProject((prevState) => ({
      ...prevState,
      startDate: startDate,
    }));
  }, [startDate]);

  useEffect(() => {
    setProject((prevState) => ({
      ...prevState,
      description: desc,
    }));
  }, [desc]);

  const handleChangeStartDate = (date: any) => {
    const temp = dayjs(date.toDate()).format("YYYY-MM-DD");
    setStart(temp);
  };

  const handleChangeFinishDate = (date: any) => {
    const temp = dayjs(date.toDate()).format("YYYY-MM-DD");
    setFinish(temp);
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
              fontWeight: "500",
              color: "black",
              fontFamily: "inherit",
            }}
          >
            Новый проект
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
                fontWeight: "500",
                color: "black",
                marginBottom: ".5rem",
                fontFamily: "inherit",
              }}
            >
              Название проекта
            </Label>
            <Input
              onChange={(event) => {
                setErrorMessage("");
                setProject((prevState) => ({
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
                      <Label sx={{textTransform: 'lowercase', fontSize: '.8rem', color: 'black', ml: '.3rem'}}>Добавить тег</Label>
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
              Описание проекта
            </Label>
            <div
              style={{
                position: "relative",
                overflowX: "hidden",
                overflowY: "auto",
                maxWidth: "100%",
              }}
            >
              <Editor desc={desc} setDesc={setDesc} />
              {/* <CustomEditor
                    // initialData={desc}
                    setState={setDesc}
                /> */}
            </div>
          </div>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Label style={{ marginBottom: "0.2rem" }}>Начало проекта</Label>
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
              <Label style={{ marginBottom: "0.2rem" }}>Конец проекта</Label>
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
