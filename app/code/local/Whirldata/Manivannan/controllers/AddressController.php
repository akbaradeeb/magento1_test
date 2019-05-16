<?php
class Whirldata_Manivannan_AddressController extends Mage_Core_Controller_Front_Action
{   
    protected $_checkout;
    /**
     * Retrieve customer session object
     *
     * @return Mage_Customer_Model_Session
     */
    protected function _getSession()
    {
        return Mage::getSingleton('customer/session');
    }

    public function preDispatch()
    {
        parent::preDispatch();

        if (!Mage::getSingleton('customer/session')->authenticate($this)) {
            $this->setFlag('', 'no-dispatch', true);
        }
    }

    public function indexAction()
    {
      
        $this->getOnepage()->initCheckout();

        /***
         * Checking and adding billing address
         */
        $billing = $this->getOnepage()->getQuote()->getBillingAddress();
        if(empty($billing->getCustomerAddressId())){
          $address_id = $this->_getAddress();
          $data = array('address_id'=>'','use_for_shipping'=>1);
          $result = $this->getOnepage()->saveBilling($data,107);  
        }

        /* Adding Shipping Method*/
        $this->getOnepage()->getQuote()->getShippingAddress()->setShippingMethod('flatrate_flatrate')->save();
        
        $this->loadLayout();
        $this->_initLayoutMessages('customer/session'); 
        $this->getLayout()->getBlock('head')->setTitle($this->__('Address List'));
        $this->renderLayout();
    } 

    public function editAction()
    {
        $addressId = $this->getRequest()->getParam('id');
        $customer  = $this->_getSession()->getCustomer();
        $address   = $customer->getAddressById($addressId);
        $data = $address->getData();
        $data['street'] = $address->getStreet();
        $resp = array('status'=>'success','data'=>$data);
        $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));
    }

    public function saveAction()
    {
        
        if (!$this->_validateFormKey()) {
            return $this->_redirect('*/*/');
        }

        // Save data
        if ($this->getRequest()->isPost()) {
            $customer = $this->_getSession()->getCustomer();
            /* @var $address Mage_Customer_Model_Address */
            $address  = Mage::getModel('customer/address');
            $addressId = $this->getRequest()->getParam('id');
            if ($addressId) {
                $existsAddress = $customer->getAddressById($addressId);
                if ($existsAddress->getId() && $existsAddress->getCustomerId() == $customer->getId()) {
                    $address->setId($existsAddress->getId());
                }
            }

            $errors = array();

            /* @var $addressForm Mage_Customer_Model_Form */
            $addressForm = Mage::getModel('customer/form');
            $addressForm->setFormCode('customer_address_edit')
                ->setEntity($address);
            $addressData    = $addressForm->extractData($this->getRequest());
            $addressErrors  = $addressForm->validateData($addressData);
            if ($addressErrors !== true) {
                $errors = $addressErrors;
            }

            try {
                $addressForm->compactData($addressData);
                $address->setCustomerId($customer->getId())
                    ->setIsDefaultBilling($this->getRequest()->getParam('default_billing', false))
                    ->setIsDefaultShipping($this->getRequest()->getParam('default_shipping', false));

                $addressErrors = $address->validate();
                if ($addressErrors !== true) {
                    $errors = array_merge($errors, $addressErrors);
                }

                if (count($errors) === 0) {
                    $address->save();
                    $block = $this->getLayout()->createBlock('manivannan/address_list')->setTemplate('manivannan/address/list.phtml');
                    $html = $block->toHtml();
                    $resp = array('status'=>'success','msg'=>'The address has been saved.','url'=>'','html'=>$html);
                    $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));
                    return;
                } else {

                    $form_error = array();
                    foreach ($errors as $errorMessage) {
                        $form_error[] = $errorMessage;
                    }

                    $resp = array('status'=>'error','msg'=>'The address has been saved.','url'=>'','form_error'=>$form_error);
                    $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));
                }
            } catch (Mage_Core_Exception $e) {
                $resp = array('status'=>'error','msg'=>$e->getMessage(),'url'=>'','form_error'=>$form_error);
                $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));    
            } catch (Exception $e) {
                $resp = array('status'=>'error','msg'=>'Can not save address.','url'=>'','form_error'=>$form_error);
                $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp)); 
            }
        }
 
    }

    public function deleteAction()
    {
        $addressId = $this->getRequest()->getPost('id', false);

        if ($addressId) {
            $address = Mage::getModel('customer/address')->load($addressId);

            // Validate address_id <=> customer_id
            if ($address->getCustomerId() != $this->_getSession()->getCustomerId()) {
                $resp = array('status'=>'error','msg'=>'The address does not belong to this customer.','url'=>'');
                $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));               
            }

            try {
                $address->delete();
                $resp = array('status'=>'success','msg'=>'The address has been deleted.','url'=>'');
                $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));
            } catch (Exception $e){
                $resp = array('status'=>'success','msg'=>'An error occurred while deleting the address.','url'=>'');
                $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));
            }
        }
         
    }

    public function saveBillingAction()
    {
        $address_id = $this->getRequest()->getParam('id');

        if(!empty($address_id)) {
           $data = array('address_id'=>'','use_for_shipping'=>1);
           $result = $this->getOnepage()->saveBilling($data,$address_id);
           $resp = array('status'=>'success','msg'=>'The address has been saved.','url'=>'');
            
        } else {
           $resp = array('status'=>'error','msg'=>'Address is missing.','url'=>'');  
        }
        
        $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($resp));  
    }

    public function getOnepage()
    {
        return Mage::getSingleton('checkout/type_onepage');
    }

    /**
     * Retrieve checkout session model
     *
     * @return Mage_Checkout_Model_Session
     */
    public function getCheckout()
    {
        if (empty($this->_checkout)) {
            $this->_checkout = Mage::getSingleton('checkout/session');
        }
        return $this->_checkout;
    }

    /**
     *
     */
    private function _getAddress()
    {
        $customer = Mage::getSingleton('customer/session')->getCustomer();
        $defaultBilling = $customer->getDefaultBilling();
        if($defaultBilling){
           echo "dddddd"; 
        } else {
           $allAddress = Mage::getModel('customer/address')->getCollection()->setCustomerFilter($customer);       
           $allAddress->setOrder('entity_id','ASC');
           $address = $allAddress->getFirstItem();
           return $address->getId(); 
        }
    }  
}
