import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { usePrivateNotes } from '../../contexts/PrivateNotesContext';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const PrivateNotes = ({ entityType, entityId }) => {
  const { getNotes, addNote, updateNote, deleteNote } = usePrivateNotes();
  const [notes, setNotes] = useState(getNotes(entityType, entityId));
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleAdd = () => {
    if (newNote.trim()) {
      const noteId = addNote(entityType, entityId, newNote.trim());
      setNotes(getNotes(entityType, entityId));
      setNewNote('');
      setIsAdding(false);
    }
  };

  const handleUpdate = (noteId) => {
    if (editNote.trim()) {
      updateNote(entityType, entityId, noteId, editNote.trim());
      setNotes(getNotes(entityType, entityId));
      setEditNote('');
      setEditingId(null);
    }
  };

  const handleDelete = (noteId) => {
    deleteNote(entityType, entityId, noteId);
    setNotes(getNotes(entityType, entityId));
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditNote(note.content);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Private Notes</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your private note here..."
            className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            {editingId === note.id ? (
              <>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditNote('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdate(note.id)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(note)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {note.updatedAt !== note.createdAt
                    ? `Updated ${formatDate(note.updatedAt)}`
                    : `Created ${formatDate(note.createdAt)}`}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivateNotes; 