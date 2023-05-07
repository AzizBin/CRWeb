
  let sidebar = document.querySelector(".sidebar");
  let closeBtn = document.querySelector("#btn");
  let searchBtn = document.querySelector(".bx-search");

  closeBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
  });

  searchBtn.addEventListener("click", ()=>{ // Sidebar open when you click on the search iocn
    sidebar.classList.toggle("open");
    menuBtnChange(); //calling the function(optional)
  });

  // following are the code to change sidebar button(optional)
  function menuBtnChange() {
   if(sidebar.classList.contains("open")){
     closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the iocns class
   }else {
     closeBtn.classList.replace("bx-menu-alt-right","bx-menu");//replacing the iocns class
   }
  }


  
/* function to hide/show content on tab click */
function content(evt, selectedTab){

  let i, tabContent, tabLink;
/* use a for loop to hide all tabs contents */
  tabContent = document.getElementsByClassName("tabContent")
  for(i = 0; i < tabContent.length; i++){
    tabContent[i].style.display = "none"
  }
/* I think this one is useless */
  tabLink = document.getElementsByClassName("tabLink")
  for(i = 0; i< tabLink.length; i++){
    tabLink[i].className = tabLink[i].className.replace(" active", "")
  }
/* this shows the selected tabs content */
  document.getElementById(selectedTab).style.display = "block";
  evt.currentTarget.className += " active";
}
/* Display a window on top to add new data */
function openPop(popID){

  document.getElementById(popID).showModal()
  
}

/* remove the add new data window */
function closePop(popID){

  document.getElementById(popID).close()
}


const invArray = []
let invArrayLength = 0

const officeArray = []
let officeArrayLength = 0


// function testRecData(colName,tableID){
//   console.log("testRec called")
//   fetch(`/jsFormData/${colName}`)
//   .then(response => response.json())
//   .then(newData => {
//   console.log(newData)

//   let table = document.getElementById(tableID)
//   let newRow = document.createElement('tr')
//   for (var key in newData){
    
//     if (newData.hasOwnProperty(key) && key !== '_id') {
//       var newCell = document.createElement('td')
//       newCell.id = colName + '_' + key + '_' + newData._id
//       newCell.textContent = newData[key]
//       newRow.appendChild(newCell)
//     }
    
//   }
//   var newCell = document.createElement('td')
//     const button = document.createElement('button')
//     button.id = colName + '_' + newData._id
//     button.textContent = 'حذف'
//     button.className = 'delButton'
//     button.onclick = delButtonFun
//     newCell.appendChild(button)
//     newRow.appendChild(newCell)
//     table.appendChild(newRow)

//   })
//   .catch(error => console.error(error))

  
// }

