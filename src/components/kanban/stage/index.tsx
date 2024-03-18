import styles from "./styles.module.css";
import {useState, Dispatch, SetStateAction} from 'react'
import { IStage } from "@/types";
import { Button, Modal, Typography } from "@mui/material";
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TurnOffDefaultPropsWarning/>
        <p style={{ margin: "0", display: "flex", justifyContent: "center" }}>
          {stage.name}
        </p>
        <X className={styles.closeBtn} size={16} onClick={() => setIsModalOpen(true)}/>
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
            Вы действительно хотите удалить стадию?
          </Typography>
          <div style={{ display: "flex", alignSelf: "center" }}>
            <Button
              onClick={() => handleDeleteStage(stage.id)}
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
    </div>
  );
}
