const containerStyle = `
    background-color: rgba(255, 255, 255,1);
    padding: 2rem 1.8rem;
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0 , .1);
    width: 500px;
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

export const mapsContainer = `
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(4, 1fr);
`

const formsContainer  = `
    display: flex;
    flex-direction: column;
`;

export const slider = `
    width: 100%;
    height: 60px;
    padding: 0 10px;
    border-style: solid;
    border-width: 2px;
    border-color: rgba(233, 233, 233,1);
    box-sizing: border-box;
`

export const img = `
    width: 100%;
    height: 100%;
    object-fit: cover;
`

export const createRoomContainerHTML = `
    <div id="container" style="${containerStyle}">
        <div style="${actionsContainer}">
            <button id="back_button" style="${actionButton}">VOLTAR</button>
            <button id="create_room_button" style="${actionButton}">CRIAR SALA</button>
        </div>
        <hr>
        <div style="${formsContainer}">
            <span>Quantidade total de jogadores</span> <span id="playersRange"></span>
            <input id="slider" style=${slider} type="range" min="1" max="20" value="1">
            <div style="display: flex; align-items: center;">
                <span>Manter sala privada</span>
                <label class="switch">
                    <input type="checkbox">
                    <span class="slider"></span>
                </label>
            </div>
            <span>Selecione o mapa</span>
            <div id="maps_container" style="${mapsContainer}">
                <a mapName="Gravel">
                    <img style="${img}" src="https://www.mobygames.com/images/promo/original/1471200089-3770160237.jpg" alt="">
                    <span>Gravel</span>
                </a>
                <a mapName="Beinliver">
                    <img style="${img}" src="https://www.mobygames.com/images/promo/original/1471200089-3770160237.jpg" alt="">
                    <span>Beinliver</span>
                </a>
                <a mapName="Grenlander">
                    <img style="${img}" src="https://www.mobygames.com/images/promo/original/1471200089-3770160237.jpg" alt="">
                    <span>Grenlander</span>
                </a>
                <a mapName="Junshen">
                    <img style="${img}" src="https://www.mobygames.com/images/promo/original/1471200089-3770160237.jpg" alt="">
                    <span>Junshen</span>
                </a>
            </div>
        </div>
    </div>
`;