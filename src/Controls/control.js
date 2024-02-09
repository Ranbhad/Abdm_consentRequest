import React from 'react';
import { TextField,FormControl,InputLabel,Select,MenuItem, Autocomplete, Button } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
export const ControlTextField = (props) => {


    return (
        <>
            <TextField
                label={props.label}
                id={props.id}
                margin="normal"
                size={props.size}
                onChange={props.onChange}
                disabled={props.disabled}
                error={props.error}
                helperText={props.helperText}
                autoComplete="new-password"
                width={"60%"}
                value ={props.value}
                onBlur={props?.onBlur}
                variant={props.variant}
                inputProps={props.inputProps}
            />
        </>
    )
}

export const ControlSelect =(props)=>{

    return(
        <FormControl sx={{ m: 1, minWidth: 120,marginTop:'16px'}} size="small">
      <InputLabel id={props.id} >{props.label}</InputLabel>
      <Select
        labelId={props.id}
        id="demo-select-small"
        value={props.value}
        label={props.label}        
        onChange={props.onChange}
        
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {props.options.map((option) =>{return <MenuItem value={option}>{option}</MenuItem>})}
      </Select>
    </FormControl>
    )
}
export const ControlDatePicker =(props) =>{
    return (
        <>
            <FormControl  sx={{ m: 1, minWidth: 120, marginTop: '16px',width:'25%' }} size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs} size="small" label={props.label}>
                    <DatePicker format={props.format?"YYYY-MM-DD":"DD-MM-YYYY"} variant={props.variant} size="small"  value={(props.value==null || props.value==undefined || props.value=='')? dayjs(new Date().toLocaleDateString()):dayjs(props.value)} label={props.label} onChange={(newvalue) =>props.onChange(props.label,newvalue)} disabled={props.readonly}
                        slotProps={{ textField: { size: "small" } }}
                    />
                </LocalizationProvider>
            </FormControl>
        </>
    )

}
export const ControlNumber =(props) =>{
    return (
        <>
            <TextField
                type="number"
                label={props.label}
                id={props.id}
                margin="normal"
                size={props.size}
                onChange={props.onChange}
                disabled={props.disabled}
                error={props.error}
                helperText={props.helperText}
                autoComplete="new-password"
                style={{width:props.width}}
                value= {props.value}
            />
        </>
    )
}
export const ControlAutoComplete = (props) =>{
    return (
        <>
        <Autocomplete options={props.options} value={props.value}  autoHighlight
            renderInput={(params) => <TextField {...params} label={props.label} id={props.id} size="small" width={"60%"}/>} 
            onInputChange={(event, newInputValue) => {
               props.onAutoCompleteChange(props.id,newInputValue)
              }}
            sx={{width:"50%",marginLeft:props.hasMarginLeft?'18%':'0%'}}
        />
        </>
    )
}


export const ControlButton = (props) => {
  return (
    <Button
      variant={props.variant || "contained"}
      color={props.color || "primary"}
      onClick={props.onClick}
      disabled={props.disabled}
      sx={{ marginTop: '16px' }}
    >
      {props.label}
    </Button>
  );
};

export const ControlDateTimePicker = (props) =>{
    return (
        <FormControl sx={{ m: 1, minWidth: 120, marginTop: '16px' }} size="small">
        <LocalizationProvider dateAdapter={AdapterDayjs} size="small" label={props.label}>
            <DateTimePicker format="DD-MM-YYYY hh:mm" size="small"  value={(props.value==null || props.value==undefined||props.value=='')? dayjs(props.defaultValue):dayjs(props.value)} label={props.label} onChange={(newvalue) =>props.onChange(props.id,newvalue)} disabled={props.readonly}
                slotProps={{ textField: { size: "small", width:'100%' } }}
            />
        </LocalizationProvider>
    </FormControl>
    )
}

export const handleDateTimeChange = (name, newValue, stateSetter) => {
    let hours = newValue.$H < 10 ? '0' + newValue.$H : newValue.$H;
    let minutes = newValue.$m < 10 ? '0' + newValue.$m : newValue.$m;
    let formattedDate = `${newValue.toDate().toISOString().slice(0, -1)}Z`;
  
    stateSetter((oldValues) => ({
      ...oldValues,
      [name]: formattedDate,
    }));
  };

  export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  export const generateApiHeaders = () => ({
    'X-CM-ID': 'sbx',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'apiKey': 'ehrn_key',
    'X-HIU-ID': 'ehrn_mar16_hiu',
    'X-HIP-ID': 'ehrn_aug31_hip',
    'Access-Control-Allow-Origin': '*',
  });
