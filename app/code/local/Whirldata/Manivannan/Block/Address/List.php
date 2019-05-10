<?php

class Whirldata_Manivannan_Block_Address_List extends Mage_Checkout_Block_Onepage_Abstract
{
    /**
     * Get 'one step checkout' step data
     *
     * @return array
     */
    protected $_address;

    protected function _prepareLayout()
    {
        parent::_prepareLayout();
        $this->_address = Mage::getModel('customer/address');
    }

    public function getSteps()
    {
        $steps = array();
        $stepCodes = $this->_getStepCodes();

        if ($this->isCustomerLoggedIn()) {
            $stepCodes = array_diff($stepCodes, array('login'));
        }

        foreach ($stepCodes as $step) {
            $steps[$step] = $this->getCheckout()->getStepData($step);
        }

        return $steps;
    }

    /**
     * Get active step
     *
     * @return string
     */
    public function getActiveStep()
    {
        return $this->isCustomerLoggedIn() ? 'billing' : 'login';
    }

    /** 
     * Get address List
     */
    public function getAddressList()
    {   
        foreach ($this->getCustomer()->getAddresses() as $address) {
                $options[$address->getId()] = array(
                    'value' => $address->getId(),
                    'label' => $address->format('html')
                );
            }
        return $options;    
    }

    public function getAddress()
    {
        return $this->_address;
    }

    /**
     * Generate name block html
     *
     * @return string
     */
    public function getNameBlockHtml()
    {
        $nameBlock = $this->getLayout()
            ->createBlock('customer/widget_name')
            ->setObject($this->getAddress());

        return $nameBlock->toHtml();
    }

    public function canSetAsDefaultBilling()
    {
        if (!$this->getAddress()->getId()) {
            return $this->getCustomerAddressCount();
        }
        return !$this->isDefaultBilling();
    }

    public function canSetAsDefaultShipping()
    {
        if (!$this->getAddress()->getId()) {
            return $this->getCustomerAddressCount();
        }
        return !$this->isDefaultShipping();;
    }

    public function isDefaultBilling()
    {
        $defaultBilling = Mage::getSingleton('customer/session')->getCustomer()->getDefaultBilling();
        return $this->getAddress()->getId() && $this->getAddress()->getId() == $defaultBilling;
    }

    public function isDefaultShipping()
    {
        $defaultShipping = Mage::getSingleton('customer/session')->getCustomer()->getDefaultShipping();
        return $this->getAddress()->getId() && $this->getAddress()->getId() == $defaultShipping;
    }

    public function getDefaultBilling()
    {
        return Mage::getSingleton('customer/session')->getCustomer()->getDefaultBilling();
    }

    /**
     * Getting Country HTML
     */
    public function getCountryHtmlSelect()
    {
        $countryId = $this->getAddress()->getCountryId();
        if (is_null($countryId)) {
            $countryId = Mage::helper('core')->getDefaultCountry();
        }
        $select = $this->getLayout()->createBlock('core/html_select')
            ->setName('country_id')
            ->setId('country_id')
            ->setTitle(Mage::helper('checkout')->__('Country'))
            ->setClass('validate-select')
            ->setValue($countryId)
            ->setOptions($this->getCountryOptions());
        /*if ($type === 'shipping') {
            $select->setExtraParams('onchange="if(window.shipping)shipping.setSameAsBilling(false);"');
        }*/

        return $select->getHtml();
    }
}
