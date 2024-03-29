import React from "react";
import { PropTypes } from "prop-types";
import Bacteria from "./Bacteria";

// view for a single square
function Square(props) {
  const styles = {
    backgroundColor: `rgb(${props.params.r}, ${props.params.g}, ${props.params.b})`,
    width: 20,
    height: 20,
    border: ".25px solid black"
  };
  const bac = props.bacteria.find(
    bac => bac.locationX === props.params.x && bac.locationY === props.params.y
  );
  return (
    <div
      onClick={() =>
        console.log(
          `${props.params.x} ${props.params.y} ${props.params.r} ${props.params.g} ${props.params.b}`
        )
      }
      style={styles}
    >
      {bac && !bac.end && <Bacteria bacteria={bac} />}
    </div>
  );
}

Square.propTypes = {
  params: PropTypes.object,
  bacteria: PropTypes.arrayOf(PropTypes.object)
};

Square.defaultProps = {
  bacteria: null
};
export default Square;
