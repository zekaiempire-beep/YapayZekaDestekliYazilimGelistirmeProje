import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export interface Question {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @Min(15)
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  questions: Question[];

  @IsEnum(['scheduled', 'active', 'completed', 'pending'])
  @IsOptional()
  status?: 'scheduled' | 'active' | 'completed' | 'pending';
}

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsNumber()
  @Min(15)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  questions?: Question[];

  @IsEnum(['scheduled', 'active', 'completed', 'pending'])
  @IsOptional()
  status?: 'scheduled' | 'active' | 'completed' | 'pending';

  @IsOptional()
  createdBy?: any;
}
