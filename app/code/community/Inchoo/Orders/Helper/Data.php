<?php
 
class Inchoo_Orders_Helper_Data extends Mage_Core_Helper_Abstract
{
 	const API_URL = 'http://api.msg91.com/api/sendhttp.php?';
 	const SENDER  = '';
 	const ROUTE   = 4;

 	public function sendOrerSms($number,$order_no)
 	 {
 	 	$message = $this->getMessage();
 	 	$message = str_replace('{{order_no}}',$order_no,$message);
 	 	$this->_sendMessage($number,$message);
 	 }

 	public function getApiKey()
 	 {
 	 	return Mage::getStoreConfig('colorauction/colorauction_sms_group/colorauction_api_key',Mage::app()->getStore());
 	 } 

 	public function getMessage()
 	 {
 	 	return Mage::getStoreConfig('colorauction/colorauction_sms_group/colorauction_order_success',Mage::app()->getStore());
 	 } 

 	private function _sendMessage($number,$message)
 	 {
 	 	$curl = curl_init();
 	 	$authkey = $this->getMessage();

 	 	$url  = API_URL."country=91&sender=".SENDER."&route=".ROUTE."&mobiles=".$number."&authkey=".$authkey."&message=".$message;
		curl_setopt_array($curl, array(
		  CURLOPT_URL => $url,
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => "",
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 30,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => "GET",
		  CURLOPT_SSL_VERIFYHOST => 0,
		  CURLOPT_SSL_VERIFYPEER => 0,
		));

		$response = curl_exec($curl);
		$err = curl_error($curl);

		curl_close($curl);

		if ($err) {
		  return 0;
		} else {
		  return 1;
		}
 	 }	
}