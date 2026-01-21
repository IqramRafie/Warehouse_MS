import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('dashboard/summary');
                setData(res.data);
                const auditRes = await api.get('audit-logs/');
                setAuditLogs(auditRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white text-black">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Total Products</h2>
                    <p className="text-2xl">{data.total_products}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Total Inventory</h2>
                    <p className="text-2xl">{data.total_inventory}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
                    <p className="text-2xl">{data.low_stock_items}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Inbound Today</h2>
                    <p className="text-2xl">{data.inbound_today}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Outbound Today</h2>
                    <p className="text-2xl">{data.outbound_today}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Recent Activities</h2>
                    <ul>
                        {data.recent_activities.map((activity, index) => (
                            <li key={index} className="border-b py-1">
                                {activity.user__username}: {activity.action} on {activity.entity}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Transaction Volume (Last 7 Days)</h2>
                    <ul>
                        {data.transaction_volume.map((day, index) => (
                            <li key={index} className="border-b py-1">
                                {day.date}: Inbound {day.inbound}, Outbound {day.outbound}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="bg-white p-4 rounded shadow mt-4">
                <h2 className="text-lg font-semibold mb-2">Audit Logs</h2>
                <table className="min-w-full table-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Action</th>
                            <th className="px-4 py-2">Entity</th>
                            <th className="px-4 py-2">Entity ID</th>
                            <th className="px-4 py-2">Timestamp</th>
                            <th className="px-4 py-2">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLogs.slice(0, 10).map((log) => (
                            <tr key={log.id}>
                                <td className="border px-4 py-2">{log.user}</td>
                                <td className="border px-4 py-2">{log.action}</td>
                                <td className="border px-4 py-2">{log.entity}</td>
                                <td className="border px-4 py-2">{log.entity_id}</td>
                                <td className="border px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="border px-4 py-2">{JSON.stringify(log.details)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}