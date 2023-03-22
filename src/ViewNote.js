import React from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";

export default function ViewNote() {
  const id = useParams().noteID;
  var [notes, setNotes, profile, user] = useOutletContext();
  const navigate = useNavigate();
  var curNote;

  for (var note in notes) {
    if (notes[note].id === id) {
      curNote = notes[note];
    }
  }
  async function handleDelete() {
    const answer = window.confirm("Are you sure?");
    if (answer) {

      const res = await fetch(`https://5mxgpu73xqbgivscagw733qhyq0lzbdy.lambda-url.ca-central-1.on.aws?id=${id}&email=${profile.email}`, 
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            "email": `${profile.email}`,
            "authorization": `Bearer ${user.access_token}`
          },
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


  if(curNote === null || curNote === undefined) {
    return (
      <div className="noneSelected">
        Select a note, or create a new one.
      </div>
    );
  }


  return (
    <div id="metaNote">
      <div className="noteInfo">
        <div className="title-date">
          <h2>{curNote.title}</h2>
          <small>{curNote.date}</small>
        </div>
        <div>
          <label className="noteOption" onClick={() => navigate("edit")}>
            Edit
          </label>
          <label className="noteOption" onClick={handleDelete}>
            Delete
          </label>
        </div>
      </div>
      <div
        className="view-text"
        dangerouslySetInnerHTML={{ __html: curNote.text }}
      ></div>
    </div>
  );
}