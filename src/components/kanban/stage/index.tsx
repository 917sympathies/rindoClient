import styles from "./styles.module.css";
import {useState, Dispatch, SetStateAction} from 'react'
import { IStage } from "@/types";
import { Button } from "@mui/material";
import { Droppable, Draggable } from "react-beautiful-dnd";
import Task from "../task";
import { TurnOffDefaultPropsWarning } from "@/components/turnOffDefaultPropsWarning";
import {X, Plus} from 'lucide-react'

interface IStageProps {
  stage: IStage;
  handleDeleteStage: (id: string) => void;
  onClick: () => void;
  setFetch: Dispatch<SetStateAction<boolean>>;
}

export default function Stage({ stage, onClick, handleDeleteStage, setFetch }: IStageProps) {
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TurnOffDefaultPropsWarning/>
        <p style={{ margin: "0", display: "flex", justifyContent: "center" }}>
          {stage.name}
        </p>
        <X className={styles.closeBtn} size={16} onClick={() => handleDeleteStage(stage.id)}/>
      </div>
      <div style={{ flexGrow: "20", width: "90%", margin: "8px 0px" }}>
        <Button className={styles.addbutton} onClick={onClick}>
          <Plus style={{ color: "inherit" }} size={16}/>
        </Button>
        <Droppable key={stage.name} droppableId={stage.id}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ minHeight: "2rem" }}
            >
              {stage &&
                stage.tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                      >
                        <Task key={task.id} task={task} setFetch={setFetch}/>
                        {/* <Modal
                          open={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignSelf: "center",
                            alignContent: "center",
                          }}
                        >
                          <TaskModal
                            task={task}
                            onClose={() => setIsModalOpen(false)}
                          />
                        </Modal> */}
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
