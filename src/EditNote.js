import React, { useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditNote() {
  const id = useParams().noteID;
  var [notes, setNotes] = useOutletContext();
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
      notes = notes.filter((note) => note.id !== id);
      setNotes(notes);
      navigate("/notes/");

      const res = await fetch("https://tcqizbv2ojmo2fuz2pzyxejrbi0pwvot.lambda-url.ca-central-1.on.aws/", 
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({id: id, email: "batman@uofc.ca"})
        }
      )
      console.log(res)
    }



  }

    // const onSaveNote = async () => {
  //   const newNote = {title, body, when, id: uuidv4()}
  //   console.log({...newNote, email: user})
  //   setNotes([{...newNote}, ...notes]);

  //   const res = await fetch("https://fgaeb676p2fzzzfxz3r43oj3cq0mmkmr.lambda-url.ca-central-1.on.aws/", 
  //     {
  //       method: "POST",
  //       mode: "cors",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({...newNote, email: user})
  //     }
  //   )
  //   console.log(res)
  // }

  async function handleSave() {
    curNote.date = formatDate(date);
    curNote.text = value;
    curNote.title = title;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    navigate("/notes/" + id);

    // const newNote = { id: id, title: "Untitled", text: "...", date: "" };
    // body: JSON.stringify({...newNote, email: "batman@uofc.ca"})

    const res = await fetch("https://lhsm33sa5oaklh5w5juvv2jfji0ygaut.lambda-url.ca-central-1.on.aws/", 
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({...curNote, email: "batman@uofc.ca"})
        
      }
    )
  console.log(res)

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