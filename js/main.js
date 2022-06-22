// GENERAL VARIABLES
let res = null;
let site = {};
let limit = 15;
let page = 1;
let start = true;

let navLinks = document.querySelectorAll('.nav-link');
const searchBar = document.getElementById('nav-search');

// GET TODAY'S DATE
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! navigation make-transaction
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

// CHECK IF USER IS LOGGED IN EVERAY AFTER 5 SECOUNDS
setInterval( () => {
    if(!localStorage.getItem('joinedlifestyleoutdoorgear')){
        window.location.href = './signin.html';
    }
}, 5000); 
// CHECK IF USER IS LOGED IN
if(!localStorage.getItem('joinedlifestyleoutdoorgear')){
    window.location.href = './signin.html';
}else if(!JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear')).session){
    window.location.href = './signin.html';
}else if(Number(JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear')).session.user_type_id) > 2){
    window.location.href = './signin.html';
}
// GET LOCAL DATA
site = JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear'));

/**
 * SYSTEM FUNCTIONS A-Z
 **/
    const allBranchesDataRequest = (dataKey, requestName, requestData, counter, reload = 'false') => {
        // GET FIRST allbranchesinventoryproducts IS SET
        // IF ITS NOT SET, SET IT TO AN EMPTY OBJECT
        if(!site[requestName]){
            site[requestName] = {}
        }
        $.ajax({
            url: "http://localhost/joinedlifestyleoutdoorgear/api/route.php",
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
    // UPDATE SITE DATA
    const updateSiteData = (data) => {
        localStorage.setItem('joinedlifestyleoutdoorgear', JSON.stringify(data));
        site = JSON.parse(localStorage.getItem('joinedlifestyleoutdoorgear'));
    }
    // RENDER DYNAMIC PAGE DATA
    const renderPageData = (data, identifier, count = 0) => {
        let user_branch_id =  (site.session.branch == 'All') ? 0 : site.session.branch_id;
        switch(identifier){
            case 'allbranchesinventoryproducts':
                let dataArrayFormat = [];
                let branchInventoryProducts = {};
                let itemContainer = document.getElementById('branchinventoryproducts_list');
                itemContainer.innerHTML ="";
                if(user_branch_id != 0){
                    branchInventoryProducts = data[user_branch_id];
                    Object.keys(branchInventoryProducts).forEach((infoKey, index, infoKeys) => {
                        itemContainer.insertAdjacentHTML('beforeend', productTmp(branchInventoryProducts[infoKey], index));
                    });
                }else{
                    Object.keys(data).forEach((dataKey, index) =>{
                        // console.log(data[dataKey]);
                        Object.keys(data[dataKey]).forEach((innerDataKey, index) =>{
                            branchInventoryProducts[innerDataKey] = data[dataKey][innerDataKey];
                            itemContainer.insertAdjacentHTML('beforeend', productTmp(branchInventoryProducts[innerDataKey], index));
                        });
                    });
                }
                // MAKE PRODUCT ITEMS CLICKABLE
                showItemDetails();
                // generatePegination(site[localStorageNm], lowerCaseRqtNm);

                // console.log(branchInventoryProducts);
            break;
        }

    }
    const productTmp = (itemData, index)=>{
        let firstItemDetails = itemData.product_sizes[0]
        console.log(itemData);
        console.log(firstItemDetails.quantity)
        let tmp = `
            <div class="product" data-page="1">
                <a class="list-item" data-details="item-identifier-${firstItemDetails.branch_inventory_id}" href="#" data-item-colors='${JSON.stringify(itemData.product_colors)}'>
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
                            <h3>Item Details</h3>
                            <span data-pg="home" data-pgno="0" class="material-icons-outlined hide nav-link ">close</span>
                        </div>
                        <div class="list-item item-besic-info">
                            <div class="item-image">
                                <img src="./images/${firstItemDetails.image}">
                            </div>
                            <h2>${firstItemDetails.sale_price} <small>/=</small></h2>
                            <span>${firstItemDetails.name}</span>
                            <small></small>
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
        // console.log(dRate); joinedlifestyleoutdoorgear
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
                url: "http://localhost/sys.pos/api/route.php",
                type: "POST",
                dataType  : 'json',
                data: data,
                success: function(details){
                    console.log(details)
                }
            });
            return ajaxRequest;
        }
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

        // TRANSFORM VALUE
        const transformValue = site.page.pageIndex * 74;

        // NAVIGATE TO THE PAGE CLICKED
        document.querySelector('main .container .content').style.transform = `translateX(-${transformValue}vw)`;
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
        let discount = 0;
        let paymentType = "Cash";
        let count = 1;

        let cart = site.cart;
        let cartItemsKeys = Object.keys(cart);
        let td = "";
        let cartItem;


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
            document.getElementById('DiscountPrice_identifier').textContent = totalPrS + ' ' + cart[cartItemsKeys[0]].currency;
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
            // console.log(document.getElementById(unique+ "price"))
            // console.log(document.getElementById(`cartQuantity-${unique}`)) make_sale
            adjustBtn.addEventListener('click', () => {
                let currentQuantity, availableQuantity, qtyInput;
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

    const loadCurrency =()=> {
        document.getElementById('dollar_rate_update').value = Number(site.currencyList.filter(currency => (currency.symbol == '$'))[0].rate);
        document.getElementById('currency').innerHTML = generateDropdown(site.currencyList, 'name', 'rate', 'Currency');
        document.getElementById('currency_return').innerHTML = generateDropdown(site.currencyList, 'name', 'rate', 'Currency');
        document.getElementById('sale_curencies').innerHTML = generateDataList(site.currencyList, 'name');//generateDropdown(site.currencyList, 'name', 'rate', 'Currency');
        document.getElementById('dollar_rates').innerHTML = generateDataList(site.currencyList, 'rate');
        document.getElementById('dollar_rates_return').innerHTML = generateDataList(site.currencyList, 'rate');
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
        document.querySelector('aside .profile .profile-photo').innerHTML = `<img src="./images/${site.session.image}">`;
        document.querySelector('aside .profile .handle p').innerHTML = `@${site.session.username}`;
        document.querySelector('aside .profile .handle h4').innerHTML = `${site.session.last_name} ${site.session.first_name}`;

    }
/**
 * END OF SYSTEM FUNCTIONS
 **/

/**
 * AFTER PAGE CONTENT IS LOADED
 **/
document.addEventListener('DOMContentLoaded', () => {


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
    let profile = document.getElementById('user-profile');
    console.log(profile.children[1].children[1])
    profile.children[0].children[0].setAttribute('src', `./images/${site.session.image}`);
    profile.children[1].children[0].textContent = site.session.last_name + ' ' + site.session.first_name;
    profile.children[1].children[1].innerHTML = `<i>@</i>${site.session.username}`;

    // SET BRANCH OUTLET AND DATE ON HOME PAGE
    document.querySelector('.dateN').textContent = today;
    document.querySelector('.outletV').textContent = 'Outlet: ' +site.session.branch;
    
    // VALIABLE TO KEEP TRACK OF LOCAL DATA AVAILABILITY
    // IT CONTAINTS SITE DATA KEYS 
    // EACH KEY WILL BE COMPARED WITH SITE DATA KEYS
    const expectedData = {
        'allbranchesinventoryproducts': 'branchinventoryproduct',
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
                        renderPageData(site[siteDataKey], siteDataKey);
                    }
                }); 
            }
        });
        // console.log(Object.keys(site))

    }, 1000);

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
    setTimeout(function () {
        document.getElementById('add_purchase_date').value = today;
        document.getElementById('add_purchase_date').addEventListener('change', () => {
            generateReceipt();
        })
        // GET BRANCHES generateCart
        document.getElementById("admin_sale_at_specific_branch").innerHTML = generateDropdown(site.branch_list, 'name', 'id', 'Admin select Branch  ');
        // GET PAYMENT DISCOUNTS
        document.getElementById('add_discounts').innerHTML = generateDataList(site.discount_list, 'name');
        // // GET PAYMENT TYPES
        document.getElementById('add_payment_types').innerHTML = generateDataList(site.payment_types_list, 'name');
        // // GET CURSTOMER NAMES
        document.getElementById('add_customer_fnames').innerHTML = generateDataList(site.customerList, 'fname');
        document.getElementById('add_customer_1names').innerHTML = generateDataList(site.customerList, 'lname');
        document.getElementById('add_customer_telephones').innerHTML = generateDataList(site.customerList, 'telephone');
        document.getElementById('add_customer_emails').innerHTML = generateDataList(site.customerList, 'email');
   
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
    },1);

    function clearFields(elements) {
        elements.forEach(element => element.value = '');
    }
    document.getElementById('make-transaction').addEventListener('submit', (e) => {
        e.preventDefault();
        generateReceipt();
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
                        // console.log(convertedPrice,site.cart[cart_item].currency.trim(), Number(site.cart[cart_item].sale_price))
                        if(site.cart[cart_item].currency.trim() == '$'){
                            convertedPrice =  (convertedPrice * dollarRate);//(site.cart[cart_item].currency.trim() != '$') ? (Math.round((convertedPrice + Number.EPSILON) * 100) / 100 ) : ((Math.round((convertedPrice/rate) + Number.EPSILON) * 100) / 100 );
                            // console.log(convertedPrice, site.cart[cart_item].currency.trim() )
                        }

                        site.cart[cart_item].sale_price = convertedPrice;
                        saleItems.push(site.cart[cart_item]);
                    });
                    purchaseDetails.cart = saleItems;
                    // console.log(purchaseDetails) loadSal

                    document.querySelector('div.page.show .cart_details').append(preloader());

                    let view = performOperation("make_sale", purchaseDetails);
                    // console.log(view)
                    view.always(function(data){
                        console.log(data)

                        if(data.response == 'success'){
                            if (document.getElementById('prechecked_print_receipt').checked == true){
                                document.getElementById('invoice_date').innerHTML = `<b>Date</b> ${data.message.date}`
                                document.getElementById('invoice_no').innerHTML = `<b>No.</b> ${data.message.invoiceNo}`
                                print();
                            }
                            deliverNotification("Transaction completed successfully", 'success');
                            // CLEAR FIELDS
                            clearCart();
                            // UPDATE SITE DATA WITH THE UPDATED LIST OF SALES
                            // UPDATE PRODUCT QUANTITY IN THE BRANCH INVENTORY PRODUCT
                            // UPDATE SITE DATA
                            resetAdminToNoBranch();
                            
                            // UPDATE SITE PAGE(SAVE CURRENT PAGE)
                            site.page.pg = 'home';
                            site.page.pageIndex = 0;
                            updateSiteData(site)

                            // ADD ALL LOCAL DATA KEYS THAT HAVE NEW DATA DUE TO THE TRANSACTION
                            // THE CHECKER WILL UPDATE DATA DURING THE RENDER PROCES
                            // IT WILL LOOP THROUGH THE KEYS IN SITE CORRESPONDING TO THEM
                            const expectedData = {
                                'allbranchesinventoryproducts': 'branchinventoryproduct',
                            };
                        }else{
                            deliverNotification(data.message, 'danger');
                        }

                        // NAVIGATE TO HOME PAGE
                        navigateTo(`./pos.html?pg=${site.page.pg}`);
                        // window.location.href = 'pos.html';
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

    document.getElementById('add_discount').addEventListener('change', () => {
        site.discount_list.forEach((discount_item) => {
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
    }) 
       
    // EXPORT SELD PRODUCT LIST OT EXCEL FILE generateC
    if(site.session.user_type_id == 1){
        document.getElementById('export_sales').addEventListener('click', () => {
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
    const totalPriceSting = document.getElementById('totalPrice_identifier').textContent.split(' ')[0];
    const totalPriceDiscountedSting = document.getElementById('DiscountPrice_identifier').textContent.split(' ')[0];
    saleCurrencyInput.addEventListener('change', () => {
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

    // SIGNOUT
    document.querySelector('#siginout').addEventListener('click', () => {
        delete site.session;
        updateSiteData(site)
        window.location ='./signin.html';
    });


});