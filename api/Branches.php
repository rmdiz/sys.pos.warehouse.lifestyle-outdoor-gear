<?php  
class Branches{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getBranches(){
		$result = $this->p_instance->fetchAll('branch_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$branchArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$branchArr[] = array(
					'id' => $branch_id,
					'name' => $branch_location,
				);
			}
			$res = $branchArr;
		}
		else{
			$res = 'Nothing found';
		}
		echo json_encode($res);
	}
}
?>