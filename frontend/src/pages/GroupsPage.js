import React, { useState } from "react";
import "../styles/groups.css";

export default function GroupsPage() {
  const [groups, setGroups] = useState([{ name: "Friends" }]);
  const [newGroup, setNewGroup] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const addGroup = () => {
    if (!newGroup.trim()) return;
    setGroups([...groups, { name: newGroup }]);
    setNewGroup("");
  };

  const deleteGroup = (index) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditValue(groups[index].name);
  };

  const saveEdit = (index) => {
    const updated = [...groups];
    updated[index].name = editValue;
    setGroups(updated);
    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <div>
      <h1 className="page-title">Groups</h1>

      <div className="card">
        <h3>Create New Group</h3>
        <p className="small muted">Add a group to manage shared expenses</p>
        <div className="form-row">
          <input
            className="input"
            placeholder="Group Name"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addGroup}>
            Create
          </button>
        </div>
      </div>

      <div className="grid-2 mt-6">
        {groups.map((g, i) => (
          <div key={i} className="card">
            {editingIndex === i ? (
              <>
                <input
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <div className="form-row mt-2">
                  <button className="btn btn-primary" onClick={() => saveEdit(i)}>
                    Save
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setEditingIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{g.name}</h3>
                <p className="small muted">
                  Track shared expenses, balances & settlements with group members
                </p>
                <div className="form-row">
                  <button className="btn btn-ghost" onClick={() => startEdit(i)}>
                    Edit
                  </button>
                  <button className="btn btn-ghost" onClick={() => deleteGroup(i)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
