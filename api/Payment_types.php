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
	
	public function updatePaymentType($post){
		$updateData = array(
			'payment_type_name' =>  $post['paymentMethod']
		);
		$res =  $this->p_instance->updateDetails('payment_type_tb', 'payment_type_id', (int)$post['id'], $updateData);
		if($res){
			$msg = (array('response'=> "success", 'message' => 'payment Method updated successfully'));

		}else{
			$msg = array('response'=> "danger", 'message' => 'Operation failed');
		}
		echo json_encode($msg);
	}	
	public function addPaymentType($post){
		$PaymentType_details = array(
			'payment_type_name' =>  $post['paymentMethod']
		);
		$sql = "
			SELECT * FROM payment_type_tb 
                WHERE payment_type_name = ? 
		";
		$result = $this->p_instance->getDetails($sql, array('payment_type_name' =>  $post['paymentMethod']));

		$msg = '';
		$paymentMethodDetails = array();
		// GET NUMBER OF ROWS
		if($result->rowCount()){
			$msg = array('response'=> "warning", 'message' => 'payment Method already Exists', 'info' => $paymentMethodDetails);
		}
		else{
			$payment_type_id = $this->p_instance->Save("payment_type_tb", $PaymentType_details);

			if($payment_type_id){
				$msg = (array('response'=> "success", 'message' => 'payment Method added successfully'));

			}else{
				$msg = array('response'=> "danger", 'message' => 'Operation failed');
			}

		}
		echo json_encode($msg);
	}
}
?>