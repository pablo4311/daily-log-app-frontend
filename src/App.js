import React, { useState, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import MapBox from "./components/MapBox";
import AppBar from "./components/AppBar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CanvasComponent from "./components/CanvasComponent";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import isEmpty from "./utils/empty";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import {
  SearchBox,
  AddressAutofill,
  useSearchBoxCore,
} from "@mapbox/search-js-react";
import axiosInstance from "./utils/axios";
import Dialog from "./components/Dialog";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const darkTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: green[500],
    },
  },
});

const validationSchema = Yup.object({
  currentLocation: Yup.string()
    .required("Current location is required")
    .min(3, "Location must be at least 3 characters"),
  pickupLocation: Yup.string()
    .required("Pickup location is required")
    .min(3, "Location must be at least 3 characters"),
  dropoffLocation: Yup.string()
    .required("Dropoff location is required")
    .min(3, "Location must be at least 3 characters"),
  lifeCycleUsed: Yup.number()
    .required("Current Cycle Used is required")
    .min(0, "Cycle used cannot be negative")
    .typeError("Current Cycle Used must be a number"),
});

const App = () => {
  const [value, setValue] = useState({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    lifeCycleUsed: null,
  });

  const [loading, setLoading] = useState(false);
  const [totalMile, setTotalMiles] = useState(0);
  const [sheetDay, setSheetDay] = useState(0);
  const [sheetMonth, setSheetMonth] = useState(0);
  const [sheetYear, setSheetYear] = useState(0);

  const [disableViewLogs, setDisableViewLogs] = useState(true);

 

  const [scale, setScale] = useState([0, 0]);
  const [geometry, setGeometry] = useState({});
  const [logsByDaily, setLogsByDaily] = useState([]);
  const [day, setDay] = useState(0);
  const [totalHour, setTotalHour] = useState(24);
  const [showDialogStatus, setShowDialogStatus] = useState(false);
  const [dutyType, setDutyType] = useState([
    {
      key: "off_duty",
      name: "Off Duty",
    },
    {
      key: "sleeper_berth",
      name: "Sleeper Berth",
    },
    {
      key: "driving",
      name: "Driving",
    },
    {
      key: "on_duty",
      name: "On Duty",
    },
  ]);

  const [data, setData] = useState({
    currentLocation: {
      x: null,
      y: null,
    },
    pickupLocation: {
      x: null,
      y: null,
    },
    dropoffLocation: {
      x: null,
      y: null,
    },
    lifeCycleUsed: 34,
  });

  const handleChangeValue = (key) => (e) => {
    setValue({
      ...value,
      [key]: key === "currentCycleUsed" ? e.target.value : e,
    });
    if (key === "currentCycleUsed") {
      setData({ ...data, lifeCycleUsed: parseInt(e.target.value, 10) });
    }
  };

  const handleGenerate = async (values) => {
    setLoading(true);
    axiosInstance
      .post("/api/generate_route/", data) // Add your endpoint here
      .then((response) => {
        if (response.data) {
          setDisableViewLogs(false);

          setTotalMiles(response.data.total_distance_miles);
          setSheetYear(response.data.year);
          setSheetMonth(response.data.month);
          setSheetDay(response.data.day);

          setGeometry({ ...response.data.geometry });
          setDay(response.data.day_count);
          setLogsByDaily(response.data.logs_by_daily);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setLoading(false);
      });
  };

  const handleRetrieve = (key, setFieldValue) => (e) => {
    if (!isEmpty(e)) {
      setFieldValue(key, e.features[0].properties.name)
      setData({
        ...data,
        [key]: {
          x: e.features[0].geometry.coordinates[0],
          y: e.features[0].geometry.coordinates[1],
        },
      });
    }
  };

  const hanldeClear = (key, setFieldValue) => () => {
    setFieldValue(key, "")
  }

  const handleShowDialog = () => {
    setShowDialogStatus(!showDialogStatus);
  };
  const handleDialogClose = (status) => {
    setShowDialogStatus(status);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar />
      <Dialog
        showDialogStatus={showDialogStatus}
        handleDialogClose={handleDialogClose}
        totalHour={totalHour}
        dutyType={dutyType}
        day={day}
        logs={logsByDaily}
        totalMile={totalMile}
        sheetDay={sheetDay}
        sheetMonth={sheetMonth}
        sheetYear={sheetYear}
        value={value}
      />
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MapBox scale={scale} geometry={geometry} data={data} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Item sx={{ p: 4 }}>
            <Formik
              initialValues={value}
              validationSchema={validationSchema}
              onSubmit={handleGenerate}
            >
              {({ setFieldValue, values }) => (
                <Form>
                  <Box sx={{ textAlign: "left", py: 1 }}>
                    <Box sx={{ pb: 1 }}>Current Location</Box>
                    <SearchBox
                      options={{
                        proximity: {
                          lng: -122.431297,
                          lat: 37.773972,
                        },
                      }}
                      placeholder={"Current Location"}
                      onRetrieve={handleRetrieve("currentLocation", setFieldValue)}
                      onClear={hanldeClear("currentLocation", setFieldValue)}
                      value={values.currentLocation}
                      onChange={handleChangeValue("currentLocation")}
                      accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                    />
                    <ErrorMessage
                      name="currentLocation"
                      component="div"
                      style={{ color: "red" }}
                    />
                  </Box>
                  <Box sx={{ textAlign: "left", py: 1 }}>
                    <Box sx={{ pb: 1 }}>Pickup Location</Box>
                    <SearchBox
                      options={{
                        proximity: {
                          lng: -122.431297,
                          lat: 37.773972,
                        },
                      }}
                      placeholder={"Pickup Location"}
                      onRetrieve={handleRetrieve("pickupLocation", setFieldValue)}
                      onClear={hanldeClear("pickupLocation", setFieldValue)}
                      value={values.pickupLocation}
                      onChange={handleChangeValue("pickupLocation")}
                      accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                    />

                    <ErrorMessage
                      name="pickupLocation"
                      component="div"
                      style={{ color: "red" }}
                    />
                  </Box>
                  <Box sx={{ textAlign: "left", py: 1 }}>
                    <Box sx={{ pb: 1 }}>Dropoff Location</Box>
                    <SearchBox
                      options={{
                        proximity: {
                          lng: -122.431297,
                          lat: 37.773972,
                        },
                      }}
                      placeholder={"Dropoff Location"}
                      onRetrieve={handleRetrieve("dropoffLocation", setFieldValue)}
                      onClear={hanldeClear("dropoffLocation", setFieldValue)}
                      value={values.dropoffLocation}
                      onChange={handleChangeValue("dropoffLocation")}
                      accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                    />

                    <ErrorMessage
                      name="dropoffLocation"
                      component="div"
                      style={{ color: "red" }}
                    />
                  </Box>
                  <Box sx={{ textAlign: "left", py: 1 }}>
                  <Field
                    name="lifeCycleUsed"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="outlined-basic4"
                        label="Current Cycle Used (Hrs)"
                        type="number"
                        variant="outlined"
                        sx={{ width: "100%", my: 2 }}
                      />
                    )}
                  />
                  <ErrorMessage
                    name="lifeCycleUsed"
                    component="div"
                    style={{ color: "red" }}
                  />
                  </Box>
                  <Button
                    variant="contained"
                    sx={{ width: "100%", my: 2, color: "white" }}
                    loading={loading}
                    type="submit"
                  >
                    Generate Route
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ width: "100%", my: 2, color: "white" }}
                    onClick={handleShowDialog}
                    disabled={disableViewLogs}
                  >
                    View Logs
                  </Button>
                </Form>
              )}
            </Formik>
          </Item>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default App;
