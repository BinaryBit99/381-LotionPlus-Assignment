import React from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";

export default function ViewNote() {
  const id = useParams().noteID;
  var [notes, setNotes] = useOutletContext();
  const navigate = useNavigate();
  var curNote;

  for (var note in notes) {
    if (notes[note].id === id) {
      curNote = notes[note];
    }
  }
  function handleDelete() {
    const answer = window.confirm("Are you sure?");
    if (answer) {
      notes = notes.filter((note) => note.id !== id);
      setNotes(notes);
      navigate("/notes/");
    }
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