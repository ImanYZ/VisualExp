import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState } from "../../../store/AuthAtoms";

// mui imports
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import "./SchemaGeneration.css";

const initialSchema = {
  ands: ["and1", "and2"],
  ors: ["or1", "or2"],
  nots: ["not1", "not2"]
};

const temp_schema = [
  {
    combinator: "OR",
    keyWords: ["prey", "mouse"]
  },
  {
    combinator: "AND",
    keyWords: ["and", "and"]
  },
  {
    combinator: "NOT",
    operator: "OR",
    keyWords: ["skull", "crani"]
  }
];

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

// eslint-disable-next-line no-empty-pattern
export const SchemaGeneration = ({ }) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
  const [phrases, setSelectedPhrases] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState({});
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [schema, setSchema] = useState(initialSchema);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const passagesDocs = await firebase.db.collection("passages").get();
    // const passageData = passagesDoc.data();
    let passages = [];
    passages = passagesDocs.docs.map(x => {
      const data = x.data();
      if (data?.phrases?.length > 0) {
        return { ...data, id: x.id };
      }
      return null;
    }).filter(x => x !== null)
    console.log({ passages })
    setPassages(passages);
    setSelectedPassage(passages[0]);
    const phrases = passages[0].phrases;
    setSelectedPhrases([...phrases]);
    setSelectedPhrase(phrases[0]);
  }, [firebase.db, fullname])

  const handlePassageChange = (event) => {
    const title = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === title);
    const passage = allPassages[fIndex];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
  }

  const handlePhraseChange = (event) => {
    const phrase = event.target.value;
    const allPhrases = [...phrases];
    const fIndex = allPhrases.findIndex(i => i === phrase);
    const selectedPhrase = allPhrases[fIndex];
    setSelectedPhrase(selectedPhrase);
  }

  const onAddAnd = () => {
    const allSchema = { ...schema };
    allSchema.ands.push("and");
    setSchema(allSchema)
  }

  const onAddOR = () => {
    const allSchema = { ...schema };
    allSchema.ors.push("or");
    setSchema(allSchema)
  }

  const onAddNot = () => {
    const allSchema = { ...schema };
    allSchema.nots.push("not");
    setSchema(allSchema)
  }

  const renderOperators = ({ op, not }) => {
    if (op && op?.keyWords && op?.keyWords?.length > 0) {
      return (
        <>
          {not && <span>not</span>}
          {op.keyWords.map((x, index) => {
            return (
              <div key={index}>
                <input value={x} />
                {op.keyWords.length !== (index + 1) && <span>{op?.combinator?.toLowerCase()}</span>}
              </div>
            );
          })
          }
        </>
      );
    }
    return null;
  };

  if (passages.length <= 0) return null;

  console.log({ selectedPhrase });

  return (
    <Grid container spacing={2} sx={{ background: "#e2e2e2" }}>
      <Grid item xs={6}>
        <Item>
          <Box sx={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
            <Typography variant="h6" component="div" align="left">
              Passage
            </Typography>

            <Select
              id="demo-simple-select-helper"
              value={selectedPassage && selectedPassage?.title ? selectedPassage?.title : passages[0]?.title}
              onChange={handlePassageChange}>
              {passages &&
                passages?.length > 0 &&
                passages?.map(doc => <MenuItem key={doc?.id} value={doc?.title}>{doc?.title}</MenuItem>)}
            </Select>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
            <Typography variant="h6" component="div" align="left">
              Key Phrase
            </Typography>

            <Autocomplete
              id="key-phrase"
              value={selectedPhrase}
              options={phrases}
              onChange={(_, value) => handlePhraseChange(value || null)}
              renderInput={params => (
                <TextField {...params} value={selectedPhrase} />
              )}
              getOptionLabel={phrase => (phrase ? phrase : "")}
              renderOption={(props, phrase) => (
                <li key={phrase} {...props}>
                  {phrase}
                </li>
              )}
              isOptionEqualToValue={(phrase, value) => phrase === value}
              fullWidth
              sx={{ mb: "16px" }}
            />
          </Box>

          <div>
            <button onClick={onAddAnd}>and</button>
            <button onClick={onAddOR}>or</button>
            <button onClick={onAddNot}>not</button>

            {temp_schema.map((op, index) => {
              if (op.combinator === "OR" || op.combinator === "AND") {
                return renderOperators({ op, not: false });
              } else if (op.combinator === "NOT") {
                return renderOperators({
                  not: true,
                  op: {
                    combinator: op.operator,
                    keyWords: op.keyWords
                  }
                });
              }
              return null;
            })}

            <div>
              {schema.ors.map((x, index) => (
                <>
                  <input value={x} />
                  {schema.ors.length !== (index + 1) && <span>or</span>}
                </>
              ))}
              {/* <input /> */}
            </div>

            <div>
              {schema.ands.map((x, index) => (
                <>
                  <input value={x} />
                  {schema.ands.length !== (index + 1) && <span>and</span>}
                </>
              ))}
              {/* <input /> */}
            </div>

            <div>
              <span>not</span>
              {schema.nots.map((x, index) => (
                <>
                  <input value={x} />
                  {schema.nots.length !== (index + 1) && <span>or</span>}
                </>
              ))}
              {/* <input /> */}
            </div>


            <div>
              {/* <Button
                sx={{ borderRadius: 10 }}
                variant="contained"
                startIcon={<SaveIcon />}
              >
                Save
              </Button> */}
              {/* <IconButton size="large"> */}
              <ArrowLeftIcon style={{ fontSize: '6.1875rem', color: '4DA14C' }} />
              <ArrowRightIcon style={{ fontSize: '6.1875rem', color: '4DA14C' }} />

              {/* </IconButton> */}
            </div>

            {/* <div>
              <input />
              <span>and</span>
              <input />
            </div>

            <div>
              <span>not</span>
              <input />
              <span>or</span>
              <input />
            </div>

            <div>
              <a className="more-skewed-right" href="#">
                <span>MORE LONGER TEXT</span>
              </a>
            </div>

            <div>
              <a className="more-skewed-left" href="#">
                <span>MORE LONGER TEXT</span>
              </a>
            </div> */}

          </div>
        </Item>
      </Grid>
      <Grid item xs={6}>
        <Item>xs=4</Item>
      </Grid>
    </Grid>
  );
};

export default SchemaGeneration;
