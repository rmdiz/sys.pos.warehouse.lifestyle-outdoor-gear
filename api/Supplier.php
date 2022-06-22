<?php  
class Supplier{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getLimitedSuppliers($limit, $incomingPage){
		$dataArr = array();
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT * FROM `supplier_tb`";

		$filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		$result = $this->p_instance->getDetails($filter_query, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$dataArr[] = array(
				'id'			=>	$supplier_id,
				'name'			=> $fname . ' ' .$lname,
				'first_name'	=>	$fname,
				'last_name'		=>	$lname,
				'telephone'		=>	$telephone,
				'email'			=>	$email,
				'address'		=>	$address,
				'date'			=>	$created_at
			);
		}
		// CONVERT OT JSON home_sea
		echo json_encode($dataArr);
	}
	public function getAllSuppliers($post){
		$dataArr = array();
		$sql = "SELECT * FROM `supplier_tb`";

		$result = $this->p_instance->getDetails($sql, array());

		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'id'			=>	$supplier_id,
				'name'			=> $fname . ' ' .$lname,
				'first_name'	=>	$fname,
				'last_name'		=>	$lname,
				'telephone'		=>	$telephone,
				'email'			=>	$email,
				'address'		=>	$address,
				'date'			=>	$created_at
			);

		}
		// CONVERT OT JSON 
		echo json_encode($dataArr);
	}
}
?>