
let res = null;
let site = {};
let limit = 15;
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! navigation rende
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

setInterval( () => {
    if(!localStorage.getItem('joinedlifestyleoutdoorgear')){
        window.location.href = './signin.html';
    }
}, 5000); 

if(!localStorage.getItem('joinedlifestyleoutdoorgear')){
    window.location.href = './signin.html';
}else if(!JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear')).session){
    window.location.href = './signin.html';
}else if(Number(JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear')).session.user_type_id) > 1){
    window.location.href = './signin.html';
}

site = JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear'));

let page = 1;
let start = true;

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

const updateSiteData = (data) => {
    // localStorage.clear();
    localStorage.setItem('joinedlifestyleoutdoorgear', JSON.stringify(data));
    site = JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear'));
                    
}

const loadSessionData =(dataName, limit) => {
    document.querySelector(`#${dataName}s_list`).insertAdjacentHTML('beforeend', '<div class="preloader"></div>') 
    if(site[`${dataName}List`]){
        generatePegination(site[`${dataName}List`], dataName);
        loadPageData(site[`${dataName}List`], dataName, limit);
    }
}

const dataRequest = (requestName, requestData, counter, reload = 'false', infoUpdate = false) => {

    // console.log(document.querySelector(`#${lowerCaseRqtNm}s_list`).parentElement.parentElement);
    let lowerCaseRqtNm = requestName.toLowerCase(); // eg invoice NOTE:: requestName must be received with its first letter capital ang it shoudn't be in plural eg. Invoice
    document.querySelector(`#${lowerCaseRqtNm}s_list`).parentElement.parentElement.insertAdjacentHTML('beforeend', '<div class="preloader"></div>') 
    let localStorageNm = `${lowerCaseRqtNm}List`; //eg invoiceList
    let action = `getAll${requestName}s`; // eg. getAllInvoice Note:: first letter of requestName must be capital
    if(reload == true || (!site[localStorageNm])){
        (!site[localStorageNm]) ? document.querySelector(`#${lowerCaseRqtNm}s_list`).insertAdjacentHTML('beforeend', '<div class="preloader"></div>') : removeElement('div.preloader');
        $.ajax({
            url: "http://localhost/joinedlifestyleoutdoorgear/api/route.php",
            type: "POST",
            dataType  : 'json',
            data: requestData,
            success: function(data){
                console.log(data)
                removeElement('div.preloader');
                if(data.length > 0){

                    // ONLY RENDER DATA TO PAGE AT THE FIRST REQUEST
                    if((!site[localStorageNm])){
                        renderPageData(data, 0, lowerCaseRqtNm);
                    }

                    // GET FIRST CHUNK OF DATA AND ADD IT TO SITE DATA
                    if(site[localStorageNm]){
                        delete site[localStorageNm];
                    }
                    site[localStorageNm] = data;

                    // UPDATE SITE DATA
                    updateSiteData(site);
                }
            },
            complete:function(data){
                data.always(all => {
                    counter++;
                    if(all.length > 0 && counter == 2){
                        // GET ALL THE DATA
                        setTimeout(dataRequest(requestName, {'action': action}, counter, true), 0);
                    }else if((site[localStorageNm])){
                        if((infoUpdate == true)){
                            renderPageData(alldata.slice(0, (0 + limit)), 0, lowerCaseRqtNm);
                        }
                        generatePegination(site[localStorageNm], lowerCaseRqtNm);
                    }
                });
            }
        });
    }
}

const generatePegination = (data, item, limit = 15, displayLinkNumber = 10) => {
    console.log(data)
    let pages = 1;  
    let range = []; 
    let total = data.length;
    let peginationLink = document.querySelector(`.pagination_link.${item}-list_pagination`);
    if(total > limit){
        let page = Math.ceil(total/limit);
        // let page = Math.floor(total/limit);
        pages = total & limit === 0 ? page : page + 1;
        range = [...Array(pages).keys()];

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

        paginationManipulation(displayLinkNumber, range, data, item, limit);
        if(item == 'invoice'){
            let totalSum = 0;
            // USE BRANCH IDS AS KEYS
            let branchTotal = {'1' : 0,'2' : 0,'3':0}
            setTimeout(() => {
                console.log(data);
                t = [];
                data.forEach(sale => {
                    console.log(sale)
                    console.log(sale.invoiceDetails[0])
                    console.log(sale.invoiceDetails[0].sale_price)
                    console.log(sale.invoiceDetails[0].purchase_quantity)
                    console.log(sale.invoiceDetails[0].branch_id);
                    totalSum += (Number(sale.invoiceDetails[0].sale_price) * Number(sale.invoiceDetails[0].purchase_quantity));

                    branchTotal[sale.invoiceDetails[0].branch_id] = Number(branchTotal[sale.invoiceDetails[0].branch_id]) + ((Number(sale.invoiceDetails[0].sale_price) * Number(sale.invoiceDetails[0].purchase_quantity)));
                })
                console.log(document.querySelectorAll('.branch_income')[0].children[0]);
                console.log(branchTotal);
                document.querySelectorAll('.branch_income')[0].children[0].innerHTML =`${addComma(branchTotal[1].toString())} <small>/=</small>`;
                document.querySelectorAll('.branch_income')[1].children[0].innerHTML =`${addComma(branchTotal[2].toString())} <small>/=</small>`;
                document.querySelectorAll('.branch_income')[2].children[0].innerHTML =`${addComma(branchTotal[3].toString())} <small>/=</small>`;
                document.getElementById('totalIncome').innerHTML= `${addComma(totalSum.toString()) } <small>/=</small>`;
            }, 1);
        }
    }else{
        peginationLink.innerHTML = '';
    }

}
const paginationManipulation = (displayLinkNumber, range, data, item, limit) => {
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
                let start = ((Number(paginationLink.textContent) - 1) * limit);
                document.getElementById(`${item}s_list`).innerHTML = '';
                let identifier = item;
                renderPageData(data.slice(start, (start + limit)), start, identifier);
                paginationLink.classList.add('active');

        }

        // CALL ON EACH PAGINATION DATA
        // pageTbModifications();

    }));
}

// GET TOTALS AND COMPARE WITH CURRENT VALUES
const getTotals = (requestData) => {
    setTimeout(() => {
        $.ajax({
            url: "http://localhost/joinedlifestyleoutdoorgear/api/route.php",
            type: "POST",
            dataType  : 'json',
            data: requestData,
            success: function(data){
                if(data.length > 0 ){
                    data.forEach(res => {
                        let requestName = Object.keys(res)[0];
                        let total = res[requestName];
                        let lowerCaseRqtNm = requestName.toLowerCase();
                        let localStorageNm = `${lowerCaseRqtNm}List`; //eg invoiceList general se
                        if(site[localStorageNm]){
                            if(total != site[localStorageNm].length){
                                console.log('Datachanged Update info')
                                // dataRequest(requestName, {'limit': 15,'action': `getAll${requestName}s`}, 2, true);
                            }
                        }
                    })
                }
            }
        });
    }, 0);
};

// AUTO REFRESH SITE AFTER 5 Secounds IF THEIR ARE CHANGES IN DATA
// setInterval( () => {
//     let requestData = {'action':'getTotal', 'tbs': "WarehouseInventory|warehouseInventory_tb|Invoice|invoice_tb|Product|product_detail_tb|User|user_tb|branchinventory|branch_inventory_tb"};
//     getTotals(requestData);
// }, 5000); //600000


const reveal = (identifier) => {
    let number = 0;
    const trp = document.querySelectorAll(`.${identifier}revealer`);
    trp.forEach((tr, index)=> {
        tr.classList.remove('unrevealed');
        let duration = ((index+1)/trp.length);
        tr.style.animationDuration = `${duration}s`;
    });
}

