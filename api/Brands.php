<?php  
class Brands{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getBrands(){
		$result = $this->p_instance->fetchAll('brand_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $brand_id,
					'name' => $brand_name, 
					'created_at' => $created_at, 
					'modified_at' => $modified_at, 
					'deleted_at' => $deleted_at
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