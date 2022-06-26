<?php  
class Products{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}
	public function saveBranchinventory($post){
		$sql = "SELECT * FROM `branch_inventory_tb` WHERE `warehouse_inventory_id` = ? AND `branch_id` = ?";
		$doesInventoryProductExist = $this->p_instance->getDetails($sql, array('warehouse_inventory_id' => (int) $post['data']['warehouse_inventory_id'], 'branch_id' => (int) $post['data']['branch_id']));
        $num = $doesInventoryProductExist->rowCount();
		if($num > 0){ 
			echo json_encode(array('response'=> "warning", 'message' => 'Product already Exist Branch inventory'));
		}else{
			$warehouse_inventory_id = (int) $post['data']['warehouse_inventory_id'];
			$remainingQuantity = (int) $post['data']['remainingQuantity'];
			// UPDATE INVENTORY PRODUCT
			$updatedInventoryDetails =  $this->updateWarehouseInventoryQuantity($warehouse_inventory_id, $remainingQuantity);
			if($updatedInventoryDetails){
				$inventory_details = array(
					'warehouse_inventory_id' =>  $warehouse_inventory_id,
					'branch_id' =>   (int) $post['data']['branch_id'],
					'date' =>   $post['data']['date'],
					'quantity' => (int) $post['data']['quantity']
				);
				$inventory_id = $this->p_instance->Save("branch_inventory_tb", $inventory_details);
				if($inventory_id){
					$inventoryDetails = $this->getOneBranchInventoryProduct($inventory_id);
					$res = array(
						'response'=> "success", 
						'message' => 'Product added to inventory successfully', 
						'info' => $inventoryDetails, 
						'id' => $warehouse_inventory_id, 
						'change' => $remainingQuantity,  
						'secondary' => 'warehouseinventoryList'
					);
					echo json_encode($res);
				}else{
					echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
				}
			}


		}
	}
	public function updateWarehouseInventoryQuantity($inventory_id, $quantity){
		$updateData = array('quantity' => (int) $quantity);
		$res =  $this->p_instance->updateDetails('warehouseInventory_tb', 'inventory_id', $inventory_id, $updateData);
		return $res;
	}
	public function returnToWareHouse($post){
		$warehouse_inventory_id = (int) $post['data']['warehouse_inventory_id'];
		$returnQuantity = (int) $post['data']['quantity'];
		$availableQuantity = (int) $post['data']['availableQuantity'];
		$newQauntity = $returnQuantity + $availableQuantity;
		$branch_inventory_id = (int) $post['data']['inventory_id'];
		// UPDATE INVENTORY PRODUCT
		$updatedInventoryDetails =  $this->updateWarehouseInventoryQuantity($warehouse_inventory_id, $newQauntity);
		if($updatedInventoryDetails){
			$inventory_details = array(
				'quantity' => 0
			);
			$inventory_id = $this->p_instance->updateDetails('branch_inventory_tb', 'branch_inventory_id', $branch_inventory_id, $inventory_details);;
			if($inventory_id){
				$inventoryDetails = $this->getOneBranchInventoryProduct($branch_inventory_id);
				$res = array(
					'response'=> "success", 
					'message' => 'Product quantity returned to warehouse inventory successfully', 
					'info' => $inventoryDetails, 
					'id' => $warehouse_inventory_id, 
					'change' => $newQauntity,  
					'secondary' => 'warehouseinventoryList'
				);
				echo json_encode($res);
			}else{
				echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
			}
		}
	}
	public function updateBranchinventory($post){
		$warehouse_inventory_id = (int) $post['data']['warehouse_inventory_id'];
		$branch_inventory_id = (int) $post['id'];
		$availableQuantity = (int) $post['data']['availableQuantity'];
		$updatedInventoryDetails =  $this->updateWarehouseInventoryQuantity($warehouse_inventory_id, $availableQuantity);
		if($updatedInventoryDetails){
			$updateData = array(
				'warehouse_inventory_id' =>  $warehouse_inventory_id,
				'branch_id' =>   (int) $post['data']['branch_id'],
				'date' =>   $post['data']['date'],
				'quantity' => (int) $post['data']['quantity']
			);
			$res =  $this->p_instance->updateDetails('branch_inventory_tb', 'branch_inventory_id', $branch_inventory_id, $updateData);
			if($branch_inventory_id){
				echo json_encode(array('response'=> "success", 'message' => 'Branch inventory  Details updated successfully'));
			}else{
				echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
			}

		}else{
			echo json_encode(array('response'=> "warning", 'message' => 'Update failed'));
		}
	}
	public function updateWarehouseinventory($post){
		$inventory_id = (int) $post['id'];
		$updateData = array(
			'product_id' =>  (int)  $post['data']['product_id'],
			'colour_id' =>   (int) $post['data']['colour_id'],
			'code' => $post['data']['code'],
			'size_id' =>  (int) $post['data']['size_id'],
			'quantity' => (int) $post['data']['quantity'],
			'description' => $post['data']['description'],
		);
		$res =  $this->p_instance->updateDetails('warehouseInventory_tb', 'inventory_id', $inventory_id, $updateData);
		if($inventory_id){
			$inventoryDetails = $this->getOneWarehouseInventoryProduct($inventory_id);
			echo json_encode(array('response'=> "success", 'message' => 'Inventory  Details updated successfully', 'info' => $inventoryDetails));
		}else{
			echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
		}
		// echo json_encode($updateData);
	}
	public function saveWarehouseinventory($post){
		$sql = "SELECT * FROM `warehouseInventory_tb` WHERE `product_id` = ? AND `colour_id` = ? AND `size_id` = ?";
		$doesInventoryProductExist = $this->p_instance->getDetails($sql, array('product_id' => (int) $post['data']['product_id'], 'colour_id' => (int) $post['data']['colour_id'], 'size_id' => (int) $post['data']['size_id']));
        $num = $doesInventoryProductExist->rowCount();
		if($num > 0){ 
			echo json_encode(array('response'=> "warning", 'message' => 'Product already Exist'));
		}else{
			$inventory_details = array(
				'product_id' =>  (int)  $post['data']['product_id'],
				'colour_id' =>   (int) $post['data']['colour_id'],
				'code' => $post['data']['code'],
				'size_id' =>  (int) $post['data']['size_id'],
				'quantity' => (int) $post['data']['quantity'],
				'description' => $post['data']['description'],
			);

			$inventory_id = $this->p_instance->Save("warehouseInventory_tb", $inventory_details);

			if($inventory_id){
				$inventoryDetails = $this->getOneWarehouseInventoryProduct($inventory_id);
				echo json_encode(array('response'=> "success", 'message' => 'Product added to inventory successfully', 'info' => $inventoryDetails));
			}else{
				echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
			}

		}
	}
	public function updateProduct($post){
		$product_id = (int) $post['id'];
		$updateData = array(
			'product_name' => $post['data']['product_name'],
			'code_initual' => $post['data']['code_initual'],
			'category_id' => (int) $post['data']['category_id'],
			'sale_price' => $post['data']['sale_price'],
			'buy_price' => $post['data']['buy_price'],
			'brand_id' => (int) $post['data']['brand_id'],
			'size_scheme_id' => (int) $post['data']['size_scheme_id'],
			'supplier_id' => (int) $post['data']['supplier_id'],
		);
		$res =  $this->p_instance->updateDetails('product_detail_tb', 'product_id', $product_id, $updateData);
		if($product_id){
			$productDetails = $this->getSingleProduct($product_id);
			echo json_encode(array('response'=> "success", 'message' => 'Product Details updated successfully', 'info' => $productDetails));
		}else{
			echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
		}
		// echo json_encode($res);
	}
	public function saveProduct($post){
		$sql = "SELECT * FROM `product_detail_tb` WHERE product_name = ? ";
		$doesProductExist = $this->p_instance->getDetails($sql, array('product_name' => $post['data']['product_name']));
        $num = $doesProductExist->rowCount();
		if($num > 0){ 
			echo json_encode(array('response'=> "warning", 'message' => 'Product already Exist'));
		}else{
			$product_details = array(
				'product_name' => $post['data']['product_name'],
				'code_initual' => strtoupper($post['data']['code_initual']),
				'category_id' => (int) $post['data']['category_id'],
				'sale_price' => $post['data']['sale_price'],
				'buy_price' => $post['data']['buy_price'],
				'brand_id' => (int) $post['data']['brand_id'],
				'size_scheme_id' => (int) $post['data']['size_scheme_id'],
				'supplier_id' => (int) $post['data']['supplier_id'],
			);

			$product_id = $this->p_instance->Save("product_detail_tb", $product_details);

			if($product_id){
				$productDetails = $this->getSingleProduct($product_id);
				echo json_encode(array('response'=> "success", 'message' => 'Product added successfully', 'info' => $productDetails));
			}else{
				echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
			}
		}
	}
	public function getSingleProduct($product_id){
		$dataArr = array();
		$sql = "SELECT pt.*, cy.category_name, bd.brand_name, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM product_detail_tb pt LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id WHERE pt.product_id = ?  AND status_id != 0 ";

		$result = $this->p_instance->getDetails($sql, array('pt.product_id' => $product_id));

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $product_id,
				'name' => $product_name,
				'code_initual' => $code_initual,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'supplier' => $supplier, 
				'supplier_id' => $supplier_id, 
				'scheme_name' => $scheme_name
			);

		}
		return $dataArr[0];
	}
	public function getOneWarehouseInventoryProduct($inventory_id){
		$dataArr = array();
		$sql = "SELECT 
			iv.*, cl.colour_name, sz.size_label, im.image_name, pt.*, cy.category_name, bd.brand_name, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM warehouseInventory_tb iv 
			LEFT OUTER JOIN product_detail_tb pt ON pt.product_id = iv.product_id 
		    LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
		    LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
		    LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
		    LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id 
		    LEFT OUTER JOIN colour_tb cl ON iv.colour_id = cl.colour_id 
		    LEFT OUTER JOIN size_tb sz ON iv.size_id = sz.size_id 
		    LEFT OUTER JOIN inventory_product_images_tb im ON iv.inventory_id = im.inventory_id 
		    WHERE iv.inventory_id = ?  AND iv.status_id != 0  AND pt.status_id != 0 
		    ORDER BY iv.inventory_id  DESC";

		$result = $this->p_instance->getDetails($sql, array('iv.inventory_id' => $inventory_id));

		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $inventory_id,
				'product_id' => $product_id,
				'name' => $product_name,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'color' => $colour_name, 
				'desc' => $description, 
				'code' => $code, 
				'size' => $size_label, 
				'quantity' => $quantity, 
				'supplier' => $supplier, 
				'supplier_id' => $supplier_id, 
				'scheme_name' => $scheme_name, 
				'image' => ($image_name == null) ? 'default.png' : $image_name,
			);

		}
		// CONVERT OT JSON 
		return $dataArr[0];
	}
	public function getOneBranchInventoryProduct($inventory_id){
		$dataArr = array();
		$sql = "SELECT 
			biv.*, wiv.product_id, wiv.colour_id, wiv.size_id, wiv.code, wiv.quantity AS availableQuantity, wiv.description, cl.colour_name, sz.size_label, im.image_name, pt.product_name, pt.category_id, pt.sale_price, pt.buy_price, pt.brand_id, cy.category_name, bd.brand_name, sc.scheme_name, bc.branch_location FROM branch_inventory_tb biv 
			LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
			LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id 
		    LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
		    LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
		    LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
		    LEFT OUTER JOIN colour_tb cl ON wiv.colour_id = cl.colour_id 
		    LEFT OUTER JOIN branch_tb bc ON biv.branch_id = bc.branch_id 
		    LEFT OUTER JOIN size_tb sz ON wiv.size_id = sz.size_id 
		    LEFT OUTER JOIN inventory_product_images_tb im ON wiv.inventory_id = im.inventory_id 
		    WHERE biv.branch_inventory_id = ? AND wiv.status_id != 0  AND pt.status_id != 0 
		    ORDER BY biv.branch_inventory_id  DESC";

		$result = $this->p_instance->getDetails($sql, array('biv.branch_inventory_id' => $inventory_id));

		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				
				'id' => $branch_inventory_id,
				'warehouse_inventory_id' => $warehouse_inventory_id,
				'product_id' => $product_id,
				'name' => $product_name,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'colour_id' => $colour_id, 
				'color' => $colour_name, 
				'desc' => $description, 
				'code' => $code, 
				'size' => $size_label, 
				'size_id' => $size_id, 
				'availableQuantity' => $availableQuantity, 
				'quantity' => $quantity, 
				'branch_name' => $branch_location, 
				'branch_id' => $branch_id, 
				'date' => $date, 
				'image' => ($image_name == null) ? 'default.png' : $image_name,
			);

		}
		// CONVERT OT JSON 
		return $dataArr[0];
	}


	// FORMATTED
	public function getLimitedProducts($limit, $incomingPage){
		$dataArr = array();
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT pt.*, cy.category_name, bd.brand_name, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM product_detail_tb pt LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id WHERE status_id != 0 ORDER BY product_id DESC";

		$filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		$result = $this->p_instance->getDetails($filter_query, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $product_id,
				'name' => $product_name,
				'code_initual' => $code_initual,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'supplier' => $supplier, 
				'supplier_id' => $supplier_id, 
				'scheme_name' => $scheme_name
			);

		}
		// CONVERT OT JSON home_sea
		echo json_encode($dataArr);
	}
	public function getAllProducts($post){
		$dataArr = array();
		$sql = "SELECT pt.*, cy.category_name, bd.brand_name, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM product_detail_tb pt LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id WHERE status_id != 0  ORDER BY product_id DESC";

		$result = $this->p_instance->getDetails($sql, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $product_id,
				'name' => $product_name,
				'code_initual' => $code_initual,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'supplier' => $supplier, 
				'supplier_id' => $supplier_id, 
				'scheme_name' => $scheme_name
			);

		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);
	}
	public function getLimitedWarehouseInventory($limit, $incomingPage){
		$dataArr = array();
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT 
			iv.*, cl.colour_name, sz.size_label, im.image_name, pt.*, cy.category_name, bd.brand_name, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM warehouseInventory_tb iv 
			LEFT OUTER JOIN product_detail_tb pt ON pt.product_id = iv.product_id 
		    LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
		    LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
		    LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
		    LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id 
		    LEFT OUTER JOIN colour_tb cl ON iv.colour_id = cl.colour_id 
		    LEFT OUTER JOIN size_tb sz ON iv.size_id = sz.size_id 
		    LEFT OUTER JOIN inventory_product_images_tb im ON iv.inventory_id = im.inventory_id  WHERE iv.status_id != 0  AND pt.status_id != 0 
		    ORDER BY iv.inventory_id DESC";

		$filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		$result = $this->p_instance->getDetails($filter_query, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $inventory_id,
				'product_id' => $product_id,
				'name' => $product_name,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'colour_id' => $colour_id, 
				'color' => $colour_name, 
				'desc' => $description, 
				'code' => $code, 
				'size_id' => $size_id, 
				'size' => $size_label, 
				'quantity' => $quantity, 
				'supplier' => $supplier, 
				'supplier_id' => $supplier_id, 
				'scheme_name' => $scheme_name, 
				'image' => ($image_name == null) ? 'default.png' : $image_name,
			);

		}
		// CONVERT OT JSON home_sea
		echo json_encode($dataArr);
	}
	public function getAllWarehouseInventorys($post){
		$dataArr = array();
		$sql = "SELECT 
			iv.*, cl.colour_name, sz.size_label, im.image_name, pt.*, cy.category_name, bd.brand_name, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM warehouseInventory_tb iv 
			LEFT OUTER JOIN product_detail_tb pt ON pt.product_id = iv.product_id 
		    LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
		    LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
		    LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
		    LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id 
		    LEFT OUTER JOIN colour_tb cl ON iv.colour_id = cl.colour_id 
		    LEFT OUTER JOIN size_tb sz ON iv.size_id = sz.size_id 
		    LEFT OUTER JOIN inventory_product_images_tb im ON iv.inventory_id = im.inventory_id  WHERE iv.status_id != 0  AND pt.status_id != 0 
		    ORDER BY iv.inventory_id  DESC";

		$result = $this->p_instance->getDetails($sql, array());

		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $inventory_id,
				'product_id' => $product_id,
				'name' => $product_name,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'colour_id' => $colour_id, 
				'color' => $colour_name, 
				'desc' => $description, 
				'code' => $code, 
				'size_id' => $size_id, 
				'size' => $size_label, 
				'quantity' => $quantity, 
				'supplier' => $supplier, 
				'supplier_id' => $supplier_id, 
				'scheme_name' => $scheme_name, 
				'image' => ($image_name == null) ? 'default.png' : $image_name,
			);

		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);
	}
	public function getLimitedBranchInventory($limit, $incomingPage){
		$dataArr = array();
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT 
			biv.*, wiv.product_id, wiv.colour_id, wiv.size_id, wiv.code, wiv.quantity AS availableQuantity, wiv.description, cl.colour_name, sz.size_label, im.image_name, pt.product_name, pt.category_id, pt.sale_price, pt.buy_price, pt.brand_id, cy.category_name, bd.brand_name, sc.scheme_name, bc.branch_location FROM branch_inventory_tb biv 
			LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
			LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id 
		    LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
		    LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
		    LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
		    LEFT OUTER JOIN colour_tb cl ON wiv.colour_id = cl.colour_id 
		    LEFT OUTER JOIN branch_tb bc ON biv.branch_id = bc.branch_id 
		    LEFT OUTER JOIN size_tb sz ON wiv.size_id = sz.size_id 
		    LEFT OUTER JOIN inventory_product_images_tb im ON wiv.inventory_id = im.inventory_id  WHERE wiv.status_id != 0  AND pt.status_id != 0  
		    ORDER BY biv.branch_inventory_id  DESC";

		$filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		$result = $this->p_instance->getDetails($filter_query, array());
		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $branch_inventory_id,
				'warehouse_inventory_id' => $warehouse_inventory_id,
				'product_id' => $product_id,
				'name' => $product_name,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'colour_id' => $colour_id, 
				'color' => $colour_name, 
				'desc' => $description, 
				'code' => $code, 
				'size' => $size_label, 
				'size_id' => $size_id, 
				'availableQuantity' => $availableQuantity, 
				'quantity' => $quantity, 
				'branch_name' => $branch_location, 
				'branch_id' => $branch_id, 
				'date' => $date, 
				'image' => ($image_name == null) ? 'default.png' : $image_name,
			);

		}
		// CONVERT OT JSON home_sea
		echo json_encode($dataArr);
	}
	public function getAllBranchInventorys($post){
		$dataArr = array();
		$sql = "SELECT 
			biv.*, wiv.product_id, wiv.colour_id, wiv.size_id, wiv.code, wiv.quantity AS availableQuantity, wiv.description, cl.colour_name, sz.size_label, im.image_name, pt.product_name, pt.category_id, pt.sale_price, pt.buy_price, pt.brand_id, cy.category_name, bd.brand_name, sc.scheme_name, bc.branch_location FROM branch_inventory_tb biv 
			LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
			LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id 
		    LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
		    LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
		    LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
		    LEFT OUTER JOIN colour_tb cl ON wiv.colour_id = cl.colour_id 
		    LEFT OUTER JOIN branch_tb bc ON biv.branch_id = bc.branch_id 
		    LEFT OUTER JOIN size_tb sz ON wiv.size_id = sz.size_id 
		    LEFT OUTER JOIN inventory_product_images_tb im ON wiv.inventory_id = im.inventory_id  WHERE (wiv.status_id != 0  AND pt.status_id != 0) ";

		if(!isset($post['data']['searchValue'])){
			$sql .= " ORDER BY biv.branch_inventory_id  DESC";
		}else{
			if($post['data']['searchValue'] != ""){

				$sql .= " AND (pt.product_name LIKE '%".$post['data']['searchValue']."%' OR bd.brand_name LIKE '%".$post['data']['searchValue']."%')";
			}
			$sql .= " ORDER BY biv.branch_inventory_id  DESC";
		}

		$result = $this->p_instance->getDetails($sql, array());

		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $branch_inventory_id,
				'warehouse_inventory_id' => $warehouse_inventory_id,
				'product_id' => $product_id,
				'name' => $product_name,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'colour_id' => $colour_id, 
				'color' => $colour_name, 
				'desc' => $description, 
				'code' => $code, 
				'size' => $size_label, 
				'size_id' => $size_id, 
				'availableQuantity' => $availableQuantity, 
				'quantity' => $quantity, 
				'branch_name' => $branch_location, 
				'branch_id' => $branch_id, 
				'date' => $date, 
				'image' => ($image_name == null) ? 'default.png' : $image_name,
			);

		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);
	}
	public function getLimitedBranchInventoryProducts($post){
		$dataArr = array();
		$limit = (int) $post['limit'];
		$incomingPage = (int) $post['page'];
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT DISTINCT(biv.product_id) FROM branch_inventory_tb biv
			LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
			LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id WHERE (wiv.status_id != 0  AND pt.status_id != 0 AND biv.branch_id = ?)";

		$sql .= " ORDER BY pt.product_id  ASC";
		$branch_id = (int) $post['branch_id'];
		$filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		$result = $this->p_instance->getDetails($filter_query, array('biv.branch_id' => $branch_id));
		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$productDetails = $this->get_inventory_product_color($branch_id, (int)$product_id); 
			$product_colors = $productDetails[0];
			$product_sizes = $productDetails[1];
			$dataArr[] = array(
				'product_id' => (int)$product_id,
				'product_sizes' => $product_sizes, 
				'product_colors' => $product_colors,
				'id' => (int)(count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_inventory_id'],
				'warehouse_inventory_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouse_inventory_id'],
				'name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['name'],
				'category_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_id'], 
				'sale_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['sale_price'], 
				'buy_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['buy_price'], 
				'brand_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_id'], 
				'brand_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_name'], 
				'category_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_name'], 
				'colour_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['colour_id'], 
				'color' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['colour_name'], 
				'desc' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['desc'], 
				'code' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['code'], 
				'size' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_label'], 
				'size_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_id'], 
				'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
				'warehouseAvailableQuantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouseAvailableQuantity'], 
				'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
				'branch_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_name'], 
				'branch_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_id'], 
				'image' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['image']
			);

		}
		// CONVERT OT JSON home_sea
		echo json_encode($dataArr);
	}

	public function get_inventory_product_color($branch_id, $product_id)
	{
		$sql = "
			SELECT DISTINCT(iv.colour_id), cl.colour_name, img.image_name FROM `warehouseInventory_tb` iv LEFT OUTER JOIN colour_tb cl ON cl.colour_id = iv.colour_id LEFT OUTER JOIN inventory_product_images_tb img ON iv.inventory_id = img.inventory_id WHERE iv.product_id = ?  
		";
		$result = $this->p_instance->getDetails($sql, array('iv.product_id' => (int)$product_id));

		$dataArr = array();
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$colour_sizes =$this->get_inventoryproduct_sizes((int) $colour_id,  (int)$product_id, (int)$branch_id);
			$dataArr[] = array(
				'product_id' => (int)$product_id,
				'brand_id' => (count($colour_sizes) == 0) ? 0 : $colour_sizes[0]['brand_id'], 
				'product_image' => ($image_name != null) ? $image_name: "default.png", 
				'colour_name' => $colour_name,
				'colour_id' => $colour_id,
				"color_products_sizes" => $colour_sizes
			);
		}

		return [$dataArr, $colour_sizes];


	}
	public function getBranchesInventoryProducts($post){

		$limit = (int) $post['limit'];
		$incomingPage = (int) $post['page'];
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT DISTINCT(biv.product_id) FROM branch_inventory_tb biv
			LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
			LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id WHERE (wiv.status_id != 0  AND pt.status_id != 0 AND biv.branch_id = ?)";

		$sql .= " ORDER BY pt.product_id  ASC";
		$branch_id = (int) $post['branch_id'];
		// $filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		
		$filter_query = $sql;
		$result = $this->p_instance->getDetails($filter_query, array('biv.branch_id' => $branch_id));

		$dataArr = array();
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$productDetails = $this->get_inventory_product_color($branch_id, (int)$product_id); 
			$product_colors = $productDetails[0];
			$product_sizes = $productDetails[1];
			$dataArr[] = array(
				'product_id' => (int)$product_id,
				'product_sizes' => $product_sizes, 
				'product_colors' => $product_colors,
				'id' => (int)(count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_inventory_id'],
				'warehouse_inventory_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouse_inventory_id'],
				'name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['name'],
				'category_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_id'], 
				'sale_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['sale_price'], 
				'buy_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['buy_price'], 
				'brand_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_id'], 
				'brand_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_name'], 
				'category_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_name'], 
				'colour_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['colour_id'], 
				'color' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['colour_name'], 
				'desc' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['desc'], 
				'code' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['code'], 
				'size' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_label'], 
				'size_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_id'], 
				'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
				'warehouseAvailableQuantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouseAvailableQuantity'], 
				'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
				'branch_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_name'], 
				'branch_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_id'], 
				'image' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['image']
			);

		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);

	}
	public function get_inventoryproduct_sizes($colour_id, $product_id, $branch_id){
		$inventory_id = 0;
		$quantity = 0;
		$sql = "SELECT 
		biv.*, wiv.product_id, wiv.inventory_id, wiv.colour_id, wiv.size_id, wiv.code, wiv.quantity AS warehouseAvailableQuantity, wiv.description, cl.colour_name, sz.size_label, sz.innitual, im.image_name, im.image_id, pt.product_name, pt.category_id, pt.sale_price, pt.buy_price, pt.brand_id, cy.category_name, bd.brand_name, sc.scheme_name, bc.branch_location, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM branch_inventory_tb biv 
		LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
		LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id 
	    LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
	    LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
	    LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
	    LEFT OUTER JOIN colour_tb cl ON wiv.colour_id = cl.colour_id 
	    LEFT OUTER JOIN branch_tb bc ON biv.branch_id = bc.branch_id 
	    LEFT OUTER JOIN size_tb sz ON wiv.size_id = sz.size_id 
	    LEFT OUTER JOIN inventory_product_images_tb im ON wiv.inventory_id = im.inventory_id  
		LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id 
	    WHERE (wiv.status_id != 0  AND pt.status_id != 0 AND biv.branch_id = ? AND wiv.product_id = ? AND wiv.colour_id =  ? AND biv.quantity > 0 ) ORDER BY pt.product_name DESC";
				$result = $this->p_instance->getDetails($sql, array('biv.branch_id' => (int) $branch_id,'wiv.product_id' => (int) $product_id, 'wiv.colour_id' => (int) $colour_id));

		$dataArr = array();
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id' => $colour_id,
				'branch_inventory_id' => $branch_inventory_id,
				'warehouse_inventory_id' => $warehouse_inventory_id,
				'product_id' => $product_id,
				'name' => $product_name,
				'category_id' => $category_id, 
				'sale_price' => $sale_price, 
				'buy_price' => $buy_price, 
				'brand_id' => $brand_id, 
				'brand_name' => $brand_name, 
				'category_name' => $category_name, 
				'colour_id' => $colour_id, 
				'colour_name' => $colour_name, 
				'desc' => $description, 
				'code' => $code, 
				'size_label' => $size_label, 
				'innitual' => $innitual,
				'size_id' => $size_id, 
				'supplier' => $supplier, 
				'scheme_name' => $scheme_name, 
				'warehouseAvailableQuantity' => $warehouseAvailableQuantity, 
				'quantity' => $quantity, 
				'branch_name' => $branch_location, 
				'branch_id' => $branch_id, 
				'date' => $date, 
				'image_id' => ($image_id != null) ? $image_id: 0,
				'image' => ($image_name == null) ? 'default.png' : $image_name,
			);
		}

		return $dataArr;
		// echo json_encode($dataArr);

	}

	
	public function search_products($post){
		$dataArr = array();

		$sql = "
		SELECT DISTINCT(biv.product_id) FROM branch_inventory_tb biv
			LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
			LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id 
			LEFT OUTER JOIN brand_tb bd ON bd.brand_id = pt.brand_id
			LEFT OUTER JOIN category_tb ct ON ct.category_id = pt.category_id
            WHERE (wiv.status_id != 0  AND biv.quantity != 0  AND pt.status_id != 0 ";
        $sql .= (isset($post['data']['branch_id'])) ? " AND biv.branch_id = ".(int)$post['data']['branch_id'].")" : ")";

		$sql .= (isset($post['data']['search'])) ? " AND (pt.product_name LIKE '%".$post['data']['search']."%' 
				OR bd.brand_name LIKE '%".$post['data']['search']."%'
				OR wiv.code LIKE '%".$post['data']['search']."%'
				OR ct.category_name LIKE '%".$post['data']['search']."%') 
				ORDER BY pt.product_name DESC" : " ORDER BY pt.product_name DESC";
		$result = $this->p_instance->getDetails($sql, array());
		$branch_id = (int)$post['data']['branch_id'];
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$productDetails = $this->get_inventory_product_color($branch_id, (int)$product_id); 
			$product_colors = $productDetails[0];
			$product_sizes = $productDetails[1];
			$dataArr[] = array(
				'product_id' => (int)$product_id,
				'product_sizes' => $product_sizes, 
				'product_colors' => $product_colors,
				'id' => (int)(count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_inventory_id'],
				'warehouse_inventory_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouse_inventory_id'],
				'name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['name'],
				'category_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_id'], 
				'sale_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['sale_price'], 
				'buy_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['buy_price'], 
				'brand_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_id'], 
				'brand_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_name'], 
				'category_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_name'], 
				'colour_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['colour_id'], 
				'color' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['colour_name'], 
				'desc' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['desc'], 
				'code' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['code'], 
				'size' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_label'], 
				'size_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_id'], 
				'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
				'warehouseAvailableQuantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouseAvailableQuantity'], 
				'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
				'branch_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_name'], 
				'branch_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_id'], 
				'image' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['image']
			);
		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);
		// echo json_encode($sql);
	}
}
?>