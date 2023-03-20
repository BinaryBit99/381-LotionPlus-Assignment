import logo from './logo.svg';
import './App.css';
import { v4 as uuidv4 } from "uuid";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react';
import Layout from "./Layout";
import EditNote from "./EditNote"
import ViewNote from "./ViewNote"

export default function App() {
  const [email, setEmail] = useState(""); 
  const [user, setUser] = useState("batman@uofc.ca");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");

  const onSaveNote = async () => {
    const newNote = {title, body, when, id: uuidv4()}
    console.log({...newNote, email: user})
    setNotes([{...newNote}, ...notes]);

    const res = await fetch("https://fgaeb676p2fzzzfxz3r43oj3cq0mmkmr.lambda-url.ca-central-1.on.aws/", 
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({...newNote, email: user})
      }
    )
    console.log(res)
  }

  return(
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"></Route>
          <Route path="/notes" element={
            <div className="noneSelected">
              Select a note, or create a new one.
            </div>
          }></Route>
          <Route path="/notes/:noteID" element={<ViewNote/>}></Route>
          <Route path="/notes/:noteID/edit" element={<EditNote/>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}


