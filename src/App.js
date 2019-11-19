import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Row from "./Row";
import { Button } from "react-bootstrap";

// CONSTANTS FOR MATH
const e = 2.71828;
const D = 8;

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      colors: [],
      TX: { x: 0, y: 0 },
      RX: [],
      time: 0,
      Q: 256,
      squareSize: 20,
      error: "",
      inputN: 20,
      inputQ: 256,
      payload: [
        { goal: "RX-red", input: "abcde" },
        { goal: "RX-green", input: "lmnop" },
        { goal: "RX-blue", input: "vwxyz" }
      ],
      bacteria: []
    };
  }

  // MATH HELPERS
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
  // EMD MATH HELPERS

  componentDidMount() {
    this.boardGen();
  }

  boardGen = () => {
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
          r: 0,
          g: 0,
          b: 0,
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
        { name: "RX-blue", x: 0, y: nSqr - 1 },
        { name: "RX-green", x: nSqr - 1, y: nSqr - 1 },
        { name: "RX-red", x: nSqr - 1, y: 0 }
      ],
      colors: colors
    });
  };

  getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  // SET STATES FOR VAR CHANGES
  changeN = n => {
    var reg = new RegExp("^[0-9]+$");
    (reg.test(n) || n === "") && n < 31
      ? this.setState({ inputN: n, error: "" })
      : this.ERRORTEXT("Invalid N");
  };
  changeQ = q => {
    var reg = new RegExp("^[0-9]+$");
    reg.test(q) || q === ""
      ? this.setState({ inputQ: q, error: "" })
      : this.ERRORTEXT("Invalid Q");
  };
  ERRORTEXT = text => {
    this.setState({ error: text });
  };

  payloadChange = (rx, val) => {
    const { payload } = this.state;
    if (rx === "RX-red") {
      payload[0].input = val;
    } else if (rx === "RX-green") {
      payload[1].input = val;
    } else if (rx === "RX-blue") {
      payload[2].input = val;
    } else {
      console.log("ERROR IN PAYLOAD CHANGE");
    }
    this.setState({ payload: payload });
  };

  // STATE CHANGES END
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

  setSquaresAtR = (colors, concen, r, Rx) => {
    let x = 0; // COlUMN
    let y = 0; // ROW
    if (Rx.x === 0 && Rx.y === 0) {
      // top left
      y = r;
      while (y >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].r += concen;
        }
        x += 1;
        y -= 1;
      }
    } else if (Rx.x === this.state.squareSize - 1 && Rx.y === 0) {
      // Top Right

      y = r;
      x = this.state.squareSize - 1;
      while (y >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].r += concen;
        }
        x -= 1;
        y -= 1;
      }
    } else if (Rx.x === 0 && Rx.y === this.state.squareSize - 1) {
      // Bottom left

      y = this.state.squareSize - 1;
      x = r;
      while (x >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].b += concen;
        }
        x -= 1;
        y -= 1;
      }
    } else if (
      Rx.x === this.state.squareSize - 1 &&
      Rx.y === this.state.squareSize - 1
    ) {
      // Bottom right
      y = this.state.squareSize - 1;
      x = this.state.squareSize - r - 1;
      while (x <= this.state.squareSize - 1) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].g += concen;
        }
        x += 1;
        y -= 1;
      }
    }
    return colors;
  };

  getDiffusedConcentration = (r, t) => {
    // return (this.state.squareSize - r) * t < 256
    //   ? (this.state.squareSize - r) * t
    //   : 256;
    return (
      (this.state.Q / (2 * D * Math.PI * r)) *
      (1 -
        (2 / Math.sqrt(Math.PI)) *
          this.integrate(
            0,
            (r / Math.sqrt(4 * D * t), e + "**((-" + t + ")**2)")
          ))
    );
  };

  updateColors = () => {
    let { colors } = this.state;
    this.state.RX.forEach(rec => {
      for (let i = 1; i < this.state.squareSize; i++) {
        const concen = this.getDiffusedConcentration(i, this.state.time);
        colors = this.setSquaresAtR(colors, concen, i, rec);
      }
    });

    this.setState({ colors, time: (this.state.time += 1) });
  };

  createBacteria = () => {
    let released = false;
    let i = 0;
    while (!released) {
      const index = this.getRandomInt(3);
      const color = this.state.payload[index].goal;
      const activeBac = this.state.bacteria.filter(bac => bac.color === color);
      if (activeBac.length < this.state.payload[index].input.length) {
        released = true;
        return {
          payload: this.state.payload[index].input[activeBac.length],
          locationX: this.state.TX.x,
          locationY: this.state.TX.y,
          color: color,
          start: this.state.time,
          end: false
        };
      }
      i++;
      if (i > 20) {
        return;
      }
    }
  };

  checkNeighborBacteria = bac => {
    const { colors } = this.state;
    const x = bac.locationX;
    const y = bac.locationY;
    let neighbors = [];
    for (let i = 0; i < colors.length; i++) {
      const temp = colors[i].filter(
        color =>
          (color.x === x + 1 && color.y === y) ||
          (color.x === x - 1 && color.y === y) ||
          (color.x === x && color.y === y + 1) ||
          (color.x === x && color.y === y - 1) ||
          (color.x === x - 1 && color.y === y - 1) ||
          (color.x === x + 1 && color.y === y - 1) ||
          (color.x === x + 1 && color.y === y + 1) ||
          (color.x === x - 1 && color.y === y + 1)
      );
      neighbors.push(...temp);
    }
    const randomMove = this.getRandomInt(neighbors.length);
    let maxR = neighbors[randomMove];
    let maxG = neighbors[randomMove];
    let maxB = neighbors[randomMove];
    for (let i = 0; i < neighbors.length; i++) {
      maxR = neighbors[i].r > maxR.r ? neighbors[i] : maxR;
      maxG = neighbors[i].g > maxG.g ? neighbors[i] : maxG;
      maxB = neighbors[i].b > maxB.b ? neighbors[i] : maxB;
    }
    return [maxR, maxG, maxB];
  };

  bacteriaStep = () => {
    const { bacteria } = this.state;
    if (
      this.state.bacteria.length <
        this.state.payload.reduce(function(acc, obj) {
          return acc + obj.input.length;
        }, 0) &&
      this.state.time % 5 === 0
    ) {
      bacteria.push(this.createBacteria());
    }
    const newBac = bacteria.map(bac => {
      if (
        bac.color === "RX-red" &&
        bac.locationX === this.state.RX[2].x &&
        bac.locationY === this.state.RX[2].y
      ) {
        return { ...bac, end: this.state.time };
      } else if (
        bac.color === "RX-blue" &&
        bac.locationX === this.state.RX[1].x &&
        bac.locationY === this.state.RX[1].y
      ) {
        return { ...bac, end: this.state.time };
      } else if (
        bac.color === "RX-green" &&
        bac.locationX === this.state.RX[0].x &&
        bac.locationY === this.state.RX[0].y
      ) {
        return { ...bac, end: this.state.time };
      } else {
        const rgb = this.checkNeighborBacteria(bac);
        if (bac.color === "RX-red") {
          return { ...bac, locationX: rgb[0].x, locationY: rgb[0].y };
        } else if (bac.color === "RX-green") {
          return { ...bac, locationX: rgb[1].x, locationY: rgb[1].y };
        } else if (bac.color === "RX-blue") {
          return { ...bac, locationX: rgb[2].x, locationY: rgb[2].y };
        } else {
          return bac;
        }
      }
    });
    this.setState({ bacteria: newBac });
  };

  simIteration = () => {
    this.updateColors();
    this.bacteriaStep();
  };

  render() {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
        className='App'
      >
        <div style={{ display: "flex", flex: 0.3, flexDirection: "column" }}>
          <p>{this.state.error}</p>
          <input
            style={{ margin: 1 }}
            type='text'
            name='r-val'
            placeholder='RX-red'
            value={this.state.payload[0].input}
            disabled={this.state.time > 0}
            onChange={n => this.payloadChange("RX-red", n.target.value)}
          />
          <input
            style={{ margin: 1 }}
            type='text'
            name='g-val'
            placeholder='RX-green'
            value={this.state.payload[1].input}
            disabled={this.state.time > 0}
            onChange={q => this.payloadChange("RX-green", q.target.value)}
          />
          <input
            style={{ margin: 1 }}
            type='text'
            name='b-val'
            placeholder='RX-blue'
            value={this.state.payload[2].input}
            disabled={this.state.time > 0}
            onChange={n => this.payloadChange("RX-blue", n.target.value)}
          />
          <Button style={{ margin: 1 }} onClick={() => this.simIteration()}>
            STEP
          </Button>
          <input
            style={{ margin: 1 }}
            type='text'
            name='n-value'
            placeholder='enter a value for n'
            value={this.state.inputN}
            onChange={n => this.changeN(n.target.value)}
          />
          <input
            style={{ margin: 1 }}
            type='text'
            name='n-value'
            placeholder='enter a value for q'
            value={this.state.inputQ}
            onChange={q => this.changeQ(q.target.value)}
          />
          <Button
            style={{ margin: 1 }}
            onClick={() =>
              this.setState(
                {
                  squareSize: this.state.inputN,
                  Q: this.state.inputQ,
                  time: 0
                },
                () => this.boardGen()
              )
            }
          >
            Update/Reset Channel
          </Button>
        </div>

        <div style={{ justifyContent: "center", alignItems: "center" }}>
          {this.state.colors.map(color => (
            <Row row={color} bacteria={this.state.bacteria} />
          ))}
        </div>
      </div>
    );
  }
}

export default App;

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

// MOVE TO BEST NEIGHBORS
// const rgb = this.checkNeighborBacteria(bac);
// if (bac.color === "RX-red") {
//   return { ...bac, locationX: rgb[0].x, locationY: rgb[0].y };
// } else if (bac.color === "RX-green") {
//   return { ...bac, locationX: rgb[1].x, locationY: rgb[1].y };
// } else if (bac.color === "RX-blue") {
//   return { ...bac, locationX: rgb[2].x, locationY: rgb[2].y };
// } else {
//   return bac;
// }
