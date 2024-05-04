// content_script.js
document.addEventListener('DOMContentLoaded', () => {
    // Este código se ejecuta cuando se carga completamente una página web

    // Puedes realizar operaciones en el DOM de la página aquí
    // Por ejemplo, buscar un elemento específico y cambiar su contenido
    const element = document.querySelector('h1'); // Encuentra el primer elemento <h1> en la página
    if (element) {
        element.textContent = '¡El contenido ha sido modificado por mi extensión!';
        element.style.color = 'red'; // Cambia el color del texto a rojo
    }
});
