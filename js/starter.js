
let res = null;
let site = {};
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! navigation 
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

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

if(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')){
    if(JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')).session){
        window.location.href = './index.html';
    }else{
        deliverNotification('Thank you, signin please', 'success');
    }
}

// ------------------ GET/SET SITE BESIC DATA --------------------
if(!localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear')){
    localStorage.setItem('sys.pos.warehouse.lifestyle-outdoor-gear', JSON.stringify(site));
}
site = JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear'));

let page = 1;
let start = true;

const updateSiteData = (data) => {
    // localStorage.clear();

    localStorage.setItem('sys.pos.warehouse.lifestyle-outdoor-gear', JSON.stringify(data));
    site = JSON.parse(localStorage.getItem('sys.pos.warehouse.lifestyle-outdoor-gear'));
}

const dataRequest = (requestName, requestData, counter, reload = 'false') => {
    let lowerCaseRqtNm = requestName.toLowerCase(); // eg invoice NOTE:: requestName must be received with its first letter capital ang it shoudn't be in plural eg. Invoice
    let localStorageNm = `${lowerCaseRqtNm}List`; //eg invoiceList
    let action = `getAll${requestName}s`; // eg. getAllInvoice Note:: first letter of requestName must be capital
    $.ajax({
        url: "http://localhost/sys.pos.warehouse.lifestyle-outdoor-gear/api/route.php",
        type: "POST",
        dataType  : 'json',
        data: requestData,
        success: function(data){
            if(data.length > 0){
                // GET FIRST CHUNK OF DATA AND ADD IT TO SITE DATA
                site[localStorageNm] = data;

                // UPDATE SITE DATA
                updateSiteData(site);
            }
        },
        complete:function(data){
            data.always(all => {;
                counter++;
                if(all.length > 0 && counter == 2){
                    // GET ALL THE DATA
                    setTimeout(dataRequest(requestName, {'action': action}, counter, true), 0);
                }
            });
        }
    });
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
// LOAD PRODUCT LIST  convert
setTimeout(dataRequest('Product', {'limit': 15,'action':'getLimitedProducts', 'page': page}, 1), 0);

// LOAD WAREHOUSE INVENTORY PRODUCT LIST
setTimeout(dataRequest('WarehouseInventory', {'limit': 15,'action':'getLimitedWarehouseInventory', 'page': page}, 1), 0);

// LOAD BRANCH INVENTORY LIST
// setTimeout(dataRequest('BranchInventory', {'limit': 15,'action':'getLimitedBranchInventory', 'page': page}, 1), 0);

// LOAD USER LIST
setTimeout(dataRequest('User', {'limit': 15,'action':'getLimitedUsers', 'page': page}, 1), 0);

// LOAD SUPPLIER LIST
setTimeout(dataRequest('Supplier', {'limit': 15,'action':'getLimitedSuppliers', 'page': page}, 1), 0);

// // LOAD INVOICE LIST
// setTimeout(dataRequest('Invoice', {'limit': 15,'action':'getLimitedInvoices', 'page': page}, 1), 0);

// LOAD HELPER DATA LIST
setTimeout(autorun({'reload': false, 'action':'getBranches', 'name': 'branchList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getCategories', 'name': 'categoryList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getStatus', 'name': 'statusList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getBrands', 'name': 'brandList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getSizeSchemes', 'name': 'sizeSchemeList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getUserTypes', 'name': 'userTypeList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getCustomers', 'name': 'customerList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getColors', 'name': 'colorList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getSizes', 'name': 'sizeList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getPaymentTypes', 'name': 'paymentTypeList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getDiscounts', 'name': 'discountList'}), 0);
setTimeout(autorun({'reload': false, 'action':'getCurrencys', 'name': 'currencyList'}), 0);

// LOAD All Branch Inventory
let action = 0;
let c = setInterval(() => {
    if(site.branchList){
        action++;
        // clearInterval();
        if(action == 1){
            site.branchList.forEach(branch => {
                // console.log(branch)
                setTimeout(()=>{
                    allBranchesDataRequest(branch.id, 'allbranchesinventoryproducts', {'limit': 500, 'page': 1, 'branch_id': branch.id, 'action':'getBranchesInventoryProducts'}, 1);
                }, 0);
                setTimeout(()=>{
                    if(!site.allbranchessaleinvoices){
                        site.allbranchessaleinvoices = {};
                    }
                    site.allbranchessaleinvoices[branch.id] ={};
                    // allBranchesDataRequest(branch.id, 'allbranchessaleinvoices', {'limit': 500, 'sdate': today, 'edate': today, 'page': 1, 'branch_id': branch.id, 'action':'getBranchesInvoices'}, 1);
                }, 0);

            });
        }
    }
}, 50);

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
// AUTO REFRESH SITE AFTER 5 Secounds IF THEIR ARE CHANGES IN DATA
setInterval( () => {
    let requestData = {'action':'getTotal', 'tbs': "WarehouseInventory|warehouseInventory_tb|Invoice|invoice_tb|Product|product_detail_tb|User|user_tb|branchinventory|branch_inventory_tb"};
    getTotals(requestData);
}, 5000); //600000

// GET TOTALS AND COMPARE WITH CURRENT VALUES
const getTotals = (requestData) => {
    setTimeout(() => {
        $.ajax({
            url: "http://localhost/sys.pos.warehouse.lifestyle-outdoor-gear/api/route.php",
            type: "POST",
            dataType  : 'json',
            data: requestData,
            success: function(data){
                if(data.length > 0 ){
                    data.forEach(res => {
                        // console.log(res);
                        // let requestName = Object.keys(res)[0];
                        // let total = res[requestName];
                        // let lowerCaseRqtNm = requestName.toLowerCase();
                        // let localStorageNm = `${lowerCaseRqtNm}List`; //eg invoiceList general se
                        // if(site[localStorageNm]){
                        //     if(total != site[localStorageNm].length){
                        //         console.log('Datachanged Update info')
                        //         // dataRequest(requestName, {'limit': 15,'action': `getAll${requestName}s`}, 2, true);
                        //     }
                        // }
                    })
                }
            }
        });
    }, 0);
};
const pswdField = document.getElementById('signinPassword');
let pswdToggleBtn = document.getElementById('togglePass');

pswdToggleBtn.addEventListener('click', () => {
	if(pswdField.type == 'password'){
		pswdToggleBtn.textContent = 'visibility_off';
		pswdField.type ='text';
	}else{
		pswdToggleBtn.textContent = 'visibility';
		pswdField.type ='password';
	}
});


document.getElementById('sign-in-form').addEventListener('submit', (e) => {
	e.preventDefault();

    document.querySelector('section').after(preloader());

    const signinUsername = document.getElementById('signinUsername').value;
    const signinPassword = document.getElementById('signinPassword').value;

    if(signinPassword != "" && signinUsername !=""){
        let response = signin(signinUsername, signinPassword);
        response.always(function(data){
            if(data != 'Invalid username or password.'){
                // ---------------- SET CART & PAGE INITUAL VALUE ----------------
                site.session = data.session;
                site.cart = {};
                site.page = {'pageIndex': 0, 'pg': 'home'};
                site.searchResult = {};

                // -------------------- STORE SITE BESIC DATA  -------------------
                updateSiteData(site);
                if(typeof(site.session) == 'object'){
                    if (Number(data.session.user_type_id) == 1) {
                        window.location.href = './index.html';
                    }else if (Number(data.session.user_type_id) == 2){
                        window.location.href = './pos.html';
                    }else{
                        removeElement('div.preloader');
                        deliverNotification('Something went wrong', 'warning');
                    }
                }

            }else{
                deliverNotification(data, 'danger');
                removeElement('div.preloader');
            }
        });
    }else{
        removeElement('div.preloader');
        deliverNotification('username and password required', 'danger');
    }
});

const signin = (username, password) => {
    const data = {
        'action':'authenticate',
        'username': username,
        'password': password
    }
    let res = run(data);
    return res;
}
const run = (data) => {
	let ajaxRequest = $.ajax({
	    url: "http://localhost/sys.pos.warehouse.lifestyle-outdoor-gear/api/route.php",
	    type: "POST",
	    dataType  : 'json',
	    data: data
	});

	return ajaxRequest;
}
