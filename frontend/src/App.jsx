import  { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import Login from  './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './context/AuthContext';

function Layout({ children }) {
    const { logout } = useContext(AuthContext);

    return (
        <div className="flex">
            <nav className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Warehouse MS</h2>
                <ul>
                    <li><Link to="/" className="block py-2 px-4 hover:bg-gray-700">Dashboard</Link></li>
                    <li><Link to="/inventory" className="block py-2 px-4 hover:bg-gray-700">Inventory</Link></li>
                    <li><Link to="/suppliers" className="block py-2 px-4 hover:bg-gray-700">Suppliers</Link></li>
                    <li><Link to="/inbound" className="block py-2 px-4 hover:bg-gray-700">Inbound</Link></li>
                    <li><Link to="/outbound" className="block py-2 px-4 hover:bg-gray-700">Outbound</Link></li>
                    <li><Link to="/users" className="block py-2 px-4 hover:bg-gray-700">Users</Link></li>
                </ul>
                <button onClick={logout} className="mt-4 bg-red-500 text-white p-2 rounded w-full">Logout</button>
            </nav>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}

export default function App() {
    const { user } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={user ? <Navigate to="/" /> : <Login />}/>
                <Route
                path='/'
                element={
                    <PrivateRoute>
                        <Layout>
                            <Dashboard/>
                        </Layout>
                    </PrivateRoute>
                }
                />
                <Route
                path='/inventory'
                element={
                    <PrivateRoute>
                        <Layout>
                            <Inventory/>
                        </Layout>
                    </PrivateRoute>
                }
                />
                <Route
                path='/suppliers'
                element={
                    <PrivateRoute>
                        <Layout>
                            <Suppliers/>
                        </Layout>
                    </PrivateRoute>
                }
                />
                <Route
                path='/inbound'
                element={
                    <PrivateRoute>
                        <Layout>
                            <Inbound/>
                        </Layout>
                    </PrivateRoute>
                }
                />
                <Route
                path='/outbound'
                element={
                    <PrivateRoute>
                        <Layout>
                            <Outbound/>
                        </Layout>
                    </PrivateRoute>
                }
                />
                <Route
                path='/users'
                element={
                    <PrivateRoute>
                        <Layout>
                            <Users/>
                        </Layout>
                    </PrivateRoute>
                }
                />
            </Routes>
        </BrowserRouter>
    )
}