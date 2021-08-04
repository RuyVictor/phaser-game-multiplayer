const containerStyle = `
    background-color: rgba(255,255,255 , .7);
    width: 300px;
    height: 230px;
    border-radius: 3px;
    padding: 0.6rem 1rem;
    display: flex;
    flex-direction: column;
`;

export const messageStyle = `
    overflow: auto;
    height: 100%;
    margin-bottom: 10px;
    color: #4a4a4a;
    font: 12px Roboto, 'sans-serif';
    word-wrap: break-word;
    text-align: justify;
`

export const containerHTML = `
    <div id="container" style="${containerStyle}">
    </div>
`;