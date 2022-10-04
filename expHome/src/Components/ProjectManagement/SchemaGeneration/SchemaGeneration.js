import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";

// mui imports
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
// import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { QueryBuilder } from "react-querybuilder";
import Button from "@mui/material/Button";
const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

// eslint-disable-next-line no-empty-pattern
export const SchemaGeneration = ({}) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
  const [phrases, setSelectedPhrases] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState({});
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const email = useRecoilValue(emailState);
  const [schemasBoolean, setSchemasBoolean] = useState([]);
  const [query, setQuery] = useState({
    combinator: "and",
    rules: []
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (selectedPhrase) {
      const schemas = [];
      console.log("selectedPhrase", selectedPhrase);
      const schemaDoc = await firebase.db.collection("booleanScratch").where("phrase", "==", selectedPhrase).get();
      for (let schDoc of schemaDoc.docs) {
        const data = schDoc.data();
        console.log("booleanScratch data", data);
        schemas.push(data);
      }
      console.log("schemas", schemas);
      setSchemasBoolean(schemas);
    }
  }, [firebase, selectedPhrase]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const passagesDocs = await firebase.db.collection("passages").get();
    // const passageData = passagesDoc.data();
    let passages = [];
    passages = passagesDocs.docs
      .map(x => {
        const data = x.data();
        if (data?.phrases?.length > 0) {
          return { ...data, id: x.id };
        }
        return null;
      })
      .filter(x => x !== null);
    console.log({ passages });
    setPassages(passages);
    setSelectedPassage(passages[0]);
    const phrases = passages[0].phrases;
    setSelectedPhrases([...phrases]);
    setSelectedPhrase(phrases[0]);
  }, [firebase.db, fullname]);

  const handlePassageChange = event => {
    const title = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === title);
    const passage = allPassages[fIndex];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
  };
  const handleSubmitSearch = () => {
    console.log({ query });
    const newbooleanScratch = {
      email,
      fullname,
      schema: query,
      createdAt: new Date(),
      phrase: selectedPhrase,
      passage: selectedPassage.title,
      upvotes: 0,
      downvotes: 0
    };
    const schemaGenerationRef = firebase.db.collection("booleanScratch").doc();
    schemaGenerationRef
      .set(newbooleanScratch)
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch(error => {
        console.error("Error writing document: ", error);
      });
  };

  if (passages.length <= 0) return null;
  console.log("schemasB", schemasBoolean);
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
              onChange={handlePassageChange}
            >
              {passages &&
                passages?.length > 0 &&
                passages?.map(doc => (
                  <MenuItem key={doc?.id} value={doc?.title}>
                    {doc?.title}
                  </MenuItem>
                ))}
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
              onChange={(_, value) => setSelectedPhrase(value || null)}
              renderInput={params => <TextField {...params} value={selectedPhrase} />}
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

          <QueryBuilder
            fields={[]}
            translations={{
              addRule: {
                label: "+keyword",
                title: "Add rule"
              }
            }}
            operators={[
              { name: "", label: "------" },
              { name: "not", label: "NOT" }
            ]}
            query={query}
            onQueryChange={q => setQuery(q)}
          />

          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            <Button onClick={handleSubmitSearch}>Submit</Button>
            <Button onClick={handleSubmitSearch}>{`Search >>`}</Button>
          </div>
        </Item>
        <Typography variant="h6" component="div" align="left">
          Previous Proposals:
        </Typography>

        <Paper>
          {schemasBoolean?.length > 0 &&
            schemasBoolean.map(queryE => {
              return (
                <div style={{ height: "95%" }}>
                  <QueryBuilder
                    fields={[]}
                    translations={{
                      addRule: {
                        label: "+keyword",
                        title: "Add rule"
                      }
                    }}
                    operators={[
                      { name: "", label: "-----" },
                      { name: "not", label: "NOT" }
                    ]}
                    query={queryE.schema}
                  />
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Button onClick={() => {}}>{queryE.upvotes}👍</Button>
                      <Button onClick={() => {}}>{queryE.downvotes}👎</Button>
                    </div>

                    <Button onClick={handleSubmitSearch} >{`Search >>`}</Button>
                  </div>
                </div>
              );
            })}
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Item>We found that schema in the followings:</Item>
      </Grid>
    </Grid>
  );
};

export default SchemaGeneration;
