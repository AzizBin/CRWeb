window.onload = document.getElementById("defaultCont").click();

let dailyFirstSel = document.getElementById('reports_daily_first')
dailyFirstSel.style.display = 'block'
dailyFirstSel.addEventListener('change', async function(){
    let dailyAllSelectors = Array.from(document.getElementsByClassName('reports-daily-selector'))
    dailyAllSelectors.forEach(sel => {
        if(!sel.id.endsWith('first'))
        sel.style.display = 'none'
    })
    let dailySecondSel = document.getElementById(this.value)
    dailySecondSel.style.display = 'block'
    dailySecondSel.addEventListener('change', function(){

    })
})