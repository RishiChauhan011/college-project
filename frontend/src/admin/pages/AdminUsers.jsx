import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fieldFilter, setFieldFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      const res = await fetchApi(`/admin/users?${queryParams.toString()}`);
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredUsers = users.filter((u) => {
    if (fieldFilter === 'All') return true;
    return (u.preferred_field || '').toLowerCase().includes(fieldFilter.toLowerCase());
  });

  return (
    <AdminLayout searchTerm={search} setSearchTerm={setSearch} searchPlaceholder="Search users by name or email...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Users Management</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Total operational awareness of registered personnel ({total} registered).</p>
        </div>
        <Link
          to="/signup"
          className="bg-primary text-white font-data-md text-data-md px-4 py-2 rounded-lg flex items-center hover:bg-surface-tint transition-colors shadow-[2px_2px_6px_rgba(163,177,198,0.4)]"
        >
          <span className="material-symbols-outlined mr-2 text-sm">person_add</span> Register New User
        </Link>
      </div>

      {/* Table Controls */}
      <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="bg-surface px-3 py-1.5 rounded-lg flex items-center w-64 border border-outline-variant/40 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
            <input
              className="bg-transparent border-none outline-none font-data-sm text-data-sm w-full text-on-surface placeholder-on-surface-variant/70 focus:ring-0 p-0"
              placeholder="Filter by name or email..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-data-sm text-[11px] font-bold text-on-surface-variant uppercase">Field:</span>
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="bg-surface border-outline-variant/40 rounded-lg font-data-sm text-data-sm text-on-surface py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]"
            >
              <option value="All">All Fields</option>
              <option value="AI & Data Science">AI &amp; Data Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Cloud">Cloud &amp; DevOps</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-on-surface-variant">
          <button onClick={fetchUsers} className="p-2 hover:text-primary transition-colors rounded-lg hover:bg-surface-bright" title="Refresh">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant/40">
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">User</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Career Focus</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider text-right">Experience</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Skills Tracked</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider text-right">Registered</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
                    Loading user catalog...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const initials = u.name ? u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'US';
                  return (
                    <tr
                      key={u.id}
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="border-b border-outline-variant/30 hover:bg-surface-bright cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-data-md text-data-md mr-3 font-bold">
                            {initials}
                          </div>
                          <div>
                            <div className="font-data-md text-data-md font-semibold text-on-surface">{u.name}</div>
                            <div className="font-data-sm text-data-sm text-on-surface-variant">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-data-md text-data-md text-secondary font-medium">
                        {u.preferred_field || 'Unspecified'}
                      </td>
                      <td className="py-3 px-4 font-data-md text-data-md text-right text-on-surface">
                        {u.experience_years ? `${u.experience_years} Yrs` : 'Entry'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-data-sm text-xs bg-surface-container px-2 py-0.5 rounded font-bold text-primary">
                            {u.skills_count} skills
                          </span>
                          {u.skills && u.skills.length > 0 && (
                            <span className="text-secondary text-xs truncate max-w-[150px]">
                              {u.skills.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-data-sm text-data-sm text-right text-secondary">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/users/${u.id}`);
                          }}
                          className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-secondary">
                    No users matching criteria found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
