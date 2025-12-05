import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import ChatRoomList from './components/ChatRoomList';
import ChatView from './components/ChatView';
import AddRoomForm from './components/AddRoomForm';
import { getRooms, createRoom } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Form, Button, InputGroup } from 'react-bootstrap';

function App() {
  // Let's change `user` to hold a user object from the backend, not just a username string.
  // We'll also check localStorage to see if a user was already logged in.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chatUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); // Which room is selected?
  const [error, setError] = useState(null); // State for holding error messages

  useEffect(() => {
    // Only fetch rooms if the user is logged in
    if (user) {
      console.log('Fetching rooms for user:', user);
      // Using AbortController is a good practice to cancel fetch requests
      // if the component unmounts before the request is complete.
      const controller = new AbortController();
      const signal = controller.signal;

      const fetchRooms = async () => {
        try {
          // Use our new API service to fetch rooms with the access token.
          // The user object now contains the tokens.
          const data = await getRooms(user.tokens.access);
          console.log('Fetched rooms:', data);
          setRooms(data);
          setError(null); // Clear previous errors
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error("Failed to fetch rooms:", error);
            // If fetching rooms fails, it's likely an auth issue (e.g., expired token).
            // Log the user out to force a new login.
            setError("Your session may have expired. Please log in again.");
            handleLogout();
          }
        }
      };

      fetchRooms();

      // Cleanup function to abort the fetch if the component unmounts
      return () => {
        controller.abort();
      };
    }
  }, [user]); // Re-run this effect when the 'user' state changes.

  // This will be updated to handle a full user object from our backend.
  const handleLogin = (userData) => {
    console.log('handleLogin called with userData:', userData);
    setUser(userData);
    // Persist user data in localStorage to keep them logged in on refresh.
    localStorage.setItem('chatUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRoom(null);
    setRooms([]);
    localStorage.removeItem('chatUser');
    // We could also call a /api/logout endpoint here if we implement it
    // on the backend to blacklist the refresh token.
  };

  const handleSelectRoom = (room) => setSelectedRoom(room);

  const handleRoomCreated = async (roomData) => {
    console.log('handleRoomCreated called with roomData:', roomData);
    try {
      const newRoom = await createRoom(roomData, user.tokens.access);
      console.log('New room created:', newRoom);
      // Add the new room to the top of the list for immediate UI feedback
      setRooms(prevRooms => [newRoom, ...prevRooms]);
      setError(null);
    } catch (error) {
      console.error("Failed to create room:", error);
      setError("Failed to create the room. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <h1>Real-time Chat</h1>
      {error && <p className="error-message">{error}</p>}
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="chat-container">
          <div className="welcome-header">
            <h2>Welcome, {user.username}!</h2>
            <Button variant="danger" onClick={handleLogout} className="logout-button">Logout</Button>
          </div>
          <div className="main-layout">
            <div className="sidebar">
              <ChatRoomList rooms={rooms} onSelectRoom={handleSelectRoom} />
              <AddRoomForm onRoomCreated={handleRoomCreated} />
            </div>
            {selectedRoom && (
              <ChatView room={selectedRoom} user={user} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default App;