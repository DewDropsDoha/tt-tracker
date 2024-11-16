import React from 'react';
import Select, { SingleValue } from 'react-select';

interface ReactSelectProps {
  matches: string[];
  handleMatchSelection: (selectedMatch: string) => void;
  selectedMatch: string;
}

const ReactSelect: React.FC<ReactSelectProps> = ({
  matches,
  handleMatchSelection,
  selectedMatch,
}) => {
  const options = matches.map((name) => ({ value: name, label: name }));

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>
  ) => {
    if (selectedOption) {
      handleMatchSelection(selectedOption.value);
    }
  };

  return (
    <div>
      <Select
        options={options}
        onChange={handleChange}
        value={options.find((option) => option.value === selectedMatch)}
        placeholder="Select Match"
        isSearchable
      />
    </div>
  );
};

export default ReactSelect;
