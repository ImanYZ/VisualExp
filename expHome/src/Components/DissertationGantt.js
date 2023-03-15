import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { Chart } from "react-google-charts";
import Button from "@mui/material/Button";
import { firebaseState, emailState } from "../store/AuthAtoms";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

const daysToMilliseconds = days => {
  return days * 24 * 60 * 60 * 1000;
};

const columns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "string", label: "Resource" },
  { type: "date", label: "Start Date" },
  { type: "date", label: "End Date" },
  { type: "number", label: "Duration" },
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" }
];

const DissertationGantt = () => {
  const firebase = useRecoilValue(firebaseState);
  const [dt, setDt] = useState(false);
  const [open, setOpen] = React.useState(false);
  const email = useRecoilValue(emailState);
  const [name, setName] = useState("");
  const [resource, setResource] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [completed, setCompleted] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const drawChart = async () => {
      if (firebase) {
        // const dissertationTimeLineRef = firebase.db.collection("dissertationTimeLine").doc();
        // await dissertationTimeLineRef.set({
        //   name: "Authoring Between-instructor Experiment Paper",
        //   resource: "Fall-back Plan",
        //   start: new Date("04/01/2023"),
        //   end: new Date("06/30/2023"),
        //   duration: null,
        //   completed: 0,
        //   dependencies: "zzP2i9zo9C4xzyH2wpER"
        // });
        const dissertationTimeLineQuery = firebase.db.collection("dissertationTimeLine");
        const dissertationTimeLineSnapshot = dissertationTimeLineQuery.onSnapshot(snapshot => {
          const docChanges = snapshot.docChanges();
          let rows = [];
          for (let docChange of docChanges) {
            const { name, resource, start, end, duration, completed, dependencies } = docChange.doc.data();
            rows.push([
              docChange.doc.id,
              name,
              resource,
              start.toDate(),
              end.toDate(),
              duration,
              completed,
              dependencies
            ]);
          }
          // rows = rows.filter(row => row[0] !== "zzP2i9zo9C4xzyH2wpER");
          setDt([columns, ...rows]);
        });
        //   const rows = [
        //   ["Research", "Find sources", null, new Date(2015, 0, 1), new Date(2015, 0, 5), null, 100, null],
        //   ["Write", "Write paper", "write", null, new Date(2015, 0, 9), daysToMilliseconds(3), 25, "Research,Outline"],
        //   ["Cite", "Create bibliography", "write", null, new Date(2015, 0, 7), daysToMilliseconds(1), 20, "Research"],
        //   ["Complete", "Hand in paper", "complete", null, new Date(2015, 0, 10), daysToMilliseconds(1), 0, "Cite,Write"],
        //   ["Outline", "Outline paper", "write", null, new Date(2015, 0, 6), daysToMilliseconds(1), 100, "Research"]
        // ];
        return () => {
          dissertationTimeLineSnapshot();
        };
      }
    };
    return drawChart();
  }, [firebase, open]);

  const handleClickOpen = row => {
    console.log("row :: :: :: ", row);
    const dependencies = row[7];
    const _dependencies = [];
    dependencies?.split(",").forEach(element => {
      if (dt.find(d => d[0] === element)) {
        _dependencies.push(dt.find(d => d[0] === element)[1]);
      }
    });

    setSelectedDoc(row[0] || "");
    setName(row[1] || "");
    setResource(row[2] || "");
    setCompleted(row[6] || 0);
    setEnd(row[4] || new Date());
    setStart(row[3] || new Date());

    setDependencies(_dependencies);

    setOpen(true);
    console.log("dt", dt);
  };

  const handleSave = async () => {
    try {
      setOpen(false);
      let _dependencies = "";
      dependencies.forEach(element => {
        console.log(element);
        _dependencies += !dt.find(d => d[1] === element) ? "" : dt.find(d => d[1] === element)[0] + ",";
      });
      if (selectedDoc) {
        const dissertationRef = firebase.db.collection("dissertationTimeLine").doc(selectedDoc);
        await dissertationRef.update({
          name,
          resource,
          start,
          end,
          completed,
          dependencies: _dependencies.trim().substring(0, _dependencies.trim().length - 1)
        });
      } else {
        const dissertationRef = firebase.db.collection("dissertationTimeLine").doc();
        await dissertationRef.set({
          name,
          resource,
          start,
          end,
          completed,
          dependencies: _dependencies.trim().substring(0, _dependencies.trim().length - 1)
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDelete = async () => {
    try {
      if (selectedDoc) {
        const dissertationRef = firebase.db.collection("dissertationTimeLine").doc(selectedDoc);
        await dissertationRef.delete();
      }
      setOpen(false);
      setDeleteDialogOpen(false);
    } catch (error) {}
  };
  const handleAddNew = () => {
    setSelectedDoc("");
    setName("");
    setResource("");
    setCompleted(0);
    setEnd(new Date());
    setStart(new Date());
    setDependencies([]);
    setOpen(true);
  };
  const redrawsvg = svg => {
    let ganttGroups = svg.getElementsByTagName("g")[7]?.getElementsByTagName("text");
    let rectGroups = svg.getElementsByTagName("g")[5]?.getElementsByTagName("rect");
    for (let i = 0; i < ganttGroups.length; i++) {
      let x = rectGroups[i].getAttribute("x") - rectGroups[i].getAttribute("width") / 2;
      if (x < 300) {
        x = x + 900;
      } else if (x > 1000) {
        x = x - 500;
      }
      ganttGroups[i].setAttribute("fill", "#1c2e12");
      ganttGroups[i].setAttribute("transform", "translate(" + x + ")");
    }
  };
  setTimeout(() => {
    let container = document.getElementById("chart_div");
    if (container) {
      let svg = container.getElementsByTagName("svg")[0];
      svg.addEventListener("mousemove", () => {
        console.log("::: ::: svg ::: :: ", svg);
        redrawsvg(svg);
      });
    }
  }, 1000);

  return (
    <>
      {email === "oneweb@umich.edu" && (
        <Button variant="contained" onClick={handleAddNew}>
          {" "}
          Add new item{" "}
        </Button>
      )}

      {dt && (
        <div
          style={{
            width: "100%",
            marginLeft: "14px",
            height: "100vh",
            overflowX: "hidden",
            overflowY: "auto"
          }}
        >
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <Box
                component="form"
                sx={{
                  "& > :not(style)": { m: 1, width: "25ch" }
                }}
                noValidate
                autoComplete="off"
              >
                <TextField
                  id="outlined-basic"
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={e => {
                    setName(e.currentTarget.value);
                  }}
                />
                <TextField
                  id="outlined-basic"
                  label="Resource"
                  variant="outlined"
                  value={resource}
                  onChange={e => {
                    setResource(e.currentTarget.value);
                  }}
                />
                <FormControl>
                  <InputLabel>Dependencies</InputLabel>
                  <Select
                    value={dependencies}
                    multiple
                    onChange={e => {
                      setDependencies(e.target.value);
                    }}
                    sx={{ width: "100%", color: "black", border: "1px", borderColor: "white" }}
                  >
                    {dt
                      .slice()
                      .splice(1)
                      ?.map(
                        row =>
                          row[0] &&
                          row[1] && (
                            <MenuItem key={row[0]} value={row[1]} sx={{ display: "center" }}>
                              {row[1]}
                            </MenuItem>
                          )
                      )}
                  </Select>
                </FormControl>

                <TextField
                  id="outlined-basic"
                  label="Percent Done"
                  variant="outlined"
                  value={completed}
                  onChange={e => {
                    setCompleted(e.currentTarget.value);
                  }}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <div className="ActivityDateTimePicker">
                    <DatePicker
                      label="Start Date"
                      value={start}
                      onChange={newValue => {
                        setStart(newValue);
                      }}
                      renderInput={params => <TextField {...params} />}
                    />
                  </div>
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <div className="ActivityDateTimePicker">
                    <DatePicker
                      label="End Date"
                      value={end}
                      onChange={newValue => {
                        setEnd(newValue);
                      }}
                      renderInput={params => <TextField {...params} />}
                    />
                  </div>
                </LocalizationProvider>
              </Box>
              <IconButton
                color="error"
                aria-label="delete"
                onClick={() => {
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>

              <Dialog
                open={deleteDialogOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogActions>
                  <Button onClick={handleDelete}>Confirm</Button>
                  <Button
                    onClick={() => {
                      setDeleteDialogOpen(false);
                    }}
                    autoFocus
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={handleClose} autoFocus>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <div
            id="chart_div"
            style={{ marginLeft: "19px", marginRight: "19px", width: "97%", height: "1600px", overflow: "hidden" }}
          >
            <Chart
              chartType="Gantt"
              data={dt}
              height={1600}
              legendToggle
              chartEvents={[
                {
                  eventName: "ready",
                  callback: async e => {
                    e.chartWrapper.setOption("staticPosition", true);
                    let container = document.getElementById("chart_div");
                    let chart = e.chartWrapper.getChart();
                    window.google.visualization.events.addListener(chart, "ready", () => {
                      let svg = container.getElementsByTagName("svg")[0];
                      redrawsvg(svg);
                    });
                  }
                },
                {
                  eventName: "ready",
                  callback: async e => {
                    e.chartWrapper.setOption("staticPosition", true);
                    let container = document.getElementById("chart_div");
                    let svg = container.getElementsByTagName("svg")[0];
                    svg.addEventListener("mouseleave", () => {
                      console.log("::: ::: svg ::: :: ", svg);
                      redrawsvg(svg);
                    });
                  }
                },
                {
                  eventName: "select",
                  callback: e => {
                    if (email !== "oneweb@umich.edu") return;
                    console.log(":: :: e.chartWrapper.getChart().getSelection() :: :: ", e.chartWrapper.getChart());
                    handleClickOpen(dt[e.chartWrapper.getChart().getSelection()[0].row + 1]);
                  }
                }
              ]}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DissertationGantt;
