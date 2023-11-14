let tableSharpes = document.getElementById('table_sharpes')
let tableSignifs = document.getElementById('table_signifs')

let selectedPreset = ""

let handleFormSubmit = () => {
    // get the form data
    let form = document.getElementById('form')
    let file = document.getElementById('file').files[0]
    let delimType = form.elements['delim'].value
    let dateFormat = form.elements['date-format'].value
    let riskFactor = form.elements['risk-factor'].value
    let riskFree = form.elements['risk-free'].value
    let timeHorizons = form.elements['time-horizons'].value
    let gammas = form.elements['gammas'].value
    let dateRangeStart = form.elements['date-range-start'].value
    let dateRangeEnd = form.elements['date-range-end'].value
    let models = form.elements['model']
    let checkedModels = []

    for (let i = 0; i < models.length; i++) {
        if (models[i].checked) {
            checkedModels.push(Number(models[i].value))
        }
    }

    let data = {
        'delimType': delimType, // comma or tab
        'dateFormat': dateFormat ? dateFormat : null,
        'riskFactor': riskFactor != "" ? riskFactor : [], // list of numbers
        'riskFree': riskFree ? riskFree : 1, // single int
        'timeHorizons': timeHorizons ? timeHorizons : [], // list of numbers
        'gammas': gammas ? gammas : [], // list of numbers
        'dateRangeStart': dateRangeStart ? dateRangeStart : null,
        'dateRangeEnd': dateRangeEnd ? dateRangeEnd : null,
        'models': checkedModels,
    }

    if (validate(data)) {
        document.body.style.cursor = 'wait';
        
        if (file == undefined) {
            data["selectedPreset"] = selectedPreset

            run(data)
        } else {
            let reader = new FileReader()
            reader.readAsText(file, "UTF-8")
            reader.onload = function (evt) {
                fileData = evt.target.result
                data["fileData"] = fileData

                run(data)
            }
        }

    } else return
}

