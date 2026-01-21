import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { organizationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Users, UserPlus, Trash2, Mail, Shield, Crown, User } from 'lucide-react';
import Layout from '../components/Layout';

const Organization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      const response = await organizationAPI.invite(inviteEmail);
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

  const isOwner = user?.role === 'owner';
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 p-4 rounded-lg">
                <Building2 className="h-10 w-10 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                  {isOwner && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded flex items-center space-x-1">
                      <Crown className="h-3 w-3" />
                      <span>Owner</span>
                    </span>
                  )}
                </div>
                {organization.description && (
                  <p className="text-gray-600 mt-2">{organization.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{orgUsers.length} {orgUsers.length === 1 ? 'member' : 'members'}</span>
                  </span>
                  {organization.owner && (
                    <span className="flex items-center space-x-1">
                      <Crown className="h-4 w-4" />
                      <span>Owner: {organization.owner?.name || 'N/A'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {isAdminOrOwner && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Invite User</span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-secondary flex items-center space-x-2 text-red-600 hover:bg-red-50"
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
              {orgUsers.map((orgUser) => (
                <div
                  key={orgUser._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{orgUser.name}</span>
                        {orgUser.role === 'owner' && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded flex items-center space-x-1">
                            <Crown className="h-3 w-3" />
                            <span>Owner</span>
                          </span>
                        )}
                        {orgUser.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>Admin</span>
                          </span>
                        )}
                        {orgUser.role === 'member' && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                            Member
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{orgUser.email}</p>
                    </div>
                  </div>
                </div>
              ))}
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
      </div>
    </Layout>
  );
};

export default Organization;
