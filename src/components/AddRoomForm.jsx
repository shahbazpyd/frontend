import { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

function AddRoomForm({ onRoomCreated }) {
    console.log('AddRoomForm rendered');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        console.log('AddRoomForm handleSubmit called');
        e.preventDefault();
        if (!name.trim()) return;
        // We call the handler passed from App.jsx
        onRoomCreated({ name });
        setName('');
    };

    return (
        <Form onSubmit={handleSubmit} className="add-room-form">
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder="New room name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Button variant="outline-secondary" type="submit">Create</Button>
            </InputGroup>
        </Form>
    );
}

export default AddRoomForm;
