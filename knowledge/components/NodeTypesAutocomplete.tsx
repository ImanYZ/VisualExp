import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC } from "react";

import { NodeType } from "../src/knowledgeTypes";
import NodeTypeIcon from "./NodeTypeIcon";

type Props = {
  value: string[];
  onNodesTypeChange: (newValues: string[]) => void;
};

const options: NodeType[] = [
  NodeType.Advertisement,
  NodeType.Code,
  NodeType.Concept,
  NodeType.Idea,
  NodeType.News,
  NodeType.Private,
  NodeType.Profile,
  NodeType.Question,
  NodeType.Reference,
  NodeType.Relation,
  NodeType.Sequel,
  NodeType.Tag
];

const NodeTypesAutocomplete: FC<Props> = ({ onNodesTypeChange }) => {
  //   const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
  //     if (event && query.trim().length > 0) {
  //       setText(query);
  //     }
  //   };

  const handleChange = (
    _: React.SyntheticEvent,
    newValue: (
      | string
      | {
          name: string;
          logoUrl?: string | undefined;
        }
    )[]
  ) => {
    onNodesTypeChange(newValue.map(el => (typeof el === "string" ? el : el.name)));
  };

  return (
    <Autocomplete
      multiple
      options={options}
      freeSolo
      //   onInputChange={handleQueryChange}
      renderOption={(props, option) => (
        <li {...props}>
          {<NodeTypeIcon sx={{ mr: 1 }} nodeType={option} />}
          {option}
        </li>
      )}
      getOptionLabel={option => option}
      onChange={handleChange}
      // value={value}
      renderTags={(value: readonly NodeType[], getTagProps) =>
        value.map((option, index: number) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
        ))
      }
      renderInput={params => <TextField {...params} variant="standard" label="Node type" />}
    />
  );
};
export default NodeTypesAutocomplete;