const renderPageData = (data, count = 0, identifier, revealed = 'unrevealed') => {
    let bg;    
    let itemContainer = document.getElementById(`${identifier}s_list`);
    let templateString = '';
    let modifiedTemplateString = ``;
    switch(identifier){
        case 'product':
            templateString = '';
            modifiedTemplateString = `

                                <tr>
                                    <th><span>Name</span></th>
                                    <th><span>Category</span></th>
                                    <th><span>Buy</span></th>
                                    <th><span>Sale</span></th>
                                    <th <<span>Brand</span></th>
                                    <th><span>S.Scheme</span></th>
                                    <th <<span>Code</span></th>
                                    <th><span>Supplier</span></th>
                                </tr>
            `;
            if(data.length > 0){
                data.forEach((itemDetails, index) => {
                    templateString = `
                        <tr class="item-details ${revealed} ${identifier}revealer">
                            <td data-d-type="text"><label class="counter">${count + 1}</label></td>
                            <td data-d-type="text" class="editable-data directInput" data-info="productList" data-action="negative" data-name="product_name"><label class="fixed-width">${itemDetails.name}</label></td>
                            <td data-d-type="text">
                                <label class="action">
                                    <span class="material-symbols-outlined primary inline-edit" data-id="${itemDetails.id}" data-tb="product" data-index="${index}">edit</span>
                                    <span class="material-symbols-outlined danger inline-delete" data-id="${itemDetails.id}" data-tb="product" data-tbl="product_detail_tb" data-field='product_id' data-index="${index}">close</span>
                                </label>
                            </td>
                            <td data-d-type="text" class="editable-data select-data categoryList" data-name="category_id"><label class="category">${itemDetails.category_name}</label></td>
                            <td data-d-type="int" class="editable-data" data-name="buy_price"><label class=" warning">${itemDetails.buy_price}</label></td>
                            <td data-d-type="int" class="editable-data" data-name="sale_price"><label class=" success">${itemDetails.sale_price}</label></td>
                            <td data-d-type="text" class="editable-data select-data brandList" data-name="brand_id"><label class="brand">${itemDetails.brand_name}</label></td>
                            <td data-d-type="text" class="editable-data select-data sizeSchemeList" data-name="size_scheme_id"><label class="sizing">${itemDetails.scheme_name}</label></td>
                            <td data-d-type="text" class="editable-data directInput" data-info="productList" data-action="negative" data-name="code_initual"><label class=" primary">${itemDetails.code_initual}</label></td>
                            <td data-d-type="text" class="editable-data select-data supplierList" data-name="supplier_id"><label class="supplier">${itemDetails.supplier}</label></td>
                        </tr>
                    `;
                    itemContainer.insertAdjacentHTML('beforeend', templateString);
                    count++;
                    // MODIFIED FOR EXPORT
                    modifiedTemplateString += `
                        <tr>
                            <td data-d-type="text" class="editable-data directInput" data-info="productList" data-action="negative" data-name="product_name"><label class="fixed-width">${itemDetails.name}</label></td>
                            <td data-d-type="text" class="editable-data select-data categoryList" data-name="category_id"><label class="category">${itemDetails.category_name}</label></td>
                            <td data-d-type="int" class="editable-data" data-name="buy_price"><label class=" warning">${itemDetails.buy_price}</label></td>
                            <td data-d-type="int" class="editable-data" data-name="sale_price"><label class=" success">${itemDetails.sale_price}</label></td>
                            <td data-d-type="text" class="editable-data select-data brandList" data-name="brand_id"><label class="brand">${itemDetails.brand_name}</label></td>
                            <td data-d-type="text" class="editable-data select-data sizeSchemeList" data-name="size_scheme_id"><label class="sizing">${itemDetails.scheme_name}</label></td>
                            <td data-d-type="text" class="editable-data directInput" data-info="productList" data-action="negative" data-name="code_initual"><label class=" primary">${itemDetails.code_initual}</label></td>
                            <td data-d-type="text" class="editable-data select-data supplierList" data-name="supplier_id"><label class="supplier">${itemDetails.supplier}</label></td>
                        </tr>
                    `;
                });
                // ADD EVENT LISNER FOR EDITING TABLE DATA
                inlineTableClickActions('Products', 8, 'updateProduct');
                itemContainer.parentElement.parentElement.lastElementChild.innerHTML = ('beforeend', modifiedTemplateString);

            }else{
                templateString = `
                    <tr>
                        <td colspan='10'><label class="warning">nothing Found</label></td>
                    </tr>
                `;
                itemContainer.innerHTML = templateString;
            }
            generateTblTitleFilter('Product', 'category_id', 'filter_by_category', 'category');            filterByLimit('Product', 'category_id', 'filter_by_category', 'category');
        break;

        case 'warehouseinventory':
            templateString = '';
            modifiedTemplateString = `
                        <tr>
                            <th><span>Name</span></th>
                            <th><span>Qty</span></th>
                            <th><span>Status</span></th>
                            <th><span>Code</span></th>
                            <th><span>Colour</span></th>
                            <th><span>Size</span></th>
                            <th><span>Description</span></th>
                        </tr>
                        `;
            if(data.length > 0){
                data.forEach((itemDetails, index) => {
                    bg = (index%2 == 0) ? 'white' : 'ghostwhite';
                    templateString = `

                            <tr class="${bg} ${revealed} ${identifier}revealer" data-identifier="warehouseinventorys_list">
                                <td><label class="counter">${count + 1}</label></td>
                                <td data-d-type="text" class="editable-data select-data productList"  name="autoBased" data-auto-based="${itemDetails.name}" data-action="negative" data-name="product_id"><label class="fixed-width">${itemDetails.name}</label></td>
                                <td data-d-type="text">
                                    <label class="action">
                                        <span class="material-symbols-outlined primary inline-edit" data-id="${itemDetails.id}" data-tb="warehouseinventory" data-index="${index}">edit</span>
                                        <span class="material-symbols-outlined danger inline-delete" data-id="${itemDetails.id}" data-tb="warehouseinventory" data-tbl="warehouseInventory_tb" data-field='inventory_id' data-index="${index}">close</span>
                                    </label>
                                </td>
                                <td data-d-type="text" class="editable-data" data-name="quantity"><label>${itemDetails.quantity}</label></td>
                                <td data-d-type="text">${(itemDetails.quantity > 0) ? '<label class="success">Available</label>': '<label class="warning">Out of Stork</label>'}</td>
                                <td data-d-type="text" >
                                    <div class="image">
                                        <img src="./images/${itemDetails.image}" alt="">
                                        <label for="upload-product-image" title="Click to choose new image to upload">
                                            <span class="material-symbols-outlined">cloud_sync</span>
                                            <input type="file" id="upload-product-image">
                                        </label>
                                    </div>
                                    <img src="./images/${itemDetails.image}" class="preview-image">
                                </td>
                                <td data-d-type="text" class="editable-data  directInput"  data-action="negative" data-name="code"><label class="primary">${itemDetails.code}</label></td>
                                <td data-d-type="text" class="editable-data  select-data colorList" name="autoBased" data-auto-based="${itemDetails.color}"   data-action="negative" data-name="colour_id"><label class="">${itemDetails.color}</label></td>
                                <td data-d-type="text" class="editable-data  select-data sizeList" name="autoBased" data-auto-based="${itemDetails.size}"   data-action="negative" data-name="size_id"><label>${itemDetails.size}</label></td>
                                <td data-d-type="text" class="editable-data  autogenerated"  data-action="negative" data-name="description"><label class="fixed-width">${itemDetails.desc}</label></td>
                            </tr> 


                    `;
                    itemContainer.insertAdjacentHTML('beforeend', templateString);
                    count++;
                    // MODIFIED FOR EXPORT
                    modifiedTemplateString += `
                        <tr class="${bg} ${revealed} ${identifier}revealer">
                                <td class="inventory-data select-data" data-product-list='[{"name": "5.11 Roundneck Longsleeve T-Shirts"},{"name": "Under Armour Fish T-Shirt Polo"}, {"name": "Nike Sweaters"}]'><label class="fixed-width">${itemDetails.name}</label></td>
                                <td class="inventory-data  "><label class="counter">${itemDetails.quantity}</label></td>
                                <td class="inventory-data select-data" data-status-list='[{"name": "Pending"},{"name": "Out of Stock"}, {"name": "Available"}]'><label class="success">${(itemDetails.quantity > 0) ? 'Available': 'Out of Stork'}</label></td>
                                <td class="inventory-data  "><label class="primary">${itemDetails.code}</label></td>
                                <td class="inventory-data  "><label class="">${itemDetails.color}</label></td>
                                <td class="inventory-data  "><label class="counter">${itemDetails.size}</label></td>
                                <td class="inventory-data  "><label class="fixed-width">${itemDetails.desc}</label></td>
                            </tr> 
                    `;
                });

                // ADD EVENT LISNER FOR EDITING TABLE DATA
                inlineTableClickActions('WarehouseInventorys', 6, 'updateWarehouseinventory');
                itemContainer.parentElement.parentElement.lastElementChild.innerHTML = ('beforeend', modifiedTemplateString);

            }else{
                templateString = `
                    <tr>
                        <td colspan='10'><label class="warning">nothing Found</label></td>
                    </tr>
                `;
                itemContainer.innerHTML = templateString;
            }
            generateTblTitleFilter('WarehouseInventory', 'brand_id', 'filter_by_brand', 'brand');
            filterByLimit('WarehouseInventory', 'brand_id', 'filter_by_brand', 'brand');
        
        break;
        case 'branchinventory':
            templateString = '';
            modifiedTemplateString = `
                        <tr>
                            <th><span>Name</span></th>
                            <th><span>Qty</span></th>
                            <th><span>Status</span></th>
                            <th><span>Branch</span></th>
                            <th><span>Code</span></th>
                            <th><span>Colour</span></th>
                            <th><span>Size</span></th>
                            <th><span>Description</span></th>
                        </tr>
                        `;
            if(data.length > 0){
                let corespondingWarehouseInfo = {};
                data.forEach((itemDetails, index) => {
                    site.warehouseinventoryList.forEach(info => {
                        if(Number(info.id) == itemDetails.warehouse_inventory_id){
                            corespondingWarehouseInfo = info;
                            // console.log(info)
                            // console.log(itemDetails)
                            // console.log('_________________New_________________');
                        }
                    })
                    templateString = `

                            <tr class="${revealed} ${identifier}revealer" data-identifier="branchinventorys_list" data-name="branchinventoryList" >
                                <td><label class="counter">${count + 1}</label></td>
                                <td data-d-type="text" class="editable-data select-data warehouseinventoryList" data.data-piece='main' name="autoBased" data-auto-based="${itemDetails.name}" data-action="negative" data-name="warehouse_inventory_id"><label class="fixed-width">${itemDetails.name}</label></td>

                                <td data-d-type="text" data-info='${JSON.stringify(corespondingWarehouseInfo)}'>
                                    <label class="action">
                                        <span class="material-symbols-outlined primary inline-edit"  data-info='${JSON.stringify(itemDetails)}' data-id="${itemDetails.id}" data-tb="branchinventory" data-index="${index}">edit</span>
                                        <span title="return to warehouse" class="material-symbols-outlined warning inline-return" data-info='${JSON.stringify(itemDetails)}' data-id="${itemDetails.id}" data-tb="branchinventory" data-tbl="branch_inventory_tb" data-field='inventory_id' data-index="${index}">sync</span>
                                    </label>
                                </td>
                                <td data-d-type="text" class="editable-data select-data branchList"  name="autoBased" data-auto-based="${itemDetails.name}" data-action="negative" data-name="branch_id"><label>${itemDetails.branch_name}</label></td>
                                <td data-d-type="text" class="editable-data select-data colorList" name="autoBased" data-auto-based="${itemDetails.color}"   data-action="negative" data-name="colour_id"><label class="">${itemDetails.color}</label></td>
                                <td data-d-type="text" class="editable-data select-data sizeList" name="autoBased" data-auto-based="${itemDetails.size}"   data-action="negative" data-name="size_id"><label>${itemDetails.size}</label></td>
                                <td data-d-type="text" class="directInput"  data-action="negative" data-name="code"><label class="primary">${itemDetails.code}</label></td>
                                <td data-d-type="text" class="editable-data editable-data" data-name="quantity"><label>${itemDetails.quantity}</label></td>
                                <td data-d-type="text" data-name="availableQuantity"><label>${itemDetails.availableQuantity}</label></td>
                                <td data-d-type="text">${(itemDetails.quantity > 0) ? '<label class="success">Available</label>': '<label class="warning">Out of Stork</label>'}</td>
                                <td data-d-type="text" class="autogenerated"  data-action="negative" data-name="description"><label class="fixed-width">${itemDetails.desc}</label></td>
                            </tr> 


                    `;
                    itemContainer.insertAdjacentHTML('beforeend', templateString);
                    count++;
                    // MODIFIED FOR EXPORT
                    modifiedTemplateString += `
                        <tr class="${bg} ${revealed} ${identifier}revealer">
                            <td class="inventory-data select-data"><label class="fixed-width">${itemDetails.name}</label></td>
                            <td class="inventory-data  "><label class="counter">${itemDetails.quantity}</label></td>
                            <td class="inventory-data select-data"><label class="success">${(itemDetails.quantity > 0) ? 'Available': 'Out of Stork'}</label></td>
                            <td data-d-type="text" class="editable-data select-data "><label>${itemDetails.branch_name}</label></td>
                            <td class="inventory-data  "><label class="primary">${itemDetails.code}</label></td>
                            <td class="inventory-data  "><label class="">${itemDetails.color}</label></td>
                            <td class="inventory-data  "><label class="counter">${itemDetails.size}</label></td>
                            <td class="inventory-data  "><label class="fixed-width">${itemDetails.desc}</label></td>
                        </tr> 
                    `;
                });

                // ADD EVENT LISNER FOR EDITING TABLE DATA
                inlineTableClickActions('BranchInventorys', 5, 'updateBranchinventory');
                itemContainer.parentElement.parentElement.lastElementChild.innerHTML = ('beforeend', modifiedTemplateString);

            }else{
                templateString = `
                    <tr>
                        <td colspan='10'><label class="warning">nothing Found</label></td>
                    </tr>
                `;
                itemContainer.innerHTML = templateString;
            }
            generateTblTitleFilter('BranchInventory', 'branch_id', 'filter_by_branch', 'branch');
            filterByLimit('BranchInventory', 'branch_id', 'filter_by_branch', 'branch');
        
        break;


        case 'user':
            templateString = '';
            if(data.length > 0){
                data.forEach((itemDetails, index) => {
                    bg = (index%2 == 0) ? 'white' : 'ghostwhite';
                    templateString = `
                            
                            <tr class="${bg} ${revealed} ${identifier}revealer">
                                <td><label class="counter">${count + 1}</label></td>
                                <td class="user-data"><label class="short-fixed">${itemDetails.first_name}</label></td>
                                <td class="user-data"><label class="short-fixed">${itemDetails.username}</label></td>
                                <td class="inventory-data "><label class="password">*******************</label></td>
                                <td>
                                    <label class="action">
                                        <span class="material-symbols-outlined primary inline-edit">edit</span>
                                        <span class="material-symbols-outlined danger  inline-delete">close</span>
                                        <span class="material-symbols-outlined warning inline-check">sync</span>
                                    </label>
                                </td>
                                <td class="user-data select-data" data-user-type-list='[{"name": "Attendant"},{"name": "Admin"}, {"name": "Customer"}]'><label class="primary">${itemDetails.user_type}</label></td>
                                <td class="inventory-data select-data" data-status-list='[{"name": "Pending"},{"name": "Out of Stock"}, {"name": "Available"}]'><label class="success counter">${itemDetails.status}</label></td>
                                <td class="inventory-data  ">
                                    <div class="image">
                                        <img src="./images/${itemDetails.image}" alt="">
                                        <label for="upload-product-image" title="Click to choose new image to upload">
                                            <span class="material-symbols-outlined">cloud_sync</span>
                                            <input type="file" id="upload-product-image">
                                        </label>
                                    </div>
                                    <img src="./images/${itemDetails.image}" class="preview-image">
                                </td>
                                <td class="user-data"><label>${itemDetails.telephone}</label></td>
                                <td class="user-data select-data" data-branch-list='[{"name": "Victoria Mall"},{"name": "Purical Hotel"}, {"name": "Arena Mall"}]'><label>${itemDetails.branch}</label></td>
                                <td class="user-data"><label>${itemDetails.address}</label></td>
                                <td class="user-data  "><label class="fixed-width">${itemDetails.email}</label></td>
                            </tr> 

                    `;
                    itemContainer.insertAdjacentHTML('beforeend', templateString);
                    count++;
                });
            }else{
                templateString = `
                    <tr>
                        <td colspan='10'><label class="warning">nothing Found</label></td>
                    </tr>
                `;
                itemContainer.innerHTML = templateString;
            }
        break;
        case 'supplier':
            templateString = '';
            if(data.length > 0){
                data.forEach((itemDetails, index) => {
                    bg = (index%2 == 0) ? 'white' : 'ghostwhite';
                    templateString = `
                            <tr class="${bg} ${revealed} ${identifier}revealer">
                                <td><label class="counter">${count + 1}</label></td>
                                <td class="user-data"><label class="short-fixed">${itemDetails.first_name}</label></td>
                                <td class="user-data"><label class="short-fixed">${itemDetails.last_name}</label></td>
                                <td>
                                    <label class="action">
                                        <span class="material-symbols-outlined primary all-inventory-edit">edit</span>
                                        <span class="material-symbols-outlined danger all-inventoy-delete">close</span>
                                        <span class="material-symbols-outlined warning all-inventory-check">sync</span>
                                    </label>
                                </td>
                                <td class="user-data"><label>${itemDetails.telephone}</label></td>
                                <td class="user-data"><label>${itemDetails.address}</label></td>
                                <td class="inventory-data select-data" data-status-list='[{"name": "Pending"},{"name": "Out of Stock"}, {"name": "Available"}]'><label class="success counter">active</label></td>
                                <td class="user-data"><label class="price warning">${itemDetails.date}</label></td>
                                <td class="user-data"><label class="fixed-width">${itemDetails.email}</label></td>
                            </tr>


                    `;
                    itemContainer.insertAdjacentHTML('beforeend', templateString);
                    count++;
                });
            }else{
                templateString = `
                    <tr>
                        <td colspan='10'><label class="warning">nothing Found</label></td>
                    </tr>
                `;
                itemContainer.innerHTML = templateString;
            }
        break;
        case 'invoice':
            console.log(data)
            templateString = '';
            if(data.length > 0){
                data.forEach((itemDetails, index) => {
                    // console.log(itemDetails)
                    templateString = `
                            <tr class="${revealed} ${identifier}revealer">
                                <td><label class="counter">${count + 1}</label></td>
                                <td class="user-data"><label>${itemDetails.branch}</label></td>
                                <td>
                                    <label class="action">
                                        <span class="material-symbols-outlined primary inline-edit"  data-id="${itemDetails.invoice_no}" data-tb="invoice" data-index="${index}">edit</span>
                                        <span class="material-symbols-outlined warning inline-return"  data-id="${itemDetails.invoice_no}" data-tb="invoice" data-index="${index}">sync</span>
                                        <span class="material-symbols-outlined success showinvoicedetails-btn"  data-id="${itemDetails.invoice_no}" data-tb="invoice" data-index="${index}">add</span>
                                    </label>
                                </td>

                                <td class="user-data count"><label class="short-fixed">${itemDetails.invoice_no}</label></td>
                                <td class="user-data count"><label class="short-fixed">${itemDetails.totalItems}</label></td>
                                <td class="user-data"><label>${itemDetails.totalPrice}</label></td>
                                <td class="inventory-data select-data" ><label >${itemDetails.attendant}</label></td>
                                <td class="user-data"><label class="price warning">${itemDetails.date}</label></td>
                                <td class="user-data"><label class="">${itemDetails.payment_type_name}</label></td>
                                <td class="user-data  "><label class="">${itemDetails.customer_name}</label></td>
                                <td class="det">
                                    ${generateInvoiceItems(itemDetails.invoiceDetails)}
                                </td>
                            </tr>


                    `;
                    itemContainer.insertAdjacentHTML('beforeend', templateString);
                    count++;
                });

                // inlineSaleActions();
                removeElement('div.preloader');
            }else{
                templateString = `
                    <tr>
                        <td colspan='10'><label class="warning">nothing Found</label></td>
                    </tr>
                `;
                itemContainer.innerHTML = templateString;
                removeElement('div.preloader');
            }
            generateTblTitleFilter('Sale', 'payment_type_name', 'filter_by_payment_type', 'paymentType');            
            generateTblTitleFilter('Sale', 'branch', 'filter_by_branch', 'branch');            
            // filterByLimit('Product', 'category_id', 'filter_by_category', 'category');
            // filterByLimit('Product', 'category_id', 'filter_by_category', 'category');
            // filterByLimit('Sale', 'branch_id', 'filter_by_branch', 'branch'); outletV

        break;
    }
    removeElement('div.preloader');
    reveal(identifier);
}
const inlineSaleActions =() =>{
    let invoiceTrs = document.getElementById('invoices_list').children;
    let tr = '';
    let inlineBtns = [];
    let trBtns = [];
    for (var i = invoiceTrs.length - 1; i >= 0; i--) {
        tr = invoiceTrs[i];
        let oldData = JSON.parse(tr.children[10].children[0].dataset.info);

        trBtns = (tr.children[2].children[0].children);
        for (var x = trBtns.length - 1; x >= 0; x--) {
            let inlineBtn = trBtns[x];
            inlineBtn.addEventListener('click', (e) => {
                let editBox = (inlineBtn.parentElement.parentElement.parentElement.children[10].children[0].children)
                let invoiceHeader = editBox[0];
                // console.log(invoiceHeader.children[0].children[0])
                let purchaseDateInput = invoiceHeader.children[3].children[1];
                let branchSelectInput = invoiceHeader.children[2].children[1];
                let attendantSelectInput = invoiceHeader.children[1].children[1].children[1];

                let pricing = invoiceHeader.children[4].children;
                let totalInvoicePrice = (pricing[1].children[1].children[0])
                let currencySelectInput = (pricing[1].children[1].children[1])
                let discountSelectInput = (pricing[2].children[1])
                let paymentTyepSelectInput =  (pricing[3].children[1]);

                let customerDetails = invoiceHeader.children[5].children;
                let fnameInput = (customerDetails[1].children[1])
                let lnameInput = (customerDetails[2].children[1])
                let emailInput = (customerDetails[3].children[1])
                let phoneNumberInput = (customerDetails[4].children[1])

                // console.log(purchaseDateInput, branchSelectInput, attendantSelectInput, totalInvoicePrice, curency, discountSelectInput, paymentTyepSelectInput, fnameInput, lnameInput, emailInput, phoneNumberInput);

                let invoiceItemsBox = editBox[1].children;
                let invoiceNoHeader = invoiceItemsBox[0];

                let invoiceItems = invoiceItemsBox[1].children;

                // console.log(invoiceItems)
                let besicData = invoiceItems[0];
                let otherData = invoiceItems[1];
                // console.log(invoiceNoHeader, besicData, otherData);

                let priceInput = besicData.children[5].children[1].children[0];
                let codeHolder = besicData.children[4].children[1];

                // console.log(priceInput, increaseQuantity, decreaseQuantity, quantityInput)
                // console.log(quantityInput, purchaseDateInput, branchSelectInput, attendantSelectInput, totalInvoicePrice, curency, discountSelectInput, paymentTyepSelectInput, fnameInput, lnameInput, emailInput, phoneNumberInput);

                let descTexarea = otherData.children[0].children[1];
                // console.log(descTexarea)

                let colorListBox = otherData.children[2];
                let colorList = colorListBox.children;
                let sizeListBox= otherData.children[4];
                let sizeList = sizeListBox.children;

                let quantityAdjuster = besicData.children[6].children[1].children;
                let quantityInput = quantityAdjuster[1];

                let newData = colorClickAction(colorList, sizeListBox, [codeHolder, descTexarea, inlineBtn, quantityInput, totalInvoicePrice, priceInput, codeHolder]);
                newData = sizeClickAction(sizeList, [codeHolder, descTexarea, inlineBtn, quantityInput, totalInvoicePrice, priceInput]);

                let branchAvailableQuantity = newData.availableQuantity;
                let increaseQuantity = quantityAdjuster[2];
                let decreaseQuantity = quantityAdjuster[0];
                increaseQuantity.addEventListener('click', () => {
                    quantityInput.value = (Number(quantityInput.value) < Number(branchAvailableQuantity)) ? Number(quantityInput.value) + 1 : Number(quantityInput.value)
                    if(Number(priceInput.value)){
                        totalInvoicePrice.textContent = addComma((Number(quantityInput.value) * Number(priceInput.value)).toString());
                    }
                });
                decreaseQuantity.addEventListener('click', () => {
                    quantityInput.value = (Number(quantityInput.value) > 0) ? Number(quantityInput.value) - 1 : Number(quantityInput.value)
                    if(Number(priceInput.value)){
                        totalInvoicePrice.textContent = addComma((Number(quantityInput.value) * Number(priceInput.value)).toString());
                    }
                });

                priceInput.addEventListener('input', ()=> {
                    // console.log(Number(priceInput.value))
                    if(Number(priceInput.value)){
                        totalInvoicePrice.textContent = addComma((Number(quantityInput.value) * Number(priceInput.value)).toString());
                    }
                })

                if(inlineBtn.textContent == 'edit'){
                    inlineBtn.textContent = 'save_as';
                    revealDetails(inlineBtn.parentElement.children[2], i);
                }
                else if(inlineBtn.textContent == 'save_as'){
                    inlineBtn.textContent = 'edit';
                    revealDetails(inlineBtn.parentElement.children[2], i);
                    let payment_type = (site.paymentTypeList.filter(type => type.name == paymentTyepSelectInput.value)[0])
                    let discount = (site.discountList.filter(discount => discount.name == discountSelectInput.value)[0])
                    let currency = (site.currencyList.filter(currency => currency.symbol == currencySelectInput.value)[0])
                    updateData = {
                        'remarks': descTexarea.value,
                        'purchase_date': purchaseDateInput.value,
                        'branch': branchSelectInput.value,
                        'attendant': attendantSelectInput.value,
                        'price':  priceInput.value,
                        'discount_id': discount.id,
                        'payment_type_id': payment_type.id,
                        'currency': currency.symbol,
                        'rate': currency.rate,
                        'fnameInput': fnameInput.value,
                        'lnameInput': lnameInput.value,
                        'emailInput': emailInput.value,
                        'phoneNumberInput': phoneNumberInput.value,
                        'newQuantity': Number(besicData.children[6].children[1].children[1].value), 
                        'oldQuantity': oldData.purchase_quantity, 
                        'oldInventory_id': oldData.inventory_id, 
                        'newInventory_id': newData.inventory_id, 
                        'purchase_id': oldData.purchase_id, 
                        'purchase_id': oldData.purchase_id, 
                    }
                    console.log(updateData);
                    requestDataChange(updateData, inlineBtn, 'updateSale', 'update');
                    // console.log(newData)
                }
                else if(inlineBtn.textContent == 'sync'){

                }
                else{
                    inlineBtn.parentElement.children[0].textContent = 'edit';
                    revealDetails(inlineBtn.parentElement.children[2], i);
                    // console.log(inlineBtn.parentElement.children[2]) itemDetails.product_colors, itemDetails.colour_name 
                }
            })
            
        }
    }
}   
const sizeClickAction= (list, changeLing) => {
    let res = [];
    for (var i = list.length - 1; i >= 0; i--) {
        let item = list[i];
        item.addEventListener('click', () => {
            for (var j = list.length - 1; j >= 0; j--) {
                list[j].classList.remove('active');
                item.classList.add('active');
                if(item.classList.contains('active')){
                    let info = JSON.parse(item.dataset.sizeInfo);
                    changeLing[0].textContent = info.code;
                    changeLing[1].value = info.remarks;
                    changeLing[3].value = 1;
                    changeLing[4].textContent = info.sale_price;
                    changeLing[5].value = info.sale_price;
                    res = info;
                    console.log(changeLing[0])
                    console.log(JSON.parse(item.dataset.sizeInfo))
                }
            }
        });
        if(item.classList.contains('active')){
            let info = JSON.parse(item.dataset.sizeInfo);
            changeLing[0].textContent = info.code;
            changeLing[1].value = info.remarks;
            changeLing[3].value = 1;
            changeLing[4].textContent = info.sale_price;
            changeLing[5].value = info.sale_price;
            res = info;
            // console.log(changeLing[0])
            // console.log(JSON.parse(item.dataset.sizeInfo))
        }
    }
    return res;

}
const colorClickAction = (list, sizeListBox, changeLing) => {
    let res = [];
    for (var i = list.length - 1; i >= 0; i--) {
        let listItem = list[i];
        listItem.addEventListener('click', () => {
            for (var j = list.length - 1; j >= 0; j--) {
                list[j].classList.remove('active');
                listItem.classList.add('active');
            }
            if( listItem.classList.contains('active')){
                console.log(JSON.parse(listItem.dataset.colorSizes))
                let color_products_sizes = JSON.parse(listItem.dataset.colorSizes);
                let availableSize = listItem.children[0];
                availableSize.textContent = color_products_sizes.length;
                // listItem
                let colour_name = listItem.innerHTML.split('<small>')[0];
                let size_innitual = color_products_sizes[0].size_innitual;
                console.log(size_innitual, colour_name)

                let templateString = '';
                color_products_sizes.forEach(itemDetails => {
                    console.log(itemDetails)
                    templateString += `
                        <i onclick=""  data-size-info='${JSON.stringify(itemDetails)}' class="${(itemDetails.size_innitual == size_innitual) ? 'update_sale_size active' : 'update_sale_size'}">${itemDetails.size_innitual}<small>${itemDetails.availableQuantity}</small></i>
                    `;
                })
                sizeListBox.innerHTML = templateString;
                sizeList = sizeListBox.children;
                res = sizeClickAction(sizeList, changeLing);

            }
        });
    }
    return res;
}
function export_table_to_csv (table, csv_name, download_link) {
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
// ADD NEW ROW TO THE TABLE run
const addTableRow = (btn, identifier, itemSpecification, expectedTblFields, requestAction) => {
    btn.addEventListener('click', (e) => {
        if(btn.childNodes[1].textContent == 'add'){
            let tr = document.createElement('tr');
            tr.classList.add(`${itemSpecification}`);
            tr.classList.add(`${itemSpecification}-add`);
            /* 
                IF THERE'S ANY NEW INLINE TABLE DATA 
                ENTRY ROWS REMOVE THEM BEFORE ADD ANEW ONE
            */
            document.querySelectorAll(`.${itemSpecification}-add`).forEach(newTr => {
                newTr.remove();
            });
            // ADD TABLE DATA ENTRY ROW
            document.getElementById(identifier).prepend(tr);
            let activeTr = document.querySelector(`.${itemSpecification}-add`);
            let removeBtn = '';
            switch(identifier){
                case 'products_list':
                    activeTr.innerHTML = generateProductTR();
                    activeTr.dataset.name = "productList";
                    activeTr.dataset.secondary = "warehouseinventoryList";
                    activeTr.dataset.taxiary = "branchinventoryList";

                    // CANCEL NEW DATA ENTRY ROW
                    // removeBtn = activeTr.children[2].children[0].children[1];
                    activeTr.children[2].children[0].children[1].addEventListener('click', () => {
                        if(!document.getElementById('warningBox')){
                            document.querySelector(`#products_list`).before(warningNotification(`Cancel Operation and exit`));
                            let warningBoxBtns = document.querySelectorAll('#warningBox button');
                            warningBoxBtns.forEach(actionBtn => actionBtn.addEventListener('click', () => {
                                if(actionBtn.childNodes[1].textContent == 'Continue'){
                                    document.getElementById('warningBox').remove();
                                    activeTr.remove();
                                }else{
                                    document.getElementById('warningBox').remove();
                                }
                            }));
                        }
                    });

                break;
                case 'warehouseinventorys_list':
                    activeTr.innerHTML = generateInventoryTR();
                    activeTr.dataset.name = "warehouseinventoryList";
                    activeTr.dataset.secondary = "branchinventoryList";
                    activeTr.dataset.taxiary = "empty";
                    // CANCEL NEW DATA ENTRY ROW
                    // removeBtn = activeTr.children[2].children[0].children[1];
                    activeTr.children[2].children[0].children[1].addEventListener('click', () => {
                        if(!document.getElementById('warningBox')){
                            document.querySelector(`#warehouseinventorys_list`).before(warningNotification(`Cancel Operation and exit`));
                            let warningBoxBtns = document.querySelectorAll('#warningBox button');
                            warningBoxBtns.forEach(actionBtn => actionBtn.addEventListener('click', () => {
                                if(actionBtn.childNodes[1].textContent == 'Continue'){
                                    document.getElementById('warningBox').remove();
                                    activeTr.remove();
                                }else{
                                    document.getElementById('warningBox').remove();
                                }
                            }));
                        }
                    });

                break;
                case 'branchinventorys_list':
                    activeTr.innerHTML = generateBranchInventoryTR();
                    activeTr.dataset.name = "branchinventoryList";
                    activeTr.dataset.secondary = "warehouseinventoryList";
                    activeTr.dataset.taxiary = "empty";

                    // CANCEL NEW DATA ENTRY ROW
                    let removeBtn = activeTr.children[2].children[0].children[1];
                    removeBtn.addEventListener('click', () => {
                        if(!document.getElementById('warningBox')){
                            document.querySelector(`#branchinventorys_list`).before(warningNotification(`Cancel adding new inventory product to branch`));
                            let warningBoxBtns = document.querySelectorAll('#warningBox button');
                            warningBoxBtns.forEach(actionBtn => actionBtn.addEventListener('click', () => {
                                if(actionBtn.childNodes[1].textContent == 'Continue'){
                                    document.getElementById('warningBox').remove();
                                    activeTr.remove();
                                }else{
                                    document.getElementById('warningBox').remove();
                                }
                            }));
                        }
                    });
                break;

            }
            // activeTr.innerHTML = (identifier == 'products_list') ? generateProductTR () : generateInventoryTR();
            // btn.childNodes[1].textContent = (btn.childNodes[1].textContent == 'add') ? 'save' : 'add';
            validateNewRowInputs(activeTr, `add${identifier}`);
            // validateInputs(btn);
            // SAVE ACTION BTN
            saveNewRow(itemSpecification, expectedTblFields, requestAction);
            // console.log(requestAction) 
        }
    });
}
const validateNewRowInputs = (tr, identifier) => {
    let temp = [];
    let td = '', inputValue, productName;
    let piece = '', data = "", main = '',children = '';
    console.log(identifier)
    switch(identifier){
        case 'addbranchinventorys_list':
            let addinventoryProductColors = [];
            let addinventoryProductSizes = [];
            children = tr.children;
            // GET INPUT FIELDS AND DATALIST
            let addproductNameInput = children[1].children[0].children[0];
            let addproductNameDataList = children[1].children[0].children[1];
            let addbranchInput = children[3].children[0].children[0];
            let addbranchDataList = children[3].children[0].children[1];
            let addcolorInput = children[4].children[0].children[0];
            let addcolorDataList = children[4].children[0].children[1];
            let addsizeInput = children[5].children[0].children[0];
            let addsizeDataList = children[5].children[0].children[1];
            let addquantityInput = children[7].children[0].children[0];

            // MAKE SAVE BTN UNCLICKABLE
            let addSaveBtn = children[2].children[0].children[0];
            addSaveBtn.style.pointerEvents = 'none';

            // DISABLE ALL INPUTS IF PRODUCT NAME IS ASSIGNED
            disableOrEnable([addcolorInput, addsizeInput, addquantityInput], 'disabled');


            // ADD EVENT LISNER TO INPUT FILEDS
            // tbInputEvent(input, elementsToEnableArray, dependantInputsArray, dependantDataListArray, dataArray, temp, dataReceiver, children) => {
            tbInputEvent(addproductNameInput, [addbranchInput, addcolorInput], [addcolorInput, addsizeInput], [addcolorDataList, addsizeDataList], [addinventoryProductColors], temp, addcolorDataList, children, 'productName');
            tbInputEvent(addcolorInput, [addsizeInput], [addsizeInput], [addsizeDataList], [addinventoryProductSizes], temp, addsizeDataList, children, 'color');
            tbInputEvent(addsizeInput, [addquantityInput], [addquantityInput], [], [], temp, '', children, 'size');
            // tbInputEvent(addquantityInput, [], [], [], [], temp, '', children, 'quantity');
            // checkInput('keyup', addquantityInput, ['numberExpected', 'muchAvailableQuantity', 'required'], 'branchInventoryQuantity', children);
            checkInput('keyup', addquantityInput, ['updateQuantity'], 'branchInventoryQuantity', children);
            checkInput('keyup', addbranchInput, ['required'], 'branchInventoryQuantity', children);

        break;
        case 'updatebranchinventorys_list':
            let updateinventoryProductColors = [];
            let updateinventoryProductSizes = [];
            children = tr.children;
            // GET INPUT FIELDS AND DATALIST
            let productNameInput = children[1].children[0].children[0];
            let productNameDataList = children[1].children[0].children[1];
            let branchInput = children[3].children[0].children[0];
            let branchDataList = children[3].children[0].children[1];
            let colorInput = children[4].children[0].children[0];
            let colorDataList = children[4].children[0].children[1];
            let sizeInput = children[5].children[0].children[0];
            let sizeDataList = children[5].children[0].children[1];
            let quantityInput = children[7].children[0].children[0];
            // DISABLE ALL INPUTS IF PRODUCT NAME IS ASSIGNED
            // disableOrEnable([productNameInput], 'enable');
            productNameInput.setAttribute('readonly', true);
            // productNameInput.style.pointerEvents = 'none';
            // ADD EVENT LISNER TO INPUT FILEDS
            // tbInputEvent(input, elementsToEnableArray, dependantInputsArray, dependantDataListArray, dataArray, temp, dataReceiver, children) => {
            // tbInputEvent(productNameInput, [branchInput, colorInput], [colorInput, sizeInput], [colorDataList, sizeDataList], [updateinventoryProductColors], temp, colorDataList, children, 'productName');
            tbInputEvent(colorInput, [sizeInput], [sizeInput], [sizeDataList], [updateinventoryProductSizes], temp, sizeDataList, children, 'color');
            tbInputEvent(sizeInput, [], [], [], [], temp, '', children, 'size');
            // checkInput('keyup', addquantityInput, ['numberExpected', 'muchAvailableQuantity', 'required'], 'branchInventoryQuantity', children);
            checkInput('keyup', quantityInput, ['updateQuantity'], 'branchInventoryQuantity', children);
            checkInput('keyup', branchInput, ['required'], 'branchInventoryQuantity', children);
        break;
        case 'addwarehouseinventorys_list':
            let addwarehouseinventoryProductColors = [];
            let addwarehouseinventoryProductSizes = [];
            children = tr.children;
            // GET INPUT FIELDS AND DATALIST
            let addinventoryproductNameInput = children[1].children[0].children[0];
            let addinventoryproductNameDataList = children[1].children[0].children[1];
            let addinventorycolorInput = children[7].children[0].children[0];
            let addinventorycolorDataList = children[7].children[0].children[1];
            let addinventorysizeInput = children[8].children[0].children[0];
            let addinventorysizeDataList = children[8].children[0].children[1];
            let addinventoryquantityInput = children[3].children[0].children[0];

            let addinventoryCodeInput = children[6].children[0].children[0];
            let addinventoryDescInput = children[9].children[0].children[0];

            // MAKE SAVE BTN UNCLICKABLE
            let addinventorySaveBtn = children[2].children[0].children[0];
            addinventorySaveBtn.style.pointerEvents = 'none';
            disableOrEnable([addinventorycolorInput,addinventorysizeInput], 'disabled');

            console.log(children)
            console.log(addinventoryproductNameInput, addinventorycolorInput, addinventorysizeInput, addinventoryquantityInput, addinventoryCodeInput, addinventoryDescInput)
            // ADD EVENT LISNER TO INPUT FILEDS
            // tbInputEvent(input, elementsToEnableArray, dependantInputsArray, dependantDataListArray, dataArray, temp, dataReceiver, children) => {
            tbInputEvent(addinventoryproductNameInput, [addinventorycolorInput,addinventorysizeInput], [addinventoryCodeInput, addinventoryDescInput], [], [], temp, '', children, 'inventoryproductName');
            tbInputEvent(addinventorycolorInput, [], [addinventoryCodeInput, addinventoryDescInput], [], [], temp, '', children, 'inventorycolor');
            tbInputEvent(addinventorysizeInput, [], [addinventoryCodeInput, addinventoryDescInput], [], [], temp, '', children, 'inventorySize');
            
        break;
    }
}
const tbInputEvent = (input, elementsToEnableArray, dependantInputsArray, dependantDataListArray, dataArray, temp, dataReceiver, children, identifier) => {
    input.addEventListener('change', () => {
        // ENABLE DEPENDANT INPUT
        disableOrEnable(elementsToEnableArray, 'enable');

        // RESET ALL DEPENDAT INPUTS
        clearInput(dependantInputsArray, dependantDataListArray);

        // RESET PRODUCT COLOR ARRAY
        dataArray = [];
        // RESET TEMP ARRAY
        temp = [];
        // GET PRODUCT INPUT VALUE
        inputValue = input.value.toLowerCase();
        // GET INPUT TABLE DATA
        td = children[1];
        let res = [];
        let productDetails = [];
        let colorDetails = [];
        switch(identifier){
            // WARE HOUSE INVENTORY VALIDATION
            case 'inventoryproductName':
                // GET PRODUCT DETAILS
                site[td.classList[2]].forEach((info, index) => {
                    if(info.name.toLowerCase() == inputValue){
                        console.log(info)
                        dependantInputsArray[0].value = info.code_initual
                        dependantInputsArray[1].value = info.brand_name+' '+ info.name + ' '+ info.category_name +' ' + dependantInputsArray[1].value.trim();
                    }
                });
            break;
            // WARE HOUSE INVENTORY VALIDATION
            case 'inventorycolor':
                // GET PRODUCT DETAILS
                site[td.classList[2]].forEach((info, index) => {
                    if(info.name.toLowerCase() == children[1].children[0].children[0].value.toLowerCase()){
                        productDetails.push(info)}
                });
                console.log(children)
                if(productDetails.length > 0){
                    site[children[7].classList[2]].forEach((info, index) => {
                        if(info.name.toLowerCase() == inputValue){
                            console.log(info)
                            dependantInputsArray[0].value = productDetails[0].code_initual+''+ info.innitual
                            dependantInputsArray[1].value = productDetails[0].brand_name+' '+ productDetails[0].name + ' '+ productDetails[0].category_name +' '+ info.name;
                        }
                    });
                }
            break;
            // WARE HOUSE INVENTORY VALIDATION
            case 'inventorySize':
                // GET PRODUCT DETAILS
                site[td.classList[2]].forEach((info, index) => {
                    if(info.name.toLowerCase() == children[1].children[0].children[0].value.toLowerCase()){
                        productDetails.push(info);
                    }
                });
                // GET COLOR DETAILS
                site[children[7].classList[2]].forEach((info, index) => {
                    if(info.name.toLowerCase() == children[7].children[0].children[0].value.toLowerCase()){
                        colorDetails.push(info)
                    }
                });
                if(productDetails.length > 0 && colorDetails.length > 0){
                    site[children[8].classList[2]].forEach((info, index) => {
                        if(info.name.toLowerCase() == inputValue){
                            dependantInputsArray[0].value = productDetails[0].code_initual+''+ info.innitual +''+ colorDetails[0].innitual
                            dependantInputsArray[1].value = productDetails[0].brand_name+' '+ productDetails[0].name + ' '+ productDetails[0].category_name +' '+ colorDetails[0].name+' '+ info.innitual;
                        }
                    });
                }
            break;
            // BRACH INVENTORY ENTRY VALIDATION
            default:
                // GET AVAILABLE PRODUCT COLORS/SIZES/DETAILS IN WAREHOUSE INVENTORY
                site[td.classList[2]].forEach((info, index) => {
                    if(identifier == 'color'){
                        temp = getInventorySizeList(info,  input, children, temp, elementsToEnableArray);
                    }else if(identifier == 'productName'){
                        temp = getInventoryColorList(info, index, input, children, temp, elementsToEnableArray);

                        // RESET WARE HOURE INVENTORY QUANTITY BACK TO NORMAL
                        setTimeout(()=>{
                            if(Object.keys(children[2].dataset).length > 1){
                                let dataRow = JSON.parse(children[2].dataset.info);
                                if(Number(dataRow.id) == Number(info.id)){
                                    site.warehouseinventoryList[index].quantity = dataRow.quantity;
                                }
                            // console.log(site.branchinventoryList);
                                site.branchinventoryList.forEach((data, index) => {
                                    if(Number(dataRow.id) == Number(data.warehouse_inventory_id)){
                                        site.warehouseinventoryList[index].availableQuantity = dataRow.quantity;
                                        console.log(site.warehouseinventoryList[index])
                                    }
                                });
                            }
                        });
                    }else{
                        temp = getInventoryProductDetails(info, input, children, temp, elementsToEnableArray, res);
                        let quantityInput = children[7].children[0].children[0];
                        // console.log(temp)
                        if(temp.includes(true)){
                            disableOrEnable([quantityInput], 'enable');
                        }else{
                            disableOrEnable([quantityInput], 'disabled');
                        }
                    }
                });
                if(identifier !== 'size'){
                    temp.filter(details => {dataArray.push(JSON.parse(details))});
                    // ASSIGN COLOR LIST TO THE COLOR DATALIST
                    dataReceiver.innerHTML = generateOptions(dataArray);
                }

        }
    });
}
const checkInput = (eventType, input, checks, identifier, children = null) => {
    let saveBtn, action, error = false;
    saveBtn = children[2].children[0].children[0];
    input.addEventListener(eventType , () => {
        checks.forEach(check => {
            switch(check){
                case 'required':
                // if(error == false){
                    error = validationCheck((input.value != ''), children, input, []);
                // }
                break
                case 'numberExpected':
                    // if(error == false){
                        if(Number(input.value)){
                            input.style.borderColor ='lime';
                            // saveBtn.style.pointerEvents = 'All';
                            // removeNotification(1);
                            error = false;
                        }else{
                            // saveBtn.style.pointerEvents = 'none';
                            input.style.borderColor ='#f00';
                            // deliverNotification('Number expected eg 4', 'danger');
                            error = true;
                        }
                    // }
                break
                case 'muchAvailableQuantity':
                    // if(error == false){
                        action = (Number(input.value) && Number(children[8].children[0].textContent) >= Number(input.value));
                        error = checkAction(action, input, saveBtn, 'Branch product quantity can\'t be greater than available product quantity in inventory')
                    // }
                break
                case 'updateQuantity':
                    if(identifier == 'branchInventoryQuantity'){
                        // DETAILS FETCHED BASED ON WAREHOUSE INVENTORY TABLE
                        let productInfo = JSON.parse(children[2].dataset.info);
                        // DETAILS FETCHED BASED ON BRANCH INVENTORY TABLE
                        let branchInventoryInfo = JSON.parse(saveBtn.dataset.info);
                        // MATH DATA
                        let availableQuantity = Number(productInfo.quantity);
                        let oldQuantity = Number(branchInventoryInfo.quantity);
                        let maxQuantity = oldQuantity + availableQuantity;
                        let warehouse_inventory_id = productInfo.id;
                        let quantity = Number(input.value);
                        let tbAvailableQty = children[8].children[0];
                        let tbNewAvailableQty = Number(tbAvailableQty.textContent) ;
                        let newAvailableQauntity = (availableQuantity >= tbNewAvailableQty) ? availableQuantity : tbNewAvailableQty; 

                        if(oldQuantity > quantity){
                            tbNewAvailableQty = (availableQuantity >= tbNewAvailableQty) ? availableQuantity : Number(tbAvailableQty.textContent) ;
                            newAvailableQauntity = (((oldQuantity - quantity) + availableQuantity) >= 0) ? ((oldQuantity - quantity) + availableQuantity) : availableQuantity;
                        }else if(oldQuantity < quantity){
                            tbNewAvailableQty = (availableQuantity >= tbNewAvailableQty) ? availableQuantity : Number(tbAvailableQty.textContent) ;
                            newAvailableQauntity = (((tbNewAvailableQty) - quantity) >= 0) ? (tbNewAvailableQty - quantity) : 0;
                        }
                        tbAvailableQty.textContent = (newAvailableQauntity <= maxQuantity) ? newAvailableQauntity : maxQuantity;

                        // console.log(newAvailableQauntity)
                        // console.log(productInfo);
                        // console.log(branchInventoryInfo)
                        // console.log(children[8].children[0]);

                        // input.value = ((Number(input.value) >= 0) && (Number(input.value) <= (maxQuantity)) )? Number(input.value) : 0; afterE

                        if((input.value !='') && (Number(input.value) >= 0) && (Number(input.value) <= maxQuantity)){
                            input.style.borderColor ='lime';
                            saveBtn.style.pointerEvents = 'All';

                            // UPDATE QUANTITYY IN THE WAREHOUSE INVENTORY LIST
                            site.warehouseinventoryList.forEach((data, index) => {
                                if(Number(data.id) == Number(warehouse_inventory_id)){
                                    console.log(data)
                                    site.warehouseinventoryList[index].quantity = newAvailableQauntity;
                                }
                            });
                            // UPDATE QUANTITYY IN THE BRANCH INVENTORY LIST
                            site.branchinventoryList.forEach((data, index) => {
                                if(Number(data.warehouse_inventory_id) == Number(warehouse_inventory_id)){
                                    site.branchinventoryList[index].availableQuantity = newAvailableQauntity;
                                    site.branchinventoryList[index].quantity = quantity;
                                }
                            })

                        }else{
                            saveBtn.style.pointerEvents = 'none';
                            input.style.borderColor ='#f00';
                            error = true;
                        }
                    }
                break
            }

        })

    })

    // return error;
}
const checkAction = (action, input, saveBtn, message) => {
    let error = false;
    if(action){
        // removeNotification(1);
        input.style.borderColor = 'limit';
        input.setAttribute('title', 'valid value');
        // saveBtn.style.pointerEvents = 'All';
        error = false;
    }else{
        input.style.borderColor = '#f00';
        input.setAttribute('title', 'Invalid value');
        // saveBtn.style.pointerEvents = 'none'; 
        // deliverNotification(message, 'danger');
        error =true;
    }
    return error;
}
const getInventorySizeList = (info, input, children, temp, elementsToEnableArray) => {
    let inputValue = input.value.toLowerCase();
    let productName = children[1].children[0].children[0].value.toLowerCase();
    if((info.color.toLowerCase() == inputValue) && (info.name.toLowerCase() == productName) && (Number(info.quantity) > 0)){
        if(!temp.includes(JSON.stringify({'name': info.size}))){
            temp.push(JSON.stringify({'name': info.size}));
        }
    }
    validationCheck((temp.length > 0), children, input, elementsToEnableArray);
    return temp;
}
const getInventoryProductDetails = (info, input, children, temp, elementsToEnableArray, res) => {
    let inputValue = input.value.toLowerCase();
    let productName = children[1].children[0].children[0].value.toLowerCase();
    let color = children[4].children[0].children[0].value.toLowerCase();
    temp = false;

    if((info.size.toLowerCase() == inputValue) && (info.color.toLowerCase() == color) && (info.name.toLowerCase() == productName) && (Number(info.quantity) > 0)){
        console.log(children)
        console.log(children[2].children[0])
        console.log(info)
        console.log(children[2].children[0].children[0].dataset.info);
        let inlineBtns = children[2].children[0].children;
        console.log(inlineBtns.children);
        children[7].children[0].children[0].value = 0;
        // UPDATE INFORMATION ON INLINE BUTTIONS INSIDE THE ACTION th
        site.branchinventoryList.forEach(updateDataCheck => {
            if(
                (Number(info.id) == Number(updateDataCheck.warehouse_inventory_id)) && 
                (info.size.toLowerCase() == updateDataCheck.size.toLowerCase()) && 
                (info.color.toLowerCase() == updateDataCheck.color.toLowerCase()) && 
                (info.name.toLowerCase() == updateDataCheck.name.toLowerCase())
            ){
                console.log(updateDataCheck, info)
                inlineBtns[0].dataset.info = JSON.stringify(updateDataCheck);
                inlineBtns[1].dataset.info = JSON.stringify(updateDataCheck);
                inlineBtns[1].parentElement.dataset.info = JSON.stringify(updateDataCheck);
                inlineBtns[0].dataset.id = updateDataCheck.id;
                inlineBtns[1].dataset.id = updateDataCheck.id;
                inlineBtns[1].dataset.id = updateDataCheck.id;
                // BRANCH INVENTORY QUANTITY
                children[7].children[0].children[0].value = updateDataCheck.quantity;

            }
        })
        // SET WAREHOUSE INVENTORY INFO FOR THE PRODCUT TO ACTION th IN THE TABLE TO BE USED FOR (UPDATE/RETURN)
        children[2].dataset.info = JSON.stringify(info); //valida
        // PRODUCT CODE
        children[6].children[0].textContent = info.code;
        // AVAILABLE QUANTITY
        children[8].children[0].textContent = info.quantity;
        // AVAILABLE QUANTITY
        children[9].innerHTML = Number(info.quantity) > 0 ? '<label class="success">Available</label>' : '<label class="danger">Out of stork</label>';
        // DESCRIPTION
        children[10].children[0].textContent = info.desc;

        temp = true;
    }
    if(temp == true){
        validationCheck(((info.size.toLowerCase() == inputValue) && (info.color.toLowerCase() == color) && (info.name.toLowerCase() == productName) && (Number(info.quantity) > 0)), children, input, elementsToEnableArray);
    }
    res.push(temp)
    return res;
}
const getInventoryColorList = (info, index, input, children, temp, elementsToEnableArray) => {
    let inputValue = input.value.toLowerCase();
    if((info.name.toLowerCase() == inputValue) && (Number(info.quantity) > 0)){
        if(!temp.includes(JSON.stringify({'name': info.color}))){
            temp.push(JSON.stringify({'name': info.color}));
        }
    }
    validationCheck((temp.length > 0), children, input, elementsToEnableArray);

    return temp;
}
const validationCheck = (action, children, input, elementsToEnableArray) => {
    let saveBtn = children[2].children[0].children[0];
    let error = false;
     if(action){
        input.style.borderColor ='lime';
        disableOrEnable(elementsToEnableArray, 'enable');
        error = false;

    }else{
        input.style.borderColor ='#f00';
        disableOrEnable(elementsToEnableArray, 'disabled');
        error = true;
    }
    return error;
}
const disableOrEnable = (elementList, action) => {
    elementList.forEach(element => {
        if(action === 'disabled'){
            element.setAttribute('disabled', 'disabled');
        }else{
            element.removeAttribute('disabled');
        }

    });

}
const clearInput = (inputList, dataLists) => {
    inputList.forEach(input => {
        input.value = '';
    });

    if(dataLists.length > 0){
        dataLists.forEach(dataList => {
            dataList.innerHTML = '';
        });
    }
}
const saveNewRow = (itemSpecification, expectedTblFields, requestAction) => {
    let tr = document.querySelector(`.${itemSpecification}-add`);
    // GET THE INLINE EDIT BTN
    let inlineEdit = (tr.childNodes[5].childNodes[1].childNodes[1]);
    // ADD CLICK EVENT TO THE INLINE EDIT BTN
    inlineEdit.addEventListener('click', () => {
        tr.parentElement.after(preloader());
        let dataToSave = {};
        let children = tr.children;
        let td = '';
        for (var index= 0; index< children.length; index++) {
            td = children[index];
            if((index != 0) && td.classList.contains('editable-data')){  
                let data = (td.children[0].children[0].value);
                if(data != ''){
                    // COLLECT DATA TO UPDATE  
                    if(td.classList.length === 3){
                        let filteredItemDetails = [];
                        if((td.dataset.name == 'warehouse_inventory_id') && (tr.parentElement.id == 'branchinventorys_list')){
                            filteredItemDetails[0] = JSON.parse(tr.children[2].dataset.info);
                            console.log(filteredItemDetails[0])
                            dataToSave.availableQuantity = filteredItemDetails[0].quantity;
                        }else{
                            filteredItemDetails = site[td.classList[2]].filter(info => info.name.toLowerCase() == data.toLowerCase());
                        }
                        if(Object.keys(filteredItemDetails).length > 0){
                            dataToSave[td.dataset.name] = filteredItemDetails[0].id;
                        }
                    }else{
                        dataToSave[td.dataset.name] = data.trim();
                    }
                }
            }
        }
        if(Object.keys(dataToSave).length >= expectedTblFields){
            let result = [];
            site[tr.dataset.name].forEach((info, index) => {
                switch(tr.dataset.name){
                    /* 
                        BRANCH INVENTORY VALIDATION BEFORE ADDING IT TO ITS INVENTORY
                        CHECK IF PRODUCT ALREADY EXITS IN THE BRANCH INVENTORY
                    */
                    case "branchinventoryList":
                        if(
                            (Number(info.warehouse_inventory_id) == Number(dataToSave.warehouse_inventory_id)) 
                            &&  (Number(info.branch_id) == Number(dataToSave.branch_id))
                            &&  (Number(info.size_id) == Number(dataToSave.size_id)) 
                            &&  (Number(info.colour_id) == Number(dataToSave.colour_id))
                            ){
                            //console.log(Number(info.warehouse_inventory_id) , Number(dataToSave.warehouse_inventory_id) ,  Number(info.branch_id) , Number(dataToSave.branch_id),  Number(info.size_id) , Number(dataToSave.size_id),  Number(info.colour_id) , Number(dataToSave.colour_id))
                            console.log(info)
                            result.push(info);
                        }
                        if((result.length == 0) && (index == (site[tr.dataset.name].length - 1))){
                            dataToSave.remainingQuantity = Number(dataToSave.availableQuantity) - Number(dataToSave.quantity);
                        }
                    break;
                    /* 
                        BRANCH INVENTORY VALIDATION BEFORE ADDING IT TO ITS INVENTORY
                        CHECK IF PRODUCT ALREADY EXITS IN THE PRODUCT TABLE
                    */
                    case "productList":
                        if(info.name.toLowerCase() == dataToSave.product_name.toLowerCase()){
                            result.push(info);
                        }
                    break;
                    /* 
                        BRANCH INVENTORY VALIDATION BEFORE ADDING IT TO ITS INVENTORY
                        CHECK IF PRODUCT ALREADY EXITS IN THE PRODUCT TABLE
                    */
                    case "warehouseinventoryList":
                        if(
                            (Number(info.product_id) == Number(dataToSave.product_id)) 
                            &&  (Number(info.size_id) == Number(dataToSave.size_id)) 
                            &&  (Number(info.colour_id) == Number(dataToSave.colour_id))
                            ){
                            result.push(info);
                        }
                    break;
                }
            });
            if(result.length > 0){
                console.log(result);
                console.log(dataToSave);
                removeElement('div.preloader');
                deliverNotification('Product already exits in branch inventory', 'warning');
            }else{
                // REMOVE THE TR USED TO ENTER DATA
                tr.remove();
                console.log(dataToSave, result)
                // SAVE DATA
                requestDataChange(dataToSave, inlineEdit, requestAction , 'save', inlineEdit);
            }
        }else if(Object.keys(dataToSave).length == 0){
            deliverNotification('All fields were empty! Operation canceled', 'danger');
            tr.remove();
            removeElement('div.preloader');
        }
        else{
            removeElement('div.preloader');
            deliverNotification('All fields required! Operation canceled', 'warning');

        }
    })
}

const generateBranchInventoryTR = () => {
    let addRow = `
        <tr>
            <td><label class="counter">0</label></td>
            <td data-d-type="text" class="editable-data select-data warehouseinventoryList" data-piece="main" name="autoBased" data-name="warehouse_inventory_id">
                <label class="fixed-width">
                    <input list="sels0" name="sel0" placeholder="Enter Product Name" id="sel0">
                    <datalist id="sels0">
                        ${dataList = []}
                        ${temp = []}
                        ${site.warehouseinventoryList.forEach(details => {if(!temp.includes(JSON.stringify({'name': details.name}))){temp.push(JSON.stringify({'name': details.name}))}})};
                        ${temp.filter(details => {dataList.push(JSON.parse(details))})}
                        ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
            <td data-d-type="text">
                <label class="action">
                    <span class="material-symbols-outlined primary inline-edit" data-tb="branchinventory">save_as</span>
                    <span class="material-symbols-outlined danger inline-remove" data-tb="branchinventory">close</span>
                </label>
            </td>
            <td data-d-type="text" class="editable-data select-data branchList"  name="autoBased" data-action="negative" data-name="branch_id">
                <label>
                    <input list="sels00" name="sel00" placeholder="Branch" id="sel00">
                    <datalist id="sels00">
                        ${dataList = []}
                        ${site.branchList.forEach(details => {dataList.push({'name': details.name})})}
                        ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
            <td data-d-type="text" class="editable-data select-data colorList" data-piece="color"  data-action="negative" data-name="colour_id">
                <label>
                    <input list="sels000" name="sel000" placeholder="Colour" id="sel000">
                    <datalist id="sels000">
                    </datalist>
                </label>
            </td>
            <td data-d-type="text" class="editable-data select-data sizeList" data-piece="size" data-action="negative" data-name="size_id">
                <label>
                    <input list="sels0000" name="sel0000" placeholder="Size" id="sel0000">
                    <datalist id="sels0000">
                    </datalist>
                </label>
            </td>
            <td data-d-type="text" data-action="negative" data-name="code"><label class="primary">Code</label></td>
            <td data-d-type="text" class="editable-data" data-name="quantity"><label><input class="allInputs" type="text" value="10"></label></td>
            <td data-d-type="text" data-name="quantity"><label>1</label></td>
            <td data-d-type="text"><label class="success">Available</label></td>
            <td data-d-type="text" data-action="negative" data-name="code"><label class="primary">Description</label></td>
        </tr> 
        `;
    return addRow;
}
const generateInventoryTR = (productList, categoryList,  branchList, statusList, brandList) => {
    let addRow = `
        <tr>
            <td><label class="counter">0</label></td>
            <td data-d-type="text" class="editable-data select-data productList"  name="autoBased" data-name="product_id">
                <label class="fixed-width">
                    <input list="sels0" name="sel0" placeholder="Enter Product Name" id="sel0">
                    <datalist id="sels0">
                        ${dataList = []}
                        ${site.productList.forEach(details => {dataList.push({'name': details.name})})}
                        ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
            <td data-d-type="text">
                <label class="action">
                    <span class="material-symbols-outlined primary inline-edit" data-tb="warehouseinventory">save_as</span>
                    <span class="material-symbols-outlined danger inline-delete" data-tb="warehouseinventory">close</span>
                </label>
            </td>
            <td data-d-type="text" class="editable-data" data-name="quantity"><label><input class="allInputs" type="text" value="10"></label></td>
            <td data-d-type="text"><label class="success">Available</label></td>
            <td data-d-type="text" >
                <div class="image">
                    <img src="./images/default.png" alt="">
                    <label for="upload-product-image" title="Click to choose new image to upload">
                        <span class="material-symbols-outlined">cloud_sync</span>
                        <input type="file" id="upload-product-image">
                    </label>
                </div>
                <img src="./images/default.png" class="preview-image">
            </td>
            <td data-d-type="text" class="editable-data  directInput" data-action="negative" data-name="code"><label class="primary"><input class="allInputs" type="text" placeholder="Code"></label></td>

            <td data-d-type="text" class="editable-data select-data colorList"  name="autoBased" data-action="negative" data-name="colour_id">
                <label>
                    <input list="sels00" name="sel00" placeholder="Colour" id="sel00">
                    <datalist id="sels00">
                        ${dataList = []}
                        ${site.colorList.forEach(details => {dataList.push({'name': details.name})})}
                        ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
            <td data-d-type="text" class="editable-data select-data sizeList"  name="autoBased" data-action="negative" data-name="size_id">
                <label>
                    <input list="sels000" name="sel000" placeholder="Size" id="sel000">
                    <datalist id="sels000">
                        ${dataList = []}
                        ${site.sizeList.forEach(details => {dataList.push({'name': details.name})})}
                        ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
            <td data-d-type="text" class="editable-data autogenerated" data-action="negative" data-name="description"><label class="fixed-width"><input class="allInputs" type="text" placeholder="Product description"></label></td>
        </tr> 
        `;
    return addRow;
}
const generateProductTR = (categoryList, sizeList, supplierList, brandList) => {
    let dataList = [];
    let addRow = `
        <tr class="ghostwhite item-details">
            <td data-d-type="text"><label class="counter">0</label></td>
            <td data-d-type="text"  class="editable-data directInput" data-info="productList" data-action="negative" data-name="product_name">
                <label class="fixed-width">
                    <input  class="allInputs" type="text" placeholder="Enter Product Name">
                </label>
            </td>
            <td data-d-type="text">
                <label class="action">
                    <span class="material-symbols-outlined primary inline-edit" data-tb="product">save_as</span>
                    <span class="material-symbols-outlined danger inline-delete" data-tb="product">close</span>
                </label>
            </td>
            <td data-d-type="text"  class="editable-data select-data categoryList" data-name="category_id">
                <label class="category">
                    <input  class="allInputs" list="sels0" name="sel0" placeholder="Category" id="sel0">
                    <datalist id="sels0">
                    ${dataList = []}
                    ${site.categoryList.forEach(details => {dataList.push({'name': details.name})})}
                    ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
            <td data-d-type="int"  class="editable-data  directInput" data-info="productList" data-action="negative"  data-name="buy_price">
                <label class="price warning">
                    <input  class="allInputs" type="text" placeholder="Buy price">
                </label>
            </td>
            <td data-d-type="int"  class="editable-data  directInput" data-info="productList" data-action="negative" data-name="sale_price">
                <label class="price success">
                    <input  class="allInputs" type="text" placeholder="Sale price">
                </label>
            </td>
            <td data-d-type="text"  class="editable-data select-data brandList" data-name="brand_id">
                <label class="brand">
                    <input  class="allInputs" list="sels01" name="sel01" placeholder="Choose brand"" id="sel01">
                    <datalist id="sels01">
                    ${dataList = []}
                    ${site.brandList.forEach(details => {dataList.push({'name': details.name})})}
                    ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
            <td data-d-type="text"  class="editable-data select-data sizeSchemeList" data-name="size_scheme_id">
                <label class="sizing">
                    <input  class="allInputs" list="sels02" name="sel02" placeholder="Size scheme" id="sel02">
                    <datalist id="sels02">   
                    ${dataList = []}
                    ${site.sizeSchemeList.forEach(details => {dataList.push({'name': details.name})})}
                    ${generateOptions(dataList)}                     
                    </datalist>
                </label>
            </td>
            <td data-d-type="text"  class="editable-data  directInput" data-info="productList" data-action="negative" data-name="code_initual">
                <label class=" primary">
                    <input  class="allInputs" type="text" placeholder="Code ">
                </label>
            </td>
            <td data-d-type="text"  class="editable-data select-data supplierList" data-name="supplier_id">
                <label class="supplier">
                    <input  class="allInputs" list="sels03" name="sel03" placeholder="Add Supplier" id="sel03">
                    <datalist id="sels03">
                    ${dataList = []}
                    ${site.supplierList.forEach(details => {dataList.push({'name': details.name})})}
                    ${generateOptions(dataList)}
                    </datalist>
                </label>
            </td>
        </tr>
        `;

    return addRow;
}
const inlineTableClickActions = (identifier, expectedTblFields, requestAction) => {
    if(document.querySelector(`#${identifier} .title-modifications`)){
        let newItem = document.querySelector(`#${identifier} .title-modifications .new`);            
        let editItem = document.querySelector(`#${identifier} .title-modifications .edit`);            
        let deleteItem = document.querySelector(`#${identifier} .title-modifications .delete`);            
        let exportItem = document.querySelector(`#${identifier} .title-modifications .export`);                        
        let limitItem = document.querySelector(`#${identifier} .title-modifications .limit`);                        
        let filterItem = document.querySelector(`#${identifier} .title-modifications .filter`);                        

        // TABLE DATA
        const inlineEditBtns = document.querySelectorAll(`#${identifier} .inline-edit`);
        const inlineDeleteBtns = document.querySelectorAll(`#${identifier} .inline-delete`);
        const inlinereturn = document.querySelectorAll(`#${identifier} .inline-return`);
        // SINGLE ITEM INLINE EDIT
        tableRowModification(inlineEditBtns, 'editable-data', requestAction);
        // SINGLE ITEM INLINE DELETE
        tableRowModification(inlineDeleteBtns, 'editable-data', requestAction);
        // SINGLE ITEM INLINE RETURN
        tableRowModification(inlinereturn, 'editable-data', requestAction);

        // ADD NEW PRODUCT IN THE TABLE
        addTableRow(newItem, `${identifier.toLowerCase()}_list`, 'item-details', expectedTblFields, `save${requestAction.split('update')[1]}`);
        // EXPORT TABLE DATA
        if(site.session.user_type_id == 1){
            exportItem.addEventListener('click', () => {
                let table = document.getElementById(`${identifier}_export_tb`);
                let csv_name = `lifestyle ${identifier} as of ${today}`;
                let download_link = exportItem;
                export_table_to_csv (table, csv_name, download_link);
            });
        } 
    }
}
const generateInvoiceItems = (data) => {
    // console.log(data); //active
    let totalPrice = 0;
    let templateString;
    let itemDetails = data[0];
    // console.log(itemDetails);
    if(data.length > 0){
        templateString = `
            <div class="moreinvoicedetails" data-info='${JSON.stringify(itemDetails)}' >
                <div class="invoice_header">
                    <div class="head">
                        <h3>Sale Information</h3>
                    </div>
                    <div class="attendant_info">
                        <div class="small-imag">
                            <img src="./images/${data[0]['user_image']}">
                        </div>
                        <div class="det-edit-box">
                            <label>Attendant</label>
                            <select>
                                <option>${data[0]['username']} ${data[0]['first_name'].split('')[0]}</option>
                            </select>
                        </div>
                    </div>
                    <div class="det-edit-box">
                        <label>branch</label>
                        <select>
                            <option>${data[0]['branch_location']}</option>
                            ${generateOptions(site.branchList)}
                        </select>
                    </div>
                    <div class="det-edit-box">
                        <label>purchase date</label>
                        <input type="date" value="${data[0]['purchase_date']}">
                    </div>
                    <div class="invoice_pricing">
                        <h3>Billing Information</h3>
                        <div class="det-edit-box">
                            <label>Total Price</label>
                            <div class="price-and-currency">
                                <b>${getTotalPrice(data)}</b> 
                                <select>
                                    <option>$</option>
                                    <option selected>/=</option>
                                </select>
                            </div>
                        </div>
                        <div class="det-edit-box">
                            <label>Discount name</label>
                            <select>
                                <option>${data[0]['discount']}</option>
                                ${generateOptions(site.discountList)}
                            </select>
                        </div>
                        <div class="det-edit-box">
                            <label>Payment Type</label>
                            <select>
                                <option>${data[0]['payment_type_name']}</option>
                                ${generateOptions(site.paymentTypeList)}
                            </select>
                        </div>
                    </div>
                    <div class="customer">
                        <h3>Customer Details</h3>
                        <div class="det-edit-box">
                            <label>F.Name</label>
                            <input type="text" value="${data[0]['customer_fname']}">
                        </div>
                        <div class="det-edit-box">
                            <label>L.Name</label>
                            <input type="text" value="${data[0]['customer_lname']}">
                        </div>
                        <div class="det-edit-box">
                            <label>Email</label>
                            <input type="text" value="${data[0]['customer_email']}">
                        </div>
                        <div class="det-edit-box">
                            <label>Telephone</label>
                            <input type="text" value="${data[0]['customer_telephone']}">
                        </div>
                    </div>
                </div>
                <div class="invoice_items">
                    <h4>Invoice No.${data[0]['invoice_no']} Items</h4>
                    
        `;
        data.forEach(itemDetails => {
            templateString += `
                    <div class="invoice_item">
                        <div class="besic_det">
                            <div class="invoice_item_image">
                                <img src="./images/${itemDetails.product_image}">
                            </div>
                            <label>
                                <b>Name: </b> 
                                <span>${itemDetails.product_name}</span>
                            </label>
                            <label>
                                <b>category: </b> 
                                <span>${itemDetails.category_name}</span>
                            </label>
                            <label>
                                <b>Brand: </b> 
                                <span>${itemDetails.brand_name}</span>
                            </label>
                            <label>
                                <b>Code: </b> 
                                <span>${itemDetails.product_code}</span>
                            </label>

                            <label>
                                <b>Price: </b> 
                                <span>
                                    <input type="text" value="${itemDetails.sale_price}">
                                </span>
                            </label>
                            <div class="cart_quantity_adjuster">
                                <b>Adjust quantity</b>
                                <label class="adjust">
                                    <span data-purchase_id="813" class="material-symbols-outlined modifier">remove</span>
                                    <input type="text" id="item_quantity_813" value="${itemDetails.purchase_quantity}" disabled="disabled" class="modified_quantity cart_modified_quantity straight_altered" data-available-quantity="59">
                                    <span data-purchase_id="813" class="material-symbols-outlined modifier">add</span>
                                </label>
                            </div>
                        </div>
                        <div class="color-n-sizes">
                            <label class="desc">
                                <b>Description: </b> 
                                <textarea>${itemDetails.remarks}</textarea>
                            </label>
                            <h3>Product Color</h3>
                            <div class="invoice_color_list" id="invoice_color_list${data[0]['invoice_no']}">
                                ${generateProductColor(itemDetails.product_colors, itemDetails.colour_name)}
                            </div>
                            <h3>Product Size</h3>
                            <div class="invoice_size_list">
                                ${generateProductColorSizes(itemDetails.product_colors, itemDetails.colour_name, itemDetails.size_innitual)}
                            </div>
                        </div>
                    </div>
            `;
        });
        templateString +=`
                </div>
            </div>`;
    }
    return templateString;
}
const getTotalPrice = (data, id) => {
    let totalPrice = 0;
    data.forEach(itemDetails => {
        totalPrice +=(Number(itemDetails.purchase_quantity) * Number(itemDetails.sale_price))
    })
    return totalPrice;
}
const generateProductColor = (data, colour_name) => {
    let templateString = '';
    if(data.length > 0){
        data.forEach(itemDetails => {
            templateString += `
                <i data-color-sizes='${JSON.stringify(itemDetails.color_products_sizes)}' class="${(itemDetails.colour_name == colour_name) ? 'update_sale_color active' : 'update_sale_color'}">${itemDetails.colour_name}<small>${itemDetails.color_products_sizes.length}</small></i>
            `;
        });
    }
    return templateString;
}
const generateProductColorSizes = (productColors, colour_name, size_innitual) => {
    console.log(size_innitual)
    let data = productColors.filter(productColor => (productColor.colour_name == colour_name));
    
    let templateString = '';
    if(data.length > 0){
        data = data[0].color_products_sizes;
        data.forEach(itemDetails => {
            // console.log(itemDetails)
            templateString += `
                <i onclick="" data-size-info='${JSON.stringify(itemDetails)}' class="${(itemDetails.size_innitual == size_innitual) ? 'update_sale_size active' : 'update_sale_size'}">${itemDetails.size_innitual}<small>${itemDetails.availableQuantity}</small></i>
            `;
        });
    }
    return templateString;
}
const revealDetails = (sInvoiceDtlBtn, index) => {
    if(sInvoiceDtlBtn.textContent == 'add'){
        sInvoiceDtlBtn.closest('tr').style.top = `-${index * 3.07}rem`;
        sInvoiceDtlBtn.closest('tr').classList.add('active');
        sInvoiceDtlBtn.textContent = 'remove';

    }else{
        sInvoiceDtlBtn.closest('tr').style.top = '0rem';
        sInvoiceDtlBtn.closest('tr').classList.remove('active');
        sInvoiceDtlBtn.textContent = 'add';
    }
}

const loadPageData = (data, identifier, limit) => {
    let activePeginationLink = document.querySelector( `.pagination_link.${identifier}-list_pagination span.active`);
    let start = 0;
    if(activePeginationLink){
        start = ((Number(activePeginationLink.textContent) - 1) * limit);
    }
    document.getElementById(`${identifier}s_list`).innerHTML = '';
    renderPageData(data.slice(start, (start + limit)), start, identifier);
}
const uploadFile = (uploadBtn) => {
    var form_data = new FormData();
    // Read selected files
    var totalfiles = uploadBtn.files.length;
    if(totalfiles != 0){
        form_data.append("files[]", uploadBtn.files[0]);
    }

    // UPLOADING
    let ajaxRequest = $.ajax({
        url: "http://localhost/joinedlifestyleoutdoorgear/api/route.php",
        type: 'post',
        data: form_data,
        dataType: 'json',
        contentType: false,
        processData: false
    });

    return ajaxRequest
}

function addComma (num) {
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
function removeComma (num) {
    let numArr = num.split(',');
    let nomalNumber = "";
    numArr.forEach((number) => {
        nomalNumber += number;
    });
    return nomalNumber;
}
document.addEventListener('DOMContentLoaded', () => {

    // SET ACCOUNT PROFILE IMAGE AND USERNAME
    let accountInfo = document.getElementById('user-account-information');
    accountInfo.children[0].children[0].setAttribute('src', `./images/${site.session.image}`);
    accountInfo.children[1].innerHTML = `<i>@</i>${site.session.username}`;

    // LOAD PRODUCT LIST
    setTimeout(dataRequest('Product', {'limit': 15,'action':'getLimitedProducts', 'page': page}, 1), 0);

    // LOAD WAREHOUSE INVENTORY PRODUCT LIST
    setTimeout(dataRequest('WarehouseInventory', {'limit': 15,'action':'getLimitedWarehouseInventory', 'page': page}, 1), 0);

    // LOAD BRANCH INVENTORY LIST
    setTimeout(dataRequest('BranchInventory', {'limit': 15,'action':'getLimitedBranchInventory', 'page': page}, 1), 0);

    // LOAD USER LIST
    setTimeout(dataRequest('User', {'limit': 15,'action':'getLimitedUsers', 'page': page}, 1), 0);

    // LOAD SUPPLIER LIST
    setTimeout(dataRequest('Supplier', {'limit': 15,'action':'getLimitedSuppliers', 'page': page}, 1), 0);

    // LOAD INVOICE LIST
    setTimeout(dataRequest('Invoice', {'limit': 15,'action':'getLimitedInvoices', 'page': page}, 1), 0);


    // LOAD HELPER DATA LIST
    setTimeout(run({'reload': false, 'action':'getCategories', 'name': 'categoryList'}), 0);
    setTimeout(run({'reload': false, 'action':'getStatus', 'name': 'statusList'}), 0);
    setTimeout(run({'reload': false, 'action':'getBrands', 'name': 'brandList'}), 0);
    setTimeout(run({'reload': false, 'action':'getSizeSchemes', 'name': 'sizeSchemeList'}), 0);
    setTimeout(run({'reload': false, 'action':'getBranches', 'name': 'branchList'}), 0);
    setTimeout(run({'reload': false, 'action':'getUserTypes', 'name': 'userTypeList'}), 0);
    setTimeout(run({'reload': false, 'action':'getCustomers', 'name': 'customerList'}), 0);
    setTimeout(run({'reload': false, 'action':'getColors', 'name': 'colorList'}), 0);
    setTimeout(run({'reload': false, 'action':'getSizes', 'name': 'sizeList'}), 0);

    setTimeout(run({'reload': false, 'action':'getPaymentTypes', 'name': 'paymentTypeList'}), 0);
    setTimeout(run({'reload': false, 'action':'getDiscounts', 'name': 'discountList'}), 0);
    setTimeout(run({'reload': false, 'action':'getCurrencys', 'name': 'currencyList'}), 0);

    // ON PAGE LOAD & RELOAD
    setTimeout(() => {
        loadSessionData('product', limit);
        loadSessionData('warehouseinventory', limit);
        loadSessionData('branchinventory', limit);
        loadSessionData('user', limit);
        loadSessionData('invoice', limit);
        loadSessionData('supplier', limit);
    }, 0);

    // IMPORT CSV DATA TO DATABASE
    document.getElementById('import_btn').addEventListener('change', () => {

        const img = document.getElementById('import_btn');
        if (img.files.length == 0){
            console.log('nothing');
        }else{
            let res = uploadFile(document.getElementById('import_btn'));
            console.log(res)

            res.always(data => {
                console.log(data)
            })

        }
    })

    // SIGNOUT
    document.querySelector('.signout-btn').addEventListener('click', () => {
        delete site.session;
        localStorage.setItem('joinedlifestyleoutdoorgear', JSON.stringify(site));
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


    // FILTRATION
    const filtrationBox = document.querySelectorAll('.title-modifications');
    const filtrationBtn = document.querySelectorAll('.section-title span.table-filter');
    filtrationBtn.forEach(btn => btn.addEventListener('click', () => {
    	filtrationBox.forEach(ftBx => ftBx.classList.toggle('hide'));
    	// console.log(filtrationBox, filtrationBtn)
    }));

    //----------------------------- GENERAL SEARCH ----------------------
    console.log('search-bar');
    document.querySelector('.search-bar').addEventListener('submit', (e) => {
        e.preventDefault();
        search();
    });
    document.querySelector('.search-btn').addEventListener('click', () => {
        search();
    });
    // document.querySelector('.search-field').addEventListener('change', () => {
    //     search(); getTot
    // });
    document.getElementById('startdate').value = today;  
    document.getElementById('enddate').value = today;  
    // document.getElementById('startdate').addEventListener('change', () => {
    //     getInvoiceByDate();
    // });
    document.getElementById('enddate').addEventListener('change', () => {
        getInvoiceByDate();
    });    

});
// GENERAL SEARCH
const search =() => {
    let searchValue = document.querySelector('.search-field').value.toLowerCase();
    setTimeout(() => {
        switch(document.querySelector('.page.active').id){
            case 'Dashboard':
                let dashboardTbl = (document.querySelectorAll('.page.active table'))
                // BRANCH INVENTORY SEARCH
                let branchTbl = dashboardTbl[0];
                let branchTblTbody = branchTbl.children[1];
                branchTblTbody.after(preloader());

                console.log(branchTbl.parentElement.children) //showlimit
                let showLimitValue = document.querySelector(`.${branchTbl.parentElement.classList[0]} .showlimit`);
                let limit = (Number(showLimitValue.value)) ? Number(showLimitValue.value) : (searchResult.length - 1);
                let data = {'searchValue': searchValue}
                res = generalRequest({'data': data, 'action': 'searchAllBranchInventorys'});
                res.always((details) => {
                    console.log(details)
                    if(details.length > 0){
                        site.searchResult.branchInventory = details;
                        site.branchinventoryList = details;
                        generatePegination(details, 'branchinventory'.toLowerCase(), limit);

                        // updateSiteData(site);
                        document.getElementById(`branchinventorys_list`).innerHTML = '';
                        renderPageData(details.slice(0, (0 + limit)), 0, 'branchinventory'.toLowerCase());
                    }
                });

            break;
        }
    }, 0);
}
const getInvoiceByDate = () => {
    document.getElementById(`invoices_list`).after(preloader());
    let startdate = document.getElementById('startdate').value;
    let enddate = document.getElementById('enddate').value;
    let identifier = 'invoice';
    let limitShow = document.querySelector('#Sales .showlimit').value;            
    let data ={'sdate': startdate, 'edate': enddate, 'action':'getAllInvoices'};
    let ajaxRequest = $.ajax({
        url: "http://localhost/joinedlifestyleoutdoorgear/api/route.php",
        type: "POST",
        dataType  : 'json',
        data: data,
        success: function(details){
            removeElement('div.preloader');
            console.log(details);
            // console.log(data)
            if(details.length > 0){
                deliverNotification(details.length + ' Invoices found', 'success');
                site.invoiceList = details;
                limit = (Number(limitShow)) ? Number(limit) : details.length;
                document.getElementById(`invoices_list`).innerHTML = "";
                renderPageData(details.slice(0, (0 + limit)), 0, identifier.toLowerCase());
                generatePegination(details, identifier.toLowerCase(), limit);

            }else{
                deliverNotification('Nothing found', 'warning');

            }

        }
    });
    // console.log(site.invoiceList);
}
const removeSpage = (text) => {
    textArr = text.split('');
    let newText = '';
    textArr.forEach(txt => {
        newText = newText+''+txt.trim();
    });
    return newText;
}

// *************************************************** TABLE MUNIPULATION ***************************************

// SINGLE ITEM INLINE EDIT
const tableRowModification = (buttonArray, identifier, requestAction) => {
    buttonArray.forEach(inlineBtn => { //material-symbols-outlined warning check-all
        inlineBtn.addEventListener('click', (e) => {
            let tr = inlineBtn.parentElement.parentElement.parentElement;
            if(inlineBtn.classList.contains('inProgress')){
                asignDataAfterEdit(tr, inlineBtn, identifier, requestAction);
            }else if(inlineBtn.textContent == "edit"){
                asignDataForEdit(tr, inlineBtn, identifier); 
            }else if(inlineBtn.textContent == "close"){  
                // WARN BEFORe DELETE
                if(!document.getElementById('warningBox')){
                    document.querySelector(`#${inlineBtn.dataset.tb}s_list`).before(warningNotification(`Delete ${tr.childNodes[3].childNodes[0].textContent} form product list`));
                    let warningBoxBtns = document.querySelectorAll('#warningBox button');
                    warningBoxBtns.forEach(actionBtn => actionBtn.addEventListener('click', () => {
                        if(actionBtn.childNodes[1].textContent == 'Continue'){
                            document.getElementById('warningBox').remove();
                            tr.parentElement.after(preloader());
                            deleteData = {'tb': inlineBtn.dataset.tbl, 'id': inlineBtn.dataset.id, 'field': inlineBtn.dataset.field}
                            requestDataChange(deleteData, inlineBtn, 'delete_info' , 'delete', tr);
                        }else{
                            document.getElementById('warningBox').remove();
                        }
                    }));
                }
            }else if(inlineBtn.textContent == "remove"){  
                let sect =inlineBtn.parentElement.parentElement.parentElement.parentElement.id;
                if(!document.getElementById('warningBox')){
                    document.querySelector(`#${sect}`).before(warningNotification(`Cancel Operation and discard any changes`));
                    let warningBoxBtns = document.querySelectorAll('#warningBox button');
                    warningBoxBtns.forEach(actionBtn => actionBtn.addEventListener('click', () => {
                        if(actionBtn.childNodes[1].textContent == 'Continue'){
                            document.getElementById('warningBox').remove();
                            tr.children[2].children[0].children[0].classList.remove('inProgress');
                            tr.children[2].children[0].children[0].textContent = 'edit';
                            for (var i = tr.parentElement.children.length - 1; i >= 0; i--) {
                                if(tr.parentElement.children[i] != tr){
                                    inlineBtn.textContent = tr.parentElement.children[i].children[2].children[0].children[1].textContent
                                }
                            }
                            let children = tr.children;
                            let td = '';
                            for (var index= 0; index < children.length; index++) {
                                td = children[index];
                                if((index != 0) && td.classList.contains(identifier)){  
                                    let data = (td.children[0].children[0].value);
                                    tr.children[index].children[0].innerHTML = data; 
                                }
                            }

                        }else{
                            document.getElementById('warningBox').remove();
                        }
                    }));
                }
            }else{
                let sect =inlineBtn.parentElement.parentElement.parentElement.parentElement.id;
                if(!document.getElementById('warningBox')){
                    document.querySelector(`#${sect}`).before(warningNotification(`Are you sure about returning all product quantity to warehouse inventory?`));
                    let warningBoxBtns = document.querySelectorAll('#warningBox button');
                    warningBoxBtns.forEach(actionBtn => actionBtn.addEventListener('click', () => {
                        if(actionBtn.childNodes[1].textContent == 'Continue'){
                            document.getElementById('warningBox').remove();
                            returnData(tr, inlineBtn, requestAction); 

                        }else{
                            document.getElementById('warningBox').remove();
                        }
                    }));
                }
            }  
        })
    }); 
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
// GET TABLE DATA (td) AND ASSIGN IT TO AN INPUT FIELD/DATA LIST FOR EDIT
const asignDataForEdit = (tr, inlineEdit, identifier) => {
    tr.childNodes.forEach((td, index) => {
        if((index != 0) && (index % 2 != 0) && td.classList.contains(identifier)){  
            let data = (td.classList.contains('select-data')) ? '<input class="allInputs" list="sels'+index+'" name="sel'+index+'"  value="'+ td.childNodes[0].textContent.trim()+'" id="sel'+index+'"><datalist id="sels'+index+'">'+optionDataIsolation(td)+'</datalist>':'<input class="allInputs" type="text" value="' + td.childNodes[0].textContent.trim() + '" />';  
            tr.childNodes[index].childNodes[0].innerHTML = data;
        }
    });
    inlineEdit.classList.add('inProgress');
    inlineEdit.textContent = 'save_as';

    let secondInlineBtn = tr.children[2].children[0].children[1];
    secondInlineBtn.textContent = 'remove';
    console.log(secondInlineBtn)
    // console.log((tr.dataset.identifier ))
    // if(tr.dataset.identifier == 'branchinventorys_list'){
    // }

    // VALIDATE DATA TYPE
    setTimeout(() => {validateInputs(inlineEdit)}, 0);
    if(tr.children[1].classList.length >= 3){
        setTimeout(() => {validateNewRowInputs(tr, `update${tr.dataset.identifier.toLowerCase()}`)}, 0);
    }

}
const validateInputs = (btn) => {
    const allInputs = document.querySelectorAll('.allInputs');
    allInputs.forEach(allInput => allInput.addEventListener('input', () => {
        const parent = allInput.parentElement.parentElement;
        if(parent.dataset.dType == 'int'){
            if(!Number(allInput.value)){
                allInput.style.borderColor = '#f00';
                allInput.setAttribute('title', 'Invalid value, number expected not text');
                // btn.style.pointerEvents = 'none';
                deliverNotification('Invalid value, number expected not text', 'danger');
            }else{
                allInput.style.borderColor = 'gray';
                allInput.setAttribute('title', 'valid value');
                removeNotification(1);
                // btn.style.pointerEvents = 'All';
            }
        }
        if(parent.classList.length == 3){
            console.log(parent.classList[2])
            let response = site[parent.classList[2]].filter(item => {
                let name = item.name.toLowerCase().trim();
                return (name == allInput.value.toLowerCase().trim());
            });
            if(response.length > 0){
                allInput.style.borderColor = 'gray';
                allInput.setAttribute('title', 'valid value');
                removeNotification(1);
                // btn.style.pointerEvents = 'All';
            }else{
                allInput.style.borderColor = '#f00';
                allInput.setAttribute('title', 'Invalid value');
                deliverNotification('Invalid value, value shoud much with one of the suggestions', 'danger');
                // btn.style.pointerEvents = 'none';
            }
        }
        console.log(allInput)
    }));
}
// GENERATE DROPDOWN OPTION FOR TABLE INLINE EDIT validat
const optionDataIsolation = (td) => {
    let data = td.dataset;
    let dataList = [];
    // if(td.inve)
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
const generateTblTitleFilter  = (identifier, filterValue, filterName, filterPlaceholder) => {
    let showLimit = document.querySelector(`#${identifier}s .showlimit`);
    let dataName = `${filterPlaceholder}List`;

    if(!document.querySelector(`#${identifier}s .${filterName}`)){
        let filter = document.createElement('select');
        filter.classList.add('filter');
        filter.classList.add(filterName);
        let filterContent = `<option value="show" selected="">Show by ${filterPlaceholder}</option>`;
        // GENERATE DROPDOWN OPTIONS
        site[dataName].forEach(details => {
            filterContent += `<option value="${details.id}">${details.name}</option>`;
        });
        filter.innerHTML = filterContent;
        showLimit.after(filter);
        // ADD CLICK EVENT TO OPTIONS
        filter.addEventListener('change', () => {
            searchLocalData(filter, filterValue, identifier, showLimit,  'filter');
        })
    }
}
const filterByLimit = (identifier, filterValue, filterName, filterPlaceholder) => {
    let showLimit = document.querySelector(`#${identifier}s .showlimit`);
    let dataList = null;
    showLimit.addEventListener('change', () => {
        let filter = showLimit.parentElement.childNodes[2];
        let searchValue = showLimit.parentElement.childNodes[2].value;
        if(searchValue.trim() != 'show'){
            limit = (showLimit.value == 'All') ? Number(dataList.length) : Number(showLimit.value);
            dataList = searchLocalData(filter, filterValue, identifier, showLimit,  'showLimit');
        }else{
            dataList = site[`${identifier.toLowerCase()}List`];
            limit = (showLimit.value == 'All') ? Number(dataList.length) : Number(showLimit.value);
        }
        if(dataList.length > 0){
            
            // RENDER DATA
            document.getElementById(`${identifier.toLowerCase()}s_list`).innerHTML = '';
            renderPageData(dataList.slice(0, (0 + limit)), 0, identifier.toLowerCase());
            generatePegination(dataList, identifier.toLowerCase(), limit);
        }
    });
}
const searchLocalData = (searchBy, filterValue, identifier, showLimit, basedOn) => {
    identifier = (identifier == 'Sale') ? 'invoice' : identifier;
    let searchValue = searchBy.value.toLowerCase();
    let filterList = [];
    if(searchValue == 'show'){
        filterList = site[`${identifier.toLowerCase()}List`];
    }else{
        filterList = site[`${identifier.toLowerCase()}List`].filter(item => {
            if((item[filterValue].toLowerCase()) == searchValue){
                return item;
            }
        });
    }
    if(filterList.length > 0){
        limit = showLimit.value == 'All' ? Number(filterList.length) : Number(showLimit.value);
        // RENDER DATA
        document.getElementById(`${identifier.toLowerCase()}s_list`).innerHTML = '';
        renderPageData(filterList.slice(0, (0 + limit)), 0, identifier.toLowerCase());

        if(basedOn == 'filter'){
            generatePegination(filterList, identifier.toLowerCase(), limit);
        }
    }
    return filterList;
};
const returnData = (tr, inlineBtn, identifier, requestAction) => {
    let dataToUpdate = {};
    // tr.parentElement.after(preloader());
    let children = tr.children;
    let td = '';
    for (var index= 0; index< children.length; index++) {
        td = children[index];
        if((index != 0) && td.classList.contains('editable-data')){  
            console.log(td.children[0].textContent)
            let data = td.children[0].textContent;
            if(data != ''){
                // COLLECT DATA TO UPDATE  rend
                if(td.classList.length === 3){
                    let filteredItemDetails = [];
                    if((td.dataset.name == 'warehouse_inventory_id') && (tr.parentElement.id == 'branchinventorys_list')){
                        filteredItemDetails[0] = JSON.parse(inlineBtn.dataset.info);
                        dataToUpdate.availableQuantity = children[8].textContent;
                        console.log(filteredItemDetails[0])
                        dataToUpdate[td.dataset.name] = filteredItemDetails[0].warehouse_inventory_id;
                    }else{
                        filteredItemDetails = site[td.classList[2]].filter(info => info.name.toLowerCase() == data.toLowerCase());
                        dataToUpdate[td.dataset.name] = filteredItemDetails[0].id;
                    }
                    console.log(filteredItemDetails)
                }else{
                    dataToUpdate[td.dataset.name] = data;
                }
            }
        }
    }
    // console.log(requestAction)
    // if(requestAction == 'updateBranchinventory'){
        // UPDATE SITE DATA
        // setTimeout(() => {        
            site.warehouseinventoryList.forEach((data, index) => {
                if(Number(data.id) == Number(dataToUpdate.warehouse_inventory_id)){
                    site.warehouseinventoryList[index].quantity = Number(dataToUpdate.quantity) + Number(dataToUpdate.availableQuantity);
                    // console.log(site.warehouseinventoryList[index]);
                }
            });
        // }, 0);
        dataToUpdate[children[2].children[0].children[1].dataset.field] = children[2].children[0].children[1].dataset.id;
        // setTimeout(() => {            
            site.branchinventoryList.forEach((data, index) => {
                // console.log(dataToUpdate)
                // console.log(Number(data.warehouse_inventory_id) == Number(dataToUpdate.warehouse_inventory_id))
                if(Number(data.warehouse_inventory_id) == Number(dataToUpdate.warehouse_inventory_id)){
                    site.branchinventoryList[index].availableQuantity = Number(dataToUpdate.quantity) + Number(dataToUpdate.availableQuantity);
                    if(Number(data.id) == Number(dataToUpdate.inventory_id)){
                        site.branchinventoryList[index].quantity = 0;
                    }
                    console.log(site.branchinventoryList[index]);
                }
            })
        // }, 0);            

    // }
    // RETURN PRODUCTS
    requestDataChange(dataToUpdate, inlineBtn, 'returnToWareHouse', 'return');

}
// GET TABLE DATA (td) IN THE INPUT FIELD AND ASIGN IT TO THE (td) ELEMENT AS TEXTCONTENT AFTER EDIT
const asignDataAfterEdit = (tr, inlineBtn, identifier, requestAction) => {
    let dataToUpdate = {};
    tr.parentElement.after(preloader());
    let children = tr.children;
    let td = '';
    for (var index= 0; index< children.length; index++) {
        td = children[index];
        if(td.classList.contains('editable-data')){  
            let data = (td.children[0].children[0].value);
            console.log(data)
            tr.children[index].children[0].innerHTML = data; 
            if(data != ''){
                // COLLECT DATA TO UPDATE  
                if(td.classList.length === 3){
                    let filteredItemDetails = [];
                    if((td.dataset.name == 'warehouse_inventory_id') && (tr.parentElement.id == 'branchinventorys_list')){
                        filteredItemDetails[0] = JSON.parse(inlineBtn.dataset.info);

                        site.branchinventoryList.forEach(updatedInfo => {
                            if(Number(updatedInfo.id) == Number(filteredItemDetails[0].id)){
                                // console.log(filteredItemDetails[0])
                                // console.log(updatedInfo)
                                dataToUpdate.availableQuantity = Number(updatedInfo.availableQuantity);
                                dataToUpdate.oldQuantity = Number(filteredItemDetails[0].quantity);
                                dataToUpdate.branch_inventory_id = Number(updatedInfo.id);
                                dataToUpdate[td.dataset.name] = Number(updatedInfo.warehouse_inventory_id);

                            }
                        });
                    }else{
                        filteredItemDetails = site[td.classList[2]].filter(info => info.name.toLowerCase() == data.toLowerCase());
                        dataToUpdate[td.dataset.name] = filteredItemDetails[0].id;
                    }
                }else{
                    dataToUpdate[td.dataset.name] = data;
                }
            }
        }
    }
    inlineBtn.classList.remove('inProgress');
    inlineBtn.textContent = 'edit';

    // CHECK IF PRODUCT ALREADY EXITS IN THE BRANCH INVENTORY
    // if(Object.keys(dataToUpdate).length >= expectedTblFields){
        let result = [];
        site.branchinventoryList.forEach(info => {
            if(
                (Number(info.warehouse_inventory_id) == Number(dataToUpdate.warehouse_inventory_id)) 
                &&  (Number(info.branch_id) == Number(dataToUpdate.branch_id))
                &&  (Number(info.size_id) == Number(dataToUpdate.size_id)) 
                &&  (Number(info.colour_id) == Number(dataToUpdate.colour_id))
                &&  (Number(info.availableQuantity) == Number(dataToUpdate.availableQuantity))
                &&  (Number(info.quantity) == Number(dataToUpdate.oldQuantity))
                ){

                console.log(info)
                result.push(info);
            }
        });
        console.log(result);
        if(result.length > 0){
            console.log(dataToUpdate);
            console.log(site[tr.dataset.name])
            removeElement('div.preloader');
            deliverNotification('Changes Made already exits in branch inventory', 'warning');
            // renderPageData(site[tr.dataset.name].slice(0, (0 + 15)), 0, 'branchinventory') check;

        }else{
            console.log(dataToUpdate);
            // UPDATE DATA
            requestDataChange(dataToUpdate, inlineBtn, requestAction, 'update');
        }
    // }
}
const requestDataChange = (data, btn, requestAction, reqType, otherActionableElement=null) => {
    let identifier = btn.dataset.tb;
    let res = '';
    data.date = today;
    if(reqType == 'update'){
        res = generalRequest({'data': data, 'id': btn.dataset.id, 'action': requestAction});
        updateOperation(res, identifier, btn);
    }else if(reqType == 'save'){
        console.log(identifier, btn.dataset.id, requestAction)
        res = generalRequest({'data': data, 'action': requestAction});
        saveOperation(res, identifier, otherActionableElement);
    }else if(reqType == 'delete'){
        res = generalRequest({'data': data, 'action': requestAction});
        deleteOperaton(res, identifier, otherActionableElement, Number(btn.dataset.index));
    }else if(reqType == 'return'){
        console.log(requestAction)
        res = generalRequest({'data': data, 'action': requestAction});
        returnOperaton(res, identifier, otherActionableElement, Number(btn.dataset.index));
    }
}
const returnOperaton = (res, identifier, otherActionableElement, index) => {
    res.always((details) => {
        // console.log(details)
        // removeElement('div.preloader');
        let name = `${identifier}List`;
        // console.log(name)
        // // ADD NEW DETAILS TO LOCAL STORAGE LIST 
        // site[name].unshift(details.info);
        site[name][index] = details.info;
        updateSiteData(site);

        document.getElementById(`${identifier}s_list`).innerHTML = '';
        renderPageData(site[name].slice(0, (0 + limit)), 0, identifier);
        generatePegination(site[name], identifier);

        deliverNotification(details.message , details.response);
        // if(details.response == 'success'){
        //     // REMOVE ROW FROM THE TABLE
        //     otherActionableElement.parentElement.parentElement.remove();
        //     // DELETE ROW DATA FROM LOACAL STORAGE LIST
        //     let name = `${identifier}List`;
        //     site[name].splice(index, 1);
        //     // UPDAT LOCAL STORAGE DATA
        //     updateSiteData(site);
        // }
    });
}
const deleteOperaton = (res, identifier, otherActionableElement, index) => {
    res.always((details) => {
        removeElement('div.preloader');
        if(details.response == 'success'){
            // REMOVE ROW FROM THE TABLE
            otherActionableElement.remove();
            // DELETE ROW DATA FROM LOACAL STORAGE LIST
            let name = `${identifier}List`;
            site[name].splice(index, 1);
            // UPDAT LOCAL STORAGE DATA
            updateSiteData(site);
        }
        deliverNotification(details.message, details.response);
    });
}
const saveOperation = (res, identifier, inlineBtn = null) => {
    res.always((details) => {
        console.log(details)
        removeElement('div.preloader');
        if(details.response == 'warning'){
            deliverNotification(details.message, details.response);
            inlineBtn.textContent = 'save_as';
        }
        else if(details.response == 'success'){
            inlineBtn.textContent = 'edit';
            let name = `${identifier}List`;
            // ADD NEW DETAILS TO LOCAL STORAGE LIST 
            site[name].unshift(details.info);
            updateSiteData(site);

            document.getElementById(`${identifier}s_list`).innerHTML = '';
            renderPageData(site[name].slice(0, (0 + limit)), 0, identifier);
            deliverNotification(details.message , details.response);
        }
        else{
            inlineBtn.textContent = 'save_as';
            deliverNotification(details.message , details.response);
        }
    });
}
const updateOperation = (res, identifier, btn) => {
    res.always((details) => {
        console.log(details)
        removeElement('div.preloader');
        if(details.response == 'danger'){
            deliverNotification(details.message , details.response);
        }else if(details.response == 'success'){
            // UPDATE DETAILS IN LOCAL STORAGE LIST 
            let name = `${identifier}List`;
            site[name][btn.dataset.index] = details.info;
            updateSiteData(site);
            document.getElementById(`${identifier}s_list`).innerHTML = '';
            renderPageData(site[name].slice(0, (0 + limit)), 0, identifier);
            deliverNotification(details.message , details.response);
        }
        else{
            deliverNotification('Something went wrong', 'warning');
        }
    });
}
const asignHoldersUpdatedData = (inlineBtn, details, identifier) => {
    // let identifierArray = Object.keys(details).length;
    let tr = inlineBtn.parentElement.parentElement.parentElement;
    console.log(details);
    if(Object.keys(details).length == 6){
        switch(details.secondary){
            case 'warehouseinventoryList':
                updateLocalHolder(site[tr.dataset.secondary], details, identifier)
                // site[tr.dataset.secondary].forEach((data, index) => {
                //     if(Number(details.id) == Number(data.id)){
                //         site[tr.dataset.secondary][index].quantity = details.change;
                //         // console.log(details.id + ':' + data.id + ':' + data.name + '--->' + data.quantity + '|' + details.change);
                //     }
                // });

            break;
        }
        console.log(details.secondary)
    }else if(Object.keys(details).length > 6){
        site[tr.dataset.secondary] = details.secondary;
        site[tr.dataset.taxiary] = details.taxiary;
    }
    return [site, tr.dataset.name];
}
const updateLocalHolder = (localHolder, details, identifier) =>{
    if(details.change != ''){
        localHolder.forEach((data, index) => {
            if(Number(details.id) == Number(data.id)){
                localHolder[index].availableQuantity = details.change;
            }
        });
    }

    updateSiteData(site);
    // RENDER DATA
    document.getElementById(`${identifier}s_list`).innerHTML = '';
    renderPageData(localHolder.slice(0, (0 + limit)), 0, identifier);
    deliverNotification(details.message , details.response);
    return localHolder;
}
// const activePage = document.querySelector('.page.active');
const pageTbModifications = () => {
    // console.log(activePage); material-symbols-outlined danger inline-delete
    if(document.querySelector(`.page.active .title-modifications`)){
        // TITLE DATA BOARD console.log(document.querySelector(`.page.active .title-modifications`))
        let newItem = document.querySelector(`.page.active .title-modifications .new`);            
        let editItem = document.querySelector(`.page.active .title-modifications .edit`);            
        let deleteItem = document.querySelector(`.page.active .title-modifications .delete`);            
        let exportItem = document.querySelector(`.page.active .title-modifications .export`);                        
        let limitItem = document.querySelector(`.page.active .title-modifications .limit`);                        
        let filterItem = document.querySelector(`.page.active .title-modifications .filter`);                        

        console.log(newItem, editItem, deleteItem, exportItem, limitItem, filterItem)
        // TABLE DATA
        const inlineEditBtns = document.querySelectorAll('.page.active .inline-edit');
        // SINGLE ITEM INLINE EDIT
        tableRowModification(inlineEditBtns, 'editable-data');
    }
}
const run = (data) => {
    if((data.reload == true) || (!site[data.name])){
        let ajaxRequest = $.ajax({
            url: "http://localhost/joinedlifestyleoutdoorgear/api/route.php",
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

const generalRequest = (data) => {
    let ajaxRequest = $.ajax({
        url: "http://localhost/joinedlifestyleoutdoorgear/api/route.php",
        type: "POST",
        dataType  : 'json',
        data: data
    });

    return ajaxRequest;

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
const removeNotification = (time=8000) => {
    setTimeout(function(){
        document.querySelector('.notification_messages').classList.forEach((nclass) => {
            if(nclass !== 'notification_messages'){
                document.querySelector('.notification_messages').classList.remove(nclass);
            }
        });

    }, time);
}
