"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { canManageUsers } from "@/lib/permissions";
import { api } from "@/lib/api-client";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { UserCog, Plus, Pencil, Trash2, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  email: string;
  name: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    name: "",
    password: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (currentUser && canManageUsers(currentUser.role)) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        password: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        name: "",
        password: "",
        role: "USER",
      });
    }
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "USER",
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (editingUser) {
        // Update user
        const updateData: any = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await api.put(`/api/users/${editingUser.id}`, updateData);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update user");
        }

        setSuccessMessage("User updated successfully");
      } else {
        // Create new user
        const response = await api.post("/api/users", formData);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create user");
        }

        setSuccessMessage("User created successfully");
      }

      handleCloseModal();
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await api.delete(`/api/users/${userId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setSuccessMessage("User deleted successfully");
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!currentUser || !canManageUsers(currentUser.role)) {
    return (
      <ProtectedLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          You do not have permission to access this page.
        </div>
      </ProtectedLayout>
    );
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="text-center text-gray-500">Loading users...</div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <UserCog className="w-8 h-8" />
              Používatelia
            </h1>
            <p className="text-slate-400 mt-2">Správa používateľov aplikácie</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:brightness-110 transition-all"
            style={{ backgroundColor: "#c20003" }}
          >
            <Plus className="w-5 h-5" />
            Nový používateľ
          </button>
        </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#292929" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "#3a3a3a" }}>
              <th className="text-left p-4 text-slate-300 font-medium">Email</th>
              <th className="text-left p-4 text-slate-300 font-medium">Meno</th>
              <th className="text-left p-4 text-slate-300 font-medium">Rola</th>
              <th className="text-left p-4 text-slate-300 font-medium">Vytvorený</th>
              <th className="text-right p-4 text-slate-300 font-medium">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-opacity-50 transition-colors"
                style={{ borderColor: "#3a3a3a" }}
              >
                <td className="p-4 text-white">{user.email}</td>
                <td className="p-4 text-white">{user.name}</td>
                <td className="p-4">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor:
                        user.role === "SUPER_ADMIN"
                          ? "#c20003"
                          : user.role === "ADMIN"
                          ? "#f59e0b"
                          : "#6b7280",
                      color: "white",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString("sk-SK")}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-white transition-colors"
                      title="Upraviť"
                    >
                      <Pencil className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-white transition-colors"
                      title="Zmazať"
                      disabled={user.id === currentUser.id}
                    >
                      <Trash2
                        className={`w-4 h-4 ${
                          user.id === currentUser.id
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-red-400"
                        }`}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            Žiadni používatelia nenájdení
          </div>
        )}
      </div>

      {/* Modal for Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: "#292929" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingUser ? "Upraviť používateľa" : "Nový používateľ"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-none text-white"
                  style={{ backgroundColor: "#3a3a3a" }}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Meno
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-none text-white"
                  style={{ backgroundColor: "#3a3a3a" }}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Heslo {editingUser && "(nechajte prázdne pre zachovanie)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-none text-white"
                  style={{ backgroundColor: "#3a3a3a" }}
                  required={!editingUser}
                  placeholder={editingUser ? "Nechajte prázdne pre zachovanie" : ""}
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Rola
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "SUPER_ADMIN" | "ADMIN" | "USER",
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border-none text-white"
                  style={{ backgroundColor: "#3a3a3a" }}
                  required
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:brightness-90 transition-all"
                  style={{ backgroundColor: "#3a3a3a" }}
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:brightness-110 transition-all"
                  style={{ backgroundColor: "#c20003" }}
                >
                  {editingUser ? "Uložiť" : "Vytvoriť"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ProtectedLayout>
  );
}
