<?php  
class Sizes{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getSizes(){
		$result = $this->p_instance->fetchAll('size_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $size_id,
					'name' => $size_label, 
					'innitual' => $innitual, 
					'size_scheme_id' => $size_scheme_id, 
				);
			}
			$res = $dataArr;
		}
		else{
			$res = 'Nothing found';
		}
		echo json_encode($res);

	}
	public function getSizeSchemes(){
		$result = $this->p_instance->fetchAll('size_Scheme_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $scheme_id,
					'name' => $scheme_name, 
					'date' => $date, 
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