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
import DocumentDiss from "./DocumentDiss";
// const daysToMilliseconds = days => {
//   return days * 24 * 60 * 60 * 1000;
// };

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
  const [expanded, setExpanded] = React.useState(false);

  const topologicalSort = resources => {
    const visited = new Set();
    const result = [];

    function visit(resource, index) {
      if (!visited.has(index)) {
        visited.add(index);

        for (const dependencyIndex of resource.resDepencies) {
          visit(resources[dependencyIndex], dependencyIndex);
        }

        result.push(resource);
      }
    }

    for (const [index, resource] of resources.entries()) {
      visit(resource, index);
    }

    return result;
  };

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
          let resources = [];
          for (let docChange of docChanges) {
            const { resource, dependencies, end } = docChange.doc.data();

            const resIndex = resources.findIndex(res => res.resource === resource);
            if (resIndex !== -1) {
              resources[resIndex].itemIds.push(docChange.doc.id);
              resources[resIndex].num += 1;
              resources[resIndex].endAvg += end.toDate().getTime() / 1000;
              resources[resIndex].dependencies.concat(dependencies ? dependencies?.split(",") : []);
            } else {
              resources.push({
                resource,
                itemIds: [docChange.doc.id],
                endAvg: end.toDate().getTime() / 1000,
                num: 1,
                dependencies: dependencies ? dependencies.split(",") : []
              });
            }
          }
          for (let resource of resources) {
            resource.endAvg = resource.endAvg / resource.num;
            resource.resDepencies = [];
            for (let dependency of resource.dependencies) {
              for (let rIdex = 0; rIdex < resources.length; rIdex++) {
                if (resources[rIdex].itemIds.includes(dependency)) {
                  resource.resDepencies.push(rIdex);
                }
              }
            }
          }

          resources.sort((a, b) => {
            return a.endAvg < b.endAvg ? 1 : -1;
          });
          resources = topologicalSort(resources);

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
          rows.sort((a, b) => {
            return a[4] < b[4] ? 1 : -1;
          });
          rows.sort((a, b) => {
            const indexA = resources.findIndex(res => res.resource === a[2]);
            const indexB = resources.findIndex(res => res.resource === b[2]);
            return indexA < indexB ? 1 : -1;
          });

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
  };

  const handleSave = async () => {
    try {
      setOpen(false);
      let _dependencies = "";
      dependencies.forEach(element => {
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
    // let rectGroups = svg.getElementsByTagName("g")[5]?.getElementsByTagName("rect");
    if (!ganttGroups) return;
    for (let i = 0; i < ganttGroups.length; i++) {
      if (ganttGroups[i].getElementsByTagName("tspan").length > 0) continue;
      const text = ganttGroups[i].innerHTML.replace(/<[^>]+>/g, "");
      let s2 = [];
      let s1 = [];
      ganttGroups[i].setAttribute("x", "0");
      ganttGroups[i].setAttribute("dx", "0");
      ganttGroups[i].removeAttribute("style");
      if (text.length > 48) {
        let middle = Math.floor(text.length / 2);
        let before = text.lastIndexOf(" ", middle);
        let after = text.indexOf(" ", middle + 1);
        if (middle - before < after - middle) {
          middle = before;
        } else {
          middle = after;
        }
        s1 = text.substr(0, middle);
        s2 = text.substr(middle + 1);
        const dx = s1.length * 0.46;

        ganttGroups[i].innerHTML = `<tspan dy="-0.5em">${s1.trim()}</tspan><tspan  x="0" dy="1em">${s2}</tspan>`;
      }
    }
  };
  setInterval(() => {
    let container = document.getElementById("chart_div");
    if (container) {
      let svg = container.getElementsByTagName("svg")[0];
      if (!svg) return;
      redrawsvg(svg);
    }
  }, 100);
  const options = {
    gantt: {
      sortTasks: false
    }
  };

  return (
    <>
      {dt && (
        <div>
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
            style={{
              marginLeft: "30px",
              marginRight: "19px",
              width: "97%",
              height: "100vh",
              overflow: "hidden",
              overflowX: "hidden",
              overflowY: "auto"
            }}
          >
            <DocumentDiss />
            {email === "oneweb@umich.edu" && (
              <Button variant="contained" onClick={handleAddNew}>
                {" "}
                Add new item{" "}
              </Button>
            )}
            <h2>Dissertation Gantt Chart : </h2>
            <div id="chart_div">
              <Chart
                chartType="Gantt"
                data={dt}
                height={1600}
                options={options}
                chartEvents={[
                  {
                    eventName: "select",
                    callback: e => {
                      if (email !== "oneweb@umich.edu") return;
                      handleClickOpen(dt[e.chartWrapper.getChart().getSelection()[0].row + 1]);
                    }
                  }
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DissertationGantt;
