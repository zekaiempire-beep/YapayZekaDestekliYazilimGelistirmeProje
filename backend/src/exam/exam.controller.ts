import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createExamDto: CreateExamDto, @Request() req: any) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        throw new BadRequestException('Kullanıcı bilgisi bulunamadı');
      }
      return await this.examService.create(createExamDto, user);
    } catch (error) {
      console.error('Sınav oluşturma hatası:', error);
      throw error;
    }
  }

  @Get()
  async findAll() {
    return this.examService.findAll();
  }

  @Get('results/all')
  @UseGuards(JwtAuthGuard)
  async getAllResults() {
    return this.examService.getAllResults();
  }

  @Get('results/admin-all')
  @UseGuards(JwtAuthGuard)
  async getAllResultsForAdmin() {
    return this.examService.getAllResultsForAdmin();
  }

  @Get('results/staff/:staffId')
  @UseGuards(JwtAuthGuard)
  async getStaffResults(@Param('staffId') staffId: string) {
    return this.examService.getStaffResults(staffId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examService.update(id, updateExamDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.examService.delete(id);
    return { message: 'Sınav silindi' };
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submit(@Param('id') id: string, @Body() body: { answers: any }, @Request() req: any) {
    return this.examService.submitExam(id, body.answers, req.user);
  }

  @Post('results/:resultId/advisor-note')
  @UseGuards(JwtAuthGuard)
  async updateAdvisorNote(
    @Param('resultId') resultId: string,
    @Body() body: { questionIndex: number; note: string }
  ) {
    return this.examService.updateAdvisorNote(resultId, body.questionIndex, body.note);
  }

  @Post('results/:resultId/ai-note')
  @UseGuards(JwtAuthGuard)
  async updateAiNote(
    @Param('resultId') resultId: string,
    @Body() body: { questionIndex: number; note: string }
  ) {
    return this.examService.updateAiNote(resultId, body.questionIndex, body.note);
  }

  @Post('results/:resultId/general-evaluation')
  @UseGuards(JwtAuthGuard)
  async updateGeneralEvaluation(
    @Param('resultId') resultId: string,
    @Body() body: { evaluation: string }
  ) {
    return this.examService.updateGeneralEvaluation(resultId, body.evaluation);
  }

  @Post('results/:resultId/ai-general-evaluation')
  @UseGuards(JwtAuthGuard)
  async updateAiGeneralEvaluation(
    @Param('resultId') resultId: string,
    @Body() body: { evaluation: string }
  ) {
    return this.examService.updateAiGeneralEvaluation(resultId, body.evaluation);
  }

  @Put('results/:resultId/advisor-notes')
  @UseGuards(JwtAuthGuard)
  async updateAllAdvisorNotes(
    @Param('resultId') resultId: string,
    @Body() body: { advisorNotes: any }
  ) {
    return this.examService.updateAllAdvisorNotes(resultId, body.advisorNotes);
  }

  @Post('results/:resultId/publish')
  @UseGuards(JwtAuthGuard)
  async publishResult(
    @Param('resultId') resultId: string,
    @Body() body?: { advisorNotes?: any; generalEvaluation?: string; aiGeneralEvaluation?: string }
  ) {
    return this.examService.publishResult(resultId, body?.advisorNotes, body?.generalEvaluation, body?.aiGeneralEvaluation);
  }

  @Put(':examId/publish-all')
  @UseGuards(JwtAuthGuard)
  async publishAllResults(@Param('examId') examId: string) {
    await this.examService.publishAllResults(examId);
    return { message: 'Tüm sonuçlar yayınlandı' };
  }

  @Post(':examId/start')
  @UseGuards(JwtAuthGuard)
  async startExam(@Param('examId') examId: string, @Request() req: any) {
    return await this.examService.handleStartExam(examId, req.user.id);
  }

  // Evaluation endpoints
  @Post('evaluations/:resultId/save')
  @UseGuards(JwtAuthGuard)
  async saveEvaluation(
    @Param('resultId') resultId: string,
    @Body() body: { generalEvaluation?: string; advisorNotes?: any },
    @Request() req: any
  ) {
    // Result'ı bul student ve exam bilgisi için
    const result = await this.examService.getResultById(resultId);
    return this.examService.saveEvaluation(
      resultId,
      result.studentId,
      result.examId,
      body.generalEvaluation,
      body.advisorNotes
    );
  }

  @Post('evaluations/:resultId/publish')
  @UseGuards(JwtAuthGuard)
  async publishEvaluation(@Param('resultId') resultId: string) {
    return this.examService.publishEvaluation(resultId);
  }

  @Get('evaluations/:resultId')
  @UseGuards(JwtAuthGuard)
  async getEvaluation(@Param('resultId') resultId: string) {
    return this.examService.getEvaluationByResult(resultId);
  }

  @Get('evaluations/exam/:examId/published')
  @UseGuards(JwtAuthGuard)
  async getPublishedEvaluations(@Param('examId') examId: string) {
    return this.examService.getPublishedEvaluationsByExam(examId);
  }

  @Get('evaluations/exam/:examId/admin')
  @UseGuards(JwtAuthGuard)
  async getAllEvaluations(@Param('examId') examId: string) {
    return this.examService.getAllEvaluationsByExam(examId);
  }

  @Post('results/:resultId/generate-ai-note')
  @UseGuards(JwtAuthGuard)
  async generateAiNote(
    @Param('resultId') resultId: string,
    @Body() body: { questionIndex: number; questionText: string }
  ) {
    const aiText = await this.examService.generateAiNoteForQuestion(
      resultId,
      body.questionIndex,
      body.questionText,
    );
    return { aiText };
  }

  @Post('results/:resultId/generate-ai-evaluation')
  @UseGuards(JwtAuthGuard)
  async generateAiEvaluation(@Param('resultId') resultId: string) {
    const aiText = await this.examService.generateAiGeneralEvaluation(resultId);
    return { aiText };
  }
}
