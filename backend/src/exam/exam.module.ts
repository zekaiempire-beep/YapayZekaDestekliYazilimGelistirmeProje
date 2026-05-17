import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { Exam } from '../entities/exam.entity';
import { StudentExamResult } from '../entities/student-exam-result.entity';
import { ExamEvaluation } from '../entities/exam-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, StudentExamResult, ExamEvaluation])],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
