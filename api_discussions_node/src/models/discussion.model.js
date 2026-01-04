const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    userIds: {
      type: [Number],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 1 && value.every((id) => Number.isInteger(id) && id > 0);
        },
        message: 'userIds must be an array of integers > 0 with at least one element.',
      },
    },
  },
  { timestamps: true }
);

discussionSchema.index({ userIds: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);
