<?php  
class Colors{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getColors(){
		$result = $this->p_instance->fetchAll('colour_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $colour_id,
					'name' => $colour_name, 
					'innitual' => $innitual, 
					'created_at' => $created_at, 
					'modified_at' => $modified_at, 
					'deleted_at' => $deleted_at,
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