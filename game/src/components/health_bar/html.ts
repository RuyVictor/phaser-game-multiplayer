export const containerStyle = `
    width: 170px;
    user-select: none;
`

export const playerNameStyle = `
    color: white;
    font: 12px 'Roboto', sans-serif;
    margin-bottom: 10px;
`

export const barStyle = `
    border-radius: 3px;
    width: 0%;
    height: 10px;
`

export const healthBarHTML = `
    <div style="${containerStyle}">
        <span id="player-name" style="${playerNameStyle}"></span>
        <div id="health-bar" style="${barStyle}"></div>
    </div>
`;