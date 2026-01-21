import { useEffect, useState } from 'react';
import api from '../api';

export default function Outbound() {
    const [outbounds, setOutbounds] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        product: '', quantity: 0, customer: '', so_reference: '', dispatched_date: '', ref_document: null
    });
    const [bulkFile, setBulkFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [outboundsRes, productsRes] = await Promise.all([
                api.get('outbound/'),
                api.get('products/')
            ]);
            setOutbounds(outboundsRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key] !== null) formData.append(key, form[key]);
        });
        try {
            await api.post('outbound/', formData);
            fetchData();
            setForm({ product: '', quantity: 0, customer: '', so_reference: '', dispatched_date: '', ref_document: null });
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
            const res = await api.post('outbound/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`Bulk upload successful: ${res.data.created_outbounds} outbounds created.`);
            fetchData();
            setBulkFile(null);
        } catch (error) {
            console.error(error);
            alert('Bulk upload failed.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white text-black">
            <h1 className="text-2xl font-bold mb-4">Outbound Management</h1>
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.product} onChange={(e) => setForm({...form, product: e.target.value})} className="p-2 border" required>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: parseInt(e.target.value)})} className="p-2 border" required />
                    <input type="text" placeholder="Customer" value={form.customer} onChange={(e) => setForm({...form, customer: e.target.value})} className="p-2 border" required />
                    <input type="text" placeholder="SO Reference" value={form.so_reference} onChange={(e) => setForm({...form, so_reference: e.target.value})} className="p-2 border" required />
                    <input type="date" value={form.dispatched_date} onChange={(e) => setForm({...form, dispatched_date: e.target.value})} className="p-2 border" required />
                    <input type="file" onChange={(e) => setForm({...form, ref_document: e.target.files[0]})} className="p-2 border" />
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">Create Outbound</button>
            </form>
            <form onSubmit={handleBulkUpload} className="mb-6 bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Bulk Upload Outbounds</h2>
                <input type="file" accept=".csv,.xlsx" onChange={(e) => setBulkFile(e.target.files[0])} className="p-2 border" required />
                <button type="submit" className="ml-4 bg-green-500 text-white p-2 rounded">Upload</button>
                <p className="text-sm mt-2">CSV/XLSX format: product_sku, quantity, customer, so_reference, dispatched_date</p>
            </form>
            <table className="w-full bg-white rounded shadow">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Product</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Customer</th>
                        <th className="p-2">SO Reference</th>
                        <th className="p-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {outbounds.map(outbound => (
                        <tr key={outbound.id} className="border-t">
                            <td className="p-2">{outbound.product.name}</td>
                            <td className="p-2">{outbound.quantity}</td>
                            <td className="p-2">{outbound.customer}</td>
                            <td className="p-2">{outbound.so_reference}</td>
                            <td className="p-2">{outbound.dispatched_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}