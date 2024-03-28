"use client";
import styles from "./styles.module.css";
//import stageStyles from "./stage/styles.module.css";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IProject, ITask, IStageDto, IStage } from "@/types";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Droppable,
  Draggable,
  DragDropContext,
  DropResult,
} from "react-beautiful-dnd";
import Stage from "./stage";
import AddTaskModal from "../addTaskModal";
import { IUserRights } from "@/types";


export default function Kanban() {
  const { id } = useParams<{ id: string }>();
  const [stages, setStages] = useState<IStage[] | null>(null);
  // const [project, setProject] = useState<IProject | null>(null);
  const [toFetch, setFetch] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stageSelected, setStageSelected] = useState<string>("");
  const [newStageName, setNewStageName] = useState<string>("");
  const [rights, setRights] = useState<IUserRights>({} as IUserRights);
  const [canAddStage, setCanAddStage] = useState<boolean>(
    stages?.length !== 3
  );

  useEffect(() => {
    //getProjectInfo(id);
    getStages(id);
    getRights();
  }, [id]);

  useEffect(() => {
    if (toFetch) {
      //getProjectInfo(id);
      getStages(id);
      setFetch(false);
    }
  }, [toFetch]);

  const getRights = async () => {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`http://localhost:5000/api/role/${id}/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    setRights(data)
    console.log(data)
  }

  const handleAddStage = async () => {
    setCanAddStage(false);
    const response = await fetch(`http://localhost:5000/api/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({name: newStageName, projectId: id} as IStageDto)
    });
    setFetch(true);
  }

  const handleDeleteStage = async (id: string) => {
    setCanAddStage(true);
    const response = await fetch(`http://localhost:5000/api/stage/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    setFetch(true);
  }

  // const getProjectInfo = async (id: string) => {
  //   const response = await fetch(`http://localhost:5000/api/project/${id}`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //     credentials: "include",
  //   });
  //   const data = await response.json();
  //   console.log(data);
  //   setProject(data);
  // };

  const getStages = async(id: string) => {
    const response = await fetch(`http://localhost:5000/api/stage?projectId=${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    setStages(data);
  }

  async function onDragEnd({ source, destination }: DropResult) {
    if (!source || !destination) return;
    if (source.droppableId === destination.droppableId) return;
    const tasksSource = stages?.filter(
      (st) => st.id === source.droppableId
    )[0].tasks;
    const item = tasksSource?.splice(source.index, 1)[0] as ITask;
    const tasksDest = stages?.filter(
      (st) => st.id === destination?.droppableId
    )[0];
    if (item && destination) item.stageId = destination.droppableId;
    if (tasksDest!.tasks === undefined) tasksDest!.tasks = Array(item);
    else tasksDest?.tasks.splice(destination!.index, 0, item);

    const response = await fetch(
      `http://localhost:5000/api/project/${id}/stages`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(stages),
      }
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          {stages &&
            stages.map((stage) => (
              <Stage
                stage={stage}
                key={stage.id}
                onClick={() => {
                  setIsModalOpen(true);
                  setStageSelected(stage.id);
                }}
                handleDeleteStage={handleDeleteStage}
                setFetch={setFetch}
                rights={rights}
              />
            ))}
        </DragDropContext>
        {stages && rights.canAddStage && stages.length !== 4 ? (
          <div className={styles.container}>
            <Input
              className="rounded-none text-center border-0 bg-background  focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-slate-950 focus-visible:ring-offset-0"
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Название стадии"
              style={{
                flexGrow: 1,
              }}
            />
            <Button className={styles.addbutton} onClick={() => handleAddStage()}>
              Добавить стадию
            </Button>
          </div>
        ) : (
          <div></div>
        )}
        <Drawer
          direction={"right"}
          open={isModalOpen}
          onClose={() => {}}
          // sty={{ maxWidth: "40vw", width: "40vw" }}
        >
          <DrawerContent className='h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none'>
          <AddTaskModal
            onClose={() => setIsModalOpen(false)}
            // projectId={project?.id}
            stageId={stageSelected}
            setFetch={setFetch}
            // users={project?.users && [...project?.users, project?.owner]}
          />
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