let validate = (data) => {

    /*
        'delimType': delimType, // comma or tab
        'dateFormat': dateFormat ? dateFormat : null,
        'riskFactor': riskFactor ? riskFactor : [], // list of numbers
        'riskFree': riskFree ? riskFree : 0, // single int
        'timeHorizons': timeHorizons, // list of numbers
        'gammas': gammas, // list of numbers
        'dateRangeStart': dateRangeStart ? dateRangeStart : null,
        'dateRangeEnd': dateRangeEnd ? dateRangeEnd : null,
        'models': checkedModels,
    */

    if (data['dateFormat'] == null) {
        alert("There must be a dateformat")
        return false
    } else {
    
        data['dateFormat'] = data['dateFormat'].toLowerCase()

        let validChars = ['y', 'm', 'd', '-', '/', '.']

        let yCount = 0
        let mCount = 0
        let dCount = 0

        for (let i = 0; i < data['dateFormat'].length; i++) {
            let char = data['dateFormat'][i]

            if (!validChars.includes(char)) {
                alert("Date format can only contain the characters y, m, d, -, /, and .")
                return false
            }

            if (char == 'y') {
                yCount++
            } else if (char == 'm') {
                mCount++
            } else if (char == 'd') {
                dCount++
            }
        }

        // check if y, m, or d is in the date format. there can only be 1 of each
        if (yCount + mCount + dCount == 0) {
            alert("Date format must contain at least one of y, m, or d")
            return false
        } else if (yCount > 1 || mCount > 1 || dCount > 1) {
            alert("Date format can not contain more than one of y, m, or d")
            return false
        }

        // replace y (upper and lower) with %Y, m (upper and lower) with %m, and d (upper and lower) with %d
        data['dateFormat'] = data['dateFormat'].replace(/y/g, '%Y')
        data['dateFormat'] = data['dateFormat'].replace(/m/g, '%m')
        data['dateFormat'] = data['dateFormat'].replace(/d/g, '%d')

    }

    try {
        if (data['riskFactor'].length > 0) {

            data['riskFactor'] = data['riskFactor'].split(',').map(Number)

            for (let i = 0; i < data['riskFactor'].length; i++) {
                if (isNaN(data['riskFactor'][i])) {
                    throw error
                }
            }

        }
    } catch (error) {
        alert("Risk Factor must be a comma separated list of numbers")
        return false
    }

    try {
        // convert risk free to number
        data['riskFree'] = Number(data['riskFree'])
    } catch (error) {
        alert("Risk Free must be a number")
        return false
    }

    try {
        data['timeHorizons'] = data['timeHorizons'].split(',').map(Number)
    
        for (let i = 0; i < data['timeHorizons'].length; i++) {
            if (isNaN(data['timeHorizons'][i])) {
                throw error
            }
        }

        if (data['timeHorizons'].length < 2) {
            alert("Must have at least 2 time horizons")
            return false
        }

        // if last element is 0, remove it
        if (data['timeHorizons'][data['timeHorizons'].length - 1] == 0) {
            data['timeHorizons'].pop()
        }
    } catch (error) {
        alert("Time Horizons must be a comma separated list of numbers")
        return false
    }

    try {
        data['gammas'] = data['gammas'].split(',').map(Number)
        
        for (let i = 0; i < data['gammas'].length; i++) {
            if (isNaN(data['gammas'][i])) {
                throw error
            }
        }

        // if last element is 0, remove it
        if (data['gammas'][data['gammas'].length - 1] == 0) {
            data['gammas'].pop()
        }
    } catch (error) {
        alert("Gammas must be a comma separated list of numbers")
        return false
    }

    // check if date format is null, date range start and end are not null
    if (data['dateFormat'] == null && (data['dateRangeStart'] != null || data['dateRangeEnd'] != null)) {
        alert("Must specify a date format")
        return false
    }

    // check if date range start and end are same length
    if (data['dateRangeStart'] != null && data['dateRangeEnd'] != null && data['dateRangeStart'].length != data['dateRangeEnd'].length) {
        alert("Start and end date must be the same length")
        return false
    }

    // check if date format contains -, /, or ., then date range start and end must contains the same characters, the same number of times and in the same order
    if (data['dateFormat'] != null && (data['dateFormat'].includes('-') || data['dateFormat'].includes('/') || data['dateFormat'].includes('.'))) {
        let start = data['dateRangeStart']
        let end = data['dateRangeEnd']
        let dateFormat = data['dateFormat']

        let startChars = []
        let endChars = []
        let dateFormatChars = []

        for (let i = 0; i < start.length; i++) {
            let char = start[i]

            if (char == '-' || char == '/' || char == '.') {
                startChars.push(char)
            } else if (isNaN(char)) {
                alert("Date range must be formatted the same as the date format. It can only contain numbers, -, /, and .")
                return false
            }
        }

        for (let i = 0; i < end.length; i++) {
            let char = end[i]

            if (char == '-' || char == '/' || char == '.') {
                endChars.push(char)
            } else if (isNaN(char)) {
                alert("Date range must be formatted the same as the date format. It can only contain numbers, -, /, and .")
                return false
            }
        }

        for (let i = 0; i < dateFormat.length; i++) {
            let char = dateFormat[i]

            if (char == '-' || char == '/' || char == '.') {
                dateFormatChars.push(char)
            }
        }

        if (startChars.length != endChars.length || startChars.length != dateFormatChars.length) {
            alert("Date range must be formatted the same as the date format")
            return false
        }

        for (let i = 0; i < startChars.length; i++) {
            if (startChars[i] != dateFormatChars[i] || endChars[i] != dateFormatChars[i]) {
                alert("Date range must be formatted the same as the date format")
                return false
            }
        }
    }


    if (data['models'].length == 0) {
        alert("Must select at least one model")
        return false
    }

    return true

}

let disablePreloadInputs = (x) => {

    if (x) {

        // disable all inputs except inputs with name = gammas, time-horizons, and model
        let inputs = document.getElementsByTagName('input')
        let selects = document.getElementsByTagName('select')
    
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i]
            if (input.name != 'gammas' && input.name != 'time-horizons' && input.name != 'model' &&
                input.name != 'date-range-start' && input.name != 'date-range-end' && input.name != 'file') {
                input.disabled = true
            }
        }

        for (let i = 0; i < selects.length; i++) {
            let select = selects[i]
            if (select.name != 'model') {
                select.disabled = true
            }
        }

    } else {
            
            // enable all inputs
            let inputs = document.getElementsByTagName('input')
            let selects = document.getElementsByTagName('select')
        
            for (let i = 0; i < inputs.length; i++) {
                let input = inputs[i]
                input.disabled = false
            }
    
            for (let i = 0; i < selects.length; i++) {
                let select = selects[i]
                select.disabled = false
            }
    }

}

let run = (data) => {
    // convert data to json string
    let dataJson = JSON.stringify(data)

    runModel = pyodideGlobals.get('runModel')
    proxy = runModel(dataJson)
    try {
        res = proxy.toJs()

        error = res.get('error')
        if (error != null) {
            alert(error)
        }

        gammas = res.get('gamma')
        data = {}

        let data_proxy = res.get('sr')

        console.log(data_proxy)

        for (let i = 0; i < data_proxy.length; i++) {
            let name = data_proxy[i][0]

            data[name] = {
                'name': name,
                'src': [],
                'sig': [],
            }

            srs = data_proxy[i][1]
            sigs = data_proxy[i][2]

            for (let j = 0; j < srs.length; j++) {
                data[name]['src'].push(srs[j])
                data[name]['sig'].push(sigs[j])
            }
        }

        showResults(gammas, data)
        document.body.style.cursor = 'default';
    } catch (error) {
        alert("Error running model")
        document.body.style.cursor = 'default';
        return
    }
}

