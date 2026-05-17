import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Exam, Question } from '../entities/exam.entity';
import { StudentExamResult } from '../entities/student-exam-result.entity';
import { ExamEvaluation } from '../entities/exam-evaluation.entity';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
import { User } from '../entities/user.entity';
import { hasExamStarted, getRemainingExamMinutes, hasExamExpired } from '../utils/time.utils';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(StudentExamResult)
    private readonly studentExamResultRepository: Repository<StudentExamResult>,
    @InjectRepository(ExamEvaluation)
    private readonly examEvaluationRepository: Repository<ExamEvaluation>,
  ) {}

  async create(createExamDto: CreateExamDto, user: User): Promise<Exam> {
    if (!createExamDto.questions || createExamDto.questions.length === 0) {
      throw new BadRequestException('Sınav en az bir soru içermelidir');
    }

    const exam = this.examRepository.create({
      name: createExamDto.name,
      subject: createExamDto.subject,
      date: createExamDto.date,
      time: createExamDto.time,
      duration: createExamDto.duration,
      description: createExamDto.description || '',
      questions: createExamDto.questions,
      status: createExamDto.status || 'scheduled',
      createdBy: { id: user.id } as any,
    });

    return this.examRepository.save(exam);
  }

  async findAll(): Promise<Exam[]> {
    // Süresi dolmuş sınavları güncelle
    await this.updateExpiredExams();
    
    return this.examRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Exam> {
    let exam = await this.examRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!exam) {
      throw new NotFoundException('Sınav bulunamadı');
    }

    // Eğer sınav "scheduled" statüsünde ve süresi dolmuşsa "completed" olarak güncelle
    if (exam.status === 'scheduled' && hasExamExpired(exam.date, exam.time, exam.duration)) {
      exam.status = 'completed';
      exam = await this.examRepository.save(exam);
    }

    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    const exam = await this.findById(id);

    // Questions güncellenmek isteniyorsa kontrol et
    if (updateExamDto.questions !== undefined && updateExamDto.questions.length === 0) {
      throw new BadRequestException('Sınav en az bir soru içermelidir');
    }

    // Sadece gönderilen alanları güncelle (createdBy ve undefined değerler dışında)
    if (updateExamDto.name !== undefined) exam.name = updateExamDto.name;
    if (updateExamDto.subject !== undefined) exam.subject = updateExamDto.subject;
    if (updateExamDto.date !== undefined) exam.date = updateExamDto.date;
    if (updateExamDto.time !== undefined) exam.time = updateExamDto.time;
    if (updateExamDto.duration !== undefined) exam.duration = updateExamDto.duration;
    if (updateExamDto.description !== undefined) exam.description = updateExamDto.description;
    if (updateExamDto.questions !== undefined) exam.questions = updateExamDto.questions;
    if (updateExamDto.status !== undefined) exam.status = updateExamDto.status;

    return this.examRepository.save(exam);
  }

  async delete(id: string): Promise<void> {
    const exam = await this.findById(id);
    
    // Sınava ait sonuçlar varsa silme işlemi başarısız olur
    const results = await this.studentExamResultRepository.find({
      where: { examId: id },
    });

    if (results.length > 0) {
      throw new BadRequestException(
        `Bu sınava ait ${results.length} adet tamamlanmış sınav sonucu bulunmaktadır. Sınav silinmeden önce sonuçlar silinmelidir.`
      );
    }

    await this.examRepository.remove(exam);
  }

  async addQuestion(id: string, question: Question): Promise<Exam> {
    const exam = await this.findById(id);
    
    if (!exam.questions) {
      exam.questions = [];
    }

    exam.questions.push({
      ...question,
      id: exam.questions.length + 1,
    });

    return this.examRepository.save(exam);
  }

  async updateQuestion(id: string, questionId: number, question: Question): Promise<Exam> {
    const exam = await this.findById(id);
    
    const questionIndex = exam.questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      throw new NotFoundException('Soru bulunamadı');
    }

    exam.questions[questionIndex] = { ...question, id: questionId };
    return this.examRepository.save(exam);
  }

  async deleteQuestion(id: string, questionId: number): Promise<Exam> {
    const exam = await this.findById(id);
    
    exam.questions = exam.questions.filter((q) => q.id !== questionId);
    return this.examRepository.save(exam);
  }

  async submitExam(id: string, answers: any, student: User): Promise<StudentExamResult> {
    const exam = await this.findById(id);

    // Öğrenci zaten bu sınava sonuç vermiş mi kontrol et
    const existingResult = await this.studentExamResultRepository.findOne({
      where: {
        studentId: student.id,
        examId: id,
      },
    });

    if (existingResult) {
      throw new BadRequestException('Bu sınava zaten bir kez katıldınız. Sınava bir daha giriş yapılamaz.');
    }

    let correctCount = 0;
    exam.questions.forEach((question: any, index: number) => {
      const answerKey = index.toString();
      if (answers[answerKey] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / exam.questions.length) * 100);

    // Create a new StudentExamResult instead of modifying the exam
    const result = this.studentExamResultRepository.create({
      student: { id: student.id } as any,
      studentId: student.id,
      exam: { id: exam.id } as any,
      examId: exam.id,
      score,
      studentAnswers: answers,
      status: 'completed',
    });

    return this.studentExamResultRepository.save(result);
  }

  // Get all exam results with exam details (for admin reports)
  async getAllResults() {
    return this.studentExamResultRepository.find({
      relations: ['student', 'exam'],
      order: { submittedAt: 'DESC' },
    });
  }

  async getAllResultsForAdmin() {
    return this.studentExamResultRepository.find({
      relations: ['student', 'exam'],
      order: { submittedAt: 'DESC' },
    });
  }

  // Get results for specific staff (teacher)
  async getStaffResults(staffId: string) {
    return this.studentExamResultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.exam', 'exam')
      .leftJoinAndSelect('result.student', 'student')
      .where('exam.createdBy.id = :staffId', { staffId })
      .orderBy('result.submittedAt', 'DESC')
      .getMany();
  }

  // Get a specific result by ID
  async getResultById(resultId: string): Promise<StudentExamResult> {
    const result = await this.studentExamResultRepository.findOne({
      where: { id: resultId },
      relations: ['student', 'exam'],
    });
    if (!result) {
      throw new NotFoundException('Sınav sonucu bulunamadı');
    }
    return result;
  }

  // Update advisor note for a specific question in a result
  async updateAdvisorNote(resultId: string, questionIndex: number, note: string): Promise<StudentExamResult> {
    const result = await this.studentExamResultRepository.findOne({
      where: { id: resultId },
      relations: ['student', 'exam'],
    });

    if (!result) {
      throw new NotFoundException('Sınav sonucu bulunamadı');
    }

    if (!result.advisorNotes) {
      result.advisorNotes = {};
    }

    result.advisorNotes[questionIndex.toString()] = note;
    await this.studentExamResultRepository.save(result);

    // ExamEvaluation'a da kaydet
    let examEvaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    if (!examEvaluation) {
      examEvaluation = this.examEvaluationRepository.create({
        resultId,
        studentId: result.studentId,
        examId: result.examId,
        advisorNotes: {},
      });
    }

    if (!examEvaluation.advisorNotes) {
      examEvaluation.advisorNotes = {};
    }

    examEvaluation.advisorNotes[questionIndex.toString()] = note;
    await this.examEvaluationRepository.save(examEvaluation);

    return result;
  }

  // Update AI note for a specific question in a result
  async updateAiNote(resultId: string, questionIndex: number, note: string): Promise<StudentExamResult> {
    const result = await this.studentExamResultRepository.findOne({
      where: { id: resultId },
      relations: ['student', 'exam'],
    });

    if (!result) {
      throw new NotFoundException('Sınav sonucu bulunamadı');
    }

    if (!result.aiNotes) {
      result.aiNotes = {};
    }

    result.aiNotes[questionIndex.toString()] = note;
    await this.studentExamResultRepository.save(result);

    // ExamEvaluation'a da kaydet
    let examEvaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    if (!examEvaluation) {
      examEvaluation = this.examEvaluationRepository.create({
        resultId,
        studentId: result.studentId,
        examId: result.examId,
        aiNotes: {},
      });
    }

    if (!examEvaluation.aiNotes) {
      examEvaluation.aiNotes = {};
    }

    examEvaluation.aiNotes[questionIndex.toString()] = note;
    await this.examEvaluationRepository.save(examEvaluation);

    return result;
  }

  async updateGeneralEvaluation(resultId: string, evaluation: string): Promise<StudentExamResult> {
    const result = await this.studentExamResultRepository.findOne({
      where: { id: resultId },
      relations: ['student', 'exam'],
    });

    if (!result) {
      throw new NotFoundException('Sınav sonucu bulunamadı');
    }

    // StudentExamResult'e kaydet (backward compatibility)
    result.generalEvaluation = evaluation;
    await this.studentExamResultRepository.save(result);

    // ExamEvaluation'a da kaydet
    let examEvaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    if (!examEvaluation) {
      examEvaluation = this.examEvaluationRepository.create({
        resultId,
        studentId: result.studentId,
        examId: result.examId,
      });
    }

    examEvaluation.generalEvaluation = evaluation;
    await this.examEvaluationRepository.save(examEvaluation);

    return result;
  }

  async updateAiGeneralEvaluation(resultId: string, evaluation: string): Promise<StudentExamResult> {
    const result = await this.studentExamResultRepository.findOne({
      where: { id: resultId },
      relations: ['student', 'exam'],
    });

    if (!result) {
      throw new NotFoundException('Sınav sonucu bulunamadı');
    }

    // StudentExamResult'e kaydet (backward compatibility)
    result.aiGeneralEvaluation = evaluation;
    await this.studentExamResultRepository.save(result);

    // ExamEvaluation'a da kaydet
    let examEvaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    if (!examEvaluation) {
      examEvaluation = this.examEvaluationRepository.create({
        resultId,
        studentId: result.studentId,
        examId: result.examId,
      });
    }

    examEvaluation.aiGeneralEvaluation = evaluation;
    await this.examEvaluationRepository.save(examEvaluation);

    return result;
  }

  // Update all advisor notes at once
  async updateAllAdvisorNotes(resultId: string, advisorNotes: any): Promise<StudentExamResult> {
    const result = await this.studentExamResultRepository.findOne({
      where: { id: resultId },
      relations: ['student', 'exam'],
    });

    if (!result) {
      throw new NotFoundException('Sınav sonucu bulunamadı');
    }

    result.advisorNotes = advisorNotes || {};
    await this.studentExamResultRepository.save(result);

    // ExamEvaluation'a da sync et
    let examEvaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    if (!examEvaluation) {
      examEvaluation = this.examEvaluationRepository.create({
        resultId,
        studentId: result.studentId,
        examId: result.examId,
      });
    }

    examEvaluation.advisorNotes = advisorNotes || {};
    await this.examEvaluationRepository.save(examEvaluation);

    return result;
  }

  // Publish result (make it visible to student)
  async publishResult(resultId: string, advisorNotes?: any, generalEvaluation?: string, aiGeneralEvaluation?: string): Promise<StudentExamResult> {
    const result = await this.studentExamResultRepository.findOne({
      where: { id: resultId },
      relations: ['student', 'exam'],
    });

    if (!result) {
      throw new NotFoundException('Sınav sonucu bulunamadı');
    }

    // Eğer notu gönderirse güncelle
    if (advisorNotes) {
      result.advisorNotes = advisorNotes;
    }

    // Genel değerlendirmeyi güncelle
    if (generalEvaluation) {
      result.generalEvaluation = generalEvaluation;
    }

    // AI genel değerlendirmesini güncelle
    if (aiGeneralEvaluation) {
      result.aiGeneralEvaluation = aiGeneralEvaluation;
    }

    result.isPublished = true;
    await this.studentExamResultRepository.save(result);

    // ExamEvaluation'a da sync et
    let examEvaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    if (!examEvaluation) {
      examEvaluation = this.examEvaluationRepository.create({
        resultId,
        studentId: result.studentId,
        examId: result.examId,
      });
    }

    if (advisorNotes) {
      examEvaluation.advisorNotes = advisorNotes;
    }

    if (generalEvaluation) {
      examEvaluation.generalEvaluation = generalEvaluation;
    }

    if (aiGeneralEvaluation) {
      examEvaluation.aiGeneralEvaluation = aiGeneralEvaluation;
    }

    examEvaluation.isPublished = true;
    await this.examEvaluationRepository.save(examEvaluation);

    return result;
  }

  // Publish all results for an exam
  async publishAllResults(examId: string): Promise<void> {
    const results = await this.studentExamResultRepository.find({
      where: { examId },
    });

    if (results.length === 0) {
      throw new NotFoundException('Bu sınava ait sonuç bulunamadı');
    }

    // Update all results to published
    await this.studentExamResultRepository.update(
      { examId },
      { isPublished: true }
    );

    // ExamEvaluation'lara da sync et
    await this.examEvaluationRepository.update(
      { examId },
      { isPublished: true }
    );
  }

  // Sınava başlamaya çalış - zaman kontrolü yap
  async handleStartExam(examId: string, studentId: string): Promise<{ success: boolean; message: string; remainingMinutes?: number }> {
    const exam = await this.findById(examId);

    // Öğrenci zaten bu sınava katılmış mı kontrol et
    const existingResult = await this.studentExamResultRepository.findOne({
      where: {
        studentId: studentId,
        examId: examId,
      },
    });

    if (existingResult) {
      throw new BadRequestException('Bu sınava zaten katılmışsın! Sınava tekrar giremezsin!');
    }

    // Sınav zamanı geçmiş mi kontrol et
    if (!hasExamStarted(exam.date, exam.time)) {
      const remainingMinutes = getRemainingExamMinutes(exam.date, exam.time, exam.duration);
      throw new BadRequestException(
        `Sınav henüz başlamadı. Sınava başlamak için ${Math.ceil(remainingMinutes)} dakika daha beklemeniz gerekir.`
      );
    }

    // Sınav hala aktif mi kontrol et
    const remainingMinutes = getRemainingExamMinutes(exam.date, exam.time, exam.duration);
    if (remainingMinutes < 0) {
      throw new BadRequestException(
        `Sınav süresi dolmuştur. Artık sınava giriş yapılamaz.`
      );
    }

    return {
      success: true,
      message: 'Sınava başlayabilirsiniz',
      remainingMinutes,
    };
  }

  // Süresi dolmuş tüm "scheduled" sınavları "completed" olarak güncelle
  private async updateExpiredExams(): Promise<void> {
    try {
      // Tüm scheduled sınavları al
      const scheduledExams = await this.examRepository.find({
        where: { status: 'scheduled' },
      });

      // Süresi dolmuş sınavları kontrol et ve güncelle
      for (const exam of scheduledExams) {
        if (hasExamExpired(exam.date, exam.time, exam.duration)) {
          exam.status = 'completed';
          await this.examRepository.save(exam);
        }
      }
    } catch (error) {
      // Hata olursa sessizce devam et - bu işlem kritik değil
      console.error('Süresi dolmuş sınavlar güncellenirken hata:', error);
    }
  }

  // Değerlendirme kaydını oluştur veya güncelle (draft)
  async saveEvaluation(
    resultId: string,
    studentId: string,
    examId: string,
    generalEvaluation?: string,
    advisorNotes?: any
  ): Promise<ExamEvaluation> {
    // Önce mevcut evaluation'ı ara
    let evaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    // Eğer yoksa oluştur
    if (!evaluation) {
      evaluation = this.examEvaluationRepository.create({
        resultId,
        studentId,
        examId,
        generalEvaluation: generalEvaluation || '',
        advisorNotes: advisorNotes || {},
        isPublished: false,
      });
    } else {
      // Varsa güncelle
      if (generalEvaluation !== undefined) {
        evaluation.generalEvaluation = generalEvaluation;
      }
      if (advisorNotes !== undefined) {
        evaluation.advisorNotes = advisorNotes;
      }
    }

    return this.examEvaluationRepository.save(evaluation);
  }

  // Değerlendirmeyi yayınla (isPublished = true)
  async publishEvaluation(resultId: string): Promise<ExamEvaluation> {
    let evaluation = await this.examEvaluationRepository.findOne({
      where: { resultId },
    });

    if (!evaluation) {
      // Evaluation yoksa oluştur ve yayınla
      const result = await this.studentExamResultRepository.findOne({
        where: { id: resultId },
      });
      if (!result) {
        throw new NotFoundException('Sınav sonucu bulunamadı');
      }

      evaluation = this.examEvaluationRepository.create({
        resultId,
        studentId: result.studentId,
        examId: result.examId,
        isPublished: true,
      });
    } else {
      evaluation.isPublished = true;
    }

    return this.examEvaluationRepository.save(evaluation);
  }

  // Bir öğrenci sonucu için evaluation'ı al
  async getEvaluationByResult(resultId: string): Promise<ExamEvaluation | null> {
    return this.examEvaluationRepository.findOne({
      where: { resultId },
      relations: ['student', 'exam'],
    });
  }

  // Sınav için tüm evaluation'ları al (yalnızca published)
  async getPublishedEvaluationsByExam(examId: string): Promise<ExamEvaluation[]> {
    return this.examEvaluationRepository.find({
      where: { examId, isPublished: true },
      relations: ['student', 'exam'],
      order: { createdAt: 'DESC' },
    });
  }

  // Sınav için TÜM evaluation'ları al (admin için)
  async getAllEvaluationsByExam(examId: string): Promise<ExamEvaluation[]> {
    return this.examEvaluationRepository.find({
      where: { examId },
      relations: ['student', 'exam'],
      order: { createdAt: 'DESC' },
    });
  }

  // Ollama'dan AI görüşü oluştur (soru-level)
  async generateAiNoteForQuestion(resultId: string, questionIndex: number, questionText: string): Promise<string> {
    try {
      const result = await this.studentExamResultRepository.findOne({
        where: { id: resultId },
        relations: ['exam'],
      });

      if (!result) {
        throw new NotFoundException('Sınav sonucu bulunamadı');
      }

      const subject = (result.exam as any)?.subject || 'Sınav Konusu';
      const prompt = `Bir öğrenci, "${subject}" konusu ile ilgili bir soruya yanlış cevap vermiştir.

Soru: ${questionText}

Öğrencinin yanlış cevabını analiz ederek, yapıcı ve motivasyonu arttırıcı bir şekilde (2-3 cümle) açıklama yaz. Neyin yanlış olduğunu ve nasıl düzeltebileceğini belirt.`;

      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'mistral',
        prompt: prompt,
        stream: false,
      });

      return response.data.response.trim();
    } catch (error: any) {
      console.error('Ollama API hatası:', error?.message || error);
      throw new BadRequestException('AI görüşü oluşturulamadı. Ollama çalışıyor mu kontrol edin.');
    }
  }

  // Ollama'dan AI genel değerlendirmesi oluştur (exam-level)
  async generateAiGeneralEvaluation(resultId: string): Promise<string> {
    try {
      const result = await this.studentExamResultRepository.findOne({
        where: { id: resultId },
        relations: ['exam', 'student'],
      });

      if (!result) {
        throw new NotFoundException('Sınav sonucu bulunamadı');
      }

      const score = result.score || 0;
      const totalQuestions = (result.exam as any)?.questions?.length || 1;
      const percentage = Math.round((score / totalQuestions) * 100);
      const subject = (result.exam as any)?.subject || 'Sınav Konusu';

      const prompt = `Bir öğrenci, "${subject}" konusu ile ilgili bir sınavdan ${percentage}% başarısı ile sınıfını tamamlamıştır.

Öğrenciye yapıcı, motivasyonu arttırıcı ve gelişim alanlarını belirten bir genel değerlendirme yaz (3-4 cümle). 
- Olumlu taraflarını vurgula
- Gelişim alanlarını belirt
- Gelecek adımlar için öneriler sun`;

      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'mistral',
        prompt: prompt,
        stream: false,
      });

      return response.data.response.trim();
    } catch (error: any) {
      console.error('Ollama API hatası:', error?.message || error);
      throw new BadRequestException('AI değerlendirmesi oluşturulamadı. Ollama çalışıyor mu kontrol edin.');
    }
  }
}
