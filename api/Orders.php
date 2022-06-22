<?php  
class orders{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getBranchSales($branch_id){
		
		// if($branch_id != 0){
		// 	$sql = "SELECT od.order_id as id, od.branch_id, od.status_id, od.total, od.session_id, odi.order_item_id, odi.quantity, odi.created_at as order_date, pt.*, st.status_name, CONCAT(ct.fname, ' ' , ct.lname) as customer_name FROM `order_tb` od LEFT OUTER JOIN order_item_tb odi ON odi.order_id = od.order_id 
		// 		LEFT OUTER JOIN product_detail_tb pt ON pt.product_id = odi.product_id 
		// 		LEFT OUTER JOIN status_tb st ON st.status_id = od.status_id 
		// 		LEFT OUTER JOIN customer_tb ct ON ct.customer_id = od.session_id
		// 		    WHERE od.branch_id = ? 
		// 		    ORDER BY od.order_id
				    
		// 	";
		// 	$result = $this->p_instance->getDetails($sql, array('sd.branch_id' => (int) $branch_id));

		// }else{
		// 	$sql = "SELECT od.order_id as id, od.branch_id, od.status_id, od.total, od.session_id, odi.order_item_id, odi.quantity, odi.created_at as order_date, pt.*, st.status_name, CONCAT(ct.fname, ' ' , ct.lname) as customer_name FROM `order_tb` od LEFT OUTER JOIN order_item_tb odi ON odi.order_id = od.order_id 
		// 		LEFT OUTER JOIN product_detail_tb pt ON pt.product_id = odi.product_id 
		// 		LEFT OUTER JOIN status_tb st ON st.status_id = od.status_id 
		// 		LEFT OUTER JOIN customer_tb ct ON ct.customer_id = od.session_id
		// 		    ORDER BY od.order_id
				    
		// 	";
		// 	$result = $this->p_instance->getDetails($sql, array());
		// }
		// GET NUMBER OF ROWS

		$dataArr = array();

		// while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		// 	extract($row);

		// 	$dataArr[] = array(
		// 		'order_id' => $id, 	
		// 		'product_id' => $product_id, 	
		// 		'order_item_id' => $order_item_id, 	
		// 		'branch_id' => $branch_id, 	
		// 		'customer_name' => $customer_name, 	
		// 		'status_id' => $status_id, 	
		// 		'quantity' => $quantity, 	
		// 		'order_date' => $order_date, 	
		// 		'discount_id' => $discount_id, 	
		// 		'modified_at' => $modified_at, 	
		// 		'deleted_at' => $deleted_at, 	
		// 		'product_code' => $code, 	
		// 		'product_name' => $product_name, 	
		// 		'customer_name' => $customer_name, 	
		// 		'sale_price' => $sale_price, 	
		// 		'brand_name' => $brand_name, 	
		// 		'date' => $date, 	
		// 		'branch_location' => $branch_location, 	
		// 		'category_name' => $category_name, 	
		// 		'username' => $username, 
		// 	);

		// }
		// CONVERT OT JSON
		return $dataArr;
		
	}
}
?>