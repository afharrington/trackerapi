"use strict";
var mongoose = require("mongoose");
var tile = require("../models/tileModel.js");
var entry = require("../models/tileModel.js");
const jwt = require('jwt-simple');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;

// GET localhost:3000/
// Extract and decode the JWT from the header and use the id to find matching tiles
exports.list_all_tiles = function(req, res) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  tile.find({ user: decoded.sub }, function(err, tile) {
    if (err) res.send(err);
    res.json(tile);
  }).sort({ color: -1 });
};

// POST localhost:3000/
// Create a new tile
exports.create_tile = function(req, res) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  var new_tile = new tile(req.body);
  new_tile.user = decoded.sub;
  new_tile.save(function(err, tile){
    if (err) res.send(err);
    res.json(tile);
  });
}


// PUT localhost:3000/tile/:tileId/settings
exports.update_tile = function(req, res) {
  tile.findById(req.params.tileId, function(err, tile) {
    tile.name = req.body.name;
    tile.mode = req.body.mode;
    tile.goalHours = req.body.goalHours;
    tile.goalCycle = req.body.goalCycle;
    tile.continuousHours = req.body.continuousHours;
    tile.continuousDays = req.body.continuousDays;
    tile.goalLastCycleStart = req.body.goalLastCycleStart;
    tile.color = req.body.color;

    tile.save(function (err, tile) {
      if (err) res.send(err);
      res.send(tile);
    });
  });
}


// PUT localhost:3000/tile/:tileId
// Update the tile's color value
exports.update_color = function(req, res) {
  tile.findById(req.params.tileId, function(err, tile) {
    tile.color = req.body.color;
    tile.save(function (err, tile) {
      if (err) res.send(err);
    });
    res.send(tile);
  });
}

// DELETE localhost:3000/tile/:tileId
// Delete a tile
exports.delete_tile = function(req, res) {
  tile.remove({
    _id: req.params.tileId
  }, function(err) {
    if (err) res.send(err);
    res.json({ message: "tile successfully deleted" });
  });
};

// GET localhost:3000/tile/:tileId
// Get a tile
exports.list_all_entries = function(req, res) {
  tile.findById(req.params.tileId, function(err, tile) {
    if (err) res.send(err)
    res.json(tile);
  });
}

// POST localhost:3000/tile/:tileId
// Add a new entry to a tile
exports.create_entry = function(req, res) {
  tile.findById(req.params.tileId, function(err, tile) {

    // Update the total minutes in tile after new entry
    tile.totalMinutes = Number(tile.totalMinutes);
    const entryMinutes = Number(req.body.minutes);
    tile.totalMinutes += entryMinutes;

    let addToColor;

    if (tile.mode == "goal") {
      let hoursPerColor = ( tile.goalHours / tile.goalCycle) * 60;
      addToColor = entryMinutes / hoursPerColor;
    } else if (tile.mode == "continuous") {
      addToColor = entryMinutes / ( tile.continuousHours * 60);
    }

    tile.color = tile.color + addToColor;
    tile.entries = [{ date: req.body.date, content: req.body.content, comments: req.body.comments, minutes: req.body.minutes}].concat(tile.entries);

    tile.entries.sort((a, b) => {
      return b.date - a.date;
    });

    tile.save(function (err, tile) {
      if (err) res.send(err);
      res.send(tile);
    });
  });
}

// DELETE localhost:3000/tile/:tileId
// Delete a tile
exports.delete_tile = function(req, res) {
  tile.remove({
    _id: req.params.tileId
  }, function(err) {
    if (err) res.send(err);
    res.json({ message: "tile successfully deleted" });
  });
};

// DELETE localhost:3000/tile/:tileId/entry/:entryId
// Delete an entry
exports.delete_entry = function(req, res) {
  tile.findById(req.params.tileId, function(err, tile) {
    const currentEntries = [...tile.entries];
    const indexToDelete = currentEntries.findIndex( entry => {
      return entry._id == req.params.entryId;
    });

    // // Update the total minutes in tile after deletion
    tile.totalMinutes = Number(tile.totalMinutes);
    const entryMinutes = Number(currentEntries[indexToDelete].minutes) || 0;
    tile.totalMinutes -= entryMinutes;

    // Decrease the color value of a tile
    tile.color = tile.color - (entryMinutes / 60);

    tile.entries = [...currentEntries.slice(0, indexToDelete), ...currentEntries.slice(indexToDelete + 1)];

    tile.save(function (err, updatedEntries) {
      if (err) res.send(err);
    });
    res.send(tile);
  });
}

// PUT localhost:3000/tile/:tileId/entry/:entryId
// Edit an entry
exports.update_entry = function(req, res) {
  tile.findById(req.params.tileId, function(err, tile) {
    const currentEntries = [...tile.entries];
    const indexToUpdate = currentEntries.findIndex( entry => {
      return entry._id == req.params.entryId;
    });

    // First delete the updated entry's minutes from the total and update color
    tile.totalMinutes = Number(tile.totalMinutes);
    const originalMinutes = Number(currentEntries[indexToUpdate].minutes);
    tile.totalMinutes -= originalMinutes;
    tile.color = tile.color - (originalMinutes / 60);

    const updatedEntry = {date: req.body.date, content: req.body.content, comments: req.body.comments, minutes: req.body.minutes};
    const updatedMinutes = Number(updatedEntry.minutes);

    tile.entries = [...currentEntries.slice(0, indexToUpdate), updatedEntry, ...currentEntries.slice(indexToUpdate + 1)];

    // Add the new updated entry's minutes back to the total and update color
    tile.totalMinutes += updatedMinutes;
    tile.color = tile.color + (updatedMinutes / 60);

    tile.save(function (err, updatedEntries) {
      if (err) {
        return res.send(err);
      }
    res.json(tile);
  });
});
}
