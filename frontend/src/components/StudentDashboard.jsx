import React, { useState, useEffect } from 'react';
import './RoleBasedDashboards.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('main');
  const [scheduledExams, setScheduledExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [takingExam, setTakingExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examResults, setExamResults] = useState(null);
  const [viewingResultDetails, setViewingResultDetails] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    if (activeSection === 'exams') {
      fetchExams();
    } else if (activeSection === 'results') {
      fetchMyResults();
    }
  }, [activeSection]);

  // Sınav esnasında kalan süreyi göster
  useEffect(() => {
    if (!takingExam || examResults) {
      return; // Sınav alınmıyorsa veya sonuç gösteriliyorsa timer çalışmasın
    }

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null) return null;
        if (prev <= 0) {
          // Süre bitti, sınavı otomatik bitir
          handleFinishExam();
          return 0;
        }
        return prev - 1 / 60; // 1 saniye düş (dakika cinsinden)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [takingExam, examResults]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams');
      const exams = response.data;

      // Scheduled (onaylanmış) sınavları filtrele
      let scheduled = exams.filter(exam => exam.status === 'scheduled');

      // Öğrencinin tamamladığı sınavları al
      const resultsResponse = await api.get('/exams/results/all');
      const allResults = resultsResponse.data;
      const myResults = allResults.filter(result => result.student?.id === user?.id);
      const myCompletedExamIds = myResults.map(result => result.exam?.id);

      // Sınav zamanı bilgisi ekle ve tamamlanan flag'ı ekle
      scheduled = scheduled.map(exam => {
        // Veritabanında kaydedilen saat Türkiye saati (UTC+3)
        // Bunu UTC'ye çevirerek hesaplıyoruz
        const [year, month, day] = exam.date.split('-').map(Number);
        const [hours, minutes, seconds] = exam.time.split(':').map(Number);
        
        // UTC saat: Türkiye saat - 3 saat
        const examDateTime = new Date(Date.UTC(year, month - 1, day, hours - 3, minutes, seconds));
        const now = new Date(); // UTC saat
        const minutesUntil = Math.floor((examDateTime.getTime() - now.getTime()) / (1000 * 60));
        const isCompleted = myCompletedExamIds.includes(exam.id);
        
        return {
          ...exam,
          minutesUntilStart: minutesUntil,
          canStartExam: minutesUntil <= 0,
          isCompleted,
        };
      });

      setScheduledExams(scheduled);
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyResults = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams/results/all');
      const allResults = response.data;

      // Filter results for current student and only published results
      const myResults = allResults.filter(result => 
        result.student?.id === user?.id && result.isPublished
      );
      
      // Her result için evaluation'ı da fetch et
      const completedWithEvaluations = await Promise.all(
        myResults.map(async (result) => {
          try {
            const evalResponse = await api.get(`/exams/evaluations/${result.id}`);
            const evaluation = evalResponse.data;
            
            return {
              ...result.exam,
              score: result.score,
              submittedAt: result.submittedAt,
              studentAnswers: result.studentAnswers,
              advisorNotes: evaluation?.advisorNotes || result.advisorNotes || {},
              aiNotes: evaluation?.aiNotes || result.aiNotes || {},
              generalEvaluation: evaluation?.generalEvaluation || result.generalEvaluation || '',
              aiGeneralEvaluation: evaluation?.aiGeneralEvaluation || result.aiGeneralEvaluation || '',
              resultId: result.id,
            };
          } catch (error) {
            // Evaluation yoksa sonuç verileriyle devam et
            return {
              ...result.exam,
              score: result.score,
              submittedAt: result.submittedAt,
              studentAnswers: result.studentAnswers,
              advisorNotes: result.advisorNotes || {},
              aiNotes: result.aiNotes || {},
              generalEvaluation: result.generalEvaluation || '',
              aiGeneralEvaluation: result.aiGeneralEvaluation || '',
              resultId: result.id,
            };
          }
        })
      );
      
      setCompletedExams(completedWithEvaluations);
    } catch (error) {
      console.error('Sonuçlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeExam = (exam) => {
    // Eğer sınava zaten katıldıysa engelle
    if (exam.isCompleted) {
      alert('⚠️ Bu sınava zaten katılmışsın!\nSınava tekrar giremezsin!');
      return;
    }

    // Backend'e sınava başlamayı iste (zaman kontrolü yap)
    api.post(`/exams/${exam.id}/start`)
      .then(response => {
        console.log('Sınava giriş onaylandı:', response.data);
        setTakingExam(exam);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setExamResults(null);
        setRemainingTime(response.data.remainingMinutes);
      })
      .catch(error => {
        console.error('Sınava giriş hatası:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Sınava giriş yapılamadı';
        console.error('Error mesajı:', errorMessage);
        alert('❌ ' + errorMessage);
      });
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setAnswers({
      ...answers,
      [questionIndex]: selectedAnswer,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < takingExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishExam = async () => {
    // Sonuçları hesapla
    let correctCount = 0;
    takingExam.questions.forEach((question, index) => {
      if (answers[index.toString()] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round(
      (correctCount / takingExam.questions.length) * 100
    );

    // Backend'e gönder ve sonuçları kaydet
    try {
      const response = await api.post(`/exams/${takingExam.id}/submit`, { answers });
      
      if (!response.data) {
        throw new Error('Sunucu yanıt vermedi');
      }

      const updatedExam = response.data;
      
      // Sınav gönderildikten hemen sonra, scheduledExams listesini update et
      setScheduledExams(prevExams =>
        prevExams.map(exam =>
          exam.id === takingExam.id
            ? { ...exam, isCompleted: true }
            : exam
        )
      );
      
      setExamResults({
        totalQuestions: takingExam.questions.length,
        correctAnswers: correctCount,
        wrongAnswers: takingExam.questions.length - correctCount,
        score: updatedExam.score || score,
      });
      setExamSubmitted(true);
    } catch (error) {
      console.error('Sınav sonucu gönderme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Sınav gönderilemedi. Lütfen tekrar deneyin.';
      console.error('Backend error:', errorMessage);
      alert('❌ ' + errorMessage);
    }
  };

  const handleBackToExams = () => {
    setTakingExam(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setExamResults(null);
    setViewingResultDetails(false);
    setExamSubmitted(false);
    // Sınavları yeniden yükle (tamamlanan sınav listeden çıkacak)
    fetchExams();
  };

  const handleViewResultDetails = (exam) => {
    // exam'ın studentAnswers ve score var
    let correctCount = 0;
    if (exam.studentAnswers) {
      Object.keys(exam.studentAnswers).forEach((key) => {
        const questionIndex = parseInt(key);
        if (exam.studentAnswers[key] === exam.questions[questionIndex]?.correctAnswer) {
          correctCount++;
        }
      });
    }
    
    setTakingExam(exam);
    setExamResults({
      totalQuestions: exam.questions.length,
      correctAnswers: correctCount,
      wrongAnswers: exam.questions.length - correctCount,
      score: exam.score,
    });
    setViewingResultDetails(true);
  };

  const handleBackFromResultDetails = () => {
    setTakingExam(null);
    setExamResults(null);
    setViewingResultDetails(false);
    // activeSection otomatik olarak 'results' kalacak
  };

  // Sınav yapma UI'sı
  if (takingExam && !examResults) {
    const currentQuestion = takingExam.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === takingExam.questions.length - 1;

    return (
      <div className="dashboard-section">
        <div className="exam-taking-container">
          <div className="exam-taking-header">
            <h2>{takingExam.name}</h2>
            <div className="exam-progress">
              <div className="progress-info">
                Soru {currentQuestionIndex + 1} / {takingExam.questions.length}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${((currentQuestionIndex + 1) / takingExam.questions.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            {remainingTime !== null && (
              <div className="exam-timer">
                <span className="timer-icon">⏱️</span>
                <span className="timer-label">Kalan Süre:</span>
                <span className={`timer-value ${remainingTime < 5 ? 'critical' : remainingTime < 10 ? 'warning' : ''}`}>
                  {Math.floor(remainingTime)}:{String(Math.round((remainingTime % 1) * 60)).padStart(2, '0')} dk
                </span>
              </div>
            )}
          </div>

          <div className="question-container">
            <div className="question-text">
              <h3>{currentQuestion.questionText}</h3>
            </div>

            <div className="options-container">
              {['A', 'B', 'C', 'D'].map((option) => (
                <label key={option} className="option-label">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={answers[currentQuestionIndex.toString()] === option}
                    onChange={() => handleAnswerSelect(currentQuestionIndex.toString(), option)}
                  />
                  <span className="option-box">
                    <span className="option-letter">{option}</span>
                    <span className="option-text">
                      {currentQuestion[`option${option}`]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="question-navigation">
            <button 
              className="nav-btn prev-btn"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Önceki Soru
            </button>

            <div className="question-indicators">
              {takingExam.questions.map((q, idx) => (
                <button
                  key={idx}
                  className={`question-indicator ${
                    answers[idx.toString()] ? 'answered' : ''
                  } ${idx === currentQuestionIndex ? 'current' : ''}`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={`Soru ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {!isLastQuestion ? (
              <button 
                className="nav-btn next-btn"
                onClick={handleNextQuestion}
              >
                Sonraki Soru →
              </button>
            ) : (
              <button 
                className="nav-btn finish-btn"
                onClick={handleFinishExam}
              >
                Sınavı Bitir ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sınav sonuçları
  if (takingExam && examResults) {
    // Sınav yeni gönderildi - sadece gönderildi mesajı göster
    if (examSubmitted && !viewingResultDetails) {
      return (
        <div className="dashboard-section">
          <div className="exam-results-container">
            <div className="submitted-message">
              <div className="submitted-icon">✓</div>
              <h2>Sınavınız Gönderildi!</h2>
              <p className="submitted-text">
                Sınavınız başarıyla gönderilmiştir. Admin danışman görüşlerini ekledikten sonra sonuçlarınız yayınlanacaktır.
              </p>
              <p className="submitted-info">
                Sonuçlarınızı görmek için lütfen daha sonra "Geçmiş Sonuçlarım" sekmesini kontrol ediniz.
              </p>
              <button 
                className="back-to-exams-btn"
                onClick={handleBackToExams}
              >
                ← Sınavlara Geri Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Geçmiş sonuçları görüntüle - detaylı sonuç ekranı
    const backButtonText = '← Geçmiş Sonuçlarıma Dön';
    const backButtonHandler = handleBackFromResultDetails;
    
    return (
      <div className="dashboard-section">
        <div className="exam-results-container">
          <h2>Sınav Sonuçları</h2>
          
          <div className="results-summary">
            <div className="result-card">
              <div className="result-icon">📊</div>
              <div className="result-label">Başarı Yüzdesi</div>
              <div className="result-value score-large">{examResults.score}%</div>
            </div>

            <div className="result-card">
              <div className="result-icon">✅</div>
              <div className="result-label">Doğru Cevaplar</div>
              <div className="result-value correct">{examResults.correctAnswers}/{examResults.totalQuestions}</div>
            </div>

            <div className="result-card">
              <div className="result-icon">❌</div>
              <div className="result-label">Yanlış Cevaplar</div>
              <div className="result-value wrong">{examResults.wrongAnswers}/{examResults.totalQuestions}</div>
            </div>
          </div>

          <div className="results-detail">
            <h3>Sınav Detayları: {takingExam.name}</h3>
            <table className="detail-table">
              <tbody>
                <tr>
                  <td className="label">Konu:</td>
                  <td>{takingExam.subject}</td>
                </tr>
                <tr>
                  <td className="label">Toplam Soru:</td>
                  <td>{examResults.totalQuestions}</td>
                </tr>
                <tr>
                  <td className="label">Doğru:</td>
                  <td className="correct-text">{examResults.correctAnswers}</td>
                </tr>
                <tr>
                  <td className="label">Yanlış:</td>
                  <td className="wrong-text">{examResults.wrongAnswers}</td>
                </tr>
                <tr className="total-row">
                  <td className="label">Başarı Oranı:</td>
                  <td><strong>{examResults.score}%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="results-detail">
            <h3>Sorulara Verilen Cevaplar</h3>
            <div className="questions-review">
              {takingExam.questions?.map((question, index) => {
                const studentAnswer = takingExam.studentAnswers?.[index.toString()];
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

                    {(takingExam.advisorNotes?.[index.toString()] || takingExam.aiNotes?.[index.toString()]) && (
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                        {takingExam.advisorNotes?.[index.toString()] && (
                          <div className="advisor-note-display">
                            <p className="note-label">💬 Danışman Görüşü:</p>
                            <p className="note-text">{takingExam.advisorNotes?.[index.toString()]}</p>
                          </div>
                        )}

                        {takingExam.aiNotes?.[index.toString()] && (
                          <div className="advisor-note-display ai-note">
                            <p className="note-label">🤖 AI Görüşü:</p>
                            <p className="note-text">{takingExam.aiNotes?.[index.toString()]}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {(takingExam.generalEvaluation || takingExam.aiGeneralEvaluation) && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px'}}>
              {takingExam.generalEvaluation && (
                <div className="general-evaluation-display">
                  <div className="evaluation-box">
                    <h4 className="evaluation-label">📋 Genel Değerlendirme</h4>
                    <p className="evaluation-text">{takingExam.generalEvaluation}</p>
                  </div>
                </div>
              )}

              {takingExam.aiGeneralEvaluation && (
                <div className="general-evaluation-display">
                  <div className="evaluation-box ai">
                    <h4 className="evaluation-label">🤖 AI Değerlendirmesi</h4>
                    <p className="evaluation-text">{takingExam.aiGeneralEvaluation}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button 
            className="back-to-exams-btn"
            onClick={backButtonHandler}
          >
            {backButtonText}
          </button>
        </div>
      </div>
    );
  }

  // Ana sayfa - İki blok
  if (activeSection === 'main') {
    return (
      <div className="dashboard-section">
        <h2>Öğrenci Paneli</h2>
        <div className="student-menu">
          <button 
            className="menu-block"
            onClick={() => setActiveSection('exams')}
          >
            <div className="block-icon">📋</div>
            <div className="block-title">Sınavlar</div>
            <div className="block-description">Onaylanmış sınavları görüntüle ve yapabilir</div>
          </button>
          <button 
            className="menu-block"
            onClick={() => setActiveSection('results')}
          >
            <div className="block-icon">📊</div>
            <div className="block-title">Geçmiş Sonuçlarım</div>
            <div className="block-description">Tamamlanmış sınavların sonuçlarını incele</div>
          </button>
        </div>
      </div>
    );
  }

  // Sınavlar sekmesi
  if (activeSection === 'exams') {
    return (
      <div className="dashboard-section">
        <button className="back-btn" onClick={() => setActiveSection('main')}>← Geri Dön</button>
        <h2>Sınavlar</h2>
        
        <div className="exams-list-container">
          {loading ? (
            <div className="empty-state">
              <p>⏳ Sınavlar yükleniyor...</p>
            </div>
          ) : scheduledExams.length === 0 ? (
            <div className="empty-state">
              <p>Henüz sınav bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="exams-grid">
              {scheduledExams.map((exam) => (
                <div key={exam.id} className="exam-card">
                  <div className="exam-header">
                    <h3>{exam.name}</h3>
                    <span className="status scheduled">Planlandı</span>
                  </div>
                  <div className="exam-details">
                    <div className="detail-row">
                      <span>📚 Konu:</span>
                      <span>{exam.subject}</span>
                    </div>
                    <div className="detail-row">
                      <span>📅 Tarih:</span>
                      <span>{exam.date}</span>
                    </div>
                    <div className="detail-row">
                      <span>🕐 Saat:</span>
                      <span>{exam.time}</span>
                    </div>
                    <div className="detail-row">
                      <span>⏱️ Süre:</span>
                      <span>{exam.duration} dakika</span>
                    </div>
                    <div className="detail-row">
                      <span>❓ Soru:</span>
                      <span>{exam.questions?.length || 0} soru</span>
                    </div>
                  </div>
                  <div className="exam-description">
                    {exam.description && <p>{exam.description}</p>}
                  </div>
                  {!exam.canStartExam ? (
                    <div className="exam-countdown">
                      <span className="countdown-icon">⏳</span>
                      <span className="countdown-text">
                        Sınavaya başlamaya {Math.ceil(exam.minutesUntilStart)} dakika kaldı
                      </span>
                    </div>
                  ) : (
                    <button 
                      className="take-exam-btn"
                      onClick={() => handleTakeExam(exam)}
                    >
                      Sınava Başla →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Geçmiş Sonuçlarım sekmesi
  if (activeSection === 'results') {
    return (
      <div className="dashboard-section">
        <button className="back-btn" onClick={() => setActiveSection('main')}>← Geri Dön</button>
        <h2>Geçmiş Sonuçlarım</h2>
        
        <div className="results-list-container">
          {loading ? (
            <div className="empty-state">
              <p>⏳ Sonuçlar yükleniyor...</p>
            </div>
          ) : completedExams.length === 0 ? (
            <div className="empty-state">
              <p>Henüz tamamlanmış sınav bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Sınav Adı</th>
                    <th>Konu</th>
                    <th>Tarih</th>
                    <th>Puan</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {completedExams.map((exam) => (
                    <tr key={exam.id}>
                      <td><strong>{exam.name}</strong></td>
                      <td>{exam.subject}</td>
                      <td>{exam.date}</td>
                      <td><span className="score-badge">{exam.score || 0}%</span></td>
                      <td>
                        <button className="detail-btn" onClick={() => handleViewResultDetails(exam)}>Detayları Gör</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
};
