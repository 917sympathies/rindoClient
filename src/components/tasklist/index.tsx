'use client'
import styles from "./styles.module.css";
import { useCallback } from "react";
import { IProject, ITask } from "@/types";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import TaskModal from "../kanban/task/taskModal";
import Modal from "@mui/material/Modal/Modal";
import { Trash2, PencilLine  } from "lucide-react";

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

  const handleOpenModal = useCallback((taskId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if(taskId) params.set("task", taskId);
    else params.delete("task");
    return params.toString();
  }, [searchParams]);

  return (
    <>
      <div className={styles.container} >
        {tasks && tasks.length != 0 ? (
          tasks.map((task) => (
            <div
              className={styles.taskcontainer}
              key={task.id}
            >
              <div className={styles.header}>
                <p>{task.name}</p>
                <PencilLine className={styles.btn} size={16} onClick={() => router.push(pathname + "?" + handleOpenModal(task.id))}/>
              </div>
              <div className={styles.taskbody}>
                <div>
                <p>{task.description}</p>
                </div>
                <Trash2 className={styles.btn} size={16}/>
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
