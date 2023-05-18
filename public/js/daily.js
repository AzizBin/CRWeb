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
      if(dataKey.startsWith('Daily')){
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
            console.log(key)
            
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
            
            else if (key !== '_id') {
              let newCell = document.createElement('td')
              newCell.id = colName + '_' + key + '_' + newData[dataKey][i]._id
              newCell.textContent = newData[dataKey][i][key]
              newRow.appendChild(newCell)
            }
            
            
          }
          let newCell = document.createElement('td')
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
      else if(dataKey.startsWith('Month')){
        let data = dataKey
        let expCash = 0
        let expPOS = 0
        let rentCash = 0
        let rentPOS = 0
        if(data == "MonthExpInfo"){
          for(let keyCol of newData[data]){
            if(keyCol.PaymentMethod =="نقدي"){
              expCash += Number(keyCol.ExpenseCost)
            }
            else if(["شبكة", "تحويل"].includes(keyCol.PaymentMethod)){
              expPOS += Number(keyCol.ExpenseCost)
            }
          }
        }

        if(data == "MonthRentInfo"){
          for(let keyCol of newData[data]){
            if(keyCol.PaymentMethod =="نقدي"){
              rentCash += Number(keyCol.RentPrice)
            }
            else if (["شبكة", "تحويل"].includes(keyCol.PaymentMethod)){
              rentPOS += Number(keyCol.RentPrice)
            }
          }
        }
        
        console.log(expCash + "\n" + expPOS + '\n' + rentCash + "\n" + rentPOS);
      }
    }
    let row = document.createElement('tr')
    let totalTable = document.getElementById('dailyTotal')
    let length = totalTable.rows.length
    for(i = length -1; i>=0; i--){
      totalTable.deleteRow(i)
    }
    let totalCash = 0
    let totalPOS = 0
    let amountCash = 0, amountCashCred = 0, amountCashDebt = 0
    let amountPOS = 0, amountPOSCred = 0, amountPOSDebt = 0
    total("creditorAmountColumn", 'cred')
    total("debtorAmountColumn", 'debt')
    
    function total(thID, type){
      let cell = document.getElementById(thID)
      amountCash = 0
      amountPOS = 0
      let methodCells = document.querySelectorAll(`table td:nth-child(${cell.cellIndex})`)
      let cells = document.querySelectorAll(`table td:nth-child(${cell.cellIndex+1})`)
      console.log(methodCells)
      for(key in methodCells){

        if(methodCells[key].innerText == 'نقدي' && type == 'cred'){
          amountCash += +cells[key].innerText
          amountCashCred += +cells[key].innerText
        }
        else if(methodCells[key].innerText == 'نقدي' && type == 'debt'){
          amountCash += +cells[key].innerText
          amountCashDebt += +cells[key].innerText
        }
        else if (['شبكة', 'تحويل'].includes(methodCells[key].innerText) && type == 'cred'){
          amountPOS += +cells[key].innerText
          amountPOSCred += +cells[key].innerText
        }
        else if(['شبكة', 'تحويل'].includes(methodCells[key].innerText) && type == 'debt'){
          amountPOS += +cells[key].innerText
          amountPOSDebt += +cells[key].innerText
        }
        
      }
      const totalTableArray = [amountCash, amountPOS]
      for(key in totalTableArray){
        let newCell = document.createElement('td')
        newCell.textContent = totalTableArray[key]
        row.appendChild(newCell)
        totalTable.appendChild(row)
      }
      
    }
    totalCash = amountCashCred - amountCashDebt
    totalPOS = amountPOSCred - amountPOSDebt
    const totalData = [totalCash, totalPOS]

    for(key in totalData){
      let newCell1 = document.createElement('td')
      newCell1.textContent = totalData[key]
      row.appendChild(newCell1)
      totalTable.appendChild(row)
    }
    let totalCred = 0
    totalCred = amountCashCred += +amountPOSCred
    let totalDebt = 0
    totalDebt = amountCashDebt += +amountPOSDebt
    let account = 0
    account = totalCash += +totalPOS
    console.log(totalDebt)
    const finalData = [totalCred, totalDebt, account]
    let finalRow = document.createElement('tr')
    
    for(key in finalData){
      let finalCell = document.createElement('td')
      finalCell.textContent = finalData[key]
      finalCell.colSpan = 2
      finalRow.appendChild(finalCell)
      totalTable.appendChild(finalRow)
    }
    
  }