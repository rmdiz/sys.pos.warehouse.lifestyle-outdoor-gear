<?php  
class Discounts{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getDiscounts(){
		$result = $this->p_instance->fetchAll('discount_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $discount_id,
					'name' => $discount_name,
					'desc' => $description,
					'discount_percentage' => $discount_percentage,
					'created_at' => $created_at,
					'modified_at' => $modified_at,
					'delete_at' => $delete_at,
				);
			}
			$res = $dataArr;
		}
		else{
			$res = 'Nothing found';
		}
		echo json_encode($res);
	}
}
?>