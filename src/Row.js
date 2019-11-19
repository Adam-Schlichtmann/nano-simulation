import React from "react";
import { PropTypes } from "prop-types";
import Square from "./Square";

function Row(props) {
  return (
    <div className='Row' style={{ display: "flex", flexDirection: "row" }}>
      {props.row.map(item => (
        <Square params={item} bacteria={props.bacteria} />
      ))}
    </div>
  );
}

Row.propTypes = {
  bacteria: PropTypes.arrayOf(PropTypes.object).isRequired,
  row: PropTypes.arrayOf(PropTypes.object).isRequired
};
export default Row;
