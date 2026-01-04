const express = require('express');
const controller = require('../controllers/discussion.controller');

const router = express.Router();

router.post('/discussions', controller.createDiscussion);
router.get('/discussions', controller.listDiscussions);
router.get('/discussions/:id', controller.getDiscussionById);
router.put('/discussions/:id', controller.updateDiscussion);
router.delete('/discussions/:id', controller.deleteDiscussion);

module.exports = router;