async function submitForm(event, colName, tableID){
  event.preventDefault()
  
  let formID = event.target.form.id
  let formData = new FormData(document.getElementById(formID))
  var formObject = {};
  formData.forEach((value, key) => formObject[key] = value);
  console.log(formObject);

  let order = Object.keys(formObject)
  formData.append('order', JSON.stringify(order))
  
  await fetch(`/upload/${colName}`, {
    method:'POST',
    body: formData,
  })
  .then(response => response.json())
	.then(newData => {
    
  
    let table = document.getElementById(tableID)
    let i = table.rows.length
    let newRow = document.createElement('tr')

    let newCellNumber = document.createElement('td')
    newCellNumber.id = colName + ': Index: ' + i
    newCellNumber.textContent = i
    newRow.appendChild(newCellNumber)
    
    for (var key in formObject){
      
      if (key.endsWith('Pic')){
        let newShowCell = document.createElement('td')
        let showImage = document.createElement('img')
        
        showImage.className = 'showImg'
        showImage.id = 'IMG' + colName + '_' + key + '_' + newData._id
        showImage.src = newData[key]
        let id = showImage.id
        //use .bind so the function doesn't get called right away
        showImage.onclick = showImagePopup.bind(null, newData[key], id, true)
        showImage.onmouseenter = showImagePopup.bind(null, newData[key], id, false)
        
        let fileUploader = document.createElement('input')
        fileUploader.setAttribute('type', 'file')
        fileUploader.id = colName + '_' + key + '_' + newData._id
        fileUploader.className = 'changeFile'
        fileUploader.onclick = editableFile.bind(null,)
        

        let changeFileLabel = document.createElement('label')
        changeFileLabel.setAttribute('for', colName + '_' + key + '_' + newData._id)
        changeFileLabel.className = 'button-4'
        changeFileLabel.textContent = 'تعديل'
        

        newShowCell.appendChild(changeFileLabel)
        newShowCell.appendChild(fileUploader)
        newShowCell.appendChild(showImage)
        newRow.appendChild(newShowCell)
      }
      else if(key == 'VAT'){

      }
      else if (key !== '_id' && !key.endsWith('Pic')&& key != 'VAT') {
        var newCell = document.createElement('td')
        newCell.id = colName + '_' + key + '_' + newData._id
        newCell.textContent = newData[key]
        newRow.appendChild(newCell)
      }
      
    }
    var newCell = document.createElement('td')
    const button = document.createElement('button')
    button.id = colName + '_' + newData._id
    button.textContent = 'حذف'
    button.className = 'delButton'
    button.onclick = delButtonFun
    newCell.appendChild(button)
    newRow.appendChild(newCell)
    table.appendChild(newRow)
    moneyTable()
  })
	.catch(error => console.error(error + '/upload/${colName} catch Error'))
  
  
    
}
function moneyTable(){
  let row = document.createElement('tr')
  let totalTable = document.getElementById('dailyTotal')
  for(i = length - 1; i>0; i--){
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
let isClicked = false
function showImagePopup(imageUrl, id, clicked = false){
  const imagePopup = document.getElementById('show-image');
  isClicked = clicked

  const image = document.getElementById('img');
  image.src = imageUrl;

  if(isClicked){
    imagePopup.style.display= 'flex'
    imagePopup.className = ('show-image')
    image.style.maxWidth = '30%';
    image.style.maxHeight = '30%';
    imagePopup.onclick = (e) => {
    var ignore = image.contains(e.target)
    if(!ignore){
      imagePopup.style.display = 'none'
    } 
  };
  }
  
  if(!isClicked){
    imagePopup.className = ('show-image-hover')
    imagePopup.style.display = 'flex'
    image.style.maxWidth = '100%';
    image.style.maxHeight = '100%';
    let hover = document.getElementById(id)
    hover.onmouseleave = imgCloseOnMouseLeave.bind(null,true)
    console.log('mouse out')
  }
  
}


function imgCloseOnMouseLeave(){
  const imagePopup = document.getElementById('show-image');
  const image = document.getElementById('img');
  if(!isClicked){
    imagePopup.style.display = 'none'
  }
  
}

function indexSel(dataName, selID){
  fetch('/indexSel')
  .then((response) => {
    // Check if the request was successful
    if (response.ok) {
      // Parse the response body as JSON
      return response.json();
    } else {
      // Throw an error with the status text
      throw new Error(response.statusText + '/indexSel response Error');
    }
  })
  .then((newData) => {
    selectorData(newData, dataName, selID)
    
  })
  .catch((error) => {
    // Handle any errors
    console.error(error + '/indexSel catch Error');
  });
  
}

function dailySel(dataName, selID){
  fetch('/dailySel')
  .then((response) => {
    // Check if the request was successful
    if (response.ok) {
      // Parse the response body as JSON
      return response.json();
    } else {
      // Throw an error with the status text
      throw new Error(response.statusText + '/dailySel response Error');
    }
  })
  .then((newData) => {
    selectorData(newData, dataName, selID)
    
  })
  .catch((error) => {
    // Handle any errors
    console.error(error + '/dailySel catch Error');
  });
}

function selectorData(newData, dataName, selID) {
  let dataNameSplit = dataName.split('_');
  let selIDSplit = selID.split('_');
  for (let i = 0; i < selIDSplit.length; i++) {
    let sel = document.getElementById(selIDSplit[i]);
    sel.innerHTML = ""
    let dataSplit = dataNameSplit[i];
    for (let ii = 0; ii < newData[dataSplit].length; ii++) { 
      for (let key in newData[dataSplit][ii]) {
        console.log(newData[dataSplit][ii]);
        let selOpt = document.createElement("option");
        selOpt.value = newData[dataSplit][ii][key];
        selOpt.innerText = newData[dataSplit][ii][key];
        sel.appendChild(selOpt);
      }
    }
  }
}

function delButtonFun (evt){
  //remove the pressed button's parent 
  const splitID = evt.target.id.split("_")
  const docID = {colName:splitID[0], _id:splitID[1]}

  fetch('/deleteRow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(docID)
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(err => console.error(err + '/deleteRow catch Error'));

  
  evt.target.parentElement.parentElement.remove()
  console.log("Yes?")
}



let cellCurID
function editable(e){
  cellCurID = e.target.id
  let cellIDSplit = cellCurID.split('_')
  let s = document.getElementById(e.target.id)

  if (cellIDSplit[0] == 'CarsInfo' && cellIDSplit[1] == 'InvName'){
    let newSel = document.createElement('select')
    let table = document.getElementById('InvInfo')
    
    for (let i = 0; i < table.rows.length; i++) {
      const secondCell = table.rows[i].cells[1].innerText;
      const option = document.createElement('option');
      option.value = secondCell;
      option.text = secondCell;
      newSel.add(option);
    }
    
    
    // replace the original element with the new select element
    s.innerHTML = ""
    s.appendChild(newSel)
    newSel.id = cellCurID
    newSel.addEventListener ('change', function(){
      console.log(this.value)
      let newValue = this.value
      
      const newData = {colName:cellIDSplit[0], fieldName: cellIDSplit[1],_id:cellIDSplit[2], newValue:newValue}
      sendNewData(newData)

      s.innerHTML = ''
      s.innerText = newValue
    })
  }

  else if (cellIDSplit == 'CarsInfo' && cellIDSplit[1] !== 'InvName'){
    s.contentEditable = "true"
    s.focus()
    s.addEventListener("keypress", enterKey)
  }

  else{
    s.contentEditable = "true"
    s.focus()
    s.addEventListener("keypress", enterKey)
  }
  
}

function editableFile(e){
  let s = document.getElementById(e.target.id)
  console.log(e.target.id)
  let cellIDSplit = e.target.id.split("_")
  s.addEventListener('change', function(){
    if(s.files.length>0){
      const formData = new FormData()
      formData.append('file', s.files[0])
      formData.append('colName',cellIDSplit[0])
      formData.append('fieldName',cellIDSplit[1])
      formData.append('_id',cellIDSplit[2])
      fetch('/updateImage', {
        method:'POST',
        body: formData,
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('/updateImage Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        let id = 'IMG' + e.target.id;
        console.log(id);
        let showImage = document.getElementById(id);
        showImage.src = data.url
        showImage.onclick =  showImagePopup.bind(null, data.url, id, true);
        showImage.onmouseenter = showImagePopup.bind(null, data.url, id, false)
        
      })
      .catch(error => {
        console.error('/updateImage There was a problem with the fetch operation:', error);
      });
    }
    
  })
  
  
}

function sendNewData(newData){
  fetch('/updateData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newData)
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(err => console.error(err + '/updateData catch Error'));
}


function enterKey(e,change = false){
  
  if (e.key === "Enter"){
    let cellIDSplit = e.target.id.split("_")
    let cellNewValue = e.target.textContent
    const newData = {colName:cellIDSplit[0], fieldName: cellIDSplit[1],_id:cellIDSplit[2], newValue:cellNewValue}
    let s = document.getElementById(e.target.id)
    s.contentEditable = "false"

    sendNewData(newData)
  }


}

function allEditable(evt, tableEdit){
  let tar = evt.currentTarget
  let a = document.getElementById(tableEdit)
  if(a.contentEditable === "true"){
    evt.currentTarget.innerHTML = "تعديل"
    a.contentEditable = "false"

  }
  else{
    evt.currentTarget.innerHTML = "حفظ"
    a.contentEditable = "true"
    a.addEventListener("keypress", function disableEdit(evt){
      if(evt.key === "Enter"){
     
     a.contentEditable = "false"
     tar.innerHTML = "تعديل"

      }
      
    })
  }
  
}




