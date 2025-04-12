// src/Pages/ExpenseDetails/ExpenseDetails.jsx
import React, { useState, useEffect } from 'react';
import '../../Styles/ExpenseDetails.scss';
import * as XLSX from 'xlsx';
import { db, collection, getDocs } from '../../firebase';

const ExpenseDetails = () => {
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate, setSearchDate] = useState('');
  const itemsPerPage = 10;

  // Firebase'den harcamaları çek
  useEffect(() => {
    const fetchExpenses = async () => {
      const querySnapshot = await getDocs(collection(db, 'users', 'user-id', 'expenses'));
      const expenseData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExpenses(expenseData);
    };
    fetchExpenses();
  }, []);

  // Tarihe göre filtreleme
  const filteredExpenses = searchDate
    ? expenses.filter((expense) => expense.date.includes(searchDate))
    : expenses;

  // Sayfalama
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Excel'e çıkarma
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(expenses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Xərclər');
    XLSX.writeFile(workbook, 'xercler.xlsx');
  };

  // Excel'den yükleme (Firebase'e kaydetmek için ekleme yapılabilir)
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(worksheet);
      setExpenses(importedData);
      // İsteğe bağlı: Firebase'e kaydetmek için bir fonksiyon eklenebilir
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
        <p className="no-data">Hələ xərc məlumatı yoxdur.</p>
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
              {paginatedExpenses.map((expense, index) => (
                <tr key={expense.id}>
                  <td>{startIndex + index + 1}</td>
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