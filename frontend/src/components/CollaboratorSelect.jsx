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
        setAvailableUsers(data.data.users || []);
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
    <div ref={containerRef} className="mb-6 relative">
      <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Collaborators
      </label>

      {/* selected collaborator pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {collaborators.map((c) => (
          <span
            key={c._id}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
          >
            {c.name}
            <button
              type="button"
              onClick={() =>
                setCollaborators(
                  collaborators.filter((collab) => collab._id !== c._id)
                )
              }
              className="group rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white hover:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-blue-500 focus:text-white transition-all p-0.5"
              title="Remove collaborator"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </span>
        ))}
        {collaborators.length === 0 && (
          <span className="text-sm text-gray-400 dark:text-gray-500 italic py-1">No collaborators added</span>
        )}
      </div>

      {/* search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
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
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm shadow-sm"
        />
      </div>

      {/* dropdown suggestions */}
      {showDropdown && (
        <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
          {availableUsers
            .filter(
              (u) =>
                !collaborators.some((c) => c._id === u._id) &&
                u.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((u) => (
              <li
                key={u._id}
                className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex flex-col"
                onClick={() => {
                  setCollaborators([...collaborators, u]);
                  setSearchTerm("");
                  setShowDropdown(false);
                }}
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm">{u.name}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{u.email}</span>
              </li>
            ))}
          {availableUsers.filter(
            (u) =>
              !collaborators.some((c) => c._id === u._id) &&
              u.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center italic">
              No matching users found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default CollaboratorSelect;
