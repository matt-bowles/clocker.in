const Sequelize = require('sequelize');
const sequelize = require('../db/dao');


class Workplace extends Sequelize.Model {
    // Custom class methods here
}

Workplace.init({
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    boundaries: { type: Sequelize.STRING },
}, { sequelize, tableName: 'WORKPLACE', timestamps: false });

/**
 * Determines whether an employee's position is within the workplace's boundaries
 * @param empLoc
 *  An object of an employee's location
 *  e.g. {lat: x, lng: y} 
 * @return {boolean} true if within boundaries, false otherwise
 */
Workplace.prototype.isWithinBoundaries = function(empCoords) {
    var x = empCoords.lat;
    var y = empCoords.lng;
    var boundaries = JSON.parse(this.boundaries);
    var numCorners = boundaries.length;
    var numIntersections = 0;

    // Check for potential intersections between a set of coordinates and the employee's location
    // Adapted from http://alienryderflex.com/polygon/
    for (var i=0, j=numCorners -1; i < numCorners; j = i++) {
        
        var xi = boundaries[i].lat, yi = boundaries[i].lng;
        var xj = boundaries[j].lat, yj = boundaries[j].lng;

        // Confirm intersection
        if (((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            numIntersections++;
        };
    }

    // As per the 'odd-even rule', an odd amount of intersections indicates that the
    // employee's location is within the provided boundaries
    return !(numIntersections % 2 == 0);
}

module.exports = Workplace;