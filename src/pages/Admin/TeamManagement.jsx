import { useEffect, useState } from 'react';
import { teamAPI, boardAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users } from 'lucide-react';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ boardId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boardsRes, usersRes] = await Promise.all([
        boardAPI.getAll(),
        userAPI.getAll(),
      ]);
      setBoards(boardsRes.data);
      setUsers(usersRes.data);

      // Fetch teams for each board
      const teamsData = [];
      for (const board of boardsRes.data) {
        try {
          const teamRes = await teamAPI.getByBoard(board._id);
          teamsData.push({ ...teamRes.data, boardTitle: board.title });
        } catch (err) {
          // Board might not have a team
        }
      }
      setTeams(teamsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await teamAPI.create({ boardId: formData.boardId });
      toast.success('Team created successfully');
      setShowModal(false);
      setFormData({ boardId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create team');
    }
  };

  const handleAddMember = async (teamId, userId) => {
    try {
      await teamAPI.addMember(teamId, userId);
      toast.success('Member added successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await teamAPI.removeMember(teamId, userId);
      toast.success('Member removed successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-2 text-gray-600">Manage teams and assign members to boards</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Team</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div key={team._id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary-600" />
                <h3 className="text-xl font-semibold">{team.boardTitle || 'Team'}</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Members ({team.members?.length || 0})</p>
              <div className="space-y-2">
                {team.members?.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{member.name} ({member.email})</span>
                    <button
                      onClick={() => handleRemoveMember(team._id, member._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="label text-sm">Add Member</label>
              <select
                className="input-field"
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddMember(team._id, e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Select a user...</option>
                {users
                  .filter((user) => !team.members?.some((m) => m._id === user._id))
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="card text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No teams created yet. Create a team for a board to get started.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="label">Select Board</label>
                <select
                  className="input-field"
                  value={formData.boardId}
                  onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
                  required
                >
                  <option value="">Select a board...</option>
                  {boards
                    .filter((board) => !teams.some((team) => team.board === board._id))
                    .map((board) => (
                      <option key={board._id} value={board._id}>
                        {board.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData({ boardId: '' }); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;

