import { useState } from 'react';
import { Tabs, Tab, Form, Button, Alert } from 'react-bootstrap';
import { loginUser, registerUser } from '../services/api';
import { jwtDecode } from 'jwt-decode';

function Login({ onLogin }) {
    const [key, setKey] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await loginUser({ username, password });
            console.log('Login successful:', data);
            const user = {
                username: username,
                tokens: data,
            };
            console.log('User object:', user);
            onLogin(user);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        try {
            await registerUser({ username, email, password });
            setSuccess('Registration successful! Please log in.');
            setKey('login'); // Switch to login tab on success
            setUsername('');
            setPassword('');
            setEmail('');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <Tabs
                id="login-register-tabs"
                activeKey={key}
                onSelect={(k) => {
                    setKey(k);
                    setError(null);
                    setSuccess(null);
                }}
                className="mb-3"
            >
                <Tab eventKey="login" title="Login">
                    <Form onSubmit={handleLogin}>
                        {success && <Alert variant="success">{success}</Alert>}
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3" controlId="loginUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange= {(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="loginPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">Login</Button>
                    </Form>
                </Tab>
                <Tab eventKey="register" title="Register">
                    <Form onSubmit={handleRegister}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3" controlId="registerUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="registerEmail">
                            <Form.Label>Email (optional)</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="registerPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" type="submit">Register</Button>
                    </Form>
                </Tab>
            </Tabs>
        </div>
    );
}

export default Login;
