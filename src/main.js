let exportButton = document.getElementById('export')

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

    toggle(exportButton)
    showResults(gammas, data)
    loading(false);
}

function toggle(element) {
    if (element.style.display === "none") {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }
}

let showResults = (gammas, data) => {
    // get table from inside #results div
    let table = document.getElementById('results').children[0]
    table.innerHTML = ""

    // create header row
    let headerRow = `<tr><th class="c">Models</th>`

    for (let i = 0; i < gammas.length; i++) {
        let gammaHeader = `<th class="c">${gammas[i]}</th>`
        headerRow += gammaHeader
    }

    headerRow += "</tr>"

    // add header row to table
    table.innerHTML += headerRow

    // create data rows
    for (let key in data) {
        let row = `<tr><td class="l">${data[key]['name']}</td>`

        for (let i = 0; i < data[key]['src'].length; i++) {
            let src = data[key]['src'][i].toFixed(3)
            let sig = data[key]['sig'][i].toFixed(3)

            let cell = `<td class="c">${src} (${sig})</td>`
            row += cell
        }

        row += "</tr>"
        // add row to table
        table.innerHTML += row
    }
}

// The below code is from: https://www.geeksforgeeks.org/how-to-export-html-table-to-csv-using-javascript/

function tableToCSV() {

    // Variable to store the final csv data
    var csv_data = [];

    // Get each row data
    var rows = document.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {

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