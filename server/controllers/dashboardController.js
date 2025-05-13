const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Note = require("../models/Notes");

/**
 * GET /
 * Dashboard
 */
exports.dashboard = async (req, res) => {
  let perPage = 12;
  let page = req.query.page || 1;

  const locals = {
    title: "My Notes",
    description: "Make Your Own Notes.",
  };

  try {
    if (!req.user || !req.user._id) {
      return res.redirect('/auth/google');
    }

    const notes = await Note.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean();

    const count = await Note.countDocuments({ user: req.user._id });

    res.render("dashboard/index", {
      userName: req.user.firstName || req.user.displayName,
      locals,
      notes,
      layout: "../views/layouts/dashboard",
      current: page,
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error in dashboard");
  }
};

/**
 * GET /
 * View Specific Note
 */
exports.dashboardViewNote = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.redirect('/auth/google');
    }

    const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).lean();

    if (note) {
      res.render("dashboard/view-note", {
        noteID: req.params.id,
        note,
        layout: "../views/layouts/dashboard",
      });
    } else {
      res.send("Note not found or you don't have permission.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading note");
  }
};

/**
 * PUT /
 * Update Specific Note
 */
exports.dashboardUpdateNote = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.redirect('/auth/google');
    }

    await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
      }
    );
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating note");
  }
};

/**
 * DELETE /
 * Delete Note
 */
exports.dashboardDeleteNote = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.redirect('/auth/google');
    }

    await Note.deleteOne({ _id: req.params.id, user: req.user._id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting note");
  }
};

/**
 * GET /
 * Add Notes
 */
exports.dashboardAddNote = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.redirect('/auth/google');
  }

  res.render("dashboard/add", {
    layout: "../views/layouts/dashboard",
  });
};

/**
 * POST /
 * Add Notes
 */
exports.dashboardAddNoteSubmit = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.redirect('/auth/google');
    }

    req.body.user = req.user._id;
    await Note.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding note");
  }
};

/**
 * GET /
 * Search Notes Page
 */
exports.dashboardSearch = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.redirect('/auth/google');
  }

  try {
    res.render("dashboard/search", {
      searchResults: "",
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading search page");
  }
};

/**
 * POST /
 * Search Notes
 */
exports.dashboardSearchSubmit = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.redirect('/auth/google');
    }

    const searchTerm = req.body.searchTerm;
    const cleanTerm = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const searchResults = await Note.find({
      $or: [
        { title: { $regex: new RegExp(cleanTerm, "i") } },
        { body: { $regex: new RegExp(cleanTerm, "i") } },
      ],
      user: req.user._id,
    }).lean();

    res.render("dashboard/search", {
      searchResults,
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error performing search");
  }
};
