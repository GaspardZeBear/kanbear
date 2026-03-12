import { Column } from '../models/column.mjs'

export const   createColumn = (req, res) => {
  Column.create(req.body, (err, columnId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: columnId });
  });
};

export const   getAllColumns = (req, res) => {
  Column.getAll((err, columns) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(columns);
  });
};

export const   getColumnById = (req, res) => {
  Column.getById(req.params.id, (err, column) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!column) return res.status(404).json({ error: 'Column not found' });
    res.json(column);
  });
};

export const   getColumnsByProjectId = (req, res) => {
  Column.getByProjectId(req.params.projectId, (err, columns) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(columns);
  });
};

export const   updateColumn = (req, res) => {
  Column.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Column updated successfully' });
  });
};

export const   deleteColumn = (req, res) => {
  Column.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Column deleted successfully' });
  });
};

export const columnController = {createColumn,
getAllColumns,
getColumnById,
getColumnsByProjectId,
updateColumn,
deleteColumn,

}


