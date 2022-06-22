<?php  
class Payment_types{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getPaymentTypes(){
		$result = $this->p_instance->fetchAll('payment_type_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $payment_type_id,
					'name' => $payment_type_name,
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