import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Chip from "@mui/material/Chip";
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import Downshift from "downshift";

const useStyles = makeStyles(() => ({
  inputChip: {
    '& .MuiOutlinedInput-root': {
      display: 'block',
    }
  },
  innerChip: {
    margin: '15px 10px 0px 0'
  }
}));

const ChipInput = ({ ...props }) => {
  const classes = useStyles();
  const { selectedTags, placeholder, tags, readOnly, itemId, ...other } = props;
  const [inputValue, setInputValue] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState([]);

  useEffect(() => {
    setSelectedItem(tags);
  }, [tags]);

  

  const handleKeyDown = event => {
    if (event.key === "Enter") {
      let newSelectedItem = [...selectedItem];
      const duplicatedValues = newSelectedItem.indexOf(event.target.value.trim());

      if (duplicatedValues !== -1) {
        setInputValue("");
        return;
      }
      if (!event.target.value.replace(/\s/g, "").length) return;
      const altrs = event.target.value
        .split(" ")
        .map(x => x.trim())
        .filter(x => x !== "");
      newSelectedItem = [...newSelectedItem, ...altrs];
      setSelectedItem(newSelectedItem);
      selectedTags(newSelectedItem,itemId);
      setInputValue("");
    }
    if (selectedItem.length && !inputValue.length && event.key === "Backspace") {
      setSelectedItem(selectedItem.slice(0, selectedItem.length - 1));
      selectedTags(selectedItem.slice(0, selectedItem.length - 1),itemId);
    }
  };

  const handleChange = item => {
    let newSelectedItem = [...selectedItem];
    if (newSelectedItem.indexOf(item) === -1) {
      newSelectedItem = [...newSelectedItem, item];
    }
    setInputValue("");
    setSelectedItem(newSelectedItem);
    selectedTags(newSelectedItem,itemId);
  };

  const handleDelete = item => () => {
    const newSelectedItem = [...selectedItem];
    newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
    setSelectedItem(newSelectedItem);
    selectedTags(newSelectedItem,itemId);
  };

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  return (
    <React.Fragment>
      <Downshift id="downshift-multiple" inputValue={inputValue} onChange={handleChange} selectedItem={selectedItem}>
        {({ getInputProps }) => {
          const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
            onKeyDown: handleKeyDown,
            placeholder
          });
          return (
            <div className="">
              {(selectedItem.length > 0 || !readOnly) && (
                <TextField
                  className={classes.inputChip}
                  InputProps={{
                    startAdornment: selectedItem.map(item => (
                      <>
                        {readOnly ? (
                          <Chip key={item} tabIndex={-1} label={item} className={classes.innerChip} />
                        ) : (
                          <Chip
                            key={item}
                            tabIndex={-1}
                            label={item}
                            disabled={readOnly}
                            className={classes.innerChip}
                            onDelete={handleDelete(item)}
                          />
                        )}
                      </>
                    )),
                    onBlur,
                    onChange: event => {
                      handleInputChange(event);
                      onChange(event);
                    },
                    onFocus
                  }}
                  {...other}
                  {...inputProps}
                  disabled={props.readOnly}
                />
              )}
            </div>
          );
        }}
      </Downshift>
    </React.Fragment>
  );
};

export default React.memo(ChipInput);

ChipInput.defaultProps = {
  tags: []
};
ChipInput.propTypes = {
  selectedTags: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string)
};
