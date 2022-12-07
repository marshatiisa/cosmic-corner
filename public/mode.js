function myFunction() {
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
// light mode dark mode
async function modeFunction() {
    let element = document.body;
    element.classList.toggle("dark-mode");
    // fetch('/mode/'+ (element.classList.contains('dark-mode') ? 'dark' : 'white'))
    localStorage.setItem('mode', element.classList.contains('dark-mode') ? 'dark' : 'white');

  }

const mode = localStorage.getItem('mode')
if(mode === 'dark'){
    document.body.classList.add('dark-mode')
} else {
    document.body.classList.remove('dark-mode')
}