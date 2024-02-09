import React, { useState, useEffect } from 'react';
import {Dialog,DialogTitle,DialogContent, DialogActions,Button,Box,} from '@mui/material';
import { MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { ControlDateTimePicker, handleDateTimeChange, generateUUID } from '../Controls/control';

const DataPullDialog = ({ open, onClose, consentId }) => {
  const [responseData, setResponseData] = useState('');
  const [healthInfoFrom, setHealthInfoFrom] = useState(null);
  const [healthInfoTo, setHealthInfoTo] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleHealthInfoFromChange = (name, newValue) => {
    handleDateTimeChange(name, newValue, setHealthInfoFrom);
  };
  const handleHealthInfoToChange = (name, newValue) => {
    handleDateTimeChange(name, newValue, setHealthInfoTo);
  };

  const handlePullData = async () => {
    try {
      const requestData = {
        requestId: generateUUID(),
        timestamp: new Date().toISOString(),
        hiRequest: {
          consent: {
            id: consentId,
          },
          dateRange: {
            from: healthInfoFrom['HealthInfoFrom'],
            to:  healthInfoTo['HealthInfoTo'],
          },
          dataPushUrl: 'https://dev.abdmc.healthekare.com/v0.5/health-information/transfer',
        },
      };

      console.log('Sending Body:', JSON.stringify(requestData, null, 2));

      const response = await fetch('https://dev.abdmc.healthekare.com/ehrn/abdmc/v1/health-information/cm/request', {
        method: 'POST',
        headers: {
          'X-CM-ID': 'sbx',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': 'ehrn_key',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      setResponseData(JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.error('Error pulling data:', error.message);
    }
  };

  const handleDateRangeSelect = () => {
  
      setDatePickerOpen(false);
      handlePullData();

  };
  

  useEffect(() => {
    if (open) {
      setDatePickerOpen(true);
    }
  }, [open]);

  return (
    <Dialog open={datePickerOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Date Range</DialogTitle>
      <DialogContent>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Box display="flex" alignItems="center">
                <ControlDateTimePicker label="Start Date" id={'HealthInfoFrom'} value={healthInfoFrom} onChange={handleHealthInfoFromChange} defaultValue={new Date()} variant="standard"/>&nbsp;&nbsp;
                <Box marginLeft={5} marginRight={5}>
                </Box>
                <ControlDateTimePicker  label="End Date" id={'HealthInfoTo'} value={healthInfoTo} onChange={handleHealthInfoToChange} defaultValue={new Date()} />&nbsp;&nbsp;
                <Box marginLeft={5} marginRight={5}> 
                </Box>
              </Box>
            </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleDateRangeSelect} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataPullDialog;
