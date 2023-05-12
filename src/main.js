let tableSharpes = document.getElementById('table_sharpes')
let tableSignifs = document.getElementById('table_signifs')

function loadClick(x) {
    loading(true)
    setTimeout(function () {
        run(x)
    }, 1000);
}

function run(presentName) {
    runPresent = pyodideGlobals.get('runPresent')
    proxy = runPresent(presentName)

    gammas = []
    data = {}

    let gamma_proxy = proxy.get(0)
    let data_proxy = proxy.get(1)

    for (let i = 0; i < gamma_proxy.length; i++) {
        gammas.push(gamma_proxy.get(i))
    }

    for (let i = 0; i < data_proxy.length; i++) {
        let name = data_proxy.get(i).get(0)

        data[name] = {
            'name': name,
            'src': [],
            'sig': [],
        }

        srs = data_proxy.get(i).get(1)
        sigs = data_proxy.get(i).get(2)

        for (let j = 0; j < srs.length; j++) {
            data[name]['src'].push(srs.get(j))
            data[name]['sig'].push(sigs.get(j))
        }
    }

    showResults(gammas, data)
    loading(false);
}

function show(element, show) {
    if (show) {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }
}

let showResults = (gammas, data) => {
    tableSharpes.innerHTML = ""
    tableSignifs.innerHTML = ""

    let captionSharpe = `<caption>Sharpe Ratios</caption>`
    let captionSignif = `<caption>P-Values</caption>`

    tableSharpes.innerHTML += captionSharpe
    tableSignifs.innerHTML += captionSignif

    // create header row
    let headerRow = `<tr><th class="c">Models &darr; | Gammas &rarr;</th>`

    for (let i = 0; i < gammas.length; i++) {
        let gammaHeader = `<th class="c">${gammas[i]}</th>`
        headerRow += gammaHeader
    }

    headerRow += "</tr>"

    // add header row to table
    tableSharpes.innerHTML += headerRow
    tableSignifs.innerHTML += headerRow

    // create data rows
    for (let key in data) {
        let rowSharpe = `<tr><td class="l">${data[key]['name']}</td>`
        let rowSignif = `<tr><td class="l">${data[key]['name']}</td>`

        for (let i = 0; i < data[key]['src'].length; i++) {
            let src = data[key]['src'][i].toFixed(3)
            let sig = data[key]['sig'][i].toFixed(3)

            rowSharpe += `<td class="c">${src}</td>`
            rowSignif += `<td class="c">${sig}</td>`
        }

        rowSharpe += "</tr>"
        rowSignif += "</tr>"

        // add data rows to table
        tableSharpes.innerHTML += rowSharpe
        tableSignifs.innerHTML += rowSignif
    }

    // add button to export table to csv at the bottom of the table
    tableSharpes.innerHTML += `<tr><td colspan="${gammas.length + 1}"><button onclick="tableToCSV('sharpe')">Download</button></td></tr>`
    tableSignifs.innerHTML += `<tr><td colspan="${gammas.length + 1}"><button onclick="tableToCSV('signif')">Download</button></td></tr>`
}

// The below code is from: https://www.geeksforgeeks.org/how-to-export-html-table-to-csv-using-javascript/

function tableToCSV(tableName) {

    let table;

    // Variable to store the final csv data
    var csv_data = [];

    if (tableName == "sharpe") table = document.getElementById('table_sharpes');
    if (tableName == "signif") table = document.getElementById('table_signifs');

    // Get each row data, except the last row
    let rows = table.querySelectorAll('tr');
    for (var i = 0; i < rows.length - 1; i++) {

        // Get each column data
        var cols = rows[i].querySelectorAll('td,th');

        // Stores each csv row data
        var csvrow = [];
        for (var j = 0; j < cols.length; j++) {

            // Get the text data of each cell of
            // a row and push it to csvrow
            csvrow.push(cols[j].innerHTML);
        }

        // Combine each column value with comma
        csv_data.push(csvrow.join(","));
    }
    // Combine each row data with new line character
    csv_data = csv_data.join('\n');

    // Call this function to download csv file 
    downloadCSVFile(csv_data);
}


function downloadCSVFile(csv_data) {

    // Create CSV file object and feed our
    // csv_data into it
    CSVFile = new Blob([csv_data], { type: "text/csv" });

    // Create to temporary link to initiate
    // download process
    var temp_link = document.createElement('a');

    // Download csv file
    temp_link.download = "results.csv";
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    // This link should not be displayed
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    // Automatically click the link to trigger download
    temp_link.click();
    document.body.removeChild(temp_link);
}