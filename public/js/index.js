window.onload = document.getElementById("defaultCont").click();

fetch('/indexJ')
.then((response) => {
    // Check if the request was successful
  if (response.ok) {
    // Parse the response body as JSON
    return response.json();
  } else {
    // Throw an error with the status text
    throw new Error(response.statusText + '/indexJ Response Error');
  }
})
.then((newData) => {
  console.log(newData)
  setData(newData)

})
.catch((error) => {
  // Handle any errors
  console.error(error + '/indexJ catch Error');
});

function setData(newData){
    for(let dataKey in newData){
      console.log(`Processing array: ${dataKey}`)
      let colName = `${dataKey}`
      let table = document.getElementById(colName)
      
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
                    showImage.id = 'IMG' + colName + '_' + key + '_' + newData[dataKey][i]._id
                    showImage.src = newData[dataKey][i][key]
                    let id = showImage.id
                    //use .bind so the function doesn't get called right away
                    showImage.onclick = showImagePopup.bind(null, newData[dataKey][i][key], id, true)
                    showImage.onmouseenter = showImagePopup.bind(null, newData[dataKey][i][key], id, false)
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
                if (key !== '_id' && !key.endsWith('Pic')) {
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
  }