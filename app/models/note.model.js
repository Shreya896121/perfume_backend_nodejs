const sql = require("./db.js");
const baseUrl = "http://localhost:8080";

const note = function (note) {
  this.name = note.name;
  this.icon = note.icon;
  this.note_type = note.note_type;
};

// Create a new note
note.create = (newnote, result) => {
  sql.query("INSERT INTO notes SET ?", newnote, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("Created note: ", { id: res.insertId, ...newnote });
    result(null, { id: res.insertId, ...newnote });
  });
};

note.findById = (id, result) => {
  sql.query(
    `SELECT 
      p.id AS perfume_id, 
      p.title AS perfume_name, 
      p.image AS perfume_image, 
      MAX(CASE WHEN n.note_type = 'top_note' THEN n.icon END) AS top_note_icon,
      MAX(CASE WHEN n.note_type = 'middle_note' THEN n.icon END) AS middle_note_icon,
      MAX(CASE WHEN n.note_type = 'low_note' THEN n.icon END) AS base_note_icon
    FROM perfumes p
    LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
    LEFT JOIN notes n ON pn.note_id = n.id
    WHERE p.id = ?
    GROUP BY p.id, p.title, p.image`,
    [id],
    (err, res) => {                                      
      if (err) {
        console.log("Query error: ", err);
        result(err, null);
        return;
      }
      console.log("Raw query result for id", id, ":", res);
      if (res.length) {
        const perfumeData = {
          id: res[0].perfume_id,
          title: res[0].perfume_name,
          imageUrl: `${baseUrl}/images/${res[0].perfume_image}`,
          notes: {
            top: res[0].top_note_icon
              ? `${baseUrl}/images/${res[0].top_note_icon}`
              : null,
            middle: res[0].middle_note_icon
              ? `${baseUrl}/images/${res[0].middle_note_icon}`
              : null,
            base: res[0].base_note_icon
              ? `${baseUrl}/images/${res[0].base_note_icon}`
              : null,
          },
        };
        console.log("Formatted result for id", id, ":", perfumeData);
        result(null, perfumeData);
        return;
      }
      console.log("No perfume found for id", id);
      result({ kind: "not_found" }, null);
    }
  );
};

note.findByNoteId = (id, result) => {
  console.log(`Querying perfume with ID: ${id}`);
  sql.query("SELECT * FROM notes WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      const noteWithIcon = {
        ...res[0],
        iconUrl: `${baseUrl}/icons/${res[0].icon}`,
      };
      console.log("Found note: ", noteWithIcon);
      result(null, noteWithIcon);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

note.getAll = (result) => {
  sql.query("SELECT * FROM notes", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    const notesWithiconUrl = res.map((note) => ({
      ...note,
      iconUrl: `${baseUrl}/icons/${note.icon}`, // Add iconUrl
    }));
    console.log("notes: ", notesWithiconUrl);
    result(null, notesWithiconUrl);
  });
};

// Find a note by Name
note.findByName = (name, result) => {
  sql.query(
    "SELECT * FROM notes WHERE name LIKE ?",
    [`%${name}%`],
    (err, res) => {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        const notesWithicons = res.map((note) => ({
          ...note,
          iconUrl: `${baseUrl}/icons/${note.icon}`,
        }));

        console.log("Found notes: ", notesWithicons);
        result(null, notesWithicons);
        return;
      }

      result({ kind: "not_found" }, null);
    }
  );
};

// Update a note by ID
note.updateById = (id, note, result) => {
  sql.query(
    "UPDATE notes SET name = ?, icon = ?, note_type = ? WHERE id = ?",
    [note.name, note.icon, note.note_type, id],
    (err, res) => {
      if (err) {
        console.log("Error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("Updated note: ", { id, ...note });
      result(null, { id, ...note });
    }
  );
};

// Delete a note by ID
note.remove = (id, result) => {
  sql.query("DELETE FROM notes WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("Deleted note with id: ", id);
    result(null, res);
  });
};

// Delete All notes
note.removeAll = (result) => {
  sql.query("DELETE FROM notes", (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    console.log(`Deleted ${res.affectedRows} notes`);
    result(null, res);
  });
};

module.exports = note;
