<?php  
class Categories{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getCategories(){
		$result = $this->p_instance->fetchAll('category_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $category_id,
					'name' => $category_name,
					'desc' => $description,
					'created_at' => $created_at, 
					'modified_at' => $modified_at
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