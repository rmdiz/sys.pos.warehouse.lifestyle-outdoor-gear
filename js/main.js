// GENERAL VARIABLES
let res = null;
let site = {};
let limit = 15;
let page = 1;
let start = true;

let navLinks = document.querySelectorAll('.nav-link');
const searchBar = document.getElementById('nav-search');
let searchForm = document.querySelector('.search-bar');

// GET TODAY'S DATE
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! navigation make-transaction
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

// CHECK IF USER IS LOGGED IN EVERAY AFTER 5 SECOUNDS
setInterval( () => {
    if(!localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')){
        window.location.href = './signin.html';
    }
}, 5000); 
// CHECK IF USER IS LOGED IN
if(!localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')){
    window.location.href = './signin.html';
}else if(!JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')).session){
    window.location.href = './signin.html';
}else if(Number(JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')).session.user_type_id) > 2){
    window.location.href = './signin.html';
}
// GET LOCAL DATA
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
    /**
     * CHECK FOR NEW SALE EVERY AFTER 0.00 MILLI SECONDS
     **/
    let totalDialySale = "00";
    // if(site.allbranchessaleinvoices){
    //     let user_branch_id =  (site.session.user_type_id == 1) ? 0 : site.session.branch_id;
    //     let data = site.allbranchessaleinvoices;
    //     let branchSales = {};
    //     if(user_branch_id != 0){
    //         branchSales = data[user_branch_id];
    //     }else{
    //         Object.keys(data).forEach((dataKey, index) =>{
    //             Object.keys(data[dataKey]).forEach((innerDataKey, index) =>{
    //                 branchSales[innerDataKey] = data[dataKey][innerDataKey];
    //             });
    //         });
    //     }
    //     // console.log(branchSales)
    //     totalDialySale = Object.keys(branchSales).length;
    // }
    document.getElementById('todaySales').textContent = totalDialySale;
 }, 0);

