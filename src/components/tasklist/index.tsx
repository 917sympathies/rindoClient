"use client";
import styles from "./styles.module.css";
import { useCallback } from "react";
import { IProject, ITask } from "@/types";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState, useEffect } from "react";
import TaskModal from "../kanban/task/taskModal";
import Modal from "@mui/material/Modal/Modal";
// import { TextareaAutosize } from '@mui/base';
import Avatar from "@mui/material/Avatar/Avatar";
import { Trash2, PencilLine } from "lucide-react";

interface TaskListProps {}

export default function TaskList({}: TaskListProps) {
  const { id } = useParams<{ id: string }>();
  const [toFetch, setFetch] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<ITask[]>([] as ITask[]);
  const [task, setTask] = useState<ITask>({} as ITask);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    getTasks(id);
  }, [id]);

  useEffect(() => {
    if (toFetch) {
      getTasks(id);
      setFetch(false);
    }
  }, [toFetch]);

  const getTasks = async (id: string) => {
    const response = await fetch(
      `http://localhost:5000/api/task/?projectId=${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const data = await response.json();
    console.log(data);
    setTasks(data);
  };

  const openModal = (task: ITask) => {
    setTask(task);
    setIsModalOpen(true);
  };

  const handleOpenModal = useCallback(
    (taskId?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (taskId) params.set("task", taskId);
      else params.delete("task");
      return params.toString();
    },
    [searchParams]
  );

  return (
    <>
      <div className={styles.container}>
        {tasks && tasks.length != 0 ? (
          tasks.map((task) => (
            <div className={styles.taskcontainer} key={task.id}>
              <div className={styles.header}>
                <div>
                  <p>{task.name}</p>
                </div>
                <div>
                  {/* <p style={{fontSize: "0.7rem", margin: "0.2rem 0.8rem", }}>{task.description}</p> */}
                  <textarea
                    style={{
                      fontSize: "0.7rem",
                      margin: "0.4rem 1.8rem",
                      border: "0",
                      resize: "none",
                      fontFamily: "inherit",
                      padding: "0.4rem",
                      backgroundColor: "inherit",
                      overflow: "hidden"
                    }}
                    disabled
                    cols={40}
                    rows={4}
                    value={task.description}
                  ></textarea>
                  {/* <TextareaAutosize value={task.description} cols={70} maxRows={4} disabled style={{
                      fontSize: "0.7rem",
                      margin: "0.4rem 1.8rem",
                      border: "0",
                      resize: "none",
                      fontFamily: "inherit",
                      padding: "0.4rem",
                      backgroundColor: "inherit",
                      overflow: "hidden",
                      textOverflow: "clip"
                    }}/> */}
                </div>
                <div>
                  {/* {task.responsibleUserId ? 
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      margin: "0.2rem 0",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#4198FF",
                        width: "2.5vh",
                        height: "2.5vh",
                        fontSize: "0.6rem",
                        margin: "0.1rem",
                        marginLeft: "0.4rem",
                      }}
                      src="/static/images/avatar/1.jpg"
                    >
                      {responsibleUser?.firstName?.slice(0, 1)}
                      {responsibleUser?.lastName?.slice(0, 1)}
                    </Avatar>
                  </div>
                  : <div></div> } */}
                </div>
              </div>
              <div className={styles.taskbody}></div>
              <div>
                <PencilLine
                  className={styles.btn}
                  size={16}
                  onClick={() =>
                    router.push(pathname + "?" + handleOpenModal(task.id))
                  }
                />
                <Trash2 className={styles.btn} size={16} />
              </div>
            </div>
          ))
        ) : (
          <div>
            <h2 style={{ color: "rgba(1,1,1, 0.6)", margin: "4rem" }}>
              В этом проекте пока нет никаких задач!
            </h2>
          </div>
        )}
      </div>
      <div>
        <Modal
          open={searchParams.has("task")}
          onClose={() => {}}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignSelf: "center",
            alignContent: "center",
          }}
        >
          <div>
            <TaskModal
              onClose={() => router.push(pathname + "?" + handleOpenModal())}
              setFetch={setFetch}
            ></TaskModal>
          </div>
        </Modal>
      </div>
    </>
  );
}
