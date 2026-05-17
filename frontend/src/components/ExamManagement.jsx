import React, { useState, useEffect } from 'react';
import './ExamManagement.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ExamManagement = ({ onBack, isStaff = false }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(null);
  const [manageTab, setManageTab] = useState('all');
  const [createdExam, setCreatedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    date: '',
    time: '',
    duration: 60,
    description: '',
  });

  useEffect(() => {
    if (activeTab === 'manage' || activeTab === 'pending' || activeTab === 'completed') {
      fetchExams();
    }
  }, [activeTab]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams');
      setExams(response.data);
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error);
      alert('Sınavlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Duration alanı için sayıya dönüştür
    if (name === 'duration') {
      const numValue = value === '' ? '' : parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStartEditField = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditingValue(currentValue || '');
  };

  const handleSaveField = () => {
    if (editingField && editingValue.trim()) {
      let valueToSave = editingValue;
      
      // Duration alanı için sayıya dönüştür
      if (editingField === 'duration') {
        valueToSave = parseInt(editingValue, 10);
      }
      // Time field formatını düzelt: 16:45 -> 16:45:00
      else if (editingField === 'time' && editingValue) {
        // 16:45 formatını 16:45:00 yapıyoruz
        const timeParts = editingValue.split(':');
        if (timeParts.length === 2) {
          valueToSave = `${editingValue}:00`;
        }
      }

      setCreatedExam((prev) => ({
        ...prev,
        [editingField]: valueToSave,
      }));
    }
    setEditingField(null);
    setEditingValue('');
  };

  const handleCancelFieldEdit = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.optionA || !currentQuestion.optionB || !currentQuestion.optionC || !currentQuestion.optionD) {
      alert('Lütfen tüm alanları doldurunuz!');
      return;
    }
    
    if (editingQuestionId) {
      // Düzenleme modu: soruyu güncelle
      setQuestions(questions.map((q) => 
        q.id === editingQuestionId ? { ...currentQuestion, id: editingQuestionId } : q
      ));
      setEditingQuestionId(null);
    } else {
      // Yeni soru ekle
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    }
    
    setCurrentQuestion({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setEditingQuestionId(question.id);
  };

  const handleCancelEdit = () => {
    setCurrentQuestion({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
    setEditingQuestionId(null);
  };

  const handleCompleteExam = async () => {
    // Soru kontrolü
    if (questions.length === 0) {
      alert('Lütfen en az bir soru ekleyiniz!');
      return;
    }

    // Temel alan kontrolü
    if (!createdExam?.name || !createdExam?.subject || !createdExam?.date || !createdExam?.time) {
      alert('Lütfen tüm zorunlu alanları doldurunuz (Adı, Konusu, Tarihi, Saati)!');
      return;
    }

    // Süre kontrolü
    const duration = parseInt(createdExam.duration, 10);
    if (!duration || duration < 15) {
      alert('Sınav süresi en az 15 dakika olmalıdır!');
      return;
    }

    try {
      setLoading(true);
      const examData = {
        ...createdExam,
        duration: duration, // Sayıya dönüştür
        questions: questions,
        // Personel tarafından oluşturuluyorsa veya düzenleniyorsa "pending" (onay bekleyen), yoksa "scheduled"
        // Yani personel hem yeni sınav oluştururken hem de mevcut sınavı düzenlerken "pending" durumuna geçsin
        status: isStaff ? 'pending' : 'scheduled',
      };

      // Eğer ID varsa güncelle (PUT), yoksa yeni kayıt yap (POST)
      if (createdExam.id) {
        await api.put(`/exams/${createdExam.id}`, examData);
        if (isStaff) {
          alert('Sınav başarıyla güncellendi! Admin onayı bekleniyor...');
        } else {
          alert('Sınav başarıyla güncellendi!');
        }
      } else {
        await api.post('/exams', examData);
        if (isStaff) {
          alert('Sınav başarıyla kaydedildi! Admin onayı bekleniyor...');
        } else {
          alert('Sınav başarıyla kaydedildi!');
        }
      }
      
      // Form'a geri dön
      setCreatedExam(null);
      setQuestions([]);
      setFormData({
        name: '',
        subject: '',
        date: '',
        time: '',
        duration: 60,
        description: '',
      });
      
      // Sınavları Yönet sekmesine geç ve listeyi güncelle
      setActiveTab('manage');
      
      // Exams listesini yenile (PUT ve POST sonrasında)
      setTimeout(() => {
        fetchExams();
      }, 300);
    } catch (error) {
      console.error('Sınav kaydedilirken hata:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Bilinmeyen bir hata oluştu';
      alert(`Sınav kaydedilirken hata oluştu: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/exams/${examId}`);
      alert('Sınav silindi');
      fetchExams();
    } catch (error) {
      console.error('Sınav silinirken hata:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Sınav silinirken hata oluştu';
      alert(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExam = async (examId) => {
    if (!window.confirm('Bu sınavı onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await api.put(`/exams/${examId}`, { status: 'scheduled' });
      alert('Sınav başarıyla onaylandı!');
      fetchExams();
    } catch (error) {
      console.error('Sınav onaylanırken hata:', error);
      alert('Sınav onaylanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExam = (exam) => {
    // Sınavı düzenlemek için seçili sınava set et
    setCreatedExam({
      name: exam.name,
      subject: exam.subject,
      date: exam.date,
      time: exam.time,
      duration: exam.duration,
      description: exam.description || '',
      id: exam.id, // Veritabanı ID'si
    });
    // Sınavın sorularını yükle
    setQuestions(exam.questions || []);
    setEditingQuestionId(null);
    setCurrentQuestion({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleBackToForm = () => {
    setCreatedExam(null);
    setQuestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name?.trim()) {
      alert('Sınav adını giriniz!');
      return;
    }
    if (!formData.subject?.trim()) {
      alert('Sınav konusunu giriniz!');
      return;
    }
    if (!formData.date) {
      alert('Sınav tarihini seçiniz!');
      return;
    }
    if (!formData.time) {
      alert('Sınav saatini seçiniz!');
      return;
    }
    
    const duration = parseInt(formData.duration, 10);
    if (!duration || duration < 15) {
      alert('Sınav süresi en az 15 dakika olmalıdır!');
      return;
    }

    // Time formatını düzelt: 16:45 -> 16:45:00
    const timeFormatted = formData.time.includes(':') && !formData.time.endsWith(':00')
      ? formData.time.length === 5 ? `${formData.time}:00` : formData.time
      : formData.time;

    setCreatedExam({
      ...formData,
      duration: duration, // Sayıya dönüştür
      time: timeFormatted,
    });
    setQuestions([]);
    setCurrentQuestion({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Devam Ediyor';
      case 'scheduled':
        return 'Planlandı';
      case 'pending':
        return 'Onay Bekliyor';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'scheduled':
        return 'scheduled';
      case 'pending':
        return 'pending';
      case 'completed':
        return 'completed';
      default:
        return status;
    }
  };

  return (
    <div className="exam-management">
      {createdExam && (
        <div className="add-questions-section">
          <div className="questions-header">
            <button className="back-btn" onClick={handleBackToForm}>← Geri Dön</button>
            <div className="exam-title-info">
              <div className="exam-title-section">
                {editingField === 'name' ? (
                  <div className="inline-edit">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleSaveField} className="inline-save-btn">✓</button>
                    <button onClick={handleCancelFieldEdit} className="inline-cancel-btn">✕</button>
                  </div>
                ) : (
                  <div className="exam-title-display">
                    <h2>{createdExam.name}</h2>
                    <span 
                      className="inline-edit-link" 
                      onClick={() => handleStartEditField('name', createdExam.name)}
                      title="Düzenle"
                    >
                      ✏️ Düzenle
                    </span>
                  </div>
                )}
              </div>

              <div className="exam-details-section">
                <div className="detail-item">
                  {editingField === 'subject' ? (
                    <div className="inline-edit">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      />
                      <button onClick={handleSaveField} className="inline-save-btn">✓</button>
                      <button onClick={handleCancelFieldEdit} className="inline-cancel-btn">✕</button>
                    </div>
                  ) : (
                    <>
                      <span className="detail-label">Test Konusu:</span>
                      <span className="detail-value">{createdExam.subject}</span>
                      <span 
                        className="inline-edit-link"
                        onClick={() => handleStartEditField('subject', createdExam.subject)}
                      >
                        Düzenle
                      </span>
                    </>
                  )}
                </div>

                <div className="detail-item">
                  {editingField === 'date' ? (
                    <div className="inline-edit">
                      <input
                        type="date"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      />
                      <button onClick={handleSaveField} className="inline-save-btn">✓</button>
                      <button onClick={handleCancelFieldEdit} className="inline-cancel-btn">✕</button>
                    </div>
                  ) : (
                    <>
                      <span className="detail-label">Tarih:</span>
                      <span className="detail-value">{createdExam.date}</span>
                      <span 
                        className="inline-edit-link"
                        onClick={() => handleStartEditField('date', createdExam.date)}
                      >
                        Düzenle
                      </span>
                    </>
                  )}
                </div>

                <div className="detail-item">
                  {editingField === 'time' ? (
                    <div className="inline-edit">
                      <input
                        type="time"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      />
                      <button onClick={handleSaveField} className="inline-save-btn">✓</button>
                      <button onClick={handleCancelFieldEdit} className="inline-cancel-btn">✕</button>
                    </div>
                  ) : (
                    <>
                      <span className="detail-label">Sınav Saati:</span>
                      <span className="detail-value">{createdExam.time}</span>
                      <span 
                        className="inline-edit-link"
                        onClick={() => handleStartEditField('time', createdExam.time)}
                      >
                        Düzenle
                      </span>
                    </>
                  )}
                </div>

                <div className="detail-item">
                  {editingField === 'duration' ? (
                    <div className="inline-edit">
                      <input
                        type="number"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        min="15"
                        max="300"
                        autoFocus
                      />
                      <button onClick={handleSaveField} className="inline-save-btn">✓</button>
                      <button onClick={handleCancelFieldEdit} className="inline-cancel-btn">✕</button>
                    </div>
                  ) : (
                    <>
                      <span className="detail-label">Sınav Süresi:</span>
                      <span className="detail-value">{createdExam.duration} dakika</span>
                      <span 
                        className="inline-edit-link"
                        onClick={() => handleStartEditField('duration', createdExam.duration)}
                      >
                        Düzenle
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="questions-counter">
            <p>Toplam Soru: <strong>{questions.length}</strong></p>
          </div>

          <div className="add-question-form">
            <h3>{editingQuestionId ? '✏️ Soruyu Düzenle' : '➕ Yeni Soru Ekle'}</h3>
            <div className="question-form-content">
              <div className="form-group full-width">
                <label>Soru Metni *</label>
                <textarea
                  name="questionText"
                  value={currentQuestion.questionText}
                  onChange={handleQuestionChange}
                  placeholder="Soruyu yazınız..."
                  rows="3"
                />
              </div>

              <div className="options-grid">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option} className="form-group option-with-radio">
                    <label>Şık {option} *</label>
                    <input
                      type="text"
                      name={`option${option}`}
                      value={currentQuestion[`option${option}`]}
                      onChange={handleQuestionChange}
                      placeholder={`${option} şıkkını yazınız...`}
                    />
                    <div className="radio-container">
                      <input
                        type="radio"
                        id={`correct-${option}`}
                        name="correctAnswer"
                        value={option}
                        checked={currentQuestion.correctAnswer === option}
                        onChange={handleQuestionChange}
                      />
                      <label htmlFor={`correct-${option}`} className="radio-label">Doğru Cevap</label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                {editingQuestionId ? (
                  <>
                    <button type="button" className="add-question-btn" onClick={handleAddQuestion}>
                      💾 Değişiklikleri Kaydet
                    </button>
                    <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                      ✕ İptal
                    </button>
                  </>
                ) : (
                  <button type="button" className="add-question-btn" onClick={handleAddQuestion}>
                    ➕ Soruyu Ekle
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="questions-sidebar">
            {questions.length === 0 ? (
              <div className="empty-questions">
                <p>📝 Henüz soru eklenmemiş</p>
              </div>
            ) : (
              <>
                <div className="questions-list-section">
                  <h3>Eklenen Sorular ({questions.length})</h3>
                  <div className="questions-list">
                    {questions.map((question, index) => (
                      <div key={question.id} className="question-list-item">
                        <div className="question-item-header">
                          <span className="question-item-number">Soru {index + 1}</span>
                          <div className="question-item-actions">
                            <button
                              className="edit-question-btn"
                              onClick={() => handleEditQuestion(question)}
                              title="Düzenle"
                            >
                              ✏️
                            </button>
                            <button
                              className="delete-question-btn-small"
                              onClick={() => handleDeleteQuestion(question.id)}
                              title="Soruyu Sil"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <p className="question-item-text">{question.questionText}</p>
                        <div className="question-item-options">
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <div
                              key={option}
                              className={`option-item ${question.correctAnswer === option ? 'correct-option' : ''}`}
                            >
                              <span className="option-key">{option}.</span>
                              <span className="option-value">{question[`option${option}`]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="complete-actions">
                  <button 
                    className="complete-btn" 
                    onClick={handleCompleteExam}
                    disabled={loading}
                  >
                    {loading ? '⏳ İşlem yapılıyor...' : (createdExam.id ? '✓ Sınavı Güncelle' : '✓ Sınavı Tamamla')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!createdExam && (
        <div>
          <div className="exam-header">
            <button className="back-btn" onClick={onBack}>← Geri Dön</button>
            <h2>Sınav Yönetimi</h2>
          </div>

          {activeTab === null && (
            <div className="exam-tabs-selector">
              <p className="selector-hint">Lütfen bir işlem seçin:</p>
              <div className="exam-tabs">
                <button
                  className="tab-btn tab-selector-btn"
                  onClick={() => setActiveTab('create')}
                >
                  ➕ Yeni Sınav Oluştur
                </button>
                <button
                  className="tab-btn tab-selector-btn"
                  onClick={() => {
                    setActiveTab('manage');
                    setManageTab('all');
                  }}
                >
                  📋 Mevcut Sınavları Yönet
                </button>
                <button
                  className="tab-btn tab-selector-btn"
                  onClick={() => {
                    setActiveTab('pending');
                    setManageTab('pending');
                  }}
                >
                  ⏳ Onay Bekleyen Sınavlar
                </button>
                <button
                  className="tab-btn tab-selector-btn"
                  onClick={() => {
                    setActiveTab('completed');
                    setManageTab('completed');
                  }}
                >
                  ✅ Tamamlanan Sınavlar
                </button>
              </div>
            </div>
          )}

          {activeTab !== null && (
            <>
              <div className="exam-tabs">
                <button
                  className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  ➕ Yeni Sınav Oluştur
                </button>
                <button
                  className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('manage');
                    setManageTab('all');
                  }}
                >
                  📋 Mevcut Sınavları Yönet
                </button>
                <button
                  className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('pending');
                    setManageTab('pending');
                  }}
                >
                  ⏳ Onay Bekleyen Sınavlar
                </button>
                <button
                  className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('completed');
                    setManageTab('completed');
                  }}
                >
                  ✅ Tamamlanan Sınavlar
                </button>
              </div>

              <div className="exam-content">
            {activeTab === 'create' && (
              <div className="create-exam-section">
                <h3>Yeni Sınav Oluştur</h3>
                <form onSubmit={handleSubmit} className="exam-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Sınav Adı *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="örn: Matematik Midterm"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Konu *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="örn: Matematik"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tarih *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Saat *</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Süre (dakika) *</label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="15"
                        max="300"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Açıklama</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Sınav hakkında ek bilgi..."
                      rows="4"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      ✓ Sınavı Oluştur
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setFormData({
                        name: '',
                        subject: '',
                        date: '',
                        time: '',
                        duration: 60,
                        description: '',
                      })}
                    >
                      ✕ İptal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {(activeTab === 'manage' || activeTab === 'pending' || activeTab === 'completed') && (
              <div className="manage-exams-section">
                <h3>
                  {activeTab === 'pending' ? 'Onay Bekleyen Sınavlar' : activeTab === 'completed' ? 'Tamamlanan Sınavlar' : 'Mevcut Sınavlar'}
                </h3>
                <div className="exams-list">
                  {loading ? (
                    <div className="empty-state">
                      <p>⏳ Sınavlar yükleniyor...</p>
                    </div>
                  ) : exams.filter(exam => {
                      if (activeTab === 'pending') {
                        if (isStaff) {
                          return exam.status === 'pending' && exam.createdBy?.id === user?.id;
                        } else {
                          return exam.status === 'pending';
                        }
                      } else if (activeTab === 'completed') {
                        return exam.status === 'completed';
                      } else {
                        return exam.status !== 'completed';
                      }
                    }).length === 0 ? (
                    <div className="empty-state">
                      <p>
                        {activeTab === 'pending' ? 'Onay bekleyen sınav yok.' : activeTab === 'completed' ? 'Tamamlanan sınav yok.' : 'Henüz sınav oluşturulmamış.'}
                      </p>
                    </div>
                  ) : (
                    exams.filter(exam => {
                      if (activeTab === 'pending') {
                        if (isStaff) {
                          return exam.status === 'pending' && exam.createdBy?.id === user?.id;
                        } else {
                          return exam.status === 'pending';
                        }
                      } else if (activeTab === 'completed') {
                        return exam.status === 'completed';
                      } else {
                        return exam.status !== 'completed';
                      }
                    }).map((exam) => (
                      <div key={exam.id} className="exam-item">
                        <div className="exam-info">
                          <h4>{exam.name}</h4>
                          <div className="exam-details">
                            <span className="detail">📚 {exam.subject}</span>
                            <span className="detail">📅 {exam.date}</span>
                            <span className="detail">🕐 {exam.time}</span>
                            <span className="detail">⏱️ {exam.duration} dk</span>
                            <span className="detail">❓ {exam.questions?.length || 0} soru</span>
                          </div>
                        </div>
                        <div className="exam-footer">
                          <span className={`status-badge ${getStatusColor(exam.status)}`}>
                            {getStatusLabel(exam.status)}
                          </span>
                          <div className="exam-actions">
                            <button 
                              className="edit-btn" 
                              title="Düzenle"
                              onClick={() => handleEditExam(exam)}
                            >
                              ✏️
                            </button>
                            {activeTab === 'pending' && !isStaff && (
                              <button 
                                className="approve-btn" 
                                title="Onayla"
                                onClick={() => handleApproveExam(exam.id)}
                              >
                                ✅
                              </button>
                            )}
                            <button 
                              className="delete-btn" 
                              title="Sil"
                              onClick={() => handleDeleteExam(exam.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
