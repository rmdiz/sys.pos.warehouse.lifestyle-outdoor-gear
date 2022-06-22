<?php  
class Statuses{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getStatus(){
		$result = $this->p_instance->fetchAll('status_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $status_id,
					'name' => $status_name,
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