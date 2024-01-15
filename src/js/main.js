let selectedPreset = ""

let run = (data) => {
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

window.onload = () => {
    ui_init();
}