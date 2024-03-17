"use client";
import styles from "./styles.module.css";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation"
import { Button, TextField, Typography } from "@mui/material";

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const signUp = async () => {
      const response = await fetch("http://localhost:5000/api/user/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          firstName: firstName,
          lastName: lastName
        })
      });
      const data = await response.json();
      if(data.errors === undefined)
        router.push("/main")
      else{
        if (data.errors.Username !== undefined) setErrorMessage(data.errors.Username);
        else if (data.errors.Password !== undefined) setErrorMessage(data.errors.Password);
        else if (data.errors.Email !== undefined) setErrorMessage(data.errors.Email);
        else if (data.errors.FirstName !== undefined) setErrorMessage(data.errors.FirstName);
        else if (data.errors.LastName !== undefined) setErrorMessage(data.errors.LastName);
      }
  };

  return (
    <div className={styles.container}>
      <TextField
        required
        label="Имя пользователя"
        value={username}
        error={errorMessage !== ""}
        onChange={(e) => setUsername(e.target.value)}
      ></TextField>
      <TextField
        required
        label="Пароль"
        value={password}
        type="password"
        error={errorMessage !== ""}
        onChange={(e) => setPassword(e.target.value)}
      ></TextField>
      <TextField
        required
        label="E-mail"
        type="email"
        value={email}
        error={errorMessage !== ""}
        onChange={(e) => setEmail(e.target.value)}
      ></TextField>
      <TextField
        required
        label="Имя"
        value={firstName}
        error={errorMessage !== ""}
        onChange={(e) => setFirstName(e.target.value)}
      ></TextField>
      <TextField
        required
        label="Фамилия"
        value={lastName}
        error={errorMessage !== ""}
        onChange={(e) => setLastName(e.target.value)}
      ></TextField>
      {errorMessage !== "" && (
        <Typography
          variant="body2"
          fontWeight="200"
          sx={{
            color: "red",
            "&:hover": { textDecoration: "underline" },
            cursor: "pointer",
            fontSize: ".875rem",
            wordWrap: "break-word",
            textAlign: "left",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            "-webkit-line-clamp": "3",
            "-webkit-box-orient": "vertical",
          }}
        >
          {errorMessage}
        </Typography>
      )}
      <Button onClick={() => signUp()}>Зарегистрироваться</Button>
    </div>
  );
}
