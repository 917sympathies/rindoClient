import {redirect } from 'next/navigation'

export default function App() {
  redirect("/login");
  return (
    <div>
      app page
    </div>
  );
}
