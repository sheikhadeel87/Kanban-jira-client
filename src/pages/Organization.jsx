import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { organizationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Users, UserPlus, Trash2, Mail, Shield, Crown, User, Edit2, Check, X} from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const Organization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  useEffect(() => {
    fetchOrganization();
    fetchUsers();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await organizationAPI.getMy();
      setOrganization(response.data);
    } catch (error) {
      toast.error('Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await organizationAPI.getUsers();
      setOrgUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setInviteLoading(true);
    try {
      const response = await organizationAPI.invite(inviteEmail, inviteRole);
      const data = response.data;

      if (data.emailSent) {
        toast.success(`Invitation email sent successfully to ${inviteEmail}`);
      } else {
        // Email failed but invitation was created
        toast.success(`Invitation created! Email failed to send.`, {
          duration: 5000,
        });

        // Show invitation link if available
        if (data.invitation?.invitationLink) {
          const link = data.invitation.invitationLink;
          toast(
            (t) => (
              <div className="space-y-2">
                <p className="font-semibold">Share this invitation link:</p>
                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
                  <input
                    type="text"
                    value={link}
                    readOnly
                    className="flex-1 text-sm bg-white px-2 py-1 rounded border"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      toast.success('Link copied!');
                    }}
                    className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                  >
                    Copy
                  </button>
                </div>
                {data.emailError && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ {data.emailError}
                  </p>
                )}
              </div>
            ),
            { duration: 10000 }
          );
        }
      }

      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Invite error:', error);
      const errorMsg = error.response?.data?.msg || error.response?.data?.error || error.message || 'Failed to send invitation';
      toast.error(errorMsg);
      console.error('Full error response:', error.response?.data);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateMember = async (memberId) => {
    if (!organization || !editRole) return;

    const updateData = { role: editRole };
    if (editName?.trim()) updateData.name = editName.trim();

    try {
      await organizationAPI.updateMember(organization._id, memberId, updateData);
      toast.success('Member updated successfully');
      setEditingMember(null);
      setEditName('');
      setEditRole('');
      await fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.msg || error.message || 'Failed to update member';
      toast.error(errorMsg);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!window.confirm('Are you sure you want to delete this organization? This will delete all projects, boards, and tasks. This action cannot be undone.')) {
      return;
    }

    try {
      await organizationAPI.delete(organization._id);
      toast.success('Organization deleted successfully');
      // Redirect to login or handle logout
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete organization');
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete || !organization) return;

    try {
      await organizationAPI.removeMember(organization._id, memberToDelete._id);
      toast.success('Member removed successfully');
      setShowDeleteMemberModal(false);
      setMemberToDelete(null);
      fetchUsers(); // Refresh users list
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to remove member');
    }
  };

  const isOwner = user?.role === 'owner';
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const getRoleBadge = (role) => {
    const badges = {
      owner: <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded flex items-center space-x-1"><Crown className="h-3 w-3" /><span>Owner</span></span>,
      admin: <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded flex items-center space-x-1"><Shield className="h-3 w-3" /><span>Admin</span></span>,
      manager: <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">Manager</span>,
      member: <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded">Member</span>
    };
    return badges[role] || null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!organization) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You don't belong to an organization yet.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Organization Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* LEFT */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="bg-primary-100 p-3 sm:p-4 rounded-lg shrink-0">
                <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2 min-w-0">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 break-words">
                    {organization.name}
                  </h1>

                  {isOwner && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded inline-flex items-center gap-1 shrink-0">
                      <Crown className="h-3 w-3" />
                      <span>Owner</span>
                    </span>
                  )}
                </div>

                {organization.description && (
                  <p className="text-gray-600 mt-2 break-words">
                    {organization.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {orgUsers.length} {orgUsers.length === 1 ? "member" : "members"}
                    </span>
                  </span>

                  {organization.owner && (
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <Crown className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        Owner: {organization.owner?.name || "N/A"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT (Buttons) */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full lg:w-auto lg:justify-end">
              {isAdminOrOwner && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Invite User</span>
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Organization</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Organization Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Organization Members</span>
            </h2>
          </div>

          {orgUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No members yet.</p>
              {isAdminOrOwner && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary"
                >
                  Invite First Member
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {orgUsers.map((orgUser) => {
                const isOwnerUser = organization.owner && (
                  (organization.owner._id?.toString() === orgUser._id.toString()) ||
                  (organization.owner.toString() === orgUser._id.toString())
                );
                
                const isEditing = editingMember === orgUser._id;
                
                return (
                  <div
                    key={orgUser._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                                placeholder="Name"
                              />
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="member">Member</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                onClick={() => handleUpdateMember(orgUser._id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Save"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMember(null);
                                  setEditName('');
                                  setEditRole('');
                                }}
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-gray-900">{orgUser.name}</span>
                              {getRoleBadge(orgUser.role)}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{orgUser.email}</p>
                      </div>
                    </div>
                    {isOwner && !isOwnerUser && (
                      <div className="flex items-center space-x-2">
                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingMember(orgUser._id);
                              setEditName(orgUser.name);
                              setEditRole(orgUser.role);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit member"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setMemberToDelete(orgUser);
                            setShowDeleteMemberModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Invite User to Organization</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    An invitation email will be sent to this address
                  </p>
                </div>
                <div>
                  <label className="label">Role</label>
                  <select
                    className="input-field"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the role for the invited user
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="btn-primary flex-1"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Organization</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{organization.name}</strong>? This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li>All projects in this organization</li>
                <li>All boards and tasks</li>
                <li>All organization members</li>
              </ul>
              <p className="text-red-600 font-semibold mb-6">This action cannot be undone!</p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteOrganization}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete Organization
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Member Confirmation Modal */}
        {showDeleteMemberModal && memberToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Remove Member</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove <strong>{memberToDelete.name}</strong> ({memberToDelete.email}) from this organization?
              </p>
              <p className="text-red-600 font-semibold mb-6">This action cannot be undone!</p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteMember}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  Remove Member
                </button>
                <button
                  onClick={() => {
                    setShowDeleteMemberModal(false);
                    setMemberToDelete(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Organization;
