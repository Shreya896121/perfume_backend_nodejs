const Note = require("../models/note.model.js");

// Create and Save a new Note
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a Note
  const note = new Note({
    name: req.body.name,
    icon: req.body.icon,
    note_type: req.body.note_type,
  });

  // Save Note in the database
  Note.create(note, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Note.",
      });
    else res.send(data);
  });
};

// Retrieve all Notes from the database
exports.findAll = (req, res) => {
  Note.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving notes.",
      });
    else res.send(data);
  });
};

// Find a single Note by Id
exports.findOne = (req, res) => {
  const noteId = req.params.id;
  console.log(`Controller: Received request for perfume ID: ${perfumeId}`);
  Note.findById(noteId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).json({
          message: `Perfume with id ${noteId} not found.`,
        });
      } else {
        return res.status(500).json({
          message: `Error retrieving perfume with id ${noteId}`,
        });
      }
    }
    res.status(200).json(data);
  });
};
// Update a Note identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  Note.updateById(req.params.id, new Note(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Note with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating Note with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

// Delete a Note with the specified id in the request
exports.delete = (req, res) => {
  Note.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Note with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Note with id " + req.params.id,
        });
      }
    } else res.send({ message: `Note was deleted successfully!` });
  });
};

// Delete all Notes from the database
exports.deleteAll = (req, res) => {
  Note.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while removing all notes.",
      });
    else res.send({ message: `All Notes were deleted successfully!` });
  });
};
