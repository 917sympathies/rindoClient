"use client";
import styles from "./styles.module.css";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ITask, ITaskComment, IUser, IUserInfo, ICookieInfo } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { ArrowDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { X, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import Editor from "@/components/editor";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";
import { useCookies } from "react-cookie";
import { Input } from "@/components/ui/input";

interface ITaskModalProps {
  onClose: () => void;
  setFetch: Dispatch<SetStateAction<boolean>>;
}

interface IStageDto {
  id: string;
  name: string;
}

const TaskModal = ({ onClose, setFetch }: ITaskModalProps) => {
  const [isActive] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const [cookies] = useCookies();
  const [currentTask, setTask] = useState<ITask | null>(null);
  const [responsibleUser, setResponsibleUser] = useState<IUser>({
    username: "Все",
  } as IUser);
  const [statusList, setStatusList] = useState<IStageDto[]>([]);
  const [status, setStatus] = useState<IStageDto>();
  const [desc, setDesc] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [finishDate, setFinishDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [startDate, setStartDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [isModified, setIsModified] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conn, setConnection] = useState<HubConnection | null>(null);
  const [taskComments, setTaskComments] = useState<ITaskComment[]>([]);

  useEffect(() => {
    getTaskInfo();
    getUserId();
  }, []);

  useEffect(() => {
    if (!currentTask) return;
    if (desc !== currentTask.description) setIsModified(true);
    else setIsModified(false);
  }, [desc]);

  useEffect(() => {
    if (!currentTask) return;
    if (currentTask.responsibleUserId === null)
      setResponsibleUser((prev) => ({
        ...prev,
        username: "Все",
      }));
    else {
      getUserInfo(currentTask.responsibleUserId);
    }
    setDesc(currentTask.description);
    if (currentTask.comments) setTaskComments(currentTask.comments);
    setStartDate(dayjs(currentTask.startDate).format("YYYY-MM-DD"));
    setFinishDate(dayjs(currentTask.finishDate).format("YYYY-MM-DD"));
  }, [currentTask]);

  useEffect(() => {
    if (currentTask && statusList !== undefined) {
      const currentStatus = statusList.find(
        (st) => st.id === currentTask.stageId
      );
      setStatus(currentStatus);
    }
  }, [statusList]);

  const getUserId = () => {
    // const token = cookies["test-cookies"];
    // if (!token) return;
    // const decoded = jwtDecode(token) as ICookieInfo;
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
  };

  const handleChangeFinishDate = async (date: any) => {
    const temp = dayjs(date.toDate()).format("YYYY-MM-DD");
    setFinishDate(temp);
  };

  const handleChangeStartDate = async (date: any) => {
    const temp = dayjs(date.toDate()).format("YYYY-MM-DD");
    setStartDate(temp);
  };

  const handleSaveChanges = async () => {
    const taskId = searchParams.get("task");
    if (!taskId) return;
    const response = await fetch(
      `http://localhost:5000/api/task/${taskId}/description?description=${desc}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (response.ok) setIsModified(false);
  };

  const getTaskInfo = async () => {
    const taskId = searchParams.get("task");
    if (!taskId) return;
    const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    getStagesInfo(data.value);
    setTask(data.value);
  };

  const handleChangeStage = async (stageName: string | undefined) => {
    const taskId = searchParams.get("task");
    if (!taskId || stageName === undefined) return;
    const stage = statusList?.find((st) => st.name === stageName);
    const response = await fetch(
      `http://localhost:5000/api/stage/${stage?.id}?taskId=${taskId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    setStatus(stage);
  };

  const getStagesInfo = async (task: ITask) => {
    const response = await fetch(
      `http://localhost:5000/api/stage?projectId=${task.projectId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const data = await response.json();
    setStatusList(data);
  };

  const getUserInfo = async (id: string) => {
    const response = await fetch(`http://localhost:5000/api/user/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    setResponsibleUser(data);
  };

  const handleDelete = async () => {
    if (!currentTask) return;
    const response = await fetch(
      `http://localhost:5000/api/task/${currentTask.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    console.log(response);
    setFetch(true);
    onClose();
  };

  useEffect(() => {
    async function start() {
      let connection = new HubConnectionBuilder()
        .withUrl(`http://localhost:5000/chat`)
        .build();
      setConnection(connection);
      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
      } else {
        console.log("Already connected");
      }
    }
    if (isActive) start();
  }, [isActive]);

  try {
    if (conn) {
      const taskId = searchParams.get("task");
      if (!taskId) return;
      conn.on(`ReceiveTask${taskId}`, (comment) => {
        //const str = {content: message, user: user} as ITaskComment;
        setTaskComments([...taskComments, comment]);
        // console.log(taskComments)
        // setChat((prevState) => ({
        //   ...prevState,
        //   messages: [...messages, str],
        // }));
      });
    }
  } catch (exception) {
    console.log(exception);
  }

  try {
    if (conn) {
      conn.on(`HelloMsg`, (message) => {
        console.log(message);
      });
    }
  } catch (exception) {
    console.log(exception);
  }

  const sendMessage = async () => {
    if (!conn) return;
    const taskId = searchParams.get("task");
    if (!taskId || !currentUserId) return;
    if (conn.state === HubConnectionState.Connected) {
      conn.invoke("SendTask", currentUserId, message, taskId);
      setMessage("");
    } else {
      console.log("sendMsg: " + conn.state);
    }
  };

  return (
    <div className={styles.containertaskmodal}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(1, 1, 1, 0.1)",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "0.4rem",
          }}
        >
          <Label
            style={{
              color: "black",
              fontSize: "2rem",
              flexGrow: "5",
              textAlign: "center",
            }}
          >
            {currentTask?.name}
          </Label>
          <X
            onClick={() => {
              onClose();
              setFetch(true);
            }}
            className={styles.closeBtn}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <div style={{ width: "80%", margin: "1rem 3rem" }}>
            <Label
              style={{
                color: "black",
                fontSize: "2rem",
                flexGrow: "5",
                // textAlign: "flex-start",
              }}
            >
              Описание
            </Label>
            <Editor desc={desc} setDesc={setDesc} />
            {/* <CustomEditor
              initialData={currentTask?.description}
              setState={setDesc}
            /> */}
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              style={{
                width: "40%",
                padding: "0.3rem 0",
                margin: "1rem 3rem",
                display: "flex",
                flexDirection: "row",
                // borderBottom: "1px solid rgba(1, 1, 1, 0.1)",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* <Label
                id="responsibleinput"
                style={{ color: "black", marginRight: "1rem" }}
              >
                Исполнитель
              </Label> */}
              <Select
                // className={styles.select}
                value={responsibleUser.username}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    key={responsibleUser.id}
                    value={responsibleUser.username}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {responsibleUser.username !== "Все" ? (
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
                          {responsibleUser?.firstName?.slice(0, 1)}
                          {responsibleUser?.lastName?.slice(0, 1)}
                        </Avatar>
                      ) : (
                        <div></div>
                      )}
                      <div>
                        {responsibleUser.username !== "Все"
                          ? responsibleUser.lastName +
                            " " +
                            responsibleUser.firstName
                          : "Все"}
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              style={{
                width: "40%",
                padding: "0.3rem 0",
                margin: "1rem 3rem",
                display: "flex",
                flexDirection: "row",
                // borderBottom: "1px solid rgba(1, 1, 1, 0.1)",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* <Label
                id="statusinput"
                style={{ color: "black", marginRight: "1rem" }}
              >
                Статус
              </Label> */}
              <Select
                // className={styles.select}
                // placeholder="Выберите"
                value={status?.name || ""}
                onValueChange={(value) => handleChangeStage(value)}
                // onChange={(e) => handleChangeStage(e.target.value)}
              >
                {/* <SelectValue placeholder="Выберите" ></SelectValue> */}
                <SelectTrigger className="SelectTrigger" aria-label="Food">
                  <SelectValue placeholder="Выберите стадию" />
                </SelectTrigger>
                <SelectContent>
                  {statusList &&
                    statusList?.map((status) => (
                      <SelectItem
                        key={status.id}
                        value={status.name.toString()}
                      >
                        {status.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "1rem 3rem",
                padding: "0.6rem 0",
                width: "40%",
              }}
            >
              <Label style={{ marginBottom: "0.2rem" }}>Начало</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal w-full",
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
                      setStartDate(dayjs(value).format("YYYY-MM-DD"))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "1rem 3rem",
                padding: "0.6rem 0",
                width: "40%",
              }}
            >
              <Label style={{ marginBottom: "0.2rem" }}>Конец</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal w-full",
                      !finishDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
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
                      setFinishDate(dayjs(value).format("YYYY-MM-DD"))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div
                  style={{
                    margin: "1rem 3rem",
                    padding: "0.6rem 0",
                    width: "40%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(1, 1, 1, 0.1)",
                  }}
                >
                  <Label
                    id="statusinput"
                    style={{ color: "black", marginRight: "1rem" }}
                  >
                    Дата начала
                  </Label>
                  <DatePicker
                    label={"Выберите начало"}
                    format="YYYY-MM-DD"
                    value={currentTask && dayjs(currentTask.startDate)}
                    defaultValue={dayjs()}
                    onChange={(date) => {
                      if (date != null) handleChangeStartDate(date);
                    }}
                  />
                </div>
                <div
                  style={{
                    margin: "1rem 3rem",
                    padding: "0.6rem 0",
                    width: "40%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(1, 1, 1, 0.1)",
                  }}
                >
                  <Label
                    id="statusinput"
                    style={{ color: "black", marginRight: "1rem" }}
                  >
                    Дата начала
                  </Label>
                  <DatePicker
                    label={"Выберите конец"}
                    format="YYYY-MM-DD"
                    value={currentTask && dayjs(currentTask.finishDate)}
                    defaultValue={dayjs()}
                    onChange={(date) => {
                      if (date != null) handleChangeFinishDate(date);
                    }}
                  />
                </div>
              </div>
            </LocalizationProvider> */}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginRight: "4rem",
              marginLeft: "3rem",
            }}
          >
            <Button
              className={isModified ? "border border-green-500 bg-white text-green-500 hover:bg-green-500 hover:text-white ease-in-out duration-300" : "invisible"}
              // style={
              //   isModified
              //     ? { border: "1px solid #1976d2" }
              //     : { visibility: "hidden" }
              // }
              onClick={() => handleSaveChanges()}
            >
              Применить
            </Button>
            <Button
              className="bg-white text-red-700 border border-red-700 hover:bg-red-500 hover:text-white"
              // style={{ color: "red", border: "1px solid red" }}
              onClick={() => setIsModalOpen(true)}
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        // onClose={() => setIsModalOpen(false)}
        // style={{
        //   display: "flex",
        //   justifyContent: "center",
        //   alignSelf: "center",
        //   alignContent: "center",
        // }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "white",
              width: "100%",
              gap: 8,
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            <Label style={{ color: "black", alignSelf: "center" }}>
              Вы действительно хотите удалить задачу?
            </Label>
            <div style={{ display: "flex", alignSelf: "center" }}>
              <Button
                onClick={() => handleDelete()}
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
      <div className={styles.chat}>
        <div className={styles.container}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              padding: "0.6rem 0.6rem",
              justifyContent: "space-between",
            }}
          >
            <Label
              style={{
                fontSize: "1.2rem",
                marginLeft: "2rem",
                color: "rgb(114, 115, 118)",
              }}
            >{`Комментарии`}</Label>
            <X onClick={onClose} className={styles.closeBtn} />
          </div>
          <div
            style={{
              maxHeight: "48vh",
              minHeight: "48vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "0 1rem",
            }}
          >
            {taskComments.map((message, index) =>
              currentUserId && message.userId === currentUserId ? (
                <div key={index}>
                  <div
                  // style={{
                  //   display: `${
                  //     moment(message?.createdAt).format("DD.MM") !==
                  //     moment(discussion?.message[index - 1]?.createdAt).format(
                  //       "DD.MM"
                  //     )
                  //       ? ""
                  //       : "none"
                  //   }`,
                  // }}
                  >
                    <Label
                      style={{
                        textAlign: "center",
                        fontSize: ".8rem",
                        color: "#87888C",
                        textTransform: "capitalize",
                      }}
                    >
                      {/* {message ? moment(message.createdAt).format("DD.MM") : ""} */}
                    </Label>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      margin: ".15rem 0",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#3288F0",
                        padding: ".2rem .8rem",
                        borderRadius: ".6rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <Label
                          style={{
                            textTransform: "capitalize",
                            fontWeight: "500",
                            fontSize: ".9rem",
                            color: "white",
                          }}
                        >
                          {message.content}
                        </Label>
                        <Label
                          style={{
                            textTransform: "capitalize",
                            fontSize: ".6rem",
                            fontWeight: "500",
                            color: "white",
                            marginLeft: ".5rem",
                          }}
                        >
                          {/* {moment(message.createdAt).format("HH:mm")} */}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={index}>
                  <div
                  // style={{
                  //   display: `${
                  //     moment(message?.createdAt).format("DD.MM") !==
                  //     moment(discussion?.message[index - 1]?.createdAt).format(
                  //       "DD.MM"
                  //     )
                  //       ? ""
                  //       : "none"
                  //   }`,
                  // }}
                  >
                    <Label
                      style={{
                        textAlign: "center",
                        fontSize: ".8rem",
                        color: "#87888C",
                        textTransform: "capitalize",
                      }}
                    >
                      {/* {message ? moment(message.createdAt).format("DD.MM") : ""} */}
                    </Label>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      margin: ".15rem 0",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#ECF0F3",
                        padding: ".2rem .8rem",
                        borderRadius: ".6rem",
                      }}
                    >
                      <Label color={"#87888C"} style={{ fontSize: ".7rem" }}>
                        {message.username}
                      </Label>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <Label
                          style={{
                            textTransform: "capitalize",
                            fontWeight: "500",
                            fontSize: ".9rem",
                            color: "black",
                          }}
                        >
                          {message.content}
                        </Label>
                        <Label
                          style={{
                            textTransform: "capitalize",
                            fontWeight: "500",
                            fontSize: ".6rem",
                            color: "black",
                            marginLeft: ".9rem",
                          }}
                        >
                          {/* {moment(message.createdAt).format("HH:mm")} */}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                backgroundColor: "#ECF0F3",
                padding: ".4rem .8rem",
                borderRadius: ".6rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: ".5rem 0 1vh 0",
                width: "80%",
                gap: 8,
              }}
            >
              <Input
                style={{ flex: 1, fontSize: ".9rem" }}
                placeholder="Написать сообщение..."
                // inputProps={{ "aria-label": "Написать сообщение..." }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Send
                style={{
                  fontSize: ".9rem",
                  color: "rgba(102, 153, 255, 0.6)",
                  // "&:hover": { color: "rgba(102, 153, 255, 0.3)" },
                }}
                onClick={() => sendMessage()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
