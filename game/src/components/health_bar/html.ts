export const containerStyle = `
    width: 150px;
    border-radius: 3px;
`

export const barStyle = `
	background-color: #d90429;
    width: 0%;
    height: 10px;
`

export const healthBarHTML = `
    <div style="${containerStyle}">
        <div id="health-bar" style="${barStyle}"></div>
    </div>
`;