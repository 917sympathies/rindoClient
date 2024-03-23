'use client';
import { useState, useContext, useEffect } from "react";
import styles from "./styles.module.css";
import { redirect, useRouter } from "next/navigation";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useCookies } from "react-cookie"
import { jwtDecode } from "jwt-decode";
import { ICookieInfo } from "@/types";


export default function Login() {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(['test-cookies']);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [usernameInput, setUsername] = useState("");
  const [passwordInput, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authUser = async () => {
    if (usernameInput == "") setErrorMessage("Вы не ввели имя пользователя!");
    else if (passwordInput == "") setErrorMessage("Вы не ввели пароль!");
    else {
      const authInfo = { username: usernameInput, password: passwordInput };
      const response = await fetch("http://localhost:5000/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(authInfo),
      });
      const data = await response.json();
      if(data.code !== undefined){
        setErrorMessage(data.description);
        return;
      }
      setLocalStorage();
      setIsAuth(true);
      setUsername("");
      setPassword("");
    }
  };

  // if(cookies["test-cookies"]){
  //   const token = cookies["test-cookies"];
  //   const decoded = jwtDecode(token) as CookieInfo;
  //   // var date =new Date('1970-01-01T00:00:00Z'); 
  //   // console.log(date.setUTCSeconds(decoded.exp))
  //   console.log("exp > now: ")
  //   console.log(decoded.exp > new Date().getTime());
  //   if(decoded.exp > new Date().getTime()){
  //     removeCookie("test-cookies", {path:'/'});
  //     return;
  //   }

  //   setIsAuth(true);
  // }

  const setLocalStorage = () => {
    if(cookies['test-cookies']){
      const token = cookies["test-cookies"];
      const decoded = jwtDecode(token) as ICookieInfo;
      localStorage.setItem("token",JSON.stringify(decoded));
    }
  }
  
  useEffect(() => {
    if(cookies['test-cookies']){
      const token = cookies["test-cookies"];
      const decoded = jwtDecode(token) as ICookieInfo;
      if(decoded.exp > new Date().getTime()){
        removeCookie("test-cookies", {path:'/'});
        setIsLoading(false);
        return;
      }
      localStorage.setItem("token", JSON.stringify(decoded));
      setIsAuth(true);
      redirect('/main')
    }
    setIsLoading(false);
  }, [cookies]);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if(!token){
  //     setIsLoading(false);
  //     return;
  //   }
  //   const exp = JSON.parse(token).exp;
  //   if(exp > new Date().getTime()){
  //     removeCookie("test-cookies", {path:'/'});
  //     setIsLoading(false);
  //     return;
  //   }
  //   setIsAuth(true);
  //   redirect('/main')
  // }, [])

  const signUp = () => {
    router.push("/signup");
  };

  return (
    <>
      {isAuth && errorMessage === "" ? (
        redirect("/main")
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <TextField
            onChange={(e) => {
              setUsername(e.target.value);
              setErrorMessage("");
            }}
            margin="normal"
            required
            error={errorMessage !== ""}
            fullWidth
            id="username"
            label="Имя пользователя"
            name="username"
            sx={{ width: "30vw" }}
          />
          <TextField
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
            margin="normal"
            required
            fullWidth
            error={errorMessage !== ""}
            id="password"
            label="Пароль"
            name="password"
            type="password"
            sx={{ width: "30vw" }}
          />
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
          <Button onClick={() => authUser()}>Войти</Button>
          <Button onClick={() => signUp()}>Зарегистрироваться</Button>
        </Box>
      )}
    </>
  );
}
