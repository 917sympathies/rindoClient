import styles from "./styles.module.css";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ITask, ITaskComment, IUser, IUserInfo, ICookieInfo } from "@/types";
import {
  Button,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  InputBase,
} from "@mui/material";
import { X, Send } from "lucide-react";
//import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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

// const CustomEditor = dynamic(
//   () => {
//     return import("../../../editor/CustomEditor");
//   },
//   { ssr: false }
// );

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
  const [finishDate, setFinishDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
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
    setStartDate(currentTask.startDate);
    setFinishDate(currentTask.finishDate);
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
    const token = cookies["test-cookies"];
    if (!token) return;
    const decoded = jwtDecode(token) as ICookieInfo;
    setCurrentUserId(decoded.userId);
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
          <Typography
            sx={{
              color: "black",
              fontSize: "2rem",
              flexGrow: "5",
              textAlign: "center",
            }}
          >
            {currentTask?.name}
          </Typography>
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
            <Typography
              sx={{
                color: "black",
                fontSize: "2rem",
                flexGrow: "5",
                textAlign: "flex-start",
              }}
            >
              Описание
            </Typography>
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
                borderBottom: "1px solid rgba(1, 1, 1, 0.1)",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                id="responsibleinput"
                style={{ color: "black", marginRight: "1rem" }}
              >
                Исполнитель
              </InputLabel>
              <Select
                labelId="responsibleinput"
                className={styles.select}
                value={responsibleUser.username}
              >
                <MenuItem
                  key={responsibleUser.id}
                  value={responsibleUser.username}
                >
                  {responsibleUser.username !== "Все"
                    ? responsibleUser.lastName + " " + responsibleUser.firstName
                    : "Все"}
                </MenuItem>
              </Select>
            </div>
            <div
              style={{
                width: "40%",
                padding: "0.3rem 0",
                margin: "1rem 3rem",
                display: "flex",
                flexDirection: "row",
                borderBottom: "1px solid rgba(1, 1, 1, 0.1)",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                id="statusinput"
                style={{ color: "black", marginRight: "1rem" }}
              >
                Статус
              </InputLabel>
              <Select
                labelId="statusinput"
                className={styles.select}
                placeholder="Выберите"
                value={status?.name || ""}
                onChange={(e) => handleChangeStage(e.target.value)}
              >
                {statusList &&
                  statusList?.map((status) => (
                    <MenuItem key={status.id} value={status.name}>
                      {status.name}
                    </MenuItem>
                  ))}
              </Select>
            </div>
          </div>
          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                  <InputLabel
                    id="statusinput"
                    style={{ color: "black", marginRight: "1rem" }}
                  >
                    Дата начала
                  </InputLabel>
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
                  <InputLabel
                    id="statusinput"
                    style={{ color: "black", marginRight: "1rem" }}
                  >
                    Дата начала
                  </InputLabel>
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
            </LocalizationProvider>
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
              style={
                isModified
                  ? { border: "1px solid #1976d2" }
                  : { visibility: "hidden" }
              }
              onClick={() => handleSaveChanges()}
            >
              Применить
            </Button>
            <Button
              style={{ color: "red", border: "1px solid red" }}
              onClick={() => setIsModalOpen(true)}
            >
              Удалить
            </Button>
          </div>
        </div>
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
            Вы действительно хотите удалить задачу?
          </Typography>
          <div style={{ display: "flex", alignSelf: "center" }}>
            <Button
              onClick={() => handleDelete()}
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
            <Typography
              sx={{
                fontSize: "1.2rem",
                marginLeft: "2rem",
                color: "rgb(114, 115, 118)",
              }}
            >{`Комментарии`}</Typography>
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
                    <Typography
                      sx={{
                        textAlign: "center",
                        fontSize: ".8rem",
                        color: "#87888C",
                        textTransform: "capitalize",
                      }}
                    >
                      {/* {message ? moment(message.createdAt).format("DD.MM") : ""} */}
                    </Typography>
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
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: ".9rem",
                            color: "white",
                          }}
                        >
                          {message.content}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: ".6rem",
                            color: "white",
                            ml: ".5rem",
                          }}
                        >
                          {/* {moment(message.createdAt).format("HH:mm")} */}
                        </Typography>
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
                    <Typography
                      sx={{
                        textAlign: "center",
                        fontSize: ".8rem",
                        color: "#87888C",
                        textTransform: "capitalize",
                      }}
                    >
                      {/* {message ? moment(message.createdAt).format("DD.MM") : ""} */}
                    </Typography>
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
                      <Typography color={"#87888C"} sx={{ fontSize: ".7rem" }}>
                        {message.username}
                      </Typography>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: ".9rem",
                            color: "black",
                          }}
                        >
                          {message.content}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: ".6rem",
                            color: "black",
                            ml: ".9rem",
                          }}
                        >
                          {/* {moment(message.createdAt).format("HH:mm")} */}
                        </Typography>
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
              }}
            >
              <InputBase
                sx={{ flex: 1, fontSize: ".9rem" }}
                placeholder="Написать сообщение..."
                inputProps={{ "aria-label": "Написать сообщение..." }}
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
