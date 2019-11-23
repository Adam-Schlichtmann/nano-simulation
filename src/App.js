import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Row from "./Row";
import { Button } from "react-bootstrap";

// CONSTANTS FOR MATH
const e = 2.71828;
const D = 10;
const DIRECTIONS = [
  "right",
  "left",
  "down",
  "up",
  "diagonal-down-r",
  "diagonal-down-l",
  "diagonal-up-r",
  "diagonal-up-l"
];
const DIRECTION_INDEXES = [
  { name: "right", x: n => n + 1, y: n => n },
  { name: "left", x: n => n - 1, y: n => n },
  { name: "down", x: n => n, y: n => n + 1 },
  { name: "up", x: n => n, y: n => n - 1 },
  { name: "diagonal-down-r", x: n => n + 1, y: n => n + 1 },
  { name: "diagonal-down-l", x: n => n - 1, y: n => n + 1 },
  { name: "diagonal-up-r", x: n => n + 1, y: n => n - 1 },
  { name: "diagonal-up-l", x: n => n - 1, y: n => n - 1 }
];

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      colors: [],
      TX: { x: 0, y: 0 },
      RX: [],
      time: 0,
      Q: 256,
      releaseRate: 5,
      squareSize: 20,
      error: "",
      inputN: 20,
      inputQ: 256,
      payload: [
        { goal: "RX-red", input: "abcde" },
        { goal: "RX-green", input: "lmnop" },
        { goal: "RX-blue", input: "vwxyz" }
      ],
      bacteria: [],
      results: [
        { goal: "RX-red", output: "" },
        { goal: "RX-green", output: "" },
        { goal: "RX-blue", output: "" }
      ],
      BER: [],
      done: false,
      averageTimes: [],
      baseRun: 3
    };
  }

  componentDidMount() {
    this.boardGen();
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
  // END MATH HELPERS

  // BOARD GENERATION
  boardGen = () => {
    let colors = [];
    let temp = [];
    const n = this.state.squareSize * this.state.squareSize + 1;
    const nSqr = this.state.squareSize;
    let row = 0;

    for (let i = 1; i < n; i++) {
      if (row === 0 && i === 21) {
        console.log(i + " " + row + " " + nSqr);
      }

      if (row === 0 && i === 1) {
        // TX
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
          x: i % nSqr === 0 ? nSqr - 1 : (i % nSqr) - 1,
          y: row
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

  changeBaseRun = q => {
    var reg = new RegExp("^[0-9]+$");
    reg.test(q) || q === ""
      ? this.setState({ baseRun: q, error: "" })
      : this.ERRORTEXT("Invalid Base Run");
  };

  ERRORTEXT = text => {
    this.setState({ error: text });
  };

  changeReleaseRate = text => {
    text > 0 || text === ""
      ? this.setState({ releaseRate: text, error: "" })
      : this.ERRORTEXT("VALUE MUST BE GREATER THAN 0");
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

  // =========================== Board update ===========================

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
    if (Rx.x === this.state.squareSize - 1 && Rx.y === 0) {
      // Top Right
      if (r >= this.state.squareSize) {
        y = this.state.squareSize - 1;
        x = (this.state.squareSize - 1) * 2 - r;
      } else {
        y = r;
        x = this.state.squareSize - 1;
      }
      while (y >= 0 && x >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].r =
            colors[y][x].r + concen >= 256 ? 255 : colors[y][x].r + concen;
        }
        x -= 1;
        y -= 1;
      }
    } else if (Rx.x === 0 && Rx.y === this.state.squareSize - 1) {
      // Bottom left
      if (r >= this.state.squareSize) {
        y = (this.state.squareSize - 1) * 2 - r;
        x = this.state.squareSize - 1;
      } else {
        y = this.state.squareSize - 1;
        x = r;
      }
      while (x >= 0 && y >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].b =
            colors[y][x].b + concen >= 256 ? 255 : colors[y][x].b + concen;
        }
        x -= 1;
        y -= 1;
      }
    } else if (
      Rx.x === this.state.squareSize - 1 &&
      Rx.y === this.state.squareSize - 1
    ) {
      // Bottom right
      if (r >= this.state.squareSize) {
        y = (this.state.squareSize - 1) * 2 - r;
        x = 0;
      } else {
        y = this.state.squareSize - 1;
        x = this.state.squareSize - r - 1;
      }
      while (x <= this.state.squareSize - 1 && y >= 0) {
        if (this.notTXorRX(x, y)) {
          colors[y][x].g =
            colors[y][x].g + concen >= 256 ? 255 : colors[y][x].g + concen;
        }
        x += 1;
        y -= 1;
      }
    }
    return colors;
  };

  getDiffusedConcentration = (r, t) => {
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
      for (let i = 1; i < this.state.squareSize * 2 - 3; i++) {
        let concen = this.getDiffusedConcentration(i, this.state.time);
        colors = this.setSquaresAtR(colors, concen, i, rec);
      }
    });

    this.setState({ colors, time: (this.state.time += 1) });
  };

  // =========================== END UPDATE BOARD ===========================
  // =========================== Bacteria ===========================

  createBacteria = () => {
    const directions = ["right", "down", "diagonal-down-r"];
    let released = false;
    let i = 0;
    while (!released) {
      const index = this.getRandomInt(3);
      const color = this.state.payload[index].goal;
      const activeBac = this.state.bacteria.filter(bac => bac.color === color);
      if (activeBac.length < this.state.payload[index].input.length) {
        const dirIndex = this.getRandomInt(3);
        released = true;
        return {
          payload: this.state.payload[index].input[activeBac.length],
          locationX: this.state.TX.x,
          locationY: this.state.TX.y,
          color: color,
          start: this.state.time,
          end: false,
          state: "run",
          direction: directions[dirIndex],
          stateDuration: 0
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

  HofT = concen => {
    return this.state.time;
  };

  bacteriaStep = () => {
    const { bacteria } = this.state;
    const done = bacteria.find(b => !b.end);
    const bacReleased = this.state.payload.reduce(function(acc, obj) {
      return acc + obj.input.length;
    }, 0);
    if (!done && this.state.bacteria.length === bacReleased) {
      this.bitERR();
      this.avgTime();
      this.setState({ done: true });
      return;
    }
    if (
      this.state.bacteria.length < bacReleased &&
      this.state.time % this.state.releaseRate === 0
    ) {
      bacteria.push(this.createBacteria());
    }
    const newBac = bacteria.map(bac => {
      if (bac.end) {
        return bac;
      }
      if (
        bac.color === "RX-red" &&
        bac.locationX === this.state.RX[2].x &&
        bac.locationY === this.state.RX[2].y
      ) {
        this.setState({
          results: [
            ...this.state.results,
            {
              ...this.state.results[0],
              output: (this.state.results[0].output += bac.payload)
            }
          ]
        });
        return { ...bac, end: this.state.time };
      } else if (
        bac.color === "RX-green" &&
        bac.locationX === this.state.RX[1].x &&
        bac.locationY === this.state.RX[1].y
      ) {
        this.setState({
          results: [
            ...this.state.results,
            {
              ...this.state.results[1],
              output: (this.state.results[1].output += bac.payload)
            }
          ]
        });
        return { ...bac, end: this.state.time };
      } else if (
        bac.color === "RX-blue" &&
        bac.locationX === this.state.RX[0].x &&
        bac.locationY === this.state.RX[0].y
      ) {
        this.setState({
          results: [
            ...this.state.results,
            {
              ...this.state.results[2],
              output: (this.state.results[2].output += bac.payload)
            }
          ]
        });
        return { ...bac, end: this.state.time };
        // END END CONDITIONS
      } else {
        if (bac.state === "run") {
          if (bac.stateDuration > this.state.baseRun) {
            return { ...bac, state: "tumble", stateDuration: 0 };
          }
          // MOVE THE BACTERIA TO NEXT SQUARE
          const indexHelper = DIRECTION_INDEXES.find(
            b => b.name === bac.direction
          );
          const newX = indexHelper.x(bac.locationX);
          const newY = indexHelper.y(bac.locationY);
          if (
            newX < 0 ||
            newX >= this.state.squareSize ||
            newY < 0 ||
            newY >= this.state.squareSize
          ) {
            return { ...bac, state: "tumble", stateDuration: 0 };
          }
          return {
            ...bac,
            stateDuration: bac.stateDuration + 1,
            locationX: newX,
            locationY: newY
          };
        } else if (bac.state === "tumble") {
          const rgb = this.checkNeighborBacteria(bac);
          if (this.getRandomInt(5) === 4 || bac.stateDuration > 5) {
            if (bac.color === "RX-red") {
              let newDirection = DIRECTION_INDEXES.find(
                d =>
                  d.x(bac.locationX) === rgb[0].x &&
                  d.y(bac.locationY) === rgb[0].y
              );
              if (newDirection.name === bac.state) {
                newDirection =
                  DIRECTION_INDEXES[
                    this.getRandomInt(DIRECTION_INDEXES.length)
                  ];
              }
              return {
                ...bac,
                direction: newDirection.name,
                locationX: rgb[0].x,
                locationY: rgb[0].y,
                state: "run",
                stateDuration: 0
              };
            } else if (bac.color === "RX-green") {
              let newDirection = DIRECTION_INDEXES.find(
                d =>
                  d.x(bac.locationX) === rgb[1].x &&
                  d.y(bac.locationY) === rgb[1].y
              );
              if (newDirection.name === bac.state) {
                newDirection =
                  DIRECTION_INDEXES[
                    this.getRandomInt(DIRECTION_INDEXES.length)
                  ];
              }
              return {
                ...bac,
                direction: newDirection.name,
                locationX: rgb[1].x,
                locationY: rgb[1].y,
                state: "run",
                stateDuration: 0
              };
            } else if (bac.color === "RX-blue") {
              let newDirection = DIRECTION_INDEXES.find(
                d =>
                  d.x(bac.locationX) === rgb[2].x &&
                  d.y(bac.locationY) === rgb[2].y
              );
              if (newDirection.name === bac.state) {
                newDirection =
                  DIRECTION_INDEXES[
                    this.getRandomInt(DIRECTION_INDEXES.length)
                  ];
              }
              return {
                ...bac,
                direction: newDirection.name,
                locationX: rgb[2].x,
                locationY: rgb[2].y,
                state: "run",
                stateDuration: 0
              };
            }
          } else {
            return { ...bac, stateDuration: bac.stateDuration + 1 };
          }
        } else {
          return bac;
        }
      }
    });

    this.setState({ bacteria: newBac });
  };

  // =========================== RUN SIM ===========================
  simIteration = () => {
    this.updateColors();
    this.bacteriaStep();
  };

  simRun = async () => {
    while (!this.state.done) {
      this.simIteration();
      await this.sleep(1000);
    }
  };

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Gen results
  bitERR = () => {
    const { payload, results } = this.state;
    const inOut = [...payload, ...results];
    let r = [];
    for (let i = 0; i < payload.length; i++) {
      let error = 0;
      for (let j = 0; j < inOut[i].input.length; j++) {
        if (inOut[i].input[j] !== inOut[i + 3].output[j]) {
          error += 1;
        }
      }
      r.push({ goal: inOut[i].goal, BER: error / inOut[i].input.length });
    }
    this.setState({ BER: r });
  };

  avgTime = () => {
    const { bacteria } = this.state;
    const r = bacteria.map(b => ({ ...b, time: b.end - b.start }));
    const red = r.filter(b => b.color === "RX-red");
    const redTotal = red.reduce(function(acc, obj) {
      return acc + obj.time;
    }, 0);
    const green = r.filter(b => b.color === "RX-green");
    const greenTotal = green.reduce(function(acc, obj) {
      return acc + obj.time;
    }, 0);
    const blue = r.filter(b => b.color === "RX-blue");
    const blueTotal = blue.reduce(function(acc, obj) {
      return acc + obj.time;
    }, 0);
    this.setState({
      averageTimes: [
        redTotal / red.length,
        greenTotal / green.length,
        blueTotal / blue.length
      ]
    });
  };

  render() {
    return (
      <div
        style={{ display: "flex", flexDirection: "row", flex: 1 }}
        className='App'
      >
        <div
          style={{
            display: "flex",
            flex: 0.2,
            flexDirection: "column",
            marginHorizontal: 15
          }}
        >
          <p>{this.state.error}</p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <p>Red Payload</p>
            <input
              style={{
                margin: 1,
                borderColor: "red",
                justifyContent: "space-between"
              }}
              type='text'
              name='r-val'
              placeholder='RX-red'
              value={this.state.payload[0].input}
              disabled={this.state.time > 0}
              onChange={n => this.payloadChange("RX-red", n.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <p>Green Payload</p>
            <input
              style={{ margin: 1, borderColor: "green" }}
              type='text'
              name='g-val'
              placeholder='RX-green'
              value={this.state.payload[1].input}
              disabled={this.state.time > 0}
              onChange={q => this.payloadChange("RX-green", q.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <p>Blue Payload</p>
            <input
              style={{ margin: 1, borderColor: "blue" }}
              type='text'
              name='b-val'
              placeholder='RX-blue'
              value={this.state.payload[2].input}
              disabled={this.state.time > 0}
              onChange={n => this.payloadChange("RX-blue", n.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <p>Release Rate</p>
            <input
              style={{ margin: 1 }}
              type='text'
              name='releaseRate'
              placeholder='enter a release rate'
              value={this.state.releaseRate}
              disabled={this.state.time > 0}
              onChange={n => this.changeReleaseRate(n.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <p>Base Run</p>
            <input
              style={{ margin: 1 }}
              type='text'
              name='basRun'
              placeholder='enter a Base Run'
              value={this.state.baseRun}
              disabled={this.state.time > 0}
              onChange={n => this.changeBaseRun(n.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <p>Board size</p>
            <input
              style={{ margin: 1 }}
              type='text'
              name='n-value'
              placeholder='enter a value for n'
              value={this.state.inputN}
              onChange={n => this.changeN(n.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <p>Q-value</p>
            <input
              style={{ margin: 1 }}
              type='text'
              name='q-value'
              placeholder='enter a value for q'
              value={this.state.inputQ}
              onChange={q => this.changeQ(q.target.value)}
            />
          </div>
          <Button
            style={{ margin: 1 }}
            onClick={() =>
              this.setState(
                {
                  squareSize: this.state.inputN,
                  Q: this.state.inputQ,
                  time: 0
                },
                () =>
                  this.setState(
                    {
                      colors: [],
                      RX: [],
                      time: 0,
                      error: "",
                      inputN: 20,
                      inputQ: 256,
                      bacteria: [],
                      results: [
                        { goal: "RX-red", output: "" },
                        { goal: "RX-green", output: "" },
                        { goal: "RX-blue", output: "" }
                      ],
                      BER: [],
                      done: false
                    },
                    () => this.boardGen()
                  )
              )
            }
          >
            Update/Reset Channel
          </Button>
          <Button style={{ margin: 1 }} onClick={() => this.simIteration()}>
            STEP
          </Button>
          <Button style={{ margin: 1 }} onClick={() => this.simRun()}>
            Run Whole Simulation
          </Button>
          <p
            style={{
              color: this.state.payload[0].input.includes(
                this.state.results[0].output
              )
                ? "green"
                : "red"
            }}
          >
            RX-red output: {this.state.results[0].output}
          </p>
          {this.state.done && <p>BER: {this.state.BER[0].BER}</p>}
          {this.state.done && <p>Average Time: {this.state.averageTimes[0]}</p>}
          <p
            style={{
              color: this.state.payload[1].input.includes(
                this.state.results[1].output
              )
                ? "green"
                : "red"
            }}
          >
            RX-green output: {this.state.results[1].output}
          </p>
          {this.state.done && <p>BER: {this.state.BER[1].BER}</p>}
          {this.state.done && <p>Average Time: {this.state.averageTimes[1]}</p>}
          <p
            style={{
              color: this.state.payload[2].input.includes(
                this.state.results[2].output
              )
                ? "green"
                : "red"
            }}
          >
            RX-blue output: {this.state.results[2].output}
          </p>
          {this.state.done && <p>BER: {this.state.BER[2].BER}</p>}
          {this.state.done && <p>Average Time: {this.state.averageTimes[2]}</p>}
        </div>

        <div
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            margin: 30
          }}
        >
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
