const containerStyle = `
    background-color: rgba(255,255,255 , .7);
    width: 300px;
    height: 230px;
    border-radius: 3px;
    padding: 0.6rem 1rem;
    display: flex;
    flex-direction: column;
`;

export const roomChatStyle = `
    overflow: auto;
    height: 100%;
    margin-bottom: 10px;
    color: #4a4a4a;
    font: 12px Roboto, 'sans-serif';
    word-wrap: break-word;
    text-align: justify;
`

export const messageStyle = `
    color: #4a4a4a;
    font: 12px Roboto, 'sans-serif';
    word-wrap: break-word;
`

export const actionsContainerStyle = `
    display: flex;
    gap: 20px;
`

export const TextfieldChatStyle = `
    padding: 0.6rem 1rem;
    border: none;
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0 , .1);
    width: 100%;
    color: #4a4a4a;
    font: 16px Roboto;
    border-radius: 4px;
`;

export const sendButtonStyle = `
	background-color: rgba(252, 186, 3, 1);
	box-shadow: 0 6px 10px 0 rgba(0, 0, 0 , .1);
	padding: 0.6rem 1rem;
	border: none;
    color: #4a4a4a;
    font: 16px Roboto;
    text-align: center;
  	text-decoration: none;
    border-radius: 4px;
`

export const chatContainerHTML = `
    <div id="container" style="${containerStyle}">
        <div id="room_chat" style="${roomChatStyle}">
        </div>
        <div style="${actionsContainerStyle}">
            <input type="text"
            id="field_chat"
            placeholder="Mensagem..."
            style="${TextfieldChatStyle}">
            <button id="send_message_button" style="${sendButtonStyle}">ENVIAR</button>
        </div>
    </div>
`;