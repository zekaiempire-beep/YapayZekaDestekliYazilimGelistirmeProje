import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Exam } from './exam.entity';

@Entity('student_exam_results')
export class StudentExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  student: User;

  @Column('uuid')
  studentId: string;

  @ManyToOne(() => Exam)
  exam: Exam;

  @Column('uuid')
  examId: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'json' })
  studentAnswers: any;

  @Column({ type: 'varchar', default: 'completed' })
  status: string;

  @Column({ type: 'json', nullable: true })
  advisorNotes: any;

  @Column({ type: 'json', nullable: true })
  aiNotes: any;

  @Column({ type: 'text', nullable: true })
  generalEvaluation: string;

  @Column({ type: 'text', nullable: true })
  aiGeneralEvaluation: string;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
