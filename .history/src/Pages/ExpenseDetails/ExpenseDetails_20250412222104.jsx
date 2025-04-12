import React, { useState, useEffect } from 'react';
import '../../Styles/ExpenseDetails.scss';
import * as XLSX from 'xlsx';
import { realtimeDb, ref, get } from '../../Backend/realtime';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFileExcel, FaUpload, FaSearch, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const ExpenseDetails = () => {
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate, setSearchDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('sıra');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [totalAmount, setTotalAmount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        toast.error('İstifadəçi daxil olmayıb! Zəhmət olmasa daxil olun.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const expensesRef = ref(realtimeDb, `users/${userId}/expenses`);
        const snapshot = await get(expensesRef);

        if (snapshot.exists()) {
          const expenseData = [];
          let index = 1;
          const uniqueCategories = new Set();
          let sum = 0;

          snapshot.forEach((childSnapshot) => {
            const expense = {
              id: childSnapshot.key,
              sıra: index++,
              ...childSnapshot.val(),
            };
            expenseData.push(expense);
            uniqueCategories.add(expense.category);
            sum += parseFloat(expense.amount) || 0;
          });

          setExpenses(expenseData);
          setCategories(Array.from(uniqueCategories));
          setTotalAmount(sum);
        } else {
          setExpenses([]);
          setCategories([]);
          setTotalAmount(0);
        }
      } catch (err) {
        toast.error('Xərclər çəkilərkən xəta: ' + err.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [userId]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortField === 'amount') {
      return sortDirection === 'asc' 
        ? parseFloat(a.amount) - parseFloat(b.amount)
        : parseFloat(b.amount) - parseFloat(a.amount);
    } else if (sortField === 'date') {
      return sortDirection === 'asc'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    } else {
      return sortDirection === 'asc'
        ? a[sortField] > b[sortField] ? 1 : -1
        : a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  const filteredExpenses = sortedExpenses.filter(expense => {
    const matchesDate = dateRange.start && dateRange.end
      ? new Date(expense.date) >= new Date(dateRange.start) && new Date(expense.date) <= new Date(dateRange.end)
      : searchDate
        ? expense.date.includes(searchDate)
        : true;
    
    const matchesSearch = searchTerm
      ? expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.note?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory
      ? expense.category === selectedCategory
      : true;
    
    return matchesDate && matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredExpenses.map(({ id, ...rest }) => ({
      Sıra: rest.sıra,
      Kateqoriya: rest.category,
      'Məbləğ (₼)': rest.amount.toFixed(2),
      Qeyd: rest.note || '-',
      Tarix: rest.date,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Xərclər');
    XLSX.writeFile(workbook, 'xercler.xlsx');
    
    toast.success('Excel faylı uğurla yaradıldı!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const importedData = XLSX.utils.sheet_to_json(worksheet);
        const formattedData = importedData.map((item, index) => ({
          id: `imported-${index}`,
          sıra: index + 1,
          category: item.Kateqoriya || '',
          amount: parseFloat(item['Məbləğ (₼)']) || 0,
          note: item.Qeyd || '',
          date: item.Tarix || '',
        }));
        setExpenses(formattedData);
        
        const uniqueCategories = new Set(formattedData.map(item => item.category));
        setCategories(Array.from(uniqueCategories));
        
        const sum = formattedData.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
        setTotalAmount(sum);
        
        toast.success('Excel faylından uğurla yükləndi!', {
          position: 'top-right',
          autoClose: 2000,
        });
      } catch (error) {
        toast.error('Excel faylı yüklənərkən xəta baş verdi!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const resetFilters = () => {
    setSearchDate('');
    setSearchTerm('');
    setSelectedCategory('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    setSortField('sıra');
    setSortDirection('asc');
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    setSearchDate('');
  };

  return (
    <div className="expense-details-container">
      <div className="expense-header">
        <h2>Xərc Məlumatları</h2>
        <div className="expense-summary">
          <div className="summary-card">
            <span className="summary-title">Ümumi xərclər:</span>
            <span className="summary-value">{totalAmount.toFixed(2)} ₼</span>
          </div>
          <div className="summary-card">
            <span className="summary-title">Qeydlər sayı:</span>
            <span className="summary-value">{expenses.length}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="search-group">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kateqoriya və ya qeydlərə görə axtar..."
              className="search-input"
            />
          </div>
          
          <div className="date-filter-container">
            <button 
              className="date-picker-toggle" 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <FaCalendarAlt /> Tarix seçin
            </button>
            
            {isDatePickerOpen && (
              <div className="date-range-picker">
                <div className="date-input-group">
                  <label>Başlanğıc:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </div>
                <div className="date-input-group">
                  <label>Son:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="category-filter">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Bütün kateqoriyalar</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <button className="reset-filters" onClick={resetFilters}>
            <FaFilter /> Filterleri sıfırla
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
         
      ) : filteredExpenses.length === 0 ? (
        <div className="no-data-container">
          <div className="no-data-icon">📊</div>
          <p className="no-data">Hələ xərc məlumatı yoxdur veya seçilmiş filterlərə uyğun məlumat tapılmadı.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="expense-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('sıra')} className="sortable-header">
                    Sıra {sortField === 'sıra' && (sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </th>
                  <th onClick={() => handleSort('category')} className="sortable-header">
                    Kateqoriya {sortField === 'category' && (sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </th>
                  <th onClick={() => handleSort('amount')} className="sortable-header">
                    Məbləğ (₼) {sortField === 'amount' && (sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </th>
                  <th>Qeyd</th>
                  <th onClick={() => handleSort('date')} className="sortable-header">
                    Tarix {sortField === 'date' && (sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.sıra}</td>
                    <td>
                      <span className="category-badge">{expense.category}</span>
                    </td>
                    <td className="amount-cell">{expense.amount.toFixed(2)}</td>
                    <td className="note-cell">{expense.note || '-'}</td>
                    <td>{expense.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <div className="pagination-info">
              Göstərilən: {filteredExpenses.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredExpenses.length)} / {filteredExpenses.length}
            </div>
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className="pagination-button first-page"
              >
                İlk
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-button prev-page"
              >
                <FaChevronLeft /> Əvvəlki
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-button next-page"
              >
                Növbəti <FaChevronRight />
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className="pagination-button last-page"
              >
                Son
              </button>
            </div>
          </div>
        </>
      )}

      <div className="table-actions">
        <button onClick={exportToExcel} className="action-btn export-btn" disabled={filteredExpenses.length === 0}>
          <FaFileExcel /> Excel-ə Çıxar
        </button>
        <label className="action-btn import-btn">
          <FaUpload /> Excel-dən Yüklə
          <input type="file" accept=".xlsx, .xls" onChange={importFromExcel} hidden />
        </label>
      </div>
    </div>
  );
};

export default ExpenseDetails;