import React, { useState, useEffect } from 'react';
import '../../Styles/ExpenseDetails.scss';
import * as XLSX from 'xlsx';
import { realtimeDb, ref, get } from '../../Backend/realtime';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExpenseDetails = () => {
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate, setSearchDate] = useState('');
  const [userId, setUserId] = useState(null);
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
      try {
        const expensesRef = ref(realtimeDb, `users/${userId}/expenses`);
        const snapshot = await get(expensesRef);

        if (snapshot.exists()) {
          const expenseData = [];
          let index = 1;
          snapshot.forEach((childSnapshot) => {
            expenseData.push({
              id: childSnapshot.key,
              sıra: index++,
              ...childSnapshot.val(),
            });
          });
          setExpenses(expenseData);
        } else {
          setExpenses([]);
        }
      } catch (err) {
        toast.error('Xərclər çəkilərkən xəta: ' + err.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };

    fetchExpenses();
  }, [userId]);

  const filteredExpenses = searchDate
    ? expenses.filter((expense) => expense.date.includes(searchDate))
    : expenses;

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    const exportData = expenses.map(({ id, ...rest }) => ({
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
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
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
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="expense-details-container">
      <h2>Xərc Məlumatları</h2>

      <div className="search-bar">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          placeholder="Tarixə görə axtar"
        />
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="loader"></div>
        // <p className="no-data">Hələ xərc məlumatı yoxdur.</p>
      ) : (
        <>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Kateqoriya</th>
                <th>Məbləğ (₼)</th>
                <th>Qeyd</th>
                <th>Tarix</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.sıra}</td>
                  <td>{expense.category}</td>
                  <td>{expense.amount.toFixed(2)}</td>
                  <td>{expense.note || '-'}</td>
                  <td>{expense.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Əvvəlki
            </button>
            <span>
              Səhifə {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Növbəti
            </button>
          </div>
        </>
      )}

      <div className="table-actions">
        <button onClick={exportToExcel} className="export-btn">
          Excel-ə Çıxar
        </button>
        <label className="import-btn">
          Excel-dən Yüklə
          <input type="file" accept=".xlsx, .xls" onChange={importFromExcel} hidden />
        </label>
      </div>
    </div>
  );
};

export default ExpenseDetails;