<?php  
	/**
	 * DATABASE CONNECTION
	 */
	class DbConnection{
		public $conn;

		private $host = "localhost";
	    private $db_name = "db_lifestyleoutdoorgear";
	    private $username = "root";
	    private $password = "";

		public function getConnection(){
			$this->conn = null;
	 
	        try{
	            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name.";charset=utf8", $this->username, $this->password);
				$this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	        }catch(PDOException $e){
	            echo "Connection error: " . $e->getMessage();
	        }
	 
	        return $this->conn;
		}
		
	}
?>