/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
export class Point {
    constructor(x, y) {
      this._x = x;
      this._y = y;
    }
  
    get x() {
      return this._x;
    }
  
    get y() {
      return this._y;
    }
  
    equals(otherPoint) {
      return this.x === otherPoint.x && this.y === otherPoint.y;
    }
  
    calcDeltaXTo(otherPoint) {
      return this.x - otherPoint.x;
    }
  
    calcDeltaYTo(otherPoint) {
      return this.y - otherPoint.y;
    }
  
    calcHorizontalDistanceTo(point) {
      return Math.abs(this.calcDeltaXTo(point));
    }
  
    calcVerticalDistance(point) {
      return Math.abs(this.calcDeltaYTo(point));
    }
  
    calcDistanceTo(point) {
      return Math.sqrt(
        Math.pow(this.calcDeltaXTo(point), 2) +
          Math.pow(this.calcDeltaYTo(point), 2)
      );
    }
  }
  
  export function isPoint(x) {
    return x instanceof Point;
  }
  