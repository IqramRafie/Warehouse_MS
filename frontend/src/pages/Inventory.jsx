import { useEffect, useState } from 'react';
import api from '../api';

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: '', sku: '', category: '', description: '', quantity: 0, low_stock_threshold: 10, tags: [], supplier: null
    });
    const [editing, setEditing] = useState(null);
    const [bulkFile, setBulkFile] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('products/');
            setProducts(res.data);
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
                await api.put(`products/${editing.id}/`, form);
            } else {
                await api.post('products/', form);
            }
            fetchProducts();
            setForm({ name: '', sku: '', category: '', description: '', quantity: 0, low_stock_threshold: 10, tags: [], supplier: null });
            setEditing(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (product) => {
        setForm(product);
        setEditing(product);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`products/${id}/`);
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkFile) return;
        const formData = new FormData();
        formData.append('file', bulkFile);
        try {
            const res = await api.post('products/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`Bulk upload successful: ${res.data.created_products} products created.`);
            fetchProducts();
            setBulkFile(null);
        } catch (error) {
            console.error(error);
            alert('Bulk upload failed.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white text-black">
            <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="p-2 border" required />
                    <input type="text" placeholder="SKU" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="p-2 border" required />
                    <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="p-2 border" />
                    <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: parseInt(e.target.value)})} className="p-2 border" />
                    <input type="number" placeholder="Low Stock Threshold" value={form.low_stock_threshold} onChange={(e) => setForm({...form, low_stock_threshold: parseInt(e.target.value)})} className="p-2 border" />
                    <input type="text" placeholder="Tags (comma separated)" value={form.tags.join(',')} onChange={(e) => setForm({...form, tags: e.target.value.split(',')})} className="p-2 border" />
                    <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="p-2 border" />
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">{editing ? 'Update' : 'Create'} Product</button>
                {editing && <button onClick={() => setEditing(null)} className="ml-2 bg-gray-500 text-white p-2 rounded">Cancel</button>}
            </form>
            <form onSubmit={handleBulkUpload} className="mb-6 bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Bulk Upload Products</h2>
                <input type="file" accept=".csv,.xlsx" onChange={(e) => setBulkFile(e.target.files[0])} className="p-2 border" required />
                <button type="submit" className="ml-4 bg-green-500 text-white p-2 rounded">Upload</button>
                <p className="text-sm mt-2">CSV/XLSX format: sku, name, category, description, low_stock_threshold</p>
            </form>
            <table className="w-full bg-white rounded shadow">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">SKU</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Threshold</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} className="border-t">
                            <td className="p-2">{product.sku}</td>
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{product.category}</td>
                            <td className="p-2">{product.quantity}</td>
                            <td className="p-2">{product.low_stock_threshold}</td>
                            <td className="p-2">
                                <button onClick={() => handleEdit(product)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                                <button onClick={() => handleDelete(product.id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}