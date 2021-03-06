
let res = null;
let site = {};
let limit = 15;

let page = 1;
let start = true;
let objectifiedSalesData = {}
let data ={};

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! navigation rende
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

// GENERAL API REQUEST URL
let url= "http://localhost/sys.pos.warehouse.lifestyle-outdoor-gear/api/route.php";
// SYSTEM REQUIRED DATA
let sysData = {}

setInterval( () => {
    if(!localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')){
        window.location.href = './signin.html';
    }
}, 5000); 

if(!localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')){
    window.location.href = './signin.html';
}else if(!JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')).session){
    window.location.href = './signin.html';
}else if(Number(JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')).session.user_type_id) > 1){
    window.location.href = './signin.html';
}

site = JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear'));

// GET SYSTEM DATA
const getWarehouseProducts = () =>{
    data = {'reload': true, 'action':'getAllWarehouseProducts', 'name': 'warehouseProductList'};
    $.ajax({
        url: url,
        type: "POST",
        dataType  : 'json',
        data: data,
        success: (response) =>{
            // ADD DATA TO SYSTEM DATA
            sysData.warehouseProductList = response;
        },
        complete:() =>{
            //// //console.log(sysData);rend
        }
    });
}
const getAllProducts = () =>{
    data = {'reload': true, 'action':'getAllProducts', 'name': 'productList'};
    $.ajax({
        url: url,
        type: "POST",
        dataType  : 'json',
        data: data,
        success: (response) =>{
            // ADD DATA TO SYSTEM DATA
            sysData.productList = response;
        },
        complete:() =>{
            //// //console.log(sysData);
        }
    });
}
/**
 * SYSTEM FUNCTIONS A-Z
 **/

    
    // GENERATE DROPDOWN OPTION FOR TABLE INLINE EDIT validat
    const optionDataIsolation = (td) => {
        let dataList = [];
        if(td.classList.length == 3){
            if(td.classList[2] == 'warehouseinventoryList'){
               temp = [];
               site.warehouseinventoryList.forEach(details => {if(!temp.includes(JSON.stringify({'name': details.name}))){temp.push(JSON.stringify({'name': details.name}))}});
               temp.filter(details => {dataList.push(JSON.parse(details))});
               generateOptions(dataList);

            }else{
                site[td.classList[2]].forEach(details => {
                    dataList.push({'name': details.name});
                });

            }
        }
        
        return generateOptions(dataList);
    }

    const generateOptions = (dataArray) => {
        let allOptions 
        dataArray.forEach(option => {
            allOptions += `<option>${option.name}</option>`;
        })
        return allOptions;
    }
    const returnBranchInventory = (buttonArray) => {
        buttonArray.forEach(inlineReturn => inlineReturn.addEventListener('click', (e) => {
            if(!document.getElementById('warningBox')){
                document.querySelector(`#BranchInventorys`).before(warningNotification(`Cancel Operation and exit`));
                let warningBoxBtns = document.querySelectorAll('#warningBox button');
                warningBoxBtns.forEach(actionBtn => actionBtn.addEventListener('click', () => {
                    if(actionBtn.childNodes[1].textContent == 'Continue'){
                        document.getElementById('warningBox').remove();
                        let tr = inlineReturn.parentElement.parentElement.parentElement;
                        let id=tr.dataset.id;
                        let remaining=(Number(tr.dataset.quantity) + Number(tr.dataset.availableQuantity));
                        data = {
                            'warehouse_inventory_id' : tr.dataset.warehouse_inventory_id,
                            'quantity' : tr.dataset.quantity,
                            'availableQuantity' : tr.dataset.availableQuantity,
                            'inventory_id' : tr.dataset.id,
                            'action': 'returnToWareHouse'
                        };
                        res = run(data);
                        res.always(details => {
                            deliverNotification(details.message, details.response);
                            getBranchInventory();
                        });
                    }else{
                        document.getElementById('warningBox').remove();
                    }
                }));
            }
        }));
    }

    const  warningNotification = (message) => {
        const warningBox = document.createElement('div');
        warningBox.classList.add('warning-notification');
        warningBox.setAttribute('id', 'warningBox');
        warningBox.innerHTML = `
            <span>${message}</span>
            <label>
                <button>
                    <span class="material-symbols-outlined">arrow_back</span>
                    <b>Cancel</b>
                </button>
                <button>
                    <b>Continue</b>
                    <span class="material-symbols-outlined">done</span>
                </button>
            </label>
        `;
        return warningBox;
    }
    // SINGLE ITEM INLINE EDIT
    const tableSingleItemEdit = (buttonArray, identifier) => {
        buttonArray.forEach(inlineEdit => inlineEdit.addEventListener('click', (e) => {
            let tr = inlineEdit.parentElement.parentElement.parentElement;
            if(inlineEdit.classList.contains('inProgress')){
                asignDataAfterEdit(tr, inlineEdit, identifier);
            }else{
                asignDataForEdit(tr, inlineEdit, identifier); 
            }    
        }));
        
    }
    // GET TABLE DATA (td) AND ASSIGN IT TO AN INPUT FIELD/DATA LIST FOR EDIT
    const asignDataForEdit = (tr, inlineEdit, identifier) => {
        let data = "Nothing";
        tr.childNodes.forEach((td, index) => {
            if((index != 0) && (index % 2 != 0) && td.classList.contains(identifier)){  
                if((tr.parentElement.id == "branchinventorys_list") && (index == 3)){
                    data = (td.classList.contains('select-data')) ? '<input list="sels'+index+'" readonly name="sel'+index+'"  value="'+ td.childNodes[0].textContent.trim()+'" id="sel'+index+'"><datalist id="sels'+index+'"></datalist>':'<input type="text" value="' + td.childNodes[0].textContent.trim() + '" />';  
                }else if((tr.parentElement.id == "warehouseinventorys_list") && (index == 3)){
                    data = '<input list="sels'+index+'" name="sel'+index+'"  value="'+ td.childNodes[0].textContent.trim()+'" id="sel'+index+'"><datalist id="sels'+index+'">'+generateOptions(sysData.productList)+'</datalist>';  
                    // tr.childNodes[index].childNodes[0].innerHTML = data;
                }else{
                    data = (td.classList.contains('select-data')) ? '<input list="sels'+index+'" name="sel'+index+'"  value="'+ td.childNodes[0].textContent.trim()+'" id="sel'+index+'"><datalist id="sels'+index+'">'+optionDataIsolation(td)+'</datalist>':'<input type="text" value="' + td.childNodes[0].textContent.trim() + '" />';  
                    // tr.childNodes[index].childNodes[0].innerHTML = data;
                }
                tr.childNodes[index].childNodes[0].innerHTML = data;
            }
        });
        inlineEdit.classList.add('inProgress');
        inlineEdit.textContent = 'save_as';

        // ADD CLOSE BTN
        let closeBtn = `<span class="material-symbols-outlined danger  ${inlineEdit.parentElement.dataset.id}-inline-delete">close</span>`;
        inlineEdit.parentElement.children[inlineEdit.parentElement.children.length - 1].parentElement.insertAdjacentHTML('beforeend', closeBtn);
        // CANCLE OPERATION IF CLOSE BTN IS CLICKE
        closeBtn = inlineEdit.parentElement.children[inlineEdit.parentElement.children.length - 1];
        closeBtn.addEventListener('click', () => {
            tr.childNodes.forEach((td, index) => {
                if((index != 0) && (index % 2 != 0) && td.classList.contains(identifier)){  
                    let data = (td.childNodes[0].childNodes[0].value)
                    tr.childNodes[index].childNodes[0].textContent = data;  
                }
            });
            inlineEdit.classList.remove('inProgress');
            inlineEdit.textContent = 'edit';
            removeElement(`span.${inlineEdit.parentElement.dataset.id}-inline-delete`);
        })
    }

    // GET TABLE DATA (td) IN THE INPUT FIELD AND ASIGN IT TO THE (td) ELEMENT AS TEXTCONTENT AFTER EDIT warehouseinventorytmp
    const asignDataAfterEdit = (tr, inlineEdit, identifier) => {
        let updateData = {}
        tr.childNodes.forEach((td, index) => {
            if((index != 0) && (index % 2 != 0) && td.classList.contains(identifier)){  
                let data = (td.childNodes[0].childNodes[0].value);
                /**
                 * COLLECT DATA AFTER EDITING GETING IDS 
                 * FOR DROP DOWN FIELDS INSTED OF THEIR NAMES/VALUES
                 */
                let dataReformatArr = [];
                if(((tr.parentElement.id == "branchinventorys_list") && (index == 3))){
                    dataReformatArr = (td.classList.contains('select-data') ? [JSON.parse(td.dataset.details)] : [{'id': data}]);
                }else if(((tr.parentElement.id == "warehouseinventorys_list") && (index == 3))){
                    dataReformatArr = [{'id': data}];
                }else{
                    dataReformatArr = (td.classList.contains('select-data') ? site[td.classList[2]].filter(info => info.name.trim().toLowerCase() == data.trim().toLowerCase()) : [{'id': data}]);
                }
                //////console.log(dataReformatArr)
                // CHECK IF DATA WAS RECEIVED BACK IF NOT THE VALUE ENETERD WAS WRONG
                if (dataReformatArr.length == 1) {
                    updateData[td.dataset.name] = dataReformatArr[0].id;
                    if(((tr.parentElement.id == "branchinventorys_list") && (index == 3))){
                        updateData['product_id'] = dataReformatArr[0].product_id;
                        updateData['availableQuantity'] = dataReformatArr[0].quantity;
                        updateData['oldQuantity'] = tr.dataset.oldQuantity;
                    }
                    // REASIGN DATA BACK TO TABLE ELEMENT TD IF THEIR ARE NO ERRORS
                    if(!tr.classList.contains('newrow')){
                        tr.childNodes[index].childNodes[0].innerHTML = data;  
                    }
                }
                else{
                    deliverNotification('Invalid Delatils in ' + td.dataset.name + ' dropdown', 'warning');
                }
            }
        });
        inlineEdit.classList.remove('inProgress');
        inlineEdit.textContent = 'edit';
        // SAVE EDITED DATA
        saveInlineEditData(updateData, tr, inlineEdit);
    }
    // SAVE DATA EDITED IN THE TABLE
    const saveInlineEditData = (data, tr, btn) => {
        document.getElementById(tr.parentElement.id).append(preloader());
        // GET WHAT TABLE WE ARE EDITING AND SPECIFY VALUES
        switch(tr.parentElement.id){
            case 'users_list':
                data = {'data': data, 'id': tr.dataset.id, 'action': 'updateUser'};
                if(tr.classList.contains('newrow')){
                    data.action = 'addUser';
                    data.userImage = "default.png";
                    btn.textContent = 'save_as';
                }
                res = run(data);
                res.always(details => {
                    removeElement('div.preloader');
                    deliverNotification(details.message, details.response);
                    // getUserAccounts(); 
                    if((details.response == "success") && (btn.textContent == 'save_as')){
                        ////// //console.log(details.info)
                        let templateString = userTmp(details.info, 'New');
                        renderSingelRow(details.info, templateString, '#users_list .newrow');

                    }else if(btn.textContent == 'edit'){
                        removeElement('span.user-inline-delete');
                    }

                });
                
            break;
            case 'products_list':
                data = {'data': data, 'id': tr.dataset.id, 'action': 'updateProduct'};
                if(tr.classList.contains('newrow')){
                    data.action = 'addProduct';
                    btn.textContent = 'save_as';
                }
                //////console.log(data);
                res = run(data);
                res.always(details => {
                    ////// //console.log(details)
                    removeElement('div.preloader');
                    // removeElement('div.preloader');
                    deliverNotification(details.message, details.response);
                    if((details.response == "success") && (btn.textContent == 'save_as')){
                        let templateString = productTmp(details.info, 'New');
                        renderSingelRow(details.info, templateString, '#products_list .newrow');
                    }else if(btn.textContent == 'edit'){
                        removeElement('span.product-inline-delete');
                    }
                    setTimeout(getAllProducts(), 0);
                    setTimeout(getBranchInventory(), 0);
                    setTimeout(getWarehouseProducts(), 0);
                });
                
            break;
            case 'warehouseinventorys_list':
                let productDs = sysData.productList.filter(info => removeSpaces(info.name.toLowerCase()) == removeSpaces(data.product_id.toLowerCase()));

                data.product_id = productDs[0].id;
                data = {'data': data, 'id': tr.dataset.id, 'action': 'updateWarehouseInventory'};
                if(tr.classList.contains('newrow')){
                    data.action = 'addWarehouseInventory';
                    btn.textContent = 'save_as';
                }
                //////console.log(data);
                res = run(data);
                res.always(details => {
                    //////console.log(details)
                    removeElement('div.preloader');
                    deliverNotification(details.message, details.response);
                    if((details.response == "success") && (btn.textContent == 'save_as')){
                        productDs = sysData.productList.filter(info => removeSpaces(info.name.toLowerCase()) == removeSpaces(details.info.name.toLowerCase()));
                        let templateString = warehouseInventoryTmp(details.info, 'New', productDs);
                        renderSingelRow(details.info, templateString, '#warehouseinventorys_list .newrow');
                    }else if(btn.textContent == 'edit'){
                        removeElement('span.warehouseinventory-inline-delete');
                        tr.children[4].innerHTML = (Number(details.info.quantity) > 0) ? '<label class="success">Available</label>': '<label class="warning">Out of Stork</label>';
                    }
                    setTimeout(getBranchInventory(), 0);
                    setTimeout(getWarehouseProducts(), 0);
                });
                
            break;
            case 'branchinventorys_list':
                let pDetails = [];
                if(data.oldQuantity == data.quantity){
                    data.remainingQuantity = data.availableQuantity;
                }else if(data.oldQuantity < data.quantity){
                    data.remainingQuantity = Number(data.availableQuantity) - (Number(data.quantity) - Number(data.oldQuantity));
                }else if(data.oldQuantity > data.quantity){
                    data.remainingQuantity = (Number(data.oldQuantity) - Number(data.quantity)) + Number(data.availableQuantity);
                }
                data.date = today;
                data = {'reload': true, 'data': data, 'id': tr.dataset.id, 'action': 'updateBranchinventory'};
                if(tr.classList.contains('newrow')){
                    data.action = 'addBranchinventory';
                    btn.textContent = 'save_as';
                }
                //////console.log(data);
                res = run(data);
                res.always(details => {
                    //////console.log(details)
                    removeElement('div.preloader');
                    deliverNotification(details.message, details.response);
                    if((details.response == "success") && (btn.textContent == 'save_as')){
                        ////// //console.log(details.info)
                        let productDetails = sysData.warehouseProductList.filter(info => removeSpaces(info.name.toLowerCase()) == removeSpaces(details.info.desc.toLowerCase()));
                        let templateString =  branchinventoryTmp(details.info, 'New', productDetails);
                        renderSingelRow(details.info, templateString, '#branchinventorys_list .newrow');
                    }else if(btn.textContent == 'edit'){
                        removeElement('span.branchinventory-inline-delete');
                        tr.children[6].children[0].textContent =data.data.remainingQuantity;
                    }
                    // setTimeout(getBranchInventory(), 0);
                    setTimeout(getWarehouseInventory(), 0);
                    
                });
                
            break;

        }
    }
    // ADD THE ADDED ROW TO THE TABLE WITHOUT PAGE REFRESH
    const renderSingelRow = (data, templateString, identifier) => {
        let newNode = document.createElement('tr');
        newNode.classList.add('productrevealer');
        newNode.setAttribute('id', data.id);
        newNode.innerHTML = templateString;
        referenceNode = document.querySelector(identifier);
        insertAfter(newNode, referenceNode);
    }

    const insertAfter =(newNode, referenceNode) => {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    // RENDER DYNAMIC PAGE DATA
    const renderPageData = (data, identifier, start = -1) => {
        let dataArrayFormat = [];
        let itemContainer = "";
        let dataKeys = [];
        let counter = 0;
        let pageNo = "";
        let count = 1;
        let inlineEditBtns = "";
        let user_branch_id =  (site.session.user_type_id == 1) ? 0 : site.session.branch_id;
        switch(identifier){
            case 'invoice':
                // CALCULATE TOTAL SALES IN EACH BRACH AND OVERALL TOTAL
                objectifiedSalesData = calculateTotalSales(data[0], start);
                //////console.log(objectifiedSalesData)
                // FOR DATA RESTRUCTURING
                // GET INVOICE POPULATION TYPE (EITHER PURCHASE DETAILS OR INVOICE)
                let listingType = document.querySelector('.listing_type').value;
                itemContainer = (listingType == "invoice") ? document.getElementById('invoices_list') : document.getElementById('sales_list');
                itemContainer.innerHTML =``;
                if(listingType == "invoice"){
                    document.getElementById('sales_list').parentElement.classList.add("hide")
                    document.getElementById('invoices_list').parentElement.classList.remove('hide'); 
                }else{
                    document.getElementById('invoices_list').parentElement.classList.add("hide")
                    document.getElementById('sales_list').parentElement.classList.remove('hide'); 
                }
                // INVOICE/SALE FILTERS
                let branch_list_filter = document.querySelector(".branch_list").value;
                let payment_type_list_filter = document.querySelector('.payment_type_list').value;
                let currency_list_filter = document.querySelector(".currency_list").value;
                let salelimit_filter = document.querySelector(".salelimit").value;
                limit = Number(salelimit_filter);
                //////console.log(branch_list_filter)
                // FILTER BY BRANCH
                if(!Number(branch_list_filter) ||  (Number(branch_list_filter) == 5)){
                    data = data[0];
                }else{
                    data = data[0].filter(info => Number(info.branch_id) == Number(branch_list_filter));
                }
                // FILTER BY PAYMENT METHOD
                if(Number(payment_type_list_filter)){
                    data = data.filter(info => Number(info.payment_type_id) == Number(payment_type_list_filter));
                }

                if(start == -1){
                    start = (start == -1) ? 0 : start;
                }else{
                    let displayed = (limit * (start - 1));
                    start = displayed;

                }
                // ENFORCE LIMIT
                if(salelimit_filter != 'All') {
                    data = data.slice(start, (limit + start));
                }else{
                    data = data.slice(start);
                }
                //////console.log((Number(branch_list_filter.value)))
                // MAKE INVOICE ACTION BUTTONS CLICKABLE
                data.forEach((info, index, infoKeys) => {
                    setTimeout(generateSaleExportTb(info), 0);
                    itemContainer.insertAdjacentHTML('beforeend', ((listingType == "invoice") ? invoiceTmp(info, index, start) : saleTmp(info, index, start)));
                    counter++;
                    // CHECK IF TABLE IS POPULATED IN ACODANCE WITH THE INVOICE
                    // IF ITS BY INVOICE INCREAMENT START BY ONE EACH REPEATITION
                    // IF ITS BY SALE/PURCHASE THEN INCREAMENT START BY THE NUMBER OF ITEMS ON THE INVOICE
                    start = (listingType == "invoice") ? start+1 : start + Number(info.totalItems);
                    reveal('invoice');
                })

                tRowAction();
            break;
            
            case 'user':
                if(data[1] != data[0].length){
                    pageNo = Number(document.querySelector('.user-list_pagination span.active').textContent);
                    // let total = data[1];
                    let displayed = (limit * (pageNo - 1));
                    count = displayed + 1;
                }
                // count = (pageNo == 1) ? pageNo : (limit + 1);
                itemContainer = document.getElementById('users_list');
                itemContainer.innerHTML = "";
                templateString = '';
                data = data[0];
                if(data.length > 0){
                    data.forEach((itemDetails, index) => {
                        templateString = `<tr class="unrevealed userrevealer" data-id="${itemDetails.user_id}">`;
                        templateString += userTmp(itemDetails, count);
                        templateString += `</tr> `;

                        itemContainer.insertAdjacentHTML('beforeend', templateString);
                        count++;
                        reveal('user');
                    });
                    inlineEditBtns = document.querySelectorAll('.userrevealer .inline-edit');
                    tableSingleItemEdit(inlineEditBtns, 'edit-data');
                    passwordUpdate(document.querySelectorAll('.userrevealer .update_psd'));

                }else{
                    templateString = `
                        <tr class="userrevealer">
                            <td colspan='10'><label class="warning">nothing Found</label></td>
                        </tr>
                    `;
                    itemContainer.innerHTML = templateString;
                }

            break;
            case "supplier":

                if(data[1] != data[0].length){
                    pageNo = Number(document.querySelector('.supplier-list_pagination span.active').textContent);
                    // let total = data[1];
                    let displayed = (limit * (pageNo - 1));
                    count = displayed + 1;
                }
                // count = (pageNo == 1) ? pageNo : (limit + 1);
                itemContainer = document.getElementById('suppliers_list');
                itemContainer.innerHTML = "";
                templateString = '';
                data = data[0];
                if(data.length > 0){
                    data.forEach((itemDetails, index) => {
                        templateString = `<tr class="unrevealed supplierrevealer" data-id="${itemDetails.supplier_id}">`;
                        templateString += supplierTmp(itemDetails, count);
                        templateString += `</tr> `;

                        itemContainer.insertAdjacentHTML('beforeend', templateString);
                        count++;
                        reveal('supplier');
                    });
                }else{
                    templateString = `
                        <tr class="supplierrevealer">
                            <td colspan='10'><label class="warning">nothing Found</label></td>
                        </tr>
                    `;
                    itemContainer.innerHTML = templateString;
                }
            break;
            case 'product':
                if(data[1] != data[0].length){
                    pageNo = Number(document.querySelector('.product-list_pagination span.active').textContent);
                    let displayed = (limit * (pageNo - 1));
                    count = displayed + 1;
                }
                itemContainer = document.getElementById('products_list');
                itemContainer.innerHTML = "";
                templateString = '';
                data = data[0];
                if(data.length > 0){
                    setTimeout(generateproductExportTb(data), 0);
                    data.forEach((itemDetails, index) => {
                        templateString = `<tr class="unrevealed productrevealer" data-id="${itemDetails.id}">`;
                        templateString += productTmp(itemDetails, count);
                        templateString += '</tr>';
                        itemContainer.insertAdjacentHTML('beforeend', templateString);
                        count++;
                        reveal('product');
                    });
                    inlineEditBtns = document.querySelectorAll('.productrevealer .inline-edit');
                    tableSingleItemEdit(inlineEditBtns, 'edit-data');

                }else{
                    templateString = `
                        <tr class="productrevealer">
                            <td colspan='10'><label class="warning">nothing Found</label></td>
                        </tr>
                    `;
                    itemContainer.innerHTML = templateString;
                }

            break;
            case 'warehouseinventory':
                if(data[1] != data[0].length){
                    let paginationLink = (!document.querySelector('.warehouseinventory-list_pagination span.active')) ? document.querySelectorAll('.warehouseinventory-list_pagination span')[document.querySelectorAll('.warehouseinventory-list_pagination span').length - 2].textContent : document.querySelector('.warehouseinventory-list_pagination span.active').textContent;
                    pageNo = Number(paginationLink);
                    let displayed = (limit * (pageNo - 1));
                    count = displayed + 1;
                }
                itemContainer = document.getElementById('warehouseinventorys_list');
                itemContainer.innerHTML = "";
                templateString = '';
                data = data[0];
                if(data.length > 0){
                    setTimeout(generatewarehouseInventoryExportTb(data), 0);
                    data.forEach((itemDetails, index) => {
                        let productDs = sysData.productList.filter(info => removeSpaces(info.name.toLowerCase()) == removeSpaces(itemDetails.name.toLowerCase()));
                        templateString = `<tr class="unrevealed warehouseinventoryrevealer" data-id="${itemDetails.id}">`;
                        templateString += warehouseInventoryTmp(itemDetails, count, productDs);
                        templateString += '</tr>';
                        itemContainer.insertAdjacentHTML('beforeend', templateString);
                        count++;
                        reveal('warehouseinventory');
                    });
                    inlineEditBtns = document.querySelectorAll('.warehouseinventoryrevealer .inline-edit');
                    tableSingleItemEdit(inlineEditBtns, 'edit-data');

                }else{
                    templateString = `
                        <tr class="warehouseinventoryrevealer">
                            <td colspan='10'><label class="warning">nothing Found</label></td>
                        </tr>
                    `;
                    itemContainer.innerHTML = templateString;
                }

            break;
            case 'branchinventory':
                if(data[1] != data[0].length){
                    let paginationLink = (!document.querySelector('.branchinventory-list_pagination span.active')) ? document.querySelectorAll('.branchinventory-list_pagination span')[document.querySelectorAll('.branchinventory-list_pagination span').length - 2].textContent : document.querySelector('.branchinventory-list_pagination span.active').textContent;
                    pageNo = Number(paginationLink);
                    let displayed = (limit * (pageNo - 1));
                    count = displayed + 1;
                }
                itemContainer = document.getElementById('branchinventorys_list');
                itemContainer.innerHTML = "";
                templateString = '';
                data = data[0];
                let total = data.length;
                if(data.length > 0){
                    setTimeout(generatebranchinventoryExportTb(data), 0);
                    data.forEach((itemDetails, index) => {
                        let productDetails = sysData.warehouseProductList.filter(info => removeSpaces(info.name.toLowerCase()) == removeSpaces(itemDetails.desc.toLowerCase()));
                        templateString = `<tr class="unrevealed branchinventoryrevealer" data-warehouse_inventory_id="${itemDetails.warehouse_inventory_id}" data-id="${itemDetails.id}" data-old-quantity="${itemDetails.quantity}" data-available-quantity="${itemDetails.availableQuantity}">`;
                        templateString +=  branchinventoryTmp(itemDetails, count, productDetails);
                        templateString += '</tr>';
                        itemContainer.insertAdjacentHTML('beforeend', templateString);
                        count++;
                        reveal('branchinventory');
                        if(total == 1){
                            inlineEditBtns = document.querySelectorAll('.branchinventoryrevealer .inline-edit');
                            inlineReturnBtns = document.querySelectorAll('.branchinventoryrevealer .inline-return');
                            returnBranchInventory(inlineReturnBtns);
                            tableSingleItemEdit(inlineEditBtns, 'edit-data');
                        }
                        total--;
                    });

                }else{
                    templateString = `
                        <tr class="branchinventoryrevealer">
                            <td colspan='10'><label class="warning">nothing Found</label></td>
                        </tr>
                    `;
                    itemContainer.innerHTML = templateString;
                }

            break;
        }
    }
    const supplierTmp = (itemDetails, count) => {
        let templateString = `
            <td><label class="counter">${count}</label></td>
            <td class="edit-data" data-name="first_name"><label class="short-fixed">${itemDetails.first_name}</label></td>
            <td class="edit-data" data-name="last_name"><label class="short-fixed">${itemDetails.last_name}</label></td>
            <td class="edit-data" data-name="telephone"><label>${itemDetails.telephone}</label></td>
            <td class="edit-data select-data"><label class="success counter">active</label></td>
            <td class="edit-data" data-name="address"><label class="price warning">${itemDetails.date}</label></td>
            <td class="edit-data" data-name="address"><label>${itemDetails.address}</label></td>
            <td class="edit-data" data-name="email"><label class="fixed-width">${itemDetails.email}</label></td>

        `;
        return templateString;
    }
    const userTmp = (itemDetails, count) => {
        let templateString = `
            <td><label class="counter">${count}</label></td>
            <td class="edit-data" data-name="first_name"><label class="short-fixed">${itemDetails.first_name}</label></td>
            <td class="edit-data" data-name="last_name"><label class="short-fixed">${itemDetails.username}</label></td>
            <td class="update_psd"><label class="password">*******************</label></td>
            <td>
                <label class="action" data-id="user">
                    <span class="material-symbols-outlined primary inline-edit">edit</span>
                </label>
            </td>
            <td class="edit-data select-data userTypeList" data-name="user_type"><label class="primary">${itemDetails.user_type}</label></td>
            <td class="edit-data select-data statusList" data-name="status"><label class="${(itemDetails.status == 'Activated') ? 'success' : 'warning'}">${itemDetails.status}</label></td>
            <td>
                <div class="image">
                    <img src="./images/${itemDetails.image}" alt="">
                    <label for="upload-user-image" title="Click to choose new image to upload">
                        <span class="material-symbols-outlined">cloud_sync</span>
                        <input type="file" id="upload-user-image">
                    </label>
                </div>
                <img src="./images/${itemDetails.image}" class="preview-image">
            </td>
            <td class="edit-data" data-name="telephone"><label>${itemDetails.telephone}</label></td>
            <td class="edit-data select-data branchList" data-name="branch"><label>${itemDetails.branch}</label></td>
            <td class="edit-data" data-name="address"><label>${itemDetails.address}</label></td>
            <td class="edit-data" data-name="email"><label class="fixed-width">${itemDetails.email}</label></td>

        `;
        return templateString;
    }
    const branchinventoryTmp = (itemDetails, count, productDetails) => {
        ////// //console.log(itemDetails)
        let templateString = `
        <td><label class="counter">${count}</label></td>
        <td class="edit-data select-data warehouseProductList" data-name="warehouse_inventory_id" data-details='${JSON.stringify(productDetails[0])}'><label class="desc-fixed-width">${itemDetails.desc}</label></td>
        <td>
            <label class="action" data-id="branchinventory">
                <span class="material-symbols-outlined primary inline-edit">edit</span>
                <span title="return to warehouse" class="material-symbols-outlined warning inline-return">sync</span>
            </label>
        </td>
        <td class="edit-data select-data branchList" data-name="branch_id"><label class="short-fixed">${itemDetails.branch_name}</label></td>
        <td class="edit-data" data-name="code"><label class="primary">${itemDetails.code}</label></td>
        <td class="edit-data" data-old-quantity="${itemDetails.quantity}" data-name="quantity"><label>${itemDetails.quantity}</label></td>
        <td data-name="availableQuantity"><label>${itemDetails.availableQuantity}</label></td>
        <td class="edit-data select-data statusList" data-name="status_id">${(itemDetails.quantity > 0) ? '<label class="success">Available</label>': '<label class="warning">Out of Stork</label>'}</td>
        `;
        return templateString;
    }
    const generatebranchinventoryExportTb = (itemData) => {
        let tmp = ``;
        if(typeof(itemData) == 'object'){
            //////console.log(typeof(itemData))
            itemData.forEach((itemDetails, index) => {
                tmp = `
                <tr>
                    <td>${itemDetails.desc}</td>
                    <td>${itemDetails.branch_name}</td>
                    <td>${itemDetails.code}</td>
                    <td>${itemDetails.quantity}</td>
                    <td>${itemDetails.availableQuantity}</td>
                </tr>
                `;
                document.getElementById('branchInvenrotytbody').insertAdjacentHTML('beforeend', tmp);
            });

        }
    }
    const warehouseInventoryTmp = (itemDetails, count, productDetails) => {
        ////// //console.log(productDetails)
        let templateString = `
            <td><label class="counter">${count}</label></td>
            <td class="edit-data select-data productList" data-name="product_id" data-details='${JSON.stringify(productDetails)}'><label class="fixed-width">${itemDetails.name}</label></td>
            <td>
                <label class="action" data-id="warehouseinventory">
                    <span class="material-symbols-outlined primary inline-edit">edit</span>
                </label>
            </td>
            <td class="edit-data" data-name="quantity"><label>${itemDetails.quantity}</label></td>
            <td id="available${itemDetails.warehouse_inventory_id}">${(itemDetails.quantity > 0) ? '<label class="success">Available</label>': '<label class="warning">Out of Stork</label>'}</td>
            <td>
                <div class="image">
                    <img src="./images/${itemDetails.image}" alt="">
                    <label for="upload-product-image" title="Click to choose new image to upload">
                        <span class="material-symbols-outlined">cloud_sync</span>
                        <input type="file" id="upload-product-image">
                    </label>
                </div>
                <img src="./images/${itemDetails.image}" class="preview-image">
            </td>
            <td class="edit-data select-data colorList" data-name="colour_id"><label class="short-fixed">${itemDetails.color}</label></td>
            <td class="edit-data select-data sizeList" data-name="size_id"><label class="short-fixed">${itemDetails.size}</label></td>
            <td class="edit-data" data-name="code"><label class="primary">${itemDetails.code}</label></td>
            <td class="edit-data" data-name="description"><label class="desc-fixed-width">${itemDetails.desc}</label></td>
        `;
        return templateString;
    }

    const generatewarehouseInventoryExportTb = (itemData) => {
        let tmp = ``;
        if(typeof(itemData) == 'object'){
            //////console.log(typeof(itemData))
            itemData.forEach((itemDetails, index) => {
                tmp = `
                <tr>
                    <td>${itemDetails.name}</td>
                    <td>${itemDetails.quantity}</td>
                    <td>${itemDetails.color}</td>
                    <td>${itemDetails.size}</td>
                    <td>${itemDetails.code}</td>
                    <td>${itemDetails.desc}</td>
                </tr>
                `;
                document.getElementById('warehouserInventoryExpotbody').insertAdjacentHTML('beforeend', tmp);
            });
        }
    }
    const productTmp = (itemDetails, count) => {

        let templateString = `
            <td><label class="counter">${count}</label></td>
            <td class="edit-data" data-name="product_name"><label class="fixed-width">${itemDetails.name}</label></td>
            <td>
                <label class="action" data-id="product">
                    <span class="material-symbols-outlined primary inline-edit">edit</span>
                </label>
            </td>
            <td class="edit-data select-data categoryList" data-name="category_id"><label class="short-fixed">${itemDetails.category_name}</label></td>
            <td class="edit-data" data-name="buy_price"><label class="primary">${itemDetails.buy_price}</label></td>
            <td class="edit-data" data-name="wholesale_price"><label class="warning">${itemDetails.wholesale_price}</label></td>
            <td class="edit-data" data-name="sale_price"><label class="success">${itemDetails.sale_price}</label></td>
            <td class="edit-data select-data brandList" data-name="brand_id"><label class="short-fixed">${itemDetails.brand_name}</label></td>
            <td class="edit-data select-data sizeSchemeList" data-name="size_scheme_id"><label class="primary">${itemDetails.scheme_name}</label></td>
            <td class="edit-data" data-name="code_initual"><label>${itemDetails.code_initual}</label></td>
            <td class="edit-data select-data supplierList" data-name="supplier_id"><label>${itemDetails.supplier}</label></td>

        `;
        return templateString;
    }
    const generateproductExportTb = (itemData) => {
        let tmp = ``;
        if(typeof(itemData) == 'object'){
            //////console.log(typeof(itemData))
            itemData.forEach((itemDetails, index) => {
                tmp = `
                <tr>
                    <td>${itemDetails.name}</td>
                    <td>${itemDetails.category_name}</td>
                    <td>${itemDetails.wholesale_price}</td>
                    <td>${itemDetails.sale_price}</td>
                    <td>${itemDetails.brand_name}</td>
                    <td>${itemDetails.scheme_name}</td>
                    <td>${itemDetails.code_initual}</td>
                    <td>${itemDetails.supplier}</td>
                </tr>
                `;
                document.getElementById('prodouctExportbody').insertAdjacentHTML('beforeend', tmp);
            });

        }
    }
    const generatePegination = (data, item, limit = 15, dataType="obj", displayLinkNumber = 10) => {
        ////// //console.log(data)
        let pages = 1;  
        let range = []; 
        let total = (dataType == 'obj') ? Object.keys(data).length : data.length;
        let peginationLink = document.querySelector(`.pagination_link.${item}-list_pagination`);
        if(total > limit){
            let page = Math.ceil(total/limit);
            pages = total & limit === 0 ? page : page + 1;
            range = [...Array(pages).keys()];
            //////console.log(total, range, peginationLink)

            let activePeginationLink = document.querySelector(`.pagination_link.${item}-list_pagination span.active`);
            let itemLink = '<span><<</span> ';
            range.forEach((rangeValue, index) => {
                if(index < 11){
                    if(rangeValue == 0){
                        itemLink += ` <span class="prev"><</span>`;

                    }else{
                        if(activePeginationLink != null){
                            itemLink += ` <span class="${(rangeValue == Number(activePeginationLink.textContent)) ? 'active': ''}">${rangeValue}</span>`;
                        }else{
                            itemLink += ` <span class="${(rangeValue == 1) ? 'active': ''}">${rangeValue}</span>`;
                        }
                    }
                }
            });
            itemLink += '<span class="next">></span><span>>></span>';
            peginationLink.innerHTML = itemLink;

            paginationManipulation(dataType, displayLinkNumber, range, data, item, limit);


            if(range.length < displayLinkNumber){
                document.querySelectorAll(`.pagination_link.${item}-list_pagination span`).forEach((pLink, index) => {
                    if(pLink.textContent == '<<' || pLink.textContent == '<' || pLink.textContent == '>>' || pLink.textContent == '>' ){
                        pLink.classList.add('hide');
                    }
                });
            }
        }else{
            peginationLink.innerHTML = '';
        }
    }
    const paginationManipulation = (dataType, displayLinkNumber, range, data, item, limit) => {
        //////console.log(item)
        let itemLinks = document.querySelectorAll(`.pagination_link.${item}-list_pagination span`);
        ////// //console.log(limit)
        itemLinks.forEach(paginationLink => paginationLink.addEventListener('click', () => {
            itemLinks.forEach(itemLink => {itemLink.classList.remove('active')});

            switch(paginationLink.textContent){
                case '>':

                    itemLinks.forEach(itemLink => {itemLink.classList.remove('hide')});
                    itemLinks.forEach(itemLink => {
                        if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){
                            if(((displayLinkNumber + Number(itemLink.textContent)) <= Number(range[range.length - 1]))){
                                itemLink.textContent = displayLinkNumber + Number(itemLink.textContent);
                            }else{
                                itemLink.textContent = displayLinkNumber + Number(itemLink.textContent);
                                itemLink.classList.add('hide');
                                if(((displayLinkNumber + Number(itemLink.textContent)) >= Number(range[range.length - 1]))){
                                    document.querySelector(`.pagination_link.${item}-list_pagination span.next`).classList.add('hide');
                                }
                            }
                        }
                       
                    });
                break;
                case '>>':
                    let values = [];
                    // let totalData = (typeof(data) == 'object') ? Object.keys(data).length : data.length;
                    if(range.length > displayLinkNumber){
                        for (var i = 11; i >= 0; i--) {
                            values.push(Number(range[range.length - 1]) - i);
                        }

                        itemLinks.forEach((itemLink, index) => {
                            itemLink.classList.remove('hide');
                            if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){
                               itemLink.textContent = values[index];
                            }
                        });
                        document.querySelector(`.pagination_link.${item}-list_pagination span.next`).classList.add('hide');

                    }else{
                        itemLinks.forEach((itemLink, index) => {
                            if(itemLink.textContent !== '<<' || itemLink.textContent !== '<' || itemLink.textContent !== '>>' || itemLink.textContent !== '>' ){
                                itemLink.classList.add('hide');
                            }
                        });
                    }
                break;
                case '<':
                    itemLinks.forEach(itemLink => itemLink.classList.remove('hide'));
                    let tracker = [];
                    itemLinks.forEach(itemLink => {
                        if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){

                            if(((Number(itemLink.textContent) - displayLinkNumber) >= Number(range[1]))){
                                itemLink.textContent = Number(itemLink.textContent) - displayLinkNumber;
                                tracker.push(Number(itemLink.textContent) - displayLinkNumber);
                            }else{
                                document.querySelector(`.pagination_link.${item}-list_pagination span.prev`).classList.add('hide');
                            }
                        }
                    });
                    if(tracker.length < 10){
                        let newLinks = [Number(range[0])];
                        for (var i = 0; i <= 11; i++) {
                            newLinks.push(Number(range[0]) + i);
                            if(itemLinks[i].textContent !== '<<' && itemLinks[i].textContent !== '<' && itemLinks[i].textContent !== '>>' && itemLinks[i].textContent !== '>' ){
                               itemLinks[i].textContent = newLinks[i];
                            }
                        }
                    }
                break;
                case '<<':
                    itemLinks.forEach(itemLink => itemLink.classList.remove('hide'));
                    itemLinks.forEach((itemLink, index) => {
                        
                        if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){
                            itemLink.textContent = index - 1;
                        }
                    });
                    document.querySelector(`.pagination_link.${item}-list_pagination span.prev`).classList.add('hide');
                break;
                default:
                    //////console.log(typeof(data))
                    let start = ((Number(paginationLink.textContent) - 1) * limit);
                    document.getElementById(`${item}s_list`).innerHTML = '';
                    let identifier = item;
                    paginationLink.classList.add('active');
                    renderPageData(data, document.querySelector(`.pagination_link.${item}-list_pagination`).dataset.id, start);
            }
        }));
    }
    const invoiceTmp = (itemData, index, count)=>{
        let currency_list_filter = document.querySelector(".currency_list").value;
        let rate = 1;
        let currencyArray = []; 
        if(currency_list_filter == '$'){
            currencyArray = site.currencyList.filter(currency => currency.symbol == currency_list_filter);
            rate = Number(currencyArray[0].rate);
        }

        ////// //console.log(rate);
        ////// //console.log(itemData);
        let tmp = ``;
        if(itemData.length == 0){
            tmp = `
            <tr class="unrevealed invoicerevealer">
                <td colspan="10">
                    Nothing Found
                </td>
            </tr>`
        }else{
            tmp = `
            <tr class="unrevealed invoicerevealer" data-invoiceNo="${itemData.invoice_no}">
                <td><label class="counter">${count+1}</label></td>
                <td class="invoice-data"><label>${itemData.branch}</label></td>
                <td>
                    <label class="action">
                        <span class="material-symbols-outlined warning inline-return" data-id="${itemData.invoice_no}" data-tb="invoice" data-index="${index}">sync</span>
                    </label>
                </td>
                <td class="invoice-data count"><label class="short-fixed">${itemData.invoice_no}</label></td>
                <td class="invoice-data count"><label class="short-fixed">${itemData.totalItems}</label></td>
                <td class="invoice-data"><label>${addComma((currency_list_filter == '$') ? convertToDallar(Number(itemData.totalPrice), Number(rate)).toString() : itemData.totalPrice.toString())}</label></td>
                <td class="invoice-data select-data"><label>${itemData.attendant}</label></td>
                <td class="invoice-data"><label class="success">${itemData.purchase_date}</label></td>
                <td class="invoice-data"><label class="">${itemData.payment_type_name}</label></td>
                <td class="invoice-data  "><label class="">${itemData.customer_name}</label></td>
                <td class="det">
                </td>
            </tr>
        `;

        }
        return tmp;
    }
    const saleTmp = (itemData, index, count)=>{
        let currency_list_filter = document.querySelector(".currency_list").value;
        let rate = 1;
        let currencyArray = []; 
        if(currency_list_filter == '$'){
            currencyArray = site.currencyList.filter(currency => currency.symbol == currency_list_filter);
            rate = Number(currencyArray[0].rate);
        }

        //////console.log(rate);

        let tmp = ``;
        itemData.invoiceDetails.forEach((invoiceProduct, index) => {
            count ++;
            tmp += `
            <tr class="unrevealed invoicerevealer" data-invoiceNo="${itemData.invoice_no}">
                <td><label class="counter">${count}</label></td>
                <td class="invoice-data"><label class="sale-remarks">${invoiceProduct.remarks}</label></td>
                <td>
                    <label class="action">
                        <span class="material-symbols-outlined warning inline-return" data-id="${itemData.invoice_no}" data-tb="invoice" data-index="${index}">sync</span>
                    </label>
                </td>
                <td class="invoice-data"><label>${invoiceProduct.product_code}</label></td>
                <td class="invoice-data"><label>${invoiceProduct.branch_location}</label></td>
                <td class="invoice-data count"><label class="short-fixed">${itemData.invoice_no}</label></td>
                <td class="invoice-data count"><label class="short-fixed">${invoiceProduct.purchase_quantity}</label></td>
                <td class="invoice-data count"><label class="short-fixed">${addComma((currency_list_filter == '$') ? convertToDallar(Number(invoiceProduct.sale_price), Number(rate)).toString() : invoiceProduct.sale_price.toString())}</label></td>
                <td class="invoice-data"><label>${addComma((currency_list_filter == '$') ? convertToDallar((Number(invoiceProduct.purchase_quantity) * Number(invoiceProduct.sale_price)), Number(rate)).toString() : (Number(invoiceProduct.purchase_quantity) * Number(invoiceProduct.sale_price)).toString())}</label></td>
                <td class="inventory-data select-data"><label>${itemData.attendant}</label></td>
                <td class="invoice-data"><label class="success">${itemData.purchase_date}</label></td>
                <td class="invoice-data"><label class="">${itemData.payment_type_name}</label></td>
                <td class="invoice-data  "><label class="">${itemData.customer_name}</label></td>

                <td class="det">
                </td>
            </tr>
        `;
        });
        return tmp;
    }
    const generateSaleExportTb = (itemData) => {
        let tmp = ``;
        let currency_list_filter = document.querySelector(".currency_list").value;
        let rate = 1;
        let currencyArray = []; 
        if(currency_list_filter == '$'){
            currencyArray = site.currencyList.filter(currency => currency.symbol == currency_list_filter);
            rate = Number(currencyArray[0].rate);
        }
        if(typeof(itemData) == 'object'){
            //////console.log(typeof(itemData))
            itemData.invoiceDetails.forEach((invoiceProduct, index) => {
                tmp = `
                <tr>
                    <td>${invoiceProduct.remarks}</td>
                    <td>${invoiceProduct.product_code}</td>
                    <td>${invoiceProduct.branch_location}</td>
                    <td>${itemData.invoice_no}</td>
                    <td>${invoiceProduct.purchase_quantity}</td>
                    <td>${(currency_list_filter == '$') ? convertToDallar(Number(itemData.totalPrice), Number(rate)) : itemData.totalPrice}</td>
                    <td>${((currency_list_filter == '$') ? convertToDallar((Number(invoiceProduct.purchase_quantity) * Number(invoiceProduct.sale_price)), Number(rate)) : (Number(invoiceProduct.purchase_quantity) * Number(invoiceProduct.sale_price)))}</td>
                    <td>${itemData.attendant}</td>
                    <td>${itemData.purchase_date}</td>
                    <td>${itemData.payment_type_name}</td>
                    <td>${itemData.customer_name}</td>
                </tr>
                `;
            });
            document.getElementById('sale_export_tb').insertAdjacentHTML('beforeend', tmp);

        }
    }
    const convertToDallar = (price, rate) => {
        return  (((Math.round(((Number(price)/rate) + Number.EPSILON)) * 100) / 100 ));
    }
    const tRowAction =() => {
        let actionBtnsParent = document.querySelectorAll(".invoicerevealer td label.action");
        ////// //console.log(actionBtnsParent);
        actionBtnsParent.forEach(actionBtn => {
            for (var i = actionBtn.children.length - 1; i >= 0; i--) {
                let btn = actionBtn.children[i];
                btn.addEventListener('click', (e) => {
                    if(!document.getElementById('warningBox')){
                        document.querySelector(`#Sales`).before(warningNotification(`Cancel Operation and exit`));
                        let warningBoxBtns = document.querySelectorAll('#warningBox button');
                        warningBoxBtns.forEach(warningactionBtn => warningactionBtn.addEventListener('click', () => {
                            if(warningactionBtn.childNodes[1].textContent == 'Continue'){
                                document.getElementById('warningBox').remove();
                                let clickedTr = actionBtn.parentElement.parentElement;
                                ////// //console.log(clickedTr.dataset.invoiceno)
                                data = {
                                    'invoice_no' : clickedTr.dataset.invoiceno,
                                    'action': 'returnSale'
                                }; 
                                res = run(data);
                                res.always(details => {
                                    deliverNotification(details.message, details.response);
                                    getInvoiceByDate();
                                });
                            }else{
                                document.getElementById('warningBox').remove();
                            }
                        }));
                    }
        //             // REMOVE ACTIVE CLASS FROM ALL THE TABLE ROWS
        //             for (var x = tr.length - 1; x >= 0; x--) {
        //                 tr[x].classList.remove('active');
        //                 tr[x].style.top = `0px`
        //                 // MOVE THE NEXT/PREVIOUS TABLE ROW BY THE HEIGHT OF THE EXPANDED ROW
        //                if(tr[x] == clickedTr){
        //                     clickedTr.style.top = `-${x * Number(clickedTr.offsetHeight)}px`
        ////                   //  //console.log(clickedTr.offsetHeight);
        //                }else{
        //                     tr[x].children[2].children[0].children[2].textContent = 'add';
        //                }
        //             }
        //             if(btn.textContent == 'add'){
        //                 btn.textContent = "remove";
        //                 // ADD ACTIVE CLOSE TO THE PARENT OF THE CLICK ELEMENT
        //                 clickedTr.classList.add('active');

        //             }else{
        //                 btn.textContent = "add";
        //                 clickedTr.style.top = `0px`
        //             }
                })
            }

        });
    }

    const reveal = (identifier) => {
        let number = 0;
        const trp = document.querySelectorAll(`.${identifier}revealer`);
        trp.forEach((tr, index)=> {
            tr.classList.remove('unrevealed');
            let duration = ((index+1)/trp.length);
            tr.style.animationDuration = `${duration}s`;
        });
    }
    const calculateTotalSales = (data, start) => {
        let payment_type_list_filter = document.querySelector('.payment_type_list').value;

        let totalSum = 0;
        // USE BRANCH IDS AS KEYS
        // OBJECT TO HOLD BRANCH IDS AND THEIR TOTAL SALES
        let branchTotal = {};
        let branchInvoices = {};
        site.branchList.forEach(branch => {
            objectifiedSalesData[branch.id] = convertToObject(data.filter(branchInvoicesList  => Number(branchInvoicesList.branch_id) ==  Number(branch.id)));

            // IF BRANCH DOESN'T EQUAL TO ALL
            if(branch.id != 5){
                branchTotal[branch.id] = 0; // EXAMPLE OF EXPECTED OUT PUT{'1' : 0,'2' : 0,'3':0}
                branchInvoices = objectifiedSalesData[branch.id];
                if(Object.keys(objectifiedSalesData[branch.id]).length > 0){
                    Object.keys(branchInvoices).forEach((infoKey, index, infoKeys) => {
                        if(!payment_type_list_filter.includes('Method')){
                            if(Number(branchInvoices[infoKey].invoiceDetails[0].payment_type_id) == Number(payment_type_list_filter)){
                                let totalPrice = Number(branchInvoices[infoKey].totalPrice);
                                totalSum += totalPrice;
                                // totalSum = totalSum + ((Number(branchInvoices[infoKey].invoiceDetails[0].sale_price) * Number(branchInvoices[infoKey].invoiceDetails[0].purchase_quantity)));
                                branchInvoices[infoKey].invoiceDetails.forEach(invoiceD => {
                                    branchTotal[invoiceD.branch_id] = Number(branchTotal[invoiceD.branch_id]) + ((Number(invoiceD.sale_price) * Number(invoiceD.purchase_quantity)));
                                })
                            }
                        }else{
                            let totalPrice = Number(branchInvoices[infoKey].totalPrice);
                            totalSum += totalPrice;
                            // totalSum = totalSum + ((Number(branchInvoices[infoKey].invoiceDetails[0].sale_price) * Number(branchInvoices[infoKey].invoiceDetails[0].purchase_quantity)));
                            branchInvoices[infoKey].invoiceDetails.forEach(invoiceD => {
                                branchTotal[invoiceD.branch_id] = Number(branchTotal[invoiceD.branch_id]) + ((Number(invoiceD.sale_price) * Number(invoiceD.purchase_quantity)));
                            });
                        }
                    });
                }
            }
        });
        // GET CURRENCY RATE(DOLAR)
        let currency_list_filter = document.querySelector(".currency_list").value;
        let rate = 1;
        let currencyArray = []; 
        if(currency_list_filter == '$'){
            currencyArray = site.currencyList.filter(currency => currency.symbol == currency_list_filter);
            rate = Number(currencyArray[0].rate);
        }
        // SET TOTALS TO ELEMENT DISPLAYS
        document.querySelector('#Sales .cards').innerHTML = "";
        let cards = "";
        let branchInfo = [];
        let branch_id = 0;
        let bgs = ['primary-color', 'blue-color', 'orange-color']
        for (var i = Object.keys(branchTotal).length - 1; i >= 0; i--) {
            branch_id = (i+1);
            // GET THE FIRST THREE BRANCHES
            if(branch_id < 4){
                branchInfo = site.branchList.filter(branch => Number(branch.id) == branch_id);
                if(branchInfo.length > 0){
                    cards +=`
                    <div class="card ${branch_id == site.session.branch_id ? 'active' : ''} ${bgs[i]}">
                        <span class="material-symbols-outlined">shopping_bag</span>
                        <div class="stat-details branch_income">
                            <h2>${(currency_list_filter == '$') ? addComma(convertToDallar(Number(branchTotal[branch_id]), Number(rate)).toString()) + "$" : addComma(branchTotal[branch_id].toString()) + '/='}</h2>
                            <label>${branchInfo[0].name}</label>
                        </div>
                    </div>
                    `;
                }

            }
        }
        // ADD ALL BRANCH TOTAL SUM SALE CARD
        cards +=`
                <div class="card green-color">
                    <span class="material-symbols-outlined">attach_money</span>
                    <div class="stat-details">
                        <h2 id="totalIncome">${(currency_list_filter == '$') ? addComma(convertToDallar(Number(totalSum), Number(rate)).toString()) + "$" : addComma(totalSum.toString())+'/='} <small></small></h2>
                        <label>Total Income</label>
                    </div>
                </div>
                `;
        document.querySelector('#Sales .cards').innerHTML = cards;
        return objectifiedSalesData;
    }
    const addComma = (num) => {
        let numArr = num.split('');
        let commadNumber = '', count = 0;

        for (var i = numArr.length - 1; i >= 0; i--) {
            count++;
            commadNumber += numArr[i];
            if(count == 3){
                commadNumber += ",";
                count = 0;
            }
        }
        let commadNumberArr = commadNumber.split('');
        // REMOVE LAST COMMA
        if (commadNumberArr[commadNumberArr.length - 1] ===',') {
            commadNumberArr.pop();
        }
        commadNumber="";
        // REARRANGE THE NUMBER BACK TO NORMAL
        for (var i = commadNumberArr.length - 1; i >= 0; i--) {
            commadNumber += commadNumberArr[i];
        }
        if(commadNumber.includes('.')){
            let removeCommaBeforePoint = commadNumber.split('.');
            let pointValue = removeCommaBeforePoint[1];
            let actualValue = removeCommaBeforePoint[0];
            let actualValueArr = actualValue.split('');
            actualValueArr.pop();
            actualValue = '';
            actualValueArr.forEach(c => {
                actualValue += c;
            });
            commadNumber = actualValue + '.' + pointValue;

        }

        return commadNumber;
    }
    const removeComma = (num) => {
        let numArr = num.split(',');
        let nomalNumber = "";
        numArr.forEach((number) => {
            nomalNumber += number;
        });
        return nomalNumber;
    }
    const deliverNotification = (msg, msgtype) => {
        document.querySelector('.notification_messages').innerHTML = `${msg} <span class="material-symbols-outlined">close</span>`;

        document.querySelector('.notification_messages').classList.forEach((nclass) => {
            if(nclass !== 'notification_messages'){
                document.querySelector('.notification_messages').classList.remove(nclass);
            }
        });
        document.querySelector('.notification_messages').classList.add(msgtype);

        document.querySelector('.notification_messages span').addEventListener('click', () => {
            document.querySelector('.notification_messages').classList.remove(msgtype);
        });
        removeNotification();
    }
    const removeNotification = () => {
        setTimeout(function(){
            document.querySelector('.notification_messages').classList.forEach((nclass) => {
                if(nclass !== 'notification_messages'){
                    document.querySelector('.notification_messages').classList.remove(nclass);
                }
            });

        }, 8000);
    }

    const preloader = () => {

        const preloader = document.createElement('div');
        preloader.classList.add('preloader');
        return preloader;
    }

    const removeElement =(element) => {
        if(document.querySelector(element) != null){
            document.querySelector(element).remove();
        }
    }
    // GET SYSTEM DATA
    const getTodayInvoices = () =>{
        data ={'reload': true, 'sdate': today, 'edate': today, 'action':'getBranchesInvoices', 'name': 'allbranchessaleinvoices'};
        let totalSales = 0;   
        let saleNumber = 0     
        $.ajax({
            url: url,
            type: "POST",
            dataType  : 'json',
            data: data,
            success: (response) =>{
                // ADD DATA TO SYSTEM DATA
                sysData.todayInvoices = response;
            },
            complete:() =>{
                sysData.todayInvoices[0].forEach(info => {
                    saleNumber += info.invoiceDetails.length;
                    info.invoiceDetails.forEach(sale => {
                        totalSales+=(Number(sale.sale_price) * Number(sale.purchase_quantity))
                    })
                });
                document.querySelector('.sale .branch-sales h1').textContent = (saleNumber.toString().split('').length < 2) ? '0'+saleNumber:addComma(saleNumber.toString());
                document.querySelector('.total-sale__price h1').textContent = addComma(totalSales.toString()) +"/=";

                /**
                 * CHECK FOR NEW SALE EVERY TIME THE REQUEST IS COMMPLETED
                 **/
                getTodayInvoices();
            }
        });
    }

    const getInvoiceByDate = (page=1) => {
        document.getElementById(`invoices_list`).after(preloader());
        let startdate = document.getElementById('startdate').value;
        let enddate = document.getElementById('enddate').value;
        let identifier = 'invoice';
        let limitShow = document.querySelector('#Sales .salelimit').value;            
        let data ={'reload': true, 'sdate': startdate, 'edate': enddate, 'action':'getBranchesInvoices', 'name': 'allbranchessaleinvoices'};
        data.page = page;
        // IF USERTYPE IS ATTENDANT ASSIGN ATTENDANT BRACH ID
        if(site.session.user_type_id == 2){
            data.branch_id = site.session.branch_id;
        }
        if(limitShow != 'All'){
            data.limit = limitShow;
        }
        handleData('invoice', data);
    }
    const handleData = (name, data) => {
        let details = [];
        $.ajax({
            url: url,
            type: "POST",
            dataType  : 'json',
            data: data,
            success: (response) =>{
                // ADD DATA TO SYSTEM DATA
                sysData[name] = response;
            },
            complete:() =>{
                //console.log(name)
                switch(name){
                    case 'invoice':
                        details = sysData[name];
                        if(data.page == 1){
                            formPagination(details[1], 'warehouseinventory', Number(data.limit), 'arr');
                        }
                        renderPageData(details, 'invoice', (data.page == 1) ? -1 : data.page);
                        removeElement('div.preloader');

                    break;
                    case 'branchinventory':
                        details = sysData['branchinventory'];
                        const trials = setInterval(()=>{
                            //console.log(sysData)
                            if(sysData.warehouseProductList){
                                clearInterval(trials);
                                if(data.page == 1){
                                    formPagination(details[1], 'branchinventory', Number(data.limit), 'arr');
                                }
                                renderPageData(details, 'branchinventory');
                                removeElement('div.preloader');
                            }

                        }, 1000);
                    break;
                    case 'warehouseinventory':
                        details = sysData['warehouseinventory'];
                        const trials1 = setInterval(()=>{
                            //console.log(sysData)
                            if(sysData.warehouseProductList){
                                clearInterval(trials1);
                                if(data.page == 1){
                                    formPagination(details[1], 'warehouseinventory', Number(data.limit), 'arr');
                                }
                                renderPageData(details, 'warehouseinventory');
                                removeElement('div.preloader');
                            }

                        }, 1000);
                    break;

                    default:
                        details = sysData[name];
                      //  //console.log(data)
                      //  //console.log(details)
                        if(sysData.warehouseProductList){}
                        if(data.page == 1){
                            formPagination(details[1], name, Number(data.limit), 'arr');
                        }
                        renderPageData(details, name);
                        removeElement('div.preloader');
                }
            }
        });
    }
    const getWarehouseInventory = (page = 1) =>{
        document.getElementById(`warehouseinventorys_list`).after(preloader());
        let limitShow = document.querySelector('#WarehouseInventorys .warehouselimit').value;
        let data = {'limit': limitShow,'action':'getLimitedWarehouseInventory', 'page': page};
        data.action = (document.querySelector('#WarehouseInventorys .warehouselimit').value != "All") ? 'getLimitedWarehouseInventory': 'getAllWarehouseInventorys';
        handleData('warehouseinventory', data);
    }
    const getBranchInventory = (page = 1) =>{
        document.getElementById(`branchinventorys_list`).after(preloader());
        let limitShow = document.querySelector('#BranchInventorys .branchlimit').value;
        let data = {'limit': limitShow,'action':'getLimitedBranchInventory', 'page': page};
        data.action = (document.querySelector('#BranchInventorys .branchlimit').value != "All") ? 'getLimitedBranchInventory': 'getAllBranchInventorys';
        if(Number(document.querySelector('.dash_branch_list').value) && (Number(document.querySelector('.dash_branch_list').value != 5))){
            data.branch_id = document.querySelector('.dash_branch_list').value
        } 
        handleData('branchinventory', data);
    }
    const getProducts = (page = 1) => {
        document.getElementById(`products_list`).after(preloader());
        let limitShow = document.querySelector('#Products .productslimit').value;
        let data = {'limit': limitShow,'action':'getLimitedProducts', 'page': page};
        data.action = (document.querySelector('#Products .productslimit').value != "All") ? 'getLimitedProducts': 'getAllProducts';
        handleData('product', data);

    }
    const getUserAccounts = (page = 1) => {
        document.getElementById(`users_list`).after(preloader());
        let limitShow = document.querySelector('#Accounts .userlimit').value//(document.querySelector('#Accounts .userlimit').value != "All") ? 
        // : 15;
        let data = {'limit': limitShow,'action':'getLimitedUsers', 'page': page};
        data.action = (document.querySelector('#Accounts .userlimit').value != "All") ? 'getLimitedUsers': 'getAllUsers';
        handleData('user', data);
    }
    const getSuppliers = (page=1) =>{
        document.getElementById(`suppliers_list`).after(preloader());
        // let limitShow = document.querySelector('#Suppliers .userlimit').value//(document.querySelector('#Suppliers .userlimit').value != "All") ? 
        // : 15;
        let data = {'action':'getLimitedSuppliers', 'limit':'15', 'page': page};
        handleData('supplier', data);
    }
    const passwordUpdate = (psdTds) => {
        psdTds.forEach(td => td.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            ////// //console.log(td);
            let tdData = td.children[0];
            let form = `
                <form id="updatePassword">
                    <span for="psdUdate" class="material-symbols-outlined">close</span>
                    <input type="text" id="psd" placeholder="New password">
                </form>
            `;
            td.innerHTML = form;
            // CANCEAL PASSWORD UPDATE 
            document.querySelector('#updatePassword span').addEventListener('click', () => {
                td.innerHTML ="";
                td.append(tdData);
                ////// //console.log(tdData)
            });
            // UPDATE PASSWORD
            document.querySelector('#updatePassword').addEventListener('submit', (e) => {
                e.preventDefault();
                let newPass = document.querySelector('#updatePassword input').value;
                let data = {'id': td.parentElement.dataset.id,'action':'updateUserPassword', 'password': newPass};
                res = run(data);
                res.always((details) => {
                    //////console.log(details)
                    deliverNotification(details.message, details.response);
                    td.innerHTML = "";
                    td.append(tdData);

                })
            })
        }));

    }
    const formPagination = (total, item, limit = 15, dataType="obj", displayLinkNumber = 10) => {
      //  //console.log(total, limit)
        let pages = 1;  
        let range = []; 
        // let total = (dataType == 'obj') ? Object.keys(data).length : data.length;
        let peginationLink = document.querySelector(`.pagination_link.${item}-list_pagination`);
        if(total > limit){
            let page = Math.ceil(total/limit);
            pages = total & limit === 0 ? page : page + 1;
            range = [...Array(pages).keys()];
            ////// //console.log(total, range, peginationLink)

            let activePeginationLink = document.querySelector(`.pagination_link.${item}-list_pagination span.active`);
            let itemLink = '<span><<</span> ';
            range.forEach((rangeValue, index) => {
                if(index < 11){
                    if(rangeValue == 0){
                        itemLink += ` <span class="prev"><</span>`;

                    }else{
                        if(activePeginationLink != null){
                            itemLink += ` <span class="${(rangeValue == Number(activePeginationLink.textContent)) ? 'active': ''}">${rangeValue}</span>`;
                        }else{
                            itemLink += ` <span class="${(rangeValue == 1) ? 'active': ''}">${rangeValue}</span>`;
                        }
                    }
                }
            });
            itemLink += '<span class="next">></span><span>>></span>';
            peginationLink.innerHTML = itemLink;

            paginationNavigation(dataType, displayLinkNumber, range, item, limit);


            if(range.length < displayLinkNumber){
                document.querySelectorAll(`.pagination_link.${item}-list_pagination span`).forEach((pLink, index) => {
                    if(pLink.textContent == '<<' || pLink.textContent == '<' || pLink.textContent == '>>' || pLink.textContent == '>' ){
                        pLink.classList.add('hide');
                    }
                });
            }
        }else{
            peginationLink.innerHTML = '';
        }
    }

    const paginationNavigation = (dataType, displayLinkNumber, range, item, limit) => {
      //  //console.log(item)
        let itemLinks = document.querySelectorAll(`.pagination_link.${item}-list_pagination span`);
        ////// //console.log(limit)
        itemLinks.forEach(paginationLink => paginationLink.addEventListener('click', () => {
            itemLinks.forEach(itemLink => {itemLink.classList.remove('active')});

            switch(paginationLink.textContent){
                case '>':

                    itemLinks.forEach(itemLink => {itemLink.classList.remove('hide')});
                    itemLinks.forEach(itemLink => {
                        if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){
                            if(((displayLinkNumber + Number(itemLink.textContent)) <= Number(range[range.length - 1]))){
                                itemLink.textContent = displayLinkNumber + Number(itemLink.textContent);
                            }else{
                                itemLink.textContent = displayLinkNumber + Number(itemLink.textContent);
                                itemLink.classList.add('hide');
                                if(((displayLinkNumber + Number(itemLink.textContent)) >= Number(range[range.length - 1]))){
                                    document.querySelector(`.pagination_link.${item}-list_pagination span.next`).classList.add('hide');
                                }
                            }
                        }
                       
                    });
                break;
                case '>>':
                    let values = [];
                    // let totalData = (typeof(data) == 'object') ? Object.keys(data).length : data.length;
                    if(range.length > displayLinkNumber){
                        for (var i = 11; i >= 0; i--) {
                            values.push(Number(range[range.length - 1]) - i);
                        }

                        itemLinks.forEach((itemLink, index) => {
                            itemLink.classList.remove('hide');
                            if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){
                               itemLink.textContent = values[index];
                            }
                        });
                        document.querySelector(`.pagination_link.${item}-list_pagination span.next`).classList.add('hide');

                    }else{
                        itemLinks.forEach((itemLink, index) => {
                            if(itemLink.textContent !== '<<' || itemLink.textContent !== '<' || itemLink.textContent !== '>>' || itemLink.textContent !== '>' ){
                                itemLink.classList.add('hide');
                            }
                        });
                    }
                break;
                case '<':
                    itemLinks.forEach(itemLink => itemLink.classList.remove('hide'));
                    let tracker = [];
                    itemLinks.forEach(itemLink => {
                        if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){

                            if(((Number(itemLink.textContent) - displayLinkNumber) >= Number(range[1]))){
                                itemLink.textContent = Number(itemLink.textContent) - displayLinkNumber;
                                tracker.push(Number(itemLink.textContent) - displayLinkNumber);
                            }else{
                                document.querySelector(`.pagination_link.${item}-list_pagination span.prev`).classList.add('hide');
                            }
                        }
                    });
                    if(tracker.length < 10){
                        let newLinks = [Number(range[0])];
                        for (var i = 0; i <= 11; i++) {
                            newLinks.push(Number(range[0]) + i);
                            if(itemLinks[i].textContent !== '<<' && itemLinks[i].textContent !== '<' && itemLinks[i].textContent !== '>>' && itemLinks[i].textContent !== '>' ){
                               itemLinks[i].textContent = newLinks[i];
                            }
                        }
                    }
                break;
                case '<<':
                    itemLinks.forEach(itemLink => itemLink.classList.remove('hide'));
                    itemLinks.forEach((itemLink, index) => {
                        
                        if(itemLink.textContent !== '<<' && itemLink.textContent !== '<' && itemLink.textContent !== '>>' && itemLink.textContent !== '>' ){
                            itemLink.textContent = index - 1;
                        }
                    });
                    document.querySelector(`.pagination_link.${item}-list_pagination span.prev`).classList.add('hide');
                break;
                default:
                    paginationLink.classList.add('active');
                    rqtPage = Number(paginationLink.textContent);
                    switch(item){
                        case 'user':
                            getUserAccounts(rqtPage); 
                        break;
                        case 'product':
                            getProducts(rqtPage); 
                        break;
                        case 'warehouseinventory':
                            getWarehouseInventory(rqtPage); 
                        break;
                        case 'branchinventory':
                            getBranchInventory(rqtPage); 
                        break;
                        case 'invoice':
                            getInvoiceByDate(rqtPage); 
                        break;
                    }
            }
        }));
    }
    const convertToObject = (data) => {
        let obj = {};
        data.forEach(info => {
            // USE INVENTORY ID AS KEY FOR EACH PRODUCT ID
            obj[info.id] = info;
        })
        ////// //console.log(obj);
        return obj;
    }
    // UPDATE SITE DATA
    const updateSiteData = (data) => {
        localStorage.setItem('sys.pos.warehouse.lifestyle-outdoor-gear', JSON.stringify(data));
        site = JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear'));
    }
    const export_table_to_csv = (table, csv_name, download_link) =>{
        var csv = [];
        var rows = table.querySelectorAll("tr");

        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td, th");
            
            for (var j = 0; j < cols.length; j++) {
                row.push(cols[j].innerText);
            }
            
            csv.push(row.join(","));        
        }

        var csv_string = csv.join("\n");
        var csv_blob = new Blob([csv_string], {type: "text/csv"});
        var csv_href = window.URL.createObjectURL(csv_blob);

        download_link.href = csv_href;
        download_link.download = csv_name + '.csv';
    } 
    const run = (data) => {
        if((data.reload == true) || (!site[data.name])){
            let ajaxRequest = $.ajax({
                url: "http://localhost/sys.pos.warehouse.lifestyle-outdoor-gear/api/route.php",
                type: "POST",
                dataType  : 'json',
                data: data,
                success: function(details){
                    ////// //console.log(details)
                }
            });
            return ajaxRequest;
        }
    }
    const generateDropdown = (data, key, value, instruction) => {
        var options = `<option selected>${instruction}</option>`;
        if(typeof(data) =='object'){
            data.forEach((option) => {
                options += `<option value="${option[value]}">${option[key]}</option>`;
            });
        }else{
            options += `<option>Nothing Found</option>`;
        }
        ////// //console.log(options)
        return options;
    }
    const generateDataList =(data, key) =>{
        let options = ``;
        if(typeof(data) =='object'){
            data.forEach((option) => {
                options += `<option value="${option[key]}">`;
            });

        }else{
            options += `<option value ="Nothing Found"`;
        }
        return options;
    }
    const localStorageSize = function () {
        let _lsTotal = 0,_xLen, _x;
        for (_x in localStorage) {
            if (!localStorage.hasOwnProperty(_x)) continue;
            _xLen = (localStorage[_x].length + _x.length) * 2;
            _lsTotal += _xLen;
        }
        return  (_lsTotal / 1024).toFixed(2);
    }
    const removeSpaces = (text) => {
        let collection = "";
        text.split('').forEach(c => {
            if(!c.includes(' ')){
                collection+=c;
            }
        });
        return collection;
    }
    
    const loadProfile =()=>{
        document.getElementById('profile-user-image').innerHTML = `<img src="./images/${site.session.image}">`;
        document.getElementById('profile-username').textContent = `@${site.session.username}`;
        document.getElementById('profile-name').textContent = `Name: ${site.session.last_name} ${site.session.first_name}`;
        document.getElementById('profile-email').textContent = `Email: ${site.session.email}`;
        document.getElementById('profile-telephone').textContent = `telephone: ${site.session.telephone}`;
        document.getElementById('profile-branch').textContent = `${site.session.branch} Outlet `;

        document.getElementById('update_user_fname').value = site.session.first_name;
        document.getElementById('update_user_1name').value = site.session.last_name;
        document.getElementById('update_user_email').value = site.session.email;
        document.getElementById('update_user_telephone').value = site.session.telephone;
        document.getElementById('update_user_username').value = site.session.username;
        document.getElementById('update_user_type').value = site.session.user_type;

    }
    const removeNewRowElement = () => {
        document.querySelectorAll('tr.newrow').forEach(element => removeElement(`tr.newrow`));
    }
    const settingsInfo =() => {
        const category = document.getElementById('categoryList');
        category.innerHTML = "";
        const brand = document.getElementById('brandList');
        brand.innerHTML = "";
        const branch = "";
        const size = document.getElementById('sizeLIst')
        size.innerHTML = "";
        const color =  document.getElementById('colorLIst')
        color.innerHTML = "";
        const paymentType = document.getElementById('paymentType');
        paymentType.innerHTML = "";
        setTimeout(() =>{
            site.paymentTypeList.forEach((data, index) => {
                let tmp = `
                <tr id="${data.id}">
                    <td><label class="counter">${index + 1}</label></td>
                    <td><label id="paymentMethod${data.id}">${data.name}</label></td>
                    <td>
                        <label class="action">
                            <span class="material-symbols-outlined payment-type-edit">edit</span>
                            <span class="material-symbols-outlined payment-type-delete">close</span>
                        </label>
                    </td>
                </tr>
                    `;
                    paymentType.insertAdjacentHTML('beforeend', tmp);
            });
            document.querySelectorAll('.payment-type-edit').forEach(btn => btn.addEventListener('click', (e) => {
                let payment_type_id = Number(btn.parentElement.parentElement.parentElement.id);
                let td = document.getElementById(`paymentMethod${payment_type_id}`);
                if(btn.textContent == 'edit'){
                    tdData = document.getElementById(`paymentMethod${payment_type_id}`).textContent;
                    td.innerHTML = `<input type="text" placeholder="Payment Method" value="${tdData}" id="payment_type_name">`;
                    btn.textContent = "save_as";
                }else{
                    //////console.log(td);

                    let data = {'id': payment_type_id, 'paymentMethod': td.children[0].value, 'action': 'updatePaymentType'}
                    res = run(data);
                    res.always(details => {
                        //////console.log(details);
                        deliverNotification(details.message, details.response);
                        btn.textContent = "edit";
                        td.innerHTML = td.children[0].value;
                        autorun({'reload': true, 'action':'getPaymentTypes', 'name': 'paymentTypeList'});
                    });
                }
            }))
        }, 0);
        setTimeout(() =>{
            site.brandList.slice(0, 6).forEach((data, index) => {
                let tmp = `
                <tr>
                    <td><label class="counter">${index + 1}</label></td>
                    <td><label>${data.name}</label></td>
                    <td>
                        <label class="action">
                            <span class="material-symbols-outlined brand-edit">edit</span>
                            <span class="material-symbols-outlined brand-delete">close</span>
                        </label>
                    </td>
                </tr>
                    `;
                    brand.insertAdjacentHTML('beforeend', tmp);
            })
        }, 0);
        setTimeout(() =>{
            site.colorList.slice(0, 30).forEach((data, index) => {
                    // <td><label>${data.innitual}</label></td>
                let tmp = `
                <tr>
                    <td><label class="counter">${index + 1}</label></td>
                    <td><label>${data.name}</label></td>
                    <td>
                        <label class="action">
                            <span class="material-symbols-outlined color-edit">edit</span>
                            <span class="material-symbols-outlined color-delete">close</span>
                        </label>
                    </td>
                </tr>
                    `;
                    color.insertAdjacentHTML('beforeend', tmp);
            })
        }, 0);
        setTimeout(() =>{
            site.categoryList.slice(0, 20).forEach((data, index) => {
                let tmp = `
                <tr>
                    <td><label class="counter">${index + 1}</label></td>
                    <td><label>${data.name}</label></td>
                    <td><label>${data.desc}</label></td>
                    <td>
                        <label class="action">
                            <span class="material-symbols-outlined category-edit">edit</span>
                            <span class="material-symbols-outlined category-delete">close</span>
                        </label>
                    </td>
                </tr>
                    `;
                    category.insertAdjacentHTML('beforeend', tmp);
            })
        }, 0);
        setTimeout(() =>{
            site.sizeList.slice(0, 30).forEach((data, index) => {
                    // <td><label>${data.innitual}</label></td>
                let tmp = `
                <tr>
                    <td><label class="counter">${index + 1}</label></td>
                    <td><label>${data.name}</label></td>
                    <td>
                        <label class="action">
                            <span class="material-symbols-outlined size-edit">edit</span>
                            <span class="material-symbols-outlined size-delete">close</span>
                        </label>
                    </td>
                </tr>
                    `;
                    size.insertAdjacentHTML('beforeend', tmp);
            })
        }, 0);
    }
    const autorun = (data) => {
        if((data.reload == true) || (!site[data.name])){
            let ajaxRequest = $.ajax({
                url: "http://localhost/sys.pos.warehouse.lifestyle-outdoor-gear/api/route.php",
                type: "POST",
                dataType  : 'json',
                data: data,
                success: function(details){
                    site[data.name] = details;
                    updateSiteData(site)
                }
            });
        }
    }
