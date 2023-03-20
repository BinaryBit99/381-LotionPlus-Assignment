import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import NotesList from "./NotesList";
import { v4 as uuidv4 } from "uuid";
import { googleLogout, useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';



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
  const [lockedbar, setLockedbar] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  function showSidebar() {
    lockedbar ? (sidebar ? setSidebar(false) : setSidebar(false)) : setSidebar(!sidebar) ;
  }
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
  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState([]);
  const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error),
  });
  useEffect ( 
    () => {
      <Outlet context={[lockedbar, setLockedbar]} /> 
    }, [ lockedbar ]
  )
  useEffect(
    () => {
        if (user) {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json'
                    }
                })
                .then((res) => {
                    setProfile(res.data);
                    setLockedbar(false);
                })
                .catch((err) => console.log(err));
      
        }
    },
    [ user ]
  );
  const lockOut = () => setLockedbar(lockedbar);
  const reDirect = () => {login();}
// log out function to log the user out of google and set the profile array to null
  const logOut = () => {
      setLockedbar(true);
      googleLogout();
      setProfile(null);
  };
  const handleLogOut = () => {
    navigate("/");
    logOut();
  }
  return (
    <>
      <div id="title">
        <h1>Lotion</h1>
        <p>Like Notion, but worse (like way worse)</p>
      </div>
      <label id="menu" onClick={showSidebar} >
        &#9776;
        <div id="userLogin">
        {profile ? (
                <div className="welcome">
                    <p> Welcome back, {profile.name}</p>
                    <label onClick={handleLogOut}>Log out</label>
                </div>
            ) : (
                <button id="signIn" onClick={reDirect}>Sign in with Google</button>
        )}
        </div>
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
