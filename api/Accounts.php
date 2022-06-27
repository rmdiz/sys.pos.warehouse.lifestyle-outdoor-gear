<?php  
class Accounts{

	function __construct($_p_instance){
		$this->p_instance = $_p_instance;
	}

	public function getLimitedUsers($limit, $incomingPage){
		$dataArr = array();
		if($incomingPage > 1)
		{
			$start = (($incomingPage - 1) * $limit);
		}
		else
		{
			$start = 0;
		}
		$sql = "SELECT ut.*, bt.branch_location, st.status_name, utt.user_type, upt.image FROM user_tb ut 
					LEFT OUTER JOIN user_type_tb utt 
					ON ut.user_type_id  = utt.user_type_id
					LEFT OUTER JOIN status_tb st 
					ON ut.status_id  = st.status_id
					LEFT OUTER JOIN branch_tb bt 
					ON bt.branch_id  = ut.branch_id
					LEFT OUTER JOIN user_profile_image_tb upt 
					ON ut.user_id = upt.user_id ORDER BY user_id";
		$result = $this->p_instance->getDetails($sql, array());
		$total = $result->rowCount();
		$filter_query = $sql . ' LIMIT ' . $start . ', ' . $limit;
		$result = $this->p_instance->getDetails($filter_query, array());

		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);
			$dataArr[] = array(
				'user_id'			=>	$user_id,
				'username'		=>	$username,
				'name'			=> $first_name . ' ' .$last_name,
				'first_name'		=>	$first_name,
				'last_name'			=>	$last_name,
				'telephone'		=>	$telephone,
				'email'			=>	$email,
				'address'		=>	$address,
				'date'		=>	$created_at,
				'user_type_id'			=>	$user_type_id,
				'user_type'		=>	$user_type,
				'status'		=>	$status_name,
				'branch'		=>	$branch_location,
				'image'	=>	$image
			);
		}
		// CONVERT OT JSON home_sea
		echo json_encode([$dataArr, $total]);
	}
	public function getAllUsers($post){
		$dataArr = array();
		$sql = "SELECT ut.*, bt.branch_location, st.status_name, utt.user_type, upt.image FROM user_tb ut 
					LEFT OUTER JOIN user_type_tb utt 
					ON ut.user_type_id  = utt.user_type_id
					LEFT OUTER JOIN status_tb st 
					ON ut.status_id  = st.status_id
					LEFT OUTER JOIN branch_tb bt 
					ON bt.branch_id  = ut.branch_id
					LEFT OUTER JOIN user_profile_image_tb upt 
					ON ut.user_id = upt.user_id ORDER BY user_id";

		$result = $this->p_instance->getDetails($sql, array());
		$total = $result->rowCount();

		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'user_id'			=>	$user_id,
				'name'			=> $first_name . ' ' .$last_name,
				'username'		=>	$username,
				'first_name'		=>	$first_name,
				'last_name'			=>	$last_name,
				'telephone'		=>	$telephone,
				'email'			=>	$email,
				'address'		=>	$address,
				'date'		=>	$created_at,
				'user_type_id'			=>	$user_type_id,
				'user_type'		=>	$user_type,
				'status'		=>	$status_name,
				'branch'		=>	$branch_location,
				'image'	=>	$image
			);

		}
		// CONVERT OT JSON 
		// echo json_encode($dataArr);
		echo json_encode([$dataArr, $total]);
	}

	public function getUserTypes(){
		$result = $this->p_instance->fetchAll('user_type_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $user_type_id,
					'name' => $user_type,
					'permissions' => $permissions,
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


	public function getClients(){
		$result = $this->p_instance->fetchAll('customer_tb');
		$res;
		// GET NUMBER OF ROWS
		$num = $result->rowCount();
		if($num > 0){
			$dataArr = array();

			while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
				extract($row);

				$dataArr[] = array(
					'id' => $customer_id,
					'name' => $fname . ' ' . $lname,
					'fname' => $fname,
					'lname' => $lname,
					'email' => $email,
					'telephone' => $telephone,
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
	public function updateUserPassword($post){
		$user_id = (int) $post['id'];
		$updateData = array(
			'password' => password_hash($post['password'], PASSWORD_DEFAULT)
		);

		$res = $this->p_instance->updateDetails("user_tb", 'user_id', $user_id,  $updateData);

		if($res){
			$userDetails = $this->getSingleProduct($user_id);
			echo json_encode(array('response'=> "success", 'message' => 'Password updated successfully', 'info' => $userDetails));
		}else{
			echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
		}
		// echo json_encode($user_id);
	}
	public function updateUser($post){
		$user_id = (int) $post['id'];
		$data = $post;
		$updateData = array(
			'first_name' => $post['data']['first_name'],
			'last_name' => $post['data']['last_name'],
			'telephone' => $post['data']['telephone'],
			'status_id' => (int) $post['data']['status'],
			'branch_id' => (int) $post['data']['branch'],
			'address' => $post['data']['address'],
			'email' => $post['data']['email'],
			'user_type_id' =>  (int)$post['data']['user_type'],
		);
		$res =  $this->p_instance->updateDetails('user_tb', 'user_id', $user_id, $updateData);
		if($res){
			$userDetails = $this->getSingleProduct($user_id);
			echo json_encode(array('response'=> "success", 'message' => 'User Details updated successfully', 'info' => $userDetails));
		}else{
			echo json_encode(array('response'=> "danger", 'message' => 'Operation failed'));
		}
		// echo json_encode($updateData);
	}	
	public function addUser($post){
		$user_details = array(
			'username' =>  $post['data']['last_name'], 
			'password' => password_hash( $post['data']['password'], PASSWORD_DEFAULT), 
			'first_name' =>  $post['data']['first_name'], 
			'last_name' =>  $post['data']['last_name'], 
			'status_id' => (int) $post['data']['status'],
			'branch_id' => (int) $post['data']['branch'],
			'telephone' => $post['data']['telephone'], 
			'email' =>  $post['data']['email'], 
			'address' =>  $post['data']['address'], 
			'user_type_id' => (int)  $post['data']['user_type']
		);
		$sql = "
			SELECT * FROM user_tb 
                WHERE username = ? 
		";
		$result = $this->p_instance->getDetails($sql, array('username' =>  $post['data']['last_name']));

		$msg = '';
		// GET NUMBER OF ROWS
		if($result->rowCount()){
			$msg = array('response'=> "warning", 'message' => 'Username already taken please');
		}
		else{
			$user_id = $this->p_instance->Save("user_tb", $user_details);

			if($user_id){
				$user_image_id = $this->p_instance->Save("user_profile_image_tb", array('user_id' => $user_id, 'status_id' => 3, 'image' =>  $post['userImage']));
				if($user_image_id){
					$msg = array('response'=> "success", 'message' => 'Operation completed successfully');

				}else{
					$msg = array('response'=> "warning", 'message' => 'Operation completed half successfully');
				}

			}else{
				$msg = array('response'=> "danger", 'message' => 'Operation failed');
			}

		}
		echo json_encode($msg);
	}
	public function getSingleProduct($user_id){
		$dataArr = array();
		$sql = "SELECT ut.*, bt.branch_location, st.status_name, utt.user_type, upt.image FROM user_tb ut 
					LEFT OUTER JOIN user_type_tb utt 
					ON ut.user_type_id  = utt.user_type_id
					LEFT OUTER JOIN status_tb st 
					ON ut.status_id  = st.status_id
					LEFT OUTER JOIN branch_tb bt 
					ON bt.branch_id  = ut.branch_id
					LEFT OUTER JOIN user_profile_image_tb upt 
					ON ut.user_id = upt.user_id 
					WHERE ut.user_id = ?
					ORDER BY user_id";

		$result = $this->p_instance->getDetails($sql, array('ut.user_id' => $user_id));
		
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			extract($row);

			$dataArr[] = array(
				'user_id'			=>	$user_id,
				'name'			=> $first_name . ' ' .$last_name,
				'username'		=>	$username,
				'first_name'		=>	$first_name,
				'last_name'			=>	$last_name,
				'telephone'		=>	$telephone,
				'email'			=>	$email,
				'address'		=>	$address,
				'date'		=>	$created_at,
				'user_type_id'			=>	$user_type_id,
				'user_type'		=>	$user_type,
				'status'		=>	$status_name,
				'branch'		=>	$branch_location,
				'image'	=>	$image
			);

		}
		return $dataArr;
	}
}
?>