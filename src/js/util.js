function storeLocalData(name, data) {
    localStorage.setItem(name, data);
    console.log("Stored " + name + " in local storage");
}

function getLocalData(name) {
    return localStorage.getItem(name);
}

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