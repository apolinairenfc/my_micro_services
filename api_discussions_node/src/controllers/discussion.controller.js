const mongoose = require('mongoose');
const Discussion = require('../models/discussion.model');

const mapDiscussion = (doc) => ({
  id: doc._id.toString(),
  title: doc.title,
  userIds: doc.userIds,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const validateTitle = (title) => {
  if (typeof title !== 'string') {
    return 'Title must be a string.';
  }

  const trimmed = title.trim();
  if (trimmed.length < 3 || trimmed.length > 120) {
    return 'Title must be 3..120 characters.';
  }

  return null;
};

const validateUserIds = (userIds) => {
  if (!Array.isArray(userIds)) {
    return 'userIds must be an array.';
  }

  if (userIds.length < 1) {
    return 'userIds must contain at least one element.';
  }

  for (const id of userIds) {
    if (!Number.isInteger(id) || id <= 0) {
      return 'Each userId must be an integer greater than 0.';
    }
  }

  return null;
};

const getPagination = (query) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 20;
  const offset = query.offset ? parseInt(query.offset, 10) : 0;

  return {
    limit: Number.isNaN(limit) || limit < 1 ? 20 : limit,
    offset: Number.isNaN(offset) || offset < 0 ? 0 : offset,
  };
};

const createDiscussion = async (req, res, next) => {
  try {
    const { title, userIds } = req.body || {};
    const errors = [];

    const titleError = validateTitle(title);
    if (titleError) {
      errors.push({ field: 'title', message: titleError });
    }

    const userIdsError = validateUserIds(userIds);
    if (userIdsError) {
      errors.push({ field: 'userIds', message: userIdsError });
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'validation_error', details: errors });
    }

    const discussion = await Discussion.create({
      title: title.trim(),
      userIds,
    });

    return res.status(201).json({ data: mapDiscussion(discussion) });
  } catch (error) {
    return next(error);
  }
};

const listDiscussions = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { limit, offset } = getPagination(req.query);

    const filter = {};
    if (userId !== undefined) {
      const parsedUserId = parseInt(userId, 10);
      if (!Number.isNaN(parsedUserId)) {
        filter.userIds = parsedUserId;
      }
    }

    const total = await Discussion.countDocuments(filter);
    const discussions = await Discussion.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    return res.status(200).json({
      data: discussions.map(mapDiscussion),
      meta: { limit, offset, total },
    });
  } catch (error) {
    return next(error);
  }
};

const getDiscussionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'invalid_id' });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ error: 'not_found' });
    }

    return res.status(200).json({ data: mapDiscussion(discussion) });
  } catch (error) {
    return next(error);
  }
};

const updateDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'invalid_id' });
    }

    const { title, userIds } = req.body || {};
    const errors = [];

    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) {
        errors.push({ field: 'title', message: titleError });
      }
    }

    if (userIds !== undefined) {
      const userIdsError = validateUserIds(userIds);
      if (userIdsError) {
        errors.push({ field: 'userIds', message: userIdsError });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'validation_error', details: errors });
    }

    if (title === undefined && userIds === undefined) {
      return res.status(400).json({
        error: 'validation_error',
        details: [{ field: 'body', message: 'At least one field is required.' }],
      });
    }

    const update = {};
    if (title !== undefined) {
      update.title = title.trim();
    }
    if (userIds !== undefined) {
      update.userIds = userIds;
    }

    const discussion = await Discussion.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!discussion) {
      return res.status(404).json({ error: 'not_found' });
    }

    return res.status(200).json({ data: mapDiscussion(discussion) });
  } catch (error) {
    return next(error);
  }
};

const deleteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'invalid_id' });
    }

    const discussion = await Discussion.findByIdAndDelete(id);
    if (!discussion) {
      return res.status(404).json({ error: 'not_found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDiscussion,
  listDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
};
