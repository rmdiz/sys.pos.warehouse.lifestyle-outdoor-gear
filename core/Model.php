<?php  
class Model{

	function __construct($_db){
		$this->conn = $_db;
	}

	public function fetchAll($table){
		$query = "SELECT *
            FROM " . $table;
 
        // PREPARE QUERY STATEMENT
        $stmt = $this->conn->prepare( $query );
          
        // RUN/EXECUTE QUERY
        $stmt->execute();
     
        // RETURN RESULTS
        return $stmt;
	}

    public function signIn($username){
        $query = "SELECT ut.*, utt.permissions, utt.user_type, bc.branch_location, att.branch_id, att.user_id AS atuserid, ui.image 
            FROM user_tb ut 
            LEFT OUTER JOIN user_type_tb utt 
            ON ut.user_type_id = utt.user_type_id  
            LEFT OUTER JOIN attendant_tb att 
            ON att.user_id = ut.user_id  
            LEFT OUTER JOIN branch_tb bc 
            ON att.branch_id = bc.branch_id   
            LEFT OUTER JOIN user_profile_image_tb ui 
            ON ui.user_id = ut.user_id   
            WHERE ut.username = ? ";
        
        // PREPARE QUERY STATEMENT
        $stmt = $this->conn->prepare( $query );
        $stmt->bindValue(1, $username);
        // RUN/EXECUTE QUERY
        $stmt->execute();
        return $stmt;

     
    }

    public function Save($table, $fields = array()){
        $set = '';
        $x = 1;

        foreach ($fields as $name => $value) {
            $set .= "{$name} = ?";
            if ($x < count($fields)) {
                $set .= ', ';
            }
            $x++;
        }

        $sql = "INSERT INTO {$table} SET {$set}";

        // prepare query statement
        if($stmt = $this->conn->prepare($sql)){
            $x = 1;
            if (count($fields)) {
                foreach ($fields as $field) {
                    $stmt->bindValue($x, $field);
                    $x++;
                }
            }

            if($stmt->execute()){
                return $this->conn->lastInsertId();
            }
            printf('Error: %s', $stmt->error);
            return false;
        }
    }


    // public function fetchSigle($table, $fields= array()){
    //     $set = '';
    //     $x = 1;

    //     foreach ($fields as $name => $value) {
    //         $set .= "{$name} = ?";
    //         if ($x < count($fields)) {
    //             $set .= ' AND ';
    //         }
    //         $x++;
    //     }
    //     $query = "SELECT * FROM $table WHERE $set";

 
    //     // prepare query statement
    //     if($stmt = $this->conn->prepare( $query )){
    //       $x = 1;
    //         if (count($fields)) {
    //             foreach ($fields as $field) {
    //                 $stmt->bindValue($x, $field);
    //                 $x++;
    //             }
    //         }
    //     }
    //     // return $stmt;
    //     if($stmt->execute()){
    //         return $stmt;
    //     }
    //     printf('Error: %s', $stmt->error);
    //     return false;
    // }

    public function getDetails($query,  $fields= array()){
        if($stmt = $this->conn->prepare( $query )){
          $x = 1;
            if (count($fields)) {
                foreach ($fields as $field) {
                    $stmt->bindValue($x, $field);
                    $x++;
                }
            }
        }
        // return $stmt;
        if($stmt->execute()){
            return $stmt;
        }
        printf('Error: %s', $stmt->error);
        return false;
    }
    
     // update deteils
    function updateDetails($table, $fieldname, $fieldvalue, $fields = array()){
        $set = '';
        $x = 1;

        foreach ($fields as $name => $value) {
            $set .= "{$name} = ?";
            if ($x < count($fields)) {
                $set .= ', ';
            }
            $x++;
        }

        $sql = "UPDATE {$table} SET {$set} WHERE {$fieldname} = {$fieldvalue}";

        // prepare query statement
        if($stmt = $this->conn->prepare($sql)){
            $x = 1;
            if (count($fields)) {
                foreach ($fields as $field) {
                    $stmt->bindValue($x, $field);
                    $x++;
                }
            }

            if($stmt->execute()){
                return true;
            }
            return false;
        }
    }
    
    // function multiFiledBasedUpdate($sql, $fields = array()){
    //     // prepare query statement
    //     if($stmt = $this->conn->prepare($sql)){
    //         $x = 1;
    //         if (count($fields)) {
    //             foreach ($fields as $field) {
    //                 $stmt->bindValue($x, $field);
    //                 $x++;
    //             }
    //         }

    //         if($stmt->execute()){
    //             return true;
    //         }
    //         return false;
    //     }
    //     // return $stmt;
    // }
     
    // // read products by search term
    // public function querySearch($query, $search_term){
         
    //     // prepare query statement
    //     $stmt = $this->conn->prepare( $query );
    //     // $search_term = "%{$search_term}%";
    //     // $stmt->bindParam(1, $search_term);
     
    //     // execute query
    //     $stmt->execute();
     
    //     // return values from database
    //     return $stmt;
    // }
     
    // public function countAll_BySearch($table, $search_term, $search_field){
     
    //     // select query
    //     $query = "SELECT
    //                 COUNT(*) as total_rows
    //             FROM
    //                 " . $table . " 
    //             WHERE
    //                 $search_field LIKE ? 
    //                 AND status = 'Vacant'";
     
    //     // prepare query statement
    //     $stmt = $this->conn->prepare( $query );
    //     $search_term = "%{$search_term}%";
    //     $stmt->bindParam(1, $search_term);
          
    //     $stmt->execute();
    //     $row = $stmt->fetch(PDO::FETCH_ASSOC);
     
    //     return $row['total_rows'];
    // }
    //  // used for paging
    // public function countAll($table, $search_field){
     
    //     // query to select all user records
    //     $query = "SELECT
    //                 COUNT(DISTINCT(".$search_field.")) as total_rows
    //             FROM
    //                 " . $table;
     
    //     // prepare query statement
    //     $stmt = $this->conn->prepare($query);
     
    //     // execute query
    //     $stmt->execute();
     
    //     $row = $stmt->fetch(PDO::FETCH_ASSOC);
     
    //     return $row['total_rows'];
    // }
    // public function specificCount($query){
          
    //     // prepare query statement
    //     $stmt = $this->conn->prepare($query);
     
    //     // execute query
    //     $stmt->execute();
     
    //     $row = $stmt->fetch(PDO::FETCH_ASSOC);
     
    //     return $row['total_rows'];
    // }

    //  // update deteils
    // public function saveDetails($table, $fields = array()){
    //     $set = '';
    //     $x = 1;

    //     foreach ($fields as $name => $value) {
    //         $set .= "{$name} = ?";
    //         if ($x < count($fields)) {
    //             $set .= ', ';
    //         }
    //         $x++;
    //     }

    //     $sql = "INSERT INTO {$table} SET {$set}";

    //     // prepare query statement
    //     if($stmt = $this->conn->prepare($sql)){
    //         $x = 1;
    //         if (count($fields)) {
    //             foreach ($fields as $field) {
    //                 $stmt->bindValue($x, $field);
    //                 $x++;
    //             }
    //         }

    //         if($stmt->execute()){
    //             return true;
    //         }
    //         return false;
    //     }
    // }

    
    public function delete($table, $fieldvalue ,$id){
        $query = "DELETE FROM ${table} WHERE ${fieldvalue} = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        
        if($stmt->execute()){
            return true;
        }
        return false;
    }


}
?>