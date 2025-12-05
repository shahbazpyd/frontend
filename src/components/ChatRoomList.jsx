import PropTypes from 'prop-types';

function ChatRoomList({ rooms, onSelectRoom }) {
  console.log('ChatRoomList rendered');
  console.log('rooms:', rooms);
  console.log('onSelectRoom:', onSelectRoom);
  return (
    <div className="room-list">
      <h3>Chat Rooms</h3>
      <ul>
        {rooms.map(room => (
          <li key={room.id}>
            <button onClick={() => onSelectRoom(room)}>{room.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

ChatRoomList.propTypes = {
  rooms: PropTypes.array.isRequired,
  onSelectRoom: PropTypes.func.isRequired,
};

export default ChatRoomList;
