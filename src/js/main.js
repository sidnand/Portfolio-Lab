let selectedPreset = ""

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent Chrome 76 and later from automatically showing the prompt
  event.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = event;
  // Update UI to notify the user they can install the PWA
  showInstallButton();
});

function showInstallButton() {
  // Show a button or element to prompt the user to install the app
  // Example: Display an "Install" button
  const installButton = document.getElementById('install-button');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    // Trigger the deferred prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Reset the deferred prompt
      deferredPrompt = null;
    });
  });
}

let run = async (data) => {
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
    } catch (error) {
        alert("Error running model")
        return
    }
}