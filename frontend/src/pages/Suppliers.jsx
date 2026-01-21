import { useEffect, useState } from 'react';
import api from '../api';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '', address: '' });
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('suppliers/');
            setSuppliers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`suppliers/${editing.id}/`, form);
            } else {
                await api.post('suppliers/', form);
            }
            setForm({ name: '', contact_email: '', contact_phone: '', address: '' });
            setEditing(null);
            fetchSuppliers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (supplier) => {
        setForm(supplier);
        setEditing(supplier);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`suppliers/${id}/`);
            fetchSuppliers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 bg-white text-black">
            <h1 className="text-2xl font-bold mb-4">Suppliers</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border p-2 mr-2"
                    required
                />
                <input
                    type="email"
                    placeholder="Contact Email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Contact Phone"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="border p-2 mr-2"
                />
                <button type="submit" className="bg-blue-500 text-white p-2">
                    {editing ? 'Update' : 'Create'}
                </button>
            </form>
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2">Address</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map((supplier) => (
                        <tr key={supplier.id}>
                            <td className="border px-4 py-2">{supplier.name}</td>
                            <td className="border px-4 py-2">{supplier.contact_email}</td>
                            <td className="border px-4 py-2">{supplier.contact_phone}</td>
                            <td className="border px-4 py-2">{supplier.address}</td>
                            <td className="border px-4 py-2">
                                <button onClick={() => handleEdit(supplier)} className="mr-2 bg-yellow-500 text-white p-1">Edit</button>
                                <button onClick={() => handleDelete(supplier.id)} className="bg-red-500 text-white p-1">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}