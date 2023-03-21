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
  async function handleDelete() {
    const answer = window.confirm("Are you sure?");
    if (answer) {

      const res = await fetch(`https://5mxgpu73xqbgivscagw733qhyq0lzbdy.lambda-url.ca-central-1.on.aws?id=${id}&email=${"batman@uofc.ca"}`, 
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
        }
      )
      console.log(res)

      if (res.status == 200) {
        notes = notes.filter((note) => note.id !== id);
        setNotes(notes);
        navigate("/notes/");
      }

      const res2 = await fetch(`https://ghszrazwk3juwqtg4m2jdhnvgu0rxjyc.lambda-url.ca-central-1.on.aws?email=${"batman@uofc.ca"}`, 
        {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

      const jsonRes = await res2.json()
      console.log(jsonRes.notes.Items)

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