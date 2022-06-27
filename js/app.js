
let res = null;
let site = {};
let limit = 15;

let page = 1;
let start = true;

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! navigation rende
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

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

// VALIABLE TO KEEP TRACK OF LOCAL DATA AVAILABILITY
// IT CONTAINTS SITE DATA KEYS 
// EACH KEY WILL BE COMPARED WITH SITE DATA KEYS
let expectedData = {
    'allbranchesinventoryproducts': 'branchinventoryproduct',
    'allbranchessaleinvoices': 'invoice',

};
/**
 * CHECK IF DATA IS AVAILABLE EVERY AFTER 1 SECONDS
 * IF AVAILABLE LOAD IT
 **/
setInterval(()=> {
    // LOOP THROUGH EXPECTED DATA OBJECT
    Object.keys(expectedData).forEach((expectedDataKey, index, expectedDataKeys) =>{
        // IF EXPECTED DATA HAS DATA LOAD THROUGH SITE DATA
        if(expectedDataKeys.length > 0){
            // CHECK EACH KEY IN SITE DATA, IF KEY EXITS DELETE IT FROM EXPECTED DATA
            Object.keys(site).forEach(siteDataKey => {
                if(siteDataKey == expectedDataKey){
                    delete expectedData[expectedDataKey];
                    // LOAD DATA FOUND IN LOCAL SITE DATA
                    setTimeout(()=> {
                        renderPageData(site[siteDataKey], siteDataKey);
                    }, 0);
                }
            }); 
        }
    });

    /**
     * CHECK FOR NEW SALE EVERY AFTER 0.00 MILLI SECONDS
     **/
 }, 0);

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
        tr.childNodes.forEach((td, index) => {
            if((index != 0) && (index % 2 != 0) && td.classList.contains(identifier)){  
                let data = (td.classList.contains('select-data')) ? '<input list="sels'+index+'" name="sel'+index+'"  value="'+ td.childNodes[0].textContent.trim()+'" id="sel'+index+'"><datalist id="sels'+index+'">'+optionDataIsolation(td)+'</datalist>':'<input type="text" value="' + td.childNodes[0].textContent.trim() + '" />';  
                tr.childNodes[index].childNodes[0].innerHTML = data;
            }
        });
        console.log(inlineEdit.parentElement.children[1])
        inlineEdit.classList.add('inProgress');
        inlineEdit.textContent = 'save_as';

        // ADD CLOSE BTN
        let closeBtn = `<span class="material-symbols-outlined danger  user-inline-delete">close</span>`;
        inlineEdit.parentElement.insertAdjacentHTML('beforeend', closeBtn);
        // CANCLE OPERATION IF CLOSE BTN IS CLICKE
        closeBtn = inlineEdit.parentElement.children[1];
        closeBtn.addEventListener('click', () => {
            tr.childNodes.forEach((td, index) => {
                if((index != 0) && (index % 2 != 0) && td.classList.contains(identifier)){  
                    let data = (td.childNodes[0].childNodes[0].value)
                    tr.childNodes[index].childNodes[0].textContent = data;  
                    
                }
            });
            inlineEdit.classList.remove('inProgress');
            inlineEdit.textContent = 'edit';
            removeElement('span.user-inline-delete')
        })
    }

    // GET TABLE DATA (td) IN THE INPUT FIELD AND ASIGN IT TO THE (td) ELEMENT AS TEXTCONTENT AFTER EDIT
    const asignDataAfterEdit = (tr, inlineEdit, identifier) => {
        let updateData = {}
        tr.childNodes.forEach((td, index) => {
            if((index != 0) && (index % 2 != 0) && td.classList.contains(identifier)){  
                let data = (td.childNodes[0].childNodes[0].value)
                /**
                 * COLLECT DATA AFTER EDITING GETING IDS 
                 * FOR DROP DOWN FIELDS INSTED OF THEIR NAMES/VALUES
                 */
                let dataReformatArr =td.classList.contains('select-data') ? site[td.classList[2]].filter(info => info.name == data) : [{'id': data}];
                // CHECK IF DATA WAS RECEIVED BACK IF NOT THE VALUE ENETERD WAS WRONG
                if (dataReformatArr.length == 1) {
                    updateData[td.dataset.name] = dataReformatArr[0].id;
                    // REASIGN DATA BACK TO TABLE ELEMENT TD IF THEIR ARA NO ERRORS
                    // tr.childNodes[index].childNodes[0].innerHTML = data;  
                }
                else{
                    deliverNotification('Invalid Delatils in ' + td.dataset.name + ' dropdown', 'warning');
                }
            }
        });
        // SAVE EDITED DATA
        saveInlineEditData(updateData, tr);
        inlineEdit.classList.remove('inProgress');
        inlineEdit.textContent = 'edit';
    }
    // SAVE DATA EDITED IN THE TABLE
    const saveInlineEditData = (data, tr) => {
        document.getElementById(tr.parentElement.id).append(preloader());
        // console.log(data)
        // console.log(tr.parentElement);
        // GET WHAT TABLE WE ARE EDITING AND SPECIFY VALUES
        switch(tr.parentElement.id){
            case 'users_list':
                data = {'data': data, 'id': tr.dataset.id, 'action': 'updateUser'};
                if(tr.classList.contains('newrow')){
                    data.action = 'addUser';
                    data.userImage = "default.png";
                }
                res = run(data);
                res.always(details => {
                    console.log(details)
                    removeElement('div.preloader');
                    deliverNotification(details.message, details.response);
                    getUserAccounts(); 

                });
                
            break;
        }
    }

    // RENDER DYNAMIC PAGE DATA
    const renderPageData = (data, identifier, start = -1) => {
        let dataArrayFormat = [];
        let itemContainer = "";
        let dataKeys = [];
        let counter = 0;
        let pageNo = "";
        let inlineEditBtns = "";
        let user_branch_id =  (site.session.user_type_id == 1) ? 0 : site.session.branch_id;
        switch(identifier){
            case 'allbranchessaleinvoices':
                // CALCULATE TOTAL SALES IN EACH BRACH AND OVERALL TOTAL
                setTimeout(calculateTotalSales(data, start), 0);
                // FOR DATA RESTRUCTURING
                initualStat = start;
                start = (start == -1) ? 0 : start;
                // TRACK IF REQUEST IS FROM PAGINATION
                // IF T IS ZERO (0) THEN THE REQUEST IS FROM DATABASE
                // IF NOT ITS FROM PEGINATION
                let t = start;
                // CHECK IF DATA IS FROM THE DATABASE
                // data = site.allbranchessaleinvoices;
                // console.log(start)
                // GET INVOICE POPULATION TYPE (EITHER PURCHASE DETAILS OR INVOICE)
                let listingType = document.querySelector('.listing_type').value;
                // INVOICE/SALE FILTERS
                let branch_list_filter = document.querySelector(".branch_list").value;
                let payment_type_list_filter = document.querySelector('.payment_type_list').value;
                let currency_list_filter = document.querySelector(".currency_list").value;
                let salelimit_filter = document.querySelector(".salelimit").value;
                // console.log(branch_list_filter, payment_type_list_filter, currency_list_filter, salelimit_filter)
                // POPULATE BRANCH INVOICE TABLE ROWS
                let branchInvoices = {};
                dataArrayFormat = [];
                itemContainer = (listingType == "invoice") ? document.getElementById('invoices_list') : document.getElementById('sales_list');
                itemContainer.innerHTML =``;
                if(listingType == "invoice"){
                    document.getElementById('sales_list').parentElement.classList.add("hide")
                    document.getElementById('invoices_list').parentElement.classList.remove('hide'); 
                }else{
                    document.getElementById('invoices_list').parentElement.classList.add("hide")
                    document.getElementById('sales_list').parentElement.classList.remove('hide'); 
                }
                removeElement('div.preloader');
                // ENFORCE DISPLAY LIMIT
                limit = Number(salelimit_filter);
                // console.log(data)
                if(user_branch_id != 0){
                    // MAKE BRANCH DROPDOWN UNCLICKABLE BY ATTENDANTS
                    document.querySelector(".branch_list").setAttribute('readonly',  'readonly');
                    document.querySelector(".branch_list").style.pointerEvents = 'none';
                    // GET BRANCH DATA
                    // IF DATA IS FROM PEGINATION THEIR IS NO NEED TO RESTRUCTURE IT AGAIN
                    if(initualStat == -1){
                        branchInvoices = data[user_branch_id];
                    }else{
                        branchInvoices = data;
                    }
                    if(Object.keys(branchInvoices).length > 0){
                        // GET BRANCH DATA KEYS GET THE LIMITED DATA 
                        // ENFORCE DISPLAY LIMIT
                        if(salelimit_filter != 'All') {
                            dataKeys = Object.keys(branchInvoices).slice(start, (limit + start));
                        }else{
                            dataKeys = Object.keys(branchInvoices).slice(start);
                        }
                        // LOOP THROUGH THE DATAKEYS TO RENDER DATA ASSOCIATED WITH THEM
                        dataKeys.forEach((infoKey, index, infoKeys) => {
                            if(
                                (Number(branchInvoices[infoKey].invoiceDetails[0].payment_type_id) == Number(payment_type_list_filter)) || 
                                (document.querySelector('.payment_type_list').options[document.querySelector('.payment_type_list').selectedIndex].text.includes('Method'))
                                ){
                                itemContainer.insertAdjacentHTML('beforeend', ((listingType == "invoice") ? invoiceTmp(branchInvoices[infoKey], index, start) : saleTmp(branchInvoices[infoKey], index, start)));
                                counter++;
                            }
                            start++;
                        });
                    }else{
                        itemContainer.innerHTML = "<tr><td colspan='10'><label class'warning'><center>Nothing found.</center></label></td></tr>";
                    }
                }else{
                    // IF DATA IS FROM PEGINATION THEIR IS NO NEED TO RESTRUCTURE IT AGAIN
                    if(initualStat == -1){
                        Object.keys(data).forEach((dataKey, index) =>{
                            Object.keys(data[dataKey]).forEach((innerDataKey, index) =>{
                                branchInvoices[innerDataKey] = data[dataKey][innerDataKey];
                            });
                        });
                    }else{
                        branchInvoices = data;
                    }
                    // GET BRANCH DATA KEYS GET THE LIMITED DATA 
                    // ENFORCE DISPLAY LIMIT
                    if(salelimit_filter != 'All') {
                        dataKeys = Object.keys(branchInvoices).slice(start, (limit + start));
                    }else{
                        dataKeys = Object.keys(branchInvoices).slice(start);
                    }
                    // console.log(dataKeys)
                    dataKeys.forEach((infoKey, index, infoKeys) => {
                        setTimeout(generateSaleExportTb(branchInvoices[infoKey]), 0);
                        if(
                            (Number(branchInvoices[infoKey].invoiceDetails[0].branch_id) == Number(branch_list_filter)) || 
                            (document.querySelector('.branch_list').options[document.querySelector('.branch_list').selectedIndex].text.includes('Branch')) ||
                            (document.querySelector('.branch_list').options[document.querySelector('.branch_list').selectedIndex].text.includes('All'))  
                            ){
                            if(
                                (Number(branchInvoices[infoKey].invoiceDetails[0].payment_type_id) == Number(payment_type_list_filter)) || 
                                (document.querySelector('.payment_type_list').options[document.querySelector('.payment_type_list').selectedIndex].text.includes('Method'))
                                ){

                                itemContainer.insertAdjacentHTML('beforeend', ((listingType == "invoice") ? invoiceTmp(branchInvoices[infoKey], index, start) : saleTmp(branchInvoices[infoKey], index, start)));
                                // console.log(start+1, start + Number(branchInvoices[infoKey].totalItems));
                                counter++;
                            }
                        }
                        // CHECK IF TABLE IS POPULATED IN ACODANCE WITH THE INVOICE
                        // IF ITS BY INVOICE INCREAMENT START BY ONE EACH REPEATITION
                        // IF ITS BY SALE/PURCHASE THEN INCREAMENT START BY THE NUMBER OF ITEMS ON THE INVOICE
                        // console.log(branchInvoices[infoKey].totalItems);
                        start = (listingType == "invoice") ? start+1 : start + Number(branchInvoices[infoKey].totalItems);
                    })
                }

                // MAKE INVOICE ACTION BUTTONS CLICKABLE
                tRowAction();
                if(t == 0){
                    generatePegination(branchInvoices, 'invoice', limit);
                }

                // console.log(branchInvoices);
                reveal('invoice');
            break;
            
            case 'user':
                let count = 1
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
                        templateString = `
                        <tr class="unrevealed userrevealer" data-id="${itemDetails.user_id}">
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
                                    <label for="upload-product-image" title="Click to choose new image to upload">
                                        <span class="material-symbols-outlined">cloud_sync</span>
                                        <input type="file" id="upload-product-image">
                                    </label>
                                </div>
                                <img src="./images/${itemDetails.image}" class="preview-image">
                            </td>
                            <td class="edit-data" data-name="telephone"><label>${itemDetails.telephone}</label></td>
                            <td class="edit-data select-data branchList" data-name="branch"><label>${itemDetails.branch}</label></td>
                            <td class="edit-data" data-name="address"><label>${itemDetails.address}</label></td>
                            <td class="edit-data" data-name="email"><label class="fixed-width">${itemDetails.email}</label></td>
                        </tr> 

                        `;
                        itemContainer.insertAdjacentHTML('beforeend', templateString);
                        count++;
                    });
                    inlineEditBtns = document.querySelectorAll('.userrevealer .inline-edit');
                    tableSingleItemEdit(inlineEditBtns, 'edit-data');
                    passwordUpdate(document.querySelectorAll('.userrevealer .update_psd'));

                }else{
                    templateString = `
                        <tr class="unrevealed userrevealer">
                            <td colspan='10'><label class="warning">nothing Found</label></td>
                        </tr>
                    `;
                    itemContainer.innerHTML = templateString;
                }
                reveal('user');

            break;
        }

    }
    const generatePegination = (data, item, limit = 15, dataType="obj", displayLinkNumber = 10) => {
        // console.log(data)
        let pages = 1;  
        let range = []; 
        let total = (dataType == 'obj') ? Object.keys(data).length : data.length;
        let peginationLink = document.querySelector(`.pagination_link.${item}-list_pagination`);
        if(total > limit){
            let page = Math.ceil(total/limit);
            pages = total & limit === 0 ? page : page + 1;
            range = [...Array(pages).keys()];
            console.log(total, range, peginationLink)

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
        console.log(item)
        let itemLinks = document.querySelectorAll(`.pagination_link.${item}-list_pagination span`);
        // console.log(limit)
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
                    console.log(typeof(data))
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

        // console.log(rate);
        // console.log(itemData);
        let tmp = `
            <tr class="unrevealed invoicerevealer">
                <td><label class="counter">${count+1}</label></td>
                <td class="invoice-data"><label>${itemData.branch}</label></td>
                <td>
                    <label class="action">
                        <span class="material-symbols-outlined primary inline-edit" data-id="31" data-tb="invoice" data-index="0">edit</span>
                        <span class="material-symbols-outlined warning inline-return" data-id="31" data-tb="invoice" data-index="0">sync</span>
                        <span class="material-symbols-outlined success showinvoicedetails-btn" data-id="31" data-tb="invoice" data-index="0">add</span>
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

        console.log(rate);

        let tmp = ``;
        itemData.invoiceDetails.forEach((invoiceProduct, index) => {
            count ++;
            tmp += `
            <tr class="unrevealed invoicerevealer">
                <td><label class="counter">${count}</label></td>
                <td class="invoice-data"><label class="sale-remarks">${invoiceProduct.remarks}</label></td>
                <td>
                    <label class="action">
                        <span class="material-symbols-outlined primary inline-edit" data-id="31" data-tb="invoice" data-index="0">edit</span>
                        <span class="material-symbols-outlined warning inline-return" data-id="31" data-tb="invoice" data-index="0">sync</span>
                        <span class="material-symbols-outlined success showinvoicedetails-btn" data-id="31" data-tb="invoice" data-index="0">add</span>
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
            console.log(typeof(itemData))
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
        let actionBtnsParent = document.querySelectorAll(".userrevealer td label.action");
        // console.log(actionBtnsParent);
        // actionBtnsParent.forEach(actionBtn => {
        //     for (var i = actionBtn.children.length - 1; i >= 0; i--) {
        //         // console.log(actionBtn.children[i]);
        //         let btn = actionBtn.children[i];
        //         btn.addEventListener('click', (e) => {
        //             let tr = actionBtn.parentElement.parentElement.parentElement.children;
        //             let clickedTr = actionBtn.parentElement.parentElement;
        //             // REMOVE ACTIVE CLASS FROM ALL THE TABLE ROWS
        //             for (var x = tr.length - 1; x >= 0; x--) {
        //                 tr[x].classList.remove('active');
        //                 tr[x].style.top = `0px`
        //                 // MOVE THE NEXT/PREVIOUS TABLE ROW BY THE HEIGHT OF THE EXPANDED ROW
        //                if(tr[x] == clickedTr){
        //                     clickedTr.style.top = `-${x * Number(clickedTr.offsetHeight)}px`
        //                     console.log(clickedTr.offsetHeight);
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
        //         })
        //     }

        // });
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
        // IF DATA IS NEW (-1 START MEANS ITS NEW CHUCK OF DATA WHILE 0 MEANS ITS FROM PAGINATION)
        if((start == -1)){
            let payment_type_list_filter = document.querySelector('.payment_type_list').value;

            let totalSum = 0;
            // USE BRANCH IDS AS KEYS
            // OBJECT TO HOLD BRANCH IDS AND THEIR TOTAL SALES
            let branchTotal = {};
            let branchInvoices = {};
            // console.log(data)
            // data = (start == -1) ? data : site.allbranchessaleinvoices;
            site.branchList.forEach(branch => {
                // IF BRANCH DOESN'T EQUAL TO ALL
                if(branch.id != 5){
                    branchTotal[branch.id] = 0; // EXAMPLE OF EXPECTED OUT PUT{'1' : 0,'2' : 0,'3':0}
                    branchInvoices = data[branch.id];
                    if(Object.keys(data[branch.id]).length > 0){
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
            for (var i = Object.keys(branchTotal).length - 1; i >= 0; i--) {
                branch_id = (i+1);
                branchInfo = site.branchList.filter(branch => Number(branch.id) == branch_id);
                if(branchInfo.length > 0){
                    cards +=`
                    <div class="card ${branch_id == site.session.branch_id ? 'active' : ''} ">
                        <span class="material-symbols-outlined">shopping_bag</span>
                        <div class="stat-details branch_income">
                            <h2>${(currency_list_filter == '$') ? addComma(convertToDallar(Number(branchTotal[branch_id]), Number(rate)).toString()) + "$" : addComma(branchTotal[branch_id].toString()) + '/='}</h2>
                            <label>${branchInfo[0].name}</label>
                        </div>
                    </div>
                    `;
                }
            }
            // ADD ALL BRANCH TOTAL SUM SALE CARD
            cards +=`
                    <div class="card">
                        <span class="material-symbols-outlined">attach_money</span>
                        <div class="stat-details">
                            <h2 id="totalIncome">${(currency_list_filter == '$') ? addComma(convertToDallar(Number(totalSum), Number(rate)).toString()) + "$" : addComma(totalSum.toString())+'/='} <small></small></h2>
                            <label>Total Income</label>
                        </div>
                    </div>
                    `;
            document.querySelector('#Sales .cards').innerHTML = cards;
        }

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

    const getTodayInvoice = () => {
        document.getElementById(`invoices_list`).after(preloader());
        let identifier = 'invoice';
        let limitShow = document.querySelector('#Sales .salelimit').value;            
        let data ={'reload': true, 'sdate': today, 'edate': today, 'action':'getBranchesInvoices', 'name': 'allbranchessaleinvoices'};
        // IF USERTYPE IS ATTENDANT ASSIGN ATTENDANT BRACH ID
        if(site.session.user_type_id == 2){
            data.branch_id = site.session.branch_id;
        }
        // console.log(data) calculate
        res = run(data);
        res.always(details => {
            // console.log(details)
            if(!site.allbranchessaleinvoices){
                site.allbranchessaleinvoices = {};
            }
            // removeElement('div.preloader');
            if(site.session.user_type_id == 2){
                // UPDATE BRANCH SITE DATA WITH THE RECEIVED DATA
                site.allbranchessaleinvoices[site.session.branch_id] = convertToObject(details);
            }else{
                console.log(details)
                site.branchList.forEach(branch => {
                    site.allbranchessaleinvoices[branch.id] = convertToObject(details.filter(branchInvoicesList  => Number(branchInvoicesList.branch_id) ==  Number(branch.id)));
                });
            }
            updateSiteData(site);
            // UPDATE DATA CHECKER VARIABLE
            expectedData.allbranchessaleinvoices = 'invoice';
        });
    }
    const getInvoiceByDate = () => {
        document.getElementById(`invoices_list`).after(preloader());
        let startdate = document.getElementById('startdate').value;
        let enddate = document.getElementById('enddate').value;
        let identifier = 'invoice';
        let limitShow = document.querySelector('#Sales .salelimit').value;            
        let data ={'reload': true, 'sdate': startdate, 'edate': enddate, 'action':'getBranchesInvoices', 'name': 'allbranchessaleinvoices'};
        // IF USERTYPE IS ATTENDANT ASSIGN ATTENDANT BRACH ID
        if(site.session.user_type_id == 2){
            data.branch_id = site.session.branch_id;
        }
        // console.log(data) calculate
        res = run(data);
        res.always(details => {
            // console.log(details)
            if(!site.searchResult){
                site.searchResult = {};
            }
            // removeElement('div.preloader');
            if(site.session.user_type_id == 2){
                // UPDATE BRANCH SITE DATA WITH THE RECEIVED DATA
                site.searchResult[site.session.branch_id] = convertToObject(details);
            }else{
                // console.log(details)
                site.branchList.forEach(branch => {
                    site.searchResult[branch.id] = convertToObject(details.filter(branchInvoicesList  => Number(branchInvoicesList.branch_id) ==  Number(branch.id)));
                });
            }
            renderPageData(site.searchResult, 'allbranchessaleinvoices');

        });
    }
    const getUserAccounts = (page = 1) => {
        document.getElementById(`users_list`).after(preloader());
        let limitShow = document.querySelector('#Accounts .userlimit').value//(document.querySelector('#Accounts .userlimit').value != "All") ? 
        // : 15;
        let data = {'limit': limitShow,'action':'getLimitedUsers', 'page': page};
        data.action = (document.querySelector('#Accounts .userlimit').value != "All") ? 'getLimitedUsers': 'getAllUsers';
        // console.log(limitShow)
        res = run(data);
        res.always(details => {
            // console.log(details)
            removeElement('div.preloader');
            formPagination(details[1], 'user', Number(limitShow), 'arr');
            renderPageData(details, 'user');
        });
    }
    const passwordUpdate = (psdTds) => {
        psdTds.forEach(td => td.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // console.log(td);
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
                // console.log(tdData)
            });
            // UPDATE PASSWORD
            document.querySelector('#updatePassword').addEventListener('submit', (e) => {
                e.preventDefault();
                let newPass = document.querySelector('#updatePassword input').value;
                let data = {'id': td.parentElement.dataset.id,'action':'updateUserPassword', 'password': newPass};
                res = run(data);
                res.always((details) => {
                    console.log(details)
                    deliverNotification(details.message, details.response);
                    td.innerHTML = "";
                    td.append(tdData);

                })
            })
        }));

    }
    const formPagination = (total, item, limit = 15, dataType="obj", displayLinkNumber = 10) => {
        // console.log(data)
        let pages = 1;  
        let range = []; 
        // let total = (dataType == 'obj') ? Object.keys(data).length : data.length;
        let peginationLink = document.querySelector(`.pagination_link.${item}-list_pagination`);
        if(total > limit){
            let page = Math.ceil(total/limit);
            pages = total & limit === 0 ? page : page + 1;
            range = [...Array(pages).keys()];
            // console.log(total, range, peginationLink)

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
        // console.log(item)
        let itemLinks = document.querySelectorAll(`.pagination_link.${item}-list_pagination span`);
        // console.log(limit)
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
        // console.log(obj);
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
                    // console.log(details)
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
        // console.log(options)
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
document.addEventListener('DOMContentLoaded', () => {
    // console.log(localStorageSize())
    document.getElementById('startdate').value = today;  
    document.getElementById('enddate').value = today;  
    getInvoiceByDate(); 
    getUserAccounts();

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
    document.querySelector('.listing_type').addEventListener('change', () => {
        document.getElementById(`sales_list`).parentElement.after(preloader());
        let data = (Object.keys(site.searchResult).length > 0) ? site.searchResult : site.allbranchessaleinvoices; 
        renderPageData(data, document.querySelector(`.pagination_link.invoice-list_pagination`).dataset.id);
    });
    document.querySelector(".branch_list").innerHTML = generateDropdown(site.branchList, 'name', 'id', 'Branch  ');
    document.querySelector('.payment_type_list').innerHTML = generateDropdown(site.paymentTypeList, 'name', 'id', 'Method  ');
    document.querySelector(".currency_list").innerHTML = generateDropdown(site.currencyList, 'name', 'symbol', 'Currency  ');
    document.querySelector(".branch_list").addEventListener('change', ()=>{
        document.getElementById(`sales_list`).parentElement.after(preloader());
        let data = (Object.keys(site.searchResult).length > 0) ? site.searchResult : site.allbranchessaleinvoices; 
        renderPageData(data, document.querySelector(`.pagination_link.invoice-list_pagination`).dataset.id);
    });
    document.querySelector('.payment_type_list').addEventListener('change', ()=>{
        document.getElementById(`sales_list`).parentElement.after(preloader());
        let data = (Object.keys(site.searchResult).length > 0) ? site.searchResult : site.allbranchessaleinvoices; 
        renderPageData(data, document.querySelector(`.pagination_link.invoice-list_pagination`).dataset.id);
    });
    document.querySelector(".currency_list").addEventListener('change', ()=>{
        document.getElementById(`sales_list`).parentElement.after(preloader());
        let data = (Object.keys(site.searchResult).length > 0) ? site.searchResult : site.allbranchessaleinvoices; 
        renderPageData(data, document.querySelector(`.pagination_link.invoice-list_pagination`).dataset.id);
    });
    document.querySelector(".salelimit").addEventListener('change', () => {
        document.getElementById(`sales_list`).parentElement.after(preloader());
        let data = (Object.keys(site.searchResult).length > 0) ? site.searchResult : site.allbranchessaleinvoices; 
        renderPageData(data, document.querySelector(`.pagination_link.invoice-list_pagination`).dataset.id);
    });

    // EXPORT SELD PRODUCT LIST OT EXCEL FILE generateC
    if(site.session.user_type_id == 1){
        document.getElementById('export_sales').addEventListener('click', (e) => {
            console.log('we here')
            let table = document.getElementById('sale_export_tb');
            let csv_name = "lifestyle Sales as of " + today;
            let download_link = document.getElementById('export_sales');
            export_table_to_csv (table, csv_name, download_link);
        });
    }   

    // _______________________________USER________________________________
    document.getElementById('newUser').addEventListener('click', () => {
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
        document.querySelector('.newrow .new-user-inline-delete').addEventListener('click', () => {
            removeElement('tr.newrow');
        });
        document.querySelector('.newrow .new-user-inline-edit').addEventListener('click', () => {
            // removeElement('tr.newrow');
            let tr = document.querySelector('#users_list tr.newrow');
            let inlineEdit = document.querySelector('#users_list tr.newrow .new-user-inline-edit');
            asignDataAfterEdit(tr, inlineEdit, "edit-data");
        });
    });
    // USER FILTERS
    document.querySelector("#Accounts .userlimit").addEventListener('change', (e) => {
        getUserAccounts()
    });

});
