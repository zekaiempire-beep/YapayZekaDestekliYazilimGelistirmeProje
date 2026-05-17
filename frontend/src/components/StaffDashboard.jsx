import React, { useState, useEffect } from 'react';
import './RoleBasedDashboards.css';
import { ExamManagement } from './ExamManagement';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [showExamManagement, setShowExamManagement] = useState(false);
  const [exams, setExams] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showResults) {
      fetchStaffExamResults();
    }
  }, [showResults]);

  const fetchStaffExamResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/exams/results/staff/${user?.id}`);
      const results = response.data;

      // Map StudentExamResult format to display format
      const formattedExams = results.map(result => {
        const correctCount = result.studentAnswers
          ? Object.keys(result.studentAnswers).filter(key => 
              result.studentAnswers[key] === result.exam?.questions[parseInt(key)]?.correctAnswer
            ).length
          : 0;
        
        return {
          ...result.exam,
          score: result.score,
          correctCount,
          studentAnswers: result.studentAnswers,
          submittedAt: result.submittedAt,
        };
      });

      setExams(formattedExams);
    } catch (error) {
      console.error('Sınav sonuçları yüklenirken hata:', error);
      alert('Sınav sonuçları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (exams.length === 0) {
      alert('İndirilecek sonuç bulunmamaktadır');
      return;
    }

    // CSV header
    const headers = ['Sınav Adı', 'Konu', 'Toplam Soru', 'Doğru', 'Yanlış', 'Başarı %', 'Tamamlama Tarihi'];
    
    // CSV rows
    const rows = exams.map(exam => {
      const totalQuestions = exam.questions?.length || 0;
      const correctCount = exam.correctCount || 0;
      const wrongCount = totalQuestions - correctCount;
      const date = new Date(exam.submittedAt).toLocaleDateString('tr-TR');

      return [
        `"${exam.name}"`,
        `"${exam.subject}"`,
        totalQuestions,
        correctCount,
        wrongCount,
        exam.score,
        date
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sinav_sonuclari_${new Date().getTime()}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  if (showExamManagement) {
    return <ExamManagement onBack={() => setShowExamManagement(false)} isStaff={true} />;
  }

  if (showResults) {
    return (
      <div className="dashboard-section">
        <button className="back-btn" onClick={() => setShowResults(false)}>← Geri Dön</button>
        <h2>Sınav Sonuçları</h2>
        
        <div className="results-container">
          {loading ? (
            <div className="empty-state">
              <p>⏳ Sonuçlar yükleniyor...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="empty-state">
              <p>Henüz tamamlanan sınav bulunmamaktadır.</p>
            </div>
          ) : (
            <>
              <button className="download-btn" onClick={downloadCSV}>
                ⬇️ CSV olarak İndir
              </button>
              
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Sınav Adı</th>
                    <th>Konu</th>
                    <th>Toplam Soru</th>
                    <th>Doğru</th>
                    <th>Yanlış</th>
                    <th>Başarı %</th>
                    <th>Tamamlama Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => {
                    const totalQuestions = exam.questions?.length || 0;
                    const correctCount = exam.correctCount || 0;
                    const wrongCount = totalQuestions - correctCount;

                    return (
                      <tr key={exam.id}>
                        <td><strong>{exam.name}</strong></td>
                        <td>{exam.subject}</td>
                        <td>{totalQuestions}</td>
                        <td><span style={{color: '#10b981'}}>{correctCount}</span></td>
                        <td><span style={{color: '#ef4444'}}>{wrongCount}</span></td>
                        <td><strong style={{color: exam.score >= 70 ? '#10b981' : '#ef4444'}}>{exam.score}%</strong></td>
                        <td>{new Date(exam.submittedAt).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showExamManagement) {
    return <ExamManagement onBack={() => setShowExamManagement(false)} isStaff={true} />;
  }

  return (
    <div className="dashboard-section">
      <h2>Personel Paneli</h2>
      <div className="staff-actions">
        <button className="action-btn" onClick={() => setShowExamManagement(true)}>Sınavları Yönet</button>
      </div>
    </div>
  );
};
