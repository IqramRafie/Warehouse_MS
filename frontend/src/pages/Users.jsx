import { useEffect, useState } from 'react';
import api from '../api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        username: '', email: '', password: '', role: 'OPERATOR'
    });
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('users/');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`users/${editing.id}/`, form);
            } else {
                await api.post('users/', form);
            }
            fetchUsers();
            setForm({ username: '', email: '', password: '', role: 'OPERATOR' });
            setEditing(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (user) => {
        setForm({ ...user, password: '' }); // Don't show password
        setEditing(user);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`users/${id}/`);
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white text-black">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="p-2 border" required />
                    <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="p-2 border" />
                    <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="p-2 border" required={!editing} />
                    <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="p-2 border">
                        <option value="OPERATOR">Operator</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">{editing ? 'Update' : 'Create'} User</button>
                {editing && <button onClick={() => setEditing(null)} className="ml-2 bg-gray-500 text-white p-2 rounded">Cancel</button>}
            </form>
            <table className="w-full bg-white rounded shadow">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Username</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-t">
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.role}</td>
                            <td className="p-2">
                                <button onClick={() => handleEdit(user)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                                <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}