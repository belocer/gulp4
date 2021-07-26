window.addEventListener('load', () => {
    let btn = document.querySelector('.header__btn')
    btn.addEventListener('click', alertWindow)

    function alertWindow(e) {
        alert(e.target)
    }
})