import { Tag } from '../models/tag.mjs' ;

export const   createTag = (req, res) => {
  Tag.create(req.body, (err, tagId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: tagId });
  });
};

export const   getAllTags = (req, res) => {
  Tag.getAll((err, tags) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(tags);
  });
};

export const   getTagById = (req, res) => {
  Tag.getById(req.params.id, (err, tag) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    res.json(tag);
  });
};

export const   getTagsByProjectId = (req, res) => {
  Tag.getByProjectId(req.params.projectId, (err, tags) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(tags);
  });
};

export const   updateTag = (req, res) => {
  Tag.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Tag updated successfully' });
  });
};

export const   deleteTag = (req, res) => {
  Tag.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Tag deleted successfully' });
  });
};

export const tagController = {
  createTag,
getAllTags,
getTagById,
getTagsByProjectId,
updateTag,
deleteTag,


}

