import { useState, useEffect, useContext, createContext } from 'react';
import { 
  Search, User, Mail, Briefcase, Building2, Circle, Plus, Edit3, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  LogIn, LogOut, UserPlus
} from 'lucide-react';

const AuthContext = createContext();

function App() {
  return (
    <AuthProvider>
      <DirectoryApp />
    </AuthProvider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access);
        setUser({ token: data.access });
        return { success: true };
      }
      return { success: false, error: data.detail || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

function DirectoryApp() {
  const auth = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // All your existing pagination/people state here...
  const [people, setPeople] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', role: '', department: '', status: 'active'
  });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [peoplePerPage] = useState(10);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    setLoadingPeople(true);
    try {
      const res = await fetch('http://localhost:8000/api/people/');
      const data = await res.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoadingPeople(false);
    }
  };

  // Your existing pagination logic...
  const filteredPeople = people.filter(person =>
    person.first_name.toLowerCase().includes(search.toLowerCase()) ||
    person.last_name.toLowerCase().includes(search.toLowerCase()) ||
    person.role.toLowerCase().includes(search.toLowerCase()) ||
    person.department.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastPerson = currentPage * peoplePerPage;
  const indexOfFirstPerson = indexOfLastPerson - peoplePerPage;
  const currentPeople = filteredPeople.slice(indexOfFirstPerson, indexOfLastPerson);
  const totalPages = Math.ceil(filteredPeople.length / peoplePerPage);

  // API helper with auth
  const apiRequest = async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(auth.user && { Authorization: `Bearer ${auth.user.token}` }),
        ...options.headers
      }
    };
    return fetch(url, config);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.user) return;
    
    try {
      const url = editingId 
        ? `http://localhost:8000/api/people/${editingId}/` 
        : 'http://localhost:8000/api/people/';
      const method = editingId ? 'PUT' : 'POST';
      
      await apiRequest(url, { method, body: JSON.stringify(formData) });
      fetchPeople();
      setFormData({ first_name: '', last_name: '', email: '', role: '', department: '', status: 'active' });
      setEditingId(null);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  const deletePerson = async (id) => {
    if (!auth.user) return;
    if (!confirm('Are you sure?')) return;
    try {
      await apiRequest(`http://localhost:8000/api/people/${id}/`, { method: 'DELETE' });
      fetchPeople();
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const editPerson = (person) => {
    setFormData(person);
    setEditingId(person.id);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const result = await auth.login(loginData.identifier, loginData.password);
    if (!result.success) {
      setLoginError(result.error);
    } else {
      setShowLogin(false);
    }
  };

  // Rest of your JSX with auth checks...
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header with Login Status */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent">
                  People Directory
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {auth.user ? (
                <div className="flex items-center space-x-3 bg-indigo-100 px-4 py-2 rounded-2xl">
                  <User className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold text-indigo-800">Logged in</span>
                  <button onClick={auth.logout} className="p-1 hover:bg-indigo-200 rounded-lg">
                    <LogOut className="h-5 w-5 text-indigo-600" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-2xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}
              <div className="text-sm text-slate-600 font-medium">
                {filteredPeople.length} of {people.length} people
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200/50">
            <div className="flex items-center mb-6">
              <LogIn className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username or Email</label>
                <input
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  type="text"
                  value={loginData.identifier}
                  onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                  placeholder="admin or user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  type="password"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              {loginError && (
                <div className="p-4 bg-red-100 border border-red-300 rounded-2xl text-red-800 text-sm">
                  {loginError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-200"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="px-6 py-3 text-gray-600 font-semibold border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rest of your existing form + table JSX */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Add person button - only for logged in */}
        {auth.user && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 mb-12 p-8">
            <div className="flex items-center mb-8">
              <Plus className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Person' : 'Add New Person'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  type="text"
                  value={formData.first_name}
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  type="text"
                  value={formData.last_name}
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <input
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <input
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-200"
                >
                  {editingId ? 'Update' : 'Add'} Person
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ first_name: '', last_name: '', email: '', role: '', department: '', status: 'active' });
                    }}
                    className="px-6 py-3 text-gray-600 font-semibold border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Table - everyone can view */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                type="text"
                placeholder="Search by name, role, or department..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingPeople ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : currentPeople.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No people found</td>
                  </tr>
                ) : (
                  currentPeople.map((person) => (
                    <tr key={person.id} className="border-b border-slate-200 hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-linear-to-r from-indigo-100 to-purple-100 rounded-xl">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{person.first_name} {person.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-gray-600">{person.email}</td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-indigo-500" />
                          <span>{person.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-purple-500" />
                          <span>{person.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <Circle className={`h-3 w-3 ${person.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                          <span className="text-sm capitalize">{person.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          {auth.user && (
                            <>
                              <button onClick={() => editPerson(person)} className="p-2 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all duration-200 hover:scale-105" title="Edit">
                                <Edit3 className="h-5 w-5" />
                              </button>
                              <button onClick={() => deletePerson(person.id)} className="p-2 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 hover:scale-105" title="Delete">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {!auth.user && <span className="text-sm text-slate-500">Login to edit</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 hover:bg-indigo-100 disabled:opacity-50 rounded-lg transition-all">
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-indigo-100 disabled:opacity-50 rounded-lg transition-all">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-indigo-100 disabled:opacity-50 rounded-lg transition-all">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 hover:bg-indigo-100 disabled:opacity-50 rounded-lg transition-all">
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
