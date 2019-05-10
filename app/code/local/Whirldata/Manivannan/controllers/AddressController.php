<?php
class Whirldata_Manivannan_AddressController extends Mage_Core_Controller_Front_Action
{   

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
        $this->loadLayout();
        $this->_initLayoutMessages('customer/session'); 

        /* Adding Shipping Method*/
        $cart = Mage::getSingleton('checkout/cart');
        $quote = $cart->getQuote();
        $cart->getQuote()->getShippingAddress()->setShippingMethod('flatrate_flatrate')->save();

        $this->getLayout()->getBlock('head')->setTitle($this->__('Address'));
        $this->renderLayout();
    }
    
    public function addAction()
    {
        echo "Add Address";
    }

    public function removeAction()
    {
        echo "Remove Address";
    }

    public function editAction()
    {
        echo "Edit Address";
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
}
