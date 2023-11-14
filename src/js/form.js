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
            if (server_url == "") {
                data["selectedPreset"] = selectedPreset
                run(data)
            } else {
                fetch(server_url + '/' + selectedPreset)
                    .then(response => {
                        if (response.status === 200) {
                            return response.json();
                        } else {
                            throw new Error('Failed to fetch data');
                        }
                    })
                    .then(json => {
                        data["fileData"] = json
                        run(data)
                    })
                    .catch(error => console.error(error));
            }
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

        // if (data['timeHorizons'].length < 2) {
        //     alert("Must have at least 2 time horizons")
        //     return false
        // }

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