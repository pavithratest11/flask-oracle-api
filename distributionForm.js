import { LightningElement,api, track,wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';
import DISTRIBUTION_OBJECT from '@salesforce/schema/Distribution__c';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
//import NAME_FIELD from '@salesforce/schema/Distribution__c.Name';
import getContactsBySSN from '@salesforce/apex/DistssnController.getContactsBySSN';
import getCompaniesByContact from '@salesforce/apex/DistssnController.getCompaniesByContact';
import getPlansByCompany from '@salesforce/apex/DistssnController.getPlansByCompany';
import getTypePicklistValues from '@salesforce/apex/Distributionplantypepicklist.getTypePicklistValues';
import getElectionPicklistValues from '@salesforce/apex/Distributionplantypepicklist.getElectionPicklistValues';
import getStatusPicklistValues from '@salesforce/apex/DistributionPicklistValuesController.getStatusPicklistValues';
import getRMDElectionPicklistValues from '@salesforce/apex/DistributionPicklistValuesController.getRMDElectionPicklistValues';
import getRMDAmountPicklistValues from '@salesforce/apex/DistributionPicklistValuesController.getRMDAmountPicklistValues';
import getRMDLiquidationPicklistValues from '@salesforce/apex/DistributionPicklistValuesController.getRMDLiquidationPicklistValues';
import getRMDSourceFundPicklistValues from '@salesforce/apex/Distributionplantypepicklist.getRMDSourceFundPicklistValues';
import getRMDSourceFormatPicklistValues from '@salesforce/apex/DistributionPicklistValuesController.getRMDSourceFormatPicklistValues';
import insertElectionObjects from '@salesforce/apex/ElectionController.insertElectionObjects';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 
import { NavigationMixin } from 'lightning/navigation';
 const FIELDS =[
'Contact.FirstName',
'Contact.LastName',
'Contact.MiddleName',
'Contact.Suffix',
'Contact.Social_secuirty_number__c',
'Contact.Birthdate',
'Contact.Date_of_Employment__c',
'Contact.Date_of_Termination__c',
'Contact.Email',
'Contact.Phone',
'contact.Marital_Status__c',	
'contact.OtherStreet',
'contact.OtherCity',
'contact.OtherState',
'contact.OtherPostalCode',
'contact.OtherCountry']

export default class DistributionForm extends NavigationMixin(LightningElement) {

    @track isMedicalChecked = false;
    @track isResidenceChecked = false;
    @track isEducationChecked = false;
    @track isForeclosureChecked = false;
    @track isRepairChecked = false;
    @track isFuneralChecked = false;
    @track isTaxWithholdingChecked = false;

    @track rows = [];
    //@track newrecordId;
    @api newrecordId;
    @track showFields = false;    
    @track showCommencementdate = false;
    @track showGrossAmount = false;
    @track showsourceFields = false;
    @track showsource = false;
    @track showDestination = false;
    @track showPercent = false;
    @track showAmount = false;
    @track showTerminationFields = false; 
    @track checkboxfield = false; 
    @track showTransferExchangeFields = false;
    @track ShowHardship= false;
     @track ShowHardship1= false;
    @track showTraditionalFields = false;  
    @track showElectiveFields = false;
    @track showTraditionalandElectiveFields = false;
   // Track checkbox state
   
    @track FederalPercent = ''; // Your state variables for percentages
    @track StatePercent = '';
    @track errorMessage = ''; // Error message for validation 
   @track  MedicalAmount ='';
    @track ResidenceAmount = '';
    @track EducationAmount = '';
    @track ForeclosureAmount = '';
    @track RepairAmount = '';
    @track FuneralAmount = '';

    @api planId;
    @track error = '';
    //@track name;
    @track socialSecurityNumber =null;
    @track contactOptions = [];
    @track companyOptions = [];
    selectedContactId;
    //selectedCompanyId;
   //selectedCompanyName;
    @track selectedCompanyId;
    @track selectedPlanId;
    @track planName; 
    @track companyName;
    @track contactName;
    @track type;
    @track electiontype = ' ';
    @track RMDLiquidation;
    @track RMDAmount;
    @track RMDElection;
    @track Commencementdate;
	@track GrossAmount;
	@track SourceFormat;
    @track SourceFund;
    @track SourceAmount;
	@track SourcePercent;
    @track TraditionalRetirement='No Selection';
    @track TradIRAPlan;
    @track TradAccount;
    @track TradAccountDeliveryAddr;
    @track RothElectiveDeferral='No Selection';
    @track ElectiveIRAPlan;
    @track ElectiveAccount;
    @track ElectiveAccountDeliveryAddr;
    @track TransferExchange1;
    @track TransferExchange2;
    @track TransferExchange3;
    @track TransferExchange4;
    @track TransferExchange5;

    @track sourcenumber;
    @track sourcedate;
    @track Destinationnumber;
    @track Destinationdate;

    @track status;
    typeOptions = [];
    ElectionOptions =[];
    statusOptions = [];
    RMDElectionOptions = [];
    RMDAmountOptions = [];
    RMDLiquidationOptions = [];
    RMDSourceFundOptions = [];
    RMDSourceFormatOptions = [];
    TraditionalRetirementOptions = [];
    TransferExchangeOptions1=[];
    TransferExchangeOptions2=[];
    TransferExchangeOptions3=[];
    TransferExchangeOptions4=[];
    TransferExchangeOptions5=[];
    RothElectiveDeferralOptions = [];
    plans = [];
    
    
    @api recordId;
    contact= {};

   // Call this method when you need to insert the rows
    electionInsert() {
        const electionData = this.getElectionObjectData();
        insertElectionObjects({ electionObjects: electionData });
    }

    getElectionObjectData() {
        return this.rows.map(row => ({
            Vendor__c: row.SourceFund,
            Contribution_Amount__c: row.SourceAmount,
            Contribution_Percentage__c: row.SourcePercent,
            Distribution_object__c: this.newrecordId,
            Name: 'Dist - '+this.newrecordId,
        }));
    }


     // Lifecycle hook to initialize default row
    connectedCallback() {
        this.addDefaultRow();
    }

   generateUniqueId() {
        // Function to generate a unique ID for rows
        return '_' + Math.random().toString(36).substring(2, 9);
    }

    addDefaultRow() {
        // Adding a default row
        this.rows = [
            {
                id: this.generateUniqueId(), 
                SourceFund: '', // Empty value for new rows
                SourceFormat: '', // Empty value for new rows
                SourceAmount: '', // Empty value for new rows
                SourcePercent: '', // Empty value for new rows
                showPercent: false,
                showAmount: false,
            }
        ];

    }
   
 handleAddRow() {
        const newRow = {
            id: this.generateUniqueId(),
                SourceFund: '', // Empty value for new rows
                SourceFormat: '', // Empty value for new rows
                SourceAmount: '', // Empty value for new rows
                SourcePercent: '', // Empty value for new rows
                showPercent: false,
                showAmount: false,
        };
        this.rows = [...this.rows, newRow];
    }

     handleDeleteRow(event) {
        const rowId = event.target.dataset.id;

        if (this.rows.length === 1 && this.rows[0].id === rowId) {
            // Prevent deletion if there is only one row and it is the first row
            console.warn('Cannot delete the first row.');
            return;
        }

        this.rows = this.rows.filter(row => row.id !== rowId);
    }

   @wire(getRecord, { recordId: '$recordId', fields: FIELDS   })
   wiredContact({ error, data }) {
       if (data) {
           this.contact = { 
               FirstName: data.fields.FirstName ? data.fields.FirstName.value : '',
               LastName: data.fields.LastName ? data.fields.LastName.value : '',
               MiddleName: data.fields.MiddleName ? data.fields.MiddleName.value : '',
               Suffix: data.fields.Suffix ? data.fields.Suffix.value : '',
               Social_secuirty_number__c: data.fields.Social_secuirty_number__c ? data.fields.Social_secuirty_number__c.value : '',
               Birthdate: data.fields.Birthdate ? data.fields.Birthdate.value : '',
               Date_of_Employment__c: data.fields.Date_of_Employment__c ? data.fields.Date_of_Employment__c.value : '',
               Date_of_Termination__c: data.fields.Date_of_Termination__c ? data.fields.Date_of_Termination__c.value : '',
               Email: data.fields.Email ? data.fields.Email.value : '',
               Phone: data.fields.Phone ? data.fields.Phone.value : '', 
               Marital_Status__c: data.fields.Marital_Status__c ? data.fields.Marital_Status__c.value : '',  
               OtherStreet: data.fields.OtherStreet ? data.fields.OtherStreet.value : '',  
               OtherCity: data.fields.OtherCity ? data.fields.OtherCity.value : '',  
               OtherState: data.fields.OtherState ? data.fields.OtherState.value : '',  
               OtherPostalCode: data.fields.OtherPostalCode ? data.fields.OtherPostalCode.value : '',  
               OtherCountry: data.fields.OtherCountry ? data.fields.OtherCountry.value : ''               
// Add more fields similarly
           };

           // Concatenate other address fields into a single formatted string
            let otherAddress = '';
            if (data.fields.OtherStreet.value) {
                otherAddress += data.fields.OtherStreet.value + ', ';
            }
            if (data.fields.OtherCity.value) {
                otherAddress += data.fields.OtherCity.value + ', ';
            }
            if (data.fields.OtherState.value) {
                otherAddress += data.fields.OtherState.value + ' ';
            }
            if (data.fields.OtherPostalCode.value) {
                otherAddress += data.fields.OtherPostalCode.value + ', ';
            }
            if (data.fields.OtherCountry.value) {
                otherAddress += data.fields.OtherCountry.value;
            }
            // Remove trailing comma and space if present
            otherAddress = otherAddress.trim().replace(/,\s*$/, '');

            this.contact.otherAddress = otherAddress;

       } else if (error) {
           console.error('Error loading contact', JSON.stringify(error));
       }
   }


   // handleNameChange(event) {
   //     this.name = event.target.value;
   // }

   handleCheckboxChange(event) {
        this.isTaxWithholdingChecked = event.target.checked; // Update checkbox state
        this.FederalPercent ='';
        this.StatePercent ='';
        console.log("isTaxWithholdingChecked", this.isTaxWithholdingChecked);
    }

    handleFederalPercentChange(event) {
        this.FederalPercent = event.target.value; // Update federal percentage
    }

    handleStatePercentChange(event) {
        this.StatePercent = event.target.value; // Update state percentage
    }

 handleMedicalChange(event) {
        this.isMedicalChecked = event.target.checked; 
        if (!this.isMedicalChecked) {
            this.MedicalAmount = '';
        }
       //this.updateHardshipVisibility();
        console.log("Medical Checked", this.isMedicalChecked);
    }

    handleMedicalAmountChange(event){
        this.MedicalAmount = event.target.value;  
    }
 

    handleResidenceChange(event) {
       this.isResidenceChecked = event.target.checked;  
        if (!this.isResidenceChecked) {
            this.ResidenceAmount = '';
        }
        console.log("Residence Checked", this.isResidenceChecked);
    }
    handleResidenceAmountChange (event){
        this.ResidenceAmount = event.target.value;  
    }

     handleEducationChange(event) {
        this.isEducationChecked = event.target.checked;  
        if (!this.isEducationChecked) {
            this.EducationAmount = '';
        }
        console.log("Education Checked", this.isEducationChecked);
    }

handleEducationAmountChange (event){
        this.EducationAmount = event.target.value;  
    }

 handleForeclosureChange(event) {
          this.isForeclosureChecked = event.target.checked;  
        if (!this.isForeclosureChecked) {
            this.ForeclosureAmount = '';
        }
        console.log("Foreclosure Checked", this.isForeclosureChecked);
    }

 handleForeclosureAmountChange (event){
        this.ForeclosureAmount = event.target.value;  
    }

     handleRepairChange(event) {
        this.isRepairChecked = event.target.checked; 
        if (!this.isRepairChecked) {
            this.RepairAmount = '';
        }
        console.log("Repair Checked", this.isRepairChecked);
    }
       handleRepairAmountChange (event){
        this.RepairAmount = event.target.value;  
    }

     handleFuneralChange(event) {
        this.isFuneralChecked = event.target.checked;  
        if (!this.isFuneralChecked) {
            this.FuneralAmount = '';
        }
        console.log("Funeral Checked", this.isFuneralChecked);
    }
   
     handleFuneralAmountChange (event){
        this.FuneralAmount = event.target.value; 
    }


    handleSSNChange(event) {
        this.contactOptions = [];
        this.contactName = '';
        this.socialSecurityNumber = event.target.value;
        console.log("socialSecurityNumber", this.socialSecurityNumber);
        //this.clearFields1();
       this.selectedContactId = null; 
       this.selectedCompanyId = null;
       this.selectedPlanId = null;
       this.companyOptions = [];
       this.companyName = '';
       this.planName = '';
       this.plans = [];  
       this.contact= []; 
    }
handleRMDElectionChange(event) {
        this.RMDElection = event.detail.value; 
         this.Commencementdate = '';
        this.updateCommencementdateVisibility();
        console.log("this.RMDElection", this.RMDElection);
    }

    handleRMDAmountChange(event) {
        this.RMDAmount = event.detail.value; 
        this.GrossAmount = '';
        this.updateGrossAmountVisibility();
        console.log("this.RMDAmount", this.RMDAmount);
    }
    handleRMDLiquidationChange(event) {
        this.RMDLiquidation = event.detail.value;  
        //this.SourceFund= '';
        //this.SourceFormat = '';
        this.rows = [];
        this.addDefaultRow();
        this.updatesourceFieldsVisibility();      
        console.log("this.RMDLiquidation", this.RMDLiquidation);
    }

  handleCommencementdateChange(event) {
        this.Commencementdate = event.detail.value;  
        console.log("this.Commencementdate", this.Commencementdate);
    }
	handleGrossAmountChange(event) {
        this.GrossAmount = event.detail.value;  
        console.log("this.GrossAmount", this.GrossAmount);
    }
    

    handleSourceFundChange(event) {
        const rowId = event.target.dataset.id; // Get the row ID
        const newValue = event.target.value; // Get the new value

        // Update the row's SourceFund value
        this.updateRowValue(rowId, 'SourceFund', newValue);

        // Check for duplicates in other rows
    if (this.isDuplicateSourceFund(newValue, rowId)) { 
        this.showToastMessage('Duplicate SourceFund value not allowed.', 'error');
        this.rows = this.rows.filter(row => row.id !== rowId);
    }
    }

   showToastMessage(message, variant) {
    this.dispatchEvent(
        new ShowToastEvent({
            title: variant === 'error' ? 'Error' : 'Success',
            message: message,
            variant: variant,
        })
    );
} 
   
   isDuplicateSourceFund(value, currentRowId) {
        return this.rows.some(row => row.SourceFund === value && row.id !== currentRowId);
    }

    getPreviousSourceFund(rowId) {
        const row = this.rows.find(row => row.id === rowId);
        return row ? row.SourceFund : '';
    }
	
	handleSourceFormatChange(event) {

        const rowId = event.target.dataset.id;        
        const value = event.target.value;

        // Update the row's SourceFormat
        this.updateRowValue(rowId, 'SourceFormat', value);

        // Update the visibility flags for this row
        this.updateRowVisibility(rowId);
    }

	handleSourceAmountChange(event) {
        this.SourceAmount = event.detail.value;  
        console.log("this.SourceAmount", this.SourceAmount);
        
        const rowId = event.target.dataset.id;
        const value = event.target.value;
        this.updateRowValue(rowId, 'SourceAmount', value);
        //this.updateRowValue(rowId, 'showAmount', true);
        
    }
	handleSourcePercentChange(event) {
        this.SourcePercent = event.detail.value;  
        console.log("this.SourcePercent", this.SourcePercent);

        const rowId = event.target.dataset.id;
        const value = event.target.value;
        this.updateRowValue(rowId, 'SourcePercent', value);
        //this.updateRowValue(rowId, 'showPercent', true);
    }

    updateRowValue(rowId, field, value) {
        // Update a specific field value for a row
        this.rows = this.rows.map(row => 
            row.id === rowId ? { ...row, [field]: value } : row
        );
    }


     handleTraditionalRetirementChange(event) {
        this.TraditionalRetirement = event.detail.value; 
        this.TradIRAPlan ='';     
        this.TradAccount ='';
        this.TradAccountDeliveryAddr ='';
        this.showTraditionalFields =false;
        this.updateTerminationVisibility();
        console.log("this.TraditionalRetirement", this.TraditionalRetirement);
    }

    handleTradIRAPlanChange(event) {
        this.TradIRAPlan = event.detail.value;  
        console.log("this.TradIRAPlan", this.TradIRAPlan);
    }

    handleTradAccountChange(event) {
        this.TradAccount = event.detail.value;  
        console.log("this.TradAccount", this.TradAccount);
    }

    handleTradAccountDeliveryAddrChange(event) {
        this.TradAccountDeliveryAddr = event.detail.value; 
        console.log("this.TradAccountDeliveryAddr", this.TradAccountDeliveryAddr);
    }



     handleRothElectiveDeferralChange(event) {
        this.RothElectiveDeferral = event.detail.value; 
        this.ElectiveIRAPlan ='';
        this.ElectiveAccount ='';
        this.ElectiveAccountDeliveryAddr ='';
        this.showElectiveFields =false;
        this.updateTerminationVisibility();
        console.log("this.RothElectiveDeferral", this.RothElectiveDeferral);
    }


    handleElectiveIRAPlanChange(event) {
        this.ElectiveIRAPlan = event.detail.value;  
        console.log("this.ElectiveIRAPlan", this.ElectiveIRAPlan);
    }

    handleElectiveAccountChange(event) {
        this.ElectiveAccount = event.detail.value;  
        console.log("this.ElectiveAccount", this.ElectiveAccount);
    }

    handleElectiveAccountDeliveryAddrChange(event) {
        this.ElectiveAccountDeliveryAddr = event.detail.value; 
        console.log("this.ElectiveAccountDeliveryAddr", this.ElectiveAccountDeliveryAddr);
    }


     // Event handler for Type change
    handleTypeChange(event) {
        this.type = event.detail.value;
        this.clearRMDFields();
        this.clearTerminationFields();
        this.updateVisibility();
        console.log("this.type", this.type);
    }
      // Event handler for election change
    handleElectionChange(event) {
        this.electiontype = event.detail.value;
        this.clearRMDFields();
        this.clearTerminationFields();
        this.updateVisibility();
        this.isTaxWithholdingChecked = false;
        console.log("this.type", this.electiontype);
    }

    // Event handler for Status change
    handleStatusChange(event) {
        this.status = event.detail.value;
    }
 handleTransferExchangeChange1(event) {
        this.TransferExchange1 = event.detail.value; 
        
    }
    handleTransferExchangeChange2(event) {
        this.TransferExchange2 = event.detail.value; 
        
    }
    handleTransferExchangeChange3(event) {
        this.TransferExchange3 = event.detail.value; 
        
    }
    handleTransferExchangeChange4(event) {
        this.TransferExchange4 = event.detail.value; 
        this.showSource =true;
    }
    handleTransferExchangeChange5(event) {
        this.TransferExchange5 = event.detail.value; 
        this.showDestination =true;
        
    }

    handlesourcenumberChange(event) {
       this.sourcenumber = event.detail.value; 
        
    }

    handlesourcedateChange(event) {
        
         this.sourcedate = event.detail.value; 
    }

    handleDestinationnumberChange(event) {
        this.Destinationnumber = event.detail.value; 
        
    }

    handleDestinationdateChange(event) {
        this.Destinationdate = event.detail.value; 
        
    }

    updateVisibility() {
        if (this.type === 'Required Minimum Distribution (RMD)' &&
            (this.electiontype.startsWith('A.')  //=== 'A. Vested Rollover To Traditional Retirement Account' 
            || this.electiontype.startsWith('B.') )) {
            this.showFields = true;
            this.showTerminationFields = false;
            this.checkboxfield = false;
            this.showTransferExchangeFields = false;
            console.log("this.showFields", this.showFields);

        } 
        else if (this.type === 'Termination' &&
            (this.electiontype.startsWith('A.') //=== 'A. Vested Rollover To Traditional Retirement Account' 
              || this.electiontype.startsWith('B.')
              || this.electiontype.startsWith('C.'))) {
             this.showTerminationFields = true;
             this.showTraditionalandElectiveFields=true;
             this.checkboxfield = false;
             this.showFields = false;
             this.showTransferExchangeFields = false;
             console.log("this.showTerminationFields", this.showTerminationFields);

        } 
         else if (this.type === 'Termination' &&
            (this.electiontype.startsWith('D.'))) { //=== 'A. Vested Rollover To Traditional Retirement Account' 
             this.showTerminationFields = true;
             this.showTraditionalandElectiveFields=true;
            this.checkboxfield = true;           
             this.showFields = false;
             this.showTransferExchangeFields = false;
             console.log("this.showTerminationFields", this.showTerminationFields);

        } 

          else if (this.type === 'Termination' &&
            (this.electiontype.startsWith('E.') //=== 'A. Vested Rollover To Traditional Retirement Account' 
              || this.electiontype.startsWith('F.')
              || this.electiontype.startsWith('G.')
              || this.electiontype.startsWith('I.'))) {             
             this.checkboxfield = true; 
             this.showFields = false;
             this.showTerminationFields = true;
             this.showTraditionalandElectiveFields=false;
            // this.showTerminationFields = false;
             this.showTransferExchangeFields = false;
             console.log("this.checkboxfield", this.checkboxfield);

        }
          else if (this.type === 'Transfer/Exchange: Plan-To-Plan (PTP) / Custodial' &&
            (this.electiontype.startsWith('A.') //=== 'A. Vested Rollover To Traditional Retirement Account' 
              || this.electiontype.startsWith('B.')
              || this.electiontype.startsWith('C.')
              || this.electiontype.startsWith('D.'))) {
             this.showTransferExchangeFields = true;
             this.showFields = false;
             this.checkboxfield = false;
             this.showTerminationFields = false;
             console.log("this.showTransferExchangeFields", this.showTransferExchangeFields);

        }
          else if (this.type === 'Hardship' &&
            (this.electiontype.startsWith('A.') //=== 'A. Vested Rollover To Traditional Retirement Account' 
              || this.electiontype.startsWith('B.')
              || this.electiontype.startsWith('C.')
              || this.electiontype.startsWith('D.'))) {
             this.showTransferExchangeFields = false;
             this.showFields = false;
             this.checkboxfield = false;
             this.showTerminationFields = false;
             this.ShowHardship = true;
             console.log("this.ShowHardship", this.ShowHardship);

        }
        else {
            this.showFields = false;
            this.showTerminationFields = false;
            this.checkboxfield = false;
            this.showTransferExchangeFields = false;
           this.ShowHardship = false; 
            console.log("this.showFields", this.showFields);
        }
    }
     updateHardshipVisibility(){
         if (this.UnChecked) {
            this.showharship1 = true;
            console.log("this.showharship1", this.showharship1);
       } else {
            this.showharship1 = false;
            console.log("this.showharship1", this.showharship1);
        }
    }
    updateTransferExchangesourceVisibility(){
         if (this.SourceInvestmentProvider !== '') {
            this.SourceContractNumber = true;
            this.SourceContractDate = true;
            console.log("this.SourceContractNumber", this.SourceContractNumber);
            console.log("this.SourceContractDate", this.SourceContractDate);

        } else {
            this.SourceContractNumber = false;
            this.SourceContractDate = false;
            console.log("this.SourceContractNumber", this.SourceContractNumber);
             console.log("this.SourceContractDate", this.SourceContractDate);
        }
    }
    
    updateCommencementdateVisibility() {
        if (this.RMDElection === 'Deferred') {
            this.showCommencementdate = true;
            console.log("this.showCommencementdate", this.showCommencementdate);

        } else {
            this.showCommencementdate = false;
            console.log("this.showCommencementdate", this.showCommencementdate);
        }
    }
	
updateGrossAmountVisibility() {
        if (this.RMDAmount === 'Gross Amount') {
            this.showGrossAmount = true;
            console.log("this.showGrossAmount", this.showGrossAmount);

        } else {
            this.showGrossAmount = false;
            console.log("this.showGrossAmount", this.showGrossAmount);
        }
    }
	
updatesourceFieldsVisibility() {
        if (this.RMDLiquidation === 'Per Specified') {
            this.showsourceFields = true;            
            console.log("this.showsourceFields", this.showsourceFields);

        } else {
            this.showsourceFields = false;
            console.log("this.showsourceFields", this.showsourceFields);
        }
    }

updateRowVisibility(rowId) {
    // Find the row by ID
    const row = this.rows.find(row => row.id === rowId);    
    if (row) {
        // Update visibility flags based on SourceFormat
        if (row.SourceFormat === '$') {
            row.showAmount = true;
            row.showPercent = false;
        } else if (row.SourceFormat === '%') {
            row.showPercent = true;
            row.showAmount = false;
        } else {
            row.showAmount = false;
            row.showPercent = false;
        }
        // Trigger re-render
        this.rows = [...this.rows];
    }
}

updateTerminationVisibility() {
        if (this.TraditionalRetirement !== 'No Selection') {
            this.showTraditionalFields = true; 
            console.log("this.showTraditionalFields", this.showTraditionalFields);

        } 
        
         if (this.RothElectiveDeferral !== 'No Selection') {
            this.showElectiveFields = true; 
            console.log("this.showElectiveFields", this.showElectiveFields);

        } 
         if (this.RothElectiveDeferral !== 'No Selection') {
            this.showElectiveFields = true; 
            console.log("this.showElectiveFields", this.showElectiveFields);

        } 

    }
    //Destinationdate

	handleSave() {
            if (this.isTaxWithholdingChecked) {
                        // Validate fields
                        if (!this.FederalPercent && !this.StatePercent) {
                            this.errorMessage = 'Please enter either Federal Percentage or State Percentage.';
                        } else {
                            this.errorMessage = ''; // Clear error message if validation passes
                            // Handle form submission logic here
                            console.log('Submitting with:', this.FederalPercent, this.StatePercent);
                            this.handleSave1();
                        }
                    } else {
                        this.errorMessage = ''; // Clear error message if checkbox is not checked
                        // Handle form submission logic here if needed
                        this.handleSave1();
                    }

    }
    handleSave1() {
        

        const fields = { Name : 'TEST', //this.name,
                         Social_secuirty_number__c : this.socialSecurityNumber,
                         Contact__c: this.selectedContactId,
                         Company__c: this.selectedCompanyId,
                         Plan__c: this.selectedPlanId,
                         Contact1__c: this.contactName, 
                         Company1__c: this.companyName,
                         Plan1__c: this.planName,  
                         First_Name__c:this.contact.FirstName,    
                         Last_Name__c:this.contact.LastName,                         
                         Social_secuirty_number__c:this.contact.Social_secuirty_number__c,  
                         Birthdate__c:this.contact.Birthdate,  
                         Date_of_Employment__c:this.contact.Date_of_Employment__c,  
                         Date_of_Termination__c:this.contact.Date_of_Termination__c,  
                         Email__c:this.contact.Email,  
                         Phone__c:this.contact.Phone,  
                         Marital_Status__c : this.contact.Marital_Status__c,	
                            OtherStreet__c : this.contact.OtherStreet,
                            OtherCity__c: this.contact.OtherCity,
                            OtherState__c : this.contact.OtherState,
                            OtherPostalCode__c : this.contact.OtherPostalCode,
                            OtherCountry__c : this.contact.OtherCountry, 
                         Distribution_plan_type__c :this.type,
                         Election__c:this.electiontype,
                         Status__c :this.status,
                         RMD_Election__c :this.RMDElection,
                         RMD_Amount_Election__c:this.RMDAmount,
                         RMD_Liquidation_Election__c:this.RMDLiquidation,
                         RMD_Commencement_Date__c:this.Commencementdate,
                         RMD_Gross_Amount__c:this.GrossAmount,
                         //RMD_Source_Fund__c:this.SourceFund,
                         //RMD_Source_Format__c:this.SourceFormat,
                         //RMD_Source_Percent__c:this.SourceAmount,
                         //RMD_Source_Amount__c:this.SourcePercent,
                         Traditional_Retirement_Account__c:this.TraditionalRetirement,
                         Traditional_IRA_Plan_Name__c: this.TradIRAPlan,               
                         Traditional_Account_Number__c:this.TradAccount,
                         Traditional_Account_Delivery_Address__c:this.TradAccountDeliveryAddr,
                         Roth_Elective_Deferral_Account__c:this.RothElectiveDeferral,
                         Roth_Elective_IRA_Plan_Name__c :this.ElectiveIRAPlan,
                         Roth_Elective_Account_Number__c:this.ElectiveAccount, 
                         Roth_Elective_Account_Delivery_Address__c:this.ElectiveAccountDeliveryAddr,
                         Additional_State_Percentage__c:this.StatePercent,
                         Additional_Federal_Percentage__c: this.FederalPercent, 
                        Transfer_Exchange_Tranaction_Type__c:this.TransferExchange1,
                        Transfer_Exchange_Transaction_Extent__c:this.TransferExchange2,
                        Transfer_Exchange_Assets_In_Kind_Flag__c:this.TransferExchange3,
                        //Source_Investment_Provider__c  :this.TransferExchange4, 
                        //Source_Contract_Number__c:this.sourcenumber,
                        //Source_Contract_Date__c:this.sourcedate,
                        //Destination_Investment_Provider__c :this.TransferExchange5, 
                        //Destination_Contract_Date__c:this.Destinationdate,
                        //Destination_Contract_Number__c:this.Destinationnumber,
                        Unreimbursed_Medical_Amount__c:this.MedicalAmount,
                        Residence_Purchase_Amount__c:this.ResidenceAmount,
                        Education_Amount__c:this.EducationAmount,
                        Residence_Foreclosure_Eviction_Amount__c:this.ForeclosureAmount,
                        Residence_Casualty_Repair_Amount__c:this.RepairAmount,
                        Funeral_Amount__c:this.FuneralAmount,

   };

        const recordInput = { apiName: DISTRIBUTION_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then((record) => {
                this.newrecordId = record.id;
                //this.navigateToRecordPage(this.newrecordId);
                 if (this.showsourceFields) {
                     this.electionInsert();
                 }
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record saved successfully',
                        variant: 'success'
                    })
                );
                this.clearFields();
                console.log("before",this.newrecordId );                
                this.navigateToRecordPage(this.newrecordId);
                console.log("After",this.newrecordId );                     
            })
            .catch(error => {
                   console.error('Full error object:', error);
                 //const errorMessage = error.body?.message || 'Unknown error occurred';
                 this.message = undefined;
                 this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                 console.log("error", JSON.stringify(this.error));
            });
    }
   
   navigateToRecordPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: DISTRIBUTION_OBJECT.objectApiName,
                actionName: 'view'
            }
        });
    }

    handleCancel() {
        this.clearFields();
    }

    clearFields() {
        //this.name = '';
        this.socialSecurityNumber = '';
        this.selectedContactId = null;
        this.selectedCompanyId = null;
        this.selectedPlanId = null;
        this.contactName = '';
        this.companyName = '';
        this.planName = '';
        this.type = '';
        this.Elect='';
        this.status = '';
        this.companyOptions = [];
        this.plans = [];
        this.contact= []; 
        this.RMDElection ='';
	    this.Commencementdate = '';        
		this.RMDAmount ='';
		this.GrossAmount = '';		
		this.RMDLiquidation ='';
        //this.SourceFund= '';
        //this.SourceFormat = '';
        //this.SourceAmount = '';
        //this.SourcePercent = ''; 
        this.TraditionalRetirement ='No Selection';
        this.TransferExchange='';
        this.TradIRAPlan ='';     
        this.TradAccount ='';
        this.TradAccountDeliveryAddr ='';
        this.RothElectiveDeferral ='No Selection';
        this.ElectiveIRAPlan ='';
        this.ElectiveAccount ='';
        this.ElectiveAccountDeliveryAddr ='';
        this.showTraditionalFields =false;
      
        this.showCommencementdate =false;
        this.showGrossAmount =false;
        this.showsourceFields =false;
        this.showAmount = false;
        this.showPercent = false;
        this.showTerminationFields =false;
      this.checkboxfield =false;
         this.showTransferExchangeFields = false;
         this.ShowHardship = false;
         this.ShowHardship1= false;
    }
