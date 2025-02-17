import React, { useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditNote() {
  const id = useParams().noteID;
  var [notes, setNotes, profile, user] = useOutletContext();
  const LOCAL_STORAGE_KEY = "notesApp.notes";
  const navigate = useNavigate();
  var curNote;
  const d = new Date();
  const [date, setDate] = useState(() => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19));
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "link"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  for (var i in notes) {
    if (notes[i].id === id) {
      curNote = notes[i];
    }
  }

  const [value, setValue] = useState(() => curNote.text);
  const [title, setTitle] = useState(() => curNote.title);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const formatDate = (when) => {
    const formatted = new Date(when).toLocaleString("en-US", options);
    if (formatted === "Invalid Date") {
      return "";
    }
    return formatted;
  };

  async function handleDelete() {
    const answer = window.confirm("Are you sure?");
    if (answer) {

      const res = await fetch(`https://vdyfimzt5vzktczljseyyci2pi0tkepy.lambda-url.ca-central-1.on.aws?id=${id}&email=${profile.email}`, 
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            "email": `${profile.email}`,
            "authorization": `Bearer ${user.access_token}`
          }
        }
      )

      console.log(res)

      if (res.status == 200) {
        notes = notes.filter((note) => note.id !== id);
        setNotes(notes);
        navigate("/notes/");
      }
    }



  }

  async function handleSave() {
    const savedNote = {id: id, title: title, text: value, date: formatDate(date)};

    const res = await fetch("https://k5fvv2d7lvwyfukdmnh26mn6t40dogvr.lambda-url.ca-central-1.on.aws/", 
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "email": `${profile.email}`,
          "authorization": `Bearer ${user.access_token}`
        },
        body: JSON.stringify({...savedNote, email: profile.email})
        
      }
    )
    // Authorization: `Bearer ${user.access_token}`,
    console.log(res)

    if(res.status == 200) {
      curNote.date = formatDate(date);
      curNote.text = value;
      curNote.title = title;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
      navigate("/notes/" + id);
    }
  }

  return (
    <div id="metaNote">
      <div className="noteInfo">
        <div className="title-date">
          <input
            type="text"
            className="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="editDate"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="noteOption" onClick={handleSave}>
            Save
          </label>
          <label className="noteOption" onClick={handleDelete}>
            Delete
          </label>
        </div>
      </div>
      <ReactQuill
        className="editor-container"
        modules={modules}
        theme="snow"
        placeholder="Your Note Here"
        value={value !== "..." ? value : ""}
        onChange={setValue}
      />
    </div>
  );
}