import React from 'react';
import Chat from './component/chat';

const App = () => {
    const projectId = "67ee5412aa7c5dc3c8a1a107"; // Remplacez par l'ID de projet

    return (
        <div style={{ padding: '20px' }}>
            <h1>Application de Chat</h1>
            <Chat projectId={projectId} />
        </div>
    );
};

export default App;