clearRMDFields() {
        this.Commencementdate = '';
        this.GrossAmount = '';
        //this.SourceFund= '';
        //this.SourceFormat = '';
        //this.SourceAmount = '';
        //this.SourcePercent = '';
        this.showCommencementdate =false;
        this.showGrossAmount =false;
        this.showsourceFields =false;
        this.showAmount = false;
        this.showPercent = false;
}

clearTerminationFields() { 
this.TraditionalRetirement ='No Selection';
this.TransferExchange='';
this.TradIRAPlan ='';     
this.TradAccount ='';
this.TradAccountDeliveryAddr ='';
this.RothElectiveDeferral ='No Selection';
this.ElectiveIRAPlan ='';
this.ElectiveAccount ='';
this.ElectiveAccountDeliveryAddr ='';
this.showTraditionalFields =false;
this.showElectiveFields =false;

}  

  handleContactChange(event) {
       this.selectedContactId = event.detail.value;
         try {
                        this.selectedContactId = event.detail.value;

                        // Ensure plans are loaded before attempting to find selected plan
                        const selectedcontact = this.contactOptions.find(contact => contact.value === this.selectedContactId);

                        if (selectedcontact) {
                            this.contactName = selectedcontact.label;
                            console.log("Selected contact Name:", this.contactName);
                            // Use planName as needed
                        } else {
                            console.error("Plan not found for id:", this.selectedContactId);
                        }
                    } catch (error) {
                        console.error("Error handling contact change:", error);
                    } 
       this.contact= []; 
       this.selectedCompanyId = null;
       this.selectedPlanId = null;
       this.companyOptions = [];
       this.companyName = '';
       this.planName = '';
       this.plans = [];  
       this.loadCompanies(); 
       this.recordId = this.selectedContactId;
        console.log("selectedContactId", this.selectedContactId);
       console.log("selectedrecordId", this.recordId);
       //this.selectedContactname = event.detail.label;
       //this.disableSave = !this.selectedContactId;

       //console.log("selectedContactId", this.selectedContactId);
       //console.log("selectedContactId", this.selectedContactname);
   }

    handleCompanyChange(event) {
        this.selectedCompanyId = event.detail.value; 
         try {
                        this.selectedCompanyId = event.detail.value;

                        // Ensure plans are loaded before attempting to find selected plan
                        const selectedcompany = this.companyOptions.find(company => company.value === this.selectedCompanyId);

                        if (selectedcompany) {
                            this.companyName = selectedcompany.label;
                            console.log("Selected Company Name:", this.companyName);
                            // Use planName as needed
                        } else {
                            console.error("Plan not found for id:", this.selectedCompanyId);
                        }
                    } catch (error) {
                        console.error("Error handling Company change:", error);
                    }
        this.loadPlans();
    }

   handlePlanChange(event) {
        this.selectedPlanId = event.detail.value;   
                try {
                        this.selectedPlanId = event.detail.value;

                        // Ensure plans are loaded before attempting to find selected plan
                        const selectedPlan = this.plans.find(plan => plan.value === this.selectedPlanId);

                        if (selectedPlan) {
                            this.planName = selectedPlan.label;
                            console.log("Selected Plan Name:", this.planName);
                            // Use planName as needed
                        } else {
                            console.error("Plan not found for id:", this.selectedPlanId);
                        }
                    } catch (error) {
                        console.error("Error handling plan change:", error);
                    }
     //console.log("selectedPlanId", this.selectedPlanId);
     this.planId = event.detail.value;
    }


   loadPlans() {
    getPlansByCompany({ companyId: this.selectedCompanyId })
        .then(result => {
            this.plans = result.map(plan => ({
                label: plan.Name, 
                value: plan.Id
            }));
        })
        .catch(error => {
            console.error('Error fetching plans:', error);
        });
}

   loadCompanies() {
    getCompaniesByContact({ contactId: this.selectedContactId })
        .then(result => {
            this.companyOptions = result.map(company => ({
                label: company.Name,
                value: company.Id
            }));
        })
        .catch(error => {
            console.error('Error fetching companies:', error);
        });
}

   @wire(getContactsBySSN, { ssn: '$socialSecurityNumber' })
   wiredContacts({ error, data }) {
       if (data) {
           this.contactOptions = data.map(contact => ({
               label: contact.Name,
               value: contact.Id
           }));
           //this.disableContactDropdown = false;
       } else if (error) {
           // Handle error
           console.error('Error fetching contacts:', error);
       }
   }
   // Wire the Apex methods to retrieve picklist values
    @wire(getTypePicklistValues,{ planId: '$planId' })
    wiredTypeOptions({ error, data }) {
        if (data) {
            // Map the picklist values to match the structure required by lightning-combobox
            this.typeOptions = data.map(item => {
                return { label: item, value: item };
            });
        } else if (error) {
            console.error('Error fetching type picklist values:', error);
        }
    }
  @wire(getElectionPicklistValues,{ planId: '$planId' })
    wiredElectionOptions({ error, data }) {
        if (data) {
            // Map the picklist values to match the structure required by lightning-combobox
            this.ElectionOptions = data.map(item => {
                return { label: item, value: item };
            });
        } else if (error) {
            console.error('Error fetching type picklist values:', error);
        }
    }
    @wire(getStatusPicklistValues)
    wiredStatusOptions({ error, data }) {
        if (data) {
            // Map the picklist values to match the structure required by lightning-combobox
            this.statusOptions = data.map(item => {
                return { label: item, value: item };
            });
        } else if (error) {
            console.error('Error fetching status picklist values:', error);
        }
    }
 @wire(getRMDElectionPicklistValues)
    wiredRMDElectionOptions({ error, data }) {
        if (data) {
            // Map the picklist values to match the structure required by lightning-combobox
            this.RMDElectionOptions = data.map(item => {
                return { label: item, value: item };
            });
        } else if (error) {
            console.error('Error fetching type picklist values:', error);
        }
    }
    @wire(getRMDAmountPicklistValues)
    wiredRMDAmountOptions({ error, data }) {
        if (data) {
            this.RMDAmountOptions = data.map(item => ({ label: item, value: item }));
        } else if (error) {
            console.error('Error fetching RMD amount picklist values:', error);
        }
    }
     @wire(getRMDLiquidationPicklistValues)
    wiredRMDLiquidationOptions({ error, data }) {
        if (data) {
            // Map the picklist values to match the structure required by lightning-combobox
            this.RMDLiquidationOptions = data.map(item => {
                return { label: item, value: item };
            });
        } else if (error) {
            console.error('Error fetching type picklist values:', error);
        }
    }
