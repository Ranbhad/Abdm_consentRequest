import React, { useState, useEffect } from 'react';
import {Table,List,ListItem,ListItemText,Popover,TableHead,TableRow,TableCell,TableContainer,TableBody,Paper,Typography,Button,Dialog,DialogTitle,Box,IconButton,DialogContent,TextField,FormControl, InputLabel,DialogActions,Select,MenuItem,FormControlLabel,FormGroup,Checkbox,Grid,FormLabel, InputAdornment,Tab,Tabs} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import CancelIcon from '@mui/icons-material/Cancel';
import { ControlDateTimePicker, handleDateTimeChange, generateUUID, generateApiHeaders } from '../Controls/control';
import { env } from '../Controls/Env';
import Alerts from '../Controls/Alerts';
import DataPullDialog from './PullData';

const ConsentDetails = () => {
const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSearchKey, setSelectedSearchKey] = useState('');
  const [dataPullDialogOpen, setDataPullDialogOpen] = useState(false);
  const [healthInfoFrom, setHealthInfoFrom] = useState(null);
  const [healthInfoTo, setHealthInfoTo] = useState(null);
  const [consentDetails, setConsentDetails] = useState(null);
  const [selectedConsentRequestDetails, setSelectedConsentRequestDetails] = useState(null);
  const [openConsentDetailsDialog, setOpenConsentDetailsDialog] = useState(false);
  const [selectedConsentIndex, setSelectedConsentIndex] = useState(null);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState(''); 
  const [openDialog, setOpenDialog] = useState(false);
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [identifier, setIdentifier] = useState('');  
  const [filteredConsentList, setFilteredConsentList] = useState([]);
  const [requesterName, setRequesterName] = useState('');
  const [consentExpiry, setConsentExpiry] = useState(null);
  const [selectedHealthInfoTypes, setSelectedHealthInfoTypes] = useState([]);
  const [consentListData, setConsentListData] = useState([]);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [successAlertMessage, setSuccessAlertMessage] = useState('');
  const [errorAlertMessage, setErrorAlertMessage] = useState('');

  const openSuccessAlert = (message) => {
    setSuccessAlertMessage(message);
    setIsSuccessAlertOpen(true);
  };
  
  const openErrorAlert = (message) => {
    setErrorAlertMessage(message);
    setIsErrorAlertOpen(true);
  };
  const closeAlerts = () => {
    setIsSuccessAlertOpen(false);
    setIsErrorAlertOpen(false);
  };

  const handlePullDataClick = () => {
    setDataPullDialogOpen(true);
  };

  const handleConsentArtefactClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleConsentExpiryChange = (name, newValue) => {
    handleDateTimeChange(name, newValue, setConsentExpiry);
  };
  
  const handleHealthInfoFromChange = (name, newValue) => {
    handleDateTimeChange(name, newValue, setHealthInfoFrom);
  };
  
  const handleHealthInfoToChange = (name, newValue) => {
    handleDateTimeChange(name, newValue, setHealthInfoTo);
  };

  const handleHealthInfoTypeChange = (event) => {
    const value = event.target.value;
    setSelectedHealthInfoTypes((prevSelected) => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter((type) => type !== value);
      } else {
        return [...prevSelected, value];
      }
    });
  };

  const healthInfoTypes = [
    { name: 'OPConsultation', value: 'OPConsultation' },
    { name: 'DiagnosticReport', value: 'DiagnosticReport' },
    { name: 'DischargeSummary', value: 'DischargeSummary' },
    { name: 'Prescription', value: 'Prescription' },
    { name: 'ImmunizationRecord', value: 'ImmunizationRecord' },
    { name: 'HealthDocumentRecord', value: 'HealthDocumentRecord' },
    { name: 'WellnessRecord', value: 'WellnessRecord' },
  ];

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
    
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSearchIdentifier('');
    setFilteredConsentList([]);
    setRequesterName('');
    setHealthInfoFrom(null);
    setHealthInfoTo(null);
    setConsentExpiry(null);
    setSelectedHealthInfoTypes([]);
    setSelectedPurpose('');
  };


  const handleSearchIdentifierChange = async (event) => {
    setSearchIdentifier(event.target.value);
  };

  const handleSearch = async () => {
    try {
        const searchValue = `${searchIdentifier}`;

        const response = await fetch(
            `${env}/v1/patients/find`,
            {
                method: 'POST',
                headers: {
                    ...generateApiHeaders(),
                },
                credentials: 'include',
                body: JSON.stringify({
                    "requestId": generateUUID(),
                    "timestamp": new Date().toISOString(),
                    "query": {
                        "patient": {
                            "id": searchValue
                        },
                        "requester": {
                            "type": "HIU",
                            "id": "ehrn_mar16_hiu"
                        }
                    }
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const patientData = await response.json();
        openSuccessAlert("Patient details found Successfully");
        console.log("patient find:", patientData);
        setSelectedPatientData(patientData);
        setSearchIdentifier(`${searchIdentifier} : ${patientData.patient.name}`);

        setFilteredConsentList(patientData);
        
    } catch (error) {
        console.error('Error fetching patient data:', error.message);
        openErrorAlert("Error while fetching patient details")
    }
};
  const getPurposeCode = (selectedPurpose) => {
    const purposeCodeMap = {
      'Care Management': 'CAREMGT',
      'Break the Glass': 'BTG',
      'Public Health': 'PUBHLTH',
      'Disease Specific HealthCare Research': 'DSRCH',
      'Healthcare Payment': 'HPAYMT',
    };
  
    return purposeCodeMap[selectedPurpose] || 'UNKNOWN';
  };  
  const handleSendRequest = async () => {
    try {
      if (!selectedPatientData) {
        throw new Error('Please perform a search to select a patient.');
      }
      if (!selectedPurpose) {
        throw new Error('Please select the purpose of the request.');
      }
      if (!requesterName.trim()) {
        throw new Error('Please provide the requester name.');
      }
      if (selectedHealthInfoTypes.length === 0) {
        throw new Error('Please select at least one health info type.');
      }
      if (!healthInfoFrom || !healthInfoTo) {
        throw new Error('Please select the date range for health information.');
      }
      if (!consentExpiry) {
        throw new Error('Please select the consent expiry date.');
      }
      const currentDate = new Date();
    const selectedExpiryDate = new Date(consentExpiry['ConsentExpiry']);

    if (selectedExpiryDate <= currentDate) {
      throw new Error('Consent expiry date should be in the future.');
    }
      const requestData = {
        requestId: generateUUID(),
        timestamp: new Date().toISOString(),
        consent: {
          purpose: {
            text: selectedPurpose,
            code: getPurposeCode(selectedPurpose),
            refUri: 'https://www.mciindia.org',
          },
          patient: {
            id: selectedPatientData.patient.id,
          },
          hiu: {
            id: 'ehrn_mar16_hiu',
            name: 'ehrn_abdm',
          },
          requester: {
            name: requesterName,
            identifier: {
              type: 'REGNO',
              value: 'MH1001',
              system: 'https://www.mciindia.org',
            },
          },
          hiTypes: selectedHealthInfoTypes,
          permission: {
            accessMode: 'VIEW',
            dateRange: {
              from: healthInfoFrom['HealthInfoFrom'],
              to: healthInfoTo['HealthInfoTo'],
            },
            dataEraseAt: consentExpiry['ConsentExpiry'],
            frequency: {
              unit: 'MONTH',
              value: 1,
              repeats: 12,
            },
          },
        },
      };
  
      console.log('Sending Payload:', requestData);
      const response = await fetch(
        `${env}/v1/consent-requests/init`,
        {
          method: 'POST',
          headers: {
            ...generateApiHeaders(),
          },
          body: JSON.stringify(requestData),
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = await response.json();
      console.log('Response Data:', responseData);
      openSuccessAlert("Consent request sent successfully");
      handleCloseDialog();
    } catch (error) {
      console.error('Error sending request:', error.message);
      openErrorAlert(error.message);
    }
  };
  
  const handleSearchTextFieldChange = (event) => {
    setIdentifier(event.target.value);
  };

  const handleSearchConsentRequests = async (identifier, searchType) => {
    try {
      let queryString = '';
  
      if (searchType === 'patientId') {
        queryString = `patientId=${identifier}@sbx&consentLimit=1&consentOffset=100`;
      } else if (searchType === 'requestId') {
        queryString = `requestId=${identifier}&consentLimit=1&consentOffset=100`;
      } else if (searchType === 'requesterCode') {
        queryString = `requesterCode=${identifier}&consentLimit=1&consentOffset=100`;
      } else if (searchType === 'fromDate') {
        queryString = `fromDate=${identifier}&consentLimit=1&consentOffset=100`;
      } else if (searchType === 'toDate') {
        queryString = `toDate=${identifier}&consentLimit=1&consentOffset=100`;
      } else if (searchType === 'status') {
        queryString = `status=${identifier}&consentLimit=1&consentOffset=100`;
      } else {
        throw new Error('Invalid search type');
      }
  
      const response = await fetch(
        `${env}/v1/consent-requests/list?${queryString}`,
        {
          method: 'GET',
          headers: {
            ...generateApiHeaders(),
          },
        }
      );
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const consentData = await response.json();
      const consentArray = Array.isArray(consentData) ? consentData : [consentData];
      setConsentListData(consentArray);
      console.log('Consent Request Data:', consentArray);
    } catch (error) {
      console.error('Error fetching consent request data:', error.message);
    }
  };

const handleSearchKeyChange = (event) => {
  setSelectedSearchKey(event.target.value);
};
const handleSearchButtonClick = () => {
  if (identifier.trim() !== '' && selectedSearchKey !== '') {
    handleSearchConsentRequests(identifier, selectedSearchKey);
  }
};
const handleViewConsentDetails = async () => {
  try {
    if (selectedConsentIndex !== null && selectedConsentIndex !== undefined) {
      const consentArtefacts = consentListData[selectedConsentIndex]?.consentArtefacts;
      console.log('Consent Artefacts:', consentArtefacts);

      if (consentArtefacts && consentArtefacts.length > 0) {
        const consentArtefactsId = consentArtefacts[0]?.id;
        console.log('Consent Artefacts ID:', consentArtefactsId);

        if (consentArtefactsId) {
          const response = await fetch(
            `${env}/v1/consents/${consentArtefactsId}`,
            {
              method: 'GET',
              headers: {
                ...generateApiHeaders(),
              },
            }
          );

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const consentDetailsData = await response.json();
          console.log('Consent Details Data:', consentDetailsData);
          setConsentDetails(consentDetailsData);
          setOpenConsentDetailsDialog(true);
          openSuccessAlert('Successfully fetched consent details');
        } else {
          console.error('Consent details cannot be fetched. ConsentArtefacts.id is not available.');
          openErrorAlert('Consent details cannot be fetched. ConsentArtefacts.id is not available');
        }
      } else {
        console.log('No consent artefacts available.');
        openErrorAlert('No consent artefacts available.');
      }
    } else {
      console.error('selectedConsentIndex is null or undefined.');
      openErrorAlert('selectedConsentIndex is null or undefined');
    }
  } catch (error) {
    console.error('Error fetching consent details:', error.message);
    openErrorAlert('Error while fetching consent details');
  }
};

  const handleCloseConsentIdTab = () => {
    setOpenConsentDetailsDialog(false)
  }

  const handleConsentRequestStatus = async (consentRequestId, index) => {
    try {
      const response = await fetch(
        `${env}/v1/consent-requests/status`,
        {
          method: 'POST',
          headers: {
            ...generateApiHeaders(),
          },
          body: JSON.stringify({
            "requestId": generateUUID(),
            "timestamp": new Date().toISOString(),
            "consentRequestId": consentRequestId,
          }),
        }
      );
      console.log('consent Request Id:', consentRequestId)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const statusData = await response.json();
      console.log('Consent Request Status:', statusData);
      setResponseContent(JSON.stringify(statusData, null, 2));
      openSuccessAlert('Successfully fetched Consent Request Status');
      const consentRequestDetails = {
        id: statusData?.consentRequest?.id || '',
        status: statusData?.consentRequest?.status || '',
        consentArtefacts: statusData?.consentRequest?.consentArtefacts || [],
      };
      setSelectedConsentRequestDetails(consentRequestDetails);
      setResponseDialogOpen(true);
      setSelectedConsentIndex(index);
      console.info("Responsive data:", responseContent)
    } catch (error) {
      console.error('Error fetching consent request status:', error.message);
      openErrorAlert('Error while fetching consent request status')
    }
  };

  const handleTableRowClick = (consentRequestId, index) => {
    setSelectedConsentIndex(index); // Set the selected index
    setResponseDialogOpen(true);
    handleConsentRequestStatus(consentRequestId, index);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedConsentRequestDetails(null); // Clear the selected consent request details
};

  return (
    <div>
      <Button variant="contained" style={{ marginLeft: '-90px', background: 'Black', marginTop: '40px' }} onClick={handleOpenDialog}>
        New Consent Request
      </Button>
<div style={{ display: 'flex' }}>
  <Paper style={{ minWidth: '500px', marginTop: '40px', flex: '1', marginLeft: '-90px', marginRight: '20px' }} elevation={3}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Typography style={{ marginLeft: '20px', marginRight: '20px' }} variant="h4" gutterBottom>
        Consent List
      </Typography>
      <Button style={{ marginTop: '30px', alignSelf: 'center', marginLeft: '20px', flex: '1' }} size='small' label="" variant="filled" onClick={handleSearchButtonClick}>
        <SearchIcon style={{ width: '20px' }} />
      </Button>&nbsp;&nbsp;
      <FormControl variant="standard" size="small" style={{ marginTop: '20px', width: '200px' }}>
        <InputLabel htmlFor="select-search-key">Select Search Key</InputLabel>
        <Select
          label="Select Search Key"
          value={selectedSearchKey}
          onChange={handleSearchKeyChange}
          inputProps={{ id: 'select-search-key' }}
        >
          <MenuItem value="patientId">Patient ID</MenuItem>
          <MenuItem value="requestId">Request ID</MenuItem>
          <MenuItem value="requesterCode">Requester Code</MenuItem>
          <MenuItem value="fromDate">From Date</MenuItem>
          <MenuItem value="toDate">To Date</MenuItem>
          <MenuItem value="status">Status</MenuItem>
        </Select>
      </FormControl>&nbsp;&nbsp;
      <TextField variant="standard" margin="normal" label="Search Consent Requests" value={identifier} onChange={handleSearchTextFieldChange} style={{ marginRight: '50px', marginTop: '25px', flex: '1', width: '200px' }} />
    </div>
    <Table>
      <TableHead>
        <TableRow style={{ backgroundColor: 'ButtonShadow' }}>
          <TableCell>Patient ID</TableCell>
          <TableCell>Request Status</TableCell>
          <TableCell>Consent Created On</TableCell>
          <TableCell>Requester</TableCell>
          <TableCell>Consent Expiry On</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {consentListData.map((consent, index) => (
          <TableRow key={index} onClick={() => handleTableRowClick(consent.consentRequestId, index)}>
            <TableCell>{consent.patientId}</TableCell>
            <TableCell>{consent.status}</TableCell>
            <TableCell>{consent.createdDate}</TableCell>
            <TableCell>{consent.requester.name || 'N/A'}</TableCell>
            <TableCell>{consent.permission.dataEraseAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
  {selectedConsentRequestDetails && (
    <Paper style={{ marginTop: '40px', flex: detailsOpen ? '0.5' : '0', marginRight: '-90px', transition: 'flex 0.5s', minWidth: '600px' }} elevation={3}>
      <IconButton style={{ position: 'absolute', top: '5px', right: '5px' }} onClick={handleCloseDetails}>
        <CancelIcon />
      </IconButton>
      <div style={{ margin: '20px' }}>
      <Typography variant="h4" gutterBottom style={{align: 'center'}} >
          Consent Request Status
        </Typography>
        <Typography variant="h6" gutterBottom>
          Consent Request ID: {selectedConsentRequestDetails.id}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Status: {selectedConsentRequestDetails.status}
        </Typography>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: 'ButtonShadow' }}>
              <TableCell>Consent Artefacts ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Render consent artefacts */}
            {selectedConsentRequestDetails?.consentArtefacts.map((artefact) => (
              <TableRow key={artefact.id}>
                <TableCell onClick={handleConsentArtefactClick}>{artefact.id}</TableCell>
              </TableRow>
            ))}
            {/* If there are no consent artefacts, render a row with a message */}
            {selectedConsentRequestDetails?.consentArtefacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={1}>No consent artefacts found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClosePopover} anchorOrigin={{ vertical: 'bottom',horizontal: 'left',}} transformOrigin={{ vertical: 'top', horizontal: 'left', }}>
        <List>
          <ListItem button onClick={handleViewConsentDetails}>
            <ListItemText primary="View Consent details" />
          </ListItem>
          <ListItem button onClick={handlePullDataClick}>
            <ListItemText primary="Pull Data" />
          </ListItem>
          <ListItem button onClick={() => console.log('Data clicked')}>
            <ListItemText primary="View Data" />
          </ListItem>
        </List>
      </Popover>
    </Paper>
  )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Consent Request</DialogTitle>
        <IconButton edge="end" color="inherit" onClick={handleCloseDialog} aria-label="close" style={{ position: 'absolute', right: '20px', top: '8px' }}>
            <CancelIcon />
          </IconButton>
        <DialogContent>
          <Box mb={2}>
            <TextField variant='standard' margin="normal" label="Patient Identifier" defaultValue="" value={searchIdentifier} onChange={handleSearchIdentifierChange} />&nbsp;&nbsp;
            <Button style={{ height: '63%',marginTop: '30px', alignSelf: 'center'}} label="" variant="filled" onClick={handleSearch}>
            <SearchIcon />
            </Button>&nbsp;&nbsp;
            <FormControl variant="standard" size="small" style={{ marginTop: '20px', width: '240px' }}>
              <InputLabel htmlFor="Select Purpose of Request">Select Purpose of Request</InputLabel>
              <Select label="Select Purpose of Request" value={selectedPurpose} onChange={(event) => setSelectedPurpose(event.target.value)} >
                <MenuItem value="Care Management">Care Management</MenuItem>
                <MenuItem value="Break the Glass">Break the Glass</MenuItem>
                <MenuItem value="Public Health">Public Health</MenuItem>
                <MenuItem value="Disease Specific HealthCare Research">Disease Specific HealthCare Research</MenuItem>
                <MenuItem value="Self Requested">Self Requested</MenuItem>
              </Select>
            </FormControl>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <TextField variant='standard' size='small' style={{ marginTop: '20px', width: '200px' }} label="Requester Name" defaultValue="" value={requesterName} onChange={(e) => setRequesterName(e.target.value)}/>&nbsp;&nbsp;                    
          </Box>
          <Box mb={2}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Box display="flex" alignItems="center">
                <ControlDateTimePicker label="Health Info From" id={'HealthInfoFrom'} value={healthInfoFrom} onChange={handleHealthInfoFromChange} defaultValue={new Date()} variant="standard"/>&nbsp;&nbsp;
                <Box marginLeft={5} marginRight={5}>
                </Box>
                <ControlDateTimePicker  label="Health Info To" id={'HealthInfoTo'} value={healthInfoTo} onChange={handleHealthInfoToChange} defaultValue={new Date()} />&nbsp;&nbsp;
                <Box marginLeft={5} marginRight={5}> 
                </Box>
              </Box>
            </MuiPickersUtilsProvider>
            </Box>
            <Box mb={2}>
              <FormControl>
                <FormLabel>Health Info Types</FormLabel>
                <FormGroup>
                  <Grid container>
                    {healthInfoTypes.map((type) => (
                      <Grid item key={type.value} xs={12} sm={6} md={4}>
                        <FormControlLabel
                          control={
                            <Checkbox checked={selectedHealthInfoTypes.includes(type.value)} onChange={handleHealthInfoTypeChange} value={type.value}/>
                          } label={type.name}/>
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <div>
              <ControlDateTimePicker variant='standard' label="Consent Expiry" id={'ConsentExpiry'} value={consentExpiry} onChange={handleConsentExpiryChange} defaultValue={new Date()} />&nbsp;&nbsp;
              </div>
            </MuiPickersUtilsProvider>&nbsp;&nbsp;
            </Box>
        </DialogContent>
        <DialogActions>
          <Button variant= 'contained' style={{backgroundColor: 'black', marginRight: '350px'}} onClick={handleSendRequest} color="primary">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    <Dialog  open={openConsentDetailsDialog} onClose={handleCloseConsentIdTab} maxWidth="lg" fullWidth>
    <DialogTitle>Consent Details by ConsentId</DialogTitle>
    <IconButton edge="end" color="inherit" onClick={handleCloseConsentIdTab} aria-label="close" style={{ position: 'absolute', right: '20px', top: '8px' }}>
        <CancelIcon />
      </IconButton>
        <DialogContent>
          {consentDetails && (
            <pre>{JSON.stringify(consentDetails, null, 2)}</pre>
          )}
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </Dialog>
      <DataPullDialog
        open={dataPullDialogOpen}
        onClose={() => setDataPullDialogOpen(false)}
        consentId={selectedConsentRequestDetails?.consentArtefacts?.[0]?.id || ''}
      />
      <Alerts open={isSuccessAlertOpen} message={successAlertMessage} severity="success" onClose={closeAlerts} />
        <Alerts open={isErrorAlertOpen} message={errorAlertMessage} severity="error" onClose={closeAlerts} />
    </div>
    </div>
    </div>
  );
};
export default ConsentDetails;
