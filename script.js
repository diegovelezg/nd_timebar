document.addEventListener('DOMContentLoaded', function() {
    var sampleRequestButton = document.getElementById('sampleRequestButton');
    if (sampleRequestButton) {
        sampleRequestButton.addEventListener('click', trySampleRequest);
    }

    // Llama a otras funciones de inicialización aquí, como cargar la API de Google, etc.
});

        
        
        var YOUR_CLIENT_ID = '523272931-kjks2l3eimgi2oqll2eovj6top6meb40.apps.googleusercontent.com';
        var YOUR_REDIRECT_URI = 'http://localhost:5500';
        var fragmentString = location.hash.substring(1);

        // Parse query string to see if page request is coming from OAuth 2.0 server.
        var params = {};
        var regex = /([^&=]+)=([^&]*)/g, m;
        while (m = regex.exec(fragmentString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        if (Object.keys(params).length > 0) {
            localStorage.setItem('oauth2-test-params', JSON.stringify(params));
            if (params['state'] && params['state'] == 'try_sample_request') {
                trySampleRequest();
            }
        }

        function trySampleRequest() {
            var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
            if (params && params['access_token']) {
                loadEvents(params['access_token']);
            } else {
                oauth2SignIn();
            }
        }

        function loadEvents(accessToken) {
            var now = new Date().toISOString();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + now + '&maxResults=10&orderBy=startTime&singleEvents=true');
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    displayEvents(JSON.parse(xhr.responseText).items);
                } else if (xhr.readyState === 4) {
                    console.error('Error loading events: ' + xhr.responseText);
                }
            };
            xhr.send();
        }

        function oauth2SignIn() {
            var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
            var form = document.createElement('form');
            form.setAttribute('method', 'GET');
            form.setAttribute('action', oauth2Endpoint);
            var params = {
                'client_id': YOUR_CLIENT_ID,
                'redirect_uri': YOUR_REDIRECT_URI,
                'scope': 'https://www.googleapis.com/auth/calendar.events.readonly',
                'state': 'try_sample_request',
                'include_granted_scopes': 'true',
                'response_type': 'token'
            };

            for (var p in params) {
                var input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', p);
                input.setAttribute('value', params[p]);
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        }

function displayEvents(events) {
    // Asumiendo que el primer evento es el actual
    if (events.length > 0) {
        const currentEvent = events[0];
        const eventEndTime = new Date(currentEvent.end.dateTime || currentEvent.end.date);
        const eventTitle = currentEvent.summary || "Evento sin título";

        document.getElementById('event-title').textContent = eventTitle;
        updateProgressBar(eventEndTime, eventTitle);
    }
}

function updateProgressBar(endTime) {
    const progressBar = document.getElementById('progress-bar');
    const progressTimeLeft = document.getElementById('progress-percentage'); // Asegúrate de que este ID coincida con tu HTML

    function updateProgress() {
        const currentTime = new Date();
        const timeLeftMs = endTime - currentTime; // Tiempo restante en milisegundos
        const timeLeftMin = Math.max(Math.ceil(timeLeftMs / 60000), 0); // Tiempo restante en minutos, asegurándonos de que no sea menor que 0

        const totalEventDurationMs = endTime - startTime;
        const widthPercentage = Math.max((timeLeftMs / totalEventDurationMs) * 100, 0); // Porcentaje para la barra de progreso

        progressBar.style.width = `${widthPercentage}%`;
        progressTimeLeft.textContent = `${timeLeftMin} min`;

        // Cambiar el color de la barra según el tiempo restante
        if (timeLeftMin <= 5) {
            progressBar.style.backgroundColor = '#ff0000'; // Rojo para 5 minutos o menos
        } else if (timeLeftMin <= 10) {
            progressBar.style.backgroundColor = '#ffcc00'; // Naranja claro para 10 minutos o menos
        } else {
            progressBar.style.backgroundColor = '#4CAF50'; // Color original para más de 10 minutos
        }

        if (timeLeftMs > 0) {
            requestAnimationFrame(updateProgress);
        }
    }

    const startTime = new Date();
    updateProgress();
}
