import { useState, useEffect, useRef } from 'react';
import { Form, Button, InputGroup, ListGroup, Alert } from 'react-bootstrap';
import { getMessages, postMessage } from '../services/api';

function ChatView({ room, user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect to fetch messages when the selected room changes
    useEffect(() => {
        if (room) {
            const fetchMessages = async () => {
                try {
                    const data = await getMessages(room.slug, user.tokens.access);
                    setMessages(data);
                    setError(null);
                } catch (err) {
                    setError("Failed to fetch messages. Please try again.");
                    console.error(err);
                }
            };
            fetchMessages();
        }
    }, [room, user.tokens.access]);

    // Effect to scroll to the bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const postedMessage = await postMessage(room.slug, newMessage, user.tokens.access);
            // Add the new message to the state for immediate UI update
            setMessages(prevMessages => [...prevMessages, postedMessage]);
            setNewMessage('');
            setError(null);
        } catch (err) {
            setError("Failed to send message. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="chat-view">
            <div className="messages-list">
                {error && <Alert variant="danger">{error}</Alert>}
                <ListGroup>
                    {messages.map((msg) => (
                        <ListGroup.Item
                            key={msg.id}
                            className={msg.user === user.username ? 'my-message' : 'other-message'}
                        >
                            <strong>{msg.user}:</strong> {msg.content}
                            <div className="timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </ListGroup.Item>
                    ))}
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
