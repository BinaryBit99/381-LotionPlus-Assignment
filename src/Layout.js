import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import NotesList from "./NotesList";
import { v4 as uuidv4 } from "uuid";

function Layout() {
  const navigate = useNavigate();
  const LOCAL_STORAGE_KEY = "notesApp.notes";
  const params = useParams();
  const [notes, setNotes] = useState(() => {
    const storedNotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (storedNotes === null) {
      return [];
    } else {
      return storedNotes;
    }
  });

  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => setSidebar(!sidebar);
  function addNote() {
    const id = uuidv4();
    setNotes((prevNotes) => {
      return [...prevNotes, { id: id, title: "Untitled", text: "...", date: "" }];
    });
    navigate("notes/" + id + "/edit");
  }

  useEffect(() => {
    if (Object.keys(params).length === 0){
      navigate("/notes");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  return (
    <>
      <div id="title">
        <h1>Lotion</h1>
        <p>Like Notion, but worse (like way worse)</p>
      </div>
      <label id="menu" onClick={showSidebar}>
        &#9776;
      </label>
      <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
        <div id="head">
          <h2>Notes</h2>
          <label id="addNote" onClick={addNote}>+
          </label>
        </div>
        <div className="nav-menu-items">
          <NotesList notes={notes} />
        </div>
      </nav>
      <div className={sidebar ? "content menuActive" : "content"}>
        <Outlet context={[notes, setNotes]} />
      </div>
    </>
  );
}

export default Layout;