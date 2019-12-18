import React from "react";
import PropTypes from "prop-types";

// view for a single bacteria
const Bacteria = props => {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 15,
        width: 20,
        height: 20,
        backgroundColor: "black"
      }}
    >
      <p style={{ textAlign: "center", color: "white" }}>
        {props.bacteria.payload}
      </p>
    </div>
  );
};

Bacteria.propTypes = { bacteria: PropTypes.object };

Bacteria.defaultProps = {};

export default Bacteria;
