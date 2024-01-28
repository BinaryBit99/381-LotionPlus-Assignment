import logo from './logo.svg';
import './App.css';
import { v4 as uuidv4 } from "uuid";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react';
import Layout from "./Layout";
import EditNote from "./EditNote"
import ViewNote from "./ViewNote"

export default function App() {

  return(
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div></div>}></Route>
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


