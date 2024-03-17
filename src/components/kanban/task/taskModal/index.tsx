import styles from "./styles.module.css";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ITask, IUser } from "@/types";
import {
  Button,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Modal
} from "@mui/material";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const CustomEditor = dynamic(
  () => {
    return import("../../../editor/CustomEditor");
  },
  { ssr: false }
);

interface ITaskModalProps {
  onClose: () => void;
  setFetch: Dispatch<SetStateAction<boolean>>;
}

interface IStageDto{
  id: string,
  name: string
}

const TaskModal = ({ onClose, setFetch }: ITaskModalProps) => {
  const searchParams = useSearchParams()
  const [currentTask, setTask] = useState<ITask | null>(null);
  const [responsibleUser, setResponsibleUser] = useState<IUser>({
    username: "Все",
  } as IUser);
  const [statusList, setStatusList] =  useState<IStageDto[]>([]);
  const [status, setStatus] = useState<IStageDto>();
  const [desc, setDesc] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)


  useEffect(() => {
    getTaskInfo();
  }, [])

  useEffect(() => {
    if(!currentTask) return;
    if (currentTask.responsibleUserId === null)
      setResponsibleUser((prev) => ({
        ...prev,
        username: "Все",
      }));
    else {
      console.log(currentTask)
      getUserInfo(currentTask.responsibleUserId);
    }
  }, [currentTask]);

  useEffect(() => {
    if(currentTask && statusList !== undefined){
      const currentStatus = statusList.find(st => st.id === currentTask.stageId);
      setStatus(currentStatus);
    }
  }, [statusList])

  const getTaskInfo = async() => {
    const taskId = searchParams.get("task")
    if(!taskId) return;
    const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    console.log(data.value)
    getStagesInfo(data.value);
    setTask(data.value);
  }

  const handleChangeStage = async (stageName: string | undefined) => {
    if(!currentTask || stageName === undefined) return;
    const stage = statusList?.find(st => st.name === stageName);
    const response = await fetch(`http://localhost:5000/api/stage/${stage?.id}?taskId=${currentTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    setStatus(stage);
  }

  const getStagesInfo = async (task: ITask) => {
    const response = await fetch(`http://localhost:5000/api/stage?projectId=${task.projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    console.log(data)
    setStatusList(data);
  }

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
    if(!currentTask) return;
    const response = await fetch(`http://localhost:5000/api/task/${currentTask.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    console.log(response);
    setFetch(true);
    onClose();
  };

  return (
    <div className={styles.containertaskmodal}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(1, 1, 1, 0.1)",
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
          <X onClick={() => {
            onClose();
            setFetch(true);
          }} className={styles.closeBtn} />
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
            <CustomEditor
              initialData={currentTask?.description}
              setState={setDesc}
            />
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
                  { responsibleUser.username !== "Все" ? responsibleUser.lastName + " " + responsibleUser.firstName : "Все"}
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
                {statusList && statusList?.map((status) => (
                  <MenuItem key={status.id} value={status.name}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginRight: "4rem",
            }}
          >
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
        <h1>Chat</h1>
      </div>
    </div>
  );
};

export default TaskModal;
