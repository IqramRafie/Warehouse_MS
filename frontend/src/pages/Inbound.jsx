import { useEffect, useState } from 'react';
import api from '../api';

export default function Inbound() {
    const [inbounds, setInbounds] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        product: '', quantity: 0, supplier: '', receive_date: '', batch_number: '', expiry_date: '', ref_document: null
    });
    const [bulkFile, setBulkFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [inboundsRes, productsRes, suppliersRes] = await Promise.all([
                api.get('inbound/'),
                api.get('products/'),
                api.get('suppliers/') // Assume supplier endpoint
            ]);
            setInbounds(inboundsRes.data);
            setProducts(productsRes.data);
            setSuppliers(suppliersRes.data);
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
            await api.post('inbound/', formData);
            fetchData();
            setForm({ product: '', quantity: 0, supplier: '', receive_date: '', batch_number: '', expiry_date: '', ref_document: null });
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
            const res = await api.post('inbound/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`Bulk upload successful: ${res.data.created_inbounds} inbounds created.`);
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
            <h1 className="text-2xl font-bold mb-4">Inbound Management</h1>
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.product} onChange={(e) => setForm({...form, product: e.target.value})} className="p-2 border" required>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: parseInt(e.target.value)})} className="p-2 border" required />
                    <select value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} className="p-2 border">
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="date" value={form.receive_date} onChange={(e) => setForm({...form, receive_date: e.target.value})} className="p-2 border" required />
                    <input type="text" placeholder="Batch Number" value={form.batch_number} onChange={(e) => setForm({...form, batch_number: e.target.value})} className="p-2 border" />
                    <input type="date" placeholder="Expiry Date" value={form.expiry_date} onChange={(e) => setForm({...form, expiry_date: e.target.value})} className="p-2 border" />
                    <input type="file" onChange={(e) => setForm({...form, ref_document: e.target.files[0]})} className="p-2 border" />
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">Create Inbound</button>
            </form>
            <form onSubmit={handleBulkUpload} className="mb-6 bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Bulk Upload Inbounds</h2>
                <input type="file" accept=".csv,.xlsx" onChange={(e) => setBulkFile(e.target.files[0])} className="p-2 border" required />
                <button type="submit" className="ml-4 bg-green-500 text-white p-2 rounded">Upload</button>
                <p className="text-sm mt-2">CSV/XLSX format: product_sku, quantity, supplier_name, receive_date</p>
            </form>
            <table className="w-full bg-white rounded shadow">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Product</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Supplier</th>
                        <th className="p-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {inbounds.map(inbound => (
                        <tr key={inbound.id} className="border-t">
                            <td className="p-2">{inbound.product.name}</td>
                            <td className="p-2">{inbound.quantity}</td>
                            <td className="p-2">{inbound.supplier?.name}</td>
                            <td className="p-2">{inbound.receive_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}