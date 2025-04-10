import React, { useState } from 'react';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, description: 'Task 1', assignedBy: 'Admin', assignedTo: 'John', priority: 'High', startTime: '2025-04-01', dueDate: '2025-04-05', completedAt: '', link: '' },
    { id: 2, description: 'Task 2', assignedBy: 'Admin', assignedTo: 'Sarah', priority: 'Medium', startTime: '2025-04-02', dueDate: '2025-04-06', completedAt: '', link: '' },
  ]);

  const handleAddLink = (taskId, link) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, link: link };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Tasks</h1>
      <table className="min-w-full mt-4 border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Task ID</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Assigned By</th>
            <th className="border p-2">Assigned To</th>
            <th className="border p-2">Priority</th>
            <th className="border p-2">Start Time</th>
            <th className="border p-2">Due Date</th>
            <th className="border p-2">Completed At</th>
            <th className="border p-2">Link</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td className="border p-2">{task.id}</td>
              <td className="border p-2">{task.description}</td>
              <td className="border p-2">{task.assignedBy}</td>
              <td className="border p-2">{task.assignedTo}</td>
              <td className="border p-2">{task.priority}</td>
              <td className="border p-2">{task.startTime}</td>
              <td className="border p-2">{task.dueDate}</td>
              <td className="border p-2">{task.completedAt}</td>
              <td className="border p-2">
                <input 
                  type="text" 
                  value={task.link} 
                  onChange={(e) => handleAddLink(task.id, e.target.value)} 
                  placeholder="Add link" 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tasks;
