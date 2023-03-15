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

  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState([]);

  const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error)
  });

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
                })
                .catch((err) => console.log(err));
        }
    },
    [ user ]
  );


// log out function to log the user out of google and set the profile array to null
  const logOut = () => {
      googleLogout();
      setProfile(null);
  };

  return (
    
    <>
      <div id="title">
        <h1>Lotion</h1>
        <p>Like Notion, but worse (like way worse)</p>
        <p>React Google Login</p>
            
            {profile ? (
                <div className="userLogin">
          
                    <p> Welcome back, {profile.name}</p>
                    <p>Email Address: {profile.email}</p>
                   
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
                <button onClick={() => login()}>Sign in with Google 🚀 </button>
            )}
      
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
