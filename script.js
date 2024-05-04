document.addEventListener('DOMContentLoaded', function () {
    var sampleRequestButton = document.getElementById('sampleRequestButton');
    var loginContainer = document.getElementById('login-container');
    var progressContainer = document.getElementById('progress-container');
    var eventsContainer = document.getElementById('events');

    // Verificar si ya tenemos un token de acceso al cargar la página
    var params = JSON.parse(localStorage.getItem('oauth2-test-params') || '{}');
    if (params && params['access_token']) {
        loginContainer.style.display = 'none';
        progressContainer.style.display = 'block';
        eventsContainer.style.display = 'block';
        loadEvents(params['access_token']);
    } else {
        loginContainer.style.display = 'block';
        progressContainer.style.display = 'none';
        eventsContainer.style.display = 'none';
    }

    if (sampleRequestButton) {
        sampleRequestButton.addEventListener('click', function () {
            oauth2SignIn();
        });
    }
});

function trySampleRequest() {
    var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
    if (params && params['access_token']) {
        loadEvents(params['access_token']);
    } else {
        oauth2SignIn();
    }
}

var YOUR_CLIENT_ID = '523272931-kjks2l3eimgi2oqll2eovj6top6meb40.apps.googleusercontent.com';
var YOUR_REDIRECT_URI = 'https://diegovelezg.github.io/nd_timebar/';
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

function oauth2SignIn() {
    // Antes de iniciar el flujo de OAuth, comprobar si ya estamos autenticados
    var params = JSON.parse(localStorage.getItem('oauth2-test-params') || '{}');
    if (params && params['access_token']) {
        loadEvents(params['access_token']);
    } else {
        // Iniciar el flujo de OAuth
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
}

function loadEvents(accessToken) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + (new Date()).toISOString() + '&maxResults=10&orderBy=startTime&singleEvents=true');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var events = JSON.parse(xhr.responseText).items;
            // Filtrar eventos de todo el día
            var filteredEvents = events.filter(event => !event.start.date || event.start.dateTime);
            displayEvents(filteredEvents);
        } else if (xhr.readyState === 4) {
            console.error('Error loading events: ' + xhr.responseText);
        }
    };
    xhr.send();
}

function displayEvents(events) {
    const now = new Date();
    const currentEvent = events.find(event => new Date(event.start.dateTime) <= now && new Date(event.end.dateTime) > now);
    const nextEvent = events.find(event => new Date(event.start.dateTime) > now);

    if (currentEvent) {
        const startTime = new Date(currentEvent.start.dateTime);
        const endTime = new Date(currentEvent.end.dateTime);
        updateProgressBar(startTime, endTime, '#0000FF', currentEvent.summary); // Azul para evento actual
    } else if (nextEvent) {
        const startTime = now;
        const endTime = new Date(nextEvent.start.dateTime);
        updateProgressBar(startTime, endTime, '#008000', `Siguiente: ${nextEvent.summary}`); // Verde para el próximo evento
    }
}



function updateProgressBar(startTime, endTime, barColor, title) {
    const progressBar = document.getElementById('progress-bar');
    const progressTimeLeft = document.getElementById('progress-percentage');

    progressBar.style.backgroundColor = barColor;
    document.getElementById('event-title').textContent = title;

    function updateProgress() {
        const now = new Date();
        let timeLeftMs = endTime - now;
        const totalDurationMs = endTime - startTime;
        let widthPercentage = (timeLeftMs / totalDurationMs) * 100;

        progressBar.style.width = `${widthPercentage}%`;
        let timeLeftMin = Math.max(Math.ceil(timeLeftMs / 60000), 0);
        progressTimeLeft.textContent = `${timeLeftMin} min`;

        if (timeLeftMs > 0) {
            requestAnimationFrame(updateProgress);
        } else {
            progressBar.style.width = '100%';
            setTimeout(() => {
                const params = JSON.parse(localStorage.getItem('oauth2-test-params'));
                if (params && params['access_token']) {
                    loadEvents(params['access_token']); // Vuelve a cargar los eventos usando el token guardado
                }
            }, 1000); // Un pequeño retraso antes de recargar
        }
    }

    updateProgress();
}