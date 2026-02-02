import { useState, useEffect, useCallback } from 'react';
import { projectAPI, boardAPI, taskAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useProjectsWithStats() {
  const [projectsWithStats, setProjectsWithStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: projectsData } = await projectAPI.getAll();
      const withStats = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const boardsRes = await boardAPI.getByProject(project._id);
            const boardsList = boardsRes.data || [];
            let total = 0, completed = 0;
            for (const board of boardsList) {
              try {
                const tasksRes = await taskAPI.getByBoard(board._id);
                const d = tasksRes.data;
                const list = Array.isArray(d) ? d : (d?.tasks ?? []);
                total += list.length;
                completed += list.filter((t) => t.status === 'completed').length;
              } catch (_) {}
            }
            return { ...project, stats: { boards: boardsList.length, tasks: total, completed } };
          } catch (_) {
            return { ...project, stats: { boards: 0, tasks: 0, completed: 0 } };
          }
        })
      );
      setProjectsWithStats(withStats);
    } catch (err) {
      setError(err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { projectsWithStats, loading, error, refetch };
}
