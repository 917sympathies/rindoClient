"use client";
import styles from "./styles.module.css";
import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { ITask, IUser } from "@/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import TaskModal from "./taskModal";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { PencilLine } from "lucide-react";
// import { Avatar } from "@/components/ui/avatar";

interface ITaskProps {
  task: ITask;
  setFetch: Dispatch<SetStateAction<boolean>>;
}

function Task({ task, setFetch }: ITaskProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [responsibleUser, setResponsibleUser] = useState<IUser | null>(null);
  const [commentsAmount, setCommentsAmount] = useState<number | null>(null);
  const [commentLabel, setCommentLabel] = useState<string>("комментариев");

  useEffect(() => {
    if (task.responsibleUserId !== null) getUserInfo(task.responsibleUserId);
    getCommentsCount();
  }, []);

  const getUserInfo = async (id: string) => {
    const response = await fetch(`http://localhost:5000/api/user/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    setResponsibleUser(data);
  };

  const getCommentsCount = async () => {
    const response = await fetch(
      `http://localhost:5000/api/comment?taskId=${task.id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const data = await response.json();
    setCommentsAmount(data);
    changeLabel(data);
  };

  const changeLabel = (data: number) => {
    if (data === 0 || (data > 4 && data < 21)) setCommentLabel("комментариев");
    else if (data > 1 && data < 5) setCommentLabel("комментария");
    else if (data === 1) setCommentLabel("комментарий");
    else {
      const val = data % 10;
      if (val === 0 || (val > 4 && val < 21)) setCommentLabel("комментариев");
      else if (val > 1 && val < 5) setCommentLabel("комментария");
      else if (val === 1) setCommentLabel("комментарий");
    }
  };

  const handleOpenModal = useCallback(
    (open: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (open) params.set("task", task.id);
      else params.delete("task");
      return params.toString();
    },
    [searchParams]
  );

  return (
    <>
      <div className={styles.container}>
        <p
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            // margin: "0rem 0.8rem",
            // borderBottom: "0.1rem solid #1111",
            color: "black",
            fontSize: "0.95rem",
            fontWeight: "600",
            margin: "0",
            padding: "0.8rem 1rem 0rem 1rem",
            textOverflow: "clip",
          }}
        >
          <div>{task.name}</div>
          <div
            className={styles.editBtn}
            onClick={() => router.push(pathname + "?" + handleOpenModal(true))}
          >
            <PencilLine size={16} color="rgb(102,102,102)" />
          </div>
        </p>
        <div style={{ fontSize: "0.7rem", margin: "0.2rem 0.8rem" }}>
          {/* {task.description} */}
          <textarea
            value={task.description}
            disabled
            cols={30}
            maxLength={100}
            style={{
              backgroundColor: "inherit",
              fontFamily: "inherit",
              resize: "none",
              border: "0",
              overflow: "hidden",
              height: "auto",
            }}
          ></textarea>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
            paddingBottom: "0.4rem",
            margin: "0 0.4rem",
          }}
        >
          <div>
            {responsibleUser == null ? (
              <>
                <p
                  style={{
                    margin: "0 0.4rem",
                    fontSize: "0.8rem",
                    padding: "0 0.6rem",
                    backgroundColor: "yellow",
                    borderRadius: "16px",
                  }}
                >
                  Для всех
                </p>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  margin: "0.2rem 0",
                }}
              >
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
                    alignItems: "center"
                  }}
                  // src="/static/images/avatar/1.jpg"
                >
                  {responsibleUser?.firstName?.slice(0, 1)}
                  {responsibleUser?.lastName?.slice(0, 1)}
                </Avatar>
                {/* <p style={{ margin: "0 0.4rem", fontSize: "1.2rem" }}>
                  {responsibleUser?.username}
                </p> */}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <MessageCircle style={{ marginRight: "0.4rem" }} size={16} />
            <div
              style={{
                marginRight: "0.4rem",
                fontFamily: "inherit",
                fontSize: "0.8rem",
              }}
            >
              {commentsAmount
                ? commentsAmount + " " + commentLabel
                : "0 комментариев"}
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={searchParams.get("task") === task.id}
        // onClose={() => setIsModalOpen(false)}
        // style={{
        //   display: "flex",
        //   justifyContent: "center",
        //   alignSelf: "center",
        //   alignContent: "center",
        // }}
      >
        <DialogContent style={{width: "140vh"}}>
          <TaskModal
            onClose={() => router.push(pathname + "?" + handleOpenModal(false))}
            setFetch={setFetch}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Task;
