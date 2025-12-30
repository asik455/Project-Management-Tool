import { createContext, useContext, useState, useEffect } from 'react';

const PrivateNotesContext = createContext();

export const usePrivateNotes = () => {
  const context = useContext(PrivateNotesContext);
  if (!context) {
    throw new Error('usePrivateNotes must be used within a PrivateNotesProvider');
  }
  return context;
};

export const PrivateNotesProvider = ({ children }) => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('privateNotes');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('privateNotes', JSON.stringify(notes));
  }, [notes]);

  const getNotes = (entityType, entityId) => {
    if (!entityType || !entityId) return [];
    return notes[`${entityType}_${entityId}`] || [];
  };

  const addNote = (entityType, entityId, content) => {
    const key = `${entityType}_${entityId}`;
    const newNote = {
      id: Date.now(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => ({
      ...prev,
      [key]: prev[key] ? [newNote, ...prev[key]] : [newNote],
    }));
    return newNote.id;
  };

  const updateNote = (entityType, entityId, noteId, content) => {
    const key = `${entityType}_${entityId}`;
    setNotes((prev) => ({
      ...prev,
      [key]: prev[key].map((note) =>
        note.id === noteId ? { ...note, content, updatedAt: new Date().toISOString() } : note
      ),
    }));
  };

  const deleteNote = (entityType, entityId, noteId) => {
    const key = `${entityType}_${entityId}`;
    setNotes((prev) => ({
      ...prev,
      [key]: prev[key].filter((note) => note.id !== noteId),
    }));
  };

  return (
    <PrivateNotesContext.Provider
      value={{ getNotes, addNote, updateNote, deleteNote }}
    >
      {children}
    </PrivateNotesContext.Provider>
  );
}; 