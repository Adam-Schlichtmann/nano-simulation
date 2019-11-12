import React from "react";
import { PropTypes } from "prop-types";

function Square(props) {
  const styles = {
    backgroundColor: `rgb(${props.params.r}, ${props.params.g}, ${props.params.b})`,
    width: 20,
    height: 20,
    border: ".25px solid black"
  };
  return (
    <div
      onClick={() => console.log(props.params.x + " " + props.params.y)}
      style={styles}
    ></div>
  );
}

Square.propTypes = {
  params: PropTypes.object,
  bacteria: PropTypes.object
};

Square.defaultProps = {
  bacteria: {}
};
export default Square;
