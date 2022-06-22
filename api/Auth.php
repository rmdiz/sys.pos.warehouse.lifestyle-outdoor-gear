<?php  
class Auth{

	function __construct($_m_instance){
		$this->m_instance = $_m_instance;
	}

	public function authenticate($username, $incommingPassword){
		$result = $this->m_instance->signIn($username);
		// GET NUMBER OF ROWS 
		$num = $result->rowCount();
		$result =$result->fetch(PDO::FETCH_ASSOC);
		$userimage = "default.png";
		$branch = null;
		$branch_id = null;
		$res=null;
		if($num > 0){
			if (password_verify($incommingPassword, $result['password'])) {
				$userD = array(
					"address" => $result['address'],
					"created_at" => $result['created_at'],
					"deleted_at" => $result['deleted_at'],
					"email" => $result['email'],
					"first_name" => $result['first_name'],
					"last_name" => $result['last_name'],
					"modified_at" => $result['modified_at'],
					"permissions" => $result['permissions'],
					"telephone" => $result['telephone'],
					"user_id" => $result['user_id'],
					"user_type" => $result['user_type'],
					"user_type_id" => $result['user_type_id'],
					"username" => $result['username'],
					"image" => ($result['image'] != null) ? $result['image'] : 'default.png',
					"branch_id" => $result['branch_id'],
					"branch" => $result['branch_location'],
				);
				$res = $userD;
			}else{
				$res = "Invalid username or password.";
			}
		}
		else{
			$res = "Invalid username or password.";
		}

		if($res != "Invalid username or password."){
			echo json_encode(array('session' => $res));
		}else{
			echo json_encode($res);
		}
	}

	public function getAttendant(){
		$sql = 'SELECT * FROM `user_tb` WHERE `user_type_id` = ?';
		$result = $this->m_instance->getDetails($sql, array('user_type_id' => 2));
		$res;
		// GET NUMBER OF ROWS
		$dataArr = array();

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'name' =>  $username, 
				'user_id' =>  $user_id, 
				'first_name' =>  $first_name, 
				'last_name' =>  $last_name, 
				'telephone' =>  $telephone, 
				'email' =>  $email, 
				'address' =>  $address
			);
		}
		$res = $dataArr;
		

		return $res;
	}
}
?>