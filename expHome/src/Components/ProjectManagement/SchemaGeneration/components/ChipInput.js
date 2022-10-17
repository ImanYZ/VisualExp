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
  const { selectedTags, placeholder, tags, ...other } = props;
  const [inputValue, setInputValue] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState([]);

  useEffect(() => {
    setSelectedItem(tags);
  }, [tags]);

  useEffect(() => {
    selectedTags(selectedItem);
  }, [selectedItem, selectedTags]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      const newSelectedItem = [...selectedItem];
      const duplicatedValues = newSelectedItem.indexOf(
        event.target.value.trim()
      );

      if (duplicatedValues !== -1) {
        setInputValue("");
        return;
      }
      if (!event.target.value.replace(/\s/g, "").length) return;

      newSelectedItem.push(event.target.value.trim());
      setSelectedItem(newSelectedItem);
      setInputValue("");
    }
    if (
      selectedItem.length &&
      !inputValue.length &&
      event.key === "Backspace"
    ) {
      setSelectedItem(selectedItem.slice(0, selectedItem.length - 1));
    }
  }

  const handleChange = (item) => {
    let newSelectedItem = [...selectedItem];
    if (newSelectedItem.indexOf(item) === -1) {
      newSelectedItem = [...newSelectedItem, item];
    }
    setInputValue("");
    setSelectedItem(newSelectedItem);
  }

  const handleDelete = item => () => {
    const newSelectedItem = [...selectedItem];
    newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
    setSelectedItem(newSelectedItem);
  };

const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  return (
    <React.Fragment>
      <Downshift
        id="downshift-multiple"
        inputValue={inputValue}
        onChange={handleChange}
        selectedItem={selectedItem}
      >
        {({ getInputProps }) => {
          const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
            onKeyDown: handleKeyDown,
            placeholder
          });
          return (
            <div className="">
              <TextField
                className={classes.inputChip}
                InputProps={{
                  startAdornment: selectedItem.map(item => (
                    <Chip
                      key={item}
                      tabIndex={-1}
                      label={item}
                      className={classes.innerChip}
                      onDelete={handleDelete(item)}
                    />
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
              />
            </div>
          );
        }}
      </Downshift>
    </React.Fragment>
  );
}

export default ChipInput;

ChipInput.defaultProps = {
  tags: []
};
ChipInput.propTypes = {
  selectedTags: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string)
};
