import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Copy } from 'lucide-react';
import { useTemplate } from '../../contexts/TemplateContext';
import { useActivityLog } from '../../contexts/ActivityLogContext';

const TaskTemplates = ({ projectId, onUseTemplate }) => {
  const { templates, addTemplate, updateTemplate, deleteTemplate, getTemplatesByProject } =
    useTemplate();
  const { addActivity } = useActivityLog();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    priority: 'medium',
    estimatedHours: '',
    checklist: [],
    projectId: projectId || '',
  });

  const projectTemplates = projectId ? getTemplatesByProject(projectId) : templates;

  const handleAddTemplate = () => {
    if (newTemplate.name.trim()) {
      const templateId = addTemplate(newTemplate);
      addActivity({
        type: 'create',
        entityType: 'template',
        entityId: templateId,
        message: `New task template "${newTemplate.name}" was created`,
      });
      setNewTemplate({
        name: '',
        description: '',
        priority: 'medium',
        estimatedHours: '',
        checklist: [],
        projectId: projectId || '',
      });
      setIsAdding(false);
    }
  };

  const handleUpdateTemplate = (id) => {
    if (newTemplate.name.trim()) {
      updateTemplate(id, newTemplate);
      addActivity({
        type: 'update',
        entityType: 'template',
        entityId: id,
        message: `Task template "${newTemplate.name}" was updated`,
      });
      setNewTemplate({
        name: '',
        description: '',
        priority: 'medium',
        estimatedHours: '',
        checklist: [],
        projectId: projectId || '',
      });
      setEditingId(null);
    }
  };

  const handleDeleteTemplate = (id) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      deleteTemplate(id);
      addActivity({
        type: 'delete',
        entityType: 'template',
        entityId: id,
        message: `Task template "${template.name}" was deleted`,
      });
    }
  };

  const handleUseTemplate = (template) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  const startEditing = (template) => {
    setEditingId(template.id);
    setNewTemplate({
      name: template.name,
      description: template.description,
      priority: template.priority,
      estimatedHours: template.estimatedHours,
      checklist: template.checklist || [],
      projectId: template.projectId,
    });
  };

  const addChecklistItem = () => {
    setNewTemplate((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { text: '', completed: false }],
    }));
  };

  const updateChecklistItem = (index, text) => {
    setNewTemplate((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item, i) =>
        i === index ? { ...item, text } : item
      ),
    }));
  };

  const removeChecklistItem = (index) => {
    setNewTemplate((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Task Templates</h3>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Template</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Template Name
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, description: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="Enter template description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                value={newTemplate.priority}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated Hours
              </label>
              <input
                type="number"
                value={newTemplate.estimatedHours}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, estimatedHours: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter estimated hours"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Checklist
                </label>
                <button
                  onClick={addChecklistItem}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {newTemplate.checklist.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter checklist item"
                    />
                    <button
                      onClick={() => removeChecklistItem(index)}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setNewTemplate({
                    name: '',
                    description: '',
                    priority: 'medium',
                    estimatedHours: '',
                    checklist: [],
                    projectId: projectId || '',
                  });
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => (editingId ? handleUpdateTemplate(editingId) : handleAddTemplate())}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {projectTemplates.map((template) => (
          <div
            key={template.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {template.description}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Priority: {template.priority}
                  </span>
                  {template.estimatedHours && (
                    <span className="text-gray-500 dark:text-gray-400">
                      Est. Hours: {template.estimatedHours}
                    </span>
                  )}
                </div>
                {template.checklist && template.checklist.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium">Checklist:</h5>
                    <ul className="mt-1 space-y-1">
                      {template.checklist.map((item, index) => (
                        <li key={index} className="text-sm text-gray-500 dark:text-gray-400">
                          • {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEditing(template)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTemplates; 