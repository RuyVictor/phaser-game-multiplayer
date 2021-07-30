const containerStyle = `
    background-color: rgba(255, 255, 255,1);
    padding: 2rem 1.8rem;
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0 , .1);
    width: 800px;
    border-radius: 3px;
`;

const actionsContainer  = `
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
`;

const actionButton  = `
    border: none;
    padding: 1rem 4rem;
    font-size: 17px;
`;

const codeInput = `
    padding: 0 10px;
    border-style: solid;
    border-width: 2px;
    border-color: rgba(233, 233, 233,1);
`;

const roomsContainer = `
    display: flex;
    flex-direction: column;
    overflow: auto;
    gap: 13px;
    height: 300px;
    padding: 1rem;
    border-style: solid;
    border-width: 0.4px;
    border-color: rgba(233, 233, 233,1);
`

export const singleRoomContainer = `
    display: flex;
    align-items: center;
    padding: 0 20px;
    background-color: rgba(233, 233, 233,1);
    box-shadow: 0 0px 4px 0 rgba(0, 0, 0 , .1);
    min-height: 80px;
`

export const span = `
    flex: 1;
    vertical-align: middle;
    text-align: center;
`

export const roomsContainerHTML = `
    <div id="container" style="${containerStyle}">
        <div id="actions_container" style="${actionsContainer}">
            <button id="create_room_button" style="${actionButton}">CRIAR SALA</button>
            <input id="code_input" style="${codeInput}" placeholder="Código da sala">
            <button id="join_room_button" style="${actionButton}">ENTRAR COM CÓDIGO</button>
        </div>
        <span>Salas</span>
        <hr>
        <div id="rooms_container" style="${roomsContainer}">
        </div>
    </div>
`;