"use client";
import styles from "./styles.module.css";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Send } from "lucide-react";
import { IChat, IUserInfo, IMessage, ICookieInfo } from "@/types";
import { jwtDecode } from "jwt-decode";
import { useCookies } from "react-cookie";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState
} from "@microsoft/signalr";

interface ChatProps {
  chatId: string | undefined;
  projectName: string | undefined;
  isActive: boolean;
  setIsChatActive: Dispatch<SetStateAction<boolean>>
}

export default function Chat({
  isActive,
  setIsChatActive,
  chatId,
  projectName,
}: ChatProps) {
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<IMessage[]>([])
  const [chat, setChat] = useState<IChat | null>(null);
  const [user, setUser] = useState<IUserInfo | null>(null);
  const [conn, setConnection] = useState<HubConnection | null>(null);
  const [cookies] = useCookies();

  useEffect(() => {
    const getChatInfo = async () => {
      const response = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      console.log(data)
      setChat(data.value);
      setChatMessages(data.value.messages)
    };
    const getUserInfo = async () => {
      // const token = cookies["test-cookies"];
      // if (!token) return;
      // const decoded = jwtDecode(token) as ICookieInfo;
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `http://localhost:5000/api/user/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      setUser(data);
    };
    getChatInfo();
    getUserInfo();
  }, [isActive]);

  // const joinChatRoom = async () => {
  //   try{
  //     const conn = new HubConnectionBuilder()
  //     .withUrl(`http://localhost:5000`)
  //     .configureLogging(LogLevel.Information)
  //     .build();
  //     conn.on('')
  //   }
  //   catch(e){
  //     console.log(e)
  //   }
  // }

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
    if(isActive) start();
  }, [isActive, chatId]);

  try {
    if(conn){
    conn.on(`ReceiveProject${chatId}`, (userId, username, message) => {
      const str = {senderId: userId, username: username, content: message} as IMessage;
      setChatMessages([...chatMessages, str]);
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
    if(conn){
    conn.on(`HelloMsg`, (message) => {
      console.log(message);
    });
  }
  } catch (exception) {
    console.log(exception);
  }

  const sendMessage = async () => {
    if(!conn) return;
    if (conn.state === HubConnectionState.Connected) {
      conn.invoke("SendProject", user?.id, message, chatId);
      setMessage("");
    } else {
      console.log("sendMsg: " + conn.state);
    }
  };

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "0.6rem 0.6rem",
          justifyContent: "space-between",
        }}
      >
        <Label
          style={{ fontSize: "1.2rem", marginLeft: "2rem" }}
        >{`Чат проекта ${projectName}`}</Label>
        <X onClick={() => setIsChatActive(false)} className={styles.closeBtn} />
      </div>
      <div>
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
          {chatMessages?.map((message, index) =>
            user && message.senderId === user?.id ? (
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
                  <Label
                    style={{
                      textAlign: "center",
                      fontSize: ".8rem",
                      color: "#87888C",
                      textTransform: "capitalize",
                    }}
                  >
                    {/* {message ? moment(message.createdAt).format("DD.MM") : ""} */}
                  </Label>
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
                      <Label
                        style={{
                          textTransform: "capitalize",
                          fontSize: ".9rem",
                          fontWeight: "500",
                          color: "white",
                        }}
                      >
                        {message.content}
                      </Label>
                      <Label
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "500",
                          fontSize: ".6rem",
                          color: "white",
                          marginLeft: ".5rem",
                        }}
                      >
                        {/* {moment(message.createdAt).format("HH:mm")} */}
                      </Label>
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
                  <Label
                    style={{
                      textAlign: "center",
                      fontSize: ".8rem",
                      color: "#87888C",
                      textTransform: "capitalize",
                    }}
                  >
                    {/* {message ? moment(message.createdAt).format("DD.MM") : ""} */}
                  </Label>
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
                    <Label color={"#87888C"} style={{ fontSize: ".7rem", color: "#87888C" }}>
                      {message.username}
                    </Label>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <Label
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "500",
                          fontSize: ".9rem",
                          color: "black",
                        }}
                      >
                        {message.content}
                      </Label>
                      <Label
                        style={{
                          textTransform: "capitalize",
                          fontSize: ".6rem",
                          fontWeight: "500",
                          color: "black",
                          marginLeft: ".9rem",
                        }}
                      >
                        {/* {moment(message.createdAt).format("HH:mm")} */}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", }}>
        <div
          style={{
            backgroundColor: "#ECF0F3",
            padding: ".6rem .8rem",
            borderRadius: ".6rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: ".5rem 0 1vh 0",
            gap: 14,
            width: "80%",
          }}
        >
          <Input
            style={{ flex: 1, fontSize: ".9rem" }}
            placeholder="Написать сообщение..."
            // inputProps={{ "aria-label": "Написать сообщение..." }}
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
  );
}
