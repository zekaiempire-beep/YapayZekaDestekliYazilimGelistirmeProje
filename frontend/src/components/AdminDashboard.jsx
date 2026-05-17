import React, { useState, useEffect } from 'react';
import './RoleBasedDashboards.css';
import { ExamManagement } from './ExamManagement';
import api from '../services/api';

export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('main');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedExam, setExpandedExam] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [advisorNoteText, setAdvisorNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedQuestionIndexForAi, setSelectedQuestionIndexForAi] = useState(null);
  const [aiNoteText, setAiNoteText] = useState('');
  const [isSavingAiNote, setIsSavingAiNote] = useState(false);
  const [isGeneratingAiNote, setIsGeneratingAiNote] = useState(false);
  const [generalEvaluation, setGeneralEvaluation] = useState('');
  const [isSavingGeneralEvaluation, setIsSavingGeneralEvaluation] = useState(false);
  const [aiGeneralEvaluation, setAiGeneralEvaluation] = useState('');
  const [isSavingAiGeneralEvaluation, setIsSavingAiGeneralEvaluation] = useState(false);
  const [isGeneratingAiEvaluation, setIsGeneratingAiEvaluation] = useState(false);
  const [systemHealth, setSystemHealth] = useState(98);
  const [newHealthValue, setNewHealthValue] = useState(98);

  // Kullanıcıları rol'e göre say
  const studentCount = users.filter(u => u.role === 'student').length;
  const staffCount = users.filter(u => u.role === 'staff' || u.role === 'admin').length;
  
  // Unique sınavları al (her sınav bir kez sayılsın)
  const uniqueExams = Array.from(new Map(examResults.map(result => [result.exam?.id, result.exam])).values());
  
  // Sınav durumlarını sayla (unique sınavlardan)
  const currentExamsCount = uniqueExams.filter(exam => {
    const status = exam?.status;
    return status === 'scheduled' || status === 'active';
  }).length;
  
  const completedExamsCount = uniqueExams.filter(exam => exam?.status === 'completed').length;
  
  // Toplam hazırlanan sınavlar (mevcut + tamamlanan)
  const totalPreparedExams = currentExamsCount + completedExamsCount;

  const systemStats = [
    { 
      label: 'Toplam Kullanıcı', 
      type: 'users',
      value: studentCount + staffCount,
      details: [
        { label: 'Öğrenci', value: studentCount },
        { label: 'Personel', value: staffCount }
      ],
      color: '#667eea' 
    },
    { 
      label: 'Hazırlanan Sınavlar', 
      type: 'exams',
      value: totalPreparedExams,
      details: [
        { label: 'Mevcut', value: currentExamsCount },
        { label: 'Tamamlanan', value: completedExamsCount }
      ],
      color: '#764ba2' 
    },
    { label: 'Sistem Sağlığı', value: `${systemHealth}%`, color: '#4facfe' },
  ];

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers();
    } else if (activeSection === 'reports') {
      // Eğer genel değerlendirme kaydı yapılıyorsa, bekle
      if (isSavingGeneralEvaluation) {
        const timeout = setTimeout(() => {
          fetchExamResults();
        }, 500); // 500ms bekle, sonra fetch et
        return () => clearTimeout(timeout);
      }
      fetchExamResults();
    } else if (activeSection === 'settings') {
      setNewHealthValue(systemHealth);
    }
  }, [activeSection, isSavingGeneralEvaluation]);

  // Component açılırken sınav verilerini yükle (stat kartları için)
  useEffect(() => {
    fetchExamResults();
    
    // 30 saniyelik polling: stat kartlarını güncelle
    const interval = setInterval(() => {
      fetchExamResults();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Component açılırken kullanıcıları yükle (stat kartları için)
  useEffect(() => {
    fetchUsers();
    
    // 30 saniyelik polling: kullanıcıları güncelle
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data);
      filterUsers(response.data, searchTerm, roleFilter);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      alert('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      
      // Tüm sınavları ve öğrenci sonuçlarını yükle
      const [examsResponse, resultsResponse] = await Promise.all([
        api.get('/exams'),
        api.get('/exams/results/admin-all')
      ]);
      
      const exams = examsResponse.data || [];
      const results = resultsResponse.data || [];

      // Stat kartları için: her sınavı bir kez say (pending sınavları da dahil)
      const allExamsForStats = [
        ...results,
        ...exams
          .filter(exam => !results.some(r => r.exam?.id === exam.id))
          .map(exam => ({ exam }))
      ];
      setExamResults(allExamsForStats);

      // Group sonuçları exam'a göre (reports sekmesi için)
      const groupedByExam = {};
      results.forEach(result => {
        const examName = result.exam?.name || 'Bilinmeyen Sınav';
        if (!groupedByExam[examName]) {
          groupedByExam[examName] = [];
        }
        groupedByExam[examName].push(result);
      });

      // Convert to array for easier iteration
      const examList = Object.keys(groupedByExam).map(examName => ({
        name: examName,
        results: groupedByExam[examName],
      }));

      setExams(examList);
    } catch (error) {
      console.error('Sınav sonuçları yüklenirken hata:', error);
      alert('Sınav sonuçları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (userList, search, role) => {
    let filtered = userList;

    if (role !== 'all') {
      filtered = filtered.filter(user => user.role === role);
    }

    if (search.trim()) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterUsers(users, value, roleFilter);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    filterUsers(users, searchTerm, role);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'student':
        return 'Öğrenci';
      case 'staff':
        return 'Personel';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'student':
        return 'student';
      case 'staff':
        return 'staff';
      case 'admin':
        return 'admin';
      default:
        return '';
    }
  };

  const handleAdvisorNoteClick = (questionIndex) => {
    setSelectedQuestionIndex(questionIndex);
    const existingNote = selectedResult?.advisorNotes?.[questionIndex.toString()] || '';
    setAdvisorNoteText(existingNote);
    setShowAdvisorModal(true);
  };

  const handleSaveAdvisorNote = async () => {
    if (!selectedResult || selectedQuestionIndex === null) return;

    try {
      setIsSavingNote(true);

      // Backend'e danışman notunu kaydet (POST endpoint)
      const response = await api.post(`/exams/results/${selectedResult.id}/advisor-note`, {
        questionIndex: selectedQuestionIndex,
        note: advisorNoteText,
      });

      // Backend'den dönen updated result'ı al
      const updatedResult = response.data;
      setSelectedResult(updatedResult);

      // exams state'inde de güncelle
      const updatedExams = exams.map(examGroup => ({
        ...examGroup,
        results: examGroup.results.map(result =>
          result.id === selectedResult.id ? updatedResult : result
        ),
      }));
      setExams(updatedExams);

      setShowAdvisorModal(false);
      setAdvisorNoteText('');
      setSelectedQuestionIndex(null);
      alert('✓ Danışman görüşü başarıyla kaydedildi');
    } catch (error) {
      console.error('Danışman görüşü kaydedilirken hata:', error);
      console.log('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      alert(`Danışman görüşü kaydedilemedi: ${errorMsg}`);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleAiNoteClick = (questionIndex) => {
    setSelectedQuestionIndexForAi(questionIndex);
    const existingNote = selectedResult?.aiNotes?.[questionIndex.toString()] || '';
    setAiNoteText(existingNote);
    setShowAiModal(true);
  };

  const handleSaveAiNote = async () => {
    if (!selectedResult || selectedQuestionIndexForAi === null) return;

    try {
      setIsSavingAiNote(true);

      // Backend'e AI notunu kaydet (POST endpoint)
      const response = await api.post(`/exams/results/${selectedResult.id}/ai-note`, {
        questionIndex: selectedQuestionIndexForAi,
        note: aiNoteText,
      });

      // Backend'den dönen updated result'ı al
      const updatedResult = response.data;
      setSelectedResult(updatedResult);

      // exams state'inde de güncelle
      const updatedExams = exams.map(examGroup => ({
        ...examGroup,
        results: examGroup.results.map(result =>
          result.id === selectedResult.id ? updatedResult : result
        ),
      }));
      setExams(updatedExams);

      setShowAiModal(false);
      setAiNoteText('');
      setSelectedQuestionIndexForAi(null);
      alert('✓ AI görüşü başarıyla kaydedildi');
    } catch (error) {
      console.error('AI görüşü kaydedilirken hata:', error);
      console.log('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      alert(`AI görüşü kaydedilemedi: ${errorMsg}`);
    } finally {
      setIsSavingAiNote(false);
    }
  };

  const handleGenerateAiNote = async () => {
    if (!selectedResult || selectedQuestionIndexForAi === null) return;

    try {
      setIsGeneratingAiNote(true);

      const questionText = selectedResult.exam?.questions?.[selectedQuestionIndexForAi]?.questionText;
      if (!questionText) {
        alert('Soru metni bulunamadı');
        return;
      }

      // Ollama'dan AI görüşü oluştur
      const response = await api.post(`/exams/results/${selectedResult.id}/generate-ai-note`, {
        questionIndex: selectedQuestionIndexForAi,
        questionText: questionText,
      });

      // Dönen AI metni textarea'ya doldur
      setAiNoteText(response.data.aiText);
      alert('✓ AI tarafından görüş oluşturuldu');
    } catch (error) {
      console.error('AI görüşü oluşturulurken hata:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      alert(`AI görüşü oluşturulamadı: ${errorMsg}`);
    } finally {
      setIsGeneratingAiNote(false);
    }
  };

  const handleGenerateAiEvaluation = async () => {
    if (!selectedResult) return;

    try {
      setIsGeneratingAiEvaluation(true);

      // Ollama'dan AI genel değerlendirmesi oluştur
      const response = await api.post(`/exams/results/${selectedResult.id}/generate-ai-evaluation`);

      // Dönen AI metni textarea'ya doldur
      setAiGeneralEvaluation(response.data.aiText);
      alert('✓ AI tarafından genel değerlendirme oluşturuldu');
    } catch (error) {
      console.error('AI değerlendirmesi oluşturulurken hata:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      alert(`AI değerlendirmesi oluşturulamadı: ${errorMsg}`);
    } finally {
      setIsGeneratingAiEvaluation(false);
    }
  };

  const handlePublishResult = async () => {
    if (!selectedResult) return;

    if (!window.confirm('Sınav sonucunu, danışman notlarını, genel değerlendirmeyi ve AI değerlendirmesini öğrenciye göndermek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Publish endpoint'ine danışman notlarını ve genel değerlendirmeleri gönder
      const response = await api.post(`/exams/results/${selectedResult.id}/publish`, {
        advisorNotes: selectedResult.advisorNotes || {},
        generalEvaluation: selectedResult.generalEvaluation || generalEvaluation || '',
        aiGeneralEvaluation: selectedResult.aiGeneralEvaluation || aiGeneralEvaluation || '',
      });

      // Backend'den dönen updated result'ı al
      const updatedResult = response.data;
      setSelectedResult(updatedResult);

      // exams state'inde de güncelle
      const updatedExams = exams.map(examGroup => ({
        ...examGroup,
        results: examGroup.results.map(result =>
          result.id === selectedResult.id ? updatedResult : result
        ),
      }));
      setExams(updatedExams);

      alert('✓ Sınav sonucu, tüm değerlendirmeler ve notlar gönderildi');
      // Refresh exam results to update the list
      await fetchExamResults();
    } catch (error) {
      console.error('Sonuçlar yayınlanırken hata:', error);
      console.log('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      alert(`Sonuçlar yayınlanamadı: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResults = async () => {
    if (!selectedResult) return;

    try {
      setLoading(true);
      
      // Tüm danışman notlarını backend'e gönder
      const response = await api.put(`/exams/results/${selectedResult.id}/advisor-notes`, {
        advisorNotes: selectedResult.advisorNotes || {},
      });

      // Backend'den dönen updated result'ı al
      const updatedResult = response.data;
      setSelectedResult(updatedResult);

      // exams state'inde de güncelle
      const updatedExams = exams.map(examGroup => ({
        ...examGroup,
        results: examGroup.results.map(result =>
          result.id === selectedResult.id ? updatedResult : result
        ),
      }));
      setExams(updatedExams);

      alert('✓ Tüm danışman notları başarıyla kaydedildi');
    } catch (error) {
      console.error('Notlar kaydedilirken hata:', error);
      alert('Notlar kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneralEvaluation = async () => {
    if (!selectedResult) return;

    try {
      setIsSavingGeneralEvaluation(true);
      
      // Genel değerlendirmeyi kaydet (sadece kaydet, yayınlama)
      const response = await api.post(`/exams/results/${selectedResult.id}/general-evaluation`, {
        evaluation: generalEvaluation,
      });

      const updatedResult = response.data;
      setSelectedResult(updatedResult);

      // exams state'inde de güncelle
      const updatedExams = exams.map(examGroup => ({
        ...examGroup,
        results: examGroup.results.map(result =>
          result.id === selectedResult.id ? updatedResult : result
        ),
      }));
      setExams(updatedExams);

      alert('✓ Genel değerlendirme başarıyla kaydedildi');
    } catch (error) {
      console.error('Genel değerlendirme kaydedilirken hata:', error);
      alert('Genel değerlendirme kaydedilemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSavingGeneralEvaluation(false);
    }
  };

  const handleSaveAiGeneralEvaluation = async () => {
    if (!selectedResult) return;

    try {
      setIsSavingAiGeneralEvaluation(true);
      
      // AI genel değerlendirmeyi kaydet (sadece kaydet, yayınlama)
      const response = await api.post(`/exams/results/${selectedResult.id}/ai-general-evaluation`, {
        evaluation: aiGeneralEvaluation,
      });

      const updatedResult = response.data;
      setSelectedResult(updatedResult);

      // exams state'inde de güncelle
      const updatedExams = exams.map(examGroup => ({
        ...examGroup,
        results: examGroup.results.map(result =>
          result.id === selectedResult.id ? updatedResult : result
        ),
      }));
      setExams(updatedExams);

      alert('✓ AI genel değerlendirme başarıyla kaydedildi');
    } catch (error) {
      console.error('AI genel değerlendirme kaydedilirken hata:', error);
      alert('AI genel değerlendirme kaydedilemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSavingAiGeneralEvaluation(false);
    }
  };

  const handlePublishAllResults = async (examId) => {
    if (!window.confirm('Bu sınava ait TÜM sonuçları yayınlamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await api.put(`/exams/${examId}/publish-all`);
      alert('Tüm sonuçlar yayınlandı');
      // Refresh exam results to update the list
      await fetchExamResults();
    } catch (error) {
      console.error('Tüm sonuçlar yayınlanırken hata:', error);
      alert('Tüm sonuçlar yayınlanamadı');
    } finally {
      setLoading(false);
    }
  };

  if (activeSection === 'exams') {
    return <ExamManagement onBack={() => setActiveSection('main')} />;
  }

  if (activeSection === 'reports') {
    // Detay görüntüle
    if (selectedResult) {
      const correctCount = selectedResult.studentAnswers
        ? Object.keys(selectedResult.studentAnswers).filter(key => 
            selectedResult.studentAnswers[key] === selectedResult.exam?.questions[parseInt(key)]?.correctAnswer
          ).length
        : 0;
      
      const totalQuestions = selectedResult.exam?.questions?.length || 0;
      const wrongCount = totalQuestions - correctCount;

      return (
        <div className="dashboard-section">
          <button className="back-btn" onClick={() => setSelectedResult(null)}>← Raporlara Geri Dön</button>
          <h2>Sınav Sonuç Detayları</h2>
          
          <div className="exam-results-container">
            <div className="result-info-header">
              <div className="student-info">
                <h3>👤 {selectedResult.student?.firstName} {selectedResult.student?.lastName}</h3>
                <p className="email">{selectedResult.student?.email}</p>
              </div>
              <div className="exam-info">
                <h3>📋 {selectedResult.exam?.name}</h3>
                <p className="subject">{selectedResult.exam?.subject}</p>
              </div>
            </div>

            <div className="results-summary">
              <div className="result-card">
                <div className="result-icon">📊</div>
                <div className="result-label">Başarı Yüzdesi</div>
                <div className="result-value score-large">{selectedResult.score ?? 0}%</div>
              </div>

              <div className="result-card">
                <div className="result-icon">✅</div>
                <div className="result-label">Doğru Cevaplar</div>
                <div className="result-value correct">{correctCount}/{totalQuestions}</div>
              </div>

              <div className="result-card">
                <div className="result-icon">❌</div>
                <div className="result-label">Yanlış Cevaplar</div>
                <div className="result-value wrong">{wrongCount}/{totalQuestions}</div>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div className="general-evaluation-section">
                <h3>📋 Genel Değerlendirme</h3>
                <textarea
                  value={generalEvaluation}
                  onChange={(e) => setGeneralEvaluation(e.target.value)}
                  placeholder="Öğrencinin genel performansı hakkında değerlendirme yazınız..."
                  className="evaluation-textarea"
                  rows="5"
                />
                <button 
                  className="action-btn primary" 
                  onClick={handleSaveGeneralEvaluation}
                  style={{ marginTop: '15px', width: '100%' }}
                  disabled={isSavingGeneralEvaluation}
                >
                  {isSavingGeneralEvaluation ? '⏳ Kaydediliyor...' : '💾 Genel Değerlendirmeyi Kaydet'}
                </button>
              </div>

              <div className="general-evaluation-section">
                <h3>🤖 AI Genel Değerlendirmesi</h3>
                <textarea
                  value={aiGeneralEvaluation}
                  onChange={(e) => setAiGeneralEvaluation(e.target.value)}
                  placeholder="Yapay zekanın sunduğu genel performans değerlendirmesi..."
                  className="evaluation-textarea"
                  rows="5"
                />
                <button 
                  className="action-btn secondary" 
                  onClick={handleGenerateAiEvaluation}
                  style={{ marginTop: '10px', width: '100%' }}
                  disabled={isGeneratingAiEvaluation}
                >
                  {isGeneratingAiEvaluation ? '⏳ AI Oluşturuluyor...' : '🤖 AI ile Oluştur'}
                </button>
                <button 
                  className="action-btn primary" 
                  onClick={handleSaveAiGeneralEvaluation}
                  style={{ marginTop: '10px', width: '100%' }}
                  disabled={isSavingAiGeneralEvaluation}
                >
                  {isSavingAiGeneralEvaluation ? '⏳ Kaydediliyor...' : '💾 AI Değerlendirmesini Kaydet'}
                </button>
              </div>
            </div>

            <div className="results-detail">
              <h3>Sorulara Verilen Cevaplar</h3>
              <div className="questions-review">
                {selectedResult.exam?.questions?.map((question, index) => {
                  const studentAnswer = selectedResult.studentAnswers?.[index.toString()];
                  const isCorrect = studentAnswer === question.correctAnswer;
                  
                  return (
                    <div key={index} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="question-number">Soru {index + 1}</div>
                      <div className="question-text">{question.questionText}</div>
                      
                      <div className="options-review">
                        {['A', 'B', 'C', 'D'].map((option) => {
                          const optionText = question[`option${option}`];
                          const isStudentAnswer = studentAnswer === option;
                          const isCorrectAnswer = option === question.correctAnswer;
                          
                          return (
                            <div 
                              key={option} 
                              className={`option-review ${
                                isStudentAnswer && isCorrect ? 'student-correct' : 
                                isStudentAnswer && !isCorrect ? 'student-wrong' :
                                isCorrectAnswer && !isStudentAnswer ? 'correct-answer' :
                                ''
                              }`}
                            >
                              <span className="option-letter">{option}</span>
                              <span className="option-text">{optionText}</span>
                              {isStudentAnswer && isCorrect && <span className="badge">✓ Verilen Cevap</span>}
                              {isStudentAnswer && !isCorrect && <span className="badge">✗ Verilen Cevap</span>}
                              {isCorrectAnswer && !isStudentAnswer && <span className="badge">✓ Doğru Cevap</span>}
                            </div>
                          );
                        })}
                      </div>

                      {!isCorrect && (
                        <div className="advisor-note-section">
                          <button 
                            className="advisor-note-btn"
                            onClick={() => handleAdvisorNoteClick(index)}
                          >
                            📝 Danışman Görüşü {selectedResult?.advisorNotes?.[index.toString()] ? '(Düzenle)' : '(Ekle)'}
                          </button>
                          <button 
                            className="advisor-note-btn ai"
                            onClick={() => handleAiNoteClick(index)}
                          >
                            🤖 AI Görüşü {selectedResult?.aiNotes?.[index.toString()] ? '(Düzenle)' : '(Ekle)'}
                          </button>
                          {selectedResult?.advisorNotes?.[index.toString()] && (
                            <div className="advisor-note-display">
                              <p className="note-label">💬 Danışman Görüşü:</p>
                              <p className="note-text">{selectedResult?.advisorNotes?.[index.toString()]}</p>
                            </div>
                          )}
                          {selectedResult?.aiNotes?.[index.toString()] && (
                            <div className="advisor-note-display ai-note">
                              <p className="note-label">🤖 AI Görüşü:</p>
                              <p className="note-text">{selectedResult?.aiNotes?.[index.toString()]}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="detail-actions">
              {!selectedResult?.isPublished && (
                <button 
                  className="publish-btn"
                  onClick={handlePublishResult}
                  disabled={loading}
                >
                  🎯 Sonuçları Gönder
                </button>
              )}
            </div>

            <button 
              className="back-to-exams-btn"
              onClick={() => setSelectedResult(null)}
            >
              ← Raporlara Geri Dön
            </button>
          </div>

          {/* Danışman Görüşü Modal */}
          {showAdvisorModal && (
            <div className="modal-overlay">
              <div className="modal-content advisor-modal">
                <div className="modal-header">
                  <h3>📝 Danışman Görüşü - Soru {selectedQuestionIndex + 1}</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setShowAdvisorModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="question-preview">
                    <p className="label">Soru:</p>
                    <p className="question-text">
                      {selectedResult?.exam?.questions?.[selectedQuestionIndex]?.questionText}
                    </p>
                  </div>

                  <div className="student-answer-preview">
                    <p className="label">Öğrencinin Verdiği Cevap:</p>
                    <p className="answer-text">
                      {selectedResult?.studentAnswers?.[selectedQuestionIndex.toString()]} - {' '}
                      {selectedResult?.exam?.questions?.[selectedQuestionIndex]?.[
                        `option${selectedResult?.studentAnswers?.[selectedQuestionIndex.toString()]}`
                      ]}
                    </p>
                  </div>

                  <div className="correct-answer-preview">
                    <p className="label">Doğru Cevap:</p>
                    <p className="correct-text">
                      {selectedResult?.exam?.questions?.[selectedQuestionIndex]?.correctAnswer} - {' '}
                      {selectedResult?.exam?.questions?.[selectedQuestionIndex]?.[
                        `option${selectedResult?.exam?.questions?.[selectedQuestionIndex]?.correctAnswer}`
                      ]}
                    </p>
                  </div>

                  <div className="advisor-note-input">
                    <label>Danışman Görüşü Ekle / Düzenle:</label>
                    <textarea
                      value={advisorNoteText}
                      onChange={(e) => setAdvisorNoteText(e.target.value)}
                      placeholder="Bu soru hakkında öğrenciye verdiğiniz önerileri yazınız..."
                      rows="5"
                      className="note-textarea"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowAdvisorModal(false)}
                  >
                    İptal
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSaveAdvisorNote}
                    disabled={isSavingNote}
                  >
                    {isSavingNote ? '⏳ Kaydediliyor...' : '✓ Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Görüşü Modal */}
          {showAiModal && (
            <div className="modal-overlay">
              <div className="modal-content advisor-modal">
                <div className="modal-header">
                  <h3>🤖 AI Görüşü - Soru {selectedQuestionIndexForAi + 1}</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setShowAiModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="question-preview">
                    <p className="label">Soru:</p>
                    <p className="question-text">
                      {selectedResult?.exam?.questions?.[selectedQuestionIndexForAi]?.questionText}
                    </p>
                  </div>

                  <div className="student-answer-preview">
                    <p className="label">Öğrencinin Verdiği Cevap:</p>
                    <p className="answer-text">
                      {selectedResult?.studentAnswers?.[selectedQuestionIndexForAi.toString()]} - {' '}
                      {selectedResult?.exam?.questions?.[selectedQuestionIndexForAi]?.[
                        `option${selectedResult?.studentAnswers?.[selectedQuestionIndexForAi.toString()]}`
                      ]}
                    </p>
                  </div>

                  <div className="correct-answer-preview">
                    <p className="label">Doğru Cevap:</p>
                    <p className="correct-text">
                      {selectedResult?.exam?.questions?.[selectedQuestionIndexForAi]?.correctAnswer} - {' '}
                      {selectedResult?.exam?.questions?.[selectedQuestionIndexForAi]?.[
                        `option${selectedResult?.exam?.questions?.[selectedQuestionIndexForAi]?.correctAnswer}`
                      ]}
                    </p>
                  </div>

                  <div className="advisor-note-input">
                    <label>AI Görüşü Ekle / Düzenle:</label>
                    <textarea
                      value={aiNoteText}
                      onChange={(e) => setAiNoteText(e.target.value)}
                      placeholder="Bu soru hakkında yapay zeka tarafından sunulan önerileri yazınız..."
                      rows="5"
                      className="note-textarea"
                    />
                    <button
                      className="action-btn secondary"
                      onClick={handleGenerateAiNote}
                      disabled={isGeneratingAiNote}
                      style={{ marginTop: '10px', width: '100%' }}
                    >
                      {isGeneratingAiNote ? '⏳ AI Oluşturuluyor...' : '🤖 AI ile Oluştur'}
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowAiModal(false)}
                  >
                    İptal
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSaveAiNote}
                    disabled={isSavingAiNote}
                  >
                    {isSavingAiNote ? '⏳ Kaydediliyor...' : '✓ Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Raporlar listesi
    return (
      <div className="dashboard-section">
        <button className="back-btn" onClick={() => setActiveSection('main')}>← Geri Dön</button>
        <h2>Sınav Sonuçları Raporları</h2>
        
        <div className="reports-container">
          {loading ? (
            <div className="empty-state">
              <p>⏳ Raporlar yükleniyor...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="empty-state">
              <p>Henüz tamamlanan sınav bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="exam-categories">
              {exams.map((examGroup) => {
                const isExpanded = expandedExam === examGroup.name;
                const studentCount = examGroup.results.length;

                return (
                  <div key={examGroup.name} className="exam-category">
                    <div
                      className="exam-category-header"
                      onClick={() => setExpandedExam(isExpanded ? null : examGroup.name)}
                    >
                      <span className="category-icon">{isExpanded ? '▼' : '▶'}</span>
                      <h3>{examGroup.name}</h3>
                      <span className="student-count">({studentCount} Öğrenci)</span>
                      <button
                        className="publish-all-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const examId = examGroup.results[0]?.exam?.id;
                          if (examId) {
                            handlePublishAllResults(examId);
                          }
                        }}
                        title="Tüm sonuçları yayınla"
                      >
                        🎯 Sonuçları Yayınla
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="exam-category-content">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>Öğrenci Adı</th>
                              <th>E-posta</th>
                              <th>Konu</th>
                              <th>Toplam Soru</th>
                              <th>Doğru Cevap</th>
                              <th>Yanlış Cevap</th>
                              <th>Başarı %</th>
                              <th>Tamamlama Tarihi</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {examGroup.results.map((result) => {
                              const correctCount = result.studentAnswers
                                ? Object.keys(result.studentAnswers).filter(key => 
                                    result.studentAnswers[key] === result.exam?.questions[parseInt(key)]?.correctAnswer
                                  ).length
                                : 0;
                              
                              const totalQuestions = result.exam?.questions?.length || 0;
                              const wrongCount = totalQuestions - correctCount;

                              return (
                                <tr key={result.id}>
                                  <td><strong>{result.student?.firstName} {result.student?.lastName}</strong></td>
                                  <td>{result.student?.email}</td>
                                  <td>{result.exam?.subject}</td>
                                  <td>{totalQuestions}</td>
                                  <td><span style={{color: '#10b981'}}>{correctCount}</span></td>
                                  <td><span style={{color: '#ef4444'}}>{wrongCount}</span></td>
                                  <td><strong style={{color: (result.score ?? 0) >= 70 ? '#10b981' : '#ef4444'}}>{result.score ?? 0}%</strong></td>
                                  <td>{new Date(result.submittedAt).toLocaleDateString('tr-TR')}</td>
                                  <td>
                                    <button 
                                      className="detail-btn"
                                      onClick={() => {
                                        setSelectedResult(result);
                                        setGeneralEvaluation(result.generalEvaluation || '');
                                        setAiGeneralEvaluation(result.aiGeneralEvaluation || '');
                                      }}
                                    >
                                      Detayları Gör
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === 'settings') {
    return (
      <div className="dashboard-section">
        <button className="back-btn" onClick={() => setActiveSection('main')}>← Geri Dön</button>
        <h2>Sistem Ayarları</h2>
        
        <div className="settings-container">
          <div className="settings-section">
            <h3>Sistem Sağlığı</h3>
            <div className="settings-form">
              <label>Sistem Sağlığı Değeri (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newHealthValue}
                onChange={(e) => setNewHealthValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="settings-input"
              />
              <button 
                className="action-btn primary"
                onClick={() => {
                  setSystemHealth(newHealthValue);
                  alert('Sistem Sağlığı değeri güncellendi!');
                }}
              >
                💾 Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'users') {
    return (
      <div className="dashboard-section">
        <button className="back-btn" onClick={() => setActiveSection('main')}>← Geri Dön</button>
        <h2>Kullanıcıları Yönet</h2>
        
        <div className="users-management">
          <div className="filter-section">
            <input
              type="text"
              placeholder="Ad, Soyad veya Email ile ara..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            
            <div className="role-filters">
              <button
                className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleRoleFilter('all')}
              >
                Tüm Roller ({users.length})
              </button>
              <button
                className={`filter-btn ${roleFilter === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleFilter('student')}
              >
                Öğrenciler ({users.filter(u => u.role === 'student').length})
              </button>
              <button
                className={`filter-btn ${roleFilter === 'staff' ? 'active' : ''}`}
                onClick={() => handleRoleFilter('staff')}
              >
                Personel ({users.filter(u => u.role === 'staff').length})
              </button>
              <button
                className={`filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleFilter('admin')}
              >
                Admin ({users.filter(u => u.role === 'admin').length})
              </button>
            </div>
          </div>

          <div className="users-table-container">
            {loading ? (
              <div className="empty-state">
                <p>⏳ Kullanıcılar yükleniyor...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <p>Kayıt bulunamadı</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th>Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Aktif' : 'İnaktif'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="users-summary">
            <p>Toplam: <strong>{filteredUsers.length}</strong> kullanıcı gösterileniyor</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <h2>Admin Yönetim Paneli</h2>
      
      <div className="stats-grid">
        {systemStats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
            {stat.details ? (
              // Breakdown gösterim (Kullanıcılar, Sınavlar)
              <>
                <div className="stat-label">{stat.label}</div>
                {stat.value && <div className="stat-value">{stat.value}</div>}
                <div className="stat-details">
                  {stat.details?.map((detail, idx) => (
                    <div key={idx} className="stat-detail-item">
                      <span className="detail-label">{detail.label}:</span>
                      <span className="detail-value">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Normal gösterim (Sistem Sağlığı vb)
              <>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button className="action-btn primary" onClick={() => setActiveSection('users')}>👥 Kullanıcıları Yönet</button>
        <button className="action-btn primary" onClick={() => setActiveSection('exams')}>📋 Sınav Yönetimi</button>
        <button 
          className="action-btn primary" 
          onClick={() => setActiveSection('reports')}
          disabled={isSavingGeneralEvaluation}
          title={isSavingGeneralEvaluation ? 'Lütfen genel değerlendirme kaydetme işleminin tamamlanmasını bekleyin...' : ''}
        >
          📊 Raporları Görüntüle
        </button>
        <button className="action-btn" onClick={() => setActiveSection('settings')}>🔧 Sistem Ayarları</button>
      </div>


    </div>
  );
};