//@wire(getRMDSourceFundPicklistValues)
//    wiredRMDSourceFundOptions({ error, data }) {
//        if (data) {
//            // Map the picklist values to match the structure required by lightning-combobox
//            this.RMDSourceFundOptions= data.map(item => {
//                return { label: item, value: item };
//            });
//        } else if (error) {
//            console.error('Error fetching type picklist values:', error);
//        }
//    }

@wire(getRMDSourceFundPicklistValues, { objectApiName: 'Account', fieldApiName: 'Vendor__c' })
    wiredRMDSourceFundOptions({ error, data }) {
        if (data) {
            this.RMDSourceFundOptions = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }

@wire(getRMDSourceFundPicklistValues, { objectApiName: 'Distribution__c', fieldApiName: 'Traditional_Retirement_Account__c' })
    wiredTraditionalRetirementOptions({ error, data }) {
        if (data) {
            this.TraditionalRetirementOptions = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }

 @wire(getRMDSourceFundPicklistValues, { objectApiName: 'Distribution__c', fieldApiName: 'Roth_Elective_Deferral_Account__c' })
    wiredRothElectiveDeferralOptions({ error, data }) {
        if (data) {
            this.RothElectiveDeferralOptions = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }   

  @wire(getRMDSourceFormatPicklistValues)
    wiredRMDSourceFormatOptions({ error, data }) {
        if (data) {
            // Map the picklist values to match the structure required by lightning-combobox
            this.RMDSourceFormatOptions= data.map(item => {
                return { label: item, value: item };
            });
        } else if (error) {
            console.error('Error fetching type picklist values:', error);
        }
    }
    @wire(getRMDSourceFundPicklistValues, { objectApiName: 'Distribution__c', fieldApiName: 'Transfer_Exchange_Tranaction_Type__c' })
    wiredTransferExchangeOptions1({ error, data }) {
        if (data) {
            this.TransferExchangeOptions1 = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }
     @wire(getRMDSourceFundPicklistValues, { objectApiName: 'Distribution__c', fieldApiName: 'Transfer_Exchange_Transaction_Extent__c' })
    wiredTransferExchangeOptions2({ error, data }) {
        if (data) {
            this.TransferExchangeOptions2 = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }
     @wire(getRMDSourceFundPicklistValues, { objectApiName: 'Distribution__c', fieldApiName: 'Transfer_Exchange_Assets_In_Kind_Flag__c' })
    wiredTransferExchangeOptions3({ error, data }) {
        if (data) {
            this.TransferExchangeOptions3 = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }
      @wire(getRMDSourceFundPicklistValues, { objectApiName: 'Account', fieldApiName: 'Vendor__c' })
    wiredTransferExchangeOptions4({ error, data }) {
        if (data) {
            this.TransferExchangeOptions4 = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }
     @wire(getRMDSourceFundPicklistValues, { objectApiName: 'Account', fieldApiName: 'Vendor__c' })
    wiredTransferExchangeOptions5({ error, data }) {
        if (data) {
            this.TransferExchangeOptions5 = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values', error);
        }
    }
}