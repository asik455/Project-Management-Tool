import { createContext, useContext, useState, useEffect } from 'react';

const TemplateContext = createContext();

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

export const TemplateProvider = ({ children }) => {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('taskTemplates');
    return saved ? JSON.parse(saved) : [];
  });

  // Load templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('taskTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskTemplates', JSON.stringify(templates));
  }, [templates]);

  const addTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    return newTemplate.id;
  };

  const updateTemplate = (id, updates) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? {
              ...template,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : template
      )
    );
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
  };

  const getTemplate = (id) => {
    return templates.find((template) => template.id === id);
  };

  const getAllTemplates = () => {
    return templates;
  };

  const getTemplatesByProject = (projectId) => {
    return templates.filter((template) => template.projectId === projectId);
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplate,
        getAllTemplates,
        getTemplatesByProject,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}; 