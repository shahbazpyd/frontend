import { useState, useEffect, useRef } from 'react';
import { Form, Button, InputGroup, ListGroup, Alert } from 'react-bootstrap';
import { getMessages } from '../services/api';

function ChatView({ room, user }) {
    console.log('room:', room);
    console.log('user:', user);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    // We'll use a ref to hold the WebSocket instance.
    // This prevents it from being re-created on every render.
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect to fetch messages when the selected room changes
    // and to set up the WebSocket connection.
    useEffect(() => {
        if (room) {
            // 1. Fetch initial message history via HTTP
            const fetchMessages = async () => {
                try {
                    const data = await getMessages(room.slug, user.tokens.access);
                    setMessages(data);
                    setError(null);
                } catch (err) {
                    setError("Failed to fetch message history. Please try again.");
                    console.error(err);
                }
            };
            fetchMessages();

            // 2. Establish WebSocket connection
            // Determine WebSocket protocol and host based on the environment
            const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            // In production, the backend and frontend are on the same host.
            // In development, we use a specific host and port from env variables.
            const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;

            const wsUrl = `${wsProtocol}://${wsHost}/ws/chat/${room.slug}/?token=${user.tokens.access}`;
            const socket = new WebSocket(wsUrl);
            console.log('socket:', socket);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('WebSocket connection opened');
                console.log(`WebSocket connected to room: ${room.name}`);
                setError(null);
            };

            socket.onmessage = (ee) => {
                console.log('WebSocket message received:', ee.data);
                const data = JSON.parse(ee.data);
                // The backend now sends a consistent message object.
                console.log('Received message:', data);
                setMessages((prevMessages) => [...prevMessages, data]);
            };

            socket.onerror = (e) => {
                console.error("WebSocket error:", e);
                setError("WebSocket connection error. Please refresh the page.");
            };

            socket.onclose = () => {
                console.log(`WebSocket disconnected from room: ${room.name}`);
            };

            // 3. Cleanup on component unmount or room change
            return () => {
                socket.close();
                socketRef.current = null;
            };
        }
    }, [room, user.tokens.access]);

    // Effect to scroll to the bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
      console.log('handleSendMessage called');
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Send message through the WebSocket
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log('Sending message:', newMessage);
            socketRef.current.send(JSON.stringify({
                'message': newMessage // The consumer expects 'message' as the key
            }));
            setNewMessage('');
        } else {
            setError("WebSocket is not connected. Cannot send message.");
        }
        // We no longer need to manually add the message to the state,
        // as the server will broadcast it back to us.
    };

    return (
        <div className="chat-view">
            <div className="messages-list">
                {error && <Alert variant="danger">{error}</Alert>}
                <ListGroup>
                    {messages.map((msg) => {
                        const messageClass = msg.user === user.username ? 'my-message' : 'other-message';
                        console.log('msg:',msg)
                        console.log("user:",user)
                        return (
                            // Wrapper div to allow alignment within the ListGroup
                            <div key={msg.id} className={`message-wrapper ${messageClass}-wrapper`}>
                                <ListGroup.Item className={messageClass}>
                                    <strong>{msg.user}:</strong> {msg.content}
                                    <div className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                                </ListGroup.Item>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </ListGroup>
            </div>
            <div className="message-input-form">
                <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            autoComplete="off"
                        />
                        <Button variant="primary" type="submit">
                            Send
                        </Button>
                    </InputGroup>
                </Form>
            </div>
        </div>
    );
}

export default ChatView;
