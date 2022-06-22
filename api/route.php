<?php  

    // INNITUALIAZE API
	require_once('../core/init.php');
	// INSTANCIATE MODEL/ALL THE CLASSES
	$Model = new Model($db);

    // INSTANCIATE THE OTHE CLASSES AND PASS THE MODEL CLASS TO THEM
    $productController = new Products($Model);
	$accountController = new Accounts($Model);
	$supplierController = new Supplier($Model);
	$saleController = new Sales($Model);
	$categoryController = new Categories($Model);
	$statusController = new Statuses($Model);
	$brandController = new Brands($Model);
	$sizeController = new Sizes($Model);
	$branchController = new Branches($Model);
	$colorController = new Colors($Model);
	$paymentTypeController = new Payment_types($Model);
	$discountController = new Discounts($Model);

    $request = $_POST['action'];

	// ROUTES updateSpecificSaleInform
	switch ($request) {
		case 'authenticate':
			$auth = new Auth($Model);
			$user_details = $auth->authenticate($_POST["username"], $_POST["password"]);
        break;
		case 'getCategories':
			$category_list = $categoryController->getCategories();
        break;
		case 'getCurrencys':
			$currency_list = $saleController->getCurrencys();
        break;
		case 'getStatus':
			$status_list = $statusController->getStatus();
        break;
		case 'getBrands':
			$brand_list = $brandController->getBrands();
        break;
		case 'getBranches':
			$branch_list = $branchController->getBranches();
        break;
		case 'getSizeSchemes':
			$sizeScheme_list = $sizeController->getSizeSchemes();
        break;
		case 'getUserTypes':
			$userType_list = $accountController->getUserTypes();
        break;
		case 'getPaymentTypes':
			$paymentType_list = $paymentTypeController->getPaymentTypes();
        break;
		case 'getDiscounts':
			$discount_list = $discountController->getDiscounts();
        break;
		case 'getCustomers':
			$client_list = $accountController->getClients();
        break;
		case 'getColors':
			$color_list = $colorController->getColors();
        break;
		case 'getSizes':
			$size_list = $sizeController->getSizes();
        break;
		case 'getAllProducts':
			$productList = $productController->getAllProducts($_POST);
        break;
		case 'getLimitedProducts':
			$productList = $productController->getLimitedProducts((int) $_POST["limit"], (int) $_POST["page"]);
        break;
		case 'getAllWarehouseInventorys':
			$productList = $productController->getAllWarehouseInventorys($_POST);
        break;
		case 'getLimitedWarehouseInventory':
			$productList = $productController->getLimitedWarehouseInventory((int) $_POST["limit"], (int) $_POST["page"]);
        break;
		case 'getLimitedBranchInventoryProducts':
			$productList = $productController->getLimitedBranchInventoryProducts($_POST);
        break;

		case 'getAllBranchInventorys':
			$BranchInventoryList = $productController->getAllBranchInventorys($_POST);
        break;
		case 'searchAllBranchInventorys':
			$BranchInventoryList = $productController->getAllBranchInventorys($_POST);
        break;
		case 'getLimitedBranchInventory':
			$BranchInventoryList = $productController->getLimitedBranchInventory((int) $_POST["limit"], (int) $_POST["page"]);
        break;
		case 'getAllUsers':
			$accountList = $accountController->getAllUsers($_POST);
        break;
		case 'getLimitedUsers':
			$accountList = $accountController->getLimitedUsers((int) $_POST["limit"], (int) $_POST["page"]);
        break;
		case 'getAllSuppliers':
			$supplierList = $supplierController->getAllSuppliers($_POST);
        break;
		case 'getLimitedSuppliers':
			$supplierList = $supplierController->getLimitedSuppliers((int) $_POST["limit"], (int) $_POST["page"]);
        break;
		case 'updateSale': 
			$slaeList = $saleController->updateSale($_POST);
        break;
		case 'getAllInvoices': 
			$slaeList = $saleController->getAllInvoices($_POST);
        break;
		case 'getLimitedInvoices':
			$slaeList = $saleController->getLimitedInvoices((int) $_POST["limit"], (int) $_POST["page"], $_POST);
        break;
		case 'saveProduct':
			$productList = $productController->saveProduct($_POST);
        break;
		case 'updateProduct':
			$productList = $productController->updateProduct($_POST);
			break;
		case 'saveBranchinventory':
			$branchinventoryList = $productController->saveBranchinventory($_POST);
		break;
		case 'returnToWareHouse':
			$branchinventoryList = $productController->returnToWareHouse($_POST);
			break;
		case 'updateBranchinventory':
			$branchinventoryList = $productController->updateBranchinventory($_POST);
			break;
		case 'updateWarehouseinventory':
			$warehouseinventoryList = $productController->updateWarehouseinventory($_POST);
			break;
		case 'saveWarehouseinventory':
			$warehouseinventoryList = $productController->saveWarehouseinventory($_POST);
        break;
		case 'delete_info':
			// ACTUAL DELETING
			// if($Model->delete($_POST['data']['tb'], $_POST['data']['field'] , (int)$_POST['data']['id'])){
			// 	echo json_encode(array('response' => 'success', 'message' => "Deleted successfully"));
			// }
			// CHANGE STATUS TO 0 SO IT WONT BE ACCESSIBLE BUT RECOVERABLE
			$updateData = array('status_id' => 0);
			if($Model->updateDetails($_POST['data']['tb'], $_POST['data']['field'], (int) $_POST['data']['id'], $updateData)){
				echo json_encode(array('response' => 'success', 'message' => "Deleted successfully"));
			}
			else{
				echo json_encode(array('response' => "danger", 'message' => 'Something went wrong'));
			}
		break;
        case 'getTotal':
        	$dt = explode('|', $_POST['tbs']);
			$res = array();
			$counter = 1;
        	foreach ($dt as $value) {
        		if($counter % 2 == 0){
        			$index = $counter - 1;
					$sql = "SELECT COUNT(*) AS total FROM " . $dt[$index];
					$result = $Model->getDetails($sql, array());
					$total_data = $result->fetch(PDO::FETCH_ASSOC);
					// echo json_encode($total_data);
					$res[] = array($dt[$index - 1] => (int)$total_data['total']);

        		}
        		$counter++;
        	}
			echo json_encode($res);
        break;
		case 'getBranchesInventoryProducts':
			$productList = $productController->getBranchesInventoryProducts($_POST);
        break;
		case 'getBranchesInvoices':
			$saleList = $saleController->getBranchesInvoices($_POST);
        break;
		// POS
		case 'make_sale':
			$saleController->makeTransaction($_POST['data']);
		break;
		case 'search_products':
		$productController->search_products((int)$_POST['data']['branch_id'], $_POST['data']);
		break;
    }

?>