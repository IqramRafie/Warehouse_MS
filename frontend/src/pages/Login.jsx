import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {

    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {
            await login(username, password);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Invalid Credentials");
        }
    };

    return(
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-800 p-6 rounded-xl w-80 space-y-4"
          >
            <h1 className="text-xl font-bold text-white text-center">
              Warehouse Login
            </h1>

            <input
              className="w-full p-2 rounded bg-zinc-700 text-white"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              className="w-full p-2 rounded bg-zinc-700 text-white"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
              Login
            </button>
          </form>
        </div>
    );
}