/**
 * SYSTEM FUNCTIONS A-Z
 **/
    
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
                    let rqtPage = Number(paginationLink.textContent);
                    switch(item){
                        case 'branchinventoryproduct':
                            getBranchInventory(rqtPage); 
                        break;
                    }
            }
        }));
    }
    // UPDATE SITE DATA
    const updateSiteData = (data) => {
        localStorage.setItem('sys.pos.warehouse.lifestyle-outdoor-gear', JSON.stringify(data));
        site = JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear'));
    }
    // RENDER DYNAMIC PAGE DATA

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
            case 'branchinventoryproduct':
                console.log(data)
                if(data[1] != data[0].length){
                    let paginationLink = (!document.querySelector('.branchinventoryproduct-list_pagination span.active')) ? document.querySelectorAll('.branchinventoryproduct-list_pagination span')[document.querySelectorAll('.branchinventoryproduct-list_pagination span').length - 2].textContent : document.querySelector('.branchinventoryproduct-list_pagination span.active').textContent;
                    pageNo = Number(paginationLink);
                    let displayed = (limit * (pageNo - 1));
                    count = displayed + 1;
                }
                itemContainer = document.getElementById('branchinventoryproducts_list');
                itemContainer.innerHTML = "";
                let templateString = '';
                data = data[0];
                if(data.length > 0){
                    data.forEach((itemDetails, index) => {
                        templateString = productTmp(itemDetails, index);
                        itemContainer.insertAdjacentHTML('beforeend', templateString);
                        count++;
                    });

                    // MAKE PRODUCT ITEMS CLICKABLE
                    showItemDetails();
                }else{
                    templateString = `
                        <tr class="unrevealed branchinventoryrevealer">
                            <td colspan='10'><label class="warning">nothing Found</label></td>
                        </tr>
                    `;
                    itemContainer.innerHTML = templateString;
                }
                // reveal('branchinventoryproduct');

            break;
        }
    }
    // const renderPageData = (data, identifier, start = 0) => {
    //     let dataArrayFormat = [];
    //     let itemContainer = "";
    //     let dataKeys = [];
    //     let counter = 0;

    //     let user_branch_id =  (site.session.user_type_id == 1) ? 0 : site.session.branch_id;
    //     switch(identifier){
    //         case 'allbranchesinventoryproducts':
    //             data = site.allbranchesinventoryproducts;
    //             let branchInventoryProducts = {};
    //             dataArrayFormat = [];
    //             itemContainer = document.getElementById('branchinventoryproducts_list');
    //             itemContainer.innerHTML ="";
    //             // LIMIT
    //             let homelimit = document.querySelector('.homelimit').value;
    //             limit = Number(homelimit);
    //             if(user_branch_id != 0){
    //                 branchInventoryProducts = data[user_branch_id];
    //                 // GET BRANCH DATA KEYS GET THE LIMITED DATA 
    //                 // ENFORCE DISPLAY LIMIT
    //                 if(homelimit != 'All') {
    //                     dataKeys = Object.keys(branchInventoryProducts).slice(start, (limit + start));
    //                 }else{
    //                     dataKeys = Object.keys(branchInventoryProducts).slice(start);
    //                 }
    //                 dataKeys.forEach((infoKey, index, infoKeys) => {
    //                     itemContainer.insertAdjacentHTML('beforeend', productTmp(branchInventoryProducts[infoKey], index));
    //                 });
    //             }else{
    //                 Object.keys(data).forEach((dataKey, index) =>{
    //                     Object.keys(data[dataKey]).forEach((innerDataKey, index) =>{
    //                         branchInventoryProducts[innerDataKey] = data[dataKey][innerDataKey];
    //                         // itemContainer.insertAdjacentHTML('beforeend', productTmp(branchInventoryProducts[innerDataKey], index));
    //                     });
    //                 });
    //                 // GET BRANCH DATA KEYS GET THE LIMITED DATA 
    //                 // ENFORCE DISPLAY LIMIT
    //                 if(homelimit != 'All') {
    //                     dataKeys = Object.keys(branchInventoryProducts).slice(start, (limit + start));
    //                 }else{
    //                     dataKeys = Object.keys(branchInventoryProducts).slice(start);
    //                 }
    //                 dataKeys.forEach((infoKey, index, infoKeys) => {
    //                     itemContainer.insertAdjacentHTML('beforeend', productTmp(branchInventoryProducts[infoKey], index));
    //                 });
    //             }
    //             // MAKE PRODUCT ITEMS CLICKABLE
    //             showItemDetails();
    //             if(start == 0){
    //                 generatePegination(branchInventoryProducts, 'branchinventoryproduct', limit);
    //             }

    //             // console.log(branchInventoryProducts);
    //         break;
    //         case 'allbranchessaleinvoices':
    //             // TRACK IF REQUEST IS FROM PAGINATION
    //             // IF T IS ZERO (0) THEN THE REQUEST IS FROM DATABASE
    //             // IF NOT ITS FROM PEGINATION
    //             let t = start;
    //             // CHECK IF DATA IS FROM THE DATABASE
    //             // data = site.allbranchessaleinvoices;

    //             // CALCULATE TOTAL SALES IN EACH BRACH AND OVERALL TOTAL
    //             // setTimeout(calculateTotalSales(data, start), 0);
    //             // GET INVOICE POPULATION TYPE (EITHER PURCHASE DETAILS OR INVOICE)
    //             let listingType = document.querySelector('.listing_type').value;
    //             // INVOICE/SALE FILTERS
    //             let branch_list_filter = document.querySelector(".branch_list").value;
    //             let payment_type_list_filter = document.querySelector('.payment_type_list').value;
    //             let currency_list_filter = document.querySelector(".currency_list").value;
    //             let salelimit_filter = document.querySelector(".salelimit").value;
    //             // console.log(branch_list_filter, payment_type_list_filter, currency_list_filter, salelimit_filter)
    //             // POPULATE BRANCH INVOICE TABLE ROWS
    //             let branchInvoices = {};
    //             dataArrayFormat = [];
    //             itemContainer = (listingType == "invoice") ? document.getElementById('invoices_list') : document.getElementById('sales_list');
    //             itemContainer.innerHTML =``;
    //             if(listingType == "invoice"){
    //                 document.getElementById('sales_list').parentElement.classList.add("hide")
    //                 document.getElementById('invoices_list').parentElement.classList.remove('hide'); 
    //             }else{
    //                 document.getElementById('invoices_list').parentElement.classList.add("hide")
    //                 document.getElementById('sales_list').parentElement.classList.remove('hide'); 
    //             }
    //             removeElement('div.preloader');
    //             // ENFORCE DISPLAY LIMIT
    //             // console.log(salelimit_filter)
    //             limit = Number(salelimit_filter);
    //             if(user_branch_id != 0){
    //                 // MAKE BRANCH DROPDOWN UNCLICKABLE BY ATTENDANTS
    //                 document.querySelector(".branch_list").setAttribute('readonly',  'readonly');
    //                 document.querySelector(".branch_list").style.pointerEvents = 'none';
    //                 // GET BRANCH DATA
    //                 branchInvoices = data[user_branch_id];
    //                 if(Object.keys(branchInvoices).length > 0){
    //                     // GET BRANCH DATA KEYS GET THE LIMITED DATA 
    //                     // ENFORCE DISPLAY LIMIT
    //                     if(salelimit_filter != 'All') {
    //                         dataKeys = Object.keys(branchInvoices).slice(start, (limit + start));
    //                     }else{
    //                         dataKeys = Object.keys(branchInvoices).slice(start);
    //                     }
    //                     // LOOP THROUGH THE DATAKEYS TO RENDER DATA ASSOCIATED WITH THEM
    //                     dataKeys.forEach((infoKey, index, infoKeys) => {
    //                         if(
    //                             (Number(branchInvoices[infoKey].invoiceDetails[0].payment_type_id) == Number(payment_type_list_filter)) || 
    //                             (document.querySelector('.payment_type_list').options[document.querySelector('.payment_type_list').selectedIndex].text.includes('Method'))
    //                             ){
    //                             itemContainer.insertAdjacentHTML('beforeend', ((listingType == "invoice") ? invoiceTmp(branchInvoices[infoKey], index, start) : saleTmp(branchInvoices[infoKey], index, start)));
    //                             counter++;
    //                         }
    //                         start++;
    //                     });
    //                 }else{
    //                     itemContainer.innerHTML = "<tr><td colspan='10'><label class'warning'><center>Nothing found.</center></label></td></tr>";
    //                 }
    //             }else{
    //                 Object.keys(data).forEach((dataKey, index) =>{
    //                     Object.keys(data[dataKey]).forEach((innerDataKey, index) =>{
    //                         branchInvoices[innerDataKey] = data[dataKey][innerDataKey];
    //                     });
    //                 });
    //                 // GET BRANCH DATA KEYS GET THE LIMITED DATA 
    //                 // ENFORCE DISPLAY LIMIT
    //                 if(salelimit_filter != 'All') {
    //                     dataKeys = Object.keys(branchInvoices).slice(start, (limit + start));
    //                 }else{
    //                     dataKeys = Object.keys(branchInvoices).slice(start);
    //                 }
    //                 dataKeys.forEach((infoKey, index, infoKeys) => {
    //                     setTimeout(generateSaleExportTb(branchInvoices[infoKey]), 0);
    //                     if(
    //                         (Number(branchInvoices[infoKey].invoiceDetails[0].branch_id) == Number(branch_list_filter)) || 
    //                         (document.querySelector('.branch_list').options[document.querySelector('.branch_list').selectedIndex].text.includes('Branch')) ||
    //                         (document.querySelector('.branch_list').options[document.querySelector('.branch_list').selectedIndex].text.includes('All'))  
    //                         ){
    //                         if(
    //                             (Number(branchInvoices[infoKey].invoiceDetails[0].payment_type_id) == Number(payment_type_list_filter)) || 
    //                             (document.querySelector('.payment_type_list').options[document.querySelector('.payment_type_list').selectedIndex].text.includes('Method'))
    //                             ){

    //                             itemContainer.insertAdjacentHTML('beforeend', ((listingType == "invoice") ? invoiceTmp(branchInvoices[infoKey], index, start) : saleTmp(branchInvoices[infoKey], index, start)));
    //                             console.log(start+1, start + Number(branchInvoices[infoKey].totalItems));
    //                             counter++;
    //                         }
    //                     }
    //                     // CHECK IF TABLE IS POPULATED IN ACODANCE WITH THE INVOICE
    //                     // IF ITS BY INVOICE INCREAMENT START BY ONE EACH REPEATITION
    //                     // IF ITS BY SALE/PURCHASE THEN INCREAMENT START BY THE NUMBER OF ITEMS ON THE INVOICE
    //                     console.log(branchInvoices[infoKey].totalItems);
    //                     start = (listingType == "invoice") ? start+1 : start + Number(branchInvoices[infoKey].totalItems);
    //                     // console.log(branchInvoices[innerDataKey].invoiceDetails[0].payment_type_id)
    //                     // console.log(branchInvoices[innerDataKey].invoiceDetails[0].currency)
    //                     // console.log(branchInvoices[innerDataKey].invoiceDetails[0])
    //                     // itemContainer.insertAdjacentHTML('beforeend', ((listingType == "invoice") ? invoiceTmp(branchInvoices[innerDataKey], index, count) : saleTmp(branchInvoices[innerDataKey], index, count)));
    //                 })
    //             }

    //             // MAKE INVOICE ACTION BUTTONS CLICKABLE
    //             tRowAction();
    //             if(t == 0){
    //                 generatePegination(branchInvoices, 'invoice', limit);
    //             }

    //             // console.log(branchInvoices);
    //             reveal('invoice');
    //         break;
    //     }

    // }
    const productTmp = (itemData, index)=>{
        let firstItemDetails = itemData.product_sizes[0]
        let tmp = `
            <div class="product" data-page="1">
                <a class="list-item" data-details="item-identifier-${firstItemDetails.branch_inventory_id}" href="#header" data-item-colors='${JSON.stringify(itemData.product_colors)}'>
                    <div class="list-image">
                        <img src="./images/${firstItemDetails.image}">
                    </div>
                    <h2>${firstItemDetails.sale_price} <small>/=</small></h2>
                    <span class="product-name" data-product-category="Pants" data-product-brand="${firstItemDetails.brand_name}">${firstItemDetails.name}</span>
                    <small class="brand-name" data-product-brand="${firstItemDetails.brand_name}">${firstItemDetails.brand_name}(brand)</small>
                </a>
                <div class="item-details" id="item-identifier-${firstItemDetails.branch_inventory_id}">
                    <div class="item-box">
                        <div class="title">
                            <h3>${firstItemDetails.name}</h3>
                            <span data-pg="home" data-pgno="0" class="material-icons-outlined hide nav-link ">close</span>
                        </div>
                        <div class="list-item item-besic-info">
                            <div class="item-image">
                                <img src="./images/${firstItemDetails.image}">
                            </div>
                            <h2>${firstItemDetails.sale_price} <small>/=</small></h2>
                        </div>
                        <div class="class-secondery-info">
                            <span>${firstItemDetails.code}</span>
                            <span class="details_title">
                                <b>Select Colour</b>
                                <small>${itemData.product_colors.length} Available Colour(s)</small>
                            </span>
                            <div class="color_list">
                                ${generateProductColor(itemData.product_colors, firstItemDetails.colour_name)}
                            </div>
                            <span class="details_title">
                                <b>Select Size</b>
                                <small class="size-qty">${itemData.product_sizes.length} Available Sizes(s)</small>
                            </span>
                            <div class="size_list">
                                ${generateProductColorSizes(itemData.product_colors, firstItemDetails.colour_name, firstItemDetails.innitual)}
                            </div>
                            <div class="cart_quantity_adjuster">
                                <b>Quantity</b>
                                <label>
                                    <span class="material-icons-outlined">remove</span>
                                    <input type="text" value="1" disabled="disabled" class="modified_quantity cart_modified_quantity" data-available-quantity="${firstItemDetails.quantity}">
                                    <span class="material-icons-outlined">add</span>
                                </label>
                            </div>
                            <span>Description</span>
                            <p>${firstItemDetails.desc}</p>
                            <button data-inventory_id="${firstItemDetails.branch_inventory_id}" id="add_cart${firstItemDetails.branch_inventory_id}">
                                <b>Add To Bag</b>
                                <span class="material-icons-outlined">shopping_bag</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return tmp;
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
                        <span class="material-icons-outlined primary inline-edit" data-id="31" data-tb="invoice" data-index="0">edit</span>
                        <span class="material-icons-outlined warning inline-return" data-id="31" data-tb="invoice" data-index="0">sync</span>
                        <span class="material-icons-outlined success showinvoicedetails-btn" data-id="31" data-tb="invoice" data-index="0">add</span>
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
                        <span class="material-icons-outlined primary inline-edit" data-id="31" data-tb="invoice" data-index="0">edit</span>
                        <span class="material-icons-outlined warning inline-return" data-id="31" data-tb="invoice" data-index="0">sync</span>
                        <span class="material-icons-outlined success showinvoicedetails-btn" data-id="31" data-tb="invoice" data-index="0">add</span>
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
    const convertToDallar = (price, rate) => {
        return  (((Math.round(((Number(price)/rate) + Number.EPSILON)) * 100) / 100 ));
    }
    const tRowAction =() => {
        let actionBtnsParent = document.querySelectorAll("td label.action");
        // console.log(actionBtnsParent);
        actionBtnsParent.forEach(actionBtn => {
            for (var i = actionBtn.children.length - 1; i >= 0; i--) {
                // console.log(actionBtn.children[i]);
                let btn = actionBtn.children[i];
                btn.addEventListener('click', (e) => {
                    let tr = actionBtn.parentElement.parentElement.parentElement.children;
                    let clickedTr = actionBtn.parentElement.parentElement;
                    // REMOVE ACTIVE CLASS FROM ALL THE TABLE ROWS
                    for (var x = tr.length - 1; x >= 0; x--) {
                        tr[x].classList.remove('active');
                        tr[x].style.top = `0px`
                        // MOVE THE NEXT/PREVIOUS TABLE ROW BY THE HEIGHT OF THE EXPANDED ROW
                       if(tr[x] == clickedTr){
                            clickedTr.style.top = `-${x * Number(clickedTr.offsetHeight)}px`
                            console.log(clickedTr.offsetHeight);
                       }else{
                            tr[x].children[2].children[0].children[2].textContent = 'add';
                       }
                    }
                    if(btn.textContent == 'add'){
                        btn.textContent = "remove";
                        // ADD ACTIVE CLOSE TO THE PARENT OF THE CLICK ELEMENT
                        clickedTr.classList.add('active');

                        // MOVE ELEMENT TO THE TOP
                        scrollToTop();
                    }else{
                        btn.textContent = "add";
                        clickedTr.style.top = `0px`
                    }
                })
            }

        })
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
        console.log(data)
        // data = (start == 0) ? data : site.allbranchessaleinvoices;
        site.branchList.forEach(branch => {
            // IF BRANCH DOESN'T EQUAL TO ALL
            if(branch.id != 5){
                branchTotal[branch.id] = 0; // EXAMPLE OF EXPECTED OUT PUT{'1' : 0,'2' : 0,'3':0}
                branchInvoices = data[branch.id];
                // console.log(data[branch.id])
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
                        })

                    }
                });
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
        document.querySelector('#sales .cards').innerHTML = "";
        let cards = "";
        let branchInfo = [];
        let branch_id = 0;
        for (var i = Object.keys(branchTotal).length - 1; i >= 0; i--) {
            branch_id = (i+1);
            branchInfo = site.branchList.filter(branch => Number(branch.id) == branch_id);
            if(branchInfo.length > 0){
                cards +=`
                <div class="card ${branch_id == site.session.branch_id ? 'active' : ''} ">
                    <span class="material-icons-outlined">shopping_bag</span>
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
                    <span class="material-icons-outlined">attach_money</span>
                    <div class="stat-details">
                        <h2 id="totalIncome">${(currency_list_filter == '$') ? addComma(convertToDallar(Number(totalSum), Number(rate)).toString()) + "$" : addComma(totalSum.toString())+'/='} <small></small></h2>
                        <label>Total Income</label>
                    </div>
                </div>
                `;
        document.querySelector('#sales .cards').innerHTML = cards;

        // console.log(branchInfo)
        // console.log(cards)
        // Object.keys(branchTotal).length
        // console.log(totalSum)
        // console.log(branchTotal)
    }
    const generateProductColor = (data, colour_name) => {
        let templateString = '';
        if(data.length > 0){
            data.forEach(itemDetails => {
                templateString += `
                    <label data-color-sizes='${JSON.stringify(itemDetails.color_products_sizes)}' class="${(itemDetails.colour_name == colour_name) ? ' active' : ''}">${itemDetails.colour_name}<small>${itemDetails.color_products_sizes.length}</small></label>
                `;
            });
        }
        return templateString;
    }
    const generateProductColorSizes = (productColors, colour_name, size_innitual) => {
        let data = productColors.filter(productColor => (productColor.colour_name == colour_name));
        
        let templateString = '';
        if(data.length > 0){
            data = data[0].color_products_sizes;
            data.forEach(itemDetails => {
                templateString += `
                    <label data-size-details='${JSON.stringify(itemDetails)}' data-size-quantity='${itemDetails.quantity}' class="${(itemDetails.innitual == size_innitual) ? ' active' : ''}">${itemDetails.innitual}<small>${itemDetails.quantity}</small></label>
                `;
            });
        }
        return templateString;
    }
    const showItemDetails =() => {
        const itemDetailslinks = document.querySelectorAll(`a.list-item`);
        itemDetailslinks.forEach(link => {
            displayItemDetails(link.parentElement);

            addClickToColor(link);
            addClickToSize(link);
            adjustQuantity(link);
            addToCart(link);
        });
    }
    function displayItemDetails(link) {
        // SHOW PRODUCT DETAILS
        link.children[0].addEventListener('click', (e) => {
            // console.log(link.children[1])

            // e.preventDefault();
             // link.children[0].href = `#${link.children[0].dataset.details}`;
            (link.children[1].classList.contains('show')) ? link.children[1].classList.remove('show'):link.children[1].classList.add('show');
        });
        // CLOSE PRODUCT DETAILS
        let closeBtn = document.querySelector(`#${link.children[0].dataset.details} .item-box .title span.hide`)
        closeBtn.addEventListener('click', (e) => {
            // e.preventDefault();
            (link.children[1].classList.contains('show')) ? link.children[1].classList.remove('show'):link.children[1].classList.add('show');
        });
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
    const addClickToColor = (link) => {
        let colorBtns = document.querySelectorAll(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info .color_list label`);
        colorBtns.forEach(colorBtn => colorBtn.addEventListener('click', (e) => {
            colorBtns.forEach(colorBtn => colorBtn.classList.remove('active'));
            colorBtn.classList.add('active');

            let itemSizes = JSON.parse(colorBtn.dataset.colorSizes);
            let sizeLabels=``;
            itemSizes.forEach((itemSize, index) => {
                sizeLabels += `<label data-size-details='${JSON.stringify(itemSize)}' data-size-quantity='${itemSize.quantity}'  class="${index == 0 ? 'active' : ''} ">${itemSize.innitual}<small>${itemSize.quantity}</small></label>`;
            });
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info .size_list`).innerHTML = sizeLabels;
            addClickToSize(link)
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info span`).innerHTML = itemSizes[0].code;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info p`).innerHTML = itemSizes[0].desc;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info span.details_title small.size-qty`).innerHTML = itemSizes.length + ' Available Sizes(s)';
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).dataset.availableQuantity = itemSizes[0].quantity;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info button`).dataset.inventory_id = itemSizes[0].id;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).value = 1;
            
        }))
    }
    const addClickToSize = (link) => {
        let itemSize = document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info .size_list label.active`);
        document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).dataset.availableQuantity = itemSize.dataset.sizeQuantity;

        let sizeBtns = document.querySelectorAll(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info .size_list label`);
        sizeBtns.forEach(sizeBtn => sizeBtn.addEventListener('click', (e) => {
            sizeBtns.forEach(sizeBtn => sizeBtn.classList.remove('active'));
            sizeBtn.classList.add('active');

            itemSize = JSON.parse(sizeBtn.dataset.sizeDetails);

            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info span`).innerHTML = itemSize.code;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info p`).innerHTML = itemSize.desc;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).dataset.availableQuantity = itemSize.quantity;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).value = 1;
            document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info button`).dataset.inventory_id = itemSize.id;

        }));
    }
    const adjustQuantity = (link) => {
        let adjustors = document.querySelectorAll(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info .cart_quantity_adjuster label span`);
        adjustors.forEach(adjustor => {
            adjustor.addEventListener('click', () => {
                let currentQuantity, availableQuantity, qtyInput;
                switch(adjustor.textContent.trim()){
                    case 'add':

                        currentQuantity = Number(document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).value);
                        availableQuantity = Number(document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).dataset.availableQuantity);
                        qtyInput = document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`);
                
                        if((Number(qtyInput.value) < availableQuantity)){
                            qtyInput.value = currentQuantity + 1;
                            document.querySelector('.notification_messages').classList.remove('danger');
                        }else{
                            
                            deliverNotification('Quantity cant\'t be greater than current stork', 'danger');

                        }
                    break;
                    default:
                        qtyInput = document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`);
                
                        if(Number(qtyInput.value) > 1){
                            qtyInput.value = Number(qtyInput.value) - 1;
                            document.querySelector('.notification_messages').classList.remove('danger');
                        }else{
                            deliverNotification('Quantity cant\'t be less or equeal to Zero(0)', 'danger');
                        }
                }

            })
        });
    }
    function addToCart(link) {
        let dRate = (Number(site.currencyList.filter(sale => sale.name == 'Dollars')[0].rate));
        // console.log(dRate); sys.pos.warehouse.lifestyle-outdoor-gear
        const addToCartBtn = document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info button`);
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let item = document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info .size_list label.active`);
            let itemDetails = JSON.parse(item.dataset.sizeDetails);
            console.log(itemDetails)
            let cart = site.cart;
            let session = site.session;
            let cartItem = {
                'branch_id': itemDetails.branch_id, 
                'brand_name': itemDetails.brand_name,
                'buy_price': itemDetails.buy_price, 
                'category_name': itemDetails.category_name, 
                'code': itemDetails.code, 
                'colour_id': itemDetails.colour_id, 
                'colour_name': itemDetails.colour_name, 
                'date': itemDetails.date, 
                'desc': itemDetails.desc,  
                // 'id': itemDetails.id, 
                'branch_inventory_id': itemDetails.branch_inventory_id, 
                'image': itemDetails.image, 
                'image_id': itemDetails.image_id, 
                'innitual': itemDetails.innitual, 
                'name': itemDetails.name,  
                'product_id': itemDetails.product_id, 
                'product_name': itemDetails.name, 
                'purchase_quantity': Number(document.querySelector(`#${link.parentElement.children[0].dataset.details} .item-box .class-secondery-info input.modified_quantity`).value), 
                'available_quantity': itemDetails.quantity, 
                'remarks': itemDetails.remarks,  
                'sale_price': itemDetails.sale_price, 
                'scheme_name': itemDetails.scheme_name, 
                'size_id': itemDetails.size_id, 
                'size_label': itemDetails.size_label, 
                'rate': dRate, 
                'currency': (document.getElementById('sale_curency').value == "Shillings") ? '/=' : '$'
            }

            // cart[itemDetails.id] = cartItem;
            cart[itemDetails.branch_inventory_id] = cartItem;
            updateTotalCartQuantity(cart);
            (link.parentElement.children[1].classList.contains('show')) ? link.parentElement.children[1].classList.remove('show'):link.parentElement.children[1].classList.add('show');
            updateSiteData(site);
        })
    }
    const updateTotalCartQuantity =(cart)=> {    
        document.querySelector('.cart-btn.nav-link small').textContent = Object.keys(site.cart).length;
    }
    const deliverNotification = (msg, msgtype) => {
        document.querySelector('.notification_messages').innerHTML = `${msg} <span class="material-icons-outlined">close</span>`;

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

    const performOperation = (action, info={}) => {
        const data = {
            'action': action, 
            'data': info
        }
        res = run(data);
        return res;
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
    const scrollToTop =()=>{

        // SCROLL TO THE TOP OF THE DOCUMENT
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
        });
    }

    /* 
    ------------------------------------------------------------------------------------
    ------------------------------------- SITE NAVIGATION ------------------------------
    ------------------------------------------------------------------------------------
    */
    const navigateTo = (url) => {
        // SCROLL TO THE TOP OF THE DOCUMENT
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
        });
        // REMOVE ACTIVE CLASS FROM ALL ITEMS
        navLinks.forEach(link => link.classList.remove('active'));
        // SET ACTIVE CLASS
        navLinks.forEach(link => {
            if(link.dataset.pg == site.page.pg){
                link.classList.add('active');
            }
        });
        history.pushState(null, null, url);

        // NAVIGATE TO THE PAGE CLICKED
        document.querySelectorAll('main .container .content  div').forEach(page => page.classList.remove('show'));
        document.querySelector(`main .container .content div#${site.page.pg}`).classList.add('show');
    }

    const admin = () => {
        document.querySelectorAll('.action_admin_only').forEach((label) => {
            if(site.session.user_type_id != 1){
                label.classList.add('hide');
                document.querySelectorAll('.statistics').forEach(stat => stat.classList.add('hide'));
            }
        });
        document.querySelectorAll('.modified_quantity').forEach(modified_quantity => {
            modified_quantity.setAttribute('disabled', true);
        })
    }

    /* 
    ------------------------------------------------------------------------------------
    ----------------------------------- GENERATE CART ITEMS ----------------------------
    ------------------------------------------------------------------------------------
    */
    const generateCart =() =>{
        let totalQty=0; 
        let totalPrS=0; 
        let totalPrD=0;
        let discount = 1;
        let paymentType = document.getElementById('add_payment_type').value;
        let count = 1;

        let cart = site.cart;
        let cartItemsKeys = Object.keys(cart);
        let td = "";
        let cartItem;
        // CALCULATE DISCOUNT
        site.discountList.forEach((discount_item) => {
            if(discount_item.name == document.getElementById('add_discount').value){
                document.getElementById('discount_identifier').textContent = discount_item.discount_percentage + '%';
                let discount = (Number(discount_item.discount_percentage)/100);    
            }
        });


        if(cartItemsKeys.length > 0){
            cartItemsKeys.forEach(key => {
                cartItem = cart[key];
                console.log(cartItem)
                let saleCurrencyInput = document.getElementById('sale_curency');
                let dollarC = site.currencyList.filter(currency => currency.symbol == '$');
                let dollarRate = dollarC[0].rate;

                let selectedCurrency = site.currencyList.filter(currency => currency.name == saleCurrencyInput.value);
                let rate = selectedCurrency[0].rate;
                let convertedPrice = 0;
                if(saleCurrencyInput.value == 'Dollars'){
                    convertedPrice =  (cart.currency != '$') ? (Math.round((((Number(cartItem.sale_price)) + Number.EPSILON)) * 100) / 100 ) : (((Math.round(((Number(cartItem.sale_price)/rate) + Number.EPSILON)) * 100) / 100 ));
                }else{
                    convertedPrice =  (cart.currency != '/=') ? (Math.round((((Number(cartItem.sale_price)) + Number.EPSILON)) * 100) / 100 )  : (Number(cartItem.sale_price) * dollarRate);
                }
                
                td += `
                    <div class="cart_item">
                        <div class="cart_item_image">
                            <img src="./images/${cartItem.image}">
                        </div>
                        <div class="cart_item_general_info">
                            <div class="general_item_info">
                                <span><b>${cartItem.name}</b></span>
                                <span><b>Brand:</b> ${cartItem.brand_name}</span>                                                
                                <span><b>Colour</b> ${cartItem.colour_name}</span>
                                <span><b>Size:</b> ${cartItem.innitual}</span>
                            </div>
                        </div>
                        <div class="cart_quantity_adjuster">
                            <b>Quantity</b>
                            <label>
                                <span class="material-icons-outlined" id="remove-${cartItem.branch_inventory_id}" data-id="${cartItem.branch_inventory_id}">
                                    remove
                                </span>
                                <input type="text" disabled value="${cartItem.purchase_quantity}" data-quantity="${cartItem.available_quantity}" id="cartQuantity-${cartItem.branch_inventory_id}" data-id="${cartItem.branch_inventory_id}" class="modified_quantity cart_modified_quantity" disabled="disabled">
                                <span class="material-icons-outlined" id="remove-${cartItem.branch_inventory_id}" data-id="${cartItem.branch_inventory_id}">
                                    add
                                </span>
                            </label>
                        </div>
                            
                        <div class="cart_item_price">
                            <div class="cart_per_item_price">
                                <b>Price</b>
                                <label>
                                    <span class="material-icons-outlined">
                                        alternate_email
                                    </span>
                                    <input type="text" class="cart_price" data-id="${cartItem.branch_inventory_id}" id="${cartItem.branch_inventory_id}price" value="${addComma(convertedPrice.toString())}">
                                </label>

                            </div>
                            <div class="cart_overall_price">
                                <b>Total Price</b>
                                <label>
                                    <span class="material-icons-outlined">
                                        sell
                                    </span>
                                    <b>${addComma((Number(convertedPrice) * Number(cartItem.purchase_quantity)).toString())}</b> 
                                    <small>${cartItem.currency}</small>
                                </label>
                            </div>
                        </div>
                                
                        <div class="desc">
                            <b>Description</b>
                            <textarea placeholder="Enter item description" class="item_desc" data-id="${cartItem.branch_inventory_id}" id="${cartItem.branch_inventory_id}desc" >${cartItem.desc}</textarea>
                        </div>
                        <span class="material-icons-outlined remove_from_cart" data-id="${cartItem.branch_inventory_id}">
                            close
                        </span>
                    </div>
                `;
                    count++;
                    totalPrS += (Number(convertedPrice) * Number(cartItem.purchase_quantity));
            })

            totalQty = cartItemsKeys.length;

            document.querySelector('.cart_items').innerHTML = td;
            document.getElementById('totalPrice_identifier').textContent = totalPrS + ' ' + cart[cartItemsKeys[0]].currency;
            document.getElementById('DiscountPrice_identifier').textContent = (totalPrS - (Number(totalPrS) * discount)) + ' ' + cart[cartItemsKeys[0]].currency;
            const saleCurrencyInput = document.getElementById('sale_curency');
            saleCurrencyInput.value = (cart[cartItemsKeys[0]].currency.trim() == '/=') ? 'Shillings' : 'Dollars';
        }else{
            td += `
                <div class="cart_item empty">
                    <h1>Nothing Found in cart</h1>
                </div>
                `;
            document.querySelector('.cart_items').innerHTML = td;
        }
        document.getElementById('totalQuantity').textContent = totalQty;
        document.getElementById('discount_identifier').textContent = discount + '%';
        document.getElementById('payment_type').textContent = paymentType;

        generateReceipt();
        // DELETE ITEM FROM CART
        document.querySelectorAll('.remove_from_cart').forEach((removeBtn) => {
            removeBtn.addEventListener('click', () => {
                removeItemFromCart(removeBtn.dataset.id)
            });
        });

        document.querySelectorAll('.cart_item .cart_quantity_adjuster label span').forEach((adjustBtn) => {
            let unique = adjustBtn.dataset.id;
            adjustBtn.addEventListener('click', () => {
                let currentQuantity, availableQuantity, qtyInput;
                if(document.getElementById('sale_curency').value.toLowerCase() != "dollars"){
                    switch(adjustBtn.textContent.trim()){
                        case 'add':
                            currentQuantity = Number(document.getElementById(`cartQuantity-${unique}`).value);
                            availableQuantity = Number(document.getElementById(`cartQuantity-${unique}`).dataset.quantity);
                            qtyInput = document.getElementById(`cartQuantity-${unique}`);
                    
                            if((Number(qtyInput.value) < availableQuantity)){
                                qtyInput.value = currentQuantity + 1;
                                document.querySelector('.notification_messages').classList.remove('danger');
                                updateCart(unique, {
                                    'purchase_quantity': qtyInput.value , 
                                    'sale_price': Number(removeComma(document.getElementById(unique+ "price").value)),
                                    'desc': document.getElementById(unique+ "desc").value
                                });

                            }else{
                                
                                deliverNotification('Quantity cant\'t be greater than current stork', 'danger');

                            }
                        break;
                        default:
                            qtyInput = document.getElementById(`cartQuantity-${unique}`);
                    
                            if(Number(qtyInput.value) > 1){
                                qtyInput.value = Number(qtyInput.value) - 1;
                                document.querySelector('.notification_messages').classList.remove('danger');
                                updateCart(unique, {
                                    'purchase_quantity': qtyInput.value , 
                                    'sale_price': Number(removeComma(document.getElementById(unique+ "price").value)),
                                    'desc': document.getElementById(unique + "desc").value
                                });

                            }else{
                                deliverNotification('Quantity cant\'t be less or equeal to Zero(0)', 'danger');
                            }
                    }
                }
            });
        });

        const cart_price = document.querySelectorAll('.cart_price');
        cart_price.forEach((priceInput) => {
            let unique = priceInput.dataset.id;
            priceInput.addEventListener('change', () => {
                console.log(Number(removeComma(document.getElementById(unique+ "price").value)))
                console.log(document.getElementById(`cartQuantity-${unique}`).value)
                
                let qtyInput =document.getElementById(`cartQuantity-${unique}`);
                 updateCart(unique, {
                    'purchase_quantity': qtyInput.value , 
                    'sale_price': Number(removeComma(document.getElementById(unique+ "price").value)),
                    'desc': document.getElementById(unique+ "desc").value
                });
            });
        });
        const item_desc = document.querySelectorAll('.item_desc');
        item_desc.forEach((item_descInput) => {
            let unique = item_descInput.dataset.id;

            item_descInput.addEventListener('change', () => {
                let qtyInput =document.getElementById(`cartQuantity-${unique}`);

                 updateCart(unique, {
                    'purchase_quantity': qtyInput.value , 
                    'sale_price': Number(removeComma(document.getElementById(unique+ "price").value)),
                    'desc': document.getElementById(unique+ "desc").value
                });
            });
        });
    }

    /* 
    ------------------------------------------------------------------------------------
    ----------------------------------- GENERATE ITEM RECEIPT --------------------------
    ------------------------------------------------------------------------------------
    */
    const generateReceipt =()=> {
        let cart = site.cart;
        let cartItemKeys = Object.keys(cart);
        let allItems = '';
        let totalPrice = 0;

        cartItemKeys.forEach((cartItemKey) => {
            let convertedPrice = Number(cart[cartItemKey].sale_price);
            if(cart[cartItemKey].currency.trim() == '$'){
                convertedPrice =  (Math.round((convertedPrice + Number.EPSILON) * 100) / 100 );
            }
            allItems += `
                <tr>
                    <td>
                        <span class="item_code">${cart[cartItemKey].code}</span>
                    </td>
                    <td>
                        <span class="item_name">${cart[cartItemKey].name}</span>
                    </td>
                    <td>
                        <span class="item_quantity">${cart[cartItemKey].purchase_quantity}</span>
                    </td>
                    <td>
                        <span class="item_price">${addComma(convertedPrice.toString())}<small>${cart[cartItemKey].currency}</small></span>
                    </td>
                    <td>
                        <span class="item_total">${addComma((Number(convertedPrice) * Number(cart[cartItemKey].purchase_quantity)).toString())}<small>${cart[cartItemKey].currency}</small></span>
                    </td>
                </tr>
            `;

            totalPrice += Number(convertedPrice) * Number(cart[cartItemKey].purchase_quantity);
        })
        document.getElementById('receipt_items').innerHTML = allItems;
        let sessions = site.session;

        document.getElementById("outlet").innerHTML = "Outlet: " + sessions.branch;
        
        document.getElementById('invoice_date').innerHTML = "<b>Date</b>: " + document.getElementById('add_purchase_date').value;;
        // payType reloadSale export
        document.getElementById('payType').innerHTML = "<b>Payment:</b> " + document.getElementById('add_payment_type').value;
        document.getElementById('totalPrice').textContent = addComma(totalPrice.toString());
        document.getElementById('receipt_attendant').textContent = sessions.first_name;
        document.querySelector('.rTotal small').textContent = (cartItemKeys.length != 0) ? cart[cartItemKeys[0]].currency: '/=';
    }
    const removeItemFromCart =(key) =>{
        if(delete site.cart[key]){
            updateSiteData(site)
            deliverNotification('Item removed from cart', 'success');
            updateTotalCartQuantity(site.cart);
            generateCart();

        } else{
            deliverNotification('Operation failed', 'danger');
        }
    }

    const updateCart =(key, updateData)=>{
        let cart = site.cart;
        if(typeof(cart[key]) == "object"){
            cart[key].purchase_quantity = updateData.purchase_quantity ;
            cart[key].sale_price = Number(updateData.sale_price);
            cart[key].desc = updateData.desc;
            updateSiteData(site);
        }
        generateCart();
    } 
    const clearCart = ()=>{
        site.cart = {};
        updateSiteData(site)
        updateTotalCartQuantity();
        generateCart();
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
    const print = ()=>{
        // PRINT RECEIT
        var restore = document.body.innerHTML;
        var printContent = document.querySelector('.receipt').innerHTML;
        document.body.innerHTML = printContent;
        if(window.print()){
            site.cart = {}
            updateSiteData(site)
        }
        document.body.innerHTML = restore;
        generateCart();
    }
    const resetAdminToNoBranch =()=> {
        // RESET ADMIN BRANCH ID BACK TO NULL
        if(site.session.user_type_id == 1){
            site.session.branch = "";
            site.session.branch_id = "";
        }
        // SET HOME AS THE ACTIVE PAGE
        site.page = {'pageIndex': 0, 'pg': 'home'};
        updateSiteData(site)
    }
    const clearFields = (elements) => {
        elements.forEach(element => element.value = '');
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

        document.querySelector('.profile-area .profile-photo').innerHTML = `<img src="./images/${site.session.image}">`;
        document.querySelector('.profile-area .handle').innerHTML = `@${site.session.username}`;
    }
    const getBranchInventory = (page = 1) => {
        document.getElementById(`branchinventoryproducts_list`).after(preloader());
        let limitShow = (document.querySelector('#home .homelimit').value == 'All') ? 0 : document.querySelector('#home .homelimit').value;
        let data = {'branch_id': site.session.branch_id, 'limit': limitShow,'action':'getSingleBranchInventory', 'page': page};
        console.log(limit)
        res = run(data);
        res.always(details => {
            console.log(details)
            if(page == 1){
                formPagination(details[1], 'branchinventoryproduct', Number(limitShow), 'arr');
            }
            renderPageData(details, 'branchinventoryproduct');
            removeElement('div.preloader');
        });
    }
    const getInvoiceByDate = (page = 1) => {
        document.getElementById(`invoices_list`).after(preloader());
        let startdate = document.getElementById('startdate').value;
        let enddate = document.getElementById('enddate').value;
        let identifier = 'invoice';
        let limitShow = document.querySelector('#sales .salelimit').value;            
        let data ={'reload': true, 'sdate': startdate, 'edate': enddate, 'action':'getBranchesInvoices', 'name': 'allbranchessaleinvoices'};
        // IF USERTYPE IS ATTENDANT ASSIGN ATTENDANT BRACH ID
        if(site.session.user_type_id == 2){
            data.branch_id = site.session.branch_id;
        }
        // console.log(data) calculate
        res = run(data);
        res.always(details => {
            console.log(details)
            if(page == 1){
                formPagination(details[1], 'invoice', Number(limitShow), 'arr');
            }
            renderPageData(details, 'invoice');
            removeElement('div.preloader');
        });
    }
    const allBranchesDataRequest = (dataKey, requestName, requestData, counter, reload = 'false') => {
        // GET FIRST allbranchesinventoryproducts IS SET
        // IF ITS NOT SET, SET IT TO AN EMPTY OBJECT
        if(!site[requestName]){
            site[requestName] = {}
        }
        $.ajax({
            url: "http://localhost/sys.pos.warehouse.lifestyle-outdoor-gear/api/route.php",
            type: "POST",
            dataType  : 'json',
            data: requestData,
            success: function(data){
                // USE BRANCH ID AS KEY TO SET EACH BRACH DATA  
                site[requestName][dataKey] = convertToObject(data);
                // UPDATE SITE DATA
                updateSiteData(site);
            }
        });
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
/**
 * END OF SYSTEM FUNCTIONS
 **/

/**
 * AFTER PAGE CONTENT IS LOADED
 **/
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('startdate').value = today;  
    document.getElementById('enddate').value = today;  
    getInvoiceByDate(); 
    getBranchInventory(); 

    /* 
    ------------------------------------------------------------------------------------
    -------------------------------- LOAD BESIC DATA/ACIIONS/FUNCTIONS ---------------------------
    ------------------------------------------------------------------------------------
    */
    setTimeout(admin(), 0);
    setTimeout(navigateTo('./pos.html'), 0);
    setTimeout(updateTotalCartQuantity(site.cart), 0);
    setTimeout(generateCart(), 0);
    loadProfile();

    // ASSIGN USER PROFILE TO ACCOUNT ELEMENT
    // SET ACCOUNT PROFILE IMAGE AND USERNAME
    let accountInfo = document.getElementById('user-account-information');
    accountInfo.children[0].setAttribute('src', `./images/${site.session.image}`);
    // SET BRANCH OUTLET AND DATE ON HOME PAGE
    document.querySelector('.dateN').textContent = today;
    document.querySelector('.outletV').textContent = site.session.branch;


    /* 
    ------------------------------------------------------------------------------------
    ------------------------------------- SITE NAVIGATION ------------------------------
    ------------------------------------------------------------------------------------
    */
    navLinks.forEach(navLink => navLink.addEventListener('click', e => {
        e.preventDefault();
        // UPDATE SITE PAGE(SAVE CURRENT PAGE)
        site.page.pg = navLink.dataset.pg;
        site.page.pageIndex = Number(navLink.dataset.pgno);
        updateSiteData(site)

        // NAVIGATE TO THE PAGE CLICKED
        navigateTo(`./pos.html?pg=${navLink.dataset.pg}`);
        generateCart();
        navLink.parentElement.parentElement.classList.remove('expand')
    }));

    /* 
    ------------------------------------------------------------------------------------
    ---------------------------- SHOW BILLING & RECEIPT SECTION ------------------------
    ------------------------------------------------------------------------------------
    */
    const showClientDetailsBtn = document.getElementById('show-client-detail-btn');
    showClientDetailsBtn.addEventListener('click', () => {
        document.querySelector('.cart_processing').classList.toggle('hide');
    });

    document.getElementById('clearCart').addEventListener('click', () => {
        clearCart();
    });
    document.getElementById('add_purchase_date').value = today;
    document.getElementById('add_purchase_date').addEventListener('change', () => {
        generateReceipt();
    })
    // GET BRANCHES 
    document.getElementById("admin_sale_at_specific_branch").innerHTML = generateDropdown(site.branchList, 'name', 'id', 'Admin select Branch  ');
    // GET PAYMENT DISCOUNTS
    document.getElementById('add_discounts').innerHTML = generateDataList(site.discountList, 'name');
    // // GET PAYMENT TYPES
    document.getElementById('add_payment_types').innerHTML = generateDataList(site.paymentTypeList, 'name');
    // // GET CURSTOMER NAMES
    document.getElementById('add_customer_fnames').innerHTML = generateDataList(site.customerList, 'fname');
    document.getElementById('add_customer_1names').innerHTML = generateDataList(site.customerList, 'lname');
    document.getElementById('add_customer_telephones').innerHTML = generateDataList(site.customerList, 'telephone');
    document.getElementById('add_customer_emails').innerHTML = generateDataList(site.customerList, 'email');
    // BILLING INPUT EVENTS

    document.getElementById('add_payment_type').addEventListener('change', () => {
        generateReceipt();
    });

    document.getElementById('add_discount').addEventListener('change', () => {
        site.discountList.forEach((discount_item) => {
            if(discount_item.name == document.getElementById('add_discount').value){
                document.getElementById('discount_identifier').textContent = discount_item.discount_percentage + '%';
                let discountPercentage = (Number(discount_item.discount_percentage)/100);                
                let currentPrice = removeComma(document.getElementById('totalPrice_identifier').textContent).split(' ')[0];
                let discounted = (currentPrice * discountPercentage);
                let newPrice = currentPrice - discounted;
                if(Object.keys(site.cart).length != 0){
                    let cartItemsKeys = Object.keys(site.cart);
                    document.getElementById('DiscountPrice_identifier').textContent = addComma(newPrice.toString()) + ' ' + site.cart[cartItemsKeys[0]].currency ;
                }
            }
        });
    });
    if(typeof(site.customerList) == 'object'){
        document.getElementById('add_customer_fname').addEventListener('input', () => {
            let customer = site.customerList.filter(client => client.fname == document.getElementById('add_customer_fname').value)
            document.getElementById('add_customer_1name').value = (customer.length > 0) ? customer[0].lname: '';
            document.getElementById('add_customer_telephone').value = (customer.length > 0) ? customer[0].telephone: '';
            document.getElementById('add_customer_email').value = (customer.length > 0) ? customer[0].email: '';
            
        });
        document.getElementById('add_customer_1name').addEventListener('input', () => {
            let customer = site.customerList.filter(client => client.lname == document.getElementById('add_customer_1name').value)
            document.getElementById('add_customer_telephone').value = (customer.length > 0) ? customer[0].telephone: '';
            document.getElementById('add_customer_email').value = (customer.length > 0) ? customer[0].email: '';
            
        });
        document.getElementById('add_customer_email').addEventListener('input', () => {
            let customer = site.customerList.filter(client => client.email == document.getElementById('add_customer_email').value)
            document.getElementById('add_customer_telephone').value = (customer.length > 0) ? customer[0].telephone: '';
        });
    }

    document.getElementById('make-transaction').addEventListener('submit', (e) => {
        e.preventDefault();
        if(Object.keys(site.cart).length != 0){
            if(
                document.getElementById('add_customer_fname').value != "" && 
                document.getElementById('add_customer_1name').value != "" && 
                document.getElementById('add_customer_telephone').value !="" && 
                document.getElementById('add_payment_type').value != "" && 
                document.getElementById('add_discount').value !="" && 
                document.getElementById('add_purchase_date').value !="" && 
                document.getElementById('add_customer_email').value != ""){
                let branch_id = (site.session.user_type_id == 1) ? document.getElementById('admin_sale_at_specific_branch').value : site.session.branch_id;
                if(branch_id == "Admin select Branch"){
                    deliverNotification("As Admin you must select the branch your saling from", 'warning');
                }else{
                    let purchaseDetails = {
                        'attendant_id': site.session.user_id,
                        'attendant': site.session.last_name + " " +site.session.first_name,
                        'branch_id': branch_id,
                        'branch': site.session.branch,
                        'add_customer_fname': document.getElementById('add_customer_fname').value,
                        'add_customer_1name': document.getElementById('add_customer_1name').value,
                        'add_customer_email': document.getElementById('add_customer_email').value,
                        'add_customer_telephone': document.getElementById('add_customer_telephone').value,
                        'add_payment_type': document.getElementById('add_payment_type').value,
                        'add_discount': document.getElementById('add_discount').value,
                        'add_purchase_date': document.getElementById('add_purchase_date').value,
                        'date': today,
                    }
                    let saleItems = [];
                    Object.keys(site.cart).forEach((cart_item) => {
                        let dollarC = site.currencyList.filter(currency => currency.symbol == '$');
                        let dollarRate = dollarC[0].rate;

                        let convertedPrice = Number(site.cart[cart_item].sale_price);
                        if(site.cart[cart_item].currency.trim() == '$'){
                            convertedPrice =  (convertedPrice * dollarRate);//(site.cart[cart_item].currency.trim() != '$') ? (Math.round((convertedPrice + Number.EPSILON) * 100) / 100 ) : ((Math.round((convertedPrice/rate) + Number.EPSILON) * 100) / 100 );
                        }

                        site.cart[cart_item].sale_price = convertedPrice;
                        saleItems.push(site.cart[cart_item]);
                    });
                    purchaseDetails.cart = saleItems;
                    scrollToTop();
                    document.querySelector('div.page.show .cart_details').append(preloader());

                    let view = performOperation("make_sale", purchaseDetails);
                    view.always(function(data){
                        removeElement('div.preloader');

                        if(data.response == 'success'){
                            // LOAD TODAYS SALE
                            getInvoiceByDate();

                            // UPDATE SITE DATA WITH THE UPDATED LIST OF SALES
                            // UPDATE PRODUCT QUANTITY IN THE BRANCH INVENTORY PRODUCT
                            // UPDATE SITE DATA
                            getBranchInventory();
                            resetAdminToNoBranch();
                            
                            // UPDATE SITE PAGE(SAVE CURRENT PAGE)
                            site.page.pg = 'home';
                            site.page.pageIndex = 0;
                            updateSiteData(site)

                            // ADD ALL LOCAL DATA KEYS THAT HAVE NEW DATA DUE TO THE TRANSACTION
                            // THE CHECKER WILL UPDATE DATA DURING THE RENDER PROCES
                            // IT WILL LOOP THROUGH THE KEYS IN SITE CORRESPONDING TO THEM
                            expectedData = {
                                'allbranchesinventoryproducts': 'branchinventoryproduct',
                            };

                            if (document.getElementById('prechecked_print_receipt').checked == true){
                                document.getElementById('invoice_date').innerHTML = `<b>Date</b> ${data.message.date}`
                                document.getElementById('invoice_no').innerHTML = `<b>No.</b> ${data.message.invoiceNo}`
                                print();
                                // RELOAD PAGE IF PRINT IS SELECTED COZ ALL JS EVENTS WILL NOT WORK
                                window.location.href = 'pos.html';
                            }
                            deliverNotification("Transaction completed successfully", 'success');
                            
                            // CLEAR FIELDS
                            let fields = [document.getElementById('add_customer_fname'), document.getElementById('add_customer_1name'), document.getElementById('add_customer_email'), document.getElementById('add_customer_telephone')];
                            clearFields(fields);
                            // CLEAR FIELDS
                            clearCart();
                        }else{
                            deliverNotification(data.message, 'danger');
                        }

                        // NAVIGATE TO HOME PAGE
                        navigateTo(`./pos.html?pg=${site.page.pg}`);
                    });
                }
            }else{ 
                deliverNotification("Important fields can not be Empty", 'warning');

            }
        }else{
            deliverNotification("Cart is Empty", 'warning');
        }
    } );
    
    if(site.session.user_type_id == 1){
        document.getElementById('admin_sale_at_specific_branch').removeAttribute('disabled');
        
        document.getElementById('admin_sale_at_specific_branch').addEventListener('change', () => {
            let selectObj = document.getElementById('admin_sale_at_specific_branch');
            for (var i = 0; i < selectObj.options.length; i++) {
                if (selectObj.options[i].value== document.getElementById('admin_sale_at_specific_branch').value) {
                    document.getElementById('outlet').innerHTML = 'Outlet: ' + selectObj.options[i].textContent;

                    site.session.branch = selectObj.options[i].textContent
                    site.session.branch_id = document.getElementById('admin_sale_at_specific_branch').value;
                    updateSiteData(site)
                    generateReceipt();
                }
            }
        });
    }
       
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
    /* 
    ------------------------------------------------------------------------------------
    ------------------------------------- PREVIEW RECEIPT ------------------------------
    ------------------------------------------------------------------------------------
    */
    const previewReceiptBtn = document.getElementById('preview-receipt-btn');
    previewReceiptBtn.addEventListener('click', () => {
        document.getElementById('receipt').classList.toggle('show');
    });

    /* 
    ------------------------------------------------------------------------------------
    ----------------------------- UPDATE CURRENCY IN CART ------------------------------
    ------------------------------------------------------------------------------------
    */
    const saleCurrencyInput = document.getElementById('sale_curency');
    saleCurrencyInput.addEventListener('change', () => {
        const totalPriceSting = document.getElementById('totalPrice_identifier').textContent.split(' ')[0];
        const totalPriceDiscountedSting = document.getElementById('DiscountPrice_identifier').textContent.split(' ')[0];
        let dollarC = site.currencyList.filter(currency => currency.symbol == '$');
        let dollarRate = dollarC[0].rate;

        let selectedCurrency = site.currencyList.filter(currency => currency.name == saleCurrencyInput.value);
        let rate = selectedCurrency[0].rate;
        document.getElementById('totalPrice_identifier').textContent =  (saleCurrencyInput.value == 'Shillings') ? addComma(totalPriceSting) + ' /=': addComma(totalPriceSting) + ' $';
        document.getElementById('DiscountPrice_identifier').textContent = (saleCurrencyInput.value == 'Shillings') ? addComma(totalPriceDiscountedSting)   + ' /=': totalPriceDiscountedSting + ' $';

        let cart = site.cart;
        Object.keys(cart).forEach(cartIndex => {
            cart[cartIndex].currency = (saleCurrencyInput.value == 'Shillings') ? ' /=': ' $';
            cart[cartIndex].sale_price = (saleCurrencyInput.value == 'Dollars') ? (Number(cart[cartIndex].sale_price)/rate) : (Number(cart[cartIndex].sale_price) * dollarRate) ;
        });

        updateSiteData(site)
        generateCart();
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
        expectedData.allbranchessaleinvoices = 'invoice';
    });
    document.querySelector(".branch_list").innerHTML = generateDropdown(site.branchList, 'name', 'id', 'Branch  ');
    document.querySelector('.payment_type_list').innerHTML = generateDropdown(site.paymentTypeList, 'name', 'id', 'Method  ');
    document.querySelector(".currency_list").innerHTML = generateDropdown(site.currencyList, 'name', 'symbol', 'Currency  ');
    document.querySelector(".branch_list").addEventListener('change', ()=>{
        expectedData.allbranchessaleinvoices = 'invoice';
        document.getElementById(`sales_list`).parentElement.after(preloader());
    });
    document.querySelector('.payment_type_list').addEventListener('change', ()=>{
        expectedData.allbranchessaleinvoices = 'invoice';
        document.getElementById(`sales_list`).parentElement.after(preloader());
    });
    document.querySelector(".currency_list").addEventListener('change', ()=>{
        expectedData.allbranchessaleinvoices = 'invoice';
        document.getElementById(`sales_list`).parentElement.after(preloader());
    });
    document.querySelector(".salelimit").addEventListener('change', () => {
        expectedData.allbranchessaleinvoices = 'invoice';
        document.getElementById(`sales_list`).parentElement.after(preloader());
    });

    // HOME SPECIFICATION DROPDOWNS pagination
    document.querySelector('.homelimit').addEventListener('change', () => {
        getBranchInventory();
    });

    // SIGNOUT
    document.querySelector('#siginout').addEventListener('click', () => {
        delete site.session;
        updateSiteData(site)
        window.location ='./signin.html';
    });

    /* 
    ------------------------------------------------------------------------------------
    ---------------------------------- GENERAL SEARCH ----------------------------
    ------------------------------------------------------------------------------------
    */
    searchBar.addEventListener('change', (e) => {
        e.preventDefault();
        // search();
    });
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        search();
    });
    function search(pageNo=1) {
        let searchValue = searchBar.value.toLowerCase();
        let page = document.querySelector('div.page.show');
        let count = 0;
        let limitField;
        let limit;
        let found=0;
        let searchResultsTotal = 0;
        switch(page.id){
            case 'home':
                console.log(searchValue, page)
                if(!document.querySelector('.listing .preloader')){
                    document.querySelector('.listing').append(preloader());
                }
                let limitShow = document.querySelector('.homelimit').value;  

                let data ={'reload': true, 'search': searchValue, 'action':'search_products'};
                // IF USERTYPE IS ATTENDANT ASSIGN ATTENDANT BRACH ID
                if(site.session.user_type_id == 2){
                    data.branch_id = site.session.branch_id;
                }
                res = performOperation("search_products", data);
                console.log(data) 
                // res = run(data);
                res.always(details => {
                    console.log(details);
                    if(pageNo == 1){
                        formPagination(details[1], 'branchinventoryproduct', Number(limitShow), 'arr');
                    }
                    renderPageData(details, 'branchinventoryproduct');
                    removeElement('div.preloader');
                });
                break;

            default:
                deliverNotification('Query not clear for search process', 'warning');
        }
    }


});

// DONT UPDATE DAILY SALES TO SITE DATA JUST DISPLAY THE SEARCH DATA
// RENDER THE SEARCH DATA DON'T STORE IN LOCAL STORAGE