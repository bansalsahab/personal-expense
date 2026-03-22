import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import { Profile } from './pages/Profile';
import './index.css';

const CATEGORIES = {
  food: { icon: '🍔', label: 'Food', color: '#fff3e0' },
  transport: { icon: '🚗', label: 'Transport', color: '#e3f2fd' },
  shopping: { icon: '🛒', label: 'Shopping', color: '#fce4ec' },
  bills: { icon: '📄', label: 'Bills', color: '#f3e5f5' },
  entertainment: { icon: '🎬', label: 'Entertainment', color: '#e8f5e9' },
  health: { icon: '💊', label: 'Health', color: '#ffebee' },
  education: { icon: '📚', label: 'Education', color: '#e0f7fa' },
  salary: { icon: '💰', label: 'Salary', color: '#e8f5e9' },
  other: { icon: '📦', label: 'Other', color: '#f5f5f5' }
};

const API_URL = 'http://localhost:5000/api/transactions';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    text: '',
    amount: '',
    category: 'food',
    type: 'expense'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(API_URL);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.text || !formData.amount) return;

    const amount = formData.type === 'expense' 
      ? -Math.abs(Number(formData.amount))
      : Math.abs(Number(formData.amount));

    try {
      const res = await axios.post(API_URL, {
        text: formData.text,
        amount,
        category: formData.category
      });
      setTransactions([res.data, ...transactions]);
      setShowModal(false);
      setFormData({ text: '', amount: '', category: 'food', type: 'expense' });
      setActiveView('transactions');
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && ((filter === 'income' && t.amount < 0) || (filter === 'expense' && t.amount > 0))) return false;
    if (searchQuery && !t.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalIncome = transactions.reduce((acc, t) => (t.amount > 0 ? acc + t.amount : acc), 0);
  const totalExpense = transactions.reduce((acc, t) => (t.amount < 0 ? acc + Math.abs(t.amount) : acc), 0);
  const balance = totalIncome - totalExpense;

  const categorySummary = Object.keys(CATEGORIES).map(key => ({
    ...CATEGORIES[key],
    key,
    amount: transactions
      .filter(t => t.category === key)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (activeView === 'profile') {
    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">💰</div>
              <h1>ExpenseTrack</h1>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">Menu</div>
              <div className={`nav-item`} onClick={() => setActiveView('dashboard')}>
                <span className="nav-item-icon">📊</span>
                <span>Dashboard</span>
              </div>
              <div className={`nav-item`} onClick={() => setActiveView('transactions')}>
                <span className="nav-item-icon">📋</span>
                <span>Transactions</span>
              </div>
              <div className={`nav-item`} onClick={() => setActiveView('summary')}>
                <span className="nav-item-icon">📈</span>
                <span>Summary</span>
              </div>
              <div className={`nav-item active`} onClick={() => setActiveView('profile')}>
                <span className="nav-item-icon">👤</span>
                <span>Profile</span>
              </div>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <h4>{user?.name}</h4>
                <p>{user?.email}</p>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="header">
            <div className="header-left">
              <h2>Profile Settings</h2>
              <p>Manage your account</p>
            </div>
          </header>

          <div className="content-area">
            <Profile />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">💰</div>
            <h1>ExpenseTrack</h1>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Menu</div>
            <div 
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <span className="nav-item-icon">📊</span>
              <span>Dashboard</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveView('transactions')}
            >
              <span className="nav-item-icon">📋</span>
              <span>Transactions</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveView('summary')}
            >
              <span className="nav-item-icon">📈</span>
              <span>Summary</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveView('profile')}
            >
              <span className="nav-item-icon">👤</span>
              <span>Profile</span>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h4>{user?.name}</h4>
              <p>{user?.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h2>{activeView === 'dashboard' ? 'Dashboard' : activeView === 'transactions' ? 'Transactions' : 'Summary'}</h2>
            <p>Manage your expenses and income</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <span>+</span> Add Transaction
            </button>
          </div>
        </header>

        <div className="content-area">
          {activeView === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <h3>Total Balance</h3>
                      <div className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(balance)}
                      </div>
                    </div>
                    <div className="stat-card-icon balance">💵</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <h3>Total Income</h3>
                      <div className="stat-value income">{formatCurrency(totalIncome)}</div>
                    </div>
                    <div className="stat-card-icon income">📈</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <h3>Total Expenses</h3>
                      <div className="stat-value expense">{formatCurrency(totalExpense)}</div>
                    </div>
                    <div className="stat-card-icon expense">📉</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <h3>Transactions</h3>
                      <div className="stat-value">{transactions.length}</div>
                    </div>
                    <div className="stat-card-icon count">📝</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>Recent Transactions</h3>
                    <button className="btn btn-secondary" onClick={() => setActiveView('transactions')}>
                      View All
                    </button>
                  </div>
                  <div className="card-body">
                    {filteredTransactions.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h4>No transactions yet</h4>
                        <p>Add your first transaction to get started</p>
                      </div>
                    ) : (
                      filteredTransactions.slice(0, 5).map((t) => (
                        <div key={t.id} className="transaction-item">
                          <div className="transaction-info">
                            <div 
                              className="transaction-icon"
                              style={{ background: CATEGORIES[t.category]?.color || '#f5f5f5' }}
                            >
                              {CATEGORIES[t.category]?.icon || '📦'}
                            </div>
                            <div className="transaction-details">
                              <h4>{t.text}</h4>
                              <p>{CATEGORIES[t.category]?.label || 'Other'} • {formatDate(t.date)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="transaction-amount">
                              <div className={`amount ${t.amount > 0 ? 'income' : 'expense'}`}>
                                {t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                              </div>
                            </div>
                            <button className="delete-btn" onClick={() => handleDelete(t.id)}>×</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3>Spending by Category</h3>
                  </div>
                  <div className="card-body">
                    {categorySummary.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <h4>No data yet</h4>
                        <p>Start tracking to see your spending breakdown</p>
                      </div>
                    ) : (
                      <div className="summary-cards">
                        {categorySummary.slice(0, 6).map((cat) => (
                          <div key={cat.key} className="summary-card">
                            <div className={`summary-icon ${cat.key}`}>
                              {cat.icon}
                            </div>
                            <div className="summary-details">
                              <h4>{cat.label}</h4>
                              <p>{formatCurrency(cat.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'transactions' && (
            <>
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-body">
                  <div className="filter-bar">
                    <div className="search-input">
                      <span>🔍</span>
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="tabs">
                      <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                      >
                        All
                      </button>
                      <button
                        className={`tab ${filter === 'income' ? 'active' : ''}`}
                        onClick={() => setFilter('income')}
                      >
                        Income
                      </button>
                      <button
                        className={`tab ${filter === 'expense' ? 'active' : ''}`}
                        onClick={() => setFilter('expense')}
                      >
                        Expenses
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  {filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <h4>No transactions found</h4>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Transaction</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th style={{ width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((t) => (
                            <tr key={t.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div 
                                    className="transaction-icon"
                                    style={{ background: CATEGORIES[t.category]?.color || '#f5f5f5' }}
                                  >
                                    {CATEGORIES[t.category]?.icon || '📦'}
                                  </div>
                                  <span style={{ fontWeight: '500' }}>{t.text}</span>
                                </div>
                              </td>
                              <td>
                                <span className="category-badge">
                                  {CATEGORIES[t.category]?.icon} {CATEGORIES[t.category]?.label || 'Other'}
                                </span>
                              </td>
                              <td style={{ color: '#6b7280' }}>{formatDate(t.date)}</td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{ 
                                  fontWeight: '600',
                                  color: t.amount > 0 ? '#2e7d32' : '#c62828'
                                }}>
                                  {t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                                </span>
                              </td>
                              <td>
                                <button className="delete-btn" onClick={() => handleDelete(t.id)}>×</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === 'summary' && (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '28px' }}>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <h3>Total Income</h3>
                      <div className="stat-value income">{formatCurrency(totalIncome)}</div>
                    </div>
                    <div className="stat-card-icon income">📈</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <h3>Total Expenses</h3>
                      <div className="stat-value expense">{formatCurrency(totalExpense)}</div>
                    </div>
                    <div className="stat-card-icon expense">📉</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <h3>Net Savings</h3>
                      <div className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(balance)}
                      </div>
                    </div>
                    <div className="stat-card-icon balance">💰</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>Expenses by Category</h3>
                  </div>
                  <div className="card-body">
                    {categorySummary.filter(c => 
                      transactions.some(t => t.category === c.key && t.amount < 0)
                    ).length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <h4>No expense data</h4>
                        <p>Add expenses to see your spending breakdown</p>
                      </div>
                    ) : (
                      <div className="summary-cards">
                        {categorySummary
                          .filter(c => transactions.some(t => t.category === c.key && t.amount < 0))
                          .map((cat) => (
                            <div key={cat.key} className="summary-card">
                              <div className={`summary-icon ${cat.key}`}>
                                {cat.icon}
                              </div>
                              <div className="summary-details">
                                <h4>{cat.label}</h4>
                                <p>{formatCurrency(cat.amount)}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3>Recent Activity</h3>
                  </div>
                  <div className="card-body">
                    {transactions.slice(0, 8).map((t) => (
                      <div key={t.id} className="transaction-item">
                        <div className="transaction-info">
                          <div 
                            className="transaction-icon"
                            style={{ background: CATEGORIES[t.category]?.color || '#f5f5f5' }}
                          >
                            {CATEGORIES[t.category]?.icon || '📦'}
                          </div>
                          <div className="transaction-details">
                            <h4>{t.text}</h4>
                            <p>{formatDate(t.date)}</p>
                          </div>
                        </div>
                        <div className="transaction-amount">
                          <div className={`amount ${t.amount > 0 ? 'income' : 'expense'}`}>
                            {t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Transaction</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Transaction Type</label>
                  <div className="tabs">
                    <button
                      type="button"
                      className={`tab ${formData.type === 'expense' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      className={`tab ${formData.type === 'income' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                    >
                      Income
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount (USD)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {Object.entries(CATEGORIES).map(([key, val]) => (
                        <option key={key} value={key}>{val.icon} {val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ padding: '0 24px 24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
