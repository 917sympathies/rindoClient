"use client";
import styles from "./styles.module.css";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <Input
        required
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      ></Input>
      <Input
        required
        placeholder="Пароль"
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      ></Input>
      <Input
        required
        placeholder="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></Input>
      <Input
        required
        placeholder="Имя"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      ></Input>
      <Input
        required
        placeholder="Фамилия"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      ></Input>
      {errorMessage !== "" && (
        <Label
          style={{
            color: "red",
            cursor: "pointer",
            fontSize: ".875rem",
            wordWrap: "break-word",
            textAlign: "left",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
          }}
        >
          {errorMessage}
        </Label>
      )}
      <Button className="w-full text-white bg-blue-400 hover:bg-blue-600 ease-in-out transition-300" onClick={() => signUp()}>Зарегистрироваться</Button>
    </div>
  );
}
