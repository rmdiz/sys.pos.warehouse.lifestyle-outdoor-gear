<?php  
	// DEFINE CONSTANTS
	define('DS', DIRECTORY_SEPARATOR);
	define('CONFIG_PATH', '..'.DS.'config'.DS);
	define('CORE_PATH', '..'.DS."core".DS);
	define('API_PATH', '..'.DS."api".DS);

	// LOAD THE CONFIG FILE FIRST TO GET ACCESS TO DB CONNECTION
	require_once(CONFIG_PATH.'DbConnection.php');

	// CREATE AN INSTANCE OF THE DATABASE CONNECTION
	$dbCon = new DbConnection();
	$db = $dbCon->getConnection();

	// CORE CLASSES
	require_once(CORE_PATH.'Model.php');

    // OTHER CLASSES
	require_once(API_PATH.'Products.php');
	require_once(API_PATH.'Branches.php');
	require_once(API_PATH.'Brands.php');
	require_once(API_PATH.'Accounts.php');
	require_once(API_PATH.'Categories.php');
	require_once(API_PATH.'Colors.php');
	require_once(API_PATH.'Sales.php');
	require_once(API_PATH.'Sizes.php');
	require_once(API_PATH.'Supplier.php');
	require_once(API_PATH.'Discounts.php');
	require_once(API_PATH.'Payment_types.php');
	require_once(API_PATH.'Statuses.php');
	require_once(API_PATH.'Orders.php');
	require_once(API_PATH.'Auth.php');
?>