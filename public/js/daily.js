fetch('/dailyJ')
.then((response) => {
  // Check if the request was successful
  if (response.ok) {
    // Parse the response body as JSON
    return response.json();
  } else {
    // Throw an error with the status text
    throw new Error(response.statusText + '/dailyJ response Error');
  }
})
.then((newData) => {
  console.log(newData)
  setData(newData)

})
.catch((error) => {
  // Handle any errors
  console.error(error + '/dailyJ catch Error');
});

function filter(startDateID, endDateID){
  let startDate = document.getElementById(startDateID).value
  console.log(startDate)
  let endDate = document.getElementById(endDateID).value
  let filterDates = {startDate: startDate, endDate: endDate}
  fetch('/dailyFilter', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(filterDates)
  
  })
  .then((response) => {
    // Check if the request was successful
    if (response.ok) {
      // Parse the response body as JSON
      return response.json();
    } else {
      // Throw an error with the status text
      throw new Error(response.statusText);
    }
  })
  .then(newData => {
    setData(newData)
  })
  .catch(err => console.error(err));

}

function setData(newData){
    for(let dataKey in newData){
      console.log(`Processing array: ${dataKey}`)
      let colName = `${dataKey}`
      let table = document.getElementById(colName)
      let length = table.rows.length
      for(i = length - 1; i>0; i--){
        table.deleteRow(i)
      }
      let id 
      
      for (let i = 0; i<newData[dataKey].length; i++){
        id = newData[dataKey][i]._id
        let newRow = document.createElement('tr')

        let newCellNumber = document.createElement('td')
        newCellNumber.id = colName + ': Index: ' + i + 1
        newCellNumber.textContent = i + 1
        newRow.appendChild(newCellNumber)
        
        for ( var key in newData[dataKey][i]){
          
          if (key.endsWith('Pic')){
            let newShowCell = document.createElement('td')
            let showImage = document.createElement('img')
            showImage.className = 'showImg'
            showImage.id = 'BTN' + colName + '_' + key + '_' + newData[dataKey][i]._id
            showImage.src = newData[dataKey][i][key]
            //use .bind so the function doesn't get called right away
            showImage.onclick = showImagePopup.bind(null, newData[dataKey][i][key], 'BTN' + colName + '_' + key + '_' + newData[dataKey][i]._id, true)
            showImage.onmouseenter = showImagePopup.bind(null, newData[dataKey][i][key], 'BTN' + colName + '_' + key + '_' + newData[dataKey][i]._id, false)
            let fileUploader = document.createElement('input')
            fileUploader.setAttribute('type', 'file')
            fileUploader.id = colName + '_' + key + '_' + newData[dataKey][i]._id
            fileUploader.className = 'changeFile'
            fileUploader.onclick = editableFile.bind(null,)
            
  
            let changeFileLabel = document.createElement('label')
            changeFileLabel.setAttribute('for', colName + '_' + key + '_' + newData[dataKey][i]._id)
            changeFileLabel.className = 'button-4'
            changeFileLabel.textContent = 'تعديل'
            
  
            newShowCell.appendChild(changeFileLabel)
            newShowCell.appendChild(fileUploader)
            newShowCell.appendChild(showImage)
            newRow.appendChild(newShowCell)
          }
          else if(key == 'VAT'){

          }
          else if (key !== '_id' && !key.endsWith('Pic') && key != 'VAT') {
            var newCell = document.createElement('td')
            newCell.id = colName + '_' + key + '_' + newData[dataKey][i]._id
            newCell.textContent = newData[dataKey][i][key]
            newRow.appendChild(newCell)
          }
          
        }
        var newCell = document.createElement('td')
        const button = document.createElement('button')
        button.id = colName + '_' + id
        button.textContent = 'حذف'
        button.className = 'delButton'
        button.onclick = delButtonFun
        newCell.appendChild(button)
        newRow.appendChild(newCell)
        table.appendChild(newRow)
      }
        
    }

    let totalTable = document.getElementById('dailyTotal')
    let creditorCell = document.getElementById('creditorAmountColumn')
    let creditorAmountCash=0
    let creditorAmountPOS=0
    let methodCells = document.querySelectorAll(`table td:nth-child(${creditorCell.cellIndex})`)
    let cells = document.querySelectorAll(`table td:nth-child(${creditorCell.cellIndex+1})`)
    

    for(i=0; i<methodCells.length; i++){

      if(methodCells[i].innerText == 'نقدي'){
        creditorAmountCash += +cells[i].innerText

        console.log(cells[i].innerText)
      }
      else{
        creditorAmountPOS += +cells[i].innerText
      }
      
    }
    console.log(creditorAmountCash)
    console.log(creditorAmountPOS)
  }