"use client";
import { ITask } from "@/types";
import {
  Gantt,
  Task,
  EventOption,
  StylingOption,
  ViewMode,
  DisplayOption,
} from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";

interface ITaskListHeader {
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
}

const TaskListHeader: React.FC<ITaskListHeader> = () => {
  return (
    <div
      style={{
        width: "100%",
        marginTop: "1.5rem",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        borderBottom: "1px solid rgba(1,1,1,0.1)",
      }}
    >
      <div>Название</div>
      <div>Дата начала</div>
      <div>Дата конца</div>
    </div>
  );
};

// const taskex = {
//     start: new Date(),
//     end: new Date(),
//     name: 'Пример',
//     id: 'Task 0',
//     type:'task',
//     progress: 50,
//     isDisabled: true,
//     styles: { progressColor: 'rgba(102, 153, 255, 0.6)', progressSelectedColor: '#ff9e0d' }
// }

const ExampleTask = [{
    start: new Date(),
        end: new Date(),
        name: 'Пример',
        id: 'Task 0',
        type:'task',
        progress: 50,
        isDisabled: true,
        styles: { progressColor: 'rgba(102, 153, 255, 0.6)', progressSelectedColor: '#ff9e0d' }
}] as Task[];

export default function GanttChart() {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newtasks, setnewTasks] = useState<ITask[]>([]);

  useEffect(() => {
    getTasks(id);
  }, [id])

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
    if(data.length <= 0) return;
    setTasks([]);
    data.map((task : ITask)  => {
        const startDate = new Date(dayjs(task.startDate).toString());
        const finishDate = new Date(dayjs(task.finishDate).toString());
        setTasks(tasks => [...tasks, {
            id: task.id,
            name: task.name, 
            type: 'task', 
            progress: 100,
            start: startDate, 
            end: finishDate, 
            isDisabled: true}])
    })
    console.log(tasks)
    //setTasks(data);
  };

  useEffect(() => {
    if(tasks.length > 0) console.log(tasks)
  }, [tasks])

  return (
    <div style={{color: "black", marginLeft: "4rem"}}>
        <Gantt
        locale="ru"
        tasks={tasks.length > 0 ? tasks : ExampleTask}
        fontFamily="inherit"
        TaskListHeader={TaskListHeader}
        barBackgroundColor="white"
        todayColor="rgba(102, 153, 255, 0.3)"
        onClick={(task) => console.log(task)}
        />
    </div>
  );
}
