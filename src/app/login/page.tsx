'use client';
import { useState, useContext, useEffect } from "react";
import styles from "./styles.module.css";
import { redirect, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
      if(Date.now() >= decoded.exp * 1000){
        removeCookie("test-cookies", {path:'/'});
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        console.log("cookie removed")
        setIsAuth(false);
        setIsLoading(false);
        return;
      }
      // console.log(decoded.exp > new Date().getTime())
      // if(decoded.exp > new Date().getTime()){
      //   removeCookie("test-cookies", {path:'/'});
      //   console.log("cookie removed")
      //   setIsLoading(false);
      //   return;
      // }
      localStorage.setItem("token", JSON.stringify(decoded));
      setIsAuth(true);
      localStorage.setItem("userId", decoded.userId);
      console.log("redirected")
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

  if(isLoading) return null;

  return (
    <>
      {/* {isAuth && errorMessage === "" ? (
        redirect("/main")
      ) : ( */}
        <div
          className="mx-auto gap-y-2"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100vh",
            width: "20%",
          }}
        >
          <Input
            onChange={(e) => {
              setUsername(e.target.value);
              setErrorMessage("");
            }}
            required
            id="username"
            name="username"
            placeholder="Имя пользователя"
          />
          <Input
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
            required
            id="password"
            name="password"
            type="password"
            placeholder="Пароль"
          />
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
          <Button className="w-full text-white bg-blue-400 hover:bg-blue-600 ease-in-out transition-300" onClick={() => authUser()}>Войти</Button>
          <Button className="w-full text-white bg-blue-400 hover:bg-blue-600 ease-in-out transition-300" onClick={() => signUp()}>Зарегистрироваться</Button>
        </div>
      {/* )} */}
    </>
  );
}
