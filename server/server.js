const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

//tässä säilytetään taulukon data
let tableData = [];

app.use(express.json()); 
//reitti taulukon luomiseen
app.post('/generate-table', (req, res) => {
    const { rows, columns } = req.body;
    
    //generoidaan uusi taulukko satunnaisluvuilla
    tableData = generateTable(rows, columns);
    
    //lähetetään vastaus generoidusta taulusta ja lähetetään se json-muodossa clientille
    res.json({ table: tableData });
});

//reitti solujen arvojen päivittämiselle
app.put('/update-cell', (req, res) => {
    const { rowIndex, colIndex, operation, value } = req.body;

    let currentValue = tableData[rowIndex][colIndex];
    let newValue;

    switch (operation) { //tarkastellaan switch-casella (käyttäjän valitsemaa) operaattoria ja tehdään sen perusteella oikea laskutoimitus
        case '+':
            newValue = value + currentValue;
            break;
        case '-':
            newValue = currentValue - value;
            break;
        case '*':
            newValue = currentValue * value;
            break;
        case '/':
            newValue = currentValue / value;
            break;
        default:
            break;
    }
    newValue = Math.max(newValue, 0);
    //päivitetään taulukko ja lähetetään response uudella arvolla
    tableData[rowIndex][colIndex] = newValue;
    res.json({ newValue });
});

//generoidaan taulukko satunnaisilla positiivisilla kokonaisluvuilla
function generateTable(rows, columns) {
    const table = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
            row.push(Math.floor(Math.random() * 100));
        }
        table.push(row);
    }
    return table;
}

app.listen(port, () => {
    console.log(`servu pyörii hienosti portissa ${port}`);
});
