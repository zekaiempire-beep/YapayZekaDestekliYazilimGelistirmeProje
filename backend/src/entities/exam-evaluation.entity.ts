import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Exam } from './exam.entity';
import { StudentExamResult } from './student-exam-result.entity';

@Entity('exam_evaluations')
export class ExamEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentExamResult, { eager: true })
  result: StudentExamResult;

  @Column('uuid')
  resultId: string;

  @ManyToOne(() => User)
  student: User;

  @Column('uuid')
  studentId: string;

  @ManyToOne(() => Exam)
  exam: Exam;

  @Column('uuid')
  examId: string;

  @Column({ type: 'text', nullable: true })
  generalEvaluation: string;

  @Column({ type: 'text', nullable: true })
  aiGeneralEvaluation: string;

  @Column({ type: 'json', nullable: true })
  advisorNotes: any;

  @Column({ type: 'json', nullable: true })
  aiNotes: any;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
