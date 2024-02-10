import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function DynamicTable() {
    const [rows, setRows] = useState(0);
    const [columns, setColumns] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [activeCell, setActiveCell] = useState(null);

    function generateTableFromServer(rows, columns) { //haetaan serverin päässä generoitu taulukko
        fetch('http://localhost:5000/generate-table', { //lähetetään POST-pyyntö /generate-table polkuun 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rows, columns }) //pyyntö sisältää json-muotoisen objektin
        })
            .then(response => { //tarkastellaan serveriltä saatua vastausta
                if (!response.ok) {
                    throw new Error('Failed to generate table');
                }
                return response.json(); //jos vastaus ok, puretaan js-objektiksi
            })
            .then(data => {
                setTableData(data.table); //ja asetetaan taulukon dataksi
            })
            .catch(error => {
                console.error('Error generating table:', error);
            });
    }

    function updateCellValue(rowIndex, colIndex, newValue) { //päivitetään uusi arvo taulukkoon
        const newTableData = [...tableData];
        newTableData[rowIndex][colIndex] = newValue;
        setTableData(newTableData);
    }

    function handleOperation(op) {
        if (selectedCell && inputValue !== '') { //jos solu on valittu ja syötetty arvo, jolla solun arvoon halutaan vaikuttaa..
            const [rowIndex, colIndex] = selectedCell;
            const value = parseInt(inputValue);
            fetch('http://localhost:5000/update-cell', { //...niin lähetetään servulle PUT-pyyntö
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rowIndex, colIndex, operation: op, value })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update cell value');
                    }
                    return response.json();
                })
                .then(data => {
                    updateCellValue(rowIndex, colIndex, data.newValue); //kutsutaan metodia, joka päivittää uuden arvon myös clientiin
                    setInputValue(''); //resetoidaan input-elementti
                })
                .catch(error => {
                    console.error('Error updating cell value:', error);
                });
        } else {
            alert('Please select a cell and provide a value first.'); //virheilmoitus tulee, jos yritetään suorittaa laskutoimitusta ilman, että yhtäkään solua on valittu tai input-elementti on tyhjä
        }
    }
    return (
        <div className='container mt-5'>
            <h1 className='text-center mb-5'>
                <span className='fw-light' style={{backgroundColor: 'red', color: 'white', fontStyle:'italic', padding:'20px'}}>Hurjan<i></i></span> hieno dynaaminen taulukko
            </h1>
            <form onSubmit={(e) => { e.preventDefault(); generateTableFromServer(rows, columns); }} class='row justify-content-center'>
                <div class='form-group mb-3'>
                    <label htmlFor='rows' className='form-label'>Rows:</label>
                    <input type='number' id='rows' min='1' value={rows} onChange={(e) => setRows(parseInt(e.target.value))} class='form-control rounded-pill' style={{minWidth: '80px'}} />
                </div>
                <div class='form-group mb-3'>
                    <label htmlFor='columns' className='form-label'>Columns:</label>
                    <input type='number' id='columns' min='1' value={columns} onChange={(e) => setColumns(parseInt(e.target.value))} class='form-control rounded-pill' style={{minWidth: '80px'}} />
                </div>
                <button type='submit' class='btn btn-primary'>Generate Table</button>
                
            </form>
            <div className='table-responsive'>
            <table className='table mt-5 mb-5'>
                    <tbody>
                        {tableData.map((rowData, rowIndex) => (
                            <tr key={rowIndex}>
                                {rowData.map((cellData, colIndex) => (
                                    <td key={colIndex} 
                                        onClick={() => {
                                            setSelectedCell([rowIndex, colIndex]);
                                            setActiveCell([rowIndex, colIndex]);
                                        }}
                                        className={`rounded ${activeCell && activeCell[0] === rowIndex && activeCell[1] === colIndex ? 'table-primary' : ''}`}
                                        style={{ padding: '10px', minWidth: '80px', textAlign: 'center' }}
                                    >
                                        {cellData}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className='mb-3'>
                <div className='mb-3'>
                <label htmlFor='value' className='form-label'>Insert value:</label>
                <input 
                type='text' 
                    id='value' 
                    value={inputValue} onChange={(e) => {
                        if (/^[1-9]*$/.test(e.target.value)) { //input-elementtiin voi syöttää vain numeroita
                            setInputValue(e.target.value);
                        }
                    }} className='form-control rounded-pill' style={{minWidth: '80px'}} />
                </div>
                <div className='d-flex justify-content-center'>
        <div className='btn-group'>
            <button onClick={() => handleOperation('+')} className='btn btn-primary me-1 btn-block'>+</button>
            <button onClick={() => handleOperation('-')} className='btn btn-primary me-1 btn-block'>-</button>
            <button onClick={() => handleOperation('*')} className='btn btn-primary me-1 btn-block'>x</button>
            <button onClick={() => handleOperation('/')} className='btn btn-primary me-1 btn-block'>/</button>
        </div>
    </div>
            </div>
        </div>
    );
}

export default DynamicTable;