let togglePreset = (name) => {
    let buttons = document.getElementsByClassName("preset")
    let activateButton = document.getElementById("preset_" + name)

    // remove file from file input
    let file = document.getElementById('file')
    file.value = ""
    let fileName = document.getElementById('filename')
    fileName.innerHTML = ""

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = "#0d6efd"
        disablePreloadInputs(false)
    }

    let delimType = form.elements['delim']
    let dateFormat = form.elements['date-format']
    let riskFactor = form.elements['risk-factor']
    let riskFree = form.elements['risk-free']
    let dateRangeStart = form.elements['date-range-start']
    let dateRangeEnd = form.elements['date-range-end']

    delimType.value = "comma"
    delimType.checked = true

    switch (name) {

        case "spsector":
            riskFactor.value = "7"
            riskFree.value = "1"
            dateFormat.value = "Ymd"
            dateRangeStart.value = "19940131"
            dateRangeEnd.value = "20201201"
            break;

        case "industry":
            riskFactor.value = "12"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = "202012"
            break;

        case "international":
            riskFactor.value = "10"
            riskFree.value = "1"
            dateFormat.value = "d-m-Y"
            dateRangeStart.value = "29-01-1999"
            dateRangeEnd.value = "31-12-2019"
            break;

        case "25_1":
            riskFactor.value = "27"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = "202012"
            break;

        case "25_3":
            riskFactor.value = "26, 27, 28"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = "202012"
            break;

        case "25_4":
            riskFactor.value = "26, 27, 28, 29"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = "202012"
            break;

        case "ff4":
            riskFactor.value = "1"
            riskFree.value = "4"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = "202012"
            break;

    }

    if (selectedPreset == "") {
        activateButton.style.backgroundColor = "#020aab"
        selectedPreset = name
        disablePreloadInputs(true)
    } else if (selectedPreset == name) {
        selectedPreset = ""
        riskFactor.value = ""
        riskFree.value = ""
        dateFormat.value = ""
        dateRangeStart.value = ""
        dateRangeEnd.value = ""
    } else {
        activateButton.style.backgroundColor = "#020aab"
        selectedPreset = name
        disablePreloadInputs(true)
    }
}

let openUploadDialogue = () => {
    document.getElementById('file').click()
    disablePreloadInputs(false)

    let dateFormat = form.elements['date-format']
    let riskFactor = form.elements['risk-factor']
    let riskFree = form.elements['risk-free']
    let dateRangeStart = form.elements['date-range-start']
    let dateRangeEnd = form.elements['date-range-end']

    selectedPreset = ""
    dateFormat.value = ""
    riskFactor.value = ""
    riskFree.value = ""
    dateRangeStart.value = ""
    dateRangeEnd.value = ""

    let buttons = document.getElementsByClassName("preset")
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = "#0d6efd"
    }
}

let showFileName = () => {
    let file = document.getElementById('file').files[0]
    let fileName = document.getElementById('filename')
    fileName.innerHTML = file.name
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

    // create header row
    let headerRow = `<tr><th>Models &darr; | Gammas &rarr;</th>`

    for (let i = 0; i < gammas.length; i++) {
        let gammaHeader = `<th>${gammas[i]}</th>`
        headerRow += gammaHeader
    }

    headerRow += "</tr>"

    // add header row to table
    tableSharpes.innerHTML += headerRow

    // create data rows
    for (let key in data) {
        let rowSharpe = `<tr><td>${data[key]['name']}</td>`

        for (let i = 0; i < data[key]['src'].length; i++) {
            let src = data[key]['src'][i].toFixed(3)
            let sig = data[key]['sig'][i].toFixed(3)

            rowSharpe += `<td class="c">${src} (${sig})</td>`
        }

        rowSharpe += "</tr>"

        // add data rows to table
        tableSharpes.innerHTML += rowSharpe
    }

    // add button to export table to csv at the bottom of the table
    tableSharpes.innerHTML += `<tr><td><button style="width: 200px" class="btn btn-primary" onclick="tableToCSV('sharpe')">Download</button></td></tr>`
    tableSharpes.innerHTML += `<caption>Sharpe Ratio (P-Value)</caption>`
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


function storeLocalData(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
}

function getLocalData(name) {
    return JSON.parse(localStorage.getItem(name));
}