let tableSharpes = document.getElementById('table_sharpes')
let tableSignifs = document.getElementById('table_signifs')
let results_header = document.getElementById('results-header')
let loader = document.getElementsByClassName('loader')[0]
let server_url = ""

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('server_url') !== null) {
        server_url = localStorage.getItem('server_url');
        let server_url_input = document.getElementById('server_url');
        server_url_input.value = server_url;
    }

    var allCheckbox = document.getElementById('toggle-all-models');
    var otherCheckboxes = document.querySelectorAll('[name="model"]');

    allCheckbox.addEventListener('change', function () {
        is_checked = allCheckbox.checked

        otherCheckboxes.forEach(function (checkbox) {
            checkbox.checked = is_checked
        });
    });
});

let set_server_url = () => {
    let server_url_input = document.getElementById('server_url')
    server_url = server_url_input.value
    
    localStorage.setItem('server_url', server_url)
}

let loading = (x) => {
    if (x) {
        loader.style.display = "inline-block"
        tableSharpes.style.display = "none"
        results_header.style.display = "none"
        window.scrollTo(0, document.body.scrollHeight);
    } else {
        loader.style.display = "none"
        tableSharpes.style.display = "block"
        results_header.style.display = "block"
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

    now_ym = new Date().toISOString().slice(0, 7).replace(/-/g, "")

    switch (name) {

        case "spsector":
            riskFactor.value = "7"
            riskFree.value = "1"
            dateFormat.value = "Ymd"
            dateRangeStart.value = "19940131"
            dateRangeEnd.value = server_url == "" ? "20240229" : new Date().toISOString().slice(0, 10).replace(/-/g, "")
            break;

        case "industry":
            riskFactor.value = "12"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = server_url == "" ? "202012" : now_ym
            break;

        case "international":
            riskFactor.value = "10"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = server_url == "" ? "201912" : now_ym
            break;

        case "25_1":
            riskFactor.value = "27"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = server_url == "" ? "202012" : now_ym
            break;

        case "25_3":
            riskFactor.value = "26, 27, 28"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = server_url == "" ? "202012" : now_ym
            break;

        case "25_4":
            riskFactor.value = "26, 27, 28, 29"
            riskFree.value = "1"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = server_url == "" ? "202012" : now_ym
            break;

        case "ff4":
            riskFactor.value = "1"
            riskFree.value = "4"
            dateFormat.value = "Ym"
            dateRangeStart.value = "199901"
            dateRangeEnd.value = server_url == "" ? "202012" : now_ym
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

let showResults = (gammas, data) => {
    tableSharpes.innerHTML = ""

    // create header row
    let headerRow = `<tr><th>Models &darr; | Risk Tolerance &rarr;</th>`

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

        tableSharpes.innerHTML += rowSharpe
    }

    tableSharpes.innerHTML += `<tr><td><button style="width: 200px" class="btn btn-primary" onclick="tableToCSV('sharpe')">Download</button></td></tr>`
}

let disablePreloadInputs = (x) => {

    if (x) {

        let inputs = document.getElementsByTagName('input')
        let selects = document.getElementsByTagName('select')
    
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i]
            
            if (input.name == 'delim' || input.name == 'date-format' ||
                input.name == 'risk-factor' || input.name == 'risk-free') input.disabled = true
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