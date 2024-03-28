import styles from "./styles.module.css";
import {useState, Dispatch, SetStateAction} from 'react'
import { IStage, IUserRights } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Droppable, Draggable } from "react-beautiful-dnd";
import Task from "../task";
import { TurnOffDefaultPropsWarning } from "@/components/turnOffDefaultPropsWarning";
import {X, Plus} from 'lucide-react'

interface IStageProps {
  stage: IStage;
  handleDeleteStage: (id: string) => void;
  onClick: () => void;
  setFetch: Dispatch<SetStateAction<boolean>>;
  rights: IUserRights
}

export default function Stage({ stage, onClick, handleDeleteStage, setFetch, rights }: IStageProps) {
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
        {rights.canDeleteStage ? 
        <X className={styles.closeBtn} size={24} onClick={() => setIsModalOpen(true)}/> : <></> }
      </div>
      <div style={{ flexGrow: "20", width: "90%", margin: "8px 0px" }}>
        {rights.canAddTask ? 
        <Button className={styles.addbutton} onClick={onClick}>
          <Plus style={{ color: "inherit" }} size={16}/>
        </Button>
        : <div></div> }
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
                          style={{
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
      <Dialog
        open={isModalOpen}
        // onClose={() => setIsModalOpen(false)}
        // style={{
        //   display: "flex",
        //   justifyContent: "center",
        //   alignSelf: "center",
        //   alignContent: "center",
        // }}
      >
        <DialogContent>
        <div
          className="gap-4"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            width: "100%",
            minHeight: "6rem",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <Label style={{ color: "black", alignSelf: "center" }}>
            Вы действительно хотите удалить стадию?
          </Label>
          <div style={{ display: "flex", alignSelf: "center" }}>
            <Button
              onClick={() => handleDeleteStage(stage.id)}
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
    </div>
  );
}
