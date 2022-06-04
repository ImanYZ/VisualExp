import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useEffect, useState } from "react";

import { NodeType } from "../src/knowledgeTypes";
import NodeTypeIcon from "./NodeTypeIcon";

type Props = {
  nodeTypes: string[];
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

const NodeTypesAutocomplete: FC<Props> = ({ onNodesTypeChange, nodeTypes }) => {
  const [value, setValue] = useState<string[]>([]);
  const [hasBeenCleared, setHasBeenCleared] = useState(false);

  const handleChange = (_: React.SyntheticEvent, newValue: string[]) => {
    if (newValue.length === 0) {
      setHasBeenCleared(true);
    }
    setValue(newValue);
    onNodesTypeChange(newValue);
  };

  useEffect(() => {
    if (value.length === 0 && nodeTypes.length > 0 && !hasBeenCleared) {
      setValue(nodeTypes);
    }
  }, [nodeTypes, hasBeenCleared, value.length]);

  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      renderOption={(props, option) => (
        <li {...props}>
          {<NodeTypeIcon sx={{ mr: 1 }} nodeType={option as NodeType} />}
          {option}
        </li>
      )}
      getOptionLabel={option => option}
      onChange={handleChange}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option, index: number) => (
          <Chip
            icon={<NodeTypeIcon sx={{ color: "red" }} color="primary" nodeType={option as NodeType} />}
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      renderInput={params => <TextField {...params} variant="standard" label="Node type" />}
    />
  );
};
export default NodeTypesAutocomplete;
