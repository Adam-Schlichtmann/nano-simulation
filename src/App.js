import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Row from "./Row";
import { Button } from "react-bootstrap";

const e = 2.71828;
const D = 10 ** -9;
class App extends React.Component {
  constructor() {
    super();

    this.state = {
      colors: [],
      TX: { x: 0, y: 0 },
      RX: [],
      time: 0,
      Q: 256,
      squareSize: 15
    };
  }

  plugIn = (x, equation) => {
    return eval(equation);
  };

  trapezoid = (length, h1, h2) => {
    return ((h1 + h2) / 2) * length;
  };

  integrate = (a, b, equation, stepsize) => {
    var area = 0;
    for (var i = a * 1.0; i < b; i += stepsize) {
      var h1 = this.plugIn(i, equation);
      var h2 = this.plugIn(i + stepsize, equation);
      area = area + this.trapezoid(stepsize, h1, h2);
    }
    return area;
  };

  componentDidMount() {
    let colors = [];
    let temp = [];
    const n = this.state.squareSize * this.state.squareSize + 1;
    const nSqr = this.state.squareSize;
    let row = 0;
    for (let i = 1; i < n; i++) {
      if (row === 0 && i === 1) {
        temp.push({
          r: 0,
          g: 0,
          b: 0,
          x: 0,
          y: 0
        });
      } else if (row === 0 && i === nSqr) {
        temp.push({
          r: 256,
          g: 0,
          b: 0,
          x: nSqr - 1,
          y: 0
        });
      } else if (row === nSqr - 1 && i % nSqr === 0) {
        temp.push({
          r: 0,
          g: 256,
          b: 0,
          x: nSqr - 1,
          y: nSqr - 1
        });
      } else if (row === nSqr - 1 && i % nSqr === 1) {
        temp.push({
          r: 0,
          g: 0,
          b: 256,
          x: 0,
          y: nSqr - 1
        });
      } else {
        temp.push({
          r: 256,
          g: 256,
          b: 256,
          x: row,
          y: i % nSqr === 0 ? 14 : (i % nSqr) - 1
        });
      }

      if (i % nSqr === 0 && i !== 0) {
        colors.push(temp);
        temp = [];
        row += 1;
      }
    }
    this.setState({
      RX: [
        { x: 0, y: nSqr - 1 },
        { x: nSqr - 1, y: nSqr - 1 },
        { x: nSqr - 1, y: 0 }
      ],
      colors
    });
  }
  getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  // getConcentrationOfSquare = point => {
  //   const distanceToTx = Math.sqrt(point.x ** 2 + point.y ** 2);
  //   const { r, g, b } = this.getConcentrationRGB(distanceToTx, this.state.time);
  //   const update = this.state.colors.find(
  //     p => point.x === p.x && point.y === p.y
  //   );
  //   this.setState({
  //     colors: [{ r: r, g: g, b: b, ...update }, ...this.state.colors]
  //   });
  // };
  notTXorRX = (x, y) => {
    let good = true;
    this.state.RX.forEach(rec => {
      if (rec.x === x && rec.y === y) {
        good = false;
      }
    });
    if (this.state.TX.x === x && this.state.TX.y === y) {
      good = false;
    }
    return good;
  };

  setSquaresAtR = (concen, r, Rx) => {
    let { colors } = this.state;
    let x = 0; // COlUMN
    let y = 0; // ROW
    if (Rx.x === 0 && Rx.y === 0) {
      console.log("Top left");
      // top left
      y = r;
      while (y >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].r += concen;
          x += 1;
          y -= 1;
        }
      }
    } else if (Rx.x === this.state.squareSize - 1 && Rx.y === 0) {
      // Top Right
      console.log("Top Right");
      y = r;
      x = this.state.squareSize - 1;
      while (y >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].r += concen;
          x -= 1;
          y -= 1;
        }
      }
    } else if (Rx.x === 0 && Rx.y === this.state.squareSize - 1) {
      // Bottom left
      console.log("bot left");
      y = this.state.squareSize - 1;
      x = r;
      while (x >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].b += concen;
          x -= 1;
          y -= 1;
        }
      }
    } else if (
      Rx.x === this.state.squareSize - 1 &&
      Rx.y === this.state.squareSize - 1
    ) {
      // Bottom right
      console.log("bot Right");
      y = this.state.squareSize - 1;
      x = this.state.squareSize - r - 1;
      while (x <= this.state.squareSize - 1) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].g += concen;
          x += 1;
          y -= 1;
        }
      }
    }
    this.setState({ colors });
  };

  getDiffusedConcentration = (r, t) => {
    return r * t < 256 ? r * t : 256;
    // return (
    //   (this.state.Q / (2 * D * Math.PI * r)) *
    //   (1 -
    //     (2 / Math.sqrt(Math.PI)) *
    //       this.integrate(
    //         0,
    //         (r / Math.sqrt(4 * D * t), e + "**((-" + t + ")**2)")
    //       ))
    // );
  };

  updateColors = () => {
    this.state.RX.forEach(rec => {
      for (let i = 1; i < this.state.squareSize; i++) {
        const concen = this.getDiffusedConcentration(i, this.state.time);
        this.setSquaresAtR(concen, i, rec);
      }
    });

    this.setState({ time: (this.state.time += 1) });
  };

  render() {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
        className='App'
      >
        <div style={{ display: "flex", flex: 0.3 }}>
          <Button onClick={() => this.updateColors()}>STEP</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={{ display: "flex", flexDirection: "column", flex: 0.3 }}
          ></div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {this.state.colors.map(color => (
              <Row row={color} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

// getNeighbors = (x, y) => {
//   const { colors } = this.state;
//   let neighbors = [];
//   for (let i = 0; i < colors.length; i++) {
//     const temp = colors[i].filter(
//       color =>
//         (color.x === x + 1 && color.y === y) ||
//         (color.x === x - 1 && color.y === y) ||
//         (color.x === x && color.y === y + 1) ||
//         (color.x === x && color.y === y - 1) ||
//         (color.x === x - 1 && color.y === y - 1) ||
//         (color.x === x + 1 && color.y === y - 1) ||
//         (color.x === x + 1 && color.y === y + 1) ||
//         (color.x === x - 1 && color.y === y + 1)
//     );
//     neighbors.push(...temp);
//   }
//   return neighbors;
// };

// getNeighborsConcentration = node => {
//   const neighbors = this.getNeighbors(node.x, node.y);
//   let r = 0,
//     g = 0,
//     b = 0;
//   neighbors.forEach(n => {
//     r += n.r;
//     g += n.g;
//     b += n.b;
//   });
//   const avgR =
//     Math.floor(r / neighbors.length) > 256
//       ? 256
//       : Math.floor(r / neighbors.length);
//   const avgB =
//     Math.floor(b / neighbors.length) > 256
//       ? 256
//       : Math.floor(b / neighbors.length);
//   const avgG =
//     Math.floor(g / neighbors.length) > 256
//       ? 256
//       : Math.floor(g / neighbors.length);

//   return {
//     ...node,
//     r: avgR,
//     g: avgG,
//     b: avgB
//   };
// };
