import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

import { useNotesContext } from "../hooks/useNotesContext.jsx";
import { useUsersContext } from "../hooks/useUsersContext.jsx";
import { fetchNotes } from "../api.jsx";

import Navbar from "../components/Notes/Navbar";
import NoteForm from "../components/Notes/NoteForm";
import Note from "../components/Notes/Note";

const Notes = () => {
    const { user, dispatchUser } = useUsersContext();
    const { notes, dispatch } = useNotesContext();
    const navigate = useNavigate();

    useEffect(() => {
        const { exp } = jwt_decode(JSON.parse(user).token);
        let currentDate = new Date();
        const activePeriod = exp * 1000 - currentDate;
        if (activePeriod > 0) {
            setTimeout(() => {
                localStorage.removeItem("user");
                dispatchUser({ type: "LOGOUT" });
            }, activePeriod);
        }
    }, [])

    useEffect(() => {
        const setNotes = async () => {
            const res = await fetchNotes();
            if (res.status === 200) {
                dispatch({ type: "SET_NOTES", payload: res.data });
            }
        }
        setNotes();
    }, [])

    return (
        <>
            <div className="column-set">
                <header>
                    <Navbar></Navbar>
                </header>
                <main className="notes-main">
                    <section className="form-container">
                        <NoteForm></NoteForm>
                    </section>
                    <section className="notes-container">
                        {notes.length !== 0 ? notes.map((note) => { return <Note key={note._id} note={note}></Note> }) : <h2>There are no notes</h2>}
                    </section>
                </main>
            </div>
        </>
    )
}

export default Notes;