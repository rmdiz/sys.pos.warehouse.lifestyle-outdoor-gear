<?php  
class Sales{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}
	public function getCurrencys(){
		$result = $this->p_instance->fetchAll('currency_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $id,
					'name' => $name, 
					'rate' => $rate, 
					'symbol' => $symbol, 
				);
			}
			$res = $dataArr;
		}
		else{
			$res = 'Nothing found';
		}
		echo json_encode($res);

	}

	public function getLimitedInvoices($limit, $incomingPage, $post){
		$dataArr = array();
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT * FROM `invoice_tb`";
		if(isset($post['data']['sdate']) & isset($post['data']['edate'])){
			if(($post['data']['sdate'] != '') & ($post['data']['edate'] != '')){
				$sql .= " WHERE purchase_date BETWEEN '" . $post['data']['sdate'] . "' AND  '" . $post['data']['edate'];
			}
		}
		$sql .= " ORDER BY purchase_date DESC";

		$filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		$result = $this->p_instance->getDetails($filter_query, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$invoiceDetails = $this->getInvoiceDetails((int)$id);
			$dataArr[] = array(
				'invoice_no'	=>	$id,
				'purchase_ids'	=>	$purchase_ids,
				'totalItems'	=>	$invoiceDetails[1],
				'totalPrice'	=>	$invoiceDetails[2],
				'invoiceDetails' => $invoiceDetails[0],
				'payment_type_name' => $invoiceDetails[0][0]['payment_type_name'],
				'branch'	=>	$invoiceDetails[0][0]['branch_location'],
				'customer_name'	=>	$invoiceDetails[0][0]['customer_fname'] .' '.$invoiceDetails[0][0]['customer_lname'],
				'attendant'	=>	$invoiceDetails[0][0]['username'],
				'date'			=>	$purchase_date
			);
		}
		// CONVERT OT JSON home_sea
		echo json_encode($dataArr);
	}
	public function getAllInvoices($post){
		$dataArr = array();
		$sql = "SELECT * FROM `invoice_tb`";
		if(isset($post['sdate']) & isset($post['edate'])){
			if(($post['sdate'] != '') & ($post['edate'] != '')){
				$sql .= " WHERE purchase_date BETWEEN '" . $post['sdate'] . "' AND  '" . $post['edate'] . "'";
			}
		}
		$sql .= " ORDER BY purchase_date DESC";

		$result = $this->p_instance->getDetails($sql, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$invoiceDetails = $this->getInvoiceDetails((int)$id);
			$dataArr[] = array(
				'invoice_no'	=>	$id,
				'purchase_ids'	=>	$purchase_ids,
				'totalItems'	=>	$invoiceDetails[1],
				'totalPrice'	=>	$invoiceDetails[2],
				'invoiceDetails' => $invoiceDetails[0],
				'payment_type_name' => $invoiceDetails[0][0]['payment_type_name'],
				'branch'	=>	$invoiceDetails[0][0]['branch_location'],
				'customer_name'	=>	$invoiceDetails[0][0]['customer_fname'] .' '.$invoiceDetails[0][0]['customer_lname'],
				'attendant'	=>	$invoiceDetails[0][0]['username'],
				'date'			=>	$purchase_date
			);
		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);
		// echo json_encode([$sql, $post]);
	}

	public function getInvoiceDetails($invoice_no){
		$sql = "SELECT sd.*, iv.code, dt.discount_name, dt.discount_percentage, cl.colour_name, sz.innitual AS size_innitual, im.image_name, pt.product_name, ptt.payment_type_name, ct.fname AS customer_fname, ct.lname AS customer_lname, ct.email as customer_email, ct.telephone as customer_telephone, pt.sale_price, btt.brand_name, bt.branch_location, cy.category_name, ut.username, ut.first_name, ut.last_name, up.image AS user_image FROM `sold_tb` sd 
				LEFT OUTER JOIN product_detail_tb pt
			    ON sd.product_id = pt.product_id 
				LEFT OUTER JOIN branch_inventory_tb biv
			    ON biv.branch_inventory_id = sd.branch_inventory_id
				LEFT OUTER JOIN warehouseInventory_tb iv
			    ON biv.warehouse_inventory_id = iv.inventory_id
				LEFT OUTER JOIN colour_tb cl
			    ON cl.colour_id = iv.colour_id
				LEFT OUTER JOIN size_tb sz
			    ON sz.size_id = iv.size_id
				LEFT OUTER JOIN inventory_product_images_tb im
			    ON im.inventory_id = iv.inventory_id
			    LEFT OUTER JOIN brand_tb btt 
			    ON pt.brand_id = btt.brand_id
			    LEFT OUTER JOIN category_tb cy 
			    ON pt.category_id = cy.category_id
			    LEFT OUTER JOIN customer_tb ct 
			    ON sd.customer_id = ct.customer_id 
			    LEFT OUTER JOIN user_tb ut 
			    ON sd.attendant_id = ut.user_id 
			    LEFT OUTER JOIN user_profile_image_tb up 
			    ON up.user_id = ut.user_id 
			    LEFT OUTER JOIN branch_tb bt 
			    ON bt.branch_id = sd.branch_id  
			    LEFT OUTER JOIN payment_type_tb ptt 
			    ON sd.payment_type_id = ptt.payment_type_id 
			    LEFT OUTER JOIN discount_tb dt 
			    ON sd.discount_id = dt.discount_id 
			    WHERE sd.invoice_no = ?   
			    ORDER BY sd.purchase_id
			    
		";
		$result = $this->p_instance->getDetails($sql, array('sd.invoice_no' => $invoice_no));
		// GET NUMBER OF ROWS

		$dataArr = array();
		$totalPrice = 0;
		$totalItems = 0;

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$totalPrice += ((int)$quantity * (int) $sale_price);
			$dataArr[] = array(
				'purchase_id' => $purchase_id, 	
				'product_id' => $product_id, 	
				'inventory_id' => $branch_inventory_id, 	
				'purchase_date' => $purchase_date, 	
				'customer_id' => $customer_id, 	
				'attendant_id' => $attendant_id, 	
				'purchase_quantity' => $quantity, 	
				'payment_type_id' => $payment_type_id, 	
				'payment_type_name' => $payment_type_name, 	
				'discount_id' => $discount_id, 	
				'discount' => $discount_name,
				'percentage' => $discount_percentage,
				'modified_at' => $modified_at, 	
				'deleted_at' => $deleted_at, 	
				'product_code' => $code, 	
				'product_name' => $product_name, 	
				'customer_fname' => $customer_fname, 	
				'customer_lname' => $customer_lname, 	
				'customer_email' => $customer_email, 	
				'customer_telephone' => $customer_telephone, 	
				'sale_price' => $sale_price, 	
				'invoice_no' => $invoice_no, 	
				'brand_name' => $brand_name, 	
				'date' => $date, 	
				'branch_location' => $branch_location, 	
				'category_name' => $category_name, 	
				'first_name' => $first_name, 
				'last_name' => $last_name, 
				'user_image' => $user_image, 
				'username' => $username, 
				'product_image' => $image_name, 
				'remarks' => $remarks,
				'branch_id' => $branch_id,
				'colour_name' => $colour_name,
				'size_innitual' => $size_innitual,
				'product_colors' => $this->get_inventory_product_color($product_id, $branch_id),
			);

		}
		$totalItems = count($dataArr);
		return [$dataArr, $totalItems, $totalPrice];
		
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
				'branch_id' => (int)$branch_id, 
				'product_image' => ($image_name != null) ? $image_name: "default.png", 
				'colour_name' => $colour_name,
				'colour_id' => $colour_id,
				"color_products_sizes" => $colour_sizes
			);
		}

		// return $sql;
		return [$dataArr, $colour_sizes];


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


	public function updateSale($post){
		// foreach($post['data'] as $data){
		// 	$info = array(
		// 		'quantity' 	=> (int) $data['newQuantity'],
		// 		// 'customer_id' => (int) $data['quantity'],
		// 		'branch_inventory_id' => (int) $data['newQuantity'],
		// 		'remarks' => $data['remarks'],
		// 		'quantity' => (int) $data['quantity'],
		// 		'price' => (int) $data['price'],
		// 		'currency' => $data['currency'],
		// 		'rate' => (int) $data['rate'],
		// 		'payment_type_id' => (int) $data['payment_type_id'],
		// 		'discount_id' => (int) $data['discount_id'],
		// 		'purchase_date' => $data['purchase_date'],
		// 	);

		// 	$updated = $this->p_instance->updateDetails('sold_tb', 'invoice_no', (int) $post['id'], $info);
		// }
		$qty =(int)$post['data']['newQuantity'];
		$info = array(
			'quantity' 	=> $qty,
			// 'customer_id' => (int) $post['data']['quantity'],
			'branch_inventory_id' => (int) $post['data']['newInventory_id'],
			'remarks' => $post['data']['remarks'],
			'price' => (int) $post['data']['price'],
			'currency' => $post['data']['currency'],
			'rate' => (int) $post['data']['rate'],
			'payment_type_id' => (int) $post['data']['payment_type_id'],
			'discount_id' => (int) $post['data']['discount_id'],
			'purchase_date' => $post['data']['purchase_date'],
		);

		$updated = $this->p_instance->updateDetails('sold_tb', 'purchase_id', (int) $post['data']['purchase_id'], $info);
		if($updated){
			echo json_encode(array('response' => 'success', 'message' => " details updated successfully", 'test' => $info, 'qyt' => (int)$post['data']['newQuantity']));
		}else{
			echo json_encode(array('response' => 'danger', 'message' => " update failded"));

		}

	}

	// POS ACTIONS


	public function makeTransaction($data){

		// SAVE CUSTOMER DETAILS
		$customerDetails = array(
			"fname" => $data["add_customer_fname"],
			"lname" => $data["add_customer_1name"],
			"email" => $data["add_customer_email"],
			"telephone" => $data["add_customer_telephone"],
			"date" => $data["date"],
		);
		$customerDetails_id = $this->checkCustomer($data['add_customer_email'])['customer_id'];
		// $customerDetails_id =false;
		if($this->checkCustomer($data['add_customer_email']) == false){
			$customerDetails_id = $this->p_instance->Save("customer_tb", $customerDetails);

		}
		$saleInfo = [];
		$payType = $this->getItemID('payment_type_tb', 'payment_type_name', $data['add_payment_type'])['payment_type_id'];
		$discount = $this->getItemID('discount_tb', 'discount_name', $data['add_discount'])['discount_id'];
		$attendant_id = $data['attendant_id'];
		$branch_id = (int)$data['branch_id'];
		$add_purchase_date = $data['add_purchase_date'];
		$date = $data['date'];
		$purchase_ids = [];
		$in = array();

		/**
		 * GET INVENTORY IDS SO THAT AFTER THE TRANSACTION/MAKING SALE
		 * GET UPDTED BRACH INVENTORY DATA OF THOSE INVENTORY 
		 */
		$soldInventoryIdsArray = [];
		$soldProductsIdsArray = [];
		foreach($data['cart'] as $info){
			$soldProductsIdsArray[] = (int)$info["product_id"];
			array_push($soldInventoryIdsArray, (int)$info["branch_inventory_id"]);
			// SAVE SALE DETAILS  `
			$saleDetails = array(
				"branch_inventory_id" => (int)$info["branch_inventory_id"],
				"product_id" => (int)$info["product_id"],
				"customer_id" => (int)$customerDetails_id,
				"quantity" => (int)$info["purchase_quantity"],
				"price" => (int)$info["sale_price"],
				"remarks" => $info["desc"],
				"currency" => $info["currency"],
				"rate" => floatval($info["rate"]),
				"payment_type_id" => (int)$payType,
				"discount_id" => (int)$discount,
				"branch_id" => (int)$branch_id,
				"purchase_date" =>  $add_purchase_date,
				"date" =>  $data["date"],
				"attendant_id"  => (int)$attendant_id

			);
			$saleDetails_id = $this->p_instance->Save("sold_tb", $saleDetails);
			array_push($purchase_ids, (int)$saleDetails_id);
			array_push($saleInfo, $saleDetails_id);
			if($saleDetails_id){
				$inventory = array(
					'quantity' =>  (int)$info['available_quantity'] - (int)$info['purchase_quantity'], 
				);
				// UPDATE INVENTORY QUANTITY
				$inventory_info = $this->p_instance->updateDetails('branch_inventory_tb', 'branch_inventory_id', (int) $info["branch_inventory_id"], $inventory);
				
			}
		}

		// GENERATE INVOICE NO.
		$invoice_purchase_ids = '';
		foreach ($purchase_ids as $purchase_id) {
			$invoice_purchase_ids .= $purchase_id . '|';
		}
		$ivno = array("purchase_ids" => $invoice_purchase_ids, "purchase_date" => $add_purchase_date, "branch_id" => (int)$branch_id);
		// SAVE INVOICE NUMBER
		$returned_invoice_no = $this->p_instance->Save("invoice_tb", $ivno);
		// UPDATE INVOICE NUMBER IN SOLD TABLE 
		foreach ($purchase_ids as $purchase_id) {
			$Sold_tb_update = $this->p_instance->updateDetails('sold_tb', 'purchase_id', (int) $purchase_id, array('invoice_no' => $returned_invoice_no));
		}
		$invoice = array('date' => $add_purchase_date, 'invoiceNo' => $returned_invoice_no);

		// $historyData = $this->sale_full_details($data, $returned_invoice_no);
		/**
		 * GET UPDATED BRANCH INVENTORY PRODUCTS DATAILS FOR THE SOLD
		 * PRODCUTS 
		 */
		$updatedData = $this->getUpdatedSoldBranchInventoryProduct($soldProductsIdsArray, $branch_id);

		if($saleDetails_id){
			echo json_encode(array('response'=> "success", 'message' => $invoice, 'updatedData' => $updatedData));
		}else{
			echo json_encode(array('response'=> "error", 'message' => 'Operation failed'));
		}
		// echo json_encode($updatedData);


	}
	private function checkCustomer($cemail){
		$userDetails = $this->p_instance->getDetails("SELECT * FROM customer_tb WHERE email = ?", array('email' => $cemail))->fetch(PDO::FETCH_ASSOC);
		return $userDetails;
	}

	private function getItemID($table, $byField, $byValue){
		$details = $this->p_instance->getDetails("SELECT * FROM $table WHERE $byField = '".$byValue."'", array())->fetch(PDO::FETCH_ASSOC);
		return $details;
	}

	public function sale_full_details($data, $invoice_no){
		foreach($data['cart'] as $info){
			// SAVE SALE DETAILS  
			$saleDetails = array(
				'inventory_id' => (int)$info["branch_inventory_id"],
				'product_id' => (int)$info["product_id"],
				'product_name' => $info["product_name"],
				'customer' => $data["add_customer_fname"] .' '. $data["add_customer_fname"],
				'attendant_id' => (int)$data['attendant_id'],
				'attendant' => $data['attendant'],
				'branch_id' => (int)$data['branch_id'],
				'branch' => $data['branch'],
				'remarks' => $info["desc"],
				'quantity' => (int)$info["purchase_quantity"],
				'price' => (int)$info["sale_price"],
				'payment_type' => $data['add_payment_type'],
				'discount_id' => (int)$data['add_discount'],
				'purchase_date' => $data['add_purchase_date'],
				'currency' =>  $info["currency"],
				'invoice_no' => (int)$invoice_no
			);
			// $saleDetails_id = $this->p_instance->Save("sale_full_details_tb", $saleDetails);

		}
		// return $saleDetails;

	}
	public function getUpdatedSoldBranchInventoryProduct($soldProductsIdsArray, $branch_id){
		$dataArr = array();
		foreach($soldProductsIdsArray as $soldProductsId){

			$productDetails = $this->get_inventory_product_color((int)$branch_id, (int)$soldProductsId); 
			$product_colors = $productDetails[0];
			$product_sizes = $productDetails[1];
			$dataArr[] = array(
				'product_id' => (int)$soldProductsId,
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
				'size_innitual' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['innitual'], 
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

		return $dataArr;
	}
	public function getAllBranchInventoryProduct($branch_id){
		$dataArr = array();
		// $sql = "SELECT DISTINCT(biv.product_id) FROM branch_inventory_tb biv
		// 	LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
		// 	LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id WHERE (wiv.status_id != 0  AND pt.status_id != 0 AND biv.branch_id = ?)";

		// $sql .= " ORDER BY pt.product_id  ASC";
		// $filter_query = $sql;
		// $result = $this->p_instance->getDetails($filter_query, array('biv.branch_id' => $branch_id));
		
		// while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		// 	extract($row);
		// 	$productDetails = $this->get_inventory_product_color($branch_id, (int)$product_id); 
		// 	$product_colors = $productDetails[0];
		// 	$product_sizes = $productDetails[1];
		// 	$dataArr[] = array(
		// 		'product_id' => (int)$product_id,
		// 		'product_sizes' => $product_sizes, 
		// 		'product_colors' => $product_colors,
		// 		'id' => (int)(count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_inventory_id'],
		// 		'warehouse_inventory_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouse_inventory_id'],
		// 		'name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['name'],
		// 		'category_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_id'], 
		// 		'sale_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['sale_price'], 
		// 		'buy_price' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['buy_price'], 
		// 		'brand_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_id'], 
		// 		'brand_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['brand_name'], 
		// 		'category_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['category_name'], 
		// 		'colour_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['colour_id'], 
		// 		'color' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['color'], 
		// 		'desc' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['desc'], 
		// 		'code' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['code'], 
		// 		'size' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_label'], 
		// 		'size_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['size_id'], 
		// 		'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
		// 		'warehouseAvailableQuantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['warehouseAvailableQuantity'], 
		// 		'quantity' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['quantity'], 
		// 		'branch_name' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_name'], 
		// 		'branch_id' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['branch_id'], 
		// 		'image' => (count($product_sizes) == 0) ? 0 : $product_sizes[0]['image']
		// 	);

		// }
		// CONVERT OT JSON 
		return $dataArr;

	}
	// public function get_inventory_product_color($branch_id, $product_id)
	// {
	// 	$sql = "
	// 		SELECT DISTINCT(iv.colour_id), cl.colour_name, img.image_name FROM `warehouseInventory_tb` iv LEFT OUTER JOIN colour_tb cl ON cl.colour_id = iv.colour_id LEFT OUTER JOIN inventory_product_images_tb img ON iv.inventory_id = img.inventory_id WHERE iv.product_id = ?  
	// 	";
	// 	$result = $this->p_instance->getDetails($sql, array('iv.product_id' => (int)$product_id));

	// 	$dataArr = array();
	// 	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
	// 		extract($row);
	// 		$colour_sizes =$this->get_inventoryproduct_sizes((int) $colour_id,  (int)$product_id, (int)$branch_id);
	// 		$dataArr[] = array(
	// 			'product_id' => (int)$product_id,
	// 			'branch_id' => (int)$branch_id, 
	// 			'product_image' => ($image_name != null) ? $image_name: "default.png", 
	// 			'colour_name' => $colour_name,
	// 			'colour_id' => $colour_id,
	// 			"color_products_sizes" => $colour_sizes
	// 		);
	// 	}

	// 	return [$dataArr, $colour_sizes];


	// }
	// public function get_inventoryproduct_sizes($colour_id, $product_id, $branch_id){
	// 	$inventory_id = 0;
	// 	$quantity = 0;
	// 	$sql = "SELECT 
	// 	biv.*, wiv.product_id, wiv.inventory_id, wiv.colour_id, wiv.size_id, wiv.code, wiv.quantity AS warehouseAvailableQuantity, wiv.description, cl.colour_name, sz.size_label, sz.innitual, im.image_name, im.image_id, pt.product_name, pt.category_id, pt.sale_price, pt.buy_price, pt.brand_id, cy.category_name, bd.brand_name, sc.scheme_name, bc.branch_location, sc.scheme_name, CONCAT(sr.fname, ' ', sr.lname)AS supplier FROM branch_inventory_tb biv 
	// 	LEFT OUTER JOIN warehouseInventory_tb wiv ON biv.warehouse_inventory_id = wiv.inventory_id
	// 	LEFT OUTER JOIN product_detail_tb pt ON wiv.product_id = pt.product_id 
	//     LEFT OUTER JOIN category_tb cy ON pt.category_id = cy.category_id 
	//     LEFT OUTER JOIN brand_tb bd ON pt.brand_id = bd.brand_id 
	//     LEFT OUTER JOIN size_Scheme_tb sc ON sc.scheme_id = pt.size_scheme_id 
	//     LEFT OUTER JOIN colour_tb cl ON wiv.colour_id = cl.colour_id 
	//     LEFT OUTER JOIN branch_tb bc ON biv.branch_id = bc.branch_id 
	//     LEFT OUTER JOIN size_tb sz ON wiv.size_id = sz.size_id 
	//     LEFT OUTER JOIN inventory_product_images_tb im ON wiv.inventory_id = im.inventory_id  
	// 	LEFT OUTER JOIN supplier_tb sr ON pt.supplier_id = sr.supplier_id 
	//     WHERE (wiv.status_id != 0  AND pt.status_id != 0 AND biv.branch_id = ? AND wiv.product_id = ? AND wiv.colour_id =  ? AND biv.quantity > 0 ) ORDER BY pt.product_name DESC";
	// 			$result = $this->p_instance->getDetails($sql, array('biv.branch_id' => (int) $branch_id,'wiv.product_id' => (int) $product_id, 'wiv.colour_id' => (int) $colour_id));

	// 	$dataArr = array();
	// 	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
	// 		extract($row);

	// 		$dataArr[] = array(
	// 			'id' => $colour_id,
	// 			'branch_inventory_id' => $branch_inventory_id,
	// 			'warehouse_inventory_id' => $warehouse_inventory_id,
	// 			'product_id' => $product_id,
	// 			'name' => $product_name,
	// 			'category_id' => $category_id, 
	// 			'sale_price' => $sale_price, 
	// 			'buy_price' => $buy_price, 
	// 			'brand_id' => $brand_id, 
	// 			'brand_name' => $brand_name, 
	// 			'category_name' => $category_name, 
	// 			'colour_id' => $colour_id, 
	// 			'colour_name' => $colour_name, 
	// 			'desc' => $description, 
	// 			'code' => $code, 
	// 			'size_label' => $size_label, 
	// 			'innitual' => $innitual,
	// 			'size_id' => $size_id, 
	// 			'supplier' => $supplier, 
	// 			'scheme_name' => $scheme_name, 
	// 			'warehouseAvailableQuantity' => $warehouseAvailableQuantity, 
	// 			'quantity' => $quantity, 
	// 			'branch_name' => $branch_location, 
	// 			'branch_id' => $branch_id, 
	// 			'date' => $date, 
	// 			'image_id' => ($image_id != null) ? $image_id: 0,
	// 			'image' => ($image_name == null) ? 'default.png' : $image_name,
	// 		);
	// 	}

	// 	return $dataArr;
	// 	// echo json_encode($dataArr);

	// }


	// POS ACTIONS
	public function getBranchesInvoices($post){
		$dataArr = array();
		$sql = "SELECT * FROM `invoice_tb`";
		if(isset($post['sdate']) & isset($post['edate'])){
			if(($post['sdate'] != '') & ($post['edate'] != '')){
				$sql .= " WHERE purchase_date BETWEEN '" . $post['sdate'] . "' AND '" . $post['edate'] . "' ";
			}
		}
		if(isset($post['branch_id'])){
			if((int)$post['branch_id'] != 0){
				// CHECK IF STATEMENT ALREADY HAS A WHERE CLOUSE
				$sql .= (count(explode('WHERE', $sql)) == 1) ? " WHERE branch_id = " . (int)$post['branch_id'] : " AND branch_id = " . (int)$post['branch_id'];
			}
		}
		$sql .= " ORDER BY purchase_date DESC";

		$result = $this->p_instance->getDetails($sql, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$invoiceDetails = $this->getBranchesInvoiceDetails((int)$id);
			$dataArr[] = array(
				'branch_id'	=>	$branch_id,
				'id'	=>	$id,
				'invoice_no'	=>	$id,
				'branch_inventory_id'	=>	$id,
				'purchase_ids' => $this->getInvoiceProductIds((int)$id),
				'invoice_product_ids' => $purchase_ids,
				'purchase_date'	=>	$purchase_date,
				'totalItems'	=>	$invoiceDetails[1],
				'totalPrice'	=>	$invoiceDetails[2],
				'invoiceDetails' => $invoiceDetails[0],
				'payment_type_name' => $invoiceDetails[0][0]['payment_type_name'],
				'branch'	=>	$invoiceDetails[0][0]['branch_location'],
				'customer_name'	=>	$invoiceDetails[0][0]['customer_fname'] .' '.$invoiceDetails[0][0]['customer_lname'],
				'attendant'	=>	$invoiceDetails[0][0]['username'],
			);
		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);
		
		// echo json_encode($sql);
	}
	public function getInvoiceProductIds($invoice_no){
		$sql = "SELECT DISTINCT(product_id) FROM `sold_tb` WHERE invoice_no = ?";
		$result = $this->p_instance->getDetails($sql, array('invoice_no' => $invoice_no));		
		$dataArr = array();
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$dataArr[] = array('product_id' => $product_id);
		}
		return $dataArr;
	}
	public function getBranchesInvoiceDetails($invoice_no){
		$sql = "
			SELECT sd.*, biv.warehouse_inventory_id, iv.code, dt.discount_name, dt.discount_percentage, cl.colour_name, sz.innitual AS size_innitual, im.image_name, pt.product_name, ptt.payment_type_name, ct.fname AS customer_fname, ct.lname AS customer_lname, ct.email as customer_email, ct.telephone as customer_telephone, pt.sale_price, btt.brand_name, bt.branch_location, cy.category_name, ut.username, ut.first_name, ut.last_name, up.image AS user_image 
			FROM `sold_tb` sd 
				LEFT OUTER JOIN product_detail_tb pt
			    ON sd.product_id = pt.product_id 
				LEFT OUTER JOIN branch_inventory_tb biv
			    ON biv.branch_inventory_id = sd.branch_inventory_id
				LEFT OUTER JOIN warehouseInventory_tb iv
			    ON biv.warehouse_inventory_id = iv.inventory_id
				LEFT OUTER JOIN colour_tb cl
			    ON cl.colour_id = iv.colour_id
				LEFT OUTER JOIN size_tb sz
			    ON sz.size_id = iv.size_id
				LEFT OUTER JOIN inventory_product_images_tb im
			    ON im.inventory_id = iv.inventory_id
			    LEFT OUTER JOIN brand_tb btt 
			    ON pt.brand_id = btt.brand_id
			    LEFT OUTER JOIN category_tb cy 
			    ON pt.category_id = cy.category_id
			    LEFT OUTER JOIN customer_tb ct 
			    ON sd.customer_id = ct.customer_id 
			    LEFT OUTER JOIN user_tb ut 
			    ON sd.attendant_id = ut.user_id 
			    LEFT OUTER JOIN user_profile_image_tb up 
			    ON up.user_id = ut.user_id 
			    LEFT OUTER JOIN branch_tb bt 
			    ON bt.branch_id = sd.branch_id  
			    LEFT OUTER JOIN payment_type_tb ptt 
			    ON sd.payment_type_id = ptt.payment_type_id 
			    LEFT OUTER JOIN discount_tb dt 
			    ON sd.discount_id = dt.discount_id 
			    WHERE sd.invoice_no = ?   
			    ORDER BY sd.purchase_id
		";
		$result = $this->p_instance->getDetails($sql, array('sd.invoice_no' => $invoice_no));
		// GET NUMBER OF ROWS
		$dataArr = array();
		$totalPrice = 0;
		$totalItems = 0;

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$dataArr[] = array(
				'purchase_id' => $purchase_id, 	
				'product_id' => $product_id, 	
				'inventory_id' => $branch_inventory_id, 	
				'warehouse_inventory_id' => $warehouse_inventory_id, 	
				'purchase_date' => $purchase_date, 	
				'customer_id' => $customer_id, 	
				'attendant_id' => $attendant_id, 	
				'purchase_quantity' => $quantity, 	
				'payment_type_id' => $payment_type_id, 	
				'payment_type_name' => $payment_type_name, 	
				'discount_id' => $discount_id, 	
				'discount' => $discount_name,
				'percentage' => $discount_percentage,
				'modified_at' => $modified_at, 	
				'deleted_at' => $deleted_at, 	
				'product_code' => $code, 	
				'product_name' => $product_name, 	
				'customer_fname' => $customer_fname, 	
				'customer_lname' => $customer_lname, 	
				'customer_email' => $customer_email, 	
				'customer_telephone' => $customer_telephone, 	
				'sale_price' => $sale_price, 	
				'invoice_no' => $invoice_no, 	
				'brand_name' => $brand_name, 	
				'date' => $date, 	
				'branch_location' => $branch_location, 	
				'category_name' => $category_name, 	
				'first_name' => $first_name, 
				'last_name' => $last_name, 
				'user_image' => $user_image, 
				'username' => $username, 
				'product_image' => $image_name, 
				'remarks' => $remarks,
				'branch_id' => $branch_id,
				'colour_name' => $colour_name,
				'size_innitual' => $size_innitual,
				// 'product_colors' => $this->get_inventory_product_color($product_id, $branch_id),
			);
			$totalPrice += ((int)$quantity * (int) $sale_price);
		}
		$totalItems = count($dataArr);
		return [$dataArr, $totalItems, $totalPrice];
		
	}
}
?>