document.addEventListener('DOMContentLoaded', () => {
    ////// //console.log(localStorageSize())
    document.getElementById('startdate').value = today;  
    document.getElementById('enddate').value = today;  
    getWarehouseProducts();
    getAllProducts();
    setTimeout(getProducts(), 0);
    setTimeout(getBranchInventory(), 0);
    setTimeout(getWarehouseInventory(), 0);
    setTimeout(getInvoiceByDate(), 0) 
    setTimeout(getUserAccounts(), 0);
    setTimeout(getSuppliers(), 0);
    setTimeout(getDollarRate(), 0);
    setTimeout(getTodayInvoices(), 0);
    setTimeout(loadProfile(), 0);
    setTimeout(settingsInfo(), 0);

    // SET ACCOUNT PROFILE IMAGE AND USERNAME
    let accountInfo = document.getElementById('user-account-information');
    accountInfo.children[0].children[0].setAttribute('src', `./images/${site.session.image}`);
    accountInfo.children[1].innerHTML = `<i>@</i>${site.session.username}`;

    // SIGNOUT
    document.querySelector('.signout-btn').addEventListener('click', () => {
        delete site.session;
        localStorage.setItem('sys.pos.warehouse.lifestyle-outdoor-gear', JSON.stringify(site));
        window.location ='./signin.html';
    });
    // SIDE MENU/NAVIGATION
    const menuToggle = document.querySelector('.menu-toggle');
        menuToggle.addEventListener('click', () => {
        if(menuToggle.textContent == 'menu'){
            document.querySelector('main').classList.remove('cover');
            document.querySelector('.logo img').setAttribute('src', './images/logo.png');
            document.querySelector('.logo img').classList.remove('box');
            document.querySelectorAll('aside .side-menu label.sidebar-title').forEach(navTitle => navTitle.style.marginLeft = "8%");
            document.querySelectorAll('aside .side-menu a h3').forEach(linkTitle => linkTitle.style.marginLeft = "0");
            document.querySelectorAll('aside .side-menu a span').forEach(linkIcon => linkIcon.style.fontSize = '22px')
            menuToggle.textContent = 'close';
            document.querySelector('.search-field').classList.add('hide');
        }else{
            document.querySelector('main').classList.add('cover');
            document.querySelector('.logo img').setAttribute('src', './images/box-logo.png');
            document.querySelector('.logo img').classList.add('box');
            document.querySelectorAll('aside .side-menu label.sidebar-title').forEach(navTitle => {navTitle.style.marginLeft = "1%"});
            document.querySelectorAll('aside .side-menu a h3').forEach(linkTitle => linkTitle.style.marginLeft = "12%");
            document.querySelectorAll('aside .side-menu a span').forEach(linkIcon => linkIcon.style.fontSize = '25px')
            menuToggle.textContent = 'menu';
            document.querySelector('.search-field').classList.add('hide');
        }
    });
    // MENU
    const closeSideMenu = document.getElementById('close-side-bar');
    closeSideMenu.addEventListener('click', () => {
        document.querySelector('main').classList.add('cover');
        document.querySelector('.logo img').setAttribute('src', './images/box-logo.png');
        document.querySelector('.logo img').classList.add('box');
        document.querySelectorAll('aside .side-menu label.sidebar-title').forEach(navTitle => {navTitle.style.marginLeft = "1%"});
        document.querySelectorAll('aside .side-menu a h3').forEach(linkTitle => linkTitle.style.marginLeft = "12%");
        document.querySelectorAll('aside .side-menu a span').forEach(linkIcon => linkIcon.style.fontSize = '25px')
        menuToggle.textContent = 'menu';
        document.querySelector('.search-field').classList.add('hide');
    });

    // SIDE BAR
    const sideNavLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    sideNavLinks.forEach(navLink => {
        // DISPLAY LAST PAGE
        if(Number(site.page.pageIndex) == Number(navLink.dataset.pgNo)) {
            navLink.classList.add('active');// : sideNavLinks[0].classList.add('active');
            document.querySelector(`#${navLink.dataset.page}`).classList.add('active');// : document.querySelector(`#${sideNavLinks[0].dataset.page}`).classList.add('active');
        }
        navLink.addEventListener('click', (e) =>  {
            e.preventDefault();

            sideNavLinks.forEach(navLink => navLink.classList.remove('active'));
            navLink.classList.add('active');

            let nxtPage = document.getElementById(navLink.dataset.page);
            // let prvPage = document.querySelector('.page .active');
            pages.forEach(page => page.classList.remove('active'));
            nxtPage.classList.add('active') 

            if(Number(document.querySelector('aside').clientWidth) > 300){

                document.querySelector('main').classList.add('cover');
                document.querySelector('.logo img').setAttribute('src', './images/box-logo.png');
                document.querySelector('.logo img').classList.add('box');
                document.querySelectorAll('aside .side-menu label.sidebar-title').forEach(navTitle => {navTitle.style.marginLeft = "1%"});
                document.querySelectorAll('aside .side-menu a h3').forEach(linkTitle => linkTitle.style.marginLeft = "12%");
                document.querySelectorAll('aside .side-menu a span').forEach(linkIcon => linkIcon.style.fontSize = '25px')
                menuToggle.textContent = 'menu';
                document.querySelector('.search-field').classList.add('hide');
            }


            // UPDATE SITE PAGE(SAVE CURRENT PAGE)
            site.page.pg = navLink.dataset.page;
            site.page.pageIndex = Number(navLink.dataset.pgNo);
            updateSiteData(site);
        });
    })
    // TOP NAVIGATION SEARCH
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', () => {
        document.querySelector('.search-field').classList.toggle('hide');
    });
    // TOP NAVIGATION THEME
    const themeBtn = document.querySelector('.top-nav label.theme');
    const themeMenu = document.querySelector('.theme-menu');
    const themeClosetn = document.querySelector('.theme-menu__close');
    themeBtn.addEventListener('click', () => {
        themeMenu.classList.toggle('active');
    });
    themeClosetn.addEventListener('click', () => {
        themeMenu.classList.toggle('active');
    });

    const themeCs = document.querySelectorAll('.mode-list__color');
    themeCs.forEach(themeC => {
        themeC.addEventListener('click', () => {
            themeCs.forEach(themeCl => themeCl.childNodes[1].classList.remove('active'));
            themeC.childNodes[1].classList.add('active');
        })
    });
    // const setTheme = document.getElementById('setTheme');
    // setTheme.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     themeMenu.classList.toggle('active');
    // })


    /* 
    ------------------------------------------------------------------------------------
    ----------------------------- GET SALES BY SPECIFIC DATE ------------------------------
    ------------------------------------------------------------------------------------
    */
    document.getElementById('startdate').addEventListener('change', () => {
        getInvoiceByDate();
    });
    document.getElementById('enddate').addEventListener('change', () => {
        getInvoiceByDate();
    });   
    // SALE SPECIFICATION DROPDOWNS
    document.querySelector(".branch_list").innerHTML = generateDropdown(site.branchList, 'name', 'id', 'Branch  ');
    document.querySelector('.payment_type_list').innerHTML = generateDropdown(site.paymentTypeList, 'name', 'id', 'Method  ');
    document.querySelector(".currency_list").innerHTML = generateDropdown(site.currencyList, 'name', 'symbol', 'Currency  ');

    document.querySelector('.listing_type').addEventListener('change', ()=>{
        getInvoiceByDate();
    });
    document.querySelector(".branch_list").addEventListener('change', ()=>{
        getInvoiceByDate();
    });
    document.querySelector('.payment_type_list').addEventListener('change', ()=>{
        getInvoiceByDate();
    });
    document.querySelector(".currency_list").addEventListener('change', ()=>{
        getInvoiceByDate();
    });
    document.querySelector(".salelimit").addEventListener('change', () => {
        getInvoiceByDate();
    });

    // EXPORT SELD PRODUCT LIST OT EXCEL FILE generateC
    if(site.session.user_type_id == 1){
        document.getElementById('export_sales').addEventListener('click', (e) => {
            let table = document.getElementById('sale_export_tb');
            let csv_name = "lifestyle Sales as of " + today;
            let download_link = document.getElementById('export_sales');
            export_table_to_csv (table, csv_name, download_link);
        });
        document.getElementById('export_product').addEventListener('click', (e) => {
            let table = document.getElementById('Products_export_tb');
            let csv_name = "lifestyle products as of " + today;
            let download_link = document.getElementById('export_product');
            export_table_to_csv (table, csv_name, download_link);
        });
        document.getElementById('export_warehouse_inventory').addEventListener('click', (e) => {
            let table = document.getElementById('WarehouseInventorys_export_tb');
            let csv_name = "lifestyle warehouseinventory as of " + today;
            let download_link = document.getElementById('export_warehouse_inventory');
            export_table_to_csv (table, csv_name, download_link);
        });
        document.getElementById('export_branch_inventory').addEventListener('click', (e) => {
            let table = document.getElementById('BranchInventorys_export_tb');
            let csv_name = "lifestyle branchinventory as of " + today;
            let download_link = document.getElementById('export_branch_inventory');
            export_table_to_csv (table, csv_name, download_link);
        });
    }   

    // _______________________________USER________________________________
    document.getElementById('newUser').addEventListener('click', () => {
        removeNewRowElement();

        if(document.getElementById('newUser').children[0].textContent == 'add'){
            let newTr = `
                 <tr class="newrow userrevealer" data-id="0">
                    <td><label class="counter">0</label></td>
                    <td class="edit-data" data-name="first_name"><label class="short-fixed"><input type="text" placeholder="First name"></label></td>
                    <td class="edit-data" data-name="last_name"><label class="short-fixed"><input type="text" placeholder="Last name"></label></td>
                    <td class="update_psd edit-data" data-name="password"><label class="password"><input type="text" placeholder="Password"></label></td>
                    <td>
                        <label class="action" data-id="user">
                            <span class="material-symbols-outlined primary new-user-inline-edit inProgress">save_as</span>
                            <span class="material-symbols-outlined danger new-user-inline-delete">close</span>
                        </label>
                    </td>
                    <td class="edit-data select-data userTypeList" data-name="user_type"><label class="primary"><input list="sels0003" name="sel0003" placeholder="User Type" id="sel0003"><datalist id="sels0003">${generateOptions(site.userTypeList)}</datalist></label></td>
                    <td class="edit-data select-data statusList" data-name="status"><label><input list="sels013" name="sel013" placeholder="Status" id="sel013"><datalist id="sels013">${generateOptions(site.statusList)}</datalist></label></td>
                    <td>
                        <div class="image">
                            <img src="./images/default.png" alt="">
                            <label for="upload-product-image" title="Click to choose new image to upload">
                                <span class="material-symbols-outlined">cloud_sync</span>
                                <input type="file" id="upload-product-image" value='default.png'>
                            </label>
                        </div>
                        <img src="./images/default.png" class="preview-image">
                    </td>
                    <td class="edit-data" data-name="telephone"><label><input type="text" placeholder="Telephone"></label></td>
                    <td class="edit-data select-data branchList" data-name="branch"><label><input list="sels0013" name="sel0013" placeholder="branch" id="sel0013"><datalist id="sels0013">${generateOptions(site.branchList)}</datalist></label></td>
                    <td class="edit-data" data-name="address"><label><input type="text" placeholder="Address"></label></td>
                    <td class="edit-data" data-name="email"><label class="fixed-width"><input type="text" placeholder="Email"></label></td>
                </tr> 
            `;
            document.querySelector('#users_list').insertAdjacentHTML('afterBegin', newTr);
            
            document.querySelector('.newrow .new-user-inline-edit').addEventListener('click', () => {
                // removeElement('tr.newrow');
                let tr = document.querySelector('#users_list tr.newrow');
                let inlineEdit = document.querySelector('#users_list tr.newrow .new-user-inline-edit');
                asignDataAfterEdit(tr, inlineEdit, "edit-data");
            });
            document.getElementById('newUser').children[0].textContent = 'close';
        }else{
            removeElement('tr.newrow');
            document.getElementById('newUser').children[0].textContent = 'add';
            getUserAccounts();
        }
    });
    // USER FILTERS
    document.querySelector("#Accounts .userlimit").addEventListener('change', (e) => {
        getUserAccounts();
    });

    /**
     * -------------------------------- PRODUCT SECTION -------------------------------
     **/
    document.getElementById('newProduct').addEventListener('click', () => {
        removeNewRowElement();

        if(document.getElementById('newProduct').children[0].textContent == 'add'){
            let newTr = `

                <tr class="newrow productrevealer" data-id="00">
                    <td><label class="counter">0</label></td>
                    <td class="edit-data" data-name="product_name"><label class="fixed-width"><input type="text" placeholder="Product name"></label></td>
                    <td>
                        <label class="action" data-id="product">
                            <span class="material-symbols-outlined primary new-product-inline-edit">save_as</span>
                        </label>
                    </td>
                    <td class="edit-data select-data categoryList" data-name="category_id"><label class="short-fixed"><input list="sels110013" name="sel110013" placeholder="Category" id="sel110013"><datalist id="sels110013">${generateOptions(site.categoryList)}</datalist></label></td>
                    <td class="edit-data" data-name="buy_price"><label class="primary"><input type="text" placeholder="Manufucture Price"></label></td>
                    <td class="edit-data" data-name="wholesale_price"><label class="warning"><input type="text" placeholder="Wholesale Price"></label></td>
                    <td class="edit-data" data-name="sale_price"><label class="success"><input type="text" placeholder="Retial Price"></label></td>
                    <td class="edit-data select-data brandList" data-name="brand_id"><label class="short-fixed"><input list="sels10013" name="sel10013" placeholder="brand" id="sel10013"><datalist id="sels10013">${generateOptions(site.brandList)}</datalist></label></td>
                    <td class="edit-data select-data sizeSchemeList" data-name="size_scheme_id"><label class="primary"><input list="sels00013" name="sel00013" placeholder="Size Scheme" id="sel00013"><datalist id="sels00013">${generateOptions(site.sizeSchemeList)}</datalist></label></td>
                    <td class="edit-data" data-name="code_initual"><label><input type="text" placeholder="Code initual"></label></td>
                    <td class="edit-data select-data supplierList" data-name="supplier_id"><label><input list="sels0013" name="sel0013" placeholder="Supplier" id="sel0013"><datalist id="sels0013">${generateOptions(site.supplierList)}</datalist></label></td>
                </tr> 
            `;
            document.querySelector('#products_list').insertAdjacentHTML('afterBegin', newTr);
            document.querySelector('.newrow .new-product-inline-edit').addEventListener('click', () => {
                // removeElement('tr.newrow');
                let tr = document.querySelector('#products_list tr.newrow');
                let inlineEdit = document.querySelector('#products_list tr.newrow .new-product-inline-edit');
                //////console.log(tr, inlineEdit);
                asignDataAfterEdit(tr, inlineEdit, "edit-data");
            });
            document.getElementById('newProduct').children[0].textContent = 'close';
        }else{
            removeElement('tr.newrow');
            document.getElementById('newProduct').children[0].textContent = 'add';
            getProducts();
        }
    });
    // PRODUCT FILTERS
    document.querySelector("#Products .productslimit").addEventListener('change', (e) => {
        getProducts()
    });

    /**
     * -------------------------------- WAREHOUSE INVENTORY SECTION -------------------------------
     **/
    document.getElementById('newWarehouseInventoryProduct').addEventListener('click', () => {
        if(document.getElementById('newWarehouseInventoryProduct').children[0].textContent == 'add'){
            removeNewRowElement();
            let productList = sysData.productList;
            let newTr = `
                <tr class="newrow warehouseinventoryproductrevealer" data-id="200">
                    <td><label class="counter">0</label></td>
                    <td class="edit-data select-data productList" data-name="product_id"><label class="fixed-fixed"><input list="sels1120013" name="warehouseEntryProduct" placeholder="Product" id="warehouseEntryProduct"><datalist id="sels1120013">${generateOptions(productList)}</datalist></label></td>
                    <td>
                        <label class="action" data-id="warehouse-inventory-product">
                            <span class="material-symbols-outlined primary new-warehouse-inventory-product-inline-edit">save_as</span>
                        </label>
                    </td>
                    <td class="edit-data" data-name="quantity"><label class="short-fixed"><input type="text" placeholder="quantity"></label></td>
                    <td class="edit-data select-data statusList" data-name="status_id"><label class="short-fixed"><input list="sels11200013" name="sel11200013" placeholder="Status" id="sel11200013"><datalist id="sels11200013">${generateOptions(site.statusList)}</datalist></label></td>
                    <td>
                        <div class="image">
                            <img src="./images/default.png" alt="">
                            <label for="upload-product-image" title="Click to choose new image to upload">
                                <span class="material-symbols-outlined">cloud_sync</span>
                                <input type="file" id="upload-product-image" value='default.png'>
                            </label>
                        </div>
                        <img src="./images/default.png" class="preview-image">
                    </td>
                    <td class="edit-data select-data colorList" data-name="colour_id"><label class="short-fixed"><input list="sels120013" name="warehouseEntryColor" placeholder="Colour" id="warehouseEntryColor"><datalist id="sels120013">${generateOptions(site.colorList)}</datalist></label></td>
                    <td class="edit-data select-data sizeList" data-name="size_id"><label class="short-fixed"><input list="sels001300" name="warehouseEntrySize" disabled placeholder="Size" id="warehouseEntrySize"><datalist id="sels001300">${generateOptions(site.sizeList)}</datalist></label></td>
                    <td class="edit-data" data-name="code"><label class="primary"><input type="text" id="warehouseEntryCode" placeholder="Code"></label></td>
                    <td class="edit-data" data-name="description"><label class="desc-fixed-width"><input type="text" id="WarehouseEntryDesc" placeholder="description"></label></td>
                </tr> 
            `;
            document.querySelector('#warehouseinventorys_list').insertAdjacentHTML('afterBegin', newTr);
            let codeInput = document.getElementById('warehouseEntryCode');
            let descInput = document.getElementById('WarehouseEntryDesc');
            let colorInput = document.getElementById('warehouseEntryColor');
            let sizeInput = document.getElementById('warehouseEntrySize');
            let productNameInput = document.getElementById('warehouseEntryProduct');
            // GENERATE DESCRIPTION AND PRODUCT CODE FROM FIELDS
            productNameInput.addEventListener('change', () => {
                ////// //console.log(productList)
                let productDetails = productList.filter(info => info.name.trim().toLowerCase() == productNameInput.value.trim().toLowerCase());
                    ////// //console.log(productDetails);
                if(productDetails.length > 0){
                    document.getElementById('warehouseEntryProduct').parentElement.parentElement.dataset.details = JSON.stringify(productDetails[0])

                    codeInput.value = `${codeInput.value.trim()}${productDetails[0].code_initual.trim()}`;
                    descInput.value = `${productDetails[0].brand_name.trim()} ${productDetails[0].name.trim()}`;
                    productNameInput.style.borderColor = "lime";
                }else{
                    productNameInput.style.borderColor = "red";
                    deliverNotification('Invalid product name', 'warning')
                }
            });
            colorInput.addEventListener('change', () => {
                let colorDetails = site.colorList.filter(info => info.name.toLowerCase() == colorInput.value.trim().toLowerCase());
                if(colorDetails.length == 1){
                    ////// //console.log(colorDetails[0]);
                    codeInput.value = `${codeInput.value.trim()}${colorDetails[0].innitual.trim()}`;
                    descInput.value = `${descInput.value.trim()}`;
                    colorInput.style.borderColor = "lime";
                    sizeInput.removeAttribute('disabled');
                }else{
                    colorInput.style.borderColor = "red";
                    deliverNotification('Invalid input', 'warning')
                }
            });
            sizeInput.addEventListener('change', () => {
                let sizeDetails = site.sizeList.filter(info => info.name.toLowerCase() == sizeInput.value.trim().toLowerCase());
                if(sizeDetails.length == 1){
                    ////// //console.log(sizeDetails[0]);
                    codeInput.value = `${sizeDetails[0].innitual.trim()}${codeInput.value.trim()}`;
                    descInput.value = `${descInput.value.trim()} size ${sizeDetails[0].name.trim()} color ${colorInput.value.trim()}`;
                    sizeInput.style.borderColor = "lime";
                    sizeInput.removeAttribute('disabled');
                }else{
                    sizeInput.style.borderColor = "red";
                    deliverNotification('Invalid input', 'warning')
                }

            });
            document.querySelector('.newrow .new-warehouse-inventory-product-inline-edit').addEventListener('click', () => {
                // removeElement('tr.newrow');
                let tr = document.querySelector('#warehouseinventorys_list tr.newrow');
                let inlineEdit = document.querySelector('#warehouseinventorys_list tr.newrow .new-warehouse-inventory-product-inline-edit');
                //////console.log(tr, inlineEdit);
                asignDataAfterEdit(tr, inlineEdit, "edit-data");
            });
            document.getElementById('newWarehouseInventoryProduct').children[0].textContent = 'close';
        }else{
            removeElement('tr.newrow');
            document.getElementById('newWarehouseInventoryProduct').children[0].textContent = 'add';
            getWarehouseInventory();
        }
    });
    // PRODUCT FILTERS
    document.querySelector("#WarehouseInventorys .warehouselimit").addEventListener('change', (e) => {
        getWarehouseInventory();
    });

    /**
     * -------------------------------- BRANCH INVENTORY SECTION -------------------------------
     **/
    document.getElementById('newBranchInventoryProduct').addEventListener('click', () => {
        if(document.getElementById('newBranchInventoryProduct').children[0].textContent == 'add'){
            removeNewRowElement();
            let newTr = `
                <tr class="newrow branchinventoryproductrevealer" data-id="200" data-old-quantity="0">
                    <td><label class="counter">0</label></td>
                    <td class="edit-data select-data warehouseProductList" data-name="warehouse_inventory_id"><label class="fixed-fixed"><input list="sels1120013" name="product_desc" placeholder="Product Info" id="product_desc"><datalist id="sels1120013">${generateOptions(sysData.warehouseProductList)}</datalist></label></td>
                    <td>
                        <label class="action" data-id="branch-inventory-product">
                            <span class="material-symbols-outlined primary new-branch-inventory-product-inline-edit">save_as</span>
                        </label>
                    </td>
                    <td class="edit-data select-data branchList" data-name="branch_id"><label><input list="sels0013" name="sel0013" placeholder="branch" id="sel0013"><datalist id="sels0013">${generateOptions(site.branchList)}</datalist></label></td>
                    <td class="edit-data" data-name="code"><label class="primary"><input type="text" id="branchinventoryproductCode" disabled="disabled" placeholder="Code"></label></td>
                    <td class="edit-data" data-name="quantity"><label class="short-fixed"><input type="text" id="branchQuantity" placeholder="quantity"></label></td>
                    <td class="edit-data" data-name="availableQuantity"><label><input type="text" id="branchinventoryAvailableQuantity" disabled="disabled" placeholder="Available"></label></td>
                    <td class="edit-data select-data statusList" data-name="status_id"><label class="short-fixed"><input list="sels11200013" name="sel11200013" placeholder="Status" value="available" id="sel11200013"><datalist id="sels11200013">${generateOptions(site.statusList)}</datalist></label></td>
                </tr> 
            `;
            document.querySelector('#branchinventorys_list').insertAdjacentHTML('afterBegin', newTr);
            document.getElementById('product_desc').addEventListener('change', () => {
                let productDetails = sysData.warehouseProductList.filter(info => info.name.toLowerCase() == document.getElementById('product_desc').value.trim().toLowerCase());
                if(productDetails.length > 0){
                    document.getElementById('product_desc').parentElement.parentElement.dataset.details = JSON.stringify(productDetails[0])
                    document.getElementById('branchinventoryproductCode').value = productDetails[0].code.trim();
                    document.getElementById('branchinventoryAvailableQuantity').value = productDetails[0].quantity.trim();
                }else{
                    deliverNotification('Invalid Delatils', 'warning');
                }
            });
            document.getElementById('branchQuantity').addEventListener('input', () => {
                let available = Number(document.getElementById('branchinventoryAvailableQuantity').value);
                let inputQuantity = Number(document.getElementById('branchQuantity').value);
                if((available - inputQuantity) >= 0){
                    // document.getElementById('branchinventoryAvailableQuantity').value = (available - inputQuantity);
                }else{
                    deliverNotification('Branch Quantity ca\'t be above available quantity', 'warning');
                }

            });
            document.querySelector('.newrow .new-branch-inventory-product-inline-edit').addEventListener('click', () => {
                // removeElement('tr.newrow');
                let tr = document.querySelector('#branchinventorys_list tr.newrow');
                let inlineEdit = document.querySelector('#branchinventorys_list tr.newrow .new-branch-inventory-product-inline-edit');
                //////console.log(tr, inlineEdit);
                asignDataAfterEdit(tr, inlineEdit, "edit-data");
            });
            document.getElementById('newBranchInventoryProduct').children[0].textContent = 'close';
        }else{
            removeElement('tr.newrow');
            document.getElementById('newBranchInventoryProduct').children[0].textContent = 'add';
            getBranchInventory();
        }
    });
    // BRANCH FILTERS
    document.querySelector("#BranchInventorys .branchlimit").addEventListener('change', (e) => {
        getBranchInventory();
    });
    document.querySelector(".dash_branch_list").innerHTML = generateDropdown(site.branchList, 'name', 'id', 'Branch  ');
    document.querySelector(".dash_branch_list").addEventListener('change', ()=>{
        getBranchInventory();
    });
    // _________________________________GENERAL SEARCH_______________________________
    document.querySelector('.search-field').addEventListener('change', () => {
        // let searchValue = document.querySelector('.search-field').value;
        // search(searchValue);
        ////// //console.log(document.querySelector('.search-field').value);
    });
    document.querySelector('.search-bar').addEventListener('submit', (e) => {
        e.preventDefault()
        let searchValue = document.querySelector('.search-field').value;
        search(searchValue);
    })
    document.querySelector('.backup-btn').addEventListener('click', () => {
        //////console.log('we hear')
        res = run({'action': 'backUp'});
        res.always((data) => {
            //////console.log(data)
        })
    });
    document.getElementById('dollarRate').addEventListener('change', () => {
        data = {'rate': document.getElementById('dollarRate').value, 'action':'updateDollarRate'};
        //////console.log(data)
        res = run(data);
        res.always(details => {
            //////console.log(details)
            getDollarRate();
        });
    });
    document.getElementById('newpaymentType').addEventListener('click', () => {
        let newTr = `
                <tr class="newrow" data-id="200">
                    <td><label class="counter">0</label></td>
                    <td class="edit-data" data-name="payment_type_name"><label><input type="text" placeholder="Payment Method" id="payment_type_name"></label></td>
                    <td>
                        <label class="action" data-id="payment-name">
                            <span class="material-symbols-outlined primary new-payment-name-inline-edit">save_as</span>
                            <span class="material-symbols-outlined danger new-payment-name-inline-remove">close</span>
                        </label>
                    </td>
                </tr> 

            `;
        document.querySelector('#paymentType').insertAdjacentHTML('afterBegin', newTr);
        document.querySelector('.new-payment-name-inline-remove').addEventListener('click', () => {
            removeElement('tr.newrow');
        });

        document.querySelector('.new-payment-name-inline-edit').addEventListener('click', () => {
            // removeElement('tr.newrow');
            let tr = document.querySelector('#paymentType tr.newrow');
            let inlineEdit = document.querySelector('#paymentType tr.new-payment-name-inline-edit');
            // asignDataAfterEdit(tr, inlineEdit, "edit-data");
            data = {'paymentMethod': document.getElementById('payment_type_name').value, 'id': tr.dataset.id, 'action': 'addPaymentType'};
            res = run(data);
            res.always(details => {
                //////console.log(details);
                deliverNotification(details.message, details.response);
                autorun({'reload': true, 'action':'getPaymentTypes', 'name': 'paymentTypeList'});
                settingsInfo();
            });
                
        });
    });
});
const getDollarRate =() => {
    data = {'action':'getDollarRate'};
    res = run(data);
    res.always(details => {
        ////// //console.log(details)
        document.getElementById('dollarRate').value = details.rate;
    });
}
const search = (searchValue) => {
    page = document.querySelector('.page.active');
    //////console.log(page)
    let data = [];
    switch(page.id){
        case 'Dashboard':
            //////console.log(searchValue);
            document.getElementById(`branchinventorys_list`).after(preloader());
            data = {'search': searchValue, 'action':'searchBranchInventory'};
            res = run(data);
            res.always(details => {
                //////console.log(details)
                formPagination(details[1], 'branchinventory', details[1], 'arr');
                renderPageData(details, 'branchinventory');
                removeElement('div.preloader');
            });
        break;
        case 'Products':
            document.getElementById(`products_list`).after(preloader());
            data = {'search': searchValue, 'action':'searchProducts'};
            res = run(data);
            res.always(details => {
                //////console.log(details)
                formPagination(details[1], 'product', details[1], 'arr');
                renderPageData(details, 'product');
                removeElement('div.preloader');
            });
        break;
        case 'WarehouseInventorys':
            document.getElementById(`warehouseinventorys_list`).after(preloader());
            data = {'search': searchValue, 'action':'searchWarehouseInventory'};
            res = run(data);
            res.always(details => {
                //////console.log(details)
                formPagination(details[1], 'warehouseinventory', details[1], 'arr');
                renderPageData(details, 'warehouseinventory');
                removeElement('div.preloader');
            });
        break;
        case 'Sales':
            document.getElementById(`Sales`).after(preloader());
            data = {'search': searchValue, 'action':'getBranchesInvoices'};
            ////// //console.log(data) calculate
            res = run(data);
            res.always(details => {
                renderPageData(details, 'invoice');
                removeElement('div.preloader');
                
            });
        break;
    }
}
