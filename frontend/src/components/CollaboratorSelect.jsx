import React, { useState, useEffect, useRef } from "react";

function CollaboratorSelect({ api, collaborators, setCollaborators }) {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setAvailableUsers(data.users || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, [api]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="mb-4 relative">
      <label className="block mb-2 font-medium">Collaborators</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {collaborators.map((c) => (
          <span
            key={c._id}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center"
          >
            {c.name}
            <button
              type="button"
              onClick={() =>
                setCollaborators(
                  collaborators.filter((collab) => collab._id !== c._id)
                )
              }
              className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search and add collaborators..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="border p-2 w-full rounded"
      />

      {/* Dropdown suggestions */}
      {showDropdown && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
          {availableUsers
            .filter(
              (u) =>
                !collaborators.some((c) => c._id === u._id) &&
                u.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((u) => (
              <li
                key={u._id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setCollaborators([...collaborators, u]);
                  setSearchTerm("");
                  setShowDropdown(false);
                }}
              >
                {u.name} ({u.email})
              </li>
            ))}
          {availableUsers.filter(
            (u) =>
              !collaborators.some((c) => c._id === u._id) &&
              u.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <li className="px-4 py-2 text-gray-500">No users found.</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default CollaboratorSelect;
